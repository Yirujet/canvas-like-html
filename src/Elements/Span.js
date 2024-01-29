import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

Span.elName = 'span'

inheritProto(Span, Element)
export default function Span(props) {
    Element.call(this)
    this.text = '文本'
    this.color = null
    this.fontSize = null
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    const initDefaultAttrs = () => {
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        } else {
            this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
        }
        const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
        this.width = wordWidth
        this.height = wordHeight
    }
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
    }
    this.render = function(config) {
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        this.initProps(config)
        initDefaultAttrs()
        this.ctx.save()
        this.ctx.textBaseline = 'middle'
        if (this.color) {
            this.ctx.fillStyle = this.color
        }
        this.ctx.beginPath()
        this.ctx.fillText(this.text, this.x, this.y + this.height / 2)
        this.ctx.restore()
    }
    initDefaultAttrs()
    initEvents()
}