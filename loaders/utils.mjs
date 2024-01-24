export const evalFn = exp => new Function(`return (${exp})`)

export const isArrowFunction = fn => {
    const str = fn.toString()
    if (str.match(/{[\s\S]*}/)) {
        return str.replace(/{[\s\S]*}/, '').includes('=>')
    } else {
        return true
    }
}

export const getVars = exp => {
    const varRegExp = /[0-9a-zA-Z_$]+(\.[0-9a-zA-Z_$]+)*/g
    const jsBuiltInObj = [
        'Array',
        'String',
        'Date',
        'Math',
        'Boolean',
        'Number',
        'RegExp',
        'Function',
        'Error',
        'window',
        'global'
    ]
    return exp.match(varRegExp).filter(e => {
        if (/^\d+$/.test(e)) {
            return false
        }
        if (e.includes('.') && (jsBuiltInObj.map(o => `${o}(`).some(o => e.startsWith(o))
            || jsBuiltInObj.map(o => `${o}.`).some(o => e.startsWith(o)))
        ) {
            return false
        }
        return true
    })
}

export const getVarValues = (vars, scopeList, data) => {
    const varObj = {}
    //  query in loopChain
    if (scopeList && Array.isArray(scopeList)) {
        for (let i = scopeList.length - 1; i >= 0; i--) {
            const { $$loopItemName, $$loopIndexName, $$loopItem, $$loopIndex } = scopeList[i]
            vars.filter(varName => typeof varObj[varName] === 'undefined').forEach(varName => {
                if (varName.includes('.')) {
                    const propChain = varName.split('.')
                    if (propChain[0] === $$loopItemName) {
                        varObj[varName] = {
                            fromLoop: true,
                            value: propChain.reduce((p, c) => p[c], $$loopItem)
                        }
                    }
                } else {
                    if (varName === $$loopItemName) {
                        varObj[varName] = {
                            fromLoop: true,
                            value: $$loopItem[$$loopItemName]
                        }
                    }
                    if (varName === $$loopIndexName) {
                        varObj[varName] = {
                            fromLoop: true,
                            value: $$loopIndex[$$loopIndexName]
                        }
                    }
                }
            })
        }
    }
    //  query in script data
    vars.filter(varName => typeof varObj[varName] === 'undefined').forEach(varName => {
        if (varName.includes('.')) {
            const propChain = varName.split('.')
            if (Object.keys(data).includes(propChain[0])) {
                varObj[varName] = {
                    fromScriptData: true,
                    value: propChain.reduce((p, c) => p[c], data)
                }
            }
        } else {
            if (Object.keys(data).includes(varName)) {
                varObj[varName] = {
                    fromScriptData: true,
                    value: data[varName]
                }
            }
        }
    })
    return varObj
}

export const calcDynamicTemplate = (exp, scopeList, data) => {
    const name = exp.trim()
    const vars = getVars(name)
    const varsVal = getVarValues(vars, scopeList, data)
    let result = name
    try {
        for (let varName in varsVal) {
            let val = varsVal[varName].value
            if (typeof val === 'string') {
                val = `"${val}"`
            } else if (typeof val === 'number') {
                val = parseFloat(val)
            } else {
                val = `"${JSON.stringify(val)}"`
            }
            result = result.replace(new RegExp(varName, 'g'), val)
        }
        result = (evalFn(result))()
    } catch (e) {
        result = data[name]
    }
    return result
}

export const obj2Str = target => {
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

export const createAST = nodes => {
    let nodeStruct = []
    const root = {}
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
    nodes.forEach(node => createTree(root, node))
    return root
}