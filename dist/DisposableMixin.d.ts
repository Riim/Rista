import { IEvent, EventEmitter } from 'cellx';
export declare type ListeningTarget = EventEmitter | EventTarget | Array<EventEmitter | EventTarget> | NodeList | HTMLCollection;
export interface IListener {
    (evt: IEvent | Event): boolean | undefined;
}
export interface IListening {
    stop: () => void;
    dispose: () => void;
}
export default class DisposableMixin {
    _disposables: {
        [id: string]: any;
    };
    listenTo(target: ListeningTarget | Array<ListeningTarget>, type: string | Array<string>, listener: IListener | Array<IListener>, context?: any): IListening;
    listenTo(target: ListeningTarget | Array<ListeningTarget>, listeners: {
        [type: string]: IListener | Array<IListener>;
    }, context?: any): IListening;
    _listenTo(target: EventEmitter | EventTarget, type: string, listener: IListener, context: any): IListening;
    setTimeout(cb: Function, delay: number): {
        clear: () => void;
        dispose: () => void;
    };
    setInterval(cb: Function, delay: number): {
        clear: () => void;
        dispose: () => void;
    };
    registerCallback(cb: Function): {
        (): void;
        cancel: () => void;
        dispose: () => void;
    };
    dispose(): DisposableMixin;
}