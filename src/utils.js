import CanvasLikeHtml from './CanvasLikeHtml.js'

export const evalFn = exp => new Function(`return (${exp})`)

export const getTextMetrics = (text, fontSize) => {
    // const fontSize = this.options.canvas.fontSize
    const width = [].slice.call(text || '')
        .map(e => String(e).charCodeAt(0) > 255 ? fontSize : fontSize / 2)
        .reduce((p, c) => p + c, 0)
    const height = fontSize
    // 为了更好的性能，计算字符串宽度不使用canvas的measureText
    return { width, height }
}

export const getTextMetricsOfPrecision = (text, ctx) => {
    const textMetrics = ctx.measureText(text)
    const width = textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft
    const height = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent
    return { width, height }
}

export const getEllipsisText = (text, limitWidth, fontSize, ellipsis = '...') => {
    const { width: textWidth } = getTextMetrics(text, fontSize)
    if (textWidth <= limitWidth) {
        return text
    }
    let strRtn = text
    let i = 0
    let width = 0
    do {
        strRtn = text.slice(0, text.length - i) + ellipsis
        width = getTextMetrics(strRtn, fontSize).width
        i++
    } while (width > limitWidth)
    return strRtn
}

export const toLowerCase = target => String(target).toLocaleLowerCase()

export const toReactiveKey = (bindingProp, data) => {
    let bindDataProp = bindingProp
    if (bindingProp.includes('.')) {
        bindDataProp = bindingProp.slice(0, bindingProp.indexOf('.')) + '.value' + bindingProp.slice(bindingProp.indexOf('.'))
    } else {
        if (typeof data[bindingProp] === 'object') {
            bindDataProp = bindingProp + '.value'
        }
    }
    return bindDataProp
}

export const getVars = (exp, data) => {
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
    }).map(e => ({
        prop: e,
        reactiveProp: toReactiveKey(e, data)
    }))
}

export const getVarValues = (vars, scopeList, data) => {
    const varObj = {}
    //  query in loopChain
    if (scopeList && Array.isArray(scopeList)) {
        for (let i = scopeList.length - 1; i >= 0; i--) {
            const { $$loopItemName, $$loopIndexName, $$loopItem, $$loopIndex } = scopeList[i]
            vars.map(e => e.reactiveProp).filter(varName => typeof varObj[varName] === 'undefined').forEach(varName => {
                if (varName.includes('.')) {
                    const propChain = varName.split('.')
                    if (propChain[0] === $$loopItemName) {
                        varObj[varName] = propChain.reduce((p, c) => p[c], $$loopItem)
                    }
                } else {
                    if (varName === $$loopItemName) {
                        varObj[varName] = $$loopItem[$$loopItemName]
                    }
                    if (varName === $$loopIndexName) {
                        varObj[varName] = $$loopIndex[$$loopIndexName]
                    }
                }
            })
        }
    }
    //  query in script data
    vars.map(e => e.reactiveProp).filter(varName => typeof varObj[varName] === 'undefined').forEach(varName => {
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
    })
    return varObj
}

export const calcDynamicPropValue = (exp, scopeList, data) => {
    const name = exp.trim()
    const vars = getVars(name, data)
    const varsVal = getVarValues(vars, scopeList, data)
    let result = name
    try {
        for (let varName in varsVal) {
            let val = varsVal[varName]
            if (typeof val === 'string') {
                val = `"${val}"`
            } else if (typeof val === 'number') {
                val = parseFloat(val)
            } else {
                val = `"${JSON.stringify(val)}"`
            }
            const varItem = vars.find(item => item.reactiveProp === varName)
            result = result.replace(new RegExp(varItem.prop, 'g'), val)
        }
        result = (evalFn(result))()
    } catch (e) {
        result = data[name]
    }
    return result
}

export function render(compName, compProps) {
    let comp = null
    if (typeof compName === 'object' && compName.render && typeof compName.render === 'function') {
        comp = {
            data: compName.data,
            created: compName.created,
            mounted: compName.mounted,
            comps: compName.render.call(this, render.bind(this))
        }
    } else {
        if (CanvasLikeHtml.elements.has(compName)) {
            const compConstructor = CanvasLikeHtml.elements.get(compName)
            comp = new compConstructor({
                fontSize: this.globalProps.fontSize,
                globalProps: this.globalProps,
                $$props: compProps,
                ...(compProps || {}),
                root: this,
                parentElement: this,
                ctx: this.ctx,
                eventObserver: this.eventObserver
            })
        }
    }
    return comp
}