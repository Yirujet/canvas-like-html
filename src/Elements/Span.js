import { getTextMetrics } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

inheritProto(Span, Element)
export default function Span(props) {
    Element.call(this)
    this.text = '文本'
    this.color = null
    this.fontSize = null
    const propsObj = props
    if (props) {
        for (let name in props) {
            if (name in this) {
                this[name] = props[name]
            }
        }
    }
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    const { width: wordWidth, height: wordHeight } = getTextMetrics(this.text, this.fontSize)
    this.width = wordWidth
    this.height = wordHeight
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
        this.registerListenerFromOnProp(propsObj?.on)
    }
    this.render = function(config) {
        if (config) {
            this.x = config.x || 0
            this.y = config.y || 0
        }
        this.ctx.save()
        if (this.color) {
            this.ctx.fillStyle = this.color
        }
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        }
        this.ctx.beginPath()
        this.ctx.fillText(this.text, this.x, this.y)
        this.ctx.restore()
    }
    initEvents()
}