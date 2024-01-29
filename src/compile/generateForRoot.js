import parse from './parse.js'
import { createAST, obj2Str } from './utils.js'
import _ from 'lodash'

const generateForRoot = (forSourceList, node, loopItemName, loopItemIndex, elChildren, tagName, elAttrs, forListSource, for_key, for_exp, content) => {
    const forSource = forSourceList.map(() => `<${tagName} ${elAttrs} :$$for="${forListSource}" $$for_key="${for_key}" $$for_exp="${for_exp}">${content}</${tagName}>`).join('\n')
    const nodeList = parse(forSource)
    const nodeRoot = createAST(nodeList)
    Reflect.ownKeys(nodeRoot.children).forEach((elName, i) => {
        if (node.$$loopItem) {
            if (!nodeRoot.children[elName].$$loopChain) {
                nodeRoot.children[elName].$$loopChain = []
                nodeRoot.children[elName].$$loopChain.push({
                    $$loopSource: node.$$loopSource,
                    $$loopExp: node.$$loopExp,
                    $$loopItem: node.$$loopItem,
                    $$loopIndex: node.$$loopIndex,
                    $$loopItemName: node.$$loopItemName,
                    $$loopIndexName: node.$$loopIndexName,
                    $$loopItemChildTemplate: node.$$loopItemChildTemplate,
                    $$loopItemAttrs: node.$$loopItemAttrs,
                    $$loopItemContent: node.$$loopItemContent
                })
            }
        }
        nodeRoot.children[elName].$$loopItemName = loopItemName
        nodeRoot.children[elName].$$loopIndexName = loopItemIndex
        nodeRoot.children[elName].$$loopItem = {
            [loopItemName]: forSourceList[i]
        }
        nodeRoot.children[elName].$$loopIndex = {
            [loopItemIndex]: i
        }
        nodeRoot.children[elName].$$loopExp = for_exp
        nodeRoot.children[elName].$$loopSource = forListSource
        if (elChildren) {
            nodeRoot.children[elName].$$loopItemChildTemplate = obj2Str(elChildren)
        }
        nodeRoot.children[elName].$$loopItemAttrs = elAttrs
        nodeRoot.children[elName].$$loopItemContent = content
        if (!nodeRoot.children[elName].$$loopChain) {
            nodeRoot.children[elName].$$loopChain = []
        }
        nodeRoot.children[elName].$$loopChain.push({
            $$loopExp: nodeRoot.children[elName].$$loopExp,
            $$loopSource: nodeRoot.children[elName].$$loopSource,
            $$loopItem: nodeRoot.children[elName].$$loopItem,
            $$loopIndex: nodeRoot.children[elName].$$loopIndex,
            $$loopItemName: nodeRoot.children[elName].$$loopItemName,
            $$loopIndexName: nodeRoot.children[elName].$$loopIndexName,
            $$loopItemChildTemplate: nodeRoot.children[elName].$$loopItemChildTemplate,
            $$loopItemAttrs: nodeRoot.children[elName].$$loopItemAttrs,
            $$loopItemContent: nodeRoot.children[elName].$$loopItemContent,
        })
        if (elChildren) {
            nodeRoot.children[elName].children = _.cloneDeep(elChildren)
        }
    })
    return nodeRoot
}

export default generateForRoot