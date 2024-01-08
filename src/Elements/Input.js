import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const colorObj = {
    default: {
        font: '#606266',
        bg: '#fff',
        border: '#dcdfe6',
        placeholder: '#ccc4d6'
    },
    hover: {
        font: '#606266',
        bg: '#fff',
        border: '#c0c4cc',
        placeholder: '#ccc4d6'
    },
    clickdown: {
        font: '#606266',
        bg: '#fff',
        border: '#409eff',
        placeholder: '#ccc4d6'
    },
    disabled: {
        font: '#c0c4cc',
        bg: '#f5f7fa',
        border: '#e4e7ed',
        placeholder: '#cac4d5'
    }
}

const INPUT_TEXT_MARGIN = 15
Input.INPUT_TEXT_MARGIN = INPUT_TEXT_MARGIN

Input.elName = 'input'

inheritProto(Input, Element)
export default function Input(props) {
    Element.call(this)
    this.value = ''
    this.placeholder = '请输入内容'
    this.width = 180
    this.height = 40
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
                    this.render()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    e.target.style.cursor = 'default'
                    this.render()
                }
            },
            mousedown: () => {
                if (!this.mouseEntered) return
                this.clickDown = true
                this.render()
            },
            clickoutside: e => {
                const { offsetX, offsetY } = e
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.clickDown = false
                    this.render()
                }
            }
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.render = function(config) {
        if (config) {
            this.x = config.x || 0
            this.y = config.y || 0
        }
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        initDefaultAttrs()
        this.ctx.save()
        const type = this.disabled ? 'disabled' : this.clickDown ? 'clickdown' : this.mouseEntered ? 'hover' : 'default'
        this.ctx.beginPath()
        this.ctx.translate(-0.5, -0.5)
        this.ctx.lineWidth = 1
        this.ctx.textBaseline = 'middle'
        this.ctx.fillStyle = this.value ? colorObj[type].font : colorObj[type].placeholder
        this.ctx.fillText(this.value || this.placeholder, this.x + Input.INPUT_TEXT_MARGIN, this.y + this.height / 2)
        this.ctx.strokeStyle = colorObj[type].border
        this.ctx.roundRect(this.x, this.y, this.width, this.height, [4])
        this.ctx.stroke()
        this.ctx.restore()
    }
    initEvents()
}