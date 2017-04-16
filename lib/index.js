const gateways = require('./gateways')
const Request = require('./request')
const Response = require('./response')
class Merchants {
  constructor () {
    this.gateways = {}
  }
  use (gateway) {
    this.gateways[gateway.constructor.name] = gateway
    return this
  }
  using (name) { return this.gateways[name] }
}
module.exports = {
  default: Merchants,
  Merchants,
  gateways,
  Request,
  Response
}
