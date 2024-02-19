const colLen = 50
const rowLen = 20
const fixedColIndex = []

export const head = Array.from({ length: colLen }).map((e, i) => ({
    field: `col${i}`,
    label: `col${i + 1}`,
    fixed: ((i) => {
        if (fixedColIndex.includes(i)) {
            return 'right'
        }
    })(i),
}))
head.unshift({ field: 'index', label: '序号', fixed: 'left', width: 65 })
head.unshift({
    type: 'checkbox',
    fixed: 'left',
    width: 35
})
head.unshift({ 
    label: 'col-parent', 
    children: [
        { 
            label: 'col-1', 
            children: [
                {
                    label: 'col-1-1',
                    field: 'col1',
                    children: [
                        {
                            label: 'col-1-1-1',
                            field: 'col3',
                            children: [
                                {
                                    label: 'col-1-1-1-1',
                                    field: 'col4'
                                },
                                {
                                    label: 'col-1-1-1-2',
                                    field: 'col3'
                                }
                            ]
                        },
                        {
                            label: 'col-1-1-2',
                            field: 'col4',
                            children: [
                                {
                                    label: 'col-1-1-2-1',
                                    field: 'col5',
                                },
                                {
                                    label: 'col-1-1-2-2',
                                    field: 'col6',
                                },
                                {
                                    label: 'col-1-1-2-3',
                                    field: 'col7',
                                }
                            ]
                        }
                    ]
                },
                {
                    label: 'col-1-2',
                    field: 'col2',
                    children: [
                        {
                            label: 'col-1-2-1',
                            field: 'col11',
                        },
                        {
                            label: 'col-1-2-2',
                            field: 'col12',
                        }
                    ]
                }
            ]
        },
        { label: 'col-2', field: 'col9' }
    ]
})
head.push({
    field: 'operation',
    label: '操作',
    fixed: 'right',
    width: 250,
    slot: {
        head: (h, col) => {
            return h('span', {
                text: `${col.label}`
            })
        },
        body: (h, scope) => {
            return [
                h('button', {
                    // type: 'success',
                    type: 'text',
                    text: '查看',
                    on: {
                        click() {
                            alert(`查看第${scope.$index + 1}行`)
                        }
                    }
                }),
                h('link', {
                    type: 'primary',
                    text: '编辑',
                    on: {
                        click() {
                            alert(`编辑第${scope.$index + 1}行`)
                        }
                    }
                }),
                h('link', {
                    type: 'danger',
                    text: '删除',
                    disabled: true,
                    on: {
                        click() {
                            alert(`删除第${scope.$index + 1}行`)
                        }
                    }
                }),
                h('dropdown', {
                    text: '更多',
                    trigger: 'click',
                    list: [
                        { name: `btn${scope.$index + 1}`, value: `btn${scope.$index + 1}` },
                    ],
                    on: {
                        command: (val) => {
                            alert(`点击了第${scope.$index + 1}行-${val}`)
                        }
                    }
                })
            ]
        }
    }
})

let list = []

for (let i = 0, l = rowLen, row = {}; i < l; i++) {
    row = {}
    for(let j = 0, k = head.length; j < k; j++) {
        row.index = i + 1
        row[`col${j}`] = `row-${i + 1}-col${j + 1}`
    }
    list.push(row)
}

export const data = list