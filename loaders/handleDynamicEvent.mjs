import { evalFn, isArrowFunction, arrowFnRegExp, declareFnRegExp } from './utils.mjs'

const handleDynamicEvent = (elAttrName, elAttrValue, elProps, data, methods, scriptObj, node, elName) => {
    const eventName = elAttrName.slice(1)
    if (!elProps.on) {
        elProps.on = {}
    }
    if (!elProps.watchedEvents) {
        elProps.watchedEvents = {}
    }
    let fn
    let fnName
    try {
        fn = evalFn(elAttrValue)()
        elProps.on[eventName] = fn
    } catch (e) {
        try {
            if (isArrowFunction(elAttrValue)) {
                const fnContent = elAttrValue.trim()
                const arrowFnMatch = fnContent.match(arrowFnRegExp)
                if (arrowFnMatch) {
                    fnName = `anonymous-${elProps.$$key}`
                    fn = evalFn(elAttrValue)
                }
            } else {
                const fnContent = elAttrValue.trim()
                const declareFnMatch = fnContent.match(declareFnRegExp)
                if (declareFnMatch) {
                    fnName = declareFnMatch.groups.name.trim()
                    fn = scriptObj.methods[fnName]
                }
            }
            methods[fnName] = fn
            elProps.on[eventName] = fn
            elProps.watchedEvents[eventName] = {
                fnName,
                loopChain: node.children[elName].$$loopChain
            }
        } catch (e) {
            console.error(e)
        }
    }
}

export default handleDynamicEvent