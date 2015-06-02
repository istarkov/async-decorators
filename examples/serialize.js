import 'babel/polyfill';
import {serialize, isSkipError} from '../index.js';

const getDataAsync = (ms = 0, data = null) => new Promise(r => setTimeout(() => r(data), ms));

class Action {
  // set raiseSkipError to false if you don't need SKIP_ERR
  @serialize({raiseSkipError: true})
  async query(p1, p2) {
    console.log('query call', p1);
    return await getDataAsync(1000, {p1, p2})
      .then(r => {
        console.log('done', p1);
        return r;
      });
  }
}

function test() {
  const action = new Action();
  // it must be called
  action.query(1, 2)
    .catch(e => console.error('error 1', ' is skip: ', isSkipError(e), e));

  // it must be rejected
  action.query(2, 2)
    .catch(e => console.error('error 2', ' is skip: ', isSkipError(e), e));

  // it must be called
  action.query(3, 2)
    .catch(e => console.error('error 3', ' is skip: ', isSkipError(e), e));
}

test();
