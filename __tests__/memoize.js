import 'babel/polyfill';

import {memoize} from '../index.js';
import {sleep, getDataAsync, getSecondsFromStart} from './helpers.js';
import {expect} from 'chai';

class Action {
  constructor() {
    this.counter = 0;
  }

  async notMemoizedQuery(p1, p2) {
    return await getDataAsync(1000, {p1, p2, counter: this.counter++});
  }

  @memoize({expireMs: 2000})
  async memoizedQuery(p1, p2) {
    return await getDataAsync(1000, {p1, p2, counter: this.counter++});
  }

  resetCounter() {
    this.counter = 0;
  }
}

async function test(query) {
  const timeStart = (new Date()).getTime();
  const out = [];
  for (let i = 0; i !== 2; ++i) {
    const data = await query('1', {x: 10});
    out.push({data, time: getSecondsFromStart(timeStart)});
    // trace(data, timeStart);
  }
  return await out;
}

async function testExpire(query) {
  const timeStart = (new Date()).getTime();
  const out = [];
  for (let i = 0; i !== 2; ++i) {
    const data = await query('1', {x: 11});
    out.push({data, time: getSecondsFromStart(timeStart)});
    await sleep(2001);
  }
  return await out;
}

async function testAll() {
  const action = new Action();
  const notMemoizedQuery = action.notMemoizedQuery.bind(action);
  const memoizedQuery = action.memoizedQuery.bind(action);

  action.resetCounter();
  const testResult0 = await test(notMemoizedQuery);

  expect(testResult0).to.deep.equal([
    { data: { p1: '1', p2: {x: 10}, counter: 0 }, time: 1 },
    { data: { p1: '1', p2: {x: 10}, counter: 1 }, time: 2 }
  ]);

  // it must not call memoizedQuery second time
  action.resetCounter();
  const testResult1 = await test(memoizedQuery);
  expect(testResult1).to.deep.equal([
    {data: {p1: '1', p2: {x: 10}, counter: 0}, time: 1},
    {data: {p1: '1', p2: {x: 10}, counter: 0}, time: 1}
  ]);


  // it must call memoizedQuery second time if expireMs period ends
  action.resetCounter();
  const testResult2 = await testExpire(memoizedQuery);

  expect(testResult2).to.deep.equal([
    {data: {p1: '1', p2: {x: 11}, counter: 0}, time: 1},
    {data: {p1: '1', p2: {x: 11}, counter: 1}, time: 4}
  ]);
}

testAll()
.then(() => console.log('OK memoize')) // eslint-disable-line no-console
.catch(e => console.error(e, e.stack)); // eslint-disable-line no-console
