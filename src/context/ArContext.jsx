import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AR_ASSET_BASE } from '../config';

const ArContext = createContext(null);

export function useAr() {
  const ctx = useContext(ArContext);
  return ctx;
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && window.innerWidth < 1024);
}
function isIphoneOrIpad() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}
function isIOSSafari() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export function ArProvider({ children }) {
  const [arPopup, setArPopup] = useState({ open: false, useSafariMessage: false });
  const [modelViewer, setModelViewer] = useState({ open: false, glb: '', usdz: '', poster: '' });
  const [dishImage, setDishImage] = useState({ open: false, src: '' });

  const showArPopup = useCallback((useSafariMessage) => {
    setArPopup({ open: true, useSafariMessage: !!useSafariMessage });
    document.body.style.overflow = 'hidden';
  }, []);

  const hideArPopup = useCallback(() => {
    setArPopup((p) => ({ ...p, open: false }));
    document.body.style.overflow = '';
  }, []);

  const openModelViewer = useCallback((glb, usdz = '', poster = '') => {
    setModelViewer({ open: true, glb: glb || '', usdz: usdz || '', poster: poster || '' });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModelViewer = useCallback(() => {
    setModelViewer((p) => ({ ...p, open: false }));
    document.body.style.overflow = '';
  }, []);

  const openDishImage = useCallback((src) => {
    setDishImage({ open: true, src });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeDishImage = useCallback(() => {
    setDishImage((p) => ({ ...p, open: false }));
    document.body.style.overflow = '';
  }, []);

  const value = {
    isMobile: isMobileDevice(),
    isIphoneOrIpad: isIphoneOrIpad(),
    isIOSSafari: isIOSSafari(),
    isAndroid: isAndroid(),
    showArPopup,
    hideArPopup,
    openModelViewer,
    closeModelViewer,
    openDishImage,
    closeDishImage,
    arPopup,
    modelViewer,
    dishImage,
  };

  return (
    <ArContext.Provider value={value}>
      {children}
      <ArModals
        arPopup={arPopup}
        hideArPopup={hideArPopup}
        modelViewer={modelViewer}
        closeModelViewer={closeModelViewer}
        dishImage={dishImage}
        closeDishImage={closeDishImage}
      />
    </ArContext.Provider>
  );
}

const MSG_DESKTOP = 'To see this dish in augmented reality, please open this menu on your <strong>phone or mobile device</strong>. AR is not supported on laptops or desktops.';
const MSG_IPHONE_NOT_SAFARI = 'AR on iPhone only works in <strong>Safari</strong>. Please open this menu in Safari (tap the share icon and choose "Open in Safari"), then tap "View in AR" again.';

function toAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    return new URL(trimmed, window.location.origin).href;
  } catch {
    return trimmed;
  }
}

/**
 * Resolve GLB/AR asset URL for display and for Scene Viewer.
 * When VITE_AR_ASSET_BASE is set (e.g. S3 bucket URL), relative paths are resolved
 * against it so Scene Viewer can fetch the model (public URL with CORS).
 */
function resolveGlbUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const base = AR_ASSET_BASE || window.location.origin;
    return new URL(trimmed, base.endsWith('/') ? base : base + '/').href;
  } catch {
    return toAbsoluteUrl(url);
  }
}

function toSceneViewerUrl(glbUrl) {
  if (!glbUrl || typeof glbUrl !== 'string') return '';
  const u = (glbUrl || '').trim();
  if (/^https?:\/\/arvr\.google\.com\/scene-viewer/i.test(u)) return u;
  const absolute = toAbsoluteUrl(u);
  if (!absolute.startsWith('https://')) return '';
  return 'https://arvr.google.com/scene-viewer/1.0?mode=ar_only&file=' + encodeURIComponent(absolute);
}

/**
 * Android intent URL to launch Scene Viewer in AR (com.google.ar.core).
 * Opening AR from our page (direct user tap) avoids Chrome blocking the intent
 * as a popup (about:blank#blocked) when opening from inside the Scene Viewer tab.
 * Fallback URL is used when Google Play Services for AR is not installed.
 */
function toSceneViewerIntentUrl(absoluteGlbUrl, fallbackUrl) {
  if (!absoluteGlbUrl || typeof absoluteGlbUrl !== 'string' || !absoluteGlbUrl.startsWith('https://')) return '';
  const httpsUrl = 'https://arvr.google.com/scene-viewer/1.0?mode=ar_only&file=' + encodeURIComponent(absoluteGlbUrl);
  const fallback = fallbackUrl && typeof fallbackUrl === 'string'
    ? fallbackUrl.trim()
    : httpsUrl;
  const encodedFallback = encodeURIComponent(fallback);
  return (
    'intent://arvr.google.com/scene-viewer/1.0?mode=ar_only&file=' +
    encodeURIComponent(absoluteGlbUrl) +
    '#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=' +
    encodedFallback +
    ';end;'
  );
}

