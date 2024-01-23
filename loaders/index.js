const HTMLParser = require('./htmlparser')

const evalFn = exp => new Function(`return (${exp})`)

const isArrowFunction = fn => {
    const str = fn.toString()
    if (str.match(/{[\s\S]*}/)) {
        return str.replace(/{[\s\S]*}/, '').includes('=>')
    } else {
        return true
    }
}

const varRegExp = /[0-9a-zA-Z_$]+(\.[0-9a-zA-Z_$]+)*/g
const dynamicContent = /^{{\s*.+\s*}}$/
const forDirectiveRegExp = /^(?<exp>\(\S+(?:,\s*\S+)?\)|\S+)\s+in(?<source>\s+\S+)$/
const forExpIncludesIndexRegExp = /^\((?<loopItemName>\S+),\s*(?<loopIndexName>\S+)\)$/

const getVars = exp => {
    return exp.match(varRegExp).filter(e => !/^\d+$/.test(e))
}

const getVarValues = (vars, scopeList, data) => {
    const varObj = {}
    for (let i = scopeList.length - 1; i >= 0; i--) {
        const { $$loopItemName, $$loopIndexName, $$loopItem, $$loopIndex } = scopeList[i]
        vars.forEach(varName => {
            if (typeof varObj[varName] === 'undefined') {
                if (varName.includes('.')) {
                    const propChain = varName.split('.')
                    if (propChain[0] === $$loopItemName) {
                        varObj[varName] = propChain.reduce((p, c) => p[c], $$loopItem[$$loopItemName])
                    }
                } else {
                    if (varName === $$loopItemName) {
                        varObj[varName] = $$loopItem[$$loopItemName]
                    }
                    if (varName === $$loopIndexName) {
                        varObj[varName] = $$loopIndex[$$loopIndexName]
                    }
                }
            }
        })
    }
    vars.forEach(varName => {
        if (typeof varObj[varName] === 'undefined') {
            if (varName.includes('.')) {
                const propChain = varName.split('.')
                if (Object.keys(data).includes(propChain[0])) {
                    varObj[varName] = propChain.reduce((p, c) => p[c], data)
                }
            } else {
                if (Object.keys(data).includes(varName)) {
                    varObj[varName] = data[varName]
                }
            }
        }
    })
    return varObj
}

