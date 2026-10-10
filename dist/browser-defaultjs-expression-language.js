/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js"
/*!******************!*\
  !*** ./index.js ***!
  \******************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExecuterRegistry: () => (/* reexport module object */ _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   ExpressionResolver: () => (/* reexport safe */ _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/ExpressionResolver.js */ "./src/ExpressionResolver.js");
/* harmony import */ var _src_executer_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/executer/index.js */ "./src/executer/index.js");
/* harmony import */ var _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/ExecuterRegistry.js */ "./src/ExecuterRegistry.js");







/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js"
/*!***********************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/Global.js ***!
  \***********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * The global scope of the current environment.
 *
 * Resolved once when the module is loaded: globalThis, then global, window and self for engines not
 * knowing it yet. An empty object when none of them exists, so reading from it never throws.
 *
 * @module Global
 *
 * @example
 * GLOBAL.crypto.getRandomValues(buffer);
 */
const GLOBAL = (() => {
	if(typeof globalThis !== "undefined") return globalThis;
	if(typeof globalThis !== "undefined") return globalThis;
	if(typeof window !== "undefined") return window;
	if(typeof self !== "undefined") return self;
	return {};
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GLOBAL);


/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectProperty.js"
/*!*******************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/ObjectProperty.js ***!
  \*******************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ObjectProperty)
/* harmony export */ });
/**
 * Only an object can carry a property, so a path stops at a primitive instead of handing out a
 * property that cannot be read or written. An Array, Map or Date passes - they are objects and take
 * a property like any other one, which is what makes a path like "list.0" work.
 *
 * @private
 * @param {*} value the value a step of the path resolved to
 * @param {string} name the name of that step
 * @param {string} key the whole path, to tell which one of several steps failed
 * @returns {void}
 * @throws {TypeError} when the step carries no object
 */
const assertDescendable = (value, name, key) => {
	if(value !== null && typeof value === "object")
		return;

	const type = value === null ? "null" : `a ${typeof value}`;
	throw new TypeError(`cannot descend into "${name}" of path "${key}" - ${type} is no object`);
};

/**
 * One property of an object, addressed by name, together with the object carrying it.
 *
 * Built through {@link ObjectProperty.load}, which walks a dotted path and hands back the property at
 * its end.
 *
 * @example
 * const property = ObjectProperty.load({a : {b : 1}}, "a.b");
 * property.value;      // 1
 * property.value = 2;  // writes into the object
 */
class ObjectProperty {
	/**
	 * @param {string} key name of the property
	 * @param {object} context the object carrying it
	 */
	constructor(key, context){
		this.key = key;
		this.context = context;
	}

	/**
	 * Whether the key is reachable on the context at all.
	 *
	 * This answers for the whole prototype chain, not only for own properties - load({}, "toString")
	 * reports true. That is deliberate: a path may address a prototype and extend it, so an inherited
	 * key is a key like any other here. Use hasValue to ask whether something is actually stored.
	 *
	 * @returns {boolean}
	 */
	get keyDefined(){
		return this.key in this.context;
	}
	
	/**
	 * Whether something is stored under the key. Only undefined counts as nothing - 0, "", false and
	 * null are values.
	 *
	 * @returns {boolean}
	 */
	get hasValue(){
		return typeof this.context[this.key] !== "undefined";
	}

	/**
	 * @returns {*} the stored value, undefined when there is none
	 */
	get value(){
		return this.context[this.key];
	}

	/**
	 * @param {*} data
	 */
	set value(data){
		this.context[this.key] = data;
	}

	/**
	 * Adds a value next to what is already there: writes it when the key holds nothing, turns the
	 * value into an array of both when it holds one, and pushes onto the array when it holds one
	 * already.
	 *
	 * The value itself is not looked at - appending undefined puts undefined into the array.
	 *
	 * @param {*} data
	 *
	 * @example
	 * property.append = 1;   // {key : 1}
	 * property.append = 2;   // {key : [1, 2]}
	 * property.append = 3;   // {key : [1, 2, 3]}
	 */
	set append(data) {
		if(!this.hasValue)
			this.value = data;
		else {
			const value = this.value;
			if(value instanceof Array)
				value.push(data);
			else
				this.value = [this.value, data];
		}
	}

	/**
	 * Deletes the key from the object. Does nothing when it is not there.
	 *
	 * @returns {void}
	 */
	remove(){
		delete this.context[this.key];
	}
	
	/**
	 * Loads the property a dotted path addresses. Every part of the path is trimmed, so " a . b "
	 * addresses the same property as "a.b".
	 *
	 * A missing step is created with create, otherwise the path is reported as not loadable. A step
	 * holding something that is no object cannot be walked into at all - that is a broken path, not a
	 * missing one, and it is reported as an error regardless of create.
	 *
	 * @param {object} data the object to walk
	 * @param {string} key name of the property, a dotted path addresses a nested one
	 * @param {boolean} [create=true] create a missing step on the way
	 * @returns {ObjectProperty|null} null when a step is missing and create is false
	 * @throws {TypeError} when a step of the path holds something that is no object
	 *
	 * @example
	 * ObjectProperty.load({a : {b : 1}}, "a.b").value;   // 1
	 * ObjectProperty.load({list : [1, 2]}, "list.1").value;   // 2, an array is an object
	 * ObjectProperty.load({}, "a.b", false);             // null
	 * ObjectProperty.load({a : 0}, "a.b");               // throws, 0 is no object
	 */
	static load(data, key, create=true) {
		let context = data;
		const keys = key.split(".");
		let name = keys.shift().trim();
		while(keys.length > 0){
			if(typeof context[name] === "undefined" || context[name] === null){
				if(!create)
					return null;

				context[name] = {}
			}

			assertDescendable(context[name], name, key);
			context = context[name];
			name = keys.shift().trim();
		}

		return new ObjectProperty(name, context);
	}
};

/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js"
/*!****************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   append: () => (/* binding */ append),
/* harmony export */   buildPropertyFilter: () => (/* binding */ buildPropertyFilter),
/* harmony export */   defGet: () => (/* binding */ defGet),
/* harmony export */   defGetSet: () => (/* binding */ defGetSet),
/* harmony export */   defValue: () => (/* binding */ defValue),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   equalPojo: () => (/* binding */ equalPojo),
/* harmony export */   filter: () => (/* binding */ filter),
/* harmony export */   isNullOrUndefined: () => (/* binding */ isNullOrUndefined),
/* harmony export */   isObject: () => (/* binding */ isObject),
/* harmony export */   isPojo: () => (/* binding */ isPojo),
/* harmony export */   isPrimitive: () => (/* binding */ isPrimitive),
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/* harmony import */ var _ObjectProperty_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ObjectProperty.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectProperty.js");
/**
 * Utilities to inspect, compare, merge and filter javascript objects.
 *
 * Several functions share one notion of data: primitives, simple objects, Array, Date, RegExp, Map
 * and Set. {@link isPojo} decides whether a value stays within it, {@link equalPojo} compares those
 * types by value, and {@link merge} treats everything outside of it as a value to be replaced.
 *
 * @module ObjectUtils
 */


/**
 * @private
 * @param {Array} a
 * @param {Array} b
 * @param {WeakMap} seen pairs currently under comparison
 * @returns {boolean}
 */
const equalArray = (a, b, seen) => {
	if (a.length !== b.length) return false;

	const length = a.length;
	for (let i = 0; i < length; i++) if (!internalEqualPojo(a[i], b[i], seen)) return false;

	return true;
};

/**
 * A set is unordered, so every entry of a has to find its own partner in b.
 *
 * @private
 * @param {Set} a
 * @param {Set} b
 * @param {WeakMap} seen pairs currently under comparison
 * @returns {boolean}
 */
const equalSet = (a, b, seen) => {
	if (a.size !== b.size) return false;

	const remaining = Array.from(b);
	for (const entryA of a) {
		const index = remaining.findIndex((entryB) => internalEqualPojo(entryA, entryB, seen));
		if (index < 0) return false;

		remaining.splice(index, 1);
	}

	return true;
};

/**
 * A map is unordered as well and its keys may be objects, so the keys get compared by value too.
 *
 * @private
 * @param {Map} a
 * @param {Map} b
 * @param {WeakMap} seen pairs currently under comparison
 * @returns {boolean}
 */
const equalMap = (a, b, seen) => {
	if (a.size !== b.size) return false;

	const remaining = Array.from(b);
	for (const [keyA, valueA] of a) {
		const index = remaining.findIndex(([keyB, valueB]) => internalEqualPojo(keyA, keyB, seen) && internalEqualPojo(valueA, valueB, seen));
		if (index < 0) return false;

		remaining.splice(index, 1);
	}

	return true;
};

/**
 * Compares two objects by prototype and by their own enumerable properties.
 *
 * @private
 * @param {object} a
 * @param {object} b
 * @param {WeakMap} seen pairs currently under comparison
 * @returns {boolean}
 */
const equalObject = (a, b, seen) => {
	if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

	const propertiesA = Object.keys(a);
	const propertiesB = Object.keys(b);
	if (propertiesA.length !== propertiesB.length) return false;

	for (const key of propertiesA) {
		// equal key counts alone would let {x:1, y:undefined} pass against {x:1, z:undefined}
		if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
		if (!internalEqualPojo(a[key], b[key], seen)) return false;
	}

	return true;
};

/**
 * A cyclic structure can only be decided co-inductively: a pair already under comparison counts as
 * equal, otherwise the walk would never come back.
 *
 * @private
 * @param {WeakMap} seen pairs currently under comparison
 * @param {object} a
 * @param {object} b
 * @returns {boolean} true when this pair is already being compared further up the stack
 */
const isComparing = (seen, a, b) => {
	const partners = seen.get(a);
	return !!partners && partners.has(b);
};

/**
 * Notes a pair as being compared, so a cycle running through it terminates.
 *
 * @private
 * @param {WeakMap} seen pairs currently under comparison
 * @param {object} a
 * @param {object} b
 * @returns {void}
 */
const rememberComparing = (seen, a, b) => {
	const partners = seen.get(a);
	if (partners) partners.add(b);
	else seen.set(a, new WeakSet([b]));
};

/**
 * Checks whether a value is null or undefined.
 *
 * ValueHelper.noValue answers the same question. Both are kept on purpose, so ValueHelper stays free
 * of a dependency on this module - see the note there.
 *
 * @param {*} object the value to be testing
 * @returns {boolean}
 */
const isNullOrUndefined = (object) => {
	return object == null || typeof object === "undefined";
};

/**
 * Checks whether a value is a primitive.
 *
 * null and undefined count as primitives. A symbol does not - it is treated as an opaque value
 * throughout this module, so that {@link isPojo} keeps rejecting it as data.
 *
 * @param {*} object the value to be testing
 * @returns {boolean}
 */
const isPrimitive = (object) => {
	if (object == null) return true;

	const type = typeof object;
	switch (type) {
		case "number":
		case "bigint":
		case "boolean":
		case "string":
		case "undefined":
			return true;
	}

	return false;
};

/**
 * Checks whether a value is an object.
 *
 * Every object counts, Array, Map, Date and class instances included. Use {@link isPojo} to ask for
 * a simple data object instead.
 *
 * @param {*} object the value to be testing
 * @returns {boolean}
 */
const isObject = (object) => {
	if (isNullOrUndefined(object)) return false;

	return typeof object === "object";
};

/**
 * Compares two values by value.
 *
 * The types compared by value are the ones {@link isPojo} accepts as data: primitives, simple
 * objects, Array, Date, RegExp, Map and Set. A Date is compared by its time, a RegExp by source and
 * flags. Set and Map are unordered, so their entries are matched by value instead of by position,
 * and the keys of a Map take part in that comparison.
 *
 * Simple objects and class instances need the same prototype and the same own enumerable
 * properties. Every other object - Error, Promise, WeakMap and the like - keeps its state out of
 * reach, so those compare by identity only. Functions and symbols do as well.
 *
 * Cyclic structures are supported.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 *
 * @example
 * equalPojo({a : [1, 2]}, {a : [1, 2]});               // true
 * equalPojo(new Set([1, 2]), new Set([2, 1]));         // true, a set is unordered
 * equalPojo(new Date(0), new Date(1));                 // false
 * equalPojo(new Error("x"), new Error("x"));           // false, compared by identity
 */
const equalPojo = (a, b) => internalEqualPojo(a, b, new WeakMap());


/**
* @param {*} a
 * @param {*} b
 * @param {WeakMap} seen internal, tracks the pairs currently under comparison
 * @returns {boolean}
 */
const internalEqualPojo = (a, b, seen) => {
	if (isNullOrUndefined(a) || isNullOrUndefined(b)) return a === b;
	if (a === b) return true;
	if (isPrimitive(a) || isPrimitive(b)) return a === b;

	const typeA = typeof a;
	if (typeA !== typeof b) return false;
	if (typeA !== "object") return a === b; // function and symbol

	if (isComparing(seen, a, b)) return true;
	rememberComparing(seen, a, b);

	if(a instanceof Date) return  b instanceof Date ? Object.is(a.getTime(), b.getTime()) : false;
	else if(a instanceof RegExp) return b instanceof RegExp ? (a.source === b.source && a.flags === b.flags) : false;
	else if(a instanceof Array) return b instanceof Array ? equalArray(a, b, seen) : false;
	else if(a instanceof Set) return b instanceof Set ? equalSet(a, b, seen) : false;
	else if(a instanceof Map) return b instanceof Map ? equalMap(a, b, seen) : false;
	else if (Object.prototype.toString.call(a) !== "[object Object]") return false;	
	else return equalObject(a, b, seen);
};

/**
 * A plain object owns either no prototype at all or a prototype that itself has none. Checking the
 * chain length instead of comparing against Object.prototype keeps this working across realms,
 * where an iframe brings its own Object.prototype.
 *
 * @private
 * @param {*} object
 * @returns {boolean}
 */
const isPlainObject = (object) => {
	if (object === null || typeof object !== "object") return false;
	const prototype = Object.getPrototypeOf(object);
	return prototype === null || Object.getPrototypeOf(prototype) === null;
};

/**
 * Walks a value and decides whether everything reachable from it is data.
 *
 * @private
 * @param {*} value
 * @param {WeakSet} [seen] values already walked, closes cycles
 * @returns {boolean}
 */
const isDataValue = (value, seen = new WeakSet()) => {
	if (isPrimitive(value)) return true;
	else if (value instanceof Date) return true;
	else if (value instanceof RegExp) return true;

	if (seen.has(value)) return true;
	seen.add(value);

	if (value instanceof Array) return value.every((entry) => isDataValue(entry, seen));
	else if (value instanceof Map) {
		for (const [key, entry] of value) {
			if (!isDataValue(key, seen) || !isDataValue(entry, seen)) return false;
		}
		return true;
	} else if (value instanceof Set) {
		for (const entry of value) {
			if (!isDataValue(entry, seen)) return false;
		}
		return true;
	} else if (!isPlainObject(value))
		return false; // class instances and every other exotic object
	else {
		for (const key of Object.keys(value)) {
			if (!isDataValue(value[key], seen)) return false;
		}

		return true;
	}
};

/**
 * Checks whether an object is a pure data object.
 *
 * The object itself has to be a simple object - no Array, Map or something else. Every value
 * reachable from it has to be data as well: primitives, simple objects, Array, Date, RegExp, Map or
 * Set. Functions and class instances are rejected at any depth, including inside arrays and inside
 * the keys and values of a Map or Set.
 *
 * Only own enumerable properties are inspected. Cyclic references are allowed.
 *
 * @param {*} object the object to be testing
 * @returns {boolean}
 *
 * @example
 * isPojo({a : {b : [1, new Date()]}});   // true
 * isPojo({a : () => {}});                // false, a function is no data
 * isPojo({a : [{b : new Foo()}]});       // false, rejected at any depth
 * isPojo([]);                            // false, the object itself has to be a simple one
 */
const isPojo = (object) => {
	if (isNullOrUndefined(object) || !isPlainObject(object)) return false;

	return isDataValue(object);
};

/**
 * Appends a property value to an object. If the property already holds a value, it is converted
 * into an array carrying both. An undefined value is ignored.
 *
 * The key may address a nested property by a dotted path, missing steps are created on the way.
 *
 * @param {string} aKey name of the property, a dotted path addresses a nested one
 * @param {*} aData property value
 * @param {object} aObject the object to append the property to
 * @returns {object} the changed object
 *
 * @example
 * append("a", 1, {});             // {a : 1}
 * append("a", 2, {a : 1});        // {a : [1, 2]}
 * append("a.b", 1, {});           // {a : {b : 1}}
 */
const append = (aKey, aData, aObject) => {
	if (typeof aData !== "undefined") {
		const property = _ObjectProperty_js__WEBPACK_IMPORTED_MODULE_0__["default"].load(aObject, aKey, true);
		property.append = aData;
	}
	return aObject;
};

/**
 * Own enumerable keys, strings and symbols alike - the same set Object.assign copies.
 *
 * @private
 * @param {*} source
 * @returns {Array<string|symbol>}
 */
const assignableKeys = (source) => {
	const object = Object(source);
	return Reflect.ownKeys(object).filter((key) => Object.prototype.propertyIsEnumerable.call(object, key));
};

/**
 * Merges objects into a target object - a recursive Object.assign. It steps into objects and sub
 * objects. Every other value is replaced by the value from the source object.
 *
 * Like Object.assign it copies own enumerable properties - string and symbol keys alike -, ignores
 * null and undefined sources and returns the target. Unlike Object.assign it steps into a property
 * when target and source both hold an object, instead of replacing it.
 *
 * A class instance counts as an object here and is merged property by property just like a simple
 * one. The target keeps its own prototype, only the properties of the source are applied to it - a
 * merge never turns the target into an instance of the class of the source.
 *
 * An Array, Set, Map, Date or RegExp is always replaced as a whole, never merged entry by entry.
 * That already applies when only one of both sides holds one. The result therefore carries the
 * container of the source with its own length - nothing of the target survives it, not even an
 * object sitting at the same index or under the same key.
 *
 * A key whose value is a symbol is skipped, on the target side as well as on the source side. A
 * symbol carries no data, so such a property is left untouched.
 *
 * The key __proto__ is skipped. Object.assign would only repoint the prototype of the target, but
 * merging into it would walk into Object.prototype and leak into every object.
 *
 * The target is modified in place. A sub object of a source that has no counterpart in the target is
 * taken over by reference, just like Object.assign does.
 *
 * @param {object} target the target object to merge into, a new object when falsy
 * @param {...object} sources the source objects, applied in order
 * @returns {object} the target object
 *
 * @example
 * merge({a : 1}, {b : 2});                          // {a : 1, b : 2}
 * merge({a : {x : 1}}, {a : {y : 2}});              // {a : {x : 1, y : 2}}
 * merge({a : [1, 2, 3]}, {a : [9]});                // {a : [9]}, replaced as a whole
 * merge({a : new Foo(1)}, {a : new Bar(2)});        // a stays a Foo, carrying the properties of both
 * merge({}, source1, source2, source3);
 */
const merge = (target, ...sources) => {
	if (!target) target = {};

	sources
		.filter((source) => !isNullOrUndefined(source))
		.forEach((source) => {
			const keys = assignableKeys(source);
			keys
				.filter((key) => key != "__proto__")
				.filter((key) => typeof target[key] !== "symbol")
				.filter((key) => typeof source[key] !== "symbol")
				.forEach((key) => {
					const value = source[key];
					const current = target[key];

					if(current == null ) target[key] = value;
					else if( typeof current !== typeof value ) target[key] = value;
					else if (current instanceof Array || value instanceof Array) target[key] = value;
					else if (current instanceof Set || value instanceof Set) target[key] = value;
					else if (current instanceof Map || value instanceof Map) target[key] = value;
					else if (current instanceof Date || value instanceof Date) target[key] = value;
					else if (current instanceof RegExp || value instanceof RegExp) target[key] = value;
					else if (isObject(current) && isObject(value)) merge(current, value);
					else target[key] = value;
				});
		});

	return target;
};

/**
 * Decides whether a single property is taken over by {@link filter}.
 *
 * @callback PropertyFilter
 * @param {string} name name of the property
 * @param {*} value value of the property
 * @param {object} context the object the property belongs to
 * @returns {boolean} true to keep the property
 */

/**
 * Builds a {@link PropertyFilter} accepting or rejecting a fixed list of property names.
 *
 * @param {object} options
 * @param {Array<string>} options.names the property names to decide on
 * @param {boolean} options.allowed true turns the list into an allow list, false into a deny list
 * @returns {PropertyFilter}
 *
 * @example
 * const deny = buildPropertyFilter({names : ["password"], allowed : false});
 * filter(user, deny);   // every property but password
 */
const buildPropertyFilter = ({ names, allowed }) => {
	return (name, value, context) => {
		return names.includes(name) === allowed;
	};
};

/**
 * Rebuilds an Array, Set or Map with its values filtered. A container keeps all of its entries -
 * only the values inside get filtered. The keys of a Map stay untouched, replacing them would break
 * every lookup against the result.
 *
 * @private
 * @param {Array|Set|Map} value
 * @param {PropertyFilter} propFilter
 * @param {boolean} deep
 * @param {WeakMap} copies maps an original onto its filtered copy
 * @returns {Array|Set|Map}
 */
const filterContainer = (value, propFilter, deep, copies) => {
	if (value instanceof Array) {
		const copy = [];
		copies.set(value, copy);
		for (const entry of value) copy.push(filterValue(entry, propFilter, deep, copies));

		return copy;
	}

	if (value instanceof Set) {
		const copy = new Set();
		copies.set(value, copy);
		for (const entry of value) copy.add(filterValue(entry, propFilter, deep, copies));

		return copy;
	}

	const copy = new Map();
	copies.set(value, copy);
	for (const [key, entry] of value) copy.set(key, filterValue(entry, propFilter, deep, copies));

	return copy;
};

/**
 * Filters a single value, dispatching on what it is.
 *
 * @private
 * @param {*} value
 * @param {PropertyFilter} propFilter
 * @param {boolean} deep
 * @param {WeakMap} copies maps an original onto its filtered copy
 * @returns {*} the filtered value, or the value itself when there is nothing to filter
 */
const filterValue = (value, propFilter, deep, copies) => {
	if (value === null || typeof value !== "object") return value;
	if (value instanceof Date || value instanceof RegExp) return value; // carry no properties to filter

	// a value seen before closes a cycle - its copy stands in, so nothing unfiltered leaks back in
	if (copies.has(value)) return copies.get(value);

	if (value instanceof Array || value instanceof Set || value instanceof Map) return filterContainer(value, propFilter, deep, copies);

	return filterObject(value, propFilter, deep, copies);
};

/**
 * Builds the filtered copy of an object. The copy is registered before it is filled, so a cycle
 * running back into it resolves to the copy instead of the original.
 *
 * @private
 * @param {object} data
 * @param {PropertyFilter} propFilter
 * @param {boolean} deep
 * @param {WeakMap} copies maps an original onto its filtered copy
 * @returns {object}
 */
const filterObject = (data, propFilter, deep, copies) => {
	const result = {};
	copies.set(data, result);

	for (const name in data) {
		const value = data[name];
		if (propFilter(name, value, data)){
			result[name] = deep ? filterValue(value, propFilter, deep, copies) : value;
		}
	}

	return result;
};

/**
 * Builds a new object holding the properties a filter accepts.
 *
 * The filter is called for every enumerable property, inherited ones included - filtering a window
 * relies on that, since most of its members sit on the prototype.
 *
 * With deep the filter is applied to sub objects as well. Array, Set and Map are rebuilt with their
 * values filtered, keeping all of their entries and, for a Map, its keys. Date and RegExp are taken
 * over as they are. A cyclic reference resolves to the filtered copy, so the result never carries a
 * reference into the untouched original.
 *
 * Without deep the accepted values are taken over as they are, sub objects by reference.
 *
 * @param {object} data the object to be filtered
 * @param {PropertyFilter} propFilter decides per property, see {@link buildPropertyFilter}
 * @param {object} [options]
 * @param {boolean} [options.deep=false] filter sub objects too
 * @returns {object} a new object
 *
 * @example
 * const deny = buildPropertyFilter({names : ["secret"], allowed : false});
 *
 * filter({secret : "x", a : 1}, deny);                             // {a : 1}
 * filter({sub : {secret : "x", a : 1}}, deny, {deep : true});      // {sub : {a : 1}}
 */
const filter = (data, propFilter, { deep = false } = {}) => filterObject(data, propFilter, deep, new WeakMap());

/**
 * Defines a constant, non enumerable property.
 *
 * @param {object} o the object to define the property on
 * @param {string} name name of the property
 * @param {*} value the value, neither writable nor configurable
 * @returns {void}
 */
const defValue = (o, name, value) => {
	Object.defineProperty(o, name, {
		value,
		writable: false,
		configurable: false,
		enumerable: false,
	});
};

/**
 * Defines a read only, non enumerable property backed by a getter.
 *
 * @param {object} o the object to define the property on
 * @param {string} name name of the property
 * @param {Function} get returns the value of the property
 * @returns {void}
 */
const defGet = (o, name, get) => {
	Object.defineProperty(o, name, {
		get,
		configurable: false,
		enumerable: false,
	});
};

/**
 * Defines a non enumerable property backed by a getter and a setter.
 *
 * @param {object} o the object to define the property on
 * @param {string} name name of the property
 * @param {Function} get returns the value of the property
 * @param {Function} set takes the new value of the property
 * @returns {void}
 */
const defGetSet = (o, name, get, set) => {
	Object.defineProperty(o, name, {
		get,
		set,
		configurable: false,
		enumerable: false,
	});
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	isNullOrUndefined,
	isObject,
	isPrimitive,
	equalPojo,
	isPojo,
	append,
	merge,
	filter,
	buildPropertyFilter,
	defValue,
	defGet,
	defGetSet,
});


/***/ },

/***/ "./src/CodeCache.js"
/*!**************************!*\
  !*** ./src/CodeCache.js ***!
  \**************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CodeCache)
/* harmony export */ });
/**
 * @typedef {Object} CacheEntry
 * @property {number} lastHit - Monotonic marker of the last read or write, the eviction order.
 * @property {string} key
 * @property {Function} value
 */

/**
 * @typedef {Object} CodeCacheOptions
 * @property {number} [size] - Maximum number of entries in the cache, a fraction rounded down. If set
 * to 0 or less, caching is disabled. Left out, the size stays as it is.
 */

/** The size every cache starts with. */
const START_SIZE = 5000;

/**
 * CodeCache class to manage caching of generated code snippets.
 *
 * Entries are evicted least recently used first: every hit refreshes the entry, so an
 * expression that keeps being resolved outlives one that was compiled once and dropped.
 * The marker is a counter rather than a timestamp — a burst of first-time compilations
 * falls into a single millisecond, which would leave the eviction order to chance.
 */
class CodeCache {
	/** @type {boolean} */
	#disabled = false;
	/** @type {number} */
	#size = 0;
	/** @type {number} */
	#maxSize = 0;
	/** @type {Array<CacheEntry>} */
	#entries = [];
	/** @type {Map<string,CacheEntry>} */
	#entryMap = new Map();
	/** @type {number} - Hands out the `lastHit` markers, never reset. */
	#clock = 0;


	/**
	 * Starts with a size of 5000, then applies the options.
	 *
	 * @param {CodeCacheOptions} options
	 */
	constructor(options = {}) {
		this.#resize(START_SIZE);
		this.setup(options);
	}

	/**
	 * Applies what the options carry and leaves everything else as it is. A size of 0 or less
	 * disables the cache and releases its entries, a later positive size enables it again and starts
	 * empty.
	 *
	 * @param {CodeCacheOptions} options
	 * @throws {TypeError} where the size is not a finite number
	 */
	setup({ size } = {}) {
		if (size === undefined) return;
		if (typeof size !== "number" || !Number.isFinite(size)) throw new TypeError(`The size of a code cache is a finite number, not ${String(size)}!`);

		this.#resize(Math.floor(size));
	}

	/**
	 * @param {number} aSize a whole number
	 */
	#resize(aSize) {
		this.#disabled = aSize <= 0;
		if (this.#disabled) {
			this.#size = 0;
			this.#maxSize = 0;
			this.clear();
		} else {
			this.#size = aSize;
			this.#maxSize = Math.floor(aSize * 1.1);
			this.#trim();
		}
	}

	/**
	 * Whether an entry is held under the key. A disabled cache holds none. Asking does not count as a
	 * hit, so it leaves the eviction order alone.
	 *
	 * @param {string} key
	 * @returns {boolean}
	 */
	has(key) {
		if(this.#disabled) return false;
		return this.#entryMap.has(key);
	}

	/**
	 * The code held under the key, or null where none is held or the cache is disabled. A hit
	 * refreshes the entry, so it is evicted last.
	 *
	 * @param {string} key
	 * @returns {?Function}
	 */
	get(key) {
		if(this.#disabled) return null;
		const entry = this.#entryMap.get(key);
		if (entry) {
			entry.lastHit = ++this.#clock;
			return entry.value;
		}
		return null;
	}

	/**
	 * Holds the code under the key, replacing what was held there, and refreshes the entry. Once the
	 * cache reaches a tenth past its size, the least recently used entries are evicted down to the
	 * size.
	 * A disabled cache keeps nothing.
	 *
	 * @param {string} key
	 * @param {Function} code
	 */
	set(key, code) {
		if(this.#disabled) return;
		let entry = this.#entryMap.get(key);
		if (entry) {
			entry.lastHit = ++this.#clock;
			entry.value = code;
		} else {
			entry = {
				lastHit: ++this.#clock,
				key,
				value: code,
			};
			this.#entries.push(entry);
			this.#entryMap.set(key, entry);
		}

		if (this.#entryMap.size >= this.#maxSize) this.#trim();
	}

	/**
	 * Drops every entry. The size stays as it is.
	 */
	clear() {
		this.#entries = [];
		this.#entryMap = new Map();
	}

	#trim() {
		this.#entries.sort((a, b) => b.lastHit - a.lastHit);
		if (this.#entries.length > this.#size) {
			const entriesToRemove = this.#entries.splice(this.#size);
			for (const entry of entriesToRemove) {
				this.#entryMap.delete(entry.key);
			}
		}
	}
};


/***/ },

/***/ "./src/DefaultValue.js"
/*!*****************************!*\
  !*** ./src/DefaultValue.js ***!
  \*****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DefaultValue)
/* harmony export */ });
/**
 * A default value as the resolver carries it, which tells "no default passed" apart from "the
 * default is undefined".
 *
 * @export
 * @class DefaultValue
 * @typedef {DefaultValue}
 */
class DefaultValue {
	/**
	 * Created without an argument, it carries no default; created with one, it carries that
	 * argument, undefined included.
	 *
	 * @constructor
	 * @param {*} [value]
	 */
	constructor(value){
		/** @type {boolean} whether a default was passed */
		this.hasValue = arguments.length == 1;
		/** @type {*} the default, meaningful only where hasValue is true */
		this.value = value;
	}
};


/***/ },

/***/ "./src/Executer.js"
/*!*************************!*\
  !*** ./src/Executer.js ***!
  \*************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Executer)
/* harmony export */ });
/**
 * The interface every executer implements. An executer runs statements and
 * holds no context of its own: the context always comes from the resolver.
 *
 * An own implementation is built from it by handing over the function that does the work.
 *
 * @export
 * @class Executer
 */
class Executer{

	#execution;

	/**
	 * @param {Object} option
	 * @param {function(string, object): *} option.execution runs a statement over a context and
	 * answers the result, a promise included. Without one, every execution throws.
	 */
	constructor({execution} = {}){
		this.#execution = execution || (() => {throw new Error("not implemented")});
	}

	/**
	 * Runs a statement over a context.
	 *
	 * @param {string} aStatement the statement, without delimiters and scope prefix
	 * @param {object} aContext the context of the resolver the statement is evaluated on
	 * @returns {*} what the execution answers, a promise included
	 */
	execute(aStatement, aContext){
		return this.#execution(aStatement, aContext);
	}
};


/***/ },

/***/ "./src/ExecuterRegistry.js"
/*!*********************************!*\
  !*** ./src/ExecuterRegistry.js ***!
  \*********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getExecuter: () => (/* binding */ getExecuter),
/* harmony export */   register: () => (/* binding */ register)
/* harmony export */ });
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Executer.js */ "./src/Executer.js");


const EXECUTERS = new Map();

/**
 * Keeps an executer under a name, so a resolver can be given the name instead of the instance.
 * An executer already kept under the name is replaced.
 *
 * @param {string} aName
 * @param {Executer} anExecuter
 */
const register = (aName, anExecuter) => {
	EXECUTERS.set(aName, anExecuter);
};

/**
 * The executer kept under a name. Also the default export of this module.
 *
 * @param {string} aName
 * @returns {Executer}
 * @throws {Error} where no executer is kept under the name
 */
const getExecuter = (aName) => {
	const executer = EXECUTERS.get(aName);
	if (!executer) throw new Error(`Executer "${aName}" is not registered!`);
	return executer;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getExecuter);


/***/ },

/***/ "./src/ExpressionResolver.js"
/*!***********************************!*\
  !*** ./src/ExpressionResolver.js ***!
  \***********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExpressionResolver)
/* harmony export */ });
/* harmony import */ var _default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/ObjectUtils.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js");
/* harmony import */ var _DefaultValue_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DefaultValue.js */ "./src/DefaultValue.js");
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _executer_ContextDeconstructorExecuter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./executer/ContextDeconstructorExecuter.js */ "./src/executer/ContextDeconstructorExecuter.js");
/* harmony import */ var _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ResolverContextHandle.js */ "./src/ResolverContextHandle.js");
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Executer.js */ "./src/Executer.js");
/* harmony import */ var _ExpressionScanner_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ExpressionScanner.js */ "./src/ExpressionScanner.js");
/* harmony import */ var _Utils_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Utils.js */ "./src/Utils.js");









/** @type {Executer} */
let DEFAULT_EXECUTER = _executer_ContextDeconstructorExecuter_js__WEBPACK_IMPORTED_MODULE_3__["default"];

const DEFAULT_NOT_DEFINED = new _DefaultValue_js__WEBPACK_IMPORTED_MODULE_1__["default"]();
const toDefaultValue = (value) => {
	if (value instanceof _DefaultValue_js__WEBPACK_IMPORTED_MODULE_1__["default"]) return value;

	return new _DefaultValue_js__WEBPACK_IMPORTED_MODULE_1__["default"](value);
};

let NAME_COUNTER = 0;
/**
 * The name a resolver carries where the caller passed none. Only uniqueness is promised, the shape
 * is not.
 *
 * @returns {string}
 */
const generateName = () => `ER${++NAME_COUNTER}`;

/**
 * The name a resolver keeps: the one passed, trimmed and held to the characters a scope name may
 * carry, or a generated one where none was passed.
 *
 * @param {?string} aName
 * @returns {string}
 * @throws {TypeError} where the name is no string, empty, or carries a character a scope name cannot
 * carry
 */
const toName = (aName) => {
	if (aName == null) return generateName();
	if (typeof aName !== "string") throw new TypeError(`The option name takes a string, not a ${typeof aName}!`);

	const name = (0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.trimToNull)(aName);
	if (name == null) throw new TypeError("The option name takes a name, not an empty string!");
	for (let index = 0; index < name.length; index++)
		if (!(0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.isNameCharacter)(name.charCodeAt(index))) throw new TypeError(`The name "${name}" carries a character a scope name cannot carry - only ASCII letters, digits, "-", "_" and whitespace are allowed!`);

	return name;
};

/**
 * The scope name a filter of the data methods selects, read like a scope prefix: trimmed, and null
 * where there is none.
 *
 * @param {?string} aFilter
 * @returns {?string}
 * @throws {TypeError} where the filter is no string
 */
const toScope = (aFilter) => {
	if (aFilter == null) return null;
	if (typeof aFilter !== "string") throw new TypeError(`A filter is a scope name, not a ${typeof aFilter}!`);

	return (0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.trimToNull)(aFilter);
};

/**
 * The property key a data method works with - a string, "" included, a symbol, or a number, which
 * names the same property as its string and is looked up as one.
 *
 * @param {string|number|symbol} aKey
 * @returns {string|symbol}
 * @throws {TypeError} where the key is none, or of a type no property key has
 */
const toKey = (aKey) => {
	const type = typeof aKey;
	if (type === "string" || type === "symbol") return aKey;
	if (type === "number") return String(aKey);

	throw new TypeError(`A key is a string, a number or a symbol, not ${aKey == null ? "missing" : `a ${type}`}!`);
};

const warnFailedStatement = (aStatement, anError) => {
	console.warn(`Execution error on statement!
		statement:
		${aStatement}
		error:
		${anError}
		`);
};

/**
 * @param {*} aResult
 * @param {DefaultValue} aDefault
 * @returns {*}
 */
const withDefault = (aResult, aDefault) => {
	if (aResult !== null && typeof aResult !== "undefined") return aResult;
	else if (aDefault.hasValue) return aDefault.value;
	return aResult;
};

// the first argument of a static entry point is a string, or a configuration object
const isConfiguration = (aValue) => aValue !== null && typeof aValue === "object";

// a configuration counts as passing a default where it carries the key, whatever it holds
const defaultOf = (aConfiguration) => ("defaultValue" in aConfiguration ? aConfiguration.defaultValue : DEFAULT_NOT_DEFINED);

/**
 * Resolves `${...}` expressions against a context. A resolver may have a parent, and the resolvers
 * from it up to the root form a chain: a name is looked up from this resolver towards the root, and
 * a scope prefix `${name::statement}` addresses one resolver of the chain.
 *
 * Used statically with an ad-hoc context (`resolve`, `resolveText`), or as an instance within a
 * chain.
 *
 * @export
 * @class ExpressionResolver
 * @typedef {ExpressionResolver}
 */
