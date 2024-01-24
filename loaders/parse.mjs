import HTMLParser from './htmlparser.mjs'

const parse = source => {
    const nodes = []
    HTMLParser(source, (function() {
        var obj = {}
        !['start', 'end', 'comment', 'chars'].forEach(x => {
            obj[x] = function (...args) {
                if (x !== 'chars' || !/^[\s\r\n\t]*$/g.test(args[0])) {
                    nodes.push({ tagType: x, attrs: args })
                }
            }
        })
        return obj
    })())
    return nodes
}

export default parse