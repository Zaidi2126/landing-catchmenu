import { sortCategories, getDishesForCategory, esc } from '../../utils/menuData';
import './templates/m_004.css';

export default function M004View({ data }) {
  const restaurant = data?.restaurant || {};
  const theme = data?.theme || {};
  const categories = sortCategories(data?.categories);
  const dishes = data?.dishes || [];
  const logoUrl = (theme && theme.logo_url) ? theme.logo_url : (restaurant.logo_url || restaurant.logo || '');
  const allDishes = [];
  categories.filter((c) => c.is_active).forEach((cat) => {
    getDishesForCategory(dishes, cat.id).forEach((d) => allDishes.push(d));
  });

  return (
    <div className="catch_tpl_m004 menu-wrap catch-menu-m004">
      <div className="restaurant-brand">
        <div className="restaurant-logo-wrap">
          {logoUrl ? (
            <img src={logoUrl} alt="Restaurant logo" />
          ) : (
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="80" height="80" aria-hidden="true">
              <defs>
                <linearGradient id="starGoldM004" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#f5d547' }} />
                  <stop offset="35%" style={{ stopColor: '#e8c229' }} />
                  <stop offset="70%" style={{ stopColor: '#c9a227' }} />
                  <stop offset="100%" style={{ stopColor: '#a67c1a' }} />
                </linearGradient>
              </defs>
              <path fill="url(#starGoldM004)" stroke="#9a7214" strokeWidth="1" d="M60 12 L68 44 L102 44 L74 64 L82 98 L60 80 L38 98 L46 64 L18 44 L52 44 Z" />
            </svg>
          )}
        </div>
        <p className="restaurant-name">{restaurant.name || ''}</p>
      </div>
      <header className="menu-header">
        <h1>MENU</h1>
      </header>
      <div className="menu-items">
        {allDishes.map((d) => (
          <div key={d.id} className="menu-item">
            <div className="menu-item-img">
              {d.image && <img src={d.image} alt="" loading="lazy" />}
            </div>
            <div className="menu-item-text">
              <div className="menu-item-top">
                <span className="menu-item-name">{esc(d.name)}</span>
                <span className="menu-item-price">{esc(d.price)}</span>
              </div>
              {d.description && <p className="menu-item-desc">{esc(d.description)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
