var LRU = require("lru-cache")
  , options = { max: 100
              , maxAge: 1000 * 60 }
  , cache = new LRU(options);
const axios = require('axios');

module.exports.get = (key) => {
  return new Promise(resolve => {
    const value = cache.get(key);
    resolve(value);
  });
}

module.exports.set = (key, value) => {
  return new Promise(resolve => {
    cache.set(key, value);
    resolve(true);
  })
}

module.exports.clear = () => {
  return new Promise(resolve => {
    cache.reset();
    resolve(true);
  })
}

module.exports.clearClientCache = () => {
  return new Promise(resolve => {
     axios.get('http://inspiredigital.herokuapp.com')
    .then(() => {
      console.log('Clear client cache');
      resolve(true);
    })
    .catch((e) => {
      console.log('Fail to clear client cache');
      resolve(true);
    });
  })
}