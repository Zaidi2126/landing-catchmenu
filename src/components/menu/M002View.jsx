import { useAr } from '../../context/ArContext';
import { sortCategories, getDishesForCategory, getArUrl, esc } from '../../utils/menuData';
import './templates/m_002.css';

export default function M002View({ data }) {
  const ar = useAr();
  const restaurant = data?.restaurant || {};
  const categories = sortCategories(data?.categories);
  const dishes = data?.dishes || [];
  const allDishes = [];
  categories.filter((c) => c.is_active).forEach((cat) => {
    getDishesForCategory(dishes, cat.id).forEach((d) => allDishes.push(d));
  });

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
    <div className="catch_tpl_m002">
      <div className="bg-texture" aria-hidden="true" />
      <div className="menu-wrap">
      <div className="sep"><span className="sep-star">&#10022;</span></div>
      <p className="header-name">{restaurant.name || ''}</p>
      <h1 className="header-title">Food Menu</h1>
      <div className="sep header-sep-bottom"><span className="sep-star">&#10022;</span></div>
      <div className="grid">
        {allDishes.map((d) => {
          const rawAr = getArUrl(d, ar.isIphoneOrIpad);
          const dishImage = d.image || '';
          return (
            <div key={d.id} className="item">
              <div className="item-text">
                <div className="item-name">{esc(d.name)}</div>
                <div className="item-price">{esc(d.price)}</div>
                {d.description && <p className="item-desc">{esc(d.description)}</p>}
                {rawAr && (
                  <div className="item-actions">
                    {ar.isAndroid ? (
                      <button
                        type="button"
                        className="btn-ar btn-ar-android"
                        data-glb={rawAr}
                        data-poster={dishImage}
                        onClick={(e) => handleArClick(e, d)}
                      >
                        View in AR
                      </button>
                    ) : (
                      <a
                        href={rawAr}
                        rel={ar.isIOSSafari ? 'ar' : undefined}
                        target={ar.isIOSSafari ? undefined : '_blank'}
                        className="btn-ar"
                        onClick={(e) => handleArClick(e, d)}
                      >
                        View in AR
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="item-img-wrap">
                {dishImage ? (
                  <img className="item-img" src={dishImage} alt="" loading="lazy" />
                ) : (
                  <div className="item-img" style={{ background: '#e8e6e2', borderRadius: '50%' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
