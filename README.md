There are some helpfull decorators in this project for async class methods.


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
#run as 
npm run example_memoize
```
and [test source](https://github.com/istarkov/async-decorators/blob/master/__tests__/memoize.js)   
```
#run as 
npm run example_memoize
```
