export const API_BASE = import.meta.env.VITE_API_BASE || 'https://zaidi123.pythonanywhere.com';

/**
 * Public base URL for AR model files (GLB/USDZ). Use your S3 bucket or CDN URL
 * so Scene Viewer and the AR app can fetch the model (they need a public URL with CORS).
 * Example: https://your-bucket.s3.me-central-1.amazonaws.com
 * If your API already returns full HTTPS URLs for ar_secondary, leave this empty.
 */
export const AR_ASSET_BASE = (import.meta.env.VITE_AR_ASSET_BASE || '').replace(/\/$/, '');
