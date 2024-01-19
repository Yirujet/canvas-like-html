import Element from "../Element"
import inheritProto from "../inherite"

Col.elName = 'col'

inheritProto(Col, Element)
export default function Col(props) {
    this.span = 24
    this.offset = 0
    this.push = 0
    this.pull = 0
    Element.call(this)
    this.children = null
    this.renderLines = []
    this.initProps(props)
    this.render = function(config) {
        this.initProps(config)
        if (this.children === null && this.$$render_children) {
            this.children = this.$$render_children.call(this, this.root._c)
        }
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        this.renderLines = []
        let newLine = []
        let x = this.x
        let y = this.y
        let index = 0
        this.children.forEach((col, i, ary) => {
            const calcLineWidth = newLine.map(e => e.width).reduce((p, c) => p + c, 0)
            if (col.constructor.elName === 'row') {
                col.width = this.width
            }
            if (calcLineWidth + col.width > this.width) {
                this.renderLines.push(newLine)
                newLine = [col]
                x = this.x
                index++
            } else {
                x = newLine.reduce((p, c) => p + c.width, this.x)
                newLine.push(col)
            }
            if (newLine.length > 0 && i === ary.length - 1) {
                this.renderLines.push(newLine)
            }
            const lineIndex = this.renderLines.filter(l => l.length > 0).findIndex(l => l.some(c => c === col))
            if (!!~lineIndex) {
                y = this.y + this.renderLines
                .filter(l => l.length > 0)
                .slice(0, lineIndex)
                .map(l => Math.max(...l.map(c => c.height || 0)))
                .reduce((p, c) => p + c, 0)
            } else {
                if (this.renderLines.length > 0) {
                    y = this.y + this.renderLines
                    .filter(l => l.length > 0)
                    .map(l => Math.max(...l.map(c => c.height || 0)))
                    .reduce((p, c) => p + c, 0)
                }
            }
            col.x = x
            col.y = y
            col.parentElement = this
        })
        this.renderLines.forEach(l => {
            l.forEach(c => {
                c.render()
            })
        })
        this.height = this.renderLines
            .filter(l => l.length > 0)
            .map(l => Math.max(...l.map(c => c.height || 0)))
            .reduce((p, c) => p + c, 0)
        if (this.globalProps.mode === 'development') {
            this.ctx.save()
            this.ctx.strokeStyle = 'blue'
            this.ctx.lineWidth = 1
            this.ctx.translate(0.5, 0.5)
            this.ctx.setLineDash([4, 2])
            this.ctx.strokeRect(this.x, this.y, this.width, this.height)
            this.ctx.restore()
        }
    }
}