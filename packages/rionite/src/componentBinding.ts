import {
	Cell,
	IEvent,
	IRegisteredEvent,
	TListener
	} from 'cellx';

export interface IFrozenState {
	changeEventListener: TListener;
	changeEventContext: any;
	value: any;
}

export interface IFreezableCell extends Cell {
	_value: any;

	_changeEvent: IEvent | null;
	_canCancelChange: boolean;

	_frozenState: IFrozenState | null;

	_addToRelease(): void;
}

function freezeBinding(binding: IFreezableCell) {
	let changeEvent = binding._events.get('change') as IRegisteredEvent;

	binding._events.delete('change');

	binding._frozenState = {
		changeEventListener: changeEvent.listener,
		changeEventContext: changeEvent.context,
		value: binding._value
	};
}

function unfreezeBinding(binding: IFreezableCell) {
	let frozenState = binding._frozenState!;

	binding._frozenState = null;

	binding.on('change', frozenState.changeEventListener, frozenState.changeEventContext);

	if (frozenState.value !== binding._value) {
		binding._changeEvent = {
			target: binding,
			type: 'change',
			data: {
				prevEvent: null,
				prevValue: frozenState.value,
				value: binding._value
			}
		};
		binding._canCancelChange = true;

		binding._addToRelease();
	}
}

export function freezeBindings(bindings: Array<IFreezableCell>) {
	Cell.forceRelease();

	for (let binding of bindings) {
		freezeBinding(binding);
	}
}

export function unfreezeBindings(bindings: Array<IFreezableCell>) {
	for (let binding of bindings) {
		unfreezeBinding(binding);
	}

	Cell.forceRelease();
}