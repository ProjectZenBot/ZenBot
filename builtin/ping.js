const events = require('events')
const path = require('path')
const Bot = new events.EventEmitter()
const os = require('os')
const API = require('../api')

const info = {
  name: 'ZenBot 帮助'
}

module.exports = {
  Bot,
  info
}

const version = `系统环境：${os.platform()} ${os.release()}\n系统架构：${os.arch()}\n程序环境：${
  process.pkg ? 'PRO' : 'DEV'
}`

Bot.on('sub_type=connect', event => {
  for (
    let i = 0;
    i < require(path.resolve(process.cwd(), './config.json')).SuperAdmin.length;
    i++
  ) {
    const e = require(path.resolve(process.cwd(), './config.json')).SuperAdmin[
      i
    ]
    event.Bot.send_private_msg(
      e,
      `ZenBot 已经通过 WebSocket 连接上线。在用户接管之前，本账号收到的所有事件将由 ZenBot 及其插件处理。\n对本账号私聊 [ping] 可以快速获取 ZenBot 状态。\n${version}`
    )
  }
})

Bot.on('message=ping', event => {
  event.reply(
    `pong!\nZenBot 客户端时间：${API.Time.getDate()} ${API.Time.getTime()}\n${version}\n如果你能看见此内容，则说明 ZenBot 至少在目前是可以进行服务的。`
  )
})
