from __future__ import annotations

import json
import os
import secrets
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator


load_dotenv()

DATABASE_PATH = Path(os.getenv("DATABASE_PATH", "./seesol.db"))
CATALOG_PATH = Path(__file__).with_name("catalog.json")


def connect_db():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


class ProductInput(BaseModel):
    brand: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=140)
    category: str = Field(min_length=1, max_length=40)
    description: str = Field(min_length=1, max_length=2000)
    price: Optional[float] = Field(default=None, ge=0, le=10000000)
    image_url: Optional[str] = Field(default=None, max_length=2000)
    featured: bool = False

    @field_validator("brand", "name", "category", "description")
    @classmethod
    def trim_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Поле не может быть пустым")
        return cleaned

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            value = value.strip()
            if value and not value.startswith("https://"):
                raise ValueError("Ссылка на изображение должна начинаться с https://")
        return value or None


@asynccontextmanager
async def lifespan(_: FastAPI):
    with connect_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                price REAL,
                image_url TEXT,
                featured INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS catalog_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )
        seeded = connection.execute(
            "SELECT value FROM catalog_settings WHERE key = 'source_catalog_v1_seeded'"
        ).fetchone()
        if seeded is None:
            catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
            legacy_demo_products = [
                (
                    "OAKLEY",
                    "Flak 2.0 XL",
                    "Спортивная модель с увеличенными линзами и лёгкой оправой. Надёжная посадка подойдёт для активного отдыха и повседневных маршрутов.",
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85",
                    None,
                    1,
                ),
                (
                    "OAKLEY",
                    "Pitchman R OO9439",
                    "Современная интерпретация круглой формы с выразительными линзами и лаконичными деталями.",
                    "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1000&q=85",
                    None,
                    0,
                ),
                (
                    "MIU MIU",
                    "MU A51S",
                    "Узкий силуэт, металлические детали и зеркальные линзы — яркий акцент для образа с характером.",
                    "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=85",
                    None,
                    0,
                ),
                (
                    "MIU MIU",
                    "MU B07S",
                    "Графичная прямоугольная форма, выразительная оправа и тонкие фирменные детали.",
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85",
                    None,
                    0,
                ),
            ]
            existing = connection.execute("SELECT * FROM products").fetchall()
            if len(existing) == len(legacy_demo_products):
                existing_legacy = {
                    (
                        item["brand"],
                        item["name"],
                        item["description"],
                        item["image_url"],
                        item["price"],
                        int(item["featured"]),
                    )
                    for item in existing
                }
                if existing_legacy == set(legacy_demo_products):
                    connection.execute("DELETE FROM products")

            for product in catalog:
                exists = connection.execute(
                    "SELECT 1 FROM products WHERE brand = ? AND name = ?",
                    (product["brand"], product["name"]),
                ).fetchone()
                if exists is None:
                    connection.execute(
                        """
                        INSERT INTO products (brand, name, category, description, price, image_url, featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            product["brand"],
                            product["name"],
                            product["category"],
                            product["description"],
                            product["price"],
                            product["image_url"],
                            int(product.get("featured", False)),
                        ),
                    )
            connection.execute(
                "INSERT INTO catalog_settings (key, value) VALUES ('source_catalog_v1_seeded', '1')"
            )
        connection.commit()
    yield


app = FastAPI(title="See & Sol Boutique", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Admin-Password"],
)


def require_admin(password: Optional[str] = Header(default=None, alias="X-Admin-Password")) -> None:
    expected = os.getenv("ADMIN_PASSWORD", "")
    if not expected:
        raise HTTPException(status_code=503, detail="Пароль администратора не настроен")
    if password is None or not secrets.compare_digest(password, expected):
        raise HTTPException(status_code=401, detail="Неверный пароль")


def serialize_product(row: sqlite3.Row) -> dict:
    product = dict(row)
    product["featured"] = bool(product["featured"])
    return product


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/products")
def list_products():
    with connect_db() as connection:
        rows = connection.execute(
            "SELECT * FROM products ORDER BY featured DESC, created_at DESC, id DESC"
        ).fetchall()
    return [serialize_product(row) for row in rows]


@app.post("/api/admin/check", dependencies=[Depends(require_admin)])
def check_admin():
    return {"ok": True}


@app.post("/api/admin/products", dependencies=[Depends(require_admin)], status_code=201)
def create_product(payload: ProductInput):
    with connect_db() as connection:
        cursor = connection.execute(
            """
            INSERT INTO products (brand, name, category, description, price, image_url, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (*payload.model_dump(exclude={"featured"}).values(), int(payload.featured)),
        )
        product = connection.execute("SELECT * FROM products WHERE id = ?", (cursor.lastrowid,)).fetchone()
        connection.commit()
    return serialize_product(product)


@app.put("/api/admin/products/{product_id}", dependencies=[Depends(require_admin)])
def update_product(product_id: int, payload: ProductInput):
    with connect_db() as connection:
        cursor = connection.execute(
            """
            UPDATE products
            SET brand = ?, name = ?, category = ?, description = ?, price = ?, image_url = ?, featured = ?
            WHERE id = ?
            """,
            (*payload.model_dump(exclude={"featured"}).values(), int(payload.featured), product_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Модель не найдена")
        product = connection.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        connection.commit()
    return serialize_product(product)


@app.delete("/api/admin/products/{product_id}", dependencies=[Depends(require_admin)])
def delete_product(product_id: int):
    with connect_db() as connection:
        cursor = connection.execute("DELETE FROM products WHERE id = ?", (product_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Модель не найдена")
        connection.commit()
    return Response(status_code=204)


if Path("dist").is_dir():
    app.mount("/", StaticFiles(directory="dist", html=True), name="site")
