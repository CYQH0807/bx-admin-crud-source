#BxAdminCrud组件说明 
原始组件的所有参数配置如下,可以通过BxAdminCrud的formOptions实现完全自定义.
```
{
	title: '自定义测试表单',// 弹窗标题
	width: '80%',// 弹窗宽度
	dialog: {
		// 弹框的配置
		props: {
			top: '20px'
		}
	},
	props: {
		size: 'small',
		'label-width': '100px',
		'label-position': 'right',
		inline: true
	},
	isEdit: true, // 是否可编辑,items属性中的isEdit会覆盖这里的全局属性
	span: this.colSpan, // 与el-col的span一致, 最大24,栅格布局使用.
	op: {
		hidden: this.btnHidden, // 按钮是否隐藏
		closeButtonText: '重置', // 关闭按钮默认文字
		collapse: this.showCollapse, // 是否显示折叠
		collapseFlag: true,  // 折叠状态,true为折叠,false为展开
		saveButtonText: '查询', // 保存按钮默认文字
		buttons: ['select'], // 按钮列表,只有两种,select 与 close
		buttonsLocation: this.buttonsLocation // 按钮位置 两种底部 bottom 右边 right
	},
	items: this.options, // 表单数组,下面有详细解释
	on: {
		submit: this.submit, //提交按钮回调
		close: this.close // 关闭按钮回调
	}
}
```

items 是表单的数组,完整属性如下

```
{
	label: '远程校验',  // 字段中文
	prop: 'axiosInput', // 字段英文

	format: (value) => {
				return <div domPropsInnerHTML={value}></div>;
			}, // 格式化函数,用于格式化表单的值,例如:日期格式化
	span:8, // 宽度
	value:"",// 表单默认值,默认值也可以是一个函数, 可以自定义处理 ({ scope }) => {return 'xxx'},scope是整个表单的form
	hidden:false,//是否隐藏,也可以是一个函数,用作联动隐藏 ({ scope }) => {return true},scope是整个表单的form
	component: { // 当前渲染的组件
		name: 'el-input', // 组件名称,需要全局注册的组件
		options:[], // 如果是el-select,这里需要options列表, 可以是静态的,也可以是Promise对象.
		attrs: {
			// 组件中所有的属性都可以在这里配置,例如:el-input的 clearable 可清空属性,
			placeholder: '请输入',
			clearable:true
		},
		change:(val, this.form, this.form[e.prop])=>{}, // 字段发生变化时的回调
	},
	// 表单校验
	rules: {
		required: true,
		trigger: 'blur',
		customCheck: (value)=>{} // 自定义校验,可以是函数,可以是Promise对象.
	}
},
```


      this.$refs.columnCrud.setAttribute('factorFormulaWavg', {
          options: wavgOptions
        })
				 let wavgOptions = this.tableColumn.map(item => {
        return {
          label: `${item.title} - ${item.field}`,
          value: item.field,
          props:{
            disabled:true
          }
        }
      })