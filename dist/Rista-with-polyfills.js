/*!
Copyright (C) 2014-2015 by WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function(window, document, Object, REGISTER_ELEMENT){'use strict';

// in case it's there or already patched
if (REGISTER_ELEMENT in document) return;

// DO NOT USE THIS FILE DIRECTLY, IT WON'T WORK
// THIS IS A PROJECT BASED ON A BUILD SYSTEM
// THIS FILE IS JUST WRAPPED UP RESULTING IN
// build/document-register-element.js
// and its .max.js counter part

var
  // IE < 11 only + old WebKit for attributes + feature detection
  EXPANDO_UID = '__' + REGISTER_ELEMENT + (Math.random() * 10e4 >> 0),

  // shortcuts and costants
  ATTACHED = 'attached',
  DETACHED = 'detached',
  EXTENDS = 'extends',
  ADDITION = 'ADDITION',
  MODIFICATION = 'MODIFICATION',
  REMOVAL = 'REMOVAL',
  DOM_ATTR_MODIFIED = 'DOMAttrModified',
  DOM_CONTENT_LOADED = 'DOMContentLoaded',
  DOM_SUBTREE_MODIFIED = 'DOMSubtreeModified',
  PREFIX_TAG = '<',
  PREFIX_IS = '=',

  // valid and invalid node names
  validName = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/,
  invalidNames = [
    'ANNOTATION-XML',
    'COLOR-PROFILE',
    'FONT-FACE',
    'FONT-FACE-SRC',
    'FONT-FACE-URI',
    'FONT-FACE-FORMAT',
    'FONT-FACE-NAME',
    'MISSING-GLYPH'
  ],

  // registered types and their prototypes
  types = [],
  protos = [],

  // to query subnodes
  query = '',

  // html shortcut used to feature detect
  documentElement = document.documentElement,

  // ES5 inline helpers || basic patches
  indexOf = types.indexOf || function (v) {
    for(var i = this.length; i-- && this[i] !== v;){}
    return i;
  },

  // other helpers / shortcuts
  OP = Object.prototype,
  hOP = OP.hasOwnProperty,
  iPO = OP.isPrototypeOf,

  defineProperty = Object.defineProperty,
  gOPD = Object.getOwnPropertyDescriptor,
  gOPN = Object.getOwnPropertyNames,
  gPO = Object.getPrototypeOf,
  sPO = Object.setPrototypeOf,

  // jshint proto: true
  hasProto = !!Object.__proto__,

  // used to create unique instances
  create = Object.create || function Bridge(proto) {
    // silly broken polyfill probably ever used but short enough to work
    return proto ? ((Bridge.prototype = proto), new Bridge()) : this;
  },

  // will set the prototype if possible
  // or copy over all properties
  setPrototype = sPO || (
    hasProto ?
      function (o, p) {
        o.__proto__ = p;
        return o;
      } : (
    (gOPN && gOPD) ?
      (function(){
        function setProperties(o, p) {
          for (var
            key,
            names = gOPN(p),
            i = 0, length = names.length;
            i < length; i++
          ) {
            key = names[i];
            if (!hOP.call(o, key)) {
              defineProperty(o, key, gOPD(p, key));
            }
          }
        }
        return function (o, p) {
          do {
            setProperties(o, p);
          } while ((p = gPO(p)) && !iPO.call(p, o));
          return o;
        };
      }()) :
      function (o, p) {
        for (var key in p) {
          o[key] = p[key];
        }
        return o;
      }
  )),

  // DOM shortcuts and helpers, if any

  MutationObserver = window.MutationObserver ||
                     window.WebKitMutationObserver,

  HTMLElementPrototype = (
    window.HTMLElement ||
    window.Element ||
    window.Node
  ).prototype,

  IE8 = !iPO.call(HTMLElementPrototype, documentElement),

  isValidNode = IE8 ?
    function (node) {
      return node.nodeType === 1;
    } :
    function (node) {
      return iPO.call(HTMLElementPrototype, node);
    },

  targets = IE8 && [],

  cloneNode = HTMLElementPrototype.cloneNode,
  setAttribute = HTMLElementPrototype.setAttribute,
  removeAttribute = HTMLElementPrototype.removeAttribute,

  // replaced later on
  createElement = document.createElement,

  // shared observer for all attributes
  attributesObserver = MutationObserver && {
    attributes: true,
    characterData: true,
    attributeOldValue: true
  },

  // useful to detect only if there's no MutationObserver
  DOMAttrModified = MutationObserver || function(e) {
    doesNotSupportDOMAttrModified = false;
    documentElement.removeEventListener(
      DOM_ATTR_MODIFIED,
      DOMAttrModified
    );
  },

  // will both be used to make DOMNodeInserted asynchronous
  asapQueue,
  rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (fn) { setTimeout(fn, 10); },

  // internal flags
  setListener = false,
  doesNotSupportDOMAttrModified = true,
  dropDomContentLoaded = true,

  // needed for the innerHTML helper
  notFromInnerHTMLHelper = true,

  // optionally defined later on
  onSubtreeModified,
  callDOMAttrModified,
  getAttributesMirror,
  observer,

  // based on setting prototype capability
  // will check proto or the expando attribute
  // in order to setup the node once
  patchIfNotAlready,
  patch
;

if (sPO || hasProto) {
    patchIfNotAlready = function (node, proto) {
      if (!iPO.call(proto, node)) {
        setupNode(node, proto);
      }
    };
    patch = setupNode;
} else {
    patchIfNotAlready = function (node, proto) {
      if (!node[EXPANDO_UID]) {
        node[EXPANDO_UID] = Object(true);
        setupNode(node, proto);
      }
    };
    patch = patchIfNotAlready;
}
if (IE8) {
  doesNotSupportDOMAttrModified = false;
  (function (){
    var
      descriptor = gOPD(HTMLElementPrototype, 'addEventListener'),
      addEventListener = descriptor.value,
      patchedRemoveAttribute = function (name) {
        var e = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true});
        e.attrName = name;
        e.prevValue = this.getAttribute(name);
        e.newValue = null;
        e[REMOVAL] = e.attrChange = 2;
        removeAttribute.call(this, name);
        this.dispatchEvent(e);
      },
      patchedSetAttribute = function (name, value) {
        var
          had = this.hasAttribute(name),
          old = had && this.getAttribute(name),
          e = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true})
        ;
        setAttribute.call(this, name, value);
        e.attrName = name;
        e.prevValue = had ? old : null;
        e.newValue = value;
        if (had) {
          e[MODIFICATION] = e.attrChange = 1;
        } else {
          e[ADDITION] = e.attrChange = 0;
        }
        this.dispatchEvent(e);
      },
      onPropertyChange = function (e) {
        // jshint eqnull:true
        var
          node = e.currentTarget,
          superSecret = node[EXPANDO_UID],
          propertyName = e.propertyName,
          event
        ;
        if (superSecret.hasOwnProperty(propertyName)) {
          superSecret = superSecret[propertyName];
          event = new CustomEvent(DOM_ATTR_MODIFIED, {bubbles: true});
          event.attrName = superSecret.name;
          event.prevValue = superSecret.value || null;
          event.newValue = (superSecret.value = node[propertyName] || null);
          if (event.prevValue == null) {
            event[ADDITION] = event.attrChange = 0;
          } else {
            event[MODIFICATION] = event.attrChange = 1;
          }
          node.dispatchEvent(event);
        }
      }
    ;
    descriptor.value = function (type, handler, capture) {
      if (
        type === DOM_ATTR_MODIFIED &&
        this.attributeChangedCallback &&
        this.setAttribute !== patchedSetAttribute
      ) {
        this[EXPANDO_UID] = {
          className: {
            name: 'class',
            value: this.className
          }
        };
        this.setAttribute = patchedSetAttribute;
        this.removeAttribute = patchedRemoveAttribute;
        addEventListener.call(this, 'propertychange', onPropertyChange);
      }
      addEventListener.call(this, type, handler, capture);
    };
    defineProperty(HTMLElementPrototype, 'addEventListener', descriptor);
  }());
} else if (!MutationObserver) {
  documentElement.addEventListener(DOM_ATTR_MODIFIED, DOMAttrModified);
  documentElement.setAttribute(EXPANDO_UID, 1);
  documentElement.removeAttribute(EXPANDO_UID);
  if (doesNotSupportDOMAttrModified) {
    onSubtreeModified = function (e) {
      var
        node = this,
        oldAttributes,
        newAttributes,
        key
      ;
      if (node === e.target) {
        oldAttributes = node[EXPANDO_UID];
        node[EXPANDO_UID] = (newAttributes = getAttributesMirror(node));
        for (key in newAttributes) {
          if (!(key in oldAttributes)) {
            // attribute was added
            return callDOMAttrModified(
              0,
              node,
              key,
              oldAttributes[key],
              newAttributes[key],
              ADDITION
            );
          } else if (newAttributes[key] !== oldAttributes[key]) {
            // attribute was changed
            return callDOMAttrModified(
              1,
              node,
              key,
              oldAttributes[key],
              newAttributes[key],
              MODIFICATION
            );
          }
        }
        // checking if it has been removed
        for (key in oldAttributes) {
          if (!(key in newAttributes)) {
            // attribute removed
            return callDOMAttrModified(
              2,
              node,
              key,
              oldAttributes[key],
              newAttributes[key],
              REMOVAL
            );
          }
        }
      }
    };
    callDOMAttrModified = function (
      attrChange,
      currentTarget,
      attrName,
      prevValue,
      newValue,
      action
    ) {
      var e = {
        attrChange: attrChange,
        currentTarget: currentTarget,
        attrName: attrName,
        prevValue: prevValue,
        newValue: newValue
      };
      e[action] = attrChange;
      onDOMAttrModified(e);
    };
    getAttributesMirror = function (node) {
      for (var
        attr, name,
        result = {},
        attributes = node.attributes,
        i = 0, length = attributes.length;
        i < length; i++
      ) {
        attr = attributes[i];
        name = attr.name;
        if (name !== 'setAttribute') {
          result[name] = attr.value;
        }
      }
      return result;
    };
  }
}

function loopAndVerify(list, action) {
  for (var i = 0, length = list.length; i < length; i++) {
    verifyAndSetupAndAction(list[i], action);
  }
}

function loopAndSetup(list) {
  for (var i = 0, length = list.length, node; i < length; i++) {
    node = list[i];
    patch(node, protos[getTypeIndex(node)]);
  }
}

function executeAction(action) {
  return function (node) {
    if (isValidNode(node)) {
      verifyAndSetupAndAction(node, action);
      loopAndVerify(
        node.querySelectorAll(query),
        action
      );
    }
  };
}

function getTypeIndex(target) {
  var
    is = target.getAttribute('is'),
    nodeName = target.nodeName.toUpperCase(),
    i = indexOf.call(
      types,
      is ?
          PREFIX_IS + is.toUpperCase() :
          PREFIX_TAG + nodeName
    )
  ;
  return is && -1 < i && !isInQSA(nodeName, is) ? -1 : i;
}

function isInQSA(name, type) {
  return -1 < query.indexOf(name + '[is="' + type + '"]');
}

function onDOMAttrModified(e) {
  var
    node = e.currentTarget,
    attrChange = e.attrChange,
    attrName = e.attrName,
    target = e.target
  ;
  if (notFromInnerHTMLHelper &&
      (!target || target === node) &&
      node.attributeChangedCallback &&
      attrName !== 'style' &&
      e.prevValue !== e.newValue) {
    node.attributeChangedCallback(
      attrName,
      attrChange === e[ADDITION] ? null : e.prevValue,
      attrChange === e[REMOVAL] ? null : e.newValue
    );
  }
}

function onDOMNode(action) {
  var executor = executeAction(action);
  return function (e) {
    asapQueue.push(executor, e.target);
  };
}

function onReadyStateChange(e) {
  if (dropDomContentLoaded) {
    dropDomContentLoaded = false;
    e.currentTarget.removeEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
  }
  loopAndVerify(
    (e.target || document).querySelectorAll(query),
    e.detail === DETACHED ? DETACHED : ATTACHED
  );
  if (IE8) purge();
}

function patchedSetAttribute(name, value) {
  // jshint validthis:true
  var self = this;
  setAttribute.call(self, name, value);
  onSubtreeModified.call(self, {target: self});
}

function setupNode(node, proto) {
  setPrototype(node, proto);
  if (observer) {
    observer.observe(node, attributesObserver);
  } else {
    if (doesNotSupportDOMAttrModified) {
      node.setAttribute = patchedSetAttribute;
      node[EXPANDO_UID] = getAttributesMirror(node);
      node.addEventListener(DOM_SUBTREE_MODIFIED, onSubtreeModified);
    }
    node.addEventListener(DOM_ATTR_MODIFIED, onDOMAttrModified);
  }
  if (node.createdCallback && notFromInnerHTMLHelper) {
    node.created = true;
    node.createdCallback();
    node.created = false;
  }
}

function purge() {
  for (var
    node,
    i = 0,
    length = targets.length;
    i < length; i++
  ) {
    node = targets[i];
    if (!documentElement.contains(node)) {
      length--;
      targets.splice(i--, 1);
      verifyAndSetupAndAction(node, DETACHED);
    }
  }
}

function throwTypeError(type) {
  throw new Error('A ' + type + ' type is already registered');
}

function verifyAndSetupAndAction(node, action) {
  var
    fn,
    i = getTypeIndex(node)
  ;
  if (-1 < i) {
    patchIfNotAlready(node, protos[i]);
    i = 0;
    if (action === ATTACHED && !node[ATTACHED]) {
      node[DETACHED] = false;
      node[ATTACHED] = true;
      i = 1;
      if (IE8 && indexOf.call(targets, node) < 0) {
        targets.push(node);
      }
    } else if (action === DETACHED && !node[DETACHED]) {
      node[ATTACHED] = false;
      node[DETACHED] = true;
      i = 1;
    }
    if (i && (fn = node[action + 'Callback'])) fn.call(node);
  }
}

// set as enumerable, writable and configurable
document[REGISTER_ELEMENT] = function registerElement(type, options) {
  upperType = type.toUpperCase();
  if (!setListener) {
    // only first time document.registerElement is used
    // we need to set this listener
    // setting it by default might slow down for no reason
    setListener = true;
    if (MutationObserver) {
      observer = (function(attached, detached){
        function checkEmAll(list, callback) {
          for (var i = 0, length = list.length; i < length; callback(list[i++])){}
        }
        return new MutationObserver(function (records) {
          for (var
            current, node, newValue,
            i = 0, length = records.length; i < length; i++
          ) {
            current = records[i];
            if (current.type === 'childList') {
              checkEmAll(current.addedNodes, attached);
              checkEmAll(current.removedNodes, detached);
            } else {
              node = current.target;
              if (notFromInnerHTMLHelper &&
                  node.attributeChangedCallback &&
                  current.attributeName !== 'style') {
                newValue = node.getAttribute(current.attributeName);
                if (newValue !== current.oldValue) {
                  node.attributeChangedCallback(
                    current.attributeName,
                    current.oldValue,
                    newValue
                  );
                }
              }
            }
          }
        });
      }(executeAction(ATTACHED), executeAction(DETACHED)));
      observer.observe(
        document,
        {
          childList: true,
          subtree: true
        }
      );
    } else {
      asapQueue = [];
      rAF(function ASAP() {
        while (asapQueue.length) {
          asapQueue.shift().call(
            null, asapQueue.shift()
          );
        }
        rAF(ASAP);
      });
      document.addEventListener('DOMNodeInserted', onDOMNode(ATTACHED));
      document.addEventListener('DOMNodeRemoved', onDOMNode(DETACHED));
    }

    document.addEventListener(DOM_CONTENT_LOADED, onReadyStateChange);
    document.addEventListener('readystatechange', onReadyStateChange);

    document.createElement = function (localName, typeExtension) {
      var
        node = createElement.apply(document, arguments),
        name = '' + localName,
        i = indexOf.call(
          types,
          (typeExtension ? PREFIX_IS : PREFIX_TAG) +
          (typeExtension || name).toUpperCase()
        ),
        setup = -1 < i
      ;
      if (typeExtension) {
        node.setAttribute('is', typeExtension = typeExtension.toLowerCase());
        if (setup) {
          setup = isInQSA(name.toUpperCase(), typeExtension);
        }
      }
      notFromInnerHTMLHelper = !document.createElement.innerHTMLHelper;
      if (setup) patch(node, protos[i]);
      return node;
    };

    HTMLElementPrototype.cloneNode = function (deep) {
      var
        node = cloneNode.call(this, !!deep),
        i = getTypeIndex(node)
      ;
      if (-1 < i) patch(node, protos[i]);
      if (deep) loopAndSetup(node.querySelectorAll(query));
      return node;
    };
  }

  if (-2 < (
    indexOf.call(types, PREFIX_IS + upperType) +
    indexOf.call(types, PREFIX_TAG + upperType)
  )) {
    throwTypeError(type);
  }

  if (!validName.test(upperType) || -1 < indexOf.call(invalidNames, upperType)) {
    throw new Error('The type ' + type + ' is invalid');
  }

  var
    constructor = function () {
      return extending ?
        document.createElement(nodeName, upperType) :
        document.createElement(nodeName);
    },
    opt = options || OP,
    extending = hOP.call(opt, EXTENDS),
    nodeName = extending ? options[EXTENDS].toUpperCase() : upperType,
    upperType,
    i
  ;

  if (extending && -1 < (
    indexOf.call(types, PREFIX_TAG + nodeName)
  )) {
    throwTypeError(nodeName);
  }

  i = types.push((extending ? PREFIX_IS : PREFIX_TAG) + upperType) - 1;

  query = query.concat(
    query.length ? ',' : '',
    extending ? nodeName + '[is="' + type.toLowerCase() + '"]' : nodeName
  );

  constructor.prototype = (
    protos[i] = hOP.call(opt, 'prototype') ?
      opt.prototype :
      create(HTMLElementPrototype)
  );

  loopAndVerify(
    document.querySelectorAll(query),
    ATTACHED
  );

  return constructor;
};

}(window, document, Object, 'registerElement'));
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("cellx"));
	else if(typeof define === 'function' && define.amd)
		define(["cellx"], factory);
	else if(typeof exports === 'object')
		exports["Rista"] = factory(require("cellx"));
	else
		root["Rista"] = factory(root["cellx"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var EventEmitter = _require.EventEmitter;
	var map = _require.map;
	var list = _require.list;
	var cellx = _require.cellx;

	var Attributes = __webpack_require__(2);
	var Component = __webpack_require__(7);
	var registerComponent = __webpack_require__(9);
	var morphComponentElement = __webpack_require__(11);
	var RtContent = __webpack_require__(16);
	var camelize = __webpack_require__(3);
	var hyphenize = __webpack_require__(4);
	var escapeHTML = __webpack_require__(5);
	var unescapeHTML = __webpack_require__(6);

	var Rista = module.exports = {
		EventEmitter: EventEmitter,
		map: map,
		list: list,
		cellx: cellx,
		Attributes: Attributes,
		Component: Component,
		registerComponent: registerComponent,
		morphComponentElement: morphComponentElement,

		components: {
			RtContent: RtContent
		},

		utils: {
			camelize: camelize,
			hyphenize: hyphenize,
			escapeHTML: escapeHTML,
			unescapeHTML: unescapeHTML
		}
	};
	Rista.Rista = Rista; // for destructuring

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _require = __webpack_require__(1);

	var EventEmitter = _require.EventEmitter;
	var Cell = _require.Cell;
	var Map = _require.js.Map;

	var camelize = __webpack_require__(3);
	var hyphenize = __webpack_require__(4);
	var escapeHTML = __webpack_require__(5);
	var unescapeHTML = __webpack_require__(6);

	var defineProperty = Object.defineProperty;
	var toString = Object.prototype.toString;

	function isRegExp(value) {
		return toString.call(value) == '[object RegExp]';
	}

	var typeHandlers = new Map([[Boolean, [function (value) {
		return value !== null ? value != 'no' : false;
	}, function (value) {
		return value ? '' : null;
	}]], ['boolean', [function (value, defaultValue) {
		return value !== null ? value != 'no' : defaultValue;
	}, function (value, defaultValue) {
		return value ? '' : defaultValue ? 'no' : null;
	}]], [Number, [function (value) {
		return value !== null ? +value : void 0;
	}, function (value) {
		return value !== void 0 ? String(+value) : null;
	}]], ['number', [function (value, defaultValue) {
		return value !== null ? +value : defaultValue;
	}, function (value) {
		return value !== void 0 ? String(+value) : null;
	}]], [String, [function (value) {
		return value !== null ? value : void 0;
	}, function (value) {
		return value !== void 0 ? String(value) : null;
	}]], ['string', [function (value, defaultValue) {
		return value !== null ? value : defaultValue;
	}, function (value) {
		return value !== void 0 ? String(value) : null;
	}]], [Object, [function (value, defaultValue, component) {
		return value !== null ? Object(Function('return ' + unescapeHTML(value) + ';').call(component)) : null;
	}, function (value) {
		return value != null ? escapeHTML(isRegExp(value) ? value.toString() : JSON.stringify(value)) : null;
	}]], ['object', [function (value, defaultValue, component) {
		return value !== null ? Object(Function('return ' + unescapeHTML(value) + ';').call(component)) : defaultValue;
	}, function (value) {
		return value != null ? escapeHTML(isRegExp(value) ? value.toString() : JSON.stringify(value)) : null;
	}]]]);

	/**
	 * @typesign new Attributes(component: Rista.Component) -> Rista.Attributes;
	 */
	var Attributes = EventEmitter.extend({
		Static: {
			typeHandlers: typeHandlers
		},

		constructor: function Attributes(component) {
			var _this = this;

			var el = component.element;
			var schema = component.constructor.elementAttributes;

			var _loop = function _loop(name) {
				var defaultValue = schema[name];
				var type = typeof defaultValue === 'undefined' ? 'undefined' : _typeof(defaultValue);
				var handlers = typeHandlers.get(type == 'function' ? defaultValue : type);

				if (!handlers) {
					throw new TypeError('Unsupported attribute type');
				}

				var camelizedName = camelize(name);
				var hyphenizedName = hyphenize(name);

				var attrValue = _this['_' + camelizedName] = _this['_' + hyphenizedName] = new Cell(el.getAttribute(hyphenizedName), {
					merge: function merge(value, oldValue) {
						return oldValue && value === oldValue[0] ? oldValue : [value, handlers[0](value, defaultValue, component)];
					},
					onChange: function onChange(_ref) {
						var oldValue = _ref.oldValue[1];
						var value = _ref.value[1];

						if (component.isReady) {
							component.emit({
								type: 'element-attribute-' + hyphenizedName + '-change',
								oldValue: oldValue,
								value: value
							});
							component.emit({
								type: 'element-attribute-change',
								name: hyphenizedName,
								oldValue: oldValue,
								value: value
							});

							if (component.elementAttributeChanged) {
								component.elementAttributeChanged(hyphenizedName, oldValue, value);
							}
						}
					}
				});

				var descriptor = {
					configurable: true,
					enumerable: true,

					get: function get() {
						return attrValue.get()[1];
					},
					set: function set(value) {
						value = handlers[1](value, defaultValue);

						if (value === null) {
							el.removeAttribute(hyphenizedName);
						} else {
							el.setAttribute(hyphenizedName, value);
						}

						attrValue.set(value);
					}
				};

				defineProperty(_this, camelizedName, descriptor);

				if (hyphenizedName != camelizedName) {
					defineProperty(_this, hyphenizedName, descriptor);
				}
			};

			for (var name in schema) {
				_loop(name);
			}
		}
	});

	module.exports = Attributes;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	var cache = Object.create(null);

	/**
	 * @typesign (str: string) -> string;
	 */
	function camelize(str) {
		return cache[str] || (cache[str] = str.replace(/[\-_]+([a-z]|$)/g, function (match, chr) {
			return chr.toUpperCase();
		}));
	}

	module.exports = camelize;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var cache = Object.create(null);

	/**
	 * @typesign (str: string) -> string;
	 */
	function hyphenize(str) {
		return cache[str] || (cache[str] = str.replace(/([A-Z])([^A-Z])/g, function (match, chr1, chr2) {
			return '-' + chr1.toLowerCase() + chr2;
		}).replace(/([A-Z]+)/g, function (match, chars) {
			return '-' + chars.toLowerCase();
		}).replace('--', '-').replace(/^-/, ''));
	}

	module.exports = hyphenize;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var reAmpersand = /&/g;
	var reLessThan = /</g;
	var reGreaterThan = />/g;
	var reQuote = /"/g;

	/**
	 * @typesign (str: string) -> string;
	 */
	function escapeHTML(str) {
		return str.replace(reAmpersand, '&amp;').replace(reLessThan, '&lt;').replace(reGreaterThan, '&gt;').replace(reQuote, '&quot;');
	}

	module.exports = escapeHTML;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var reLessThan = /&lt;/g;
	var reGreaterThan = /&gt;/g;
	var reQuote = /&quot;/g;
	var reAmpersand = /&amp;/g;

	/**
	 * @typesign (str: string) -> string;
	 */
	function unescapeHTML(str) {
		return str.replace(reLessThan, '<').replace(reGreaterThan, '>').replace(reQuote, '"').replace(reAmpersand, '&');
	}

	module.exports = unescapeHTML;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var EventEmitter = _require.EventEmitter;
	var Cell = _require.Cell;
	var _require$utils = _require.utils;
	var createClass = _require$utils.createClass;
	var nextTick = _require$utils.nextTick;
	var defineObservableProperty = _require$utils.defineObservableProperty;

	var DisposableMixin = __webpack_require__(8);
	var registerComponent = __webpack_require__(9);
	var Attributes = __webpack_require__(2);
	var morphComponentElement = __webpack_require__(11);
	var eventTypes = __webpack_require__(15);
	var camelize = __webpack_require__(3);

	var createObject = Object.create;
	var getPrototypeOf = Object.getPrototypeOf;
	var defineProperties = Object.defineProperties;
	var hasOwn = Object.prototype.hasOwnProperty;
	var isArray = Array.isArray;
	var map = Array.prototype.map;

	var reClosedCustomElementTag = /<(\w+(?:\-\w+)+)([^>]*)\/>/g;

	/**
	 * @typesign (evt: Event|cellx~Event);
	 */
	function onEvent(evt) {
		var node = void 0;
		var attrName = void 0;
		var targets = [];

		if (evt instanceof Event) {
			node = evt.target;
			attrName = 'rt-' + evt.type;
		} else {
			node = evt.target.element;
			attrName = 'rt-component-' + evt.type;
		}

		for (;;) {
			if (node.nodeType == 1 && node.hasAttribute(attrName)) {
				targets.unshift(node);
			}

			node = node.parentNode;

			if (!node) {
				break;
			}

			var component = node.ristaComponent;

			if (!component) {
				continue;
			}

			for (var i = targets.length; i;) {
				var target = targets[--i];
				var handler = component[target.getAttribute(attrName)];

				if (typeof handler == 'function') {
					handler.call(component, evt, target);
					targets.splice(i, 1);
				}
			}
		}
	}

	/**
	 * @typesign () -> string;
	 */
	function renderInner() {
		var template = this.constructor.template;

		if (template) {
			return template.render ? template.render(this) : template.call(this, this);
		}

		return '';
	}

	var Component = EventEmitter.extend({
		Implements: [DisposableMixin],

		Static: {
			/**
	   * @this {Function}
	   *
	   * @typesign (elementTagName: string, description: {
	   *     Implements?: Array<Object|Function>,
	   *     Static?: {
	   *         elementAttributes?: Object,
	   *         [key: string]
	   *     },
	   *     constructor?: Function,
	   *     [key: string]
	   * }) -> Function;
	   */

			extend: function extend(elementTagName, description) {
				description.Extends = this;
				(description.Static || (description.Static = {})).elementTagName = elementTagName;
				return registerComponent(createClass(description));
			},


			elementTagName: void 0,
			elementAttributes: {},

			template: null
		},

		_parentComponent: null,

		/**
	  * @type {?Rista.Component}
	  */
		get parentComponent() {
			if (this._parentComponent !== void 0) {
				return this._parentComponent;
			}

			for (var node; node = (node || this.element).parentNode;) {
				if (node.ristaComponent) {
					return this._parentComponent = node.ristaComponent;
				}
			}

			return this._parentComponent = null;
		},

		ownerComponent: null,

		/**
	  * @type {HTMLElement}
	  */
		element: null,

		_elementAttributes: null,

		/**
	  * @type {Rista.Attributes}
	  */
		get elementAttributes() {
			return this._elementAttributes || (this._elementAttributes = new Attributes(this));
		},

		_props: null,

		/**
	  * @type {Rista.Properties}
	  */
		get props() {
			return this._props || (this._props = defineObservableProperty(createObject(this.elementAttributes), 'contentSourceElement', null));
		},

		_elementInnerHTML: null,
		_prevAppliedElementInnerHTML: void 0,

		_elementAttached: null,

		initialized: false,
		isReady: false,

		_blockNameInMarkup: void 0,

		constructor: function Component(el, props) {
			EventEmitter.call(this);
			DisposableMixin.call(this);

			var constr = this.constructor;

			if (constr.prototype == Component.prototype) {
				throw new TypeError('Component is abstract class');
			}

			if (!el) {
				el = document.createElement(constr.elementTagName);
			}

			this.element = el;

			defineProperties(el, {
				ristaComponent: { value: this },
				$c: { value: this }
			});

			if (constr.template || this.renderInner !== renderInner) {
				this._elementInnerHTML = new Cell(function () {
					var html = this.renderInner();
					return (isArray(html) ? html.join('') : html).replace(reClosedCustomElementTag, '<$1$2></$1>');
				}, {
					owner: this
				});
			}

			this._elementAttached = new Cell(false, {
				owner: this,
				onChange: this._onElementAttachedChange
			});

			if (props) {
				var properties = this.props;

				for (var name in props) {
					properties[camelize(name)] = props[name];
				}
			}

			if (this.created) {
				this.created();
			}
		},

		/**
	  * @override
	  */
		_handleEvent: function _handleEvent(evt) {
			EventEmitter.prototype._handleEvent.call(this, evt);

			if (evt.bubbles !== false && !evt.isPropagationStopped) {
				var parentComponent = this.parentComponent;

				if (parentComponent) {
					parentComponent._handleEvent(evt);
				} else {
					onEvent(evt);
				}
			}
		},
		_onElementInnerHTMLChange: function _onElementInnerHTMLChange() {
			this.updateElement();
		},
		_onElementAttachedChange: function _onElementAttachedChange(_ref) {
			var _this = this;

			var attached = _ref.value;

			if (attached && !this.initialized) {
				this.initialized = true;

				if (this.initialize) {
					this.initialize();
				}
			}

			if (this._elementInnerHTML) {
				this._elementInnerHTML[attached ? 'on' : 'off']('change', this._onElementInnerHTMLChange);
			}

			if (attached) {
				this.updateElement();

				if (!this.isReady) {
					var el = this.element;

					for (var constr = this.constructor;;) {
						el.className += ' ' + constr.elementTagName;
						constr = getPrototypeOf(constr.prototype).constructor;

						if (constr == Component) {
							break;
						}
					}

					var attrs = this.elementAttributes;
					var attributesSchema = this.constructor.elementAttributes;

					for (var name in attributesSchema) {
						if (typeof attributesSchema[name] != 'function') {
							var camelizedName = camelize(name);
							attrs[camelizedName] = attrs[camelizedName];
						}
					}

					el.className += ' _component-ready';
				}

				if (!this.isReady || this.elementAttached) {
					nextTick(function () {
						if (!_this.isReady) {
							_this.isReady = true;

							if (_this.ready) {
								_this.ready();
							}
						}

						if (_this.elementAttached) {
							_this.elementAttached();
						}
					});
				}
			} else {
				this.dispose();

				if (this.elementDetached) {
					this.elementDetached();
				}
			}
		},


		/**
	  * @typesign () -> boolean;
	  */
		shouldElementUpdate: function shouldElementUpdate() {
			return !!this._elementInnerHTML;
		},


		/**
	  * @typesign () -> string|Array<string>;
	  */
		renderInner: renderInner,

		/**
	  * @typesign () -> Rista.Component;
	  */
		updateElement: function updateElement() {
			var _this2 = this;

			if (!this._elementInnerHTML) {
				return this;
			}

			var html = this._elementInnerHTML.get();

			if (html == (this._prevAppliedElementInnerHTML || '')) {
				return this;
			}

			var toEl = document.createElement('div');
			toEl.innerHTML = html;

			morphComponentElement(this, toEl);

			this._prevAppliedElementInnerHTML = html;

			if (this.isReady) {
				nextTick(function () {
					if (_this2.elementUpdated) {
						_this2.elementUpdated();
					}

					_this2.emit('element-update');
				});
			}

			return this;
		},


		/**
	  * @typesign (selector: string) -> Rista.Component|HTMLElement;
	  */
		$: function $(selector) {
			var el = this.element.querySelector(this._prepareSelector(selector));
			return el.$c || el;
		},


		/**
	  * @typesign (selector: string) -> Array<Rista.Component|HTMLElement>;
	  */
		$$: function $$(selector) {
			return map.call(this.element.querySelectorAll(this._prepareSelector(selector)), function (el) {
				return el.$c || el;
			});
		},


		/**
	  * @typesign (selector: string) -> string;
	  */
		_prepareSelector: function _prepareSelector(selector) {
			selector = selector.split('&');

			if (selector.length == 1) {
				return selector[0];
			}

			var blockName = this._blockNameInMarkup;

			if (!blockName) {
				for (var constr = this.constructor;;) {
					if (hasOwn.call(constr.prototype, 'renderInner')) {
						blockName = constr.elementTagName;
						break;
					}

					var parentConstr = getPrototypeOf(constr.prototype).constructor;

					if (constr.template && constr.template !== parentConstr.template) {
						blockName = constr.elementTagName;
						break;
					}

					if (parentConstr == Component) {
						blockName = this.constructor.elementTagName;
						break;
					}

					constr = parentConstr;
				}

				this._blockNameInMarkup = blockName;
			}

			return selector.join('.' + blockName);
		}
	});

	module.exports = Component;

	document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
		document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);

		eventTypes.forEach(function (type) {
			document.addEventListener(type, onEvent);
		});
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _require = __webpack_require__(1);

	var EventEmitter = _require.EventEmitter;
	var nextUID = _require.utils.nextUID;


	var isArray = Array.isArray;

	var DisposableMixin = EventEmitter.extend({
		constructor: function DisposableMixin() {
			/**
	   * @type {Object<{ dispose: () }>}
	   */
			this._disposables = {};
		},

		listenTo: function listenTo(target, type, listener, context) {
			var _this = this;

			var listenings = void 0;

			if (isArray(target) || target instanceof NodeList || target instanceof HTMLCollection || target.addClass && target.each) {
				if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) == 'object' && !isArray(type)) {
					if (arguments.length < 3) {
						listener = this;
					}
				} else if (arguments.length < 4) {
					context = this;
				}

				listenings = [];

				for (var i = 0, l = target.length; i < l; i++) {
					listenings.push(this.listenTo(target[i], type, listener, context));
				}
			} else if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) == 'object') {
				listenings = [];

				if (isArray(type)) {
					if (arguments.length < 4) {
						context = this;
					}

					var types = type;

					for (var _i = 0, _l = types.length; _i < _l; _i++) {
						listenings.push(this.listenTo(target, types[_i], listener, context));
					}
				} else {
					context = arguments.length < 3 ? this : listener;

					var listeners = type;

					for (var _type in listeners) {
						listenings.push(this.listenTo(target, _type, listeners[_type], context));
					}
				}
			} else {
				if (arguments.length < 4) {
					context = this;
				}

				if ((typeof listener === 'undefined' ? 'undefined' : _typeof(listener)) == 'object') {
					var _listeners = listener;

					listenings = [];

					if (isArray(_listeners)) {
						for (var _i2 = 0, _l2 = _listeners.length; _i2 < _l2; _i2++) {
							listenings.push(this.listenTo(target, type, _listeners[_i2], context));
						}
					} else {
						for (var name in _listeners) {
							listenings.push(this.listenTo(target[name]('unwrap', 0), type, _listeners[name], context));
						}
					}
				} else {
					return this._listenTo(target, type, listener, context);
				}
			}

			var id = nextUID();

			var stopListening = function stopListening() {
				for (var _i3 = listenings.length; _i3;) {
					listenings[--_i3].stop();
				}

				delete _this._disposables[id];
			};

			var listening = this._disposables[id] = {
				stop: stopListening,
				dispose: stopListening
			};

			return listening;
		},


		/**
	  * @typesign (
	  *     target: cellx.EventEmitter|EventTarget,
	  *     type: string,
	  *     listener: (evt: cellx~Event|Event) -> ?boolean,
	  *     context
	  * ) -> { stop: (), dispose: () };
	  */
		_listenTo: function _listenTo(target, type, listener, context) {
			var _this2 = this;

			if (target instanceof EventEmitter) {
				target.on(type, listener, context);
			} else if (target.addEventListener) {
				if (target !== context) {
					listener = listener.bind(context);
				}

				target.addEventListener(type, listener);
			} else {
				throw new TypeError('Unable to add a listener');
			}

			var id = nextUID();

			var stopListening = function stopListening() {
				if (_this2._disposables[id]) {
					if (target instanceof EventEmitter) {
						target.off(type, listener, context);
					} else {
						target.removeEventListener(type, listener);
					}

					delete _this2._disposables[id];
				}
			};

			var listening = this._disposables[id] = {
				stop: stopListening,
				dispose: stopListening
			};

			return listening;
		},


		/**
	  * @typesign (cb: Function, delay: uint) -> { clear: (), dispose: () };
	  */
		setTimeout: function (_setTimeout) {
			function setTimeout(_x, _x2) {
				return _setTimeout.apply(this, arguments);
			}

			setTimeout.toString = function () {
				return _setTimeout.toString();
			};

			return setTimeout;
		}(function (cb, delay) {
			var _this3 = this;

			var id = nextUID();

			var timeoutId = setTimeout(function () {
				delete _this3._disposables[id];
				cb.call(_this3);
			}, delay);

			var _clearTimeout = function _clearTimeout() {
				if (_this3._disposables[id]) {
					clearTimeout(timeoutId);
					delete _this3._disposables[id];
				}
			};

			var timeout = this._disposables[id] = {
				clear: _clearTimeout,
				dispose: _clearTimeout
			};

			return timeout;
		}),


		/**
	  * @typesign (cb: Function, delay: uint) -> { clear: (), dispose: () };
	  */
		setInterval: function (_setInterval) {
			function setInterval(_x3, _x4) {
				return _setInterval.apply(this, arguments);
			}

			setInterval.toString = function () {
				return _setInterval.toString();
			};

			return setInterval;
		}(function (cb, delay) {
			var _this4 = this;

			var id = nextUID();

			var intervalId = setInterval(function () {
				cb.call(_this4);
			}, delay);

			var _clearInterval = function _clearInterval() {
				if (_this4._disposables[id]) {
					clearInterval(intervalId);
					delete _this4._disposables[id];
				}
			};

			var interval = this._disposables[id] = {
				clear: _clearInterval,
				dispose: _clearInterval
			};

			return interval;
		}),


		/**
	  * @typesign (cb: Function) -> { (), cancel: (), dispose: () };
	  */
		registerCallback: function registerCallback(cb) {
			var _this5 = this;

			var id = nextUID();
			var component = this;

			var cancelCallback = function cancelCallback() {
				delete _this5._disposables[id];
			};

			function wrapper() {
				if (component._disposables[id]) {
					delete component._disposables[id];
					return cb.apply(component, arguments);
				}
			}
			wrapper.cancel = cancelCallback;
			wrapper.dispose = cancelCallback;

			this._disposables[id] = wrapper;

			return wrapper;
		},


		/**
	  * @typesign () -> Rista.DisposableMixin;
	  */
		dispose: function dispose() {
			var disposables = this._disposables;

			for (var id in disposables) {
				disposables[id].dispose();
			}

			return this;
		}
	});

	module.exports = DisposableMixin;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var mixin = _require.utils.mixin;

	var ElementProtoMixin = __webpack_require__(10);

	var createObject = Object.create;
	var getPrototypeOf = Object.getPrototypeOf;
	var hasOwn = Object.prototype.hasOwnProperty;

	var inheritedStaticProperties = ['elementAttributes', 'template'];

	function registerComponent(componentClass) {
		var elementTagName = componentClass.elementTagName;

		if (!elementTagName) {
			throw new TypeError('"elementTagName" is required');
		}

		var parent = void 0;

		// Babel, в отличии от typescript-а и Component.extend-а, не копирует статические свойства при наследовании,
		// а так как парочка нам очень нужны, копируем их сами.
		inheritedStaticProperties.forEach(function (name) {
			if (!hasOwn.call(componentClass, name) && hasOwn.call(parent || (parent = getPrototypeOf(componentClass.prototype).constructor), name)) {
				componentClass[name] = parent[name];
			}
		});

		var elementProto = createObject(HTMLElement.prototype);

		mixin(elementProto, ElementProtoMixin);
		elementProto._ristaComponentConstr = componentClass;

		document.registerElement(elementTagName, { prototype: elementProto });

		return componentClass;
	}

	module.exports = registerComponent;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var nextTick = _require.utils.nextTick;


	var hasOwn = Object.prototype.hasOwnProperty;

	var ElementProtoMixin = {
		get ristaComponent() {
			return new this._ristaComponentConstr(this);
		},

		get $c() {
			return this.ristaComponent;
		},

		attachedCallback: function attachedCallback() {
			var component = this.ristaComponent;

			component._parentComponent = void 0;

			if (component.parentComponent) {
				component._elementAttached.set(true);
			} else {
				nextTick(function () {
					component._elementAttached.set(true);
				});
			}
		},
		detachedCallback: function detachedCallback() {
			var component = this.ristaComponent;
			component._parentComponent = null;
			component._elementAttached.set(false);
		},
		attributeChangedCallback: function attributeChangedCallback(name, oldValue, value) {
			var attrs = this.ristaComponent.elementAttributes;
			var privateName = '_' + name;

			if (hasOwn.call(attrs, privateName)) {
				attrs[privateName].set(value);
			}
		}
	};

	module.exports = ElementProtoMixin;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var _Symbol = _require.js.Symbol;

	var morphElement = __webpack_require__(12);

	var KEY_PREV_APPLIED_ATTRIBUTES = _Symbol('prevAppliedAttributes');

	function morphComponentElement(component, toEl, ownerComponent) {
		if (!ownerComponent) {
			ownerComponent = component;
		}

		morphElement(component.element, toEl, {
			contentOnly: true,

			getElementAttributes: function getElementAttributes(el) {
				return el[KEY_PREV_APPLIED_ATTRIBUTES] || el.attributes;
			},
			onBeforeMorphElementContent: function onBeforeMorphElementContent(el, toEl) {
				var component = el.ristaComponent;

				if (component) {
					el[KEY_PREV_APPLIED_ATTRIBUTES] = toEl.attributes;

					component.ownerComponent = ownerComponent;

					if (component.shouldElementUpdate()) {
						component.props.contentSourceElement = toEl;
						return false;
					}
				}
			}
		});
	}

	module.exports = morphComponentElement;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var specialElementHandlers = __webpack_require__(13);
	var morphElementAttributes = __webpack_require__(14);
	var defaultNamespaceURI = document.documentElement.namespaceURI;
	function defaultGetElementAttributes(el) {
	    return el.attributes;
	}
	function defaultGetElementKey(el) {
	    return el.getAttribute('key');
	}
	function defaultIsCompatibleElements(el1, el2) {
	    return el1.tagName == el2.tagName;
	}
	function morphElement(el, toEl, options) {
	    if (!options) {
	        options = {};
	    }
	    var contentOnly = !!options.contentOnly;
	    var getElementAttributes = options.getElementAttributes || defaultGetElementAttributes;
	    var getElementKey = options.getElementKey || defaultGetElementKey;
	    var isCompatibleElements = options.isCompatibleElements || defaultIsCompatibleElements;
	    var onBeforeMorphElement = options.onBeforeMorphElement;
	    var onBeforeMorphElementContent = options.onBeforeMorphElementContent;
	    var onElementRemoved = options.onElementRemoved;
	    var activeElement = document.activeElement;
	    var scrollLeft;
	    var scrollTop;
	    if (activeElement.selectionStart !== void 0) {
	        scrollLeft = activeElement.scrollLeft;
	        scrollTop = activeElement.scrollTop;
	    }
	    var storedElements = Object.create(null);
	    var someStoredElements = Object.create(null);
	    var unmatchedElements = Object.create(null);
	    var haveNewStoredElements = false;
	    var haveNewUnmatchedElements = false;
	    function storeElement(el, remove) {
	        var key = getElementKey(el);
	        if (key) {
	            var unmatchedEl = unmatchedElements[key];
	            if (unmatchedEl) {
	                delete unmatchedElements[key];
	                unmatchedEl.el.parentNode.replaceChild(el, unmatchedEl.el);
	                _morphElement(el, unmatchedEl.toEl, false);
	            }
	            else {
	                storedElements[key] = someStoredElements[key] = el;
	                haveNewStoredElements = true;
	                if (remove) {
	                    el.parentNode.removeChild(el);
	                }
	            }
	        }
	        else {
	            if (remove) {
	                el.parentNode.removeChild(el);
	            }
	            for (var child = el.firstElementChild; child; child = child.nextElementSibling) {
	                storeElement(child, false);
	            }
	            if (onElementRemoved) {
	                onElementRemoved(el);
	            }
	        }
	    }
	    function restoreElement(el) {
	        for (var child = el.firstElementChild, nextChild = void 0; child; child = nextChild) {
	            nextChild = child.nextElementSibling;
	            var key = getElementKey(child);
	            if (key) {
	                var unmatchedEl = unmatchedElements[key];
	                if (unmatchedEl) {
	                    delete unmatchedElements[key];
	                    unmatchedEl.el.parentNode.replaceChild(child, unmatchedEl.el);
	                    _morphElement(child, unmatchedEl.toEl, false);
	                }
	                else {
	                    storedElements[key] = someStoredElements[key] = child;
	                    haveNewStoredElements = true;
	                }
	            }
	            else {
	                restoreElement(child);
	            }
	        }
	    }
	    function handleRemovedElement(el) {
	        for (var child = el.firstElementChild; child; child = child.nextElementSibling) {
	            handleRemovedElement(child);
	        }
	        if (onElementRemoved) {
	            onElementRemoved(el);
	        }
	    }
	    function _morphElement(el, toEl, contentOnly) {
	        if (!contentOnly) {
	            if (onBeforeMorphElement && onBeforeMorphElement(el, toEl) === false) {
	                return;
	            }
	            morphElementAttributes(el, toEl, getElementAttributes(el));
	            if (onBeforeMorphElementContent && onBeforeMorphElementContent(el, toEl) === false) {
	                return;
	            }
	        }
	        var elTagName = el.tagName;
	        if (elTagName != 'TEXTAREA') {
	            var elChild = el.firstChild;
	            for (var toElChild = toEl.firstChild; toElChild; toElChild = toElChild.nextSibling) {
	                var toElChildType = toElChild.nodeType;
	                var toElChildKey = void 0;
	                if (toElChildType == 1) {
	                    toElChildKey = getElementKey(toElChild);
	                    if (toElChildKey) {
	                        var storedEl = storedElements[toElChildKey];
	                        if (storedEl) {
	                            delete storedElements[toElChildKey];
	                            delete someStoredElements[toElChildKey];
	                            if (elChild === storedEl) {
	                                elChild = elChild.nextSibling;
	                            }
	                            else {
	                                el.insertBefore(storedEl, elChild || null);
	                            }
	                            _morphElement(storedEl, toElChild, false);
	                            continue;
	                        }
	                    }
	                }
	                var found = false;
	                for (var nextElChild = elChild; nextElChild; nextElChild = nextElChild.nextSibling) {
	                    if (nextElChild.nodeType == toElChildType) {
	                        if (toElChildType == 1) {
	                            if (getElementKey(nextElChild) === toElChildKey &&
	                                (toElChildKey || isCompatibleElements(nextElChild, toElChild))) {
	                                found = true;
	                                _morphElement(nextElChild, toElChild, false);
	                            }
	                        }
	                        else {
	                            found = true;
	                            nextElChild.nodeValue = toElChild.nodeValue;
	                        }
	                    }
	                    if (found) {
	                        if (elChild == nextElChild) {
	                            elChild = elChild.nextSibling;
	                        }
	                        else {
	                            el.insertBefore(nextElChild, elChild);
	                        }
	                        break;
	                    }
	                }
	                if (!found) {
	                    switch (toElChildType) {
	                        case 1: {
	                            var unmatchedEl = toElChild.namespaceURI == defaultNamespaceURI ?
	                                document.createElement(toElChild.tagName) :
	                                document.createElementNS(toElChild.namespaceURI, toElChild.tagName);
	                            el.insertBefore(unmatchedEl, elChild || null);
	                            if (toElChildKey) {
	                                unmatchedElements[toElChildKey] = {
	                                    el: unmatchedEl,
	                                    toEl: toElChild
	                                };
	                                haveNewUnmatchedElements = true;
	                            }
	                            else {
	                                _morphElement(unmatchedEl, toElChild, false);
	                            }
	                            break;
	                        }
	                        case 3: {
	                            el.insertBefore(document.createTextNode(toElChild.nodeValue), elChild || null);
	                            break;
	                        }
	                        case 8: {
	                            el.insertBefore(document.createComment(toElChild.nodeValue), elChild || null);
	                            break;
	                        }
	                        default: {
	                            throw new TypeError('Unsupported node type');
	                        }
	                    }
	                }
	            }
	            for (var nextElChild = void 0; elChild; elChild = nextElChild) {
	                nextElChild = elChild.nextSibling;
	                if (elChild.nodeType == 1) {
	                    storeElement(elChild, true);
	                }
	                else {
	                    el.removeChild(elChild);
	                }
	            }
	        }
	        var specialElementHandler = specialElementHandlers[elTagName];
	        if (specialElementHandler) {
	            specialElementHandler(el, toEl);
	        }
	    }
	    _morphElement(el, toEl, contentOnly);
	    while (haveNewUnmatchedElements) {
	        while (haveNewStoredElements) {
	            haveNewStoredElements = false;
	            for (var key in someStoredElements) {
	                var storedEl = someStoredElements[key];
	                delete someStoredElements[key];
	                restoreElement(storedEl);
	            }
	        }
	        haveNewUnmatchedElements = false;
	        for (var key in unmatchedElements) {
	            var unmatchedEl = unmatchedElements[key];
	            delete unmatchedElements[key];
	            _morphElement(unmatchedEl.el, unmatchedEl.toEl, false);
	            if (haveNewUnmatchedElements) {
	                break;
	            }
	        }
	    }
	    for (var key in storedElements) {
	        handleRemovedElement(storedElements[key]);
	    }
	    if (activeElement != document.activeElement) {
	        if (scrollLeft !== void 0) {
	            activeElement.scrollLeft = scrollLeft;
	            activeElement.scrollTop = scrollTop;
	        }
	        activeElement.focus();
	    }
	}
	module.exports = morphElement;


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	var specialElementHandlers = {
	    INPUT: function (el, toEl) {
	        if (el.value != toEl.value) {
	            el.value = toEl.value;
	        }
	        el.checked = toEl.checked;
	    },
	    TEXTAREA: function (el, toEl) {
	        var value = toEl.value;
	        if (el.value != value) {
	            el.value = value;
	        }
	        if (el.firstChild) {
	            el.firstChild.nodeValue = value;
	        }
	    },
	    OPTION: function (el, toEl) {
	        el.selected = toEl.selected;
	    }
	};
	module.exports = specialElementHandlers;


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	function morphElementAttributes(el, toEl, elAttributes) {
	    var toElAttributes = toEl.attributes;
	    for (var i = 0, l = toElAttributes.length; i < l; i++) {
	        var toElAttr = toElAttributes.item(i);
	        var toElAttrNamespaceURI = toElAttr.namespaceURI;
	        var elAttr = toElAttrNamespaceURI ?
	            elAttributes.getNamedItemNS(toElAttrNamespaceURI, toElAttr.name) :
	            elAttributes.getNamedItem(toElAttr.name);
	        if (!elAttr || elAttr.value != toElAttr.value) {
	            if (toElAttrNamespaceURI) {
	                el.setAttributeNS(toElAttrNamespaceURI, toElAttr.name, toElAttr.value);
	            }
	            else {
	                el.setAttribute(toElAttr.name, toElAttr.value);
	            }
	        }
	    }
	    for (var i = elAttributes.length; i;) {
	        var elAttr = elAttributes.item(--i);
	        var elAttrNamespaceURI = elAttr.namespaceURI;
	        if (elAttrNamespaceURI) {
	            if (!toElAttributes.getNamedItemNS(elAttrNamespaceURI, elAttr.name)) {
	                el.removeAttributeNS(elAttrNamespaceURI, elAttr.name);
	            }
	        }
	        else {
	            if (!toElAttributes.getNamedItem(elAttr.name)) {
	                el.removeAttribute(elAttr.name);
	            }
	        }
	    }
	}
	module.exports = morphElementAttributes;


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	module.exports = ['click', 'dblclick', 'mousedown', 'mouseup', 'input', 'change', 'submit', 'focusin', 'focusout'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var Cell = _require.Cell;
	var _Symbol = _require.js.Symbol;
	var nextTick = _require.utils.nextTick;

	var Component = __webpack_require__(7);
	var morphComponentElement = __webpack_require__(11);

	var KEY_CONTENT_SOURCE_ELEMENT = _Symbol('contentSourceElement');

	module.exports = Component.extend('rt-content', {
		shouldElementUpdate: function shouldElementUpdate() {
			return true;
		},


		/**
	  * @override
	  */
		updateElement: function updateElement() {
			var _this = this;

			var contentSourceElement = this._contentSourceElement.get();

			morphComponentElement(this, contentSourceElement, contentSourceElement == this.props.contentSourceElement ? this.ownerComponent : this.ownerComponent.ownerComponent);

			if (this.isReady) {
				nextTick(function () {
					_this.emit('element-update');
				});
			}

			return this;
		},
		initialize: function initialize() {
			var ownerComponent = this.ownerComponent;
			var ownerComponentProperties = ownerComponent.props;
			var selector = this.element.getAttribute('select');

			var ownerComponentContentSourceElement = ownerComponent[KEY_CONTENT_SOURCE_ELEMENT] || (ownerComponent[KEY_CONTENT_SOURCE_ELEMENT] = new Cell(function () {
				return ownerComponentProperties.contentSourceElement.cloneNode(true);
			}));

			this._contentSourceElement = new Cell(selector ? function () {
				var selectedElements = ownerComponentContentSourceElement.get().querySelectorAll(selector);

				if (!selectedElements.length) {
					return this.props.contentSourceElement;
				}

				var el = document.createElement('div');

				for (var i = 0, l = selectedElements.length; i < l; i++) {
					el.appendChild(selectedElements[i]);
				}

				return el;
			} : function () {
				var contentSourceElement = ownerComponentContentSourceElement.get();

				if (!contentSourceElement.firstChild) {
					return this.props.contentSourceElement;
				}

				var el = document.createElement('div');

				for (var child; child = contentSourceElement.firstChild;) {
					el.appendChild(child);
				}

				return el;
			}, {
				owner: this,
				onChange: this._onContentSourceElementChange
			});

			this._contentSourceElementListening = true;
		},
		elementAttached: function elementAttached() {
			if (!this._contentSourceElementListening) {
				this._contentSourceElement.on('change', this._onContentSourceElementChange);
			}
		},
		elementDetached: function elementDetached() {
			this._contentSourceElement.off('change', this._onContentSourceElementChange);
			this._contentSourceElementListening = false;
		},
		_onContentSourceElementChange: function _onContentSourceElementChange() {
			this.updateElement();
		}
	});

/***/ }
/******/ ])
});
;