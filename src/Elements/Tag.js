import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const colorObj = {
    default: {
        default: {
            font: '#409eff',
            bg: '#ecf5ff',
            border: '#d9ecff'
        },
        hover: {
            bg: '#409eff',
            color: '#fff'
        },
    },
    success: {
        default: {
            font: '#67c23a',
            bg: '#f0f9eb',
            border: '#e1f3d8'
        },
        hover: {
            bg: '#67c23a',
            color: '#fff'
        },
    },
    info: {
        default: {
            font: '#909399',
            bg: '#f4f4f5',
            border: '#e9e9eb'
        },
        hover: {
            bg: '#909399',
            color: '#fff'
        },
    },
    warning: {
        default: {
            font: '#e6a23c',
            bg: '#fdf6ec',
            border: '#faecd8'
        },
        hover: {
            bg: '#e6a23c',
            color: '#fff'
        },
    },
    danger: {
        default: {
            font: '#f56c6c',
            bg: '#fef0f0',
            border: '#fde2e2'
        },
        hover: {
            bg: '#f56c6c',
            color: '#fff'
        },
    },
}

const TAG_PADDING_VERTICAL = 8
const TAG_PADDING_HORIZONTAL = 10
const TAG_BORDER_RADIUS = 4
const TAG_CLOSE_ICON_WIDTH = 16
const TAG_CLOSE_ICON_MARGIN = 5

Tag.TAG_PADDING_VERTICAL = TAG_PADDING_VERTICAL
Tag.TAG_PADDING_HORIZONTAL = TAG_PADDING_HORIZONTAL
Tag.TAG_BORDER_RADIUS = TAG_BORDER_RADIUS
Tag.TAG_CLOSE_ICON_WIDTH = TAG_CLOSE_ICON_WIDTH
Tag.TAG_CLOSE_ICON_MARGIN = TAG_CLOSE_ICON_MARGIN

Tag.elName = 'tag'

