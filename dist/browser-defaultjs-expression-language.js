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
 * to 0 or less, caching is disabled. Left out, the size stays as it is - SPECIFICATION.md 9.3.
 */

/** The size every cache starts with - SPECIFICATION.md 9.3. */
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
 * default is undefined" - SPECIFICATION.md 4.4.
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
 * The interface every executer implements - SPECIFICATION.md 9.1. An executer runs statements and
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
 * Keeps an executer under a name, so a resolver can be given the name instead of the instance -
 * SPECIFICATION.md 9.1. An executer already kept under the name is replaced.
 *
 * @param {string} aName
 * @param {Executer} anExecuter
 */
const register = (aName, anExecuter) => {
	EXECUTERS.set(aName, anExecuter);
};

/**
 * The executer kept under a name - SPECIFICATION.md 9.1. Also the default export of this module.
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
 * is not - SPECIFICATION.md 5.1.
 *
 * @returns {string}
 */
const generateName = () => `ER${++NAME_COUNTER}`;

/**
 * The name a resolver keeps: the one passed, trimmed and held to the rule of 3.3, or a generated one
 * where none was passed - SPECIFICATION.md 5.1.
 *
 * @param {?string} aName
 * @returns {string}
 * @throws {TypeError} where the name is no string, empty, or carries a character 3.3 does not allow
 */
const toName = (aName) => {
	if (aName == null) return generateName();
	if (typeof aName !== "string") throw new TypeError(`The option name takes a string, not a ${typeof aName}!`);

	const name = (0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.trimToNull)(aName);
	if (name == null) throw new TypeError("The option name takes a name, not an empty string!");
	for (let index = 0; index < name.length; index++)
		if (!(0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.isNameCharacter)(name.charCodeAt(index))) throw new TypeError(`The name "${name}" carries a character a scope name cannot carry (SPECIFICATION.md 3.3)!`);

	return name;
};

/**
 * The scope name a filter of the data methods selects, read like a scope prefix: trimmed, and null
 * where there is none - SPECIFICATION.md 6.6.
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
 * names the same property as its string and is looked up as one - SPECIFICATION.md 6.6.
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

const execute = async function (anExecuter, aStatement, aContext) {
	// 3.4: an empty statement answers undefined, the same as `return;` in JavaScript. The scanner
	// hands every statement over trimmed, and an empty one as null.
	if (aStatement == null) return undefined;
	if (typeof aStatement !== "string") return aStatement;

	// an error is deliberately not caught here: section 7 gives the two entry points different
	// answers to it, so each of them handles it for itself
	return await anExecuter.execute(aStatement, aContext);
};

const warnFailedStatement = (aStatement, anError) => {
	console.warn(`Execution error on statement!
		statement:
		${aStatement}
		error:
		${anError}
		`);
};

const withDefault = (aResult, aDefault) => {
	if (aResult !== null && typeof aResult !== "undefined") return aResult;
	else if (aDefault instanceof _DefaultValue_js__WEBPACK_IMPORTED_MODULE_1__["default"] && aDefault.hasValue) return aDefault.value;
	return aResult;
};

const resolveInScope = async function (anExecuter = DEFAULT_EXECUTER, aResolver, aStatement, aScope, aDefault) {
	// 5.3: climbs in a loop rather than by recursion - one call per resolver climbed cost a promise
	// each and overflowed the stack on a deep chain. A scope no resolver of the chain carries
	// answers undefined, and the default applies to it like to any other result - see
	// SPECIFICATION.md 5.4
	if (aScope)
		while (aResolver.name != aScope) {
			aResolver = aResolver.parent;
			if (!aResolver) return withDefault(undefined, aDefault);
		}

	return withDefault(await execute(anExecuter, aStatement, aResolver.context), aDefault);
};

// 4.1: the first argument of a static entry point is a string, or a configuration object
const isConfiguration = (aValue) => aValue !== null && typeof aValue === "object";

// 4.1: a configuration counts as passing a default where it carries the key, whatever it holds
const defaultOf = (aConfiguration) => ("defaultValue" in aConfiguration ? aConfiguration.defaultValue : DEFAULT_NOT_DEFINED);

/**
 * Resolves `${...}` expressions against a context. A resolver may have a parent, and the resolvers
 * from it up to the root form a chain: a name is looked up from this resolver towards the root, and
 * a scope prefix `${name::statement}` addresses one resolver of the chain - SPECIFICATION.md 2, 5.
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
	 * and so the executer of the static entry points - SPECIFICATION.md 9.1.
	 *
	 * @param {string|Executer} anExecuter a registered name or an `Executer` instance
	 * @throws {Error} where a name is not registered
	 */
	static set defaultExecuter(anExecuter) {
		if ( anExecuter instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"]) DEFAULT_EXECUTER = anExecuter;
		else DEFAULT_EXECUTER = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__.getExecuter)(anExecuter);
		console.info(`Changed default executer for ExpressionResolver!`);
	}

	/**
	 * The executer a resolver without a parent takes where the `executer` option is left out;
	 * `context-deconstruction-executer` until it is set - SPECIFICATION.md 9.2.
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
	 * undefined - the resolver has no context of its own - 4.2, 6.3
	 * @param {ExpressionResolver} [options.parent=null]
	 * @param {?string} [options.name=null] kept trimmed; where none is passed, one is generated - 5.1
	 * @param {(string|Executer)} [options.executer] the registered name of an executer, or an
	 * `Executer` instance. A name that is not registered throws; an instance needs no registration,
	 * because it addresses the executer directly. Anything else counts as left out. Without the
	 * option the resolver takes the executer of its parent, and one without a parent
	 * `ExpressionResolver.defaultExecuter` - 4.2.
	 * @throws {TypeError} where the parent is no resolver, the context a primitive, or the name breaks
	 * the rule of 5.1 - 4.2
	 * @throws {Error} where the executer is named and the name is not registered
	 */
	constructor({ context, parent = null, name = null, executer } = {}) {
		if (parent != null && !(parent instanceof ExpressionResolver)) throw new TypeError("The option parent takes an ExpressionResolver!");
		if (context != null && typeof context !== "object" && typeof context !== "function") throw new TypeError(`The option context takes an object, not a ${typeof context}!`);
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
	 * The name this resolver is addressed by in a scope prefix and a filter - 5.1.
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
	 * constructor and it answers for the whole chain - 6.1. Over the global object it is the global
	 * object itself - 6.4.
	 *
	 * @readonly
	 * @type {object}
	 */
	get context() {
		return this.#context;
	}

	/**
	 * The executer in use, chosen once in the constructor - 4.2.
	 *
	 * @readonly
	 * @type {Executer}
	 */
	get executer() {
		return this.#executer;
	}

	/**
	 * The internal handle behind the context. Public only for `resetCache` (6.2), and only until the
	 * name cache is measured - DECISIONS.md, 2026-09-30.
	 *
	 * @readonly
	 * @type {ResolverContextHandle}
	 */
	get contextHandle() {
		return this.#contextHandle;
	}

	/**
	 * The names of every resolver from the root down to this one, as a path - `/root/…/this`. It
	 * describes the structure and does not change - SPECIFICATION.md 5.5.
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
	 * this describes a state and not the structure - SPECIFICATION.md 5.5. Where none provides one,
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
	 * first and the root's last. A state like `effectiveChain` - SPECIFICATION.md 5.5.
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
	 * A filter selects exactly one resolver by the rule of 5.3, and a filter matching none throws -
	 * a wrong name in an API call is a mistake in the calling code, unlike a scope prefix inside an
	 * expression, which answers undefined (5.4). See SPECIFICATION.md 6.6.
	 *
	 * @param {?string} aScope the filter as `toScope` reads it
	 * @returns {ExpressionResolver}
	 */
	#findResolver(aScope) {
		if (!aScope) return this;

		let resolver = this;
		while (resolver) {
			if (resolver.name === aScope) return resolver;
			resolver = resolver.parent;
		}

		throw new Error(`Filter "${aScope}" matches no resolver of the chain!`);
	}

	/**
	 * The nearest resolver from here to the root that carries the key itself, or null where none
	 * carries it. What decides is whether a resolver provides the name, not what it holds -
	 * SPECIFICATION.md 5.2.
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
	 * Reads a value along the chain from the addressed resolver by the rule of 5.2. Without a key -
	 * null or undefined - it answers the whole context of that resolver, which still sees the chain on
	 * every access - SPECIFICATION.md 6.1, 6.6.
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
	 * it. With a filter the addressed resolver is the target outright - SPECIFICATION.md 6.6.
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
	 * the next resolver that carries the same key - SPECIFICATION.md 6.6.
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
	 * above from here on - SPECIFICATION.md 6.6.
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
	 * delimited form `${...}`, a scope prefix included, or a bare statement - SPECIFICATION.md 4.2,
	 * 4.3. An error of the statement is logged and handed on, and the default never covers it - 7.
	 *
	 * @async
	 * @param {string} aExpression
	 * @param {*} [aDefault] replaces a result of null or undefined where it is passed, undefined
	 * included - 4.4
	 * @returns {Promise<*>}
	 * @throws {TypeError} where the expression is no string
	 * @throws {SyntaxError} where the input opens with "${" and does not end with "}"
	 */
	async resolve(aExpression, aDefault) {
		// 4.2: a mistake in the calling code, not a failed statement - so no warning and no default
		if (typeof aExpression !== "string") throw new TypeError(`resolve takes an expression as a string, not a ${typeof aExpression}!`);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		try {
			// 4.3: the delimited form or a bare statement, told apart by the scanner
			const { scope, statement } = (0,_ExpressionScanner_js__WEBPACK_IMPORTED_MODULE_6__.parseExpression)(aExpression);
			return await resolveInScope(this.#executer, this, statement, scope, defaultValue);
		} catch (e) {
			// 7: the error is logged and handed on. resolve answers a value or says why it cannot,
			// and a default value covers a missing result, never an error.
			warnFailedStatement(aExpression, e);
			throw e;
		}
	}

	/**
	 * Replaces every expression of a text by its value and answers the text - SPECIFICATION.md 4.2,
	 * 4.3. An expression whose statement fails stands as written, a warning names it, and the rest of
	 * the text keeps rendering - 7.
	 *
	 * @async
	 * @param {string} aText
	 * @param {*} [aDefault] replaces a result of null or undefined, per expression, where it is
	 * passed - 4.4
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
			// 3.2: an escaping backslash is consumed, everything else in front of the expression
			// stands as written
			text += aText.substring(position, occurrence.escaped ? occurrence.start - 1 : occurrence.start);
			position = occurrence.end;

			if (occurrence.escaped) {
				text += aText.substring(occurrence.start, occurrence.end);
			} else {
				try {
					text += await resolveInScope(this.#executer, this, occurrence.statement, occurrence.scope, defaultValue);
				} catch (e) {
					// 7: an expression whose statement failed stands as written, and the default value
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
	 * `resolve` does - SPECIFICATION.md 4.1, 4.2.
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ expression, context, defaultValue, timeout }`, behind which every argument is ignored -
	 * SPECIFICATION.md 4.1. A first argument that is neither a string nor an object, and a
	 * configuration without a string under `expression`, reject with a `TypeError`.
	 *
	 * @static
	 * @async
	 * @param {string|{ expression: string, context?: object, defaultValue?: *, timeout?: number }} aExpression
	 * @param {?object} [aContext]
	 * @param {*} [aDefault] replaces a result of null or undefined where it is passed - 4.4
	 * @param {?number} [aTimeout] delays the start by that many milliseconds; no deadline - 4.5
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
	 * the instance `resolveText` does - SPECIFICATION.md 4.1, 4.2.
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ text, context, defaultValue, timeout }`, behind which every argument is ignored -
	 * SPECIFICATION.md 4.1. A first argument that is neither a string nor an object, and a
	 * configuration without a string under `text`, reject with a `TypeError`.
	 *
	 * @static
	 * @async
	 * @param {string|{ text: string, context?: object, defaultValue?: *, timeout?: number }} aText
	 * @param {?object} [aContext]
	 * @param {*} [aDefault] replaces a result of null or undefined, per expression, where it is
	 * passed - 4.4
	 * @param {?number} [aTimeout] delays the start by that many milliseconds; no deadline - 4.5
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
	 * Builds a resolver over a filtered copy of the context - SPECIFICATION.md 6.7.
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
	 * The former name of `buildFiltered`, kept until 4.0. It promised a security the method does not
	 * give - SPECIFICATION.md 6.7.
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
 * Finds the expressions of a text and takes a single expression apart - SPECIFICATION.md 3.1 to
 * 3.3 and 4.3. It reads where an expression begins and ends, whether it is escaped, and which scope
 * prefix it carries; evaluating a statement and addressing a scope is ExpressionResolver's.
 *
 * Internal to the package: index.js does not export it.
 */



const EXPRESSION_START = "${";

// the scanner states - everything that is not code hides the braces inside it, see
// SPECIFICATION.md 3.1
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
 * Two splits take the text between the delimiters apart into the scope prefix of 3.3 and the
 * statement - this one for a text, `splitScopeAndStatementBySeparator` behind `parseExpression` for
 * the single expression of `resolve`. They are two implementations of the one rule, each measured
 * faster for other statements (DECISIONS.md, 2026-09-27): a text reads forwards, the single
 * expression from the first "::" backwards. test/expressionscanner/scope-prefix.Test.js asks every
 * case of both.
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

	if (index === 0 || aContent.charCodeAt(index) !== COLON || aContent.charCodeAt(index + 1) !== COLON)
		return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent) };

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
 * null where the text ends before that brace, which per SPECIFICATION.md 3.1 means there is no
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
		// 3.2: an odd run of backslashes escapes the delimiter itself. It opens nothing, so only
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
 * Takes the one expression `resolve` is handed apart - SPECIFICATION.md 4.3.
 *
 * Which form is in hand is decided by the first characters of the trimmed input. The whole input
 * is one expression, so its end is the end of the input. The escaping of 3.2 does not apply here -
 * it is a rule of the text form, and there is no surrounding text, so a backslash belongs to the
 * statement.
 *
 * @param {string} aExpression
 * @returns {{ scope: ?string, statement: ?string }}
 * @throws {SyntaxError} where the input opens with "${" and does not end with "}"
 */
const parseExpression = (aExpression) => {
	aExpression = aExpression.trim();

	if (aExpression.startsWith(EXPRESSION_START)) {
		if (!aExpression.endsWith("}")) throw new SyntaxError(`Expression does not end with "}": ${aExpression}`);

		return splitScopeAndStatementBySeparator(aExpression.substring(2, aExpression.length - 1));
	}

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
	if (end < 1) return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.trimToNull)(aContent) };

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
 * further from the root reports none of the global object's - SPECIFICATION.md 6.4.
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
			// ordinary scope chain anyway (SPECIFICATION.md 6.4).
			return [];
		},
	};
};

