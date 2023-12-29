export default function Event() {
    this.events = {}
    this.addEvent = function(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [callback]
        } else {
            this.events[eventName].push(callback)
        }
    }
    this.removeEvent = function(eventName, callback) {
        if (this.events[eventName]) {
            const index = this.events[eventName].findIndex(e => e === callback)
            this.events.splice(index, 1)
        }
    }
    this.triggerEvent = function(eventName, ...params) {
        const eventList = this.events[eventName]
        if (eventList) {
            eventList.forEach(event => {
                event.call(this, ...params)
            })
        }
    }
    this.triggerClickEvent = function(eventName, ...params) {
        if (!this.mouseEntered) return
        if (this.disabled) return
        const eventList = this.events[eventName]
        if (eventList) {
            eventList.forEach(event => {
                event.call(this, ...params)
            })
        }
    }
    this.registerListenerFromOnProp = function(onObj) {
        if (onObj) {
            Object.entries(onObj).forEach(([eventname, callback]) => {
                this.addEvent(eventname, callback)
                if (eventname in this.eventObserver) {
                    const i = this.eventObserver[eventname].findIndex(e => e === this)
                    if (!!~i) {
                        this.eventObserver[eventname].splice(i, 1, this)
                    } else {
                        this.eventObserver[eventname].push(this)
                    }
                }
            })
        }
        // console.log(this.eventObserver)
    }
}