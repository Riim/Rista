import { Cell, ICellOptions, TCellPull } from 'cellx';
import { Component } from './Component';
import { IFreezableCell } from './componentBinding';
export declare class AttributeBindingCell extends Cell {
    prevValue: any;
    element: Element;
    attributeName: string;
    constructor(pull: TCellPull<any>, el: Element, attrName: string, opts?: ICellOptions<any>);
}
export declare class TextNodeBindingCell extends Cell {
    textNode: Text;
    constructor(pull: TCellPull<string>, textNode: Text, opts?: ICellOptions<string>);
}
export declare function bindContent(node: Element | DocumentFragment, ownerComponent: Component, context: object, result: [Array<IFreezableCell> | null, Array<Component> | null]): [Array<IFreezableCell> | null, Array<Component> | null];
