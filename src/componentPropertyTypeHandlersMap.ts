import { JS } from 'cellx';
import { escapeHTML, unescapeHTML } from '@riim/escape-html';
import Component from './Component';
import KEY_COMPONENT_PROPERTY_VALUES from './KEY_COMPONENT_PROPERTY_VALUES';
import isRegExp from './Utils/isRegExp';

let componentPropertyTypeHandlersMap = new JS.Map<any, [
	(value: string | null, defaultValue: any, component: Component) => any,
	(value: any, defaultValue?: any) => string | null
]>([
	[Boolean, [
		(value: string | null, defaultValue: boolean | undefined): boolean => {
			return value !== null ? value != 'no' : !!defaultValue;
		},
		(value: any, defaultValue: boolean | undefined): string | null => {
			return value ? '' : (defaultValue ? 'no' : null);
		}
	]],

	[Number, [
		(value: string | null, defaultValue: number | undefined): number | null => {
			return value !== null ? +value : (defaultValue !== undefined ? defaultValue : null);
		},
		(value: any): string | null => {
			return value != null ? String(+value) : null;
		}
	]],

	[String, [
		(value: string | null, defaultValue: string | undefined): string | null => {
			return value !== null ? value : (defaultValue !== undefined ? defaultValue : null);
		},
		(value: any): string | null => {
			return value != null ? String(value) : null;
		}
	]],

	[Object, [
		(value: string | null, defaultValue: Object | null | undefined, component: Component): Object | null => {
			if (value === null) {
				return defaultValue || null;
			}

			let componentPropertyValues = component.ownerComponent &&
				component.ownerComponent[KEY_COMPONENT_PROPERTY_VALUES] as Map<string, Object> | undefined;

			if (!componentPropertyValues || !componentPropertyValues.has(value)) {
				throw new TypeError('Value is not an object');
			}

			let val = componentPropertyValues.get(value);
			componentPropertyValues.delete(value);
			return val;
		},
		(value: any): string | null => {
			return value != null ? '' : null;
		}
	]],

	[eval, [
		(value: string | null, defaultValue: any): any => {
			return value !== null ?
				Function(`return ${ unescapeHTML(value) };`)() :
				(defaultValue !== undefined ? defaultValue : null);
		},
		(value: any): string | null => {
			return value != null ? escapeHTML(isRegExp(value) ? value.toString() : JSON.stringify(value)) : null;
		}
	]]
]);

componentPropertyTypeHandlersMap.set('boolean', componentPropertyTypeHandlersMap.get(Boolean));
componentPropertyTypeHandlersMap.set('number', componentPropertyTypeHandlersMap.get(Number));
componentPropertyTypeHandlersMap.set('string', componentPropertyTypeHandlersMap.get(String));
componentPropertyTypeHandlersMap.set('object', componentPropertyTypeHandlersMap.get(Object));

export default componentPropertyTypeHandlersMap;
