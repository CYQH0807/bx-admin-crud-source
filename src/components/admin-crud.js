import XEUtils from "xe-utils";
import { __AdminCrud } from "@/store";
export default {
	name: "cl-admin-crud",
	componentName: "ClAdminCrud",

	props: {
		// 表单配置
		options: {
			type: Array,
			default: () => {
				return [];
			}
		},
		// 是否显示重置按钮
		isResetBtn: {
			type: Boolean,
			default: () => {
				return __AdminCrud?.isResetBtn || false;
			}
		},
		// 无边框
		noBorder: {
			type: Boolean,
			default: () => {
				return __AdminCrud?.noBorder || false;
			}
		},
		// 是否显示折叠按钮
		showCollapse: {
			type: Boolean,
			default: () => {
				return __AdminCrud?.op?.collapse || true;
			}
		},
		// 是否默认折叠
		collapseFlag: {
			type: Boolean,
			default: () => {
				return __AdminCrud?.op?.collapseFlag || true;
			}
		},
		// 是否内联表单, 默认内联
		inner: {
			type: Boolean,
			default: true
		},
		// 是否显示按钮
		btnHidden: {
			type: Boolean,
			default: false
		},
		// 按钮位置
		buttonsLocation: {
			type: String,
			default: () => {
				return __AdminCrud?.op?.buttonsLocation || "right";
			}
		},
		// 默认一行三列
		colSpan: {
			type: Number,
			default: () => {
				return __AdminCrud?.colSpan || 8;
			}
		},
		// label宽度
		labelWidth: {
			type: String,
			default: () => {
				return __AdminCrud?.props?.labelWidth || "120px";
			}
		},
		formOptions: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// 是否编辑模式
		editFlag: {
			type: Boolean,
			default: true
		},
		lowCode: {
			type: Boolean,
			default: false
		},
		// 折叠数量判断, 当前总span大于这个数量, 才开始折叠
		collapseMaxSpan: {
			type: Number,
			default: () => {
				return __AdminCrud?.op?.collapseMaxSpan || 48;
			}
		},
		value: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	data() {
		return {
			curOptions: [],
			customParam: {} //自定义参数
		};
	},

	computed: {
		_formOptions() {
			let defaultOptions = {
				title: "自定义测试表单",
				width: "80%",
				props: {
					size: "small",
					"label-width": this.labelWidth,
					"label-position": "right",
					inline: true
				},
				isEdit: this.editFlag,
				span: this.colSpan,
				lowCode: this.lowCode, // 低代码模式
				op: {
					hidden: this.btnHidden,
					closeButtonText: "重置",
					collapse: this.showCollapse,
					collapseFlag: this.collapseFlag,
					collapseMaxSpan: this.collapseMaxSpan,
					saveButtonText: "查询",
					buttons: ["select", this.isResetBtn ? "close" : undefined],
					buttonsLocation: this.buttonsLocation
				},
				items: this.options,
				on: {
					submit: this.submit,
					close: this.close
				}
			};
			return XEUtils.merge(defaultOptions, this.formOptions);
		},
		$Form() {
			return this.$refs.clForm;
		}
	},
	mounted() {
		// 如果是页面表单,就直接显示
		if (this.inner) {
			this.$Form.create(this._formOptions);
			this.setData(this.value);
		}
	},

	watch: {
		options: {
			handler(val) {
				this.$Form.create(this._formOptions);
				this.setData(this.value);
			},
			deep: true
		},
		formOptions: {
			handler(val) {
				this.$Form.create(this._formOptions);
				this.setData(this.value);
			},
			deep: true
		},
		value: {
			handler(val) {
				this.setData(val);
			},
			deep: true
		}
	},
	methods: {
		dialogClose() {
			this.$Form.close();
		},

		/**
		 * @description:  根据prop获取表单的option
		 * @param {*} prop
		 * @return {*}
		 * @author: 池樱千幻
		 */
		getOptionByProp(prop) {
			return this.$Form.getOptionByProp(prop);
		},

		/**
		 * @description: 重置表单的内容
		 * @param {*}
		 * @return {*}
		 * @author: 池樱千幻
		 */
		resetForm() {
			this.$Form.resetFields();
		},

		/**
		 * @description: 根据prop获取表单的内容,如果没有就获取整个表单
		 * @param {string} prop
		 * @return {any} 如果传入了prop参数,就返回单个表单项的值,否则返回整个表单的值
		 * @author: 池樱千幻
		 */
		getData(prop) {
			return this.$Form.getForm(prop);
		},

		/**
		 * @description: 获取组件的ref对象
		 * @param {*} prop
		 * @return {*}
		 * @author: 池樱千幻
		 */
		getComponentsRef(prop) {
			return this.$Form.getRefByProp(prop);
		},

		/**
		 * @description: 根据data批量设置表单值
		 * @param {*} data
		 * @return {*}
		 * @author: 池樱千幻
		 */
		setData(data) {
			const formData = this.$Form.getForm();
			for (const key in data) {
				Object.keys(formData).includes(key) && this.$Form.setForm(key, data[key]);
			}
			this.hiddenLoading();
		},

		/**
		 * @description: 根据属性名称,合并设置属性
		 * @param {*} props
		 * @param {*} data
		 * @return {*}
		 * @author: 池樱千幻
		 */
		setAttribute(props, data, isExp = false) {
			if (isExp) {
				this.$Form.setData(props, data);
				return;
			}
			if (data.props && data.props.disabled !== undefined) {
				this.$Form.setProps(props, {
					disabled: data.props.disabled
				});
			}
			if (data.options !== undefined) {
				this.$Form.setOptions(props, data.options);
			}
			if (data.isEdit !== undefined) {
				this.$Form.setItems(props, data);
			}
			this.$Form.setData(`items[prop:${props}].component`, data);
		},

		setHidden(props) {
			this.$Form.hiddenItem(props);
		},

		setShow(props) {
			this.$Form.showItem(props);
		},

		/**
		 * @description: 设置所有属性
		 * @param {*} data
		 * @return {*}
		 * @author: 池樱千幻
		 */
		setAllAttr(data) {
			const formData = this.$Form.getForm();
			for (const key in formData) {
				this.setAttribute(key, data);
			}
		},

		hiddenRequired() {
			const formData = this.$Form.getForm();
			for (const key in formData) {
				this.$Form.setData(`items[prop:${key}].rules`, {
					required: false
				});
			}
		},

		// 显示加载中
		showLoading() {
			this.$Form.showLoading();
		},

		// 隐藏加载中
		hiddenLoading() {
			this.$Form.hiddenLoading();
		},
		reset() {
			this.resetForm();
		},

		close(done) {
			this.reset();
			done();
		},

		/**
		 * @description: 打开弹窗
		 * @param {*} option 弹窗配置
		 * @param {*} type 弹窗类型
		 * @param {*} customParam 自定义属性
		 * @return {*}
		 * @author: 池樱千幻
		 */
		open(option, type = "edit", customParam = {}) {
			const cloneDeepOpt = XEUtils.clone(this._formOptions, true);
			if (XEUtils.isString(option)) {
				option = {
					title: option
				};
			}
			if (["edit", "add"].indexOf(type) > -1) {
				const editOpt = {
					isEdit: true,
					op: {
						buttonsLocation: "bottom",
						buttons: ["save"],
						saveButtonText: type === "edit" ? "修改" : "保存"
					}
				};
				this.$Form.open(XEUtils.merge(cloneDeepOpt, editOpt, option));
			} else if (type === "detail") {
				const editOpt = {
					isEdit: false,
					op: {
						hidden: true
					}
				};
				this.$Form.open(XEUtils.merge(cloneDeepOpt, editOpt, option));
			} else {
				this.$Form.open(XEUtils.merge(cloneDeepOpt, option));
			}
			this.customParam = customParam;
		},
		submit(data, { close, done, clForm }) {
			this.$emit("submit", data, { close, done, clForm }, this.customParam);
			// done()
		},
		change(val) {
			this.$emit("change", val);
			this.$emit("input", val);
		},
		validate() {
			return new Promise((resolve, reject) => {
				this.$Form.validate((valid, error) => {
					if (valid) {
						resolve(valid);
					} else {
						reject(error);
					}
				});
			});
		}
	},

	render(createElement) {
		let scopedSlots = {};
		Object.keys(this.$scopedSlots).forEach((key) => {
			scopedSlots[key] = (props) => this.$scopedSlots[key](props || {});
		});

		return (
			<cl-form
				class={[
					"bxCrud",
					this.noBorder ? "" : "crud-border",
					this.inner ? "crud-inner" : ""
				]}
				ref="clForm"
				collapse
				inner={this.inner}
				onactiveChange={(val) => {
					this.$emit("activeChange", val);
				}}
				onchange={(val) => {
					this.change(val);
				}}
				scopedSlots={scopedSlots}></cl-form>
		);
	}
};
