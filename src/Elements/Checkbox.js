import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const CHECKBOX_BOX_WIDTH = 14
const CHECKBOX_LABEL_MARGIN = 10

const colorObj = {
    default: {
        checkbox: {
            border: '#dcdfe6',
            bg: '#fff',
        },
        label: '#606266',
    },
    hover: {
        checkbox: {
            border: '#409eff',
            bg: '#fff'
        },
        label: '#606266',
    },
    disabled: {
        checkbox: {
            border: '#dcdfe6',
            bg: '#edf2fc',
            inner: '#c0c4cc'
        },
        label: '#c0c4cc',
    },
    checked: {
        checkbox: {
            border: '#409eff',
            bg: '#409eff',
            inner: '#fff'
        },
        label: '#409eff',
    },
    indeterminate: {
        checkbox: {
            border: '#409eff',
            bg: '#409eff',
            inner: '#fff'
        },
        label: '#409eff',
    }
}

Checkbox.CHECKBOX_BOX_WIDTH = CHECKBOX_BOX_WIDTH
Checkbox.CHECKBOX_LABEL_MARGIN = CHECKBOX_LABEL_MARGIN

Checkbox.elName = 'checkbox'

inheritProto(Checkbox, Element)
export default function Checkbox(props) {
    Element.call(this)
    this.boxMouseEntered = false
    this.labelMouseEntered = false
    this.text = ''
    this.fontSize = null
    this.checked = false
    this.disabled = false
    this.indeterminate = false
    this.value = ''
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    const initDefaultAttrs = () => {
        this.ctx.save()
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        } else {
            this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
        }
        const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
        this.ctx.restore()
        this.width = Checkbox.CHECKBOX_BOX_WIDTH + (this.text ? wordWidth + Checkbox.CHECKBOX_LABEL_MARGIN : 0)
        this.height = wordHeight
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width + Checkbox.CHECKBOX_LABEL_MARGIN, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width + Checkbox.CHECKBOX_LABEL_MARGIN, y: this.y + this.height },
            box: {
                leftTop: { x: this.x, y: this.y },
                rightTop: { x: this.x + Checkbox.CHECKBOX_BOX_WIDTH, y: this.y },
                leftBottom: { x: this.x, y: this.y + this.height },
                rightBottom: { x: this.x + Checkbox.CHECKBOX_BOX_WIDTH, y: this.y + this.height },
            },
            label: {
                leftTop: { x: this.x + Checkbox.CHECKBOX_BOX_WIDTH + Checkbox.CHECKBOX_LABEL_MARGIN, y: this.y + this.height / 2 },
                rightTop: { x: this.x + this.width, y: this.y + this.height / 2 },
                leftBottom: { x: this.x + Checkbox.CHECKBOX_BOX_WIDTH + Checkbox.CHECKBOX_LABEL_MARGIN, y: this.y + this.height },
                rightBottom: { x: this.x + this.width, y: this.y + this.height },
            }
        }
    }
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
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
                    this.cursor = this.disabled ? 'not-allowed' : 'pointer'
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
                    this.cursor = 'default'
                    this.render()
                }
            },
            click: () => {
                if (!this.mouseEntered) return
                this.checked = !this.checked
                this.triggerEvent('change', { value: this.value, checked: this.checked })
                this.render()
            }
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.render = function(config) {
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        this.initProps(config)
        initDefaultAttrs()
        this.ctx.save()
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        } else {
            this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
        }
        this.ctx.textBaseline = 'middle'
        const type = this.disabled 
            ? 'disabled' 
            : this.indeterminate
            ? 'indeterminate'
            : this.checked 
            ? 'checked' 
            : this.boxMouseEntered 
            ? 'hover' 
            : 'default'
        this.ctx.beginPath()
        this.ctx.fillStyle = colorObj[type].checkbox.bg
        this.ctx.fillRect(this.x, this.y, Checkbox.CHECKBOX_BOX_WIDTH, Checkbox.CHECKBOX_BOX_WIDTH)
        this.ctx.beginPath()
        this.ctx.globalCompositeOperation = 'souce-over'
        this.ctx.lineWidth = 1
        this.ctx.lineJoin = 'round'
        this.ctx.strokeStyle = colorObj[type].checkbox.border
        this.ctx.strokeRect(this.x, this.y, Checkbox.CHECKBOX_BOX_WIDTH, Checkbox.CHECKBOX_BOX_WIDTH)
        if (this.text) {
            this.ctx.fillStyle = colorObj[type].label
            this.ctx.fillText(this.text, this.area.label.leftTop.x, this.area.label.leftTop.y)
        }
        if (this.indeterminate) {
            this.ctx.beginPath()
            this.ctx.lineWidth = 1
            this.ctx.lineJoin = 'miter'
            this.ctx.strokeStyle = colorObj[type].checkbox.inner
            this.ctx.moveTo(this.x + 3, this.y + Checkbox.CHECKBOX_BOX_WIDTH / 2)
            this.ctx.lineTo(this.x + Checkbox.CHECKBOX_BOX_WIDTH - 3, this.y + Checkbox.CHECKBOX_BOX_WIDTH / 2)
            this.ctx.stroke()
        } else if (this.checked) {
            this.ctx.beginPath()
            this.ctx.lineWidth = 1
            this.ctx.lineJoin = 'miter'
            this.ctx.strokeStyle = colorObj[type].checkbox.inner
            this.ctx.moveTo(this.x + 3, this.y + Checkbox.CHECKBOX_BOX_WIDTH / 2)
            this.ctx.lineTo(this.x + 7, this.y + Checkbox.CHECKBOX_BOX_WIDTH / 2 + 3)
            this.ctx.moveTo(this.x + 7, this.y + Checkbox.CHECKBOX_BOX_WIDTH / 2 + 3)
            this.ctx.lineTo(this.area.box.rightTop.x - 3, this.y + 3)
            this.ctx.stroke()
        }
        this.ctx.restore()
    }
    initDefaultAttrs()
    initEvents()
}