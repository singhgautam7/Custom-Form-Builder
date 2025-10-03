// Minimal test runner to avoid installing heavy test deps in this workspace.
;(async ()=>{
  const assert = require('assert')
  // Provide a minimal localStorage shim for Node test environment
  if(typeof global.localStorage === 'undefined'){
    global.localStorage = (function(){
      let store = {}
      return {
        getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null },
        setItem(k,v){ store[k] = String(v) },
        removeItem(k){ delete store[k] },
        clear(){ store = {} }
      }
    })()
  }

  const { setTokens, getAccessToken, getRefreshToken, clearTokens } = require('./src/lib/auth.test.cjs')

  try{
    console.log('Running minimal unit tests...')
    clearTokens()
    setTokens({ access: 'a1', refresh: 'r1' })
    assert.strictEqual(getAccessToken(), 'a1')
    assert.strictEqual(getRefreshToken(), 'r1')
    clearTokens()
    assert.strictEqual(getAccessToken(), null)
    assert.strictEqual(getRefreshToken(), null)
    console.log('All tests passed')
    process.exit(0)
  }catch(err){ console.error(err); process.exit(2) }
})()
