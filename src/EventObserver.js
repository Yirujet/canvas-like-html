const GlobalEvents = {
    mouseleave: {
        dispatchEvents: {
            mouseleave: {
                triggerName: 'triggerEvent'
            }
        }
    },
    mousemove: {
        dispatchEvents: {
            mousemove: {
                triggerName: 'triggerEvent'
            },
            mouseenter: {
                triggerName: 'triggerEvent'
            },
            mouseleave: {
                triggerName: 'triggerEvent'
            },
        }
    },
    mousedown: {
        dispatchEvents: {
            mousedown: {
                triggerName: 'triggerEvent'
            }
        }
    },
    mouseup: {
        dispatchEvents: {
            mouseup: {
                triggerName: 'triggerEvent',
            }
        }
    },
    click: {
        dispatchEvents: {
            click: {
                triggerName: 'triggerClickEvent',
            },
            clickoutside: {
                triggerName: 'triggerEvent'
            }
        }
    },
    wheel: {
        dispatchEvents: {
            wheel: {
                triggerName: 'triggerEvent'
            }
        }
    }
}

export default function EventObserver() {
    this.mouseenter = []
    this.mouseleave = []
    this.mousemove = []
    this.mousedown = []
    this.mouseup = []
    this.click = []
    this.clickoutside = []
    this.wheel = []
    this.observe = function(target) {
        if (target && 'addEventListener' in target) {
            Object.entries(GlobalEvents).forEach(([targetEvent, { dispatchEvents }]) => {
                const listener = e => {
                    Object.entries(dispatchEvents).forEach(([dispatchEvent, { triggerName }]) => {
                        this[dispatchEvent].forEach(element => {
                            element[triggerName].call(element, dispatchEvent, e)
                        })
                        const curActiveElement = this[dispatchEvent].find(element => element.mouseEntered)
                        if (curActiveElement) {
                            target.style.cursor = curActiveElement.cursor
                        }
                    })
                }
                target.addEventListener(targetEvent, listener)
            })
        }
    }
    this.clear = function(gcList) {
        for (let name in this) {
            if (Array.isArray(this[name])) {
                gcList.forEach(item => {
                    let i = this[name].findIndex(e => e === item)
                    if (!!~i) {
                        this[name].splice(i, 1)
                    }
                    if (item.destroy) {
                        item.destroy()
                    }
                })
            }
        }
    }
    this.clearAll = function() {
        this.mouseenter = []
        this.mouseleave = []
        this.mousemove = []
        this.mousedown = []
        this.mouseup = []
        this.click = []
        this.clickoutside = []
        this.wheel = []
    }
}