(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("cellx"));
	else if(typeof define === 'function' && define.amd)
		define(["cellx"], factory);
	else if(typeof exports === 'object')
		exports["rionite"] = factory(require("cellx"));
	else
		root["Rionite"] = root["rionite"] = factory(root["cellx"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 53);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var cellx_1 = __webpack_require__(0);
var DisposableMixin_1 = __webpack_require__(15);
var registerComponent_1 = __webpack_require__(45);
var ElementAttributes_1 = __webpack_require__(16);
var initElementClasses_1 = __webpack_require__(43);
var initElementAttributes_1 = __webpack_require__(42);
var bindContent_1 = __webpack_require__(6);
var componentBinding_1 = __webpack_require__(39);
var attachChildComponentElements_1 = __webpack_require__(5);
var bindEvents_1 = __webpack_require__(36);
var eventTypes_1 = __webpack_require__(41);
var onEvent_1 = __webpack_require__(44);
var camelize_1 = __webpack_require__(4);
var getUID_1 = __webpack_require__(33);
var htmlToFragment_1 = __webpack_require__(18);
var Features_1 = __webpack_require__(3);
var Map = cellx_1.JS.Map;
var createClass = cellx_1.Utils.createClass;
var map = Array.prototype.map;
function findChildComponentElements(node, ownerComponent, context, _childComponents) {
    for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 1) {
            var childComponent = child.$c;
            if (childComponent) {
                childComponent.ownerComponent = ownerComponent;
                childComponent.props.context = context;
                (_childComponents || (_childComponents = [])).push(childComponent);
            }
            if (child.firstChild &&
                (!childComponent || childComponent.constructor.template == null)) {
                findChildComponentElements(child, ownerComponent, context, _childComponents);
            }
        }
    }
    return _childComponents || null;
}
var created;
var initialize;
var ready;
var elementAttached;
var elementDetached;
var elementMoved;
var elementAttributeChanged;
var Component = (function (_super) {
    __extends(Component, _super);
    function Component(el, props) {
        var _this = _super.call(this) || this;
        _this.ownerComponent = null;
        _this._parentComponent = null;
        _this.isElementAttached = false;
        _this.initialized = false;
        _this.isReady = false;
        DisposableMixin_1.default.call(_this);
        var constr = _this.constructor;
        if (constr._registeredComponent !== constr) {
            throw new TypeError('Component must be registered');
        }
        if (el == null) {
            el = document.createElement(constr.elementIs);
        }
        else if (typeof el == 'string') {
            var elIs = constr.elementIs;
            var html = el;
            el = document.createElement(elIs);
            el.innerHTML = html;
            var firstChild = el.firstChild;
            if (firstChild && firstChild == el.lastChild && firstChild.nodeType == 1 && (firstChild.tagName.toLowerCase() == elIs ||
                firstChild.getAttribute('is') == elIs)) {
                el = firstChild;
            }
        }
        _this.element = el;
        el.rioniteComponent = _this;
        Object.defineProperty(el, '$c', { value: _this });
        if (props) {
            var properties = _this.props;
            for (var name_1 in props) {
                properties[camelize_1.default(name_1)] = props[name_1];
            }
        }
        _this.created();
        return _this;
    }
    Component.extend = function (elIs, description) {
        description.Extends = this;
        (description.Static || (description.Static = {})).elementIs = elIs;
        return registerComponent_1.default(createClass(description));
    };
    Object.defineProperty(Component.prototype, "parentComponent", {
        get: function () {
            if (this._parentComponent !== undefined) {
                return this._parentComponent;
            }
            for (var node = void 0; (node = (node || this.element).parentNode);) {
                if (node.$c) {
                    return (this._parentComponent = node.$c);
                }
            }
            return (this._parentComponent = null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "elementAttributes", {
        get: function () {
            var attrs = new ElementAttributes_1.default(this.element);
            Object.defineProperty(this, 'elementAttributes', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: attrs
            });
            return attrs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "props", {
        get: function () {
            var props = Object.create(this.elementAttributes);
            props._content = null;
            props.context = null;
            Object.defineProperty(this, 'props', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: props
            });
            return props;
        },
        enumerable: true,
        configurable: true
    });
    Component.prototype._handleEvent = function (evt) {
        _super.prototype._handleEvent.call(this, evt);
        var silent = this._isComponentSilent;
        if (silent === undefined) {
            silent = this._isComponentSilent = this.element.hasAttribute('rt-silent');
        }
        if (!silent && evt.bubbles !== false && !evt.isPropagationStopped) {
            var parentComponent = this.parentComponent;
            if (parentComponent) {
                parentComponent._handleEvent(evt);
            }
            else {
                onEvent_1.default(evt);
            }
        }
    };
    Component.prototype._attachElement = function () {
        if (!this.initialized) {
            this.initialize();
            this.initialized = true;
        }
        var constr = this.constructor;
        if (this.isReady) {
            this._unfreezeBindings();
            if (constr.events) {
                bindEvents_1.default(this, constr.events);
            }
        }
        else {
            var el = this.element;
            initElementClasses_1.default(el, constr);
            initElementAttributes_1.default(this, constr);
            var template = constr.template;
            if (template == null) {
                var childComponents = findChildComponentElements(el, this.ownerComponent, this.ownerComponent);
                if (childComponents) {
                    attachChildComponentElements_1.default(childComponents);
                }
                if (constr.events) {
                    bindEvents_1.default(this, constr.events);
                }
            }
            else {
                var inputContent = this.props._content = document.createDocumentFragment();
                for (var child = void 0; (child = el.firstChild);) {
                    inputContent.appendChild(child);
                }
                var rawContent = constr._rawContent;
                if (!rawContent) {
                    rawContent = constr._rawContent = htmlToFragment_1.default(typeof template == 'string' ? template : template.render(constr));
                }
                var content = rawContent.cloneNode(true);
                var _a = bindContent_1.default(content, this), bindings = _a.bindings, childComponents = _a.childComponents;
                this._bindings = bindings;
                this.element.appendChild(content);
                if (!Features_1.nativeCustomElements && childComponents) {
                    attachChildComponentElements_1.default(childComponents);
                }
                if (constr.events) {
                    bindEvents_1.default(this, constr.events);
                }
            }
            this.ready();
            this.isReady = true;
        }
        this.elementAttached();
    };
    Component.prototype._detachElement = function () {
        this.elementDetached();
        this.dispose();
    };
    Component.prototype.dispose = function () {
        this._freezeBindings();
        return DisposableMixin_1.default.prototype.dispose.call(this);
    };
    Component.prototype._freezeBindings = function () {
        if (this._bindings) {
            componentBinding_1.freezeBindings(this._bindings);
        }
    };
    Component.prototype._unfreezeBindings = function () {
        if (this._bindings) {
            componentBinding_1.unfreezeBindings(this._bindings);
        }
    };
    Component.prototype._destroyBindings = function () {
        var bindings = this._bindings;
        if (bindings) {
            for (var i = bindings.length; i;) {
                bindings[--i].off();
            }
            this._bindings = null;
        }
    };
    // Callbacks
    Component.prototype.created = function () { };
    Component.prototype.initialize = function () { };
    Component.prototype.ready = function () { };
    Component.prototype.elementAttached = function () { };
    Component.prototype.elementDetached = function () { };
    Component.prototype.elementMoved = function () { };
    Component.prototype.elementAttributeChanged = function (name, oldValue, value) { };
    // Utils
    Component.prototype.$ = function (name, container) {
        var assetList = this._getAssetList(name, container);
        return assetList && assetList.length ? assetList[0].$c || assetList[0] : null;
    };
    Component.prototype.$$ = function (name, container) {
        var assetList = this._getAssetList(name, container);
        return assetList ? map.call(assetList, function (el) { return el.$c || el; }) : [];
    };
    Component.prototype._getAssetList = function (name, container) {
        var assets = this._assets || (this._assets = new Map());
        var containerEl = container ?
            (container instanceof Component ? container.element : container) :
            this.element;
        var key = container ? getUID_1.default(containerEl) + '/' + name : name;
        var assetList = assets.get(key);
        if (!assetList) {
            var constr = this.constructor;
            var className = constr._assetClassNames[name];
            if (className) {
                assetList = containerEl.getElementsByClassName(className);
                assets.set(key, assetList);
            }
            else {
                var markupBlockNames = constr._markupBlockNames;
                if (!markupBlockNames) {
                    throw new TypeError('Component must have a template');
                }
                for (var i = markupBlockNames.length; i;) {
                    className = markupBlockNames[--i] + '__' + name;
                    assetList = containerEl.getElementsByClassName(className);
                    if (assetList.length) {
                        constr._assetClassNames[name] = className;
                        assets.set(key, assetList);
                        break;
                    }
                }
                if (!assetList.length) {
                    return;
                }
            }
        }
        return assetList;
    };
    return Component;
}(cellx_1.EventEmitter));
Component.register = registerComponent_1.default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Component;
var DisposableMixinProto = DisposableMixin_1.default.prototype;
var ComponentProto = Component.prototype;
Object.getOwnPropertyNames(DisposableMixinProto).forEach(function (name) {
    if (!(name in ComponentProto)) {
        Object.defineProperty(ComponentProto, name, Object.getOwnPropertyDescriptor(DisposableMixinProto, name));
    }
});
created = ComponentProto.created;
initialize = ComponentProto.initialize;
ready = ComponentProto.ready;
elementAttached = ComponentProto.elementAttached;
elementDetached = ComponentProto.elementDetached;
elementMoved = ComponentProto.elementMoved;
elementAttributeChanged = ComponentProto.elementAttributeChanged;
document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
    document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
    eventTypes_1.default.forEach(function (type) {
        document.addEventListener(type, onEvent_1.default);
    });
});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Component_1 = __webpack_require__(1);
var d = {
    Component: function Component_(config) {
        return function (componentConstr) {
            if (config.elementIs) {
                componentConstr.elementIs = config.elementIs;
            }
            if (config.elementExtends) {
                componentConstr.elementExtends = config.elementExtends;
            }
            if (config.elementAttributes !== undefined) {
                componentConstr.elementAttributes = config.elementAttributes;
            }
            if (config.props !== undefined) {
                componentConstr.props = config.props;
            }
            if (config.i18n) {
                componentConstr.i18n = config.i18n;
            }
            if (config.template !== undefined) {
                componentConstr.template = config.template;
            }
            if (config.bemlTemplate !== undefined) {
                componentConstr.bemlTemplate = config.bemlTemplate;
            }
            if (config.events !== undefined) {
                componentConstr.events = config.events;
            }
            Component_1.default.register(componentConstr);
        };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = d;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var div = document.createElement('div');
div.innerHTML = '<template>1</template>';
var template = div.firstChild;
exports.templateTag = !template.firstChild;
var CustomElementRegistry = window.CustomElementRegistry;
exports.nativeCustomElements = !!CustomElementRegistry &&
    Object.prototype.toString.call(CustomElementRegistry).indexOf('[native code]') > -1;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reHyphen = /[-_]+([a-z]|$)/g;
var cache = Object.create(null);
function camelize(str) {
    return cache[str] || (cache[str] = str.replace(reHyphen, function (match, chr) {
        return chr.toUpperCase();
    }));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = camelize;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function attachChildComponentElements(childComponents) {
    for (var _i = 0, childComponents_1 = childComponents; _i < childComponents_1.length; _i++) {
        var childComponent = childComponents_1[_i];
        if (!childComponent.isElementAttached) {
            childComponent.isElementAttached = true;
            childComponent._attachElement();
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = attachChildComponentElements;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var ContentParser_1 = __webpack_require__(14);
var compileContent_1 = __webpack_require__(38);
var setAttribute_1 = __webpack_require__(34);
var ContentNodeType = ContentParser_1.default.ContentNodeType;
var reBinding = /{[^}]+}/;
function bindContent(content, ownerComponent, context) {
    if (!context) {
        context = ownerComponent;
    }
    var bindings;
    var childComponents;
    function bind(content) {
        var _loop_1 = function (child) {
            switch (child.nodeType) {
                case 1: {
                    var attrs = child.attributes;
                    var _loop_2 = function (i) {
                        var attr = attrs.item(--i);
                        var value = attr.value;
                        if (reBinding.test(value)) {
                            var parsedValue = (new ContentParser_1.default(value)).parse();
                            if (parsedValue.length > 1 || parsedValue[0].nodeType == ContentNodeType.BINDING) {
                                var name_1 = attr.name;
                                if (name_1.charAt(0) == '_') {
                                    name_1 = name_1.slice(1);
                                }
                                var cell = new cellx_1.Cell(compileContent_1.default(parsedValue, value), {
                                    owner: context,
                                    onChange: function (evt) {
                                        setAttribute_1.default(child, name_1, evt['value']);
                                    }
                                });
                                setAttribute_1.default(child, name_1, cell.get());
                                (bindings || (bindings = [])).push(cell);
                            }
                        }
                        out_i_1 = i;
                    };
                    var out_i_1;
                    for (var i = attrs.length; i;) {
                        _loop_2(i);
                        i = out_i_1;
                    }
                    var childComponent = child.$c;
                    if (childComponent) {
                        childComponent.ownerComponent = ownerComponent;
                        childComponent.props.context = context;
                        (childComponents || (childComponents = [])).push(childComponent);
                    }
                    if (child.firstChild &&
                        (!childComponent || childComponent.constructor.template == null)) {
                        bind(child);
                    }
                    break;
                }
                case 3: {
                    var content_1 = child.textContent;
                    if (reBinding.test(content_1)) {
                        var parsedContent = (new ContentParser_1.default(content_1)).parse();
                        if (parsedContent.length > 1 || parsedContent[0].nodeType == ContentNodeType.BINDING) {
                            var cell = new cellx_1.Cell(compileContent_1.default(parsedContent, content_1), {
                                owner: context,
                                onChange: function (evt) {
                                    child.textContent = evt['value'];
                                }
                            });
                            child.textContent = cell.get();
                            (bindings || (bindings = [])).push(cell);
                        }
                    }
                    break;
                }
            }
        };
        for (var child = content.firstChild; child; child = child.nextSibling) {
            _loop_1(child);
        }
    }
    bind(content);
    return {
        bindings: bindings || null,
        childComponents: childComponents || null
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bindContent;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = '[$_a-zA-Z][$\\w]*';


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reEscapableChars = /[&<>"]/g;
var charToEscapedMap = Object.create(null);
charToEscapedMap['&'] = '&amp;';
charToEscapedMap['<'] = '&lt;';
charToEscapedMap['>'] = '&gt;';
charToEscapedMap['"'] = '&quot;';
function escapeHTML(str) {
    return reEscapableChars.test(str) ? str.replace(reEscapableChars, function (chr) { return charToEscapedMap[chr]; }) : str;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = escapeHTML;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reEscapableChars = /[\\'\r\n]/g;
var charToEscapedMap = Object.create(null);
charToEscapedMap['\\'] = '\\\\';
charToEscapedMap['\''] = '\\\'';
charToEscapedMap['\r'] = '\\r';
charToEscapedMap['\n'] = '\\n';
function escapeString(str) {
    return reEscapableChars.test(str) ? str.replace(reEscapableChars, function (chr) { return charToEscapedMap[chr]; }) : str;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = escapeString;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reHump = /-?([A-Z])([^A-Z])/g;
var reLongHump = /-?([A-Z]+)/g;
var reMinus = /^-/;
var cache = Object.create(null);
function hyphenize(str) {
    return cache[str] || (cache[str] = str.replace(reHump, function (match, alphaChar, notAlphaChar) {
        return '-' + alphaChar.toLowerCase() + notAlphaChar;
    }).replace(reLongHump, function (match, chars) {
        return '-' + chars.toLowerCase();
    }).replace(reMinus, ''));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hyphenize;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var getText_1 = __webpack_require__(23);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    or: function or(value, arg) {
        return value || arg;
    },
    default: function default_(value, arg) {
        return value === undefined ? arg : value;
    },
    not: function not(value) {
        return !value;
    },
    eq: function eq(value, arg) {
        return value == arg;
    },
    identical: function identical(value, arg) {
        return value === arg;
    },
    lt: function lt(value, arg) {
        return value < arg;
    },
    lte: function lte(value, arg) {
        return value <= arg;
    },
    gt: function gt(value, arg) {
        return value > arg;
    },
    gte: function gte(value, arg) {
        return value >= arg;
    },
    join: function join(arr, separator) {
        if (separator === void 0) { separator = ', '; }
        return arr.join(separator);
    },
    t: getText_1.default.t,
    pt: getText_1.default.pt,
    nt: function nt(count, key) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        args.unshift(count);
        return getText_1.default('', key, true, args);
    },
    npt: function npt(count, key, context) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        args.unshift(count);
        return getText_1.default(context, key, true, args);
    },
    // Safary: "Cannot declare a parameter named 'key' as it shadows the name of a strict mode function."
    key: function key_(obj, key) {
        return obj && obj[key];
    },
    json: function json(value) {
        return JSON.stringify(value);
    }
};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var namePattern_1 = __webpack_require__(7);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = "(?:" + namePattern_1.default + "|\\d+)(?:\\.(?:" + namePattern_1.default + "|\\d+))*";


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var cellx_1 = __webpack_require__(0);
var Component_1 = __webpack_require__(1);
var d_1 = __webpack_require__(2);
var compileKeypath_1 = __webpack_require__(22);
var bindContent_1 = __webpack_require__(6);
var attachChildComponentElements_1 = __webpack_require__(5);
var keypathPattern_1 = __webpack_require__(12);
var Features_1 = __webpack_require__(3);
var nextTick = cellx_1.Utils.nextTick;
var slice = Array.prototype.slice;
var reKeypath = RegExp("^" + keypathPattern_1.default + "$");
var RtIfThen = (function (_super) {
    __extends(RtIfThen, _super);
    function RtIfThen() {
        var _this = _super.apply(this, arguments) || this;
        _this._elseMode = false;
        return _this;
    }
    RtIfThen.prototype._attachElement = function () {
        if (!this.initialized) {
            var props = this.props;
            props._content = document.importNode(this.element.content, true);
            var if_ = (props['if'] || '').trim();
            if (!reKeypath.test(if_)) {
                throw new SyntaxError("Invalid value of attribute \"if\" (" + if_ + ")");
            }
            var getIfValue_1 = compileKeypath_1.default(if_);
            this._if = new cellx_1.Cell(function () {
                return !!getIfValue_1.call(this);
            }, { owner: props.context });
            this.initialized = true;
        }
        this._if.on('change', this._onIfChange, this);
        this._render(false);
    };
    RtIfThen.prototype._detachElement = function () {
        this._destroyBindings();
        this._if.off('change', this._onIfChange, this);
        var nodes = this._nodes;
        if (nodes) {
            for (var i = nodes.length; i;) {
                var node = nodes[--i];
                var parentNode = node.parentNode;
                if (parentNode) {
                    parentNode.removeChild(node);
                }
            }
        }
    };
    RtIfThen.prototype._onIfChange = function () {
        if (this.element.parentNode) {
            this._render(true);
        }
    };
    RtIfThen.prototype._render = function (changed) {
        var _this = this;
        if (this._elseMode ? !this._if.get() : this._if.get()) {
            var content = this.props._content.cloneNode(true);
            var _a = bindContent_1.default(content, this.ownerComponent, this.props.context), bindings = _a.bindings, childComponents = _a.childComponents;
            this._nodes = slice.call(content.childNodes);
            this._bindings = bindings;
            this.element.parentNode.insertBefore(content, this.element.nextSibling);
            if (!Features_1.nativeCustomElements && childComponents) {
                attachChildComponentElements_1.default(childComponents);
            }
        }
        else {
            this._destroyBindings();
            var nodes = this._nodes;
            if (nodes) {
                for (var i = nodes.length; i;) {
                    var node = nodes[--i];
                    node.parentNode.removeChild(node);
                }
                this._nodes = null;
            }
        }
        if (changed) {
            nextTick(function () {
                _this.emit('change');
            });
        }
    };
    return RtIfThen;
}(Component_1.default));
RtIfThen = __decorate([
    d_1.default.Component({
        elementIs: 'rt-if-then',
        elementExtends: 'template',
        props: {
            if: { type: String, required: true, readonly: true }
        }
    })
], RtIfThen);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RtIfThen;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var keypathToJSExpression_1 = __webpack_require__(24);
var namePattern_1 = __webpack_require__(7);
var keypathPattern_1 = __webpack_require__(12);
var ContentNodeType;
(function (ContentNodeType) {
    ContentNodeType[ContentNodeType["TEXT"] = 1] = "TEXT";
    ContentNodeType[ContentNodeType["BINDING"] = 2] = "BINDING";
    ContentNodeType[ContentNodeType["BINDING_KEYPATH"] = 3] = "BINDING_KEYPATH";
    ContentNodeType[ContentNodeType["BINDING_FORMATTER"] = 4] = "BINDING_FORMATTER";
    ContentNodeType[ContentNodeType["BINDING_FORMATTER_ARGUMENTS"] = 5] = "BINDING_FORMATTER_ARGUMENTS";
})(ContentNodeType = exports.ContentNodeType || (exports.ContentNodeType = {}));
;
var reNameOrNothing = RegExp(namePattern_1.default + '|', 'g');
var reKeypathOrNothing = RegExp(keypathPattern_1.default + '|', 'g');
var reBooleanOrNothing = /false|true|/g;
var reNumberOrNothing = /(?:[+-]\s*)?(?:0b[01]+|0[0-7]+|0x[0-9a-fA-F]+|(?:(?:0|[1-9]\d*)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?|Infinity|NaN)|/g;
var reVacuumOrNothing = /null|undefined|void 0|/g;
var NOT_VALUE_AND_NOT_KEYPATH = {};
var ContentParser = (function () {
    function ContentParser(content) {
        this.content = content;
    }
    ContentParser.prototype.parse = function () {
        var content = this.content;
        if (!content) {
            return [];
        }
        this.at = 0;
        var result = this.result = [];
        for (var index = void 0; (index = content.indexOf('{', this.at)) > -1;) {
            this._pushText(content.slice(this.at, index));
            this.at = index;
            this.chr = content.charAt(index);
            var binding = this._readBinding();
            if (binding) {
                result.push(binding);
            }
            else {
                this._pushText(this.chr);
                this._next('{');
            }
        }
        this._pushText(content.slice(this.at));
        return result;
    };
    ContentParser.prototype._pushText = function (value) {
        if (value) {
            var result = this.result;
            var resultLen = result.length;
            if (resultLen && result[resultLen - 1].nodeType == ContentNodeType.TEXT) {
                result[resultLen - 1].value = result[resultLen - 1].raw += value;
            }
            else {
                result.push({
                    nodeType: ContentNodeType.TEXT,
                    value: value,
                    at: this.at,
                    raw: value
                });
            }
        }
    };
    ContentParser.prototype._readBinding = function () {
        var at = this.at;
        this._next('{');
        this._skipWhitespaces();
        var keypath = this._readBindingKeypath();
        if (keypath) {
            var formatters = [];
            for (var formatter = void 0; this._skipWhitespaces() == '|' && (formatter = this._readFormatter());) {
                formatters.push(formatter);
            }
            if (this.chr == '}') {
                this._next();
                return {
                    nodeType: ContentNodeType.BINDING,
                    keypath: keypath,
                    formatters: formatters,
                    at: at,
                    raw: this.content.slice(at, this.at)
                };
            }
        }
        this.at = at;
        this.chr = this.content.charAt(at);
        return null;
    };
    ContentParser.prototype._readBindingKeypath = function () {
        var content = this.content;
        reKeypathOrNothing.lastIndex = this.at;
        var keypath = reKeypathOrNothing.exec(content)[0];
        if (keypath) {
            var at = this.at;
            this.chr = content.charAt((this.at += keypath.length));
            return {
                nodeType: ContentNodeType.BINDING_KEYPATH,
                value: keypath,
                at: at,
                raw: content.slice(at, this.at)
            };
        }
        return null;
    };
    ContentParser.prototype._readFormatter = function () {
        var at = this.at;
        this._next('|');
        this._skipWhitespaces();
        var name = this._readName();
        if (name) {
            var args = this.chr == '(' ? this._readFormatterArguments() : null;
            return {
                nodeType: ContentNodeType.BINDING_FORMATTER,
                name: name,
                arguments: args,
                at: at,
                raw: this.content.slice(at, this.at)
            };
        }
        this.at = at;
        this.chr = this.content.charAt(at);
        return null;
    };
    ContentParser.prototype._readFormatterArguments = function () {
        var at = this.at;
        this._next('(');
        var args = [];
        if (this._skipWhitespaces() != ')') {
            for (;;) {
                var arg = this._readValueOrValueKeypath();
                if (arg !== NOT_VALUE_AND_NOT_KEYPATH) {
                    if (this._skipWhitespaces() == ',' || this.chr == ')') {
                        args.push(arg);
                        if (this.chr == ',') {
                            this._next();
                            this._skipWhitespaces();
                            continue;
                        }
                        break;
                    }
                }
                this.at = at;
                this.chr = this.content.charAt(at);
                return null;
            }
        }
        this._next();
        return {
            nodeType: ContentNodeType.BINDING_FORMATTER_ARGUMENTS,
            value: args,
            at: at,
            raw: this.content.slice(at, this.at)
        };
    };
    ContentParser.prototype._readValueOrValueKeypath = function () {
        var value = this._readValue();
        return value === NOT_VALUE_AND_NOT_KEYPATH ? this._readValueKeypath() : value;
    };
    ContentParser.prototype._readValue = function () {
        switch (this.chr) {
            case '{': {
                return this._readObject();
            }
            case '[': {
                return this._readArray();
            }
            case "'":
            case '"': {
                return this._readString();
            }
        }
        var readers = ['_readBoolean', '_readNumber', '_readVacuum'];
        for (var _i = 0, readers_1 = readers; _i < readers_1.length; _i++) {
            var reader = readers_1[_i];
            var value = this[reader]();
            if (value !== NOT_VALUE_AND_NOT_KEYPATH) {
                return value;
            }
        }
        return NOT_VALUE_AND_NOT_KEYPATH;
    };
    ContentParser.prototype._readObject = function () {
        var at = this.at;
        this._next('{');
        var obj = '{';
        while (this._skipWhitespaces() != '}') {
            var key = this.chr == "'" || this.chr == '"' ? this._readString() : this._readObjectKey();
            if (key !== NOT_VALUE_AND_NOT_KEYPATH && key !== null && this._skipWhitespaces() == ':') {
                this._next();
                this._skipWhitespaces();
                var v = this._readValueOrValueKeypath();
                if (v !== NOT_VALUE_AND_NOT_KEYPATH) {
                    if (this._skipWhitespaces() == ',') {
                        obj += key + ':' + v + ',';
                        this._next();
                        continue;
                    }
                    else if (this.chr == '}') {
                        obj += key + ':' + v + '}';
                        break;
                    }
                }
            }
            this.at = at;
            this.chr = this.content.charAt(at);
            return NOT_VALUE_AND_NOT_KEYPATH;
        }
        this._next();
        return obj;
    };
    ContentParser.prototype._readObjectKey = function () {
        return this._readName();
    };
    ContentParser.prototype._readArray = function () {
        var at = this.at;
        this._next('[');
        var arr = '[';
        while (this._skipWhitespaces() != ']') {
            if (this.chr == ',') {
                arr += ',';
                this._next();
            }
            else {
                var v = this._readValueOrValueKeypath();
                if (v === NOT_VALUE_AND_NOT_KEYPATH) {
                    this.at = at;
                    this.chr = this.content.charAt(at);
                    return NOT_VALUE_AND_NOT_KEYPATH;
                }
                else {
                    arr += v;
                }
            }
        }
        this._next();
        return arr + ']';
    };
    ContentParser.prototype._readBoolean = function () {
        reBooleanOrNothing.lastIndex = this.at;
        var bool = reBooleanOrNothing.exec(this.content)[0];
        if (bool) {
            this.chr = this.content.charAt((this.at += bool.length));
            return bool;
        }
        return NOT_VALUE_AND_NOT_KEYPATH;
    };
    ContentParser.prototype._readNumber = function () {
        reNumberOrNothing.lastIndex = this.at;
        var num = reNumberOrNothing.exec(this.content)[0];
        if (num) {
            this.chr = this.content.charAt((this.at += num.length));
            return num;
        }
        return NOT_VALUE_AND_NOT_KEYPATH;
    };
    ContentParser.prototype._readString = function () {
        var quoteChar = this.chr;
        if (quoteChar != "'" && quoteChar != '"') {
            throw {
                name: 'SyntaxError',
                message: "Expected \"'\" instead of \"" + this.chr + "\"",
                at: this.at,
                content: this.content
            };
        }
        var at = this.at;
        var str = '';
        for (var next = void 0; (next = this._next());) {
            if (next == quoteChar) {
                this._next();
                return quoteChar + str + quoteChar;
            }
            if (next == '\\') {
                str += next + this._next();
            }
            else {
                if (next == '\r' || next == '\n') {
                    break;
                }
                str += next;
            }
        }
        this.at = at;
        this.chr = this.content.charAt(at);
        return NOT_VALUE_AND_NOT_KEYPATH;
    };
    ContentParser.prototype._readVacuum = function () {
        reVacuumOrNothing.lastIndex = this.at;
        var vacuum = reVacuumOrNothing.exec(this.content)[0];
        if (vacuum) {
            this.chr = this.content.charAt((this.at += vacuum.length));
            return vacuum;
        }
        return NOT_VALUE_AND_NOT_KEYPATH;
    };
    ContentParser.prototype._readValueKeypath = function () {
        reKeypathOrNothing.lastIndex = this.at;
        var keypath = reKeypathOrNothing.exec(this.content)[0];
        if (keypath) {
            this.chr = this.content.charAt((this.at += keypath.length));
            return keypathToJSExpression_1.default(keypath);
        }
        return NOT_VALUE_AND_NOT_KEYPATH;
    };
    ContentParser.prototype._readName = function () {
        reNameOrNothing.lastIndex = this.at;
        var name = reNameOrNothing.exec(this.content)[0];
        if (name) {
            this.chr = this.content.charAt((this.at += name.length));
            return name;
        }
        return null;
    };
    ContentParser.prototype._skipWhitespaces = function () {
        var chr = this.chr;
        while (chr && chr <= ' ') {
            chr = this._next();
        }
        return chr;
    };
    ContentParser.prototype._next = function (current) {
        if (current && current != this.chr) {
            throw {
                name: 'SyntaxError',
                message: "Expected \"" + current + "\" instead of \"" + this.chr + "\"",
                at: this.at,
                content: this.content
            };
        }
        return (this.chr = this.content.charAt(++this.at));
    };
    return ContentParser;
}());
ContentParser.ContentNodeType = ContentNodeType;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContentParser;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var nextUID = cellx_1.Utils.nextUID;
var DisposableMixin = (function () {
    function DisposableMixin() {
        this._disposables = {};
    }
    DisposableMixin.prototype.listenTo = function (target, typeOrListeners, listenerOrContext, context) {
        var _this = this;
        var listenings;
        if (typeof typeOrListeners == 'object') {
            listenings = [];
            if (Array.isArray(typeOrListeners)) {
                if (arguments.length < 4) {
                    context = this;
                }
                for (var _i = 0, typeOrListeners_1 = typeOrListeners; _i < typeOrListeners_1.length; _i++) {
                    var type = typeOrListeners_1[_i];
                    listenings.push(this.listenTo(target, type, listenerOrContext, context));
                }
            }
            else {
                if (arguments.length < 3) {
                    listenerOrContext = this;
                }
                for (var type in typeOrListeners) {
                    listenings.push(this.listenTo(target, type, typeOrListeners[type], listenerOrContext));
                }
            }
        }
        else {
            if (arguments.length < 4) {
                context = this;
            }
            if (Array.isArray(target) || target instanceof NodeList || target instanceof HTMLCollection) {
                listenings = [];
                for (var i = 0, l = target.length; i < l; i++) {
                    listenings.push(this.listenTo(target[i], typeOrListeners, listenerOrContext, context));
                }
            }
            else if (Array.isArray(listenerOrContext)) {
                listenings = [];
                for (var _a = 0, listenerOrContext_1 = listenerOrContext; _a < listenerOrContext_1.length; _a++) {
                    var listener = listenerOrContext_1[_a];
                    listenings.push(this.listenTo(target, typeOrListeners, listener, context));
                }
            }
            else {
                return this._listenTo(target, typeOrListeners, listenerOrContext, context);
            }
        }
        var id = nextUID();
        var stopListening = function () {
            for (var i = listenings.length; i;) {
                listenings[--i].stop();
            }
            delete _this._disposables[id];
        };
        var listening = this._disposables[id] = {
            stop: stopListening,
            dispose: stopListening
        };
        return listening;
    };
    DisposableMixin.prototype._listenTo = function (target, type, listener, context) {
        var _this = this;
        if (target instanceof cellx_1.EventEmitter) {
            target.on(type, listener, context);
        }
        else if (target.addEventListener) {
            if (target !== context) {
                listener = listener.bind(context);
            }
            target.addEventListener(type, listener);
        }
        else {
            throw new TypeError('Unable to add a listener');
        }
        var id = nextUID();
        var stopListening = function () {
            if (_this._disposables[id]) {
                if (target instanceof cellx_1.EventEmitter) {
                    target.off(type, listener, context);
                }
                else {
                    target.removeEventListener(type, listener);
                }
                delete _this._disposables[id];
            }
        };
        var listening = this._disposables[id] = {
            stop: stopListening,
            dispose: stopListening
        };
        return listening;
    };
    DisposableMixin.prototype.setTimeout = function (cb, delay) {
        var _this = this;
        var id = nextUID();
        var timeoutId = setTimeout(function () {
            delete _this._disposables[id];
            cb.call(_this);
        }, delay);
        var clearTimeout_ = function () {
            if (_this._disposables[id]) {
                clearTimeout(timeoutId);
                delete _this._disposables[id];
            }
        };
        var timeout = this._disposables[id] = {
            clear: clearTimeout_,
            dispose: clearTimeout_
        };
        return timeout;
    };
    DisposableMixin.prototype.setInterval = function (cb, delay) {
        var _this = this;
        var id = nextUID();
        var intervalId = setInterval(function () {
            cb.call(_this);
        }, delay);
        var clearInterval_ = function () {
            if (_this._disposables[id]) {
                clearInterval(intervalId);
                delete _this._disposables[id];
            }
        };
        var interval = this._disposables[id] = {
            clear: clearInterval_,
            dispose: clearInterval_
        };
        return interval;
    };
    DisposableMixin.prototype.registerCallback = function (cb) {
        var _this = this;
        var id = nextUID();
        var disposable = this;
        var cancelCallback = function () {
            delete _this._disposables[id];
        };
        var callback = function callback() {
            if (disposable._disposables[id]) {
                delete disposable._disposables[id];
                return cb.apply(disposable, arguments);
            }
        };
        callback.cancel = cancelCallback;
        callback.dispose = cancelCallback;
        this._disposables[id] = callback;
        return callback;
    };
    DisposableMixin.prototype.dispose = function () {
        var disposables = this._disposables;
        for (var id in disposables) {
            disposables[id].dispose();
        }
        return this;
    };
    return DisposableMixin;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DisposableMixin;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var cellx_1 = __webpack_require__(0);
var attributeTypeHandlerMap_1 = __webpack_require__(35);
var camelize_1 = __webpack_require__(4);
var hyphenize_1 = __webpack_require__(10);
var Map = cellx_1.JS.Map;
var typeMap = new Map([
    [Boolean, 'boolean'],
    ['boolean', 'boolean'],
    [Number, 'number'],
    ['number', 'number'],
    [String, 'string'],
    ['string', 'string']
]);
var ElementAttributes = (function (_super) {
    __extends(ElementAttributes, _super);
    function ElementAttributes(el) {
        var _this = _super.call(this) || this;
        var component = el.$c;
        var elAttrsConfig = component.constructor.elementAttributes;
        if (elAttrsConfig) {
            var _loop_1 = function (name_1) {
                var elAttrConfig = elAttrsConfig[name_1];
                var type = typeof elAttrConfig;
                var defaultValue;
                var required = void 0;
                var readonly = void 0;
                if (type == 'function') {
                    type = elAttrConfig;
                    required = readonly = false;
                }
                else if (type == 'object' && (elAttrConfig.type !== undefined || elAttrConfig.default !== undefined)) {
                    type = elAttrConfig.type;
                    defaultValue = elAttrConfig.default;
                    if (type === undefined) {
                        type = typeof defaultValue;
                    }
                    else if (defaultValue !== undefined && typeMap.get(type) !== typeof defaultValue) {
                        throw new TypeError('Specified type does not match type of defaultValue');
                    }
                    required = elAttrConfig.required;
                    readonly = elAttrConfig.readonly;
                }
                else {
                    defaultValue = elAttrConfig;
                    required = readonly = false;
                }
                var handlers = attributeTypeHandlerMap_1.default.get(type);
                if (!handlers) {
                    throw new TypeError('Unsupported attribute type');
                }
                var camelizedName = camelize_1.default(name_1);
                var hyphenizedName = hyphenize_1.default(name_1);
                if (required && !el.hasAttribute(hyphenizedName)) {
                    throw new TypeError("Property \"" + name_1 + "\" is required");
                }
                var descriptor = void 0;
                if (readonly) {
                    var value_1 = handlers[0](el.getAttribute(hyphenizedName), defaultValue);
                    descriptor = {
                        configurable: true,
                        enumerable: true,
                        get: function () {
                            return value_1;
                        },
                        set: function (v) {
                            if (v !== value_1) {
                                throw new TypeError("Property \"" + name_1 + "\" is readonly");
                            }
                        }
                    };
                }
                else {
                    var oldValue_1;
                    var value_2;
                    var isReady_1;
                    var rawValue_1 = this_1['_' + camelizedName] = this_1['_' + hyphenizedName] = new cellx_1.Cell(el.getAttribute(hyphenizedName), {
                        merge: function (v, ov) {
                            if (v !== ov) {
                                oldValue_1 = value_2;
                                value_2 = handlers[0](v, defaultValue);
                            }
                            isReady_1 = component.isReady;
                            return v;
                        },
                        onChange: function (evt) {
                            evt['oldValue'] = oldValue_1;
                            evt['value'] = value_2;
                            if (isReady_1) {
                                component.elementAttributeChanged(hyphenizedName, oldValue_1, value_2);
                            }
                        }
                    });
                    descriptor = {
                        configurable: true,
                        enumerable: true,
                        get: function () {
                            rawValue_1.get();
                            return value_2;
                        },
                        set: function (v) {
                            v = handlers[1](v, defaultValue);
                            if (v === null) {
                                el.removeAttribute(hyphenizedName);
                            }
                            else {
                                el.setAttribute(hyphenizedName, v);
                            }
                            rawValue_1.set(v);
                        }
                    };
                }
                Object.defineProperty(this_1, camelizedName, descriptor);
                if (hyphenizedName != camelizedName) {
                    Object.defineProperty(this_1, hyphenizedName, descriptor);
                }
            };
            var this_1 = this;
            for (var name_1 in elAttrsConfig) {
                _loop_1(name_1);
            }
        }
        return _this;
    }
    return ElementAttributes;
}(cellx_1.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ElementAttributes;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var queue;
function run() {
    var track = queue;
    queue = null;
    for (var _i = 0, track_1 = track; _i < track_1.length; _i++) {
        var item = track_1[_i];
        try {
            item.callback.call(item.context);
        }
        catch (err) {
            cellx_1.ErrorLogger.log(err);
        }
    }
}
function defer(cb, context) {
    if (queue) {
        queue.push({ callback: cb, context: context });
    }
    else {
        queue = [{ callback: cb, context: context }];
        setTimeout(run, 1);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = defer;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var range = document.createRange();
var htmlToFragment;
if (range.createContextualFragment) {
    var selected_1 = false;
    htmlToFragment = function (html) {
        if (!selected_1) {
            range.selectNode(document.body);
            selected_1 = true;
        }
        return range.createContextualFragment(html);
    };
}
else {
    htmlToFragment = function (html) {
        var el = document.createElement('div');
        var df = document.createDocumentFragment();
        el.innerHTML = html;
        for (var child = void 0; (child = el.firstChild);) {
            df.appendChild(child);
        }
        return df;
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = htmlToFragment;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var toString = Object.prototype.toString;
function isRegExp(value) {
    return toString.call(value) == '[object RegExp]';
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isRegExp;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reEscapableEntities = /&(?:amp|lt|gt|quot);/g;
var escapedToCharMap = Object.create(null);
escapedToCharMap['&amp;'] = '&';
escapedToCharMap['&lt;'] = '<';
escapedToCharMap['&gt;'] = '>';
escapedToCharMap['&quot;'] = '"';
function unescapeHTML(str) {
    return reEscapableEntities.test(str) ? str.replace(reEscapableEntities, function (entity) { return escapedToCharMap[entity]; }) : str;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = unescapeHTML;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cache = Object.create(null);
function formattersReducer(jsExpr, formatter) {
    var args = formatter.arguments;
    return "(this." + formatter.name + " || formatters." + formatter.name + ").call(this, " + jsExpr + (args && args.value.length ? ', ' + args.value.join(', ') : '') + ")";
}
function bindingToJSExpression(binding) {
    var bindingRaw = binding.raw;
    if (cache[bindingRaw]) {
        return cache[bindingRaw];
    }
    var keys = binding.keypath.value.split('.');
    var keyCount = keys.length;
    var formatters = binding.formatters;
    var usesFormatters = !!formatters.length;
    if (keyCount == 1) {
        return (cache[bindingRaw] = {
            value: usesFormatters ?
                formatters.reduce(formattersReducer, "this['" + keys[0] + "']") :
                "this['" + keys[0] + "']",
            usesFormatters: usesFormatters
        });
    }
    var index = keyCount - 2;
    var jsExpr = Array(index);
    while (index) {
        jsExpr[--index] = " && (temp = temp['" + keys[index + 1] + "'])";
    }
    return (cache[bindingRaw] = {
        value: "(temp = this['" + keys[0] + "'])" + jsExpr.join('') + " && " + (usesFormatters ?
            formatters.reduce(formattersReducer, "temp['" + keys[keyCount - 1] + "']") :
            "temp['" + keys[keyCount - 1] + "']"),
        usesFormatters: usesFormatters
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bindingToJSExpression;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var keypathToJSExpression_1 = __webpack_require__(24);
var cache = Object.create(null);
function compileKeypath(keypath) {
    return cache[keypath] || (cache[keypath] = Function("var temp; return " + keypathToJSExpression_1.default(keypath) + ";"));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compileKeypath;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var hasOwn = Object.prototype.hasOwnProperty;
var reInsert = /\{([1-9]\d*|n)(?::((?:[^|]*\|)+?[^}]*))?\}/;
var texts;
var getPluralIndex;
var getText = function getText(context, key, plural, args) {
    var rawText;
    if (hasOwn.call(texts, context) && hasOwn.call(texts[context], key)) {
        rawText = (plural ? texts[context][key][getPluralIndex(+args[0])] : texts[context][key]);
    }
    else {
        rawText = key;
    }
    var data = Object.create(null);
    for (var i = args.length; i;) {
        data[i] = args[--i];
    }
    if (plural) {
        data.n = args[0];
    }
    var splittedRawText = rawText.split(reInsert);
    var text = [];
    for (var i = 0, l = splittedRawText.length; i < l;) {
        if (i % 3) {
            text.push(splittedRawText[i + 1] ?
                splittedRawText[i + 1].split('|')[getPluralIndex(data[splittedRawText[i]])] :
                data[splittedRawText[i]]);
            i += 2;
        }
        else {
            text.push(splittedRawText[i]);
            i++;
        }
    }
    return text.join('');
};
function configure(config) {
    texts = config.texts;
    getPluralIndex = Function('n', "return " + config.localeSettings.plural + ";");
    getText.localeSettings = config.localeSettings;
}
function t(key) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return getText('', key, false, args);
}
function pt(key, context) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return getText(context, key, false, args);
}
function nt(key) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return getText('', key, true, args);
}
function npt(key, context) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return getText(context, key, true, args);
}
getText.configure = configure;
getText.t = t;
getText.pt = pt;
getText.nt = nt;
getText.npt = npt;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getText;
configure({
    localeSettings: {
        code: 'ru',
        plural: '(n%100) >= 5 && (n%100) <= 20 ? 2 : (n%10) == 1 ? 0 : (n%10) >= 2 && (n%10) <= 4 ? 1 : 2'
    },
    texts: {}
});


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cache = Object.create(null);
function keypathToJSExpression(keypath) {
    if (cache[keypath]) {
        return cache[keypath];
    }
    var keys = keypath.split('.');
    var keyCount = keys.length;
    if (keyCount == 1) {
        return (cache[keypath] = "this['" + keypath + "']");
    }
    var index = keyCount - 2;
    var jsExpr = Array(index);
    while (index) {
        jsExpr[--index] = " && (temp = temp['" + keys[index + 1] + "'])";
    }
    return (cache[keypath] = "(temp = this['" + keys[0] + "'])" + jsExpr.join('') + " && temp['" + keys[keyCount - 1] + "']");
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = keypathToJSExpression;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var NodeType;
(function (NodeType) {
    NodeType[NodeType["BLOCK"] = 1] = "BLOCK";
    NodeType[NodeType["ELEMENT"] = 2] = "ELEMENT";
    NodeType[NodeType["TEXT"] = 3] = "TEXT";
    NodeType[NodeType["COMMENT"] = 4] = "COMMENT";
    NodeType[NodeType["SUPER_CALL"] = 5] = "SUPER_CALL";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
var namePattern = '[a-zA-Z][\\-_0-9a-zA-Z]*';
var reNameOrNothing = RegExp(namePattern + '|', 'g');
var superCallStatement = 'super!';
var Parser = (function () {
    function Parser(beml) {
        this.beml = beml;
    }
    Parser.prototype.parse = function () {
        this.at = 0;
        this.chr = this.beml.charAt(0);
        var content;
        while (this._skipWhitespaces() == '/') {
            (content || (content = [])).push(this._readComment());
        }
        var decl = this._readBlockDeclaration();
        return {
            nodeType: NodeType.BLOCK,
            declaration: decl,
            name: decl.blockName,
            content: content ? content.concat(this._readContent(false)) : this._readContent(false),
            at: 0,
            raw: this.beml,
        };
    };
    Parser.prototype._readBlockDeclaration = function () {
        var at = this.at;
        this._next('#');
        var blockName = this._readName();
        if (!blockName) {
            throw {
                name: 'SyntaxError',
                message: 'Invalid block declaration',
                at: at,
                beml: this.beml
            };
        }
        return {
            blockName: blockName,
            at: at,
            raw: '#' + blockName
        };
    };
    Parser.prototype._readContent = function (brackets) {
        if (brackets) {
            this._next('{');
        }
        var content = [];
        for (;;) {
            switch (this._skipWhitespaces()) {
                case "'":
                case '"':
                case '`': {
                    content.push(this._readTextNode());
                    break;
                }
                case '/': {
                    content.push(this._readComment());
                    break;
                }
                case '': {
                    if (brackets) {
                        throw {
                            name: 'SyntaxError',
                            message: 'Missing "}" in compound statement',
                            at: this.at,
                            beml: this.beml
                        };
                    }
                    return content;
                }
                default: {
                    if (brackets) {
                        if (this.chr == '}') {
                            this._next();
                            return content;
                        }
                        var at = this.at;
                        if (this.beml.slice(at, at + superCallStatement.length) == superCallStatement) {
                            this.chr = this.beml.charAt((this.at = at + superCallStatement.length));
                            content.push({
                                nodeType: NodeType.SUPER_CALL,
                                at: at,
                                raw: 'super!'
                            });
                            break;
                        }
                    }
                    content.push(this._readElement());
                    break;
                }
            }
        }
    };
    Parser.prototype._readElement = function () {
        var at = this.at;
        var tagName = this._readName();
        if (!tagName) {
            throw {
                name: 'SyntaxError',
                message: 'Expected tag name',
                at: at,
                beml: this.beml
            };
        }
        var elName = this._skipWhitespaces() == '/' ? (this._next(), this._readName()) : null;
        if (elName) {
            this._skipWhitespaces();
        }
        var attrs = this.chr == '(' ? this._readAttributes() : null;
        if (attrs) {
            this._skipWhitespaces();
        }
        var content = this.chr == '{' ? this._readContent(true) : null;
        return {
            nodeType: NodeType.ELEMENT,
            tagName: tagName,
            name: elName,
            attributes: attrs,
            content: content,
            at: at,
            raw: this.beml.slice(at, this.at).trim(),
        };
    };
    Parser.prototype._readAttributes = function () {
        var at = this.at;
        this._next('(');
        if (this._skipWhitespaces() == ')') {
            this._next();
            return {
                list: [],
                at: at,
                raw: this.beml.slice(at, this.at)
            };
        }
        var list = [];
        for (;;) {
            var name_1 = this._readName();
            if (!name_1) {
                throw {
                    name: 'SyntaxError',
                    message: 'Invalid attribute name',
                    at: this.at,
                    beml: this.beml
                };
            }
            if (this._skipWhitespaces() == '=') {
                this._next();
                var next = this._skipWhitespaces();
                if (next == "'" || next == '"' || next == '`') {
                    list.push({ name: name_1, value: this._readString().value });
                }
                else {
                    var value = '';
                    for (;;) {
                        if (!next) {
                            throw {
                                name: 'SyntaxError',
                                message: 'Invalid attribute',
                                at: this.at,
                                beml: this.beml
                            };
                        }
                        if (next == '\r' || next == '\n' || next == ',' || next == ')') {
                            list.push({ name: name_1, value: value.trim() });
                            break;
                        }
                        value += next;
                        next = this._next();
                    }
                }
                this._skipWhitespaces();
            }
            else {
                list.push({ name: name_1, value: '' });
            }
            if (this.chr == ')') {
                this._next();
                break;
            }
            else if (this.chr == ',') {
                this._next();
                this._skipWhitespaces();
            }
            else {
                throw {
                    name: 'SyntaxError',
                    message: 'Invalid attributes',
                    at: this.at,
                    beml: this.beml
                };
            }
        }
        return {
            list: list,
            at: at,
            raw: this.beml.slice(at, this.at)
        };
    };
    Parser.prototype._readTextNode = function () {
        var at = this.at;
        return {
            nodeType: NodeType.TEXT,
            value: this._readString().value,
            at: at,
            raw: this.beml.slice(at, this.at)
        };
    };
    Parser.prototype._readString = function () {
        var quoteChar = this.chr;
        if (quoteChar != "'" && quoteChar != '"' && quoteChar != '`') {
            throw {
                name: 'SyntaxError',
                message: "Expected \"'\" instead of \"" + this.chr + "\"",
                at: this.at,
                beml: this.beml
            };
        }
        var str = '';
        for (var next = void 0; (next = this._next());) {
            if (next == quoteChar) {
                this._next();
                return { value: str };
            }
            if (next == '\\') {
                str += next + this._next();
            }
            else {
                if (quoteChar != '`' && (next == '\r' || next == '\n')) {
                    break;
                }
                str += next;
            }
        }
        throw {
            name: 'SyntaxError',
            message: 'Invalid string',
            at: this.at,
            beml: this.beml
        };
    };
    Parser.prototype._readComment = function () {
        var at = this.at;
        var value = '';
        var multiline;
        switch (this._next('/')) {
            case '/': {
                for (var next = void 0; (next = this._next()) && next != '\r' && next != '\n';) {
                    value += next;
                }
                multiline = false;
                break;
            }
            case '*': {
                var stop = false;
                do {
                    switch (this._next()) {
                        case '*': {
                            if (this._next() == '/') {
                                this._next();
                                stop = true;
                            }
                            else {
                                value += '*' + this.chr;
                            }
                            break;
                        }
                        case '': {
                            throw {
                                name: 'SyntaxError',
                                message: 'Missing "*/" in compound statement',
                                at: this.at,
                                beml: this.beml
                            };
                        }
                        default: {
                            value += this.chr;
                        }
                    }
                } while (!stop);
                multiline = true;
                break;
            }
            default: {
                throw {
                    name: 'SyntaxError',
                    message: "Expected \"/\" instead of \"" + this.chr + "\"",
                    at: this.at,
                    beml: this.beml
                };
            }
        }
        return {
            nodeType: NodeType.COMMENT,
            value: value,
            multiline: multiline,
            at: at,
            raw: this.beml.slice(at, this.at)
        };
    };
    Parser.prototype._readName = function () {
        reNameOrNothing.lastIndex = this.at;
        var name = reNameOrNothing.exec(this.beml)[0];
        if (name) {
            this.chr = this.beml.charAt((this.at += name.length));
            return name;
        }
        return null;
    };
    Parser.prototype._skipWhitespaces = function () {
        var chr = this.chr;
        while (chr && chr <= ' ') {
            chr = this._next();
        }
        return chr;
    };
    Parser.prototype._next = function (current) {
        if (current && current != this.chr) {
            throw {
                name: 'SyntaxError',
                message: "Expected \"" + current + "\" instead of \"" + this.chr + "\"",
                at: this.at,
                beml: this.beml
            };
        }
        return (this.chr = this.beml.charAt(++this.at));
    };
    return Parser;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Parser;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reEscapableChars = /[\\'"\r\n]/g;
var charToEscapedMap = Object.create(null);
charToEscapedMap['\\'] = '\\\\';
charToEscapedMap['\''] = '\\\'';
charToEscapedMap['"'] = '\\"';
charToEscapedMap['\r'] = '\\r';
charToEscapedMap['\n'] = '\\n';
function escapeString(str) {
    return reEscapableChars.test(str) ? str.replace(reEscapableChars, function (chr) { return charToEscapedMap[chr]; }) : str;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = escapeString;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var DisposableMixin_1 = __webpack_require__(15);
exports.DisposableMixin = DisposableMixin_1.default;
var formatters_1 = __webpack_require__(11);
exports.formatters = formatters_1.default;
var getText_1 = __webpack_require__(23);
exports.getText = getText_1.default;
var Component_1 = __webpack_require__(1);
exports.Component = Component_1.default;
var d_1 = __webpack_require__(2);
exports.d = d_1.default;
var rt_content_1 = __webpack_require__(29);
var rt_if_then_1 = __webpack_require__(13);
var rt_if_else_1 = __webpack_require__(30);
var rt_repeat_1 = __webpack_require__(31);
var ElementAttributes_1 = __webpack_require__(16);
exports.ElementAttributes = ElementAttributes_1.default;
var ComponentTemplate_1 = __webpack_require__(28);
exports.ComponentTemplate = ComponentTemplate_1.default;
var camelize_1 = __webpack_require__(4);
var hyphenize_1 = __webpack_require__(10);
var escapeString_1 = __webpack_require__(9);
var escapeHTML_1 = __webpack_require__(8);
var unescapeHTML_1 = __webpack_require__(20);
var isRegExp_1 = __webpack_require__(19);
var defer_1 = __webpack_require__(17);
var htmlToFragment_1 = __webpack_require__(18);
var Components = {
    RtContent: rt_content_1.default,
    RtIfThen: rt_if_then_1.default,
    RtIfElse: rt_if_else_1.default,
    RtRepeat: rt_repeat_1.default
};
exports.Components = Components;
var Utils = {
    camelize: camelize_1.default,
    hyphenize: hyphenize_1.default,
    escapeString: escapeString_1.default,
    escapeHTML: escapeHTML_1.default,
    unescapeHTML: unescapeHTML_1.default,
    isRegExp: isRegExp_1.default,
    defer: defer_1.default,
    htmlToFragment: htmlToFragment_1.default
};
exports.Utils = Utils;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var namePattern_1 = __webpack_require__(7);
var escapeString_1 = __webpack_require__(9);
var escapeHTML_1 = __webpack_require__(8);
var keypathPattern = '(?:' + namePattern_1.default + '|\\[\\d+\\])(?:\\.' + namePattern_1.default + '|\\[\\d+\\])*';
var re = RegExp('\\{\\{(?:' +
    '\\s*(?:' +
    'block\\s+(' + namePattern_1.default + ')|(\\/)block|(s)uper\\(\\)|(' + keypathPattern + ')' +
    ')\\s*|\\{\\s*(' + keypathPattern + ')\\s*\\}' +
    ')\\}\\}');
var ComponentTemplate = (function () {
    function ComponentTemplate(tmpl, parent) {
        if (parent === void 0) { parent = null; }
        this.parent = parent;
        var currentBlock = { name: null, source: [] };
        var blocks = [currentBlock];
        var blockMap = {};
        var splittedTemplate = tmpl.split(re);
        for (var i = 0, l = splittedTemplate.length; i < l;) {
            if (i % 6) {
                var blockName = splittedTemplate[i];
                if (blockName) {
                    currentBlock.source.push("this." + blockName + "(data)");
                    currentBlock = { name: blockName, source: [] };
                    blocks.push((blockMap[blockName] = currentBlock));
                }
                else if (splittedTemplate[i + 1]) {
                    if (blocks.length > 1) {
                        blocks.pop();
                        currentBlock = blocks[blocks.length - 1];
                    }
                }
                else if (splittedTemplate[i + 2]) {
                    if (parent && blocks.length > 1 && parent._blockMap[currentBlock.name]) {
                        currentBlock.source.push('$super.call(this, data)');
                    }
                }
                else {
                    var keypath = splittedTemplate[i + 3];
                    currentBlock.source.push(keypath ? "escape(data." + keypath + ")" : 'data.' + splittedTemplate[i + 4]);
                }
                i += 5;
            }
            else {
                var text = splittedTemplate[i];
                if (text) {
                    currentBlock.source.push("'" + escapeString_1.default(text) + "'");
                }
                i++;
            }
        }
        this._renderer = parent ? parent._renderer : Function('data', 'escape', "return [" + blocks[0].source.join(', ') + "].join('');");
        Object.keys(blockMap).forEach(function (name) {
            var parentBlock = parent && parent._blockMap[name];
            var inner = Function('$super', 'data', 'escape', "return [" + blockMap[name].source.join(', ') + "].join('');");
            this[name] = function (data) {
                return inner.call(this, parentBlock, data, escapeHTML_1.default);
            };
        }, (this._blockMap = Object.create(parent && parent._blockMap)));
    }
    ComponentTemplate.prototype.extend = function (tmpl) {
        return new ComponentTemplate(tmpl, this);
    };
    ComponentTemplate.prototype.render = function (data) {
        return this._renderer.call(this._blockMap, data || {}, escapeHTML_1.default);
    };
    return ComponentTemplate;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ComponentTemplate;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var cellx_1 = __webpack_require__(0);
var Component_1 = __webpack_require__(1);
var d_1 = __webpack_require__(2);
var bindContent_1 = __webpack_require__(6);
var attachChildComponentElements_1 = __webpack_require__(5);
var Features_1 = __webpack_require__(3);
var KEY_TEMPLATES_FIXED = cellx_1.JS.Symbol('Rionite.RtContent#templatesFixed');
var RtContent = (function (_super) {
    __extends(RtContent, _super);
    function RtContent() {
        return _super.apply(this, arguments) || this;
    }
    RtContent.prototype._attachElement = function () {
        var ownerComponent = this.ownerComponent;
        var el = this.element;
        var props = this.props;
        if (this.isReady) {
            for (var child = void 0; (child = el.firstChild);) {
                el.removeChild(child);
            }
        }
        else {
            var inputContent = props._content = document.createDocumentFragment();
            for (var child = void 0; (child = el.firstChild);) {
                inputContent.appendChild(child);
            }
            var ownerComponentInputContent = ownerComponent.props._content;
            var selector = this.elementAttributes['select'];
            if (selector) {
                if (!Features_1.templateTag && !ownerComponentInputContent[KEY_TEMPLATES_FIXED]) {
                    var templates = ownerComponentInputContent.querySelectorAll('template');
                    for (var i = templates.length; i;) {
                        templates[--i].content;
                    }
                    ownerComponentInputContent[KEY_TEMPLATES_FIXED] = true;
                }
                var selectedEls = ownerComponentInputContent.querySelectorAll(selector);
                var selectedElCount = selectedEls.length;
                if (selectedElCount) {
                    var rawContent = this._rawContent = document.createDocumentFragment();
                    for (var i = 0; i < selectedElCount; i++) {
                        rawContent.appendChild(selectedEls[i].cloneNode(true));
                    }
                }
                else {
                    this._rawContent = inputContent;
                }
            }
            else {
                this._rawContent = ownerComponentInputContent.firstChild ? ownerComponentInputContent : inputContent;
            }
            this.isReady = true;
        }
        var content = this._rawContent.cloneNode(true);
        var getContext = props['getContext'];
        var _a = this._rawContent == props._content ?
            bindContent_1.default(content, ownerComponent, getContext ? ownerComponent[getContext](this, props.context) : props.context) :
            bindContent_1.default(content, ownerComponent.ownerComponent, getContext ?
                ownerComponent[getContext](this, ownerComponent.props.context) :
                ownerComponent.props.context), bindings = _a.bindings, childComponents = _a.childComponents;
        this._bindings = bindings;
        el.appendChild(content);
        if (!Features_1.nativeCustomElements && childComponents) {
            attachChildComponentElements_1.default(childComponents);
        }
    };
    RtContent.prototype._detachElement = function () {
        this._destroyBindings();
    };
    return RtContent;
}(Component_1.default));
RtContent = __decorate([
    d_1.default.Component({
        elementIs: 'rt-content',
        props: {
            select: { type: String, readonly: true },
            getContext: { type: String, readonly: true }
        },
        template: ''
    })
], RtContent);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RtContent;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var d_1 = __webpack_require__(2);
var rt_if_then_1 = __webpack_require__(13);
var RtIfElse = (function (_super) {
    __extends(RtIfElse, _super);
    function RtIfElse() {
        var _this = _super.apply(this, arguments) || this;
        _this._elseMode = true;
        return _this;
    }
    return RtIfElse;
}(rt_if_then_1.default));
RtIfElse = __decorate([
    d_1.default.Component({
        elementIs: 'rt-if-else',
        elementExtends: 'template'
    })
], RtIfElse);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RtIfElse;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var cellx_1 = __webpack_require__(0);
var Component_1 = __webpack_require__(1);
var d_1 = __webpack_require__(2);
var compileKeypath_1 = __webpack_require__(22);
var bindContent_1 = __webpack_require__(6);
var attachChildComponentElements_1 = __webpack_require__(5);
var namePattern_1 = __webpack_require__(7);
var keypathPattern_1 = __webpack_require__(12);
var Features_1 = __webpack_require__(3);
var Map = cellx_1.JS.Map;
var nextTick = cellx_1.Utils.nextTick;
var slice = Array.prototype.slice;
var reForAttributeValue = RegExp("^\\s*(" + namePattern_1.default + ")\\s+of\\s+(" + keypathPattern_1.default + ")\\s*$");
var RtRepeat = (function (_super) {
    __extends(RtRepeat, _super);
    function RtRepeat() {
        return _super.apply(this, arguments) || this;
    }
    RtRepeat.prototype._attachElement = function () {
        if (!this.initialized) {
            var props = this.props;
            var forAttrValue = props['for'].match(reForAttributeValue);
            if (!forAttrValue) {
                throw new SyntaxError("Invalid value of attribute \"for\" (" + props['for'] + ")");
            }
            this._itemName = forAttrValue[1];
            this._list = new cellx_1.Cell(compileKeypath_1.default(forAttrValue[2]), { owner: props.context });
            this._itemMap = new Map();
            this._trackBy = props['trackBy'];
            var rawItemContent = this._rawItemContent =
                document.importNode(this.element.content, true);
            if (props['strip']) {
                var firstChild = rawItemContent.firstChild;
                var lastChild = rawItemContent.lastChild;
                if (firstChild == lastChild) {
                    if (firstChild.nodeType == 3) {
                        firstChild.textContent = firstChild.textContent.trim();
                    }
                }
                else {
                    if (firstChild.nodeType == 3) {
                        if (!(firstChild.textContent = firstChild.textContent.replace(/^\s+/, ''))) {
                            rawItemContent.removeChild(firstChild);
                        }
                    }
                    if (lastChild.nodeType == 3) {
                        if (!(lastChild.textContent = lastChild.textContent.replace(/\s+$/, ''))) {
                            rawItemContent.removeChild(lastChild);
                        }
                    }
                }
            }
            this._context = props.context;
            this.initialized = true;
        }
        this._list.on('change', this._onListChange, this);
        this._render(false);
    };
    RtRepeat.prototype._detachElement = function () {
        this._clearByItemMap(this._itemMap);
        this._list.off('change', this._onListChange, this);
    };
    RtRepeat.prototype._onListChange = function () {
        if (this.element.parentNode) {
            this._render(true);
        }
    };
    RtRepeat.prototype._render = function (c) {
        var _this = this;
        var oldItemMap = this._oldItemMap = this._itemMap;
        this._itemMap = new Map();
        var list = this._list.get();
        var changed = false;
        if (list) {
            this._lastNode = this.element;
            changed = list.reduce(function (changed, item, index) { return _this._renderItem(item, index) || changed; }, changed);
        }
        if (oldItemMap.size) {
            this._clearByItemMap(oldItemMap);
        }
        else if (!changed) {
            return;
        }
        if (c) {
            nextTick(function () {
                _this.emit('change');
            });
        }
    };
    RtRepeat.prototype._renderItem = function (item, index) {
        var trackBy = this._trackBy;
        var trackingValue = trackBy ? (trackBy == '$index' ? index : item[trackBy]) : item;
        var prevItems = this._oldItemMap.get(trackingValue);
        var currentItems = this._itemMap.get(trackingValue);
        if (prevItems) {
            var prevItem = void 0;
            if (prevItems.length == 1) {
                prevItem = prevItems[0];
                this._oldItemMap.delete(trackingValue);
            }
            else {
                prevItem = prevItems.shift();
            }
            if (currentItems) {
                currentItems.push(prevItem);
            }
            else {
                this._itemMap.set(trackingValue, [prevItem]);
            }
            prevItem.item.set(item);
            var nodes = prevItem.nodes;
            if (index == prevItem.index.get()) {
                this._lastNode = nodes[nodes.length - 1];
                return false;
            }
            prevItem.index.set(index);
            if (nodes.length == 1) {
                var node = nodes[0];
                this._lastNode.parentNode.insertBefore(node, this._lastNode.nextSibling);
                this._lastNode = node;
            }
            else {
                var df = document.createDocumentFragment();
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    df.appendChild(node);
                }
                var newLastNode_1 = df.lastChild;
                this._lastNode.parentNode.insertBefore(df, this._lastNode.nextSibling);
                this._lastNode = newLastNode_1;
            }
            return true;
        }
        var itemCell = new cellx_1.Cell(item);
        var indexCell = new cellx_1.Cell(index);
        var content = this._rawItemContent.cloneNode(true);
        var context = Object.create(this._context, (_a = {},
            _a[this._itemName] = {
                get: function () {
                    return itemCell.get();
                }
            },
            _a.$index = {
                get: function () {
                    return indexCell.get();
                }
            },
            _a));
        var _b = bindContent_1.default(content, this.ownerComponent, context), bindings = _b.bindings, childComponents = _b.childComponents;
        var newItem = {
            item: itemCell,
            index: indexCell,
            nodes: slice.call(content.childNodes),
            bindings: bindings
        };
        if (currentItems) {
            currentItems.push(newItem);
        }
        else {
            this._itemMap.set(trackingValue, [newItem]);
        }
        var newLastNode = content.lastChild;
        this._lastNode.parentNode.insertBefore(content, this._lastNode.nextSibling);
        this._lastNode = newLastNode;
        if (!Features_1.nativeCustomElements && childComponents) {
            attachChildComponentElements_1.default(childComponents);
        }
        return true;
        var _a;
    };
    RtRepeat.prototype._clearByItemMap = function (itemMap) {
        itemMap.forEach(this._clearByItems, this);
        itemMap.clear();
    };
    RtRepeat.prototype._clearByItems = function (items) {
        for (var i = items.length; i;) {
            var item = items[--i];
            var bindings = item.bindings;
            if (bindings) {
                for (var i_1 = bindings.length; i_1;) {
                    bindings[--i_1].off();
                }
            }
            var nodes = item.nodes;
            for (var i_2 = nodes.length; i_2;) {
                var node = nodes[--i_2];
                var parentNode = node.parentNode;
                if (parentNode) {
                    parentNode.removeChild(node);
                }
            }
        }
    };
    return RtRepeat;
}(Component_1.default));
RtRepeat = __decorate([
    d_1.default.Component({
        elementIs: 'rt-repeat',
        elementExtends: 'template',
        props: {
            for: { type: String, required: true, readonly: true },
            trackBy: { type: String, readonly: true },
            strip: { default: false, readonly: true }
        }
    })
], RtRepeat);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RtRepeat;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var defer_1 = __webpack_require__(17);
var Symbol = cellx_1.JS.Symbol;
var KEY_ATTACHED = Symbol('Rionite.ElementProtoMixin.attached');
var ElementProtoMixin = (_a = {
        rioniteComponent: null,
        get $c() {
            return new this._rioniteComponentConstructor(this);
        }
    },
    _a[KEY_ATTACHED] = false,
    _a.connectedCallback = function () {
        this[KEY_ATTACHED] = true;
        var component = this.rioniteComponent;
        if (component) {
            if (component.isElementAttached) {
                if (component._parentComponent === null) {
                    component._parentComponent = undefined;
                    component.elementMoved();
                }
            }
            else {
                component._parentComponent = undefined;
                component.isElementAttached = true;
                component._attachElement();
            }
        }
        else {
            defer_1.default(function () {
                if (this[KEY_ATTACHED]) {
                    var component_1 = this.$c;
                    component_1._parentComponent = undefined;
                    if (!component_1.parentComponent) {
                        component_1.isElementAttached = true;
                        component_1._attachElement();
                    }
                }
            }, this);
        }
    },
    _a.disconnectedCallback = function () {
        this[KEY_ATTACHED] = false;
        var component = this.rioniteComponent;
        if (component && component.isElementAttached) {
            component._parentComponent = null;
            defer_1.default(function () {
                if (component._parentComponent === null && component.isElementAttached) {
                    component.isElementAttached = false;
                    component._detachElement();
                }
            });
        }
    },
    _a.attributeChangedCallback = function (name, oldValue, value) {
        var component = this.rioniteComponent;
        if (component && component.isReady) {
            var attrs = component.elementAttributes;
            var privateName = '_' + name;
            if (attrs[privateName]) {
                attrs[privateName].set(value);
            }
        }
    },
    _a);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ElementProtoMixin;
var _a;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var nextUID = cellx_1.Utils.nextUID;
var hasOwn = Object.prototype.hasOwnProperty;
var KEY_UID = cellx_1.JS.Symbol('uid');
var getUID;
if (typeof KEY_UID == 'symbol') {
    getUID = function getUID(obj) {
        return hasOwn.call(obj, KEY_UID) ? obj[KEY_UID] : (obj[KEY_UID] = nextUID());
    };
}
else {
    getUID = function getUID(obj) {
        return hasOwn.call(obj, KEY_UID) ? obj[KEY_UID] : Object.defineProperty(obj, KEY_UID, {});
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getUID;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function setAttribute(el, name, value) {
    if (value === false || value == null) {
        el.removeAttribute(name);
    }
    else {
        el.setAttribute(name, value === true ? '' : value);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setAttribute;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var isRegExp_1 = __webpack_require__(19);
var escapeHTML_1 = __webpack_require__(8);
var unescapeHTML_1 = __webpack_require__(20);
var Map = cellx_1.JS.Map;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new Map([
    [Boolean, [function (value) {
                return value !== null ? value != 'no' : false;
            }, function (value) {
                return value ? '' : null;
            }]],
    ['boolean', [function (value, defaultValue) {
                return value !== null ? value != 'no' : defaultValue;
            }, function (value, defaultValue) {
                return value ? '' : (defaultValue ? 'no' : null);
            }]],
    [Number, [function (value) {
                return value !== null ? +value : undefined;
            }, function (value) {
                return value !== undefined ? String(+value) : null;
            }]],
    ['number', [function (value, defaultValue) {
                return value !== null ? +value : defaultValue;
            }, function (value) {
                return value !== undefined ? String(+value) : null;
            }]],
    [String, [function (value) {
                return value !== null ? value : undefined;
            }, function (value) {
                return value !== undefined ? String(value) : null;
            }]],
    ['string', [function (value, defaultValue) {
                return value !== null ? value : defaultValue;
            }, function (value) {
                return value !== undefined ? String(value) : null;
            }]],
    [Object, [function (value) {
                return value !== null ? Object(Function("return " + unescapeHTML_1.default(value) + ";")()) : undefined;
            }, function (value) {
                return value != null ? escapeHTML_1.default(isRegExp_1.default(value) ? value.toString() : JSON.stringify(value)) : null;
            }]],
    ['object', [function (value, defaultValue) {
                return value !== null ? Object(Function("return " + unescapeHTML_1.default(value) + ";")()) : defaultValue;
            }, function (value) {
                return value != null ? escapeHTML_1.default(isRegExp_1.default(value) ? value.toString() : JSON.stringify(value)) : null;
            }]]
]);


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function bindEvents(component, events) {
    for (var assetName in events) {
        var asset = void 0;
        if (assetName == ':component') {
            asset = component;
        }
        else if (assetName == ':element') {
            asset = component.element;
        }
        else {
            asset = component.$(assetName);
            if (!asset) {
                continue;
            }
        }
        var assetEvents = events[assetName];
        for (var evtName in assetEvents) {
            component.listenTo(asset, evtName, assetEvents[evtName]);
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bindEvents;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var bindingToJSExpression_1 = __webpack_require__(21);
var formatters_1 = __webpack_require__(11);
var cache = Object.create(null);
function compileBinding(binding) {
    var bindingRaw = binding.raw;
    if (cache[bindingRaw]) {
        return cache[bindingRaw];
    }
    var bindingJSExpr = bindingToJSExpression_1.default(binding);
    var jsExpr = "var temp; return " + bindingJSExpr.value + ";";
    if (bindingJSExpr.usesFormatters) {
        var inner_1 = Function('formatters', jsExpr);
        return (cache[bindingRaw] = function () {
            return inner_1.call(this, formatters_1.default);
        });
    }
    return (cache[bindingRaw] = Function(jsExpr));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compileBinding;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var ContentParser_1 = __webpack_require__(14);
var bindingToJSExpression_1 = __webpack_require__(21);
var compileBinding_1 = __webpack_require__(37);
var formatters_1 = __webpack_require__(11);
var escapeString_1 = __webpack_require__(9);
var ContentNodeType = ContentParser_1.default.ContentNodeType;
var cache = Object.create(null);
function compileContent(parsedContent, content) {
    if (cache[content]) {
        return cache[content];
    }
    if (parsedContent.length == 1 && parsedContent[0].nodeType == ContentNodeType.BINDING) {
        return (cache[content] = compileBinding_1.default(parsedContent[0]));
    }
    var usesFormatters = false;
    var jsExprParts = [];
    for (var _i = 0, parsedContent_1 = parsedContent; _i < parsedContent_1.length; _i++) {
        var node = parsedContent_1[_i];
        if (node.nodeType == ContentNodeType.TEXT) {
            jsExprParts.push("'" + escapeString_1.default(node.value) + "'");
        }
        else {
            var bindingJSExpr = bindingToJSExpression_1.default(node);
            if (!usesFormatters && bindingJSExpr.usesFormatters) {
                usesFormatters = true;
            }
            jsExprParts.push(bindingJSExpr.value);
        }
    }
    var jsExpr = "var temp; return [" + jsExprParts.join(', ') + "].join('');";
    if (usesFormatters) {
        var inner_1 = Function('formatters', jsExpr);
        return (cache[content] = function () {
            return inner_1.call(this, formatters_1.default);
        });
    }
    return (cache[content] = Function(jsExpr));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = compileContent;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
function freezeBinding(binding) {
    binding._frozenState = {
        changeEvents: binding.getEvents('change'),
        value: binding._value
    };
    binding.off();
}
function unfreezeBinding(binding) {
    var frozenState = binding._frozenState;
    var changeEvents = frozenState.changeEvents;
    binding._frozenState = null;
    for (var _i = 0, changeEvents_1 = changeEvents; _i < changeEvents_1.length; _i++) {
        var evt = changeEvents_1[_i];
        binding.on('change', evt.listener, evt.context);
    }
    if (frozenState.value !== binding._value) {
        binding._changeEvent = {
            target: binding,
            type: 'change',
            oldValue: frozenState.value,
            value: binding._value,
            prev: null
        };
        binding._canCancelChange = true;
        binding._addToRelease();
    }
}
function freezeBindings(bindings) {
    cellx_1.Cell.forceRelease();
    for (var _i = 0, bindings_1 = bindings; _i < bindings_1.length; _i++) {
        var binding = bindings_1[_i];
        freezeBinding(binding);
    }
}
exports.freezeBindings = freezeBindings;
function unfreezeBindings(bindings) {
    cellx_1.Cell.forceRelease();
    for (var _i = 0, bindings_2 = bindings; _i < bindings_2.length; _i++) {
        var binding = bindings_2[_i];
        unfreezeBinding(binding);
    }
    cellx_1.Cell.forceRelease();
}
exports.unfreezeBindings = unfreezeBindings;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var mixin = cellx_1.Utils.mixin;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mixin(Object.create(null), {
    a: window.HTMLAnchorElement,
    blockquote: window.HTMLQuoteElement,
    br: window.HTMLBRElement,
    caption: window.HTMLTableCaptionElement,
    col: window.HTMLTableColElement,
    colgroup: window.HTMLTableColElement,
    datalist: window.HTMLDataListElement,
    del: window.HTMLModElement,
    dir: window.HTMLDirectoryElement,
    dl: window.HTMLDListElement,
    document: window.HTMLDocument,
    element: Element,
    fieldset: window.HTMLFieldSetElement,
    frameset: window.HTMLFrameSetElement,
    h1: window.HTMLHeadingElement,
    h2: window.HTMLHeadingElement,
    h3: window.HTMLHeadingElement,
    h4: window.HTMLHeadingElement,
    h5: window.HTMLHeadingElement,
    h6: window.HTMLHeadingElement,
    hr: window.HTMLHRElement,
    iframe: window.HTMLIFrameElement,
    img: window.HTMLImageElement,
    ins: window.HTMLModElement,
    li: window.HTMLLIElement,
    menuitem: window.HTMLMenuItemElement,
    ol: window.HTMLOListElement,
    optgroup: window.HTMLOptGroupElement,
    p: window.HTMLParagraphElement,
    q: window.HTMLQuoteElement,
    tbody: window.HTMLTableSectionElement,
    td: window.HTMLTableCellElement,
    template: window.HTMLTemplateElement || HTMLElement,
    textarea: window.HTMLTextAreaElement,
    tfoot: window.HTMLTableSectionElement,
    th: window.HTMLTableCellElement,
    thead: window.HTMLTableSectionElement,
    tr: window.HTMLTableRowElement,
    ul: window.HTMLUListElement,
    vhgroupv: window.HTMLUnknownElement,
    vkeygen: window.HTMLUnknownElement
});


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    'change',
    'click',
    'dblclick',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keypress',
    'keyup',
    'mousedown',
    'mouseup',
    'submit'
];


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var camelize_1 = __webpack_require__(4);
function initElementAttributes(component, constr) {
    var elAttrsConfig = constr.elementAttributes;
    if (elAttrsConfig) {
        var attrs = component.elementAttributes;
        for (var name_1 in elAttrsConfig) {
            if (typeof elAttrsConfig[name_1] != 'function') {
                var camelizedName = camelize_1.default(name_1);
                attrs[camelizedName] = attrs[camelizedName];
            }
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initElementAttributes;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Component_1 = __webpack_require__(1);
function initElementClasses(el, constr) {
    var c = constr;
    do {
        el.classList.add(c.elementIs);
        c = Object.getPrototypeOf(c.prototype).constructor;
    } while (c != Component_1.default);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initElementClasses;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function onEvent(evt) {
    var node;
    var attrName;
    var targetEls;
    if (evt instanceof Event) {
        node = evt.target;
        attrName = 'rt-' + evt.type;
    }
    else {
        node = evt.target.element;
        attrName = 'rt-component-' + evt.type;
    }
    for (;;) {
        if (node.nodeType == 1 && node.hasAttribute(attrName)) {
            (targetEls || (targetEls = [])).push(node);
        }
        node = node.parentNode;
        if (!node) {
            break;
        }
        var component = node.$c;
        if (component && targetEls) {
            for (var _i = 0, targetEls_1 = targetEls; _i < targetEls_1.length; _i++) {
                var targetEl = targetEls_1[_i];
                var handler = component[targetEl.getAttribute(attrName)];
                if (typeof handler == 'function') {
                    if (handler.call(component, evt, targetEl.$c || targetEl) === false) {
                        evt.isPropagationStopped = true;
                        return;
                    }
                    if (evt.isPropagationStopped) {
                        return;
                    }
                }
            }
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = onEvent;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var cellx_1 = __webpack_require__(0);
var beml_1 = __webpack_require__(47);
var elementConstructorMap_1 = __webpack_require__(40);
var ElementProtoMixin_1 = __webpack_require__(32);
var hyphenize_1 = __webpack_require__(10);
var mixin = cellx_1.Utils.mixin;
var push = Array.prototype.push;
function initMarkupBlockNames(componentConstr, parentComponentConstr, elIs) {
    componentConstr._markupBlockNames = [elIs];
    if (parentComponentConstr._markupBlockNames) {
        push.apply(componentConstr._markupBlockNames, parentComponentConstr._markupBlockNames);
    }
}
function registerComponent(componentConstr) {
    if (componentConstr._registeredComponent === componentConstr) {
        throw new TypeError('Component already registered');
    }
    var elIs = componentConstr.elementIs;
    if (!elIs) {
        throw new TypeError('Static property "elementIs" is required');
    }
    var props = componentConstr.props;
    if (props !== undefined) {
        if (props && (props['_content'] || props['context'])) {
            throw new TypeError("No need to declare property \"" + (props['_content'] ? '_content' : 'context') + "\"");
        }
        componentConstr.elementAttributes = props;
    }
    var parentComponentConstr = Object.getPrototypeOf(componentConstr.prototype).constructor;
    var bemlTemplate = componentConstr.bemlTemplate;
    if (bemlTemplate !== undefined) {
        if (bemlTemplate) {
            componentConstr.template = componentConstr.template instanceof beml_1.Template ?
                componentConstr.template.extend('#' + elIs + ' ' + bemlTemplate) :
                new beml_1.Template('#' + elIs + ' ' + bemlTemplate);
            initMarkupBlockNames(componentConstr, parentComponentConstr, elIs);
        }
        else {
            componentConstr.template = bemlTemplate;
        }
    }
    else {
        var template = componentConstr.template;
        if (template && template !== parentComponentConstr.template) {
            initMarkupBlockNames(componentConstr, parentComponentConstr, elIs);
        }
    }
    componentConstr._assetClassNames = Object.create(parentComponentConstr._assetClassNames || null);
    var elExtends = componentConstr.elementExtends;
    var parentElConstr = elExtends ?
        elementConstructorMap_1.default[elExtends] ||
            window["HTML" + (elExtends.charAt(0).toUpperCase() + elExtends.slice(1)) + "Element"] :
        HTMLElement;
    var elConstr = function (self) {
        return parentElConstr.call(this, self);
    };
    var elProto = elConstr.prototype = Object.create(parentElConstr.prototype);
    Object.defineProperty(elConstr, 'observedAttributes', {
        configurable: true,
        enumerable: true,
        get: function () {
            var elAttrsConfig = componentConstr.elementAttributes;
            if (!elAttrsConfig) {
                return [];
            }
            var observedAttrs = [];
            for (var name_1 in elAttrsConfig) {
                observedAttrs.push(hyphenize_1.default(name_1));
            }
            return observedAttrs;
        }
    });
    mixin(elProto, ElementProtoMixin_1.default);
    Object.defineProperty(elProto, 'constructor', {
        configurable: true,
        writable: true,
        value: elConstr
    });
    elProto._rioniteComponentConstructor = componentConstr;
    elementConstructorMap_1.default[elIs] = window.customElements.define(elIs, elConstr, elExtends ? { extends: elExtends } : null);
    return (componentConstr._registeredComponent = componentConstr);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerComponent;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var escape_string_1 = __webpack_require__(26);
var Parser_1 = __webpack_require__(25);
var selfClosingTags_1 = __webpack_require__(49);
var renderAttributes_1 = __webpack_require__(48);
var elDelimiter = '__';
var Template = (function () {
    function Template(beml, parent) {
        if (parent === void 0) { parent = null; }
        var block = new Parser_1.default(beml).parse();
        var blockName = block.name;
        this.parent = parent;
        this._blockName = blockName;
        this._blockElementClassTemplate = parent ?
            [blockName + elDelimiter].concat(parent._blockElementClassTemplate) :
            [blockName + elDelimiter, ''];
        this._nodes = [(this._currentNode = { elementName: null, source: [], hasSuperCall: false })];
        var nodeMap = this._nodeMap = {};
        block.content.forEach(this._handleNode, this);
        this._renderer = parent ?
            parent._renderer :
            Function("return [" + this._currentNode.source.join(', ') + "].join('');");
        Object.keys(nodeMap).forEach(function (name) {
            var node = nodeMap[name];
            if (node.hasSuperCall) {
                var inner_1 = Function('$super', "return " + node.source.join(' + ') + ";");
                var parentElementRenderer_1 = parent && parent._elementRendererMap[name];
                this[name] = function () { return inner_1.call(this, parentElementRenderer_1); };
            }
            else {
                this[name] = Function("return " + node.source.join(' + ') + ";");
            }
        }, (this._elementRendererMap = Object.create(parent && parent._elementRendererMap)));
    }
    Template.compile = function (beml) {
        return new Template(beml);
    };
    Template.prototype._handleNode = function (node) {
        switch (node.nodeType) {
            case Parser_1.NodeType.ELEMENT: {
                var nodes = this._nodes;
                var el = node;
                var tagName = el.tagName;
                var elName = el.name;
                var content = el.content;
                if (elName) {
                    var currentNode = { elementName: elName, source: [], hasSuperCall: false };
                    nodes.push((this._currentNode = currentNode));
                    this._nodeMap[elName] = currentNode;
                }
                this._currentNode.source.push("'<" + tagName + renderAttributes_1.default(this._blockElementClassTemplate, el) + ">'");
                var hasContent = content && content.length;
                if (hasContent) {
                    content.forEach(this._handleNode, this);
                }
                if (hasContent || !(tagName in selfClosingTags_1.default)) {
                    this._currentNode.source.push("'</" + tagName + ">'");
                }
                if (elName) {
                    nodes.pop();
                    this._currentNode = nodes[nodes.length - 1];
                    this._currentNode.source.push("this['" + elName + "']()");
                }
                break;
            }
            case Parser_1.NodeType.TEXT: {
                this._currentNode.source.push("'" + escape_string_1.default(node.value) + "'");
                break;
            }
            case Parser_1.NodeType.SUPER_CALL: {
                this._currentNode.source.push("$super.call(this)");
                this._currentNode.hasSuperCall = true;
                break;
            }
        }
    };
    Template.prototype.extend = function (beml) {
        return new Template(beml, this);
    };
    Template.prototype.render = function () {
        return this._renderer.call(this._elementRendererMap);
    };
    return Template;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Template;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Parser_1 = __webpack_require__(25);
exports.Parser = Parser_1.default;
var Template_1 = __webpack_require__(46);
exports.Template = Template_1.default;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var escape_string_1 = __webpack_require__(26);
var escape_html_1 = __webpack_require__(51);
function renderAttributes(blockElementClassTemplate, el) {
    var elName = el.name;
    var attrs = el.attributes;
    if (attrs && attrs.list.length) {
        var f_1 = !elName;
        var result = attrs.list.map(function (attr) {
            var value = attr.value;
            if (!f_1 && attr.name == 'class') {
                f_1 = true;
                value = blockElementClassTemplate.join(elName + ' ') + value;
            }
            return " " + attr.name + "=\"" + (value && escape_html_1.default(escape_string_1.default(value))) + "\"";
        });
        return (f_1 ? '' : " class=\"" + blockElementClassTemplate.join(elName + ' ') + "\"") + result.join('');
    }
    return elName ? " class=\"" + blockElementClassTemplate.join(elName + ' ') + "\"" : '';
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = renderAttributes;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var selfClosingTags = {
    __proto__: null,
    area: 1,
    base: 1,
    basefont: 1,
    br: 1,
    col: 1,
    command: 1,
    embed: 1,
    frame: 1,
    hr: 1,
    img: 1,
    input: 1,
    isindex: 1,
    keygen: 1,
    link: 1,
    meta: 1,
    param: 1,
    source: 1,
    track: 1,
    wbr: 1,
    // svg tags
    circle: 1,
    ellipse: 1,
    line: 1,
    path: 1,
    polygone: 1,
    polyline: 1,
    rect: 1,
    stop: 1,
    use: 1
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = selfClosingTags;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reEscapableChars = /[&<>"]/g;
var charToEscapedMap = Object.create(null);
charToEscapedMap['&'] = '&amp;';
charToEscapedMap['<'] = '&lt;';
charToEscapedMap['>'] = '&gt;';
charToEscapedMap['"'] = '&quot;';
function escapeHTML(str) {
    return reEscapableChars.test(str) ? str.replace(reEscapableChars, function (chr) { return charToEscapedMap[chr]; }) : str;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = escapeHTML;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var escapeHTML_1 = __webpack_require__(50);
exports.escapeHTML = escapeHTML_1.default;
var unescapeHTML_1 = __webpack_require__(52);
exports.unescapeHTML = unescapeHTML_1.default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = escapeHTML_1.default;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var reEscapableEntities = /&(?:amp|lt|gt|quot);/g;
var escapedToCharMap = Object.create(null);
escapedToCharMap['&amp;'] = '&';
escapedToCharMap['&lt;'] = '<';
escapedToCharMap['&gt;'] = '>';
escapedToCharMap['&quot;'] = '"';
function unescapeHTML(str) {
    return reEscapableEntities.test(str) ? str.replace(reEscapableEntities, function (entity) { return escapedToCharMap[entity]; }) : str;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = unescapeHTML;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(27);


/***/ }
/******/ ]);
});