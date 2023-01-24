// ZenBot by imyMuyang and contributors
// api
// 日志系统，时间生成，下载系统

const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const Time = {
  getTime: function () {
    // see https://zhuanlan.zhihu.com/p/450208567
    const date = new Date()
    const h =
      (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
    const m =
      (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
      ':'
    const s =
      date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    return h + m + s
  },
  getDate: function () {
    const date = new Date()
    const y = date.getFullYear() + '-'
    const m =
      (date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : date.getMonth() + 1) + '-'
    const d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    return y + m + d
  }
}
const Logger = {
  log: function (text) {
    // if (module.parent.children[2]) {
    //   console.log(module.parent.children[2].children)
    //   if ('id' in module.parent.children[2]) {
    //     console.log(module.parent.children[2].id)
    //   }
    // }
    console.log(`[${Time.getTime()}] [I] ${text}`)
  },
  warn: function (text) {
    console.warn(chalk.yellow(`[${Time.getTime()}] [W] ${text}`))
  },
  error: function (text) {
    console.error(chalk.red(`[${Time.getTime()}] [E] ${text}`))
  }
}
async function download(url, path) {
  const fs = require('fs')
  const axios = require('axios')
  const { data } = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })
  const writer = fs.createWriteStream(path)
  data.pipe(writer)
  data.on('end', () => {
    return 0
  })
}
function getBot(botName) {
  const bots = JSON.parse(
    fs.readFileSync(process.cwd() + '/config.json', 'utf-8')
  ).Bots
  for (let i = 0; i < bots.length; i++) {
    if (botName === bots[i].name) {
      return require(path.resolve(
        __dirname,
        './adapter/',
        bots[i].adapter + '.js'
      )).buildBot(botName)
    }
  }
  return {}
}

module.exports = { Time, Logger, download, getBot }

// download(encodeURI('https://xn--5us.gq/ZenPM/nbnhhsh-dev.js'), './plugin/nbnhhsh-dev.js')
