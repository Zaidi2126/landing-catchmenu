import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

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
  const [modelViewer, setModelViewer] = useState({ open: false, glb: '', poster: '' });
  const [dishImage, setDishImage] = useState({ open: false, src: '' });

  const showArPopup = useCallback((useSafariMessage) => {
    setArPopup({ open: true, useSafariMessage: !!useSafariMessage });
    document.body.style.overflow = 'hidden';
  }, []);

  const hideArPopup = useCallback(() => {
    setArPopup((p) => ({ ...p, open: false }));
    document.body.style.overflow = '';
  }, []);

  const openModelViewer = useCallback((glb, poster = '') => {
    setModelViewer({ open: true, glb, poster });
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

function ArModals({ arPopup, hideArPopup, modelViewer, closeModelViewer, dishImage, closeDishImage }) {
  const modelViewerRef = useRef(null);
  useEffect(() => {
    const container = modelViewerRef.current;
    if (!container || !modelViewer.open || !modelViewer.glb) {
      if (container) container.innerHTML = '';
      return;
    }
    container.innerHTML = '';
    const el = document.createElement('model-viewer');
    el.setAttribute('id', 'catch_model_viewer_el');
    el.setAttribute('ar', '');
    el.setAttribute('ar-scale', 'fixed');
    el.setAttribute('ar-modes', 'webxr scene-viewer quick-look fallback');
    el.setAttribute('camera-controls', '');
    el.setAttribute('touch-action', 'pan-y');
    el.setAttribute('alt', 'Dish 3D model');
    el.style.width = '100%';
    el.style.height = '280px';
    el.style.background = '#f0eeea';
    el.src = modelViewer.glb;
    if (modelViewer.poster) el.poster = modelViewer.poster;
    const btn = document.createElement('button');
    btn.setAttribute('slot', 'ar-button');
    btn.className = 'catch_model_viewer_ar_btn';
    btn.textContent = 'View in AR';
    el.appendChild(btn);
    container.appendChild(el);
    return () => { container.innerHTML = ''; };
  }, [modelViewer.open, modelViewer.glb, modelViewer.poster]);

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
          <div ref={modelViewerRef} style={{ width: '100%', height: '280px', background: '#f0eeea' }} />
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