inheritProto(Tag, Element)
export default function Tag(props) {
    Element.call(this)
    this.text = '标签'
    this.type = 'default'
    this.color = null
    this.closable = false
    this.closeIconEntered = false
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    const initDefaultAttrs = () => {
        this.ctx.save()
        this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
        const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
        this.ctx.restore()
        let closeIconWidth = 0
        if (this.closable) {
            closeIconWidth = Tag.TAG_CLOSE_ICON_WIDTH + Tag.TAG_CLOSE_ICON_MARGIN
        }
        this.width = wordWidth + Tag.TAG_PADDING_HORIZONTAL * 2 + closeIconWidth
        this.height = wordHeight + Tag.TAG_PADDING_VERTICAL * 2
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width, y: this.y + this.height }
        }
        if (this.closable) {
            this.area.closeIcon = {
                leftTop: { x: this.x + Tag.TAG_PADDING_HORIZONTAL + wordWidth + Tag.TAG_CLOSE_ICON_MARGIN, y: this.y + this.height / 2 - Tag.TAG_CLOSE_ICON_WIDTH / 2 },
                rightTop: { x: this.x + Tag.TAG_PADDING_HORIZONTAL + wordWidth + Tag.TAG_CLOSE_ICON_MARGIN + Tag.TAG_CLOSE_ICON_WIDTH, y: this.y + this.height / 2 - Tag.TAG_CLOSE_ICON_WIDTH / 2 },
                leftBottom: { x: this.x + Tag.TAG_PADDING_HORIZONTAL + wordWidth + Tag.TAG_CLOSE_ICON_MARGIN, y: this.y + this.height / 2 + Tag.TAG_CLOSE_ICON_WIDTH / 2 },
                rightBottom: { x: this.x + Tag.TAG_PADDING_HORIZONTAL + wordWidth + Tag.TAG_CLOSE_ICON_MARGIN + Tag.TAG_CLOSE_ICON_WIDTH, y: this.y + this.height / 2 + Tag.TAG_CLOSE_ICON_WIDTH / 2 }
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
                if (this.closeIconEntered || !this.closable) return
                if (offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y) {
                    this.mouseEntered = true
                    if (offsetX >= this.area.closeIcon.leftTop.x && offsetX <= this.area.closeIcon.rightTop.x && offsetY >= this.area.closeIcon.leftTop.y && offsetY <= this.area.closeIcon.leftBottom.y) {
                        this.closeIconEntered = true
                        this.cursor = 'pointer'
                    } else {
                        this.closeIconEntered = false
                        this.cursor = 'default'
                    }
                    this.render()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.closable) return
                if (!(offsetX >= this.area.closeIcon.leftTop.x && offsetX <= this.area.closeIcon.rightTop.x && offsetY >= this.area.closeIcon.leftTop.y && offsetY <= this.area.closeIcon.leftBottom.y)) {
                    this.closeIconEntered = false
                    this.cursor = 'default'
                    this.render()
                    if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                        this.mouseEntered = false
                    }
                }
            },
            click: () => {
                if (this.closeIconEntered) {
                    this.triggerEvent('close')
                } else {
                    if (this.mouseEntered) {
                        this.triggerEvent('change')
                    }
                }
            },
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.render = function(config) {
        this.initProps(config)
        initDefaultAttrs()
        if (this.ctx) {
            this.ctx.save()
            if (this.color) {
                colorObj[this.type].default.font = this.color
            }
            this.ctx.textBaseline = 'middle'
            this.ctx.clearRect(this.x, this.y, this.width, this.height)
            this.ctx.beginPath()
            this.ctx.lineWidth = 1
            this.ctx.lineJoin = 'round'
            this.ctx.strokeStyle = colorObj[this.type].default.border
            this.ctx.strokeRect(this.x, this.y, this.width, this.height)
            this.ctx.fillStyle = colorObj[this.type].default.bg
            this.ctx.fillRect(this.x, this.y, this.width, this.height)
            this.ctx.closePath()
            this.ctx.beginPath()
            this.ctx.fillStyle = colorObj[this.type].default.font
            this.ctx.fillText(this.text, this.x + Tag.TAG_PADDING_HORIZONTAL, this.y + this.height / 2)
            this.ctx.restore()
            const drawCloseIcon = () => {
                this.ctx.save()
                this.ctx.lineWidth = 1
                if (this.closeIconEntered) {
                    this.ctx.fillStyle = colorObj[this.type].hover.bg
                    this.ctx.arc(this.area.closeIcon.leftTop.x + Tag.TAG_CLOSE_ICON_WIDTH / 2, this.area.closeIcon.leftTop.y + Tag.TAG_CLOSE_ICON_WIDTH / 2, Tag.TAG_CLOSE_ICON_WIDTH / 2, 0, Math.PI * 2)
                    this.ctx.fill()
                    this.ctx.strokeStyle = colorObj[this.type].hover.color
                } else {
                    this.ctx.strokeStyle = colorObj[this.type].default.font
                }
                this.ctx.translate(this.area.closeIcon.leftTop.x + Tag.TAG_CLOSE_ICON_WIDTH / 2, this.area.closeIcon.leftTop.y + Tag.TAG_CLOSE_ICON_WIDTH / 2)
                this.ctx.rotate(Math.PI / 4)
                this.ctx.beginPath()
                this.ctx.moveTo(-Tag.TAG_CLOSE_ICON_WIDTH / 2 + 3, 0)
                this.ctx.lineTo(Tag.TAG_CLOSE_ICON_WIDTH / 2 - 3, 0)
                this.ctx.stroke()
                this.ctx.beginPath()
                this.ctx.moveTo(0, -Tag.TAG_CLOSE_ICON_WIDTH / 2 + 3)
                this.ctx.lineTo(0, Tag.TAG_CLOSE_ICON_WIDTH / 2 - 3)
                this.ctx.stroke()
                this.ctx.restore()
            }
            if (this.closable) {
                drawCloseIcon()
            }
        }
    }
    initEvents()
}