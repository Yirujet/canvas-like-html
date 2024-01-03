export default function Watcher() {
    this.comps = []
    this.add = function(comp) {
        this.comps.push(comp)
    }
    this.remove = function(comp) {
        const i = this.comps.findIndex(e => e === comp)
        this.comps.splice(i, 1)
    }
    this.notify = function() {
        this.comps.forEach(comp => comp.render())
    }
}