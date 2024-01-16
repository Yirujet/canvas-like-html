import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const SWITCH_WIDTH = 40
const SWITCH_HEIGHT = 20
const SWITCH_CIRCLE_R = 8
const SWITCH_TEXT_MARGIN = 10
const SWITCH_RADIUS = 10

Switch.SWITCH_WIDTH = SWITCH_WIDTH
Switch.SWITCH_HEIGHT = SWITCH_HEIGHT
Switch.SWITCH_CIRCLE_R = SWITCH_CIRCLE_R
Switch.SWITCH_TEXT_MARGIN = SWITCH_TEXT_MARGIN
Switch.SWITCH_RADIUS = SWITCH_RADIUS

Switch.elName = 'switch'

inheritProto(Switch, Element)
export default function Switch(props) {
    Element.call(this)
    this.value = false
    this.disabled = false
    this.activeText = ''
    this.inactiveText = ''
    this.activeValue = true
    this.inactiveValue = false
    this.activeColor = '#409EFF'
    this.inactiveColor = '#C0CCDA'
    this.inactiveWidth = 0
    this.inactiveHeight = 0
    this.activeWidth = 0
    this.activeHeight = 0
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
    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
    const initDefaultAttrs = () => {
        if (this.inactiveText) {
            const { width, height } = getTextMetricsOfPrecision(this.inactiveText, this.ctx)
            this.inactiveWidth = width
            this.inactiveHeight = height
        }
        if (this.activeText) {
            const { width, height } = getTextMetricsOfPrecision(this.activeText, this.ctx)
            this.activeWidth = width
            this.activeHeight = height
        }
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.inactiveWidth + this.activeWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN * 2, y: this.y },
            leftBottom: { x: this.x, y: this.y + Switch.SWITCH_HEIGHT },
            rightBottom: { x: this.x + this.inactiveWidth + this.activeWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN * 2, y: this.y + Switch.SWITCH_HEIGHT },
            inactive: {
                leftTop: { x: this.x, y: this.y },
                rightTop: { x: this.x + this.inactiveWidth, y: this.y },
                leftBottom: { x: this.x, y: this.y + Switch.SWITCH_HEIGHT },
                rightBottom: { x: this.x + this.inactiveWidth, y: this.y + Switch.SWITCH_HEIGHT },
                circle: { x: this.x + this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN + Switch.SWITCH_HEIGHT / 2, y: this.y + Switch.SWITCH_HEIGHT / 2 }
            },
            active: {
                leftTop: { x: this.x + this.inactiveWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN * 2, y: this.y },
                rightTop: { x: this.x + this.inactiveWidth + this.activeWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN * 2, y: this.y },
                leftBottom: { x: this.x + this.inactiveWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN * 2, y: this.y + Switch.SWITCH_HEIGHT },
                rightBottom: { x: this.x + this.inactiveWidth + this.activeWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN * 2, y: this.y + Switch.SWITCH_HEIGHT },
                circle: { x: this.x + this.inactiveWidth + Switch.SWITCH_WIDTH + Switch.SWITCH_TEXT_MARGIN - Switch.SWITCH_HEIGHT / 2, y: this.y + Switch.SWITCH_HEIGHT / 2 }
            },
            switch: {
                leftTop: { x: this.x + this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN, y: this.y },
                rightTop: { x: this.x + this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN + Switch.SWITCH_WIDTH, y: this.y },
                leftBottom: { x: this.x + this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN, y: this.y + Switch.SWITCH_HEIGHT },
                rightBottom: { x: this.x + this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN + Switch.SWITCH_WIDTH, y: this.y + Switch.SWITCH_HEIGHT }
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
            click: (e) => {
                if (!this.mouseEntered || this.disabled) return
                const { offsetX, offsetY } = e
                if (this.value === this.inactiveValue) {
                    this.value = this.activeValue
                } else {
                    this.value = this.inactiveValue
                }
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
        }
        initDefaultAttrs()
        this.ctx.clearRect(this.x, this.y, this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN * 2 + Switch.SWITCH_WIDTH + this.activeWidth, Switch.SWITCH_HEIGHT)
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.textBaseline = 'middle'
        if (this.disabled) {
            this.ctx.globalAlpha = 0.6
        }
        const drawInactiveText = () => {
            this.ctx.beginPath()
            if (this.value === this.inactiveValue) {
                this.ctx.fillStyle = this.activeColor
            } else {
                this.ctx.fillStyle = this.inactiveColor
            }
            this.ctx.fillText(
                this.inactiveText, 
                this.area.inactive.leftTop.x, 
                this.area.inactive.leftTop.y + Switch.SWITCH_HEIGHT / 2
            )
        }
        const drawActiveText = () => {
            this.ctx.beginPath()
            if (this.value === this.activeValue) {
                this.ctx.fillStyle = this.activeColor
            } else {
                this.ctx.fillStyle = this.inactiveColor
            }
            this.ctx.fillText(
                this.activeText,
                this.area.active.leftTop.x,
                this.area.active.leftTop.y + Switch.SWITCH_HEIGHT / 2
            )
        }
        const drawSwitch = () => {
            this.ctx.beginPath()
            if (this.value === this.activeValue) {
                this.ctx.fillStyle = this.activeColor
            } else {
                this.ctx.fillStyle = this.inactiveColor
            }
            this.ctx.roundRect(this.area.leftTop.x + this.inactiveWidth + Switch.SWITCH_TEXT_MARGIN, this.area.leftTop.y, Switch.SWITCH_WIDTH, Switch.SWITCH_HEIGHT, [Switch.SWITCH_RADIUS])
            this.ctx.fill()
            this.ctx.beginPath()
            this.ctx.fillStyle = '#fff'
            if (this.value === this.activeValue) {
                this.ctx.arc(this.area.active.circle.x, this.area.active.circle.y, Switch.SWITCH_CIRCLE_R, 0, Math.PI * 2)
            } else {
                this.ctx.arc(this.area.inactive.circle.x, this.area.inactive.circle.y, Switch.SWITCH_CIRCLE_R, 0, Math.PI * 2)
            }
            this.ctx.fill()
        }
        if (this.inactiveText) {
            drawInactiveText()
        }
        if (this.activeText) {
            drawActiveText()
        }
        drawSwitch()
        this.ctx.restore()
    }
    initEvents()
    initDefaultAttrs()
}