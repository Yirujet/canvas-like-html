// import { head, data } from './mock.js';

import testCanvas from './test.canvas'

document.body.onload = () => {
    testCanvas.mount(document.getElementById('canvas'))
}