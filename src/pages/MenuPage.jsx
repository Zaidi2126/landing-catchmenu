import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../config';
import DefaultMenuView from '../components/menu/DefaultMenuView';
import M002View from '../components/menu/M002View';
import M003View from '../components/menu/M003View';
import M004View from '../components/menu/M004View';
import M005View from '../components/menu/M005View';

const TEMPLATES = {
  m_001: DefaultMenuView,
  m_002: M002View,
  m_003: M003View,
  m_004: M004View,
  m_005: M005View,
};

export default function MenuPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: false, data: null });
  const templateCode = state.data?.theme?.template_code || '';
  const TemplateComponent = TEMPLATES[templateCode] || DefaultMenuView;
  const restaurant = state.data?.restaurant || {};
  const showFooter = templateCode !== 'm_005';
  const footerText = [restaurant.location, restaurant.contact_number, restaurant.contact_email].filter(Boolean).join('  ·  ');

  useEffect(() => {
    if (!slug) return;
    setState({ loading: true, error: false, data: null });
    const url = `${API_BASE.replace(/\/$/, '')}/api/menu/${encodeURIComponent(slug)}/`;
    fetch(url, { method: 'GET', headers: { Accept: 'application/json' } })
      .then((res) => res.json().then((body) => ({ status: res.status, body })))
      .then((result) => {
        if (result.status !== 200 || !result.body?.data || result.body?.message === 'Restaurant not found.') {
          setState({ loading: false, error: true, data: null });
          return;
        }
        setState({ loading: false, error: false, data: result.body.data });
      })
      .catch(() => setState({ loading: false, error: true, data: null }));
  }, [slug]);

  useEffect(() => {
    if (restaurant.name) document.title = `${restaurant.name} | Catch Menu`;
    return () => { document.title = 'Catch Menu | Modern Visual Menu Experience'; };
  }, [restaurant.name]);

  if (!slug) {
    return (
      <div className="catch_restaurant_menu_view">
        <div className="catch_menu_static">
          <header className="catch_menu_topbar">
            <Link to="/" className="catch_menu_topbar_logo">
              <span className="catch_menu_topbar_tag">Restaurant</span>
              <span className="catch_menu_topbar_name">Catch Menu</span>
            </Link>
            <div className="catch_menu_topbar_nav">
              <Link to="/" className="catch_menu_topbar_ar_cta">Need AR menu for your restaurant? Click here</Link>
            </div>
          </header>
        </div>
        <div className="catch_menu_error">
          <p>Restaurant not found.</p>
          <Link to="/">Back to Catch Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`catch_restaurant_menu_view ${templateCode === 'm_005' ? 'catch_menu_tpl_m005' : ''} ${templateCode === 'm_003' ? 'catch_menu_tpl_m003' : ''}`}>
      <div className="catch_menu_static">
        <header className="catch_menu_topbar">
          <Link to="/" className="catch_menu_topbar_logo">
            <span className="catch_menu_topbar_tag">Restaurant</span>
            <span className="catch_menu_topbar_name">Catch Menu</span>
          </Link>
          <div className="catch_menu_topbar_nav">
            <Link to="/" className="catch_menu_topbar_ar_cta">Need AR menu for your restaurant? Click here</Link>
          </div>
        </header>
        <section className="catch_menu_hero" aria-hidden="true">
          <div className="catch_menu_hero_bg" />
          <div className="catch_menu_hero_content">
            <p id="catch_menu_hero_restaurant_name" className="catch_menu_hero_restaurant">{restaurant.name || ''}</p>
            <p className="catch_menu_hero_sub">Discover</p>
            <h1 className="catch_menu_hero_title">Our Menu</h1>
            <p id="catch_menu_hero_details" className="catch_menu_hero_details">
              {[restaurant.location, [restaurant.contact_number, restaurant.contact_email].filter(Boolean).join(' · ')].filter(Boolean).join('  ·  ')}
            </p>
          </div>
          <div className="catch_menu_hero_wave" aria-hidden="true" />
        </section>
      </div>

      {state.loading && (
        <div id="catch_menu_loading" className="catch_menu_loading">Loading menu…</div>
      )}
      {state.error && (
        <div id="catch_menu_error" className="catch_menu_error">
          <p>Restaurant not found.</p>
          <Link to="/">Back to Catch Menu</Link>
        </div>
      )}
      {!state.loading && !state.error && state.data && (
        <div id="catch_menu_content" className={`catch_menu_content ${templateCode === 'm_003' ? 'catch_menu_tpl_m003' : ''}`} style={{ display: 'block' }}>
          <TemplateComponent data={state.data} />
        </div>
      )}

      {showFooter && footerText && (
        <footer id="catch_menu_footer" className="catch_menu_footer">
          <div className="catch_menu_footer_inner">
            <p id="catch_menu_footer_text" className="catch_menu_footer_text">{footerText}</p>
          </div>
        </footer>
      )}
    </div>
  );
}
