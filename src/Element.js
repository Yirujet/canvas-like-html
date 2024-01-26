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
    this.watchedProps = {}
    this.watchedEvents = {}
    this.$$key = null
    this.$$for = null
    this.$$forExp = null
    this.$$props = {}
    this.$$render_children = null
    this.parentElement = null
    this.cursor = 'default'
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