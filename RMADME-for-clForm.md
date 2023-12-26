#cl-admin-crud 使用说明

该组件是基于cool-admin的crud组件进行的二次开发. vue2版源码开源, 经过多次迭代,功能逐渐丰富,但是由于被封装,开发人员无法看到源码,特此写出该文档,方便开发人员使用.

### 组件基本用法
```
<cl-admin-crud ref="form" :options="options"></cl-admin-crud>
```
与常规的form封装类似, 组件接收options参数, 用于配置表单,组件可以传入的参数如下:
```	
options: [] 表单配置 示例见下面
isResetBtn:false 是否显示重置按钮
showCollapse:true  是否显示折叠按钮
collapseFlag:true 是否默认折叠
inner:true  是否内联表单, 默认内联,如果不是内联,调用组件的open方法, 可以打开一个弹窗.
btnHidden:false 是否显示按钮
buttonsLocation:right 按钮位置,可选值 bottom right
colSpan:8  默认一行三列
labelWidth:120px label宽度
formOptions: 表单配置, 用于自定义表单, 详细见下面
editFlag:false 是否编辑模式
value:{} v-model绑定的值
```
可以通过formOptions配置来整体改变组件的配置, 示例:
```json
{
	title: '自定义测试表单',// 弹窗标题
	width: '80%', // 弹窗宽度
	dialog: {
		// 弹框的配置,剩余配置参考el-dialog,所有属性都支持
		props: {
			top: '20px'
		}
	},
	props: {
		size: 'small',
		'label-width': '120px',
		'label-position': 'right',
		inline: true
	},
	isEdit: true, // 是否可编辑,items属性中的isEdit会覆盖这里的全局属性
	span: 8, // 与el-col的span一致, 最大24,栅格布局使用.
	op: {
		hidden: false, // 按钮是否隐藏
		closeButtonText: '重置', // 关闭按钮默认文字
		collapse: true, // 是否显示折叠
		collapseFlag: true,  // 折叠状态,true为折叠,false为展开
		saveButtonText: '查询', // 保存按钮默认文字
		buttons: ['select'], // 按钮列表,只有两种,select 与 close
		buttonsLocation: 'right'// 按钮位置 两种底部 bottom 右边 right
	},
	items: this.options, // 表单数组,下面有详细解释
	on: {
		submit: this.submit, //提交按钮回调
		close: this.close // 关闭按钮回调
	}
}
```
当然你也可以在全局注册cl-admin-crud组件的时候修改部分参数的默认配置,使得全局拥有统一的配置,目前支持的配置如下,示例:
```js
import CRUD from "../bx-admin-crud/bx-admin-crud.min";
Vue.use(CRUD, {
	alias: "cl-crud",
	AdminCrud: {
	isResetBtn: false, // 是否显示重置按钮
	colSpan: 8, // 默认一行三列
	props:{
		labelWidth: '120px',// label宽度
	},
	op: {
		collapse: true, // 是否显示折叠
		collapseFlag: true,  // 折叠状态,true为折叠,false为展开
		collapseMaxSpan: 48, // 最大折叠数量
		buttonsLocation: 'right'// 按钮位置 两种底部 bottom 右边 right
	},
    },
});
```

### items|options属性详解
formOptions只是将组件的骨架构建出来,options的配置才是组件的灵魂.
options是一个数组,数组中的每一项都是一个对象,每一个对象都描述了表单中的一个表单项.
```
{
	label: '远程校验',  // 字段中文,表单项显示的名字
	prop: 'axiosInput', // 字段英文, 该属性直接决定了表单输出的字段名. 不能重复,但是并没做强校验.
	format: (value) => {
		// 格式化函数,用于格式化表单的值,例如:日期格式化
		return <div domPropsInnerHTML={value}></div>;
	}, 
	span:8, // 宽度
	value:"",// 表单默认值,默认值也可以是一个函数, 可以自定义处理 ({ scope }) => {return 'xxx'},scope是整个表单的form
	hidden:false,//是否隐藏,也可以是一个函数,用作联动隐藏 ({ scope }) => {return true},scope是整个表单的form
	isEdit: true, // 是否可编辑, 如果表单这里不写, 全局配置就会覆盖这里. 
	component: { // 当前渲染的组件
		name: 'el-input', // 组件名称,需要全局注册的组件,只要是组件全局注册了,都可以使用.
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
以上是一个表单项的完整配置,但是通常我们不会写这么完整,并且也用不到这么多功能.因此简化写法,或者说最小单元写法如下
```json
{
	label: '表单名称',
	prop: 'formName',
	component: {
		name: 'el-input'
	}
}
```
这样就创建了一个名称为'表单名称' 使用el-input 的表单项.


### 组件的事件
组件上能够触发的事件如下:
submit 组件提交按钮
change 表单项值发生变化
activeChange 表单项激活状态发生变化 -- 用于低代码模式.
```vue
<template>
    <cl-admin-crud ref="form" :options="options" @submit="submit"></cl-admin-crud>
</template>
<script>
export default {
	methods:{
		/** 
		* data: 表单的属性值, 与getData方法返回的内容一致.
		* close() 如果当前表单是弹窗,用于关闭当前弹窗, 
		* done() 当提交触发时,整个表单会进入loading状态, 调用done()可将loading状态重置, 
		* clForm, 表单内置对象.
		* customParam 调通open时传入的参数.
		 */
		submit(data, { close, done, clForm }, customParam){
			console.log('data: ', data);
		},
		/**
		 * @description: 表单项值发生变化时触发
		 * @param {any} value 当前表单项的值
		 * @return {*}
		 */
		change(value){
			console.log('value: ', value);
		},
		/**
		 * @description: 表单项激活状态发生变化时触发
		 * @param {any} item 当前表单项
		 * @return {*}
		 */
		 activeChange(item){
			console.log('item: ', item);
		 }
	}
}
</script>

