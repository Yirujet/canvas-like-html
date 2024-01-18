import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'

const colorObj = {
    success: '#67c23a',
    exception: '#f56c6c',
    warning: '#e6a23c',
    bg: '#ebeef5'
}

const PROGRESS_TEXT_MARGIN = 5

Progress.PROGRESS_TEXT_MARGIN = PROGRESS_TEXT_MARGIN

Progress.elName = 'progress'

inheritProto(Progress, Element)
export default function Progress(props) {
    Element.call(this)
    this.percentage = 0 //  0-100
    this.percentageOld = 0
    this.type = 'line'  //  line/circle/dashboard
    this.strokeWidth = 6
    this.textInside = false
    this.status = null  //  success/exception/warning
    this.color = null
    this.width = 126
    this.textWidth = 0
    this.showText = true
    this.strokeLinecap = 'round'    //  butt/round/square
    let openAnimation = false
    const propsObj = props
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    if (this.type === 'line') {
        this.height = this.strokeWidth
    } else {
        this.height = this.width
    }
    const initDefaultAttrs = () => {
        const { width } = getTextMetricsOfPrecision('100%', this.ctx)
        if (this.type === 'line' && !this.textInside) {
            this.textWidth = width
        }
        if (this.type === 'line') {
            this.area = {
                leftTop: { x: this.x, y: this.y },
                rightTop: { x: this.x + this.width + this.textWidth + Progress.PROGRESS_TEXT_MARGIN, y: this.y },
                leftBottom: { x: this.x, y: this.y + this.height },
                rightBottom: { x: this.x + this.width + this.textWidth + Progress.PROGRESS_TEXT_MARGIN, y: this.y + this.height },
            }
        } else {
            this.area = {
                leftTop: { x: this.x, y: this.y },
                rightTop: { x: this.x + this.width, y: this.y },
                leftBottom: { x: this.x, y: this.y + this.height },
                rightBottom: { x: this.x + this.width, y: this.y + this.height },
            }
        }
        this.percentage = Math.min(Math.max(this.percentage, 0), 100)
    }
    this.render = function(config) {
        this.percentageOld = this.percentage
        openAnimation = false
        this.initProps(config)
        switch (this.type) {
            case 'line':
                drawLineProgress()
                break
            case 'circle':
                drawCircleProgress()
                break
            case 'dashboard':
                drawDashboardProgress()
                break
            default:
                break
        }
    }
    const getStrokeColor = () => {
        if (this.color) {
            if (typeof this.color === 'string') {
                return this.color
            } else if (Array.isArray(this.color)) {
                const sortedColor = this.color.sort((e1, e2) => e1.percentage - e2.percentage)
                const i = sortedColor.findIndex(e => e.percentage >= this.percentage)
                if (!!~i) {
                    return this.color[i].color
                } else {
                    return '#409eff'
                }
            }
        } else {
            if (this.status && colorObj[this.status]) {
                return colorObj[this.status]
            } else {
                return '#409eff'
            }
        }
    }
    const drawLineProgress = () => {
        this.ctx.save()
        const ellipsisWidth = Math.ceil(this.strokeWidth / 2)
        if (this.showText && this.textInside) {
            this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width, this.height)
        } else {
            this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width + this.textWidth + Progress.PROGRESS_TEXT_MARGIN + ellipsisWidth * 2, this.height)
        }
        initDefaultAttrs()
        if (this.percentageOld !== this.percentage) {
            openAnimation = true
        }
        let d = null
        const step = 5
        const drawShape = () => {
            this.ctx.beginPath()
            if (this.showText && this.textInside) {
                this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width, this.height)
            } else {
                this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width + this.textWidth + Progress.PROGRESS_TEXT_MARGIN + ellipsisWidth * 2, this.height)
            }
            initDefaultAttrs()
            this.ctx.lineWidth = this.strokeWidth
            this.ctx.lineCap = this.strokeLinecap
            this.ctx.strokeStyle = colorObj.bg
            this.ctx.moveTo(this.x, this.y)
            this.ctx.lineTo(this.x + this.width, this.y)
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.strokeStyle = getStrokeColor()
            this.ctx.moveTo(this.x, this.y)
            if (d === null) {
                d = 0
            } else {
                if (this.percentage > this.percentageOld) {
                    if (d >= this.percentage - this.percentageOld) {
                        openAnimation = false
                        d = this.percentage - this.percentageOld
                    }
                } else {
                    if (d <= this.percentage - this.percentageOld) {
                        openAnimation = false
                        d = this.percentage - this.percentageOld
                    }
                }
            }
            if (openAnimation) {
                this.ctx.lineTo(this.x + ((this.percentageOld + d) / 100) * this.width, this.y)
                this.ctx.stroke()
                d = d + step * (this.percentage > this.percentageOld ? 1 : -1)
                if (this.showText) {
                    this.ctx.beginPath()
                    this.ctx.textBaseline = 'middle'
                    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
                    if (this.textInside) {
                        this.ctx.fillStyle = '#fff'
                        this.ctx.fillText(`${this.percentage}%`, this.x + ((this.percentageOld + d) / 100) * this.width - this.textWidth - Progress.PROGRESS_TEXT_MARGIN * 2 - ellipsisWidth, this.y)
                    } else {
                        this.ctx.fillStyle = '#606266'
                        this.ctx.fillText(`${this.percentage}%`, this.x + this.width + Progress.PROGRESS_TEXT_MARGIN + ellipsisWidth, this.y)
                    }
                }
                requestAnimationFrame(drawShape)
            } else {
                d = null
                this.ctx.lineTo(this.x + (this.percentage / 100) * this.width, this.y)
                this.ctx.stroke()
                if (this.showText) {
                    this.ctx.beginPath()
                    this.ctx.textBaseline = 'middle'
                    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
                    if (this.textInside) {
                        this.ctx.fillStyle = '#fff'
                        this.ctx.fillText(`${this.percentage}%`, this.x + (this.percentage / 100) * this.width - this.textWidth - Progress.PROGRESS_TEXT_MARGIN * 2 - ellipsisWidth, this.y)
                    } else {
                        this.ctx.fillStyle = '#606266'
                        this.ctx.fillText(`${this.percentage}%`, this.x + this.width + Progress.PROGRESS_TEXT_MARGIN + ellipsisWidth, this.y)
                    }
                }
            }
        }
        requestAnimationFrame(drawShape)
        this.ctx.restore()
    }
    const drawCircleProgress = () => {
        this.ctx.save()
        const ellipsisWidth = Math.ceil(this.strokeWidth / 2)
        this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width + ellipsisWidth * 2, this.height + ellipsisWidth * 2)
        if (this.percentageOld !== this.percentage) {
            openAnimation = true
        }
        let d = null
        const step = 5
        const drawShape = () => {
            this.ctx.beginPath()
            this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width + ellipsisWidth * 2, this.height + ellipsisWidth * 2)
            initDefaultAttrs()
            this.ctx.lineWidth = this.strokeWidth
            this.ctx.lineCap = this.strokeLinecap
            this.ctx.strokeStyle = colorObj.bg
            this.ctx.arc(
                this.x + this.width / 2, 
                this.y + this.width / 2,
                this.width / 2,
                0,
                Math.PI * 2,
                false
            )
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.strokeStyle = getStrokeColor()
            if (d === null) {
                d = 0
            } else {
                if (this.percentage > this.percentageOld) {
                    if (d >= this.percentage - this.percentageOld) {
                        openAnimation = false
                        d = this.percentage - this.percentageOld
                    }
                } else {
                    if (d <= this.percentage - this.percentageOld) {
                        openAnimation = false
                        d = this.percentage - this.percentageOld
                    }
                }
            }
            if (openAnimation) {
                this.ctx.arc(
                    this.x + this.width / 2, 
                    this.y + this.width / 2,
                    this.width / 2,
                    -Math.PI / 2,
                    -Math.PI / 2 + (this.percentageOld + d) / 100 * Math.PI * 2,
                    false
                )
                this.ctx.stroke()
                d = d + step * (this.percentage > this.percentageOld ? 1 : -1)
                if (this.showText) {
                    this.ctx.beginPath()
                    this.ctx.textBaseline = 'middle'
                    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
                    this.ctx.fillStyle = '#606266'
                    const { width: textWidth } = getTextMetricsOfPrecision(`${this.percentage}%`, this.ctx)
                    this.ctx.fillText(`${this.percentage}%`, this.x + this.width / 2 - textWidth / 2, this.y + this.width / 2)
                }
                requestAnimationFrame(drawShape)
            } else {
                d = null
                this.ctx.arc(
                    this.x + this.width / 2, 
                    this.y + this.width / 2,
                    this.width / 2,
                    -Math.PI / 2,
                    -Math.PI / 2 + this.percentage / 100 * Math.PI * 2,
                    false
                )
                this.ctx.stroke()
                if (this.showText) {
                    this.ctx.beginPath()
                    this.ctx.textBaseline = 'middle'
                    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
                    this.ctx.fillStyle = '#606266'
                    const { width: textWidth } = getTextMetricsOfPrecision(`${this.percentage}%`, this.ctx)
                    this.ctx.fillText(`${this.percentage}%`, this.x + this.width / 2 - textWidth / 2, this.y + this.width / 2)
                }
            }
        }
        requestAnimationFrame(drawShape)
        initDefaultAttrs()
        this.ctx.restore()
    }
    const drawDashboardProgress = () => {
        this.ctx.save()
        const ellipsisWidth = Math.ceil(this.strokeWidth / 2)
        this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width + ellipsisWidth * 2, this.height + ellipsisWidth * 2)
        if (this.percentageOld !== this.percentage) {
            openAnimation = true
        }
        let d = null
        const step = 5
        const drawShape = () => {
            this.ctx.beginPath()
            this.ctx.clearRect(this.x - ellipsisWidth, this.y - ellipsisWidth, this.width + ellipsisWidth * 2, this.height + ellipsisWidth * 2)
            initDefaultAttrs()
            this.ctx.lineWidth = this.strokeWidth
            this.ctx.lineCap = this.strokeLinecap
            this.ctx.strokeStyle = colorObj.bg
            this.ctx.arc(
                this.x + this.width / 2, 
                this.y + this.width / 2,
                this.width / 2,
                -5 / 4 * Math.PI,
                Math.PI / 4,
                false
            )
            this.ctx.stroke()
            this.ctx.beginPath()
            this.ctx.strokeStyle = getStrokeColor()
            if (d === null) {
                d = 0
            } else {
                if (this.percentage > this.percentageOld) {
                    if (d >= this.percentage - this.percentageOld) {
                        openAnimation = false
                        d = this.percentage - this.percentageOld
                    }
                } else {
                    if (d <= this.percentage - this.percentageOld) {
                        openAnimation = false
                        d = this.percentage - this.percentageOld
                    }
                }
            }
            if (openAnimation) {
                this.ctx.arc(
                    this.x + this.width / 2, 
                    this.y + this.width / 2,
                    this.width / 2,
                    -5 / 4 * Math.PI,
                    -5 / 4 * Math.PI + (this.percentageOld + d) / 100 * Math.PI * 3 / 2,
                    false
                )
                this.ctx.stroke()
                d = d + step * (this.percentage > this.percentageOld ? 1 : -1)
                if (this.showText) {
                    this.ctx.beginPath()
                    this.ctx.textBaseline = 'middle'
                    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
                    this.ctx.fillStyle = '#606266'
                    const { width: textWidth } = getTextMetricsOfPrecision(`${this.percentage}%`, this.ctx)
                    this.ctx.fillText(`${this.percentage}%`, this.x + this.width / 2 - textWidth / 2, this.y + this.width / 2)
                }
                requestAnimationFrame(drawShape)
            } else {
                d = null
                this.ctx.arc(
                    this.x + this.width / 2, 
                    this.y + this.width / 2,
                    this.width / 2,
                    -5 / 4 * Math.PI,
                    -5 / 4 * Math.PI + this.percentage / 100 * Math.PI * 3 / 2,
                    false
                )
                this.ctx.stroke()
                if (this.showText) {
                    this.ctx.beginPath()
                    this.ctx.textBaseline = 'middle'
                    this.ctx.font = `400 ${this.globalProps.fontSize}px Helvetica`
                    this.ctx.fillStyle = '#606266'
                    const { width: textWidth } = getTextMetricsOfPrecision(`${this.percentage}%`, this.ctx)
                    this.ctx.fillText(`${this.percentage}%`, this.x + this.width / 2 - textWidth / 2, this.y + this.width / 2)
                }
            }
        }
        requestAnimationFrame(drawShape)
        initDefaultAttrs()
        this.ctx.restore()
    }
}