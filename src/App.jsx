import { useEffect, useMemo, useState } from "react";

const fallbackProducts = [
  {
    id: "sample-1",
    brand: "OAKLEY",
    name: "Flak 2.0 XL",
    category: "Спорт",
    description: "Лёгкая спортивная оправа для активного ритма жизни. Широкие линзы и цепкая посадка — когда стиль движется вместе с вами.",
    price: null,
    image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85",
    featured: true,
  },
  {
    id: "sample-2",
    brand: "OAKLEY",
    name: "Pitchman R OO9439",
    category: "Солнцезащитные",
    description: "Современная интерпретация круглой формы с выразительными линзами и лаконичными деталями.",
    price: null,
    image_url: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1000&q=85",
    featured: false,
  },
  {
    id: "sample-3",
    brand: "MIU MIU",
    name: "MU A51S",
    category: "Солнцезащитные",
    description: "Узкий силуэт, металлические детали и зеркальные линзы — яркий акцент для образа с характером.",
    price: null,
    image_url: "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=1000&q=85",
    featured: false,
  },
  {
    id: "sample-4",
    brand: "MIU MIU",
    name: "MU B07S",
    category: "Солнцезащитные",
    description: "Графичная прямоугольная форма, выразительная оправа и тонкие фирменные детали.",
    price: null,
    image_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85",
    featured: false,
  },
];

const categories = ["Все модели", "Солнцезащитные", "Оптические", "Спорт"];

function formatPrice(price) {
  if (price == null || price === "") return "Уточняйте в бутике";
  return `${new Intl.NumberFormat("ru-BY").format(price)} BYN`;
}

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="6" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    edit: <><path d="m14 5 5 5M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function ProductCard({ product, onOpen, admin, onEdit, onDelete }) {
  return (
    <article className="product-card">
      <button className="product-image" onClick={() => onOpen(product)} aria-label={`Подробнее: ${product.brand} ${product.name}`}>
        <img src={product.image_url || fallbackProducts[0].image_url} alt={`${product.brand} ${product.name}`} loading="lazy" />
        {product.featured && <span className="product-tag">Выбор бутика</span>}
        <span className="image-arrow"><Icon name="arrow" size={18} /></span>
      </button>
      <div className="product-meta">
        <span>{product.brand}</span>
        <span>{product.category}</span>
      </div>
      <button className="product-name" onClick={() => onOpen(product)}>{product.name}</button>
      <div className="product-bottom">
        <span className="product-price">{formatPrice(product.price)}</span>
        <button className="text-link" onClick={() => onOpen(product)}>Подробнее <Icon name="arrow" size={15} /></button>
      </div>
      {admin && <div className="card-admin">
        <button onClick={() => onEdit(product)} aria-label="Редактировать"><Icon name="edit" size={16} /> Изменить</button>
        <button onClick={() => onDelete(product)} aria-label="Удалить"><Icon name="trash" size={16} /> Удалить</button>
      </div>}
    </article>
  );
}

function ProductModal({ product, onClose }) {
  if (!product) return null;
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-label={product.name}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>
        <div className="modal-photo"><img src={product.image_url || fallbackProducts[0].image_url} alt={`${product.brand} ${product.name}`} /></div>
        <div className="modal-copy">
          <span className="eyebrow">{product.brand} <span className="dot">·</span> {product.category}</span>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <strong className="modal-price">{formatPrice(product.price)}</strong>
          <a className="button button-dark" href="https://www.instagram.com/seesol.by/" target="_blank" rel="noreferrer">Узнать о модели <Icon name="arrow" size={17} /></a>
          <span className="modal-note">Поможем подобрать оправу в бутике в Минске</span>
        </div>
      </section>
    </div>
  );
}

function ProductEditor({ product, onClose, onSave, busy }) {
  const [form, setForm] = useState(() => ({
    brand: product?.brand ?? "",
    name: product?.name ?? "",
    category: product?.category ?? "Солнцезащитные",
    description: product?.description ?? "",
    price: product?.price ?? "",
    image_url: product?.image_url ?? "",
    featured: product?.featured ?? false,
  }));
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  return (
    <div className="overlay editor-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="editor-modal" onSubmit={(event) => { event.preventDefault(); onSave({ ...form, price: form.price === "" ? null : Number(form.price) }); }}>
        <div className="editor-heading"><div><span className="eyebrow">Управление каталогом</span><h2>{product ? "Редактировать модель" : "Новая модель"}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button></div>
        <div className="form-grid">
          <label>Бренд<input required maxLength="100" value={form.brand} onChange={set("brand")} placeholder="Например, Ray-Ban" /></label>
          <label>Название модели<input required maxLength="140" value={form.name} onChange={set("name")} placeholder="Название или артикул" /></label>
          <label>Категория<select value={form.category} onChange={set("category")}><option>Солнцезащитные</option><option>Оптические</option><option>Спорт</option><option>Аксессуары</option></select></label>
          <label>Цена, BYN<input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="Оставьте пустым, если по запросу" /></label>
          <label className="full-field">Ссылка на фото<input type="url" value={form.image_url} onChange={set("image_url")} placeholder="https://…" /></label>
          <label className="full-field">Описание<textarea required maxLength="2000" rows="4" value={form.description} onChange={set("description")} placeholder="Опишите особенности оправы и линз" /></label>
        </div>
        <label className="check-label"><input type="checkbox" checked={form.featured} onChange={set("featured")} /> Отметить как выбор бутика</label>
        <div className="editor-actions"><button type="button" className="button button-quiet" onClick={onClose}>Отмена</button><button className="button button-dark" disabled={busy}>{busy ? "Сохраняем…" : "Сохранить модель"} <Icon name="arrow" size={16} /></button></div>
      </form>
    </div>
  );
}

