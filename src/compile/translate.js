import handleDynamicProp from './handleDynamicProp.js'
import handleDynamicEvent from './handleDynamicEvent.js'
import handleBuiltInDirective from './directives/handleBuiltInDirective.js'
import { obj2Str, calcDynamicTemplate } from './utils.js'
import { v4 as uuidV4 } from 'uuid'

const translate = (node, data, methods, scriptObj) => {
    let elList = []
    Reflect.ownKeys(node.children).forEach(elName => {
        const elProps = {
            $$key: uuidV4(),
            $$scope_chain: []
        }
        const attrsList = Object.keys(node.children[elName].attrs)
        attrsList.sort((e1, e2) => {
            if (e1.startsWith('*')) {
                return -1
            } else {
                return 0
            }
        })
        for (let i = 0, l = attrsList.length; i < l; i++) {
            let elAttrName = attrsList[i]
            let elAttrValue = node.children[elName].attrs[elAttrName]
            if (elAttrName.startsWith('*')) {
                handleBuiltInDirective(elAttrName, elAttrValue, elProps, node, elName, data, methods, scriptObj, elList)
                if (elAttrName === '*for') {
                    break
                }
            } else if (elAttrName.startsWith(':')) {
                if (!node.children[elName].$$loopChain) {
                    node.children[elName].$$loopChain = node.$$loopChain
                }
                handleDynamicProp(elAttrName, elAttrValue, elProps, data, scriptObj, node, elName)
            } else if (elAttrName.startsWith('@')) {
                if (!node.children[elName].$$loopChain) {
                    node.children[elName].$$loopChain = node.$$loopChain
                }
                handleDynamicEvent(elAttrName, elAttrValue, elProps, data, methods, scriptObj, node, elName)
            } else {
                if (!node.children[elName].$$loopChain) {
                    node.children[elName].$$loopChain = node.$$loopChain
                }
                elProps[elAttrName] = elAttrValue
            }
        }
        if (node.children[elName].$$loopChain) {
            elProps.$$scope_chain = node.children[elName].$$loopChain
        }
        //  If the node attribute contains *for, the collection of this node will be skipped because all nodes will be created in the built-in for directive.
        if (!attrsList.includes('*for')) {
            switch (elName.description) {
                case 'button':
                case 'checkbox':
                case 'dropdown':
                case 'link':
                case 'span':
                case 'radio':
                case 'tag':
                    if (node.children[elName].content) {
                        const dynamicContent = /^{{\s*.+\s*}}$/
                        const content = node.children[elName].content.trim()
                        if (dynamicContent.test(content)) {
                            const name = node.children[elName].content.slice(2, -2).trim()
                            elProps.text = calcDynamicTemplate(name, node.children[elName].$$loopChain, scriptObj.data)
                        } else {
                            elProps.text = node.children[elName].content
                        }
                    }
                    break
                case 'checkbox-group':
                case 'radio-group':
                case 'row':
                case 'col':
                    if (node.children[elName].children && Reflect.ownKeys(node.children[elName].children).length > 0) {
                        elProps.$$render_children = translate(node.children[elName], data, methods, scriptObj)
                    } else {
                        elProps.$$render_children = []
                    }
                    break
                default:
                    break
            }
            elList.push(`h('${elName.description}', {${obj2Str(elProps)}})`)
        }
    })
    return elList
}

export default translate