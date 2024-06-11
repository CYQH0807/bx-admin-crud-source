/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import {
	deepMerge,
	isFunction,
	isEmpty,
	isString,
	isObject,
	isBoolean,
	cloneDeep,
	isArray
} from "@/utils";
import { renderNode } from "@/utils/vnode";
import Parse from "@/utils/parse";
import valueHook from "@/hook/value";
import { Form, Emitter, Screen } from "@/mixins";
import { __inst, __crud } from "@/store";

export default {
	name: "cl-form",

	componentName: "ClForm",

	mixins: [Emitter, Screen, Form],

	props: {
		// 表单值
		value: {
			type: Object,
			default: () => {
				return {};
			}
		},

		// 是否只显示表单
		inner: Boolean,

		// 绑定组件名，设置方法
		bindComponentName: String
	},

	provide() {
		return {
			form: this.form
		};
	},

	data() {
		return {
			visible: false,
			saving: false,
			loading: false,
			collapseFlag: true,
			form: {},
			conf: {
				title: "自定义表单",
				width: "50%",
				props: {
					size: "small",
					"label-width": "100px"
				},
				lowCode: false, // 低代码模式
				isEdit: true,
				span: 24,

				on: {
					open: null,
					submit: null,
					close: null
				},
				op: {
					hidden: false,
					collapse: true,
					collapseFlag: true,
					collapseMaxSpan: 48,
					saveButtonText: "保存",
					closeButtonText: "取消",
					buttons: ["save", "close"],
					buttonsLocation: "right"
				},
				dialog: {
					props: {
						fullscreen: false,
						"close-on-click-modal": false,
						"append-to-body": true
					},
					hiddenControls: false,
					controls: ["fullscreen", "close"]
				},
				items: [],
				_data: {}
			},
			tabActive: null
		};
	},

	watch: {
		value: {
			immediate: true,
			deep: true,
			handler(val) {
				this.form = val;
				this.$emit("change", val);
			}
		}
	},
	computed: {
		getFormMaxHeight() {
			const { collapse } = this.conf.op;
			let maxHeight = "9999px";
			if (collapse) {
				maxHeight = this.collapseFlag ? "100px" : "9999px";
			}
			return { maxHeight };
		}
	},

	methods: {
		create(options = {}) {
			// 合并配置
			for (const i in this.conf) {
				switch (i) {
					case "items":
						this.conf.items = cloneDeep(options.items || []).map((item) => {
							// 如果没有loading就添加
							if (item.loading === undefined) {
								item.loading = false;
							}
							if (item.active === undefined) {
								item.active = false;
							}
							return item;
						});
						break;
					case "title":
					case "width":
					case "span":
					case "lowCode":
					case "isEdit":
						this.conf[i] = options[i];
						break;
					default:
						deepMerge(this.conf[i], options[i]);
						break;
				}
			}

			// 预设表单值
			if (options.form) {
				for (const i in options.form) {
					this.$set(this.form, i, options.form[i]);
				}
			}

			// 设置表单默认值
			this.conf.items.forEach((e) => {
				if (e.prop) {
					this.$set(
						this.form,
						e.prop,
						valueHook.bind(
							isEmpty(this.form[e.prop]) ? cloneDeep(e.value) : this.form[e.prop],
							e.hook,
							this.form
						)
					);
				}
			});

			// 打开回调
			const { open } = this.conf.on;

			if (open) {
				this.$nextTick(() => {
					open(this.form, {
						close: this.close,
						submit: this.submit,
						done: this.done
					});
				});
			}

			//  初始化设置展开的属性
			const { collapseFlag, collapse, collapseMaxSpan } = this.conf.op;
			if (collapse) {
				this.collapseFlag = collapseFlag;
				// 如果表单数据的span属性加起来小于24,就默认隐藏折叠按钮,小于24的含义是说明表单内容在同一行.不需要折叠
				let spanCount = this.conf.items.reduce(
					(acc, curr) => acc + (curr.span || this.conf.span),
					0
				);
				if (spanCount <= collapseMaxSpan) {
					this.conf.op.collapse = false;
				}
			} else {
				this.collapseFlag = true;
			}
			return this;
		},
		change(currentItem) {
			const { items } = this.conf;
			for (let i = 0; i < items.length; i++) {
				const e = items[i];
				if (e.inner && e.inner.length > 0) {
					if (e.inner.includes(currentItem.prop) && e.innerChange) {
						const func = e.innerChange;
						const changeItem = func(this.form, e);
						if (changeItem?.then) {
							e.loading = true;
							changeItem.then((item) => {
								item.value !== undefined && this.setForm(e.prop, item.value);
								this.setItems(e.prop, item);
								e.loading = false;
							});
						} else {
							changeItem.value !== undefined &&
								this.setForm(e.prop, changeItem.value);
							this.setItems(e.prop, changeItem);
						}
					}
				}
			}
		},
		/**
		 * @description: 根据prop查询当前表单的ref对象
		 * @param {*} prop
		 * @return {*}
		 * @author: 池樱千幻
		 */
		getRefByProp(prop) {
			if (prop) {
				return __inst.$refs[prop];
			} else {
				return __inst.$refs;
			}
		},

		/**
		 * @description: 每个col点击之后的事件
		 * @param {*} item
		 * @return {*}
		 * @author: 池樱千幻
		 */
		colHandleClick(item) {
			// 将所有的表单都设置为不激活
			this.conf.items.forEach((e) => {
				e.active = false;
			});
			// 将当前的表单设置为激活
			item.active = true;

			this.$emit("activeChange", item);
		},

		/**
		 * @description: 判断按钮是否需要固定在底部
		 * @return {*}
		 * @author: 池樱千幻
		 */
		getButtonFix() {
			const { items, span, op } = this.conf;
			// 如果表单数据的span属性加起来小于24,就默认隐藏折叠按钮,小于24的含义是说明表单内容在同一行.不需要折叠
			let spanCount = items.reduce((acc, curr) => acc + (curr.span || span), 0);
			if (spanCount <= op.collapseMaxSpan) {
				return spanCount % 24 > 4
			}
			return this.collapseFlag ? false : spanCount % 24 > 4;
		},

		/**
		 * @description: 判断当前项是否折叠
		 * @param {*} item
		 * @return {*}
		 * @author: 池樱千幻
		 */
		collapseShow(item, index) {
			const { items, span, op } = this.conf;
			if (!op.collapse) {
				return false;
			}
			// 找到当前item之前的所有项,并且计算span的总和
			let spanCount = items
				.filter((obj, i) => i <= index)
				.reduce((acc, curr) => acc + (curr.span || span), 0);
			// 小于48的时候,就不需要折叠
			if (spanCount <= op.collapseMaxSpan) {
				return false;
			} else {
				return this.collapseFlag;
			}
		},

		open(options) {
			this.visible = true;
			return this.create(options);
		},

		beforeClose() {
			if (this.conf.on.close) {
				this.conf.on.close(this.close);
			} else {
				this.close();
			}
		},

		close() {
			this.visible = false;
			this.clear();
			this.done();
		},

		onClosed() {
			this.tabActive = null;

			for (const i in this.form) {
				delete this.form[i];
			}
		},

		done() {
			this.saving = false;
		},

		clear() {
			this.clearValidate();
		},

		/**
		 * @description: 根据prop获取表单的option
		 * @param {*} prop
		 * @return {*}
		 * @author: 池樱千幻
		 */
		getOptionByProp(prop) {
			return new Promise((resolve, reject) => {
				let item = this.conf.items.find((e) => e.prop === prop);
				if (item?.component?.options) {
					if (item.component.options?.then) {
						item.loading = true;
						item.component.options
							.then((res) => {
								item.component.options = res;
								resolve(res);
							})
							.finally(() => {
								item.loading = false;
							});
						item.component.options = [];
					} else {
						resolve(item.component.options);
					}
				} else {
					resolve([]);
				}
			});
		},

		submit(callback) {
			// 验证表单
			this.$refs.form.validate(async (valid, error) => {
				if (valid) {
					this.saving = true;

					// 响应方法
					const res = {
						done: this.done,
						close: this.close,
						$refs: __inst.$refs
					};

					// 表单数据
					const d = cloneDeep(this.form);

					// 过滤被隐藏的数据
					this.conf.items.forEach((e) => {
						if (e._hidden) {
							delete d[e.prop];
						}

						if (e.hook) {
							d[e.prop] = valueHook.submit(d[e.prop], e.hook, d);
						}
					});

					// 提交钩子
					const submit = callback || this.conf.on.submit;

					// 提交事件
					if (isFunction(submit)) {
						submit(d, res);
					} else {
						console.error("Not found callback function");
					}
				} else {
					// 判断是否使用form-tabs，切换到对应的选项卡
					const keys = Object.keys(error);

					if (this.tabActive) {
						const item = this.conf.items.find((e) => e.prop === keys[0]);

						if (item) {
							this.tabActive = item.group;
						}
					}
				}
			});
		},
		formatValue(prop, component) {
			const value = this.form[prop];
			if (value) {
				if (isArray(value)) {
					return value.join(",");
				} else if (component?.options) {
					const options = component?.options;
					const obj = options.find((item) => item.value === value);
					if (obj) {
						return obj.label;
					} else {
						return "--";
					}
				}
				return value;
			} else {
				return "--";
			}
		},

		// 重新绑定表单数据
		reBindForm(data) {
			const d = {};

			this.conf.items.forEach((e) => {
				d[e.prop] = e.hook ? valueHook.bind(data[e.prop], e.hook, data) : data[e.prop];
			});

			Object.assign(this.form, data, d);
		},

		// 渲染表单
		renderForm() {
			const { props, items, _data, span, isEdit, lowCode } = this.conf;

			return (
				<el-form
					ref="form"
					{...{
						props: {
							"label-position": this.isMini ? "top" : "",
							disabled: this.saving,
							model: this.form,
							...props
						}
					}}>
					{/* 表单项列表 */}
					<el-row gutter={10} v-loading={this.loading}>
						{items.map((e, i) => {
							if (e.type === "tabs") {
								return (
									<cl-form-tabs
										v-model={this.tabActive}
										{...{ props: { ...e.props } }}></cl-form-tabs>
								);
							}
							// 是否隐藏
							e._hidden = Parse("hidden", {
								value: e.hidden,
								scope: this.form,
								data: {
									..._data,
									isAdd: !_data.isEdit
								}
							});
							// 如果value是一个函数,就执行函数.
							if (isFunction(e.value)) {
								this.form[e.prop] = Parse("value", {
									value: e.value,
									scope: this.form,
									data: {
										..._data,
										isAdd: !_data.isEdit
									}
								});
							}
							// 如果options是一个promise,就执行promise.
							if (e?.component?.options) {
								if (e.component.options?.then) {
									e.loading = true;
									e.component.options
										.then((res) => {
											e.component.options = res;
										})
										.finally(() => {
											e.loading = false;
										});
									e.component.options = [];
								}
							}

							// 动态函数的placeholder
							// if (e.component?.attrs?.placeholder) {

							//   if (isFunction(e.component?.attrs?.placeholder)) {
							//     console.log('this.form: ', JSON.stringify(this.form))
							//     e.component.attrs.placeholder = Parse('placeholder', {
							//       value: e.component.attrs.placeholder,
							//       scope: this.form,

							//       data: {
							//         ..._data
							//       }
							//     })
							//   }
							// }

							// 如果有customCheck属性,就覆盖validator属性,并抛出当前对象.
							if (e.rules?.customCheck && e.hidden !== true) {
								const func = e.rules?.customCheck;
								e.rules.validator = (rule, value, callback) => {
									const callbackTxt = func(value, this.form, e);
									// 如果返回的是一个promise函数,就异步执行,执行的时候设置loading
									if (callbackTxt?.then) {
										e.loading = true;
										callbackTxt
											.then((str) => {
												if (str === undefined) {
													callback();
												} else {
													callback(new Error(str));
												}
											})
											.finally(() => {
												e.loading = false;
											});
									} else {
										if (callbackTxt) {
											callback(new Error(callbackTxt));
										} else {
											// 自定义校验一定要返回一个空,否则表单的validator方法不会通过.
											callback();
										}
									}
								};
							}
							// 是否分组显示
							e._group =
								isEmpty(this.tabActive) || isEmpty(e.group)
									? true
									: e.group === this.tabActive;

							// 解析标题
							if (isString(e.label)) {
								e._label = {
									text: e.label + ":"
								};
							} else if (isObject(e.label)) {
								e._label = e.label + ":";
							} else {
								e._label = {
									text: ""
								};
							}
							let currentEdit = isEdit;

							// 属性自己的编辑状态权重更高, 但是如果是undefined, 就使用全局的编辑状态
							if (e.isEdit !== undefined) {
								currentEdit = e.isEdit;
							}
							const vNode = currentEdit ? (
								<p></p>
							) : (
								<p>
									{e.format
										? e.format(this.form[e.prop])
										: this.formatValue(e.prop, e.component)}
								</p>
							);

							let elFormItemPosition =
								props["label-position"] === "top" ? "column" : "row";

							return (
								!e._hidden && (
									<el-col
										key={`form-item-${e.prop}`}
										v-show={!this.collapseShow(e, i)}
										class={[
											{
												active: e.active
											}
										]}
										{...{
											props: {
												key: i,
												span: span,
												...e
											},
											nativeOn: {
												click: () => {
													lowCode && this.colHandleClick(e);
												}
											}
										}}>
										{e.component && (
											<el-form-item
												v-show={e._group}
												style={{ "flex-direction": elFormItemPosition }}
												{...{
													props: {
														label: e._label.text,
														prop: e.prop,
														rules: e.rules,
														...e.props
													}
												}}>
												{/* Redefine label */}
												<template slot="label">
													<el-tooltip
														effect="dark"
														placement="top"
														content={e._label.tip}
														disabled={!e._label.tip}>
														<span>
															{e._label.text}
															{e._label.icon && (
																<i class={e._label.icon}></i>
															)}
														</span>
													</el-tooltip>
												</template>

												{/* Form item */}
												<div class="cl-form-item">
													{/* Component */}
													{["prepend", "component", "append"].map(
														(name) => {
															/* // 如果是component才会执行编辑模式的判断,prepend和append都直接渲染原始数据 */
															let renderNodeTag = e[name];
															if (name === "component") {
																if (currentEdit) {
																	renderNodeTag = e[name];
																} else {
																	renderNodeTag = vNode;
																}
															} else {
																renderNodeTag = e[name];
															}
															return (
																e[name] && (
																	<div
																		v-loading={e.loading}
																		element-loading-spinner="el-icon-loading"
																		element-loading-background="transparent"
																		element-loading-customClass="crudLoading"
																		class={[
																			`cl-form-item__${name}`,
																			{
																				"is-flex": isEmpty(
																					e.flex
																				)
																					? true
																					: e.flex
																			}
																		]}>
																		{renderNode(renderNodeTag, {
																			ref: e.prop,
																			prop: e.prop,
																			on: {
																				change: (val) => {
																					// 如果组件有chang事件,就执行
																					e.component
																						.change &&
																						e.component.change(
																							val,
																							this
																								.form,
																							this
																								.form[
																							e
																								.prop
																							]
																						);
																					this.change(e);
																				}
																			},
																			scope: this.form,
																			$scopedSlots:
																				this.$scopedSlots
																		})}
																	</div>
																)
															);
														}
													)}
												</div>
											</el-form-item>
										)}
									</el-col>
								)
							);
						})}
					</el-row>
				</el-form>
			);
		},

		// 渲染操作按钮
		renderOp(collapseDom) {
			const { style } = __crud;
			const { hidden, buttons, saveButtonText, closeButtonText, buttonsLocation } =
				this.conf.op;

			if (hidden) {
				return collapseDom;
			} else {
				let btnDom = buttons.map((vnode) => {
					if (vnode === "save") {
						return (
							<div>
								<el-button
									{...{
										props: {
											size: "small",
											type: "primary",
											disabled: this.loading,
											loading: this.saving,
											...style.saveBtn
										},
										on: {
											click: () => {
												this.submit();
											}
										}
									}}>
									{saveButtonText}
								</el-button>
							</div>
						);
					} else if (vnode === "close") {
						return (
							<div class='u-m-l-10'>
								<el-button
									class="width100"
									{...{
										props: {
											size: "small",
											icon: "el-icon-refresh",
											...style.closeBtn
										},
										on: {
											click: () => {
												this.beforeClose();
											}
										}
									}}>
									{closeButtonText}
								</el-button>
							</div>
						);
					} else if (vnode === "select") {
						return (
							<div>
								<el-button
									{...{
										props: {
											size: "small",
											type: "primary",
											disabled: this.loading,
											loading: this.saving,
											icon: "el-icon-search",
											...style.saveBtn
										},
										on: {
											click: () => {
												this.submit();
											}
										}
									}}>
									查询
								</el-button>
							</div>
						);
					} else {
						return renderNode(vnode, {
							scope: this.form,
							$scopedSlots: this.$scopedSlots,
							$slots: this.$slots
						});
					}
				});
				return (
					<div class=" u-flex u-row-right u-m-r-10">
						{collapseDom} {btnDom}
					</div>
				);
			}
		}
	},

	render() {
		const { buttonsLocation, collapse } = this.conf.op;
		let Form;
		let collapseDom = collapse ? (
			<div
				class="cl-collapse"
				on-click={() => {
					this.collapseFlag = !this.collapseFlag;
				}}>
				{this.collapseFlag ? "展开" : "收起"}{" "}
				<i
					class={
						this.collapseFlag ? "el-icon-arrow-down " : "el-icon-arrow-down active"
					}></i>{" "}
			</div>
		) : (
			""
		);
		if (buttonsLocation === "right") {
			Form = (
				<div class="cl-form">
					<div class="cl-form__container u-flex-1">{this.renderForm()}</div>
					<div
						class={[
							{
								"cl-form-btn-core": this.getButtonFix(),
								"cl-form-btn": true
							}
						]}>
						{this.renderOp(collapseDom)}
					</div>
				</div>
			);
		}
		if (buttonsLocation === "bottom") {
			Form = (
				<div class="cl-form">
					<div class="cl-form__container">{this.renderForm()}</div>
					<div class="cl-form__footer">{this.renderOp(collapseDom)}</div>
				</div>
			);
		}

		if (this.inner) {
			return Form;
		} else {
			const { title, width, dialog } = this.conf;

			return (
				<cl-dialog
					title={title}
					width={width}
					visible={this.visible}
					{...{
						props: {
							...dialog,
							props: {
								...dialog.props,
								"before-close": this.beforeClose
							}
						},
						on: {
							"update:visible": (v) => (this.visible = v),
							"update:props:fullscreen": (v) => (dialog.props.fullscreen = v),
							closed: this.onClosed
						}
					}}>
					{Form}
				</cl-dialog>
			);
		}
	}
};
