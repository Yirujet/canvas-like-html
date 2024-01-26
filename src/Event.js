import { isObject, arrowFnRegExp, declareFnRegExp } from './utils'

export default function Event() {
    this.events = {}
    this.addEvent = function(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [callback]
        } else {
            this.events[eventName].push(callback)
        }
    }
    this.removeEvent = function(eventName, callback) {
        if (this.events[eventName]) {
            const index = this.events[eventName].findIndex(e => e === callback)
            this.events.splice(index, 1)
        }
    }
    this.triggerEvent = function(eventName, ...params) {
        const eventList = this.events[eventName]
        if (eventList) {
            eventList.forEach(event => {
                event.call(this.root, ...params)
            })
        }
    }
    this.triggerClickEvent = function(eventName, ...params) {
        if (!this.mouseEntered) return
        if (this.disabled) return
        const eventList = this.events[eventName]
        if (eventList) {
            eventList.forEach(event => {
                event.call(this.root, ...params)
            })
        }
    }
    this.registerListenerFromOnProp = function(onObj) {
        if (onObj) {
            Object.entries(onObj).forEach(([eventname, callback]) => {
                if (this.watchedEvents && this.watchedEvents[eventname]) {
                    const injectVars = {}
                    const {loopChain} = this.watchedEvents[eventname]
                    if (loopChain && Array.isArray(loopChain)) {
                        loopChain.forEach(({$$loopIndex, $$loopIndexName, $$loopItem, $$loopItemName}) => {
                            injectVars[$$loopIndexName] = $$loopIndex[$$loopIndexName]
                            injectVars[$$loopItemName] = $$loopItem[$$loopItemName]
                        })
                    }
                    const injectVarsContent = Object.entries(injectVars)
                    .map(([varName, varVal]) => `var ${varName}=${isObject(varVal) ? JSON.stringify(varVal) : typeof varVal === 'number' ? varVal : '\'' + varVal + '\''};`)
                    .join(' ')
                    const callbackBody = callback.toString().trim()
                    let fnBody = ''
                    if (arrowFnRegExp.test(callbackBody)) {
                        fnBody = callbackBody.match(arrowFnRegExp).groups.body.trim()
                    } else if (declareFnRegExp.test(callbackBody)) {
                        fnBody = callbackBody.match(declareFnRegExp).groups.body.trim()
                    }
                    fnBody = fnBody.replace(/^{((?:.|\r\n)*)}$/, '$1').trim()
                    const injectedCallback = new Function(
                        `return function() { ${injectVarsContent} ${fnBody} }`
                    )()
                    this.addEvent(eventname, injectedCallback.bind(this))
                } else {
                    this.addEvent(eventname, callback)
                }
                if (eventname in this.eventObserver) {
                    const i = this.eventObserver[eventname].findIndex(e => e === this)
                    if (!!~i) {
                        this.eventObserver[eventname].splice(i, 1, this)
                    } else {
                        this.eventObserver[eventname].push(this)
                    }
                }
            })
        }
    }
}