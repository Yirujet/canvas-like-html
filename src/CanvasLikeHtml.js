import EventObserver from './EventObserver.js'
import { 
    render, 
    toLowerCase, 
    toReactiveKey, 
    calcDynamicPropValue, 
    isObject, 
    evalFn,
    obj2Temp
} from './utils.js'
import generateForRoot from './compile/generateForRoot.js'
import translate from './compile/translate.js'
import parse from './compile/parse.js'
import { createAST } from './compile/utils.js'
import Button from './Elements/Button.js'
import Checkbox from './Elements/Checkbox.js'
import CheckboxGroup from './Elements/CheckboxGroup.js'
import Radio from './Elements/Radio.js'
import RadioGroup from './Elements/RadioGroup.js'
import Dropdown from './Elements/Dropdown.js'
import Link from './Elements/Link.js'
import Span from './Elements/Span.js'
import Table from './Elements/Table.js'
import Input from './Elements/Input.js'
import Switch from './Elements/Switch.js'
import Progress from './Elements/Progress.js'
import Tag from './Elements/Tag.js'
import Rate from './Elements/Rate.js'
import Row from './Elements/Row.js'
import Col from './Elements/Col.js'

import Watcher from './Watcher.js'

CanvasLikeHtml.elements = new Map()

CanvasLikeHtml.element = function(elName, elConstructor) {
    if (typeof elConstructor === 'function') {
        CanvasLikeHtml.elements.set(elName || elConstructor.elName, elConstructor)
    }
}

CanvasLikeHtml.element(toLowerCase(Button.elName), Button)
CanvasLikeHtml.element(toLowerCase(Checkbox.elName), Checkbox)
CanvasLikeHtml.element(toLowerCase(CheckboxGroup.elName), CheckboxGroup)
CanvasLikeHtml.element(toLowerCase(Radio.elName), Radio)
CanvasLikeHtml.element(toLowerCase(RadioGroup.elName), RadioGroup)
CanvasLikeHtml.element(toLowerCase(Dropdown.elName), Dropdown)
CanvasLikeHtml.element(toLowerCase(Link.elName), Link)
CanvasLikeHtml.element(toLowerCase(Span.elName), Span)
CanvasLikeHtml.element(toLowerCase(Table.elName), Table)
CanvasLikeHtml.element(toLowerCase(Input.elName), Input)
CanvasLikeHtml.element(toLowerCase(Switch.elName), Switch)
CanvasLikeHtml.element(toLowerCase(Progress.elName), Progress)
CanvasLikeHtml.element(toLowerCase(Tag.elName), Tag)
CanvasLikeHtml.element(toLowerCase(Rate.elName), Rate)
CanvasLikeHtml.element(toLowerCase(Row.elName), Row)
CanvasLikeHtml.element(toLowerCase(Col.elName), Col)

