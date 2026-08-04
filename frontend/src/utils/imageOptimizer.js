/**
 * Optimizes image URLs to ensure maximum 1200px high-resolution rendering
 * on Retina / High-DPI mobile displays without downscaling.
 * @param {string} url - The raw image URL
 * @param {number} width - Target width in pixels (defaults to 1200 for full crispness)
 * @returns {string} - Full resolution image URL
 */
export const getOptimizedImageUrl = (url, width = 1200) => {
  if (!url || typeof url !== 'string') return '/images/hero_banner.webp';

  // 1. Cloudinary URLs
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/') && !url.includes('/upload/w_')) {
      return url.replace('/upload/', `/upload/w_${width},q_auto:good,f_auto/`);
    }
    return url;
  }

  // 2. Shopify / SohniPret CDN URLs
  if (url.includes('cdn.shopify.com') || url.includes('sohnipret.com')) {
    // Remove any downscaling thumbnail suffixes (_small, _medium, _400x, etc.)
    let cleanUrl = url.replace(/_(small|thumb|medium|large|100x100|200x200|400x400|600x600|800x800)\./gi, '.');
    // Ensure highest resolution width (1200px) is requested
    if (cleanUrl.includes('?v=')) {
      return cleanUrl.replace('?v=', `?width=${width}&v=`);
    }
    return cleanUrl.includes('?') ? `${cleanUrl}&width=${width}` : `${cleanUrl}?width=${width}`;
  }

  return url;
};

/**
 * Returns undefined so browser loads full 1200px master image without downscaling
 */
export const getImageSrcSet = () => {
  return undefined;
};
