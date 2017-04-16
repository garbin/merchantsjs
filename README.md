# merchants for Node.js
merchants is a framework agnostic, multi-gateway payment processing library for node.js, like [Omnipay](https://github.com/thephpleague/omnipay) for php or [ActiveMerchant](http://activemerchant.org/) for ruby

## Gateways support currently

- [x] [Alipay](http://alipay.com)
- [x] [Stripe](http://stripe.com)
- [ ] more to come...

## Installation
```bash
npm i merchants
```
## Usage
### Initialize
```js
const { Merchants, gateways: { Stripe } } = require('merchants')
const merchants = new Merchants()
merchants.use(new Stripe({
  key: 'YOUR STRIPE KEY HERE'
}))
merchants.use(new Alipay({
  // ...alipay config here
}))
```
### Make a sync request & Grab the response
```js
const request = merchants.using('stripe').purchase({
  amount: 100
}, {
  currency: 'usd',
  // ...stripe charges create options here
})
const response = await request.send()
if (response.success) {
  // do some staff when success
  console.log(response.body)
}
```

### Make an async request & Grab the response
```js
const request = merchants.using('alipay').purchase({
  amount: 100
}, {
  currency: 'usd',
  // ...stripe charges create options here
})
const redirect = request.redirect()
// form koa
// ctx.body = redirect

```
