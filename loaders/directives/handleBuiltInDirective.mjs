import handleForDirective from './for.mjs'

const handleBuiltInDirective = (elAttrName, elAttrValue, node, elName, data, scriptObj, elList) => {
    const directiveName = elAttrName.slice(1)
    switch (directiveName) {
        case 'for':
            handleForDirective(elAttrValue, node, elName, data, scriptObj, elList)
            break
        default:
            break
    }
}

export default handleBuiltInDirective