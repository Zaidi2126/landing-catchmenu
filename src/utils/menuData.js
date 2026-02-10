export function esc(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

export function escAttr(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function sortCategories(categories) {
  return (categories || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export function getDishesForCategory(dishes, categoryId) {
  return (dishes || [])
    .filter((d) => d.category_id === categoryId && d.is_available !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export function getArUrl(dish, isIphoneOrIpad) {
  const raw = isIphoneOrIpad
    ? (dish.ar_primary || dish.ar_secondary || '')
    : (dish.ar_secondary || dish.ar_primary || '');
  return raw;
}
