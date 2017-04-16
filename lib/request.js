module.exports = class Request {
  constructor (type, options) {
    this.type = type
    this.options = options
  }
  get body () {
    return this.options.body
  }
  async send () {
    if (this.type !== 'sync') return false
    return await this.options.sync(this.options.body)
  }
  async redirect (form = true) {
    if (this.type !== 'redirect') return false
    const { url, method, body } = this.options
    const fields = Object.entries(body).map(
      ([name, value]) => (`<input type='hidden' name='${name}' value='${value}' />`)
    ).join('')
    return `<form url="${url}" method="${method}" id="__merchants_redirect_form__">\
            ${fields}\
            </form>\
            <script type="text/javascript">\
            document.getElementById('__merchants_redirect_form__').submit()
            </script>`
  }
}
