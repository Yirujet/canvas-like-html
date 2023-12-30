import Span from './Elements/Span.js'
import Button from './Elements/Button.js'
import Checkbox from './Elements/Checkbox.js'
import Link from './Elements/Link.js'
import Dropdown from './Elements/Dropdown.js'
import CanvasLikeHtml from './CanvasLikeHtml.js'

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

export const getEllipsisText = (text, limitWidth, fontSize) => {
    const { width: textWidth } = getTextMetrics(text, fontSize)
    if (textWidth <= limitWidth) {
        return text
    }
    const ellipsis = '...'
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

export function render(compName, compProps) {
    let comp = null
    if (typeof compName === 'object' && compName.render && typeof compName.render === 'function') {
        comp = compName.render.call(this, render.bind(this))
    } else {
        if (CanvasLikeHtml.elements.has(compName)) {
            const compConstructor = CanvasLikeHtml.elements.get(compName)
            comp = new compConstructor({
                fontSize: this.globalProps.fontSize,
                globalProps: this.globalProps,
                ...(compProps || {}),
                ctx: this.ctx,
                eventObserver: this.eventObserver
            })
        }
    }
    return comp
}