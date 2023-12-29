import EventObserver from '../../EventObserver.js'
import inheritProto from '../../inherite.js'
import Element from '../../Element.js'

inheritProto(Scrollbar, Element)
export default function Scrollbar(layout, dataSize, callback, eventObserver) {
    Element.call(this)
    this.track = {
        width: 0,
        height: 0,
        borderColor: '#ebeef5',
        backgroundColor: '#f1f1f1',
    }
    this.thumb = {
        width: 0,
        height: 0,
        padding: 0,
        min: 20,
        backgroundColor: '#c1c1c1',
        draggingColor: '#787878'
    }
    this.value = 0
    this.percent = 0
    this.start = 0
    this.end = 0
    this.lastVal = null
    this.position = null
    this.show = false
    this.dragging = false
    this.moveEvent = null
    this.offsetPercent = 0
    this.maxShowCount = 0
    this.sliceUnitVal = 0
    this.dataSize = 0
    this.callback = null
    this.isLast = false
    this.layout = {
        width: 0,
        height: 0,
        headerHeight: 0,
        fixedLeftWidth: 0,
        fixedRightWidth: 0,
        bodyHeight: 0,
        bodyRealWidth: 0,
        bodyRealHeight: 0,
        target: null,
        restHeight: 0,
        restWidth: 0,
    }
    this.layout = layout
    this.dataSize = dataSize
    this.callback = callback
    this.eventObserver = eventObserver
    if (!this.eventObserver) {
        this.eventObserver = new EventObserver()
    }
    this.updateSlices = function() {
        const percent = this.percent
        const calcSize = Math.max(this.dataSize - this.maxShowCount, 0)
        const firstIndexVertical = Math.floor(percent * calcSize)
        this.offsetPercent = percent - Math.floor(percent)
        let start, end
        start = firstIndexVertical
        if (start >= calcSize) {
            start = calcSize
        }
        end = start + this.maxShowCount + 1
        if (end >= this.dataSize) {
            end = this.dataSize
        }
        this.start = start
        this.end = end
    }
    this.checkHit = function(e) {
        const { offsetX, offsetY } = e
        if (!(offsetX < this.position.leftTop.x 
            || offsetX > this.position.rightTop.x 
            || offsetY < this.position.leftTop.y 
            || offsetY > this.position.leftBottom.y)) {
                e.target.style.cursor = 'default'
                this.dragging = true
        }
    }
    this.scrollMove = function(offset, offsetProp, maxScrollDistance, restPercent, callback) {
        if (this.dragging) {
            const curScrollbarVal = -this.value
            const minMoveVal = offset - curScrollbarVal
            const maxMoveVal = minMoveVal + maxScrollDistance
            this.isLast = false
            this.updateSlices()
            callback()
            this.moveEvent = _.throttle(e => {
                if (!this.dragging) return
                this.isLast = false
                let moveVal = e[offsetProp]
                if (moveVal > maxMoveVal) {
                    moveVal = maxMoveVal
                }
                if (moveVal < minMoveVal) {
                    moveVal = minMoveVal
                }
                let d = moveVal - offset
                let direction
                if (this.lastVal === null) {
                    direction = d >= 0 ? true : false
                } else {
                    direction = (moveVal - this.lastVal) >= 0 ? true : false
                }
                this.value = -d - curScrollbarVal
                if (direction) {
                    const deviation = Math.abs(this.value + maxScrollDistance)
                    if (deviation < this.layout.deviationCompareValue || (this.value <= -maxScrollDistance)) {
                        this.value = -maxScrollDistance
                        this.isLast = true
                    }
                } else {
                    if (this.value > 0 || Math.abs(this.value) < this.layout.deviationCompareValue) {
                        this.value = 0
                    }
                }
                this.percent = this.value / -maxScrollDistance
                if (this.isLast) {
                    this.percent += restPercent
                }
                this.lastVal = offset
                this.updateSlices()
                callback()
            }, 50)
        }
    }
}