```

### 组件的方法
组件对外暴露的一些方法, 可以使用这些方法,动态改变组件配置, 获取组件的值等等.
注: 在调用组件方法的时候,需要先获取到组件的实例, 例如:
```js
this.$refs.form
```
有时组件实例还没有被创建出来, 需要进行延迟,或者等待元素创建完成,才能获取到组件实例, 例如:
```js
this.$nextTick(()=>{
	this.$refs.form
})
```

##### getData 获取表单数据
```js
/**
 * @description: 根据prop获取表单的内容,如果没有就获取整个表单
 * @param {string|undefined} prop
 * @return {any} 如果传入了prop参数,就返回单个表单项的值,否则返回整个表单的值 
 * @author: 池樱千幻
 */
getData(prop?: string): any;
```

##### setData 设置表单数据
```js
/**
 * @description: 根据data设置表单值
 * @param {Object} data 表单数据,格式为 {prop: value}
 * @return {null} 该方法没有返回值
 * @author: 池樱千幻
 */
setData(data: Object): undefined;
```

##### reset 重置表单
```js
/**
 * @description: 重置表单的内容,将表单重置为刚刚创建的状态
 * @param {*} 没有参数
 * @return {*} 没有返回值
 * @author: 池樱千幻
 */
resetForm(): undefined;
```

##### open 打开弹窗
```js
/**
 * @description: 当表单不是内联的时候, 可以使用open方法将表单打开为一个弹窗
 * @param {String|Object} option 弹窗配置, 可以简写一个字符串,这时候会将字符串作为弹窗的标题,也可以是一个对象,对象的属性参考formOptions的属性
 * @param {String} type 弹窗类型 edit:编辑模式, add:新增模式,detail:详情模式,默认为edit
 * @param {any} customParam 自定义属性,由于弹窗打开之后,提交方法与打开方法是分开的,因此需要一个自定义属性,用于在提交方法中获取到这个值.
 * @return {*}
 * @author: 池樱千幻
 */
open(option:String|Object, type = "edit", customParam = {})
```

##### dialogClose 关闭弹窗
```js
/**
 * @description: 如果是非内联表单,可以使用该方法关闭弹窗
 * @param {*} 没有参数
 * @return {*} 没有返回值
 * @author: 池樱千幻
 */
dialogClose(): undefined;
```

#### getOptionByProp 根据prop获取表单项的options
```js
/**
 * @description: 根据prop获取表单项的options
 * @param {string} prop 表单项的prop
 * @return {List[any]} 表单项的options,如果没有找到,返回[]
 */
getOptionByProp(prop: string): List[any];
```

#### getComponentsRef 获取表单项的组件实例

```js
/**
 * @description:根据prop获取组件的ref对象
 * @param {string} prop
 * @return {any} 返回当前组件实例
 * @author: 池樱千幻
 */
getComponentsRef(prop: string): any;
```

#### setAttribute 设置表单项的属性
```js
/**
 * @description: 根据prop设置表单项的属性
 * @param {string} prop 要设置的表单项的prop
 * @param {any} data 需要设置的属性,格式为 {key: value},具体参数参考options的属性
 * @param {boolean} isExp 是否采用字符串链式调用的方式设置属性,例如: setAttribute('prop', 'component.attrs.placeholder', '请输入')
 * @return {undefined} 没有返回值
 */
setAttribute(prop: string, data: any, isExp=false: boolean): undefined;
```

#### setHidden 设置表单项的隐藏状态
```js
/**
 * @description:根据prop隐藏表单项
 * @param {string} prop
 * @return {undefined} 没有返回值
 * @author: 池樱千幻
 */
setHidden(prop: string): undefined;
```

#### setShow 显示表单项
```js
/**
 * @description: 根据prop显示表单项
 * @param {string} prop
 * @return {undefined} 没有返回值
 */
setShow(prop: string): undefined;
```

#### setAllAttr 设置所有表单项的属性
```js
/**
 * @description: 设置所有属性
 * @param {*} data 需要设置的属性,格式为 {key: value},具体参数参考options的属性
 * @return {undefined} 没有返回值
 * @author: 池樱千幻
 */
setAllAttr(data: any): undefined;
```

#### hiddenRequired 隐藏必填校验
```js
/**
 * @description: 隐藏必填校验
 * @param {*} 没有参数
 * @return {undefined} 没有返回值
 */
hiddenRequired(): undefined;
```

#### showLoading 显示loading
```js
/**
 * @description: 显示loading
 * @param {*} 没有参数
 * @return {undefined} 没有返回值
 */
showLoading(): undefined;
```

#### hideLoading 隐藏loading
```js
/**
 * @description: 隐藏loading
 * @param {*} 没有参数
 * @return {undefined} 没有返回值
 */
hideLoading(): undefined;
```

#### validate 校验表单
```js
/**
 * @description: 校验表单
 * @param {*} 没有参数
 * @return {Promise} 返回一个Promise对象,如果校验通过,则resolve,否则reject,并且返回一个错误对象
 */
validate(): Promise;
```


### 组件的插槽使用
