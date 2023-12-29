import inheritProto from "../../inherite.js";
import Scrollbar from "./Scrollbar.js";

inheritProto(HorizontalScrollbar, Scrollbar)
export default function HorizontalScrollbar(layout, sliceUnitVal, dataSize, callback, eventObserver) {
    Scrollbar.call(this, layout, dataSize, callback, eventObserver)
    this.track.height = 16
    this.thumb.height = 16
    this.sliceUnitVal = sliceUnitVal
    this.maxShowCount = Math.ceil((this.layout.width - this.layout.fixedLeftWidth - this.layout.fixedRightWidth) / this.sliceUnitVal)
    const initEvents = () => {
        const onStartScroll = e => {
            this.updatePosition()
            const { offsetX } = e
            this.checkHit(e)
            this.scrollMove(
                offsetX,
                'offsetX',
                this.track.width - this.thumb.width,
                this.layout.restWidth / this.sliceUnitVal,
                this.callback
            )
            const onEndScroll = () => {
                this.lastVal = null
                this.dragging = false
                this.callback()
                window.removeEventListener('mousemove', this.moveEvent)
                this.moveEvent = null
                window.removeEventListener('mouseup', onEndScroll)
            }
            if (this.dragging) {
                window.addEventListener('mousemove', this.moveEvent)
                window.addEventListener('mouseup', onEndScroll)
            }
        }
        const defaultEventListeners = {
            mousedown: onStartScroll
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    const init = () => {
        if (this.layout.bodyRealWidth > this.layout.width - this.layout.fixedLeftWidth - this.layout.fixedRightWidth) {
            this.show = true
        }
        if (this.show) {
            this.x = 0
            this.y = this.layout.height
            this.track.width = this.layout.width
            this.thumb.width = this.track.width * (this.track.width / this.layout.bodyRealWidth)
            if (this.thumb.width < this.thumb.min) {
                this.thumb.width = this.thumb.min
            }
            this.thumb.padding = (this.track.height - this.thumb.height) / 2
        }
        this.updatePosition()
        this.updateSlices()
        initEvents()
    }
    this.updatePosition = function() {
        const horizontalThumbX = this.x - this.value
        const horizontalThumbY = this.y + this.thumb.padding
        const horizontalThumbWidth = this.thumb.width
        const horizontalThumbHeight = this.thumb.height
        this.position = {
            leftTop: {
                x: horizontalThumbX,
                y: horizontalThumbY
            },
            rightTop: {
                x: horizontalThumbX + horizontalThumbWidth,
                y: horizontalThumbY
            },
            rightBottom: {
                x: horizontalThumbX + horizontalThumbWidth,
                y: horizontalThumbY + horizontalThumbHeight
            },
            leftBottom: {
                x: horizontalThumbX,
                y: horizontalThumbY + horizontalThumbHeight
            }
        }
    }
    init()
}