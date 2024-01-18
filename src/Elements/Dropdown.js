import { getTextMetricsOfPrecision } from '../utils.js'
import inheritProto from '../inherite.js'
import Element from '../Element.js'
import EventObserver from '../EventObserver.js'

const DROPDOWN_ARROW_MARGIN = 10
const DROPDOWN_OVERLAY_MARGIN_TOP = 12
const CHAR_WIDTH = 7

Dropdown.DROPDOWN_ARROW_MARGIN = DROPDOWN_ARROW_MARGIN
Dropdown.DROPDOWN_OVERLAY_MARGIN_TOP = DROPDOWN_OVERLAY_MARGIN_TOP
Dropdown.CHAR_WIDTH = CHAR_WIDTH

Dropdown.elName = 'dropdown'

inheritProto(Dropdown, Element)
export default function Dropdown(props) {
    Element.call(this)
    this.text = '下拉菜单'
    this.fontSize = null
    this.trigger = 'hover'
    this.dropdownOverlay = null
    this.list = []
    this.overlayMouseEntered = false
    let closeDropdownTimer = null
    let openDropdownTimer = null
    let openDropdownTs = null
    this.labelName = 'name'
    this.valueName = 'value'
    this.hideOnClick = true
    this.initProps(props)
    this.x = parseFloat(this.x)
    this.y = parseFloat(this.y)
    this.ctx.save()
    if (this.fontSize) {
        this.ctx.font = `400 ${this.fontSize}px Helvetica`
    }
    this.ctx.restore()
    const { width: wordWidth, height: wordHeight } = getTextMetricsOfPrecision(this.text, this.ctx)
    this.width = wordWidth + Dropdown.DROPDOWN_ARROW_MARGIN + Dropdown.CHAR_WIDTH
    this.height = wordHeight
    const initDefaultAttrs = () => {
        this.area = {
            leftTop: { x: this.x, y: this.y },
            rightTop: { x: this.x + this.width, y: this.y },
            leftBottom: { x: this.x, y: this.y + this.height },
            rightBottom: { x: this.x + this.width, y: this.y + this.height },
            arrowIcon: {
                leftTop: { x: this.x + wordWidth + Dropdown.DROPDOWN_ARROW_MARGIN, y: this.y },
                rightTop: { x: this.x + this.width, y: this.y },
                leftBottom: { x: this.x + wordWidth + Dropdown.DROPDOWN_ARROW_MARGIN, y: this.y + this.height },
                rightBottom: { x: this.x + this.width, y: this.y + this.height },
            }
        }
    }
    const initEvents = () => {
        if (!this.eventObserver) {
            this.eventObserver = new EventObserver()
        }
        const defaultEventListeners = {
            mouseenter: e => {
                const { offsetX, offsetY } = e
                if (this.mouseEntered) return
                if (offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y) {
                    this.mouseEntered = true
                    e.target.style.cursor = this.disabled ? 'not-allowed' : 'pointer'
                    if (this.trigger === 'hover') {
                        openDropdownTimer = setTimeout(this.openDropdown.bind(this, e), 300)
                        openDropdownTs = new Date().getTime()
                    }
                }
            },
            mouseleave: e => {
                const { offsetX, offsetY } = e
                if (this.trigger === 'hover') {
                    if (!this.mouseEntered || this.overlayMouseEntered) return
                } else {
                    if (!this.mouseEntered) return
                }
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.mouseEntered = false
                    e.target.style.cursor = 'default'
                    if (this.trigger === 'hover') {
                        if ((new Date().getTime() - openDropdownTs) <= 300) {
                            clearTimeout(openDropdownTimer)
                            openDropdownTimer = null
                        }
                        closeDropdownTimer = setTimeout(this.closeDropdown.bind(this), 300)
                    }
                }
            },
            click: e => {
                if (this.trigger === 'click' && this.mouseEntered) {
                    this.openDropdown(e)
                }
            },
            clickoutside: e => {
                const { offsetX, offsetY } = e
                if (!(offsetX >= this.area.leftTop.x && offsetX <= this.area.rightTop.x && offsetY >= this.area.leftTop.y && offsetY <= this.area.leftBottom.y)) {
                    this.closeDropdown()
                }
            }
        }
        this.registerListenerFromOnProp(defaultEventListeners)
    }
    this.openDropdown = function(e) {
        if (!document.head.querySelector('#dropdown-overlay')) {
            const styleEl = document.createElement('style')
            styleEl.id = 'dropdown-overlay'
            styleEl.innerHTML = `
                .dropdown-overlay {
                    position: fixed;
                    padding: 10px 0;
                    background-color: #fff;
                    border: 1px solid #ebeef5;
                    border-radius: 4px;
                    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
                    z-index: 999;
                }
                
                .dropdown-overlay .dropdown-list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }
                
                .dropdown-overlay .dropdown-list li {
                    padding: 0 20px;
                    line-height: 36px;
                    cursor: pointer;
                }
                
                .dropdown-overlay .dropdown-list li:hover {
                    background-color: #ecf5ff;
                    color: #66b1ff;
                }
            `
            document.head.appendChild(styleEl)
        }
        const createListEl = () => {
            const listEl = document.createElement('ul')
            listEl.className = 'dropdown-list'
            this.list.forEach(item => {
                const listItemEl = document.createElement('li')
                listItemEl.innerHTML = item[this.labelName]
                listItemEl.addEventListener('click', () => {
                    this.triggerEvent('command', item[this.valueName])
                    if (this.hideOnClick) {
                        this.closeDropdown()
                    }
                })
                listEl.appendChild(listItemEl) 
            })
            return listEl
        }
        const emptyEl = document.createElement('div')
        emptyEl.innerHTML = '暂无数据'
        const { x, y } = e.target.getBoundingClientRect()
        if (document.body.contains(this.dropdownOverlay)) {
            this.dropdownOverlay.style.display = 'block'
            this.dropdownOverlay.style.left = `${ this.x + x }px`
            this.dropdownOverlay.style.top = `${ this.y + this.height + y + Dropdown.DROPDOWN_OVERLAY_MARGIN_TOP }px`
            this.dropdownOverlay.innerHTML = ''
            if (this.list.length === 0) {
                this.dropdownOverlay.appendChild(emptyEl)
            } else {
                this.dropdownOverlay.appendChild(createListEl())
            }
        } else {
            this.dropdownOverlay = document.createElement('div')
            if (this.list.length === 0) {
                this.dropdownOverlay.appendChild(emptyEl)
            } else {
                this.dropdownOverlay.appendChild(createListEl())
            }
            this.dropdownOverlay.className = 'dropdown-overlay'
            this.dropdownOverlay.style.left = `${ this.x + x }px`
            this.dropdownOverlay.style.top = `${ this.y + this.height + y + Dropdown.DROPDOWN_OVERLAY_MARGIN_TOP }px`
            document.body.appendChild(this.dropdownOverlay)
            if (this.trigger === 'hover') {
                this.dropdownOverlay.addEventListener('mouseenter', () => {
                    this.overlayMouseEntered = true
                    clearTimeout(closeDropdownTimer)
                    closeDropdownTimer = null
                })
                this.dropdownOverlay.addEventListener('mouseleave', () => {
                    this.overlayMouseEntered = false
                    this.closeDropdown()
                })
            }
        }
        clearTimeout(openDropdownTimer)
        openDropdownTimer = null
    }
    this.closeDropdown = function() {
        if (document.body.contains(this.dropdownOverlay)) {
            this.dropdownOverlay.style.display = 'none'
        }
        clearTimeout(closeDropdownTimer)
        closeDropdownTimer = null
    }
    this.destroy = function() {
        if (document.body.contains(this.dropdownOverlay)) {
            document.body.removeChild(this.dropdownOverlay)
        }
        clearTimeout(closeDropdownTimer)
        closeDropdownTimer = null
    }
    this.render = function(config) {
        this.initProps(config)
        initDefaultAttrs()
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
        this.ctx.beginPath()
        this.ctx.save()
        this.ctx.textBaseline = 'middle'
        if (this.fontSize) {
            this.ctx.font = `400 ${this.fontSize}px Helvetica`
        }
        this.ctx.fillStyle = '#409eff'
        this.ctx.fillText(this.text, this.x, this.y + this.height / 2)
        this.ctx.translate(this.area.arrowIcon.leftTop.x, this.area.arrowIcon.leftTop.y + this.height / 2 + Dropdown.CHAR_WIDTH / 4)
        this.ctx.rotate(-135 * Math.PI / 180)
        this.ctx.strokeStyle = '#409eff'
        this.ctx.moveTo(0, 0)
        this.ctx.lineTo(Dropdown.CHAR_WIDTH, 0)
        this.ctx.moveTo(0, 0)
        this.ctx.lineTo(0, Dropdown.CHAR_WIDTH)
        this.ctx.stroke()
        this.ctx.restore()
    }
    initEvents()
}