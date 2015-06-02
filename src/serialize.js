const K_SKIP_ERROR = 'K_SKIP_ERROR';

const serialize_ = (promiseCaller, options) => {
  let isInRequest = false;
  let lastPromiseInvoke = null;
  let lastPromiseReject = null;
  const opts = options || {raiseSkipError: true};

  const callNext = () => {
    if (lastPromiseInvoke !== null) {
      isInRequest = true;
      lastPromiseInvoke();

      lastPromiseInvoke = null;
      lastPromiseReject = null;
    }
  };

  const wrapPromise = (promise) => {
    return promise
    .then(res => {
      isInRequest = false;
      callNext();
      return res;
    })
    .catch(e => {
      console.error(e, e.stack); // eslint-disable-line no-console
      isInRequest = false;
      callNext();
      throw e;
    });
  };


  return (...args) => {
    if (!isInRequest) {
      isInRequest = true;
      return wrapPromise(promiseCaller.apply(null, args));
    }

    if (lastPromiseReject !== null) {
      lastPromiseReject();
      lastPromiseInvoke = null;
      lastPromiseReject = null;
    }

    return new Promise((resolve, reject) => {
      lastPromiseInvoke = () => {
        wrapPromise(promiseCaller.apply(null, args))
        .then(res => resolve(res))
        .catch(e => reject(e));
      };

      lastPromiseReject = () => {
        if (opts.raiseSkipError) {
          reject(new Error(K_SKIP_ERROR));
        }
      };
    });
  };
};

export function isSkipError(e) {
  return e.message === K_SKIP_ERROR;
}


export default function serialize(options) {
  return (target, key, descriptor) => {
    return {
      configurable: true,
      get() {
        let classMethod = (typeof descriptor.get !== 'function') ? descriptor.value : descriptor.get.call(this);

        if (typeof classMethod !== 'function') {
          throw new Error(`@autobind decorator can only be applied to methods not: ${typeof classMethod}`);
        }

        let classMethodBinded = classMethod.bind(this);
        let serializedCallFn = serialize_(classMethodBinded, options);

        Object.defineProperty(this, key, {
          value: serializedCallFn,
          configurable: true,
          writable: true
        });

        return serializedCallFn;
      }
    };
  };
}
