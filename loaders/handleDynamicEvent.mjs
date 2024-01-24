import { evalFn } from './utils.mjs'

const handleDynamicEvent = (elAttrName, elAttrValue, elProps, scriptObj) => {
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
            fn = scriptObj.methods[elAttrValue]
            elProps.on[eventName] = fn
        } catch (e) {
            console.error(e)
        }
    }
}

export default handleDynamicEvent