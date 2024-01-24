import { evalFn, getVars, getVarValues, calcDynamicTemplate } from './utils.mjs'

const handleDynamicProp = (elAttrName, elAttrValue, elProps, data, scriptObj, node, elName) => {
    const attrName = elAttrName.slice(1)
    if (!elProps.watchedProps) {
        elProps.watchedProps = {}
    }
    try {
        elProps[attrName] = (evalFn(elAttrValue))()
    } catch (e) {
        try {
            //  binding the prop of object
            const vars = getVars(elAttrValue)
            const varVals = getVarValues(vars, node.children[elName].$$loopChain, scriptObj.data)
            elProps[attrName] = calcDynamicTemplate(elAttrValue, node.children[elName].$$loopChain, scriptObj.data)
            Object.entries(varVals)
                .filter(([, { fromScriptData }]) => fromScriptData)
                .forEach(([bindingPropName, { value }]) => {
                    if (bindingPropName.includes('.')) {
                        const bindingChain = bindingPropName.split('.')
                        let attrObj
                        bindingChain.forEach((attr, i, arr) => {
                            if (i === 0) {
                                if (!data[attr]) {
                                    data[attr] = {}
                                }
                                attrObj = data[attr]
                            } else if (i < arr.length - 1) {
                                if (!attrObj[attr]) {
                                    attrObj[attr] = {}
                                }
                                attrObj = attrObj[attr]
                            } else {
                                attrObj[attr] = value
                            }
                        })
                    } else {
                        data[bindingPropName] = value
                    }
                    if (!elProps.watchedProps[attrName]) {
                        elProps.watchedProps[attrName] = [{
                            prop: bindingPropName,
                            exp: elAttrValue,
                            loopChain: node.children[elName].$$loopChain
                        }]
                    } else {
                        elProps.watchedProps[attrName].push({
                            prop: bindingPropName,
                            exp: elAttrValue,
                            loopChain: node.children[elName].$$loopChain
                        })
                    }
                }
            )
        } catch (e) {
            console.error(e)
        }
    }
}

export default handleDynamicProp