function AdminLogin({ onClose, onLogin, error, busy }) {
  const [password, setPassword] = useState("");
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="login-modal" onSubmit={(event) => { event.preventDefault(); onLogin(password); }}>
        <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>
        <span className="login-icon"><Icon name="lock" size={22} /></span><span className="eyebrow">Только для команды See & Sol</span><h2>Вход в админ-панель</h2>
        <label>Пароль администратора<input autoFocus type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-dark login-submit" disabled={busy}>{busy ? "Проверяем…" : "Войти"} <Icon name="arrow" size={16} /></button>
      </form>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState(fallbackProducts);
  const [category, setCategory] = useState("Все модели");
  const [query, setQuery] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [admin, setAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((response) => response.ok ? response.json() : Promise.reject(new Error("Не удалось загрузить каталог"))).then((data) => setProducts(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const password = sessionStorage.getItem("seesol-admin");
    if (!password) return;
    fetch("/api/admin/check", { method: "POST", headers: { "X-Admin-Password": password } })
      .then((response) => {
        if (response.ok) {
          setAdmin(true);
          return;
        }
        sessionStorage.removeItem("seesol-admin");
      })
      .catch(() => setAdmin(false));
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) =>
    (category === "Все модели" || product.category === category) &&
    `${product.brand} ${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase())
  ), [products, category, query]);

  async function api(path, options = {}, password = sessionStorage.getItem("seesol-admin")) {
    const response = await fetch(path, {
      ...options,
      headers: { "Content-Type": "application/json", ...(password ? { "X-Admin-Password": password } : {}), ...options.headers },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "Не удалось выполнить запрос");
    }
    return response.status === 204 ? null : response.json();
  }

  async function login(password) {
    setBusy(true);
    setLoginError("");
    try {
      await api("/api/admin/check", { method: "POST" }, password);
      sessionStorage.setItem("seesol-admin", password);
      setAdmin(true);
      setLoginOpen(false);
      setNotice("Вход выполнен");
      window.setTimeout(() => setNotice(""), 2500);
    } catch {
      setLoginError("Неверный пароль. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProduct(payload) {
    setBusy(true);
    try {
      const saved = await api(editing?.id ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
        method: editing?.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      setProducts((current) => editing?.id ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setEditing(undefined);
      setNotice(editing?.id ? "Изменения сохранены" : "Модель добавлена в каталог");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
      window.setTimeout(() => setNotice(""), 3000);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Удалить ${product.brand} ${product.name} из каталога?`)) return;
    try {
      await api(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setNotice("Модель удалена");
    } catch (error) {
      setNotice(error.message);
    }
    window.setTimeout(() => setNotice(""), 3000);
  }

  function logout() {
    sessionStorage.removeItem("seesol-admin");
    setAdmin(false);
    setNotice("Вы вышли из админ-панели");
    window.setTimeout(() => setNotice(""), 2500);
  }

  return (
    <>
      <div className="announcement">Оригинальная оптика мировых брендов <span>·</span> Минск</div>
      <header className="site-header">
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Открыть меню"><Icon name="menu" /></button>
        <a className="wordmark" href="#" aria-label="See and Sol — на главную">see<span>&</span>sol<small>OPTICAL BOUTIQUE</small></a>
        <nav className={menuOpen ? "nav open" : "nav"}><a href="#catalog" onClick={() => setMenuOpen(false)}>Коллекция</a><a href="#about" onClick={() => setMenuOpen(false)}>О бутике</a><a href="#contact" onClick={() => setMenuOpen(false)}>Контакты</a></nav>
        <div className="header-actions"><a href="https://www.instagram.com/seesol.by/" target="_blank" rel="noreferrer" className="social-link"><Icon name="instagram" size={17} /><span>Instagram</span></a>{admin ? <button className="admin-header" onClick={logout}>Выйти из админ-панели</button> : <button className="admin-entry" onClick={() => setLoginOpen(true)} aria-label="Вход для администратора"><Icon name="lock" size={16} /></button>}</div>
      </header>

      <main>
        <section className="hero">
          <img className="hero-image" src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=2200&q=90" alt="" />
          <div className="hero-wash" />
          <div className="hero-content"><span className="eyebrow hero-eyebrow">Оптика с характером</span><h1>Ваш взгляд.<br /><em>Ваше солнце.</em></h1><p>Брендовые очки, в которых вы — это вы.<br />С вниманием к деталям и заботой о зрении.</p><a className="button button-light" href="#catalog">Исследовать коллекцию <Icon name="arrow" size={17} /></a></div>
          <span className="hero-caption">SEE THE WORLD DIFFERENTLY — MINSK</span>
          <div className="hero-index"><span>01</span><i />04</div>
        </section>

        <section className="intro" id="about"><span className="eyebrow">See & Sol · Минск</span><p>Вещи, которые остаются с вами надолго. Собрали в одном месте оригинальную оптику ведущих мировых брендов — для солнца, ясного зрения и вашего собственного стиля.</p><a className="text-link" href="#catalog">Открыть каталог <Icon name="arrow" size={15} /></a></section>

        <section className="catalog section-wrap" id="catalog">
          <div className="section-heading"><div><span className="eyebrow">Ваш следующий любимый аксессуар</span><h2>Выбрали для вас<span className="dot">.</span></h2></div><label className="search"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти модель" aria-label="Найти модель" /></label></div>
          <div className="catalog-toolbar"><div className="filters" role="group" aria-label="Фильтр по категории">{categories.map((item) => <button key={item} className={item === category ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="results-count">{visibleProducts.length} {visibleProducts.length === 1 ? "модель" : "модели"}</span></div>
          {admin && <div className="admin-bar"><div><span className="admin-status" />Вы вошли как администратор <span className="admin-help">— каталог виден покупателям сразу после сохранения</span></div><button className="button button-dark" onClick={() => setEditing(null)}><Icon name="plus" size={17} /> Добавить модель</button></div>}
          <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onOpen={setActiveProduct} admin={admin} onEdit={setEditing} onDelete={deleteProduct} />)}</div>
          {visibleProducts.length === 0 && <div className="empty-state">По вашему запросу ничего не найдено. Попробуйте изменить фильтр.</div>}
        </section>

        <section className="appointment"><div className="appointment-image"><img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85" alt="Подбор стильной оправы" loading="lazy" /></div><div className="appointment-copy"><span className="eyebrow">Не уверены, что выбрать?</span><h2>Найдём вашу<br /><em>идеальную пару.</em></h2><p>Загляните в бутик — поможем с выбором и подберём оправу, которая подойдёт именно вам.</p><a href="https://www.instagram.com/seesol.by/" target="_blank" rel="noreferrer" className="button button-dark">Связаться с нами <Icon name="arrow" size={17} /></a></div></section>

        <section className="values section-wrap"><div><span>01</span><h3>Только оригиналы</h3><p>Подлинные коллекции известных брендов</p></div><div><span>02</span><h3>Выбор с заботой</h3><p>Поможем найти форму, которая вам подходит</p></div><div><span>03</span><h3>Ваш город — Минск</h3><p>Ждём вас в бутике для личного знакомства</p></div></section>
      </main>

      <footer className="footer" id="contact"><div className="footer-main"><a className="wordmark footer-logo" href="#">see<span>&</span>sol<small>OPTICAL BOUTIQUE</small></a><p>Оптика, в которой<br />вы видите себя.</p><div className="footer-contact"><span className="eyebrow">Будем на связи</span><a href="https://www.instagram.com/seesol.by/" target="_blank" rel="noreferrer"><Icon name="instagram" size={17} /> @seesol.by <Icon name="arrow" size={15} /></a><span>Минск, Беларусь</span></div></div><div className="footer-bottom"><span>© See & Sol · 2026</span><a href="https://seesol.by/" target="_blank" rel="noreferrer">Официальный сайт <Icon name="arrow" size={14} /></a><span>С заботой о вашем взгляде</span></div></footer>

      {activeProduct && <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />}
      {editing !== undefined && <ProductEditor key={editing?.id ?? "new"} product={editing} busy={busy} onClose={() => setEditing(undefined)} onSave={saveProduct} />}
      {loginOpen && <AdminLogin onClose={() => { setLoginOpen(false); setLoginError(""); }} onLogin={login} error={loginError} busy={busy} />}
      {notice && <div className="toast" role="status">{notice}</div>}
    </>
  );
}
