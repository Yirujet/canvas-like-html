import HorizontalScrollbar from './scrollbar/HorizontalScrollbar.js'
import VerticalScrollbar from './scrollbar/VerticalScrollbar.js'
import { render, getEllipsisText, evalFn } from '../utils.js'
import EventObserver from '../EventObserver.js'
import inheritProto from '../inherite.js'
import Checkbox from './Checkbox.js'
import Element from '../Element.js'
import _ from 'lodash'

Table.elName = 'table'

inheritProto(Table, Element)
export default function Table(props) {
    Element.call(this)
    this.columns = []
    this.clonedColumns = []
    this.data = []
    this.fixedLeftWidth = 0
    this.fixedRightWidth = 0
    this.normalWidth = 0
    this.fixedLeftCols = []
    this.normalCols = []
    this.fixedRightCols = []
    this.headerHeight = 0
    this.bodyHeight = 0
    this.bodyRealHeight = 0
    this.defaultVirtualColWidth = 100
    this.restHeight = 0
    this.restWidth = 0
    this.deviationCompareValue = 10e-6
    this.verticalScrollBar = null
    this.horizontalScrollBar = null
    this.scrollOffsetUnitVal = 10
    this.slotCompMargin = 10
    this.maxLevel = 0
    this.horizontalDataSize = 0
    this.flattenCols = []
    this.eventObserver = new EventObserver()
    this.eventGarbageCollection = []
    this.selection = []
    this.checkAll = false
    this.stripe = false
    const propsObj = props
    this.initProps(props)
    this.x = parseFloat(this.x || 0)
    this.y = parseFloat(this.y || 0)
    const initProps = () => {
        this.fixedLeftWidth = 0
        this.fixedRightWidth = 0
        this.normalWidth = 0
        this.fixedLeftCols = []
        this.normalCols = []
        this.fixedRightCols = []
        this.headerHeight = 0
        this.bodyHeight = 0
        this.bodyRealHeight = 0
        this.defaultVirtualColWidth = 100
        this.restHeight = 0
        this.restWidth = 0
        this.deviationCompareValue = 10e-6
        this.verticalScrollBar = null
        this.horizontalScrollBar = null
        this.scrollOffsetUnitVal = 10
        this.slotCompMargin = 10
        this.maxLevel = 0
        this.horizontalDataSize = 0
        this.flattenCols = []
        this.eventGarbageCollection = []
        this.width = propsObj.width
        this.height = propsObj.height
    }
    const initEvents = () => {
    }
    const initCanvas = () => {
        this.ctx.font = `${ this.globalProps.fontSize }px ${ this.globalProps.fontFamily }`
        this.globalProps.rowHeight = this.globalProps.padding * 2 + this.globalProps.lineHeight
        this.bodyRealHeight = this.data.length * this.globalProps.rowHeight
    }
    const initColumns = () => {
        let fixedLeftWidth = 0
        let fixedRightWidth = 0
        let normalWidth = 0
        this.clonedColumns = _.cloneDeep(this.columns)
        const deepQuery = (col, colIndex, parentChildren, level = 0) => {
            if (!col.$$x) {
                col.$$x = 0
            }
            parentChildren.slice(0, colIndex).forEach(e => {
                col.$$x += e.$$cellWidth
            })
            if (col.children && Array.isArray(col.children) && col.children.length > 0) {
                if (!col.$$cellWidth) {
                    col.$$cellWidth = 0
                }
                col.children.forEach((child, i, ary) => {
                    col.$$cellWidth += deepQuery(child, i, ary, level + 1)
                })
            } else {
                if (!['left', 'right'].includes(col.fixed)) {
                    this.horizontalDataSize += 1
                    this.flattenCols.push(col)
                }
                col.$$cellWidth = this.defaultVirtualColWidth
            }
            col.$$level = level + 1
            if (col.$$level > this.maxLevel) {
                this.maxLevel = col.$$level
            }
            return col.$$cellWidth
        }
        this.clonedColumns.forEach((item, i, ary) => {
            deepQuery(item, i, ary)
        })
        this.clonedColumns.forEach(item => {
            const { fixed, label, field } = item
            if (fixed === 'left') {
                this.fixedLeftCols.push({
                    ...item,
                    area: {
                        x: fixedLeftWidth,
                        width: item.width || item.$$cellWidth,
                        text: getEllipsisText(label || field, item.$$cellWidth - this.globalProps.padding, this.globalProps.fontSize)
                    }
                })
                fixedLeftWidth += item.width || item.$$cellWidth
            } else if (fixed === 'right') {
                this.fixedRightCols.push({
                    ...item,
                    area: {
                        x: fixedRightWidth,
                        width: item.width || item.$$cellWidth,
                        text: getEllipsisText(label || field, item.$$cellWidth - this.globalProps.padding, this.globalProps.fontSize)
                    }
                })
                fixedRightWidth += item.width || item.$$cellWidth
            } else {
                this.normalCols.push({
                    ...item,
                    area: {
                        x: normalWidth,
                        width: item.$$cellWidth,
                        text: getEllipsisText(label || field, item.$$cellWidth - this.globalProps.padding, this.globalProps.fontSize)
                    }
                })
                normalWidth += item.$$cellWidth
            }
        })
        if (this.fixedRightCols.length > 0) {
            const lastFixedRightCol = this.fixedRightCols.at(-1)
            const moveDistance = this.width - lastFixedRightCol.width - lastFixedRightCol.x
            this.fixedRightCols.forEach(item => {
                item.x += moveDistance
            })
        }
        this.fixedLeftWidth = fixedLeftWidth
        this.fixedRightWidth = fixedRightWidth
        this.normalWidth = normalWidth
        this.headerHeight = this.maxLevel * this.globalProps.rowHeight
        this.bodyHeight = this.height - this.headerHeight
        if (this.bodyHeight < this.bodyRealHeight) {
            this.width -= 16
        }
        if (this.normalWidth > this.width - this.fixedLeftWidth - this.fixedRightWidth) {
            this.height -= 16
        }
        if (this.height % this.globalProps.rowHeight > 0) {
            this.restHeight = this.globalProps.rowHeight - this.bodyHeight % this.globalProps.rowHeight
        } else {
            this.restHeight = 0
        }
        if ((this.width - this.fixedLeftWidth - this.fixedRightWidth) % this.defaultVirtualColWidth > 0) {
            this.restWidth = this.defaultVirtualColWidth - (this.width - this.fixedLeftWidth - this.fixedRightWidth) % this.defaultVirtualColWidth
        } else {
            this.restWidth = 0
        }
    }
    const initScrollbar = () => {
        const layout = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            headerHeight: this.headerHeight,
            fixedLeftWidth: this.fixedLeftWidth,
            fixedRightWidth: this.fixedRightWidth,
            bodyHeight: this.bodyHeight,
            bodyRealWidth: this.normalWidth,
            bodyRealHeight: this.bodyRealHeight,
            target: this.target,
            restHeight: this.restHeight,
            restWidth: this.restWidth,
            deviationCompareValue: this.deviationCompareValue,
        }
        this.horizontalScrollBar = new HorizontalScrollbar(
            layout,
            this.defaultVirtualColWidth,
            this.horizontalDataSize,
            this.redraw.bind(this),
            this.eventObserver
        )
        this.verticalScrollBar = new VerticalScrollbar(
            layout,
            this.globalProps.rowHeight,
            this.data.length,
            this.redraw.bind(this),
            this.eventObserver
        )
    }
    const init = () => {
        initProps()
        initEvents()
        initCanvas()
        initColumns()
        initScrollbar()
    }
    const drawHead = () => {
        this.ctx.save()
        // this.ctx.translate(-this.scrollbar.horizontal.percent * (this.normalWidth - this.scrollbar.horizontal.trackWidth), 0.5)
        const height = this.globalProps.rowHeight
        let padding = this.globalProps.padding
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = '#ebeef5'
        this.ctx.font = '700 14px Helvetica'
        this.ctx.fillStyle = '#909399'
        this.ctx.textBaseline = 'middle'
        const drawCell = (item, offsetX, ctx, scroll = false, parentX) => {
            const { $$cellWidth, $$level, label, field, type } = item
            let $$x = 0, text = ''
            if (item.area) {
                $$x = item.area.x
                text = item.area.text
            }
            let x = $$x
            let y = 0
            if (scroll) {
                let scrollOffset = (this.horizontalScrollBar.start % this.scrollOffsetUnitVal) / this.scrollOffsetUnitVal * this.defaultVirtualColWidth
                let scrollX = this.horizontalScrollBar.start * this.defaultVirtualColWidth
                let lastScrollOffset = this.horizontalScrollBar.offsetPercent * this.defaultVirtualColWidth
                if (typeof parentX !== 'undefined') {
                    x = parentX + item.$$x - scrollOffset
                    text = getEllipsisText(label || field, $$cellWidth - padding, this.globalProps.fontSize)
                    if (this.horizontalScrollBar.isLast) {
                        x = parentX + item.$$x - lastScrollOffset
                    }
                    x -= scrollX
                } else {
                    x = $$x - scrollX - scrollOffset
                    if (this.horizontalScrollBar.isLast) {
                        x = $$x - scrollX - lastScrollOffset
                    }
                }
                if (this.horizontalScrollBar.show && this.verticalScrollBar.show && this.horizontalScrollBar.end === this.normalCols.length) {
                    x -= this.verticalScrollBar.track.width
                }
            }
            let $$cellHeight = (this.maxLevel - $$level + 1) * height
            if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                $$cellHeight = height
            }
            y = ($$level - 1) * this.globalProps.rowHeight
            ctx.clearRect(x + offsetX, y, scroll ? $$cellWidth : item.width || $$cellWidth, $$cellHeight)
            ctx.strokeRect(x + offsetX, y, scroll ? $$cellWidth : item.width || $$cellWidth, $$cellHeight)
            if (item.slot && item.slot.head) {
                let comp, slotFn
                if (typeof item.slot.head === 'string') {
                    slotFn = evalFn(item.slot.head)()
                } else {
                    slotFn = item.slot.head
                }
                comp = slotFn.call(this, render.bind(this), item)
                if (comp) {
                    if (Array.isArray(comp)) {
                        comp.forEach((slotComp, i, ary) => {
                            slotComp.render({
                                x: i > 0 ? ary[i - 1].x + ary[i - 1].width + this.slotCompMargin : x + offsetX + padding,
                                y: $$cellHeight / 2 + y
                            })
                            this.eventGarbageCollection.push(slotComp)
                        })
                    } else {
                        comp.render({
                            x: x + offsetX + padding,
                            y: $$cellHeight / 2 + y
                        })
                        this.eventGarbageCollection.push(comp)
                    }
                }
            } else {
                switch (type) {
                    case 'checkbox':
                        let checkbox = new Checkbox({
                            x: x + offsetX + padding,
                            y: $$cellHeight / 2 + y - Checkbox.CHECKBOX_BOX_WIDTH / 2,
                            checked: this.checkAll,
                            indeterminate: this.selection.length > 0 && this.selection.length < this.data.length,
                            fontSize: this.ctx.fontSize,
                            ctx: this.ctx,
                            eventObserver: this.eventObserver,
                            globalProps: this.globalProps,
                            on: {
                                change: ({ checked }) => {
                                    if (this.selection.length > 0 && this.selection.length < this.data.length) {
                                        this.checkAll = true
                                    } else {
                                        this.checkAll = checked
                                    }
                                    if (this.checkAll) {
                                        this.selection = this.data.map((e, i) => i)
                                    } else {
                                        this.selection = []
                                    }
                                    this.toggleRowSelection(this.selection)
                                    this.redraw()
                                }
                            }
                        })
                        checkbox.render()
                        this.eventGarbageCollection.push(checkbox)
                        break
                    default:
                        this.ctx.fillText(text, x + offsetX + padding, $$cellHeight / 2 + y)
                        break
                }
            }
            if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                item.children.forEach(subItem => {
                    drawCell(subItem, offsetX, ctx, scroll, $$x + item.$$x)
                })
            }
        }
        let realStart = 0
        for (let i = 0, l = this.normalCols.length, e; i < l; i++) {
            e = this.normalCols[i]
            if (this.horizontalScrollBar.start >= e.area.x / this.defaultVirtualColWidth && this.horizontalScrollBar.start < (e.area.x + e.area.width) / this.defaultVirtualColWidth) {
                realStart = i
                break
            }
        }
        this.normalCols.slice(realStart, this.horizontalScrollBar.end).forEach(item => {
            drawCell(item, this.fixedLeftWidth, this.ctx, true)
        })
        this.fixedLeftCols.forEach(item => {
            drawCell(item, 0, this.ctx)
        })
        this.fixedRightCols.forEach(item => {
            drawCell(item, this.width - this.fixedRightWidth, this.ctx)
        })
        this.ctx.restore()
    }
    const drawBody = () => {
        this.ctx.save()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = '#ebeef5'
        this.ctx.fillStyle = '#606266'
        this.ctx.textBaseline = 'middle'
        let width = this.defaultVirtualColWidth
        let padding = this.globalProps.padding
        const height = this.globalProps.rowHeight
        const headerHeight = this.headerHeight
        let fixedLeftX = 0
        let fixedRightX = 0
        let scrollOffsetX = (this.horizontalScrollBar.start % this.scrollOffsetUnitVal) / this.scrollOffsetUnitVal * this.defaultVirtualColWidth
        let scrollOffsetY = (this.verticalScrollBar.start % this.scrollOffsetUnitVal) / this.scrollOffsetUnitVal * this.globalProps.rowHeight
        console.log('*******', this.horizontalScrollBar.offsetPercent, this.horizontalScrollBar.isLast)
        let lastScrollOffsetX = this.horizontalScrollBar.offsetPercent * width
        let lastScrollOffsetY = this.verticalScrollBar.offsetPercent * this.globalProps.rowHeight
        const drawCell = (item, text, rowData, rowIndex, x, y, contentY) => {
            const { slot, type } = item
            const drawSlotCell = () => {
                let comp, slotFn
                if (typeof slot.body === 'string') {
                    slotFn = evalFn(slot.body)()
                } else {
                    slotFn = slot.body
                }
                comp = slotFn.call(this, render.bind(this), {
                    row: rowData,
                    column: item,
                    $index: rowIndex + this.verticalScrollBar.start
                })
                if (comp) {
                    if (Array.isArray(comp)) {
                        comp.forEach((slotComp, i, ary) => {
                            slotComp.render({
                                x: i > 0 ? ary[i - 1].x + ary[i - 1].width + this.slotCompMargin : x,
                                y
                            })
                            this.eventGarbageCollection.push(slotComp)
                        })
                    } else {
                        comp.render({x, y})
                        this.eventGarbageCollection.push(comp)
                    }
                }
            }
            const drawSelectionCell = () => {
                let checkbox = new Checkbox({
                    x,
                    y,
                    fontSize: this.ctx.fontSize,
                    checked: this.selection.includes(rowIndex + this.verticalScrollBar.start),
                    ctx: this.ctx,
                    eventObserver: this.eventObserver,
                    globalProps: this.globalProps,
                    on: {
                        change: ({ checked }) => {
                            let curIndex = rowIndex + this.verticalScrollBar.start
                            if (checked) {
                                this.selection.push(curIndex)
                            } else {
                                let i = this.selection.findIndex(e => e === curIndex)
                                this.selection.splice(i, 1)
                            }
                            this.checkAll = this.selection.length === this.data.length
                            this.toggleRowSelection(this.selection)
                            this.redraw()
                        }
                    }
                })
                checkbox.render()
                this.eventGarbageCollection.push(checkbox)
            }
            const drawSpanCell = () => {
                this.ctx.fillText(text, x, contentY)
            }
            const drawDefaultCell = () => {
                switch (type) {
                    case 'checkbox':
                        drawSelectionCell()
                        break
                    default:
                        drawSpanCell()
                        break
                }
            }
            if (slot && slot.body) {
                drawSlotCell()
            } else {
                drawDefaultCell()
            }
        }
        const drawStripeCell = (x, y, width, height, rowIndex) => {
            if (this.stripe) {
                this.ctx.save()
                if (rowIndex % 2 !== 0) {
                    this.ctx.fillStyle = '#fafafa'
                } else {
                    this.ctx.fillStyle = '#fff'
                }
                this.ctx.fillRect(x, y, width, height)
                this.ctx.restore()
            }
        }
        this.data.slice(this.verticalScrollBar.start, this.verticalScrollBar.end).forEach((rowData, rowIndex) => {
            this.flattenCols.slice(this.horizontalScrollBar.start, this.horizontalScrollBar.end).forEach((item, colIndex) => {
                const { field, type } = item
                let x = width * colIndex - scrollOffsetX
                if (this.horizontalScrollBar.isLast) {
                    x = width * colIndex - lastScrollOffsetX
                }
                let y = headerHeight + height * rowIndex - scrollOffsetY
                if (this.verticalScrollBar.isLast) {
                    y = headerHeight + height * rowIndex - lastScrollOffsetY
                }
                if (this.horizontalScrollBar.show && this.verticalScrollBar.show && this.horizontalScrollBar.end === this.normalCols.length) {
                    x -= this.verticalScrollBar.track.width
                }
                if (this.horizontalScrollBar.show && this.verticalScrollBar.show && this.verticalScrollBar.end === this.data.length) {
                    y -= this.horizontalScrollBar.track.height
                }
                let text = rowData[field]
                let contentWidth = width - padding
                text = getEllipsisText(text, contentWidth, this.globalProps.fontSize)
                this.ctx.clearRect(x + this.fixedLeftWidth, y, width, height)
                this.ctx.strokeRect(x + this.fixedLeftWidth, y, width, height)
                drawStripeCell(x + this.fixedLeftWidth, y, width, height, rowIndex)
                drawCell(item, text, rowData, rowIndex, x + this.fixedLeftWidth + padding, y + padding, height / 2 + y)
            })
            this.fixedLeftCols.forEach((item, colIndex, ary) => {
                const { field, type } = item
                let width = item.width || this.defaultVirtualColWidth
                fixedLeftX = ary.slice(0, colIndex).map(e => e.width || this.defaultVirtualColWidth).reduce((p, c) => p + c, 0)
                let y = headerHeight + height * rowIndex - scrollOffsetY
                if (this.verticalScrollBar.isLast) {
                    y = headerHeight + height * rowIndex - lastScrollOffsetY
                }
                if (this.horizontalScrollBar.show && this.verticalScrollBar.show && this.verticalScrollBar.end === this.data.length) {
                    y -= this.horizontalScrollBar.track.height
                }
                let text = rowData[field]
                let contentWidth = width - padding
                text = getEllipsisText(text, contentWidth, this.globalProps.fontSize)
                this.ctx.clearRect(fixedLeftX, y, width, height)
                this.ctx.strokeRect(fixedLeftX, y, width, height)
                drawStripeCell(fixedLeftX, y, width, height, rowIndex)
                drawCell(item, text, rowData, rowIndex, fixedLeftX + padding, y + padding, height / 2 + y)
            })
            this.fixedRightCols.forEach((item, colIndex, ary) => {
                const { field, type } = item
                let width = item.width || this.defaultVirtualColWidth
                fixedRightX = ary.slice(0, colIndex).map(e => e.width || this.defaultVirtualColWidth).reduce((p, c) => p + c, 0)
                let y = headerHeight + height * rowIndex - scrollOffsetY
                if (this.verticalScrollBar.isLast) {
                    y = headerHeight + height * rowIndex - lastScrollOffsetY
                }
                if (this.horizontalScrollBar.show && this.verticalScrollBar.show && this.verticalScrollBar.end === this.data.length) {
                    y -= this.horizontalScrollBar.track.height
                }
                let text = rowData[field]
                let contentWidth = width - padding
                text = getEllipsisText(text, contentWidth, this.globalProps.fontSize)
                this.ctx.clearRect(fixedRightX + this.width - this.fixedRightWidth, y, width, height)
                this.ctx.strokeRect(fixedRightX + this.width - this.fixedRightWidth, y, width, height)
                drawStripeCell(fixedRightX + this.width - this.fixedRightWidth, y, width, height, rowIndex)
                drawCell(item, text, rowData, rowIndex, fixedRightX + this.width - this.fixedRightWidth + padding, y + padding, height / 2 + y)
            })
        })
        this.ctx.restore()
    }
    const drawVerticalScrollbar = () => {
        this.ctx.save()
        this.ctx.strokeStyle = this.verticalScrollBar.track.borderColor
        this.ctx.strokeRect(this.verticalScrollBar.x, this.verticalScrollBar.y, this.verticalScrollBar.track.width, this.verticalScrollBar.track.height)
        this.ctx.fillStyle = this.verticalScrollBar.track.backgroundColor
        this.ctx.fillRect(this.verticalScrollBar.x, this.verticalScrollBar.y, this.verticalScrollBar.track.width, this.verticalScrollBar.track.height)
        this.ctx.fillStyle = this.verticalScrollBar.dragging ? this.verticalScrollBar.thumb.draggingColor : this.verticalScrollBar.thumb.backgroundColor
        this.ctx.fillRect(this.verticalScrollBar.x + this.verticalScrollBar.thumb.padding, this.verticalScrollBar.y - this.verticalScrollBar.value, this.verticalScrollBar.thumb.width, this.verticalScrollBar.thumb.height)
        this.ctx.restore()
    }
    const drawHorizontalScrollbar = () => {
        this.ctx.save()
        this.ctx.strokeStyle = this.horizontalScrollBar.track.borderColor
        this.ctx.strokeRect(this.horizontalScrollBar.x, this.horizontalScrollBar.y, this.horizontalScrollBar.track.width, this.horizontalScrollBar.track.height)
        this.ctx.fillStyle = this.horizontalScrollBar.track.backgroundColor
        this.ctx.fillRect(this.horizontalScrollBar.x, this.horizontalScrollBar.y, this.horizontalScrollBar.track.width, this.horizontalScrollBar.track.height)
        this.ctx.fillStyle = this.horizontalScrollBar.dragging ? this.horizontalScrollBar.thumb.draggingColor : this.horizontalScrollBar.thumb.backgroundColor
        this.ctx.fillRect(this.horizontalScrollBar.x - this.horizontalScrollBar.value, this.horizontalScrollBar.y + this.horizontalScrollBar.thumb.padding, this.horizontalScrollBar.thumb.width, this.horizontalScrollBar.thumb.height)
        this.ctx.restore()
    }
    const drawScrollbarCoincide = () => {
        this.ctx.save()
        this.ctx.strokeStyle = this.verticalScrollBar.track.borderColor
        this.ctx.strokeRect(this.verticalScrollBar.x, this.horizontalScrollBar.y, this.verticalScrollBar.track.width, this.horizontalScrollBar.track.height)
        this.ctx.fillStyle = this.verticalScrollBar.track.backgroundColor
        this.ctx.fillRect(this.verticalScrollBar.x, this.horizontalScrollBar.y, this.verticalScrollBar.track.width, this.horizontalScrollBar.track.height)
        this.ctx.restore()
    }
    const drawScrollbar = () => {
        if (this.verticalScrollBar.show) {
            drawVerticalScrollbar()
        }
        if (this.horizontalScrollBar.show) {
            drawHorizontalScrollbar()
        }
        if (this.verticalScrollBar.show && this.horizontalScrollBar.show) {
            drawScrollbarCoincide()
        }
    }
    const drawFixedLeftShadow = () => {
        const gradientWidth = 6
        const startColor = 'rgba(0, 0, 0, 0.12)'
        const stopColor = 'transparent'
        const gradient = this.ctx.createLinearGradient(this.fixedLeftWidth, this.height / 2, this.fixedLeftWidth + gradientWidth, this.height / 2)
        gradient.addColorStop(0, startColor)
        gradient.addColorStop(1, stopColor)
        this.ctx.save()
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(this.fixedLeftWidth, 0, gradientWidth, this.height)
        this.ctx.restore()
    }
    const drawFixedRightShadow = () => {
        const gradientWidth = 6
        const startColor = 'transparent'
        const stopColor = 'rgba(0, 0, 0, 0.12)'
        const gradient = this.ctx.createLinearGradient(this.width - this.fixedRightWidth - gradientWidth, this.height / 2, this.width - this.fixedRightWidth, this.height / 2)
        gradient.addColorStop(0, startColor)
        gradient.addColorStop(1, stopColor)
        this.ctx.save()
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(this.width - this.fixedRightWidth - gradientWidth, 0, gradientWidth, this.height)
        this.ctx.restore()
    }
    const drawFixedShadow = () => {
        if (this.fixedLeftCols.length > 0 && this.horizontalScrollBar.show && this.horizontalScrollBar.percent > 0) {
            drawFixedLeftShadow()
        }
        if (this.fixedRightCols.length > 0 && this.horizontalScrollBar.show && !this.horizontalScrollBar.isLast) {
            drawFixedRightShadow()
        }
    }
    const drawVerticalScrollShadow = () => {
        const gradientWidth = 6
        const startColor = 'rgba(0, 0, 0, 0.12)'
        const stopColor = 'transparent'
        let x = this.width / 2
        if (this.fixedLeftCols.length > 0) {
            x += this.fixedLeftWidth
        }
        if (this.fixedRightCols.length > 0) {
            x -= this.fixedRightWidth
        }
        const gradient = this.ctx.createLinearGradient(x, this.headerHeight, x, this.headerHeight + gradientWidth)
        gradient.addColorStop(0, startColor)
        gradient.addColorStop(1, stopColor)
        this.ctx.save()
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(
            this.fixedLeftCols.length > 0 ? this.fixedLeftWidth : 0, 
            this.headerHeight, 
            this.width 
            + (this.fixedLeftCols.length > 0 ? -this.fixedLeftWidth : 0)
            + (this.fixedRightCols.length > 0 ? -this.fixedRightWidth : 0), 
            gradientWidth
        )
        this.ctx.restore()
    }
    const drawScrollShadow = () => {
        if (this.verticalScrollBar.percent !== 0) {
            drawVerticalScrollShadow()
        }
    }
    const drawTable = () => {
        this.ctx.save()
        drawBody()
        drawHead()
        drawScrollbar()
        drawFixedShadow()
        drawScrollShadow()
        this.ctx.restore()
    }
    this.render = function(config) {
        this.initProps(config)
        this.clear()
        this.eventObserver.clear([this.verticalScrollBar, this.horizontalScrollBar])
        init()
        this.redraw()
    }
    this.clear = function() {
        let scrollbarHeight = 0
        if (this.horizontalScrollBar && this.horizontalScrollBar.show) {
            scrollbarHeight = this.horizontalScrollBar.track.height
        }
        this.ctx.beginPath()
        this.ctx.rect(0, 0, this.width, this.height + scrollbarHeight)
        this.ctx.clip()
        this.ctx.clearRect(0, 0, this.width, this.height + scrollbarHeight)
        this.eventObserver.clear(this.eventGarbageCollection)
        this.eventGarbageCollection = []
    }
    this.redraw = function() {
        this.ctx.save()
        this.clear()
        drawTable()
        this.ctx.restore()
    }
    this.toggleRowSelection = function(selection) {
        this.triggerEvent('selection-change', selection.map(e => this.data[e]))
    }
}