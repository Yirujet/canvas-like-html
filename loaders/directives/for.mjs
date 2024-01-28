import translate from '../translate.mjs'
import generateForRoot from '../generateForRoot.mjs'
import _ from 'lodash'
import { v4 as uuidV4 } from 'uuid'

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
    } catch (e) {
        forSourceList = forListSource.split('.').reduce((p, c) => p[c], scriptObj.data)
    }
    const forKey = uuidV4()
    const nodeRoot = generateForRoot(forSourceList, node, loopItemName, loopItemIndex, elChildren, elName.description, elAttrs, forListSource, forKey, elAttrValue, node.children[elName].content)
    elList.push(...translate(nodeRoot, data, methods, scriptObj))
}

export default handleForDirective