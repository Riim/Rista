import './lib/polyfills';
import './lib/templateTransformers';

export { configure } from './config';
export { formatters } from './lib/formatters';
export { Component } from './decorators/Component';
export { Param } from './decorators/Param';
export { Listen } from './decorators/Listen';
export { KEY_PARAMS_CONFIG, KEY_PARAM_VALUES } from './Constants';
export {
	IDisposable,
	IDisposableListening,
	IDisposableTimeout,
	IDisposableInterval,
	IDisposableCallback,
	TListeningTarget,
	TListener,
	IComponentParamConfig,
	I$ComponentParamConfig,
	IPossiblyComponentElement,
	IComponentElement,
	TComponentListeningTarget,
	IComponentListening,
	TEventHandler,
	IComponentEvents,
	THookCallback,
	onReady,
	onElementAttached,
	onElementDetached,
	onElementMoved,
	BaseComponent
} from './BaseComponent';
export { KEY_ELEMENT_CONNECTED } from './ElementProtoMixin';
export { ComponentParams } from './ComponentParams';
export {
	NodeType as TemplateNodeType,
	IBlock as ITemplateBlock,
	KEY_CONTENT_TEMPLATE,
	Template
} from './Template';
export { registerComponent } from './registerComponent';
export { RnIfThen } from './components/RnIfThen';
export { RnIfElse } from './components/RnIfElse';
export {
	TList as TRnRepeatList,
	I$Item as IRnRepeatItem,
	T$ItemsMap as TRnRepeatItemsMap,
	RnRepeat
} from './components/RnRepeat';
export { RnSlot } from './components/RnSlot';
