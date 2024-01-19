import Element from "../Element"
import inheritProto from "../inherite"

const RADIO_GROUP_ITEM_MARGIN = 30

RadioGroup.elName = 'radio-group'
RadioGroup.RADIO_GROUP_ITEM_MARGIN = RADIO_GROUP_ITEM_MARGIN

inheritProto(RadioGroup, Element)
export default function RadioGroup(props) {
    Element.call(this)
    this.value = []
    this.children = []
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)

    const initDefaultAttrs = () => {
        if (this.children.length > 0) {
            this.width = this.children.reduce((p, c) => p + c.width, 0)
            this.height = this.children[0].height
            this.width += (this.children.length - 1) * RadioGroup.RADIO_GROUP_ITEM_MARGIN
        }
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width, y: this.y + this.height },
        }
    }
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
    }
    this.render = function(config) {
        if (this.$$render_children) {
            this.children = this.$$render_children.call(this, this.root._c)
        }
        initDefaultAttrs()
        this.initProps(config)
        const draw = () => {
            this.ctx.clearRect(this.x, this.y, this.width, this.height)
            this.children.forEach((radio, i, ary) => {
                let preWidth = ary.slice(0, i).reduce((p, c) => p + c.width + RadioGroup.RADIO_GROUP_ITEM_MARGIN, this.x)
                let radioConfig = {
                    x: preWidth, 
                    y: this.y, 
                    checked: radio.value === this.value,
                }
                if (!radio.events.change) {
                    radioConfig.on = {
                        change: e => {
                            this.value = e
                            this.triggerEvent('change', this.value)
                            draw()
                        }
                    }
                }
                radio.render(radioConfig)
            })
        }
        draw()
    }
    initEvents()
}