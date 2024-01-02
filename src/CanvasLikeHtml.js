import EventObserver from './EventObserver.js'
import { render } from './utils.js'
import Button from './Elements/Button.js'
import Checkbox from './Elements/Checkbox.js'
import Dropdown from './Elements/Dropdown.js'
import Link from './Elements/Link.js'
import Span from './Elements/Span.js'
import Table from './Elements/Table.js'

CanvasLikeHtml.elements = new Map()

CanvasLikeHtml.element = function(elName, elConstructor) {
    if (typeof elConstructor === 'function') {
        CanvasLikeHtml.elements.set(elName || elConstructor.name, elConstructor)
    }
}

const toLowerCase = target => String(target).toLocaleLowerCase()

CanvasLikeHtml.element(toLowerCase(Button.name), Button)
CanvasLikeHtml.element(toLowerCase(Checkbox.name), Checkbox)
CanvasLikeHtml.element(toLowerCase(Dropdown.name), Dropdown)
CanvasLikeHtml.element(toLowerCase(Link.name), Link)
CanvasLikeHtml.element(toLowerCase(Span.name), Span)
CanvasLikeHtml.element(toLowerCase(Table.name), Table)

export default function CanvasLikeHtml(props) {
    this.target = null
    this.ctx = null
    this.width = null
    this.height = null
    this.globalProps = {
        padding: 12,
        fontSize: 14,
        fontFamily: 'Helvetica',
        lineHeight: 12
    }
    this.eventObserver = new EventObserver()
    const propsObj = props
    if (props) {
        for (let name in props) {
            if (name in this) {
                this[name] = props[name]
            }
        }
    }
    this._c = render.bind(this)
    this.mount = function(target) {
        this.target = target
        this.ctx = this.target.getContext('2d')
        if (this.width === null) {
            this.width = this.target.width
        }
        if (this.height === null) {
            this.height = this.target.height
        }
        if (propsObj?.render) {
            const renderObj = propsObj.render.call(this, this._c)
            if (renderObj.comps) {
                if (renderObj.created) {
                    renderObj.created.call(this)
                }
                if (Array.isArray(renderObj.comps)) {
                    renderObj.comps.forEach(comp => comp.render())
                } else {
                    renderObj.comps.render()
                }
                if (renderObj.mounted) {
                    renderObj.mounted.call(this)
                }
            }
        }
        this.eventObserver.observe(this.target)
    }
}