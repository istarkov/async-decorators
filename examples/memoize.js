import 'babel/polyfill';
import {memoize} from '../src/index.js';

const getDataAsync = (ms = 0, data = null) => new Promise(r => setTimeout(() => r(data), ms));
const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
const getSecondsFromStart = (timeStart) => Math.round(((new Date()).getTime() - timeStart) / 1000);

const K_EXPIRE_MS = 2000;

class Action {
  // set expiration period and cacheSize
  @memoize({expireMs: K_EXPIRE_MS, cacheSize: 256})
  async query(p1, p2) {
    console.log('query call');
    return await getDataAsync(1000, {p1, p2});
  }
}

async function test() {
  const action = new Action();
  const timeStart = (new Date()).getTime();
  let data;

  data = await action.query('1', {x: 10});
  console.log(data, getSecondsFromStart(timeStart));

  // not call a action.query, but returns memoized result
  data = await action.query('1', {x: 10});
  console.log(data, getSecondsFromStart(timeStart));

  // call action.query because of parameter changed
  data = await action.query('1', {x: 11});
  console.log(data, getSecondsFromStart(timeStart));

  //
  await sleep(K_EXPIRE_MS + 1);

  // call action.query because of expiration period (expireMs)
  data = await action.query('1', {x: 11});
  console.log(data, getSecondsFromStart(timeStart));
}

test();
