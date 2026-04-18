export { pickHighest, pickLowest };

/**
 * Get top N highest values from an object
 */
const pickHighest = (obj, num = 1) => {
  if (num > Object.keys(obj).length) return false;
  
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, num)
    .reduce((result, [key, val]) => {
      result[key] = val;
      return result;
    }, {});
};

/**
 * Get top N lowest values from an object
 */
const pickLowest = (obj, num = 1) => {
  if (num > Object.keys(obj).length) return false;
  
  return Object.entries(obj)
    .sort(([, a], [, b]) => a - b)
    .slice(0, num)
    .reduce((result, [key, val]) => {
      result[key] = val;
      return result;
    }, {});
};
