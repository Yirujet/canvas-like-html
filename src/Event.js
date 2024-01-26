import { isObject, arrowFnRegExp, declareFnRegExp, evalFn } from './utils'

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
                    const getFnMatch = fnExp => {
                        let fnArgs = ''
                        let fnBody = ''
                        if (arrowFnRegExp.test(fnExp)) {
                            const fnMatch = fnExp.match(arrowFnRegExp)
                            if (fnMatch) {
                                if (fnMatch.groups.args) {
                                    fnArgs = fnMatch.groups.args.trim()
                                }
                                if (fnMatch.groups.body) {
                                    fnBody = fnMatch.groups.body.trim()
                                }
                            }
                        } else if (declareFnRegExp.test(fnExp)) {
                            const fnMatch = fnExp.match(declareFnRegExp)
                            if (fnMatch) {
                                if (fnMatch.groups.args) {
                                    fnArgs = fnMatch.groups.args.trim()
                                }
                                if (fnMatch.groups.body) {
                                    fnBody = fnMatch.groups.body.trim()
                                }
                            }
                        }
                        return { fnArgs, fnBody }
                    }
                    const getFnArgList = fnArgs => {
                        if (/^\(.*\)$/.test(fnArgs)) {
                            return fnArgs.slice(1, -1).split(',').map(e => e.trim())
                        } else {
                            return [fnArgs]
                        }
                    }
                    const bindingFnExp = this.watchedEvents[eventname].fnExp.toString().trim()
                    const definationFnExp = callback.toString().trim()
                    let { fnArgs: definationFnArgs, fnBody } = getFnMatch(definationFnExp)
                    let { fnArgs: bindingFnArgs } = getFnMatch(bindingFnExp)
                    let definationFnArgList = getFnArgList(definationFnArgs)
                    let bindingFnArgList = getFnArgList(bindingFnArgs)
                    const callbackScope = {}
                    definationFnArgList.forEach((definationFnArgName, index) => {
                        if (definationFnArgName) {
                            callbackScope[definationFnArgName] = bindingFnArgList[index]
                        }
                    })
                    const injectVars = {}
                    Object.entries(callbackScope).forEach(([definationFnArgName, scopeVarName]) => {
                        let scopeVarObj = this.$$scope_chain.findLast(({$$loopIndexName, $$loopItemName}) => [$$loopIndexName, $$loopItemName].includes(scopeVarName))
                        if (scopeVarObj) {
                            if (scopeVarName === scopeVarObj.$$loopItemName) {
                                injectVars[definationFnArgName] = scopeVarObj.$$loopItem[scopeVarName]
                            } else {
                                injectVars[definationFnArgName] = scopeVarObj.$$loopIndex[scopeVarName]
                            }
                        } else {
                            try {
                                injectVars[definationFnArgName] = evalFn(scopeVarName)()
                            } catch (e) {
                                injectVars[definationFnArgName] = undefined
                            }
                        }
                    })
                    const injectVarsContent = Object.entries(injectVars)
                        .map(([varName, varVal]) => `var ${varName}=${isObject(varVal) ? JSON.stringify(varVal) : ['number', 'undefined'].includes(typeof varVal) ? varVal : '\'' + varVal + '\''};`)
                        .join(' ')
                    const injectedCallback = new Function(`return function() { ${injectVarsContent} ${fnBody} }`)()
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