const Gateway = require('../gateway')
const Request = require('../request')
const Response = require('../response')
const stripe = require('stripe')

module.exports = class Stripe extends Gateway {
  static get name () { return 'stripe' }
  constructor (...args) {
    super(...args)
    this.stripe = stripe(this.config.key)
  }
  async purchase (order, options) {
    const customer = {}
    if (options.card) {
      const card = await this.stripe.tokens.create({ card: options.card })
      customer.source = card.id
    }
    customer.currency = options.currency || 'usd'
    const charge = Object.assign({
      amount: order.amount
    }, customer)
    const { stripe } = this
    return new Request('sync', {
      body: charge,
      async sync () {
        try {
          const body = await stripe.charges.create(charge)
          return new Response(true, body)
        } catch (e) {
          return new Response(false, e)
        }
      }
    })
  }
}
