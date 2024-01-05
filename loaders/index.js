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

module.exports = function(source) {
    console.log(this)
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
    const nodeStruct = []

    const createTree = (tree, node) => {
        const { tagType } = node
        const curNode = nodeStruct.reduce((p, c) => p.children[c], tree)
        if (tagType === 'start') {
            const { attrs } = node
            const [ nodeName, nodeAttrs ] = attrs
            if (!curNode.children) {
                curNode.children = {}
            }
            let symbolName = Symbol(nodeName)
            curNode.children[symbolName] = {
                attrs: nodeAttrs.reduce((p, c) => ({ ...p, [c.name]: c.value }), {})
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
        if (scriptContent.startsWith('import')) {
            scriptImport = scriptContent.slice(0, scriptContent.indexOf('{') - 1)
            scriptObj = (evalFn(scriptContent.slice(scriptContent.indexOf('{'))))()
        } else {
            scriptObj = (evalFn(scriptContent))()
        }
        if (scriptObj.created) {
            createdFn = scriptObj.created
        }
        if (scriptObj.mounted) {
            mountedFn = scriptObj.mounted
        }
        const collectCanvasElList = node => {
            let elList = []
            Reflect.ownKeys(node.children).forEach(elName => {
                const elProps = {}
                for (let elAttrName in node.children[elName].attrs) {
                    let elAttrValue = node.children[elName].attrs[elAttrName]
                    if (elAttrName.startsWith(':')) {
                        const attrName = elAttrName.slice(1)
                        if (!elProps.watchedProps) {
                            elProps.watchedProps = []
                        }
                        try {
                            elProps[attrName] = (evalFn(elAttrValue))()
                        } catch (e) {
                            try {
                                elProps[attrName] = scriptObj.data[elAttrValue]
                                elProps.watchedProps.push({
                                    [attrName]: elAttrValue
                                })
                                data[elAttrValue] = scriptObj.data[elAttrValue]
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    } else if (elAttrName.startsWith('@')) {
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
                    } else {
                        elProps[elAttrName] = elAttrValue
                    }
                }
                switch (elName.description) {
                    case 'button':
                    case 'checkbox':
                    case 'dropdown':
                    case 'link':
                    case 'span':
                    case 'radio':
                        if (node.children[elName].content) {
                            elProps.text = node.children[elName].content
                        }
                        break
                    case 'checkbox-group':
                    case 'radio-group':
                        if (node.children[elName].children) {
                            elProps.$$render_children = collectCanvasElList(node.children[elName])
                        }
                        break
                    default:
                        break
                }
                elList.push(`h('${elName.description}', {${obj2Str(elProps)}})`)
            })
            return elList
        }
        elList = collectCanvasElList(canvasNode)
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