export default function CanvasLikeHtml(props) {
    this.target = null
    this.ctx = null
    this.x = 0
    this.y = 0
    this.width = null
    this.height = null
    this.globalProps = {
        padding: 12,
        fontSize: 12,
        fontFamily: 'Helvetica Neue',
        lineHeight: 12,
        mode: 'development',
    }
    this.elements = []
    this.eventObserver = new EventObserver()
    this.data = {}
    this.methods = {}
    const propsLinkedWithComps = {}
    const propsObj = props
    if (props) {
        for (let name in props) {
            if (name in this) {
                this[name] = props[name]
            }
        }
    }
    this._c = render.bind(this)

    const addPropsLinkdWithComp = (propChain, data, comp, compProp, exp, loopChain) => {
        let bindDataProp = toReactiveKey(propChain, data)
        if (!propsLinkedWithComps[bindDataProp]) {
            propsLinkedWithComps[bindDataProp] = new Watcher()
        }
        propsLinkedWithComps[bindDataProp].add({
            comp,
            prop: compProp,
            exp,
            loopChain
        })
    }

    const linkCompsWithData = (data) => {
        const deepQuery = list => {
            list.forEach(comp => {
                if (comp.watchedProps && Object.keys(comp.watchedProps).length > 0) {
                    Object.entries(comp.watchedProps).forEach(([compProp, bindingProps]) => {
                        if (Array.isArray(bindingProps)) {
                            bindingProps.forEach(({ prop: bindingProp, exp, loopChain }) => {
                                let propList = []
                                if (loopChain) {
                                    bindingProp.split('.').forEach(propName => {
                                        const curScope = loopChain.find(({$$loopItemName, $$loopSource}) => [$$loopItemName, $$loopSource.split('.').at(-1)].includes(propName))
                                        if (curScope) {
                                            const {$$loopExp, $$loopIndexName, $$loopIndex, $$loopSource} = curScope
                                            const forDirectiveRegExp = /^(?<exp>\(\S+(?:,\s*\S+)?\)|\S+)\s+in(?<source>\s+\S+)$/
                                            const forDirectiveMatch = $$loopExp.match(forDirectiveRegExp)
                                            const forSource = forDirectiveMatch.groups.source.trim()
                                            const sourceName = forSource.split('.').at(-1)
                                            if ($$loopSource.split('.').at(-1) === propName) {
                                                let sourceProp = ''
                                                if (propList.length > 0) {
                                                    sourceProp = propList.join('') + '.' + sourceName
                                                } else {
                                                    sourceProp = sourceName
                                                }
                                                addPropsLinkdWithComp(sourceProp, data, comp, compProp, exp, loopChain)
                                            }
                                            if (propList.length > 0) {
                                                propList.push(`.${sourceName}.${$$loopIndex[$$loopIndexName]}`)
                                            } else {
                                                propList.push(`${sourceName}.${$$loopIndex[$$loopIndexName]}`)
                                            }
                                        } else {
                                            if (propList.length > 0) {
                                                propList.push(`.${propName}`)
                                            }
                                        }
                                    })
                                }
                                let realBindingProp = bindingProp
                                if (propList.length > 0) {
                                    realBindingProp = propList.join('')
                                }
                                addPropsLinkdWithComp(realBindingProp, data, comp, compProp, exp, loopChain)
                            })
                        }
                    })
                }
                if (['row', 'col'].includes(comp.constructor.elName)) {
                    if (comp.children && Array.isArray(comp.children)) {
                        deepQuery(comp.children)
                    }
                }
            })
        }
        deepQuery(this.elements)
    }

    const proxyObj = new WeakMap()
    
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
            }
        })
        proxyObj.set(target, observed)
        return observed
    }
    const reCompileForDirectiveTemplate = (comp) => {
        let parentEl = comp
        while (parentEl.parentElement !== this) {
            parentEl = parentEl.parentElement
        }
        const templateObj = evalFn(`(${parentEl.$$template[0].replace(/(?:\r|\n)*/g, '')})`)()
        const rootChildTemplate = obj2Temp(templateObj, parentEl.constructor.elName, '')
        const nodeList = parse(rootChildTemplate)
        const root = createAST(nodeList)
        const elList = translate(root, {}, {}, { ...this.data, ...this.methods })
        const renderRegExp = /^h\((?:'|")(?<elName>[^)(]+)(?:'|")(?:\s*,\s*(?<elProps>{(?:.|\r|\n)*}))\)$/
        elList.forEach(e => {
            const elProps = evalFn(e.match(renderRegExp).groups.elProps)()
            const clear = (target) => {
                this.eventObserver.clear([target])
                if (target.children) {
                    target.children.forEach(child => clear(child))
                }
            }
            clear(parentEl)
            parentEl.children = null
            parentEl.$$render_children = elProps.$$render_children
            parentEl.render()
        })
    }
    const reactiveData = (data) => {
        for (let propName in data) {
            this[propName] = reactive({
                value: data[propName]
            }, propName, (function(target, prop, value, receiver, propInfo) {
                const { parentProp, bindingChain, parentType } = propInfo
                if (propsLinkedWithComps[bindingChain]) {
                    const propWatcher = propsLinkedWithComps[bindingChain]
                    propWatcher.comps.forEach(({comp, prop, exp, loopChain}) => {
                        if (prop === '$$for') {
                            reCompileForDirectiveTemplate(comp)
                        } else {
                            comp.render({ [prop]: calcDynamicPropValue(exp, loopChain, this) })
                        }
                    })
                } else {
                    if (propsLinkedWithComps[parentProp]) {
                        const propWatcher = propsLinkedWithComps[parentProp]
                        propWatcher.comps.forEach(({comp, prop, exp, loopChain}) => {
                            if (Array.isArray(target)) {
                                if (prop === '$$for') {
                                    reCompileForDirectiveTemplate(comp)
                                } else {
                                    comp.render({ [prop]: target })
                                }
                            } else {
                                comp.render({ [prop]: calcDynamicPropValue(exp, loopChain, this) })
                            }
                        })
                    }
                }
            }).bind(this))
        }
    }
    this.mount = function(target) {
        this.target = target
        this.ctx = this.target.getContext('2d')
        const { width, height } = target.getBoundingClientRect()
        this.target.style.width = `${width}px`
        this.target.style.height = `${height}px`
        if (this.width === null) {
            this.width = width
            this.target.width = width * window.devicePixelRatio
        }
        if (this.height === null) {
            this.height = height
            this.target.height = height * window.devicePixelRatio
        }
        this.ctx.translate(0.5, 0.5)
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        if (propsObj?.render) {
            const $$canvasInstance = propsObj.render.call(this, this._c)
            if ($$canvasInstance.data) {
                this.data = { data: $$canvasInstance.data }
                reactiveData($$canvasInstance.data)
            }
            if ($$canvasInstance.methods) {
                this.methods = { methods: $$canvasInstance.methods }
            }
            if ($$canvasInstance.comps) {
                this.elements = $$canvasInstance.comps
                if ($$canvasInstance.created) {
                    $$canvasInstance.created.call(this)
                }
                if (Array.isArray(this.elements)) {
                    this.elements.forEach(comp => comp.render())
                } else {
                    this.elements.render()
                }
                linkCompsWithData($$canvasInstance.data)
            }
            if ($$canvasInstance.mounted) {
                $$canvasInstance.mounted.call(this)
            }
        }
        this.eventObserver.observe(this.target)
    }
}