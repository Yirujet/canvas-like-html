function inheritObj(o) {
    function F() {}
    F.prototype = o
    return new F
}

export default function inheritProto(subClass, supClass) {
    subClass.prototype = inheritObj(supClass.prototype)
    subClass.prototype.constructor = subClass
}