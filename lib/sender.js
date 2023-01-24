// 若插件的文件名以“-”开头，则插件不会被使用
const path = require('path')
function send(message) {
  const fs = require('fs')
  const select = require('./selector').select
  let plugin = ''
  for (
    let i = 0;
    i < fs.readdirSync(path.resolve(__dirname, '../builtin/')).length;
    i++
  ) {
    plugin = require(path.resolve(
      __dirname,
      '../builtin/' + fs.readdirSync(path.resolve(__dirname, '../builtin/'))[i]
    ))
    try {
      const pushets = select(message, plugin.Bot.eventNames())
      for (let i = 0; i < pushets.length; i++) {
        plugin.Bot.emit(pushets[i], message)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const pluginList = fs.readdirSync('./plugin')
  for (let i = 0; i < pluginList.length; i++) {
    if (pluginList[i].startsWith('-') === false) {
      if (pluginList[i].endsWith('.js')) {
        delete require.cache[
          require.resolve(
            path.resolve(process.cwd(), './plugin/' + pluginList[i])
          )
        ]
        plugin = require(path.resolve(
          process.cwd(),
          './plugin/' + pluginList[i]
        ))
      } else {
        delete require.cache[
          require.resolve(
            path.resolve(
              process.cwd(),
              './plugin/',
              pluginList[i],
              './index.js'
            )
          )
        ]
        plugin = require(path.resolve(
          process.cwd(),
          './plugin/',
          pluginList[i],
          './index.js'
        ))
      }
      try {
        const pushets = select(message, plugin.Bot.eventNames())
        for (let i = 0; i < pushets.length; i++) {
          plugin.Bot.emit(pushets[i], message)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}
module.exports = { send }