class ExpressionResolver {
	/**
	 * Sets the executer a resolver without a parent takes where the `executer` option is left out,
	 * and so the executer of the static entry points.
	 *
	 * @param {string|Executer} anExecuter a registered name or an `Executer` instance
	 * @throws {TypeError} where the value is neither a string nor an `Executer` instance
	 * @throws {Error} where a name is not registered
	 */
	static set defaultExecuter(anExecuter) {
		if (anExecuter instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"]) DEFAULT_EXECUTER = anExecuter;
		else if (typeof anExecuter === "string") DEFAULT_EXECUTER = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__.getExecuter)(anExecuter);
		else throw new TypeError(`ExpressionResolver.defaultExecuter takes a registered name or an Executer, not a ${typeof anExecuter}!`);
		console.info(`Changed default executer for ExpressionResolver!`);
	}

	/**
	 * The executer a resolver without a parent takes where the `executer` option is left out;
	 * `context-deconstruction-executer` until it is set.
	 *
	 * @type {Executer}
	 */
	static get defaultExecuter() {
		return DEFAULT_EXECUTER;
	}

	/** @type {string|null} */
	#name = null;
	/** @type {ExpressionResolver|null} */
	#parent = null;
	/** @type {Executer|null} */
	#executer = null;
	/** @type {object|null} */
	#context = null;
	/** @type {ResolverContextHandle|null} */
	#contextHandle = null;

	/**
	 * @constructor
	 * @param {object} [options]
	 * @param {object} [options.context] any object; where none is passed - left out, null or
	 * undefined - the resolver has no context of its own
	 * @param {ExpressionResolver} [options.parent=null]
	 * @param {?string} [options.name=null] kept trimmed; where none is passed, one is generated
	 * @param {(string|Executer)} [options.executer] the registered name of an executer, or an
	 * `Executer` instance. A name that is not registered throws; an instance needs no registration,
	 * because it addresses the executer directly. Null and undefined count as left out. Without the
	 * option the resolver takes the executer of its parent, and one without a parent
	 * `ExpressionResolver.defaultExecuter`.
	 * @throws {TypeError} where the parent is no resolver, the context a primitive, the name no
	 * string, empty, or carrying a character a scope name cannot carry, or the executer neither a
	 * string nor an `Executer` instance
	 * @throws {Error} where the executer is named and the name is not registered
	 */
	constructor({ context, parent = null, name = null, executer } = {}) {
		if (parent != null && !(parent instanceof ExpressionResolver)) throw new TypeError("The option parent takes an ExpressionResolver!");
		if (context != null && typeof context !== "object" && typeof context !== "function") throw new TypeError(`The option context takes an object, not a ${typeof context}!`);
		if (executer != null && typeof executer !== "string" && !(executer instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"])) throw new TypeError(`The option executer takes a registered name or an Executer, not a ${typeof executer}!`);
		this.#name = toName(name);

		if(executer instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"]) this.#executer =  executer;
		else if (typeof executer === "string") this.#executer = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__.getExecuter)(executer);
		else if(parent != null) this.#executer = parent.executer;
		else this.#executer = ExpressionResolver.defaultExecuter;

		this.#parent = parent;
		this.#contextHandle = new _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__["default"](context , this.#parent ? this.#parent.contextHandle : null);
		this.#context = this.#contextHandle.context;
	}

	/**
	 * The name this resolver is addressed by in a scope prefix and a filter.
	 *
	 * @readonly
	 * @type {string}
	 */
	get name() {
		return this.#name;
	}

	/**
	 * @readonly
	 * @type {ExpressionResolver|null}
	 */
	get parent() {
		return this.#parent;
	}

	/**
	 * The context of this resolver as an expression sees it. It is not the object passed to the
	 * constructor and it answers for the whole chain. Over the global object it is the global
	 * object itself.
	 *
	 * @readonly
	 * @type {object}
	 */
	get context() {
		return this.#context;
	}

	/**
	 * The executer in use, chosen once in the constructor.
	 *
	 * @readonly
	 * @type {Executer}
	 */
	get executer() {
		return this.#executer;
	}

	/**
	 * The internal handle behind the context, public for `resetCache`.
	 *
	 * @readonly
	 * @type {ResolverContextHandle}
	 */
	get contextHandle() {
		return this.#contextHandle;
	}

	/**
	 * The names of every resolver from the root down to this one, as a path - `/root/…/this`. It
	 * describes the structure and does not change.
	 *
	 * @readonly
	 * @type {string}
	 */
	get chain() {
		// a loop, not a recursion into the parent: a deep chain overflowed the stack
		let path = "";
		let resolver = this;
		while (resolver) {
			path = `/${resolver.name}${path}`;
			resolver = resolver.parent;
		}

		return path;
	}

	/**
	 * The names of the resolvers from the root down to this one that provide a context, as a path
	 * like `chain`. A resolver built without a context joins it the moment a value is set on it, so
	 * this describes a state and not the structure. Where none provides one,
	 * the answer is the empty string.
	 *
	 * @readonly
	 * @type {string}
	 */
	get effectiveChain() {
		// a loop, not a recursion into the parent: a deep chain overflowed the stack
		let path = "";
		let resolver = this;
		while (resolver) {
			if (resolver.contextHandle.providesContext) path = `/${resolver.name}${path}`;
			resolver = resolver.parent;
		}

		return path;
	}

	/**
	 * The contexts of exactly the resolvers `effectiveChain` names, as an array, this resolver's
	 * first and the root's last. A state like `effectiveChain`.
	 *
	 * @readonly
	 * @type {Array<object>}
	 */
	get contextChain() {
		const result = [];
		let resolver = this;
		while (resolver) {
			if (resolver.contextHandle.providesContext) result.push(resolver.context);

			resolver = resolver.parent;
		}

		return result;
	}

	/**
	 * The resolver a call addresses: the one the filter names, or the resolver the call was made on
	 * where no filter is given.
	 *
	 * A filter selects exactly one resolver, the nearest of that name from here towards the root, and
	 * a filter matching none throws - a wrong name in an API call is a mistake in the calling code,
	 * unlike a scope prefix inside an expression, which answers undefined.
	 *
	 * @param {?string} aScope the filter as `toScope` reads it
	 * @returns {ExpressionResolver}
	 */
	#findResolver(aScope) {
		if (!aScope) return this;

		const resolver = this.#resolverForScope(aScope);
		if (resolver) return resolver;

		throw new Error(`Filter "${aScope}" matches no resolver of the chain!`);
	}

	/**
	 * The nearest resolver from here to the root that carries the scope name, or null where none
	 * carries it. A filter and a scope prefix answer a miss differently, so each caller does that
	 * for itself.
	 *
	 * @param {string} aScope
	 * @returns {ExpressionResolver|null}
	 */
	#resolverForScope(aScope) {
		// a loop, not a recursion into the parent: one call per resolver climbed overflowed the
		// stack on a deep chain
		let resolver = this;
		while (resolver) {
			if (resolver.#name === aScope) return resolver;
			resolver = resolver.#parent;
		}

		return null;
	}

	/**
	 * Hands a statement to the resolver it addresses - the one its scope prefix names, or this one
	 * without a prefix - and answers what that resolver's executer answers, a promise included. An
	 * empty statement and a prefix no resolver of the chain carries answer undefined, and the default
	 * applies to it like to any other result.
	 *
	 * Deliberately not async: the entry point awaits the answer once, and a synchronous throw of the
	 * executer lands in its `try` all the same. An error is not caught here, because the two entry
	 * points answer it differently.
	 *
	 * @param {?string} aStatement trimmed, and null where it is empty
	 * @param {?string} aScope the scope prefix, null where there is none
	 * @returns {*}
	 */
	#execute(aStatement, aScope) {
		const resolver = aScope ? this.#resolverForScope(aScope) : this;
		// an empty statement answers undefined, the same as `return;` in JavaScript
		if (resolver === null || aStatement == null) return undefined;

		return resolver.#executer.execute(aStatement, resolver.#context);
	}

	/**
	 * The nearest resolver from here to the root that carries the key itself, or null where none
	 * carries it. What decides is whether a resolver provides the name, not what it holds.
	 *
	 * @param {string} key
	 * @returns {ExpressionResolver|null}
	 */
	#resolverForKey(key) {
		let resolver = this;
		while (resolver) {
			if (resolver.contextHandle.hasName(key)) return resolver;
			resolver = resolver.parent;
		}

		return null;
	}

	/**
	 * Reads a value along the chain, from the addressed resolver towards the root. Without a key -
	 * null or undefined - it answers the whole context of that resolver, which still sees the chain on
	 * every access.
	 *
	 * @param {?(string|number|symbol)} [key] a property key; a number is looked up as its string
	 * @param {?string} [filter] the scope name of the resolver the call addresses; without one, this
	 * resolver
	 * @returns {*} the value, or the whole context without a key
	 * @throws {TypeError} where the key is of a type no property key has, or the filter no string
	 * @throws {Error} where the filter matches no resolver of the chain
	 */
	getData(key, filter) {
		const resolver = this.#findResolver(toScope(filter));
		if (key == null) return resolver.context;

		return resolver.context[toKey(key)];
	}

	/**
	 * Sets a value, in the object the caller handed over. Without a filter the value is changed where
	 * the key lives, counting from here towards the root, and created here where no resolver carries
	 * it. With a filter the addressed resolver is the target outright.
	 *
	 * @param {string|number|symbol} key a property key; a number is looked up as its string
	 * @param {*} value
	 * @param {?string} [filter] the scope name of the resolver the call addresses
	 * @throws {TypeError} where the key is missing or of a type no property key has, the filter no
	 * string, or the object refuses the write
	 * @throws {Error} where the filter matches no resolver of the chain
	 */
	updateData(key, value, filter) {
		const property = toKey(key);
		const scope = toScope(filter);
		const resolver = this.#findResolver(scope);

		const target = scope ? resolver : this.#resolverForKey(property) || this;
		target.context[property] = value;
	}

	/**
	 * Removes the key from one resolver - the addressed one with a filter, and without one the first
	 * resolver carrying it, counting from here towards the root. Removing it uncovers the value of
	 * the next resolver that carries the same key.
	 *
	 * @param {string|number|symbol} key a property key; a number is looked up as its string
	 * @param {?string} [filter] the scope name of the resolver the call addresses
	 * @throws {TypeError} where the key is missing or of a type no property key has, the filter no
	 * string, or the object refuses the deletion
	 * @throws {Error} where the filter matches no resolver of the chain
	 */
	deleteData(key, filter) {
		const property = toKey(key);
		const scope = toScope(filter);
		const resolver = this.#findResolver(scope);

		const target = scope ? resolver : this.#resolverForKey(property);
		if (target) delete target.context[property];
	}

	/**
	 * A shallow assignment, key by key, into the context of the addressed resolver, replacing what is
	 * there and adding what is not. No search along the chain: a merged key shadows the resolvers
	 * above from here on.
	 *
	 * @param {?object} context the keys to assign; null or undefined changes nothing
	 * @param {?string} [filter] the scope name of the resolver the call addresses
	 * @throws {TypeError} where the context is a primitive, the filter no string, or the object
	 * refuses a key - the keys before it are written by then
	 * @throws {Error} where the filter matches no resolver of the chain
	 */
	mergeContext(context, filter) {
		const resolver = this.#findResolver(toScope(filter));
		if (context == null) return;
		if (typeof context !== "object" && typeof context !== "function") throw new TypeError(`mergeContext takes an object, not a ${typeof context}!`);

		resolver.contextHandle.mergeData(context);
	}

	/**
	 * Resolves one expression to its value, of whatever type the statement answers. Takes the
	 * delimited form `${...}`, a scope prefix included, or a bare statement; an input that does not
	 * both open with `${` and end with `}` is a bare statement. An error of the statement is logged
	 * and handed on, and the default never covers it.
	 *
	 * @async
	 * @param {string} aExpression
	 * @param {*} [aDefault] replaces a result of null or undefined where it is passed, undefined
	 * included
	 * @returns {Promise<*>}
	 * @throws {TypeError} where the expression is no string
	 */
	async resolve(aExpression, aDefault) {
		// a mistake in the calling code, not a failed statement - so no warning and no default
		if (typeof aExpression !== "string") throw new TypeError(`resolve takes an expression as a string, not a ${typeof aExpression}!`);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		try {
			// the delimited form or a bare statement, told apart by the scanner
			const { scope, statement } = (0,_ExpressionScanner_js__WEBPACK_IMPORTED_MODULE_6__.parseExpression)(aExpression);
			return withDefault(await this.#execute(statement, scope), defaultValue);
		} catch (e) {
			// the error is logged and handed on. resolve answers a value or says why it cannot,
			// and a default value covers a missing result, never an error.
			warnFailedStatement(aExpression, e);
			throw e;
		}
	}

	/**
	 * Replaces every expression of a text by its value and answers the text. An expression whose
	 * statement fails stands as written, a warning names it, and the rest of the text keeps rendering.
	 *
	 * @async
	 * @param {string} aText
	 * @param {*} [aDefault] replaces a result of null or undefined, per expression, where it is
	 * passed
	 * @returns {Promise<string>}
	 * @throws {TypeError} where the text is no string
	 */
	async resolveText(aText, aDefault) {
		if (typeof aText !== "string") throw new TypeError(`resolveText takes a text as a string, not a ${typeof aText}!`);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;

		const occurrences = (0,_ExpressionScanner_js__WEBPACK_IMPORTED_MODULE_6__.scan)(aText);
		if (!occurrences) return aText;

		let text = "";
		let position = 0;
		for (const occurrence of occurrences) {
			// an escaping backslash is consumed, everything else in front of the expression
			// stands as written
			text += aText.substring(position, occurrence.escaped ? occurrence.start - 1 : occurrence.start);
			position = occurrence.end;

			if (occurrence.escaped) {
				text += aText.substring(occurrence.start, occurrence.end);
			} else {
				try {
					text += withDefault(await this.#execute(occurrence.statement, occurrence.scope), defaultValue);
				} catch (e) {
					// an expression whose statement failed stands as written, and the default value
					// does not cover it. The rest of the text keeps rendering.
					warnFailedStatement(occurrence.statement, e);
					text += aText.substring(occurrence.start, occurrence.end);
				}
			}
		}

		return text + aText.substring(position);
	}

	/**
	 * Resolves one expression against an ad-hoc context, through a resolver of its own, as the instance
	 * `resolve` does.
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ expression, context, defaultValue, timeout }`, behind which every argument is ignored. A first
	 * argument that is neither a string nor an object, and a configuration without a string under
	 * `expression`, reject with a `TypeError`.
	 *
	 * @static
	 * @async
	 * @param {string|{ expression: string, context?: object, defaultValue?: *, timeout?: number }} aExpression
	 * @param {?object} [aContext]
	 * @param {*} [aDefault] replaces a result of null or undefined where it is passed
	 * @param {?number} [aTimeout] delays the start by that many milliseconds; no deadline
	 * @returns {Promise<*>}
	 * @throws {TypeError} where the arguments take neither form, or the context is a primitive
	 */
	static async resolve(aExpression, aContext, aDefault, aTimeout) {
		if (isConfiguration(arguments[0])) {
			const { expression, context, timeout } = arguments[0];
			if (typeof expression !== "string") throw new TypeError("ExpressionResolver.resolve takes a configuration carrying the expression as a string under the key expression!");
			return ExpressionResolver.resolve(expression, context, defaultOf(arguments[0]), timeout);
		}
		if (typeof aExpression !== "string") throw new TypeError("ExpressionResolver.resolve takes a string or a configuration object!");

		const resolver = new ExpressionResolver({ context: aContext });
		const defaultValue = arguments.length > 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if (typeof aTimeout === "number" && aTimeout > 0)
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(resolver.resolve(aExpression, defaultValue));
				}, aTimeout);
			});

		return resolver.resolve(aExpression, defaultValue);
	}

	/**
	 * Replaces every expression of a text against an ad-hoc context, through a resolver of its own, as
	 * the instance `resolveText` does.
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ text, context, defaultValue, timeout }`, behind which every argument is ignored. A first
	 * argument that is neither a string nor an object, and a configuration without a string under
	 * `text`, reject with a `TypeError`.
	 *
	 * @static
	 * @async
	 * @param {string|{ text: string, context?: object, defaultValue?: *, timeout?: number }} aText
	 * @param {?object} [aContext]
	 * @param {*} [aDefault] replaces a result of null or undefined, per expression, where it is
	 * passed
	 * @param {?number} [aTimeout] delays the start by that many milliseconds; no deadline
	 * @returns {Promise<string>}
	 * @throws {TypeError} where the arguments take neither form, or the context is a primitive
	 */
	static async resolveText(aText, aContext, aDefault, aTimeout) {		
		if (isConfiguration(arguments[0])) {
			const { text, context, timeout } = arguments[0];
			if (typeof text !== "string") throw new TypeError("ExpressionResolver.resolveText takes a configuration carrying the text as a string under the key text!");
			return ExpressionResolver.resolveText(text, context, defaultOf(arguments[0]), timeout);
		}
		if (typeof aText !== "string") throw new TypeError("ExpressionResolver.resolveText takes a string or a configuration object!");

		const resolver = new ExpressionResolver({ context: aContext });
		const defaultValue = arguments.length > 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if (typeof aTimeout === "number" && aTimeout > 0)
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(resolver.resolveText(aText, defaultValue));
				}, aTimeout);
			});

		return resolver.resolveText(aText, defaultValue);
	}

	/**
	 * Builds a resolver over a filtered copy of the context.
	 *
	 * The filter is applied to the context only, never to the globals, so this is a way to hand
	 * over a cleaned context and not a sandbox.
	 *
	 * `option` carries the filter's own `deep` together with the constructor options `name`,
	 * `parent` and `executer`, which are handed on as they are.
	 *
	 * @static
	 * @param {object} arg the filter arguments, plus the whole constructor option set
	 * @param {object} arg.context the object to copy; it is left untouched
	 * @param {function(string, *, object): boolean} arg.propFilter called with name, value and the
	 * object holding it for every enumerable property, inherited ones included; a property it
	 * answers false for is left out of the copy
	 * @param {object} [arg.option={ deep: true, name: null, parent: null, executer: null }]
	 * @param {boolean} [arg.option.deep=true] filters sub objects as well
	 * @param {string} [arg.option.name=null]
	 * @param {ExpressionResolver} [arg.option.parent=null]
	 * @param {(string|Executer)} [arg.option.executer=null]
	 * @returns {ExpressionResolver}
	 * @throws {TypeError} where a constructor option is of the wrong kind, as the constructor throws
	 */
	static buildFiltered({ context, propFilter, option = { deep: true, name: null, parent: null, executer: null } }) {
		const { deep = true, name, parent, executer } = option;
		context = _default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__["default"].filter(context, propFilter, {deep});
		return new ExpressionResolver({ context, name, parent, executer });
	}

	/**
	 * The former name of `buildFiltered`. It promised a security the method does not give.
	 *
	 * @deprecated use `buildFiltered`
	 * @static
	 * @param {object} arg the arguments of `buildFiltered`
	 * @returns {ExpressionResolver}
	 */
	static buildSecure(arg) {
		return ExpressionResolver.buildFiltered(arg);
	}
}



/***/ },

/***/ "./src/ExpressionScanner.js"
/*!**********************************!*\
  !*** ./src/ExpressionScanner.js ***!
  \**********************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseExpression: () => (/* binding */ parseExpression),
/* harmony export */   scan: () => (/* binding */ scan)
/* harmony export */ });
/* harmony import */ var _Utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Utils.js */ "./src/Utils.js");
/**
 * Finds the expressions of a text and takes a single expression apart. It reads where an expression
 * begins and ends, whether it is escaped, and which scope prefix it carries; evaluating a statement
 * and addressing a scope is ExpressionResolver's.
 *
 * Internal to the package: index.js does not export it.
 */



const EXPRESSION_START = "${";

// the scanner states - everything that is not code hides the braces inside it
const CODE = 0;
const SINGLE_QUOTED = 1;
const DOUBLE_QUOTED = 2;
const TEMPLATE = 3;
const REGEX = 4;
const REGEX_CLASS = 5;
const BLOCK_COMMENT = 6;
const LINE_COMMENT = 7;

// a "/" continues an expression instead of opening a regular expression when it follows one of
// these - the classic division-or-regex question, decided on the last character that is neither
// whitespace nor part of a comment
const BEFORE_DIVISION = /[a-zA-Z0-9_$)\]]/;

// the characters the scanner decides on, compared as char codes rather than as one-character strings
const BACKSLASH = 0x5c;
const DOLLAR = 0x24;
const OPEN_BRACE = 0x7b;
const CLOSE_BRACE = 0x7d;
const SINGLE_QUOTE = 0x27;
const DOUBLE_QUOTE = 0x22;
const BACKTICK = 0x60;
const SLASH = 0x2f;
const STAR = 0x2a;
const LINE_FEED = 0x0a;
const CARRIAGE_RETURN = 0x0d;
const LINE_SEPARATOR = 0x2028;
const PARAGRAPH_SEPARATOR = 0x2029;
const OPEN_BRACKET = 0x5b;
const CLOSE_BRACKET = 0x5d;
const COLON = 0x3a;

const SCOPE_SEPARATOR = "::";

/**
 * Whether the "/" at aIndex opens a regular expression literal, decided on the character before it
 * that is neither whitespace nor part of a comment.
 *
 * @param {string} aText
 * @param {number} aIndex
 * @param {?Array<number>} theComments the comments read so far as flat start and end index pairs, in
 * the order they stand; null where the expression has none
 * @returns {boolean}
 */
const slashOpensRegex = (aText, aIndex, theComments) => {
	let index = aIndex - 1;
	let comment = theComments ? theComments.length - 1 : -1;
	while (index >= 0) {
		while (index >= 0 && _Utils_js__WEBPACK_IMPORTED_MODULE_0__.WHITESPACE.test(aText[index])) index--;
		// a line comment may end in whitespace, so the walk can land inside it rather than on its end
		if (comment < 0 || index < theComments[comment - 1] || index > theComments[comment]) break;

		index = theComments[comment - 1] - 1;
		comment -= 2;
	}

	return index < 0 || !BEFORE_DIVISION.test(aText[index]);
};

/**
 * Whether a char code ends a line comment - a line terminator in the sense of ECMAScript.
 *
 * @param {number} aCode
 * @returns {boolean}
 */
const isLineTerminator = (aCode) => aCode === LINE_FEED || aCode === CARRIAGE_RETURN || aCode === LINE_SEPARATOR || aCode === PARAGRAPH_SEPARATOR;

/*
 * Two splits take the text between the delimiters apart into the scope prefix and the
 * statement - this one for a text, `splitScopeAndStatementBySeparator` behind `parseExpression` for
 * the single expression of `resolve`. They are two implementations of the one rule, each measured
 * faster for other statements: a text reads forwards, the single expression from the first "::"
 * backwards. Both have to answer every case alike.
 */

/**
 * The split of a text: reads forwards only as far as the first character a name cannot carry, which
 * for most statements is a few characters.
 *
 * @param {string} aContent the text between the delimiters
 * @returns {{ scope: ?string, statement: ?string }} both trimmed, null where empty
 */
const splitScopeAndStatementForward = (aContent) => {
	const length = aContent.length;
	let index = 0;
	while (index < length && (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.isNameCharacter)(aContent.charCodeAt(index))) index++;

	if (aContent.charCodeAt(index) !== COLON || aContent.charCodeAt(index + 1) !== COLON)
		return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent) };

	// an empty name is no name, but its separator goes with it all the same
	return { scope: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent.substring(0, index)), statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent.substring(index + 2)) };
};

/**
 * The number of backslashes standing directly in front of the index.
 *
 * @param {string} aText
 * @param {number} aIndex
 * @returns {number}
 */
const countBackslashesBefore = (aText, aIndex) => {
	let count = 0;
	while (aIndex - count > 0 && aText.charCodeAt(aIndex - count - 1) === BACKSLASH) count++;

	return count;
};

/**
 * Reads the one expression whose "${" stands at aStart, counting braces but not the ones hidden
 * inside a literal or a comment, and takes it apart into scope prefix and statement.
 *
 * Answers the occurrence `scan` hands on, `end` the index directly after the matching closing brace;
 * null where the text ends before that brace, which means there is no
 * expression here at all; and, with `end` negated, the index of another "${" met outside a literal
 * or a comment, which starts an expression of its own and abandons this one.
 *
 * @param {string} aText
 * @param {number} aStart
 * @returns {?{ start: number, end: number, escaped: boolean, scope: ?string, statement: ?string }}
 */
const readExpression = (aText, aStart) => {
	const length = aText.length;
	const stack = [CODE];
	let comments = null;
	let commentStart = 0;
	let index = aStart + 2;

	while (index < length) {
		const char = aText.charCodeAt(index);
		switch (stack[stack.length - 1]) {
			case CODE:
				if (char === OPEN_BRACE) stack.push(CODE);
				else if (char === CLOSE_BRACE) {
					stack.pop();
					if (stack.length === 0) {
						const { scope, statement } = splitScopeAndStatementForward(aText.substring(aStart + 2, index));
						return { start: aStart, end: index + 1, escaped: false, scope: scope, statement: statement };
					}
				} else if (char === SINGLE_QUOTE) stack.push(SINGLE_QUOTED);
				else if (char === DOUBLE_QUOTE) stack.push(DOUBLE_QUOTED);
				else if (char === BACKTICK) stack.push(TEMPLATE);
				else if (char === DOLLAR && aText.charCodeAt(index + 1) === OPEN_BRACE) return { start: aStart, end: -index, escaped: false, scope: null, statement: null };
				else if (char === SLASH) {
					const next = aText.charCodeAt(index + 1);
					if (next === STAR || next === SLASH) {
						stack.push(next === STAR ? BLOCK_COMMENT : LINE_COMMENT);
						commentStart = index;
						index++;
					} else if (slashOpensRegex(aText, index, comments)) stack.push(REGEX);
				}
				break;
			case BLOCK_COMMENT:
				if (char === STAR && aText.charCodeAt(index + 1) === SLASH) {
					stack.pop();
					index++;
					(comments ??= []).push(commentStart, index);
				}
				break;
			case LINE_COMMENT:
				if (isLineTerminator(char)) {
					stack.pop();
					(comments ??= []).push(commentStart, index - 1);
				}
				break;
			case SINGLE_QUOTED:
				if (char === BACKSLASH) index++;
				else if (char === SINGLE_QUOTE) stack.pop();
				break;
			case DOUBLE_QUOTED:
				if (char === BACKSLASH) index++;
				else if (char === DOUBLE_QUOTE) stack.pop();
				break;
			case TEMPLATE:
				if (char === BACKSLASH) index++;
				else if (char === BACKTICK) stack.pop();
				else if (char === DOLLAR && aText.charCodeAt(index + 1) === OPEN_BRACE) {
					stack.push(CODE);
					index++;
				}
				break;
			case REGEX:
				if (char === BACKSLASH) index++;
				else if (char === OPEN_BRACKET) stack.push(REGEX_CLASS);
				else if (char === SLASH) stack.pop();
				break;
			case REGEX_CLASS:
				if (char === BACKSLASH) index++;
				else if (char === CLOSE_BRACKET) stack.pop();
				break;
		}
		index++;
	}

	return null;
};

/**
 * Answers every expression of a text, in the order they stand, or null where the text carries
 * none. `start` is the index of the "$", `end` the index after the matching closing brace, so a
 * caller replaces by position and never touches an occurrence twice. The text between two
 * expressions is skipped by a native search for the next "${".
 *
 * @param {string} aText
 * @returns {?Array<{ start: number, end: number, escaped: boolean, scope: ?string, statement: ?string }>}
 */
const scan = (aText) => {
	let occurrences = null;
	let start = aText.indexOf(EXPRESSION_START);

	while (start >= 0) {
		// an odd run of backslashes escapes the delimiter itself. It opens nothing, so only
		// those two characters are taken out of the text and the scan carries on behind them -
		// what would have been the statement is ordinary text and may hold expressions of its own.
		if (countBackslashesBefore(aText, start) % 2 === 1) {
			if (!occurrences) occurrences = [];
			occurrences.push({ start: start, end: start + 2, escaped: true, scope: null, statement: null });
			start = aText.indexOf(EXPRESSION_START, start + 2);
			continue;
		}

		const occurrence = readExpression(aText, start);
		// no matching brace: the text stands as written, and nothing behind it can be an
		// expression either - a "${" outside a literal or a comment would have restarted the scan instead
		if (!occurrence) break;
		if (occurrence.end < 0) {
			start = -occurrence.end;
			continue;
		}

		if (!occurrences) occurrences = [];
		occurrences.push(occurrence);
		start = aText.indexOf(EXPRESSION_START, occurrence.end);
	}

	return occurrences;
};

/**
 * Takes the one expression `resolve` is handed apart.
 *
 * Which form is in hand is decided by the two ends of the trimmed input: an input that opens with
 * "${" and ends with "}" is the delimited form, anything else is a bare statement. The whole input
 * is one expression, so its end is the end of the input. Escaping a delimiter does not apply here -
 * it is a rule of the text form, and there is no surrounding text, so a backslash belongs to the
 * statement.
 *
 * @param {string} aExpression
 * @returns {{ scope: ?string, statement: ?string }}
 */
const parseExpression = (aExpression) => {
	aExpression = aExpression.trim();

	if (aExpression.startsWith(EXPRESSION_START) && aExpression.endsWith("}"))
		return splitScopeAndStatementBySeparator(aExpression.substring(2, aExpression.length - 1));

	// anything else is a statement in full, and carries no scope prefix
	return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aExpression) };
};

/**
 * The split of the single expression: most statements carry no "::" at all and are done after one
 * native search. Where one stands, everything before the first of them has to be a name, checked
 * backwards from it: a "::" inside a statement - a quoted one - usually has a character no name
 * carries right in front of it.
 *
 * @param {string} aContent the text between the delimiters
 * @returns {{ scope: ?string, statement: ?string }} both trimmed, null where empty
 */
const splitScopeAndStatementBySeparator = (aContent) => {
	const end = aContent.indexOf(SCOPE_SEPARATOR);
	if (end < 0) return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent) };

	for (let index = end - 1; index >= 0; index--)
		if (!(0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.isNameCharacter)(aContent.charCodeAt(index))) return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent) };

	return { scope: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent.substring(0, end)), statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent.substring(end + 2)) };
};


/***/ },

/***/ "./src/ResolverContextHandle.js"
/*!**************************************!*\
  !*** ./src/ResolverContextHandle.js ***!
  \**************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ResolverContextHandle)
/* harmony export */ });
/* harmony import */ var _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");
/* harmony import */ var _default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/ObjectUtils.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js");



/**
 * The descriptor a property has where it is defined - own or anywhere up the prototype chain of
 * the object holding it.
 *
 * @param {object} data
 * @param {string|symbol} property
 * @returns {PropertyDescriptor|null}
 */
const findPropertyDescriptor = (data, property) => {
	let type = data;
	while (!(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(type)) {
		const descriptor = Reflect.getOwnPropertyDescriptor(type, property);
		if (descriptor) return descriptor;
		type = Reflect.getPrototypeOf(type);
	}

	return null;
};

/**
 * The names a handle provides, each mapped to the handle providing it: a Map, or the stand-in of
 * `createGlobalNameCache` over the global object, which answers the same calls.
 *
 * @typedef {Map<string|symbol,ResolverContextHandle>} NameCache
 */

/**
 * Name cache for a context that is the global object itself.
 *
 * It answers like the Map it replaces: every name is present, and the value is the handle
 * holding it - never the value of the property. That is the contract of #findHandle,
 * whose caller reads the property off the handle it gets back.
 *
 * Because every name is present, such a resolver answers every lookup that reaches it, and no
 * handle nearer the root is reached. It lists no name of its own, so the ownKeys trap of a handle
 * further from the root reports none of the global object's.
 *
 * @param {ResolverContextHandle} handle
 * @returns {NameCache}
 */
const createGlobalNameCache = (handle) => {
	return {
		has: (property) => {
			return true;
		},
		get: (property) => {
			return handle;
		},
		set: (property, value) => {
			return false;
		},
		delete: (property) => {
			return false;
		},
		keys: () => {
			// No name of its own. `has` already answers every lookup, so a name of the global object
			// is found from anywhere below; listing it as well would only hand it to an executer that
			// turns a name into code, which then fails over names it never needed - the index "0" of
			// a frame, a symbol another library planted. A statement reaches a global through the
			// ordinary scope chain anyway.
			return [];
		},
	};
};

/**
 * What stands behind the context of one resolver: the object handed to it, the handle of its parent,
 * and the name cache that tells which names this resolver provides. It hands out the context an
 * expression sees, a proxy that answers for the whole chain.
 *
 * Internal to the package: index.js does not export it.
 *
 * @export
 * @class ResolverContextHandle
 */
class ResolverContextHandle {
	/** @type {object|null} */
	#context = null;
	/** @type {ResolverContextHandle|null} */
	#parent = null;
	/** @type {object|null} */
	#data = null;
	/** @type {NameCache|null} */
	#cache = null;
	/** @type {boolean} */
	#providesContext = false;

	/**
	 * @constructor
	 * @param {?object} context the object the caller handed over, kept rather than copied. Where none
	 * is passed, the handle holds no object at all and carries no name, not even one of
	 * Object.prototype. It gets an object on the first write.
	 * @param {?ResolverContextHandle} parent the handle of the parent resolver
	 */
	constructor(context, parent) {
		this.#data = (0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(context) ? null : context;
		this.#parent = parent ? parent : null;
		this.#providesContext = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(context);

		this.#cache = this.#buildNameCache();

		if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"] === this.#data)
			this.#context = this.#data;
		else {
			// The proxy answers for the whole chain, which is more than the object handed to this
			// resolver holds. A proxy may not speak that freely for a target that guarantees
			// anything about its own keys - a frozen or sealed context is where that ends in a
			// TypeError - so it gets an empty target of its own. No trap reads it; every one of
			// them works on #data and #cache.
			this.#context = new Proxy({}, {
				has: (data, property) => {
					//console.log("has property:", property);
					return this.#findHandle(property) != null;
				},
				get: (data, property) => {
					//console.log("get property:", property);
					const handle = this.#findHandle(property);
					return handle ? handle.#data[property] : undefined;
				},
				set: (data, property, value) => {
					//console.log("set property:", property, "=", value);
					this.#data ??= {};
					this.#data[property] = value;
					this.#cache.set(property, this);
					this.#providesContext = true;
					return true;
				},
				deleteProperty: (data, property) => {
					const handle = this.#cache.get(property);
					if (handle) {
						delete this.#data[property];
						this.#cache.delete(property);
					}
					return true;
				},
				getOwnPropertyDescriptor: (data, property) => {
					const handle = this.#findHandle(property);
					if (!handle) return undefined;

					// Read through a getter rather than up front, so enumerating a context does not
					// evaluate what nobody asked for, and so a value stays live. Enumerability
					// is taken from where the property is defined - that is what keeps the members
					// of Object.prototype out of Object.keys - while configurable has to be true:
					// a proxy may not claim a fixed property its target does not have.
					const descriptor = findPropertyDescriptor(handle.#data, property);
					return {
						get: () => handle.#data[property],
						enumerable: descriptor ? descriptor.enumerable : true,
						configurable: true
					};
				},
				ownKeys: (data) => {
					//console.log("ownKeys");
					const result = new Set();
					let handle = this;
					while (handle) {
						// a handle without an object carries no name - its empty cache is passed by
						if (handle.#data !== null) {
							for (let key of handle.#cache.keys()) {
								result.add(key);
							}
						}
						handle = handle.#parent;
					}
					return Array.from(result);
				},
			});
		}
	}

	/**
	 * The context an expression sees: a proxy that answers for the whole chain, or over the global
	 * object the global object itself.
	 *
	 * @readonly
	 * @type {object}
	 */
	get context() {
		return this.#context;
	}

	/**
	 * @readonly
	 * @type {ResolverContextHandle|null}
	 */
	get parent() {
		return this.#parent;
	}

	/**
	 * Whether this handle provides the name itself. Every name of its own context counts, the ones
	 * inherited through the prototype chain included; a handle over the global object
	 * provides every name.
	 *
	 * @param {string|symbol} key
	 * @returns {boolean}
	 */
	hasName(key) {
		return this.#cache.has(key);
	}

	/**
	 * Whether this handle provides a context: one was handed to the constructor, or a value has been
	 * written since. What the data holds decides nothing.
	 *
	 * @readonly
	 * @type {boolean}
	 */
	get providesContext() {
		return this.#providesContext;
	}

	/**
	 * Replaces the object this handle holds, and with it the names it provides.
	 *
	 * @param {?object} data the new object; null or undefined leaves the handle without one
	 */
	replaceData(data) {
		this.#data = (0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data) ? null : data;
		this.#providesContext = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data);
		this.#cache = this.#buildNameCache();
	}

	/**
	 * Assigns the keys of an object into the one this handle holds, key by key, creating that object
	 * where there is none.
	 *
	 * @param {object} data
	 * @throws {TypeError} where the object held refuses a key - the keys before it are written by then
	 */
	mergeData(data) {
		this.#data ??= {};
		Object.assign(this.#data, data);
		this.#providesContext = true;
		this.#cache = this.#buildNameCache();
	}

	/**
	 * Takes up the keys added to the handed-in object since the handle was built, which are not
	 * provided until then.
	 */
	resetCache() {
		this.#cache = this.#buildNameCache();
	}

	/**
	 * A new name cache for the object this handle holds: every key it carries, its prototype chain
	 * included, each mapped to this handle. Over the global object the stand-in of
	 * `createGlobalNameCache`, which provides every name.
	 *
	 * @returns {NameCache}
	 */
	#buildNameCache() {
		const data = this.#data;
		if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"] === data) 
			return createGlobalNameCache(this);

		// every key JavaScript says the object carries, nothing filtered - which of them an executer
		// can put into its code is the executer's business
		const cache = new Map();
		let type = data;
		while (!(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(type)) {
			for (let name of Reflect.ownKeys(type)) cache.set(name, this);
			type = Reflect.getPrototypeOf(type);
		}

		return cache;
	}

	/**
	 * The nearest handle from this one to the root that provides the name, or null where none does.
	 *
	 * @param {string|symbol} property
	 * @returns {ResolverContextHandle|null}
	 */
	#findHandle(property) {
		// A handle without an object carries no name, so it is passed by without asking its cache -
		// most resolvers of a chain are built without a context.
		let handle = this;
		while (handle) {
			if (handle.#data !== null && handle.#cache.has(property)) return handle.#cache.get(property);
			handle = handle.#parent;
		}
		return null;
	}
}


/***/ },

