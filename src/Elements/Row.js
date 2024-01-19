import Element from "../Element"
import inheritProto from "../inherite"

Row.elName = 'row'

inheritProto(Row, Element)
export default function Row(props) {
    Element.call(this)
    this.align = 'top' //  top/middle/bottom
    this.gutter = 0
    this.justify = 'start' // start/end/center/space-around/space-between
    this.type = 'flex'
    this.children = []
    const maxColSpan = 24
    this.initProps(props)
    this.render = function(config) {
        this.initProps(config)
        if (this.$$render_children) {
            this.children = this.$$render_children.call(this, this.root._c)
        }
        this.x = parseFloat(this.parentElement.x)
        this.width = parseFloat(this.parentElement.width)
        if (this.parentElement === this.root) {
            this.y = parseFloat(this.parentElement.y)
        } else {
            const lineIndex = this.parentElement.renderLines.findIndex(l => l.some(c => c === this))
            this.y = this.parentElement.renderLines
            .slice(0, lineIndex)
            .map(l => Math.max(...l.map(c => c.height || 0)))
            .reduce((p, c) => p + c, 0)
        }
        this.children.forEach((col, i, ary) => {
            let preWidth = ary.slice(0, i).reduce((p, c) => p + c.width, this.x)
            col.render({
                x: preWidth, 
                y: this.y,
                parentElement: this,
                width: col.span / maxColSpan * this.width
            })
        })
        this.height = Math.max(...this.children.map(e => parseFloat(e.height)))
        if (this.globalProps.mode === 'development') {
            this.ctx.save()
            this.ctx.strokeStyle = 'red'
            this.ctx.lineWidth = 1
            this.ctx.translate(0.5, 0.5)
            this.ctx.setLineDash([4, 2])
            this.ctx.strokeRect(this.x, this.y, this.width, this.height)
            this.ctx.restore()
        }
    }
}