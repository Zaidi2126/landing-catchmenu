<?php
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
if ($slug === '') {
	header('Location: index.php');
	exit;
}
// Production: all APIs hit zaidi123.pythonanywhere.com. Local: use same host with port 8000.
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost:8001';
$production_domain = 'zaidi123.pythonanywhere.com';
if (strpos($host, $production_domain) !== false) {
	$api_base = 'https://' . $production_domain;
} else {
	$api_base = (strpos($host, ':') !== false)
		? 'http://' . preg_replace('/:\d+$/', ':8000', $host)
		: 'http://' . $host . ':8000';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<link rel="icon" type="image/png" href="/img/favicon.png" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Menu | Catch Menu</title>
	<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,500&family=Great+Vibes&family=Mulish:wght@0,300;0,400;0,500;0,600&display=swap" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="/css/catch-menu.css" />
	<!-- model-viewer for Android AR (loaded only when needed) -->
	<script type="module" src="https://unpkg.com/@google/model-viewer@3.4.0/dist/model-viewer.min.js"></script>
</head>
<body class="catch_restaurant_menu_view">
	<div id="preloader" style="display:none;"></div>

	<!-- Static strip: white bar + dark hero (100% width, cannot be changed) -->
	<div class="catch_menu_static">
		<header class="catch_menu_topbar">
			<a href="/index.php" class="catch_menu_topbar_logo">
				<span class="catch_menu_topbar_tag">Restaurant</span>
				<span class="catch_menu_topbar_name">Catch Menu</span>
			</a>
			<div class="catch_menu_topbar_nav">
				<a href="/index.php" class="catch_menu_topbar_ar_cta">Need AR menu for your restaurant? Click here</a>
			</div>
		</header>

		<section class="catch_menu_hero">
			<div class="catch_menu_hero_bg"></div>
			<div class="catch_menu_hero_content">
				<p id="catch_menu_hero_restaurant_name" class="catch_menu_hero_restaurant"></p>
				<p class="catch_menu_hero_sub">Discover</p>
				<h1 class="catch_menu_hero_title">Our Menu</h1>
				<p id="catch_menu_hero_details" class="catch_menu_hero_details"></p>
			</div>
			<div class="catch_menu_hero_wave" aria-hidden="true"></div>
		</section>
	</div>

	<div id="catch_menu_loading" class="catch_menu_loading">Loading menu…</div>
	<div id="catch_menu_error" class="catch_menu_error" style="display:none;">
		<p>Restaurant not found.</p>
		<a href="/index.php">Back to Catch Menu</a>
	</div>
	<div id="catch_menu_content" class="catch_menu_content" style="display:none;">
		<header class="catch_menu_header">
			<h1 id="catch_menu_restaurant_name"></h1>
			<p id="catch_menu_restaurant_location" class="catch_menu_meta"></p>
			<p id="catch_menu_restaurant_contact" class="catch_menu_meta"></p>
		</header>
		<main id="catch_menu_categories_wrap" class="catch_menu_categories_wrap"></main>
	</div>

	<!-- White footer bar: same for all templates (location, contact, email) -->
	<footer id="catch_menu_footer" class="catch_menu_footer" style="display:none;">
		<div class="catch_menu_footer_inner">
			<p id="catch_menu_footer_text" class="catch_menu_footer_text"></p>
		</div>
	</footer>

	<!-- Popup: View in AR – desktop (use phone) or iPhone non-Safari (use Safari) -->
	<div id="catch_ar_popup" class="catch_ar_popup" role="dialog" aria-labelledby="catch_ar_popup_title" aria-modal="true" style="display:none;">
		<div class="catch_ar_popup_backdrop"></div>
		<div class="catch_ar_popup_box">
			<button type="button" class="catch_ar_popup_close" aria-label="Close">&times;</button>
			<h2 id="catch_ar_popup_title" class="catch_ar_popup_title">View in AR</h2>
			<p id="catch_ar_popup_text" class="catch_ar_popup_text"></p>
			<button type="button" class="catch_ar_popup_btn">OK</button>
		</div>
	</div>

	<!-- Android only: modal with model-viewer for AR (same approach as your other project) -->
	<div id="catch_model_viewer_modal" class="catch_model_viewer_modal" style="display:none;" aria-hidden="true">
		<div class="catch_model_viewer_backdrop"></div>
		<div class="catch_model_viewer_box">
			<button type="button" class="catch_model_viewer_close" aria-label="Close">&times;</button>
			<model-viewer
				id="catch_model_viewer_el"
				ar
				ar-scale="fixed"
				ar-modes="webxr scene-viewer quick-look fallback"
				camera-controls
				touch-action="pan-y"
				alt="Dish 3D model"
				style="width:100%;height:280px;background:#f0eeea;"
			>
				<button slot="ar-button" class="catch_model_viewer_ar_btn">View in AR</button>
			</model-viewer>
		</div>
	</div>

	<script>
	(function() {
		var API_BASE = <?php echo json_encode(rtrim($api_base, '/')); ?>;
		var slug = <?php echo json_encode($slug); ?>;

		function isMobileDevice() {
			return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
				|| (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && window.innerWidth < 1024);
		}
		function isIphoneOrIpad() {
			return /iPhone|iPad|iPod/i.test(navigator.userAgent);
		}
		function isIOSSafari() {
			var ua = navigator.userAgent;
			return /iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
		}
		function isAndroid() {
			return /Android/i.test(navigator.userAgent);
		}
		function toAndroidArUrl(modelUrl) {
			if (!modelUrl) return '';
			if (/arvr\.google\.com\/scene-viewer/i.test(modelUrl)) return modelUrl;
			return 'https://arvr.google.com/scene-viewer/1.0?mode=ar_preferred&file=' + encodeURIComponent(modelUrl);
		}

		var contentEl = document.getElementById('catch_menu_content');
		var defaultContentHTML = contentEl ? contentEl.innerHTML : '';
		// AR popup/modal refs and helpers (shared by default template and m_002)
		var popup = document.getElementById('catch_ar_popup');
		var popupTitle = document.getElementById('catch_ar_popup_title');
		var popupText = document.getElementById('catch_ar_popup_text');
		var modelViewerModal = document.getElementById('catch_model_viewer_modal');
		var modelViewerEl = document.getElementById('catch_model_viewer_el');
		var msgDesktop = 'To see this dish in augmented reality, please open this menu on your <strong>phone or mobile device</strong>. AR is not supported on laptops or desktops.';
		var msgIphoneNotSafari = 'AR on iPhone only works in <strong>Safari</strong>. Please open this menu in Safari (tap the share icon and choose "Open in Safari"), then tap "View in AR" again.';
		function showArPopup(useSafariMessage) {
			if (popup && popupTitle && popupText) {
				popupTitle.textContent = 'View in AR';
				popupText.innerHTML = useSafariMessage ? msgIphoneNotSafari : msgDesktop;
				popup.style.display = 'flex';
				document.body.style.overflow = 'hidden';
			}
		}
		function hideArPopup() {
			if (popup) { popup.style.display = 'none'; document.body.style.overflow = ''; }
		}
		function openModelViewerModal(glbUrl, posterUrl) {
			if (!modelViewerEl || !modelViewerModal) return;
			modelViewerEl.setAttribute('src', glbUrl);
			if (posterUrl) modelViewerEl.setAttribute('poster', posterUrl); else modelViewerEl.removeAttribute('poster');
			modelViewerModal.style.display = 'flex';
			modelViewerModal.setAttribute('aria-hidden', 'false');
			document.body.style.overflow = 'hidden';
		}
		function closeModelViewerModal() {
			if (modelViewerModal) {
				modelViewerModal.style.display = 'none';
				modelViewerModal.setAttribute('aria-hidden', 'true');
				document.body.style.overflow = '';
			}
		}
		if (contentEl) {
			contentEl.addEventListener('click', function(e) {
				var androidBtn = e.target.closest('button.catch_menu_dish_ar_android') || e.target.closest('button.btn-ar-android');
				if (androidBtn) {
					e.preventDefault();
					var glb = androidBtn.getAttribute('data-glb');
					if (glb) openModelViewerModal(glb, androidBtn.getAttribute('data-poster') || '');
					return;
				}
				var link = e.target.closest('a.catch_menu_dish_ar') || e.target.closest('a.btn-ar');
				if (!link) return;
				var mobile = isMobileDevice();
				var iphone = isIphoneOrIpad();
				var safari = isIOSSafari();
				if (!mobile) {
					e.preventDefault();
					showArPopup(false);
				} else if (iphone && !safari) {
					e.preventDefault();
					showArPopup(true);
				}
			});
		}
		if (modelViewerModal) {
			var b = modelViewerModal.querySelector('.catch_model_viewer_backdrop');
			var c = modelViewerModal.querySelector('.catch_model_viewer_close');
			if (b) b.addEventListener('click', closeModelViewerModal);
			if (c) c.addEventListener('click', closeModelViewerModal);
		}
		if (popup) {
			var pb = popup.querySelector('.catch_ar_popup_backdrop');
			var pc = popup.querySelector('.catch_ar_popup_close');
			var pbtn = popup.querySelector('.catch_ar_popup_btn');
			if (pb) pb.addEventListener('click', hideArPopup);
			if (pc) pc.addEventListener('click', hideArPopup);
			if (pbtn) pbtn.addEventListener('click', hideArPopup);
		}

		function setState(loading, error, content) {
			document.getElementById('catch_menu_loading').style.display = loading ? 'block' : 'none';
			document.getElementById('catch_menu_error').style.display = error ? 'block' : 'none';
			document.getElementById('catch_menu_content').style.display = content ? 'block' : 'none';
		}

		function applyTheme(theme) {
			/* Do not apply API theme colors; use each template's default colors only. */
		}

		function esc(s) {
			var d = document.createElement('div');
			d.textContent = s;
			return d.innerHTML;
		}
		function escAttr(s) {
			return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		}

		function render(data) {
			var restaurant = data.restaurant || {};
			var theme = data.theme || {};
			var categories = (data.categories || []).slice().sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
			var dishes = data.dishes || [];

			applyTheme(theme);
			if (restaurant.name) document.title = restaurant.name + ' | Catch Menu';
			var heroNameEl = document.getElementById('catch_menu_hero_restaurant_name');
			if (heroNameEl) heroNameEl.textContent = restaurant.name || '';
			var contact = [restaurant.contact_number, restaurant.contact_email].filter(Boolean).join(' · ');
			var detailsText = [restaurant.location, contact].filter(Boolean).join('  ·  ');
			var heroDetailsEl = document.getElementById('catch_menu_hero_details');
			if (heroDetailsEl) heroDetailsEl.textContent = detailsText || '';
			var nameEl = document.getElementById('catch_menu_restaurant_name');
			if (nameEl) nameEl.textContent = restaurant.name || '';
			var locEl = document.getElementById('catch_menu_restaurant_location');
			if (locEl) locEl.textContent = restaurant.location || '';
			var contactEl = document.getElementById('catch_menu_restaurant_contact');
			if (contactEl) contactEl.textContent = contact || '';

			var wrap = document.getElementById('catch_menu_categories_wrap');
			if (!wrap) return;
			wrap.innerHTML = '';
			categories.forEach(function(cat) {
				if (!cat.is_active) return;
				var catDishes = dishes.filter(function(d) { return d.category_id === cat.id && d.is_available !== false; });
				catDishes.sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
				var section = document.createElement('section');
				section.className = 'catch_menu_category';
				section.innerHTML = '<h2 class="catch_menu_category_title">' + esc(cat.name||'') + '</h2><div class="catch_menu_dishes"></div>';
				var dishesEl = section.querySelector('.catch_menu_dishes');
				catDishes.forEach(function(d) {
					// ar_primary = iPhone (.usdz), ar_secondary = Android (.glb)
					var rawAr = isIphoneOrIpad()
						? (d.ar_primary || d.ar_secondary || '')
						: (d.ar_secondary || d.ar_primary || '');
					var dishImage = d.image || '';
					var arHtml;
					if (isAndroid() && rawAr) {
						arHtml = '<button type="button" class="catch_menu_dish_ar catch_menu_dish_ar_android" data-glb="'+escAttr(rawAr)+'" data-poster="'+escAttr(dishImage)+'">View in AR</button>';
					} else {
						var arAttrs = isIOSSafari() ? ' rel="ar"' : ' target="_blank" rel="noopener"';
						arHtml = '<a href="'+escAttr(rawAr)+'"'+arAttrs+' class="catch_menu_dish_ar">View in AR</a>';
					}
					dishesEl.innerHTML +=
						'<article class="catch_menu_dish">' +
						'<div class="catch_menu_dish_img">' + (d.image ? '<img src="'+escAttr(d.image)+'" alt="" loading="lazy"/>' : '<div class="catch_menu_dish_no_img">No image</div>') + '</div>' +
						'<div class="catch_menu_dish_body">' +
						'<p class="catch_menu_dish_price">'+esc(d.price||'')+'</p>' +
						'<h3 class="catch_menu_dish_name">' + esc(d.name||'') + '</h3>' +
						(d.description ? '<p class="catch_menu_dish_desc">'+esc(d.description)+'</p>' : '') +
						(rawAr ? arHtml : '') +
						'</div></article>';
				});
				wrap.appendChild(section);
			});
		}

		function renderM002(data) {
			var restaurant = data.restaurant || {};
			var theme = data.theme || {};
			var categories = (data.categories || []).slice().sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
			var dishes = data.dishes || [];
			applyTheme(theme);
			if (restaurant.name) document.title = restaurant.name + ' | Catch Menu';
			var nameEl = contentEl.querySelector('.menu-wrap .header-name');
			var titleEl = contentEl.querySelector('.menu-wrap .header-title');
			var gridEl = contentEl.querySelector('.menu-wrap .grid');
			if (nameEl) nameEl.textContent = restaurant.name || '';
			if (titleEl) titleEl.textContent = 'Food Menu';
			if (!gridEl) return;
			gridEl.innerHTML = '';
			var allDishes = [];
			categories.forEach(function(cat) {
				if (!cat.is_active) return;
				var catDishes = dishes.filter(function(d) { return d.category_id === cat.id && d.is_available !== false; });
				catDishes.sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
				catDishes.forEach(function(d) { allDishes.push(d); });
			});
			allDishes.forEach(function(d) {
				var rawAr = isIphoneOrIpad() ? (d.ar_primary || d.ar_secondary || '') : (d.ar_secondary || d.ar_primary || '');
				var dishImage = d.image || '';
				var arHtml;
				if (isAndroid() && rawAr) {
					arHtml = '<button type="button" class="btn-ar btn-ar-android" data-glb="'+escAttr(rawAr)+'" data-poster="'+escAttr(dishImage)+'">View in AR</button>';
				} else if (rawAr) {
					var arAttrs = isIOSSafari() ? ' rel="ar"' : ' target="_blank" rel="noopener"';
					arHtml = '<a href="'+escAttr(rawAr)+'"'+arAttrs+' class="btn-ar">View in AR</a>';
				} else { arHtml = ''; }
				gridEl.innerHTML += '<div class="item"><div class="item-text"><div class="item-name">'+esc(d.name||'')+'</div><div class="item-price">'+esc(d.price||'')+'</div>'+(d.description ? '<p class="item-desc">'+esc(d.description)+'</p>' : '')+(rawAr ? '<div class="item-actions">'+arHtml+'</div>' : '')+'</div><div class="item-img-wrap">'+(dishImage ? '<img class="item-img" src="'+escAttr(dishImage)+'" alt="" loading="lazy"/>' : '<div class="item-img" style="background:#e8e6e2;border-radius:50%;"></div>')+'</div></div>';
			});
		}

		function renderM003(data) {
			var restaurant = data.restaurant || {};
			var theme = data.theme || {};
			var categories = (data.categories || []).slice().sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
			var dishes = data.dishes || [];
			applyTheme(theme);
			if (restaurant.name) document.title = restaurant.name + ' | Catch Menu';
			var nameSpan = contentEl.querySelector('.menu-page .catch_restaurant_name');
			if (nameSpan) nameSpan.textContent = restaurant.name || '';
			var logoWrap = contentEl.querySelector('.menu-page .logo-wrap');
			if (logoWrap) {
				var logoUrl = (theme && theme.logo_url) ? theme.logo_url : (restaurant.logo_url || restaurant.logo || '');
				if (logoUrl) {
					logoWrap.innerHTML = '<img src="' + escAttr(logoUrl) + '" alt="Restaurant logo" loading="lazy"/>';
				}
			}
			var menuItemsEl = contentEl.querySelector('.menu-page .menu-items');
			if (!menuItemsEl) return;
			var html = '';
			var itemIndex = 0;
			categories.forEach(function(cat) {
				if (!cat.is_active) return;
				var catDishes = dishes.filter(function(d) { return d.category_id === cat.id && d.is_available !== false; });
				catDishes.sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
				if (catDishes.length === 0) return;
				html += '<div class="menu-category">';
				html += '<h3 class="menu-category-title">'+esc(cat.name||'')+'</h3>';
				catDishes.forEach(function(d) {
					var rawAr = isIphoneOrIpad() ? (d.ar_primary || d.ar_secondary || '') : (d.ar_secondary || d.ar_primary || '');
					var dishImage = d.image || '';
					var arHtml = '';
					if (isAndroid() && rawAr) {
						arHtml = '<button type="button" class="btn-ar btn-ar-android" data-glb="'+escAttr(rawAr)+'" data-poster="'+escAttr(dishImage)+'">View in AR</button>';
					} else if (rawAr) {
						var arAttrs = isIOSSafari() ? ' rel="ar"' : ' target="_blank" rel="noopener"';
						arHtml = '<a href="'+escAttr(rawAr)+'"'+arAttrs+' class="btn-ar">View in AR</a>';
					}
					var imgSrc = d.image ? escAttr(d.image) : '';
					var imgTag = imgSrc ? '<img src="'+imgSrc+'" alt="" loading="lazy"/>' : '';
					html += '<section class="menu-item">';
					if (itemIndex > 0) html += '<div class="item-divider" aria-hidden="true"></div>';
					html += '<div class="item-inner"><div class="item-img-frame">'+imgTag+'</div><div class="item-content">';
					var priceStr = (d.price != null && d.price !== '') ? ('AED ' + String(d.price).trim()) : '';
					html += '<div class="item-head"><span class="item-name">'+esc(d.name||'')+'</span><span class="item-dots"></span><span class="item-price-top">'+esc(priceStr)+'</span></div>';
					html += (d.description ? '<p class="item-desc">'+esc(d.description)+'</p>' : '');
					if (arHtml) html += '<div class="item-actions">'+arHtml+'</div>';
					html += '</div></div></section>';
					itemIndex++;
				});
				html += '</div>';
			});
			menuItemsEl.innerHTML = html;
		}

		function renderM004(data) {
			var restaurant = data.restaurant || {};
			var theme = data.theme || {};
			var categories = (data.categories || []).slice().sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
			var dishes = data.dishes || [];
			applyTheme(theme);
			if (restaurant.name) document.title = restaurant.name + ' | Catch Menu';
			var nameEl = contentEl.querySelector('.catch-menu-m004 .restaurant-name');
			if (nameEl) nameEl.textContent = restaurant.name || '';
			var logoWrap = contentEl.querySelector('.catch-menu-m004 .restaurant-logo-wrap');
			if (logoWrap) {
				var logoUrl = (theme && theme.logo_url) ? theme.logo_url : (restaurant.logo_url || restaurant.logo || '');
				if (logoUrl) {
					logoWrap.innerHTML = '<img src="' + escAttr(logoUrl) + '" alt="Restaurant logo" loading="lazy"/>';
				}
			}
			var menuItemsEl = contentEl.querySelector('.catch-menu-m004 .menu-items');
			if (!menuItemsEl) return;
			var allDishes = [];
			categories.forEach(function(cat) {
				if (!cat.is_active) return;
				var catDishes = dishes.filter(function(d) { return d.category_id === cat.id && d.is_available !== false; });
				catDishes.sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
				catDishes.forEach(function(d) { allDishes.push(d); });
			});
			var html = '';
			allDishes.forEach(function(d) {
				var imgSrc = d.image ? escAttr(d.image) : '';
				var imgContent = imgSrc ? '<img src="'+imgSrc+'" alt="" loading="lazy"/>' : '';
				html += '<div class="menu-item"><div class="menu-item-img">' + imgContent + '</div>';
				html += '<div class="menu-item-text"><div class="menu-item-top">';
				html += '<span class="menu-item-name">'+esc(d.name||'')+'</span>';
				html += '<span class="menu-item-price">'+esc(d.price||'')+'</span></div>';
				html += (d.description ? '<p class="menu-item-desc">'+esc(d.description)+'</p>' : '');
				html += '</div></div>';
			});
			menuItemsEl.innerHTML = html;
		}

		function renderM005(data) {
			var restaurant = data.restaurant || {};
			var theme = data.theme || {};
			var categories = (data.categories || []).slice().sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
			var dishes = data.dishes || [];
			applyTheme(theme);
			if (restaurant.name) document.title = restaurant.name + ' | Catch Menu';
			var nameEl = contentEl.querySelector('.catch-menu-m005 .brand-text h1');
			if (nameEl) nameEl.textContent = restaurant.name || '';
			var subEl = contentEl.querySelector('.catch-menu-m005 .brand-text p');
			if (subEl) subEl.textContent = restaurant.location || '';
			var logoEl = contentEl.querySelector('.catch-menu-m005 .brand .logo');
			if (logoEl) {
				var logoUrl = (theme && theme.logo_url) ? theme.logo_url : (restaurant.logo_url || restaurant.logo || '');
				if (logoUrl) {
					logoEl.src = logoUrl;
					logoEl.alt = restaurant.name || 'Logo';
				} else {
					logoEl.style.display = 'none';
				}
			}
			var sectionsEl = contentEl.querySelector('.catch-menu-m005 .menu-sections');
			if (!sectionsEl) return;
			var arSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>';
			var html = '';
			categories.forEach(function(cat) {
				if (!cat.is_active) return;
				var catDishes = dishes.filter(function(d) { return d.category_id === cat.id && d.is_available !== false; });
				catDishes.sort(function(a,b){ return (a.sort_order||0) - (b.sort_order||0); });
				if (catDishes.length === 0) return;
				html += '<h2 class="section-title">' + esc(cat.name || '') + '</h2>';
				html += '<ul class="menu-list" role="list">';
				catDishes.forEach(function(d) {
					var rawAr = isIphoneOrIpad() ? (d.ar_primary || d.ar_secondary || '') : (d.ar_secondary || d.ar_primary || '');
					var dishImage = d.image || '';
					var imgContent = dishImage ? '<img src="'+escAttr(dishImage)+'" alt="" class="menu-item-image" loading="lazy" width="400" height="250"/>' : '<div class="menu-item-image" style="background:var(--bg-deep);min-height:160px;"></div>';
					var arHtml = '';
					if (isAndroid() && rawAr) {
						arHtml = '<button type="button" class="btn-ar btn-ar-android" data-glb="'+escAttr(rawAr)+'" data-poster="'+escAttr(dishImage)+'" aria-label="View in AR">'+arSvg+' View in AR</button>';
					} else if (rawAr) {
						var arAttrs = isIOSSafari() ? ' rel="ar"' : ' target="_blank" rel="noopener"';
						arHtml = '<a href="'+escAttr(rawAr)+'"'+arAttrs+' class="btn-ar">'+arSvg+' View in AR</a>';
					}
					html += '<li class="menu-item visible" data-animate><div class="menu-item-image-wrap">'+imgContent+'</div>';
					html += '<div class="menu-item-body"><h3 class="menu-item-title">'+esc(d.name||'')+'</h3>';
					html += (d.description ? '<p class="menu-item-desc">'+esc(d.description)+'</p>' : '');
					html += '<div class="menu-item-footer"><span class="menu-item-price">AED '+esc(d.price||'')+'</span>'+(arHtml ? arHtml : '')+'</div></div></li>';
				});
				html += '</ul>';
			});
			sectionsEl.innerHTML = html;
			var footerAddress = contentEl.querySelector('.catch-menu-m005 .footer-address');
			var footerPhone = contentEl.querySelector('.catch-menu-m005 .footer-phone');
			if (footerAddress) footerAddress.textContent = restaurant.location || '';
			if (footerPhone) {
				var phone = restaurant.contact_number || '';
				footerPhone.innerHTML = phone ? '<a href="tel:'+escAttr(phone.replace(/\s/g,''))+'">'+esc(phone)+'</a>' : '';
			}
			contentEl.querySelectorAll('.btn-ar-android').forEach(function(btn) {
				btn.addEventListener('click', function() {
					var glb = btn.getAttribute('data-glb');
					if (glb && typeof openModelViewerModal === 'function') openModelViewerModal(glb, btn.getAttribute('data-poster') || '');
				});
			});
		}

		function fillMenuFooter(data) {
			var restaurant = data.restaurant || {};
			var parts = [restaurant.location, restaurant.contact_number, restaurant.contact_email].filter(Boolean);
			var text = parts.join('  ·  ');
			var footerEl = document.getElementById('catch_menu_footer');
			var textEl = document.getElementById('catch_menu_footer_text');
			if (footerEl && textEl) {
				textEl.textContent = text || '';
				footerEl.style.display = text ? 'block' : 'none';
			}
		}

		function loadTemplateByCode(code, data) {
			if (!code || !contentEl) {
				render(data);
				fillMenuFooter(data);
				return Promise.resolve();
			}
			var url = 'get_template.php?code=' + encodeURIComponent(code);
			return fetch(url)
				.then(function(res) {
					if (!res.ok) return Promise.reject(new Error('Template not found'));
					return res.text();
				})
				.then(function(html) {
					var parser = new DOMParser();
					var doc = parser.parseFromString(html, 'text/html');
					var bodyContent = doc.body ? doc.body.innerHTML : html;
					contentEl.innerHTML = bodyContent;
					document.body.classList.remove('catch_menu_tpl_m003', 'catch_menu_tpl_m005');
					if (document.getElementById('catch_menu_categories_wrap')) {
						render(data);
						fillMenuFooter(data);
					} else if (contentEl.querySelector('.menu-wrap .grid')) {
						var oldStyles = document.querySelectorAll('style[data-catch-menu-template]');
						for (var i = 0; i < oldStyles.length; i++) oldStyles[i].parentNode.removeChild(oldStyles[i]);
						var styles = doc.head ? doc.head.querySelectorAll('style') : [];
						for (var j = 0; j < styles.length; j++) {
							var style = document.createElement('style');
							style.setAttribute('data-catch-menu-template', code);
							style.textContent = styles[j].textContent;
							document.head.appendChild(style);
						}
						renderM002(data);
						fillMenuFooter(data);
					} else if (contentEl.querySelector('.catch-menu-m004')) {
						document.body.classList.remove('catch_menu_tpl_m005');
						var oldStyles = document.querySelectorAll('style[data-catch-menu-template]');
						for (var i = 0; i < oldStyles.length; i++) oldStyles[i].parentNode.removeChild(oldStyles[i]);
						var styles = doc.head ? doc.head.querySelectorAll('style') : [];
						for (var j = 0; j < styles.length; j++) {
							var style = document.createElement('style');
							style.setAttribute('data-catch-menu-template', code);
							style.textContent = styles[j].textContent;
							document.head.appendChild(style);
						}
						renderM004(data);
						fillMenuFooter(data);
					} else if (contentEl.querySelector('.catch-menu-m005')) {
						document.body.classList.remove('catch_menu_tpl_m003');
						document.body.classList.add('catch_menu_tpl_m005');
						var oldTpl = document.querySelectorAll('style[data-catch-menu-template], link[data-catch-menu-template]');
						for (var i = 0; i < oldTpl.length; i++) oldTpl[i].parentNode.removeChild(oldTpl[i]);
						var styles = doc.head ? doc.head.querySelectorAll('style') : [];
						for (var j = 0; j < styles.length; j++) {
							var style = document.createElement('style');
							style.setAttribute('data-catch-menu-template', code);
							style.textContent = styles[j].textContent;
							document.head.appendChild(style);
						}
						var links = doc.head ? doc.head.querySelectorAll('link[rel="stylesheet"]') : [];
						for (var k = 0; k < links.length; k++) {
							var link = document.createElement('link');
							link.rel = 'stylesheet';
							link.href = links[k].href || '';
							if (link.href) {
								link.setAttribute('data-catch-menu-template', code);
								document.head.appendChild(link);
							}
						}
						renderM005(data);
						// m_005: no shared footer (template has its own or none)
						var footerEl = document.getElementById('catch_menu_footer');
						if (footerEl) footerEl.style.display = 'none';
					} else if (contentEl.querySelector('.menu-page .menu-items')) {
						document.body.classList.remove('catch_menu_tpl_m005');
						contentEl.classList.add('catch_menu_tpl_m003');
						var oldStyles = document.querySelectorAll('style[data-catch-menu-template]');
						for (var i = 0; i < oldStyles.length; i++) oldStyles[i].parentNode.removeChild(oldStyles[i]);
						var styles = doc.head ? doc.head.querySelectorAll('style') : [];
						for (var j = 0; j < styles.length; j++) {
							var style = document.createElement('style');
							style.setAttribute('data-catch-menu-template', code);
							style.textContent = styles[j].textContent;
							document.head.appendChild(style);
						}
						renderM003(data);
						fillMenuFooter(data);
					} else {
						document.body.classList.remove('catch_menu_tpl_m003', 'catch_menu_tpl_m005');
						contentEl.classList.remove('catch_menu_tpl_m003');
						contentEl.innerHTML = defaultContentHTML;
						render(data);
						fillMenuFooter(data);
					}
				})
				.catch(function() {
					document.body.classList.remove('catch_menu_tpl_m003', 'catch_menu_tpl_m005');
					contentEl.classList.remove('catch_menu_tpl_m003');
					contentEl.innerHTML = defaultContentHTML;
					render(data);
					fillMenuFooter(data);
				});
		}

		setState(true, false, false);
		fetch(API_BASE + '/api/menu/' + encodeURIComponent(slug) + '/', { method: 'GET', headers: { 'Accept': 'application/json' } })
			.then(function(res) { return res.json().then(function(body) { return { status: res.status, body: body }; }); })
			.catch(function() { setState(false, true, false); })
			.then(function(result) {
				if (!result) return;
				var body = result.body;
				if (result.status !== 200 || !body || body.message === 'Restaurant not found.' || !body.data) {
					setState(false, true, false);
					return;
				}
				setState(false, false, true);
				var data = body.data;
				var templateCode = (data.theme && data.theme.template_code) ? data.theme.template_code : '';
				loadTemplateByCode(templateCode, data);
			});
	})();
	</script>
</body>
</html>
