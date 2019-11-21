import { kebabCase } from '@riim/kebab-case';
import { pascalize } from '@riim/pascalize';
import { snakeCaseAttributeName } from '@riim/rionite-snake-case-attribute-name';
import { Cell, EventEmitter } from 'cellx';
import { BaseComponent, I$ComponentParamConfig, IComponentParamConfig } from './BaseComponent';
import { componentConstructors } from './componentConstructors';
import { KEY_COMPONENT_PARAMS_INITED } from './ComponentParams';
import { KEY_COMPONENT_SELF, KEY_PARAM_VALUES, KEY_PARAMS_CONFIG } from './Constants';
import { elementConstructors } from './elementConstructors';
import { ElementProtoMixin, KEY_RIONITE_COMPONENT_CONSTRUCTOR } from './ElementProtoMixin';
import { Template } from './Template';

const hasOwn = Object.prototype.hasOwnProperty;
const push = Array.prototype.push;

function inheritProperty(
	target: Record<string, any>,
	source: Record<string, any>,
	name: string,
	depth: number
) {
	let obj = target[name] as Record<string, any> | null | undefined;
	let parentObj = source[name] as Record<string, any> | null | undefined;

	if (obj && parentObj && obj != parentObj) {
		let inheritedObj: Record<string, any> = (target[name] = { __proto__: parentObj });

		for (let key in obj) {
			if (hasOwn.call(obj, key)) {
				inheritedObj[key] = obj[key];

				if (depth) {
					inheritProperty(inheritedObj, parentObj, key, depth - 1);
				}
			}
		}
	}
}

