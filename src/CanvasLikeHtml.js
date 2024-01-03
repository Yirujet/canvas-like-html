import EventObserver from './EventObserver.js'
import { render } from './utils.js'
import Button from './Elements/Button.js'
import Checkbox from './Elements/Checkbox.js'
import Dropdown from './Elements/Dropdown.js'
import Link from './Elements/Link.js'
import Span from './Elements/Span.js'
import Table from './Elements/Table.js'
import Watcher from './Watcher.js'

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
    this.elements = []
    this.eventObserver = new EventObserver()
    const propsLinkedWithComps = {}
    const propsObj = props
    const primitiveProps = {}
    if (props) {
        for (let name in props) {
            if (name in this) {
                this[name] = props[name]
            }
        }
    }
    this._c = render.bind(this)
    const linkCompsWithData = () => {
        this.elements.forEach(comp => {
            if (comp.watchedProps && Array.isArray(comp.watchedProps)) {
                comp.watchedProps.forEach(prop => {
                    const [[compProp, bindProp]] = Object.entries(prop)
                    if (!propsLinkedWithComps[bindProp]) {
                        propsLinkedWithComps[bindProp] = new Watcher()
                    }
                    propsLinkedWithComps[bindProp].add({
                        comp,
                        prop: compProp,
                    })
                })
            }
        })
    }
    const handleWatcher = (data) => {
        for (let propName in data) {
            let target
            if (['string', 'number', 'boolean'].includes(typeof data[propName])) {
                primitiveProps[propName] = true
                target = {
                    value: data[propName]
                }
            } else {
                target = data[propName]
            }
            this[propName] = new Proxy(target, {
                get(target, prop, receiver) {
                    return Reflect.get(...arguments)
                },
                set(obj, prop, value) {
                    obj[prop] = value
                    if (propsLinkedWithComps[propName]) {
                        const propWatcher = propsLinkedWithComps[propName]
                        propWatcher.comps.forEach(({comp, prop}) => {
                            if (primitiveProps[propName]) {
                                comp[prop] = value
                            } else {
                                comp[prop] = obj
                            }
                            comp.render()
                        })
                    }
                    return Reflect.set(...arguments)
                },
            })
        }
    }
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
            if (renderObj.data) {
                handleWatcher(renderObj.data)
            }
            if (renderObj.comps) {
                this.elements = renderObj.comps
                linkCompsWithData()
                if (renderObj.created) {
                    renderObj.created.call(this)
                }
                if (Array.isArray(this.elements)) {
                    this.elements.forEach(comp => comp.render())
                } else {
                    this.elements.render()
                }
            }
            if (renderObj.mounted) {
                renderObj.mounted.call(this)
            }
        }
        this.eventObserver.observe(this.target)
    }
}