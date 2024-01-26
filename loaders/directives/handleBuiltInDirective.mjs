import handleForDirective from './for.mjs'

const handleBuiltInDirective = (elAttrName, elAttrValue, elProps, node, elName, data, methods, scriptObj, elList) => {
    const directiveName = elAttrName.slice(1)
    switch (directiveName) {
        case 'for':
            handleForDirective(elAttrValue, elProps, node, elName, data, methods, scriptObj, elList)
            break
        default:
            break
    }
}

export default handleBuiltInDirective