export function registerComponent(componentCtor: typeof BaseComponent) {
	let elIs = componentCtor.hasOwnProperty('elementIs')
		? componentCtor.elementIs
		: (componentCtor.elementIs = componentCtor.name);

	if (!elIs) {
		throw new TypeError('Static property "elementIs" is required');
	}

	let kebabCaseElIs = kebabCase(elIs, true);

	if (componentConstructors.has(kebabCaseElIs)) {
		throw new TypeError(`Component "${kebabCaseElIs}" already registered`);
	}

	let componentProto = componentCtor.prototype;
	let parentComponentCtor = Object.getPrototypeOf(componentProto)
		.constructor as typeof BaseComponent;

	inheritProperty(componentCtor, parentComponentCtor, 'params', 0);

	componentCtor[KEY_PARAMS_CONFIG] = null;

	let paramsConfig = componentCtor.params;

	for (let name in paramsConfig) {
		let paramConfig: IComponentParamConfig | null = paramsConfig[name];

		if (paramConfig === null || paramConfig === Object.prototype[name]) {
			continue;
		}

		let snakeCaseName = snakeCaseAttributeName(name, true);

		let isObject = typeof paramConfig == 'object';

		let propertyName = (isObject && paramConfig.property) || name;

		let required: boolean;
		let readonly: boolean;

		if (isObject) {
			required = paramConfig.required || false;
			readonly = paramConfig.readonly || false;
		} else {
			required = readonly = false;
		}

		let $paramConfig: I$ComponentParamConfig = {
			name,
			property: propertyName,

			type: undefined,
			valueСonverters: undefined,

			default: undefined,

			required,
			readonly,

			paramConfig
		};

		(componentCtor[KEY_PARAMS_CONFIG] || (componentCtor[KEY_PARAMS_CONFIG] = new Map()))!
			.set(name, $paramConfig)
			.set(snakeCaseName, $paramConfig);

		Object.defineProperty(componentProto, propertyName + 'Cell', {
			configurable: true,
			enumerable: false,
			writable: true,
			value: null
		});

		let descriptor = {
			configurable: true,
			enumerable: true,

			get(this: BaseComponent) {
				let self = this[KEY_COMPONENT_SELF];
				let valueCell: Cell | null = self[propertyName + 'Cell'];

				if (valueCell) {
					return valueCell.get();
				}

				let value = self[KEY_PARAM_VALUES].get(name);

				if (Cell.currentlyPulling || EventEmitter.currentlySubscribing) {
					self[KEY_PARAM_VALUES].delete(name);
					valueCell = new Cell(null, {
						context: self,
						value
					});

					Object.defineProperty(self, propertyName + 'Cell', {
						configurable: true,
						enumerable: false,
						writable: true,
						value: valueCell
					});

					if (Cell.currentlyPulling) {
						return valueCell.get();
					}
				}

				return value;
			},

			set(this: BaseComponent, value: any) {
				let self = this[KEY_COMPONENT_SELF];
				let valueCell: Cell | null = self[propertyName + 'Cell'];

				if (self[KEY_COMPONENT_PARAMS_INITED]) {
					if (readonly) {
						if (
							value !==
							(valueCell ? valueCell.get() : self[KEY_PARAM_VALUES].get(name))
						) {
							throw new TypeError(`Parameter "${name}" is readonly`);
						}

						return;
					}

					if ($paramConfig.valueСonverters!.toString) {
						let rawValue = $paramConfig.valueСonverters!.toString(
							value,
							$paramConfig.default
						);

						if (rawValue === null) {
							self.element.removeAttribute(snakeCaseName);
						} else {
							self.element.setAttribute(snakeCaseName, rawValue);
						}
					}
				}

				if (valueCell) {
					valueCell.set(value);
				} else {
					self[KEY_PARAM_VALUES].set(name, value);
				}
			}
		};

		Object.defineProperty(componentProto, propertyName, descriptor);
	}

	inheritProperty(componentCtor, parentComponentCtor, 'i18n', 0);

	componentCtor._blockNamesString = elIs + ' ' + (parentComponentCtor._blockNamesString || '');

	componentCtor._elementBlockNames = [elIs];

	if (parentComponentCtor._elementBlockNames) {
		push.apply(componentCtor._elementBlockNames, parentComponentCtor._elementBlockNames);
	}

	let template = componentCtor.template;

	if (template !== null) {
		if (template === parentComponentCtor.template) {
			componentCtor.template = (template as Template).extend('', {
				blockName: elIs
			});
		} else if (template instanceof Template) {
			template.setBlockName(componentCtor._elementBlockNames);
		} else {
			componentCtor.template = parentComponentCtor.template
				? (parentComponentCtor.template as Template).extend(template, {
						blockName: elIs
				  })
				: new Template(template, { blockName: componentCtor._elementBlockNames });
		}
	}

	inheritProperty(componentCtor, parentComponentCtor, 'events', 1);
	inheritProperty(componentCtor, parentComponentCtor, 'domEvents', 1);

	let elExtends = componentCtor.elementExtends;
	let parentElCtor: typeof HTMLElement;

	if (elExtends) {
		parentElCtor =
			elementConstructors.get(elExtends) || window[`HTML${pascalize(elExtends)}Element`];

		if (!parentElCtor) {
			throw new TypeError(`Component "${elExtends}" is not registered`);
		}
	} else {
		parentElCtor = HTMLElement;
	}

	let elCtor = class extends parentElCtor {
		static [KEY_RIONITE_COMPONENT_CONSTRUCTOR] = componentCtor;

		static get observedAttributes() {
			let paramsConfig = componentCtor.params;
			let attrs: Array<string> = [];

			for (let name in paramsConfig) {
				if (paramsConfig[name] !== null && paramsConfig[name] !== Object.prototype[name]) {
					attrs.push(snakeCaseAttributeName(name, true));
				}
			}

			return attrs;
		}
	};

	let elProto = elCtor.prototype;

	elProto.constructor = elCtor;

	let names: Array<string | symbol> = Object.getOwnPropertyNames(ElementProtoMixin);

	for (let name of names) {
		Object.defineProperty(
			elProto,
			name,
			Object.getOwnPropertyDescriptor(ElementProtoMixin, name)!
		);
	}

	names = Object.getOwnPropertySymbols(ElementProtoMixin);

	for (let name of names) {
		Object.defineProperty(
			elProto,
			name,
			Object.getOwnPropertyDescriptor(ElementProtoMixin, name)!
		);
	}

	componentConstructors.set(elIs, componentCtor).set(kebabCaseElIs, componentCtor);
	elementConstructors.set(elIs, elCtor);

	window.customElements.define(
		kebabCaseElIs,
		elCtor,
		elExtends ? { extends: elExtends } : undefined
	);

	return componentCtor;
}
