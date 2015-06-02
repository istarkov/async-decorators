import 'babel/polyfill';
import {memoize, serialize, isSkipError} from '../src/index.js';

const getDataAsync = (ms = 0, data = null) => new Promise(r => setTimeout(() => r(data), ms));
const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
const getSecondsFromStart = (timeStart) => Math.round(((new Date()).getTime() - timeStart) / 1000);

const K_EXPIRE_MS = 2000;

class Action {
  // set expiration period and cacheSize
  @serialize()
  @memoize({expireMs: K_EXPIRE_MS})
  async query(p1, p2) {
    console.log('query call');
    return await getDataAsync(1000, {p1, p2})
      .then(r => {
        console.log('done');
        return r;
      });
  }
}

function test() {
  const action = new Action();
  // it must be called
  action.query(1, 2)
    .then(() => console.log('done 1'))
    .catch(e => console.error('error 1', ' is skip: ', isSkipError(e), e));

  // it must be called after first call complete and gets memoized result
  action.query(1, 2)
    .then(() => console.log('done 2'))
    .catch(e => console.error('error 3', ' is skip: ', isSkipError(e), e));
}

test();

