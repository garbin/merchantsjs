const { describe, it, expect, jasmine, beforeEach } = global
const {Merchants, gateways: { Alipay, Stripe }, Request, Response} = require('../lib')
beforeEach(function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000
})
describe('Merchant', function () {
  it('merchant initialize', function () {
    const merchants = new Merchants()
    merchants.use(new Alipay({}))
    merchants.use(new Stripe({}))
    expect(merchants.gateways.alipay).toBeInstanceOf(Alipay)
    expect(merchants.gateways.stripe).toBeInstanceOf(Stripe)
  })
  it('merchant sync request', async function () {
    const order = {amount: 100}
    const merchants = new Merchants()
    merchants.use(new Stripe({key: 'sk_test_LPIE20HyBixCrxjCpwC9zLlI'}))
    const request = await merchants.using('stripe').purchase(order, {
      card: {
        'number': '4242424242424242',
        'exp_month': 12,
        'exp_year': 2017,
        'cvc': '123'
      }
    })
    expect(request).toBeInstanceOf(Request)
    expect(request.body).toBeInstanceOf(Object)
    const response = await request.send()
    expect(response).toBeInstanceOf(Response)
    expect(response.success).toBeDefined()
    expect(response.body).toBeInstanceOf(Object)
  })
  it('merchant async request', async function () {
    const order = {}
    const merchants = new Merchants()
    merchants.use(new Alipay({}))
    const request = await merchants.using('alipay').purchase(order)
    expect(request).toBeInstanceOf(Request)
    expect(request.type).toBe('redirect')
    expect(request.body.method).toBe('get')
    const redirect = await request.redirect()
    expect(typeof redirect === 'string').toBeTruthy()
  })
  it('merchant async callback', async function () {
    const merchants = new Merchants()
    merchants.use(new Alipay({}))
    let response
    try {
      response = await merchants.using('alipay').callback({})
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
    }
    expect(response).toBeUndefined()
  })
})
