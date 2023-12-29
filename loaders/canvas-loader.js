const HTMLParser = require('./htmlparser')

module.exports = function(content, map, meta) {
    const nodeList = []
    HTMLParser(content, (function() {
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
    const root = {}
    const elList = []
    nodeList.forEach(node => createTree(root, node))

    console.log(root)

    if (root.children) {
        for (let item in root.children) {
            if (item.description === 'canvas') {
                for (let elName in root.children[item].children) {
                    const elProps = {}
                    for (let elAttrName in root.children[item].children[elName].attrs) {
                        let elAttrValue = root.children[item].children[elName].attrs[elAttrName]
                        if (elAttrName.startsWith(':')) {
                            try {
                                elProps[elAttrName.slice(1)] = (new Function(`return ${elAttrValue}`))()
                            } catch (e) {
                                console.error(e)
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
                            if (root.children[item].children[elName].content) {
                                elProps.text = root.children[item].children[elName].content
                            }
                            break
                        default:
                            break
                    }
                    elList.push(`h('${elName.description}', ${JSON.stringify(elProps)})`)
                }
            }
        }
    }
    const result = `
        import CanvasLikeHtml from './CanvasLikeHtml.js';
        document.body.onload = () => {
            new CanvasLikeHtml({
                render: h => [${elList}]
            }).mount(document.getElementById('canvas'))
        }
    `
    return result
}