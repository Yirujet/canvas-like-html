import Element from "../Element"
import inheritProto from "../inherite"

const CHECKBOX_GROUP_ITEM_MARGIN = 30

CheckboxGroup.elName = 'checkbox-group'
CheckboxGroup.CHECKBOX_GROUP_ITEM_MARGIN = CHECKBOX_GROUP_ITEM_MARGIN

inheritProto(CheckboxGroup, Element)
export default function CheckboxGroup(props) {
    Element.call(this)
    this.value = []
    this.children = []
    const propsObj = props
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)

    const initDefaultAttrs = () => {
        if (this.children.length > 0) {
            this.width = this.children.reduce((p, c) => p + c.width, 0)
            this.height = this.children[0].height
            this.width += (this.children.length - 1) * CheckboxGroup.CHECKBOX_GROUP_ITEM_MARGIN
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
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        this.initProps(config)
        this.children.forEach((checkbox, i, ary) => {
            let preWidth = ary.slice(0, i).reduce((p, c) => p + c.width + CheckboxGroup.CHECKBOX_GROUP_ITEM_MARGIN, this.x)
            checkbox.render({ 
                x: preWidth, 
                y: this.y, 
                on: {
                    change: e => {
                        const { value, checked } = e
                        if (checked) {
                            this.value.push(value)
                        } else {
                            const i = this.value.findIndex(val => val === value)
                            this.value.splice(i, 1)
                        }
                        this.triggerEvent('change', this.value)
                    }
                } 
            })
        })
    }
    initEvents()
}