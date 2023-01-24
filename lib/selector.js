const path = require('path')
const { Logger } = require('../api')
function select(message, selectors) {
  const rightSelector = []
  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]
    const selectorSplit = selector.split(' ') // 初步处理，分割为小块
    let success = 0
    const selectorSplitTagged = []
    // #region Tag判定
    const dict = require(path.resolve(__dirname, './ZenQueryDict.json')) // 加载词典
    for (let k = 0; k < selectorSplit.length; k++) {
      // 遍历初步处理的数组并还原 push 到新数组
      // 标签判定
      if (selectorSplit[k].startsWith('#')) {
        if (selectorSplit[k].substr(1) in dict) {
          // 词典存在的情况
          const tagSplit = dict[selectorSplit[k].substr(1)].split(' ') // 词典分割为小块
          for (let l = 0; l < tagSplit.length; l++) {
            // 词典小块遍历 push
            selectorSplitTagged.push(tagSplit[l])
          }
        } else {
          // 词典不存在，则 push 通配符
          Logger.warn(
            `[ZenQuery] 无法找到标签 ${selectorSplit[k]}，解析为通配符（忽略此标签）`
          )
          selectorSplitTagged.push('*')
        }
      } else {
        // 非词典选择器直接 push
        selectorSplitTagged.push(selectorSplit[k])
      }
      // console.log(selectorSplitTagged)
    }
    // #endregion
    for (let p = 0; p < selectorSplitTagged.length; p++) {
      let splitTwice = selectorSplitTagged[p]
      let bool = true
      // 全局通配符
      if (splitTwice === '*') {
        success += 1
        continue
      }
      // 逻辑非
      if (splitTwice.startsWith('!')) {
        bool = false
        splitTwice = splitTwice.substr(1)
      }
      // 相等
      if (splitTwice.includes('=')) {
        const split3Times = splitTwice.split('=')
        // console.log(findItemThroughZenQuery(message, split3Times[0]))
        if (
          findItemThroughZenQuery(message, split3Times[0]) === split3Times[1]
        ) {
          switch (bool) {
            case true:
              success += 1
              continue
            default:
              continue
          }
        }
      }
      // 包含
      if (splitTwice.includes('>')) {
        const split3Times = splitTwice.split('>')
        if (findItemThroughZenQuery(message, split3Times[0]) !== undefined) {
          if (
            findItemThroughZenQuery(message, split3Times[0]).includes(
              split3Times[1]
            )
          ) {
            switch (bool) {
              case true:
                success += 1
                continue
              default:
                continue
            }
          }
        } else {
          continue
        }
      }
      // 被包含
      if (splitTwice.includes('<')) {
        const split3Times = splitTwice.split('<')
        if (findItemThroughZenQuery(message, split3Times[0]) !== undefined) {
          if (
            split3Times[1].includes(
              findItemThroughZenQuery(message, split3Times[0])
            )
          ) {
            switch (bool) {
              case true:
                success += 1
                continue
              default:
                continue
            }
          }
        } else {
          continue
        }
      }
      // 存在
      if (findItemThroughZenQuery(message, splitTwice) !== undefined) {
        switch (bool) {
          case true:
            success += 1
            continue
          default:
            continue
        }
      }
      // 逻辑非 后处理
      if (bool === false) {
        success += 1
        continue
      }
      // if ((splitTwice === 'meta.response' || splitTwice === 'meta.r') && message.type === 'meta' && message.detail_type === 'response') {
      //   success += 1
      //   continue
      // }
      // if ((splitTwice === 'message.private' || splitTwice === 'm.p') && message.post_type === 'message' && message.message_type === 'private') {
      //   success += 1
      //   continue
      // }
      // if ((splitTwice === 'message.group' || splitTwice === 'm.g') && message.post_type === 'message' && message.message_type === 'group') {
      //   success += 1
      //   continue
      // }
      // if ((splitTwice === 'notice.group_increase' || splitTwice === 'n.gi') && message.post_type === 'notice' && message.notice_type === 'group_increase') {
      //   success += 1
      //   continue
      // }
      // if ((splitTwice === 'notice.group_decrease' || splitTwice === 'n.gd') && message.post_type === 'notice' && message.notice_type === 'group_decrease') {
      //   success += 1
      //   continue
      // }
    }
    // 推送事件
    if (success === selectorSplitTagged.length) {
      rightSelector.push(selector)
    }
  }
  return rightSelector
}

function findItemThroughZenQuery(object, zenquery) {
  let retObj = object
  const zqSplit = zenquery.split('.')
  // console.log(zqSplit)
  try {
    for (let i = 0; i < zqSplit.length; i++) {
      retObj = retObj[zqSplit[i]]
      // console.log(retObj)
    }
  } catch (error) {
    return null
  }
  return retObj
}

module.exports = { select }
