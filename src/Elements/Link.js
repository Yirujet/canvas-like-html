import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const LINK_UNDERLINE_MARGIN = 1

const colorObj = {
    default: {
        default: {
            font: '#606266',
        },
        hover: {
            font: '#409eff',
        },
        disabled: {
            font: '#c0c4cc',
        }
    },
    primary: {
        default: {
            font: '#409eff',
        },
        hover: {
            font: '#66b1ff',
        },
        disabled: {
            font: '#a0cfff',
        }
    },
    success: {
        default: {
            font: '#67c23a',
        },
        hover: {
            font: '#85ce61',
        },
        disabled: {
            font: '#b3e19d',
        }
    },
    warning: {
        default: {
            font: '#e6a23c',
        },
        hover: {
            font: '#ebb563',
        },
        disabled: {
            font: '#f3d19e',
        }
    },
    danger: {
        default: {
            font: '#f56c6c',
        },
        hover: {
            font: '#f78989',
        },
        disabled: {
            font: '#fab6b6',
        }
    },
    info: {
        default: {
            font: '#909399',
        },
        hover: {
            font: '#a6a9ad',
        },
        disabled: {
            font: '#c8c9cc',
        }
    }
}

Link.LINK_UNDERLINE_MARGIN = LINK_UNDERLINE_MARGIN

Link.elName = 'link'

inheritProto(Link, Element)
export default function Link(props) {
    Element.call(this)
    this.text = '链接'
    this.type = 'default'
    this.underline = true
    this.fontSize = null
    this.disabled = false
    this.href = ''
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
    this.width = wordWidth
    this.height = wordHeight
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
        const defaultEventListeners = {
            mouseenter: e => {
                const { offsetX, offsetY } = e
                if (this.mouseEntered) return
                if (offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y) {
                    this.mouseEntered = true
                    this.cursor = this.disabled ? 'not-allowed' : 'pointer'
                    this.render()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    this.cursor = 'default'
                    this.render()
                }
            },
            click: () => {
                if (!this.mouseEntered) return
                if (this.href) {
                    window.open(this.href)
                }
            }
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.render = function(config) {
        this.initProps(config)
        this.ctx.save()
        this.ctx.clearRect(this.x, this.y, this.width + Link.LINK_UNDERLINE_MARGIN, this.height + Link.LINK_UNDERLINE_MARGIN)
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        } else {
            this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
        }
        const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
        this.width = wordWidth
        this.height = wordHeight
        initDefaultAttrs()
        const type = this.disabled ? 'disabled' : this.mouseEntered ? 'hover' : 'default'
        this.ctx.beginPath()
        this.ctx.textBaseline = 'middle'
        this.ctx.fillStyle = colorObj[this.type][type].font
        this.ctx.fillText(this.text, this.x, this.y + this.height / 2)
        if (this.underline && this.mouseEntered && !this.disabled) {
            this.ctx.lineWidth = 1
            this.ctx.strokeStyle = colorObj[this.type][type].font
            this.ctx.moveTo(this.x, this.y + this.height)
            this.ctx.lineTo(this.x + this.width, this.y + this.height)
            this.ctx.stroke()
        }
        this.ctx.restore()
    }
    initDefaultAttrs()
    initEvents()
}