module.exports = function(source) {
    const nodeList = []
    HTMLParser(source, (function() {
        var obj = {}
        !['start', 'end', 'comment', 'chars'].forEach(x => {
            obj[x] = function (...args) {
                if (x !== 'chars' || !/^[\s\r\n\t]*$/g.test(args[0])) {
                    nodeList.push({ tagType: x, attrs: args })
                }
            }
        })
        return obj
    })())
    let nodeStruct = []

    const createTree = (tree, node) => {
        const { tagType } = node
        const curNode = nodeStruct.reduce((p, c) => p.children[c], tree)
        if (tagType === 'start') {
            const { attrs } = node
            const [ nodeName, nodeAttrs ] = attrs
            if (!curNode.children) {
                curNode.children = {}
            }
            const attrsObj = nodeAttrs.reduce((p, c) => ({ ...p, [c.name]: c.value }), {})
            let symbolName = Symbol(nodeName)
            curNode.children[symbolName] = {
                attrs: attrsObj
            }
            nodeStruct.push(symbolName)
        } else if (tagType === 'end') {
            const { attrs } = node
            const [ nodeName ] = attrs
            if (nodeName === nodeStruct[nodeStruct.length - 1].description) {
                nodeStruct.splice(nodeStruct.length - 1, 1)
            } else {
                console.error(`${ nodeStruct[nodeStruct.length - 1] }无闭合`)
            }
        } else if (tagType === 'chars') {
            const { attrs } = node
            const [ content ] = attrs
            curNode.content = content
        }
    }
    const obj2Str = target => {
        let str = ''
        let isAsync = false
        for (let item in target) {
            if (Object.prototype.toString.call(target[item]) === '[object Object]') {
                str += `${item}:{${obj2Str(target[item])}},`
            } else if (Array.isArray(target[item])) {
                if (item === '$$render_children') {
                    str += `${item}: h => [${target[item]}],`
                } else {
                    str += `${item}:${JSON.stringify(target[item])},`
                }
            } else if (typeof target[item] === 'function') {
                let fnBody, fnArgs
                if (isArrowFunction(target[item])) {
                    fnBody = target[item].toString().slice(target[item].toString().indexOf('>') + 1)
                    fnArgs = target[item].toString().replace(fnBody, '').replace('=>', '').trim()
                    if (fnArgs.startsWith('(') && fnArgs.endsWith(')')) {
                        fnArgs = fnArgs.slice(1,  -1)
                    }
                } else {
                    fnBody = target[item].toString().slice(target[item].toString().indexOf('{') + 1, target[item].toString().lastIndexOf('}'))
                    fnArgs = target[item].toString().replace(fnBody, '').trim()
                    isAsync = fnArgs.startsWith('async')
                    fnArgs = fnArgs.slice(fnArgs.indexOf('(') + 1, fnArgs.indexOf(')'))
                }
                str += `${item}:${isAsync ? 'async ' : ''}function(${fnArgs}) {${fnBody}},`
            } else if (['boolean', 'number'].includes(typeof target[item])) {
                str += `${item}:${target[item]},`
            } else {
                str += `${item}:"${target[item]}",`
            }
        }
        return str
    }
    const root = {}
    let elList = []
    nodeList.forEach(node => createTree(root, node))
    let scriptImport = ''
    let mountedFn = null
    let createdFn = null
    let data = {}
    if (root.children) {
        const rootNodeKeys = Reflect.ownKeys(root.children)
        const canvasNodeIndex = rootNodeKeys.findIndex(item => item.description === 'canvas')
        const scriptNodeIndex = rootNodeKeys.findIndex(item => item.description === 'script')
        const canvasNode = root.children[rootNodeKeys[canvasNodeIndex]]
        const scriptNode = root.children[rootNodeKeys[scriptNodeIndex]]
        const scriptContent = scriptNode.content.trim()
        let scriptObj
        let scriptObjStartText = 'export default'
        let scriptObjIndex = scriptContent.indexOf(scriptObjStartText)
        if (scriptContent.startsWith('import')) {
            scriptImport = scriptContent.slice(0, scriptObjIndex - 1)
        }
        if (!!~scriptObjIndex) {
            scriptObj = (evalFn(scriptContent.slice(scriptObjIndex + scriptObjStartText.length)))()
        } else {
            scriptObj = (evalFn(scriptContent.slice(scriptObjIndex)))()
        }
        if (scriptObj.created) {
            createdFn = scriptObj.created
        }
        if (scriptObj.mounted) {
            mountedFn = scriptObj.mounted
        }
        const handleDynamicProp = (elAttrName, elAttrValue, elProps, data, scriptObj, $$loopItem) => {
            const attrName = elAttrName.slice(1)
            if (!elProps.watchedProps) {
                elProps.watchedProps = []
            }
            try {
                elProps[attrName] = (evalFn(elAttrValue))()
            } catch (e) {
                try {
                    //  binding the prop of object
                    if (elAttrValue.includes('.')) {
                        const bindingChain = elAttrValue.split('.')
                        try {
                            const bindingValue = bindingChain.reduce((p, c) => p[c], $$loopItem)
                            elProps[attrName] = bindingValue
                        } catch (e) {
                            const bindingValue = bindingChain.reduce((p, c) => p[c], scriptObj.data)
                            elProps[attrName] = bindingValue
                            let attrObj
                            bindingChain.forEach((attr, i, arr) => {
                                if (i === 0) {
                                    if (!data[attr]) {
                                        data[attr] = {}
                                    }
                                    attrObj = data[attr]
                                } else if (i < arr.length - 1) {
                                    if (!attrObj[attr]) {
                                        attrObj[attr] = {}
                                    }
                                    attrObj = attrObj[attr]
                                } else {
                                    attrObj[attr] = bindingValue
                                }
                            })
                        }
                    } else {
                        try {
                            elProps[attrName] = $$loopItem[elAttrValue]
                        } catch (e) {
                            elProps[attrName] = scriptObj.data[elAttrValue]
                            data[elAttrValue] = scriptObj.data[elAttrValue]
                        }
                    }
                    elProps.watchedProps.push({
                        [attrName]: elAttrValue
                    })
                } catch (e) {
                    console.error(e)
                }
            }
        }
        const handleDynamicEvent = (elAttrName, elAttrValue, elProps, scriptObj) => {
            const eventName = elAttrName.slice(1)
            if (!elProps.on) {
                elProps.on = {}
            }
            let fn
            try {
                fn = evalFn(elAttrValue)()
                elProps.on[eventName] = fn
            } catch (e) {
                try {
                    fn = scriptObj.methods[elAttrValue]
                    elProps.on[eventName] = fn
                } catch (e) {
                    console.error(e)
                }
            }
        }
        const handleBuiltInDirective = (elAttrName, elAttrValue, node, elName, data, scriptObj, elList) => {
            const directiveName = elAttrName.slice(1)
            switch (directiveName) {
                case 'for':
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
                            <${elName.description} ${elAttrs}>${node.children[elName].content}</${elName.description}>
                        `).join('\n')
                    }
                    const nodeList = []
                    HTMLParser(forSource, (function() {
                        var obj = {}
                        !['start', 'end', 'comment', 'chars'].forEach(x => {
                            obj[x] = function (...args) {
                                if (x !== 'chars' || !/^[\s\r\n\t]*$/g.test(args[0])) {
                                    nodeList.push({ tagType: x, attrs: args })
                                }
                            }
                        })
                        return obj
                    })())
                    nodeStruct = []
                    const nodeRoot = {}
                    nodeList.forEach(node => createTree(nodeRoot, node))
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
                            nodeRoot.children[elName].children = elChildren
                        }
                    })
                    elList.push(...collectElement(nodeRoot))
                    break
                default:
                    break
            }
        }
        const collectElement = (node) => {
            let elList = []
            Reflect.ownKeys(node.children).forEach(elName => {
                const elProps = {}
                const attrsList = Object.keys(node.children[elName].attrs)
                attrsList.sort((e1, e2) => {
                    if (e1.startsWith('*')) {
                        return -1
                    } else {
                        return 0
                    }
                })
                for (let i = 0, l = attrsList.length; i < l; i++) {
                    let elAttrName = attrsList[i]
                    let elAttrValue = node.children[elName].attrs[elAttrName]
                    if (elAttrName.startsWith('*')) {
                        handleBuiltInDirective(elAttrName, elAttrValue, node, elName, data, scriptObj, elList)
                        if (elAttrName === '*for') {
                            break
                        }
                    } else if (elAttrName.startsWith(':')) {
                        handleDynamicProp(elAttrName, elAttrValue, elProps, data, scriptObj, node.children[elName].$$loopItem)
                    } else if (elAttrName.startsWith('@')) {
                        handleDynamicEvent(elAttrName, elAttrValue, elProps, scriptObj)
                    } else {
                        elProps[elAttrName] = elAttrValue
                    }
                }
                //  If the node attribute contains *for, the collection of this node will be skipped because all nodes will be created in the built-in for directive.
                if (!attrsList.includes('*for')) {
                    switch (elName.description) {
                        case 'button':
                        case 'checkbox':
                        case 'dropdown':
                        case 'link':
                        case 'span':
                        case 'radio':
                        case 'tag':
                            if (node.children[elName].content) {
                                const content = node.children[elName].content.trim()
                                if (dynamicContent.test(content)) {
                                    const name = node.children[elName].content.slice(2, -2).trim()
                                    const vars = getVars(name)
                                    const varsVal = getVarValues(vars, node.children[elName].$$loopChain, scriptObj.data)
                                    try {
                                        let result = name
                                        for (let varName in varsVal) {
                                            let val = varsVal[varName]
                                            if (typeof val === 'string') {
                                                val = `"${val}"`
                                            } else if (typeof val === 'number') {
                                                val = parseFloat(val)
                                            } else {
                                                val = `"${JSON.stringify(val)}"`
                                            }
                                            result = result.replace(new RegExp(varName, 'g'), val)
                                        }
                                        elProps.text = (evalFn(result))()
                                    } catch (e) {
                                        elProps.text = name.replace(name, scriptObj.data[name])
                                    }
                                } else {
                                    elProps.text = node.children[elName].content
                                }
                            }
                            break
                        case 'checkbox-group':
                        case 'radio-group':
                        case 'row':
                        case 'col':
                            if (node.children[elName].children && Reflect.ownKeys(node.children[elName].children).length > 0) {
                                elProps.$$render_children = collectElement(node.children[elName])
                            } else {
                                elProps.$$render_children = []
                            }
                            break
                        default:
                            break
                    }
                    elList.push(`h('${elName.description}', {${obj2Str(elProps)}})`)
                }
            })
            return elList
        }
        elList = collectElement(canvasNode)
    }
    const result = `
        ${ scriptImport }
        export default {
            ${obj2Str({data})}
            ${createdFn ? obj2Str({created: createdFn}) : ''}
            ${mountedFn ? obj2Str({mounted: mountedFn}) : ''}
            render: h => [${elList}]
        }
    `
    return result
}