There are some helpfull decorators in this project for async class methods.
#Install
```shell
npm install --save async-decorators
```

#Import
```
import {memoize, serialize, isSkipError} from 'async-decorators';
```

#Memoize decorator   
has parameters `expireMs` and `cacheSize`   
usage:   
```javascript
class Action {
  @memoize({expireMs: K_EXPIRE_MS, cacheSize: 256})
  async query(p1, p2) {
    return await getDataAsync({p1, p2});
  }
}
```

See [example source](https://github.com/istarkov/async-decorators/blob/master/examples/memoize.js)   
```
npm run example_memoize
```
and [test source](https://github.com/istarkov/async-decorators/blob/master/__tests__/memoize.js)   
```
npm run test_memoize
```


#Serialize decorator
Serializes async method calls. (Make a new async call only if previous is completed)
If there are more than one pending async calls, skip all but the last.

usage:   
```javascript
class Action {
  @serialize()
  async query(p1, p2) {
    return await getDataAsync({p1, p2});
  }
}
```

See [example source](https://github.com/istarkov/async-decorators/blob/master/examples/serialize.js)   
```
npm run example_serialize
```

#Both decorator usage

```javascript
class Action {
  @serialize()
  @memoize({expireMs: K_EXPIRE_MS})
  async query(p1, p2) {
    return await getDataAsync({p1, p2});
  }
}
```

See [example source](https://github.com/istarkov/async-decorators/blob/master/examples/ser_memoize.js)   
```
npm run example_ser_memoize
```

