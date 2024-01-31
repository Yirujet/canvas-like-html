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
    this.parentElement = null
    this.cursor = 'default'
    this.$$key = null
    this.$$template = null
    this.$$for = null
    this.$$for_key = null
    this.$$for_exp = null
    this.$$props = {}
    this.$$render_children = null
    this.$$scope_chain = []
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