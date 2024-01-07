import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const colorObj = {
    default: {
        radio: {
            border: '#dcdfe6',
            bg: '#fff',
        },
        label: '#606266',
    },
    hover: {
        radio: {
            border: '#409eff',
            bg: '#fff'
        },
        label: '#606266',
    },
    disabled: {
        radio: {
            border: '#dcdfe6',
            bg: '#edf2fc',
            inner: '#c0c4cc'
        },
        label: '#c0c4cc',
    },
    checked: {
        radio: {
            border: '#409eff',
            bg: '#409eff',
            inner: '#fff'
        },
        label: '#409eff',
    }
}

const RADIO_BOX_WIDTH = 14
const RADIO_LABEL_MARGIN = 10

Radio.RADIO_BOX_WIDTH = RADIO_BOX_WIDTH
Radio.RADIO_LABEL_MARGIN = RADIO_LABEL_MARGIN

Radio.elName = 'radio'

inheritProto(Radio, Element)
export default function Radio(props) {
    Element.call(this)
    this.boxMouseEntered = false
    this.labelMouseEntered = false
    this.value = ''
    this.text = ''
    this.fontSize = null
    this.checked = false
    this.disabled = false
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
    this.ctx.save()
    if (this.fontSize) {
        this.ctx.font = `400 ${this.fontSize}px Helvetica`
    }
    this.ctx.restore()
    const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
    this.width = Radio.RADIO_BOX_WIDTH + (this.text ? wordWidth + Radio.RADIO_LABEL_MARGIN : 0)
    this.height = wordHeight
    const initDefaultAttrs = () => {
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width + Radio.RADIO_LABEL_MARGIN, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width + Radio.RADIO_LABEL_MARGIN, y: this.y + this.height },
            box: {
                leftTop: { x: this.x, y: this.y },
                rightTop: { x: this.x + Radio.RADIO_BOX_WIDTH, y: this.y },
                leftBottom: { x: this.x, y: this.y + this.height },
                rightBottom: { x: this.x + Radio.RADIO_BOX_WIDTH, y: this.y + this.height },
            },
            label: {
                leftTop: { x: this.x + Radio.RADIO_BOX_WIDTH + Radio.RADIO_LABEL_MARGIN, y: this.y + this.height / 2 },
                rightTop: { x: this.x + this.width, y: this.y + this.height / 2 },
                leftBottom: { x: this.x + Radio.RADIO_BOX_WIDTH + Radio.RADIO_LABEL_MARGIN, y: this.y + this.height },
                rightBottom: { x: this.x + this.width, y: this.y + this.height },
            }
        }
    }
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
        this.registerListenerFromOnProp(propsObj?.on)
        const defaultEventListeners = {
            mouseenter: e => {
                const { offsetX, offsetY } = e
                if (offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y) {
                    this.mouseEntered = true
                    if (offsetX >= this.area.box.leftTop.x && offsetX <= this.area.box.rightTop.x && offsetY >= this.area.box.leftTop.y && offsetY <= this.area.box.leftBottom.y) {
                        this.boxMouseEntered = true
                        this.labelMouseEntered = false
                    } else {
                        this.labelMouseEntered = true
                        this.boxMouseEntered = false
                    }
                    e.target.style.cursor = this.disabled ? 'not-allowed' : 'pointer'
                    this.render()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    this.boxMouseEntered = false
                    this.labelMouseEntered = false
                    e.target.style.cursor = 'default'
                    this.render()
                }
            },
            click: () => {
                if (!this.mouseEntered) return
                // this.checked = !this.checked
                this.checked = true
                this.triggerEvent('change', this.value)
                this.render()
            }
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.render = function(config) {
        if (config) {
            this.x = config.x || 0
            this.y = config.y || 0
            this.checked = config.checked || false
            this.registerListenerFromOnProp(config?.on)
        }
        const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
        this.width = Radio.RADIO_BOX_WIDTH + (this.text ? wordWidth + Radio.RADIO_LABEL_MARGIN : 0)
        this.height = wordHeight
        initDefaultAttrs()
        this.ctx.save()
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        }
        this.ctx.textBaseline = 'middle'
        const type = this.disabled 
            ? 'disabled'
            : this.checked 
            ? 'checked' 
            : this.boxMouseEntered 
            ? 'hover' 
            : 'default'
        this.ctx.clearRect(this.x - 1, this.y - 1, this.width + 1, this.height + 1)
        this.ctx.beginPath()
        this.ctx.strokeStyle = colorObj[type].radio.border
        this.ctx.lineWidth = 0.5
        this.ctx.arc(this.x + Radio.RADIO_BOX_WIDTH / 2, this.y + Radio.RADIO_BOX_WIDTH / 2, Radio.RADIO_BOX_WIDTH / 2, 0, Math.PI * 2)
        this.ctx.stroke()
        if (this.text) {
            this.ctx.fillStyle = colorObj[type].label
            this.ctx.fillText(this.text, this.area.label.leftTop.x, this.area.label.leftTop.y)
        }
        if (this.checked) {
            this.ctx.beginPath()
            this.ctx.fillStyle = colorObj[type].radio.bg
            this.ctx.arc(this.x + Radio.RADIO_BOX_WIDTH / 2, this.y + Radio.RADIO_BOX_WIDTH / 2, Radio.RADIO_BOX_WIDTH / 2, 0, Math.PI * 2)
            this.ctx.fill()
            this.ctx.beginPath()
            this.ctx.fillStyle = colorObj[type].radio.inner
            this.ctx.arc(this.x + Radio.RADIO_BOX_WIDTH / 2, this.y + Radio.RADIO_BOX_WIDTH / 2, 2, 0, Math.PI * 2)
            this.ctx.fill()
        }
        this.ctx.restore()
    }
    initEvents()
}