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
    success: {
        default: {
            font: '#fff',
            bg: '#67c23a',
            border: '#67c23a'
        },
        hover: {
            font: '#fff',
            bg: '#85ce61',
            border: '#85ce61'
        },
        clickdown: {
            font: '#fff',
            bg: '#5daf34',
            border: '#5daf34'
        },
        disabled: {
            font: '#fff',
            bg: '#b3e19d',
            border: '#b3e19d'
        }
    },
    info: {
        default: {
            font: '#fff',
            bg: '#909399',
            border: '#909399'
        },
        hover: {
            font: '#fff',
            bg: '#a6a9ad',
            border: '#a6a9ad'
        },
        clickdown: {
            font: '#fff',
            bg: '#82848a',
            border: '#82848a'
        },
        disabled: {
            font: '#fff',
            bg: '#c8c9cc',
            border: '#c8c9cc'
        }
    },
    warning: {
        default: {
            font: '#fff',
            bg: '#e6a23c',
            border: '#e6a23c'
        },
        hover: {
            font: '#fff',
            bg: '#ebb563',
            border: '#ebb563'
        },
        clickdown: {
            font: '#fff',
            bg: '#cf9236',
            border: '#cf9236'
        },
        disabled: {
            font: '#fff',
            bg: '#f3d19e',
            border: '#f3d19e'
        }
    },
    danger: {
        default: {
            font: '#fff',
            bg: '#f56c6c',
            border: '#f56c6c'
        },
        hover: {
            font: '#fff',
            bg: '#f78989',
            border: '#f78989'
        },
        clickdown: {
            font: '#fff',
            bg: '#dd6161',
            border: '#dd6161'
        },
        disabled: {
            font: '#fff',
            bg: '#fab6b6',
            border: '#fab6b6'
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

const plainColorObj = {
    default: {
        default: {
            font: '#606266',
            bg: '#fff',
            border: '#dcdfe6'
        },
        hover: {
            font: '#409eff',
            bg: '#fff',
            border: '#409eff'
        },
        clickdown: {
            font: '#3a8ee6',
            bg: '#fff',
            border: '#3a8ee6'
        },
        disabled: {
            font: '#c0c4cc',
            bg: '#fff',
            border: '#ebeef5'
        }
    },
    primary: {
        default: {
            font: '#409eff',
            bg: '#ecf5ff',
            border: '#b3d8ff'
        },
        hover: {
            font: '#fff',
            bg: '#409eff',
            border: '#409eff'
        },
        clickdown: {
            font: '#fff',
            bg: '#3a8ee6',
            border: '#3a8ee6'
        },
        disabled: {
            font: '#8cc5ff',
            bg: '#ecf5ff',
            border: '#d9ecff'
        }
    },
    success: {
        default: {
            font: '#67c23a',
            bg: '#f0f9eb',
            border: '#c2e7b0'
        },
        hover: {
            font: '#fff',
            bg: '#67c23a',
            border: '#67c23a'
        },
        clickdown: {
            font: '#fff',
            bg: '#5daf34',
            border: '#5daf34'
        },
        disabled: {
            font: '#a4da89',
            bg: '#f0f9eb',
            border: '#e1f3d8'
        }
    },
    info: {
        default: {
            font: '#909399',
            bg: '#f4f4f5',
            border: '#d3d4d6'
        },
        hover: {
            font: '#fff',
            bg: '#909399',
            border: '#909399'
        },
        clickdown: {
            font: '#fff',
            bg: '#82848a',
            border: '#82848a'
        },
        disabled: {
            font: '#bcbec2',
            bg: '#f4f4f5',
            border: '#e9e9eb'
        }
    },
    warning: {
        default: {
            font: '#e6a23c',
            bg: '#fdf6ec',
            border: '#f5dab1'
        },
        hover: {
            font: '#fff',
            bg: '#e6a23c',
            border: '#e6a23c'
        },
        clickdown: {
            font: '#fff',
            bg: '#cf9236',
            border: '#cf9236'
        },
        disabled: {
            font: '#f0c78a',
            bg: '#fdf6ec',
            border: '#faecd8'
        }
    },
    danger: {
        default: {
            font: '#f56c6c',
            bg: '#fef0f0',
            border: '#fbc4c4'
        },
        hover: {
            font: '#fff',
            bg: '#f56c6c',
            border: '#f56c6c'
        },
        clickdown: {
            font: '#fff',
            bg: '#dd6161',
            border: '#dd6161'
        },
        disabled: {
            font: '#f9a7a7',
            bg: '#fef0f0',
            border: '#fde2e2'
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
    this.plain = false
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
                    if (this.circle) {
                        createCircleButton()
                    } else if (this.round) {
                        createRoundButton()
                    } else {
                        createDefaultButton()
                    }
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    e.target.style.cursor = 'default'
                    if (this.circle) {
                        createCircleButton()
                    } else if (this.round) {
                        createRoundButton()
                    } else {
                        createDefaultButton()
                    }
                }
            },
            mousedown: () => {
                if (this.mouseEntered && !this.disabled) {
                    this.clickDown = true
                    if (this.circle) {
                        createCircleButton()
                    } else if (this.round) {
                        createRoundButton()
                    } else {
                        createDefaultButton()
                    }
                }
            },
            mouseup: () => {
                if (this.mouseEntered && !this.disabled) {
                    this.clickDown = false
                    if (this.circle) {
                        createCircleButton()
                    } else if (this.round) {
                        createRoundButton()
                    } else {
                        createDefaultButton()
                    }
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
        let colorConfig = this.plain ? plainColorObj : colorObj
        const type = this.disabled ? 'disabled' : this.clickDown ? 'clickdown' : this.mouseEntered ? 'hover' : 'default'
        if (this.color) {
            colorConfig[this.type][type].font = this.color
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
            this.ctx.strokeStyle = colorConfig[this.type][type].border
            this.ctx.fillStyle = colorConfig[this.type][type].bg
            this.ctx.roundRect(this.x, this.y, this.width, this.height, [40])
            this.ctx.stroke()
            this.ctx.fill()
            this.ctx.closePath()
        }
        this.ctx.beginPath()
        this.ctx.fillStyle = colorConfig[this.type][type].font
        this.ctx.fillText(this.text, this.x + (this.type === 'text' ? 0 : Button.BUTTON_PADDING_HORIZONTAL), this.y + this.height / 2)
        this.ctx.restore()
    }
    const createDefaultButton = () => {
        let colorConfig = this.plain ? plainColorObj : colorObj
        const type = this.disabled ? 'disabled' : this.clickDown ? 'clickdown' : this.mouseEntered ? 'hover' : 'default'
        if (this.color) {
            colorConfig[this.type][type].font = this.color
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
            this.ctx.strokeStyle = colorConfig[this.type][type].border
            this.ctx.strokeRect(this.x, this.y, this.width, this.height)
            this.ctx.fillStyle = colorConfig[this.type][type].bg
            this.ctx.fillRect(this.x, this.y, this.width, this.height)
            this.ctx.closePath()
        }
        this.ctx.beginPath()
        this.ctx.fillStyle = colorConfig[this.type][type].font
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