import { Component } from '../Component';
export declare class RtSlot extends Component {
    ownerComponent: Component;
    _childComponents: Array<Component> | null;
    _attach(): void;
    _detach(): void;
}
