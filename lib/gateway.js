module.exports = class Gateway {
  constructor (config) {
    this.config = config
  }
  async purchase (order, options = {}) {}
  async callback () { return true }
}