/***/ "./src/Utils.js"
/*!**********************!*\
  !*** ./src/Utils.js ***!
  \**********************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WHITESPACE: () => (/* binding */ WHITESPACE),
/* harmony export */   isNameCharacter: () => (/* binding */ isNameCharacter),
/* harmony export */   stringToHashcode: () => (/* binding */ stringToHashcode),
/* harmony export */   trimToNull: () => (/* binding */ trimToNull)
/* harmony export */ });
/**
 * The helpers more than one component uses. Internal to the package: index.js does not export
 * them.
 */

/** Whitespace in the sense of `\s`. */
const WHITESPACE = /\s/;

/**
 * Whether a character may stand in a scope name: an ASCII letter, a digit,
 * "-", "_", or whitespace in the sense of `\s`, which past ASCII is left to the regular expression.
 *
 * @param {number} aCode the char code
 * @returns {boolean}
 */
const isNameCharacter = (aCode) => {
	if (aCode < 0x80)
		return (
			(aCode >= 0x61 && aCode <= 0x7a) ||
			(aCode >= 0x41 && aCode <= 0x5a) ||
			(aCode >= 0x30 && aCode <= 0x39) ||
			aCode === 0x2d ||
			aCode === 0x5f ||
			aCode === 0x20 ||
			(aCode >= 0x09 && aCode <= 0x0d)
		);

	return WHITESPACE.test(String.fromCharCode(aCode));
};

/**
 * Trims a string, and answers null for one that is empty after trimming, and for none.
 *
 * @param {?string} value
 * @returns {?string}
 */
const trimToNull = (value) => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

/**
 * A 32 bit hash of a string, in the manner of Java's `String.hashCode`.
 *
 * @param {string} aString
 * @returns {number}
 */
const stringToHashcode = (aString) => {
	let hash = 0;
	if (aString.length == 0) return hash;
	const length = aString.length;
	for (let i = 0; i < length; i++) {
		const char = aString.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};


/***/ },

/***/ "./src/executer/ContextDeconstructorExecuter.js"
/*!******************************************************!*\
  !*** ./src/executer/ContextDeconstructorExecuter.js ***!
  \******************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXECUTERNAME: () => (/* binding */ EXECUTERNAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   setDebug: () => (/* binding */ setDebug),
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Executer.js */ "./src/Executer.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");
/* harmony import */ var _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");





let DEBUG = false;
/** The name this executer is registered under, and the default executer. */
const EXECUTERNAME = "context-deconstruction-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();


/**
 * How many names a context may carry before this executer says that binding them all costs. Every
 * ordinary object brings seven of them along from `Object.prototype`, so the number counts a good
 * many own keys before it is reached.
 */
const HIGH_PROPERTY_COUNT = 25;

/**
 * The names that made the generated function fail to compile, asked of JavaScript itself rather
 * than of a list kept here: a name is usable when it can stand in a destructuring pattern.
 *
 * Only ever called on the failure path, so the cost of compiling one pattern per name is paid by a
 * context that is broken for this executer anyway.
 *
 * @param {Array<string|symbol>} theNames
 * @returns {Array<string>}
 */
const unusableNames = (theNames) =>
	theNames
		.filter((name) => {
			if (typeof name === "symbol") return true;
			try {
				new Function(`{${name}}`, "");
				return false;
			} catch (e) {
				return true;
			}
		})
		.map(String);

/**
 * Switches the logging of every function this executer generates to the console.
 *
 * @param {boolean} value
 */
const setDebug = (value) => {
	DEBUG = value;
};

/**
 * Configures the code cache of this executer. `size` is the only option
 * today; an option left out changes nothing.
 *
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 * @throws {TypeError} where the size is not a finite number
 */
const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

const getPropertyNames = (aContext) => {
	if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_3__["default"] === aContext) return [];
	return Reflect.ownKeys(aContext);
};

const getOrCreateFunction = (aStatement, contextProperties) => {
	// A symbol has to be written out rather than joined - `join` alone raises a TypeError that says
	// nothing about the context it came from. Written out it reaches the pattern, where it fails to
	// compile like any other name that is no identifier, and generate() names it.
	const propertyNames = contextProperties.map(String).join(",");
	const cacheKey = `${aStatement.length}::${propertyNames}::${aStatement}`;
	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement, propertyNames, contextProperties);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 * The generated function destructures the context in its parameter list and runs the statement over
 * the local bindings that produces.
 *
 * **Nothing is carried back.** A statement that assigns to a context name writes into a local
 * binding, and that binding is gone when the function returns - so a write is not readable
 * afterwards, which the resolver leaves to each executer. That is a decision rather than a gap: the
 * write-back this executer carried between 2026-09-07 and 2026-09-20 cost a factor of eleven on a
 * cache miss, because it needs every context name declared in the body instead of listed in the
 * parameter list. Speed is what this executer is for, and a consumer who needs a write to persist
 * picks `context-object-executer`.
 *
 * What still reaches the context is a **mutation**: `holder.name = "after"` changes an object the
 * binding and the context both point at, and needs nothing carried back.
 *
 * The context is destructured in the parameter list rather than declared in the body so that the
 * generated source stays one line per statement instead of one line per context name - `new Function`
 * parses that source on every cache miss, and its length is what the miss costs. It also declares no
 * name of its own: the statement can therefore never collide with a binding of this function, which
 * is what the random suffix removed on 2026-09-20 used to guard.
 *
 * **Nothing is filtered out of the pattern.** Every name the context carries is bound, a name that
 * cannot be a variable included - a key like `test-test`, a reserved word, a symbol, the index of an
 * array. Such a context cannot be run over by this executer at all, and dropping the name silently
 * would hide a property the caller defined. What this executer owes the caller instead is a message
 * that says which statement failed and which name did it, because the statement itself need not
 * mention that name.
 *
 * @param {string} aStatement
 * @param {string} thePropertyNameString the context names, comma separated, as the destructuring
 *                 pattern spells them
 * @param {Array<string|symbol>} theNames the same names unwritten, for the error message
 * @returns {Function}
 */
const generate = (aStatement, thePropertyNameString, theNames) => {
	// Only here, and therefore once per context shape and statement rather than on every execution:
	// a console write in a browser costs more than a resolution does, and warning per execution cost
	// this executer a factor of four to twenty-five (measured 2026-09-22, `npm run bench`).
	if (theNames.length > HIGH_PROPERTY_COUNT)
		console.warn(
			`High count of properties at first level, can be decrease the performence! count: ${theNames.length}`,
		);

	const code = `
return (async ({${thePropertyNameString}}) => {
    try{
       return ${aStatement}
    }catch(e){
        throw e;
    }
})(arguments[0] || {});`;

	if (DEBUG) console.log("genererated code: \n", code);

	try {
		return new Function(code);
	} catch (e) {
		// only a syntax error can come from a name. Anything else - the EvalError of a Content Security
		// Policy without 'unsafe-eval' among them - is handed on: asking about the names would be
		// refused as well, and every name would be blamed
		if (!(e instanceof SyntaxError)) throw e;

		const unusable = unusableNames(theNames);
		// nothing wrong with the names: the statement itself does not compile, and that error says
		// more than anything this executer could add
		if (unusable.length === 0) throw e;

		throw new SyntaxError(
			`Context property ${unusable.length === 1 ? "name" : "names"} "${unusable.join('", "')}" cannot be used as a variable by ${EXECUTERNAME}, so this statement cannot run over this context! statement: ${aStatement}`,
			{ cause: e },
		);
	}
};

/**
 * The executer: destructures the context into the parameters of a generated function, so a
 * statement addresses a context value by its bare name - see `README.md`.
 * Registered under `EXECUTERNAME` on import.
 *
 * @type {Executer}
 */
const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
	execution: (aStatement, aContext) => {
		const propertyNames = getPropertyNames(aContext);
		const expression = getOrCreateFunction(aStatement, propertyNames);
		return expression(aContext);
	},
});

(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.register)(EXECUTERNAME, EXECUTER);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EXECUTER);


/***/ },

/***/ "./src/executer/ContextObjectExecuter.js"
/*!***********************************************!*\
  !*** ./src/executer/ContextObjectExecuter.js ***!
  \***********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXECUTERNAME: () => (/* binding */ EXECUTERNAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getContextVar: () => (/* binding */ getContextVar),
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Executer.js */ "./src/Executer.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");




/** The name this executer is registered under. */
const EXECUTERNAME = "context-object-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();
/** The name a statement addresses the context by. */
let CONTEXT_VAR = "ctx";

/**
 * Configures this executer: the size of its code cache and the name a statement addresses the
 * context by. An option left out changes nothing.
 *
 * @param {object} [options]
 * @param {number} [options.size] the size of the code cache, as `CodeCacheOptions` describes it in
 * `CodeCache.js`
 * @param {string} [options.contextVar] the name a statement addresses the context by, `ctx` until it
 * is set. It holds for every statement this executer runs from then on, whichever resolver hands it
 * over. Null, undefined and a string that is empty after trimming leave the name as it is. A name
 * that cannot be a parameter name is not rejected here: every statement then throws a `SyntaxError`.
 * @throws {TypeError} where the size is not a finite number, or the name is neither a string nor
 * null or undefined
 */
const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
	CONTEXT_VAR = options?.contextVar == null || options?.contextVar.trim().length === 0 ? CONTEXT_VAR : options?.contextVar;
};

/**
 * The name a statement addresses the context by: `ctx`, or the one `setupExecuter` set last.
 *
 * @returns {string}
 */
const getContextVar = () => CONTEXT_VAR;

/**
 * Compiles a statement into a function that hands the context over under the name a statement
 * addresses it by.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate = (aStatement) => {
	const code = `
return (async (${CONTEXT_VAR}) => {
    try{
        return ${aStatement}
    }catch(e){
        throw e;
    }
})(arguments[0] || {});`;

	//console.log("code", code);

	return new Function(code);
};

/**
 * The compiled function for a statement, from the cache or compiled now and cached.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const getOrCreateFunction = (aStatement) => {
	const cacheKey = `${CONTEXT_VAR}::${aStatement}`;

	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 * The executer: hands the context over as one object named `ctx`, or the name `setupExecuter` sets,
 * so a statement addresses a context value as `ctx.value` - see `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @type {Executer}
 */
const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
	execution: (aStatement, aContext) => {
		const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
	},
});

(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.register)(EXECUTERNAME, EXECUTER);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EXECUTER);


/***/ },

/***/ "./src/executer/WithScopedExecuter.js"
/*!********************************************!*\
  !*** ./src/executer/WithScopedExecuter.js ***!
  \********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXECUTERNAME: () => (/* binding */ EXECUTERNAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Executer.js */ "./src/Executer.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");




/** The name this executer is registered under. */
const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

/**
 * Configures the code cache of this executer. `size` is the only option
 * today; an option left out changes nothing.
 *
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 * @throws {TypeError} where the size is not a finite number
 */
const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

let initialCall = true;

/**
 * Compiles a statement into a function that runs it inside a `with` block over the context.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate = (aStatement) => {
	const code = `
	return (async function (){
		with(arguments[0] || {}){
			try{
				return ${aStatement}
			}catch(e){
				throw e;
			}
		}
	})(arguments[0] || {});
`;
	//console.log("code", code);

	return new Function(code);
};

/**
 * The compiled function for a statement, from the cache or compiled now and cached.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const getOrCreateFunction = (aStatement) => {
	if (EXPRESSION_CACHE.has(aStatement)) {
		return EXPRESSION_CACHE.get(aStatement);
	}
	const expression = generate(aStatement);
	EXPRESSION_CACHE.set(aStatement, expression);
	return expression;
};

/**
 * The executer: runs a statement inside a `with` block over the context, so a statement addresses a
 * context value by its bare name - see `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @deprecated because `with` is; announces it on the first statement it runs
 * @type {Executer}
 */
const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
	execution: (aStatement, aContext) => {
		if (initialCall) {
			initialCall = false;
			console.warn(
				new Error(`With Scoped expression execution is marked as deprecated.`),
			);
		}

		const expression = getOrCreateFunction(aStatement);
		return expression(aContext);
	},
});
(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.register)(EXECUTERNAME, EXECUTER);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EXECUTER);


/***/ },

/***/ "./src/executer/index.js"
/*!*******************************!*\
  !*** ./src/executer/index.js ***!
  \*******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _WithScopedExecuter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WithScopedExecuter.js */ "./src/executer/WithScopedExecuter.js");
/* harmony import */ var _ContextObjectExecuter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ContextObjectExecuter.js */ "./src/executer/ContextObjectExecuter.js");
/* harmony import */ var _ContextDeconstructorExecuter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ContextDeconstructorExecuter.js */ "./src/executer/ContextDeconstructorExecuter.js");





/***/ },

/***/ "./src/version.js"
/*!************************!*\
  !*** ./src/version.js ***!
  \************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VERSION: () => (/* binding */ VERSION),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * The version of this package.
 *
 * Generated from package.json by scripts/generate-version.js before every build. Do not edit -
 * the next build overwrites it.
 *
 * @module version
 */
const VERSION = "3.0.0";

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VERSION);


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./browser.js ***!
  \********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExecuterRegistry: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.ExecuterRegistry),
/* harmony export */   ExpressionResolver: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_0__.ExpressionResolver)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ "./index.js");
/* harmony import */ var _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");
/* harmony import */ var _src_version_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/version.js */ "./src/version.js");




