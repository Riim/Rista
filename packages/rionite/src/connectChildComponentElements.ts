import { BaseComponent, callLifecycle } from './BaseComponent';
import { ComponentParams } from './ComponentParams';

export function connectChildComponentElements(childComponents: Array<BaseComponent>) {
	for (let component of childComponents) {
		component._parentComponent = undefined;

		ComponentParams.init(component);

		callLifecycle(
			[
				component.elementConnected,
				...(component.constructor as typeof BaseComponent)._lifecycleHooks.elementConnected,
				...((component._lifecycleHooks && component._lifecycleHooks.elementConnected) || [])
			],
			component
		);

		component._connect();
	}
}