import { useAr } from '../../context/ArContext';
import { sortCategories, getDishesForCategory, getArUrl, esc } from '../../utils/menuData';
import './templates/m_003.css';

export default function M003View({ data }) {
  const ar = useAr();
  const restaurant = data?.restaurant || {};
  const theme = data?.theme || {};
  const categories = sortCategories(data?.categories);
  const dishes = data?.dishes || [];
  const logoUrl = (theme && theme.logo_url) ? theme.logo_url : (restaurant.logo_url || restaurant.logo || '');

  function handleArClick(e, dish) {
    const rawAr = getArUrl(dish, ar.isIphoneOrIpad);
    if (!rawAr) return;
    if (ar.isAndroid) {
      e.preventDefault();
      ar.openModelViewer(rawAr, dish.image);
    } else if (!ar.isMobile) {
      e.preventDefault();
      ar.showArPopup(false);
    } else if (ar.isIphoneOrIpad && !ar.isIOSSafari) {
      e.preventDefault();
      ar.showArPopup(true);
    }
  }

  return (
    <div className="catch_tpl_m003">
      <div className="page-texture" aria-hidden="true" />
      <div className="menu-page">
        <header className="header-block">
          <div className="logo-wrap">
            {logoUrl ? (
              <img src={logoUrl} alt="Restaurant logo" loading="lazy" />
            ) : (
              <svg className="crown-svg" viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="#b8860b" stroke="#8b6914" strokeWidth="0.8" d="M32 4l8 16h8l-12 10 4 18-12-10-12 10 4-18-12-10h8l8-16z" />
              </svg>
            )}
          </div>
          <h1 className="restaurant-name">
            <span className="catch_restaurant_name">{restaurant.name || ''}</span>
          </h1>
          <div className="menu-title-wrap">
            <h2 className="menu-title">Menu</h2>
          </div>
        </header>
        <div className="menu-items">
          {categories.filter((c) => c.is_active).map((cat) => {
            const catDishes = getDishesForCategory(dishes, cat.id);
            if (catDishes.length === 0) return null;
            return (
              <div key={cat.id} className="menu-category">
                <h3 className="menu-category-title">{esc(cat.name)}</h3>
                {catDishes.map((d, idx) => {
                  const rawAr = getArUrl(d, ar.isIphoneOrIpad);
                  return (
                    <section key={d.id} className="menu-item">
                      {idx > 0 && <div className="item-divider" aria-hidden="true" />}
                      <div className="item-inner">
                        <div className="item-img-frame">
                          {d.image && <img src={d.image} alt="" loading="lazy" />}
                        </div>
                        <div className="item-content">
                          <div className="item-head">
                            <span className="item-name">{esc(d.name)}</span>
                            <span className="item-dots" />
                            <span className="item-price-top">AED {esc(d.price)}</span>
                          </div>
                          {d.description && <p className="item-desc">{esc(d.description)}</p>}
                          {rawAr && (
                            <div className="item-actions">
                              {ar.isAndroid ? (
                                <button type="button" className="btn-ar btn-ar-android" onClick={(e) => handleArClick(e, d)}>View in AR</button>
                              ) : (
                                <a href={rawAr} rel={ar.isIOSSafari ? 'ar' : undefined} target={ar.isIOSSafari ? undefined : '_blank'} className="btn-ar" onClick={(e) => handleArClick(e, d)}>View in AR</a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
