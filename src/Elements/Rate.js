import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

Rate.elName = 'rate'

const RATE_R = 10
const RATE_ITEM_MARGIN = 8
const RATE_ACTIVE_COLOR = '#fadb14'
const RATE_INACTIVE_COLOR = 'rgba(0, 0, 0, 0.06)'

Rate.RATE_R = RATE_R
Rate.RATE_ITEM_MARGIN = RATE_ITEM_MARGIN
Rate.RATE_ACTIVE_COLOR = RATE_ACTIVE_COLOR
Rate.RATE_INACTIVE_COLOR = RATE_INACTIVE_COLOR

const rate_item_half_width = Rate.RATE_R * Math.cos((18 / 180) * Math.PI)

inheritProto(Rate, Element)
export default function Rate(props) {
    this.allowClear = true
    this.allowHalf = false
    this.count = 5
    this.disabled = false
    this.tooltips = null
    this.value = 0
    Element.call(this)
    let hoverRateHalfLeft = false
    let hoverRateHalfRight = false
    let hoverRate = false
    this.initProps(props)
    let drawValue = this.value
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    this.ctx.save()
    const initDefaultAttrs = () => {
        this.width = this.count * (rate_item_half_width * 2 + Rate.RATE_ITEM_MARGIN) - Rate.RATE_ITEM_MARGIN
        this.height = Rate.RATE_R + Rate.RATE_R * Math.cos((36 / 180) * Math.PI)
        if (this.tooltips !== null) {
            const { width: wordWidth } = getTextMetricsOfPrecision(this.value, this.ctx)
            this.width = this.width + wordWidth + Rate.RATE_ITEM_MARGIN
        }
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width, y: this.y + this.height },
            rates: Array.from({ length: this.count }).map((e, i) => ({
                all: {
                    leftTop: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i, y: this.y },
                    rightTop: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width * 2, y: this.y },
                    leftBottom: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i, y: this.y + this.height },
                    rightBottom: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width * 2, y: this.y + this.height },
                },
                halfLeft: {
                    leftTop: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i, y: this.y },
                    rightTop: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width, y: this.y },
                    leftBottom: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i, y: this.y + this.height },
                    rightBottom: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width, y: this.y + this.height },
                },
                halfRight: {
                    leftTop: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width, y: this.y },
                    rightTop: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width * 2, y: this.y },
                    leftBottom: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width, y: this.y + this.height },
                    rightBottom: { x: this.x + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i + rate_item_half_width * 2, y: this.y + this.height },
                }
            }))
        }
    }
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
        const defaultEventListeners = {
            mouseenter: e => {
                const { offsetX, offsetY } = e
                if (this.disabled) return
                if (offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y) {
                    this.mouseEntered = true
                    if (this.allowHalf) {
                        hoverRateHalfLeft = false
                        hoverRateHalfRight = false
                        hoverRate = false
                        for (let i = 0, l = this.area.rates.length; i < l; i++) {
                            if (offsetX >= this.area.rates[i].halfLeft.leftTop.x && offsetX <= this.area.rates[i].halfLeft.rightTop.x && offsetY >= this.area.rates[i].halfLeft.leftTop.y && offsetY <= this.area.rates[i].halfLeft.leftBottom.y) {
                                drawValue = i + 1 - 0.5
                                hoverRateHalfLeft = true
                                break
                            }
                            if (offsetX >= this.area.rates[i].halfRight.leftTop.x && offsetX <= this.area.rates[i].halfRight.rightTop.x && offsetY >= this.area.rates[i].halfRight.leftTop.y && offsetY <= this.area.rates[i].halfRight.leftBottom.y) {
                                drawValue = i + 1
                                hoverRateHalfRight = true
                                break
                            }
                        }
                    } else {
                        for (let i = 0, l = this.area.rates.length; i < l; i++) {
                            if (offsetX >= this.area.rates[i].all.leftTop.x && offsetX <= this.area.rates[i].all.rightTop.x && offsetY >= this.area.rates[i].all.leftTop.y && offsetY <= this.area.rates[i].all.leftBottom.y) {
                                drawValue = i + 1
                                hoverRate = true
                                break
                            }
                        }
                    }
                    if (this.disabled) {
                        this.cursor = 'not-allowed'
                    } else {
                        if (hoverRate || hoverRateHalfLeft || hoverRateHalfRight) {
                            this.cursor = 'pointer'
                        } else {
                            this.cursor = 'default'
                        }
                    }
                    this.render()
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (!this.mouseEntered || this.disabled) return
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    this.cursor = 'default'
                    drawValue = this.value
                    hoverRateHalfLeft = false
                    hoverRateHalfRight = false
                    hoverRate = false
                    this.render()
                }
            },
            click: () => {
                if (!this.mouseEntered || this.disabled) return
                if (this.allowClear) {
                    if (drawValue === this.value) {
                        this.value = 0
                        drawValue = 0
                    } else {
                        this.value = drawValue
                    }
                } else {
                    this.value = drawValue
                }
                this.render()
            }
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.render = function(config) {
        this.initProps(config)
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        initDefaultAttrs()
        const r_even = Rate.RATE_R
        const r_odd = r_even * Math.sin((18 / 180) * Math.PI) / Math.cos((36 / 180) * Math.PI)
        const getPoints = (r_even, r_odd) => {
            const p0 = [0, -r_even]
            const p1 = [r_odd * Math.cos(Math.PI * (54 / 180)), -r_odd * Math.sin(Math.PI * (54 / 180))]
            const p2 = [r_even * Math.cos(Math.PI * (18 / 180)), -r_even * Math.sin(Math.PI * (18 / 180))]
            const p3 = [r_odd * Math.cos(Math.PI * (18 / 180)), r_odd * Math.sin(Math.PI * (18 / 180))]
            const p4 = [r_even * Math.cos(Math.PI * (54 / 180)), r_even * Math.sin(Math.PI * (54 / 180))]
            const p5 = [0, r_odd]
            const p6 = [-p4[0], p4[1]]
            const p7 = [-p3[0], p3[1]]
            const p8 = [-p2[0], p2[1]]
            const p9 = [-p1[0], p1[1]]
            return [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9]
        }
        const points = getPoints(r_even, r_odd)
        Array.from({ length: this.count }).forEach((e, i) => {
            this.ctx.save()
            this.ctx.beginPath()
            this.ctx.translate(this.x + rate_item_half_width + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * i, this.y + r_even)
            let path = new Path2D()
            points.forEach((p, pI) => {
                if (pI === 0) {
                    path.moveTo(...p)
                } else {
                    path.lineTo(...p)
                }
            })
            let integerVal = drawValue
            if (this.allowHalf) {
                integerVal = Math.floor(drawValue)
            }
            if ((i + 1) <= integerVal) {
                this.ctx.fillStyle = Rate.RATE_ACTIVE_COLOR
            } else {
                this.ctx.fillStyle = Rate.RATE_INACTIVE_COLOR
            }
            this.ctx.fill(path)
            this.ctx.restore()
        })
        if (this.allowHalf) {
            let integerVal = Math.floor(drawValue)
            let decimalVal = drawValue - integerVal
            if (decimalVal > 0) {
                this.ctx.save()
                this.ctx.beginPath()
                this.ctx.translate(this.x + rate_item_half_width + (Rate.RATE_ITEM_MARGIN + rate_item_half_width * 2) * integerVal, this.y + r_even)
                let pathDecimal = new Path2D()
                const [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9] = points
                const halfShapePoints = [p0, p5, p6, p7, p8, p9]
                halfShapePoints.forEach((p, pI) => {
                    if (pI === 0) {
                        pathDecimal.moveTo(...p)
                    } else {
                        pathDecimal.lineTo(...p)
                    }
                })
                this.ctx.fillStyle = Rate.RATE_ACTIVE_COLOR
                this.ctx.fill(pathDecimal)
                this.ctx.restore()
            }
        }
        if (this.tooltips !== null) {
            const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.value, this.ctx)
            this.ctx.save()
            this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
            this.ctx.textBaseline = 'middle'
            this.ctx.fillStyle = 'rgb(31, 45, 61)'
            this.ctx.beginPath()
            this.ctx.fillText(this.value, this.x + this.width - wordWidth, this.y + Rate.RATE_R)
            this.ctx.restore()
        }
    }
    initDefaultAttrs()
    initEvents()
}