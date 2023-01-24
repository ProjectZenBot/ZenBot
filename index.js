// ZenBot by imyMuyang and contributors
// index
// 配置检查，环境检查，发起机器人登录请求，插件检查

const Logger = require('./api').Logger
const log = Logger.log
const warn = Logger.warn
const error = Logger.error
const fs = require('fs')
const path = require('path')

// welcome message
log('ZenBot [ALPHA] 由 Node.JS 强力驱动')

if (!fs.existsSync(process.cwd() + '/config.json')) {
  error('配置文件缺失，已自动生成，请检查并填写配置')
  fs.writeFileSync(process.cwd() + '/config.json', '{"Bots":[{"name":"YOUR-BOT","adapter":"GOCQ","config":{"ws":"ws://127.0.0.1:8080","API":"http://127.0.0.1:5701"}}],"env":"PRO"}')
  process.exit(1)
}
const conf = JSON.parse(fs.readFileSync(process.cwd() + '/config.json', 'utf-8'))
if (!fs.existsSync(process.cwd() + '/config/')) {
  warn('插件配置文件夹缺失，已自动生成')
  fs.mkdirSync(process.cwd() + '/config/')
}

// 测试用
if (process.pkg) {
  log('ZenBot [PRO] 生产环境')
  warn('ZenBot 正在开发中，不适用于生产环境')
  conf.env = 'PRO'
  fs.writeFileSync(process.cwd() + '/config.json', JSON.stringify(conf))
} else {
  log('ZenBot [DEV] 开发环境')
  conf.env = 'DEV'
  fs.writeFileSync(process.cwd() + '/config.json', JSON.stringify(conf))
}
// 测试用结束

// load bots
log('开始加载机器人')
const bots = conf.Bots
log(`检测到 ${bots.length} 个机器人`)
// console.log(bots);
let successNum = 0
for (let i = 0; i < bots.length; i++) {
  log(`载入机器人 ${bots[i].name}`)
  try {
    require(path.resolve(__dirname, './adapter/', bots[i].adapter + '.js')).init(bots[i])
    successNum += 1
  } catch (er) {
    console.log(er)
    error(`加载 ${bots[i].name} 失败，请检查配置文件中的字段是否填写正确，或是否载入了对应的适配器`)
  }
  log(`载入机器人 ${bots[i].name} 完成`)
}
if (successNum < bots.length) {
  warn(`账户配置读取完成，成功发起了部分（${successNum} 个）机器人的登录请求`)
} else {
  log(`账户配置读取完成，成功发起了所有（${successNum} 个）机器人的登录请求`)
}

// 检查插件
if (!fs.existsSync(process.cwd() + '/plugin/')) {
  warn('未检测到插件目录，已自动生成')
  warn('ZenBot 需要搭配插件才能正常使用，详情参见文档')
  fs.mkdirSync(process.cwd() + '/plugin/')
}
