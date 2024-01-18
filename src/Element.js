import inheritProto from './inherite.js'
import Event from './Event.js'

inheritProto(Element, Event)
export default function Element() {
    Event.call(this)
    this.ctx = null
    this.x = null
    this.y = null
    this.width = null
    this.height = null
    this.eventObserver = null
    this.mouseEntered = false
    this.globalProps = null
    this.root = null
    this.watchedProps = []
    this.$$render_children = null
    this.initProps = props => {
        if (props) {
            for (let name in props) {
                if (name in this) {
                    this[name] = props[name]
                }
            }
            this.registerListenerFromOnProp(props?.on)
        }
    }
}