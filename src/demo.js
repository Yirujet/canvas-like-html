// import { head, data } from './mock.js';
import CanvasLikeHtml from './CanvasLikeHtml.js'

import testCanvas from './test.canvas'

document.body.onload = () => {
    new CanvasLikeHtml({
        render: h => h(testCanvas)
    }).mount(document.getElementById('canvas'))
}