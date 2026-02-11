import { useAr } from '../../context/ArContext';
import { sortCategories, getDishesForCategory, getArUrl, esc } from '../../utils/menuData';
import './templates/m_005.css';

const AR_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
  </svg>
);

export default function M005View({ data }) {
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
      ar.openModelViewer(dish.ar_secondary || '', dish.ar_primary || '', dish.image);
    } else if (!ar.isMobile) {
      e.preventDefault();
      ar.showArPopup(false);
    } else if (ar.isIphoneOrIpad && !ar.isIOSSafari) {
      e.preventDefault();
      ar.showArPopup(true);
    }
  }

  function handleImageClick(src) {
    ar.openDishImage(src);
  }

  return (
    <div className="catch_tpl_m005 wrapper catch-menu-m005">
      <header className="header">
        <div className="brand">
          {logoUrl ? (
            <img src={logoUrl} alt={restaurant.name || 'Logo'} className="logo" />
          ) : (
            <div className="logo" style={{ display: 'none' }} />
          )}
          <div className="brand-text">
            <h1>{restaurant.name || ''}</h1>
            <p>{restaurant.location || ''}</p>
          </div>
        </div>
      </header>
      <section className="menu">
        <div className="menu-sections">
          {categories.filter((c) => c.is_active).map((cat) => {
            const catDishes = getDishesForCategory(dishes, cat.id);
            if (catDishes.length === 0) return null;
            return (
              <div key={cat.id}>
                <h2 className="section-title">{esc(cat.name)}</h2>
                <ul className="menu-list" role="list">
                  {catDishes.map((d) => {
                    const rawAr = getArUrl(d, ar.isIphoneOrIpad);
                    const dishImage = d.image || '';
                    return (
                      <li key={d.id} className="menu-item visible" data-animate>
                        <div
                          className="menu-item-image-wrap"
                          onClick={() => dishImage && handleImageClick(dishImage)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' && dishImage) handleImageClick(dishImage); }}
                          style={{ cursor: dishImage ? 'pointer' : undefined }}
                        >
                          {dishImage ? (
                            <img src={dishImage} alt="" className="menu-item-image" loading="lazy" width="400" height="250" />
                          ) : (
                            <div className="menu-item-image" style={{ background: 'var(--bg-deep)', minHeight: '160px' }} />
                          )}
                        </div>
                        <div className="menu-item-body">
                          <h3 className="menu-item-title">{esc(d.name)}</h3>
                          {d.description && <p className="menu-item-desc">{esc(d.description)}</p>}
                          <div className="menu-item-footer">
                            <span className="menu-item-price">AED {esc(d.price)}</span>
                            {rawAr &&
                              (ar.isAndroid ? (
                                <button type="button" className="btn-ar btn-ar-android" onClick={(e) => handleArClick(e, d)} aria-label="View in AR">
                                  {AR_SVG} View in AR
                                </button>
                              ) : (
                                <a href={rawAr} rel={ar.isIOSSafari ? 'ar' : undefined} target={ar.isIOSSafari ? undefined : '_blank'} className="btn-ar" onClick={(e) => handleArClick(e, d)}>
                                  {AR_SVG} View in AR
                                </a>
                              ))}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
      <footer className="footer">
        <p className="footer-address">{restaurant.location || ''}</p>
        <p className="footer-phone">
          {restaurant.contact_number ? (
            <a href={`tel:${restaurant.contact_number.replace(/\s/g, '')}`}>{restaurant.contact_number}</a>
          ) : null}
        </p>
      </footer>
    </div>
  );
}
