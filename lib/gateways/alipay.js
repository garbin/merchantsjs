const Gateway = require('../gateway')
const Request = require('../request')
const Response = require('../response')
const md5 = require('blueimp-md5')
const qs = require('qs')
const https = require('https')
const request = require('axios')
const fs = require('fs')
const _ = require('lodash')

module.exports = class Alipay extends Gateway {
  static get name () { return 'alipay' }
  constructor (config, ...args) {
    super(config, ...args)
    this.config = Object.assign({
      // 合作身份者ID，签约账号，以2088开头由16位纯数字组成的字符串，查看地址：https://b.alipay.com/order/pidAndKey.htm
      partner: '',
      // 收款支付宝账号，以2088开头由16位纯数字组成的字符串，一般情况下收款账号就是签约账号
      seller_id: '',
      // MD5密钥，安全检验码，由数字和字母组成的32位字符串，查看地址：https://b.alipay.com/order/pidAndKey.htm
      key: '',
      // 服务器异步通知页面路径  需http://格式的完整路径，不能加?id=123这类自定义参数，必须外网可以正常访问
      notify_url: '',
      // 页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，必须外网可以正常访问
      return_url: '',
      // 签名方式
      sign_type: 'MD5',
      // 字符编码格式 目前支持 gbk 或 utf-8
      input_charset: 'utf-8',
      // ca证书路径地址，用于curl中ssl校验
      // 请保证cacert.pem文件在当前文件夹目录中
      cacert: './cacert.pem',
      // 访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
      transport: 'http',
      // 支付类型 ，无需修改
      payment_type: 1,
      // 产品类型，无需修改
      service: 'create_direct_pay_by_user',
      // 防钓鱼时间戳  若要使用请调用类文件submit中的query_timestamp函数
      anti_phishing_key: '',
      // 客户端的IP地址 非局域网的外网IP地址，如：221.0.0.1
      exter_invoke_ip: ''
    }, config)
  }
  get gateway () {
    return 'https://mapi.alipay.com/gateway.do'
  }
  sign (params, options) {
    params = _.omit(params, ['sign', 'sign_type'])
    let paramsSigned = {}
    _.keys(params).sort().forEach(k => {
      paramsSigned[k] = params[k]
    })
    paramsSigned['sign'] = md5(qs.stringify(params), options.key)
    paramsSigned['sign_type'] = options.type
    return paramsSigned
  }
  async purchase (order, options) {
    const params = {
      service: this.config.service,
      partner: this.config.partner,
      seller_id: this.config.seller_id,
      payment_type: this.config.payment_type,
      notify_url: this.config.notify_url,
      return_url: this.config.return_url,
      anti_phishing_key: this.config.anti_phishing_key,
      exter_invoke_ip: this.config.exter_invoke_ip,
      out_trade_no: order.id,
      subject: order.title,
      total_fee: order.amount,
      body: '',
      _input_charset: this.config.input_charset
    }
    const signed = this.sign(params, {
      key: this.config.key,
      type: this.config.sign_type
    })
    return new Request('redirect', {
      body: {
        method: 'get',
        url: this.gateway,
        params: signed
      }
    })
  }
  async callback (response) {
    const queryUrl = {
      'https': 'https://mapi.alipay.com/gateway.do?service=notify_verify&',
      'http': 'http://notify.alipay.com/trade/notify_query.do?'
    }
    const signed = this.sign(response, {
      key: this.config.key,
      type: this.config.sign_type
    })
    if (signed.sign !== response.sign) {
      throw new Error('Sign doen not matchs')
    }
    const options = {}
    if (this.config.cacert) {
      options.httpsAgent = {
        httpsAgent: https.Agent({
          ca: fs.readFileSync(this.config.cacert)
        })
      }
    }
    const query = await request.get(`${queryUrl[this.config.transport]}?${qs.stringify({
      partner: this.config.partner,
      notify_id: response.notify_id
    })}`, options)
    if (query.data !== 'true') {
      throw new Error('notify is not sent by alipay')
    }
    return new Response(true, query)
  }
}
