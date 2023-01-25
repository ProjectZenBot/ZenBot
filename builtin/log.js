const events = require('events')
const Bot = new events.EventEmitter()
const Logger = require('../api').Logger

const info = {
  name: 'ZenBot 日志'
}

module.exports = {
  Bot,
  info
}

function beautySub(str) {
  const beautyStr = str.replace(/\n|\r/g, ' ')
  return beautyStr.substr(0, 50) + (beautyStr.length > 50 ? '...' : '')
}

Bot.on('#private', event => {
  Logger.log(
    `[${event.Bot.botName}] 收到好友 ${event.sender.nickname}(${
      event.user_id
    }) 的消息：${beautySub(event.raw_message)} (${event.message_id})`
  )
})

Bot.on('#group', event => {
  event.Bot.get_group_info(event.group_id).then(res => {
    Logger.log(
      `[${event.Bot.botName}] 收到群 ${res.data.group_name}(${
        res.data.group_id
      }) 内 ${event.sender.nickname}(${event.user_id}) 的消息：${beautySub(
        event.raw_message
      )} (${event.message_id})`
    )
  })
})

Bot.on('type=meta detail_type=response', event => {
  // console.log(event)
  if (event.end_point === 'send_private_msg') {
    event.Bot.get_stranger_info(event.params.user_id).then(res => {
      Logger.log(
        `[${event.Bot.botName}] 发送好友 ${res.data.nickname}(${
          event.params.user_id
        }) 的消息：${beautySub(event.params.message)} (${
          event.res.data.message_id
        })`
      )
    })
  } else if (event.end_point === 'send_group_msg') {
    event.Bot.get_group_info(event.params.group_id).then(res => {
      Logger.log(
        `[${event.Bot.botName}] 发送群 ${res.data.group_name}(${
          res.data.group_id
        }) 的消息：${beautySub(event.params.message)} (${
          event.res.data.message_id
        })`
      )
    })
  } else if (event.end_point === 'send_private_forward_msg') {
    event.Bot.get_stranger_info(event.params.user_id).then(res => {
      Logger.log(
        `[${event.Bot.botName}] 发送好友 ${res.data.nickname}(${event.params.user_id}) 一条自定义转发消息 (${event.res.data.message_id})`
      )
    })
  } else if (event.end_point === 'get_stranger_info') {
    return 0
  } else {
    Logger.log(
      `[${event.Bot.botName}] 执行了一条终结点为 ${event.end_point} 的操作`
    )
  }
})
