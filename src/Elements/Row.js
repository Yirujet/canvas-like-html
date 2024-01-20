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
    this.children = null
    const maxColSpan = 24
    this.initProps(props)
    this.render = function(config) {
        this.initProps(config)
        if (this.children === null && this.$$render_children) {
            this.children = this.$$render_children.call(this, this.root._c)
        }
        if (this.width === null) {
            this.width = parseFloat(this.parentElement.width)
        }
        if (this.x === null) {
            this.x = parseFloat(this.parentElement.x)
        }
        if (this.y === null) {
            if (this.parentElement === this.root) {
                this.y = parseFloat(this.parentElement.y)
            } else {
                const lineIndex = this.parentElement.renderLines.findIndex(l => l.some(c => c === this))
                this.y = this.parentElement.renderLines
                .slice(0, lineIndex)
                .map(l => Math.max(...l.map(c => c.height || 0)))
                .reduce((p, c) => p + c, 0)
            }
        }
        this.children.forEach((col, i, ary) => {
            let preWidth = ary.slice(0, i).reduce((p, c) => p + c.width, this.x)
            col.render({
                x: preWidth, 
                y: this.y,
                parentElement: this,
                width: parseInt(col.$$props.span || maxColSpan) / maxColSpan * this.width,
                offset: parseInt(col.$$props.offset || 0) / maxColSpan * this.width,
            })
        })
        this.height = Math.max(...this.children.map(e => parseFloat(e.height)))
        this.children.forEach(col => {
            col.maxHeight = this.height
        })
        const calcPosition = (cols, colH, colOffset, colI, rowX, rowY, rowW, rowH, align, justify) => {
            let x, y
            switch (align) {
                case 'middle':
                    y = rowY + (rowH - colH) / 2
                    break
                case 'bottom':
                    y = rowY + rowH - colH
                    break
                default:
                    y = rowY
                    break
            }
            const clacColWidth = c => (parseInt(c.$$props.span || maxColSpan) + parseInt(c.$$props.offset || 0)) / maxColSpan * rowW
            const calcWidth = cols.map(c => clacColWidth(c)).reduce((p, c) => p + c, 0)
            const preWidth = cols.slice(0, colI).map(c => clacColWidth(c)).reduce((p, c) => p + c, 0)
            const offsetWidth = parseInt(colOffset || 0) / maxColSpan * rowW
            switch (justify) {
                case 'end':
                    x = rowX + preWidth + rowW - calcWidth + offsetWidth
                    break
                case 'center':
                    x = rowX + preWidth + (rowW - calcWidth) / 2 + offsetWidth
                    break
                case 'space-around':
                    break
                case 'space-between':
                    break
                default:
                    x = rowX + preWidth + offsetWidth
                    break
            }
            return { x, y }
        }
        this.ctx.save()
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        this.ctx.restore()
        this.children.forEach((col, i, ary) => {
            const { x, y } = calcPosition(ary, col.height, col.$$props.offset, i, this.x, this.y, this.width, this.height, this.align, this.justify)
            col.render({
                x, 
                y,
            })
        })
        if (this.globalProps.mode === 'development') {
            this.ctx.save()
            this.ctx.strokeStyle = 'red'
            this.ctx.lineWidth = 0.5
            this.ctx.translate(0.5, 0.5)
            this.ctx.setLineDash([3, 3])
            this.ctx.strokeRect(this.x, this.y, this.width, this.height)
            this.ctx.restore()
        }
    }
}