function ArModals({ arPopup, hideArPopup, modelViewer, closeModelViewer, dishImage, closeDishImage }) {
  const modelViewerElRef = useRef(null);
  const glb = modelViewer.open && modelViewer.glb ? resolveGlbUrl(modelViewer.glb) : '';
  const usdz = modelViewer.open && modelViewer.usdz ? toAbsoluteUrl(modelViewer.usdz) : '';
  const poster = modelViewer.open && modelViewer.poster ? toAbsoluteUrl(modelViewer.poster) : '';
  const hasModel = glb || usdz;
  const isSceneViewerLink = (url) => /^https?:\/\/arvr\.google\.com\/scene-viewer/i.test((url || '').trim());
  const srcUrl = glb && !isSceneViewerLink(glb) ? glb : '';
  const sceneViewerUrl = isSceneViewerLink(glb) ? glb : (srcUrl ? toSceneViewerUrl(glb) : '');
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    const el = modelViewerElRef.current;
    if (!el) return;
    if (usdz) el.setAttribute('ios-src', usdz);
    else el.removeAttribute('ios-src');
  }, [modelViewer.open, usdz]);

  return (
    <>
      <div id="catch_ar_popup" className="catch_ar_popup" role="dialog" aria-modal="true" style={{ display: arPopup.open ? 'flex' : 'none' }}>
        <div className="catch_ar_popup_backdrop" onClick={hideArPopup} aria-hidden="true" />
        <div className="catch_ar_popup_box">
          <button type="button" className="catch_ar_popup_close" aria-label="Close" onClick={hideArPopup}>&times;</button>
          <h2 className="catch_ar_popup_title">View in AR</h2>
          <p className="catch_ar_popup_text" dangerouslySetInnerHTML={{ __html: arPopup.useSafariMessage ? MSG_IPHONE_NOT_SAFARI : MSG_DESKTOP }} />
          <button type="button" className="catch_ar_popup_btn" onClick={hideArPopup}>OK</button>
        </div>
      </div>

      <div id="catch_model_viewer_modal" className="catch_model_viewer_modal" style={{ display: modelViewer.open ? 'flex' : 'none' }} aria-hidden={!modelViewer.open}>
        <div className="catch_model_viewer_backdrop" onClick={closeModelViewer} aria-hidden="true" />
        <div className="catch_model_viewer_box">
          <button type="button" className="catch_model_viewer_close" aria-label="Close" onClick={closeModelViewer}>&times;</button>
          {hasModel && (
            <>
              <model-viewer
                ref={modelViewerElRef}
                src={srcUrl || undefined}
                poster={poster || undefined}
                ar
                ar-scale="fixed"
                ar-modes="webxr scene-viewer quick-look fallback"
                camera-controls
                touch-action="pan-y"
                alt="Dish 3D model"
                style={{ width: '100%', height: '280px', display: 'block', background: '#f0eeea' }}
              />
              <div className="catch_ar_modal_actions">
                {isAndroid && sceneViewerUrl ? (
                  <a
                    href={toSceneViewerIntentUrl(glb, sceneViewerUrl)}
                    rel="noopener noreferrer"
                    className="catch_ar_modal_btn"
                  >
                    View in AR
                  </a>
                ) : isIOS && usdz ? (
                  <a href={usdz} rel="ar" className="catch_ar_modal_btn">
                    View in AR
                  </a>
                ) : srcUrl || usdz ? (
                  <a
                    href={sceneViewerUrl || usdz || srcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="catch_ar_modal_btn"
                  >
                    View in AR
                  </a>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      <div id="catch_dish_image_modal" className="catch_dish_image_modal" role="dialog" aria-modal="true" style={{ display: dishImage.open ? 'flex' : 'none' }}>
        <div className="catch_dish_image_backdrop" onClick={closeDishImage} aria-hidden="true" />
        <div className="catch_dish_image_box">
          <button type="button" className="catch_dish_image_close" aria-label="Close" onClick={closeDishImage}>&times;</button>
          <img id="catch_dish_image_el" src={dishImage.src} alt="Dish" className="catch_dish_image_img" />
        </div>
      </div>
    </>
  );
}