_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs = _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs || {};
_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs.el = _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs.el || {
	VERSION: _src_version_js__WEBPACK_IMPORTED_MODULE_2__.VERSION,
	ExpressionResolver: _index_js__WEBPACK_IMPORTED_MODULE_0__.ExpressionResolver,
	ExecuterRegistry: _index_js__WEBPACK_IMPORTED_MODULE_0__.ExecuterRegistry
};



})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7OztBQ0poRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBTSx5QkFBeUIsVUFBTTtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVELGlFQUFlLE1BQU0sRUFBQzs7Ozs7Ozs7Ozs7Ozs7O0FDbkJ0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYixZQUFZLFdBQVc7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxhQUFhO0FBQzFELDZDQUE2QyxLQUFLLGFBQWEsSUFBSSxNQUFNLE1BQU07QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwwQkFBMEI7QUFDNUM7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLEtBQUssT0FBTztBQUNyRCx3QkFBd0I7QUFDeEIsd0JBQXdCO0FBQ3hCO0FBQ2U7QUFDZjtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUZBQXFGO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxHQUFHO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksR0FBRztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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dXJjZXMiOlsid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFByb3BlcnR5LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0NvZGVDYWNoZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9EZWZhdWx0VmFsdWUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXJSZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhwcmVzc2lvblNjYW5uZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL1V0aWxzLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvQ29udGV4dE9iamVjdEV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL1dpdGhTY29wZWRFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy92ZXJzaW9uLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9icm93c2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHByZXNzaW9uUmVzb2x2ZXIgZnJvbSBcIi4vc3JjL0V4cHJlc3Npb25SZXNvbHZlci5qc1wiO1xuaW1wb3J0IFwiLi9zcmMvZXhlY3V0ZXIvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIEV4ZWN1dGVyUmVnaXN0cnkgZnJvbSBcIi4vc3JjL0V4ZWN1dGVyUmVnaXN0cnkuanNcIlxuXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcbiIsIi8qKlxuICogVGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC5cbiAqXG4gKiBSZXNvbHZlZCBvbmNlIHdoZW4gdGhlIG1vZHVsZSBpcyBsb2FkZWQ6IGdsb2JhbFRoaXMsIHRoZW4gZ2xvYmFsLCB3aW5kb3cgYW5kIHNlbGYgZm9yIGVuZ2luZXMgbm90XG4gKiBrbm93aW5nIGl0IHlldC4gQW4gZW1wdHkgb2JqZWN0IHdoZW4gbm9uZSBvZiB0aGVtIGV4aXN0cywgc28gcmVhZGluZyBmcm9tIGl0IG5ldmVyIHRocm93cy5cbiAqXG4gKiBAbW9kdWxlIEdsb2JhbFxuICpcbiAqIEBleGFtcGxlXG4gKiBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWZmZXIpO1xuICovXG5jb25zdCBHTE9CQUwgPSAoKCkgPT4ge1xuXHRpZih0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdGlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBnbG9iYWw7XG5cdGlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiB3aW5kb3c7XG5cdGlmKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gc2VsZjtcblx0cmV0dXJuIHt9O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgR0xPQkFMO1xuIiwiLyoqXHJcbiAqIE9ubHkgYW4gb2JqZWN0IGNhbiBjYXJyeSBhIHByb3BlcnR5LCBzbyBhIHBhdGggc3RvcHMgYXQgYSBwcmltaXRpdmUgaW5zdGVhZCBvZiBoYW5kaW5nIG91dCBhXHJcbiAqIHByb3BlcnR5IHRoYXQgY2Fubm90IGJlIHJlYWQgb3Igd3JpdHRlbi4gQW4gQXJyYXksIE1hcCBvciBEYXRlIHBhc3NlcyAtIHRoZXkgYXJlIG9iamVjdHMgYW5kIHRha2VcclxuICogYSBwcm9wZXJ0eSBsaWtlIGFueSBvdGhlciBvbmUsIHdoaWNoIGlzIHdoYXQgbWFrZXMgYSBwYXRoIGxpa2UgXCJsaXN0LjBcIiB3b3JrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHRoZSB2YWx1ZSBhIHN0ZXAgb2YgdGhlIHBhdGggcmVzb2x2ZWQgdG9cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhhdCBzdGVwXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgdGhlIHdob2xlIHBhdGgsIHRvIHRlbGwgd2hpY2ggb25lIG9mIHNldmVyYWwgc3RlcHMgZmFpbGVkXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gdGhlIHN0ZXAgY2FycmllcyBubyBvYmplY3RcclxuICovXHJcbmNvbnN0IGFzc2VydERlc2NlbmRhYmxlID0gKHZhbHVlLCBuYW1lLCBrZXkpID0+IHtcclxuXHRpZih2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpXHJcblx0XHRyZXR1cm47XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB2YWx1ZSA9PT0gbnVsbCA/IFwibnVsbFwiIDogYGEgJHt0eXBlb2YgdmFsdWV9YDtcclxuXHR0aHJvdyBuZXcgVHlwZUVycm9yKGBjYW5ub3QgZGVzY2VuZCBpbnRvIFwiJHtuYW1lfVwiIG9mIHBhdGggXCIke2tleX1cIiAtICR7dHlwZX0gaXMgbm8gb2JqZWN0YCk7XHJcbn07XHJcblxyXG4vKipcclxuICogT25lIHByb3BlcnR5IG9mIGFuIG9iamVjdCwgYWRkcmVzc2VkIGJ5IG5hbWUsIHRvZ2V0aGVyIHdpdGggdGhlIG9iamVjdCBjYXJyeWluZyBpdC5cclxuICpcclxuICogQnVpbHQgdGhyb3VnaCB7QGxpbmsgT2JqZWN0UHJvcGVydHkubG9hZH0sIHdoaWNoIHdhbGtzIGEgZG90dGVkIHBhdGggYW5kIGhhbmRzIGJhY2sgdGhlIHByb3BlcnR5IGF0XHJcbiAqIGl0cyBlbmQuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IHByb3BlcnR5ID0gT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IHtiIDogMX19LCBcImEuYlwiKTtcclxuICogcHJvcGVydHkudmFsdWU7ICAgICAgLy8gMVxyXG4gKiBwcm9wZXJ0eS52YWx1ZSA9IDI7ICAvLyB3cml0ZXMgaW50byB0aGUgb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYmplY3RQcm9wZXJ0eSB7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgY2FycnlpbmcgaXRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihrZXksIGNvbnRleHQpe1xyXG5cdFx0dGhpcy5rZXkgPSBrZXk7XHJcblx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hldGhlciB0aGUga2V5IGlzIHJlYWNoYWJsZSBvbiB0aGUgY29udGV4dCBhdCBhbGwuXHJcblx0ICpcclxuXHQgKiBUaGlzIGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBwcm90b3R5cGUgY2hhaW4sIG5vdCBvbmx5IGZvciBvd24gcHJvcGVydGllcyAtIGxvYWQoe30sIFwidG9TdHJpbmdcIilcclxuXHQgKiByZXBvcnRzIHRydWUuIFRoYXQgaXMgZGVsaWJlcmF0ZTogYSBwYXRoIG1heSBhZGRyZXNzIGEgcHJvdG90eXBlIGFuZCBleHRlbmQgaXQsIHNvIGFuIGluaGVyaXRlZFxyXG5cdCAqIGtleSBpcyBhIGtleSBsaWtlIGFueSBvdGhlciBoZXJlLiBVc2UgaGFzVmFsdWUgdG8gYXNrIHdoZXRoZXIgc29tZXRoaW5nIGlzIGFjdHVhbGx5IHN0b3JlZC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGdldCBrZXlEZWZpbmVkKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5rZXkgaW4gdGhpcy5jb250ZXh0O1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBXaGV0aGVyIHNvbWV0aGluZyBpcyBzdG9yZWQgdW5kZXIgdGhlIGtleS4gT25seSB1bmRlZmluZWQgY291bnRzIGFzIG5vdGhpbmcgLSAwLCBcIlwiLCBmYWxzZSBhbmRcclxuXHQgKiBudWxsIGFyZSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRnZXQgaGFzVmFsdWUoKXtcclxuXHRcdHJldHVybiB0eXBlb2YgdGhpcy5jb250ZXh0W3RoaXMua2V5XSAhPT0gXCJ1bmRlZmluZWRcIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm5zIHsqfSB0aGUgc3RvcmVkIHZhbHVlLCB1bmRlZmluZWQgd2hlbiB0aGVyZSBpcyBub25lXHJcblx0ICovXHJcblx0Z2V0IHZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jb250ZXh0W3RoaXMua2V5XTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7Kn0gZGF0YVxyXG5cdCAqL1xyXG5cdHNldCB2YWx1ZShkYXRhKXtcclxuXHRcdHRoaXMuY29udGV4dFt0aGlzLmtleV0gPSBkYXRhO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkcyBhIHZhbHVlIG5leHQgdG8gd2hhdCBpcyBhbHJlYWR5IHRoZXJlOiB3cml0ZXMgaXQgd2hlbiB0aGUga2V5IGhvbGRzIG5vdGhpbmcsIHR1cm5zIHRoZVxyXG5cdCAqIHZhbHVlIGludG8gYW4gYXJyYXkgb2YgYm90aCB3aGVuIGl0IGhvbGRzIG9uZSwgYW5kIHB1c2hlcyBvbnRvIHRoZSBhcnJheSB3aGVuIGl0IGhvbGRzIG9uZVxyXG5cdCAqIGFscmVhZHkuXHJcblx0ICpcclxuXHQgKiBUaGUgdmFsdWUgaXRzZWxmIGlzIG5vdCBsb29rZWQgYXQgLSBhcHBlbmRpbmcgdW5kZWZpbmVkIHB1dHMgdW5kZWZpbmVkIGludG8gdGhlIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHsqfSBkYXRhXHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDE7ICAgLy8ge2tleSA6IDF9XHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMjsgICAvLyB7a2V5IDogWzEsIDJdfVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDM7ICAgLy8ge2tleSA6IFsxLCAyLCAzXX1cclxuXHQgKi9cclxuXHRzZXQgYXBwZW5kKGRhdGEpIHtcclxuXHRcdGlmKCF0aGlzLmhhc1ZhbHVlKVxyXG5cdFx0XHR0aGlzLnZhbHVlID0gZGF0YTtcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRcdGlmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpXHJcblx0XHRcdFx0dmFsdWUucHVzaChkYXRhKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMudmFsdWUgPSBbdGhpcy52YWx1ZSwgZGF0YV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBrZXkgZnJvbSB0aGUgb2JqZWN0LiBEb2VzIG5vdGhpbmcgd2hlbiBpdCBpcyBub3QgdGhlcmUuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dm9pZH1cclxuXHQgKi9cclxuXHRyZW1vdmUoKXtcclxuXHRcdGRlbGV0ZSB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBMb2FkcyB0aGUgcHJvcGVydHkgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMuIEV2ZXJ5IHBhcnQgb2YgdGhlIHBhdGggaXMgdHJpbW1lZCwgc28gXCIgYSAuIGIgXCJcclxuXHQgKiBhZGRyZXNzZXMgdGhlIHNhbWUgcHJvcGVydHkgYXMgXCJhLmJcIi5cclxuXHQgKlxyXG5cdCAqIEEgbWlzc2luZyBzdGVwIGlzIGNyZWF0ZWQgd2l0aCBjcmVhdGUsIG90aGVyd2lzZSB0aGUgcGF0aCBpcyByZXBvcnRlZCBhcyBub3QgbG9hZGFibGUuIEEgc3RlcFxyXG5cdCAqIGhvbGRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0IGNhbm5vdCBiZSB3YWxrZWQgaW50byBhdCBhbGwgLSB0aGF0IGlzIGEgYnJva2VuIHBhdGgsIG5vdCBhXHJcblx0ICogbWlzc2luZyBvbmUsIGFuZCBpdCBpcyByZXBvcnRlZCBhcyBhbiBlcnJvciByZWdhcmRsZXNzIG9mIGNyZWF0ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRoZSBvYmplY3QgdG8gd2Fsa1xyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbmFtZSBvZiB0aGUgcHJvcGVydHksIGEgZG90dGVkIHBhdGggYWRkcmVzc2VzIGEgbmVzdGVkIG9uZVxyXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NyZWF0ZT10cnVlXSBjcmVhdGUgYSBtaXNzaW5nIHN0ZXAgb24gdGhlIHdheVxyXG5cdCAqIEByZXR1cm5zIHtPYmplY3RQcm9wZXJ0eXxudWxsfSBudWxsIHdoZW4gYSBzdGVwIGlzIG1pc3NpbmcgYW5kIGNyZWF0ZSBpcyBmYWxzZVxyXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiBhIHN0ZXAgb2YgdGhlIHBhdGggaG9sZHMgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0XHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiB7YiA6IDF9fSwgXCJhLmJcIikudmFsdWU7ICAgLy8gMVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2xpc3QgOiBbMSwgMl19LCBcImxpc3QuMVwiKS52YWx1ZTsgICAvLyAyLCBhbiBhcnJheSBpcyBhbiBvYmplY3RcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHt9LCBcImEuYlwiLCBmYWxzZSk7ICAgICAgICAgICAgIC8vIG51bGxcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDogMH0sIFwiYS5iXCIpOyAgICAgICAgICAgICAgIC8vIHRocm93cywgMCBpcyBubyBvYmplY3RcclxuXHQgKi9cclxuXHRzdGF0aWMgbG9hZChkYXRhLCBrZXksIGNyZWF0ZT10cnVlKSB7XHJcblx0XHRsZXQgY29udGV4dCA9IGRhdGE7XHJcblx0XHRjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKTtcclxuXHRcdGxldCBuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdHdoaWxlKGtleXMubGVuZ3RoID4gMCl7XHJcblx0XHRcdGlmKHR5cGVvZiBjb250ZXh0W25hbWVdID09PSBcInVuZGVmaW5lZFwiIHx8IGNvbnRleHRbbmFtZV0gPT09IG51bGwpe1xyXG5cdFx0XHRcdGlmKCFjcmVhdGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdFx0Y29udGV4dFtuYW1lXSA9IHt9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGFzc2VydERlc2NlbmRhYmxlKGNvbnRleHRbbmFtZV0sIG5hbWUsIGtleSk7XHJcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0W25hbWVdO1xyXG5cdFx0XHRuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3IE9iamVjdFByb3BlcnR5KG5hbWUsIGNvbnRleHQpO1xyXG5cdH1cclxufTsiLCIvKipcclxuICogVXRpbGl0aWVzIHRvIGluc3BlY3QsIGNvbXBhcmUsIG1lcmdlIGFuZCBmaWx0ZXIgamF2YXNjcmlwdCBvYmplY3RzLlxyXG4gKlxyXG4gKiBTZXZlcmFsIGZ1bmN0aW9ucyBzaGFyZSBvbmUgbm90aW9uIG9mIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZSBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXBcclxuICogYW5kIFNldC4ge0BsaW5rIGlzUG9qb30gZGVjaWRlcyB3aGV0aGVyIGEgdmFsdWUgc3RheXMgd2l0aGluIGl0LCB7QGxpbmsgZXF1YWxQb2pvfSBjb21wYXJlcyB0aG9zZVxyXG4gKiB0eXBlcyBieSB2YWx1ZSwgYW5kIHtAbGluayBtZXJnZX0gdHJlYXRzIGV2ZXJ5dGhpbmcgb3V0c2lkZSBvZiBpdCBhcyBhIHZhbHVlIHRvIGJlIHJlcGxhY2VkLlxyXG4gKlxyXG4gKiBAbW9kdWxlIE9iamVjdFV0aWxzXHJcbiAqL1xyXG5pbXBvcnQgT2JqZWN0UHJvcGVydHkgZnJvbSBcIi4vT2JqZWN0UHJvcGVydHkuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxBcnJheSA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCBsZW5ndGggPSBhLmxlbmd0aDtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoIWludGVybmFsRXF1YWxQb2pvKGFbaV0sIGJbaV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgc2V0IGlzIHVub3JkZXJlZCwgc28gZXZlcnkgZW50cnkgb2YgYSBoYXMgdG8gZmluZCBpdHMgb3duIHBhcnRuZXIgaW4gYi5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtTZXR9IGFcclxuICogQHBhcmFtIHtTZXR9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxTZXQgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChhLnNpemUgIT09IGIuc2l6ZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCByZW1haW5pbmcgPSBBcnJheS5mcm9tKGIpO1xyXG5cdGZvciAoY29uc3QgZW50cnlBIG9mIGEpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gcmVtYWluaW5nLmZpbmRJbmRleCgoZW50cnlCKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhlbnRyeUEsIGVudHJ5Qiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBtYXAgaXMgdW5vcmRlcmVkIGFzIHdlbGwgYW5kIGl0cyBrZXlzIG1heSBiZSBvYmplY3RzLCBzbyB0aGUga2V5cyBnZXQgY29tcGFyZWQgYnkgdmFsdWUgdG9vLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge01hcH0gYVxyXG4gKiBAcGFyYW0ge01hcH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE1hcCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHJlbWFpbmluZyA9IEFycmF5LmZyb20oYik7XHJcblx0Zm9yIChjb25zdCBba2V5QSwgdmFsdWVBXSBvZiBhKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IHJlbWFpbmluZy5maW5kSW5kZXgoKFtrZXlCLCB2YWx1ZUJdKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhrZXlBLCBrZXlCLCBzZWVuKSAmJiBpbnRlcm5hbEVxdWFsUG9qbyh2YWx1ZUEsIHZhbHVlQiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIG9iamVjdHMgYnkgcHJvdG90eXBlIGFuZCBieSB0aGVpciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE9iamVjdCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihhKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHByb3BlcnRpZXNBID0gT2JqZWN0LmtleXMoYSk7XHJcblx0Y29uc3QgcHJvcGVydGllc0IgPSBPYmplY3Qua2V5cyhiKTtcclxuXHRpZiAocHJvcGVydGllc0EubGVuZ3RoICE9PSBwcm9wZXJ0aWVzQi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Zm9yIChjb25zdCBrZXkgb2YgcHJvcGVydGllc0EpIHtcclxuXHRcdC8vIGVxdWFsIGtleSBjb3VudHMgYWxvbmUgd291bGQgbGV0IHt4OjEsIHk6dW5kZWZpbmVkfSBwYXNzIGFnYWluc3Qge3g6MSwgejp1bmRlZmluZWR9XHJcblx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpKSByZXR1cm4gZmFsc2U7XHJcblx0XHRpZiAoIWludGVybmFsRXF1YWxQb2pvKGFba2V5XSwgYltrZXldLCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBjeWNsaWMgc3RydWN0dXJlIGNhbiBvbmx5IGJlIGRlY2lkZWQgY28taW5kdWN0aXZlbHk6IGEgcGFpciBhbHJlYWR5IHVuZGVyIGNvbXBhcmlzb24gY291bnRzIGFzXHJcbiAqIGVxdWFsLCBvdGhlcndpc2UgdGhlIHdhbGsgd291bGQgbmV2ZXIgY29tZSBiYWNrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgd2hlbiB0aGlzIHBhaXIgaXMgYWxyZWFkeSBiZWluZyBjb21wYXJlZCBmdXJ0aGVyIHVwIHRoZSBzdGFja1xyXG4gKi9cclxuY29uc3QgaXNDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0cmV0dXJuICEhcGFydG5lcnMgJiYgcGFydG5lcnMuaGFzKGIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5vdGVzIGEgcGFpciBhcyBiZWluZyBjb21wYXJlZCwgc28gYSBjeWNsZSBydW5uaW5nIHRocm91Z2ggaXQgdGVybWluYXRlcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuY29uc3QgcmVtZW1iZXJDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0aWYgKHBhcnRuZXJzKSBwYXJ0bmVycy5hZGQoYik7XHJcblx0ZWxzZSBzZWVuLnNldChhLCBuZXcgV2Vha1NldChbYl0pKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLlxyXG4gKlxyXG4gKiBWYWx1ZUhlbHBlci5ub1ZhbHVlIGFuc3dlcnMgdGhlIHNhbWUgcXVlc3Rpb24uIEJvdGggYXJlIGtlcHQgb24gcHVycG9zZSwgc28gVmFsdWVIZWxwZXIgc3RheXMgZnJlZVxyXG4gKiBvZiBhIGRlcGVuZGVuY3kgb24gdGhpcyBtb2R1bGUgLSBzZWUgdGhlIG5vdGUgdGhlcmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzTnVsbE9yVW5kZWZpbmVkID0gKG9iamVjdCkgPT4ge1xyXG5cdHJldHVybiBvYmplY3QgPT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ID09PSBcInVuZGVmaW5lZFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUuXHJcbiAqXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBjb3VudCBhcyBwcmltaXRpdmVzLiBBIHN5bWJvbCBkb2VzIG5vdCAtIGl0IGlzIHRyZWF0ZWQgYXMgYW4gb3BhcXVlIHZhbHVlXHJcbiAqIHRocm91Z2hvdXQgdGhpcyBtb2R1bGUsIHNvIHRoYXQge0BsaW5rIGlzUG9qb30ga2VlcHMgcmVqZWN0aW5nIGl0IGFzIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB0eXBlb2Ygb2JqZWN0O1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0Y2FzZSBcIm51bWJlclwiOlxyXG5cdFx0Y2FzZSBcImJpZ2ludFwiOlxyXG5cdFx0Y2FzZSBcImJvb2xlYW5cIjpcclxuXHRcdGNhc2UgXCJzdHJpbmdcIjpcclxuXHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhbiBvYmplY3QuXHJcbiAqXHJcbiAqIEV2ZXJ5IG9iamVjdCBjb3VudHMsIEFycmF5LCBNYXAsIERhdGUgYW5kIGNsYXNzIGluc3RhbmNlcyBpbmNsdWRlZC4gVXNlIHtAbGluayBpc1Bvam99IHRvIGFzayBmb3JcclxuICogYSBzaW1wbGUgZGF0YSBvYmplY3QgaW5zdGVhZC5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNPYmplY3QgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIHZhbHVlcyBieSB2YWx1ZS5cclxuICpcclxuICogVGhlIHR5cGVzIGNvbXBhcmVkIGJ5IHZhbHVlIGFyZSB0aGUgb25lcyB7QGxpbmsgaXNQb2pvfSBhY2NlcHRzIGFzIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZVxyXG4gKiBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXAgYW5kIFNldC4gQSBEYXRlIGlzIGNvbXBhcmVkIGJ5IGl0cyB0aW1lLCBhIFJlZ0V4cCBieSBzb3VyY2UgYW5kXHJcbiAqIGZsYWdzLiBTZXQgYW5kIE1hcCBhcmUgdW5vcmRlcmVkLCBzbyB0aGVpciBlbnRyaWVzIGFyZSBtYXRjaGVkIGJ5IHZhbHVlIGluc3RlYWQgb2YgYnkgcG9zaXRpb24sXHJcbiAqIGFuZCB0aGUga2V5cyBvZiBhIE1hcCB0YWtlIHBhcnQgaW4gdGhhdCBjb21wYXJpc29uLlxyXG4gKlxyXG4gKiBTaW1wbGUgb2JqZWN0cyBhbmQgY2xhc3MgaW5zdGFuY2VzIG5lZWQgdGhlIHNhbWUgcHJvdG90eXBlIGFuZCB0aGUgc2FtZSBvd24gZW51bWVyYWJsZVxyXG4gKiBwcm9wZXJ0aWVzLiBFdmVyeSBvdGhlciBvYmplY3QgLSBFcnJvciwgUHJvbWlzZSwgV2Vha01hcCBhbmQgdGhlIGxpa2UgLSBrZWVwcyBpdHMgc3RhdGUgb3V0IG9mXHJcbiAqIHJlYWNoLCBzbyB0aG9zZSBjb21wYXJlIGJ5IGlkZW50aXR5IG9ubHkuIEZ1bmN0aW9ucyBhbmQgc3ltYm9scyBkbyBhcyB3ZWxsLlxyXG4gKlxyXG4gKiBDeWNsaWMgc3RydWN0dXJlcyBhcmUgc3VwcG9ydGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IGFcclxuICogQHBhcmFtIHsqfSBiXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBlcXVhbFBvam8oe2EgOiBbMSwgMl19LCB7YSA6IFsxLCAyXX0pOyAgICAgICAgICAgICAgIC8vIHRydWVcclxuICogZXF1YWxQb2pvKG5ldyBTZXQoWzEsIDJdKSwgbmV3IFNldChbMiwgMV0pKTsgICAgICAgICAvLyB0cnVlLCBhIHNldCBpcyB1bm9yZGVyZWRcclxuICogZXF1YWxQb2pvKG5ldyBEYXRlKDApLCBuZXcgRGF0ZSgxKSk7ICAgICAgICAgICAgICAgICAvLyBmYWxzZVxyXG4gKiBlcXVhbFBvam8obmV3IEVycm9yKFwieFwiKSwgbmV3IEVycm9yKFwieFwiKSk7ICAgICAgICAgICAvLyBmYWxzZSwgY29tcGFyZWQgYnkgaWRlbnRpdHlcclxuICovXHJcbmV4cG9ydCBjb25zdCBlcXVhbFBvam8gPSAoYSwgYikgPT4gaW50ZXJuYWxFcXVhbFBvam8oYSwgYiwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG5cclxuLyoqXHJcbiogQHBhcmFtIHsqfSBhXHJcbiAqIEBwYXJhbSB7Kn0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gaW50ZXJuYWwsIHRyYWNrcyB0aGUgcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpbnRlcm5hbEVxdWFsUG9qbyA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IGlzTnVsbE9yVW5kZWZpbmVkKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHRpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XHJcblx0aWYgKGlzUHJpbWl0aXZlKGEpIHx8IGlzUHJpbWl0aXZlKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHJcblx0Y29uc3QgdHlwZUEgPSB0eXBlb2YgYTtcclxuXHRpZiAodHlwZUEgIT09IHR5cGVvZiBiKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHR5cGVBICE9PSBcIm9iamVjdFwiKSByZXR1cm4gYSA9PT0gYjsgLy8gZnVuY3Rpb24gYW5kIHN5bWJvbFxyXG5cclxuXHRpZiAoaXNDb21wYXJpbmcoc2VlbiwgYSwgYikpIHJldHVybiB0cnVlO1xyXG5cdHJlbWVtYmVyQ29tcGFyaW5nKHNlZW4sIGEsIGIpO1xyXG5cclxuXHRpZihhIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuICBiIGluc3RhbmNlb2YgRGF0ZSA/IE9iamVjdC5pcyhhLmdldFRpbWUoKSwgYi5nZXRUaW1lKCkpIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gYiBpbnN0YW5jZW9mIFJlZ0V4cCA/IChhLnNvdXJjZSA9PT0gYi5zb3VyY2UgJiYgYS5mbGFncyA9PT0gYi5mbGFncykgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIGIgaW5zdGFuY2VvZiBBcnJheSA/IGVxdWFsQXJyYXkoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBTZXQpIHJldHVybiBiIGluc3RhbmNlb2YgU2V0ID8gZXF1YWxTZXQoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBNYXApIHJldHVybiBiIGluc3RhbmNlb2YgTWFwID8gZXF1YWxNYXAoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBmYWxzZTtcdFxyXG5cdGVsc2UgcmV0dXJuIGVxdWFsT2JqZWN0KGEsIGIsIHNlZW4pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgcGxhaW4gb2JqZWN0IG93bnMgZWl0aGVyIG5vIHByb3RvdHlwZSBhdCBhbGwgb3IgYSBwcm90b3R5cGUgdGhhdCBpdHNlbGYgaGFzIG5vbmUuIENoZWNraW5nIHRoZVxyXG4gKiBjaGFpbiBsZW5ndGggaW5zdGVhZCBvZiBjb21wYXJpbmcgYWdhaW5zdCBPYmplY3QucHJvdG90eXBlIGtlZXBzIHRoaXMgd29ya2luZyBhY3Jvc3MgcmVhbG1zLFxyXG4gKiB3aGVyZSBhbiBpZnJhbWUgYnJpbmdzIGl0cyBvd24gT2JqZWN0LnByb3RvdHlwZS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSBvYmplY3RcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xyXG5cdGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xyXG5cdHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvdHlwZSkgPT09IG51bGw7XHJcbn07XHJcblxyXG4vKipcclxuICogV2Fsa3MgYSB2YWx1ZSBhbmQgZGVjaWRlcyB3aGV0aGVyIGV2ZXJ5dGhpbmcgcmVhY2hhYmxlIGZyb20gaXQgaXMgZGF0YS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1dlYWtTZXR9IFtzZWVuXSB2YWx1ZXMgYWxyZWFkeSB3YWxrZWQsIGNsb3NlcyBjeWNsZXNcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFWYWx1ZSA9ICh2YWx1ZSwgc2VlbiA9IG5ldyBXZWFrU2V0KCkpID0+IHtcclxuXHRpZiAoaXNQcmltaXRpdmUodmFsdWUpKSByZXR1cm4gdHJ1ZTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB0cnVlO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0aWYgKHNlZW4uaGFzKHZhbHVlKSkgcmV0dXJuIHRydWU7XHJcblx0c2Vlbi5hZGQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIHZhbHVlLmV2ZXJ5KChlbnRyeSkgPT4gaXNEYXRhVmFsdWUoZW50cnksIHNlZW4pKTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkge1xyXG5cdFx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShrZXksIHNlZW4pIHx8ICFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKVxyXG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBjbGFzcyBpbnN0YW5jZXMgYW5kIGV2ZXJ5IG90aGVyIGV4b3RpYyBvYmplY3RcclxuXHRlbHNlIHtcclxuXHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKHZhbHVlW2tleV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBpcyBhIHB1cmUgZGF0YSBvYmplY3QuXHJcbiAqXHJcbiAqIFRoZSBvYmplY3QgaXRzZWxmIGhhcyB0byBiZSBhIHNpbXBsZSBvYmplY3QgLSBubyBBcnJheSwgTWFwIG9yIHNvbWV0aGluZyBlbHNlLiBFdmVyeSB2YWx1ZVxyXG4gKiByZWFjaGFibGUgZnJvbSBpdCBoYXMgdG8gYmUgZGF0YSBhcyB3ZWxsOiBwcmltaXRpdmVzLCBzaW1wbGUgb2JqZWN0cywgQXJyYXksIERhdGUsIFJlZ0V4cCwgTWFwIG9yXHJcbiAqIFNldC4gRnVuY3Rpb25zIGFuZCBjbGFzcyBpbnN0YW5jZXMgYXJlIHJlamVjdGVkIGF0IGFueSBkZXB0aCwgaW5jbHVkaW5nIGluc2lkZSBhcnJheXMgYW5kIGluc2lkZVxyXG4gKiB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGEgTWFwIG9yIFNldC5cclxuICpcclxuICogT25seSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBpbnNwZWN0ZWQuIEN5Y2xpYyByZWZlcmVuY2VzIGFyZSBhbGxvd2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGlzUG9qbyh7YSA6IHtiIDogWzEsIG5ldyBEYXRlKCldfX0pOyAgIC8vIHRydWVcclxuICogaXNQb2pvKHthIDogKCkgPT4ge319KTsgICAgICAgICAgICAgICAgLy8gZmFsc2UsIGEgZnVuY3Rpb24gaXMgbm8gZGF0YVxyXG4gKiBpc1Bvam8oe2EgOiBbe2IgOiBuZXcgRm9vKCl9XX0pOyAgICAgICAvLyBmYWxzZSwgcmVqZWN0ZWQgYXQgYW55IGRlcHRoXHJcbiAqIGlzUG9qbyhbXSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbHNlLCB0aGUgb2JqZWN0IGl0c2VsZiBoYXMgdG8gYmUgYSBzaW1wbGUgb25lXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNQb2pvID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChpc051bGxPclVuZGVmaW5lZChvYmplY3QpIHx8ICFpc1BsYWluT2JqZWN0KG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIGlzRGF0YVZhbHVlKG9iamVjdCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwZW5kcyBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIG9iamVjdC4gSWYgdGhlIHByb3BlcnR5IGFscmVhZHkgaG9sZHMgYSB2YWx1ZSwgaXQgaXMgY29udmVydGVkXHJcbiAqIGludG8gYW4gYXJyYXkgY2FycnlpbmcgYm90aC4gQW4gdW5kZWZpbmVkIHZhbHVlIGlzIGlnbm9yZWQuXHJcbiAqXHJcbiAqIFRoZSBrZXkgbWF5IGFkZHJlc3MgYSBuZXN0ZWQgcHJvcGVydHkgYnkgYSBkb3R0ZWQgcGF0aCwgbWlzc2luZyBzdGVwcyBhcmUgY3JlYXRlZCBvbiB0aGUgd2F5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYUtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMgYSBuZXN0ZWQgb25lXHJcbiAqIEBwYXJhbSB7Kn0gYURhdGEgcHJvcGVydHkgdmFsdWVcclxuICogQHBhcmFtIHtvYmplY3R9IGFPYmplY3QgdGhlIG9iamVjdCB0byBhcHBlbmQgdGhlIHByb3BlcnR5IHRvXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSBjaGFuZ2VkIG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBhcHBlbmQoXCJhXCIsIDEsIHt9KTsgICAgICAgICAgICAgLy8ge2EgOiAxfVxyXG4gKiBhcHBlbmQoXCJhXCIsIDIsIHthIDogMX0pOyAgICAgICAgLy8ge2EgOiBbMSwgMl19XHJcbiAqIGFwcGVuZChcImEuYlwiLCAxLCB7fSk7ICAgICAgICAgICAvLyB7YSA6IHtiIDogMX19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYXBwZW5kID0gKGFLZXksIGFEYXRhLCBhT2JqZWN0KSA9PiB7XHJcblx0aWYgKHR5cGVvZiBhRGF0YSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0Y29uc3QgcHJvcGVydHkgPSBPYmplY3RQcm9wZXJ0eS5sb2FkKGFPYmplY3QsIGFLZXksIHRydWUpO1xyXG5cdFx0cHJvcGVydHkuYXBwZW5kID0gYURhdGE7XHJcblx0fVxyXG5cdHJldHVybiBhT2JqZWN0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE93biBlbnVtZXJhYmxlIGtleXMsIHN0cmluZ3MgYW5kIHN5bWJvbHMgYWxpa2UgLSB0aGUgc2FtZSBzZXQgT2JqZWN0LmFzc2lnbiBjb3BpZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gc291cmNlXHJcbiAqIEByZXR1cm5zIHtBcnJheTxzdHJpbmd8c3ltYm9sPn1cclxuICovXHJcbmNvbnN0IGFzc2lnbmFibGVLZXlzID0gKHNvdXJjZSkgPT4ge1xyXG5cdGNvbnN0IG9iamVjdCA9IE9iamVjdChzb3VyY2UpO1xyXG5cdHJldHVybiBSZWZsZWN0Lm93bktleXMob2JqZWN0KS5maWx0ZXIoKGtleSkgPT4gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwga2V5KSk7XHJcbn07XHJcblxyXG4vKipcclxuICogTWVyZ2VzIG9iamVjdHMgaW50byBhIHRhcmdldCBvYmplY3QgLSBhIHJlY3Vyc2l2ZSBPYmplY3QuYXNzaWduLiBJdCBzdGVwcyBpbnRvIG9iamVjdHMgYW5kIHN1YlxyXG4gKiBvYmplY3RzLiBFdmVyeSBvdGhlciB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgdmFsdWUgZnJvbSB0aGUgc291cmNlIG9iamVjdC5cclxuICpcclxuICogTGlrZSBPYmplY3QuYXNzaWduIGl0IGNvcGllcyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIC0gc3RyaW5nIGFuZCBzeW1ib2wga2V5cyBhbGlrZSAtLCBpZ25vcmVzXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBzb3VyY2VzIGFuZCByZXR1cm5zIHRoZSB0YXJnZXQuIFVubGlrZSBPYmplY3QuYXNzaWduIGl0IHN0ZXBzIGludG8gYSBwcm9wZXJ0eVxyXG4gKiB3aGVuIHRhcmdldCBhbmQgc291cmNlIGJvdGggaG9sZCBhbiBvYmplY3QsIGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0LlxyXG4gKlxyXG4gKiBBIGNsYXNzIGluc3RhbmNlIGNvdW50cyBhcyBhbiBvYmplY3QgaGVyZSBhbmQgaXMgbWVyZ2VkIHByb3BlcnR5IGJ5IHByb3BlcnR5IGp1c3QgbGlrZSBhIHNpbXBsZVxyXG4gKiBvbmUuIFRoZSB0YXJnZXQga2VlcHMgaXRzIG93biBwcm90b3R5cGUsIG9ubHkgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHNvdXJjZSBhcmUgYXBwbGllZCB0byBpdCAtIGFcclxuICogbWVyZ2UgbmV2ZXIgdHVybnMgdGhlIHRhcmdldCBpbnRvIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcyBvZiB0aGUgc291cmNlLlxyXG4gKlxyXG4gKiBBbiBBcnJheSwgU2V0LCBNYXAsIERhdGUgb3IgUmVnRXhwIGlzIGFsd2F5cyByZXBsYWNlZCBhcyBhIHdob2xlLCBuZXZlciBtZXJnZWQgZW50cnkgYnkgZW50cnkuXHJcbiAqIFRoYXQgYWxyZWFkeSBhcHBsaWVzIHdoZW4gb25seSBvbmUgb2YgYm90aCBzaWRlcyBob2xkcyBvbmUuIFRoZSByZXN1bHQgdGhlcmVmb3JlIGNhcnJpZXMgdGhlXHJcbiAqIGNvbnRhaW5lciBvZiB0aGUgc291cmNlIHdpdGggaXRzIG93biBsZW5ndGggLSBub3RoaW5nIG9mIHRoZSB0YXJnZXQgc3Vydml2ZXMgaXQsIG5vdCBldmVuIGFuXHJcbiAqIG9iamVjdCBzaXR0aW5nIGF0IHRoZSBzYW1lIGluZGV4IG9yIHVuZGVyIHRoZSBzYW1lIGtleS5cclxuICpcclxuICogQSBrZXkgd2hvc2UgdmFsdWUgaXMgYSBzeW1ib2wgaXMgc2tpcHBlZCwgb24gdGhlIHRhcmdldCBzaWRlIGFzIHdlbGwgYXMgb24gdGhlIHNvdXJjZSBzaWRlLiBBXHJcbiAqIHN5bWJvbCBjYXJyaWVzIG5vIGRhdGEsIHNvIHN1Y2ggYSBwcm9wZXJ0eSBpcyBsZWZ0IHVudG91Y2hlZC5cclxuICpcclxuICogVGhlIGtleSBfX3Byb3RvX18gaXMgc2tpcHBlZC4gT2JqZWN0LmFzc2lnbiB3b3VsZCBvbmx5IHJlcG9pbnQgdGhlIHByb3RvdHlwZSBvZiB0aGUgdGFyZ2V0LCBidXRcclxuICogbWVyZ2luZyBpbnRvIGl0IHdvdWxkIHdhbGsgaW50byBPYmplY3QucHJvdG90eXBlIGFuZCBsZWFrIGludG8gZXZlcnkgb2JqZWN0LlxyXG4gKlxyXG4gKiBUaGUgdGFyZ2V0IGlzIG1vZGlmaWVkIGluIHBsYWNlLiBBIHN1YiBvYmplY3Qgb2YgYSBzb3VyY2UgdGhhdCBoYXMgbm8gY291bnRlcnBhcnQgaW4gdGhlIHRhcmdldCBpc1xyXG4gKiB0YWtlbiBvdmVyIGJ5IHJlZmVyZW5jZSwganVzdCBsaWtlIE9iamVjdC5hc3NpZ24gZG9lcy5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCB0aGUgdGFyZ2V0IG9iamVjdCB0byBtZXJnZSBpbnRvLCBhIG5ldyBvYmplY3Qgd2hlbiBmYWxzeVxyXG4gKiBAcGFyYW0gey4uLm9iamVjdH0gc291cmNlcyB0aGUgc291cmNlIG9iamVjdHMsIGFwcGxpZWQgaW4gb3JkZXJcclxuICogQHJldHVybnMge29iamVjdH0gdGhlIHRhcmdldCBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbWVyZ2Uoe2EgOiAxfSwge2IgOiAyfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDEsIGIgOiAyfVxyXG4gKiBtZXJnZSh7YSA6IHt4IDogMX19LCB7YSA6IHt5IDogMn19KTsgICAgICAgICAgICAgIC8vIHthIDoge3ggOiAxLCB5IDogMn19XHJcbiAqIG1lcmdlKHthIDogWzEsIDIsIDNdfSwge2EgOiBbOV19KTsgICAgICAgICAgICAgICAgLy8ge2EgOiBbOV19LCByZXBsYWNlZCBhcyBhIHdob2xlXHJcbiAqIG1lcmdlKHthIDogbmV3IEZvbygxKX0sIHthIDogbmV3IEJhcigyKX0pOyAgICAgICAgLy8gYSBzdGF5cyBhIEZvbywgY2FycnlpbmcgdGhlIHByb3BlcnRpZXMgb2YgYm90aFxyXG4gKiBtZXJnZSh7fSwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWVyZ2UgPSAodGFyZ2V0LCAuLi5zb3VyY2VzKSA9PiB7XHJcblx0aWYgKCF0YXJnZXQpIHRhcmdldCA9IHt9O1xyXG5cclxuXHRzb3VyY2VzXHJcblx0XHQuZmlsdGVyKChzb3VyY2UpID0+ICFpc051bGxPclVuZGVmaW5lZChzb3VyY2UpKVxyXG5cdFx0LmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG5cdFx0XHRjb25zdCBrZXlzID0gYXNzaWduYWJsZUtleXMoc291cmNlKTtcclxuXHRcdFx0a2V5c1xyXG5cdFx0XHRcdC5maWx0ZXIoKGtleSkgPT4ga2V5ICE9IFwiX19wcm90b19fXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2YgdGFyZ2V0W2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2Ygc291cmNlW2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZvckVhY2goKGtleSkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzb3VyY2Vba2V5XTtcclxuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnQgPSB0YXJnZXRba2V5XTtcclxuXHJcblx0XHRcdFx0XHRpZihjdXJyZW50ID09IG51bGwgKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiggdHlwZW9mIGN1cnJlbnQgIT09IHR5cGVvZiB2YWx1ZSApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgQXJyYXkgfHwgdmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBTZXQgfHwgdmFsdWUgaW5zdGFuY2VvZiBTZXQpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgTWFwIHx8IHZhbHVlIGluc3RhbmNlb2YgTWFwKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIERhdGUgfHwgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFJlZ0V4cCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGlzT2JqZWN0KGN1cnJlbnQpICYmIGlzT2JqZWN0KHZhbHVlKSkgbWVyZ2UoY3VycmVudCwgdmFsdWUpO1xyXG5cdFx0XHRcdFx0ZWxzZSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdHJldHVybiB0YXJnZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVjaWRlcyB3aGV0aGVyIGEgc2luZ2xlIHByb3BlcnR5IGlzIHRha2VuIG92ZXIgYnkge0BsaW5rIGZpbHRlcn0uXHJcbiAqXHJcbiAqIEBjYWxsYmFjayBQcm9wZXJ0eUZpbHRlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0aGUgb2JqZWN0IHRoZSBwcm9wZXJ0eSBiZWxvbmdzIHRvXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIHRvIGtlZXAgdGhlIHByb3BlcnR5XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIHtAbGluayBQcm9wZXJ0eUZpbHRlcn0gYWNjZXB0aW5nIG9yIHJlamVjdGluZyBhIGZpeGVkIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gb3B0aW9ucy5uYW1lcyB0aGUgcHJvcGVydHkgbmFtZXMgdG8gZGVjaWRlIG9uXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5hbGxvd2VkIHRydWUgdHVybnMgdGhlIGxpc3QgaW50byBhbiBhbGxvdyBsaXN0LCBmYWxzZSBpbnRvIGEgZGVueSBsaXN0XHJcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eUZpbHRlcn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZGVueSA9IGJ1aWxkUHJvcGVydHlGaWx0ZXIoe25hbWVzIDogW1wicGFzc3dvcmRcIl0sIGFsbG93ZWQgOiBmYWxzZX0pO1xyXG4gKiBmaWx0ZXIodXNlciwgZGVueSk7ICAgLy8gZXZlcnkgcHJvcGVydHkgYnV0IHBhc3N3b3JkXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYnVpbGRQcm9wZXJ0eUZpbHRlciA9ICh7IG5hbWVzLCBhbGxvd2VkIH0pID0+IHtcclxuXHRyZXR1cm4gKG5hbWUsIHZhbHVlLCBjb250ZXh0KSA9PiB7XHJcblx0XHRyZXR1cm4gbmFtZXMuaW5jbHVkZXMobmFtZSkgPT09IGFsbG93ZWQ7XHJcblx0fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWJ1aWxkcyBhbiBBcnJheSwgU2V0IG9yIE1hcCB3aXRoIGl0cyB2YWx1ZXMgZmlsdGVyZWQuIEEgY29udGFpbmVyIGtlZXBzIGFsbCBvZiBpdHMgZW50cmllcyAtXHJcbiAqIG9ubHkgdGhlIHZhbHVlcyBpbnNpZGUgZ2V0IGZpbHRlcmVkLiBUaGUga2V5cyBvZiBhIE1hcCBzdGF5IHVudG91Y2hlZCwgcmVwbGFjaW5nIHRoZW0gd291bGQgYnJlYWtcclxuICogZXZlcnkgbG9va3VwIGFnYWluc3QgdGhlIHJlc3VsdC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtBcnJheXxTZXR8TWFwfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVlcFxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IGNvcGllcyBtYXBzIGFuIG9yaWdpbmFsIG9udG8gaXRzIGZpbHRlcmVkIGNvcHlcclxuICogQHJldHVybnMge0FycmF5fFNldHxNYXB9XHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJDb250YWluZXIgPSAodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblx0XHRjb25zdCBjb3B5ID0gW107XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkucHVzaChmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdFx0cmV0dXJuIGNvcHk7XHJcblx0fVxyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGNvbnN0IGNvcHkgPSBuZXcgU2V0KCk7XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkuYWRkKGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0XHRyZXR1cm4gY29weTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGNvcHkgPSBuZXcgTWFwKCk7XHJcblx0Y29waWVzLnNldCh2YWx1ZSwgY29weSk7XHJcblx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIGNvcHkuc2V0KGtleSwgZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRyZXR1cm4gY29weTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXJzIGEgc2luZ2xlIHZhbHVlLCBkaXNwYXRjaGluZyBvbiB3aGF0IGl0IGlzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7Kn0gdGhlIGZpbHRlcmVkIHZhbHVlLCBvciB0aGUgdmFsdWUgaXRzZWxmIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBmaWx0ZXJcclxuICovXHJcbmNvbnN0IGZpbHRlclZhbHVlID0gKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpID0+IHtcclxuXHRpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdmFsdWU7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHZhbHVlOyAvLyBjYXJyeSBubyBwcm9wZXJ0aWVzIHRvIGZpbHRlclxyXG5cclxuXHQvLyBhIHZhbHVlIHNlZW4gYmVmb3JlIGNsb3NlcyBhIGN5Y2xlIC0gaXRzIGNvcHkgc3RhbmRzIGluLCBzbyBub3RoaW5nIHVuZmlsdGVyZWQgbGVha3MgYmFjayBpblxyXG5cdGlmIChjb3BpZXMuaGFzKHZhbHVlKSkgcmV0dXJuIGNvcGllcy5nZXQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGZpbHRlckNvbnRhaW5lcih2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxuXHJcblx0cmV0dXJuIGZpbHRlck9iamVjdCh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgdGhlIGZpbHRlcmVkIGNvcHkgb2YgYW4gb2JqZWN0LiBUaGUgY29weSBpcyByZWdpc3RlcmVkIGJlZm9yZSBpdCBpcyBmaWxsZWQsIHNvIGEgY3ljbGVcclxuICogcnVubmluZyBiYWNrIGludG8gaXQgcmVzb2x2ZXMgdG8gdGhlIGNvcHkgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuY29uc3QgZmlsdGVyT2JqZWN0ID0gKGRhdGEsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cdGNvcGllcy5zZXQoZGF0YSwgcmVzdWx0KTtcclxuXHJcblx0Zm9yIChjb25zdCBuYW1lIGluIGRhdGEpIHtcclxuXHRcdGNvbnN0IHZhbHVlID0gZGF0YVtuYW1lXTtcclxuXHRcdGlmIChwcm9wRmlsdGVyKG5hbWUsIHZhbHVlLCBkYXRhKSl7XHJcblx0XHRcdHJlc3VsdFtuYW1lXSA9IGRlZXAgPyBmaWx0ZXJWYWx1ZSh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA6IHZhbHVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBuZXcgb2JqZWN0IGhvbGRpbmcgdGhlIHByb3BlcnRpZXMgYSBmaWx0ZXIgYWNjZXB0cy5cclxuICpcclxuICogVGhlIGZpbHRlciBpcyBjYWxsZWQgZm9yIGV2ZXJ5IGVudW1lcmFibGUgcHJvcGVydHksIGluaGVyaXRlZCBvbmVzIGluY2x1ZGVkIC0gZmlsdGVyaW5nIGEgd2luZG93XHJcbiAqIHJlbGllcyBvbiB0aGF0LCBzaW5jZSBtb3N0IG9mIGl0cyBtZW1iZXJzIHNpdCBvbiB0aGUgcHJvdG90eXBlLlxyXG4gKlxyXG4gKiBXaXRoIGRlZXAgdGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvIHN1YiBvYmplY3RzIGFzIHdlbGwuIEFycmF5LCBTZXQgYW5kIE1hcCBhcmUgcmVidWlsdCB3aXRoIHRoZWlyXHJcbiAqIHZhbHVlcyBmaWx0ZXJlZCwga2VlcGluZyBhbGwgb2YgdGhlaXIgZW50cmllcyBhbmQsIGZvciBhIE1hcCwgaXRzIGtleXMuIERhdGUgYW5kIFJlZ0V4cCBhcmUgdGFrZW5cclxuICogb3ZlciBhcyB0aGV5IGFyZS4gQSBjeWNsaWMgcmVmZXJlbmNlIHJlc29sdmVzIHRvIHRoZSBmaWx0ZXJlZCBjb3B5LCBzbyB0aGUgcmVzdWx0IG5ldmVyIGNhcnJpZXMgYVxyXG4gKiByZWZlcmVuY2UgaW50byB0aGUgdW50b3VjaGVkIG9yaWdpbmFsLlxyXG4gKlxyXG4gKiBXaXRob3V0IGRlZXAgdGhlIGFjY2VwdGVkIHZhbHVlcyBhcmUgdGFrZW4gb3ZlciBhcyB0aGV5IGFyZSwgc3ViIG9iamVjdHMgYnkgcmVmZXJlbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0aGUgb2JqZWN0IHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXIgZGVjaWRlcyBwZXIgcHJvcGVydHksIHNlZSB7QGxpbmsgYnVpbGRQcm9wZXJ0eUZpbHRlcn1cclxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXA9ZmFsc2VdIGZpbHRlciBzdWIgb2JqZWN0cyB0b29cclxuICogQHJldHVybnMge29iamVjdH0gYSBuZXcgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGRlbnkgPSBidWlsZFByb3BlcnR5RmlsdGVyKHtuYW1lcyA6IFtcInNlY3JldFwiXSwgYWxsb3dlZCA6IGZhbHNlfSk7XHJcbiAqXHJcbiAqIGZpbHRlcih7c2VjcmV0IDogXCJ4XCIsIGEgOiAxfSwgZGVueSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDF9XHJcbiAqIGZpbHRlcih7c3ViIDoge3NlY3JldCA6IFwieFwiLCBhIDogMX19LCBkZW55LCB7ZGVlcCA6IHRydWV9KTsgICAgICAvLyB7c3ViIDoge2EgOiAxfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoZGF0YSwgcHJvcEZpbHRlciwgeyBkZWVwID0gZmFsc2UgfSA9IHt9KSA9PiBmaWx0ZXJPYmplY3QoZGF0YSwgcHJvcEZpbHRlciwgZGVlcCwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIGNvbnN0YW50LCBub24gZW51bWVyYWJsZSBwcm9wZXJ0eS5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdGhlIHZhbHVlLCBuZWl0aGVyIHdyaXRhYmxlIG5vciBjb25maWd1cmFibGVcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmVmFsdWUgPSAobywgbmFtZSwgdmFsdWUpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0dmFsdWUsXHJcblx0XHR3cml0YWJsZTogZmFsc2UsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIHJlYWQgb25seSwgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZHZXQgPSAobywgbmFtZSwgZ2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyIGFuZCBhIHNldHRlci5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gc2V0IHRha2VzIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZkdldFNldCA9IChvLCBuYW1lLCBnZXQsIHNldCkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHRnZXQsXHJcblx0XHRzZXQsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0aXNOdWxsT3JVbmRlZmluZWQsXHJcblx0aXNPYmplY3QsXHJcblx0aXNQcmltaXRpdmUsXHJcblx0ZXF1YWxQb2pvLFxyXG5cdGlzUG9qbyxcclxuXHRhcHBlbmQsXHJcblx0bWVyZ2UsXHJcblx0ZmlsdGVyLFxyXG5cdGJ1aWxkUHJvcGVydHlGaWx0ZXIsXHJcblx0ZGVmVmFsdWUsXHJcblx0ZGVmR2V0LFxyXG5cdGRlZkdldFNldCxcclxufTtcclxuIiwiLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDYWNoZUVudHJ5XG4gKiBAcHJvcGVydHkge251bWJlcn0gbGFzdEhpdCAtIE1vbm90b25pYyBtYXJrZXIgb2YgdGhlIGxhc3QgcmVhZCBvciB3cml0ZSwgdGhlIGV2aWN0aW9uIG9yZGVyLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGtleVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gdmFsdWVcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvZGVDYWNoZU9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc2l6ZV0gLSBNYXhpbXVtIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjYWNoZSwgYSBmcmFjdGlvbiByb3VuZGVkIGRvd24uIElmIHNldFxuICogdG8gMCBvciBsZXNzLCBjYWNoaW5nIGlzIGRpc2FibGVkLiBMZWZ0IG91dCwgdGhlIHNpemUgc3RheXMgYXMgaXQgaXMuXG4gKi9cblxuLyoqIFRoZSBzaXplIGV2ZXJ5IGNhY2hlIHN0YXJ0cyB3aXRoLiAqL1xuY29uc3QgU1RBUlRfU0laRSA9IDUwMDA7XG5cbi8qKlxuICogQ29kZUNhY2hlIGNsYXNzIHRvIG1hbmFnZSBjYWNoaW5nIG9mIGdlbmVyYXRlZCBjb2RlIHNuaXBwZXRzLlxuICpcbiAqIEVudHJpZXMgYXJlIGV2aWN0ZWQgbGVhc3QgcmVjZW50bHkgdXNlZCBmaXJzdDogZXZlcnkgaGl0IHJlZnJlc2hlcyB0aGUgZW50cnksIHNvIGFuXG4gKiBleHByZXNzaW9uIHRoYXQga2VlcHMgYmVpbmcgcmVzb2x2ZWQgb3V0bGl2ZXMgb25lIHRoYXQgd2FzIGNvbXBpbGVkIG9uY2UgYW5kIGRyb3BwZWQuXG4gKiBUaGUgbWFya2VyIGlzIGEgY291bnRlciByYXRoZXIgdGhhbiBhIHRpbWVzdGFtcCDigJQgYSBidXJzdCBvZiBmaXJzdC10aW1lIGNvbXBpbGF0aW9uc1xuICogZmFsbHMgaW50byBhIHNpbmdsZSBtaWxsaXNlY29uZCwgd2hpY2ggd291bGQgbGVhdmUgdGhlIGV2aWN0aW9uIG9yZGVyIHRvIGNoYW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29kZUNhY2hlIHtcblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHQjZGlzYWJsZWQgPSBmYWxzZTtcblx0LyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cdCNzaXplID0gMDtcblx0LyoqIEB0eXBlIHtudW1iZXJ9ICovXG5cdCNtYXhTaXplID0gMDtcblx0LyoqIEB0eXBlIHtBcnJheTxDYWNoZUVudHJ5Pn0gKi9cblx0I2VudHJpZXMgPSBbXTtcblx0LyoqIEB0eXBlIHtNYXA8c3RyaW5nLENhY2hlRW50cnk+fSAqL1xuXHQjZW50cnlNYXAgPSBuZXcgTWFwKCk7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAtIEhhbmRzIG91dCB0aGUgYGxhc3RIaXRgIG1hcmtlcnMsIG5ldmVyIHJlc2V0LiAqL1xuXHQjY2xvY2sgPSAwO1xuXG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB3aXRoIGEgc2l6ZSBvZiA1MDAwLCB0aGVuIGFwcGxpZXMgdGhlIG9wdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Q29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuXHQgKi9cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy4jcmVzaXplKFNUQVJUX1NJWkUpO1xuXHRcdHRoaXMuc2V0dXAob3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwbGllcyB3aGF0IHRoZSBvcHRpb25zIGNhcnJ5IGFuZCBsZWF2ZXMgZXZlcnl0aGluZyBlbHNlIGFzIGl0IGlzLiBBIHNpemUgb2YgMCBvciBsZXNzXG5cdCAqIGRpc2FibGVzIHRoZSBjYWNoZSBhbmQgcmVsZWFzZXMgaXRzIGVudHJpZXMsIGEgbGF0ZXIgcG9zaXRpdmUgc2l6ZSBlbmFibGVzIGl0IGFnYWluIGFuZCBzdGFydHNcblx0ICogZW1wdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Q29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBzaXplIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcblx0ICovXG5cdHNldHVwKHsgc2l6ZSB9ID0ge30pIHtcblx0XHRpZiAoc2l6ZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cdFx0aWYgKHR5cGVvZiBzaXplICE9PSBcIm51bWJlclwiIHx8ICFOdW1iZXIuaXNGaW5pdGUoc2l6ZSkpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBzaXplIG9mIGEgY29kZSBjYWNoZSBpcyBhIGZpbml0ZSBudW1iZXIsIG5vdCAke1N0cmluZyhzaXplKX0hYCk7XG5cblx0XHR0aGlzLiNyZXNpemUoTWF0aC5mbG9vcihzaXplKSk7XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIHtudW1iZXJ9IGFTaXplIGEgd2hvbGUgbnVtYmVyXG5cdCAqL1xuXHQjcmVzaXplKGFTaXplKSB7XG5cdFx0dGhpcy4jZGlzYWJsZWQgPSBhU2l6ZSA8PSAwO1xuXHRcdGlmICh0aGlzLiNkaXNhYmxlZCkge1xuXHRcdFx0dGhpcy4jc2l6ZSA9IDA7XG5cdFx0XHR0aGlzLiNtYXhTaXplID0gMDtcblx0XHRcdHRoaXMuY2xlYXIoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy4jc2l6ZSA9IGFTaXplO1xuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IE1hdGguZmxvb3IoYVNpemUgKiAxLjEpO1xuXHRcdFx0dGhpcy4jdHJpbSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIGFuIGVudHJ5IGlzIGhlbGQgdW5kZXIgdGhlIGtleS4gQSBkaXNhYmxlZCBjYWNoZSBob2xkcyBub25lLiBBc2tpbmcgZG9lcyBub3QgY291bnQgYXMgYVxuXHQgKiBoaXQsIHNvIGl0IGxlYXZlcyB0aGUgZXZpY3Rpb24gb3JkZXIgYWxvbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRoYXMoa2V5KSB7XG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gdGhpcy4jZW50cnlNYXAuaGFzKGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvZGUgaGVsZCB1bmRlciB0aGUga2V5LCBvciBudWxsIHdoZXJlIG5vbmUgaXMgaGVsZCBvciB0aGUgY2FjaGUgaXMgZGlzYWJsZWQuIEEgaGl0XG5cdCAqIHJlZnJlc2hlcyB0aGUgZW50cnksIHNvIGl0IGlzIGV2aWN0ZWQgbGFzdC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7P0Z1bmN0aW9ufVxuXHQgKi9cblx0Z2V0KGtleSkge1xuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm4gbnVsbDtcblx0XHRjb25zdCBlbnRyeSA9IHRoaXMuI2VudHJ5TWFwLmdldChrZXkpO1xuXHRcdGlmIChlbnRyeSkge1xuXHRcdFx0ZW50cnkubGFzdEhpdCA9ICsrdGhpcy4jY2xvY2s7XG5cdFx0XHRyZXR1cm4gZW50cnkudmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhvbGRzIHRoZSBjb2RlIHVuZGVyIHRoZSBrZXksIHJlcGxhY2luZyB3aGF0IHdhcyBoZWxkIHRoZXJlLCBhbmQgcmVmcmVzaGVzIHRoZSBlbnRyeS4gT25jZSB0aGVcblx0ICogY2FjaGUgcmVhY2hlcyBhIHRlbnRoIHBhc3QgaXRzIHNpemUsIHRoZSBsZWFzdCByZWNlbnRseSB1c2VkIGVudHJpZXMgYXJlIGV2aWN0ZWQgZG93biB0byB0aGVcblx0ICogc2l6ZS5cblx0ICogQSBkaXNhYmxlZCBjYWNoZSBrZWVwcyBub3RoaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNvZGVcblx0ICovXG5cdHNldChrZXksIGNvZGUpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuO1xuXHRcdGxldCBlbnRyeSA9IHRoaXMuI2VudHJ5TWFwLmdldChrZXkpO1xuXHRcdGlmIChlbnRyeSkge1xuXHRcdFx0ZW50cnkubGFzdEhpdCA9ICsrdGhpcy4jY2xvY2s7XG5cdFx0XHRlbnRyeS52YWx1ZSA9IGNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVudHJ5ID0ge1xuXHRcdFx0XHRsYXN0SGl0OiArK3RoaXMuI2Nsb2NrLFxuXHRcdFx0XHRrZXksXG5cdFx0XHRcdHZhbHVlOiBjb2RlLFxuXHRcdFx0fTtcblx0XHRcdHRoaXMuI2VudHJpZXMucHVzaChlbnRyeSk7XG5cdFx0XHR0aGlzLiNlbnRyeU1hcC5zZXQoa2V5LCBlbnRyeSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuI2VudHJ5TWFwLnNpemUgPj0gdGhpcy4jbWF4U2l6ZSkgdGhpcy4jdHJpbSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERyb3BzIGV2ZXJ5IGVudHJ5LiBUaGUgc2l6ZSBzdGF5cyBhcyBpdCBpcy5cblx0ICovXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuI2VudHJpZXMgPSBbXTtcblx0XHR0aGlzLiNlbnRyeU1hcCA9IG5ldyBNYXAoKTtcblx0fVxuXG5cdCN0cmltKCkge1xuXHRcdHRoaXMuI2VudHJpZXMuc29ydCgoYSwgYikgPT4gYi5sYXN0SGl0IC0gYS5sYXN0SGl0KTtcblx0XHRpZiAodGhpcy4jZW50cmllcy5sZW5ndGggPiB0aGlzLiNzaXplKSB7XG5cdFx0XHRjb25zdCBlbnRyaWVzVG9SZW1vdmUgPSB0aGlzLiNlbnRyaWVzLnNwbGljZSh0aGlzLiNzaXplKTtcblx0XHRcdGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllc1RvUmVtb3ZlKSB7XG5cdFx0XHRcdHRoaXMuI2VudHJ5TWFwLmRlbGV0ZShlbnRyeS5rZXkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcbiIsIi8qKlxuICogQSBkZWZhdWx0IHZhbHVlIGFzIHRoZSByZXNvbHZlciBjYXJyaWVzIGl0LCB3aGljaCB0ZWxscyBcIm5vIGRlZmF1bHQgcGFzc2VkXCIgYXBhcnQgZnJvbSBcInRoZVxuICogZGVmYXVsdCBpcyB1bmRlZmluZWRcIi5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRGVmYXVsdFZhbHVlXG4gKiBAdHlwZWRlZiB7RGVmYXVsdFZhbHVlfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWZhdWx0VmFsdWUge1xuXHQvKipcblx0ICogQ3JlYXRlZCB3aXRob3V0IGFuIGFyZ3VtZW50LCBpdCBjYXJyaWVzIG5vIGRlZmF1bHQ7IGNyZWF0ZWQgd2l0aCBvbmUsIGl0IGNhcnJpZXMgdGhhdFxuXHQgKiBhcmd1bWVudCwgdW5kZWZpbmVkIGluY2x1ZGVkLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHsqfSBbdmFsdWVdXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZSl7XG5cdFx0LyoqIEB0eXBlIHtib29sZWFufSB3aGV0aGVyIGEgZGVmYXVsdCB3YXMgcGFzc2VkICovXG5cdFx0dGhpcy5oYXNWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMTtcblx0XHQvKiogQHR5cGUgeyp9IHRoZSBkZWZhdWx0LCBtZWFuaW5nZnVsIG9ubHkgd2hlcmUgaGFzVmFsdWUgaXMgdHJ1ZSAqL1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxufTtcbiIsIi8qKlxuICogVGhlIGludGVyZmFjZSBldmVyeSBleGVjdXRlciBpbXBsZW1lbnRzLiBBbiBleGVjdXRlciBydW5zIHN0YXRlbWVudHMgYW5kXG4gKiBob2xkcyBubyBjb250ZXh0IG9mIGl0cyBvd246IHRoZSBjb250ZXh0IGFsd2F5cyBjb21lcyBmcm9tIHRoZSByZXNvbHZlci5cbiAqXG4gKiBBbiBvd24gaW1wbGVtZW50YXRpb24gaXMgYnVpbHQgZnJvbSBpdCBieSBoYW5kaW5nIG92ZXIgdGhlIGZ1bmN0aW9uIHRoYXQgZG9lcyB0aGUgd29yay5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXhlY3V0ZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhlY3V0ZXJ7XG5cblx0I2V4ZWN1dGlvbjtcblxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZywgb2JqZWN0KTogKn0gb3B0aW9uLmV4ZWN1dGlvbiBydW5zIGEgc3RhdGVtZW50IG92ZXIgYSBjb250ZXh0IGFuZFxuXHQgKiBhbnN3ZXJzIHRoZSByZXN1bHQsIGEgcHJvbWlzZSBpbmNsdWRlZC4gV2l0aG91dCBvbmUsIGV2ZXJ5IGV4ZWN1dGlvbiB0aHJvd3MuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih7ZXhlY3V0aW9ufSA9IHt9KXtcblx0XHR0aGlzLiNleGVjdXRpb24gPSBleGVjdXRpb24gfHwgKCgpID0+IHt0aHJvdyBuZXcgRXJyb3IoXCJub3QgaW1wbGVtZW50ZWRcIil9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGEgc3RhdGVtZW50IG92ZXIgYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudCB0aGUgc3RhdGVtZW50LCB3aXRob3V0IGRlbGltaXRlcnMgYW5kIHNjb3BlIHByZWZpeFxuXHQgKiBAcGFyYW0ge29iamVjdH0gYUNvbnRleHQgdGhlIGNvbnRleHQgb2YgdGhlIHJlc29sdmVyIHRoZSBzdGF0ZW1lbnQgaXMgZXZhbHVhdGVkIG9uXG5cdCAqIEByZXR1cm5zIHsqfSB3aGF0IHRoZSBleGVjdXRpb24gYW5zd2VycywgYSBwcm9taXNlIGluY2x1ZGVkXG5cdCAqL1xuXHRleGVjdXRlKGFTdGF0ZW1lbnQsIGFDb250ZXh0KXtcblx0XHRyZXR1cm4gdGhpcy4jZXhlY3V0aW9uKGFTdGF0ZW1lbnQsIGFDb250ZXh0KTtcblx0fVxufTtcbiIsImltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi9FeGVjdXRlci5qc1wiO1xuXG5jb25zdCBFWEVDVVRFUlMgPSBuZXcgTWFwKCk7XG5cbi8qKlxuICogS2VlcHMgYW4gZXhlY3V0ZXIgdW5kZXIgYSBuYW1lLCBzbyBhIHJlc29sdmVyIGNhbiBiZSBnaXZlbiB0aGUgbmFtZSBpbnN0ZWFkIG9mIHRoZSBpbnN0YW5jZS5cbiAqIEFuIGV4ZWN1dGVyIGFscmVhZHkga2VwdCB1bmRlciB0aGUgbmFtZSBpcyByZXBsYWNlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEBwYXJhbSB7RXhlY3V0ZXJ9IGFuRXhlY3V0ZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyID0gKGFOYW1lLCBhbkV4ZWN1dGVyKSA9PiB7XG5cdEVYRUNVVEVSUy5zZXQoYU5hbWUsIGFuRXhlY3V0ZXIpO1xufTtcblxuLyoqXG4gKiBUaGUgZXhlY3V0ZXIga2VwdCB1bmRlciBhIG5hbWUuIEFsc28gdGhlIGRlZmF1bHQgZXhwb3J0IG9mIHRoaXMgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhTmFtZVxuICogQHJldHVybnMge0V4ZWN1dGVyfVxuICogQHRocm93cyB7RXJyb3J9IHdoZXJlIG5vIGV4ZWN1dGVyIGlzIGtlcHQgdW5kZXIgdGhlIG5hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4ZWN1dGVyID0gKGFOYW1lKSA9PiB7XG5cdGNvbnN0IGV4ZWN1dGVyID0gRVhFQ1VURVJTLmdldChhTmFtZSk7XG5cdGlmICghZXhlY3V0ZXIpIHRocm93IG5ldyBFcnJvcihgRXhlY3V0ZXIgXCIke2FOYW1lfVwiIGlzIG5vdCByZWdpc3RlcmVkIWApO1xuXHRyZXR1cm4gZXhlY3V0ZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRFeGVjdXRlcjtcbiIsImltcG9ydCBPYmplY3RVdGlscyBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvT2JqZWN0VXRpbHMuanNcIjtcbmltcG9ydCBEZWZhdWx0VmFsdWUgZnJvbSBcIi4vRGVmYXVsdFZhbHVlLmpzXCI7XG5pbXBvcnQgeyBnZXRFeGVjdXRlciB9IGZyb20gXCIuL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBEZWZhdWx0RXhlY3V0ZXIgZnJvbSBcIi4vZXhlY3V0ZXIvQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFJlc29sdmVyQ29udGV4dEhhbmRsZSBmcm9tIFwiLi9SZXNvbHZlckNvbnRleHRIYW5kbGUuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IHsgc2NhbiwgcGFyc2VFeHByZXNzaW9uIH0gZnJvbSBcIi4vRXhwcmVzc2lvblNjYW5uZXIuanNcIjtcbmltcG9ydCB7IGlzTmFtZUNoYXJhY3RlciwgdHJpbVRvTnVsbCB9IGZyb20gXCIuL1V0aWxzLmpzXCI7XG5cbi8qKiBAdHlwZSB7RXhlY3V0ZXJ9ICovXG5sZXQgREVGQVVMVF9FWEVDVVRFUiA9IERlZmF1bHRFeGVjdXRlcjtcblxuY29uc3QgREVGQVVMVF9OT1RfREVGSU5FRCA9IG5ldyBEZWZhdWx0VmFsdWUoKTtcbmNvbnN0IHRvRGVmYXVsdFZhbHVlID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSkgcmV0dXJuIHZhbHVlO1xuXG5cdHJldHVybiBuZXcgRGVmYXVsdFZhbHVlKHZhbHVlKTtcbn07XG5cbmxldCBOQU1FX0NPVU5URVIgPSAwO1xuLyoqXG4gKiBUaGUgbmFtZSBhIHJlc29sdmVyIGNhcnJpZXMgd2hlcmUgdGhlIGNhbGxlciBwYXNzZWQgbm9uZS4gT25seSB1bmlxdWVuZXNzIGlzIHByb21pc2VkLCB0aGUgc2hhcGVcbiAqIGlzIG5vdC5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5jb25zdCBnZW5lcmF0ZU5hbWUgPSAoKSA9PiBgRVIkeysrTkFNRV9DT1VOVEVSfWA7XG5cbi8qKlxuICogVGhlIG5hbWUgYSByZXNvbHZlciBrZWVwczogdGhlIG9uZSBwYXNzZWQsIHRyaW1tZWQgYW5kIGhlbGQgdG8gdGhlIGNoYXJhY3RlcnMgYSBzY29wZSBuYW1lIG1heVxuICogY2FycnksIG9yIGEgZ2VuZXJhdGVkIG9uZSB3aGVyZSBub25lIHdhcyBwYXNzZWQuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfSBhTmFtZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIG5hbWUgaXMgbm8gc3RyaW5nLCBlbXB0eSwgb3IgY2FycmllcyBhIGNoYXJhY3RlciBhIHNjb3BlIG5hbWUgY2Fubm90XG4gKiBjYXJyeVxuICovXG5jb25zdCB0b05hbWUgPSAoYU5hbWUpID0+IHtcblx0aWYgKGFOYW1lID09IG51bGwpIHJldHVybiBnZW5lcmF0ZU5hbWUoKTtcblx0aWYgKHR5cGVvZiBhTmFtZSAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIG9wdGlvbiBuYW1lIHRha2VzIGEgc3RyaW5nLCBub3QgYSAke3R5cGVvZiBhTmFtZX0hYCk7XG5cblx0Y29uc3QgbmFtZSA9IHRyaW1Ub051bGwoYU5hbWUpO1xuXHRpZiAobmFtZSA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVGhlIG9wdGlvbiBuYW1lIHRha2VzIGEgbmFtZSwgbm90IGFuIGVtcHR5IHN0cmluZyFcIik7XG5cdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBuYW1lLmxlbmd0aDsgaW5kZXgrKylcblx0XHRpZiAoIWlzTmFtZUNoYXJhY3RlcihuYW1lLmNoYXJDb2RlQXQoaW5kZXgpKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIG5hbWUgXCIke25hbWV9XCIgY2FycmllcyBhIGNoYXJhY3RlciBhIHNjb3BlIG5hbWUgY2Fubm90IGNhcnJ5IC0gb25seSBBU0NJSSBsZXR0ZXJzLCBkaWdpdHMsIFwiLVwiLCBcIl9cIiBhbmQgd2hpdGVzcGFjZSBhcmUgYWxsb3dlZCFgKTtcblxuXHRyZXR1cm4gbmFtZTtcbn07XG5cbi8qKlxuICogVGhlIHNjb3BlIG5hbWUgYSBmaWx0ZXIgb2YgdGhlIGRhdGEgbWV0aG9kcyBzZWxlY3RzLCByZWFkIGxpa2UgYSBzY29wZSBwcmVmaXg6IHRyaW1tZWQsIGFuZCBudWxsXG4gKiB3aGVyZSB0aGVyZSBpcyBub25lLlxuICpcbiAqIEBwYXJhbSB7P3N0cmluZ30gYUZpbHRlclxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBmaWx0ZXIgaXMgbm8gc3RyaW5nXG4gKi9cbmNvbnN0IHRvU2NvcGUgPSAoYUZpbHRlcikgPT4ge1xuXHRpZiAoYUZpbHRlciA9PSBudWxsKSByZXR1cm4gbnVsbDtcblx0aWYgKHR5cGVvZiBhRmlsdGVyICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBBIGZpbHRlciBpcyBhIHNjb3BlIG5hbWUsIG5vdCBhICR7dHlwZW9mIGFGaWx0ZXJ9IWApO1xuXG5cdHJldHVybiB0cmltVG9OdWxsKGFGaWx0ZXIpO1xufTtcblxuLyoqXG4gKiBUaGUgcHJvcGVydHkga2V5IGEgZGF0YSBtZXRob2Qgd29ya3Mgd2l0aCAtIGEgc3RyaW5nLCBcIlwiIGluY2x1ZGVkLCBhIHN5bWJvbCwgb3IgYSBudW1iZXIsIHdoaWNoXG4gKiBuYW1lcyB0aGUgc2FtZSBwcm9wZXJ0eSBhcyBpdHMgc3RyaW5nIGFuZCBpcyBsb29rZWQgdXAgYXMgb25lLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxzeW1ib2x9IGFLZXlcbiAqIEByZXR1cm5zIHtzdHJpbmd8c3ltYm9sfVxuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUga2V5IGlzIG5vbmUsIG9yIG9mIGEgdHlwZSBubyBwcm9wZXJ0eSBrZXkgaGFzXG4gKi9cbmNvbnN0IHRvS2V5ID0gKGFLZXkpID0+IHtcblx0Y29uc3QgdHlwZSA9IHR5cGVvZiBhS2V5O1xuXHRpZiAodHlwZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlID09PSBcInN5bWJvbFwiKSByZXR1cm4gYUtleTtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBTdHJpbmcoYUtleSk7XG5cblx0dGhyb3cgbmV3IFR5cGVFcnJvcihgQSBrZXkgaXMgYSBzdHJpbmcsIGEgbnVtYmVyIG9yIGEgc3ltYm9sLCBub3QgJHthS2V5ID09IG51bGwgPyBcIm1pc3NpbmdcIiA6IGBhICR7dHlwZX1gfSFgKTtcbn07XG5cbmNvbnN0IHdhcm5GYWlsZWRTdGF0ZW1lbnQgPSAoYVN0YXRlbWVudCwgYW5FcnJvcikgPT4ge1xuXHRjb25zb2xlLndhcm4oYEV4ZWN1dGlvbiBlcnJvciBvbiBzdGF0ZW1lbnQhXG5cdFx0c3RhdGVtZW50OlxuXHRcdCR7YVN0YXRlbWVudH1cblx0XHRlcnJvcjpcblx0XHQke2FuRXJyb3J9XG5cdFx0YCk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Kn0gYVJlc3VsdFxuICogQHBhcmFtIHtEZWZhdWx0VmFsdWV9IGFEZWZhdWx0XG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuY29uc3Qgd2l0aERlZmF1bHQgPSAoYVJlc3VsdCwgYURlZmF1bHQpID0+IHtcblx0aWYgKGFSZXN1bHQgIT09IG51bGwgJiYgdHlwZW9mIGFSZXN1bHQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBhUmVzdWx0O1xuXHRlbHNlIGlmIChhRGVmYXVsdC5oYXNWYWx1ZSkgcmV0dXJuIGFEZWZhdWx0LnZhbHVlO1xuXHRyZXR1cm4gYVJlc3VsdDtcbn07XG5cbi8vIHRoZSBmaXJzdCBhcmd1bWVudCBvZiBhIHN0YXRpYyBlbnRyeSBwb2ludCBpcyBhIHN0cmluZywgb3IgYSBjb25maWd1cmF0aW9uIG9iamVjdFxuY29uc3QgaXNDb25maWd1cmF0aW9uID0gKGFWYWx1ZSkgPT4gYVZhbHVlICE9PSBudWxsICYmIHR5cGVvZiBhVmFsdWUgPT09IFwib2JqZWN0XCI7XG5cbi8vIGEgY29uZmlndXJhdGlvbiBjb3VudHMgYXMgcGFzc2luZyBhIGRlZmF1bHQgd2hlcmUgaXQgY2FycmllcyB0aGUga2V5LCB3aGF0ZXZlciBpdCBob2xkc1xuY29uc3QgZGVmYXVsdE9mID0gKGFDb25maWd1cmF0aW9uKSA9PiAoXCJkZWZhdWx0VmFsdWVcIiBpbiBhQ29uZmlndXJhdGlvbiA/IGFDb25maWd1cmF0aW9uLmRlZmF1bHRWYWx1ZSA6IERFRkFVTFRfTk9UX0RFRklORUQpO1xuXG4vKipcbiAqIFJlc29sdmVzIGAkey4uLn1gIGV4cHJlc3Npb25zIGFnYWluc3QgYSBjb250ZXh0LiBBIHJlc29sdmVyIG1heSBoYXZlIGEgcGFyZW50LCBhbmQgdGhlIHJlc29sdmVyc1xuICogZnJvbSBpdCB1cCB0byB0aGUgcm9vdCBmb3JtIGEgY2hhaW46IGEgbmFtZSBpcyBsb29rZWQgdXAgZnJvbSB0aGlzIHJlc29sdmVyIHRvd2FyZHMgdGhlIHJvb3QsIGFuZFxuICogYSBzY29wZSBwcmVmaXggYCR7bmFtZTo6c3RhdGVtZW50fWAgYWRkcmVzc2VzIG9uZSByZXNvbHZlciBvZiB0aGUgY2hhaW4uXG4gKlxuICogVXNlZCBzdGF0aWNhbGx5IHdpdGggYW4gYWQtaG9jIGNvbnRleHQgKGByZXNvbHZlYCwgYHJlc29sdmVUZXh0YCksIG9yIGFzIGFuIGluc3RhbmNlIHdpdGhpbiBhXG4gKiBjaGFpbi5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyXG4gKiBAdHlwZWRlZiB7RXhwcmVzc2lvblJlc29sdmVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uUmVzb2x2ZXIge1xuXHQvKipcblx0ICogU2V0cyB0aGUgZXhlY3V0ZXIgYSByZXNvbHZlciB3aXRob3V0IGEgcGFyZW50IHRha2VzIHdoZXJlIHRoZSBgZXhlY3V0ZXJgIG9wdGlvbiBpcyBsZWZ0IG91dCxcblx0ICogYW5kIHNvIHRoZSBleGVjdXRlciBvZiB0aGUgc3RhdGljIGVudHJ5IHBvaW50cy5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8RXhlY3V0ZXJ9IGFuRXhlY3V0ZXIgYSByZWdpc3RlcmVkIG5hbWUgb3IgYW4gYEV4ZWN1dGVyYCBpbnN0YW5jZVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSB2YWx1ZSBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBgRXhlY3V0ZXJgIGluc3RhbmNlXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSBhIG5hbWUgaXMgbm90IHJlZ2lzdGVyZWRcblx0ICovXG5cdHN0YXRpYyBzZXQgZGVmYXVsdEV4ZWN1dGVyKGFuRXhlY3V0ZXIpIHtcblx0XHRpZiAoYW5FeGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSBERUZBVUxUX0VYRUNVVEVSID0gYW5FeGVjdXRlcjtcblx0XHRlbHNlIGlmICh0eXBlb2YgYW5FeGVjdXRlciA9PT0gXCJzdHJpbmdcIikgREVGQVVMVF9FWEVDVVRFUiA9IGdldEV4ZWN1dGVyKGFuRXhlY3V0ZXIpO1xuXHRcdGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlciB0YWtlcyBhIHJlZ2lzdGVyZWQgbmFtZSBvciBhbiBFeGVjdXRlciwgbm90IGEgJHt0eXBlb2YgYW5FeGVjdXRlcn0hYCk7XG5cdFx0Y29uc29sZS5pbmZvKGBDaGFuZ2VkIGRlZmF1bHQgZXhlY3V0ZXIgZm9yIEV4cHJlc3Npb25SZXNvbHZlciFgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZXhlY3V0ZXIgYSByZXNvbHZlciB3aXRob3V0IGEgcGFyZW50IHRha2VzIHdoZXJlIHRoZSBgZXhlY3V0ZXJgIG9wdGlvbiBpcyBsZWZ0IG91dDtcblx0ICogYGNvbnRleHQtZGVjb25zdHJ1Y3Rpb24tZXhlY3V0ZXJgIHVudGlsIGl0IGlzIHNldC5cblx0ICpcblx0ICogQHR5cGUge0V4ZWN1dGVyfVxuXHQgKi9cblx0c3RhdGljIGdldCBkZWZhdWx0RXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRVhFQ1VURVI7XG5cdH1cblxuXHQvKiogQHR5cGUge3N0cmluZ3xudWxsfSAqL1xuXHQjbmFtZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge0V4ZWN1dGVyfG51bGx9ICovXG5cdCNleGVjdXRlciA9IG51bGw7XG5cdC8qKiBAdHlwZSB7b2JqZWN0fG51bGx9ICovXG5cdCNjb250ZXh0ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH0gKi9cblx0I2NvbnRleHRIYW5kbGUgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuY29udGV4dF0gYW55IG9iamVjdDsgd2hlcmUgbm9uZSBpcyBwYXNzZWQgLSBsZWZ0IG91dCwgbnVsbCBvclxuXHQgKiB1bmRlZmluZWQgLSB0aGUgcmVzb2x2ZXIgaGFzIG5vIGNvbnRleHQgb2YgaXRzIG93blxuXHQgKiBAcGFyYW0ge0V4cHJlc3Npb25SZXNvbHZlcn0gW29wdGlvbnMucGFyZW50PW51bGxdXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gW29wdGlvbnMubmFtZT1udWxsXSBrZXB0IHRyaW1tZWQ7IHdoZXJlIG5vbmUgaXMgcGFzc2VkLCBvbmUgaXMgZ2VuZXJhdGVkXG5cdCAqIEBwYXJhbSB7KHN0cmluZ3xFeGVjdXRlcil9IFtvcHRpb25zLmV4ZWN1dGVyXSB0aGUgcmVnaXN0ZXJlZCBuYW1lIG9mIGFuIGV4ZWN1dGVyLCBvciBhblxuXHQgKiBgRXhlY3V0ZXJgIGluc3RhbmNlLiBBIG5hbWUgdGhhdCBpcyBub3QgcmVnaXN0ZXJlZCB0aHJvd3M7IGFuIGluc3RhbmNlIG5lZWRzIG5vIHJlZ2lzdHJhdGlvbixcblx0ICogYmVjYXVzZSBpdCBhZGRyZXNzZXMgdGhlIGV4ZWN1dGVyIGRpcmVjdGx5LiBOdWxsIGFuZCB1bmRlZmluZWQgY291bnQgYXMgbGVmdCBvdXQuIFdpdGhvdXQgdGhlXG5cdCAqIG9wdGlvbiB0aGUgcmVzb2x2ZXIgdGFrZXMgdGhlIGV4ZWN1dGVyIG9mIGl0cyBwYXJlbnQsIGFuZCBvbmUgd2l0aG91dCBhIHBhcmVudFxuXHQgKiBgRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlcmAuXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHBhcmVudCBpcyBubyByZXNvbHZlciwgdGhlIGNvbnRleHQgYSBwcmltaXRpdmUsIHRoZSBuYW1lIG5vXG5cdCAqIHN0cmluZywgZW1wdHksIG9yIGNhcnJ5aW5nIGEgY2hhcmFjdGVyIGEgc2NvcGUgbmFtZSBjYW5ub3QgY2FycnksIG9yIHRoZSBleGVjdXRlciBuZWl0aGVyIGFcblx0ICogc3RyaW5nIG5vciBhbiBgRXhlY3V0ZXJgIGluc3RhbmNlXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSB0aGUgZXhlY3V0ZXIgaXMgbmFtZWQgYW5kIHRoZSBuYW1lIGlzIG5vdCByZWdpc3RlcmVkXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih7IGNvbnRleHQsIHBhcmVudCA9IG51bGwsIG5hbWUgPSBudWxsLCBleGVjdXRlciB9ID0ge30pIHtcblx0XHRpZiAocGFyZW50ICE9IG51bGwgJiYgIShwYXJlbnQgaW5zdGFuY2VvZiBFeHByZXNzaW9uUmVzb2x2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVGhlIG9wdGlvbiBwYXJlbnQgdGFrZXMgYW4gRXhwcmVzc2lvblJlc29sdmVyIVwiKTtcblx0XHRpZiAoY29udGV4dCAhPSBudWxsICYmIHR5cGVvZiBjb250ZXh0ICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBjb250ZXh0ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBvcHRpb24gY29udGV4dCB0YWtlcyBhbiBvYmplY3QsIG5vdCBhICR7dHlwZW9mIGNvbnRleHR9IWApO1xuXHRcdGlmIChleGVjdXRlciAhPSBudWxsICYmIHR5cGVvZiBleGVjdXRlciAhPT0gXCJzdHJpbmdcIiAmJiAhKGV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgb3B0aW9uIGV4ZWN1dGVyIHRha2VzIGEgcmVnaXN0ZXJlZCBuYW1lIG9yIGFuIEV4ZWN1dGVyLCBub3QgYSAke3R5cGVvZiBleGVjdXRlcn0hYCk7XG5cdFx0dGhpcy4jbmFtZSA9IHRvTmFtZShuYW1lKTtcblxuXHRcdGlmKGV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpIHRoaXMuI2V4ZWN1dGVyID0gIGV4ZWN1dGVyO1xuXHRcdGVsc2UgaWYgKHR5cGVvZiBleGVjdXRlciA9PT0gXCJzdHJpbmdcIikgdGhpcy4jZXhlY3V0ZXIgPSBnZXRFeGVjdXRlcihleGVjdXRlcik7XG5cdFx0ZWxzZSBpZihwYXJlbnQgIT0gbnVsbCkgdGhpcy4jZXhlY3V0ZXIgPSBwYXJlbnQuZXhlY3V0ZXI7XG5cdFx0ZWxzZSB0aGlzLiNleGVjdXRlciA9IEV4cHJlc3Npb25SZXNvbHZlci5kZWZhdWx0RXhlY3V0ZXI7XG5cblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQ7XG5cdFx0dGhpcy4jY29udGV4dEhhbmRsZSA9IG5ldyBSZXNvbHZlckNvbnRleHRIYW5kbGUoY29udGV4dCAsIHRoaXMuI3BhcmVudCA/IHRoaXMuI3BhcmVudC5jb250ZXh0SGFuZGxlIDogbnVsbCk7XG5cdFx0dGhpcy4jY29udGV4dCA9IHRoaXMuI2NvbnRleHRIYW5kbGUuY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmFtZSB0aGlzIHJlc29sdmVyIGlzIGFkZHJlc3NlZCBieSBpbiBhIHNjb3BlIHByZWZpeCBhbmQgYSBmaWx0ZXIuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0Z2V0IG5hbWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI25hbWU7XG5cdH1cblxuXHQvKipcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtFeHByZXNzaW9uUmVzb2x2ZXJ8bnVsbH1cblx0ICovXG5cdGdldCBwYXJlbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI3BhcmVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29udGV4dCBvZiB0aGlzIHJlc29sdmVyIGFzIGFuIGV4cHJlc3Npb24gc2VlcyBpdC4gSXQgaXMgbm90IHRoZSBvYmplY3QgcGFzc2VkIHRvIHRoZVxuXHQgKiBjb25zdHJ1Y3RvciBhbmQgaXQgYW5zd2VycyBmb3IgdGhlIHdob2xlIGNoYWluLiBPdmVyIHRoZSBnbG9iYWwgb2JqZWN0IGl0IGlzIHRoZSBnbG9iYWxcblx0ICogb2JqZWN0IGl0c2VsZi5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtvYmplY3R9XG5cdCAqL1xuXHRnZXQgY29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgZXhlY3V0ZXIgaW4gdXNlLCBjaG9zZW4gb25jZSBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7RXhlY3V0ZXJ9XG5cdCAqL1xuXHRnZXQgZXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbnRlcm5hbCBoYW5kbGUgYmVoaW5kIHRoZSBjb250ZXh0LCBwdWJsaWMgZm9yIGByZXNldENhY2hlYC5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV9XG5cdCAqL1xuXHRnZXQgY29udGV4dEhhbmRsZSgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dEhhbmRsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmFtZXMgb2YgZXZlcnkgcmVzb2x2ZXIgZnJvbSB0aGUgcm9vdCBkb3duIHRvIHRoaXMgb25lLCBhcyBhIHBhdGggLSBgL3Jvb3Qv4oCmL3RoaXNgLiBJdFxuXHQgKiBkZXNjcmliZXMgdGhlIHN0cnVjdHVyZSBhbmQgZG9lcyBub3QgY2hhbmdlLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdGdldCBjaGFpbigpIHtcblx0XHQvLyBhIGxvb3AsIG5vdCBhIHJlY3Vyc2lvbiBpbnRvIHRoZSBwYXJlbnQ6IGEgZGVlcCBjaGFpbiBvdmVyZmxvd2VkIHRoZSBzdGFja1xuXHRcdGxldCBwYXRoID0gXCJcIjtcblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0cGF0aCA9IGAvJHtyZXNvbHZlci5uYW1lfSR7cGF0aH1gO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5hbWVzIG9mIHRoZSByZXNvbHZlcnMgZnJvbSB0aGUgcm9vdCBkb3duIHRvIHRoaXMgb25lIHRoYXQgcHJvdmlkZSBhIGNvbnRleHQsIGFzIGEgcGF0aFxuXHQgKiBsaWtlIGBjaGFpbmAuIEEgcmVzb2x2ZXIgYnVpbHQgd2l0aG91dCBhIGNvbnRleHQgam9pbnMgaXQgdGhlIG1vbWVudCBhIHZhbHVlIGlzIHNldCBvbiBpdCwgc29cblx0ICogdGhpcyBkZXNjcmliZXMgYSBzdGF0ZSBhbmQgbm90IHRoZSBzdHJ1Y3R1cmUuIFdoZXJlIG5vbmUgcHJvdmlkZXMgb25lLFxuXHQgKiB0aGUgYW5zd2VyIGlzIHRoZSBlbXB0eSBzdHJpbmcuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0Z2V0IGVmZmVjdGl2ZUNoYWluKCkge1xuXHRcdC8vIGEgbG9vcCwgbm90IGEgcmVjdXJzaW9uIGludG8gdGhlIHBhcmVudDogYSBkZWVwIGNoYWluIG92ZXJmbG93ZWQgdGhlIHN0YWNrXG5cdFx0bGV0IHBhdGggPSBcIlwiO1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5wcm92aWRlc0NvbnRleHQpIHBhdGggPSBgLyR7cmVzb2x2ZXIubmFtZX0ke3BhdGh9YDtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZXh0cyBvZiBleGFjdGx5IHRoZSByZXNvbHZlcnMgYGVmZmVjdGl2ZUNoYWluYCBuYW1lcywgYXMgYW4gYXJyYXksIHRoaXMgcmVzb2x2ZXInc1xuXHQgKiBmaXJzdCBhbmQgdGhlIHJvb3QncyBsYXN0LiBBIHN0YXRlIGxpa2UgYGVmZmVjdGl2ZUNoYWluYC5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtBcnJheTxvYmplY3Q+fVxuXHQgKi9cblx0Z2V0IGNvbnRleHRDaGFpbigpIHtcblx0XHRjb25zdCByZXN1bHQgPSBbXTtcblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0aWYgKHJlc29sdmVyLmNvbnRleHRIYW5kbGUucHJvdmlkZXNDb250ZXh0KSByZXN1bHQucHVzaChyZXNvbHZlci5jb250ZXh0KTtcblxuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgcmVzb2x2ZXIgYSBjYWxsIGFkZHJlc3NlczogdGhlIG9uZSB0aGUgZmlsdGVyIG5hbWVzLCBvciB0aGUgcmVzb2x2ZXIgdGhlIGNhbGwgd2FzIG1hZGUgb25cblx0ICogd2hlcmUgbm8gZmlsdGVyIGlzIGdpdmVuLlxuXHQgKlxuXHQgKiBBIGZpbHRlciBzZWxlY3RzIGV4YWN0bHkgb25lIHJlc29sdmVyLCB0aGUgbmVhcmVzdCBvZiB0aGF0IG5hbWUgZnJvbSBoZXJlIHRvd2FyZHMgdGhlIHJvb3QsIGFuZFxuXHQgKiBhIGZpbHRlciBtYXRjaGluZyBub25lIHRocm93cyAtIGEgd3JvbmcgbmFtZSBpbiBhbiBBUEkgY2FsbCBpcyBhIG1pc3Rha2UgaW4gdGhlIGNhbGxpbmcgY29kZSxcblx0ICogdW5saWtlIGEgc2NvcGUgcHJlZml4IGluc2lkZSBhbiBleHByZXNzaW9uLCB3aGljaCBhbnN3ZXJzIHVuZGVmaW5lZC5cblx0ICpcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBhU2NvcGUgdGhlIGZpbHRlciBhcyBgdG9TY29wZWAgcmVhZHMgaXRcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcn1cblx0ICovXG5cdCNmaW5kUmVzb2x2ZXIoYVNjb3BlKSB7XG5cdFx0aWYgKCFhU2NvcGUpIHJldHVybiB0aGlzO1xuXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNyZXNvbHZlckZvclNjb3BlKGFTY29wZSk7XG5cdFx0aWYgKHJlc29sdmVyKSByZXR1cm4gcmVzb2x2ZXI7XG5cblx0XHR0aHJvdyBuZXcgRXJyb3IoYEZpbHRlciBcIiR7YVNjb3BlfVwiIG1hdGNoZXMgbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluIWApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBuZWFyZXN0IHJlc29sdmVyIGZyb20gaGVyZSB0byB0aGUgcm9vdCB0aGF0IGNhcnJpZXMgdGhlIHNjb3BlIG5hbWUsIG9yIG51bGwgd2hlcmUgbm9uZVxuXHQgKiBjYXJyaWVzIGl0LiBBIGZpbHRlciBhbmQgYSBzY29wZSBwcmVmaXggYW5zd2VyIGEgbWlzcyBkaWZmZXJlbnRseSwgc28gZWFjaCBjYWxsZXIgZG9lcyB0aGF0XG5cdCAqIGZvciBpdHNlbGYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhU2NvcGVcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcnxudWxsfVxuXHQgKi9cblx0I3Jlc29sdmVyRm9yU2NvcGUoYVNjb3BlKSB7XG5cdFx0Ly8gYSBsb29wLCBub3QgYSByZWN1cnNpb24gaW50byB0aGUgcGFyZW50OiBvbmUgY2FsbCBwZXIgcmVzb2x2ZXIgY2xpbWJlZCBvdmVyZmxvd2VkIHRoZVxuXHRcdC8vIHN0YWNrIG9uIGEgZGVlcCBjaGFpblxuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuI25hbWUgPT09IGFTY29wZSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci4jcGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRzIGEgc3RhdGVtZW50IHRvIHRoZSByZXNvbHZlciBpdCBhZGRyZXNzZXMgLSB0aGUgb25lIGl0cyBzY29wZSBwcmVmaXggbmFtZXMsIG9yIHRoaXMgb25lXG5cdCAqIHdpdGhvdXQgYSBwcmVmaXggLSBhbmQgYW5zd2VycyB3aGF0IHRoYXQgcmVzb2x2ZXIncyBleGVjdXRlciBhbnN3ZXJzLCBhIHByb21pc2UgaW5jbHVkZWQuIEFuXG5cdCAqIGVtcHR5IHN0YXRlbWVudCBhbmQgYSBwcmVmaXggbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluIGNhcnJpZXMgYW5zd2VyIHVuZGVmaW5lZCwgYW5kIHRoZSBkZWZhdWx0XG5cdCAqIGFwcGxpZXMgdG8gaXQgbGlrZSB0byBhbnkgb3RoZXIgcmVzdWx0LlxuXHQgKlxuXHQgKiBEZWxpYmVyYXRlbHkgbm90IGFzeW5jOiB0aGUgZW50cnkgcG9pbnQgYXdhaXRzIHRoZSBhbnN3ZXIgb25jZSwgYW5kIGEgc3luY2hyb25vdXMgdGhyb3cgb2YgdGhlXG5cdCAqIGV4ZWN1dGVyIGxhbmRzIGluIGl0cyBgdHJ5YCBhbGwgdGhlIHNhbWUuIEFuIGVycm9yIGlzIG5vdCBjYXVnaHQgaGVyZSwgYmVjYXVzZSB0aGUgdHdvIGVudHJ5XG5cdCAqIHBvaW50cyBhbnN3ZXIgaXQgZGlmZmVyZW50bHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gYVN0YXRlbWVudCB0cmltbWVkLCBhbmQgbnVsbCB3aGVyZSBpdCBpcyBlbXB0eVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGFTY29wZSB0aGUgc2NvcGUgcHJlZml4LCBudWxsIHdoZXJlIHRoZXJlIGlzIG5vbmVcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHQjZXhlY3V0ZShhU3RhdGVtZW50LCBhU2NvcGUpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IGFTY29wZSA/IHRoaXMuI3Jlc29sdmVyRm9yU2NvcGUoYVNjb3BlKSA6IHRoaXM7XG5cdFx0Ly8gYW4gZW1wdHkgc3RhdGVtZW50IGFuc3dlcnMgdW5kZWZpbmVkLCB0aGUgc2FtZSBhcyBgcmV0dXJuO2AgaW4gSmF2YVNjcmlwdFxuXHRcdGlmIChyZXNvbHZlciA9PT0gbnVsbCB8fCBhU3RhdGVtZW50ID09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIuI2V4ZWN1dGVyLmV4ZWN1dGUoYVN0YXRlbWVudCwgcmVzb2x2ZXIuI2NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBuZWFyZXN0IHJlc29sdmVyIGZyb20gaGVyZSB0byB0aGUgcm9vdCB0aGF0IGNhcnJpZXMgdGhlIGtleSBpdHNlbGYsIG9yIG51bGwgd2hlcmUgbm9uZVxuXHQgKiBjYXJyaWVzIGl0LiBXaGF0IGRlY2lkZXMgaXMgd2hldGhlciBhIHJlc29sdmVyIHByb3ZpZGVzIHRoZSBuYW1lLCBub3Qgd2hhdCBpdCBob2xkcy5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9XG5cdCAqL1xuXHQjcmVzb2x2ZXJGb3JLZXkoa2V5KSB7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLmhhc05hbWUoa2V5KSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYSB2YWx1ZSBhbG9uZyB0aGUgY2hhaW4sIGZyb20gdGhlIGFkZHJlc3NlZCByZXNvbHZlciB0b3dhcmRzIHRoZSByb290LiBXaXRob3V0IGEga2V5IC1cblx0ICogbnVsbCBvciB1bmRlZmluZWQgLSBpdCBhbnN3ZXJzIHRoZSB3aG9sZSBjb250ZXh0IG9mIHRoYXQgcmVzb2x2ZXIsIHdoaWNoIHN0aWxsIHNlZXMgdGhlIGNoYWluIG9uXG5cdCAqIGV2ZXJ5IGFjY2Vzcy5cblx0ICpcblx0ICogQHBhcmFtIHs/KHN0cmluZ3xudW1iZXJ8c3ltYm9sKX0gW2tleV0gYSBwcm9wZXJ0eSBrZXk7IGEgbnVtYmVyIGlzIGxvb2tlZCB1cCBhcyBpdHMgc3RyaW5nXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gW2ZpbHRlcl0gdGhlIHNjb3BlIG5hbWUgb2YgdGhlIHJlc29sdmVyIHRoZSBjYWxsIGFkZHJlc3Nlczsgd2l0aG91dCBvbmUsIHRoaXNcblx0ICogcmVzb2x2ZXJcblx0ICogQHJldHVybnMgeyp9IHRoZSB2YWx1ZSwgb3IgdGhlIHdob2xlIGNvbnRleHQgd2l0aG91dCBhIGtleVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBrZXkgaXMgb2YgYSB0eXBlIG5vIHByb3BlcnR5IGtleSBoYXMsIG9yIHRoZSBmaWx0ZXIgbm8gc3RyaW5nXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSB0aGUgZmlsdGVyIG1hdGNoZXMgbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluXG5cdCAqL1xuXHRnZXREYXRhKGtleSwgZmlsdGVyKSB7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIodG9TY29wZShmaWx0ZXIpKTtcblx0XHRpZiAoa2V5ID09IG51bGwpIHJldHVybiByZXNvbHZlci5jb250ZXh0O1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLmNvbnRleHRbdG9LZXkoa2V5KV07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIHZhbHVlLCBpbiB0aGUgb2JqZWN0IHRoZSBjYWxsZXIgaGFuZGVkIG92ZXIuIFdpdGhvdXQgYSBmaWx0ZXIgdGhlIHZhbHVlIGlzIGNoYW5nZWQgd2hlcmVcblx0ICogdGhlIGtleSBsaXZlcywgY291bnRpbmcgZnJvbSBoZXJlIHRvd2FyZHMgdGhlIHJvb3QsIGFuZCBjcmVhdGVkIGhlcmUgd2hlcmUgbm8gcmVzb2x2ZXIgY2Fycmllc1xuXHQgKiBpdC4gV2l0aCBhIGZpbHRlciB0aGUgYWRkcmVzc2VkIHJlc29sdmVyIGlzIHRoZSB0YXJnZXQgb3V0cmlnaHQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxzeW1ib2x9IGtleSBhIHByb3BlcnR5IGtleTsgYSBudW1iZXIgaXMgbG9va2VkIHVwIGFzIGl0cyBzdHJpbmdcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtmaWx0ZXJdIHRoZSBzY29wZSBuYW1lIG9mIHRoZSByZXNvbHZlciB0aGUgY2FsbCBhZGRyZXNzZXNcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUga2V5IGlzIG1pc3Npbmcgb3Igb2YgYSB0eXBlIG5vIHByb3BlcnR5IGtleSBoYXMsIHRoZSBmaWx0ZXIgbm9cblx0ICogc3RyaW5nLCBvciB0aGUgb2JqZWN0IHJlZnVzZXMgdGhlIHdyaXRlXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSB0aGUgZmlsdGVyIG1hdGNoZXMgbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluXG5cdCAqL1xuXHR1cGRhdGVEYXRhKGtleSwgdmFsdWUsIGZpbHRlcikge1xuXHRcdGNvbnN0IHByb3BlcnR5ID0gdG9LZXkoa2V5KTtcblx0XHRjb25zdCBzY29wZSA9IHRvU2NvcGUoZmlsdGVyKTtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcihzY29wZSk7XG5cblx0XHRjb25zdCB0YXJnZXQgPSBzY29wZSA/IHJlc29sdmVyIDogdGhpcy4jcmVzb2x2ZXJGb3JLZXkocHJvcGVydHkpIHx8IHRoaXM7XG5cdFx0dGFyZ2V0LmNvbnRleHRbcHJvcGVydHldID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUga2V5IGZyb20gb25lIHJlc29sdmVyIC0gdGhlIGFkZHJlc3NlZCBvbmUgd2l0aCBhIGZpbHRlciwgYW5kIHdpdGhvdXQgb25lIHRoZSBmaXJzdFxuXHQgKiByZXNvbHZlciBjYXJyeWluZyBpdCwgY291bnRpbmcgZnJvbSBoZXJlIHRvd2FyZHMgdGhlIHJvb3QuIFJlbW92aW5nIGl0IHVuY292ZXJzIHRoZSB2YWx1ZSBvZlxuXHQgKiB0aGUgbmV4dCByZXNvbHZlciB0aGF0IGNhcnJpZXMgdGhlIHNhbWUga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8c3ltYm9sfSBrZXkgYSBwcm9wZXJ0eSBrZXk7IGEgbnVtYmVyIGlzIGxvb2tlZCB1cCBhcyBpdHMgc3RyaW5nXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gW2ZpbHRlcl0gdGhlIHNjb3BlIG5hbWUgb2YgdGhlIHJlc29sdmVyIHRoZSBjYWxsIGFkZHJlc3Nlc1xuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBrZXkgaXMgbWlzc2luZyBvciBvZiBhIHR5cGUgbm8gcHJvcGVydHkga2V5IGhhcywgdGhlIGZpbHRlciBub1xuXHQgKiBzdHJpbmcsIG9yIHRoZSBvYmplY3QgcmVmdXNlcyB0aGUgZGVsZXRpb25cblx0ICogQHRocm93cyB7RXJyb3J9IHdoZXJlIHRoZSBmaWx0ZXIgbWF0Y2hlcyBubyByZXNvbHZlciBvZiB0aGUgY2hhaW5cblx0ICovXG5cdGRlbGV0ZURhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHRvS2V5KGtleSk7XG5cdFx0Y29uc3Qgc2NvcGUgPSB0b1Njb3BlKGZpbHRlcik7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoc2NvcGUpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2NvcGUgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KHByb3BlcnR5KTtcblx0XHRpZiAodGFyZ2V0KSBkZWxldGUgdGFyZ2V0LmNvbnRleHRbcHJvcGVydHldO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2hhbGxvdyBhc3NpZ25tZW50LCBrZXkgYnkga2V5LCBpbnRvIHRoZSBjb250ZXh0IG9mIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIsIHJlcGxhY2luZyB3aGF0IGlzXG5cdCAqIHRoZXJlIGFuZCBhZGRpbmcgd2hhdCBpcyBub3QuIE5vIHNlYXJjaCBhbG9uZyB0aGUgY2hhaW46IGEgbWVyZ2VkIGtleSBzaGFkb3dzIHRoZSByZXNvbHZlcnNcblx0ICogYWJvdmUgZnJvbSBoZXJlIG9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gez9vYmplY3R9IGNvbnRleHQgdGhlIGtleXMgdG8gYXNzaWduOyBudWxsIG9yIHVuZGVmaW5lZCBjaGFuZ2VzIG5vdGhpbmdcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBbZmlsdGVyXSB0aGUgc2NvcGUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgdGhlIGNhbGwgYWRkcmVzc2VzXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGNvbnRleHQgaXMgYSBwcmltaXRpdmUsIHRoZSBmaWx0ZXIgbm8gc3RyaW5nLCBvciB0aGUgb2JqZWN0XG5cdCAqIHJlZnVzZXMgYSBrZXkgLSB0aGUga2V5cyBiZWZvcmUgaXQgYXJlIHdyaXR0ZW4gYnkgdGhlblxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgdGhlIGZpbHRlciBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpblxuXHQgKi9cblx0bWVyZ2VDb250ZXh0KGNvbnRleHQsIGZpbHRlcikge1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKHRvU2NvcGUoZmlsdGVyKSk7XG5cdFx0aWYgKGNvbnRleHQgPT0gbnVsbCkgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2YgY29udGV4dCAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgY29udGV4dCAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBtZXJnZUNvbnRleHQgdGFrZXMgYW4gb2JqZWN0LCBub3QgYSAke3R5cGVvZiBjb250ZXh0fSFgKTtcblxuXHRcdHJlc29sdmVyLmNvbnRleHRIYW5kbGUubWVyZ2VEYXRhKGNvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG9uZSBleHByZXNzaW9uIHRvIGl0cyB2YWx1ZSwgb2Ygd2hhdGV2ZXIgdHlwZSB0aGUgc3RhdGVtZW50IGFuc3dlcnMuIFRha2VzIHRoZVxuXHQgKiBkZWxpbWl0ZWQgZm9ybSBgJHsuLi59YCwgYSBzY29wZSBwcmVmaXggaW5jbHVkZWQsIG9yIGEgYmFyZSBzdGF0ZW1lbnQ7IGFuIGlucHV0IHRoYXQgZG9lcyBub3Rcblx0ICogYm90aCBvcGVuIHdpdGggYCR7YCBhbmQgZW5kIHdpdGggYH1gIGlzIGEgYmFyZSBzdGF0ZW1lbnQuIEFuIGVycm9yIG9mIHRoZSBzdGF0ZW1lbnQgaXMgbG9nZ2VkXG5cdCAqIGFuZCBoYW5kZWQgb24sIGFuZCB0aGUgZGVmYXVsdCBuZXZlciBjb3ZlcnMgaXQuXG5cdCAqXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHsqfSBbYURlZmF1bHRdIHJlcGxhY2VzIGEgcmVzdWx0IG9mIG51bGwgb3IgdW5kZWZpbmVkIHdoZXJlIGl0IGlzIHBhc3NlZCwgdW5kZWZpbmVkXG5cdCAqIGluY2x1ZGVkXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBleHByZXNzaW9uIGlzIG5vIHN0cmluZ1xuXHQgKi9cblx0YXN5bmMgcmVzb2x2ZShhRXhwcmVzc2lvbiwgYURlZmF1bHQpIHtcblx0XHQvLyBhIG1pc3Rha2UgaW4gdGhlIGNhbGxpbmcgY29kZSwgbm90IGEgZmFpbGVkIHN0YXRlbWVudCAtIHNvIG5vIHdhcm5pbmcgYW5kIG5vIGRlZmF1bHRcblx0XHRpZiAodHlwZW9mIGFFeHByZXNzaW9uICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGByZXNvbHZlIHRha2VzIGFuIGV4cHJlc3Npb24gYXMgYSBzdHJpbmcsIG5vdCBhICR7dHlwZW9mIGFFeHByZXNzaW9ufSFgKTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdHRyeSB7XG5cdFx0XHQvLyB0aGUgZGVsaW1pdGVkIGZvcm0gb3IgYSBiYXJlIHN0YXRlbWVudCwgdG9sZCBhcGFydCBieSB0aGUgc2Nhbm5lclxuXHRcdFx0Y29uc3QgeyBzY29wZSwgc3RhdGVtZW50IH0gPSBwYXJzZUV4cHJlc3Npb24oYUV4cHJlc3Npb24pO1xuXHRcdFx0cmV0dXJuIHdpdGhEZWZhdWx0KGF3YWl0IHRoaXMuI2V4ZWN1dGUoc3RhdGVtZW50LCBzY29wZSksIGRlZmF1bHRWYWx1ZSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0Ly8gdGhlIGVycm9yIGlzIGxvZ2dlZCBhbmQgaGFuZGVkIG9uLiByZXNvbHZlIGFuc3dlcnMgYSB2YWx1ZSBvciBzYXlzIHdoeSBpdCBjYW5ub3QsXG5cdFx0XHQvLyBhbmQgYSBkZWZhdWx0IHZhbHVlIGNvdmVycyBhIG1pc3NpbmcgcmVzdWx0LCBuZXZlciBhbiBlcnJvci5cblx0XHRcdHdhcm5GYWlsZWRTdGF0ZW1lbnQoYUV4cHJlc3Npb24sIGUpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZXMgZXZlcnkgZXhwcmVzc2lvbiBvZiBhIHRleHQgYnkgaXRzIHZhbHVlIGFuZCBhbnN3ZXJzIHRoZSB0ZXh0LiBBbiBleHByZXNzaW9uIHdob3NlXG5cdCAqIHN0YXRlbWVudCBmYWlscyBzdGFuZHMgYXMgd3JpdHRlbiwgYSB3YXJuaW5nIG5hbWVzIGl0LCBhbmQgdGhlIHJlc3Qgb2YgdGhlIHRleHQga2VlcHMgcmVuZGVyaW5nLlxuXHQgKlxuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG5cdCAqIEBwYXJhbSB7Kn0gW2FEZWZhdWx0XSByZXBsYWNlcyBhIHJlc3VsdCBvZiBudWxsIG9yIHVuZGVmaW5lZCwgcGVyIGV4cHJlc3Npb24sIHdoZXJlIGl0IGlzXG5cdCAqIHBhc3NlZFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSB0ZXh0IGlzIG5vIHN0cmluZ1xuXHQgKi9cblx0YXN5bmMgcmVzb2x2ZVRleHQoYVRleHQsIGFEZWZhdWx0KSB7XG5cdFx0aWYgKHR5cGVvZiBhVGV4dCAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgcmVzb2x2ZVRleHQgdGFrZXMgYSB0ZXh0IGFzIGEgc3RyaW5nLCBub3QgYSAke3R5cGVvZiBhVGV4dH0hYCk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblxuXHRcdGNvbnN0IG9jY3VycmVuY2VzID0gc2NhbihhVGV4dCk7XG5cdFx0aWYgKCFvY2N1cnJlbmNlcykgcmV0dXJuIGFUZXh0O1xuXG5cdFx0bGV0IHRleHQgPSBcIlwiO1xuXHRcdGxldCBwb3NpdGlvbiA9IDA7XG5cdFx0Zm9yIChjb25zdCBvY2N1cnJlbmNlIG9mIG9jY3VycmVuY2VzKSB7XG5cdFx0XHQvLyBhbiBlc2NhcGluZyBiYWNrc2xhc2ggaXMgY29uc3VtZWQsIGV2ZXJ5dGhpbmcgZWxzZSBpbiBmcm9udCBvZiB0aGUgZXhwcmVzc2lvblxuXHRcdFx0Ly8gc3RhbmRzIGFzIHdyaXR0ZW5cblx0XHRcdHRleHQgKz0gYVRleHQuc3Vic3RyaW5nKHBvc2l0aW9uLCBvY2N1cnJlbmNlLmVzY2FwZWQgPyBvY2N1cnJlbmNlLnN0YXJ0IC0gMSA6IG9jY3VycmVuY2Uuc3RhcnQpO1xuXHRcdFx0cG9zaXRpb24gPSBvY2N1cnJlbmNlLmVuZDtcblxuXHRcdFx0aWYgKG9jY3VycmVuY2UuZXNjYXBlZCkge1xuXHRcdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhvY2N1cnJlbmNlLnN0YXJ0LCBvY2N1cnJlbmNlLmVuZCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHRleHQgKz0gd2l0aERlZmF1bHQoYXdhaXQgdGhpcy4jZXhlY3V0ZShvY2N1cnJlbmNlLnN0YXRlbWVudCwgb2NjdXJyZW5jZS5zY29wZSksIGRlZmF1bHRWYWx1ZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHQvLyBhbiBleHByZXNzaW9uIHdob3NlIHN0YXRlbWVudCBmYWlsZWQgc3RhbmRzIGFzIHdyaXR0ZW4sIGFuZCB0aGUgZGVmYXVsdCB2YWx1ZVxuXHRcdFx0XHRcdC8vIGRvZXMgbm90IGNvdmVyIGl0LiBUaGUgcmVzdCBvZiB0aGUgdGV4dCBrZWVwcyByZW5kZXJpbmcuXG5cdFx0XHRcdFx0d2FybkZhaWxlZFN0YXRlbWVudChvY2N1cnJlbmNlLnN0YXRlbWVudCwgZSk7XG5cdFx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHQgKyBhVGV4dC5zdWJzdHJpbmcocG9zaXRpb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG9uZSBleHByZXNzaW9uIGFnYWluc3QgYW4gYWQtaG9jIGNvbnRleHQsIHRocm91Z2ggYSByZXNvbHZlciBvZiBpdHMgb3duLCBhcyB0aGUgaW5zdGFuY2Vcblx0ICogYHJlc29sdmVgIGRvZXMuXG5cdCAqXG5cdCAqIFRha2VzIHRoZSBhcmd1bWVudHMgcG9zaXRpb25hbGx5LCBvciBvbmUgY29uZmlndXJhdGlvbiBvYmplY3Rcblx0ICogYHsgZXhwcmVzc2lvbiwgY29udGV4dCwgZGVmYXVsdFZhbHVlLCB0aW1lb3V0IH1gLCBiZWhpbmQgd2hpY2ggZXZlcnkgYXJndW1lbnQgaXMgaWdub3JlZC4gQSBmaXJzdFxuXHQgKiBhcmd1bWVudCB0aGF0IGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIG9iamVjdCwgYW5kIGEgY29uZmlndXJhdGlvbiB3aXRob3V0IGEgc3RyaW5nIHVuZGVyXG5cdCAqIGBleHByZXNzaW9uYCwgcmVqZWN0IHdpdGggYSBgVHlwZUVycm9yYC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd8eyBleHByZXNzaW9uOiBzdHJpbmcsIGNvbnRleHQ/OiBvYmplY3QsIGRlZmF1bHRWYWx1ZT86ICosIHRpbWVvdXQ/OiBudW1iZXIgfX0gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/b2JqZWN0fSBbYUNvbnRleHRdXG5cdCAqIEBwYXJhbSB7Kn0gW2FEZWZhdWx0XSByZXBsYWNlcyBhIHJlc3VsdCBvZiBudWxsIG9yIHVuZGVmaW5lZCB3aGVyZSBpdCBpcyBwYXNzZWRcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBbYVRpbWVvdXRdIGRlbGF5cyB0aGUgc3RhcnQgYnkgdGhhdCBtYW55IG1pbGxpc2Vjb25kczsgbm8gZGVhZGxpbmVcblx0ICogQHJldHVybnMge1Byb21pc2U8Kj59XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGFyZ3VtZW50cyB0YWtlIG5laXRoZXIgZm9ybSwgb3IgdGhlIGNvbnRleHQgaXMgYSBwcmltaXRpdmVcblx0ICovXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XG5cdFx0aWYgKGlzQ29uZmlndXJhdGlvbihhcmd1bWVudHNbMF0pKSB7XG5cdFx0XHRjb25zdCB7IGV4cHJlc3Npb24sIGNvbnRleHQsIHRpbWVvdXQgfSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdGlmICh0eXBlb2YgZXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlIHRha2VzIGEgY29uZmlndXJhdGlvbiBjYXJyeWluZyB0aGUgZXhwcmVzc2lvbiBhcyBhIHN0cmluZyB1bmRlciB0aGUga2V5IGV4cHJlc3Npb24hXCIpO1xuXHRcdFx0cmV0dXJuIEV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlKGV4cHJlc3Npb24sIGNvbnRleHQsIGRlZmF1bHRPZihhcmd1bWVudHNbMF0pLCB0aW1lb3V0KTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBhRXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlIHRha2VzIGEgc3RyaW5nIG9yIGEgY29uZmlndXJhdGlvbiBvYmplY3QhXCIpO1xuXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dDogYUNvbnRleHQgfSk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdGlmICh0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKSk7XG5cdFx0XHRcdH0sIGFUaW1lb3V0KTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLnJlc29sdmUoYUV4cHJlc3Npb24sIGRlZmF1bHRWYWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZXMgZXZlcnkgZXhwcmVzc2lvbiBvZiBhIHRleHQgYWdhaW5zdCBhbiBhZC1ob2MgY29udGV4dCwgdGhyb3VnaCBhIHJlc29sdmVyIG9mIGl0cyBvd24sIGFzXG5cdCAqIHRoZSBpbnN0YW5jZSBgcmVzb2x2ZVRleHRgIGRvZXMuXG5cdCAqXG5cdCAqIFRha2VzIHRoZSBhcmd1bWVudHMgcG9zaXRpb25hbGx5LCBvciBvbmUgY29uZmlndXJhdGlvbiBvYmplY3Rcblx0ICogYHsgdGV4dCwgY29udGV4dCwgZGVmYXVsdFZhbHVlLCB0aW1lb3V0IH1gLCBiZWhpbmQgd2hpY2ggZXZlcnkgYXJndW1lbnQgaXMgaWdub3JlZC4gQSBmaXJzdFxuXHQgKiBhcmd1bWVudCB0aGF0IGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIG9iamVjdCwgYW5kIGEgY29uZmlndXJhdGlvbiB3aXRob3V0IGEgc3RyaW5nIHVuZGVyXG5cdCAqIGB0ZXh0YCwgcmVqZWN0IHdpdGggYSBgVHlwZUVycm9yYC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd8eyB0ZXh0OiBzdHJpbmcsIGNvbnRleHQ/OiBvYmplY3QsIGRlZmF1bHRWYWx1ZT86ICosIHRpbWVvdXQ/OiBudW1iZXIgfX0gYVRleHRcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBbYUNvbnRleHRdXG5cdCAqIEBwYXJhbSB7Kn0gW2FEZWZhdWx0XSByZXBsYWNlcyBhIHJlc3VsdCBvZiBudWxsIG9yIHVuZGVmaW5lZCwgcGVyIGV4cHJlc3Npb24sIHdoZXJlIGl0IGlzXG5cdCAqIHBhc3NlZFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IFthVGltZW91dF0gZGVsYXlzIHRoZSBzdGFydCBieSB0aGF0IG1hbnkgbWlsbGlzZWNvbmRzOyBubyBkZWFkbGluZVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBhcmd1bWVudHMgdGFrZSBuZWl0aGVyIGZvcm0sIG9yIHRoZSBjb250ZXh0IGlzIGEgcHJpbWl0aXZlXG5cdCAqL1xuXHRzdGF0aWMgYXN5bmMgcmVzb2x2ZVRleHQoYVRleHQsIGFDb250ZXh0LCBhRGVmYXVsdCwgYVRpbWVvdXQpIHtcdFx0XG5cdFx0aWYgKGlzQ29uZmlndXJhdGlvbihhcmd1bWVudHNbMF0pKSB7XG5cdFx0XHRjb25zdCB7IHRleHQsIGNvbnRleHQsIHRpbWVvdXQgfSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdGlmICh0eXBlb2YgdGV4dCAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlVGV4dCB0YWtlcyBhIGNvbmZpZ3VyYXRpb24gY2FycnlpbmcgdGhlIHRleHQgYXMgYSBzdHJpbmcgdW5kZXIgdGhlIGtleSB0ZXh0IVwiKTtcblx0XHRcdHJldHVybiBFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZVRleHQodGV4dCwgY29udGV4dCwgZGVmYXVsdE9mKGFyZ3VtZW50c1swXSksIHRpbWVvdXQpO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmVUZXh0IHRha2VzIGEgc3RyaW5nIG9yIGEgY29uZmlndXJhdGlvbiBvYmplY3QhXCIpO1xuXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dDogYUNvbnRleHQgfSk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdGlmICh0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzb2x2ZXIucmVzb2x2ZVRleHQoYVRleHQsIGRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHR9LCBhVGltZW91dCk7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiByZXNvbHZlci5yZXNvbHZlVGV4dChhVGV4dCwgZGVmYXVsdFZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZHMgYSByZXNvbHZlciBvdmVyIGEgZmlsdGVyZWQgY29weSBvZiB0aGUgY29udGV4dC5cblx0ICpcblx0ICogVGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvIHRoZSBjb250ZXh0IG9ubHksIG5ldmVyIHRvIHRoZSBnbG9iYWxzLCBzbyB0aGlzIGlzIGEgd2F5IHRvIGhhbmRcblx0ICogb3ZlciBhIGNsZWFuZWQgY29udGV4dCBhbmQgbm90IGEgc2FuZGJveC5cblx0ICpcblx0ICogYG9wdGlvbmAgY2FycmllcyB0aGUgZmlsdGVyJ3Mgb3duIGBkZWVwYCB0b2dldGhlciB3aXRoIHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGBuYW1lYCxcblx0ICogYHBhcmVudGAgYW5kIGBleGVjdXRlcmAsIHdoaWNoIGFyZSBoYW5kZWQgb24gYXMgdGhleSBhcmUuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZyB0aGUgZmlsdGVyIGFyZ3VtZW50cywgcGx1cyB0aGUgd2hvbGUgY29uc3RydWN0b3Igb3B0aW9uIHNldFxuXHQgKiBAcGFyYW0ge29iamVjdH0gYXJnLmNvbnRleHQgdGhlIG9iamVjdCB0byBjb3B5OyBpdCBpcyBsZWZ0IHVudG91Y2hlZFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZywgKiwgb2JqZWN0KTogYm9vbGVhbn0gYXJnLnByb3BGaWx0ZXIgY2FsbGVkIHdpdGggbmFtZSwgdmFsdWUgYW5kIHRoZVxuXHQgKiBvYmplY3QgaG9sZGluZyBpdCBmb3IgZXZlcnkgZW51bWVyYWJsZSBwcm9wZXJ0eSwgaW5oZXJpdGVkIG9uZXMgaW5jbHVkZWQ7IGEgcHJvcGVydHkgaXRcblx0ICogYW5zd2VycyBmYWxzZSBmb3IgaXMgbGVmdCBvdXQgb2YgdGhlIGNvcHlcblx0ICogQHBhcmFtIHtvYmplY3R9IFthcmcub3B0aW9uPXsgZGVlcDogdHJ1ZSwgbmFtZTogbnVsbCwgcGFyZW50OiBudWxsLCBleGVjdXRlcjogbnVsbCB9XVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFthcmcub3B0aW9uLmRlZXA9dHJ1ZV0gZmlsdGVycyBzdWIgb2JqZWN0cyBhcyB3ZWxsXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbYXJnLm9wdGlvbi5uYW1lPW51bGxdXG5cdCAqIEBwYXJhbSB7RXhwcmVzc2lvblJlc29sdmVyfSBbYXJnLm9wdGlvbi5wYXJlbnQ9bnVsbF1cblx0ICogQHBhcmFtIHsoc3RyaW5nfEV4ZWN1dGVyKX0gW2FyZy5vcHRpb24uZXhlY3V0ZXI9bnVsbF1cblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcn1cblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSBhIGNvbnN0cnVjdG9yIG9wdGlvbiBpcyBvZiB0aGUgd3Jvbmcga2luZCwgYXMgdGhlIGNvbnN0cnVjdG9yIHRocm93c1xuXHQgKi9cblx0c3RhdGljIGJ1aWxkRmlsdGVyZWQoeyBjb250ZXh0LCBwcm9wRmlsdGVyLCBvcHRpb24gPSB7IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfSB9KSB7XG5cdFx0Y29uc3QgeyBkZWVwID0gdHJ1ZSwgbmFtZSwgcGFyZW50LCBleGVjdXRlciB9ID0gb3B0aW9uO1xuXHRcdGNvbnRleHQgPSBPYmplY3RVdGlscy5maWx0ZXIoY29udGV4dCwgcHJvcEZpbHRlciwge2RlZXB9KTtcblx0XHRyZXR1cm4gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQsIG5hbWUsIHBhcmVudCwgZXhlY3V0ZXIgfSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGZvcm1lciBuYW1lIG9mIGBidWlsZEZpbHRlcmVkYC4gSXQgcHJvbWlzZWQgYSBzZWN1cml0eSB0aGUgbWV0aG9kIGRvZXMgbm90IGdpdmUuXG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkIHVzZSBgYnVpbGRGaWx0ZXJlZGBcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0ge29iamVjdH0gYXJnIHRoZSBhcmd1bWVudHMgb2YgYGJ1aWxkRmlsdGVyZWRgXG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XG5cdCAqL1xuXHRzdGF0aWMgYnVpbGRTZWN1cmUoYXJnKSB7XG5cdFx0cmV0dXJuIEV4cHJlc3Npb25SZXNvbHZlci5idWlsZEZpbHRlcmVkKGFyZyk7XG5cdH1cbn1cblxuIiwiLyoqXG4gKiBGaW5kcyB0aGUgZXhwcmVzc2lvbnMgb2YgYSB0ZXh0IGFuZCB0YWtlcyBhIHNpbmdsZSBleHByZXNzaW9uIGFwYXJ0LiBJdCByZWFkcyB3aGVyZSBhbiBleHByZXNzaW9uXG4gKiBiZWdpbnMgYW5kIGVuZHMsIHdoZXRoZXIgaXQgaXMgZXNjYXBlZCwgYW5kIHdoaWNoIHNjb3BlIHByZWZpeCBpdCBjYXJyaWVzOyBldmFsdWF0aW5nIGEgc3RhdGVtZW50XG4gKiBhbmQgYWRkcmVzc2luZyBhIHNjb3BlIGlzIEV4cHJlc3Npb25SZXNvbHZlcidzLlxuICpcbiAqIEludGVybmFsIHRvIHRoZSBwYWNrYWdlOiBpbmRleC5qcyBkb2VzIG5vdCBleHBvcnQgaXQuXG4gKi9cblxuaW1wb3J0IHsgV0hJVEVTUEFDRSwgaXNOYW1lQ2hhcmFjdGVyLCB0cmltVG9OdWxsIH0gZnJvbSBcIi4vVXRpbHMuanNcIjtcblxuY29uc3QgRVhQUkVTU0lPTl9TVEFSVCA9IFwiJHtcIjtcblxuLy8gdGhlIHNjYW5uZXIgc3RhdGVzIC0gZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBjb2RlIGhpZGVzIHRoZSBicmFjZXMgaW5zaWRlIGl0XG5jb25zdCBDT0RFID0gMDtcbmNvbnN0IFNJTkdMRV9RVU9URUQgPSAxO1xuY29uc3QgRE9VQkxFX1FVT1RFRCA9IDI7XG5jb25zdCBURU1QTEFURSA9IDM7XG5jb25zdCBSRUdFWCA9IDQ7XG5jb25zdCBSRUdFWF9DTEFTUyA9IDU7XG5jb25zdCBCTE9DS19DT01NRU5UID0gNjtcbmNvbnN0IExJTkVfQ09NTUVOVCA9IDc7XG5cbi8vIGEgXCIvXCIgY29udGludWVzIGFuIGV4cHJlc3Npb24gaW5zdGVhZCBvZiBvcGVuaW5nIGEgcmVndWxhciBleHByZXNzaW9uIHdoZW4gaXQgZm9sbG93cyBvbmUgb2Zcbi8vIHRoZXNlIC0gdGhlIGNsYXNzaWMgZGl2aXNpb24tb3ItcmVnZXggcXVlc3Rpb24sIGRlY2lkZWQgb24gdGhlIGxhc3QgY2hhcmFjdGVyIHRoYXQgaXMgbmVpdGhlclxuLy8gd2hpdGVzcGFjZSBub3IgcGFydCBvZiBhIGNvbW1lbnRcbmNvbnN0IEJFRk9SRV9ESVZJU0lPTiA9IC9bYS16QS1aMC05XyQpXFxdXS87XG5cbi8vIHRoZSBjaGFyYWN0ZXJzIHRoZSBzY2FubmVyIGRlY2lkZXMgb24sIGNvbXBhcmVkIGFzIGNoYXIgY29kZXMgcmF0aGVyIHRoYW4gYXMgb25lLWNoYXJhY3RlciBzdHJpbmdzXG5jb25zdCBCQUNLU0xBU0ggPSAweDVjO1xuY29uc3QgRE9MTEFSID0gMHgyNDtcbmNvbnN0IE9QRU5fQlJBQ0UgPSAweDdiO1xuY29uc3QgQ0xPU0VfQlJBQ0UgPSAweDdkO1xuY29uc3QgU0lOR0xFX1FVT1RFID0gMHgyNztcbmNvbnN0IERPVUJMRV9RVU9URSA9IDB4MjI7XG5jb25zdCBCQUNLVElDSyA9IDB4NjA7XG5jb25zdCBTTEFTSCA9IDB4MmY7XG5jb25zdCBTVEFSID0gMHgyYTtcbmNvbnN0IExJTkVfRkVFRCA9IDB4MGE7XG5jb25zdCBDQVJSSUFHRV9SRVRVUk4gPSAweDBkO1xuY29uc3QgTElORV9TRVBBUkFUT1IgPSAweDIwMjg7XG5jb25zdCBQQVJBR1JBUEhfU0VQQVJBVE9SID0gMHgyMDI5O1xuY29uc3QgT1BFTl9CUkFDS0VUID0gMHg1YjtcbmNvbnN0IENMT1NFX0JSQUNLRVQgPSAweDVkO1xuY29uc3QgQ09MT04gPSAweDNhO1xuXG5jb25zdCBTQ09QRV9TRVBBUkFUT1IgPSBcIjo6XCI7XG5cbi8qKlxuICogV2hldGhlciB0aGUgXCIvXCIgYXQgYUluZGV4IG9wZW5zIGEgcmVndWxhciBleHByZXNzaW9uIGxpdGVyYWwsIGRlY2lkZWQgb24gdGhlIGNoYXJhY3RlciBiZWZvcmUgaXRcbiAqIHRoYXQgaXMgbmVpdGhlciB3aGl0ZXNwYWNlIG5vciBwYXJ0IG9mIGEgY29tbWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBhSW5kZXhcbiAqIEBwYXJhbSB7P0FycmF5PG51bWJlcj59IHRoZUNvbW1lbnRzIHRoZSBjb21tZW50cyByZWFkIHNvIGZhciBhcyBmbGF0IHN0YXJ0IGFuZCBlbmQgaW5kZXggcGFpcnMsIGluXG4gKiB0aGUgb3JkZXIgdGhleSBzdGFuZDsgbnVsbCB3aGVyZSB0aGUgZXhwcmVzc2lvbiBoYXMgbm9uZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IHNsYXNoT3BlbnNSZWdleCA9IChhVGV4dCwgYUluZGV4LCB0aGVDb21tZW50cykgPT4ge1xuXHRsZXQgaW5kZXggPSBhSW5kZXggLSAxO1xuXHRsZXQgY29tbWVudCA9IHRoZUNvbW1lbnRzID8gdGhlQ29tbWVudHMubGVuZ3RoIC0gMSA6IC0xO1xuXHR3aGlsZSAoaW5kZXggPj0gMCkge1xuXHRcdHdoaWxlIChpbmRleCA+PSAwICYmIFdISVRFU1BBQ0UudGVzdChhVGV4dFtpbmRleF0pKSBpbmRleC0tO1xuXHRcdC8vIGEgbGluZSBjb21tZW50IG1heSBlbmQgaW4gd2hpdGVzcGFjZSwgc28gdGhlIHdhbGsgY2FuIGxhbmQgaW5zaWRlIGl0IHJhdGhlciB0aGFuIG9uIGl0cyBlbmRcblx0XHRpZiAoY29tbWVudCA8IDAgfHwgaW5kZXggPCB0aGVDb21tZW50c1tjb21tZW50IC0gMV0gfHwgaW5kZXggPiB0aGVDb21tZW50c1tjb21tZW50XSkgYnJlYWs7XG5cblx0XHRpbmRleCA9IHRoZUNvbW1lbnRzW2NvbW1lbnQgLSAxXSAtIDE7XG5cdFx0Y29tbWVudCAtPSAyO1xuXHR9XG5cblx0cmV0dXJuIGluZGV4IDwgMCB8fCAhQkVGT1JFX0RJVklTSU9OLnRlc3QoYVRleHRbaW5kZXhdKTtcbn07XG5cbi8qKlxuICogV2hldGhlciBhIGNoYXIgY29kZSBlbmRzIGEgbGluZSBjb21tZW50IC0gYSBsaW5lIHRlcm1pbmF0b3IgaW4gdGhlIHNlbnNlIG9mIEVDTUFTY3JpcHQuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGFDb2RlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNMaW5lVGVybWluYXRvciA9IChhQ29kZSkgPT4gYUNvZGUgPT09IExJTkVfRkVFRCB8fCBhQ29kZSA9PT0gQ0FSUklBR0VfUkVUVVJOIHx8IGFDb2RlID09PSBMSU5FX1NFUEFSQVRPUiB8fCBhQ29kZSA9PT0gUEFSQUdSQVBIX1NFUEFSQVRPUjtcblxuLypcbiAqIFR3byBzcGxpdHMgdGFrZSB0aGUgdGV4dCBiZXR3ZWVuIHRoZSBkZWxpbWl0ZXJzIGFwYXJ0IGludG8gdGhlIHNjb3BlIHByZWZpeCBhbmQgdGhlXG4gKiBzdGF0ZW1lbnQgLSB0aGlzIG9uZSBmb3IgYSB0ZXh0LCBgc3BsaXRTY29wZUFuZFN0YXRlbWVudEJ5U2VwYXJhdG9yYCBiZWhpbmQgYHBhcnNlRXhwcmVzc2lvbmAgZm9yXG4gKiB0aGUgc2luZ2xlIGV4cHJlc3Npb24gb2YgYHJlc29sdmVgLiBUaGV5IGFyZSB0d28gaW1wbGVtZW50YXRpb25zIG9mIHRoZSBvbmUgcnVsZSwgZWFjaCBtZWFzdXJlZFxuICogZmFzdGVyIGZvciBvdGhlciBzdGF0ZW1lbnRzOiBhIHRleHQgcmVhZHMgZm9yd2FyZHMsIHRoZSBzaW5nbGUgZXhwcmVzc2lvbiBmcm9tIHRoZSBmaXJzdCBcIjo6XCJcbiAqIGJhY2t3YXJkcy4gQm90aCBoYXZlIHRvIGFuc3dlciBldmVyeSBjYXNlIGFsaWtlLlxuICovXG5cbi8qKlxuICogVGhlIHNwbGl0IG9mIGEgdGV4dDogcmVhZHMgZm9yd2FyZHMgb25seSBhcyBmYXIgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhIG5hbWUgY2Fubm90IGNhcnJ5LCB3aGljaFxuICogZm9yIG1vc3Qgc3RhdGVtZW50cyBpcyBhIGZldyBjaGFyYWN0ZXJzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhQ29udGVudCB0aGUgdGV4dCBiZXR3ZWVuIHRoZSBkZWxpbWl0ZXJzXG4gKiBAcmV0dXJucyB7eyBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH19IGJvdGggdHJpbW1lZCwgbnVsbCB3aGVyZSBlbXB0eVxuICovXG5jb25zdCBzcGxpdFNjb3BlQW5kU3RhdGVtZW50Rm9yd2FyZCA9IChhQ29udGVudCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhQ29udGVudC5sZW5ndGg7XG5cdGxldCBpbmRleCA9IDA7XG5cdHdoaWxlIChpbmRleCA8IGxlbmd0aCAmJiBpc05hbWVDaGFyYWN0ZXIoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkpKSBpbmRleCsrO1xuXG5cdGlmIChhQ29udGVudC5jaGFyQ29kZUF0KGluZGV4KSAhPT0gQ09MT04gfHwgYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCArIDEpICE9PSBDT0xPTilcblx0XHRyZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFDb250ZW50KSB9O1xuXG5cdC8vIGFuIGVtcHR5IG5hbWUgaXMgbm8gbmFtZSwgYnV0IGl0cyBzZXBhcmF0b3IgZ29lcyB3aXRoIGl0IGFsbCB0aGUgc2FtZVxuXHRyZXR1cm4geyBzY29wZTogdHJpbVRvTnVsbChhQ29udGVudC5zdWJzdHJpbmcoMCwgaW5kZXgpKSwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFDb250ZW50LnN1YnN0cmluZyhpbmRleCArIDIpKSB9O1xufTtcblxuLyoqXG4gKiBUaGUgbnVtYmVyIG9mIGJhY2tzbGFzaGVzIHN0YW5kaW5nIGRpcmVjdGx5IGluIGZyb250IG9mIHRoZSBpbmRleC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBhSW5kZXhcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmNvbnN0IGNvdW50QmFja3NsYXNoZXNCZWZvcmUgPSAoYVRleHQsIGFJbmRleCkgPT4ge1xuXHRsZXQgY291bnQgPSAwO1xuXHR3aGlsZSAoYUluZGV4IC0gY291bnQgPiAwICYmIGFUZXh0LmNoYXJDb2RlQXQoYUluZGV4IC0gY291bnQgLSAxKSA9PT0gQkFDS1NMQVNIKSBjb3VudCsrO1xuXG5cdHJldHVybiBjb3VudDtcbn07XG5cbi8qKlxuICogUmVhZHMgdGhlIG9uZSBleHByZXNzaW9uIHdob3NlIFwiJHtcIiBzdGFuZHMgYXQgYVN0YXJ0LCBjb3VudGluZyBicmFjZXMgYnV0IG5vdCB0aGUgb25lcyBoaWRkZW5cbiAqIGluc2lkZSBhIGxpdGVyYWwgb3IgYSBjb21tZW50LCBhbmQgdGFrZXMgaXQgYXBhcnQgaW50byBzY29wZSBwcmVmaXggYW5kIHN0YXRlbWVudC5cbiAqXG4gKiBBbnN3ZXJzIHRoZSBvY2N1cnJlbmNlIGBzY2FuYCBoYW5kcyBvbiwgYGVuZGAgdGhlIGluZGV4IGRpcmVjdGx5IGFmdGVyIHRoZSBtYXRjaGluZyBjbG9zaW5nIGJyYWNlO1xuICogbnVsbCB3aGVyZSB0aGUgdGV4dCBlbmRzIGJlZm9yZSB0aGF0IGJyYWNlLCB3aGljaCBtZWFucyB0aGVyZSBpcyBub1xuICogZXhwcmVzc2lvbiBoZXJlIGF0IGFsbDsgYW5kLCB3aXRoIGBlbmRgIG5lZ2F0ZWQsIHRoZSBpbmRleCBvZiBhbm90aGVyIFwiJHtcIiBtZXQgb3V0c2lkZSBhIGxpdGVyYWxcbiAqIG9yIGEgY29tbWVudCwgd2hpY2ggc3RhcnRzIGFuIGV4cHJlc3Npb24gb2YgaXRzIG93biBhbmQgYWJhbmRvbnMgdGhpcyBvbmUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gYVN0YXJ0XG4gKiBAcmV0dXJucyB7P3sgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGVzY2FwZWQ6IGJvb2xlYW4sIHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfX1cbiAqL1xuY29uc3QgcmVhZEV4cHJlc3Npb24gPSAoYVRleHQsIGFTdGFydCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhVGV4dC5sZW5ndGg7XG5cdGNvbnN0IHN0YWNrID0gW0NPREVdO1xuXHRsZXQgY29tbWVudHMgPSBudWxsO1xuXHRsZXQgY29tbWVudFN0YXJ0ID0gMDtcblx0bGV0IGluZGV4ID0gYVN0YXJ0ICsgMjtcblxuXHR3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcblx0XHRjb25zdCBjaGFyID0gYVRleHQuY2hhckNvZGVBdChpbmRleCk7XG5cdFx0c3dpdGNoIChzdGFja1tzdGFjay5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBDT0RFOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gT1BFTl9CUkFDRSkgc3RhY2sucHVzaChDT0RFKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQ0xPU0VfQlJBQ0UpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHRpZiAoc3RhY2subGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IHNjb3BlLCBzdGF0ZW1lbnQgfSA9IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRGb3J3YXJkKGFUZXh0LnN1YnN0cmluZyhhU3RhcnQgKyAyLCBpbmRleCkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHsgc3RhcnQ6IGFTdGFydCwgZW5kOiBpbmRleCArIDEsIGVzY2FwZWQ6IGZhbHNlLCBzY29wZTogc2NvcGUsIHN0YXRlbWVudDogc3RhdGVtZW50IH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGNoYXIgPT09IFNJTkdMRV9RVU9URSkgc3RhY2sucHVzaChTSU5HTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gRE9VQkxFX1FVT1RFKSBzdGFjay5wdXNoKERPVUJMRV9RVU9URUQpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBCQUNLVElDSykgc3RhY2sucHVzaChURU1QTEFURSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPTExBUiAmJiBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IE9QRU5fQlJBQ0UpIHJldHVybiB7IHN0YXJ0OiBhU3RhcnQsIGVuZDogLWluZGV4LCBlc2NhcGVkOiBmYWxzZSwgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbnVsbCB9O1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTTEFTSCkge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSk7XG5cdFx0XHRcdFx0aWYgKG5leHQgPT09IFNUQVIgfHwgbmV4dCA9PT0gU0xBU0gpIHtcblx0XHRcdFx0XHRcdHN0YWNrLnB1c2gobmV4dCA9PT0gU1RBUiA/IEJMT0NLX0NPTU1FTlQgOiBMSU5FX0NPTU1FTlQpO1xuXHRcdFx0XHRcdFx0Y29tbWVudFN0YXJ0ID0gaW5kZXg7XG5cdFx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc2xhc2hPcGVuc1JlZ2V4KGFUZXh0LCBpbmRleCwgY29tbWVudHMpKSBzdGFjay5wdXNoKFJFR0VYKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQkxPQ0tfQ09NTUVOVDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFNUQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBTTEFTSCkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdGluZGV4Kys7XG5cdFx0XHRcdFx0KGNvbW1lbnRzID8/PSBbXSkucHVzaChjb21tZW50U3RhcnQsIGluZGV4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgTElORV9DT01NRU5UOlxuXHRcdFx0XHRpZiAoaXNMaW5lVGVybWluYXRvcihjaGFyKSkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdChjb21tZW50cyA/Pz0gW10pLnB1c2goY29tbWVudFN0YXJ0LCBpbmRleCAtIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBTSU5HTEVfUVVPVEVEOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTSU5HTEVfUVVPVEUpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgRE9VQkxFX1FVT1RFRDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gRE9VQkxFX1FVT1RFKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRFTVBMQVRFOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBCQUNLVElDSykgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPTExBUiAmJiBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IE9QRU5fQlJBQ0UpIHtcblx0XHRcdFx0XHRzdGFjay5wdXNoKENPREUpO1xuXHRcdFx0XHRcdGluZGV4Kys7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFJFR0VYOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBPUEVOX0JSQUNLRVQpIHN0YWNrLnB1c2goUkVHRVhfQ0xBU1MpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTTEFTSCkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBSRUdFWF9DTEFTUzpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQ0xPU0VfQlJBQ0tFVCkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpbmRleCsrO1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEFuc3dlcnMgZXZlcnkgZXhwcmVzc2lvbiBvZiBhIHRleHQsIGluIHRoZSBvcmRlciB0aGV5IHN0YW5kLCBvciBudWxsIHdoZXJlIHRoZSB0ZXh0IGNhcnJpZXNcbiAqIG5vbmUuIGBzdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBcIiRcIiwgYGVuZGAgdGhlIGluZGV4IGFmdGVyIHRoZSBtYXRjaGluZyBjbG9zaW5nIGJyYWNlLCBzbyBhXG4gKiBjYWxsZXIgcmVwbGFjZXMgYnkgcG9zaXRpb24gYW5kIG5ldmVyIHRvdWNoZXMgYW4gb2NjdXJyZW5jZSB0d2ljZS4gVGhlIHRleHQgYmV0d2VlbiB0d29cbiAqIGV4cHJlc3Npb25zIGlzIHNraXBwZWQgYnkgYSBuYXRpdmUgc2VhcmNoIGZvciB0aGUgbmV4dCBcIiR7XCIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcmV0dXJucyB7P0FycmF5PHsgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGVzY2FwZWQ6IGJvb2xlYW4sIHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfT59XG4gKi9cbmV4cG9ydCBjb25zdCBzY2FuID0gKGFUZXh0KSA9PiB7XG5cdGxldCBvY2N1cnJlbmNlcyA9IG51bGw7XG5cdGxldCBzdGFydCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCk7XG5cblx0d2hpbGUgKHN0YXJ0ID49IDApIHtcblx0XHQvLyBhbiBvZGQgcnVuIG9mIGJhY2tzbGFzaGVzIGVzY2FwZXMgdGhlIGRlbGltaXRlciBpdHNlbGYuIEl0IG9wZW5zIG5vdGhpbmcsIHNvIG9ubHlcblx0XHQvLyB0aG9zZSB0d28gY2hhcmFjdGVycyBhcmUgdGFrZW4gb3V0IG9mIHRoZSB0ZXh0IGFuZCB0aGUgc2NhbiBjYXJyaWVzIG9uIGJlaGluZCB0aGVtIC1cblx0XHQvLyB3aGF0IHdvdWxkIGhhdmUgYmVlbiB0aGUgc3RhdGVtZW50IGlzIG9yZGluYXJ5IHRleHQgYW5kIG1heSBob2xkIGV4cHJlc3Npb25zIG9mIGl0cyBvd24uXG5cdFx0aWYgKGNvdW50QmFja3NsYXNoZXNCZWZvcmUoYVRleHQsIHN0YXJ0KSAlIDIgPT09IDEpIHtcblx0XHRcdGlmICghb2NjdXJyZW5jZXMpIG9jY3VycmVuY2VzID0gW107XG5cdFx0XHRvY2N1cnJlbmNlcy5wdXNoKHsgc3RhcnQ6IHN0YXJ0LCBlbmQ6IHN0YXJ0ICsgMiwgZXNjYXBlZDogdHJ1ZSwgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbnVsbCB9KTtcblx0XHRcdHN0YXJ0ID0gYVRleHQuaW5kZXhPZihFWFBSRVNTSU9OX1NUQVJULCBzdGFydCArIDIpO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb2NjdXJyZW5jZSA9IHJlYWRFeHByZXNzaW9uKGFUZXh0LCBzdGFydCk7XG5cdFx0Ly8gbm8gbWF0Y2hpbmcgYnJhY2U6IHRoZSB0ZXh0IHN0YW5kcyBhcyB3cml0dGVuLCBhbmQgbm90aGluZyBiZWhpbmQgaXQgY2FuIGJlIGFuXG5cdFx0Ly8gZXhwcmVzc2lvbiBlaXRoZXIgLSBhIFwiJHtcIiBvdXRzaWRlIGEgbGl0ZXJhbCBvciBhIGNvbW1lbnQgd291bGQgaGF2ZSByZXN0YXJ0ZWQgdGhlIHNjYW4gaW5zdGVhZFxuXHRcdGlmICghb2NjdXJyZW5jZSkgYnJlYWs7XG5cdFx0aWYgKG9jY3VycmVuY2UuZW5kIDwgMCkge1xuXHRcdFx0c3RhcnQgPSAtb2NjdXJyZW5jZS5lbmQ7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIW9jY3VycmVuY2VzKSBvY2N1cnJlbmNlcyA9IFtdO1xuXHRcdG9jY3VycmVuY2VzLnB1c2gob2NjdXJyZW5jZSk7XG5cdFx0c3RhcnQgPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQsIG9jY3VycmVuY2UuZW5kKTtcblx0fVxuXG5cdHJldHVybiBvY2N1cnJlbmNlcztcbn07XG5cbi8qKlxuICogVGFrZXMgdGhlIG9uZSBleHByZXNzaW9uIGByZXNvbHZlYCBpcyBoYW5kZWQgYXBhcnQuXG4gKlxuICogV2hpY2ggZm9ybSBpcyBpbiBoYW5kIGlzIGRlY2lkZWQgYnkgdGhlIHR3byBlbmRzIG9mIHRoZSB0cmltbWVkIGlucHV0OiBhbiBpbnB1dCB0aGF0IG9wZW5zIHdpdGhcbiAqIFwiJHtcIiBhbmQgZW5kcyB3aXRoIFwifVwiIGlzIHRoZSBkZWxpbWl0ZWQgZm9ybSwgYW55dGhpbmcgZWxzZSBpcyBhIGJhcmUgc3RhdGVtZW50LiBUaGUgd2hvbGUgaW5wdXRcbiAqIGlzIG9uZSBleHByZXNzaW9uLCBzbyBpdHMgZW5kIGlzIHRoZSBlbmQgb2YgdGhlIGlucHV0LiBFc2NhcGluZyBhIGRlbGltaXRlciBkb2VzIG5vdCBhcHBseSBoZXJlIC1cbiAqIGl0IGlzIGEgcnVsZSBvZiB0aGUgdGV4dCBmb3JtLCBhbmQgdGhlcmUgaXMgbm8gc3Vycm91bmRpbmcgdGV4dCwgc28gYSBiYWNrc2xhc2ggYmVsb25ncyB0byB0aGVcbiAqIHN0YXRlbWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cbiAqIEByZXR1cm5zIHt7IHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfX1cbiAqL1xuZXhwb3J0IGNvbnN0IHBhcnNlRXhwcmVzc2lvbiA9IChhRXhwcmVzc2lvbikgPT4ge1xuXHRhRXhwcmVzc2lvbiA9IGFFeHByZXNzaW9uLnRyaW0oKTtcblxuXHRpZiAoYUV4cHJlc3Npb24uc3RhcnRzV2l0aChFWFBSRVNTSU9OX1NUQVJUKSAmJiBhRXhwcmVzc2lvbi5lbmRzV2l0aChcIn1cIikpXG5cdFx0cmV0dXJuIHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRCeVNlcGFyYXRvcihhRXhwcmVzc2lvbi5zdWJzdHJpbmcoMiwgYUV4cHJlc3Npb24ubGVuZ3RoIC0gMSkpO1xuXG5cdC8vIGFueXRoaW5nIGVsc2UgaXMgYSBzdGF0ZW1lbnQgaW4gZnVsbCwgYW5kIGNhcnJpZXMgbm8gc2NvcGUgcHJlZml4XG5cdHJldHVybiB7IHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IHRyaW1Ub051bGwoYUV4cHJlc3Npb24pIH07XG59O1xuXG4vKipcbiAqIFRoZSBzcGxpdCBvZiB0aGUgc2luZ2xlIGV4cHJlc3Npb246IG1vc3Qgc3RhdGVtZW50cyBjYXJyeSBubyBcIjo6XCIgYXQgYWxsIGFuZCBhcmUgZG9uZSBhZnRlciBvbmVcbiAqIG5hdGl2ZSBzZWFyY2guIFdoZXJlIG9uZSBzdGFuZHMsIGV2ZXJ5dGhpbmcgYmVmb3JlIHRoZSBmaXJzdCBvZiB0aGVtIGhhcyB0byBiZSBhIG5hbWUsIGNoZWNrZWRcbiAqIGJhY2t3YXJkcyBmcm9tIGl0OiBhIFwiOjpcIiBpbnNpZGUgYSBzdGF0ZW1lbnQgLSBhIHF1b3RlZCBvbmUgLSB1c3VhbGx5IGhhcyBhIGNoYXJhY3RlciBubyBuYW1lXG4gKiBjYXJyaWVzIHJpZ2h0IGluIGZyb250IG9mIGl0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhQ29udGVudCB0aGUgdGV4dCBiZXR3ZWVuIHRoZSBkZWxpbWl0ZXJzXG4gKiBAcmV0dXJucyB7eyBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH19IGJvdGggdHJpbW1lZCwgbnVsbCB3aGVyZSBlbXB0eVxuICovXG5jb25zdCBzcGxpdFNjb3BlQW5kU3RhdGVtZW50QnlTZXBhcmF0b3IgPSAoYUNvbnRlbnQpID0+IHtcblx0Y29uc3QgZW5kID0gYUNvbnRlbnQuaW5kZXhPZihTQ09QRV9TRVBBUkFUT1IpO1xuXHRpZiAoZW5kIDwgMCkgcmV0dXJuIHsgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudCkgfTtcblxuXHRmb3IgKGxldCBpbmRleCA9IGVuZCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFDb250ZW50KSB9O1xuXG5cdHJldHVybiB7IHNjb3BlOiB0cmltVG9OdWxsKGFDb250ZW50LnN1YnN0cmluZygwLCBlbmQpKSwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFDb250ZW50LnN1YnN0cmluZyhlbmQgKyAyKSkgfTtcbn07XG4iLCJpbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcbmltcG9ydCB7IGlzTnVsbE9yVW5kZWZpbmVkIH0gZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5cbi8qKlxuICogVGhlIGRlc2NyaXB0b3IgYSBwcm9wZXJ0eSBoYXMgd2hlcmUgaXQgaXMgZGVmaW5lZCAtIG93biBvciBhbnl3aGVyZSB1cCB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gKiB0aGUgb2JqZWN0IGhvbGRpbmcgaXQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfHN5bWJvbH0gcHJvcGVydHlcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eURlc2NyaXB0b3J8bnVsbH1cbiAqL1xuY29uc3QgZmluZFByb3BlcnR5RGVzY3JpcHRvciA9IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRsZXQgdHlwZSA9IGRhdGE7XG5cdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodHlwZSwgcHJvcGVydHkpO1xuXHRcdGlmIChkZXNjcmlwdG9yKSByZXR1cm4gZGVzY3JpcHRvcjtcblx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBUaGUgbmFtZXMgYSBoYW5kbGUgcHJvdmlkZXMsIGVhY2ggbWFwcGVkIHRvIHRoZSBoYW5kbGUgcHJvdmlkaW5nIGl0OiBhIE1hcCwgb3IgdGhlIHN0YW5kLWluIG9mXG4gKiBgY3JlYXRlR2xvYmFsTmFtZUNhY2hlYCBvdmVyIHRoZSBnbG9iYWwgb2JqZWN0LCB3aGljaCBhbnN3ZXJzIHRoZSBzYW1lIGNhbGxzLlxuICpcbiAqIEB0eXBlZGVmIHtNYXA8c3RyaW5nfHN5bWJvbCxSZXNvbHZlckNvbnRleHRIYW5kbGU+fSBOYW1lQ2FjaGVcbiAqL1xuXG4vKipcbiAqIE5hbWUgY2FjaGUgZm9yIGEgY29udGV4dCB0aGF0IGlzIHRoZSBnbG9iYWwgb2JqZWN0IGl0c2VsZi5cbiAqXG4gKiBJdCBhbnN3ZXJzIGxpa2UgdGhlIE1hcCBpdCByZXBsYWNlczogZXZlcnkgbmFtZSBpcyBwcmVzZW50LCBhbmQgdGhlIHZhbHVlIGlzIHRoZSBoYW5kbGVcbiAqIGhvbGRpbmcgaXQgLSBuZXZlciB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5LiBUaGF0IGlzIHRoZSBjb250cmFjdCBvZiAjZmluZEhhbmRsZSxcbiAqIHdob3NlIGNhbGxlciByZWFkcyB0aGUgcHJvcGVydHkgb2ZmIHRoZSBoYW5kbGUgaXQgZ2V0cyBiYWNrLlxuICpcbiAqIEJlY2F1c2UgZXZlcnkgbmFtZSBpcyBwcmVzZW50LCBzdWNoIGEgcmVzb2x2ZXIgYW5zd2VycyBldmVyeSBsb29rdXAgdGhhdCByZWFjaGVzIGl0LCBhbmQgbm9cbiAqIGhhbmRsZSBuZWFyZXIgdGhlIHJvb3QgaXMgcmVhY2hlZC4gSXQgbGlzdHMgbm8gbmFtZSBvZiBpdHMgb3duLCBzbyB0aGUgb3duS2V5cyB0cmFwIG9mIGEgaGFuZGxlXG4gKiBmdXJ0aGVyIGZyb20gdGhlIHJvb3QgcmVwb3J0cyBub25lIG9mIHRoZSBnbG9iYWwgb2JqZWN0J3MuXG4gKlxuICogQHBhcmFtIHtSZXNvbHZlckNvbnRleHRIYW5kbGV9IGhhbmRsZVxuICogQHJldHVybnMge05hbWVDYWNoZX1cbiAqL1xuY29uc3QgY3JlYXRlR2xvYmFsTmFtZUNhY2hlID0gKGhhbmRsZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhczogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXHRcdGdldDogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlO1xuXHRcdH0sXG5cdFx0c2V0OiAocHJvcGVydHksIHZhbHVlKSA9PiB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRkZWxldGU6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0a2V5czogKCkgPT4ge1xuXHRcdFx0Ly8gTm8gbmFtZSBvZiBpdHMgb3duLiBgaGFzYCBhbHJlYWR5IGFuc3dlcnMgZXZlcnkgbG9va3VwLCBzbyBhIG5hbWUgb2YgdGhlIGdsb2JhbCBvYmplY3Rcblx0XHRcdC8vIGlzIGZvdW5kIGZyb20gYW55d2hlcmUgYmVsb3c7IGxpc3RpbmcgaXQgYXMgd2VsbCB3b3VsZCBvbmx5IGhhbmQgaXQgdG8gYW4gZXhlY3V0ZXIgdGhhdFxuXHRcdFx0Ly8gdHVybnMgYSBuYW1lIGludG8gY29kZSwgd2hpY2ggdGhlbiBmYWlscyBvdmVyIG5hbWVzIGl0IG5ldmVyIG5lZWRlZCAtIHRoZSBpbmRleCBcIjBcIiBvZlxuXHRcdFx0Ly8gYSBmcmFtZSwgYSBzeW1ib2wgYW5vdGhlciBsaWJyYXJ5IHBsYW50ZWQuIEEgc3RhdGVtZW50IHJlYWNoZXMgYSBnbG9iYWwgdGhyb3VnaCB0aGVcblx0XHRcdC8vIG9yZGluYXJ5IHNjb3BlIGNoYWluIGFueXdheS5cblx0XHRcdHJldHVybiBbXTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqXG4gKiBXaGF0IHN0YW5kcyBiZWhpbmQgdGhlIGNvbnRleHQgb2Ygb25lIHJlc29sdmVyOiB0aGUgb2JqZWN0IGhhbmRlZCB0byBpdCwgdGhlIGhhbmRsZSBvZiBpdHMgcGFyZW50LFxuICogYW5kIHRoZSBuYW1lIGNhY2hlIHRoYXQgdGVsbHMgd2hpY2ggbmFtZXMgdGhpcyByZXNvbHZlciBwcm92aWRlcy4gSXQgaGFuZHMgb3V0IHRoZSBjb250ZXh0IGFuXG4gKiBleHByZXNzaW9uIHNlZXMsIGEgcHJveHkgdGhhdCBhbnN3ZXJzIGZvciB0aGUgd2hvbGUgY2hhaW4uXG4gKlxuICogSW50ZXJuYWwgdG8gdGhlIHBhY2thZ2U6IGluZGV4LmpzIGRvZXMgbm90IGV4cG9ydCBpdC5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmVzb2x2ZXJDb250ZXh0SGFuZGxlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc29sdmVyQ29udGV4dEhhbmRsZSB7XG5cdC8qKiBAdHlwZSB7b2JqZWN0fG51bGx9ICovXG5cdCNjb250ZXh0ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH0gKi9cblx0I3BhcmVudCA9IG51bGw7XG5cdC8qKiBAdHlwZSB7b2JqZWN0fG51bGx9ICovXG5cdCNkYXRhID0gbnVsbDtcblx0LyoqIEB0eXBlIHtOYW1lQ2FjaGV8bnVsbH0gKi9cblx0I2NhY2hlID0gbnVsbDtcblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHQjcHJvdmlkZXNDb250ZXh0ID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0gez9vYmplY3R9IGNvbnRleHQgdGhlIG9iamVjdCB0aGUgY2FsbGVyIGhhbmRlZCBvdmVyLCBrZXB0IHJhdGhlciB0aGFuIGNvcGllZC4gV2hlcmUgbm9uZVxuXHQgKiBpcyBwYXNzZWQsIHRoZSBoYW5kbGUgaG9sZHMgbm8gb2JqZWN0IGF0IGFsbCBhbmQgY2FycmllcyBubyBuYW1lLCBub3QgZXZlbiBvbmUgb2Zcblx0ICogT2JqZWN0LnByb3RvdHlwZS4gSXQgZ2V0cyBhbiBvYmplY3Qgb24gdGhlIGZpcnN0IHdyaXRlLlxuXHQgKiBAcGFyYW0gez9SZXNvbHZlckNvbnRleHRIYW5kbGV9IHBhcmVudCB0aGUgaGFuZGxlIG9mIHRoZSBwYXJlbnQgcmVzb2x2ZXJcblx0ICovXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQsIHBhcmVudCkge1xuXHRcdHRoaXMuI2RhdGEgPSBpc051bGxPclVuZGVmaW5lZChjb250ZXh0KSA/IG51bGwgOiBjb250ZXh0O1xuXHRcdHRoaXMuI3BhcmVudCA9IHBhcmVudCA/IHBhcmVudCA6IG51bGw7XG5cdFx0dGhpcy4jcHJvdmlkZXNDb250ZXh0ID0gIWlzTnVsbE9yVW5kZWZpbmVkKGNvbnRleHQpO1xuXG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNidWlsZE5hbWVDYWNoZSgpO1xuXG5cdFx0aWYgKEdMT0JBTCA9PT0gdGhpcy4jZGF0YSlcblx0XHRcdHRoaXMuI2NvbnRleHQgPSB0aGlzLiNkYXRhO1xuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gVGhlIHByb3h5IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbiwgd2hpY2ggaXMgbW9yZSB0aGFuIHRoZSBvYmplY3QgaGFuZGVkIHRvIHRoaXNcblx0XHRcdC8vIHJlc29sdmVyIGhvbGRzLiBBIHByb3h5IG1heSBub3Qgc3BlYWsgdGhhdCBmcmVlbHkgZm9yIGEgdGFyZ2V0IHRoYXQgZ3VhcmFudGVlc1xuXHRcdFx0Ly8gYW55dGhpbmcgYWJvdXQgaXRzIG93biBrZXlzIC0gYSBmcm96ZW4gb3Igc2VhbGVkIGNvbnRleHQgaXMgd2hlcmUgdGhhdCBlbmRzIGluIGFcblx0XHRcdC8vIFR5cGVFcnJvciAtIHNvIGl0IGdldHMgYW4gZW1wdHkgdGFyZ2V0IG9mIGl0cyBvd24uIE5vIHRyYXAgcmVhZHMgaXQ7IGV2ZXJ5IG9uZSBvZlxuXHRcdFx0Ly8gdGhlbSB3b3JrcyBvbiAjZGF0YSBhbmQgI2NhY2hlLlxuXHRcdFx0dGhpcy4jY29udGV4dCA9IG5ldyBQcm94eSh7fSwge1xuXHRcdFx0XHRoYXM6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJoYXMgcHJvcGVydHk6XCIsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy4jZmluZEhhbmRsZShwcm9wZXJ0eSkgIT0gbnVsbDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0OiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0IHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy4jZmluZEhhbmRsZShwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIGhhbmRsZSA/IGhhbmRsZS4jZGF0YVtwcm9wZXJ0eV0gOiB1bmRlZmluZWQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogKGRhdGEsIHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJzZXQgcHJvcGVydHk6XCIsIHByb3BlcnR5LCBcIj1cIiwgdmFsdWUpO1xuXHRcdFx0XHRcdHRoaXMuI2RhdGEgPz89IHt9O1xuXHRcdFx0XHRcdHRoaXMuI2RhdGFbcHJvcGVydHldID0gdmFsdWU7XG5cdFx0XHRcdFx0dGhpcy4jY2FjaGUuc2V0KHByb3BlcnR5LCB0aGlzKTtcblx0XHRcdFx0XHR0aGlzLiNwcm92aWRlc0NvbnRleHQgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRkZWxldGVQcm9wZXJ0eTogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAoaGFuZGxlKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy4jZGF0YVtwcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHR0aGlzLiNjYWNoZS5kZWxldGUocHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBoYW5kbGUgPSB0aGlzLiNmaW5kSGFuZGxlKHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAoIWhhbmRsZSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdC8vIFJlYWQgdGhyb3VnaCBhIGdldHRlciByYXRoZXIgdGhhbiB1cCBmcm9udCwgc28gZW51bWVyYXRpbmcgYSBjb250ZXh0IGRvZXMgbm90XG5cdFx0XHRcdFx0Ly8gZXZhbHVhdGUgd2hhdCBub2JvZHkgYXNrZWQgZm9yLCBhbmQgc28gYSB2YWx1ZSBzdGF5cyBsaXZlLiBFbnVtZXJhYmlsaXR5XG5cdFx0XHRcdFx0Ly8gaXMgdGFrZW4gZnJvbSB3aGVyZSB0aGUgcHJvcGVydHkgaXMgZGVmaW5lZCAtIHRoYXQgaXMgd2hhdCBrZWVwcyB0aGUgbWVtYmVyc1xuXHRcdFx0XHRcdC8vIG9mIE9iamVjdC5wcm90b3R5cGUgb3V0IG9mIE9iamVjdC5rZXlzIC0gd2hpbGUgY29uZmlndXJhYmxlIGhhcyB0byBiZSB0cnVlOlxuXHRcdFx0XHRcdC8vIGEgcHJveHkgbWF5IG5vdCBjbGFpbSBhIGZpeGVkIHByb3BlcnR5IGl0cyB0YXJnZXQgZG9lcyBub3QgaGF2ZS5cblx0XHRcdFx0XHRjb25zdCBkZXNjcmlwdG9yID0gZmluZFByb3BlcnR5RGVzY3JpcHRvcihoYW5kbGUuI2RhdGEsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Z2V0OiAoKSA9PiBoYW5kbGUuI2RhdGFbcHJvcGVydHldLFxuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZGVzY3JpcHRvciA/IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA6IHRydWUsXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvd25LZXlzOiAoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJvd25LZXlzXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQoKTtcblx0XHRcdFx0XHRsZXQgaGFuZGxlID0gdGhpcztcblx0XHRcdFx0XHR3aGlsZSAoaGFuZGxlKSB7XG5cdFx0XHRcdFx0XHQvLyBhIGhhbmRsZSB3aXRob3V0IGFuIG9iamVjdCBjYXJyaWVzIG5vIG5hbWUgLSBpdHMgZW1wdHkgY2FjaGUgaXMgcGFzc2VkIGJ5XG5cdFx0XHRcdFx0XHRpZiAoaGFuZGxlLiNkYXRhICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGtleSBvZiBoYW5kbGUuI2NhY2hlLmtleXMoKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc3VsdC5hZGQoa2V5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aGFuZGxlID0gaGFuZGxlLiNwYXJlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBBcnJheS5mcm9tKHJlc3VsdCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbnRleHQgYW4gZXhwcmVzc2lvbiBzZWVzOiBhIHByb3h5IHRoYXQgYW5zd2VycyBmb3IgdGhlIHdob2xlIGNoYWluLCBvciBvdmVyIHRoZSBnbG9iYWxcblx0ICogb2JqZWN0IHRoZSBnbG9iYWwgb2JqZWN0IGl0c2VsZi5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtvYmplY3R9XG5cdCAqL1xuXHRnZXQgY29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxuXHQgKi9cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhpcyBoYW5kbGUgcHJvdmlkZXMgdGhlIG5hbWUgaXRzZWxmLiBFdmVyeSBuYW1lIG9mIGl0cyBvd24gY29udGV4dCBjb3VudHMsIHRoZSBvbmVzXG5cdCAqIGluaGVyaXRlZCB0aHJvdWdoIHRoZSBwcm90b3R5cGUgY2hhaW4gaW5jbHVkZWQ7IGEgaGFuZGxlIG92ZXIgdGhlIGdsb2JhbCBvYmplY3Rcblx0ICogcHJvdmlkZXMgZXZlcnkgbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8c3ltYm9sfSBrZXlcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRoYXNOYW1lKGtleSkge1xuXHRcdHJldHVybiB0aGlzLiNjYWNoZS5oYXMoa2V5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRoaXMgaGFuZGxlIHByb3ZpZGVzIGEgY29udGV4dDogb25lIHdhcyBoYW5kZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBvciBhIHZhbHVlIGhhcyBiZWVuXG5cdCAqIHdyaXR0ZW4gc2luY2UuIFdoYXQgdGhlIGRhdGEgaG9sZHMgZGVjaWRlcyBub3RoaW5nLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge2Jvb2xlYW59XG5cdCAqL1xuXHRnZXQgcHJvdmlkZXNDb250ZXh0KCkge1xuXHRcdHJldHVybiB0aGlzLiNwcm92aWRlc0NvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZXMgdGhlIG9iamVjdCB0aGlzIGhhbmRsZSBob2xkcywgYW5kIHdpdGggaXQgdGhlIG5hbWVzIGl0IHByb3ZpZGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gez9vYmplY3R9IGRhdGEgdGhlIG5ldyBvYmplY3Q7IG51bGwgb3IgdW5kZWZpbmVkIGxlYXZlcyB0aGUgaGFuZGxlIHdpdGhvdXQgb25lXG5cdCAqL1xuXHRyZXBsYWNlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy4jZGF0YSA9IGlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpID8gbnVsbCA6IGRhdGE7XG5cdFx0dGhpcy4jcHJvdmlkZXNDb250ZXh0ID0gIWlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jYnVpbGROYW1lQ2FjaGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBc3NpZ25zIHRoZSBrZXlzIG9mIGFuIG9iamVjdCBpbnRvIHRoZSBvbmUgdGhpcyBoYW5kbGUgaG9sZHMsIGtleSBieSBrZXksIGNyZWF0aW5nIHRoYXQgb2JqZWN0XG5cdCAqIHdoZXJlIHRoZXJlIGlzIG5vbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIG9iamVjdCBoZWxkIHJlZnVzZXMgYSBrZXkgLSB0aGUga2V5cyBiZWZvcmUgaXQgYXJlIHdyaXR0ZW4gYnkgdGhlblxuXHQgKi9cblx0bWVyZ2VEYXRhKGRhdGEpIHtcblx0XHR0aGlzLiNkYXRhID8/PSB7fTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMuI2RhdGEsIGRhdGEpO1xuXHRcdHRoaXMuI3Byb3ZpZGVzQ29udGV4dCA9IHRydWU7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNidWlsZE5hbWVDYWNoZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRha2VzIHVwIHRoZSBrZXlzIGFkZGVkIHRvIHRoZSBoYW5kZWQtaW4gb2JqZWN0IHNpbmNlIHRoZSBoYW5kbGUgd2FzIGJ1aWx0LCB3aGljaCBhcmUgbm90XG5cdCAqIHByb3ZpZGVkIHVudGlsIHRoZW4uXG5cdCAqL1xuXHRyZXNldENhY2hlKCkge1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jYnVpbGROYW1lQ2FjaGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIG5ldyBuYW1lIGNhY2hlIGZvciB0aGUgb2JqZWN0IHRoaXMgaGFuZGxlIGhvbGRzOiBldmVyeSBrZXkgaXQgY2FycmllcywgaXRzIHByb3RvdHlwZSBjaGFpblxuXHQgKiBpbmNsdWRlZCwgZWFjaCBtYXBwZWQgdG8gdGhpcyBoYW5kbGUuIE92ZXIgdGhlIGdsb2JhbCBvYmplY3QgdGhlIHN0YW5kLWluIG9mXG5cdCAqIGBjcmVhdGVHbG9iYWxOYW1lQ2FjaGVgLCB3aGljaCBwcm92aWRlcyBldmVyeSBuYW1lLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7TmFtZUNhY2hlfVxuXHQgKi9cblx0I2J1aWxkTmFtZUNhY2hlKCkge1xuXHRcdGNvbnN0IGRhdGEgPSB0aGlzLiNkYXRhO1xuXHRcdGlmIChHTE9CQUwgPT09IGRhdGEpIFxuXHRcdFx0cmV0dXJuIGNyZWF0ZUdsb2JhbE5hbWVDYWNoZSh0aGlzKTtcblxuXHRcdC8vIGV2ZXJ5IGtleSBKYXZhU2NyaXB0IHNheXMgdGhlIG9iamVjdCBjYXJyaWVzLCBub3RoaW5nIGZpbHRlcmVkIC0gd2hpY2ggb2YgdGhlbSBhbiBleGVjdXRlclxuXHRcdC8vIGNhbiBwdXQgaW50byBpdHMgY29kZSBpcyB0aGUgZXhlY3V0ZXIncyBidXNpbmVzc1xuXHRcdGNvbnN0IGNhY2hlID0gbmV3IE1hcCgpO1xuXHRcdGxldCB0eXBlID0gZGF0YTtcblx0XHR3aGlsZSAoIWlzTnVsbE9yVW5kZWZpbmVkKHR5cGUpKSB7XG5cdFx0XHRmb3IgKGxldCBuYW1lIG9mIFJlZmxlY3Qub3duS2V5cyh0eXBlKSkgY2FjaGUuc2V0KG5hbWUsIHRoaXMpO1xuXHRcdFx0dHlwZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodHlwZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhY2hlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBuZWFyZXN0IGhhbmRsZSBmcm9tIHRoaXMgb25lIHRvIHRoZSByb290IHRoYXQgcHJvdmlkZXMgdGhlIG5hbWUsIG9yIG51bGwgd2hlcmUgbm9uZSBkb2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xzeW1ib2x9IHByb3BlcnR5XG5cdCAqIEByZXR1cm5zIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH1cblx0ICovXG5cdCNmaW5kSGFuZGxlKHByb3BlcnR5KSB7XG5cdFx0Ly8gQSBoYW5kbGUgd2l0aG91dCBhbiBvYmplY3QgY2FycmllcyBubyBuYW1lLCBzbyBpdCBpcyBwYXNzZWQgYnkgd2l0aG91dCBhc2tpbmcgaXRzIGNhY2hlIC1cblx0XHQvLyBtb3N0IHJlc29sdmVycyBvZiBhIGNoYWluIGFyZSBidWlsdCB3aXRob3V0IGEgY29udGV4dC5cblx0XHRsZXQgaGFuZGxlID0gdGhpcztcblx0XHR3aGlsZSAoaGFuZGxlKSB7XG5cdFx0XHRpZiAoaGFuZGxlLiNkYXRhICE9PSBudWxsICYmIGhhbmRsZS4jY2FjaGUuaGFzKHByb3BlcnR5KSkgcmV0dXJuIGhhbmRsZS4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRcdGhhbmRsZSA9IGhhbmRsZS4jcGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuIiwiLyoqXG4gKiBUaGUgaGVscGVycyBtb3JlIHRoYW4gb25lIGNvbXBvbmVudCB1c2VzLiBJbnRlcm5hbCB0byB0aGUgcGFja2FnZTogaW5kZXguanMgZG9lcyBub3QgZXhwb3J0XG4gKiB0aGVtLlxuICovXG5cbi8qKiBXaGl0ZXNwYWNlIGluIHRoZSBzZW5zZSBvZiBgXFxzYC4gKi9cbmV4cG9ydCBjb25zdCBXSElURVNQQUNFID0gL1xccy87XG5cbi8qKlxuICogV2hldGhlciBhIGNoYXJhY3RlciBtYXkgc3RhbmQgaW4gYSBzY29wZSBuYW1lOiBhbiBBU0NJSSBsZXR0ZXIsIGEgZGlnaXQsXG4gKiBcIi1cIiwgXCJfXCIsIG9yIHdoaXRlc3BhY2UgaW4gdGhlIHNlbnNlIG9mIGBcXHNgLCB3aGljaCBwYXN0IEFTQ0lJIGlzIGxlZnQgdG8gdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gYUNvZGUgdGhlIGNoYXIgY29kZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBjb25zdCBpc05hbWVDaGFyYWN0ZXIgPSAoYUNvZGUpID0+IHtcblx0aWYgKGFDb2RlIDwgMHg4MClcblx0XHRyZXR1cm4gKFxuXHRcdFx0KGFDb2RlID49IDB4NjEgJiYgYUNvZGUgPD0gMHg3YSkgfHxcblx0XHRcdChhQ29kZSA+PSAweDQxICYmIGFDb2RlIDw9IDB4NWEpIHx8XG5cdFx0XHQoYUNvZGUgPj0gMHgzMCAmJiBhQ29kZSA8PSAweDM5KSB8fFxuXHRcdFx0YUNvZGUgPT09IDB4MmQgfHxcblx0XHRcdGFDb2RlID09PSAweDVmIHx8XG5cdFx0XHRhQ29kZSA9PT0gMHgyMCB8fFxuXHRcdFx0KGFDb2RlID49IDB4MDkgJiYgYUNvZGUgPD0gMHgwZClcblx0XHQpO1xuXG5cdHJldHVybiBXSElURVNQQUNFLnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShhQ29kZSkpO1xufTtcblxuLyoqXG4gKiBUcmltcyBhIHN0cmluZywgYW5kIGFuc3dlcnMgbnVsbCBmb3Igb25lIHRoYXQgaXMgZW1wdHkgYWZ0ZXIgdHJpbW1pbmcsIGFuZCBmb3Igbm9uZS5cbiAqXG4gKiBAcGFyYW0gez9zdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJucyB7P3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IHRyaW1Ub051bGwgPSAodmFsdWUpID0+IHtcblx0aWYgKHZhbHVlKSB7XG5cdFx0dmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PSAwID8gbnVsbCA6IHZhbHVlO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBBIDMyIGJpdCBoYXNoIG9mIGEgc3RyaW5nLCBpbiB0aGUgbWFubmVyIG9mIEphdmEncyBgU3RyaW5nLmhhc2hDb2RlYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0cmluZ1xuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IHN0cmluZ1RvSGFzaGNvZGUgPSAoYVN0cmluZykgPT4ge1xuXHRsZXQgaGFzaCA9IDA7XG5cdGlmIChhU3RyaW5nLmxlbmd0aCA9PSAwKSByZXR1cm4gaGFzaDtcblx0Y29uc3QgbGVuZ3RoID0gYVN0cmluZy5sZW5ndGg7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBjaGFyID0gYVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuXHRcdGhhc2ggPSAoaGFzaCA8PCA1KSAtIGhhc2ggKyBjaGFyO1xuXHRcdGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG5cdH1cblx0cmV0dXJuIGhhc2g7XG59O1xuIiwiaW1wb3J0IHsgcmVnaXN0ZXIgfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcblxubGV0IERFQlVHID0gZmFsc2U7XG4vKiogVGhlIG5hbWUgdGhpcyBleGVjdXRlciBpcyByZWdpc3RlcmVkIHVuZGVyLCBhbmQgdGhlIGRlZmF1bHQgZXhlY3V0ZXIuICovXG5leHBvcnQgY29uc3QgRVhFQ1VURVJOQU1FID0gXCJjb250ZXh0LWRlY29uc3RydWN0aW9uLWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSgpO1xuXG5cbi8qKlxuICogSG93IG1hbnkgbmFtZXMgYSBjb250ZXh0IG1heSBjYXJyeSBiZWZvcmUgdGhpcyBleGVjdXRlciBzYXlzIHRoYXQgYmluZGluZyB0aGVtIGFsbCBjb3N0cy4gRXZlcnlcbiAqIG9yZGluYXJ5IG9iamVjdCBicmluZ3Mgc2V2ZW4gb2YgdGhlbSBhbG9uZyBmcm9tIGBPYmplY3QucHJvdG90eXBlYCwgc28gdGhlIG51bWJlciBjb3VudHMgYSBnb29kXG4gKiBtYW55IG93biBrZXlzIGJlZm9yZSBpdCBpcyByZWFjaGVkLlxuICovXG5jb25zdCBISUdIX1BST1BFUlRZX0NPVU5UID0gMjU7XG5cbi8qKlxuICogVGhlIG5hbWVzIHRoYXQgbWFkZSB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIGZhaWwgdG8gY29tcGlsZSwgYXNrZWQgb2YgSmF2YVNjcmlwdCBpdHNlbGYgcmF0aGVyXG4gKiB0aGFuIG9mIGEgbGlzdCBrZXB0IGhlcmU6IGEgbmFtZSBpcyB1c2FibGUgd2hlbiBpdCBjYW4gc3RhbmQgaW4gYSBkZXN0cnVjdHVyaW5nIHBhdHRlcm4uXG4gKlxuICogT25seSBldmVyIGNhbGxlZCBvbiB0aGUgZmFpbHVyZSBwYXRoLCBzbyB0aGUgY29zdCBvZiBjb21waWxpbmcgb25lIHBhdHRlcm4gcGVyIG5hbWUgaXMgcGFpZCBieSBhXG4gKiBjb250ZXh0IHRoYXQgaXMgYnJva2VuIGZvciB0aGlzIGV4ZWN1dGVyIGFueXdheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZ3xzeW1ib2w+fSB0aGVOYW1lc1xuICogQHJldHVybnMge0FycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IHVudXNhYmxlTmFtZXMgPSAodGhlTmFtZXMpID0+XG5cdHRoZU5hbWVzXG5cdFx0LmZpbHRlcigobmFtZSkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBuYW1lID09PSBcInN5bWJvbFwiKSByZXR1cm4gdHJ1ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5ldyBGdW5jdGlvbihgeyR7bmFtZX19YCwgXCJcIik7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQubWFwKFN0cmluZyk7XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIGxvZ2dpbmcgb2YgZXZlcnkgZnVuY3Rpb24gdGhpcyBleGVjdXRlciBnZW5lcmF0ZXMgdG8gdGhlIGNvbnNvbGUuXG4gKlxuICogQHBhcmFtIHtib29sZWFufSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3Qgc2V0RGVidWcgPSAodmFsdWUpID0+IHtcblx0REVCVUcgPSB2YWx1ZTtcbn07XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgY29kZSBjYWNoZSBvZiB0aGlzIGV4ZWN1dGVyLiBgc2l6ZWAgaXMgdGhlIG9ubHkgb3B0aW9uXG4gKiB0b2RheTsgYW4gb3B0aW9uIGxlZnQgb3V0IGNoYW5nZXMgbm90aGluZy5cbiAqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgc2l6ZSBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcbn07XG5cbmNvbnN0IGdldFByb3BlcnR5TmFtZXMgPSAoYUNvbnRleHQpID0+IHtcblx0aWYgKEdMT0JBTCA9PT0gYUNvbnRleHQpIHJldHVybiBbXTtcblx0cmV0dXJuIFJlZmxlY3Qub3duS2V5cyhhQ29udGV4dCk7XG59O1xuXG5jb25zdCBnZXRPckNyZWF0ZUZ1bmN0aW9uID0gKGFTdGF0ZW1lbnQsIGNvbnRleHRQcm9wZXJ0aWVzKSA9PiB7XG5cdC8vIEEgc3ltYm9sIGhhcyB0byBiZSB3cml0dGVuIG91dCByYXRoZXIgdGhhbiBqb2luZWQgLSBgam9pbmAgYWxvbmUgcmFpc2VzIGEgVHlwZUVycm9yIHRoYXQgc2F5c1xuXHQvLyBub3RoaW5nIGFib3V0IHRoZSBjb250ZXh0IGl0IGNhbWUgZnJvbS4gV3JpdHRlbiBvdXQgaXQgcmVhY2hlcyB0aGUgcGF0dGVybiwgd2hlcmUgaXQgZmFpbHMgdG9cblx0Ly8gY29tcGlsZSBsaWtlIGFueSBvdGhlciBuYW1lIHRoYXQgaXMgbm8gaWRlbnRpZmllciwgYW5kIGdlbmVyYXRlKCkgbmFtZXMgaXQuXG5cdGNvbnN0IHByb3BlcnR5TmFtZXMgPSBjb250ZXh0UHJvcGVydGllcy5tYXAoU3RyaW5nKS5qb2luKFwiLFwiKTtcblx0Y29uc3QgY2FjaGVLZXkgPSBgJHthU3RhdGVtZW50Lmxlbmd0aH06OiR7cHJvcGVydHlOYW1lc306OiR7YVN0YXRlbWVudH1gO1xuXHRpZiAoRVhQUkVTU0lPTl9DQUNIRS5oYXMoY2FjaGVLZXkpKSB7XG5cdFx0cmV0dXJuIEVYUFJFU1NJT05fQ0FDSEUuZ2V0KGNhY2hlS2V5KTtcblx0fVxuXHRjb25zdCBleHByZXNzaW9uID0gZ2VuZXJhdGUoYVN0YXRlbWVudCwgcHJvcGVydHlOYW1lcywgY29udGV4dFByb3BlcnRpZXMpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChjYWNoZUtleSwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBUaGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIGRlc3RydWN0dXJlcyB0aGUgY29udGV4dCBpbiBpdHMgcGFyYW1ldGVyIGxpc3QgYW5kIHJ1bnMgdGhlIHN0YXRlbWVudCBvdmVyXG4gKiB0aGUgbG9jYWwgYmluZGluZ3MgdGhhdCBwcm9kdWNlcy5cbiAqXG4gKiAqKk5vdGhpbmcgaXMgY2FycmllZCBiYWNrLioqIEEgc3RhdGVtZW50IHRoYXQgYXNzaWducyB0byBhIGNvbnRleHQgbmFtZSB3cml0ZXMgaW50byBhIGxvY2FsXG4gKiBiaW5kaW5nLCBhbmQgdGhhdCBiaW5kaW5nIGlzIGdvbmUgd2hlbiB0aGUgZnVuY3Rpb24gcmV0dXJucyAtIHNvIGEgd3JpdGUgaXMgbm90IHJlYWRhYmxlXG4gKiBhZnRlcndhcmRzLCB3aGljaCB0aGUgcmVzb2x2ZXIgbGVhdmVzIHRvIGVhY2ggZXhlY3V0ZXIuIFRoYXQgaXMgYSBkZWNpc2lvbiByYXRoZXIgdGhhbiBhIGdhcDogdGhlXG4gKiB3cml0ZS1iYWNrIHRoaXMgZXhlY3V0ZXIgY2FycmllZCBiZXR3ZWVuIDIwMjYtMDktMDcgYW5kIDIwMjYtMDktMjAgY29zdCBhIGZhY3RvciBvZiBlbGV2ZW4gb24gYVxuICogY2FjaGUgbWlzcywgYmVjYXVzZSBpdCBuZWVkcyBldmVyeSBjb250ZXh0IG5hbWUgZGVjbGFyZWQgaW4gdGhlIGJvZHkgaW5zdGVhZCBvZiBsaXN0ZWQgaW4gdGhlXG4gKiBwYXJhbWV0ZXIgbGlzdC4gU3BlZWQgaXMgd2hhdCB0aGlzIGV4ZWN1dGVyIGlzIGZvciwgYW5kIGEgY29uc3VtZXIgd2hvIG5lZWRzIGEgd3JpdGUgdG8gcGVyc2lzdFxuICogcGlja3MgYGNvbnRleHQtb2JqZWN0LWV4ZWN1dGVyYC5cbiAqXG4gKiBXaGF0IHN0aWxsIHJlYWNoZXMgdGhlIGNvbnRleHQgaXMgYSAqKm11dGF0aW9uKio6IGBob2xkZXIubmFtZSA9IFwiYWZ0ZXJcImAgY2hhbmdlcyBhbiBvYmplY3QgdGhlXG4gKiBiaW5kaW5nIGFuZCB0aGUgY29udGV4dCBib3RoIHBvaW50IGF0LCBhbmQgbmVlZHMgbm90aGluZyBjYXJyaWVkIGJhY2suXG4gKlxuICogVGhlIGNvbnRleHQgaXMgZGVzdHJ1Y3R1cmVkIGluIHRoZSBwYXJhbWV0ZXIgbGlzdCByYXRoZXIgdGhhbiBkZWNsYXJlZCBpbiB0aGUgYm9keSBzbyB0aGF0IHRoZVxuICogZ2VuZXJhdGVkIHNvdXJjZSBzdGF5cyBvbmUgbGluZSBwZXIgc3RhdGVtZW50IGluc3RlYWQgb2Ygb25lIGxpbmUgcGVyIGNvbnRleHQgbmFtZSAtIGBuZXcgRnVuY3Rpb25gXG4gKiBwYXJzZXMgdGhhdCBzb3VyY2Ugb24gZXZlcnkgY2FjaGUgbWlzcywgYW5kIGl0cyBsZW5ndGggaXMgd2hhdCB0aGUgbWlzcyBjb3N0cy4gSXQgYWxzbyBkZWNsYXJlcyBub1xuICogbmFtZSBvZiBpdHMgb3duOiB0aGUgc3RhdGVtZW50IGNhbiB0aGVyZWZvcmUgbmV2ZXIgY29sbGlkZSB3aXRoIGEgYmluZGluZyBvZiB0aGlzIGZ1bmN0aW9uLCB3aGljaFxuICogaXMgd2hhdCB0aGUgcmFuZG9tIHN1ZmZpeCByZW1vdmVkIG9uIDIwMjYtMDktMjAgdXNlZCB0byBndWFyZC5cbiAqXG4gKiAqKk5vdGhpbmcgaXMgZmlsdGVyZWQgb3V0IG9mIHRoZSBwYXR0ZXJuLioqIEV2ZXJ5IG5hbWUgdGhlIGNvbnRleHQgY2FycmllcyBpcyBib3VuZCwgYSBuYW1lIHRoYXRcbiAqIGNhbm5vdCBiZSBhIHZhcmlhYmxlIGluY2x1ZGVkIC0gYSBrZXkgbGlrZSBgdGVzdC10ZXN0YCwgYSByZXNlcnZlZCB3b3JkLCBhIHN5bWJvbCwgdGhlIGluZGV4IG9mIGFuXG4gKiBhcnJheS4gU3VjaCBhIGNvbnRleHQgY2Fubm90IGJlIHJ1biBvdmVyIGJ5IHRoaXMgZXhlY3V0ZXIgYXQgYWxsLCBhbmQgZHJvcHBpbmcgdGhlIG5hbWUgc2lsZW50bHlcbiAqIHdvdWxkIGhpZGUgYSBwcm9wZXJ0eSB0aGUgY2FsbGVyIGRlZmluZWQuIFdoYXQgdGhpcyBleGVjdXRlciBvd2VzIHRoZSBjYWxsZXIgaW5zdGVhZCBpcyBhIG1lc3NhZ2VcbiAqIHRoYXQgc2F5cyB3aGljaCBzdGF0ZW1lbnQgZmFpbGVkIGFuZCB3aGljaCBuYW1lIGRpZCBpdCwgYmVjYXVzZSB0aGUgc3RhdGVtZW50IGl0c2VsZiBuZWVkIG5vdFxuICogbWVudGlvbiB0aGF0IG5hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aGVQcm9wZXJ0eU5hbWVTdHJpbmcgdGhlIGNvbnRleHQgbmFtZXMsIGNvbW1hIHNlcGFyYXRlZCwgYXMgdGhlIGRlc3RydWN0dXJpbmdcbiAqICAgICAgICAgICAgICAgICBwYXR0ZXJuIHNwZWxscyB0aGVtXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZ3xzeW1ib2w+fSB0aGVOYW1lcyB0aGUgc2FtZSBuYW1lcyB1bndyaXR0ZW4sIGZvciB0aGUgZXJyb3IgbWVzc2FnZVxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50LCB0aGVQcm9wZXJ0eU5hbWVTdHJpbmcsIHRoZU5hbWVzKSA9PiB7XG5cdC8vIE9ubHkgaGVyZSwgYW5kIHRoZXJlZm9yZSBvbmNlIHBlciBjb250ZXh0IHNoYXBlIGFuZCBzdGF0ZW1lbnQgcmF0aGVyIHRoYW4gb24gZXZlcnkgZXhlY3V0aW9uOlxuXHQvLyBhIGNvbnNvbGUgd3JpdGUgaW4gYSBicm93c2VyIGNvc3RzIG1vcmUgdGhhbiBhIHJlc29sdXRpb24gZG9lcywgYW5kIHdhcm5pbmcgcGVyIGV4ZWN1dGlvbiBjb3N0XG5cdC8vIHRoaXMgZXhlY3V0ZXIgYSBmYWN0b3Igb2YgZm91ciB0byB0d2VudHktZml2ZSAobWVhc3VyZWQgMjAyNi0wOS0yMiwgYG5wbSBydW4gYmVuY2hgKS5cblx0aWYgKHRoZU5hbWVzLmxlbmd0aCA+IEhJR0hfUFJPUEVSVFlfQ09VTlQpXG5cdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0YEhpZ2ggY291bnQgb2YgcHJvcGVydGllcyBhdCBmaXJzdCBsZXZlbCwgY2FuIGJlIGRlY3JlYXNlIHRoZSBwZXJmb3JtZW5jZSEgY291bnQ6ICR7dGhlTmFtZXMubGVuZ3RofWAsXG5cdFx0KTtcblxuXHRjb25zdCBjb2RlID0gYFxucmV0dXJuIChhc3luYyAoeyR7dGhlUHJvcGVydHlOYW1lU3RyaW5nfX0pID0+IHtcbiAgICB0cnl7XG4gICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoYXJndW1lbnRzWzBdIHx8IHt9KTtgO1xuXG5cdGlmIChERUJVRykgY29uc29sZS5sb2coXCJnZW5lcmVyYXRlZCBjb2RlOiBcXG5cIiwgY29kZSk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uKGNvZGUpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gb25seSBhIHN5bnRheCBlcnJvciBjYW4gY29tZSBmcm9tIGEgbmFtZS4gQW55dGhpbmcgZWxzZSAtIHRoZSBFdmFsRXJyb3Igb2YgYSBDb250ZW50IFNlY3VyaXR5XG5cdFx0Ly8gUG9saWN5IHdpdGhvdXQgJ3Vuc2FmZS1ldmFsJyBhbW9uZyB0aGVtIC0gaXMgaGFuZGVkIG9uOiBhc2tpbmcgYWJvdXQgdGhlIG5hbWVzIHdvdWxkIGJlXG5cdFx0Ly8gcmVmdXNlZCBhcyB3ZWxsLCBhbmQgZXZlcnkgbmFtZSB3b3VsZCBiZSBibGFtZWRcblx0XHRpZiAoIShlIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpKSB0aHJvdyBlO1xuXG5cdFx0Y29uc3QgdW51c2FibGUgPSB1bnVzYWJsZU5hbWVzKHRoZU5hbWVzKTtcblx0XHQvLyBub3RoaW5nIHdyb25nIHdpdGggdGhlIG5hbWVzOiB0aGUgc3RhdGVtZW50IGl0c2VsZiBkb2VzIG5vdCBjb21waWxlLCBhbmQgdGhhdCBlcnJvciBzYXlzXG5cdFx0Ly8gbW9yZSB0aGFuIGFueXRoaW5nIHRoaXMgZXhlY3V0ZXIgY291bGQgYWRkXG5cdFx0aWYgKHVudXNhYmxlLmxlbmd0aCA9PT0gMCkgdGhyb3cgZTtcblxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihcblx0XHRcdGBDb250ZXh0IHByb3BlcnR5ICR7dW51c2FibGUubGVuZ3RoID09PSAxID8gXCJuYW1lXCIgOiBcIm5hbWVzXCJ9IFwiJHt1bnVzYWJsZS5qb2luKCdcIiwgXCInKX1cIiBjYW5ub3QgYmUgdXNlZCBhcyBhIHZhcmlhYmxlIGJ5ICR7RVhFQ1VURVJOQU1FfSwgc28gdGhpcyBzdGF0ZW1lbnQgY2Fubm90IHJ1biBvdmVyIHRoaXMgY29udGV4dCEgc3RhdGVtZW50OiAke2FTdGF0ZW1lbnR9YCxcblx0XHRcdHsgY2F1c2U6IGUgfSxcblx0XHQpO1xuXHR9XG59O1xuXG4vKipcbiAqIFRoZSBleGVjdXRlcjogZGVzdHJ1Y3R1cmVzIHRoZSBjb250ZXh0IGludG8gdGhlIHBhcmFtZXRlcnMgb2YgYSBnZW5lcmF0ZWQgZnVuY3Rpb24sIHNvIGFcbiAqIHN0YXRlbWVudCBhZGRyZXNzZXMgYSBjb250ZXh0IHZhbHVlIGJ5IGl0cyBiYXJlIG5hbWUgLSBzZWUgYFJFQURNRS5tZGAuXG4gKiBSZWdpc3RlcmVkIHVuZGVyIGBFWEVDVVRFUk5BTUVgIG9uIGltcG9ydC5cbiAqXG4gKiBAdHlwZSB7RXhlY3V0ZXJ9XG4gKi9cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzID0gZ2V0UHJvcGVydHlOYW1lcyhhQ29udGV4dCk7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCwgcHJvcGVydHlOYW1lcyk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdGVyKEVYRUNVVEVSTkFNRSwgRVhFQ1VURVIpO1xuXG5leHBvcnQgZGVmYXVsdCBFWEVDVVRFUjtcbiIsImltcG9ydCB7IHJlZ2lzdGVyIH0gZnJvbSBcIi4uL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBDb2RlQ2FjaGUgZnJvbSBcIi4uL0NvZGVDYWNoZS5qc1wiO1xuXG4vKiogVGhlIG5hbWUgdGhpcyBleGVjdXRlciBpcyByZWdpc3RlcmVkIHVuZGVyLiAqL1xuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKCk7XG4vKiogVGhlIG5hbWUgYSBzdGF0ZW1lbnQgYWRkcmVzc2VzIHRoZSBjb250ZXh0IGJ5LiAqL1xubGV0IENPTlRFWFRfVkFSID0gXCJjdHhcIjtcblxuLyoqXG4gKiBDb25maWd1cmVzIHRoaXMgZXhlY3V0ZXI6IHRoZSBzaXplIG9mIGl0cyBjb2RlIGNhY2hlIGFuZCB0aGUgbmFtZSBhIHN0YXRlbWVudCBhZGRyZXNzZXMgdGhlXG4gKiBjb250ZXh0IGJ5LiBBbiBvcHRpb24gbGVmdCBvdXQgY2hhbmdlcyBub3RoaW5nLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zaXplXSB0aGUgc2l6ZSBvZiB0aGUgY29kZSBjYWNoZSwgYXMgYENvZGVDYWNoZU9wdGlvbnNgIGRlc2NyaWJlcyBpdCBpblxuICogYENvZGVDYWNoZS5qc2BcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jb250ZXh0VmFyXSB0aGUgbmFtZSBhIHN0YXRlbWVudCBhZGRyZXNzZXMgdGhlIGNvbnRleHQgYnksIGBjdHhgIHVudGlsIGl0XG4gKiBpcyBzZXQuIEl0IGhvbGRzIGZvciBldmVyeSBzdGF0ZW1lbnQgdGhpcyBleGVjdXRlciBydW5zIGZyb20gdGhlbiBvbiwgd2hpY2hldmVyIHJlc29sdmVyIGhhbmRzIGl0XG4gKiBvdmVyLiBOdWxsLCB1bmRlZmluZWQgYW5kIGEgc3RyaW5nIHRoYXQgaXMgZW1wdHkgYWZ0ZXIgdHJpbW1pbmcgbGVhdmUgdGhlIG5hbWUgYXMgaXQgaXMuIEEgbmFtZVxuICogdGhhdCBjYW5ub3QgYmUgYSBwYXJhbWV0ZXIgbmFtZSBpcyBub3QgcmVqZWN0ZWQgaGVyZTogZXZlcnkgc3RhdGVtZW50IHRoZW4gdGhyb3dzIGEgYFN5bnRheEVycm9yYC5cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHNpemUgaXMgbm90IGEgZmluaXRlIG51bWJlciwgb3IgdGhlIG5hbWUgaXMgbmVpdGhlciBhIHN0cmluZyBub3JcbiAqIG51bGwgb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcblx0Q09OVEVYVF9WQVIgPSBvcHRpb25zPy5jb250ZXh0VmFyID09IG51bGwgfHwgb3B0aW9ucz8uY29udGV4dFZhci50cmltKCkubGVuZ3RoID09PSAwID8gQ09OVEVYVF9WQVIgOiBvcHRpb25zPy5jb250ZXh0VmFyO1xufTtcblxuLyoqXG4gKiBUaGUgbmFtZSBhIHN0YXRlbWVudCBhZGRyZXNzZXMgdGhlIGNvbnRleHQgYnk6IGBjdHhgLCBvciB0aGUgb25lIGBzZXR1cEV4ZWN1dGVyYCBzZXQgbGFzdC5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgZ2V0Q29udGV4dFZhciA9ICgpID0+IENPTlRFWFRfVkFSO1xuXG4vKipcbiAqIENvbXBpbGVzIGEgc3RhdGVtZW50IGludG8gYSBmdW5jdGlvbiB0aGF0IGhhbmRzIHRoZSBjb250ZXh0IG92ZXIgdW5kZXIgdGhlIG5hbWUgYSBzdGF0ZW1lbnRcbiAqIGFkZHJlc3NlcyBpdCBieS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50KSA9PiB7XG5cdGNvbnN0IGNvZGUgPSBgXG5yZXR1cm4gKGFzeW5jICgke0NPTlRFWFRfVkFSfSkgPT4ge1xuICAgIHRyeXtcbiAgICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoYXJndW1lbnRzWzBdIHx8IHt9KTtgO1xuXG5cdC8vY29uc29sZS5sb2coXCJjb2RlXCIsIGNvZGUpO1xuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oY29kZSk7XG59O1xuXG4vKipcbiAqIFRoZSBjb21waWxlZCBmdW5jdGlvbiBmb3IgYSBzdGF0ZW1lbnQsIGZyb20gdGhlIGNhY2hlIG9yIGNvbXBpbGVkIG5vdyBhbmQgY2FjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRjb25zdCBjYWNoZUtleSA9IGAke0NPTlRFWFRfVkFSfTo6JHthU3RhdGVtZW50fWA7XG5cblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGNhY2hlS2V5KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChjYWNoZUtleSwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBUaGUgZXhlY3V0ZXI6IGhhbmRzIHRoZSBjb250ZXh0IG92ZXIgYXMgb25lIG9iamVjdCBuYW1lZCBgY3R4YCwgb3IgdGhlIG5hbWUgYHNldHVwRXhlY3V0ZXJgIHNldHMsXG4gKiBzbyBhIHN0YXRlbWVudCBhZGRyZXNzZXMgYSBjb250ZXh0IHZhbHVlIGFzIGBjdHgudmFsdWVgIC0gc2VlIGBSRUFETUUubWRgLiBSZWdpc3RlcmVkIHVuZGVyXG4gKiBgRVhFQ1VURVJOQU1FYCBvbiBpbXBvcnQuXG4gKlxuICogQHR5cGUge0V4ZWN1dGVyfVxuICovXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7XG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCk7XG5cdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fSxcbn0pO1xuXG5yZWdpc3RlcihFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCJpbXBvcnQgeyByZWdpc3RlciB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcblxuLyoqIFRoZSBuYW1lIHRoaXMgZXhlY3V0ZXIgaXMgcmVnaXN0ZXJlZCB1bmRlci4gKi9cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcIndpdGgtc2NvcGVkLWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSgpO1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIGNvZGUgY2FjaGUgb2YgdGhpcyBleGVjdXRlci4gYHNpemVgIGlzIHRoZSBvbmx5IG9wdGlvblxuICogdG9kYXk7IGFuIG9wdGlvbiBsZWZ0IG91dCBjaGFuZ2VzIG5vdGhpbmcuXG4gKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHNpemUgaXMgbm90IGEgZmluaXRlIG51bWJlclxuICovXG5leHBvcnQgY29uc3Qgc2V0dXBFeGVjdXRlciA9IChvcHRpb25zKSA9PiB7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XG59O1xuXG5sZXQgaW5pdGlhbENhbGwgPSB0cnVlO1xuXG4vKipcbiAqIENvbXBpbGVzIGEgc3RhdGVtZW50IGludG8gYSBmdW5jdGlvbiB0aGF0IHJ1bnMgaXQgaW5zaWRlIGEgYHdpdGhgIGJsb2NrIG92ZXIgdGhlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRjb25zdCBjb2RlID0gYFxuXHRyZXR1cm4gKGFzeW5jIGZ1bmN0aW9uICgpe1xuXHRcdHdpdGgoYXJndW1lbnRzWzBdIHx8IHt9KXtcblx0XHRcdHRyeXtcblx0XHRcdFx0cmV0dXJuICR7YVN0YXRlbWVudH1cblx0XHRcdH1jYXRjaChlKXtcblx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pKGFyZ3VtZW50c1swXSB8fCB7fSk7XG5gO1xuXHQvL2NvbnNvbGUubG9nKFwiY29kZVwiLCBjb2RlKTtcblxuXHRyZXR1cm4gbmV3IEZ1bmN0aW9uKGNvZGUpO1xufTtcblxuLyoqXG4gKiBUaGUgY29tcGlsZWQgZnVuY3Rpb24gZm9yIGEgc3RhdGVtZW50LCBmcm9tIHRoZSBjYWNoZSBvciBjb21waWxlZCBub3cgYW5kIGNhY2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZXRPckNyZWF0ZUZ1bmN0aW9uID0gKGFTdGF0ZW1lbnQpID0+IHtcblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGFTdGF0ZW1lbnQpKSB7XG5cdFx0cmV0dXJuIEVYUFJFU1NJT05fQ0FDSEUuZ2V0KGFTdGF0ZW1lbnQpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoYVN0YXRlbWVudCwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBUaGUgZXhlY3V0ZXI6IHJ1bnMgYSBzdGF0ZW1lbnQgaW5zaWRlIGEgYHdpdGhgIGJsb2NrIG92ZXIgdGhlIGNvbnRleHQsIHNvIGEgc3RhdGVtZW50IGFkZHJlc3NlcyBhXG4gKiBjb250ZXh0IHZhbHVlIGJ5IGl0cyBiYXJlIG5hbWUgLSBzZWUgYFJFQURNRS5tZGAuIFJlZ2lzdGVyZWQgdW5kZXJcbiAqIGBFWEVDVVRFUk5BTUVgIG9uIGltcG9ydC5cbiAqXG4gKiBAZGVwcmVjYXRlZCBiZWNhdXNlIGB3aXRoYCBpczsgYW5ub3VuY2VzIGl0IG9uIHRoZSBmaXJzdCBzdGF0ZW1lbnQgaXQgcnVuc1xuICogQHR5cGUge0V4ZWN1dGVyfVxuICovXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7XG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0aWYgKGluaXRpYWxDYWxsKSB7XG5cdFx0XHRpbml0aWFsQ2FsbCA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRuZXcgRXJyb3IoYFdpdGggU2NvcGVkIGV4cHJlc3Npb24gZXhlY3V0aW9uIGlzIG1hcmtlZCBhcyBkZXByZWNhdGVkLmApLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50KTtcblx0XHRyZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dCk7XG5cdH0sXG59KTtcbnJlZ2lzdGVyKEVYRUNVVEVSTkFNRSwgRVhFQ1VURVIpO1xuXG5leHBvcnQgZGVmYXVsdCBFWEVDVVRFUjtcbiIsImltcG9ydCBcIi4vV2l0aFNjb3BlZEV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgXCIuL0NvbnRleHRPYmplY3RFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFwiLi9Db250ZXh0RGVjb25zdHJ1Y3RvckV4ZWN1dGVyLmpzXCI7XG4iLCIvKipcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoaXMgcGFja2FnZS5cbiAqXG4gKiBHZW5lcmF0ZWQgZnJvbSBwYWNrYWdlLmpzb24gYnkgc2NyaXB0cy9nZW5lcmF0ZS12ZXJzaW9uLmpzIGJlZm9yZSBldmVyeSBidWlsZC4gRG8gbm90IGVkaXQgLVxuICogdGhlIG5leHQgYnVpbGQgb3ZlcndyaXRlcyBpdC5cbiAqXG4gKiBAbW9kdWxlIHZlcnNpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSBcIjMuMC4wXCI7XG5cbmV4cG9ydCBkZWZhdWx0IFZFUlNJT047XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGlmKEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbikpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0d2hpbGUoaSA8IGRlZmluaXRpb24ubGVuZ3RoKSB7XG5cdFx0XHR2YXIga2V5ID0gZGVmaW5pdGlvbltpKytdO1xuXHRcdFx0dmFyIGJpbmRpbmcgPSBkZWZpbml0aW9uW2krK107XG5cdFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdFx0aWYoYmluZGluZyA9PT0gMCkge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IGRlZmluaXRpb25baSsrXSB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogYmluZGluZyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmKGJpbmRpbmcgPT09IDApIHsgaSsrOyB9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0Lmhhc093bihvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tIFwiLi9zcmMvdmVyc2lvbi5qc1wiO1xuXG5HTE9CQUwuZGVmYXVsdGpzID0gR0xPQkFMLmRlZmF1bHRqcyB8fCB7fTtcbkdMT0JBTC5kZWZhdWx0anMuZWwgPSBHTE9CQUwuZGVmYXVsdGpzLmVsIHx8IHtcblx0VkVSU0lPTixcblx0RXhwcmVzc2lvblJlc29sdmVyLFxuXHRFeGVjdXRlclJlZ2lzdHJ5XG59O1xuXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==