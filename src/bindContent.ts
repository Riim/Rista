import { Set } from '@riim/map-set-polyfill';
import { setAttribute } from '@riim/set-attribute';
import {
	Cell,
	ICellOptions,
	IEvent,
	TCellPull,
	TListener
	} from 'cellx';
import {
	BaseComponent,
	I$ComponentParamConfig,
	IComponentParamConfig,
	IPossiblyComponentElement,
	KEY_PARAMS_CONFIG
	} from './BaseComponent';
import { compileContentNodeValue } from './compileContentNodeValue';
import { IFreezableCell } from './componentBinding';
import { ContentNodeValueNodeType, ContentNodeValueParser, IContentNodeValueBinding } from './ContentNodeValueParser';
import { compileKeypath } from './lib/compileKeypath';

export class AttributeBindingCell extends Cell {
	prevValue: any;

	element: Element;
	attributeName: string;

	constructor(pull: TCellPull<any>, el: Element, attrName: string, opts?: ICellOptions<any>) {
		super(pull, opts);
		this.element = el;
		this.attributeName = attrName;
	}
}

export class TextNodeBindingCell extends Cell {
	textNode: Text;

	constructor(pull: TCellPull<string>, textNode: Text, opts?: ICellOptions<string>) {
		super(pull, opts);
		this.textNode = textNode;
	}
}

function onAttributeBindingCellChange(evt: IEvent<AttributeBindingCell>) {
	setAttribute(evt.target.element, evt.target.attributeName, evt.data.value);
}

function onTextNodeBindingCellChange(evt: IEvent<TextNodeBindingCell>) {
	evt.target.textNode.nodeValue = evt.data.value;
}

export function bindContent(
	node: Element | DocumentFragment,
	ownerComponent: BaseComponent,
	context: object,
	result: [
		Array<IFreezableCell> | null,
		Array<[BaseComponent, string, (evt: any) => void]> | null,
		Array<BaseComponent> | null
	]
) {
	for (let child = node.firstChild; child; child = child.nextSibling) {
		switch (child.nodeType) {
			case Node.ELEMENT_NODE: {
				let childComponent = (child as IPossiblyComponentElement).$component;
				let $paramsConfig: { [name: string]: I$ComponentParamConfig } | undefined;
				let $specifiedParams: Set<string> | undefined;

				if (childComponent) {
					$paramsConfig = childComponent.constructor[KEY_PARAMS_CONFIG];
					$specifiedParams = new Set();
				}

				let attrs = child.attributes;

				for (let i = attrs.length; i; ) {
					let attr = attrs.item(--i);
					let name = attr.name;

					if (name.charAt(0) == '_') {
						name = name.slice(1);
					}

					let $paramConfig = $paramsConfig && $paramsConfig[name];

					let paramName: string | undefined;
					let paramConfig: IComponentParamConfig | Function | undefined;

					if ($paramConfig) {
						paramName = $paramConfig.name;
						paramConfig = $paramConfig.paramConfig;

						$specifiedParams!.add(paramName!);
					}

					let value = attr.value;

					if (value.indexOf('{') == -1) {
						continue;
					}

					let contentNodeValue = new ContentNodeValueParser(value).parse();
					let contentNodeValueLength = contentNodeValue.length;

					if (
						contentNodeValueLength > 1 ||
						contentNodeValue[0].nodeType == ContentNodeValueNodeType.BINDING
					) {
						let prefix =
							contentNodeValueLength == 1
								? (contentNodeValue[0] as IContentNodeValueBinding).prefix
								: null;

						if (prefix !== '->') {
							let cell = new AttributeBindingCell(
								compileContentNodeValue(
									contentNodeValue,
									value,
									contentNodeValueLength == 1
								),
								child as any,
								paramName || name,
								{
									context,
									onChange: onAttributeBindingCellChange
								}
							);

							setAttribute(child as any, paramName || name, cell.get());

							(result[0] || (result[0] = [])).push(cell as any);
						}

						if (paramConfig !== undefined && (prefix === '->' || prefix === '<->')) {
							if (prefix == '->' && attr.name.charAt(0) != '_') {
								(child as Element).removeAttribute(paramName!);
							}

							let keypath = (contentNodeValue[0] as IContentNodeValueBinding)
								.keypath!;
							let keys = keypath.split('.');
							let propertyName: string;
							let handler: TListener;

							if (keys.length == 1) {
								propertyName = keys[0];

								handler = function(evt) {
									this.ownerComponent[propertyName] = evt.data.value;
								};
							} else {
								propertyName = keys[keys.length - 1];
								keys = keys.slice(0, -1);

								let getPropertyHolder = compileKeypath(keys, keys.join('.'));

								handler = function(evt) {
									let propertyHolder = getPropertyHolder.call(
										this.ownerComponent
									);

									if (propertyHolder) {
										propertyHolder[propertyName] = evt.data.value;
									}
								};
							}

							(result[1] || (result[1] = [])).push([
								childComponent!,
								(typeof paramConfig == 'object' &&
									(paramConfig.type !== undefined ||
										paramConfig.default !== undefined) &&
									paramConfig.property) ||
									paramName!,
								handler
							]);
						}
					}
				}

				if (childComponent) {
					childComponent._ownerComponent = ownerComponent;
					childComponent.$context = context;
					childComponent.$specifiedParams = $specifiedParams;

					(result[2] || (result[2] = [])).push(childComponent);
				}

				if (
					child.firstChild &&
					(!childComponent ||
						(childComponent.constructor as typeof BaseComponent).template == null)
				) {
					bindContent(child as Element, ownerComponent, context, result);
				}

				break;
			}
			case Node.TEXT_NODE: {
				for (
					let nextChild;
					(nextChild = child.nextSibling) && nextChild.nodeType == Node.TEXT_NODE;

				) {
					child.nodeValue += nextChild.nodeValue!;
					node.removeChild(nextChild);
				}

				let value = child.nodeValue!;

				if (value.indexOf('{') == -1) {
					break;
				}

				let contentNodeValue = new ContentNodeValueParser(value).parse();

				if (
					contentNodeValue.length > 1 ||
					contentNodeValue[0].nodeType == ContentNodeValueNodeType.BINDING
				) {
					let cell = new TextNodeBindingCell(
						compileContentNodeValue(contentNodeValue, value, false),
						child as Text,
						{
							context,
							onChange: onTextNodeBindingCellChange
						}
					);

					child.nodeValue = cell.get();

					(result[0] || (result[0] = [])).push(cell as any);
				}

				break;
			}
		}
	}

	return result;
}
