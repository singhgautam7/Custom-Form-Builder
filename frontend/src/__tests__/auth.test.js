import { setTokens, getAccessToken, getRefreshToken, clearTokens } from '../../src/lib/auth'

describe('auth tokens', ()=>{
  beforeEach(()=>{
    localStorage.clear()
  })

  it('stores and retrieves tokens', ()=>{
    setTokens({ access: 'a1', refresh: 'r1' })
    expect(getAccessToken()).toBe('a1')
    expect(getRefreshToken()).toBe('r1')
  })

  it('clears tokens', ()=>{
    setTokens({ access: 'a2', refresh: 'r2' })
    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
