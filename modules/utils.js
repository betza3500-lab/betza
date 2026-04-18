export { pickHighest, pickLowest};

const pickHighest = (obj, num = 1) => {
  const requiredObj = {};
  if(num > Object.keys(obj).length){
     return false;
  };
  Object.keys(obj).sort((a, b) => obj[b] - obj[a]).forEach((key, ind) =>
  {
     if(ind < num){
        requiredObj[key] = obj[key];
     }
  });
  return requiredObj;
};

const pickLowest = (obj, num = 1) => {
  const requiredObj = {};
  if(num > Object.keys(obj).length){
     return false;
  };
  Object.keys(obj).sort((a, b) => obj[a] - obj[b]).forEach((key, ind) =>
  {
     if(ind < num){
        requiredObj[key] = obj[key];
     }
  });
  return requiredObj;
};