/**
 * What stands behind the context of one resolver: the object handed to it, the handle of its parent,
 * and the name cache that tells which names this resolver provides. It hands out the context an
 * expression sees, a proxy that answers for the whole chain - SPECIFICATION.md 5.2, 6.1 to 6.5.
 *
 * Internal to the package: index.js does not export it (DECISIONS.md, 2026-09-30).
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
	 * Object.prototype - SPECIFICATION.md 6.3. It gets an object on the first write.
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
					// evaluate what nobody asked for, and so a value stays live (6.2). Enumerability
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
						for (let key of handle.#cache.keys()) {
							result.add(key);
						}
						handle = handle.#parent;
					}
					return Array.from(result);
				},

				//@TODO need to support the other proxy actions
			});
		}
	}

	/**
	 * The context an expression sees: a proxy that answers for the whole chain, or over the global
	 * object the global object itself - SPECIFICATION.md 6.1, 6.4.
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
	 * inherited through the prototype chain included (5.2); a handle over the global object
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
	 * written since. What the data holds decides nothing - SPECIFICATION.md 5.5.
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
	 * where there is none - SPECIFICATION.md 6.6.
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
	 * provided until then - SPECIFICATION.md 6.2.
	 */
	resetCache() {
		this.#cache = this.#buildNameCache();
	}

	/**
	 * A new name cache for the object this handle holds: every key it carries, its prototype chain
	 * included, each mapped to this handle (5.2). Over the global object the stand-in of
	 * `createGlobalNameCache`, which provides every name.
	 *
	 * @returns {NameCache}
	 */
	#buildNameCache() {
		const data = this.#data;
		if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"] === data) 
			return createGlobalNameCache(this);

		// every key JavaScript says the object carries, nothing filtered - which of them an executer
		// can put into its code is the executer's business (DECISIONS.md 2026-08-30, 2026-09-22)
		const cache = new Map();
		let type = data;
		while (!(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(type)) {
			for (let name of Reflect.ownKeys(type)) cache.set(name, this);
			type = Reflect.getPrototypeOf(type);
		}

		return cache;
	}

	/**
	 * The nearest handle from this one to the root that provides the name, or null where none does -
	 * SPECIFICATION.md 5.2.
	 *
	 * @param {string|symbol} property
	 * @returns {ResolverContextHandle|null}
	 */
	#findHandle(property) {
		if (this.#cache.has(property)) return this.#cache.get(property);
		let parent = this.#parent;
		while (parent) {
			if (parent.#cache.has(property)) return parent.#cache.get(property);
			parent = parent.#parent;
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
 * The helpers more than one component uses - AGENTS.md, Conventions. Internal to the package:
 * index.js does not export them.
 */

/** Whitespace in the sense of `\s`. */
const WHITESPACE = /\s/;

/**
 * Whether a character may stand in a scope name - SPECIFICATION.md 3.3: an ASCII letter, a digit,
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
		hash = ((hash << 5) - hash) + char;
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
/** The name this executer is registered under, and the default executer - SPECIFICATION.md 9.2. */
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
 * Configures the code cache of this executer - SPECIFICATION.md 9.3. `size` is the only option
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
 * afterwards (SPECIFICATION.md 6.5 leaves that to the executer). That is a decision rather than a gap: the
 * write-back this executer carried between 2026-09-07 and 2026-09-20 cost a factor of eleven on a
 * cache miss, because it needs every context name declared in the body instead of listed in the
 * parameter list. Speed is what this executer is for, and a consumer who needs a write to persist
 * picks `context-object-executer`. See `DECISIONS.md`, 2026-09-20.
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
 * mention that name - see `DECISIONS.md`, 2026-09-22.
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
})(context || {});`;

	if (DEBUG) console.log("genererated code: \n", code);

	try {
		return new Function("context", code);
	} catch (e) {
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
 * statement addresses a context value by its bare name - SPECIFICATION.md 9.2, `README.md`.
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
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Executer.js */ "./src/Executer.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");




/** The name this executer is registered under - SPECIFICATION.md 9.2. */
const EXECUTERNAME = "context-object-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

/**
 * Configures the code cache of this executer - SPECIFICATION.md 9.3. `size` is the only option
 * today; an option left out changes nothing.
 *
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 * @throws {TypeError} where the size is not a finite number
 */
const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

/**
 * Compiles a statement into a function that hands the context over as `ctx`.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate = (aStatement) => {
	const code = `
return (async (ctx) => {
    try{
        return ${aStatement}
    }catch(e){
        throw e;
    }
})(context || {});`;

	//console.log("code", code);

	return new Function("context", code);
};

/**
 * The compiled function for a statement, from the cache or compiled now and cached.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const getOrCreateFunction = (aStatement) => {

	const cacheKey = aStatement;

	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 * The executer: hands the context over as one object named `ctx`, so a statement addresses a
 * context value as `ctx.value` - SPECIFICATION.md 9.2, `README.md`. Registered under
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




/** The name this executer is registered under - SPECIFICATION.md 9.2. */
const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

/**
 * Configures the code cache of this executer - SPECIFICATION.md 9.3. `size` is the only option
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
	return (async (context) => {
		with(context){
			try{
				return ${aStatement}
			}catch(e){
				throw e;
			}
		}
	})(context || {});
`;
	//console.log("code", code);

	return new Function("context", code);
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
 * context value by its bare name - SPECIFICATION.md 9.2, `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @deprecated because `with` is; announces it on the first statement it runs
 * @type {Executer}
 */
const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({execution: (aStatement, aContext) => {
		if(initialCall){
			initialCall = false;
			console.warn(new Error(`With Scoped expression execution is marked as deprecated.`));
		}

		const expression = getOrCreateFunction(aStatement);
		return expression(aContext);
	}});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7OztBQ0poRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBTSx5QkFBeUIsVUFBTTtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVELGlFQUFlLE1BQU0sRUFBQzs7Ozs7Ozs7Ozs7Ozs7O0FDbkJ0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYixZQUFZLFdBQVc7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxhQUFhO0FBQzFELDZDQUE2QyxLQUFLLGFBQWEsSUFBSSxNQUFNLE1BQU07QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiwwQkFBMEI7QUFDNUM7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLEtBQUssT0FBTztBQUNyRCx3QkFBd0I7QUFDeEIsd0JBQXdCO0FBQ3hCO0FBQ2U7QUFDZjtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUZBQXFGO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxHQUFHO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksR0FBRztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDNUJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLDJDQUEyQywwQ0FBMEM7V0FDckYsTUFBTTtXQUNOLDJDQUEyQyxnQ0FBZ0M7V0FDM0U7V0FDQSxLQUFLLHlCQUF5QjtXQUM5QjtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsMENBQTBDLHdDQUF3QztXQUNsRjtXQUNBO1dBQ0E7V0FDQSxFOzs7OztXQ3RCQSxpRTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTmtFO0FBQ0k7QUFDM0I7O0FBRTNDLHdGQUFNLGFBQWEsd0ZBQU07QUFDekIsd0ZBQU0sZ0JBQWdCLHdGQUFNO0FBQzVCLFFBQVE7QUFDUixtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCOztBQUVnRCIsInNvdXJjZXMiOlsid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFByb3BlcnR5LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0NvZGVDYWNoZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9EZWZhdWx0VmFsdWUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXJSZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhwcmVzc2lvblNjYW5uZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL1V0aWxzLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvQ29udGV4dE9iamVjdEV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL1dpdGhTY29wZWRFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy92ZXJzaW9uLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9icm93c2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHByZXNzaW9uUmVzb2x2ZXIgZnJvbSBcIi4vc3JjL0V4cHJlc3Npb25SZXNvbHZlci5qc1wiO1xuaW1wb3J0IFwiLi9zcmMvZXhlY3V0ZXIvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIEV4ZWN1dGVyUmVnaXN0cnkgZnJvbSBcIi4vc3JjL0V4ZWN1dGVyUmVnaXN0cnkuanNcIlxuXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcbiIsIi8qKlxuICogVGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC5cbiAqXG4gKiBSZXNvbHZlZCBvbmNlIHdoZW4gdGhlIG1vZHVsZSBpcyBsb2FkZWQ6IGdsb2JhbFRoaXMsIHRoZW4gZ2xvYmFsLCB3aW5kb3cgYW5kIHNlbGYgZm9yIGVuZ2luZXMgbm90XG4gKiBrbm93aW5nIGl0IHlldC4gQW4gZW1wdHkgb2JqZWN0IHdoZW4gbm9uZSBvZiB0aGVtIGV4aXN0cywgc28gcmVhZGluZyBmcm9tIGl0IG5ldmVyIHRocm93cy5cbiAqXG4gKiBAbW9kdWxlIEdsb2JhbFxuICpcbiAqIEBleGFtcGxlXG4gKiBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWZmZXIpO1xuICovXG5jb25zdCBHTE9CQUwgPSAoKCkgPT4ge1xuXHRpZih0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdGlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBnbG9iYWw7XG5cdGlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiB3aW5kb3c7XG5cdGlmKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gc2VsZjtcblx0cmV0dXJuIHt9O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgR0xPQkFMO1xuIiwiLyoqXHJcbiAqIE9ubHkgYW4gb2JqZWN0IGNhbiBjYXJyeSBhIHByb3BlcnR5LCBzbyBhIHBhdGggc3RvcHMgYXQgYSBwcmltaXRpdmUgaW5zdGVhZCBvZiBoYW5kaW5nIG91dCBhXHJcbiAqIHByb3BlcnR5IHRoYXQgY2Fubm90IGJlIHJlYWQgb3Igd3JpdHRlbi4gQW4gQXJyYXksIE1hcCBvciBEYXRlIHBhc3NlcyAtIHRoZXkgYXJlIG9iamVjdHMgYW5kIHRha2VcclxuICogYSBwcm9wZXJ0eSBsaWtlIGFueSBvdGhlciBvbmUsIHdoaWNoIGlzIHdoYXQgbWFrZXMgYSBwYXRoIGxpa2UgXCJsaXN0LjBcIiB3b3JrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHRoZSB2YWx1ZSBhIHN0ZXAgb2YgdGhlIHBhdGggcmVzb2x2ZWQgdG9cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhhdCBzdGVwXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgdGhlIHdob2xlIHBhdGgsIHRvIHRlbGwgd2hpY2ggb25lIG9mIHNldmVyYWwgc3RlcHMgZmFpbGVkXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gdGhlIHN0ZXAgY2FycmllcyBubyBvYmplY3RcclxuICovXHJcbmNvbnN0IGFzc2VydERlc2NlbmRhYmxlID0gKHZhbHVlLCBuYW1lLCBrZXkpID0+IHtcclxuXHRpZih2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpXHJcblx0XHRyZXR1cm47XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB2YWx1ZSA9PT0gbnVsbCA/IFwibnVsbFwiIDogYGEgJHt0eXBlb2YgdmFsdWV9YDtcclxuXHR0aHJvdyBuZXcgVHlwZUVycm9yKGBjYW5ub3QgZGVzY2VuZCBpbnRvIFwiJHtuYW1lfVwiIG9mIHBhdGggXCIke2tleX1cIiAtICR7dHlwZX0gaXMgbm8gb2JqZWN0YCk7XHJcbn07XHJcblxyXG4vKipcclxuICogT25lIHByb3BlcnR5IG9mIGFuIG9iamVjdCwgYWRkcmVzc2VkIGJ5IG5hbWUsIHRvZ2V0aGVyIHdpdGggdGhlIG9iamVjdCBjYXJyeWluZyBpdC5cclxuICpcclxuICogQnVpbHQgdGhyb3VnaCB7QGxpbmsgT2JqZWN0UHJvcGVydHkubG9hZH0sIHdoaWNoIHdhbGtzIGEgZG90dGVkIHBhdGggYW5kIGhhbmRzIGJhY2sgdGhlIHByb3BlcnR5IGF0XHJcbiAqIGl0cyBlbmQuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IHByb3BlcnR5ID0gT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IHtiIDogMX19LCBcImEuYlwiKTtcclxuICogcHJvcGVydHkudmFsdWU7ICAgICAgLy8gMVxyXG4gKiBwcm9wZXJ0eS52YWx1ZSA9IDI7ICAvLyB3cml0ZXMgaW50byB0aGUgb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYmplY3RQcm9wZXJ0eSB7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgY2FycnlpbmcgaXRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihrZXksIGNvbnRleHQpe1xyXG5cdFx0dGhpcy5rZXkgPSBrZXk7XHJcblx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hldGhlciB0aGUga2V5IGlzIHJlYWNoYWJsZSBvbiB0aGUgY29udGV4dCBhdCBhbGwuXHJcblx0ICpcclxuXHQgKiBUaGlzIGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBwcm90b3R5cGUgY2hhaW4sIG5vdCBvbmx5IGZvciBvd24gcHJvcGVydGllcyAtIGxvYWQoe30sIFwidG9TdHJpbmdcIilcclxuXHQgKiByZXBvcnRzIHRydWUuIFRoYXQgaXMgZGVsaWJlcmF0ZTogYSBwYXRoIG1heSBhZGRyZXNzIGEgcHJvdG90eXBlIGFuZCBleHRlbmQgaXQsIHNvIGFuIGluaGVyaXRlZFxyXG5cdCAqIGtleSBpcyBhIGtleSBsaWtlIGFueSBvdGhlciBoZXJlLiBVc2UgaGFzVmFsdWUgdG8gYXNrIHdoZXRoZXIgc29tZXRoaW5nIGlzIGFjdHVhbGx5IHN0b3JlZC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGdldCBrZXlEZWZpbmVkKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5rZXkgaW4gdGhpcy5jb250ZXh0O1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBXaGV0aGVyIHNvbWV0aGluZyBpcyBzdG9yZWQgdW5kZXIgdGhlIGtleS4gT25seSB1bmRlZmluZWQgY291bnRzIGFzIG5vdGhpbmcgLSAwLCBcIlwiLCBmYWxzZSBhbmRcclxuXHQgKiBudWxsIGFyZSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRnZXQgaGFzVmFsdWUoKXtcclxuXHRcdHJldHVybiB0eXBlb2YgdGhpcy5jb250ZXh0W3RoaXMua2V5XSAhPT0gXCJ1bmRlZmluZWRcIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm5zIHsqfSB0aGUgc3RvcmVkIHZhbHVlLCB1bmRlZmluZWQgd2hlbiB0aGVyZSBpcyBub25lXHJcblx0ICovXHJcblx0Z2V0IHZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jb250ZXh0W3RoaXMua2V5XTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7Kn0gZGF0YVxyXG5cdCAqL1xyXG5cdHNldCB2YWx1ZShkYXRhKXtcclxuXHRcdHRoaXMuY29udGV4dFt0aGlzLmtleV0gPSBkYXRhO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkcyBhIHZhbHVlIG5leHQgdG8gd2hhdCBpcyBhbHJlYWR5IHRoZXJlOiB3cml0ZXMgaXQgd2hlbiB0aGUga2V5IGhvbGRzIG5vdGhpbmcsIHR1cm5zIHRoZVxyXG5cdCAqIHZhbHVlIGludG8gYW4gYXJyYXkgb2YgYm90aCB3aGVuIGl0IGhvbGRzIG9uZSwgYW5kIHB1c2hlcyBvbnRvIHRoZSBhcnJheSB3aGVuIGl0IGhvbGRzIG9uZVxyXG5cdCAqIGFscmVhZHkuXHJcblx0ICpcclxuXHQgKiBUaGUgdmFsdWUgaXRzZWxmIGlzIG5vdCBsb29rZWQgYXQgLSBhcHBlbmRpbmcgdW5kZWZpbmVkIHB1dHMgdW5kZWZpbmVkIGludG8gdGhlIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHsqfSBkYXRhXHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDE7ICAgLy8ge2tleSA6IDF9XHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMjsgICAvLyB7a2V5IDogWzEsIDJdfVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDM7ICAgLy8ge2tleSA6IFsxLCAyLCAzXX1cclxuXHQgKi9cclxuXHRzZXQgYXBwZW5kKGRhdGEpIHtcclxuXHRcdGlmKCF0aGlzLmhhc1ZhbHVlKVxyXG5cdFx0XHR0aGlzLnZhbHVlID0gZGF0YTtcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRcdGlmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpXHJcblx0XHRcdFx0dmFsdWUucHVzaChkYXRhKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMudmFsdWUgPSBbdGhpcy52YWx1ZSwgZGF0YV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBrZXkgZnJvbSB0aGUgb2JqZWN0LiBEb2VzIG5vdGhpbmcgd2hlbiBpdCBpcyBub3QgdGhlcmUuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dm9pZH1cclxuXHQgKi9cclxuXHRyZW1vdmUoKXtcclxuXHRcdGRlbGV0ZSB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBMb2FkcyB0aGUgcHJvcGVydHkgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMuIEV2ZXJ5IHBhcnQgb2YgdGhlIHBhdGggaXMgdHJpbW1lZCwgc28gXCIgYSAuIGIgXCJcclxuXHQgKiBhZGRyZXNzZXMgdGhlIHNhbWUgcHJvcGVydHkgYXMgXCJhLmJcIi5cclxuXHQgKlxyXG5cdCAqIEEgbWlzc2luZyBzdGVwIGlzIGNyZWF0ZWQgd2l0aCBjcmVhdGUsIG90aGVyd2lzZSB0aGUgcGF0aCBpcyByZXBvcnRlZCBhcyBub3QgbG9hZGFibGUuIEEgc3RlcFxyXG5cdCAqIGhvbGRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0IGNhbm5vdCBiZSB3YWxrZWQgaW50byBhdCBhbGwgLSB0aGF0IGlzIGEgYnJva2VuIHBhdGgsIG5vdCBhXHJcblx0ICogbWlzc2luZyBvbmUsIGFuZCBpdCBpcyByZXBvcnRlZCBhcyBhbiBlcnJvciByZWdhcmRsZXNzIG9mIGNyZWF0ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRoZSBvYmplY3QgdG8gd2Fsa1xyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbmFtZSBvZiB0aGUgcHJvcGVydHksIGEgZG90dGVkIHBhdGggYWRkcmVzc2VzIGEgbmVzdGVkIG9uZVxyXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NyZWF0ZT10cnVlXSBjcmVhdGUgYSBtaXNzaW5nIHN0ZXAgb24gdGhlIHdheVxyXG5cdCAqIEByZXR1cm5zIHtPYmplY3RQcm9wZXJ0eXxudWxsfSBudWxsIHdoZW4gYSBzdGVwIGlzIG1pc3NpbmcgYW5kIGNyZWF0ZSBpcyBmYWxzZVxyXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiBhIHN0ZXAgb2YgdGhlIHBhdGggaG9sZHMgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0XHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiB7YiA6IDF9fSwgXCJhLmJcIikudmFsdWU7ICAgLy8gMVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2xpc3QgOiBbMSwgMl19LCBcImxpc3QuMVwiKS52YWx1ZTsgICAvLyAyLCBhbiBhcnJheSBpcyBhbiBvYmplY3RcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHt9LCBcImEuYlwiLCBmYWxzZSk7ICAgICAgICAgICAgIC8vIG51bGxcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDogMH0sIFwiYS5iXCIpOyAgICAgICAgICAgICAgIC8vIHRocm93cywgMCBpcyBubyBvYmplY3RcclxuXHQgKi9cclxuXHRzdGF0aWMgbG9hZChkYXRhLCBrZXksIGNyZWF0ZT10cnVlKSB7XHJcblx0XHRsZXQgY29udGV4dCA9IGRhdGE7XHJcblx0XHRjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKTtcclxuXHRcdGxldCBuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdHdoaWxlKGtleXMubGVuZ3RoID4gMCl7XHJcblx0XHRcdGlmKHR5cGVvZiBjb250ZXh0W25hbWVdID09PSBcInVuZGVmaW5lZFwiIHx8IGNvbnRleHRbbmFtZV0gPT09IG51bGwpe1xyXG5cdFx0XHRcdGlmKCFjcmVhdGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdFx0Y29udGV4dFtuYW1lXSA9IHt9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGFzc2VydERlc2NlbmRhYmxlKGNvbnRleHRbbmFtZV0sIG5hbWUsIGtleSk7XHJcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0W25hbWVdO1xyXG5cdFx0XHRuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3IE9iamVjdFByb3BlcnR5KG5hbWUsIGNvbnRleHQpO1xyXG5cdH1cclxufTsiLCIvKipcclxuICogVXRpbGl0aWVzIHRvIGluc3BlY3QsIGNvbXBhcmUsIG1lcmdlIGFuZCBmaWx0ZXIgamF2YXNjcmlwdCBvYmplY3RzLlxyXG4gKlxyXG4gKiBTZXZlcmFsIGZ1bmN0aW9ucyBzaGFyZSBvbmUgbm90aW9uIG9mIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZSBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXBcclxuICogYW5kIFNldC4ge0BsaW5rIGlzUG9qb30gZGVjaWRlcyB3aGV0aGVyIGEgdmFsdWUgc3RheXMgd2l0aGluIGl0LCB7QGxpbmsgZXF1YWxQb2pvfSBjb21wYXJlcyB0aG9zZVxyXG4gKiB0eXBlcyBieSB2YWx1ZSwgYW5kIHtAbGluayBtZXJnZX0gdHJlYXRzIGV2ZXJ5dGhpbmcgb3V0c2lkZSBvZiBpdCBhcyBhIHZhbHVlIHRvIGJlIHJlcGxhY2VkLlxyXG4gKlxyXG4gKiBAbW9kdWxlIE9iamVjdFV0aWxzXHJcbiAqL1xyXG5pbXBvcnQgT2JqZWN0UHJvcGVydHkgZnJvbSBcIi4vT2JqZWN0UHJvcGVydHkuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxBcnJheSA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCBsZW5ndGggPSBhLmxlbmd0aDtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoIWludGVybmFsRXF1YWxQb2pvKGFbaV0sIGJbaV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgc2V0IGlzIHVub3JkZXJlZCwgc28gZXZlcnkgZW50cnkgb2YgYSBoYXMgdG8gZmluZCBpdHMgb3duIHBhcnRuZXIgaW4gYi5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtTZXR9IGFcclxuICogQHBhcmFtIHtTZXR9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxTZXQgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChhLnNpemUgIT09IGIuc2l6ZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCByZW1haW5pbmcgPSBBcnJheS5mcm9tKGIpO1xyXG5cdGZvciAoY29uc3QgZW50cnlBIG9mIGEpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gcmVtYWluaW5nLmZpbmRJbmRleCgoZW50cnlCKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhlbnRyeUEsIGVudHJ5Qiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBtYXAgaXMgdW5vcmRlcmVkIGFzIHdlbGwgYW5kIGl0cyBrZXlzIG1heSBiZSBvYmplY3RzLCBzbyB0aGUga2V5cyBnZXQgY29tcGFyZWQgYnkgdmFsdWUgdG9vLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge01hcH0gYVxyXG4gKiBAcGFyYW0ge01hcH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE1hcCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHJlbWFpbmluZyA9IEFycmF5LmZyb20oYik7XHJcblx0Zm9yIChjb25zdCBba2V5QSwgdmFsdWVBXSBvZiBhKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IHJlbWFpbmluZy5maW5kSW5kZXgoKFtrZXlCLCB2YWx1ZUJdKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhrZXlBLCBrZXlCLCBzZWVuKSAmJiBpbnRlcm5hbEVxdWFsUG9qbyh2YWx1ZUEsIHZhbHVlQiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIG9iamVjdHMgYnkgcHJvdG90eXBlIGFuZCBieSB0aGVpciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE9iamVjdCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihhKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHByb3BlcnRpZXNBID0gT2JqZWN0LmtleXMoYSk7XHJcblx0Y29uc3QgcHJvcGVydGllc0IgPSBPYmplY3Qua2V5cyhiKTtcclxuXHRpZiAocHJvcGVydGllc0EubGVuZ3RoICE9PSBwcm9wZXJ0aWVzQi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Zm9yIChjb25zdCBrZXkgb2YgcHJvcGVydGllc0EpIHtcclxuXHRcdC8vIGVxdWFsIGtleSBjb3VudHMgYWxvbmUgd291bGQgbGV0IHt4OjEsIHk6dW5kZWZpbmVkfSBwYXNzIGFnYWluc3Qge3g6MSwgejp1bmRlZmluZWR9XHJcblx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpKSByZXR1cm4gZmFsc2U7XHJcblx0XHRpZiAoIWludGVybmFsRXF1YWxQb2pvKGFba2V5XSwgYltrZXldLCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBjeWNsaWMgc3RydWN0dXJlIGNhbiBvbmx5IGJlIGRlY2lkZWQgY28taW5kdWN0aXZlbHk6IGEgcGFpciBhbHJlYWR5IHVuZGVyIGNvbXBhcmlzb24gY291bnRzIGFzXHJcbiAqIGVxdWFsLCBvdGhlcndpc2UgdGhlIHdhbGsgd291bGQgbmV2ZXIgY29tZSBiYWNrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgd2hlbiB0aGlzIHBhaXIgaXMgYWxyZWFkeSBiZWluZyBjb21wYXJlZCBmdXJ0aGVyIHVwIHRoZSBzdGFja1xyXG4gKi9cclxuY29uc3QgaXNDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0cmV0dXJuICEhcGFydG5lcnMgJiYgcGFydG5lcnMuaGFzKGIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5vdGVzIGEgcGFpciBhcyBiZWluZyBjb21wYXJlZCwgc28gYSBjeWNsZSBydW5uaW5nIHRocm91Z2ggaXQgdGVybWluYXRlcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuY29uc3QgcmVtZW1iZXJDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0aWYgKHBhcnRuZXJzKSBwYXJ0bmVycy5hZGQoYik7XHJcblx0ZWxzZSBzZWVuLnNldChhLCBuZXcgV2Vha1NldChbYl0pKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLlxyXG4gKlxyXG4gKiBWYWx1ZUhlbHBlci5ub1ZhbHVlIGFuc3dlcnMgdGhlIHNhbWUgcXVlc3Rpb24uIEJvdGggYXJlIGtlcHQgb24gcHVycG9zZSwgc28gVmFsdWVIZWxwZXIgc3RheXMgZnJlZVxyXG4gKiBvZiBhIGRlcGVuZGVuY3kgb24gdGhpcyBtb2R1bGUgLSBzZWUgdGhlIG5vdGUgdGhlcmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzTnVsbE9yVW5kZWZpbmVkID0gKG9iamVjdCkgPT4ge1xyXG5cdHJldHVybiBvYmplY3QgPT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ID09PSBcInVuZGVmaW5lZFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUuXHJcbiAqXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBjb3VudCBhcyBwcmltaXRpdmVzLiBBIHN5bWJvbCBkb2VzIG5vdCAtIGl0IGlzIHRyZWF0ZWQgYXMgYW4gb3BhcXVlIHZhbHVlXHJcbiAqIHRocm91Z2hvdXQgdGhpcyBtb2R1bGUsIHNvIHRoYXQge0BsaW5rIGlzUG9qb30ga2VlcHMgcmVqZWN0aW5nIGl0IGFzIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB0eXBlb2Ygb2JqZWN0O1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0Y2FzZSBcIm51bWJlclwiOlxyXG5cdFx0Y2FzZSBcImJpZ2ludFwiOlxyXG5cdFx0Y2FzZSBcImJvb2xlYW5cIjpcclxuXHRcdGNhc2UgXCJzdHJpbmdcIjpcclxuXHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhbiBvYmplY3QuXHJcbiAqXHJcbiAqIEV2ZXJ5IG9iamVjdCBjb3VudHMsIEFycmF5LCBNYXAsIERhdGUgYW5kIGNsYXNzIGluc3RhbmNlcyBpbmNsdWRlZC4gVXNlIHtAbGluayBpc1Bvam99IHRvIGFzayBmb3JcclxuICogYSBzaW1wbGUgZGF0YSBvYmplY3QgaW5zdGVhZC5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNPYmplY3QgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIHZhbHVlcyBieSB2YWx1ZS5cclxuICpcclxuICogVGhlIHR5cGVzIGNvbXBhcmVkIGJ5IHZhbHVlIGFyZSB0aGUgb25lcyB7QGxpbmsgaXNQb2pvfSBhY2NlcHRzIGFzIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZVxyXG4gKiBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXAgYW5kIFNldC4gQSBEYXRlIGlzIGNvbXBhcmVkIGJ5IGl0cyB0aW1lLCBhIFJlZ0V4cCBieSBzb3VyY2UgYW5kXHJcbiAqIGZsYWdzLiBTZXQgYW5kIE1hcCBhcmUgdW5vcmRlcmVkLCBzbyB0aGVpciBlbnRyaWVzIGFyZSBtYXRjaGVkIGJ5IHZhbHVlIGluc3RlYWQgb2YgYnkgcG9zaXRpb24sXHJcbiAqIGFuZCB0aGUga2V5cyBvZiBhIE1hcCB0YWtlIHBhcnQgaW4gdGhhdCBjb21wYXJpc29uLlxyXG4gKlxyXG4gKiBTaW1wbGUgb2JqZWN0cyBhbmQgY2xhc3MgaW5zdGFuY2VzIG5lZWQgdGhlIHNhbWUgcHJvdG90eXBlIGFuZCB0aGUgc2FtZSBvd24gZW51bWVyYWJsZVxyXG4gKiBwcm9wZXJ0aWVzLiBFdmVyeSBvdGhlciBvYmplY3QgLSBFcnJvciwgUHJvbWlzZSwgV2Vha01hcCBhbmQgdGhlIGxpa2UgLSBrZWVwcyBpdHMgc3RhdGUgb3V0IG9mXHJcbiAqIHJlYWNoLCBzbyB0aG9zZSBjb21wYXJlIGJ5IGlkZW50aXR5IG9ubHkuIEZ1bmN0aW9ucyBhbmQgc3ltYm9scyBkbyBhcyB3ZWxsLlxyXG4gKlxyXG4gKiBDeWNsaWMgc3RydWN0dXJlcyBhcmUgc3VwcG9ydGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IGFcclxuICogQHBhcmFtIHsqfSBiXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBlcXVhbFBvam8oe2EgOiBbMSwgMl19LCB7YSA6IFsxLCAyXX0pOyAgICAgICAgICAgICAgIC8vIHRydWVcclxuICogZXF1YWxQb2pvKG5ldyBTZXQoWzEsIDJdKSwgbmV3IFNldChbMiwgMV0pKTsgICAgICAgICAvLyB0cnVlLCBhIHNldCBpcyB1bm9yZGVyZWRcclxuICogZXF1YWxQb2pvKG5ldyBEYXRlKDApLCBuZXcgRGF0ZSgxKSk7ICAgICAgICAgICAgICAgICAvLyBmYWxzZVxyXG4gKiBlcXVhbFBvam8obmV3IEVycm9yKFwieFwiKSwgbmV3IEVycm9yKFwieFwiKSk7ICAgICAgICAgICAvLyBmYWxzZSwgY29tcGFyZWQgYnkgaWRlbnRpdHlcclxuICovXHJcbmV4cG9ydCBjb25zdCBlcXVhbFBvam8gPSAoYSwgYikgPT4gaW50ZXJuYWxFcXVhbFBvam8oYSwgYiwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG5cclxuLyoqXHJcbiogQHBhcmFtIHsqfSBhXHJcbiAqIEBwYXJhbSB7Kn0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gaW50ZXJuYWwsIHRyYWNrcyB0aGUgcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpbnRlcm5hbEVxdWFsUG9qbyA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IGlzTnVsbE9yVW5kZWZpbmVkKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHRpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XHJcblx0aWYgKGlzUHJpbWl0aXZlKGEpIHx8IGlzUHJpbWl0aXZlKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHJcblx0Y29uc3QgdHlwZUEgPSB0eXBlb2YgYTtcclxuXHRpZiAodHlwZUEgIT09IHR5cGVvZiBiKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHR5cGVBICE9PSBcIm9iamVjdFwiKSByZXR1cm4gYSA9PT0gYjsgLy8gZnVuY3Rpb24gYW5kIHN5bWJvbFxyXG5cclxuXHRpZiAoaXNDb21wYXJpbmcoc2VlbiwgYSwgYikpIHJldHVybiB0cnVlO1xyXG5cdHJlbWVtYmVyQ29tcGFyaW5nKHNlZW4sIGEsIGIpO1xyXG5cclxuXHRpZihhIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuICBiIGluc3RhbmNlb2YgRGF0ZSA/IE9iamVjdC5pcyhhLmdldFRpbWUoKSwgYi5nZXRUaW1lKCkpIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gYiBpbnN0YW5jZW9mIFJlZ0V4cCA/IChhLnNvdXJjZSA9PT0gYi5zb3VyY2UgJiYgYS5mbGFncyA9PT0gYi5mbGFncykgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIGIgaW5zdGFuY2VvZiBBcnJheSA/IGVxdWFsQXJyYXkoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBTZXQpIHJldHVybiBiIGluc3RhbmNlb2YgU2V0ID8gZXF1YWxTZXQoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBNYXApIHJldHVybiBiIGluc3RhbmNlb2YgTWFwID8gZXF1YWxNYXAoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBmYWxzZTtcdFxyXG5cdGVsc2UgcmV0dXJuIGVxdWFsT2JqZWN0KGEsIGIsIHNlZW4pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgcGxhaW4gb2JqZWN0IG93bnMgZWl0aGVyIG5vIHByb3RvdHlwZSBhdCBhbGwgb3IgYSBwcm90b3R5cGUgdGhhdCBpdHNlbGYgaGFzIG5vbmUuIENoZWNraW5nIHRoZVxyXG4gKiBjaGFpbiBsZW5ndGggaW5zdGVhZCBvZiBjb21wYXJpbmcgYWdhaW5zdCBPYmplY3QucHJvdG90eXBlIGtlZXBzIHRoaXMgd29ya2luZyBhY3Jvc3MgcmVhbG1zLFxyXG4gKiB3aGVyZSBhbiBpZnJhbWUgYnJpbmdzIGl0cyBvd24gT2JqZWN0LnByb3RvdHlwZS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSBvYmplY3RcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xyXG5cdGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xyXG5cdHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvdHlwZSkgPT09IG51bGw7XHJcbn07XHJcblxyXG4vKipcclxuICogV2Fsa3MgYSB2YWx1ZSBhbmQgZGVjaWRlcyB3aGV0aGVyIGV2ZXJ5dGhpbmcgcmVhY2hhYmxlIGZyb20gaXQgaXMgZGF0YS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1dlYWtTZXR9IFtzZWVuXSB2YWx1ZXMgYWxyZWFkeSB3YWxrZWQsIGNsb3NlcyBjeWNsZXNcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFWYWx1ZSA9ICh2YWx1ZSwgc2VlbiA9IG5ldyBXZWFrU2V0KCkpID0+IHtcclxuXHRpZiAoaXNQcmltaXRpdmUodmFsdWUpKSByZXR1cm4gdHJ1ZTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB0cnVlO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0aWYgKHNlZW4uaGFzKHZhbHVlKSkgcmV0dXJuIHRydWU7XHJcblx0c2Vlbi5hZGQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIHZhbHVlLmV2ZXJ5KChlbnRyeSkgPT4gaXNEYXRhVmFsdWUoZW50cnksIHNlZW4pKTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkge1xyXG5cdFx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShrZXksIHNlZW4pIHx8ICFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKVxyXG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBjbGFzcyBpbnN0YW5jZXMgYW5kIGV2ZXJ5IG90aGVyIGV4b3RpYyBvYmplY3RcclxuXHRlbHNlIHtcclxuXHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKHZhbHVlW2tleV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBpcyBhIHB1cmUgZGF0YSBvYmplY3QuXHJcbiAqXHJcbiAqIFRoZSBvYmplY3QgaXRzZWxmIGhhcyB0byBiZSBhIHNpbXBsZSBvYmplY3QgLSBubyBBcnJheSwgTWFwIG9yIHNvbWV0aGluZyBlbHNlLiBFdmVyeSB2YWx1ZVxyXG4gKiByZWFjaGFibGUgZnJvbSBpdCBoYXMgdG8gYmUgZGF0YSBhcyB3ZWxsOiBwcmltaXRpdmVzLCBzaW1wbGUgb2JqZWN0cywgQXJyYXksIERhdGUsIFJlZ0V4cCwgTWFwIG9yXHJcbiAqIFNldC4gRnVuY3Rpb25zIGFuZCBjbGFzcyBpbnN0YW5jZXMgYXJlIHJlamVjdGVkIGF0IGFueSBkZXB0aCwgaW5jbHVkaW5nIGluc2lkZSBhcnJheXMgYW5kIGluc2lkZVxyXG4gKiB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGEgTWFwIG9yIFNldC5cclxuICpcclxuICogT25seSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBpbnNwZWN0ZWQuIEN5Y2xpYyByZWZlcmVuY2VzIGFyZSBhbGxvd2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGlzUG9qbyh7YSA6IHtiIDogWzEsIG5ldyBEYXRlKCldfX0pOyAgIC8vIHRydWVcclxuICogaXNQb2pvKHthIDogKCkgPT4ge319KTsgICAgICAgICAgICAgICAgLy8gZmFsc2UsIGEgZnVuY3Rpb24gaXMgbm8gZGF0YVxyXG4gKiBpc1Bvam8oe2EgOiBbe2IgOiBuZXcgRm9vKCl9XX0pOyAgICAgICAvLyBmYWxzZSwgcmVqZWN0ZWQgYXQgYW55IGRlcHRoXHJcbiAqIGlzUG9qbyhbXSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbHNlLCB0aGUgb2JqZWN0IGl0c2VsZiBoYXMgdG8gYmUgYSBzaW1wbGUgb25lXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNQb2pvID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChpc051bGxPclVuZGVmaW5lZChvYmplY3QpIHx8ICFpc1BsYWluT2JqZWN0KG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIGlzRGF0YVZhbHVlKG9iamVjdCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwZW5kcyBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIG9iamVjdC4gSWYgdGhlIHByb3BlcnR5IGFscmVhZHkgaG9sZHMgYSB2YWx1ZSwgaXQgaXMgY29udmVydGVkXHJcbiAqIGludG8gYW4gYXJyYXkgY2FycnlpbmcgYm90aC4gQW4gdW5kZWZpbmVkIHZhbHVlIGlzIGlnbm9yZWQuXHJcbiAqXHJcbiAqIFRoZSBrZXkgbWF5IGFkZHJlc3MgYSBuZXN0ZWQgcHJvcGVydHkgYnkgYSBkb3R0ZWQgcGF0aCwgbWlzc2luZyBzdGVwcyBhcmUgY3JlYXRlZCBvbiB0aGUgd2F5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYUtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMgYSBuZXN0ZWQgb25lXHJcbiAqIEBwYXJhbSB7Kn0gYURhdGEgcHJvcGVydHkgdmFsdWVcclxuICogQHBhcmFtIHtvYmplY3R9IGFPYmplY3QgdGhlIG9iamVjdCB0byBhcHBlbmQgdGhlIHByb3BlcnR5IHRvXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSBjaGFuZ2VkIG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBhcHBlbmQoXCJhXCIsIDEsIHt9KTsgICAgICAgICAgICAgLy8ge2EgOiAxfVxyXG4gKiBhcHBlbmQoXCJhXCIsIDIsIHthIDogMX0pOyAgICAgICAgLy8ge2EgOiBbMSwgMl19XHJcbiAqIGFwcGVuZChcImEuYlwiLCAxLCB7fSk7ICAgICAgICAgICAvLyB7YSA6IHtiIDogMX19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYXBwZW5kID0gKGFLZXksIGFEYXRhLCBhT2JqZWN0KSA9PiB7XHJcblx0aWYgKHR5cGVvZiBhRGF0YSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0Y29uc3QgcHJvcGVydHkgPSBPYmplY3RQcm9wZXJ0eS5sb2FkKGFPYmplY3QsIGFLZXksIHRydWUpO1xyXG5cdFx0cHJvcGVydHkuYXBwZW5kID0gYURhdGE7XHJcblx0fVxyXG5cdHJldHVybiBhT2JqZWN0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE93biBlbnVtZXJhYmxlIGtleXMsIHN0cmluZ3MgYW5kIHN5bWJvbHMgYWxpa2UgLSB0aGUgc2FtZSBzZXQgT2JqZWN0LmFzc2lnbiBjb3BpZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gc291cmNlXHJcbiAqIEByZXR1cm5zIHtBcnJheTxzdHJpbmd8c3ltYm9sPn1cclxuICovXHJcbmNvbnN0IGFzc2lnbmFibGVLZXlzID0gKHNvdXJjZSkgPT4ge1xyXG5cdGNvbnN0IG9iamVjdCA9IE9iamVjdChzb3VyY2UpO1xyXG5cdHJldHVybiBSZWZsZWN0Lm93bktleXMob2JqZWN0KS5maWx0ZXIoKGtleSkgPT4gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwga2V5KSk7XHJcbn07XHJcblxyXG4vKipcclxuICogTWVyZ2VzIG9iamVjdHMgaW50byBhIHRhcmdldCBvYmplY3QgLSBhIHJlY3Vyc2l2ZSBPYmplY3QuYXNzaWduLiBJdCBzdGVwcyBpbnRvIG9iamVjdHMgYW5kIHN1YlxyXG4gKiBvYmplY3RzLiBFdmVyeSBvdGhlciB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgdmFsdWUgZnJvbSB0aGUgc291cmNlIG9iamVjdC5cclxuICpcclxuICogTGlrZSBPYmplY3QuYXNzaWduIGl0IGNvcGllcyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIC0gc3RyaW5nIGFuZCBzeW1ib2wga2V5cyBhbGlrZSAtLCBpZ25vcmVzXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBzb3VyY2VzIGFuZCByZXR1cm5zIHRoZSB0YXJnZXQuIFVubGlrZSBPYmplY3QuYXNzaWduIGl0IHN0ZXBzIGludG8gYSBwcm9wZXJ0eVxyXG4gKiB3aGVuIHRhcmdldCBhbmQgc291cmNlIGJvdGggaG9sZCBhbiBvYmplY3QsIGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0LlxyXG4gKlxyXG4gKiBBIGNsYXNzIGluc3RhbmNlIGNvdW50cyBhcyBhbiBvYmplY3QgaGVyZSBhbmQgaXMgbWVyZ2VkIHByb3BlcnR5IGJ5IHByb3BlcnR5IGp1c3QgbGlrZSBhIHNpbXBsZVxyXG4gKiBvbmUuIFRoZSB0YXJnZXQga2VlcHMgaXRzIG93biBwcm90b3R5cGUsIG9ubHkgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHNvdXJjZSBhcmUgYXBwbGllZCB0byBpdCAtIGFcclxuICogbWVyZ2UgbmV2ZXIgdHVybnMgdGhlIHRhcmdldCBpbnRvIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcyBvZiB0aGUgc291cmNlLlxyXG4gKlxyXG4gKiBBbiBBcnJheSwgU2V0LCBNYXAsIERhdGUgb3IgUmVnRXhwIGlzIGFsd2F5cyByZXBsYWNlZCBhcyBhIHdob2xlLCBuZXZlciBtZXJnZWQgZW50cnkgYnkgZW50cnkuXHJcbiAqIFRoYXQgYWxyZWFkeSBhcHBsaWVzIHdoZW4gb25seSBvbmUgb2YgYm90aCBzaWRlcyBob2xkcyBvbmUuIFRoZSByZXN1bHQgdGhlcmVmb3JlIGNhcnJpZXMgdGhlXHJcbiAqIGNvbnRhaW5lciBvZiB0aGUgc291cmNlIHdpdGggaXRzIG93biBsZW5ndGggLSBub3RoaW5nIG9mIHRoZSB0YXJnZXQgc3Vydml2ZXMgaXQsIG5vdCBldmVuIGFuXHJcbiAqIG9iamVjdCBzaXR0aW5nIGF0IHRoZSBzYW1lIGluZGV4IG9yIHVuZGVyIHRoZSBzYW1lIGtleS5cclxuICpcclxuICogQSBrZXkgd2hvc2UgdmFsdWUgaXMgYSBzeW1ib2wgaXMgc2tpcHBlZCwgb24gdGhlIHRhcmdldCBzaWRlIGFzIHdlbGwgYXMgb24gdGhlIHNvdXJjZSBzaWRlLiBBXHJcbiAqIHN5bWJvbCBjYXJyaWVzIG5vIGRhdGEsIHNvIHN1Y2ggYSBwcm9wZXJ0eSBpcyBsZWZ0IHVudG91Y2hlZC5cclxuICpcclxuICogVGhlIGtleSBfX3Byb3RvX18gaXMgc2tpcHBlZC4gT2JqZWN0LmFzc2lnbiB3b3VsZCBvbmx5IHJlcG9pbnQgdGhlIHByb3RvdHlwZSBvZiB0aGUgdGFyZ2V0LCBidXRcclxuICogbWVyZ2luZyBpbnRvIGl0IHdvdWxkIHdhbGsgaW50byBPYmplY3QucHJvdG90eXBlIGFuZCBsZWFrIGludG8gZXZlcnkgb2JqZWN0LlxyXG4gKlxyXG4gKiBUaGUgdGFyZ2V0IGlzIG1vZGlmaWVkIGluIHBsYWNlLiBBIHN1YiBvYmplY3Qgb2YgYSBzb3VyY2UgdGhhdCBoYXMgbm8gY291bnRlcnBhcnQgaW4gdGhlIHRhcmdldCBpc1xyXG4gKiB0YWtlbiBvdmVyIGJ5IHJlZmVyZW5jZSwganVzdCBsaWtlIE9iamVjdC5hc3NpZ24gZG9lcy5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCB0aGUgdGFyZ2V0IG9iamVjdCB0byBtZXJnZSBpbnRvLCBhIG5ldyBvYmplY3Qgd2hlbiBmYWxzeVxyXG4gKiBAcGFyYW0gey4uLm9iamVjdH0gc291cmNlcyB0aGUgc291cmNlIG9iamVjdHMsIGFwcGxpZWQgaW4gb3JkZXJcclxuICogQHJldHVybnMge29iamVjdH0gdGhlIHRhcmdldCBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbWVyZ2Uoe2EgOiAxfSwge2IgOiAyfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDEsIGIgOiAyfVxyXG4gKiBtZXJnZSh7YSA6IHt4IDogMX19LCB7YSA6IHt5IDogMn19KTsgICAgICAgICAgICAgIC8vIHthIDoge3ggOiAxLCB5IDogMn19XHJcbiAqIG1lcmdlKHthIDogWzEsIDIsIDNdfSwge2EgOiBbOV19KTsgICAgICAgICAgICAgICAgLy8ge2EgOiBbOV19LCByZXBsYWNlZCBhcyBhIHdob2xlXHJcbiAqIG1lcmdlKHthIDogbmV3IEZvbygxKX0sIHthIDogbmV3IEJhcigyKX0pOyAgICAgICAgLy8gYSBzdGF5cyBhIEZvbywgY2FycnlpbmcgdGhlIHByb3BlcnRpZXMgb2YgYm90aFxyXG4gKiBtZXJnZSh7fSwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWVyZ2UgPSAodGFyZ2V0LCAuLi5zb3VyY2VzKSA9PiB7XHJcblx0aWYgKCF0YXJnZXQpIHRhcmdldCA9IHt9O1xyXG5cclxuXHRzb3VyY2VzXHJcblx0XHQuZmlsdGVyKChzb3VyY2UpID0+ICFpc051bGxPclVuZGVmaW5lZChzb3VyY2UpKVxyXG5cdFx0LmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG5cdFx0XHRjb25zdCBrZXlzID0gYXNzaWduYWJsZUtleXMoc291cmNlKTtcclxuXHRcdFx0a2V5c1xyXG5cdFx0XHRcdC5maWx0ZXIoKGtleSkgPT4ga2V5ICE9IFwiX19wcm90b19fXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2YgdGFyZ2V0W2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2Ygc291cmNlW2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZvckVhY2goKGtleSkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzb3VyY2Vba2V5XTtcclxuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnQgPSB0YXJnZXRba2V5XTtcclxuXHJcblx0XHRcdFx0XHRpZihjdXJyZW50ID09IG51bGwgKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiggdHlwZW9mIGN1cnJlbnQgIT09IHR5cGVvZiB2YWx1ZSApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgQXJyYXkgfHwgdmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBTZXQgfHwgdmFsdWUgaW5zdGFuY2VvZiBTZXQpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgTWFwIHx8IHZhbHVlIGluc3RhbmNlb2YgTWFwKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIERhdGUgfHwgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFJlZ0V4cCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGlzT2JqZWN0KGN1cnJlbnQpICYmIGlzT2JqZWN0KHZhbHVlKSkgbWVyZ2UoY3VycmVudCwgdmFsdWUpO1xyXG5cdFx0XHRcdFx0ZWxzZSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdHJldHVybiB0YXJnZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVjaWRlcyB3aGV0aGVyIGEgc2luZ2xlIHByb3BlcnR5IGlzIHRha2VuIG92ZXIgYnkge0BsaW5rIGZpbHRlcn0uXHJcbiAqXHJcbiAqIEBjYWxsYmFjayBQcm9wZXJ0eUZpbHRlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0aGUgb2JqZWN0IHRoZSBwcm9wZXJ0eSBiZWxvbmdzIHRvXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIHRvIGtlZXAgdGhlIHByb3BlcnR5XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIHtAbGluayBQcm9wZXJ0eUZpbHRlcn0gYWNjZXB0aW5nIG9yIHJlamVjdGluZyBhIGZpeGVkIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gb3B0aW9ucy5uYW1lcyB0aGUgcHJvcGVydHkgbmFtZXMgdG8gZGVjaWRlIG9uXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5hbGxvd2VkIHRydWUgdHVybnMgdGhlIGxpc3QgaW50byBhbiBhbGxvdyBsaXN0LCBmYWxzZSBpbnRvIGEgZGVueSBsaXN0XHJcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eUZpbHRlcn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZGVueSA9IGJ1aWxkUHJvcGVydHlGaWx0ZXIoe25hbWVzIDogW1wicGFzc3dvcmRcIl0sIGFsbG93ZWQgOiBmYWxzZX0pO1xyXG4gKiBmaWx0ZXIodXNlciwgZGVueSk7ICAgLy8gZXZlcnkgcHJvcGVydHkgYnV0IHBhc3N3b3JkXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYnVpbGRQcm9wZXJ0eUZpbHRlciA9ICh7IG5hbWVzLCBhbGxvd2VkIH0pID0+IHtcclxuXHRyZXR1cm4gKG5hbWUsIHZhbHVlLCBjb250ZXh0KSA9PiB7XHJcblx0XHRyZXR1cm4gbmFtZXMuaW5jbHVkZXMobmFtZSkgPT09IGFsbG93ZWQ7XHJcblx0fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWJ1aWxkcyBhbiBBcnJheSwgU2V0IG9yIE1hcCB3aXRoIGl0cyB2YWx1ZXMgZmlsdGVyZWQuIEEgY29udGFpbmVyIGtlZXBzIGFsbCBvZiBpdHMgZW50cmllcyAtXHJcbiAqIG9ubHkgdGhlIHZhbHVlcyBpbnNpZGUgZ2V0IGZpbHRlcmVkLiBUaGUga2V5cyBvZiBhIE1hcCBzdGF5IHVudG91Y2hlZCwgcmVwbGFjaW5nIHRoZW0gd291bGQgYnJlYWtcclxuICogZXZlcnkgbG9va3VwIGFnYWluc3QgdGhlIHJlc3VsdC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtBcnJheXxTZXR8TWFwfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVlcFxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IGNvcGllcyBtYXBzIGFuIG9yaWdpbmFsIG9udG8gaXRzIGZpbHRlcmVkIGNvcHlcclxuICogQHJldHVybnMge0FycmF5fFNldHxNYXB9XHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJDb250YWluZXIgPSAodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblx0XHRjb25zdCBjb3B5ID0gW107XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkucHVzaChmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdFx0cmV0dXJuIGNvcHk7XHJcblx0fVxyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGNvbnN0IGNvcHkgPSBuZXcgU2V0KCk7XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkuYWRkKGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0XHRyZXR1cm4gY29weTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGNvcHkgPSBuZXcgTWFwKCk7XHJcblx0Y29waWVzLnNldCh2YWx1ZSwgY29weSk7XHJcblx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIGNvcHkuc2V0KGtleSwgZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRyZXR1cm4gY29weTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXJzIGEgc2luZ2xlIHZhbHVlLCBkaXNwYXRjaGluZyBvbiB3aGF0IGl0IGlzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7Kn0gdGhlIGZpbHRlcmVkIHZhbHVlLCBvciB0aGUgdmFsdWUgaXRzZWxmIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBmaWx0ZXJcclxuICovXHJcbmNvbnN0IGZpbHRlclZhbHVlID0gKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpID0+IHtcclxuXHRpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdmFsdWU7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHZhbHVlOyAvLyBjYXJyeSBubyBwcm9wZXJ0aWVzIHRvIGZpbHRlclxyXG5cclxuXHQvLyBhIHZhbHVlIHNlZW4gYmVmb3JlIGNsb3NlcyBhIGN5Y2xlIC0gaXRzIGNvcHkgc3RhbmRzIGluLCBzbyBub3RoaW5nIHVuZmlsdGVyZWQgbGVha3MgYmFjayBpblxyXG5cdGlmIChjb3BpZXMuaGFzKHZhbHVlKSkgcmV0dXJuIGNvcGllcy5nZXQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGZpbHRlckNvbnRhaW5lcih2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxuXHJcblx0cmV0dXJuIGZpbHRlck9iamVjdCh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgdGhlIGZpbHRlcmVkIGNvcHkgb2YgYW4gb2JqZWN0LiBUaGUgY29weSBpcyByZWdpc3RlcmVkIGJlZm9yZSBpdCBpcyBmaWxsZWQsIHNvIGEgY3ljbGVcclxuICogcnVubmluZyBiYWNrIGludG8gaXQgcmVzb2x2ZXMgdG8gdGhlIGNvcHkgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuY29uc3QgZmlsdGVyT2JqZWN0ID0gKGRhdGEsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cdGNvcGllcy5zZXQoZGF0YSwgcmVzdWx0KTtcclxuXHJcblx0Zm9yIChjb25zdCBuYW1lIGluIGRhdGEpIHtcclxuXHRcdGNvbnN0IHZhbHVlID0gZGF0YVtuYW1lXTtcclxuXHRcdGlmIChwcm9wRmlsdGVyKG5hbWUsIHZhbHVlLCBkYXRhKSl7XHJcblx0XHRcdHJlc3VsdFtuYW1lXSA9IGRlZXAgPyBmaWx0ZXJWYWx1ZSh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA6IHZhbHVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBuZXcgb2JqZWN0IGhvbGRpbmcgdGhlIHByb3BlcnRpZXMgYSBmaWx0ZXIgYWNjZXB0cy5cclxuICpcclxuICogVGhlIGZpbHRlciBpcyBjYWxsZWQgZm9yIGV2ZXJ5IGVudW1lcmFibGUgcHJvcGVydHksIGluaGVyaXRlZCBvbmVzIGluY2x1ZGVkIC0gZmlsdGVyaW5nIGEgd2luZG93XHJcbiAqIHJlbGllcyBvbiB0aGF0LCBzaW5jZSBtb3N0IG9mIGl0cyBtZW1iZXJzIHNpdCBvbiB0aGUgcHJvdG90eXBlLlxyXG4gKlxyXG4gKiBXaXRoIGRlZXAgdGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvIHN1YiBvYmplY3RzIGFzIHdlbGwuIEFycmF5LCBTZXQgYW5kIE1hcCBhcmUgcmVidWlsdCB3aXRoIHRoZWlyXHJcbiAqIHZhbHVlcyBmaWx0ZXJlZCwga2VlcGluZyBhbGwgb2YgdGhlaXIgZW50cmllcyBhbmQsIGZvciBhIE1hcCwgaXRzIGtleXMuIERhdGUgYW5kIFJlZ0V4cCBhcmUgdGFrZW5cclxuICogb3ZlciBhcyB0aGV5IGFyZS4gQSBjeWNsaWMgcmVmZXJlbmNlIHJlc29sdmVzIHRvIHRoZSBmaWx0ZXJlZCBjb3B5LCBzbyB0aGUgcmVzdWx0IG5ldmVyIGNhcnJpZXMgYVxyXG4gKiByZWZlcmVuY2UgaW50byB0aGUgdW50b3VjaGVkIG9yaWdpbmFsLlxyXG4gKlxyXG4gKiBXaXRob3V0IGRlZXAgdGhlIGFjY2VwdGVkIHZhbHVlcyBhcmUgdGFrZW4gb3ZlciBhcyB0aGV5IGFyZSwgc3ViIG9iamVjdHMgYnkgcmVmZXJlbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0aGUgb2JqZWN0IHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXIgZGVjaWRlcyBwZXIgcHJvcGVydHksIHNlZSB7QGxpbmsgYnVpbGRQcm9wZXJ0eUZpbHRlcn1cclxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXA9ZmFsc2VdIGZpbHRlciBzdWIgb2JqZWN0cyB0b29cclxuICogQHJldHVybnMge29iamVjdH0gYSBuZXcgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGRlbnkgPSBidWlsZFByb3BlcnR5RmlsdGVyKHtuYW1lcyA6IFtcInNlY3JldFwiXSwgYWxsb3dlZCA6IGZhbHNlfSk7XHJcbiAqXHJcbiAqIGZpbHRlcih7c2VjcmV0IDogXCJ4XCIsIGEgOiAxfSwgZGVueSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDF9XHJcbiAqIGZpbHRlcih7c3ViIDoge3NlY3JldCA6IFwieFwiLCBhIDogMX19LCBkZW55LCB7ZGVlcCA6IHRydWV9KTsgICAgICAvLyB7c3ViIDoge2EgOiAxfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoZGF0YSwgcHJvcEZpbHRlciwgeyBkZWVwID0gZmFsc2UgfSA9IHt9KSA9PiBmaWx0ZXJPYmplY3QoZGF0YSwgcHJvcEZpbHRlciwgZGVlcCwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIGNvbnN0YW50LCBub24gZW51bWVyYWJsZSBwcm9wZXJ0eS5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdGhlIHZhbHVlLCBuZWl0aGVyIHdyaXRhYmxlIG5vciBjb25maWd1cmFibGVcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmVmFsdWUgPSAobywgbmFtZSwgdmFsdWUpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0dmFsdWUsXHJcblx0XHR3cml0YWJsZTogZmFsc2UsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIHJlYWQgb25seSwgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZHZXQgPSAobywgbmFtZSwgZ2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyIGFuZCBhIHNldHRlci5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gc2V0IHRha2VzIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZkdldFNldCA9IChvLCBuYW1lLCBnZXQsIHNldCkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHRnZXQsXHJcblx0XHRzZXQsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0aXNOdWxsT3JVbmRlZmluZWQsXHJcblx0aXNPYmplY3QsXHJcblx0aXNQcmltaXRpdmUsXHJcblx0ZXF1YWxQb2pvLFxyXG5cdGlzUG9qbyxcclxuXHRhcHBlbmQsXHJcblx0bWVyZ2UsXHJcblx0ZmlsdGVyLFxyXG5cdGJ1aWxkUHJvcGVydHlGaWx0ZXIsXHJcblx0ZGVmVmFsdWUsXHJcblx0ZGVmR2V0LFxyXG5cdGRlZkdldFNldCxcclxufTtcclxuIiwiLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDYWNoZUVudHJ5XG4gKiBAcHJvcGVydHkge251bWJlcn0gbGFzdEhpdCAtIE1vbm90b25pYyBtYXJrZXIgb2YgdGhlIGxhc3QgcmVhZCBvciB3cml0ZSwgdGhlIGV2aWN0aW9uIG9yZGVyLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGtleVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gdmFsdWVcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvZGVDYWNoZU9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc2l6ZV0gLSBNYXhpbXVtIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjYWNoZSwgYSBmcmFjdGlvbiByb3VuZGVkIGRvd24uIElmIHNldFxuICogdG8gMCBvciBsZXNzLCBjYWNoaW5nIGlzIGRpc2FibGVkLiBMZWZ0IG91dCwgdGhlIHNpemUgc3RheXMgYXMgaXQgaXMgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMy5cbiAqL1xuXG4vKiogVGhlIHNpemUgZXZlcnkgY2FjaGUgc3RhcnRzIHdpdGggLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMy4gKi9cbmNvbnN0IFNUQVJUX1NJWkUgPSA1MDAwO1xuXG4vKipcbiAqIENvZGVDYWNoZSBjbGFzcyB0byBtYW5hZ2UgY2FjaGluZyBvZiBnZW5lcmF0ZWQgY29kZSBzbmlwcGV0cy5cbiAqXG4gKiBFbnRyaWVzIGFyZSBldmljdGVkIGxlYXN0IHJlY2VudGx5IHVzZWQgZmlyc3Q6IGV2ZXJ5IGhpdCByZWZyZXNoZXMgdGhlIGVudHJ5LCBzbyBhblxuICogZXhwcmVzc2lvbiB0aGF0IGtlZXBzIGJlaW5nIHJlc29sdmVkIG91dGxpdmVzIG9uZSB0aGF0IHdhcyBjb21waWxlZCBvbmNlIGFuZCBkcm9wcGVkLlxuICogVGhlIG1hcmtlciBpcyBhIGNvdW50ZXIgcmF0aGVyIHRoYW4gYSB0aW1lc3RhbXAg4oCUIGEgYnVyc3Qgb2YgZmlyc3QtdGltZSBjb21waWxhdGlvbnNcbiAqIGZhbGxzIGludG8gYSBzaW5nbGUgbWlsbGlzZWNvbmQsIHdoaWNoIHdvdWxkIGxlYXZlIHRoZSBldmljdGlvbiBvcmRlciB0byBjaGFuY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVDYWNoZSB7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I2Rpc2FibGVkID0gZmFsc2U7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjc2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjbWF4U2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7QXJyYXk8Q2FjaGVFbnRyeT59ICovXG5cdCNlbnRyaWVzID0gW107XG5cdC8qKiBAdHlwZSB7TWFwPHN0cmluZyxDYWNoZUVudHJ5Pn0gKi9cblx0I2VudHJ5TWFwID0gbmV3IE1hcCgpO1xuXHQvKiogQHR5cGUge251bWJlcn0gLSBIYW5kcyBvdXQgdGhlIGBsYXN0SGl0YCBtYXJrZXJzLCBuZXZlciByZXNldC4gKi9cblx0I2Nsb2NrID0gMDtcblxuXG5cdC8qKlxuXHQgKiBTdGFydHMgd2l0aCBhIHNpemUgb2YgNTAwMCwgdGhlbiBhcHBsaWVzIHRoZSBvcHRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuI3Jlc2l6ZShTVEFSVF9TSVpFKTtcblx0XHR0aGlzLnNldHVwKG9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgd2hhdCB0aGUgb3B0aW9ucyBjYXJyeSBhbmQgbGVhdmVzIGV2ZXJ5dGhpbmcgZWxzZSBhcyBpdCBpcy4gQSBzaXplIG9mIDAgb3IgbGVzc1xuXHQgKiBkaXNhYmxlcyB0aGUgY2FjaGUgYW5kIHJlbGVhc2VzIGl0cyBlbnRyaWVzLCBhIGxhdGVyIHBvc2l0aXZlIHNpemUgZW5hYmxlcyBpdCBhZ2FpbiBhbmQgc3RhcnRzXG5cdCAqIGVtcHR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgc2l6ZSBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG5cdCAqL1xuXHRzZXR1cCh7IHNpemUgfSA9IHt9KSB7XG5cdFx0aWYgKHNpemUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2Ygc2l6ZSAhPT0gXCJudW1iZXJcIiB8fCAhTnVtYmVyLmlzRmluaXRlKHNpemUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgc2l6ZSBvZiBhIGNvZGUgY2FjaGUgaXMgYSBmaW5pdGUgbnVtYmVyLCBub3QgJHtTdHJpbmcoc2l6ZSl9IWApO1xuXG5cdFx0dGhpcy4jcmVzaXplKE1hdGguZmxvb3Ioc2l6ZSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBhU2l6ZSBhIHdob2xlIG51bWJlclxuXHQgKi9cblx0I3Jlc2l6ZShhU2l6ZSkge1xuXHRcdHRoaXMuI2Rpc2FibGVkID0gYVNpemUgPD0gMDtcblx0XHRpZiAodGhpcy4jZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMuI3NpemUgPSAwO1xuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IDA7XG5cdFx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuI3NpemUgPSBhU2l6ZTtcblx0XHRcdHRoaXMuI21heFNpemUgPSBNYXRoLmZsb29yKGFTaXplICogMS4xKTtcblx0XHRcdHRoaXMuI3RyaW0oKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciBhbiBlbnRyeSBpcyBoZWxkIHVuZGVyIHRoZSBrZXkuIEEgZGlzYWJsZWQgY2FjaGUgaG9sZHMgbm9uZS4gQXNraW5nIGRvZXMgbm90IGNvdW50IGFzIGFcblx0ICogaGl0LCBzbyBpdCBsZWF2ZXMgdGhlIGV2aWN0aW9uIG9yZGVyIGFsb25lLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzKGtleSkge1xuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHRoaXMuI2VudHJ5TWFwLmhhcyhrZXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb2RlIGhlbGQgdW5kZXIgdGhlIGtleSwgb3IgbnVsbCB3aGVyZSBub25lIGlzIGhlbGQgb3IgdGhlIGNhY2hlIGlzIGRpc2FibGVkLiBBIGhpdFxuXHQgKiByZWZyZXNoZXMgdGhlIGVudHJ5LCBzbyBpdCBpcyBldmljdGVkIGxhc3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHJldHVybnMgez9GdW5jdGlvbn1cblx0ICovXG5cdGdldChrZXkpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIG51bGw7XG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0cmV0dXJuIGVudHJ5LnZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBIb2xkcyB0aGUgY29kZSB1bmRlciB0aGUga2V5LCByZXBsYWNpbmcgd2hhdCB3YXMgaGVsZCB0aGVyZSwgYW5kIHJlZnJlc2hlcyB0aGUgZW50cnkuIE9uY2UgdGhlXG5cdCAqIGNhY2hlIHJlYWNoZXMgYSB0ZW50aCBwYXN0IGl0cyBzaXplLCB0aGUgbGVhc3QgcmVjZW50bHkgdXNlZCBlbnRyaWVzIGFyZSBldmljdGVkIGRvd24gdG8gdGhlXG5cdCAqIHNpemUuXG5cdCAqIEEgZGlzYWJsZWQgY2FjaGUga2VlcHMgbm90aGluZy5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb2RlXG5cdCAqL1xuXHRzZXQoa2V5LCBjb2RlKSB7XG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybjtcblx0XHRsZXQgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0ZW50cnkudmFsdWUgPSBjb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbnRyeSA9IHtcblx0XHRcdFx0bGFzdEhpdDogKyt0aGlzLiNjbG9jayxcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHR2YWx1ZTogY29kZSxcblx0XHRcdH07XG5cdFx0XHR0aGlzLiNlbnRyaWVzLnB1c2goZW50cnkpO1xuXHRcdFx0dGhpcy4jZW50cnlNYXAuc2V0KGtleSwgZW50cnkpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLiNlbnRyeU1hcC5zaXplID49IHRoaXMuI21heFNpemUpIHRoaXMuI3RyaW0oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEcm9wcyBldmVyeSBlbnRyeS4gVGhlIHNpemUgc3RheXMgYXMgaXQgaXMuXG5cdCAqL1xuXHRjbGVhcigpIHtcblx0XHR0aGlzLiNlbnRyaWVzID0gW107XG5cdFx0dGhpcy4jZW50cnlNYXAgPSBuZXcgTWFwKCk7XG5cdH1cblxuXHQjdHJpbSgpIHtcblx0XHR0aGlzLiNlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGIubGFzdEhpdCAtIGEubGFzdEhpdCk7XG5cdFx0aWYgKHRoaXMuI2VudHJpZXMubGVuZ3RoID4gdGhpcy4jc2l6ZSkge1xuXHRcdFx0Y29uc3QgZW50cmllc1RvUmVtb3ZlID0gdGhpcy4jZW50cmllcy5zcGxpY2UodGhpcy4jc2l6ZSk7XG5cdFx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXNUb1JlbW92ZSkge1xuXHRcdFx0XHR0aGlzLiNlbnRyeU1hcC5kZWxldGUoZW50cnkua2V5KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG4iLCIvKipcbiAqIEEgZGVmYXVsdCB2YWx1ZSBhcyB0aGUgcmVzb2x2ZXIgY2FycmllcyBpdCwgd2hpY2ggdGVsbHMgXCJubyBkZWZhdWx0IHBhc3NlZFwiIGFwYXJ0IGZyb20gXCJ0aGVcbiAqIGRlZmF1bHQgaXMgdW5kZWZpbmVkXCIgLSBTUEVDSUZJQ0FUSU9OLm1kIDQuNC5cbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRGVmYXVsdFZhbHVlXG4gKiBAdHlwZWRlZiB7RGVmYXVsdFZhbHVlfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWZhdWx0VmFsdWUge1xuXHQvKipcblx0ICogQ3JlYXRlZCB3aXRob3V0IGFuIGFyZ3VtZW50LCBpdCBjYXJyaWVzIG5vIGRlZmF1bHQ7IGNyZWF0ZWQgd2l0aCBvbmUsIGl0IGNhcnJpZXMgdGhhdFxuXHQgKiBhcmd1bWVudCwgdW5kZWZpbmVkIGluY2x1ZGVkLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHsqfSBbdmFsdWVdXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZSl7XG5cdFx0LyoqIEB0eXBlIHtib29sZWFufSB3aGV0aGVyIGEgZGVmYXVsdCB3YXMgcGFzc2VkICovXG5cdFx0dGhpcy5oYXNWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMTtcblx0XHQvKiogQHR5cGUgeyp9IHRoZSBkZWZhdWx0LCBtZWFuaW5nZnVsIG9ubHkgd2hlcmUgaGFzVmFsdWUgaXMgdHJ1ZSAqL1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxufTtcbiIsIi8qKlxuICogVGhlIGludGVyZmFjZSBldmVyeSBleGVjdXRlciBpbXBsZW1lbnRzIC0gU1BFQ0lGSUNBVElPTi5tZCA5LjEuIEFuIGV4ZWN1dGVyIHJ1bnMgc3RhdGVtZW50cyBhbmRcbiAqIGhvbGRzIG5vIGNvbnRleHQgb2YgaXRzIG93bjogdGhlIGNvbnRleHQgYWx3YXlzIGNvbWVzIGZyb20gdGhlIHJlc29sdmVyLlxuICpcbiAqIEFuIG93biBpbXBsZW1lbnRhdGlvbiBpcyBidWlsdCBmcm9tIGl0IGJ5IGhhbmRpbmcgb3ZlciB0aGUgZnVuY3Rpb24gdGhhdCBkb2VzIHRoZSB3b3JrLlxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBFeGVjdXRlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGVjdXRlcntcblxuXHQjZXhlY3V0aW9uO1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nLCBvYmplY3QpOiAqfSBvcHRpb24uZXhlY3V0aW9uIHJ1bnMgYSBzdGF0ZW1lbnQgb3ZlciBhIGNvbnRleHQgYW5kXG5cdCAqIGFuc3dlcnMgdGhlIHJlc3VsdCwgYSBwcm9taXNlIGluY2x1ZGVkLiBXaXRob3V0IG9uZSwgZXZlcnkgZXhlY3V0aW9uIHRocm93cy5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHtleGVjdXRpb259ID0ge30pe1xuXHRcdHRoaXMuI2V4ZWN1dGlvbiA9IGV4ZWN1dGlvbiB8fCAoKCkgPT4ge3Rocm93IG5ldyBFcnJvcihcIm5vdCBpbXBsZW1lbnRlZFwiKX0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYSBzdGF0ZW1lbnQgb3ZlciBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50IHRoZSBzdGF0ZW1lbnQsIHdpdGhvdXQgZGVsaW1pdGVycyBhbmQgc2NvcGUgcHJlZml4XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhQ29udGV4dCB0aGUgY29udGV4dCBvZiB0aGUgcmVzb2x2ZXIgdGhlIHN0YXRlbWVudCBpcyBldmFsdWF0ZWQgb25cblx0ICogQHJldHVybnMgeyp9IHdoYXQgdGhlIGV4ZWN1dGlvbiBhbnN3ZXJzLCBhIHByb21pc2UgaW5jbHVkZWRcblx0ICovXG5cdGV4ZWN1dGUoYVN0YXRlbWVudCwgYUNvbnRleHQpe1xuXHRcdHJldHVybiB0aGlzLiNleGVjdXRpb24oYVN0YXRlbWVudCwgYUNvbnRleHQpO1xuXHR9XG59O1xuIiwiaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuL0V4ZWN1dGVyLmpzXCI7XG5cbmNvbnN0IEVYRUNVVEVSUyA9IG5ldyBNYXAoKTtcblxuLyoqXG4gKiBLZWVwcyBhbiBleGVjdXRlciB1bmRlciBhIG5hbWUsIHNvIGEgcmVzb2x2ZXIgY2FuIGJlIGdpdmVuIHRoZSBuYW1lIGluc3RlYWQgb2YgdGhlIGluc3RhbmNlIC1cbiAqIFNQRUNJRklDQVRJT04ubWQgOS4xLiBBbiBleGVjdXRlciBhbHJlYWR5IGtlcHQgdW5kZXIgdGhlIG5hbWUgaXMgcmVwbGFjZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFOYW1lXG4gKiBAcGFyYW0ge0V4ZWN1dGVyfSBhbkV4ZWN1dGVyXG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlciA9IChhTmFtZSwgYW5FeGVjdXRlcikgPT4ge1xuXHRFWEVDVVRFUlMuc2V0KGFOYW1lLCBhbkV4ZWN1dGVyKTtcbn07XG5cbi8qKlxuICogVGhlIGV4ZWN1dGVyIGtlcHQgdW5kZXIgYSBuYW1lIC0gU1BFQ0lGSUNBVElPTi5tZCA5LjEuIEFsc28gdGhlIGRlZmF1bHQgZXhwb3J0IG9mIHRoaXMgbW9kdWxlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhTmFtZVxuICogQHJldHVybnMge0V4ZWN1dGVyfVxuICogQHRocm93cyB7RXJyb3J9IHdoZXJlIG5vIGV4ZWN1dGVyIGlzIGtlcHQgdW5kZXIgdGhlIG5hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4ZWN1dGVyID0gKGFOYW1lKSA9PiB7XG5cdGNvbnN0IGV4ZWN1dGVyID0gRVhFQ1VURVJTLmdldChhTmFtZSk7XG5cdGlmICghZXhlY3V0ZXIpIHRocm93IG5ldyBFcnJvcihgRXhlY3V0ZXIgXCIke2FOYW1lfVwiIGlzIG5vdCByZWdpc3RlcmVkIWApO1xuXHRyZXR1cm4gZXhlY3V0ZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXRFeGVjdXRlcjtcbiIsImltcG9ydCBPYmplY3RVdGlscyBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvT2JqZWN0VXRpbHMuanNcIjtcbmltcG9ydCBEZWZhdWx0VmFsdWUgZnJvbSBcIi4vRGVmYXVsdFZhbHVlLmpzXCI7XG5pbXBvcnQgeyBnZXRFeGVjdXRlciB9IGZyb20gXCIuL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBEZWZhdWx0RXhlY3V0ZXIgZnJvbSBcIi4vZXhlY3V0ZXIvQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFJlc29sdmVyQ29udGV4dEhhbmRsZSBmcm9tIFwiLi9SZXNvbHZlckNvbnRleHRIYW5kbGUuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IHsgc2NhbiwgcGFyc2VFeHByZXNzaW9uIH0gZnJvbSBcIi4vRXhwcmVzc2lvblNjYW5uZXIuanNcIjtcbmltcG9ydCB7IGlzTmFtZUNoYXJhY3RlciwgdHJpbVRvTnVsbCB9IGZyb20gXCIuL1V0aWxzLmpzXCI7XG5cbi8qKiBAdHlwZSB7RXhlY3V0ZXJ9ICovXG5sZXQgREVGQVVMVF9FWEVDVVRFUiA9IERlZmF1bHRFeGVjdXRlcjtcblxuY29uc3QgREVGQVVMVF9OT1RfREVGSU5FRCA9IG5ldyBEZWZhdWx0VmFsdWUoKTtcbmNvbnN0IHRvRGVmYXVsdFZhbHVlID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSkgcmV0dXJuIHZhbHVlO1xuXG5cdHJldHVybiBuZXcgRGVmYXVsdFZhbHVlKHZhbHVlKTtcbn07XG5cbmxldCBOQU1FX0NPVU5URVIgPSAwO1xuLyoqXG4gKiBUaGUgbmFtZSBhIHJlc29sdmVyIGNhcnJpZXMgd2hlcmUgdGhlIGNhbGxlciBwYXNzZWQgbm9uZS4gT25seSB1bmlxdWVuZXNzIGlzIHByb21pc2VkLCB0aGUgc2hhcGVcbiAqIGlzIG5vdCAtIFNQRUNJRklDQVRJT04ubWQgNS4xLlxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdlbmVyYXRlTmFtZSA9ICgpID0+IGBFUiR7KytOQU1FX0NPVU5URVJ9YDtcblxuLyoqXG4gKiBUaGUgbmFtZSBhIHJlc29sdmVyIGtlZXBzOiB0aGUgb25lIHBhc3NlZCwgdHJpbW1lZCBhbmQgaGVsZCB0byB0aGUgcnVsZSBvZiAzLjMsIG9yIGEgZ2VuZXJhdGVkIG9uZVxuICogd2hlcmUgbm9uZSB3YXMgcGFzc2VkIC0gU1BFQ0lGSUNBVElPTi5tZCA1LjEuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfSBhTmFtZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIG5hbWUgaXMgbm8gc3RyaW5nLCBlbXB0eSwgb3IgY2FycmllcyBhIGNoYXJhY3RlciAzLjMgZG9lcyBub3QgYWxsb3dcbiAqL1xuY29uc3QgdG9OYW1lID0gKGFOYW1lKSA9PiB7XG5cdGlmIChhTmFtZSA9PSBudWxsKSByZXR1cm4gZ2VuZXJhdGVOYW1lKCk7XG5cdGlmICh0eXBlb2YgYU5hbWUgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBvcHRpb24gbmFtZSB0YWtlcyBhIHN0cmluZywgbm90IGEgJHt0eXBlb2YgYU5hbWV9IWApO1xuXG5cdGNvbnN0IG5hbWUgPSB0cmltVG9OdWxsKGFOYW1lKTtcblx0aWYgKG5hbWUgPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBvcHRpb24gbmFtZSB0YWtlcyBhIG5hbWUsIG5vdCBhbiBlbXB0eSBzdHJpbmchXCIpO1xuXHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbmFtZS5sZW5ndGg7IGluZGV4KyspXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIobmFtZS5jaGFyQ29kZUF0KGluZGV4KSkpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBuYW1lIFwiJHtuYW1lfVwiIGNhcnJpZXMgYSBjaGFyYWN0ZXIgYSBzY29wZSBuYW1lIGNhbm5vdCBjYXJyeSAoU1BFQ0lGSUNBVElPTi5tZCAzLjMpIWApO1xuXG5cdHJldHVybiBuYW1lO1xufTtcblxuLyoqXG4gKiBUaGUgc2NvcGUgbmFtZSBhIGZpbHRlciBvZiB0aGUgZGF0YSBtZXRob2RzIHNlbGVjdHMsIHJlYWQgbGlrZSBhIHNjb3BlIHByZWZpeDogdHJpbW1lZCwgYW5kIG51bGxcbiAqIHdoZXJlIHRoZXJlIGlzIG5vbmUgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cbiAqXG4gKiBAcGFyYW0gez9zdHJpbmd9IGFGaWx0ZXJcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgZmlsdGVyIGlzIG5vIHN0cmluZ1xuICovXG5jb25zdCB0b1Njb3BlID0gKGFGaWx0ZXIpID0+IHtcblx0aWYgKGFGaWx0ZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cdGlmICh0eXBlb2YgYUZpbHRlciAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgQSBmaWx0ZXIgaXMgYSBzY29wZSBuYW1lLCBub3QgYSAke3R5cGVvZiBhRmlsdGVyfSFgKTtcblxuXHRyZXR1cm4gdHJpbVRvTnVsbChhRmlsdGVyKTtcbn07XG5cbi8qKlxuICogVGhlIHByb3BlcnR5IGtleSBhIGRhdGEgbWV0aG9kIHdvcmtzIHdpdGggLSBhIHN0cmluZywgXCJcIiBpbmNsdWRlZCwgYSBzeW1ib2wsIG9yIGEgbnVtYmVyLCB3aGljaFxuICogbmFtZXMgdGhlIHNhbWUgcHJvcGVydHkgYXMgaXRzIHN0cmluZyBhbmQgaXMgbG9va2VkIHVwIGFzIG9uZSAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxzeW1ib2x9IGFLZXlcbiAqIEByZXR1cm5zIHtzdHJpbmd8c3ltYm9sfVxuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUga2V5IGlzIG5vbmUsIG9yIG9mIGEgdHlwZSBubyBwcm9wZXJ0eSBrZXkgaGFzXG4gKi9cbmNvbnN0IHRvS2V5ID0gKGFLZXkpID0+IHtcblx0Y29uc3QgdHlwZSA9IHR5cGVvZiBhS2V5O1xuXHRpZiAodHlwZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlID09PSBcInN5bWJvbFwiKSByZXR1cm4gYUtleTtcblx0aWYgKHR5cGUgPT09IFwibnVtYmVyXCIpIHJldHVybiBTdHJpbmcoYUtleSk7XG5cblx0dGhyb3cgbmV3IFR5cGVFcnJvcihgQSBrZXkgaXMgYSBzdHJpbmcsIGEgbnVtYmVyIG9yIGEgc3ltYm9sLCBub3QgJHthS2V5ID09IG51bGwgPyBcIm1pc3NpbmdcIiA6IGBhICR7dHlwZX1gfSFgKTtcbn07XG5cbmNvbnN0IGV4ZWN1dGUgPSBhc3luYyBmdW5jdGlvbiAoYW5FeGVjdXRlciwgYVN0YXRlbWVudCwgYUNvbnRleHQpIHtcblx0Ly8gMy40OiBhbiBlbXB0eSBzdGF0ZW1lbnQgYW5zd2VycyB1bmRlZmluZWQsIHRoZSBzYW1lIGFzIGByZXR1cm47YCBpbiBKYXZhU2NyaXB0LiBUaGUgc2Nhbm5lclxuXHQvLyBoYW5kcyBldmVyeSBzdGF0ZW1lbnQgb3ZlciB0cmltbWVkLCBhbmQgYW4gZW1wdHkgb25lIGFzIG51bGwuXG5cdGlmIChhU3RhdGVtZW50ID09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG5cdGlmICh0eXBlb2YgYVN0YXRlbWVudCAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIGFTdGF0ZW1lbnQ7XG5cblx0Ly8gYW4gZXJyb3IgaXMgZGVsaWJlcmF0ZWx5IG5vdCBjYXVnaHQgaGVyZTogc2VjdGlvbiA3IGdpdmVzIHRoZSB0d28gZW50cnkgcG9pbnRzIGRpZmZlcmVudFxuXHQvLyBhbnN3ZXJzIHRvIGl0LCBzbyBlYWNoIG9mIHRoZW0gaGFuZGxlcyBpdCBmb3IgaXRzZWxmXG5cdHJldHVybiBhd2FpdCBhbkV4ZWN1dGVyLmV4ZWN1dGUoYVN0YXRlbWVudCwgYUNvbnRleHQpO1xufTtcblxuY29uc3Qgd2FybkZhaWxlZFN0YXRlbWVudCA9IChhU3RhdGVtZW50LCBhbkVycm9yKSA9PiB7XG5cdGNvbnNvbGUud2FybihgRXhlY3V0aW9uIGVycm9yIG9uIHN0YXRlbWVudCFcblx0XHRzdGF0ZW1lbnQ6XG5cdFx0JHthU3RhdGVtZW50fVxuXHRcdGVycm9yOlxuXHRcdCR7YW5FcnJvcn1cblx0XHRgKTtcbn07XG5cbmNvbnN0IHdpdGhEZWZhdWx0ID0gKGFSZXN1bHQsIGFEZWZhdWx0KSA9PiB7XG5cdGlmIChhUmVzdWx0ICE9PSBudWxsICYmIHR5cGVvZiBhUmVzdWx0ICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gYVJlc3VsdDtcblx0ZWxzZSBpZiAoYURlZmF1bHQgaW5zdGFuY2VvZiBEZWZhdWx0VmFsdWUgJiYgYURlZmF1bHQuaGFzVmFsdWUpIHJldHVybiBhRGVmYXVsdC52YWx1ZTtcblx0cmV0dXJuIGFSZXN1bHQ7XG59O1xuXG5jb25zdCByZXNvbHZlSW5TY29wZSA9IGFzeW5jIGZ1bmN0aW9uIChhbkV4ZWN1dGVyID0gREVGQVVMVF9FWEVDVVRFUiwgYVJlc29sdmVyLCBhU3RhdGVtZW50LCBhU2NvcGUsIGFEZWZhdWx0KSB7XG5cdC8vIDUuMzogY2xpbWJzIGluIGEgbG9vcCByYXRoZXIgdGhhbiBieSByZWN1cnNpb24gLSBvbmUgY2FsbCBwZXIgcmVzb2x2ZXIgY2xpbWJlZCBjb3N0IGEgcHJvbWlzZVxuXHQvLyBlYWNoIGFuZCBvdmVyZmxvd2VkIHRoZSBzdGFjayBvbiBhIGRlZXAgY2hhaW4uIEEgc2NvcGUgbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluIGNhcnJpZXNcblx0Ly8gYW5zd2VycyB1bmRlZmluZWQsIGFuZCB0aGUgZGVmYXVsdCBhcHBsaWVzIHRvIGl0IGxpa2UgdG8gYW55IG90aGVyIHJlc3VsdCAtIHNlZVxuXHQvLyBTUEVDSUZJQ0FUSU9OLm1kIDUuNFxuXHRpZiAoYVNjb3BlKVxuXHRcdHdoaWxlIChhUmVzb2x2ZXIubmFtZSAhPSBhU2NvcGUpIHtcblx0XHRcdGFSZXNvbHZlciA9IGFSZXNvbHZlci5wYXJlbnQ7XG5cdFx0XHRpZiAoIWFSZXNvbHZlcikgcmV0dXJuIHdpdGhEZWZhdWx0KHVuZGVmaW5lZCwgYURlZmF1bHQpO1xuXHRcdH1cblxuXHRyZXR1cm4gd2l0aERlZmF1bHQoYXdhaXQgZXhlY3V0ZShhbkV4ZWN1dGVyLCBhU3RhdGVtZW50LCBhUmVzb2x2ZXIuY29udGV4dCksIGFEZWZhdWx0KTtcbn07XG5cbi8vIDQuMTogdGhlIGZpcnN0IGFyZ3VtZW50IG9mIGEgc3RhdGljIGVudHJ5IHBvaW50IGlzIGEgc3RyaW5nLCBvciBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5jb25zdCBpc0NvbmZpZ3VyYXRpb24gPSAoYVZhbHVlKSA9PiBhVmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIGFWYWx1ZSA9PT0gXCJvYmplY3RcIjtcblxuLy8gNC4xOiBhIGNvbmZpZ3VyYXRpb24gY291bnRzIGFzIHBhc3NpbmcgYSBkZWZhdWx0IHdoZXJlIGl0IGNhcnJpZXMgdGhlIGtleSwgd2hhdGV2ZXIgaXQgaG9sZHNcbmNvbnN0IGRlZmF1bHRPZiA9IChhQ29uZmlndXJhdGlvbikgPT4gKFwiZGVmYXVsdFZhbHVlXCIgaW4gYUNvbmZpZ3VyYXRpb24gPyBhQ29uZmlndXJhdGlvbi5kZWZhdWx0VmFsdWUgOiBERUZBVUxUX05PVF9ERUZJTkVEKTtcblxuLyoqXG4gKiBSZXNvbHZlcyBgJHsuLi59YCBleHByZXNzaW9ucyBhZ2FpbnN0IGEgY29udGV4dC4gQSByZXNvbHZlciBtYXkgaGF2ZSBhIHBhcmVudCwgYW5kIHRoZSByZXNvbHZlcnNcbiAqIGZyb20gaXQgdXAgdG8gdGhlIHJvb3QgZm9ybSBhIGNoYWluOiBhIG5hbWUgaXMgbG9va2VkIHVwIGZyb20gdGhpcyByZXNvbHZlciB0b3dhcmRzIHRoZSByb290LCBhbmRcbiAqIGEgc2NvcGUgcHJlZml4IGAke25hbWU6OnN0YXRlbWVudH1gIGFkZHJlc3NlcyBvbmUgcmVzb2x2ZXIgb2YgdGhlIGNoYWluIC0gU1BFQ0lGSUNBVElPTi5tZCAyLCA1LlxuICpcbiAqIFVzZWQgc3RhdGljYWxseSB3aXRoIGFuIGFkLWhvYyBjb250ZXh0IChgcmVzb2x2ZWAsIGByZXNvbHZlVGV4dGApLCBvciBhcyBhbiBpbnN0YW5jZSB3aXRoaW4gYVxuICogY2hhaW4uXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEV4cHJlc3Npb25SZXNvbHZlclxuICogQHR5cGVkZWYge0V4cHJlc3Npb25SZXNvbHZlcn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyIHtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGV4ZWN1dGVyIGEgcmVzb2x2ZXIgd2l0aG91dCBhIHBhcmVudCB0YWtlcyB3aGVyZSB0aGUgYGV4ZWN1dGVyYCBvcHRpb24gaXMgbGVmdCBvdXQsXG5cdCAqIGFuZCBzbyB0aGUgZXhlY3V0ZXIgb2YgdGhlIHN0YXRpYyBlbnRyeSBwb2ludHMgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8RXhlY3V0ZXJ9IGFuRXhlY3V0ZXIgYSByZWdpc3RlcmVkIG5hbWUgb3IgYW4gYEV4ZWN1dGVyYCBpbnN0YW5jZVxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgYSBuYW1lIGlzIG5vdCByZWdpc3RlcmVkXG5cdCAqL1xuXHRzdGF0aWMgc2V0IGRlZmF1bHRFeGVjdXRlcihhbkV4ZWN1dGVyKSB7XG5cdFx0aWYgKCBhbkV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpIERFRkFVTFRfRVhFQ1VURVIgPSBhbkV4ZWN1dGVyO1xuXHRcdGVsc2UgREVGQVVMVF9FWEVDVVRFUiA9IGdldEV4ZWN1dGVyKGFuRXhlY3V0ZXIpO1xuXHRcdGNvbnNvbGUuaW5mbyhgQ2hhbmdlZCBkZWZhdWx0IGV4ZWN1dGVyIGZvciBFeHByZXNzaW9uUmVzb2x2ZXIhYCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGV4ZWN1dGVyIGEgcmVzb2x2ZXIgd2l0aG91dCBhIHBhcmVudCB0YWtlcyB3aGVyZSB0aGUgYGV4ZWN1dGVyYCBvcHRpb24gaXMgbGVmdCBvdXQ7XG5cdCAqIGBjb250ZXh0LWRlY29uc3RydWN0aW9uLWV4ZWN1dGVyYCB1bnRpbCBpdCBpcyBzZXQgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMi5cblx0ICpcblx0ICogQHR5cGUge0V4ZWN1dGVyfVxuXHQgKi9cblx0c3RhdGljIGdldCBkZWZhdWx0RXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRVhFQ1VURVI7XG5cdH1cblxuXHQvKiogQHR5cGUge3N0cmluZ3xudWxsfSAqL1xuXHQjbmFtZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge0V4ZWN1dGVyfG51bGx9ICovXG5cdCNleGVjdXRlciA9IG51bGw7XG5cdC8qKiBAdHlwZSB7b2JqZWN0fG51bGx9ICovXG5cdCNjb250ZXh0ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH0gKi9cblx0I2NvbnRleHRIYW5kbGUgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuY29udGV4dF0gYW55IG9iamVjdDsgd2hlcmUgbm9uZSBpcyBwYXNzZWQgLSBsZWZ0IG91dCwgbnVsbCBvclxuXHQgKiB1bmRlZmluZWQgLSB0aGUgcmVzb2x2ZXIgaGFzIG5vIGNvbnRleHQgb2YgaXRzIG93biAtIDQuMiwgNi4zXG5cdCAqIEBwYXJhbSB7RXhwcmVzc2lvblJlc29sdmVyfSBbb3B0aW9ucy5wYXJlbnQ9bnVsbF1cblx0ICogQHBhcmFtIHs/c3RyaW5nfSBbb3B0aW9ucy5uYW1lPW51bGxdIGtlcHQgdHJpbW1lZDsgd2hlcmUgbm9uZSBpcyBwYXNzZWQsIG9uZSBpcyBnZW5lcmF0ZWQgLSA1LjFcblx0ICogQHBhcmFtIHsoc3RyaW5nfEV4ZWN1dGVyKX0gW29wdGlvbnMuZXhlY3V0ZXJdIHRoZSByZWdpc3RlcmVkIG5hbWUgb2YgYW4gZXhlY3V0ZXIsIG9yIGFuXG5cdCAqIGBFeGVjdXRlcmAgaW5zdGFuY2UuIEEgbmFtZSB0aGF0IGlzIG5vdCByZWdpc3RlcmVkIHRocm93czsgYW4gaW5zdGFuY2UgbmVlZHMgbm8gcmVnaXN0cmF0aW9uLFxuXHQgKiBiZWNhdXNlIGl0IGFkZHJlc3NlcyB0aGUgZXhlY3V0ZXIgZGlyZWN0bHkuIEFueXRoaW5nIGVsc2UgY291bnRzIGFzIGxlZnQgb3V0LiBXaXRob3V0IHRoZVxuXHQgKiBvcHRpb24gdGhlIHJlc29sdmVyIHRha2VzIHRoZSBleGVjdXRlciBvZiBpdHMgcGFyZW50LCBhbmQgb25lIHdpdGhvdXQgYSBwYXJlbnRcblx0ICogYEV4cHJlc3Npb25SZXNvbHZlci5kZWZhdWx0RXhlY3V0ZXJgIC0gNC4yLlxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBwYXJlbnQgaXMgbm8gcmVzb2x2ZXIsIHRoZSBjb250ZXh0IGEgcHJpbWl0aXZlLCBvciB0aGUgbmFtZSBicmVha3Ncblx0ICogdGhlIHJ1bGUgb2YgNS4xIC0gNC4yXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSB0aGUgZXhlY3V0ZXIgaXMgbmFtZWQgYW5kIHRoZSBuYW1lIGlzIG5vdCByZWdpc3RlcmVkXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih7IGNvbnRleHQsIHBhcmVudCA9IG51bGwsIG5hbWUgPSBudWxsLCBleGVjdXRlciB9ID0ge30pIHtcblx0XHRpZiAocGFyZW50ICE9IG51bGwgJiYgIShwYXJlbnQgaW5zdGFuY2VvZiBFeHByZXNzaW9uUmVzb2x2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVGhlIG9wdGlvbiBwYXJlbnQgdGFrZXMgYW4gRXhwcmVzc2lvblJlc29sdmVyIVwiKTtcblx0XHRpZiAoY29udGV4dCAhPSBudWxsICYmIHR5cGVvZiBjb250ZXh0ICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBjb250ZXh0ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBvcHRpb24gY29udGV4dCB0YWtlcyBhbiBvYmplY3QsIG5vdCBhICR7dHlwZW9mIGNvbnRleHR9IWApO1xuXHRcdHRoaXMuI25hbWUgPSB0b05hbWUobmFtZSk7XG5cblx0XHRpZihleGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSB0aGlzLiNleGVjdXRlciA9ICBleGVjdXRlcjtcblx0XHRlbHNlIGlmICh0eXBlb2YgZXhlY3V0ZXIgPT09IFwic3RyaW5nXCIpIHRoaXMuI2V4ZWN1dGVyID0gZ2V0RXhlY3V0ZXIoZXhlY3V0ZXIpO1xuXHRcdGVsc2UgaWYocGFyZW50ICE9IG51bGwpIHRoaXMuI2V4ZWN1dGVyID0gcGFyZW50LmV4ZWN1dGVyO1xuXHRcdGVsc2UgdGhpcy4jZXhlY3V0ZXIgPSBFeHByZXNzaW9uUmVzb2x2ZXIuZGVmYXVsdEV4ZWN1dGVyO1xuXG5cdFx0dGhpcy4jcGFyZW50ID0gcGFyZW50O1xuXHRcdHRoaXMuI2NvbnRleHRIYW5kbGUgPSBuZXcgUmVzb2x2ZXJDb250ZXh0SGFuZGxlKGNvbnRleHQgLCB0aGlzLiNwYXJlbnQgPyB0aGlzLiNwYXJlbnQuY29udGV4dEhhbmRsZSA6IG51bGwpO1xuXHRcdHRoaXMuI2NvbnRleHQgPSB0aGlzLiNjb250ZXh0SGFuZGxlLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5hbWUgdGhpcyByZXNvbHZlciBpcyBhZGRyZXNzZWQgYnkgaW4gYSBzY29wZSBwcmVmaXggYW5kIGEgZmlsdGVyIC0gNS4xLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdGdldCBuYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLiNuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9XG5cdCAqL1xuXHRnZXQgcGFyZW50KCkge1xuXHRcdHJldHVybiB0aGlzLiNwYXJlbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbnRleHQgb2YgdGhpcyByZXNvbHZlciBhcyBhbiBleHByZXNzaW9uIHNlZXMgaXQuIEl0IGlzIG5vdCB0aGUgb2JqZWN0IHBhc3NlZCB0byB0aGVcblx0ICogY29uc3RydWN0b3IgYW5kIGl0IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbiAtIDYuMS4gT3ZlciB0aGUgZ2xvYmFsIG9iamVjdCBpdCBpcyB0aGUgZ2xvYmFsXG5cdCAqIG9iamVjdCBpdHNlbGYgLSA2LjQuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0IGNvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGV4ZWN1dGVyIGluIHVzZSwgY2hvc2VuIG9uY2UgaW4gdGhlIGNvbnN0cnVjdG9yIC0gNC4yLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge0V4ZWN1dGVyfVxuXHQgKi9cblx0Z2V0IGV4ZWN1dGVyKCkge1xuXHRcdHJldHVybiB0aGlzLiNleGVjdXRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW50ZXJuYWwgaGFuZGxlIGJlaGluZCB0aGUgY29udGV4dC4gUHVibGljIG9ubHkgZm9yIGByZXNldENhY2hlYCAoNi4yKSwgYW5kIG9ubHkgdW50aWwgdGhlXG5cdCAqIG5hbWUgY2FjaGUgaXMgbWVhc3VyZWQgLSBERUNJU0lPTlMubWQsIDIwMjYtMDktMzAuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfVxuXHQgKi9cblx0Z2V0IGNvbnRleHRIYW5kbGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHRIYW5kbGU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5hbWVzIG9mIGV2ZXJ5IHJlc29sdmVyIGZyb20gdGhlIHJvb3QgZG93biB0byB0aGlzIG9uZSwgYXMgYSBwYXRoIC0gYC9yb290L+KApi90aGlzYC4gSXRcblx0ICogZGVzY3JpYmVzIHRoZSBzdHJ1Y3R1cmUgYW5kIGRvZXMgbm90IGNoYW5nZSAtIFNQRUNJRklDQVRJT04ubWQgNS41LlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdGdldCBjaGFpbigpIHtcblx0XHQvLyBhIGxvb3AsIG5vdCBhIHJlY3Vyc2lvbiBpbnRvIHRoZSBwYXJlbnQ6IGEgZGVlcCBjaGFpbiBvdmVyZmxvd2VkIHRoZSBzdGFja1xuXHRcdGxldCBwYXRoID0gXCJcIjtcblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0cGF0aCA9IGAvJHtyZXNvbHZlci5uYW1lfSR7cGF0aH1gO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5hbWVzIG9mIHRoZSByZXNvbHZlcnMgZnJvbSB0aGUgcm9vdCBkb3duIHRvIHRoaXMgb25lIHRoYXQgcHJvdmlkZSBhIGNvbnRleHQsIGFzIGEgcGF0aFxuXHQgKiBsaWtlIGBjaGFpbmAuIEEgcmVzb2x2ZXIgYnVpbHQgd2l0aG91dCBhIGNvbnRleHQgam9pbnMgaXQgdGhlIG1vbWVudCBhIHZhbHVlIGlzIHNldCBvbiBpdCwgc29cblx0ICogdGhpcyBkZXNjcmliZXMgYSBzdGF0ZSBhbmQgbm90IHRoZSBzdHJ1Y3R1cmUgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS4gV2hlcmUgbm9uZSBwcm92aWRlcyBvbmUsXG5cdCAqIHRoZSBhbnN3ZXIgaXMgdGhlIGVtcHR5IHN0cmluZy5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHRnZXQgZWZmZWN0aXZlQ2hhaW4oKSB7XG5cdFx0Ly8gYSBsb29wLCBub3QgYSByZWN1cnNpb24gaW50byB0aGUgcGFyZW50OiBhIGRlZXAgY2hhaW4gb3ZlcmZsb3dlZCB0aGUgc3RhY2tcblx0XHRsZXQgcGF0aCA9IFwiXCI7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLnByb3ZpZGVzQ29udGV4dCkgcGF0aCA9IGAvJHtyZXNvbHZlci5uYW1lfSR7cGF0aH1gO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbnRleHRzIG9mIGV4YWN0bHkgdGhlIHJlc29sdmVycyBgZWZmZWN0aXZlQ2hhaW5gIG5hbWVzLCBhcyBhbiBhcnJheSwgdGhpcyByZXNvbHZlcidzXG5cdCAqIGZpcnN0IGFuZCB0aGUgcm9vdCdzIGxhc3QuIEEgc3RhdGUgbGlrZSBgZWZmZWN0aXZlQ2hhaW5gIC0gU1BFQ0lGSUNBVElPTi5tZCA1LjUuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7QXJyYXk8b2JqZWN0Pn1cblx0ICovXG5cdGdldCBjb250ZXh0Q2hhaW4oKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLnByb3ZpZGVzQ29udGV4dCkgcmVzdWx0LnB1c2gocmVzb2x2ZXIuY29udGV4dCk7XG5cblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHJlc29sdmVyIGEgY2FsbCBhZGRyZXNzZXM6IHRoZSBvbmUgdGhlIGZpbHRlciBuYW1lcywgb3IgdGhlIHJlc29sdmVyIHRoZSBjYWxsIHdhcyBtYWRlIG9uXG5cdCAqIHdoZXJlIG5vIGZpbHRlciBpcyBnaXZlbi5cblx0ICpcblx0ICogQSBmaWx0ZXIgc2VsZWN0cyBleGFjdGx5IG9uZSByZXNvbHZlciBieSB0aGUgcnVsZSBvZiA1LjMsIGFuZCBhIGZpbHRlciBtYXRjaGluZyBub25lIHRocm93cyAtXG5cdCAqIGEgd3JvbmcgbmFtZSBpbiBhbiBBUEkgY2FsbCBpcyBhIG1pc3Rha2UgaW4gdGhlIGNhbGxpbmcgY29kZSwgdW5saWtlIGEgc2NvcGUgcHJlZml4IGluc2lkZSBhblxuXHQgKiBleHByZXNzaW9uLCB3aGljaCBhbnN3ZXJzIHVuZGVmaW5lZCAoNS40KS4gU2VlIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGFTY29wZSB0aGUgZmlsdGVyIGFzIGB0b1Njb3BlYCByZWFkcyBpdFxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfVxuXHQgKi9cblx0I2ZpbmRSZXNvbHZlcihhU2NvcGUpIHtcblx0XHRpZiAoIWFTY29wZSkgcmV0dXJuIHRoaXM7XG5cblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0aWYgKHJlc29sdmVyLm5hbWUgPT09IGFTY29wZSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBGaWx0ZXIgXCIke2FTY29wZX1cIiBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpbiFgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmVhcmVzdCByZXNvbHZlciBmcm9tIGhlcmUgdG8gdGhlIHJvb3QgdGhhdCBjYXJyaWVzIHRoZSBrZXkgaXRzZWxmLCBvciBudWxsIHdoZXJlIG5vbmVcblx0ICogY2FycmllcyBpdC4gV2hhdCBkZWNpZGVzIGlzIHdoZXRoZXIgYSByZXNvbHZlciBwcm92aWRlcyB0aGUgbmFtZSwgbm90IHdoYXQgaXQgaG9sZHMgLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDUuMi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9XG5cdCAqL1xuXHQjcmVzb2x2ZXJGb3JLZXkoa2V5KSB7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLmhhc05hbWUoa2V5KSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYSB2YWx1ZSBhbG9uZyB0aGUgY2hhaW4gZnJvbSB0aGUgYWRkcmVzc2VkIHJlc29sdmVyIGJ5IHRoZSBydWxlIG9mIDUuMi4gV2l0aG91dCBhIGtleSAtXG5cdCAqIG51bGwgb3IgdW5kZWZpbmVkIC0gaXQgYW5zd2VycyB0aGUgd2hvbGUgY29udGV4dCBvZiB0aGF0IHJlc29sdmVyLCB3aGljaCBzdGlsbCBzZWVzIHRoZSBjaGFpbiBvblxuXHQgKiBldmVyeSBhY2Nlc3MgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuMSwgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0gez8oc3RyaW5nfG51bWJlcnxzeW1ib2wpfSBba2V5XSBhIHByb3BlcnR5IGtleTsgYSBudW1iZXIgaXMgbG9va2VkIHVwIGFzIGl0cyBzdHJpbmdcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBbZmlsdGVyXSB0aGUgc2NvcGUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgdGhlIGNhbGwgYWRkcmVzc2VzOyB3aXRob3V0IG9uZSwgdGhpc1xuXHQgKiByZXNvbHZlclxuXHQgKiBAcmV0dXJucyB7Kn0gdGhlIHZhbHVlLCBvciB0aGUgd2hvbGUgY29udGV4dCB3aXRob3V0IGEga2V5XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGtleSBpcyBvZiBhIHR5cGUgbm8gcHJvcGVydHkga2V5IGhhcywgb3IgdGhlIGZpbHRlciBubyBzdHJpbmdcblx0ICogQHRocm93cyB7RXJyb3J9IHdoZXJlIHRoZSBmaWx0ZXIgbWF0Y2hlcyBubyByZXNvbHZlciBvZiB0aGUgY2hhaW5cblx0ICovXG5cdGdldERhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcih0b1Njb3BlKGZpbHRlcikpO1xuXHRcdGlmIChrZXkgPT0gbnVsbCkgcmV0dXJuIHJlc29sdmVyLmNvbnRleHQ7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIuY29udGV4dFt0b0tleShrZXkpXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGEgdmFsdWUsIGluIHRoZSBvYmplY3QgdGhlIGNhbGxlciBoYW5kZWQgb3Zlci4gV2l0aG91dCBhIGZpbHRlciB0aGUgdmFsdWUgaXMgY2hhbmdlZCB3aGVyZVxuXHQgKiB0aGUga2V5IGxpdmVzLCBjb3VudGluZyBmcm9tIGhlcmUgdG93YXJkcyB0aGUgcm9vdCwgYW5kIGNyZWF0ZWQgaGVyZSB3aGVyZSBubyByZXNvbHZlciBjYXJyaWVzXG5cdCAqIGl0LiBXaXRoIGEgZmlsdGVyIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIgaXMgdGhlIHRhcmdldCBvdXRyaWdodCAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8c3ltYm9sfSBrZXkgYSBwcm9wZXJ0eSBrZXk7IGEgbnVtYmVyIGlzIGxvb2tlZCB1cCBhcyBpdHMgc3RyaW5nXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWVcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBbZmlsdGVyXSB0aGUgc2NvcGUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgdGhlIGNhbGwgYWRkcmVzc2VzXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGtleSBpcyBtaXNzaW5nIG9yIG9mIGEgdHlwZSBubyBwcm9wZXJ0eSBrZXkgaGFzLCB0aGUgZmlsdGVyIG5vXG5cdCAqIHN0cmluZywgb3IgdGhlIG9iamVjdCByZWZ1c2VzIHRoZSB3cml0ZVxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgdGhlIGZpbHRlciBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpblxuXHQgKi9cblx0dXBkYXRlRGF0YShrZXksIHZhbHVlLCBmaWx0ZXIpIHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHRvS2V5KGtleSk7XG5cdFx0Y29uc3Qgc2NvcGUgPSB0b1Njb3BlKGZpbHRlcik7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoc2NvcGUpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2NvcGUgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KHByb3BlcnR5KSB8fCB0aGlzO1xuXHRcdHRhcmdldC5jb250ZXh0W3Byb3BlcnR5XSA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIGtleSBmcm9tIG9uZSByZXNvbHZlciAtIHRoZSBhZGRyZXNzZWQgb25lIHdpdGggYSBmaWx0ZXIsIGFuZCB3aXRob3V0IG9uZSB0aGUgZmlyc3Rcblx0ICogcmVzb2x2ZXIgY2FycnlpbmcgaXQsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LiBSZW1vdmluZyBpdCB1bmNvdmVycyB0aGUgdmFsdWUgb2Zcblx0ICogdGhlIG5leHQgcmVzb2x2ZXIgdGhhdCBjYXJyaWVzIHRoZSBzYW1lIGtleSAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8c3ltYm9sfSBrZXkgYSBwcm9wZXJ0eSBrZXk7IGEgbnVtYmVyIGlzIGxvb2tlZCB1cCBhcyBpdHMgc3RyaW5nXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gW2ZpbHRlcl0gdGhlIHNjb3BlIG5hbWUgb2YgdGhlIHJlc29sdmVyIHRoZSBjYWxsIGFkZHJlc3Nlc1xuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBrZXkgaXMgbWlzc2luZyBvciBvZiBhIHR5cGUgbm8gcHJvcGVydHkga2V5IGhhcywgdGhlIGZpbHRlciBub1xuXHQgKiBzdHJpbmcsIG9yIHRoZSBvYmplY3QgcmVmdXNlcyB0aGUgZGVsZXRpb25cblx0ICogQHRocm93cyB7RXJyb3J9IHdoZXJlIHRoZSBmaWx0ZXIgbWF0Y2hlcyBubyByZXNvbHZlciBvZiB0aGUgY2hhaW5cblx0ICovXG5cdGRlbGV0ZURhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHRvS2V5KGtleSk7XG5cdFx0Y29uc3Qgc2NvcGUgPSB0b1Njb3BlKGZpbHRlcik7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoc2NvcGUpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2NvcGUgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KHByb3BlcnR5KTtcblx0XHRpZiAodGFyZ2V0KSBkZWxldGUgdGFyZ2V0LmNvbnRleHRbcHJvcGVydHldO1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2hhbGxvdyBhc3NpZ25tZW50LCBrZXkgYnkga2V5LCBpbnRvIHRoZSBjb250ZXh0IG9mIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIsIHJlcGxhY2luZyB3aGF0IGlzXG5cdCAqIHRoZXJlIGFuZCBhZGRpbmcgd2hhdCBpcyBub3QuIE5vIHNlYXJjaCBhbG9uZyB0aGUgY2hhaW46IGEgbWVyZ2VkIGtleSBzaGFkb3dzIHRoZSByZXNvbHZlcnNcblx0ICogYWJvdmUgZnJvbSBoZXJlIG9uIC0gU1BFQ0lGSUNBVElPTi5tZCA2LjYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7P29iamVjdH0gY29udGV4dCB0aGUga2V5cyB0byBhc3NpZ247IG51bGwgb3IgdW5kZWZpbmVkIGNoYW5nZXMgbm90aGluZ1xuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtmaWx0ZXJdIHRoZSBzY29wZSBuYW1lIG9mIHRoZSByZXNvbHZlciB0aGUgY2FsbCBhZGRyZXNzZXNcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgY29udGV4dCBpcyBhIHByaW1pdGl2ZSwgdGhlIGZpbHRlciBubyBzdHJpbmcsIG9yIHRoZSBvYmplY3Rcblx0ICogcmVmdXNlcyBhIGtleSAtIHRoZSBrZXlzIGJlZm9yZSBpdCBhcmUgd3JpdHRlbiBieSB0aGVuXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSB0aGUgZmlsdGVyIG1hdGNoZXMgbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluXG5cdCAqL1xuXHRtZXJnZUNvbnRleHQoY29udGV4dCwgZmlsdGVyKSB7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIodG9TY29wZShmaWx0ZXIpKTtcblx0XHRpZiAoY29udGV4dCA9PSBudWxsKSByZXR1cm47XG5cdFx0aWYgKHR5cGVvZiBjb250ZXh0ICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBjb250ZXh0ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoYG1lcmdlQ29udGV4dCB0YWtlcyBhbiBvYmplY3QsIG5vdCBhICR7dHlwZW9mIGNvbnRleHR9IWApO1xuXG5cdFx0cmVzb2x2ZXIuY29udGV4dEhhbmRsZS5tZXJnZURhdGEoY29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgb25lIGV4cHJlc3Npb24gdG8gaXRzIHZhbHVlLCBvZiB3aGF0ZXZlciB0eXBlIHRoZSBzdGF0ZW1lbnQgYW5zd2Vycy4gVGFrZXMgdGhlXG5cdCAqIGRlbGltaXRlZCBmb3JtIGAkey4uLn1gLCBhIHNjb3BlIHByZWZpeCBpbmNsdWRlZCwgb3IgYSBiYXJlIHN0YXRlbWVudCAtIFNQRUNJRklDQVRJT04ubWQgNC4yLFxuXHQgKiA0LjMuIEFuIGVycm9yIG9mIHRoZSBzdGF0ZW1lbnQgaXMgbG9nZ2VkIGFuZCBoYW5kZWQgb24sIGFuZCB0aGUgZGVmYXVsdCBuZXZlciBjb3ZlcnMgaXQgLSA3LlxuXHQgKlxuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFFeHByZXNzaW9uXG5cdCAqIEBwYXJhbSB7Kn0gW2FEZWZhdWx0XSByZXBsYWNlcyBhIHJlc3VsdCBvZiBudWxsIG9yIHVuZGVmaW5lZCB3aGVyZSBpdCBpcyBwYXNzZWQsIHVuZGVmaW5lZFxuXHQgKiBpbmNsdWRlZCAtIDQuNFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgZXhwcmVzc2lvbiBpcyBubyBzdHJpbmdcblx0ICogQHRocm93cyB7U3ludGF4RXJyb3J9IHdoZXJlIHRoZSBpbnB1dCBvcGVucyB3aXRoIFwiJHtcIiBhbmQgZG9lcyBub3QgZW5kIHdpdGggXCJ9XCJcblx0ICovXG5cdGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFEZWZhdWx0KSB7XG5cdFx0Ly8gNC4yOiBhIG1pc3Rha2UgaW4gdGhlIGNhbGxpbmcgY29kZSwgbm90IGEgZmFpbGVkIHN0YXRlbWVudCAtIHNvIG5vIHdhcm5pbmcgYW5kIG5vIGRlZmF1bHRcblx0XHRpZiAodHlwZW9mIGFFeHByZXNzaW9uICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGByZXNvbHZlIHRha2VzIGFuIGV4cHJlc3Npb24gYXMgYSBzdHJpbmcsIG5vdCBhICR7dHlwZW9mIGFFeHByZXNzaW9ufSFgKTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdHRyeSB7XG5cdFx0XHQvLyA0LjM6IHRoZSBkZWxpbWl0ZWQgZm9ybSBvciBhIGJhcmUgc3RhdGVtZW50LCB0b2xkIGFwYXJ0IGJ5IHRoZSBzY2FubmVyXG5cdFx0XHRjb25zdCB7IHNjb3BlLCBzdGF0ZW1lbnQgfSA9IHBhcnNlRXhwcmVzc2lvbihhRXhwcmVzc2lvbik7XG5cdFx0XHRyZXR1cm4gYXdhaXQgcmVzb2x2ZUluU2NvcGUodGhpcy4jZXhlY3V0ZXIsIHRoaXMsIHN0YXRlbWVudCwgc2NvcGUsIGRlZmF1bHRWYWx1ZSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0Ly8gNzogdGhlIGVycm9yIGlzIGxvZ2dlZCBhbmQgaGFuZGVkIG9uLiByZXNvbHZlIGFuc3dlcnMgYSB2YWx1ZSBvciBzYXlzIHdoeSBpdCBjYW5ub3QsXG5cdFx0XHQvLyBhbmQgYSBkZWZhdWx0IHZhbHVlIGNvdmVycyBhIG1pc3NpbmcgcmVzdWx0LCBuZXZlciBhbiBlcnJvci5cblx0XHRcdHdhcm5GYWlsZWRTdGF0ZW1lbnQoYUV4cHJlc3Npb24sIGUpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZXMgZXZlcnkgZXhwcmVzc2lvbiBvZiBhIHRleHQgYnkgaXRzIHZhbHVlIGFuZCBhbnN3ZXJzIHRoZSB0ZXh0IC0gU1BFQ0lGSUNBVElPTi5tZCA0LjIsXG5cdCAqIDQuMy4gQW4gZXhwcmVzc2lvbiB3aG9zZSBzdGF0ZW1lbnQgZmFpbHMgc3RhbmRzIGFzIHdyaXR0ZW4sIGEgd2FybmluZyBuYW1lcyBpdCwgYW5kIHRoZSByZXN0IG9mXG5cdCAqIHRoZSB0ZXh0IGtlZXBzIHJlbmRlcmluZyAtIDcuXG5cdCAqXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcblx0ICogQHBhcmFtIHsqfSBbYURlZmF1bHRdIHJlcGxhY2VzIGEgcmVzdWx0IG9mIG51bGwgb3IgdW5kZWZpbmVkLCBwZXIgZXhwcmVzc2lvbiwgd2hlcmUgaXQgaXNcblx0ICogcGFzc2VkIC0gNC40XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHRleHQgaXMgbm8gc3RyaW5nXG5cdCAqL1xuXHRhc3luYyByZXNvbHZlVGV4dChhVGV4dCwgYURlZmF1bHQpIHtcblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGByZXNvbHZlVGV4dCB0YWtlcyBhIHRleHQgYXMgYSBzdHJpbmcsIG5vdCBhICR7dHlwZW9mIGFUZXh0fSFgKTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXG5cdFx0Y29uc3Qgb2NjdXJyZW5jZXMgPSBzY2FuKGFUZXh0KTtcblx0XHRpZiAoIW9jY3VycmVuY2VzKSByZXR1cm4gYVRleHQ7XG5cblx0XHRsZXQgdGV4dCA9IFwiXCI7XG5cdFx0bGV0IHBvc2l0aW9uID0gMDtcblx0XHRmb3IgKGNvbnN0IG9jY3VycmVuY2Ugb2Ygb2NjdXJyZW5jZXMpIHtcblx0XHRcdC8vIDMuMjogYW4gZXNjYXBpbmcgYmFja3NsYXNoIGlzIGNvbnN1bWVkLCBldmVyeXRoaW5nIGVsc2UgaW4gZnJvbnQgb2YgdGhlIGV4cHJlc3Npb25cblx0XHRcdC8vIHN0YW5kcyBhcyB3cml0dGVuXG5cdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhwb3NpdGlvbiwgb2NjdXJyZW5jZS5lc2NhcGVkID8gb2NjdXJyZW5jZS5zdGFydCAtIDEgOiBvY2N1cnJlbmNlLnN0YXJ0KTtcblx0XHRcdHBvc2l0aW9uID0gb2NjdXJyZW5jZS5lbmQ7XG5cblx0XHRcdGlmIChvY2N1cnJlbmNlLmVzY2FwZWQpIHtcblx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR0ZXh0ICs9IGF3YWl0IHJlc29sdmVJblNjb3BlKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBvY2N1cnJlbmNlLnN0YXRlbWVudCwgb2NjdXJyZW5jZS5zY29wZSwgZGVmYXVsdFZhbHVlKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdC8vIDc6IGFuIGV4cHJlc3Npb24gd2hvc2Ugc3RhdGVtZW50IGZhaWxlZCBzdGFuZHMgYXMgd3JpdHRlbiwgYW5kIHRoZSBkZWZhdWx0IHZhbHVlXG5cdFx0XHRcdFx0Ly8gZG9lcyBub3QgY292ZXIgaXQuIFRoZSByZXN0IG9mIHRoZSB0ZXh0IGtlZXBzIHJlbmRlcmluZy5cblx0XHRcdFx0XHR3YXJuRmFpbGVkU3RhdGVtZW50KG9jY3VycmVuY2Uuc3RhdGVtZW50LCBlKTtcblx0XHRcdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhvY2N1cnJlbmNlLnN0YXJ0LCBvY2N1cnJlbmNlLmVuZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dCArIGFUZXh0LnN1YnN0cmluZyhwb3NpdGlvbik7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgb25lIGV4cHJlc3Npb24gYWdhaW5zdCBhbiBhZC1ob2MgY29udGV4dCwgdGhyb3VnaCBhIHJlc29sdmVyIG9mIGl0cyBvd24sIGFzIHRoZSBpbnN0YW5jZVxuXHQgKiBgcmVzb2x2ZWAgZG9lcyAtIFNQRUNJRklDQVRJT04ubWQgNC4xLCA0LjIuXG5cdCAqXG5cdCAqIFRha2VzIHRoZSBhcmd1bWVudHMgcG9zaXRpb25hbGx5LCBvciBvbmUgY29uZmlndXJhdGlvbiBvYmplY3Rcblx0ICogYHsgZXhwcmVzc2lvbiwgY29udGV4dCwgZGVmYXVsdFZhbHVlLCB0aW1lb3V0IH1gLCBiZWhpbmQgd2hpY2ggZXZlcnkgYXJndW1lbnQgaXMgaWdub3JlZCAtXG5cdCAqIFNQRUNJRklDQVRJT04ubWQgNC4xLiBBIGZpcnN0IGFyZ3VtZW50IHRoYXQgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gb2JqZWN0LCBhbmQgYVxuXHQgKiBjb25maWd1cmF0aW9uIHdpdGhvdXQgYSBzdHJpbmcgdW5kZXIgYGV4cHJlc3Npb25gLCByZWplY3Qgd2l0aCBhIGBUeXBlRXJyb3JgLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ3x7IGV4cHJlc3Npb246IHN0cmluZywgY29udGV4dD86IG9iamVjdCwgZGVmYXVsdFZhbHVlPzogKiwgdGltZW91dD86IG51bWJlciB9fSBhRXhwcmVzc2lvblxuXHQgKiBAcGFyYW0gez9vYmplY3R9IFthQ29udGV4dF1cblx0ICogQHBhcmFtIHsqfSBbYURlZmF1bHRdIHJlcGxhY2VzIGEgcmVzdWx0IG9mIG51bGwgb3IgdW5kZWZpbmVkIHdoZXJlIGl0IGlzIHBhc3NlZCAtIDQuNFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IFthVGltZW91dF0gZGVsYXlzIHRoZSBzdGFydCBieSB0aGF0IG1hbnkgbWlsbGlzZWNvbmRzOyBubyBkZWFkbGluZSAtIDQuNVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgYXJndW1lbnRzIHRha2UgbmVpdGhlciBmb3JtLCBvciB0aGUgY29udGV4dCBpcyBhIHByaW1pdGl2ZVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFDb250ZXh0LCBhRGVmYXVsdCwgYVRpbWVvdXQpIHtcblx0XHRpZiAoaXNDb25maWd1cmF0aW9uKGFyZ3VtZW50c1swXSkpIHtcblx0XHRcdGNvbnN0IHsgZXhwcmVzc2lvbiwgY29udGV4dCwgdGltZW91dCB9ID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0aWYgKHR5cGVvZiBleHByZXNzaW9uICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmUgdGFrZXMgYSBjb25maWd1cmF0aW9uIGNhcnJ5aW5nIHRoZSBleHByZXNzaW9uIGFzIGEgc3RyaW5nIHVuZGVyIHRoZSBrZXkgZXhwcmVzc2lvbiFcIik7XG5cdFx0XHRyZXR1cm4gRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmUoZXhwcmVzc2lvbiwgY29udGV4dCwgZGVmYXVsdE9mKGFyZ3VtZW50c1swXSksIHRpbWVvdXQpO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIGFFeHByZXNzaW9uICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmUgdGFrZXMgYSBzdHJpbmcgb3IgYSBjb25maWd1cmF0aW9uIG9iamVjdCFcIik7XG5cblx0XHRjb25zdCByZXNvbHZlciA9IG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0OiBhQ29udGV4dCB9KTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0aWYgKHR5cGVvZiBhVGltZW91dCA9PT0gXCJudW1iZXJcIiAmJiBhVGltZW91dCA+IDApXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNvbHZlci5yZXNvbHZlKGFFeHByZXNzaW9uLCBkZWZhdWx0VmFsdWUpKTtcblx0XHRcdFx0fSwgYVRpbWVvdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlcyBldmVyeSBleHByZXNzaW9uIG9mIGEgdGV4dCBhZ2FpbnN0IGFuIGFkLWhvYyBjb250ZXh0LCB0aHJvdWdoIGEgcmVzb2x2ZXIgb2YgaXRzIG93biwgYXNcblx0ICogdGhlIGluc3RhbmNlIGByZXNvbHZlVGV4dGAgZG9lcyAtIFNQRUNJRklDQVRJT04ubWQgNC4xLCA0LjIuXG5cdCAqXG5cdCAqIFRha2VzIHRoZSBhcmd1bWVudHMgcG9zaXRpb25hbGx5LCBvciBvbmUgY29uZmlndXJhdGlvbiBvYmplY3Rcblx0ICogYHsgdGV4dCwgY29udGV4dCwgZGVmYXVsdFZhbHVlLCB0aW1lb3V0IH1gLCBiZWhpbmQgd2hpY2ggZXZlcnkgYXJndW1lbnQgaXMgaWdub3JlZCAtXG5cdCAqIFNQRUNJRklDQVRJT04ubWQgNC4xLiBBIGZpcnN0IGFyZ3VtZW50IHRoYXQgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gb2JqZWN0LCBhbmQgYVxuXHQgKiBjb25maWd1cmF0aW9uIHdpdGhvdXQgYSBzdHJpbmcgdW5kZXIgYHRleHRgLCByZWplY3Qgd2l0aCBhIGBUeXBlRXJyb3JgLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ3x7IHRleHQ6IHN0cmluZywgY29udGV4dD86IG9iamVjdCwgZGVmYXVsdFZhbHVlPzogKiwgdGltZW91dD86IG51bWJlciB9fSBhVGV4dFxuXHQgKiBAcGFyYW0gez9vYmplY3R9IFthQ29udGV4dF1cblx0ICogQHBhcmFtIHsqfSBbYURlZmF1bHRdIHJlcGxhY2VzIGEgcmVzdWx0IG9mIG51bGwgb3IgdW5kZWZpbmVkLCBwZXIgZXhwcmVzc2lvbiwgd2hlcmUgaXQgaXNcblx0ICogcGFzc2VkIC0gNC40XG5cdCAqIEBwYXJhbSB7P251bWJlcn0gW2FUaW1lb3V0XSBkZWxheXMgdGhlIHN0YXJ0IGJ5IHRoYXQgbWFueSBtaWxsaXNlY29uZHM7IG5vIGRlYWRsaW5lIC0gNC41XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGFyZ3VtZW50cyB0YWtlIG5laXRoZXIgZm9ybSwgb3IgdGhlIGNvbnRleHQgaXMgYSBwcmltaXRpdmVcblx0ICovXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlVGV4dChhVGV4dCwgYUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCkge1x0XHRcblx0XHRpZiAoaXNDb25maWd1cmF0aW9uKGFyZ3VtZW50c1swXSkpIHtcblx0XHRcdGNvbnN0IHsgdGV4dCwgY29udGV4dCwgdGltZW91dCB9ID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0aWYgKHR5cGVvZiB0ZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmVUZXh0IHRha2VzIGEgY29uZmlndXJhdGlvbiBjYXJyeWluZyB0aGUgdGV4dCBhcyBhIHN0cmluZyB1bmRlciB0aGUga2V5IHRleHQhXCIpO1xuXHRcdFx0cmV0dXJuIEV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlVGV4dCh0ZXh0LCBjb250ZXh0LCBkZWZhdWx0T2YoYXJndW1lbnRzWzBdKSwgdGltZW91dCk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgYVRleHQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZVRleHQgdGFrZXMgYSBzdHJpbmcgb3IgYSBjb25maWd1cmF0aW9uIG9iamVjdCFcIik7XG5cblx0XHRjb25zdCByZXNvbHZlciA9IG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0OiBhQ29udGV4dCB9KTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0aWYgKHR5cGVvZiBhVGltZW91dCA9PT0gXCJudW1iZXJcIiAmJiBhVGltZW91dCA+IDApXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNvbHZlci5yZXNvbHZlVGV4dChhVGV4dCwgZGVmYXVsdFZhbHVlKSk7XG5cdFx0XHRcdH0sIGFUaW1lb3V0KTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLnJlc29sdmVUZXh0KGFUZXh0LCBkZWZhdWx0VmFsdWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyBhIHJlc29sdmVyIG92ZXIgYSBmaWx0ZXJlZCBjb3B5IG9mIHRoZSBjb250ZXh0IC0gU1BFQ0lGSUNBVElPTi5tZCA2LjcuXG5cdCAqXG5cdCAqIFRoZSBmaWx0ZXIgaXMgYXBwbGllZCB0byB0aGUgY29udGV4dCBvbmx5LCBuZXZlciB0byB0aGUgZ2xvYmFscywgc28gdGhpcyBpcyBhIHdheSB0byBoYW5kXG5cdCAqIG92ZXIgYSBjbGVhbmVkIGNvbnRleHQgYW5kIG5vdCBhIHNhbmRib3guXG5cdCAqXG5cdCAqIGBvcHRpb25gIGNhcnJpZXMgdGhlIGZpbHRlcidzIG93biBgZGVlcGAgdG9nZXRoZXIgd2l0aCB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBgbmFtZWAsXG5cdCAqIGBwYXJlbnRgIGFuZCBgZXhlY3V0ZXJgLCB3aGljaCBhcmUgaGFuZGVkIG9uIGFzIHRoZXkgYXJlLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhcmcgdGhlIGZpbHRlciBhcmd1bWVudHMsIHBsdXMgdGhlIHdob2xlIGNvbnN0cnVjdG9yIG9wdGlvbiBzZXRcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZy5jb250ZXh0IHRoZSBvYmplY3QgdG8gY29weTsgaXQgaXMgbGVmdCB1bnRvdWNoZWRcblx0ICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcsICosIG9iamVjdCk6IGJvb2xlYW59IGFyZy5wcm9wRmlsdGVyIGNhbGxlZCB3aXRoIG5hbWUsIHZhbHVlIGFuZCB0aGVcblx0ICogb2JqZWN0IGhvbGRpbmcgaXQgZm9yIGV2ZXJ5IGVudW1lcmFibGUgcHJvcGVydHksIGluaGVyaXRlZCBvbmVzIGluY2x1ZGVkOyBhIHByb3BlcnR5IGl0XG5cdCAqIGFuc3dlcnMgZmFsc2UgZm9yIGlzIGxlZnQgb3V0IG9mIHRoZSBjb3B5XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbYXJnLm9wdGlvbj17IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfV1cblx0ICogQHBhcmFtIHtib29sZWFufSBbYXJnLm9wdGlvbi5kZWVwPXRydWVdIGZpbHRlcnMgc3ViIG9iamVjdHMgYXMgd2VsbFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2FyZy5vcHRpb24ubmFtZT1udWxsXVxuXHQgKiBAcGFyYW0ge0V4cHJlc3Npb25SZXNvbHZlcn0gW2FyZy5vcHRpb24ucGFyZW50PW51bGxdXG5cdCAqIEBwYXJhbSB7KHN0cmluZ3xFeGVjdXRlcil9IFthcmcub3B0aW9uLmV4ZWN1dGVyPW51bGxdXG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgYSBjb25zdHJ1Y3RvciBvcHRpb24gaXMgb2YgdGhlIHdyb25nIGtpbmQsIGFzIHRoZSBjb25zdHJ1Y3RvciB0aHJvd3Ncblx0ICovXG5cdHN0YXRpYyBidWlsZEZpbHRlcmVkKHsgY29udGV4dCwgcHJvcEZpbHRlciwgb3B0aW9uID0geyBkZWVwOiB0cnVlLCBuYW1lOiBudWxsLCBwYXJlbnQ6IG51bGwsIGV4ZWN1dGVyOiBudWxsIH0gfSkge1xuXHRcdGNvbnN0IHsgZGVlcCA9IHRydWUsIG5hbWUsIHBhcmVudCwgZXhlY3V0ZXIgfSA9IG9wdGlvbjtcblx0XHRjb250ZXh0ID0gT2JqZWN0VXRpbHMuZmlsdGVyKGNvbnRleHQsIHByb3BGaWx0ZXIsIHtkZWVwfSk7XG5cdFx0cmV0dXJuIG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0LCBuYW1lLCBwYXJlbnQsIGV4ZWN1dGVyIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmb3JtZXIgbmFtZSBvZiBgYnVpbGRGaWx0ZXJlZGAsIGtlcHQgdW50aWwgNC4wLiBJdCBwcm9taXNlZCBhIHNlY3VyaXR5IHRoZSBtZXRob2QgZG9lcyBub3Rcblx0ICogZ2l2ZSAtIFNQRUNJRklDQVRJT04ubWQgNi43LlxuXHQgKlxuXHQgKiBAZGVwcmVjYXRlZCB1c2UgYGJ1aWxkRmlsdGVyZWRgXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZyB0aGUgYXJndW1lbnRzIG9mIGBidWlsZEZpbHRlcmVkYFxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfVxuXHQgKi9cblx0c3RhdGljIGJ1aWxkU2VjdXJlKGFyZykge1xuXHRcdHJldHVybiBFeHByZXNzaW9uUmVzb2x2ZXIuYnVpbGRGaWx0ZXJlZChhcmcpO1xuXHR9XG59XG5cbiIsIi8qKlxuICogRmluZHMgdGhlIGV4cHJlc3Npb25zIG9mIGEgdGV4dCBhbmQgdGFrZXMgYSBzaW5nbGUgZXhwcmVzc2lvbiBhcGFydCAtIFNQRUNJRklDQVRJT04ubWQgMy4xIHRvXG4gKiAzLjMgYW5kIDQuMy4gSXQgcmVhZHMgd2hlcmUgYW4gZXhwcmVzc2lvbiBiZWdpbnMgYW5kIGVuZHMsIHdoZXRoZXIgaXQgaXMgZXNjYXBlZCwgYW5kIHdoaWNoIHNjb3BlXG4gKiBwcmVmaXggaXQgY2FycmllczsgZXZhbHVhdGluZyBhIHN0YXRlbWVudCBhbmQgYWRkcmVzc2luZyBhIHNjb3BlIGlzIEV4cHJlc3Npb25SZXNvbHZlcidzLlxuICpcbiAqIEludGVybmFsIHRvIHRoZSBwYWNrYWdlOiBpbmRleC5qcyBkb2VzIG5vdCBleHBvcnQgaXQuXG4gKi9cblxuaW1wb3J0IHsgV0hJVEVTUEFDRSwgaXNOYW1lQ2hhcmFjdGVyLCB0cmltVG9OdWxsIH0gZnJvbSBcIi4vVXRpbHMuanNcIjtcblxuY29uc3QgRVhQUkVTU0lPTl9TVEFSVCA9IFwiJHtcIjtcblxuLy8gdGhlIHNjYW5uZXIgc3RhdGVzIC0gZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBjb2RlIGhpZGVzIHRoZSBicmFjZXMgaW5zaWRlIGl0LCBzZWVcbi8vIFNQRUNJRklDQVRJT04ubWQgMy4xXG5jb25zdCBDT0RFID0gMDtcbmNvbnN0IFNJTkdMRV9RVU9URUQgPSAxO1xuY29uc3QgRE9VQkxFX1FVT1RFRCA9IDI7XG5jb25zdCBURU1QTEFURSA9IDM7XG5jb25zdCBSRUdFWCA9IDQ7XG5jb25zdCBSRUdFWF9DTEFTUyA9IDU7XG5jb25zdCBCTE9DS19DT01NRU5UID0gNjtcbmNvbnN0IExJTkVfQ09NTUVOVCA9IDc7XG5cbi8vIGEgXCIvXCIgY29udGludWVzIGFuIGV4cHJlc3Npb24gaW5zdGVhZCBvZiBvcGVuaW5nIGEgcmVndWxhciBleHByZXNzaW9uIHdoZW4gaXQgZm9sbG93cyBvbmUgb2Zcbi8vIHRoZXNlIC0gdGhlIGNsYXNzaWMgZGl2aXNpb24tb3ItcmVnZXggcXVlc3Rpb24sIGRlY2lkZWQgb24gdGhlIGxhc3QgY2hhcmFjdGVyIHRoYXQgaXMgbmVpdGhlclxuLy8gd2hpdGVzcGFjZSBub3IgcGFydCBvZiBhIGNvbW1lbnRcbmNvbnN0IEJFRk9SRV9ESVZJU0lPTiA9IC9bYS16QS1aMC05XyQpXFxdXS87XG5cbi8vIHRoZSBjaGFyYWN0ZXJzIHRoZSBzY2FubmVyIGRlY2lkZXMgb24sIGNvbXBhcmVkIGFzIGNoYXIgY29kZXMgcmF0aGVyIHRoYW4gYXMgb25lLWNoYXJhY3RlciBzdHJpbmdzXG5jb25zdCBCQUNLU0xBU0ggPSAweDVjO1xuY29uc3QgRE9MTEFSID0gMHgyNDtcbmNvbnN0IE9QRU5fQlJBQ0UgPSAweDdiO1xuY29uc3QgQ0xPU0VfQlJBQ0UgPSAweDdkO1xuY29uc3QgU0lOR0xFX1FVT1RFID0gMHgyNztcbmNvbnN0IERPVUJMRV9RVU9URSA9IDB4MjI7XG5jb25zdCBCQUNLVElDSyA9IDB4NjA7XG5jb25zdCBTTEFTSCA9IDB4MmY7XG5jb25zdCBTVEFSID0gMHgyYTtcbmNvbnN0IExJTkVfRkVFRCA9IDB4MGE7XG5jb25zdCBDQVJSSUFHRV9SRVRVUk4gPSAweDBkO1xuY29uc3QgTElORV9TRVBBUkFUT1IgPSAweDIwMjg7XG5jb25zdCBQQVJBR1JBUEhfU0VQQVJBVE9SID0gMHgyMDI5O1xuY29uc3QgT1BFTl9CUkFDS0VUID0gMHg1YjtcbmNvbnN0IENMT1NFX0JSQUNLRVQgPSAweDVkO1xuY29uc3QgQ09MT04gPSAweDNhO1xuXG5jb25zdCBTQ09QRV9TRVBBUkFUT1IgPSBcIjo6XCI7XG5cbi8qKlxuICogV2hldGhlciB0aGUgXCIvXCIgYXQgYUluZGV4IG9wZW5zIGEgcmVndWxhciBleHByZXNzaW9uIGxpdGVyYWwsIGRlY2lkZWQgb24gdGhlIGNoYXJhY3RlciBiZWZvcmUgaXRcbiAqIHRoYXQgaXMgbmVpdGhlciB3aGl0ZXNwYWNlIG5vciBwYXJ0IG9mIGEgY29tbWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBhSW5kZXhcbiAqIEBwYXJhbSB7P0FycmF5PG51bWJlcj59IHRoZUNvbW1lbnRzIHRoZSBjb21tZW50cyByZWFkIHNvIGZhciBhcyBmbGF0IHN0YXJ0IGFuZCBlbmQgaW5kZXggcGFpcnMsIGluXG4gKiB0aGUgb3JkZXIgdGhleSBzdGFuZDsgbnVsbCB3aGVyZSB0aGUgZXhwcmVzc2lvbiBoYXMgbm9uZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IHNsYXNoT3BlbnNSZWdleCA9IChhVGV4dCwgYUluZGV4LCB0aGVDb21tZW50cykgPT4ge1xuXHRsZXQgaW5kZXggPSBhSW5kZXggLSAxO1xuXHRsZXQgY29tbWVudCA9IHRoZUNvbW1lbnRzID8gdGhlQ29tbWVudHMubGVuZ3RoIC0gMSA6IC0xO1xuXHR3aGlsZSAoaW5kZXggPj0gMCkge1xuXHRcdHdoaWxlIChpbmRleCA+PSAwICYmIFdISVRFU1BBQ0UudGVzdChhVGV4dFtpbmRleF0pKSBpbmRleC0tO1xuXHRcdC8vIGEgbGluZSBjb21tZW50IG1heSBlbmQgaW4gd2hpdGVzcGFjZSwgc28gdGhlIHdhbGsgY2FuIGxhbmQgaW5zaWRlIGl0IHJhdGhlciB0aGFuIG9uIGl0cyBlbmRcblx0XHRpZiAoY29tbWVudCA8IDAgfHwgaW5kZXggPCB0aGVDb21tZW50c1tjb21tZW50IC0gMV0gfHwgaW5kZXggPiB0aGVDb21tZW50c1tjb21tZW50XSkgYnJlYWs7XG5cblx0XHRpbmRleCA9IHRoZUNvbW1lbnRzW2NvbW1lbnQgLSAxXSAtIDE7XG5cdFx0Y29tbWVudCAtPSAyO1xuXHR9XG5cblx0cmV0dXJuIGluZGV4IDwgMCB8fCAhQkVGT1JFX0RJVklTSU9OLnRlc3QoYVRleHRbaW5kZXhdKTtcbn07XG5cbi8qKlxuICogV2hldGhlciBhIGNoYXIgY29kZSBlbmRzIGEgbGluZSBjb21tZW50IC0gYSBsaW5lIHRlcm1pbmF0b3IgaW4gdGhlIHNlbnNlIG9mIEVDTUFTY3JpcHQuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGFDb2RlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNMaW5lVGVybWluYXRvciA9IChhQ29kZSkgPT4gYUNvZGUgPT09IExJTkVfRkVFRCB8fCBhQ29kZSA9PT0gQ0FSUklBR0VfUkVUVVJOIHx8IGFDb2RlID09PSBMSU5FX1NFUEFSQVRPUiB8fCBhQ29kZSA9PT0gUEFSQUdSQVBIX1NFUEFSQVRPUjtcblxuLypcbiAqIFR3byBzcGxpdHMgdGFrZSB0aGUgdGV4dCBiZXR3ZWVuIHRoZSBkZWxpbWl0ZXJzIGFwYXJ0IGludG8gdGhlIHNjb3BlIHByZWZpeCBvZiAzLjMgYW5kIHRoZVxuICogc3RhdGVtZW50IC0gdGhpcyBvbmUgZm9yIGEgdGV4dCwgYHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRCeVNlcGFyYXRvcmAgYmVoaW5kIGBwYXJzZUV4cHJlc3Npb25gIGZvclxuICogdGhlIHNpbmdsZSBleHByZXNzaW9uIG9mIGByZXNvbHZlYC4gVGhleSBhcmUgdHdvIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgb25lIHJ1bGUsIGVhY2ggbWVhc3VyZWRcbiAqIGZhc3RlciBmb3Igb3RoZXIgc3RhdGVtZW50cyAoREVDSVNJT05TLm1kLCAyMDI2LTA5LTI3KTogYSB0ZXh0IHJlYWRzIGZvcndhcmRzLCB0aGUgc2luZ2xlXG4gKiBleHByZXNzaW9uIGZyb20gdGhlIGZpcnN0IFwiOjpcIiBiYWNrd2FyZHMuIHRlc3QvZXhwcmVzc2lvbnNjYW5uZXIvc2NvcGUtcHJlZml4LlRlc3QuanMgYXNrcyBldmVyeVxuICogY2FzZSBvZiBib3RoLlxuICovXG5cbi8qKlxuICogVGhlIHNwbGl0IG9mIGEgdGV4dDogcmVhZHMgZm9yd2FyZHMgb25seSBhcyBmYXIgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhIG5hbWUgY2Fubm90IGNhcnJ5LCB3aGljaFxuICogZm9yIG1vc3Qgc3RhdGVtZW50cyBpcyBhIGZldyBjaGFyYWN0ZXJzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhQ29udGVudCB0aGUgdGV4dCBiZXR3ZWVuIHRoZSBkZWxpbWl0ZXJzXG4gKiBAcmV0dXJucyB7eyBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH19IGJvdGggdHJpbW1lZCwgbnVsbCB3aGVyZSBlbXB0eVxuICovXG5jb25zdCBzcGxpdFNjb3BlQW5kU3RhdGVtZW50Rm9yd2FyZCA9IChhQ29udGVudCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhQ29udGVudC5sZW5ndGg7XG5cdGxldCBpbmRleCA9IDA7XG5cdHdoaWxlIChpbmRleCA8IGxlbmd0aCAmJiBpc05hbWVDaGFyYWN0ZXIoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkpKSBpbmRleCsrO1xuXG5cdGlmIChpbmRleCA9PT0gMCB8fCBhQ29udGVudC5jaGFyQ29kZUF0KGluZGV4KSAhPT0gQ09MT04gfHwgYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCArIDEpICE9PSBDT0xPTilcblx0XHRyZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFDb250ZW50KSB9O1xuXG5cdHJldHVybiB7IHNjb3BlOiB0cmltVG9OdWxsKGFDb250ZW50LnN1YnN0cmluZygwLCBpbmRleCkpLCBzdGF0ZW1lbnQ6IHRyaW1Ub051bGwoYUNvbnRlbnQuc3Vic3RyaW5nKGluZGV4ICsgMikpIH07XG59O1xuXG4vKipcbiAqIFRoZSBudW1iZXIgb2YgYmFja3NsYXNoZXMgc3RhbmRpbmcgZGlyZWN0bHkgaW4gZnJvbnQgb2YgdGhlIGluZGV4LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuICogQHBhcmFtIHtudW1iZXJ9IGFJbmRleFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuY29uc3QgY291bnRCYWNrc2xhc2hlc0JlZm9yZSA9IChhVGV4dCwgYUluZGV4KSA9PiB7XG5cdGxldCBjb3VudCA9IDA7XG5cdHdoaWxlIChhSW5kZXggLSBjb3VudCA+IDAgJiYgYVRleHQuY2hhckNvZGVBdChhSW5kZXggLSBjb3VudCAtIDEpID09PSBCQUNLU0xBU0gpIGNvdW50Kys7XG5cblx0cmV0dXJuIGNvdW50O1xufTtcblxuLyoqXG4gKiBSZWFkcyB0aGUgb25lIGV4cHJlc3Npb24gd2hvc2UgXCIke1wiIHN0YW5kcyBhdCBhU3RhcnQsIGNvdW50aW5nIGJyYWNlcyBidXQgbm90IHRoZSBvbmVzIGhpZGRlblxuICogaW5zaWRlIGEgbGl0ZXJhbCBvciBhIGNvbW1lbnQsIGFuZCB0YWtlcyBpdCBhcGFydCBpbnRvIHNjb3BlIHByZWZpeCBhbmQgc3RhdGVtZW50LlxuICpcbiAqIEFuc3dlcnMgdGhlIG9jY3VycmVuY2UgYHNjYW5gIGhhbmRzIG9uLCBgZW5kYCB0aGUgaW5kZXggZGlyZWN0bHkgYWZ0ZXIgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2U7XG4gKiBudWxsIHdoZXJlIHRoZSB0ZXh0IGVuZHMgYmVmb3JlIHRoYXQgYnJhY2UsIHdoaWNoIHBlciBTUEVDSUZJQ0FUSU9OLm1kIDMuMSBtZWFucyB0aGVyZSBpcyBub1xuICogZXhwcmVzc2lvbiBoZXJlIGF0IGFsbDsgYW5kLCB3aXRoIGBlbmRgIG5lZ2F0ZWQsIHRoZSBpbmRleCBvZiBhbm90aGVyIFwiJHtcIiBtZXQgb3V0c2lkZSBhIGxpdGVyYWxcbiAqIG9yIGEgY29tbWVudCwgd2hpY2ggc3RhcnRzIGFuIGV4cHJlc3Npb24gb2YgaXRzIG93biBhbmQgYWJhbmRvbnMgdGhpcyBvbmUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gYVN0YXJ0XG4gKiBAcmV0dXJucyB7P3sgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGVzY2FwZWQ6IGJvb2xlYW4sIHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfX1cbiAqL1xuY29uc3QgcmVhZEV4cHJlc3Npb24gPSAoYVRleHQsIGFTdGFydCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhVGV4dC5sZW5ndGg7XG5cdGNvbnN0IHN0YWNrID0gW0NPREVdO1xuXHRsZXQgY29tbWVudHMgPSBudWxsO1xuXHRsZXQgY29tbWVudFN0YXJ0ID0gMDtcblx0bGV0IGluZGV4ID0gYVN0YXJ0ICsgMjtcblxuXHR3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcblx0XHRjb25zdCBjaGFyID0gYVRleHQuY2hhckNvZGVBdChpbmRleCk7XG5cdFx0c3dpdGNoIChzdGFja1tzdGFjay5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBDT0RFOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gT1BFTl9CUkFDRSkgc3RhY2sucHVzaChDT0RFKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQ0xPU0VfQlJBQ0UpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHRpZiAoc3RhY2subGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IHNjb3BlLCBzdGF0ZW1lbnQgfSA9IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRGb3J3YXJkKGFUZXh0LnN1YnN0cmluZyhhU3RhcnQgKyAyLCBpbmRleCkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHsgc3RhcnQ6IGFTdGFydCwgZW5kOiBpbmRleCArIDEsIGVzY2FwZWQ6IGZhbHNlLCBzY29wZTogc2NvcGUsIHN0YXRlbWVudDogc3RhdGVtZW50IH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGNoYXIgPT09IFNJTkdMRV9RVU9URSkgc3RhY2sucHVzaChTSU5HTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gRE9VQkxFX1FVT1RFKSBzdGFjay5wdXNoKERPVUJMRV9RVU9URUQpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBCQUNLVElDSykgc3RhY2sucHVzaChURU1QTEFURSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPTExBUiAmJiBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IE9QRU5fQlJBQ0UpIHJldHVybiB7IHN0YXJ0OiBhU3RhcnQsIGVuZDogLWluZGV4LCBlc2NhcGVkOiBmYWxzZSwgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbnVsbCB9O1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTTEFTSCkge1xuXHRcdFx0XHRcdGNvbnN0IG5leHQgPSBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSk7XG5cdFx0XHRcdFx0aWYgKG5leHQgPT09IFNUQVIgfHwgbmV4dCA9PT0gU0xBU0gpIHtcblx0XHRcdFx0XHRcdHN0YWNrLnB1c2gobmV4dCA9PT0gU1RBUiA/IEJMT0NLX0NPTU1FTlQgOiBMSU5FX0NPTU1FTlQpO1xuXHRcdFx0XHRcdFx0Y29tbWVudFN0YXJ0ID0gaW5kZXg7XG5cdFx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc2xhc2hPcGVuc1JlZ2V4KGFUZXh0LCBpbmRleCwgY29tbWVudHMpKSBzdGFjay5wdXNoKFJFR0VYKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQkxPQ0tfQ09NTUVOVDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFNUQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBTTEFTSCkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdGluZGV4Kys7XG5cdFx0XHRcdFx0KGNvbW1lbnRzID8/PSBbXSkucHVzaChjb21tZW50U3RhcnQsIGluZGV4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgTElORV9DT01NRU5UOlxuXHRcdFx0XHRpZiAoaXNMaW5lVGVybWluYXRvcihjaGFyKSkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdChjb21tZW50cyA/Pz0gW10pLnB1c2goY29tbWVudFN0YXJ0LCBpbmRleCAtIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBTSU5HTEVfUVVPVEVEOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTSU5HTEVfUVVPVEUpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgRE9VQkxFX1FVT1RFRDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gRE9VQkxFX1FVT1RFKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFRFTVBMQVRFOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBCQUNLVElDSykgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPTExBUiAmJiBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IE9QRU5fQlJBQ0UpIHtcblx0XHRcdFx0XHRzdGFjay5wdXNoKENPREUpO1xuXHRcdFx0XHRcdGluZGV4Kys7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFJFR0VYOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBPUEVOX0JSQUNLRVQpIHN0YWNrLnB1c2goUkVHRVhfQ0xBU1MpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTTEFTSCkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBSRUdFWF9DTEFTUzpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQ0xPU0VfQlJBQ0tFVCkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRpbmRleCsrO1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEFuc3dlcnMgZXZlcnkgZXhwcmVzc2lvbiBvZiBhIHRleHQsIGluIHRoZSBvcmRlciB0aGV5IHN0YW5kLCBvciBudWxsIHdoZXJlIHRoZSB0ZXh0IGNhcnJpZXNcbiAqIG5vbmUuIGBzdGFydGAgaXMgdGhlIGluZGV4IG9mIHRoZSBcIiRcIiwgYGVuZGAgdGhlIGluZGV4IGFmdGVyIHRoZSBtYXRjaGluZyBjbG9zaW5nIGJyYWNlLCBzbyBhXG4gKiBjYWxsZXIgcmVwbGFjZXMgYnkgcG9zaXRpb24gYW5kIG5ldmVyIHRvdWNoZXMgYW4gb2NjdXJyZW5jZSB0d2ljZS4gVGhlIHRleHQgYmV0d2VlbiB0d29cbiAqIGV4cHJlc3Npb25zIGlzIHNraXBwZWQgYnkgYSBuYXRpdmUgc2VhcmNoIGZvciB0aGUgbmV4dCBcIiR7XCIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcmV0dXJucyB7P0FycmF5PHsgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIGVzY2FwZWQ6IGJvb2xlYW4sIHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfT59XG4gKi9cbmV4cG9ydCBjb25zdCBzY2FuID0gKGFUZXh0KSA9PiB7XG5cdGxldCBvY2N1cnJlbmNlcyA9IG51bGw7XG5cdGxldCBzdGFydCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCk7XG5cblx0d2hpbGUgKHN0YXJ0ID49IDApIHtcblx0XHQvLyAzLjI6IGFuIG9kZCBydW4gb2YgYmFja3NsYXNoZXMgZXNjYXBlcyB0aGUgZGVsaW1pdGVyIGl0c2VsZi4gSXQgb3BlbnMgbm90aGluZywgc28gb25seVxuXHRcdC8vIHRob3NlIHR3byBjaGFyYWN0ZXJzIGFyZSB0YWtlbiBvdXQgb2YgdGhlIHRleHQgYW5kIHRoZSBzY2FuIGNhcnJpZXMgb24gYmVoaW5kIHRoZW0gLVxuXHRcdC8vIHdoYXQgd291bGQgaGF2ZSBiZWVuIHRoZSBzdGF0ZW1lbnQgaXMgb3JkaW5hcnkgdGV4dCBhbmQgbWF5IGhvbGQgZXhwcmVzc2lvbnMgb2YgaXRzIG93bi5cblx0XHRpZiAoY291bnRCYWNrc2xhc2hlc0JlZm9yZShhVGV4dCwgc3RhcnQpICUgMiA9PT0gMSkge1xuXHRcdFx0aWYgKCFvY2N1cnJlbmNlcykgb2NjdXJyZW5jZXMgPSBbXTtcblx0XHRcdG9jY3VycmVuY2VzLnB1c2goeyBzdGFydDogc3RhcnQsIGVuZDogc3RhcnQgKyAyLCBlc2NhcGVkOiB0cnVlLCBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBudWxsIH0pO1xuXHRcdFx0c3RhcnQgPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQsIHN0YXJ0ICsgMik7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCBvY2N1cnJlbmNlID0gcmVhZEV4cHJlc3Npb24oYVRleHQsIHN0YXJ0KTtcblx0XHQvLyBubyBtYXRjaGluZyBicmFjZTogdGhlIHRleHQgc3RhbmRzIGFzIHdyaXR0ZW4sIGFuZCBub3RoaW5nIGJlaGluZCBpdCBjYW4gYmUgYW5cblx0XHQvLyBleHByZXNzaW9uIGVpdGhlciAtIGEgXCIke1wiIG91dHNpZGUgYSBsaXRlcmFsIG9yIGEgY29tbWVudCB3b3VsZCBoYXZlIHJlc3RhcnRlZCB0aGUgc2NhbiBpbnN0ZWFkXG5cdFx0aWYgKCFvY2N1cnJlbmNlKSBicmVhaztcblx0XHRpZiAob2NjdXJyZW5jZS5lbmQgPCAwKSB7XG5cdFx0XHRzdGFydCA9IC1vY2N1cnJlbmNlLmVuZDtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmICghb2NjdXJyZW5jZXMpIG9jY3VycmVuY2VzID0gW107XG5cdFx0b2NjdXJyZW5jZXMucHVzaChvY2N1cnJlbmNlKTtcblx0XHRzdGFydCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCwgb2NjdXJyZW5jZS5lbmQpO1xuXHR9XG5cblx0cmV0dXJuIG9jY3VycmVuY2VzO1xufTtcblxuLyoqXG4gKiBUYWtlcyB0aGUgb25lIGV4cHJlc3Npb24gYHJlc29sdmVgIGlzIGhhbmRlZCBhcGFydCAtIFNQRUNJRklDQVRJT04ubWQgNC4zLlxuICpcbiAqIFdoaWNoIGZvcm0gaXMgaW4gaGFuZCBpcyBkZWNpZGVkIGJ5IHRoZSBmaXJzdCBjaGFyYWN0ZXJzIG9mIHRoZSB0cmltbWVkIGlucHV0LiBUaGUgd2hvbGUgaW5wdXRcbiAqIGlzIG9uZSBleHByZXNzaW9uLCBzbyBpdHMgZW5kIGlzIHRoZSBlbmQgb2YgdGhlIGlucHV0LiBUaGUgZXNjYXBpbmcgb2YgMy4yIGRvZXMgbm90IGFwcGx5IGhlcmUgLVxuICogaXQgaXMgYSBydWxlIG9mIHRoZSB0ZXh0IGZvcm0sIGFuZCB0aGVyZSBpcyBubyBzdXJyb3VuZGluZyB0ZXh0LCBzbyBhIGJhY2tzbGFzaCBiZWxvbmdzIHRvIHRoZVxuICogc3RhdGVtZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhRXhwcmVzc2lvblxuICogQHJldHVybnMge3sgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9fVxuICogQHRocm93cyB7U3ludGF4RXJyb3J9IHdoZXJlIHRoZSBpbnB1dCBvcGVucyB3aXRoIFwiJHtcIiBhbmQgZG9lcyBub3QgZW5kIHdpdGggXCJ9XCJcbiAqL1xuZXhwb3J0IGNvbnN0IHBhcnNlRXhwcmVzc2lvbiA9IChhRXhwcmVzc2lvbikgPT4ge1xuXHRhRXhwcmVzc2lvbiA9IGFFeHByZXNzaW9uLnRyaW0oKTtcblxuXHRpZiAoYUV4cHJlc3Npb24uc3RhcnRzV2l0aChFWFBSRVNTSU9OX1NUQVJUKSkge1xuXHRcdGlmICghYUV4cHJlc3Npb24uZW5kc1dpdGgoXCJ9XCIpKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEV4cHJlc3Npb24gZG9lcyBub3QgZW5kIHdpdGggXCJ9XCI6ICR7YUV4cHJlc3Npb259YCk7XG5cblx0XHRyZXR1cm4gc3BsaXRTY29wZUFuZFN0YXRlbWVudEJ5U2VwYXJhdG9yKGFFeHByZXNzaW9uLnN1YnN0cmluZygyLCBhRXhwcmVzc2lvbi5sZW5ndGggLSAxKSk7XG5cdH1cblxuXHQvLyBhbnl0aGluZyBlbHNlIGlzIGEgc3RhdGVtZW50IGluIGZ1bGwsIGFuZCBjYXJyaWVzIG5vIHNjb3BlIHByZWZpeFxuXHRyZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFFeHByZXNzaW9uKSB9O1xufTtcblxuLyoqXG4gKiBUaGUgc3BsaXQgb2YgdGhlIHNpbmdsZSBleHByZXNzaW9uOiBtb3N0IHN0YXRlbWVudHMgY2Fycnkgbm8gXCI6OlwiIGF0IGFsbCBhbmQgYXJlIGRvbmUgYWZ0ZXIgb25lXG4gKiBuYXRpdmUgc2VhcmNoLiBXaGVyZSBvbmUgc3RhbmRzLCBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZmlyc3Qgb2YgdGhlbSBoYXMgdG8gYmUgYSBuYW1lLCBjaGVja2VkXG4gKiBiYWNrd2FyZHMgZnJvbSBpdDogYSBcIjo6XCIgaW5zaWRlIGEgc3RhdGVtZW50IC0gYSBxdW90ZWQgb25lIC0gdXN1YWxseSBoYXMgYSBjaGFyYWN0ZXIgbm8gbmFtZVxuICogY2FycmllcyByaWdodCBpbiBmcm9udCBvZiBpdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYUNvbnRlbnQgdGhlIHRleHQgYmV0d2VlbiB0aGUgZGVsaW1pdGVyc1xuICogQHJldHVybnMge3sgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9fSBib3RoIHRyaW1tZWQsIG51bGwgd2hlcmUgZW1wdHlcbiAqL1xuY29uc3Qgc3BsaXRTY29wZUFuZFN0YXRlbWVudEJ5U2VwYXJhdG9yID0gKGFDb250ZW50KSA9PiB7XG5cdGNvbnN0IGVuZCA9IGFDb250ZW50LmluZGV4T2YoU0NPUEVfU0VQQVJBVE9SKTtcblx0aWYgKGVuZCA8IDEpIHJldHVybiB7IHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IHRyaW1Ub051bGwoYUNvbnRlbnQpIH07XG5cblx0Zm9yIChsZXQgaW5kZXggPSBlbmQgLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKVxuXHRcdGlmICghaXNOYW1lQ2hhcmFjdGVyKGFDb250ZW50LmNoYXJDb2RlQXQoaW5kZXgpKSkgcmV0dXJuIHsgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudCkgfTtcblxuXHRyZXR1cm4geyBzY29wZTogdHJpbVRvTnVsbChhQ29udGVudC5zdWJzdHJpbmcoMCwgZW5kKSksIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudC5zdWJzdHJpbmcoZW5kICsgMikpIH07XG59O1xuIiwiaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5pbXBvcnQgeyBpc051bGxPclVuZGVmaW5lZCB9IGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qc1wiO1xuXG4vKipcbiAqIFRoZSBkZXNjcmlwdG9yIGEgcHJvcGVydHkgaGFzIHdoZXJlIGl0IGlzIGRlZmluZWQgLSBvd24gb3IgYW55d2hlcmUgdXAgdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICogdGhlIG9iamVjdCBob2xkaW5nIGl0LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge3N0cmluZ3xzeW1ib2x9IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7UHJvcGVydHlEZXNjcmlwdG9yfG51bGx9XG4gKi9cbmNvbnN0IGZpbmRQcm9wZXJ0eURlc2NyaXB0b3IgPSAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0bGV0IHR5cGUgPSBkYXRhO1xuXHR3aGlsZSAoIWlzTnVsbE9yVW5kZWZpbmVkKHR5cGUpKSB7XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHR5cGUsIHByb3BlcnR5KTtcblx0XHRpZiAoZGVzY3JpcHRvcikgcmV0dXJuIGRlc2NyaXB0b3I7XG5cdFx0dHlwZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodHlwZSk7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogVGhlIG5hbWVzIGEgaGFuZGxlIHByb3ZpZGVzLCBlYWNoIG1hcHBlZCB0byB0aGUgaGFuZGxlIHByb3ZpZGluZyBpdDogYSBNYXAsIG9yIHRoZSBzdGFuZC1pbiBvZlxuICogYGNyZWF0ZUdsb2JhbE5hbWVDYWNoZWAgb3ZlciB0aGUgZ2xvYmFsIG9iamVjdCwgd2hpY2ggYW5zd2VycyB0aGUgc2FtZSBjYWxscy5cbiAqXG4gKiBAdHlwZWRlZiB7TWFwPHN0cmluZ3xzeW1ib2wsUmVzb2x2ZXJDb250ZXh0SGFuZGxlPn0gTmFtZUNhY2hlXG4gKi9cblxuLyoqXG4gKiBOYW1lIGNhY2hlIGZvciBhIGNvbnRleHQgdGhhdCBpcyB0aGUgZ2xvYmFsIG9iamVjdCBpdHNlbGYuXG4gKlxuICogSXQgYW5zd2VycyBsaWtlIHRoZSBNYXAgaXQgcmVwbGFjZXM6IGV2ZXJ5IG5hbWUgaXMgcHJlc2VudCwgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgaGFuZGxlXG4gKiBob2xkaW5nIGl0IC0gbmV2ZXIgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS4gVGhhdCBpcyB0aGUgY29udHJhY3Qgb2YgI2ZpbmRIYW5kbGUsXG4gKiB3aG9zZSBjYWxsZXIgcmVhZHMgdGhlIHByb3BlcnR5IG9mZiB0aGUgaGFuZGxlIGl0IGdldHMgYmFjay5cbiAqXG4gKiBCZWNhdXNlIGV2ZXJ5IG5hbWUgaXMgcHJlc2VudCwgc3VjaCBhIHJlc29sdmVyIGFuc3dlcnMgZXZlcnkgbG9va3VwIHRoYXQgcmVhY2hlcyBpdCwgYW5kIG5vXG4gKiBoYW5kbGUgbmVhcmVyIHRoZSByb290IGlzIHJlYWNoZWQuIEl0IGxpc3RzIG5vIG5hbWUgb2YgaXRzIG93biwgc28gdGhlIG93bktleXMgdHJhcCBvZiBhIGhhbmRsZVxuICogZnVydGhlciBmcm9tIHRoZSByb290IHJlcG9ydHMgbm9uZSBvZiB0aGUgZ2xvYmFsIG9iamVjdCdzIC0gU1BFQ0lGSUNBVElPTi5tZCA2LjQuXG4gKlxuICogQHBhcmFtIHtSZXNvbHZlckNvbnRleHRIYW5kbGV9IGhhbmRsZVxuICogQHJldHVybnMge05hbWVDYWNoZX1cbiAqL1xuY29uc3QgY3JlYXRlR2xvYmFsTmFtZUNhY2hlID0gKGhhbmRsZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhczogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXHRcdGdldDogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlO1xuXHRcdH0sXG5cdFx0c2V0OiAocHJvcGVydHksIHZhbHVlKSA9PiB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRkZWxldGU6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0a2V5czogKCkgPT4ge1xuXHRcdFx0Ly8gTm8gbmFtZSBvZiBpdHMgb3duLiBgaGFzYCBhbHJlYWR5IGFuc3dlcnMgZXZlcnkgbG9va3VwLCBzbyBhIG5hbWUgb2YgdGhlIGdsb2JhbCBvYmplY3Rcblx0XHRcdC8vIGlzIGZvdW5kIGZyb20gYW55d2hlcmUgYmVsb3c7IGxpc3RpbmcgaXQgYXMgd2VsbCB3b3VsZCBvbmx5IGhhbmQgaXQgdG8gYW4gZXhlY3V0ZXIgdGhhdFxuXHRcdFx0Ly8gdHVybnMgYSBuYW1lIGludG8gY29kZSwgd2hpY2ggdGhlbiBmYWlscyBvdmVyIG5hbWVzIGl0IG5ldmVyIG5lZWRlZCAtIHRoZSBpbmRleCBcIjBcIiBvZlxuXHRcdFx0Ly8gYSBmcmFtZSwgYSBzeW1ib2wgYW5vdGhlciBsaWJyYXJ5IHBsYW50ZWQuIEEgc3RhdGVtZW50IHJlYWNoZXMgYSBnbG9iYWwgdGhyb3VnaCB0aGVcblx0XHRcdC8vIG9yZGluYXJ5IHNjb3BlIGNoYWluIGFueXdheSAoU1BFQ0lGSUNBVElPTi5tZCA2LjQpLlxuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKipcbiAqIFdoYXQgc3RhbmRzIGJlaGluZCB0aGUgY29udGV4dCBvZiBvbmUgcmVzb2x2ZXI6IHRoZSBvYmplY3QgaGFuZGVkIHRvIGl0LCB0aGUgaGFuZGxlIG9mIGl0cyBwYXJlbnQsXG4gKiBhbmQgdGhlIG5hbWUgY2FjaGUgdGhhdCB0ZWxscyB3aGljaCBuYW1lcyB0aGlzIHJlc29sdmVyIHByb3ZpZGVzLiBJdCBoYW5kcyBvdXQgdGhlIGNvbnRleHQgYW5cbiAqIGV4cHJlc3Npb24gc2VlcywgYSBwcm94eSB0aGF0IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbiAtIFNQRUNJRklDQVRJT04ubWQgNS4yLCA2LjEgdG8gNi41LlxuICpcbiAqIEludGVybmFsIHRvIHRoZSBwYWNrYWdlOiBpbmRleC5qcyBkb2VzIG5vdCBleHBvcnQgaXQgKERFQ0lTSU9OUy5tZCwgMjAyNi0wOS0zMCkuXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIFJlc29sdmVyQ29udGV4dEhhbmRsZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvbHZlckNvbnRleHRIYW5kbGUge1xuXHQvKiogQHR5cGUge29iamVjdHxudWxsfSAqL1xuXHQjY29udGV4dCA9IG51bGw7XG5cdC8qKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge29iamVjdHxudWxsfSAqL1xuXHQjZGF0YSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7TmFtZUNhY2hlfG51bGx9ICovXG5cdCNjYWNoZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I3Byb3ZpZGVzQ29udGV4dCA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgdGhlIGNhbGxlciBoYW5kZWQgb3Zlciwga2VwdCByYXRoZXIgdGhhbiBjb3BpZWQuIFdoZXJlIG5vbmVcblx0ICogaXMgcGFzc2VkLCB0aGUgaGFuZGxlIGhvbGRzIG5vIG9iamVjdCBhdCBhbGwgYW5kIGNhcnJpZXMgbm8gbmFtZSwgbm90IGV2ZW4gb25lIG9mXG5cdCAqIE9iamVjdC5wcm90b3R5cGUgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuMy4gSXQgZ2V0cyBhbiBvYmplY3Qgb24gdGhlIGZpcnN0IHdyaXRlLlxuXHQgKiBAcGFyYW0gez9SZXNvbHZlckNvbnRleHRIYW5kbGV9IHBhcmVudCB0aGUgaGFuZGxlIG9mIHRoZSBwYXJlbnQgcmVzb2x2ZXJcblx0ICovXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQsIHBhcmVudCkge1xuXHRcdHRoaXMuI2RhdGEgPSBpc051bGxPclVuZGVmaW5lZChjb250ZXh0KSA/IG51bGwgOiBjb250ZXh0O1xuXHRcdHRoaXMuI3BhcmVudCA9IHBhcmVudCA/IHBhcmVudCA6IG51bGw7XG5cdFx0dGhpcy4jcHJvdmlkZXNDb250ZXh0ID0gIWlzTnVsbE9yVW5kZWZpbmVkKGNvbnRleHQpO1xuXG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNidWlsZE5hbWVDYWNoZSgpO1xuXG5cdFx0aWYgKEdMT0JBTCA9PT0gdGhpcy4jZGF0YSlcblx0XHRcdHRoaXMuI2NvbnRleHQgPSB0aGlzLiNkYXRhO1xuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gVGhlIHByb3h5IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbiwgd2hpY2ggaXMgbW9yZSB0aGFuIHRoZSBvYmplY3QgaGFuZGVkIHRvIHRoaXNcblx0XHRcdC8vIHJlc29sdmVyIGhvbGRzLiBBIHByb3h5IG1heSBub3Qgc3BlYWsgdGhhdCBmcmVlbHkgZm9yIGEgdGFyZ2V0IHRoYXQgZ3VhcmFudGVlc1xuXHRcdFx0Ly8gYW55dGhpbmcgYWJvdXQgaXRzIG93biBrZXlzIC0gYSBmcm96ZW4gb3Igc2VhbGVkIGNvbnRleHQgaXMgd2hlcmUgdGhhdCBlbmRzIGluIGFcblx0XHRcdC8vIFR5cGVFcnJvciAtIHNvIGl0IGdldHMgYW4gZW1wdHkgdGFyZ2V0IG9mIGl0cyBvd24uIE5vIHRyYXAgcmVhZHMgaXQ7IGV2ZXJ5IG9uZSBvZlxuXHRcdFx0Ly8gdGhlbSB3b3JrcyBvbiAjZGF0YSBhbmQgI2NhY2hlLlxuXHRcdFx0dGhpcy4jY29udGV4dCA9IG5ldyBQcm94eSh7fSwge1xuXHRcdFx0XHRoYXM6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJoYXMgcHJvcGVydHk6XCIsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy4jZmluZEhhbmRsZShwcm9wZXJ0eSkgIT0gbnVsbDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0OiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0IHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy4jZmluZEhhbmRsZShwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIGhhbmRsZSA/IGhhbmRsZS4jZGF0YVtwcm9wZXJ0eV0gOiB1bmRlZmluZWQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogKGRhdGEsIHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJzZXQgcHJvcGVydHk6XCIsIHByb3BlcnR5LCBcIj1cIiwgdmFsdWUpO1xuXHRcdFx0XHRcdHRoaXMuI2RhdGEgPz89IHt9O1xuXHRcdFx0XHRcdHRoaXMuI2RhdGFbcHJvcGVydHldID0gdmFsdWU7XG5cdFx0XHRcdFx0dGhpcy4jY2FjaGUuc2V0KHByb3BlcnR5LCB0aGlzKTtcblx0XHRcdFx0XHR0aGlzLiNwcm92aWRlc0NvbnRleHQgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRkZWxldGVQcm9wZXJ0eTogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAoaGFuZGxlKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy4jZGF0YVtwcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHR0aGlzLiNjYWNoZS5kZWxldGUocHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBoYW5kbGUgPSB0aGlzLiNmaW5kSGFuZGxlKHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAoIWhhbmRsZSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdC8vIFJlYWQgdGhyb3VnaCBhIGdldHRlciByYXRoZXIgdGhhbiB1cCBmcm9udCwgc28gZW51bWVyYXRpbmcgYSBjb250ZXh0IGRvZXMgbm90XG5cdFx0XHRcdFx0Ly8gZXZhbHVhdGUgd2hhdCBub2JvZHkgYXNrZWQgZm9yLCBhbmQgc28gYSB2YWx1ZSBzdGF5cyBsaXZlICg2LjIpLiBFbnVtZXJhYmlsaXR5XG5cdFx0XHRcdFx0Ly8gaXMgdGFrZW4gZnJvbSB3aGVyZSB0aGUgcHJvcGVydHkgaXMgZGVmaW5lZCAtIHRoYXQgaXMgd2hhdCBrZWVwcyB0aGUgbWVtYmVyc1xuXHRcdFx0XHRcdC8vIG9mIE9iamVjdC5wcm90b3R5cGUgb3V0IG9mIE9iamVjdC5rZXlzIC0gd2hpbGUgY29uZmlndXJhYmxlIGhhcyB0byBiZSB0cnVlOlxuXHRcdFx0XHRcdC8vIGEgcHJveHkgbWF5IG5vdCBjbGFpbSBhIGZpeGVkIHByb3BlcnR5IGl0cyB0YXJnZXQgZG9lcyBub3QgaGF2ZS5cblx0XHRcdFx0XHRjb25zdCBkZXNjcmlwdG9yID0gZmluZFByb3BlcnR5RGVzY3JpcHRvcihoYW5kbGUuI2RhdGEsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Z2V0OiAoKSA9PiBoYW5kbGUuI2RhdGFbcHJvcGVydHldLFxuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZGVzY3JpcHRvciA/IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA6IHRydWUsXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvd25LZXlzOiAoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJvd25LZXlzXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQoKTtcblx0XHRcdFx0XHRsZXQgaGFuZGxlID0gdGhpcztcblx0XHRcdFx0XHR3aGlsZSAoaGFuZGxlKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBrZXkgb2YgaGFuZGxlLiNjYWNoZS5rZXlzKCkpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0LmFkZChrZXkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aGFuZGxlID0gaGFuZGxlLiNwYXJlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBBcnJheS5mcm9tKHJlc3VsdCk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly9AVE9ETyBuZWVkIHRvIHN1cHBvcnQgdGhlIG90aGVyIHByb3h5IGFjdGlvbnNcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29udGV4dCBhbiBleHByZXNzaW9uIHNlZXM6IGEgcHJveHkgdGhhdCBhbnN3ZXJzIGZvciB0aGUgd2hvbGUgY2hhaW4sIG9yIG92ZXIgdGhlIGdsb2JhbFxuXHQgKiBvYmplY3QgdGhlIGdsb2JhbCBvYmplY3QgaXRzZWxmIC0gU1BFQ0lGSUNBVElPTi5tZCA2LjEsIDYuNC5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtvYmplY3R9XG5cdCAqL1xuXHRnZXQgY29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxuXHQgKi9cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhpcyBoYW5kbGUgcHJvdmlkZXMgdGhlIG5hbWUgaXRzZWxmLiBFdmVyeSBuYW1lIG9mIGl0cyBvd24gY29udGV4dCBjb3VudHMsIHRoZSBvbmVzXG5cdCAqIGluaGVyaXRlZCB0aHJvdWdoIHRoZSBwcm90b3R5cGUgY2hhaW4gaW5jbHVkZWQgKDUuMik7IGEgaGFuZGxlIG92ZXIgdGhlIGdsb2JhbCBvYmplY3Rcblx0ICogcHJvdmlkZXMgZXZlcnkgbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8c3ltYm9sfSBrZXlcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRoYXNOYW1lKGtleSkge1xuXHRcdHJldHVybiB0aGlzLiNjYWNoZS5oYXMoa2V5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRoaXMgaGFuZGxlIHByb3ZpZGVzIGEgY29udGV4dDogb25lIHdhcyBoYW5kZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBvciBhIHZhbHVlIGhhcyBiZWVuXG5cdCAqIHdyaXR0ZW4gc2luY2UuIFdoYXQgdGhlIGRhdGEgaG9sZHMgZGVjaWRlcyBub3RoaW5nIC0gU1BFQ0lGSUNBVElPTi5tZCA1LjUuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0ICovXG5cdGdldCBwcm92aWRlc0NvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI3Byb3ZpZGVzQ29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlcyB0aGUgb2JqZWN0IHRoaXMgaGFuZGxlIGhvbGRzLCBhbmQgd2l0aCBpdCB0aGUgbmFtZXMgaXQgcHJvdmlkZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7P29iamVjdH0gZGF0YSB0aGUgbmV3IG9iamVjdDsgbnVsbCBvciB1bmRlZmluZWQgbGVhdmVzIHRoZSBoYW5kbGUgd2l0aG91dCBvbmVcblx0ICovXG5cdHJlcGxhY2VEYXRhKGRhdGEpIHtcblx0XHR0aGlzLiNkYXRhID0gaXNOdWxsT3JVbmRlZmluZWQoZGF0YSkgPyBudWxsIDogZGF0YTtcblx0XHR0aGlzLiNwcm92aWRlc0NvbnRleHQgPSAhaXNOdWxsT3JVbmRlZmluZWQoZGF0YSk7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNidWlsZE5hbWVDYWNoZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFzc2lnbnMgdGhlIGtleXMgb2YgYW4gb2JqZWN0IGludG8gdGhlIG9uZSB0aGlzIGhhbmRsZSBob2xkcywga2V5IGJ5IGtleSwgY3JlYXRpbmcgdGhhdCBvYmplY3Rcblx0ICogd2hlcmUgdGhlcmUgaXMgbm9uZSAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBvYmplY3QgaGVsZCByZWZ1c2VzIGEga2V5IC0gdGhlIGtleXMgYmVmb3JlIGl0IGFyZSB3cml0dGVuIGJ5IHRoZW5cblx0ICovXG5cdG1lcmdlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy4jZGF0YSA/Pz0ge307XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLiNkYXRhLCBkYXRhKTtcblx0XHR0aGlzLiNwcm92aWRlc0NvbnRleHQgPSB0cnVlO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jYnVpbGROYW1lQ2FjaGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUYWtlcyB1cCB0aGUga2V5cyBhZGRlZCB0byB0aGUgaGFuZGVkLWluIG9iamVjdCBzaW5jZSB0aGUgaGFuZGxlIHdhcyBidWlsdCwgd2hpY2ggYXJlIG5vdFxuXHQgKiBwcm92aWRlZCB1bnRpbCB0aGVuIC0gU1BFQ0lGSUNBVElPTi5tZCA2LjIuXG5cdCAqL1xuXHRyZXNldENhY2hlKCkge1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jYnVpbGROYW1lQ2FjaGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIG5ldyBuYW1lIGNhY2hlIGZvciB0aGUgb2JqZWN0IHRoaXMgaGFuZGxlIGhvbGRzOiBldmVyeSBrZXkgaXQgY2FycmllcywgaXRzIHByb3RvdHlwZSBjaGFpblxuXHQgKiBpbmNsdWRlZCwgZWFjaCBtYXBwZWQgdG8gdGhpcyBoYW5kbGUgKDUuMikuIE92ZXIgdGhlIGdsb2JhbCBvYmplY3QgdGhlIHN0YW5kLWluIG9mXG5cdCAqIGBjcmVhdGVHbG9iYWxOYW1lQ2FjaGVgLCB3aGljaCBwcm92aWRlcyBldmVyeSBuYW1lLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7TmFtZUNhY2hlfVxuXHQgKi9cblx0I2J1aWxkTmFtZUNhY2hlKCkge1xuXHRcdGNvbnN0IGRhdGEgPSB0aGlzLiNkYXRhO1xuXHRcdGlmIChHTE9CQUwgPT09IGRhdGEpIFxuXHRcdFx0cmV0dXJuIGNyZWF0ZUdsb2JhbE5hbWVDYWNoZSh0aGlzKTtcblxuXHRcdC8vIGV2ZXJ5IGtleSBKYXZhU2NyaXB0IHNheXMgdGhlIG9iamVjdCBjYXJyaWVzLCBub3RoaW5nIGZpbHRlcmVkIC0gd2hpY2ggb2YgdGhlbSBhbiBleGVjdXRlclxuXHRcdC8vIGNhbiBwdXQgaW50byBpdHMgY29kZSBpcyB0aGUgZXhlY3V0ZXIncyBidXNpbmVzcyAoREVDSVNJT05TLm1kIDIwMjYtMDgtMzAsIDIwMjYtMDktMjIpXG5cdFx0Y29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XG5cdFx0bGV0IHR5cGUgPSBkYXRhO1xuXHRcdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRcdGZvciAobGV0IG5hbWUgb2YgUmVmbGVjdC5vd25LZXlzKHR5cGUpKSBjYWNoZS5zZXQobmFtZSwgdGhpcyk7XG5cdFx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FjaGU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5lYXJlc3QgaGFuZGxlIGZyb20gdGhpcyBvbmUgdG8gdGhlIHJvb3QgdGhhdCBwcm92aWRlcyB0aGUgbmFtZSwgb3IgbnVsbCB3aGVyZSBub25lIGRvZXMgLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDUuMi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8c3ltYm9sfSBwcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9XG5cdCAqL1xuXHQjZmluZEhhbmRsZShwcm9wZXJ0eSkge1xuXHRcdGlmICh0aGlzLiNjYWNoZS5oYXMocHJvcGVydHkpKSByZXR1cm4gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRsZXQgcGFyZW50ID0gdGhpcy4jcGFyZW50O1xuXHRcdHdoaWxlIChwYXJlbnQpIHtcblx0XHRcdGlmIChwYXJlbnQuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiBwYXJlbnQuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQuI3BhcmVudDtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cbiIsIi8qKlxuICogVGhlIGhlbHBlcnMgbW9yZSB0aGFuIG9uZSBjb21wb25lbnQgdXNlcyAtIEFHRU5UUy5tZCwgQ29udmVudGlvbnMuIEludGVybmFsIHRvIHRoZSBwYWNrYWdlOlxuICogaW5kZXguanMgZG9lcyBub3QgZXhwb3J0IHRoZW0uXG4gKi9cblxuLyoqIFdoaXRlc3BhY2UgaW4gdGhlIHNlbnNlIG9mIGBcXHNgLiAqL1xuZXhwb3J0IGNvbnN0IFdISVRFU1BBQ0UgPSAvXFxzLztcblxuLyoqXG4gKiBXaGV0aGVyIGEgY2hhcmFjdGVyIG1heSBzdGFuZCBpbiBhIHNjb3BlIG5hbWUgLSBTUEVDSUZJQ0FUSU9OLm1kIDMuMzogYW4gQVNDSUkgbGV0dGVyLCBhIGRpZ2l0LFxuICogXCItXCIsIFwiX1wiLCBvciB3aGl0ZXNwYWNlIGluIHRoZSBzZW5zZSBvZiBgXFxzYCwgd2hpY2ggcGFzdCBBU0NJSSBpcyBsZWZ0IHRvIHRoZSByZWd1bGFyIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGFDb2RlIHRoZSBjaGFyIGNvZGVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgY29uc3QgaXNOYW1lQ2hhcmFjdGVyID0gKGFDb2RlKSA9PiB7XG5cdGlmIChhQ29kZSA8IDB4ODApXG5cdFx0cmV0dXJuIChcblx0XHRcdChhQ29kZSA+PSAweDYxICYmIGFDb2RlIDw9IDB4N2EpIHx8XG5cdFx0XHQoYUNvZGUgPj0gMHg0MSAmJiBhQ29kZSA8PSAweDVhKSB8fFxuXHRcdFx0KGFDb2RlID49IDB4MzAgJiYgYUNvZGUgPD0gMHgzOSkgfHxcblx0XHRcdGFDb2RlID09PSAweDJkIHx8XG5cdFx0XHRhQ29kZSA9PT0gMHg1ZiB8fFxuXHRcdFx0YUNvZGUgPT09IDB4MjAgfHxcblx0XHRcdChhQ29kZSA+PSAweDA5ICYmIGFDb2RlIDw9IDB4MGQpXG5cdFx0KTtcblxuXHRyZXR1cm4gV0hJVEVTUEFDRS50ZXN0KFN0cmluZy5mcm9tQ2hhckNvZGUoYUNvZGUpKTtcbn07XG5cbi8qKlxuICogVHJpbXMgYSBzdHJpbmcsIGFuZCBhbnN3ZXJzIG51bGwgZm9yIG9uZSB0aGF0IGlzIGVtcHR5IGFmdGVyIHRyaW1taW5nLCBhbmQgZm9yIG5vbmUuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCB0cmltVG9OdWxsID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSkge1xuXHRcdHZhbHVlID0gdmFsdWUudHJpbSgpO1xuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT0gMCA/IG51bGwgOiB2YWx1ZTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQSAzMiBiaXQgaGFzaCBvZiBhIHN0cmluZywgaW4gdGhlIG1hbm5lciBvZiBKYXZhJ3MgYFN0cmluZy5oYXNoQ29kZWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdHJpbmdcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBzdHJpbmdUb0hhc2hjb2RlID0gKGFTdHJpbmcpID0+IHtcblx0bGV0IGhhc2ggPSAwO1xuXHRpZiAoYVN0cmluZy5sZW5ndGggPT0gMCkgcmV0dXJuIGhhc2g7XG5cdGNvbnN0IGxlbmd0aCA9IGFTdHJpbmcubGVuZ3RoO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgY2hhciA9IGFTdHJpbmcuY2hhckNvZGVBdChpKTtcblx0XHRoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjaGFyO1xuXHRcdGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG5cdH1cblx0cmV0dXJuIGhhc2g7XG59O1xuIiwiaW1wb3J0IHsgcmVnaXN0ZXIgfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcblxubGV0IERFQlVHID0gZmFsc2U7XG4vKiogVGhlIG5hbWUgdGhpcyBleGVjdXRlciBpcyByZWdpc3RlcmVkIHVuZGVyLCBhbmQgdGhlIGRlZmF1bHQgZXhlY3V0ZXIgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMi4gKi9cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcImNvbnRleHQtZGVjb25zdHJ1Y3Rpb24tZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKCk7XG5cbi8qKlxuICogSG93IG1hbnkgbmFtZXMgYSBjb250ZXh0IG1heSBjYXJyeSBiZWZvcmUgdGhpcyBleGVjdXRlciBzYXlzIHRoYXQgYmluZGluZyB0aGVtIGFsbCBjb3N0cy4gRXZlcnlcbiAqIG9yZGluYXJ5IG9iamVjdCBicmluZ3Mgc2V2ZW4gb2YgdGhlbSBhbG9uZyBmcm9tIGBPYmplY3QucHJvdG90eXBlYCwgc28gdGhlIG51bWJlciBjb3VudHMgYSBnb29kXG4gKiBtYW55IG93biBrZXlzIGJlZm9yZSBpdCBpcyByZWFjaGVkLlxuICovXG5jb25zdCBISUdIX1BST1BFUlRZX0NPVU5UID0gMjU7XG5cbi8qKlxuICogVGhlIG5hbWVzIHRoYXQgbWFkZSB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIGZhaWwgdG8gY29tcGlsZSwgYXNrZWQgb2YgSmF2YVNjcmlwdCBpdHNlbGYgcmF0aGVyXG4gKiB0aGFuIG9mIGEgbGlzdCBrZXB0IGhlcmU6IGEgbmFtZSBpcyB1c2FibGUgd2hlbiBpdCBjYW4gc3RhbmQgaW4gYSBkZXN0cnVjdHVyaW5nIHBhdHRlcm4uXG4gKlxuICogT25seSBldmVyIGNhbGxlZCBvbiB0aGUgZmFpbHVyZSBwYXRoLCBzbyB0aGUgY29zdCBvZiBjb21waWxpbmcgb25lIHBhdHRlcm4gcGVyIG5hbWUgaXMgcGFpZCBieSBhXG4gKiBjb250ZXh0IHRoYXQgaXMgYnJva2VuIGZvciB0aGlzIGV4ZWN1dGVyIGFueXdheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZ3xzeW1ib2w+fSB0aGVOYW1lc1xuICogQHJldHVybnMge0FycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IHVudXNhYmxlTmFtZXMgPSAodGhlTmFtZXMpID0+XG5cdHRoZU5hbWVzXG5cdFx0LmZpbHRlcigobmFtZSkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBuYW1lID09PSBcInN5bWJvbFwiKSByZXR1cm4gdHJ1ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5ldyBGdW5jdGlvbihgeyR7bmFtZX19YCwgXCJcIik7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQubWFwKFN0cmluZyk7XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIGxvZ2dpbmcgb2YgZXZlcnkgZnVuY3Rpb24gdGhpcyBleGVjdXRlciBnZW5lcmF0ZXMgdG8gdGhlIGNvbnNvbGUuXG4gKlxuICogQHBhcmFtIHtib29sZWFufSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3Qgc2V0RGVidWcgPSAodmFsdWUpID0+IHtcblx0REVCVUcgPSB2YWx1ZTtcbn07XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgY29kZSBjYWNoZSBvZiB0aGlzIGV4ZWN1dGVyIC0gU1BFQ0lGSUNBVElPTi5tZCA5LjMuIGBzaXplYCBpcyB0aGUgb25seSBvcHRpb25cbiAqIHRvZGF5OyBhbiBvcHRpb24gbGVmdCBvdXQgY2hhbmdlcyBub3RoaW5nLlxuICpcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9Db2RlQ2FjaGUuanMnKS5Db2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBzaXplIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuY29uc3QgZ2V0UHJvcGVydHlOYW1lcyA9IChhQ29udGV4dCkgPT4ge1xuXHRpZiAoR0xPQkFMID09PSBhQ29udGV4dCkgcmV0dXJuIFtdO1xuXHRyZXR1cm4gUmVmbGVjdC5vd25LZXlzKGFDb250ZXh0KTtcbn07XG5cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCwgY29udGV4dFByb3BlcnRpZXMpID0+IHtcblx0Ly8gQSBzeW1ib2wgaGFzIHRvIGJlIHdyaXR0ZW4gb3V0IHJhdGhlciB0aGFuIGpvaW5lZCAtIGBqb2luYCBhbG9uZSByYWlzZXMgYSBUeXBlRXJyb3IgdGhhdCBzYXlzXG5cdC8vIG5vdGhpbmcgYWJvdXQgdGhlIGNvbnRleHQgaXQgY2FtZSBmcm9tLiBXcml0dGVuIG91dCBpdCByZWFjaGVzIHRoZSBwYXR0ZXJuLCB3aGVyZSBpdCBmYWlscyB0b1xuXHQvLyBjb21waWxlIGxpa2UgYW55IG90aGVyIG5hbWUgdGhhdCBpcyBubyBpZGVudGlmaWVyLCBhbmQgZ2VuZXJhdGUoKSBuYW1lcyBpdC5cblx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGNvbnRleHRQcm9wZXJ0aWVzLm1hcChTdHJpbmcpLmpvaW4oXCIsXCIpO1xuXHRjb25zdCBjYWNoZUtleSA9IGAke2FTdGF0ZW1lbnQubGVuZ3RofTo6JHtwcm9wZXJ0eU5hbWVzfTo6JHthU3RhdGVtZW50fWA7XG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50LCBwcm9wZXJ0eU5hbWVzLCBjb250ZXh0UHJvcGVydGllcyk7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGNhY2hlS2V5LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIFRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZGVzdHJ1Y3R1cmVzIHRoZSBjb250ZXh0IGluIGl0cyBwYXJhbWV0ZXIgbGlzdCBhbmQgcnVucyB0aGUgc3RhdGVtZW50IG92ZXJcbiAqIHRoZSBsb2NhbCBiaW5kaW5ncyB0aGF0IHByb2R1Y2VzLlxuICpcbiAqICoqTm90aGluZyBpcyBjYXJyaWVkIGJhY2suKiogQSBzdGF0ZW1lbnQgdGhhdCBhc3NpZ25zIHRvIGEgY29udGV4dCBuYW1lIHdyaXRlcyBpbnRvIGEgbG9jYWxcbiAqIGJpbmRpbmcsIGFuZCB0aGF0IGJpbmRpbmcgaXMgZ29uZSB3aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIC0gc28gYSB3cml0ZSBpcyBub3QgcmVhZGFibGVcbiAqIGFmdGVyd2FyZHMgKFNQRUNJRklDQVRJT04ubWQgNi41IGxlYXZlcyB0aGF0IHRvIHRoZSBleGVjdXRlcikuIFRoYXQgaXMgYSBkZWNpc2lvbiByYXRoZXIgdGhhbiBhIGdhcDogdGhlXG4gKiB3cml0ZS1iYWNrIHRoaXMgZXhlY3V0ZXIgY2FycmllZCBiZXR3ZWVuIDIwMjYtMDktMDcgYW5kIDIwMjYtMDktMjAgY29zdCBhIGZhY3RvciBvZiBlbGV2ZW4gb24gYVxuICogY2FjaGUgbWlzcywgYmVjYXVzZSBpdCBuZWVkcyBldmVyeSBjb250ZXh0IG5hbWUgZGVjbGFyZWQgaW4gdGhlIGJvZHkgaW5zdGVhZCBvZiBsaXN0ZWQgaW4gdGhlXG4gKiBwYXJhbWV0ZXIgbGlzdC4gU3BlZWQgaXMgd2hhdCB0aGlzIGV4ZWN1dGVyIGlzIGZvciwgYW5kIGEgY29uc3VtZXIgd2hvIG5lZWRzIGEgd3JpdGUgdG8gcGVyc2lzdFxuICogcGlja3MgYGNvbnRleHQtb2JqZWN0LWV4ZWN1dGVyYC4gU2VlIGBERUNJU0lPTlMubWRgLCAyMDI2LTA5LTIwLlxuICpcbiAqIFdoYXQgc3RpbGwgcmVhY2hlcyB0aGUgY29udGV4dCBpcyBhICoqbXV0YXRpb24qKjogYGhvbGRlci5uYW1lID0gXCJhZnRlclwiYCBjaGFuZ2VzIGFuIG9iamVjdCB0aGVcbiAqIGJpbmRpbmcgYW5kIHRoZSBjb250ZXh0IGJvdGggcG9pbnQgYXQsIGFuZCBuZWVkcyBub3RoaW5nIGNhcnJpZWQgYmFjay5cbiAqXG4gKiBUaGUgY29udGV4dCBpcyBkZXN0cnVjdHVyZWQgaW4gdGhlIHBhcmFtZXRlciBsaXN0IHJhdGhlciB0aGFuIGRlY2xhcmVkIGluIHRoZSBib2R5IHNvIHRoYXQgdGhlXG4gKiBnZW5lcmF0ZWQgc291cmNlIHN0YXlzIG9uZSBsaW5lIHBlciBzdGF0ZW1lbnQgaW5zdGVhZCBvZiBvbmUgbGluZSBwZXIgY29udGV4dCBuYW1lIC0gYG5ldyBGdW5jdGlvbmBcbiAqIHBhcnNlcyB0aGF0IHNvdXJjZSBvbiBldmVyeSBjYWNoZSBtaXNzLCBhbmQgaXRzIGxlbmd0aCBpcyB3aGF0IHRoZSBtaXNzIGNvc3RzLiBJdCBhbHNvIGRlY2xhcmVzIG5vXG4gKiBuYW1lIG9mIGl0cyBvd246IHRoZSBzdGF0ZW1lbnQgY2FuIHRoZXJlZm9yZSBuZXZlciBjb2xsaWRlIHdpdGggYSBiaW5kaW5nIG9mIHRoaXMgZnVuY3Rpb24sIHdoaWNoXG4gKiBpcyB3aGF0IHRoZSByYW5kb20gc3VmZml4IHJlbW92ZWQgb24gMjAyNi0wOS0yMCB1c2VkIHRvIGd1YXJkLlxuICpcbiAqICoqTm90aGluZyBpcyBmaWx0ZXJlZCBvdXQgb2YgdGhlIHBhdHRlcm4uKiogRXZlcnkgbmFtZSB0aGUgY29udGV4dCBjYXJyaWVzIGlzIGJvdW5kLCBhIG5hbWUgdGhhdFxuICogY2Fubm90IGJlIGEgdmFyaWFibGUgaW5jbHVkZWQgLSBhIGtleSBsaWtlIGB0ZXN0LXRlc3RgLCBhIHJlc2VydmVkIHdvcmQsIGEgc3ltYm9sLCB0aGUgaW5kZXggb2YgYW5cbiAqIGFycmF5LiBTdWNoIGEgY29udGV4dCBjYW5ub3QgYmUgcnVuIG92ZXIgYnkgdGhpcyBleGVjdXRlciBhdCBhbGwsIGFuZCBkcm9wcGluZyB0aGUgbmFtZSBzaWxlbnRseVxuICogd291bGQgaGlkZSBhIHByb3BlcnR5IHRoZSBjYWxsZXIgZGVmaW5lZC4gV2hhdCB0aGlzIGV4ZWN1dGVyIG93ZXMgdGhlIGNhbGxlciBpbnN0ZWFkIGlzIGEgbWVzc2FnZVxuICogdGhhdCBzYXlzIHdoaWNoIHN0YXRlbWVudCBmYWlsZWQgYW5kIHdoaWNoIG5hbWUgZGlkIGl0LCBiZWNhdXNlIHRoZSBzdGF0ZW1lbnQgaXRzZWxmIG5lZWQgbm90XG4gKiBtZW50aW9uIHRoYXQgbmFtZSAtIHNlZSBgREVDSVNJT05TLm1kYCwgMjAyNi0wOS0yMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZVByb3BlcnR5TmFtZVN0cmluZyB0aGUgY29udGV4dCBuYW1lcywgY29tbWEgc2VwYXJhdGVkLCBhcyB0aGUgZGVzdHJ1Y3R1cmluZ1xuICogICAgICAgICAgICAgICAgIHBhdHRlcm4gc3BlbGxzIHRoZW1cbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfHN5bWJvbD59IHRoZU5hbWVzIHRoZSBzYW1lIG5hbWVzIHVud3JpdHRlbiwgZm9yIHRoZSBlcnJvciBtZXNzYWdlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQsIHRoZVByb3BlcnR5TmFtZVN0cmluZywgdGhlTmFtZXMpID0+IHtcblx0Ly8gT25seSBoZXJlLCBhbmQgdGhlcmVmb3JlIG9uY2UgcGVyIGNvbnRleHQgc2hhcGUgYW5kIHN0YXRlbWVudCByYXRoZXIgdGhhbiBvbiBldmVyeSBleGVjdXRpb246XG5cdC8vIGEgY29uc29sZSB3cml0ZSBpbiBhIGJyb3dzZXIgY29zdHMgbW9yZSB0aGFuIGEgcmVzb2x1dGlvbiBkb2VzLCBhbmQgd2FybmluZyBwZXIgZXhlY3V0aW9uIGNvc3Rcblx0Ly8gdGhpcyBleGVjdXRlciBhIGZhY3RvciBvZiBmb3VyIHRvIHR3ZW50eS1maXZlIChtZWFzdXJlZCAyMDI2LTA5LTIyLCBgbnBtIHJ1biBiZW5jaGApLlxuXHRpZiAodGhlTmFtZXMubGVuZ3RoID4gSElHSF9QUk9QRVJUWV9DT1VOVClcblx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRgSGlnaCBjb3VudCBvZiBwcm9wZXJ0aWVzIGF0IGZpcnN0IGxldmVsLCBjYW4gYmUgZGVjcmVhc2UgdGhlIHBlcmZvcm1lbmNlISBjb3VudDogJHt0aGVOYW1lcy5sZW5ndGh9YCxcblx0XHQpO1xuXG5cdGNvbnN0IGNvZGUgPSBgXG5yZXR1cm4gKGFzeW5jICh7JHt0aGVQcm9wZXJ0eU5hbWVTdHJpbmd9fSkgPT4ge1xuICAgIHRyeXtcbiAgICAgICByZXR1cm4gJHthU3RhdGVtZW50fVxuICAgIH1jYXRjaChlKXtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59KShjb250ZXh0IHx8IHt9KTtgO1xuXG5cdGlmIChERUJVRykgY29uc29sZS5sb2coXCJnZW5lcmVyYXRlZCBjb2RlOiBcXG5cIiwgY29kZSk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uKFwiY29udGV4dFwiLCBjb2RlKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGNvbnN0IHVudXNhYmxlID0gdW51c2FibGVOYW1lcyh0aGVOYW1lcyk7XG5cdFx0Ly8gbm90aGluZyB3cm9uZyB3aXRoIHRoZSBuYW1lczogdGhlIHN0YXRlbWVudCBpdHNlbGYgZG9lcyBub3QgY29tcGlsZSwgYW5kIHRoYXQgZXJyb3Igc2F5c1xuXHRcdC8vIG1vcmUgdGhhbiBhbnl0aGluZyB0aGlzIGV4ZWN1dGVyIGNvdWxkIGFkZFxuXHRcdGlmICh1bnVzYWJsZS5sZW5ndGggPT09IDApIHRocm93IGU7XG5cblx0XHR0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG5cdFx0XHRgQ29udGV4dCBwcm9wZXJ0eSAke3VudXNhYmxlLmxlbmd0aCA9PT0gMSA/IFwibmFtZVwiIDogXCJuYW1lc1wifSBcIiR7dW51c2FibGUuam9pbignXCIsIFwiJyl9XCIgY2Fubm90IGJlIHVzZWQgYXMgYSB2YXJpYWJsZSBieSAke0VYRUNVVEVSTkFNRX0sIHNvIHRoaXMgc3RhdGVtZW50IGNhbm5vdCBydW4gb3ZlciB0aGlzIGNvbnRleHQhIHN0YXRlbWVudDogJHthU3RhdGVtZW50fWAsXG5cdFx0XHR7IGNhdXNlOiBlIH0sXG5cdFx0KTtcblx0fVxufTtcblxuLyoqXG4gKiBUaGUgZXhlY3V0ZXI6IGRlc3RydWN0dXJlcyB0aGUgY29udGV4dCBpbnRvIHRoZSBwYXJhbWV0ZXJzIG9mIGEgZ2VuZXJhdGVkIGZ1bmN0aW9uLCBzbyBhXG4gKiBzdGF0ZW1lbnQgYWRkcmVzc2VzIGEgY29udGV4dCB2YWx1ZSBieSBpdHMgYmFyZSBuYW1lIC0gU1BFQ0lGSUNBVElPTi5tZCA5LjIsIGBSRUFETUUubWRgLlxuICogUmVnaXN0ZXJlZCB1bmRlciBgRVhFQ1VURVJOQU1FYCBvbiBpbXBvcnQuXG4gKlxuICogQHR5cGUge0V4ZWN1dGVyfVxuICovXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7XG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGdldFByb3BlcnR5TmFtZXMoYUNvbnRleHQpO1xuXHRcdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQsIHByb3BlcnR5TmFtZXMpO1xuXHRcdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fSxcbn0pO1xuXG5yZWdpc3RlcihFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCJpbXBvcnQgeyByZWdpc3RlciB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcblxuLyoqIFRoZSBuYW1lIHRoaXMgZXhlY3V0ZXIgaXMgcmVnaXN0ZXJlZCB1bmRlciAtIFNQRUNJRklDQVRJT04ubWQgOS4yLiAqL1xuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKCk7XG5cbi8qKlxuICogQ29uZmlndXJlcyB0aGUgY29kZSBjYWNoZSBvZiB0aGlzIGV4ZWN1dGVyIC0gU1BFQ0lGSUNBVElPTi5tZCA5LjMuIGBzaXplYCBpcyB0aGUgb25seSBvcHRpb25cbiAqIHRvZGF5OyBhbiBvcHRpb24gbGVmdCBvdXQgY2hhbmdlcyBub3RoaW5nLlxuICpcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9Db2RlQ2FjaGUuanMnKS5Db2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBzaXplIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb21waWxlcyBhIHN0YXRlbWVudCBpbnRvIGEgZnVuY3Rpb24gdGhhdCBoYW5kcyB0aGUgY29udGV4dCBvdmVyIGFzIGBjdHhgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQpID0+IHtcblx0Y29uc3QgY29kZSA9IGBcbnJldHVybiAoYXN5bmMgKGN0eCkgPT4ge1xuICAgIHRyeXtcbiAgICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoY29udGV4dCB8fCB7fSk7YDtcblxuXHQvL2NvbnNvbGUubG9nKFwiY29kZVwiLCBjb2RlKTtcblxuXHRyZXR1cm4gbmV3IEZ1bmN0aW9uKFwiY29udGV4dFwiLCBjb2RlKTtcbn07XG5cbi8qKlxuICogVGhlIGNvbXBpbGVkIGZ1bmN0aW9uIGZvciBhIHN0YXRlbWVudCwgZnJvbSB0aGUgY2FjaGUgb3IgY29tcGlsZWQgbm93IGFuZCBjYWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50KSA9PiB7XG5cblx0Y29uc3QgY2FjaGVLZXkgPSBhU3RhdGVtZW50O1xuXG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoY2FjaGVLZXksIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbi8qKlxuICogVGhlIGV4ZWN1dGVyOiBoYW5kcyB0aGUgY29udGV4dCBvdmVyIGFzIG9uZSBvYmplY3QgbmFtZWQgYGN0eGAsIHNvIGEgc3RhdGVtZW50IGFkZHJlc3NlcyBhXG4gKiBjb250ZXh0IHZhbHVlIGFzIGBjdHgudmFsdWVgIC0gU1BFQ0lGSUNBVElPTi5tZCA5LjIsIGBSRUFETUUubWRgLiBSZWdpc3RlcmVkIHVuZGVyXG4gKiBgRVhFQ1VURVJOQU1FYCBvbiBpbXBvcnQuXG4gKlxuICogQHR5cGUge0V4ZWN1dGVyfVxuICovXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7XG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCk7XG5cdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fSxcbn0pO1xuXG5yZWdpc3RlcihFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCJpbXBvcnQge3JlZ2lzdGVyfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5cbi8qKiBUaGUgbmFtZSB0aGlzIGV4ZWN1dGVyIGlzIHJlZ2lzdGVyZWQgdW5kZXIgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMi4gKi9cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcIndpdGgtc2NvcGVkLWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSgpO1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIGNvZGUgY2FjaGUgb2YgdGhpcyBleGVjdXRlciAtIFNQRUNJRklDQVRJT04ubWQgOS4zLiBgc2l6ZWAgaXMgdGhlIG9ubHkgb3B0aW9uXG4gKiB0b2RheTsgYW4gb3B0aW9uIGxlZnQgb3V0IGNoYW5nZXMgbm90aGluZy5cbiAqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgc2l6ZSBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcbn07XG5cbmxldCBpbml0aWFsQ2FsbCA9IHRydWU7XG5cbi8qKlxuICogQ29tcGlsZXMgYSBzdGF0ZW1lbnQgaW50byBhIGZ1bmN0aW9uIHRoYXQgcnVucyBpdCBpbnNpZGUgYSBgd2l0aGAgYmxvY2sgb3ZlciB0aGUgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50KSA9PiB7XG5jb25zdCBjb2RlID0gYFxuXHRyZXR1cm4gKGFzeW5jIChjb250ZXh0KSA9PiB7XG5cdFx0d2l0aChjb250ZXh0KXtcblx0XHRcdHRyeXtcblx0XHRcdFx0cmV0dXJuICR7YVN0YXRlbWVudH1cblx0XHRcdH1jYXRjaChlKXtcblx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pKGNvbnRleHQgfHwge30pO1xuYDtcblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG59O1xuXG4vKipcbiAqIFRoZSBjb21waWxlZCBmdW5jdGlvbiBmb3IgYSBzdGF0ZW1lbnQsIGZyb20gdGhlIGNhY2hlIG9yIGNvbXBpbGVkIG5vdyBhbmQgY2FjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRpZiAoRVhQUkVTU0lPTl9DQUNIRS5oYXMoYVN0YXRlbWVudCkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoYVN0YXRlbWVudCk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChhU3RhdGVtZW50LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5cblxuLyoqXG4gKiBUaGUgZXhlY3V0ZXI6IHJ1bnMgYSBzdGF0ZW1lbnQgaW5zaWRlIGEgYHdpdGhgIGJsb2NrIG92ZXIgdGhlIGNvbnRleHQsIHNvIGEgc3RhdGVtZW50IGFkZHJlc3NlcyBhXG4gKiBjb250ZXh0IHZhbHVlIGJ5IGl0cyBiYXJlIG5hbWUgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMiwgYFJFQURNRS5tZGAuIFJlZ2lzdGVyZWQgdW5kZXJcbiAqIGBFWEVDVVRFUk5BTUVgIG9uIGltcG9ydC5cbiAqXG4gKiBAZGVwcmVjYXRlZCBiZWNhdXNlIGB3aXRoYCBpczsgYW5ub3VuY2VzIGl0IG9uIHRoZSBmaXJzdCBzdGF0ZW1lbnQgaXQgcnVuc1xuICogQHR5cGUge0V4ZWN1dGVyfVxuICovXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRpZihpbml0aWFsQ2FsbCl7XG5cdFx0XHRpbml0aWFsQ2FsbCA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS53YXJuKG5ldyBFcnJvcihgV2l0aCBTY29wZWQgZXhwcmVzc2lvbiBleGVjdXRpb24gaXMgbWFya2VkIGFzIGRlcHJlY2F0ZWQuYCkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQpO1xuXHRcdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fX0pO1xucmVnaXN0ZXIoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IFwiLi9XaXRoU2NvcGVkRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBcIi4vQ29udGV4dE9iamVjdEV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgXCIuL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanNcIjtcbiIsIi8qKlxuICogVGhlIHZlcnNpb24gb2YgdGhpcyBwYWNrYWdlLlxuICpcbiAqIEdlbmVyYXRlZCBmcm9tIHBhY2thZ2UuanNvbiBieSBzY3JpcHRzL2dlbmVyYXRlLXZlcnNpb24uanMgYmVmb3JlIGV2ZXJ5IGJ1aWxkLiBEbyBub3QgZWRpdCAtXG4gKiB0aGUgbmV4dCBidWlsZCBvdmVyd3JpdGVzIGl0LlxuICpcbiAqIEBtb2R1bGUgdmVyc2lvblxuICovXG5leHBvcnQgY29uc3QgVkVSU0lPTiA9IFwiMy4wLjBcIjtcblxuZXhwb3J0IGRlZmF1bHQgVkVSU0lPTjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbmNvbnN0IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0Y29uc3QgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdGNvbnN0IG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHRjb25zdCBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlci92YWx1ZSBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0aWYoQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSkge1xuXHRcdHZhciBpID0gMDtcblx0XHR3aGlsZShpIDwgZGVmaW5pdGlvbi5sZW5ndGgpIHtcblx0XHRcdHZhciBrZXkgPSBkZWZpbml0aW9uW2krK107XG5cdFx0XHR2YXIgYmluZGluZyA9IGRlZmluaXRpb25baSsrXTtcblx0XHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0XHRpZihiaW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogZGVmaW5pdGlvbltpKytdIH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBiaW5kaW5nIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoYmluZGluZyA9PT0gMCkgeyBpKys7IH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QuaGFzT3duKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYoU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBFeGVjdXRlclJlZ2lzdHJ5IH0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBHTE9CQUwgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qc1wiO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gXCIuL3NyYy92ZXJzaW9uLmpzXCI7XG5cbkdMT0JBTC5kZWZhdWx0anMgPSBHTE9CQUwuZGVmYXVsdGpzIHx8IHt9O1xuR0xPQkFMLmRlZmF1bHRqcy5lbCA9IEdMT0JBTC5kZWZhdWx0anMuZWwgfHwge1xuXHRWRVJTSU9OLFxuXHRFeHByZXNzaW9uUmVzb2x2ZXIsXG5cdEV4ZWN1dGVyUmVnaXN0cnlcbn07XG5cbmV4cG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9