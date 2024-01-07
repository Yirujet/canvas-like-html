import EventObserver from './EventObserver.js'
import { render } from './utils.js'
import Button from './Elements/Button.js'
import Checkbox from './Elements/Checkbox.js'
import CheckboxGroup from './Elements/CheckboxGroup.js'
import Radio from './Elements/Radio.js'
import RadioGroup from './Elements/RadioGroup.js'
import Dropdown from './Elements/Dropdown.js'
import Link from './Elements/Link.js'
import Span from './Elements/Span.js'
import Table from './Elements/Table.js'
import Watcher from './Watcher.js'

CanvasLikeHtml.elements = new Map()

CanvasLikeHtml.element = function(elName, elConstructor) {
    if (typeof elConstructor === 'function') {
        CanvasLikeHtml.elements.set(elName || elConstructor.elName, elConstructor)
    }
}

const toLowerCase = target => String(target).toLocaleLowerCase()

CanvasLikeHtml.element(toLowerCase(Button.elName), Button)
CanvasLikeHtml.element(toLowerCase(Checkbox.elName), Checkbox)
CanvasLikeHtml.element(toLowerCase(CheckboxGroup.elName), CheckboxGroup)
CanvasLikeHtml.element(toLowerCase(Radio.elName), Radio)
CanvasLikeHtml.element(toLowerCase(RadioGroup.elName), RadioGroup)
CanvasLikeHtml.element(toLowerCase(Dropdown.elName), Dropdown)
CanvasLikeHtml.element(toLowerCase(Link.elName), Link)
CanvasLikeHtml.element(toLowerCase(Span.elName), Span)
CanvasLikeHtml.element(toLowerCase(Table.elName), Table)

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

    const proxyObj = new WeakMap()
    const isObject = val => typeof val === 'object' && val !== null
    
    function reactive(target, propName, callback) {
        const res = proxyObj.get(target)
        if (res) {
            return res
        }
        const observed = new Proxy(target, {
            get(target, prop) {
                const result = Reflect.get(...arguments)
                if (isObject(result)) {
                    return reactive(result, propName + '.' + prop, callback)
                }
                return result
            },
            set(target, prop, value, receiver) {
                const result = Reflect.set(...arguments)
                if (callback) {
                    callback(target, prop, value, receiver, {
                        parentProp: propName,
                        bindingChain: propName + '.' + prop,
                        parentType: Object.prototype.toString.call(target)
                    })
                }
                return result
            },
        })
        proxyObj.set(target, observed)
        return observed
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
            this[propName] = reactive(target, propName, (function(target, prop, value, receiver, propInfo) {
                const { parentProp, bindingChain, parentType } = propInfo
                if (propsLinkedWithComps[bindingChain]) {
                    const propWatcher = propsLinkedWithComps[bindingChain]
                    propWatcher.comps.forEach(({comp, prop}) => {
                        comp[prop] = value
                        comp.render()
                    })
                } else {
                    if (primitiveProps[parentProp] || propsLinkedWithComps[parentProp]) {
                        const propWatcher = propsLinkedWithComps[parentProp]
                        propWatcher.comps.forEach(({comp, prop}) => {
                            if (Array.isArray(target)) {
                                comp[prop] = target
                            } else {
                                comp[prop] = value
                            }
                            comp.render()
                        })
                    }
                }
            }).bind(this))
        }
    }
    this.mount = function(target) {
        this.target = target
        this.ctx = this.target.getContext('2d')
        this.ctx.translate(0.5, 0.5)
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