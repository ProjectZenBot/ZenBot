// ZenBot by imyMuyang and contributors
// adapter-onebots11
// WebSocket 收，HTTP 发

const { select } = require('../lib/selector')

module.exports = { init, wsAction, httpAction, buildBot }
const Logger = require('../api').Logger
const log = Logger.log
const error = Logger.error

const APIData = {
  send_private_msg: ['user_id', 'message', 'auto_escape'],
  send_group_msg: ['group_id', 'message', 'auto_escape'],
  // 发送消息
  delete_msg: ['message_id'],
  get_msg: ['message_id'],
  get_group_info: ['group_id'],
  get_stranger_info: ['user_id'],
  set_group_kick: ['group_id', 'user_id', 'reject_add_request'],
  set_group_ban: ['group_id', 'user_id', 'duration'],
  set_group_anonymous_ban: ['group_id', 'anonymous', 'flag', 'duration'],
  set_group_whole_ban: ['group_id', 'enable']
}

function bind(name) {
  // const arg = arguments;
  function e() {
    const bots = require('../config').Bots
    const newArg = [...arguments]
    for (let i = 0; i < newArg[2].length; i++) {
      newArg.push(newArg[2][i])
    }
    newArg.splice(2, 1)
    for (let i = 0; i < bots.length; i++) {
      if (bots[i].name === name) {
        if ('API' in bots[i].config) {
          return httpAction.apply(null, newArg)
        } else {
          wsAction.apply(null, newArg)
        }
      }
    }
  }
  // return e(arg);
  return e.apply(null, arguments)
}

const Bot = {
  botName: '',
  adapter: 'onebots v11',
  platform: 'QQ',
  send_private_msg: function () {
    return bind(this.botName, 'send_private_msg', arguments)
  },
  send_group_msg: function () {
    return bind(this.botName, 'send_group_msg', arguments)
  },
  delete_msg: function () {
    return bind(this.botName, 'delete_msg', arguments)
  },
  get_msg: function () {
    return bind(this.botName, 'get_msg', arguments)
  },
  get_group_info: function () {
    return bind(this.botName, 'get_group_info', arguments)
  },
  get_stranger_info: function () {
    return bind(this.botName, 'get_stranger_info', arguments)
  },
  set_group_kick: function () {
    return bind(this.botName, 'set_group_kick', arguments)
  },
  set_group_ban: function () {
    return bind(this.botName, 'set_group_ban', arguments)
  },
  set_group_anonymous_ban: function () {
    return bind(this.botName, 'set_group_anonymous_ban', arguments)
  },
  set_group_whole_ban: function () {
    return bind(this.botName, 'set_group_whole_ban', arguments)
  }
}

function init(config) {
  // 检测机器人的接收方式，并自动进行判断
  Logger.warn('onebots 不支持某些 API，可能导致部分插件无法使用。推荐使用 go-cqhttp 适配器。')
  const data = config.config
  if ('ws' in data) {
    log('[onebots v11 适配器] 检测到使用 WebSocket，将采取本方式接收事件')
    wsInit(data.ws, config.name)
  } else {
    error(`[onebots v11 适配器] ${config.name} 找不到任何接收方式，请参考文档进行配置`)
  }
}

function wsInit(address, botName) {
  const { WebSocket } = require('ws')
  log('[onebots v11 适配器] 开始连接 WebSocket 服务器')
  try {
    const ws = new WebSocket(address)
    ws.on('open', () => {
      log(`[onebots v11 适配器] 已连接到 ${address}`)
    })
    ws.on('message', message => {
      message = JSON.parse(message)
      // console.log(message)
      sendToPlugins(message, botName)
    })
  } catch (err) {
    error(
      '[onebots v11 适配器] 连接 WebSocket 服务器失败，请检查配置文件是否存在不合法内容'
    )
    process.exit(1)
  }
  process.on('uncaughtException', e => {
    if (e.message.startsWith('connect ECONNREFUSED')) {
      error(
        '[onebots v11 适配器] 连接 WebSocket 服务器失败，请检查网络连接或者配置文件中的地址是否正确'
      )
      process.exit(1)
    } else {
      error('[onebots v11 适配器] 出现错误')
      console.log(e)
      return 0
    }
    // process.exit(1);
  })
}

function wsAction(name, endPoint) {
  const bots = require('../config').Bots
  const param = {}
  for (let i = 0; i < APIData[endPoint].length; i++) {
    if (arguments[i + 2] !== undefined) {
      param[`${APIData[endPoint][i]}`] = arguments[i + 2]
    }
  }
  for (let i = 0; i < bots.length; i++) {
    if (bots[i].name === name) {
      const address = bots[i].config.ws
      const { WebSocket } = require('ws')
      const ws = new WebSocket(address)
      ws.on('open', () => {
        console.log(JSON.stringify({ action: endPoint, params: param }))
        ws.send(JSON.stringify({ action: endPoint, params: param }))
        ws.close()
      })
    }
  }
}

function httpAction(name, endPoint) {
  const axios = require('axios')
  const bots = require('../config').Bots
  const param = {}
  for (let i = 0; i < APIData[endPoint].length; i++) {
    if (arguments[i + 2] !== undefined) {
      param[`${APIData[endPoint][i]}`] = arguments[i + 2]
    }
  }
  // console.log(param)
  for (let i = 0; i < bots.length; i++) {
    if (bots[i].name === name) {
      const address = bots[i].config.API
      return axios
        .post(`${address}/${endPoint}`, param)
        .then(r => {
          sendResponse(name, endPoint, param, r.data)
          return r.data
        })
        .catch(error => {
          console.log(error)
        })
    }
  }
}

function sendResponse(name, endPoint, params, res) {
  // console.log(1)
  const event = {}
  event.type = 'meta'
  event.detail_type = 'response'
  event.sub_type = ''
  event.platform = 'onebots v11'
  event.Bot = Bot
  event.Bot.botName = name
  event.end_point = endPoint
  event.params = params
  event.res = res
  require('../lib/sender').send(event)
}

function sendToPlugins(event, botName) {
  const pre = event
  Bot.botName = botName
  pre.Bot = Bot
  if (select(event, ['#private']).length !== 0) {
    pre.reply = function (content) {
      return Bot.send_private_msg(pre.user_id, content)
    }
  }
  if (select(event, ['#group']).length !== 0) {
    pre.reply = function (content) {
      return Bot.send_group_msg(pre.group_id, content)
    }
  }
  // console.log(message);
  require('../lib/sender').send(pre)
}

function buildBot(botName) {
  Bot.botName = botName
  return Bot
}
