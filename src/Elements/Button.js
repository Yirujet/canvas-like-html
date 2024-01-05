import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const BUTTON_PADDING_VERTICAL = 12
const BUTTON_PADDING_HORIZONTAL = 20
const BUTTON_BORDER_RADIUS = 4
const BUTTON_CIRCLE_RADIUS = 20

const colorObj = {
    default: {
        default: {
            font: '#606266',
            bg: '#fff',
            border: '#dcdfe6'
        },
        hover: {
            font: '#409eff',
            bg: '#ecf5ff',
            border: '#c6e2ff'
        },
        clickdown: {
            font: '#409eff',
            bg: '#ecf5ff',
            border: '#409eff'
        },
        disabled: {
            font: '#c0c4cc',
            bg: '#fff',
            border: '#ebeef5'
        }
    },
    primary: {
        default: {
            font: '#fff',
            bg: '#409eff',
            border: '#409eff'
        },
        hover: {
            font: '#fff',
            bg: '#66b1ff',
            border: '#66b1ff'
        },
        clickdown: {
            font: '#fff',
            bg: '#3a8ee6',
            border: '#3a8ee6'
        },
        disabled: {
            font: '#fff',
            bg: '#a0cfff',
            border: '#a0cfff'
        }
    },
    text: {
        default: {
            font: '#409eff'
        },
        hover: {
            font: '#3e6c9b'
        },
        clickdown: {
            font: '#3a8ee6'
        },
        disabled: {
            font: '#c0c4cc'
        }
    }
}

Button.BUTTON_PADDING_VERTICAL = BUTTON_PADDING_VERTICAL
Button.BUTTON_PADDING_HORIZONTAL = BUTTON_PADDING_HORIZONTAL
Button.BUTTON_BORDER_RADIUS = BUTTON_BORDER_RADIUS
Button.BUTTON_CIRCLE_RADIUS = BUTTON_CIRCLE_RADIUS

Button.elName = 'button'

inheritProto(Button, Element)
export default function Button(props) {
    Element.call(this)
    this.text = '按钮'
    this.color = null
    this.fontSize = null
    this.type = 'default'
    this.circle = false
    this.round = false
    this.disabled = false
    this.clickDown = false
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
    this.ctx.save
    if (this.fontSize) {
        this.ctx.font = `400 ${this.fontSize}px Helvetica`
    }
    this.ctx.restore
    const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
    this.width = wordWidth + (this.type !== 'text' ? Button.BUTTON_PADDING_HORIZONTAL * 2 : 0)
    this.height = wordHeight + (this.type !== 'text' ? Button.BUTTON_PADDING_VERTICAL * 2 : 0)
    const initDefaultAttrs = () => {
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width, y: this.y + this.height }
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
                if (this.mouseEntered) return
                if (offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y) {
                    this.mouseEntered = true
                    e.target.style.cursor = this.disabled ? 'not-allowed' : 'pointer'
                    createDefaultButton()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    e.target.style.cursor = 'default'
                    createDefaultButton()
                }
            },
            mousedown: () => {
                if (this.mouseEntered && !this.disabled) {
                    this.clickDown = true
                    createDefaultButton()
                }
            },
            mouseup: () => {
                if (this.mouseEntered && !this.disabled) {
                    this.clickDown = false
                    createDefaultButton()
                }
            },
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    const createCircleButton = () => {
        this.ctx.beginPath()
        this.ctx.arc(
            this.x + Button.BUTTON_CIRCLE_RADIUS, 
            this.y + Button.BUTTON_CIRCLE_RADIUS,
            Button.BUTTON_CIRCLE_RADIUS,
            0, 
            Math.PI * 2
        )
        this.ctx.stroke()
        this.ctx.closePath()
    }
    const createRoundButton = () => {
        this.ctx.beginPath()
        this.ctx.moveTo(this.x + this.height / 2, this.y)
        this.ctx.lineTo(this.x + this.height / 2 + this.width, this.y)
        this.ctx.moveTo(this.x + this.height / 2, this.y + this.height)
        this.ctx.lineTo(this.x + this.height / 2 + this.width, this.y + this.height)
        this.ctx.arc(this.x + this.height / 2, this.y + this.height / 2, this.height / 2, Math.PI / 2, Math.PI * 3 / 2, true)
        this.ctx.arc(this.x + this.height + this.width, this.y + this.height / 2, this.height / 2, Math.PI / 2, Math.PI * 3 / 2)
        this.ctx.stroke()
        this.ctx.closePath()
    }
    const createDefaultButton = () => {
        const type = this.disabled ? 'disabled' : this.clickDown ? 'clickdown' : this.mouseEntered ? 'hover' : 'default'
        if (this.color) {
            colorObj[this.type][type].font = this.color
        }
        this.ctx.save()
        this.ctx.textBaseline = 'middle'
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        }
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        if (this.type !== 'text') {
            this.ctx.beginPath()
            this.ctx.lineWidth = 1
            this.ctx.lineJoin = 'round'
            this.ctx.strokeStyle = colorObj[this.type][type].border
            this.ctx.strokeRect(this.x, this.y, this.width, this.height)
            this.ctx.fillStyle = colorObj[this.type][type].bg
            this.ctx.fillRect(this.x, this.y, this.width, this.height)
            this.ctx.closePath()
        }
        this.ctx.beginPath()
        this.ctx.fillStyle = colorObj[this.type][type].font
        this.ctx.fillText(this.text, this.x + (this.type === 'text' ? 0 : Button.BUTTON_PADDING_HORIZONTAL), this.y + this.height / 2)
        this.ctx.restore()
    }
    this.render = function(config) {
        if (config) {
            this.x = config.x || 0
            this.y = config.y || 0
        }
        initDefaultAttrs()
        if (this.ctx) {
            this.ctx.save()
            if (this.circle) {
                createCircleButton()
            } else if (this.round) {
                createRoundButton()
            } else {
                createDefaultButton()
            }
            this.ctx.restore()
        }
    }
    initEvents()
}