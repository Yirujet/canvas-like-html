import handleDynamicProp from './handleDynamicProp.mjs'
import handleDynamicEvent from './handleDynamicEvent.mjs'
import handleBuiltInDirective from './directives/handleBuiltInDirective.mjs'
import { obj2Str, calcDynamicTemplate } from './utils.mjs'

const translate = (node, data, scriptObj) => {
    let elList = []
    Reflect.ownKeys(node.children).forEach(elName => {
        const elProps = {}
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
                handleBuiltInDirective(elAttrName, elAttrValue, node, elName, data, scriptObj, elList)
                if (elAttrName === '*for') {
                    break
                }
            } else if (elAttrName.startsWith(':')) {
                handleDynamicProp(elAttrName, elAttrValue, elProps, data, scriptObj, node, elName)
            } else if (elAttrName.startsWith('@')) {
                handleDynamicEvent(elAttrName, elAttrValue, elProps, scriptObj)
            } else {
                elProps[elAttrName] = elAttrValue
            }
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
                        elProps.$$render_children = translate(node.children[elName], data, scriptObj)
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