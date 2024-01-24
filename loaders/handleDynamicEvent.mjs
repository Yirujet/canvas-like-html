import { evalFn, isArrowFunction, arrowFnRegExp } from './utils.mjs'

const handleDynamicEvent = (elAttrName, elAttrValue, elProps, scriptObj, node, elName) => {
    const eventName = elAttrName.slice(1)
    if (!elProps.on) {
        elProps.on = {}
    }
    let fn
    try {
        fn = evalFn(elAttrValue)()
        elProps.on[eventName] = fn
    } catch (e) {
        try {
            if (isArrowFunction(elAttrValue)) {
                const fnContent = elAttrValue.trim()
                const arrowFnMatch = fnContent.match(arrowFnRegExp)
                if (arrowFnMatch) {
                    const fnArgsContent = arrowFnMatch.groups.args.trim()
                    const fnBodyContent = arrowFnMatch.groups.body.trim()
                    let fnArgNames
                    if (fnArgsContent.startsWith('(')) {
                        fnArgNames = fnArgsContent.slice(1, -1).split(',').map(e => e.trim())
                    } else {
                        fnArgNames = [fnArgsContent.trim()]
                    }
                    
                }
            } else {

            }
            fn = scriptObj.methods[elAttrValue]
            elProps.on[eventName] = fn
        } catch (e) {
            console.error(e)
        }
    }
}

export default handleDynamicEvent