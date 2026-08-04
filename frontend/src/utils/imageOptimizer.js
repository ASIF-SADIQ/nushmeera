/**
 * Optimizes image URLs for High-DPI / Retina mobile displays (2x and 3x DPR).
 * Supports Cloudinary, Shopify CDN, and standard WebP images.
 * @param {string} url - The raw image URL
 * @param {number} width - Target width in pixels (defaults to 1000 for crisp Retina rendering)
 * @returns {string} - High-resolution optimized image URL
 */
export const getOptimizedImageUrl = (url, width = 1000) => {
  if (!url || typeof url !== 'string') return '/images/hero_banner.webp';

  // 1. Cloudinary URLs (injects dynamic w_1000, q_auto:good, f_auto)
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/') && !url.includes('/upload/w_')) {
      return url.replace('/upload/', `/upload/w_${width},q_auto:good,f_auto/`);
    }
    return url;
  }

  // 2. Shopify / SohniPret CDN URLs (removes downscaled thumbnail prefixes & enforces width)
  if (url.includes('cdn.shopify.com') || url.includes('sohnipret.com')) {
    // Remove low-res size suffixes if present
    let cleanUrl = url.replace(/_(small|thumb|medium|large|100x100|200x200|400x400|600x600)\./gi, '.');
    if (cleanUrl.includes('?v=')) {
      return cleanUrl.replace('?v=', `?width=${width}&v=`);
    }
    return cleanUrl.includes('?') ? `${cleanUrl}&width=${width}` : `${cleanUrl}?width=${width}`;
  }

  return url;
};

/**
 * Generates an HTML srcset string for responsive High-DPI displays
 * @param {string} url 
 * @returns {string} srcset string for 400w, 800w, 1200w
 */
export const getImageSrcSet = (url) => {
  if (!url || typeof url !== 'string' || (!url.includes('cloudinary') && !url.includes('shopify') && !url.includes('sohnipret'))) {
    return undefined;
  }

  const src400 = getOptimizedImageUrl(url, 400);
  const src800 = getOptimizedImageUrl(url, 800);
  const src1200 = getOptimizedImageUrl(url, 1200);

  return `${src400} 400w, ${src800} 800w, ${src1200} 1200w`;
};
