import { head, data } from './mock.js';
import CanvasLikeHtml from './CanvasLikeHtml.js';

document.body.onload = () => {
    const canvasLikeHtml = new CanvasLikeHtml({
        render: h => h('table', {
            columns: head,
            data,
            width: 1800,
            height: 850
            // on: {
            //     'selection-change': (val) => {
            //         console.log(val)
            //     }
            // }
        })
    }).mount(document.getElementById('canvas'))
}