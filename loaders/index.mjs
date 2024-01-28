import parse from './parse.mjs'
import { evalFn, obj2Str, createAST } from './utils.mjs'
import translate from './translate.mjs'
// import generateForRoot from './generateForRoot.mjs'
import HTMLParser from './htmlparser.mjs'

export default function(source) {
    const nodeList = parse(source)
    const root = createAST(nodeList)
    let elList = []
    let scriptImport = ''
    let mountedFn = null
    let createdFn = null
    let data = {}
    let methods = {
        HTMLParser,
        // generateForRoot,
        obj2Str,
        // parse,
        createAST
    }
    if (root.children) {
        const rootNodeKeys = Reflect.ownKeys(root.children)
        const canvasNodeIndex = rootNodeKeys.findIndex(item => item.description === 'canvas')
        const scriptNodeIndex = rootNodeKeys.findIndex(item => item.description === 'script')
        const canvasNode = root.children[rootNodeKeys[canvasNodeIndex]]
        const scriptNode = root.children[rootNodeKeys[scriptNodeIndex]]
        const scriptContent = scriptNode.content.trim()
        let scriptObj
        let scriptObjStartText = 'export default'
        let scriptObjIndex = scriptContent.indexOf(scriptObjStartText)
        if (scriptContent.startsWith('import')) {
            scriptImport = scriptContent.slice(0, scriptObjIndex - 1)
        }
        if (!!~scriptObjIndex) {
            scriptObj = (evalFn(scriptContent.slice(scriptObjIndex + scriptObjStartText.length)))()
        } else {
            scriptObj = (evalFn(scriptContent.slice(scriptObjIndex)))()
        }
        if (scriptObj.created) {
            createdFn = scriptObj.created
        }
        if (scriptObj.mounted) {
            mountedFn = scriptObj.mounted
        }
        elList = translate(canvasNode, data, methods, scriptObj)
    }
    const result = `
        ${ scriptImport }
        export default {
            ${obj2Str({data})}
            ${obj2Str({methods})}
            ${createdFn ? obj2Str({created: createdFn}) : ''}
            ${mountedFn ? obj2Str({mounted: mountedFn}) : ''}
            render: h => [${elList}]
        }
    `
    return result
}