import parse from '../parse.mjs'
import { createAST, obj2Str } from '../utils.mjs'
import translate from '../translate.mjs'
import _ from 'lodash'

const handleForDirective = (elAttrValue, elProps, node, elName, data, methods, scriptObj, elList) => {
    const forDirectiveRegExp = /^(?<exp>\(\S+(?:,\s*\S+)?\)|\S+)\s+in(?<source>\s+\S+)$/
    const forExpIncludesIndexRegExp = /^\((?<loopItemName>\S+),\s*(?<loopIndexName>\S+)\)$/
    const forDirectiveMatch = elAttrValue.match(forDirectiveRegExp)
    const forExp = forDirectiveMatch.groups.exp.trim()
    let loopItemName, loopItemIndex
    if (forExpIncludesIndexRegExp.test(forExp)) {
        const forExpIncludesIndexMatch = forExp.match(forExpIncludesIndexRegExp)
        loopItemName = forExpIncludesIndexMatch.groups.loopItemName.trim()
        loopItemIndex = forExpIncludesIndexMatch.groups.loopIndexName.trim()
    } else {
        loopItemName = forExp
    }
    const forListSource = forDirectiveMatch.groups.source.trim()
    const elAttrs = Object.entries(node.children[elName].attrs)
        .filter(([attrName]) => attrName !== '*for')
        .map(([attrName, attrValue]) => `${attrName}="${attrValue}"`)
        .reduce((p, c) => `${p} ${c}`, '')
    const elChildren = node.children[elName].children
    let forSource = ''
    let forSourceList
    try {
        forSourceList = forListSource.split('.').reduce((p, c) => p[c], node.$$loopItem)
        forSource = forSourceList.map(() => `
            <${elName.description} ${elAttrs}>${node.children[elName].content}</${elName.description}>
        `).join('\n')
    } catch (e) {
        forSourceList = forListSource.split('.').reduce((p, c) => p[c], scriptObj.data)
        forSource = forSourceList.map(() => `
            <${elName.description} 
                ${elAttrs} 
                :$$for="${forListSource}" 
                $$for_exp="${elAttrValue}"
            >${node.children[elName].content}</${elName.description}>
        `).join('\n')
    }
    const nodeList = parse(forSource)
    const nodeRoot = createAST(nodeList)
    Reflect.ownKeys(nodeRoot.children).forEach((elName, i) => {
        if (node.$$loopItem) {
            if (!nodeRoot.children[elName].$$loopChain) {
                nodeRoot.children[elName].$$loopChain = []
                nodeRoot.children[elName].$$loopChain.push({
                    $$loopItem: node.$$loopItem,
                    $$loopIndex: node.$$loopIndex,
                    $$loopItemName: node.$$loopItemName,
                    $$loopIndexName: node.$$loopIndexName
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
        if (!nodeRoot.children[elName].$$loopChain) {
            nodeRoot.children[elName].$$loopChain = []
        }
        nodeRoot.children[elName].$$loopChain.push({
            $$loopItem: nodeRoot.children[elName].$$loopItem,
            $$loopIndex: nodeRoot.children[elName].$$loopIndex,
            $$loopItemName: nodeRoot.children[elName].$$loopItemName,
            $$loopIndexName: nodeRoot.children[elName].$$loopIndexName
        })
        if (elChildren) {
            nodeRoot.children[elName].children = _.cloneDeep(elChildren)
        }
    })
    elList.push(...translate(nodeRoot, data, methods, scriptObj))
}

export default handleForDirective