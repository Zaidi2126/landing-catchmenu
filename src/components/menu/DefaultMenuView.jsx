import { useAr } from '../../context/ArContext';
import { sortCategories, getDishesForCategory, getArUrl, esc, escAttr } from '../../utils/menuData';

export default function DefaultMenuView({ data }) {
  const ar = useAr();
  const restaurant = data?.restaurant || {};
  const categories = sortCategories(data?.categories);
  const dishes = data?.dishes || [];

  function handleArLinkClick(e, dish) {
    const rawAr = getArUrl(dish, ar.isIphoneOrIpad);
    if (!rawAr) return;
    if (!ar.isMobile) {
      e.preventDefault();
      ar.showArPopup(false);
    } else if (ar.isIphoneOrIpad && !ar.isIOSSafari) {
      e.preventDefault();
      ar.showArPopup(true);
    }
  }

  return (
    <>
      <header className="catch_menu_header">
        <h1 id="catch_menu_restaurant_name">{restaurant.name || ''}</h1>
        <p id="catch_menu_restaurant_location" className="catch_menu_meta">{restaurant.location || ''}</p>
        <p id="catch_menu_restaurant_contact" className="catch_menu_meta">
          {[restaurant.contact_number, restaurant.contact_email].filter(Boolean).join(' · ')}
        </p>
      </header>
      <main id="catch_menu_categories_wrap" className="catch_menu_categories_wrap">
        {categories
          .filter((cat) => cat.is_active)
          .map((cat) => {
            const catDishes = getDishesForCategory(dishes, cat.id);
            return (
              <section key={cat.id} className="catch_menu_category">
                <h2 className="catch_menu_category_title">{esc(cat.name)}</h2>
                <div className="catch_menu_dishes">
                  {catDishes.map((d) => (
                    <article key={d.id} className="catch_menu_dish">
                      <div className="catch_menu_dish_img">
                        {d.image ? (
                          <img src={d.image} alt="" loading="lazy" />
                        ) : (
                          <div className="catch_menu_dish_no_img">No image</div>
                        )}
                      </div>
                      <div className="catch_menu_dish_body">
                        <p className="catch_menu_dish_price">{esc(d.price)}</p>
                        <h3 className="catch_menu_dish_name">{esc(d.name)}</h3>
                        {d.description && <p className="catch_menu_dish_desc">{esc(d.description)}</p>}
                        {getArUrl(d, ar.isIphoneOrIpad) &&
                          (ar.isAndroid ? (
                            <button
                              type="button"
                              className="catch_menu_dish_ar catch_menu_dish_ar_android"
                              onClick={() => ar.openModelViewer(d.ar_secondary || '', d.ar_primary || '', d.image)}
                            >
                              View in AR
                            </button>
                          ) : (
                            <a
                              href={getArUrl(d, ar.isIphoneOrIpad)}
                              rel={ar.isIOSSafari ? 'ar' : undefined}
                              target={ar.isIOSSafari ? undefined : '_blank'}
                              className="catch_menu_dish_ar"
                              onClick={(e) => handleArLinkClick(e, d)}
                            >
                              View in AR
                            </a>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
      </main>
    </>
  );
}
