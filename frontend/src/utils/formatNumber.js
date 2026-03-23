/**
 * Format large numbers with comma separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('en-US');
};

/**
 * Format large numbers in compact form (e.g., 1.2M, 5.3K)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumberCompact = (num) => {
  if (!num) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
