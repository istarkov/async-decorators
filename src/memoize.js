
function hashCode_(str) {
  let hash = 0;
  let i;
  let chr;
  let len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function log2(val) {
  return Math.log(val) / Math.LN2;
}

function memoize_(options) {
  return fn => {
    const {cacheSizePower, expireMs, maxItemsPerHash, cacheSize} = Object.assign({cacheSizePower: 8, expireMs: 60 * 15 * 1000, maxItemsPerHash: 4}, options);

    const cacheSizePowerCalc = Math.round((cacheSize && cacheSize > 2) ? log2(cacheSize) : cacheSizePower);

    const cacheSizeCalc = Math.pow(2, cacheSizePowerCalc);
    const cache_ = new Array(cacheSizeCalc);
    const mask_ = cacheSizeCalc - 1;

    const peek = (hash, im) => {
      if (hash in cache_) {
        const hashArray = cache_[hash];
        const item = hashArray.find(v => v.im === im);
        if (item !== undefined) {
          const currDt = (new Date()).getTime();
          if (currDt - item.dt < expireMs) {
            return item;
          }

          const index = hashArray.indexOf(item);
          hashArray.splice(index, 1);
        }
      }
    };

    const put = (hash, im, result) => {
      if (!(hash in cache_)) cache_[hash] = [];
      const hashArray = cache_[hash];
      const currDt = (new Date()).getTime();

      let item = peek(hash, im);

      if (item !== undefined) {
        item.dt = currDt;
        item.result = result;
        // пересортировать
        cache_[hash] = hashArray.sortBy(v => v.dt);
      } else {
        item = {dt: currDt, im: im, result: result};

        if (hashArray.length >= maxItemsPerHash) {
          hashArray.shift(); // убрать самый старый элемент
        }
        hashArray.push(item);
      }
    };

    return (...args) => {
      const im = JSON.stringify(args);
      const hash = hashCode_(im.toString()) & mask_;

      const item = peek(hash, im);

      if (item !== undefined) { // есть в кеше вернем
        return new Promise((r) => r(item.result));
      }

      return fn.apply(null, args)
      .then(r => {
        put(hash, im, r);
        return r;
      });
    };
  };
}


export default function memoize(options) {
  return (target, key, descriptor) => {
    return {
      configurable: true,
      get() {
        let classMethod = (typeof descriptor.get !== 'function') ? descriptor.value : descriptor.get.call(this);
        if (typeof classMethod !== 'function') {
          throw new Error(`@autobind decorator can only be applied to methods not: ${typeof classMethod}`);
        }

        let classMethodBinded = classMethod.bind(this);

        let memoizedCallFn = memoize_(options)(classMethodBinded);

        Object.defineProperty(this, key, {
          value: memoizedCallFn,
          configurable: true,
          writable: true
        });

        return memoizedCallFn;
      }
    };
  };
}
