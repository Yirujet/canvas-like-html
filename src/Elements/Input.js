import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'
import { getTextMetricsOfPrecision, getEllipsisText } from '../utils.js'

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
const INPUT_CLEAR_ICON_WIDTH = 14
Input.INPUT_TEXT_MARGIN = INPUT_TEXT_MARGIN
Input.INPUT_CLEAR_ICON_WIDTH = INPUT_CLEAR_ICON_WIDTH

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
    this.inputDiv = null
    this.focused = false
    this.clearable = false
    this.hoverClearIcon = false
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
            rightBottom: { x: this.x + this.width, y: this.y + this.height },
            clearIcon: {
                x: this.x + this.width - Input.INPUT_TEXT_MARGIN - Input.INPUT_CLEAR_ICON_WIDTH,
                y: this.y + this.height / 2 - Input.INPUT_CLEAR_ICON_WIDTH / 2
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
                    if (offsetX >= this.area.clearIcon.x && offsetX <= this.area.clearIcon.x + Input.INPUT_CLEAR_ICON_WIDTH && offsetY >= this.area.clearIcon.y && offsetY <= this.area.clearIcon.y + Input.INPUT_CLEAR_ICON_WIDTH) {
                        this.hoverClearIcon = true
                    } else {
                        this.hoverClearIcon = false
                    }
                    e.target.style.cursor = this.disabled ? 'not-allowed' : 'pointer'
                    this.render()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered || this.focused) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    this.hoverClearIcon = false
                    e.target.style.cursor = 'default'
                    this.render()
                }
            },
            mousedown: () => {
                if (!this.mouseEntered || this.disabled) return
                this.clickDown = true
                this.render()
            },
            clickoutside: e => {
                if (this.disabled) return
                const { offsetX, offsetY } = e
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.clickDown = false
                    this.focused = false
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
        initDefaultAttrs()
        this.ctx.save()
        const inputPadding = 2
        const type = this.disabled ? 'disabled' : this.clickDown ? 'clickdown' : this.mouseEntered ? 'hover' : 'default'
        this.ctx.beginPath()
        this.ctx.translate(0.5, 0.5)
        this.ctx.clearRect(this.x, this.y, this.width + 1, this.height + 1)
        this.ctx.lineWidth = 1
        this.ctx.textBaseline = 'middle'
        if (type !== 'clickdown') {
            this.ctx.fillStyle = this.value ? colorObj[type].font : colorObj[type].placeholder
            const text = getEllipsisText(this.value || this.placeholder, this.width - 2 * Input.INPUT_TEXT_MARGIN, this.globalProps.fontSize, '')
            this.ctx.fillText(text, this.x + Input.INPUT_TEXT_MARGIN + inputPadding / 2, this.y + this.height / 2 + inputPadding / 2)
        }
        this.ctx.strokeStyle = colorObj[type].border
        this.ctx.roundRect(this.x, this.y, this.width, this.height, [4])
        this.ctx.stroke()
        this.ctx.restore()
        if (this.clearable && this.mouseEntered) {
            this.ctx.save()
            this.ctx.lineWidth = 1
            this.ctx.strokeStyle = this.hoverClearIcon ? colorObj.clickdown.border : colorObj.hover.border
            this.ctx.beginPath()
            this.ctx.arc(this.area.clearIcon.x + Input.INPUT_CLEAR_ICON_WIDTH / 2, this.area.clearIcon.y + Input.INPUT_CLEAR_ICON_WIDTH / 2, Input.INPUT_CLEAR_ICON_WIDTH / 2, 0, Math.PI * 2)
            this.ctx.stroke()
            this.ctx.translate(this.area.clearIcon.x + Input.INPUT_CLEAR_ICON_WIDTH / 2, this.area.clearIcon.y + Input.INPUT_CLEAR_ICON_WIDTH / 2)
            this.ctx.rotate(Math.PI / 4)
            this.ctx.beginPath()
            this.ctx.moveTo(-Input.INPUT_CLEAR_ICON_WIDTH / 2 + 3, 0)
            this.ctx.lineTo(Input.INPUT_CLEAR_ICON_WIDTH / 2 - 3, 0)
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.moveTo(0, -Input.INPUT_CLEAR_ICON_WIDTH / 2 + 3)
            this.ctx.lineTo(0, Input.INPUT_CLEAR_ICON_WIDTH / 2 - 3)
            this.ctx.stroke()
            this.ctx.restore()
        }
        const drawInputDiv = () => {
            if (this.clickDown) {
                const { x, y } = this.root.target.getBoundingClientRect()
                if (!document.head.querySelector('#canvas-like-html-input-div')) {
                    const styleEl = document.createElement('style')
                    styleEl.id = 'canvas-like-html-input-div'
                    styleEl.innerHTML = `
                        .canvas-like-html-input-div {
                            position: fixed;
                            padding: ${inputPadding}px;
                            margin: 0;
                            background-color: #fff;
                            color: ${colorObj.default.font};
                            font-size: ${this.globalProps.fontSize}px;
                            font-family: Helvetica;
                            border: none;
                            outline: none;
                            overflow: hidden;
                            white-space: nowrap;
                            z-index: 999;
                        }
                        .canvas-like-html-input-div:empty:before {
                            content: attr(placeholder);
                            color: ${colorObj[type].placeholder}
                        }
                        .canvas-like-html-input-div:focus:before {
                            content: none;
                        }
                    `
                    document.head.appendChild(styleEl)
                }
                if (!document.body.contains(this.inputDiv)) {
                    this.inputDiv = document.createElement('div')
                    this.inputDiv.setAttribute('contenteditable', 'true')
                    this.inputDiv.setAttribute('placeholder', this.placeholder)
                    this.inputDiv.className = 'canvas-like-html-input-div'
                    this.inputDiv.addEventListener('focus', () => {
                        this.clickDown = true
                        this.focused = true
                        this.render()
                    })
                    this.inputDiv.addEventListener('input', e => {
                        this.value = e.target.innerText
                        this.triggerEvent('input', this.value)
                    })
                    document.body.append(this.inputDiv)
                }
                const { height: wordHeight } = getTextMetricsOfPrecision('1', this.ctx)
                this.inputDiv.innerText = this.value
                this.inputDiv.style.width = `${ this.width - 2 * Input.INPUT_TEXT_MARGIN }px`
                this.inputDiv.style.height = `${ wordHeight }px`
                this.inputDiv.style.left = `${ this.x + x + Input.INPUT_TEXT_MARGIN }px`
                this.inputDiv.style.top = `${ this.y + (this.height - wordHeight) / 2 + y - inputPadding }px`
                if (!this.focused) {
                    setTimeout(() => {
                        this.inputDiv.focus()
                        this.focused = true
                    })
                }
            } else {
                if (document.body.contains(this.inputDiv)) {
                    document.body.removeChild(this.inputDiv)
                }
            }
        }
        drawInputDiv()
    }
    initEvents()
}