/******/ var __webpack_modules__ = ({

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

	has(key) {
		if(this.#disabled) return false;
		return this.#entryMap.has(key);
	}

	get(key) {
		if(this.#disabled) return null;
		const entry = this.#entryMap.get(key);
		if (entry) {
			entry.lastHit = ++this.#clock;
			return entry.value;
		}
		return null;
	}

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
 * object for default value
 *
 * @export
 * @class DefaultValue
 * @typedef {DefaultValue}
 */
class DefaultValue {
	/**
	 * Creates an instance of DefaultValue.
	 *
	 * @constructor
	 * @param {*} value
	 */
	constructor(value){
		this.hasValue = arguments.length == 1;
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
class Executer{

	#execution;

	/**
	 *
	 * @param {Object} option
	 * @param {Function} option.execution
	 */
	constructor({execution} = {}){
		this.#execution = execution || (() => {throw new Error("not implemented")});
	}

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
/* harmony export */   registrate: () => (/* binding */ registrate)
/* harmony export */ });
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Executer.js */ "./src/Executer.js");


const EXECUTERS = new Map();

/**
 *
 * @param {string} aName
 * @param {Executer} anExecuter
 */
const registrate = (aName, anExecuter) => {
	EXECUTERS.set(aName, anExecuter);
};

/**
 *
 * @param {string} aName
 * @returns {Executer}
 */
const getExecuter = (aName) => {
	const executer = EXECUTERS.get(aName);
	if (!executer) throw new Error(`Executer "${aName}" is not registrated!`);
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

	const name = (0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.normalize)(aName);
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

	return (0,_Utils_js__WEBPACK_IMPORTED_MODULE_7__.normalize)(aFilter);
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

const resolve = async function (aExecuter = DEFAULT_EXECUTER, aResolver, aExpression, aFilter, aDefault) {
	// 5.3: climbs in a loop rather than by recursion - one call per resolver climbed cost a promise
	// each and overflowed the stack on a deep chain. A scope no resolver of the chain carries
	// answers undefined, and the default applies to it like to any other result - see
	// SPECIFICATION.md 5.4
	if (aFilter)
		while (aResolver.name != aFilter) {
			aResolver = aResolver.parent;
			if (!aResolver) return withDefault(undefined, aDefault);
		}

	return withDefault(await execute(aExecuter, aExpression, aResolver.context), aDefault);
};

// 4.1: the first argument of a static entry point is a string, or a configuration object
const isConfiguration = (aValue) => aValue !== null && typeof aValue === "object";

// 4.1: a configuration counts as passing a default where it carries the key, whatever it holds
const defaultOf = (aConfiguration) => ("defaultValue" in aConfiguration ? aConfiguration.defaultValue : DEFAULT_NOT_DEFINED);

/**
 * ExpressionResolver
 *
 * @export
 * @class ExpressionResolver
 * @typedef {ExpressionResolver}
 */
class ExpressionResolver {
	/**
	 * @param {string} anExecuterName
	 */
	static set defaultExecuter(anExecuter) {
		if ( anExecuter instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"]) DEFAULT_EXECUTER = anExecuter;
		else DEFAULT_EXECUTER = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__["default"])(anExecuter);
		console.info(`Changed default executer for ExpressionResolver!`);
	}

	static get defaultExecuter() {
		return DEFAULT_EXECUTER;
	}

	/** @type {string|null} */
	#name = null;
	/** @type {ExpressionResolver|null} */
	#parent = null;
	/** @type {function|null} */
	#executer = null;
	/** @type {Proxy|null} */
	#context = null;
	/** @type {ResolverContextHandle|null} */
	#contextHandle = null;

	/**
	 * Creates an instance of ExpressionResolver.
	 * @date 3/10/2024 - 7:27:57 PM
	 *
	 * @constructor
	 * @param {{ context?: any; parent?: any; name?: any; executer?: (string|Executer); }} options
	 * @param {object} [options.context] where none is passed, the resolver has no context of its own - 4.2
	 * @param {ExpressionResolver} [options.parent=null]
	 * @param {?string} [options.name=null] kept trimmed; where none is passed, one is generated - 5.1
	 * @param {(string|Executer)} [options.executer] the registered name of an executer, or an
	 * `Executer` instance. A name that is not registered throws; an instance needs no registration,
	 * because it addresses the executer directly. Without the option the resolver uses
	 * `ExpressionResolver.defaultExecuter` - 4.2.
	 * @throws {TypeError} where the parent is no resolver, the context a primitive, or the name breaks
	 * the rule of 5.1 - 4.2
	 */
	constructor({ context, parent = null, name = null, executer } = {}) {
		if (parent != null && !(parent instanceof ExpressionResolver)) throw new TypeError("The option parent takes an ExpressionResolver!");
		if (context != null && typeof context !== "object" && typeof context !== "function") throw new TypeError(`The option context takes an object, not a ${typeof context}!`);
		this.#name = toName(name);

		if(executer instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"]) this.#executer =  executer;
		else if (typeof executer === "string") this.#executer = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__["default"])(executer);
		else if(parent != null) this.#executer = parent.executer;
		else this.#executer = ExpressionResolver.defaultExecuter;

		this.#parent = parent;
		this.#contextHandle = new _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__["default"](context , this.#parent ? this.#parent.contextHandle : null);
		this.#context = this.#contextHandle.proxy;
	}

	get name() {
		return this.#name;
	}

	get parent() {
		return this.#parent;
	}

	get context() {
		return this.#context;
	}

	get executer() {
		return this.#executer;
	}

	get contextHandle() {
		return this.#contextHandle;
	}

	/**
	 * get chain path
	 *
	 * @readonly
	 * @returns {string}
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
	 * get effective chain path
	 *
	 * Only the resolvers that provide a context appear, so this describes a state and not the
	 * structure - SPECIFICATION.md 5.5. Where none provides one, the answer is the empty string.
	 *
	 * @readonly
	 * @returns {string}
	 */
	get effectiveChain() {
		// a loop, not a recursion into the parent: a deep chain overflowed the stack
		let path = "";
		let resolver = this;
		while (resolver) {
			if (resolver.contextHandle.providesData) path = `/${resolver.name}${path}`;
			resolver = resolver.parent;
		}

		return path;
	}

	/**
	 * get context chain
	 *
	 * The contexts of exactly the resolvers that provide one, this resolver's first and the root's
	 * last - SPECIFICATION.md 5.5.
	 *
	 * @readonly
	 * @returns {Context[]}
	 */
	get contextChain() {
		const result = [];
		let resolver = this;
		while (resolver) {
			if (resolver.contextHandle.providesData) result.push(resolver.context);

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
			if (resolver.contextHandle.hasData(key)) return resolver;
			resolver = resolver.parent;
		}

		return null;
	}

	/**
	 * get data from context
	 *
	 * Reads along the chain from the addressed resolver by the rule of 5.2. Without a key it answers the
	 * whole context of that resolver - the proxy, so every access on it still sees the chain.
	 *
	 * @param {string} key
	 * @param {?string} filter
	 * @returns {*}
	 */
	getData(key, filter) {
		const resolver = this.#findResolver(toScope(filter));
		if (key == null) return resolver.context;

		return resolver.context[toKey(key)];
	}

	/**
	 * update data at context
	 *
	 * Without a filter the value is changed where the key lives, counting from here towards the root,
	 * and created here where no resolver carries it. With a filter the addressed resolver is the
	 * target outright - SPECIFICATION.md 6.6.
	 *
	 * @param {string} key
	 * @param {*} value
	 * @param {?string} filter
	 */
	updateData(key, value, filter) {
		const property = toKey(key);
		const scope = toScope(filter);
		const resolver = this.#findResolver(scope);

		const target = scope ? resolver : this.#resolverForKey(property) || this;
		target.context[property] = value;
	}

	/**
	 * delete data from context
	 *
	 * Removes the key from one resolver - the addressed one with a filter, and without one the first
	 * resolver carrying it, counting from here towards the root. Removing it uncovers the value of
	 * the next resolver that carries the same key - SPECIFICATION.md 6.6.
	 *
	 * @param {string} key
	 * @param {?string} filter
	 */
	deleteData(key, filter) {
		const property = toKey(key);
		const scope = toScope(filter);
		const resolver = this.#findResolver(scope);

		const target = scope ? resolver : this.#resolverForKey(property);
		if (target) delete target.context[property];
	}

	/**
	 * merge context object
	 *
	 * A shallow assignment into the context of the addressed resolver, replacing what is there and adding
	 * what is not. No search along the chain: a merged key shadows the resolvers above from here on -
	 * SPECIFICATION.md 6.6.
	 *
	 * @param {object} context
	 * @param {?string} filter
	 */
	mergeContext(context, filter) {
		const resolver = this.#findResolver(toScope(filter));
		if (context == null) return;
		if (typeof context !== "object" && typeof context !== "function") throw new TypeError(`mergeContext takes an object, not a ${typeof context}!`);

		resolver.contextHandle.mergeData(context);
	}

	/**
	 * resolved an expression string to data
	 *
	 * @async
	 * @param {string} aExpression
	 * @param {?*} aDefault
	 * @returns {Promise<*>}
	 */
	async resolve(aExpression, aDefault) {
		// 4.2: a mistake in the calling code, not a failed statement - so no warning and no default
		if (typeof aExpression !== "string") throw new TypeError(`resolve takes an expression as a string, not a ${typeof aExpression}!`);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		try {
			// 4.3: the delimited form or a bare statement, told apart by the scanner
			const { scope, statement } = (0,_ExpressionScanner_js__WEBPACK_IMPORTED_MODULE_6__.parseExpression)(aExpression);
			return await resolve(this.#executer, this, statement, scope, defaultValue);
		} catch (e) {
			// 7: the error is logged and handed on. resolve answers a value or says why it cannot,
			// and a default value covers a missing result, never an error.
			warnFailedStatement(aExpression, e);
			throw e;
		}
	}

	/**
	 * replace all expressions at a string	 *
	 * @async
	 * @param {string} aText
	 * @param {?*} aDefault
	 * @returns {Promise<*>}
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
					text += await resolve(this.#executer, this, occurrence.statement, occurrence.scope, defaultValue);
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
	 * resolve an expression string to data
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ expression, context, defaultValue, timeout }`, behind which every argument is ignored -
	 * SPECIFICATION.md 4.1. A first argument that is neither a string nor an object, and a
	 * configuration without a string under `expression`, reject with a `TypeError`.
	 *
	 * @static
	 * @async
	 * @param {string|{ expression: string, context?: object, defaultValue?: *, timeout?: number }} aExpression
	 * @param {?object} aContext
	 * @param {?*} aDefault
	 * @param {?number} aTimeout
	 * @returns {Promise<*>}
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
	 * replace expression at text
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ text, context, defaultValue, timeout }`, behind which every argument is ignored -
	 * SPECIFICATION.md 4.1. A first argument that is neither a string nor an object, and a
	 * configuration without a string under `text`, reject with a `TypeError`.
	 *
	 * @static
	 * @async
	 * @param {string|{ text: string, context?: object, defaultValue?: *, timeout?: number }} aText
	 * @param {?object} aContext
	 * @param {?*} aDefault
	 * @param {?number} aTimeout
	 * @returns {Promise<*>}
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
	 * build a resolver over a filtered copy of the context
	 *
	 * The filter is applied to the context only, never to the globals, so this is a way to hand
	 * over a cleaned context and not a sandbox.
	 *
	 * `option` carries the filter's own `deep` together with the constructor options `name`,
	 * `parent` and `executer`, which are handed on as they are.
	 *
	 * @static
	 * @param {object} arg the filter arguments, plus the whole constructor option set
	 * @param {object} arg.context
	 * @param {function} arg.propFilter
	 * @param {object} [arg.option={ deep: true, name: null, parent: null, executer: null }]
	 * @param {boolean} [arg.option.deep=true]
	 * @param {string} [arg.option.name=null]
	 * @param {ExpressionResolver} [arg.option.parent=null]
	 * @param {string} [arg.option.executer=null]
	 * @returns {ExpressionResolver}
	 */
	static buildSecure({ context, propFilter, option = { deep: true, name: null, parent: null, executer: null } }) {
		const { deep = true, name, parent, executer } = option;
		context = _default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__["default"].filter(context, propFilter, {deep});
		return new ExpressionResolver({ context, name, parent, executer });
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
const startsRegex = (aText, aIndex, theComments) => {
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

const endsLine = (aCode) => aCode === LINE_FEED || aCode === CARRIAGE_RETURN || aCode === LINE_SEPARATOR || aCode === PARAGRAPH_SEPARATOR;

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
 */
const splitScopeAndStatement = (aContent) => {
	const length = aContent.length;
	let index = 0;
	while (index < length && (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.isNameCharacter)(aContent.charCodeAt(index))) index++;

	if (index === 0 || aContent.charCodeAt(index) !== COLON || aContent.charCodeAt(index + 1) !== COLON)
		return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent) };

	return { scope: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent.substring(0, index)), statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent.substring(index + 2)) };
};

const countBackslashes = (aText, aIndex) => {
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
						const { scope, statement } = splitScopeAndStatement(aText.substring(aStart + 2, index));
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
					} else if (startsRegex(aText, index, comments)) stack.push(REGEX);
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
				if (endsLine(char)) {
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
		if (countBackslashes(aText, start) % 2 === 1) {
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
	return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aExpression) };
};

/**
 * The split of the single expression: most statements carry no "::" at all and are done after one
 * native search. Where one stands, everything before the first of them has to be a name, checked
 * backwards from it: a "::" inside a statement - a quoted one - usually has a character no name
 * carries right in front of it.
 */
const splitScopeAndStatementBySeparator = (aContent) => {
	const end = aContent.indexOf(SCOPE_SEPARATOR);
	if (end < 1) return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent) };

	for (let index = end - 1; index >= 0; index--)
		if (!(0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.isNameCharacter)(aContent.charCodeAt(index))) return { scope: null, statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent) };

	return { scope: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent.substring(0, end)), statement: (0,_Utils_js__WEBPACK_IMPORTED_MODULE_0__.normalize)(aContent.substring(end + 2)) };
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
 * Property cache for a context that is the global object itself.
 *
 * It answers like the Map it replaces: every name is present, and the value is the handle
 * holding it - never the value of the property. That is the contract of #getPropertyDef,
 * whose caller reads the property off the handle it gets back.
 *
 * Because every name is present, such a resolver answers every lookup and nothing below it is
 * reached, and ownKeys reports every own key of the global object.
 *
 * @param {ResolverContextHandle} handle
 */
const createGlobalCacheWrapper = (handle) => {
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
			// ordinary scope chain anyway (SPECIFICATION.md 6.4, 9.8).
			return [];
		},
	};
};

/**
 * Context object to handle data access
 *
 * @export
 * @class ResolverContextHandle
 */
class ResolverContextHandle {
	/** @type {Proxy|null} */
	#proxy = null;
	/** @type {ResolverContextHandle|null} */
	#parent = null;
	/** @type {object|null} */
	#data = null;
	/** @type {Map<string|symbol,ResolverContextHandle>|null} */
	#cache = null;
	/** @type {boolean} */
	#providesData = false;

	/**
	 * Creates an instance of Context.
	 *
	 * @constructor
	 * @param {object} context where none is passed, the handle holds no object at all and carries no
	 * name, not even one of Object.prototype - SPECIFICATION.md 6.3. It gets an object on the first
	 * write.
	 * @param {ResolverContextHandle} parent
	 */
	constructor(context, parent) {
		this.#data = (0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(context) ? null : context;
		this.#parent = parent ? parent : null;
		this.#providesData = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(context);

		this.#cache = this.#initPropertyCache();

		if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"] === this.#data)
			this.#proxy = this.#data;
		else {
			// The proxy answers for the whole chain, which is more than the object handed to this
			// resolver holds. A proxy may not speak that freely for a target that guarantees
			// anything about its own keys - a frozen or sealed context is where that ends in a
			// TypeError - so it gets an empty target of its own. No trap reads it; every one of
			// them works on #data and #cache.
			this.#proxy = new Proxy({}, {
				has: (data, property) => {
					//console.log("has property:", property);
					return this.#getPropertyDef(property) != null;
				},
				get: (data, property) => {
					//console.log("get property:", property);
					const proxy = this.#getPropertyDef(property);
					return proxy ? proxy.#data[property] : undefined;
				},
				set: (data, property, value) => {
					//console.log("set property:", property, "=", value);
					this.#data ??= {};
					this.#data[property] = value;
					this.#cache.set(property, this);
					this.#providesData = true;
					return true;
				},
				deleteProperty: (data, property) => {
					const propertyDef = this.#cache.get(property);
					if (propertyDef) {
						delete this.#data[property];
						this.#cache.delete(property);
					}
					return true;
				},
				getOwnPropertyDescriptor: (data, property) => {
					const proxy = this.#getPropertyDef(property);
					if (!proxy) return undefined;

					// Read through a getter rather than up front, so enumerating a context does not
					// evaluate what nobody asked for, and so a value stays live (6.2). Enumerability
					// is taken from where the property is defined - that is what keeps the members
					// of Object.prototype out of Object.keys - while configurable has to be true:
					// a proxy may not claim a fixed property its target does not have.
					const descriptor = findPropertyDescriptor(proxy.#data, property);
					return {
						get: () => proxy.#data[property],
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
	 * @readonly
	 * @type {Proxy}
	 */
	get proxy() {
		return this.#proxy;
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
	 * @param {string} key
	 * @returns {boolean}
	 */
	hasData(key) {
		return this.#cache.has(key);
	}

	/**
	 * Whether this handle provides a context: one was handed to the constructor, or a value has been
	 * written since. What the data holds decides nothing - SPECIFICATION.md 5.5.
	 *
	 * @readonly
	 * @type {boolean}
	 */
	get providesData() {
		return this.#providesData;
	}

	updateData(data) {
		this.#data = (0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data) ? null : data;
		this.#providesData = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data);
		this.#cache = this.#initPropertyCache();
	}

	mergeData(data) {
		this.#data ??= {};
		Object.assign(this.#data, data);
		this.#providesData = true;
		this.#cache = this.#initPropertyCache();
	}

	resetCache() {
		this.#cache = this.#initPropertyCache();
	}

	/**
	 *
	 * @returns {Map<string,PropertyDefinition>}
	 */
	#initPropertyCache() {
		const data = this.#data;
		if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"] === data) 
			return createGlobalCacheWrapper(this);

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
	 * @param {string} property
	 * @returns {ResolverContextHandle|null}
	 */
	#getPropertyDef(property) {
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
/* harmony export */   normalize: () => (/* binding */ normalize),
/* harmony export */   stringToHashcode: () => (/* binding */ stringToHashcode)
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
 * Trims a string, and answers null for one that is empty.
 *
 * @param {?string} value
 * @returns {?string}
 */
const normalize = (value) => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

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
 *
 * @param {boolean} value
 */
const setDebug = (value) => {
	DEBUG = value;
};

/**
 * @param {import('../CodeCache.js').CodeCacheOptions} options
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
 * afterwards (`context-write`, SPECIFICATION.md 9.7). That is a decision rather than a gap: the
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

const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
	execution: (aStatement, aContext) => {
		const propertyNames = getPropertyNames(aContext);
		const expression = getOrCreateFunction(aStatement, propertyNames);
		return expression(aContext);
	},
});

(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.registrate)(EXECUTERNAME, EXECUTER);

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




const EXECUTERNAME = "context-object-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

/**
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 */
const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

/**
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

const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
	execution: (aStatement, aContext) => {
		const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
	},
});

(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.registrate)(EXECUTERNAME, EXECUTER);

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




const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

/**
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 */
const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

let initialCall = true;

/**
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



const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({execution: (aStatement, aContext) => {
		if(initialCall){
			initialCall = false;
			console.warn(new Error(`With Scoped expression execution is marked as deprecated.`));
		}

		const expression = getOrCreateFunction(aStatement);
		return expression(aContext);
	}});
(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.registrate)(EXECUTERNAME, EXECUTER);

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





/***/ }

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ const __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	const cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	const module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	if (!(moduleId in __webpack_modules__)) {
/******/ 		delete __webpack_module_cache__[moduleId];
/******/ 		const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 		e.code = 'MODULE_NOT_FOUND';
/******/ 		throw e;
/******/ 	}
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		if(Array.isArray(definition)) {
/******/ 			var i = 0;
/******/ 			while(i < definition.length) {
/******/ 				var key = definition[i++];
/******/ 				var binding = definition[i++];
/******/ 				if(!__webpack_require__.o(exports, key)) {
/******/ 					if(binding === 0) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 					} else {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 					}
/******/ 				} else if(binding === 0) { i++; }
/******/ 			}
/******/ 		} else {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExecuterRegistry: () => (/* reexport module object */ _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   ExpressionResolver: () => (/* reexport safe */ _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/ExpressionResolver.js */ "./src/ExpressionResolver.js");
/* harmony import */ var _src_executer_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/executer/index.js */ "./src/executer/index.js");
/* harmony import */ var _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/ExecuterRegistry.js */ "./src/ExecuterRegistry.js");






})();

const __webpack_exports__ExecuterRegistry = __webpack_exports__.ExecuterRegistry;
const __webpack_exports__ExpressionResolver = __webpack_exports__.ExpressionResolver;
export { __webpack_exports__ExecuterRegistry as ExecuterRegistry, __webpack_exports__ExpressionResolver as ExpressionResolver };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLWRlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFNLHlCQUF5QixVQUFNO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQsaUVBQWUsTUFBTSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNuQnRCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYTtBQUNiLFlBQVksV0FBVztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGFBQWE7QUFDMUQsNkNBQTZDLEtBQUssYUFBYSxJQUFJLE1BQU0sTUFBTTtBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLDBCQUEwQjtBQUM1QztBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsS0FBSyxPQUFPO0FBQ3JELHdCQUF3QjtBQUN4Qix3QkFBd0I7QUFDeEI7QUFDZTtBQUNmO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRkFBcUY7QUFDckY7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLEdBQUc7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxHQUFHO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxHQUFHO0FBQ2Y7QUFDQTtBQUNB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O0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsY0FBYyxFQUFFLEtBQUs7QUFDbkM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxjQUFjLEVBQUUsS0FBSztBQUM1RTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxTQUFTO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBNkIsT0FBTztBQUNwQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxHQUFHO0FBQ2YsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtB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LE1BQU07VUFDTiwyQ0FBMkMsZ0NBQWdDO1VBQzNFO1VBQ0EsS0FBSyx5QkFBeUI7VUFDOUI7VUFDQSxHQUFHO1VBQ0g7VUFDQTtVQUNBLDBDQUEwQyx3Q0FBd0M7VUFDbEY7VUFDQTtVQUNBO1VBQ0EsRTs7Ozs7VUN0QkEsaUU7Ozs7O1VDQUE7VUFDQTtVQUNBO1VBQ0EsdURBQXVELGlCQUFpQjtVQUN4RTtVQUNBLGdEQUFnRCxhQUFhO1VBQzdELEU7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ042RDtBQUM1QjtBQUM0Qjs7QUFFYiIsInNvdXJjZXMiOlsid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9Db2RlQ2FjaGUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRGVmYXVsdFZhbHVlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0V4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0V4ZWN1dGVyUmVnaXN0cnkuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhwcmVzc2lvblJlc29sdmVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0V4cHJlc3Npb25TY2FubmVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL1Jlc29sdmVyQ29udGV4dEhhbmRsZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9VdGlscy5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9Db250ZXh0RGVjb25zdHJ1Y3RvckV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL0NvbnRleHRPYmplY3RFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9XaXRoU2NvcGVkRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC5cbiAqXG4gKiBSZXNvbHZlZCBvbmNlIHdoZW4gdGhlIG1vZHVsZSBpcyBsb2FkZWQ6IGdsb2JhbFRoaXMsIHRoZW4gZ2xvYmFsLCB3aW5kb3cgYW5kIHNlbGYgZm9yIGVuZ2luZXMgbm90XG4gKiBrbm93aW5nIGl0IHlldC4gQW4gZW1wdHkgb2JqZWN0IHdoZW4gbm9uZSBvZiB0aGVtIGV4aXN0cywgc28gcmVhZGluZyBmcm9tIGl0IG5ldmVyIHRocm93cy5cbiAqXG4gKiBAbW9kdWxlIEdsb2JhbFxuICpcbiAqIEBleGFtcGxlXG4gKiBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWZmZXIpO1xuICovXG5jb25zdCBHTE9CQUwgPSAoKCkgPT4ge1xuXHRpZih0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdGlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBnbG9iYWw7XG5cdGlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiB3aW5kb3c7XG5cdGlmKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gc2VsZjtcblx0cmV0dXJuIHt9O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgR0xPQkFMO1xuIiwiLyoqXHJcbiAqIE9ubHkgYW4gb2JqZWN0IGNhbiBjYXJyeSBhIHByb3BlcnR5LCBzbyBhIHBhdGggc3RvcHMgYXQgYSBwcmltaXRpdmUgaW5zdGVhZCBvZiBoYW5kaW5nIG91dCBhXHJcbiAqIHByb3BlcnR5IHRoYXQgY2Fubm90IGJlIHJlYWQgb3Igd3JpdHRlbi4gQW4gQXJyYXksIE1hcCBvciBEYXRlIHBhc3NlcyAtIHRoZXkgYXJlIG9iamVjdHMgYW5kIHRha2VcclxuICogYSBwcm9wZXJ0eSBsaWtlIGFueSBvdGhlciBvbmUsIHdoaWNoIGlzIHdoYXQgbWFrZXMgYSBwYXRoIGxpa2UgXCJsaXN0LjBcIiB3b3JrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHRoZSB2YWx1ZSBhIHN0ZXAgb2YgdGhlIHBhdGggcmVzb2x2ZWQgdG9cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhhdCBzdGVwXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgdGhlIHdob2xlIHBhdGgsIHRvIHRlbGwgd2hpY2ggb25lIG9mIHNldmVyYWwgc3RlcHMgZmFpbGVkXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gdGhlIHN0ZXAgY2FycmllcyBubyBvYmplY3RcclxuICovXHJcbmNvbnN0IGFzc2VydERlc2NlbmRhYmxlID0gKHZhbHVlLCBuYW1lLCBrZXkpID0+IHtcclxuXHRpZih2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpXHJcblx0XHRyZXR1cm47XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB2YWx1ZSA9PT0gbnVsbCA/IFwibnVsbFwiIDogYGEgJHt0eXBlb2YgdmFsdWV9YDtcclxuXHR0aHJvdyBuZXcgVHlwZUVycm9yKGBjYW5ub3QgZGVzY2VuZCBpbnRvIFwiJHtuYW1lfVwiIG9mIHBhdGggXCIke2tleX1cIiAtICR7dHlwZX0gaXMgbm8gb2JqZWN0YCk7XHJcbn07XHJcblxyXG4vKipcclxuICogT25lIHByb3BlcnR5IG9mIGFuIG9iamVjdCwgYWRkcmVzc2VkIGJ5IG5hbWUsIHRvZ2V0aGVyIHdpdGggdGhlIG9iamVjdCBjYXJyeWluZyBpdC5cclxuICpcclxuICogQnVpbHQgdGhyb3VnaCB7QGxpbmsgT2JqZWN0UHJvcGVydHkubG9hZH0sIHdoaWNoIHdhbGtzIGEgZG90dGVkIHBhdGggYW5kIGhhbmRzIGJhY2sgdGhlIHByb3BlcnR5IGF0XHJcbiAqIGl0cyBlbmQuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IHByb3BlcnR5ID0gT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IHtiIDogMX19LCBcImEuYlwiKTtcclxuICogcHJvcGVydHkudmFsdWU7ICAgICAgLy8gMVxyXG4gKiBwcm9wZXJ0eS52YWx1ZSA9IDI7ICAvLyB3cml0ZXMgaW50byB0aGUgb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYmplY3RQcm9wZXJ0eSB7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgY2FycnlpbmcgaXRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihrZXksIGNvbnRleHQpe1xyXG5cdFx0dGhpcy5rZXkgPSBrZXk7XHJcblx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hldGhlciB0aGUga2V5IGlzIHJlYWNoYWJsZSBvbiB0aGUgY29udGV4dCBhdCBhbGwuXHJcblx0ICpcclxuXHQgKiBUaGlzIGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBwcm90b3R5cGUgY2hhaW4sIG5vdCBvbmx5IGZvciBvd24gcHJvcGVydGllcyAtIGxvYWQoe30sIFwidG9TdHJpbmdcIilcclxuXHQgKiByZXBvcnRzIHRydWUuIFRoYXQgaXMgZGVsaWJlcmF0ZTogYSBwYXRoIG1heSBhZGRyZXNzIGEgcHJvdG90eXBlIGFuZCBleHRlbmQgaXQsIHNvIGFuIGluaGVyaXRlZFxyXG5cdCAqIGtleSBpcyBhIGtleSBsaWtlIGFueSBvdGhlciBoZXJlLiBVc2UgaGFzVmFsdWUgdG8gYXNrIHdoZXRoZXIgc29tZXRoaW5nIGlzIGFjdHVhbGx5IHN0b3JlZC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGdldCBrZXlEZWZpbmVkKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5rZXkgaW4gdGhpcy5jb250ZXh0O1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBXaGV0aGVyIHNvbWV0aGluZyBpcyBzdG9yZWQgdW5kZXIgdGhlIGtleS4gT25seSB1bmRlZmluZWQgY291bnRzIGFzIG5vdGhpbmcgLSAwLCBcIlwiLCBmYWxzZSBhbmRcclxuXHQgKiBudWxsIGFyZSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRnZXQgaGFzVmFsdWUoKXtcclxuXHRcdHJldHVybiB0eXBlb2YgdGhpcy5jb250ZXh0W3RoaXMua2V5XSAhPT0gXCJ1bmRlZmluZWRcIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm5zIHsqfSB0aGUgc3RvcmVkIHZhbHVlLCB1bmRlZmluZWQgd2hlbiB0aGVyZSBpcyBub25lXHJcblx0ICovXHJcblx0Z2V0IHZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jb250ZXh0W3RoaXMua2V5XTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7Kn0gZGF0YVxyXG5cdCAqL1xyXG5cdHNldCB2YWx1ZShkYXRhKXtcclxuXHRcdHRoaXMuY29udGV4dFt0aGlzLmtleV0gPSBkYXRhO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkcyBhIHZhbHVlIG5leHQgdG8gd2hhdCBpcyBhbHJlYWR5IHRoZXJlOiB3cml0ZXMgaXQgd2hlbiB0aGUga2V5IGhvbGRzIG5vdGhpbmcsIHR1cm5zIHRoZVxyXG5cdCAqIHZhbHVlIGludG8gYW4gYXJyYXkgb2YgYm90aCB3aGVuIGl0IGhvbGRzIG9uZSwgYW5kIHB1c2hlcyBvbnRvIHRoZSBhcnJheSB3aGVuIGl0IGhvbGRzIG9uZVxyXG5cdCAqIGFscmVhZHkuXHJcblx0ICpcclxuXHQgKiBUaGUgdmFsdWUgaXRzZWxmIGlzIG5vdCBsb29rZWQgYXQgLSBhcHBlbmRpbmcgdW5kZWZpbmVkIHB1dHMgdW5kZWZpbmVkIGludG8gdGhlIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHsqfSBkYXRhXHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDE7ICAgLy8ge2tleSA6IDF9XHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMjsgICAvLyB7a2V5IDogWzEsIDJdfVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDM7ICAgLy8ge2tleSA6IFsxLCAyLCAzXX1cclxuXHQgKi9cclxuXHRzZXQgYXBwZW5kKGRhdGEpIHtcclxuXHRcdGlmKCF0aGlzLmhhc1ZhbHVlKVxyXG5cdFx0XHR0aGlzLnZhbHVlID0gZGF0YTtcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRcdGlmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpXHJcblx0XHRcdFx0dmFsdWUucHVzaChkYXRhKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMudmFsdWUgPSBbdGhpcy52YWx1ZSwgZGF0YV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBrZXkgZnJvbSB0aGUgb2JqZWN0LiBEb2VzIG5vdGhpbmcgd2hlbiBpdCBpcyBub3QgdGhlcmUuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dm9pZH1cclxuXHQgKi9cclxuXHRyZW1vdmUoKXtcclxuXHRcdGRlbGV0ZSB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBMb2FkcyB0aGUgcHJvcGVydHkgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMuIEV2ZXJ5IHBhcnQgb2YgdGhlIHBhdGggaXMgdHJpbW1lZCwgc28gXCIgYSAuIGIgXCJcclxuXHQgKiBhZGRyZXNzZXMgdGhlIHNhbWUgcHJvcGVydHkgYXMgXCJhLmJcIi5cclxuXHQgKlxyXG5cdCAqIEEgbWlzc2luZyBzdGVwIGlzIGNyZWF0ZWQgd2l0aCBjcmVhdGUsIG90aGVyd2lzZSB0aGUgcGF0aCBpcyByZXBvcnRlZCBhcyBub3QgbG9hZGFibGUuIEEgc3RlcFxyXG5cdCAqIGhvbGRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0IGNhbm5vdCBiZSB3YWxrZWQgaW50byBhdCBhbGwgLSB0aGF0IGlzIGEgYnJva2VuIHBhdGgsIG5vdCBhXHJcblx0ICogbWlzc2luZyBvbmUsIGFuZCBpdCBpcyByZXBvcnRlZCBhcyBhbiBlcnJvciByZWdhcmRsZXNzIG9mIGNyZWF0ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRoZSBvYmplY3QgdG8gd2Fsa1xyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbmFtZSBvZiB0aGUgcHJvcGVydHksIGEgZG90dGVkIHBhdGggYWRkcmVzc2VzIGEgbmVzdGVkIG9uZVxyXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NyZWF0ZT10cnVlXSBjcmVhdGUgYSBtaXNzaW5nIHN0ZXAgb24gdGhlIHdheVxyXG5cdCAqIEByZXR1cm5zIHtPYmplY3RQcm9wZXJ0eXxudWxsfSBudWxsIHdoZW4gYSBzdGVwIGlzIG1pc3NpbmcgYW5kIGNyZWF0ZSBpcyBmYWxzZVxyXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiBhIHN0ZXAgb2YgdGhlIHBhdGggaG9sZHMgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0XHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiB7YiA6IDF9fSwgXCJhLmJcIikudmFsdWU7ICAgLy8gMVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2xpc3QgOiBbMSwgMl19LCBcImxpc3QuMVwiKS52YWx1ZTsgICAvLyAyLCBhbiBhcnJheSBpcyBhbiBvYmplY3RcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHt9LCBcImEuYlwiLCBmYWxzZSk7ICAgICAgICAgICAgIC8vIG51bGxcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDogMH0sIFwiYS5iXCIpOyAgICAgICAgICAgICAgIC8vIHRocm93cywgMCBpcyBubyBvYmplY3RcclxuXHQgKi9cclxuXHRzdGF0aWMgbG9hZChkYXRhLCBrZXksIGNyZWF0ZT10cnVlKSB7XHJcblx0XHRsZXQgY29udGV4dCA9IGRhdGE7XHJcblx0XHRjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKTtcclxuXHRcdGxldCBuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdHdoaWxlKGtleXMubGVuZ3RoID4gMCl7XHJcblx0XHRcdGlmKHR5cGVvZiBjb250ZXh0W25hbWVdID09PSBcInVuZGVmaW5lZFwiIHx8IGNvbnRleHRbbmFtZV0gPT09IG51bGwpe1xyXG5cdFx0XHRcdGlmKCFjcmVhdGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdFx0Y29udGV4dFtuYW1lXSA9IHt9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGFzc2VydERlc2NlbmRhYmxlKGNvbnRleHRbbmFtZV0sIG5hbWUsIGtleSk7XHJcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0W25hbWVdO1xyXG5cdFx0XHRuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3IE9iamVjdFByb3BlcnR5KG5hbWUsIGNvbnRleHQpO1xyXG5cdH1cclxufTsiLCIvKipcclxuICogVXRpbGl0aWVzIHRvIGluc3BlY3QsIGNvbXBhcmUsIG1lcmdlIGFuZCBmaWx0ZXIgamF2YXNjcmlwdCBvYmplY3RzLlxyXG4gKlxyXG4gKiBTZXZlcmFsIGZ1bmN0aW9ucyBzaGFyZSBvbmUgbm90aW9uIG9mIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZSBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXBcclxuICogYW5kIFNldC4ge0BsaW5rIGlzUG9qb30gZGVjaWRlcyB3aGV0aGVyIGEgdmFsdWUgc3RheXMgd2l0aGluIGl0LCB7QGxpbmsgZXF1YWxQb2pvfSBjb21wYXJlcyB0aG9zZVxyXG4gKiB0eXBlcyBieSB2YWx1ZSwgYW5kIHtAbGluayBtZXJnZX0gdHJlYXRzIGV2ZXJ5dGhpbmcgb3V0c2lkZSBvZiBpdCBhcyBhIHZhbHVlIHRvIGJlIHJlcGxhY2VkLlxyXG4gKlxyXG4gKiBAbW9kdWxlIE9iamVjdFV0aWxzXHJcbiAqL1xyXG5pbXBvcnQgT2JqZWN0UHJvcGVydHkgZnJvbSBcIi4vT2JqZWN0UHJvcGVydHkuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxBcnJheSA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCBsZW5ndGggPSBhLmxlbmd0aDtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoIWludGVybmFsRXF1YWxQb2pvKGFbaV0sIGJbaV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgc2V0IGlzIHVub3JkZXJlZCwgc28gZXZlcnkgZW50cnkgb2YgYSBoYXMgdG8gZmluZCBpdHMgb3duIHBhcnRuZXIgaW4gYi5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtTZXR9IGFcclxuICogQHBhcmFtIHtTZXR9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxTZXQgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChhLnNpemUgIT09IGIuc2l6ZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCByZW1haW5pbmcgPSBBcnJheS5mcm9tKGIpO1xyXG5cdGZvciAoY29uc3QgZW50cnlBIG9mIGEpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gcmVtYWluaW5nLmZpbmRJbmRleCgoZW50cnlCKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhlbnRyeUEsIGVudHJ5Qiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBtYXAgaXMgdW5vcmRlcmVkIGFzIHdlbGwgYW5kIGl0cyBrZXlzIG1heSBiZSBvYmplY3RzLCBzbyB0aGUga2V5cyBnZXQgY29tcGFyZWQgYnkgdmFsdWUgdG9vLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge01hcH0gYVxyXG4gKiBAcGFyYW0ge01hcH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE1hcCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHJlbWFpbmluZyA9IEFycmF5LmZyb20oYik7XHJcblx0Zm9yIChjb25zdCBba2V5QSwgdmFsdWVBXSBvZiBhKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IHJlbWFpbmluZy5maW5kSW5kZXgoKFtrZXlCLCB2YWx1ZUJdKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhrZXlBLCBrZXlCLCBzZWVuKSAmJiBpbnRlcm5hbEVxdWFsUG9qbyh2YWx1ZUEsIHZhbHVlQiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIG9iamVjdHMgYnkgcHJvdG90eXBlIGFuZCBieSB0aGVpciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE9iamVjdCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihhKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHByb3BlcnRpZXNBID0gT2JqZWN0LmtleXMoYSk7XHJcblx0Y29uc3QgcHJvcGVydGllc0IgPSBPYmplY3Qua2V5cyhiKTtcclxuXHRpZiAocHJvcGVydGllc0EubGVuZ3RoICE9PSBwcm9wZXJ0aWVzQi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Zm9yIChjb25zdCBrZXkgb2YgcHJvcGVydGllc0EpIHtcclxuXHRcdC8vIGVxdWFsIGtleSBjb3VudHMgYWxvbmUgd291bGQgbGV0IHt4OjEsIHk6dW5kZWZpbmVkfSBwYXNzIGFnYWluc3Qge3g6MSwgejp1bmRlZmluZWR9XHJcblx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpKSByZXR1cm4gZmFsc2U7XHJcblx0XHRpZiAoIWludGVybmFsRXF1YWxQb2pvKGFba2V5XSwgYltrZXldLCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBjeWNsaWMgc3RydWN0dXJlIGNhbiBvbmx5IGJlIGRlY2lkZWQgY28taW5kdWN0aXZlbHk6IGEgcGFpciBhbHJlYWR5IHVuZGVyIGNvbXBhcmlzb24gY291bnRzIGFzXHJcbiAqIGVxdWFsLCBvdGhlcndpc2UgdGhlIHdhbGsgd291bGQgbmV2ZXIgY29tZSBiYWNrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgd2hlbiB0aGlzIHBhaXIgaXMgYWxyZWFkeSBiZWluZyBjb21wYXJlZCBmdXJ0aGVyIHVwIHRoZSBzdGFja1xyXG4gKi9cclxuY29uc3QgaXNDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0cmV0dXJuICEhcGFydG5lcnMgJiYgcGFydG5lcnMuaGFzKGIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5vdGVzIGEgcGFpciBhcyBiZWluZyBjb21wYXJlZCwgc28gYSBjeWNsZSBydW5uaW5nIHRocm91Z2ggaXQgdGVybWluYXRlcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuY29uc3QgcmVtZW1iZXJDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0aWYgKHBhcnRuZXJzKSBwYXJ0bmVycy5hZGQoYik7XHJcblx0ZWxzZSBzZWVuLnNldChhLCBuZXcgV2Vha1NldChbYl0pKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLlxyXG4gKlxyXG4gKiBWYWx1ZUhlbHBlci5ub1ZhbHVlIGFuc3dlcnMgdGhlIHNhbWUgcXVlc3Rpb24uIEJvdGggYXJlIGtlcHQgb24gcHVycG9zZSwgc28gVmFsdWVIZWxwZXIgc3RheXMgZnJlZVxyXG4gKiBvZiBhIGRlcGVuZGVuY3kgb24gdGhpcyBtb2R1bGUgLSBzZWUgdGhlIG5vdGUgdGhlcmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzTnVsbE9yVW5kZWZpbmVkID0gKG9iamVjdCkgPT4ge1xyXG5cdHJldHVybiBvYmplY3QgPT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ID09PSBcInVuZGVmaW5lZFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUuXHJcbiAqXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBjb3VudCBhcyBwcmltaXRpdmVzLiBBIHN5bWJvbCBkb2VzIG5vdCAtIGl0IGlzIHRyZWF0ZWQgYXMgYW4gb3BhcXVlIHZhbHVlXHJcbiAqIHRocm91Z2hvdXQgdGhpcyBtb2R1bGUsIHNvIHRoYXQge0BsaW5rIGlzUG9qb30ga2VlcHMgcmVqZWN0aW5nIGl0IGFzIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB0eXBlb2Ygb2JqZWN0O1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0Y2FzZSBcIm51bWJlclwiOlxyXG5cdFx0Y2FzZSBcImJpZ2ludFwiOlxyXG5cdFx0Y2FzZSBcImJvb2xlYW5cIjpcclxuXHRcdGNhc2UgXCJzdHJpbmdcIjpcclxuXHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhbiBvYmplY3QuXHJcbiAqXHJcbiAqIEV2ZXJ5IG9iamVjdCBjb3VudHMsIEFycmF5LCBNYXAsIERhdGUgYW5kIGNsYXNzIGluc3RhbmNlcyBpbmNsdWRlZC4gVXNlIHtAbGluayBpc1Bvam99IHRvIGFzayBmb3JcclxuICogYSBzaW1wbGUgZGF0YSBvYmplY3QgaW5zdGVhZC5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNPYmplY3QgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIHZhbHVlcyBieSB2YWx1ZS5cclxuICpcclxuICogVGhlIHR5cGVzIGNvbXBhcmVkIGJ5IHZhbHVlIGFyZSB0aGUgb25lcyB7QGxpbmsgaXNQb2pvfSBhY2NlcHRzIGFzIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZVxyXG4gKiBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXAgYW5kIFNldC4gQSBEYXRlIGlzIGNvbXBhcmVkIGJ5IGl0cyB0aW1lLCBhIFJlZ0V4cCBieSBzb3VyY2UgYW5kXHJcbiAqIGZsYWdzLiBTZXQgYW5kIE1hcCBhcmUgdW5vcmRlcmVkLCBzbyB0aGVpciBlbnRyaWVzIGFyZSBtYXRjaGVkIGJ5IHZhbHVlIGluc3RlYWQgb2YgYnkgcG9zaXRpb24sXHJcbiAqIGFuZCB0aGUga2V5cyBvZiBhIE1hcCB0YWtlIHBhcnQgaW4gdGhhdCBjb21wYXJpc29uLlxyXG4gKlxyXG4gKiBTaW1wbGUgb2JqZWN0cyBhbmQgY2xhc3MgaW5zdGFuY2VzIG5lZWQgdGhlIHNhbWUgcHJvdG90eXBlIGFuZCB0aGUgc2FtZSBvd24gZW51bWVyYWJsZVxyXG4gKiBwcm9wZXJ0aWVzLiBFdmVyeSBvdGhlciBvYmplY3QgLSBFcnJvciwgUHJvbWlzZSwgV2Vha01hcCBhbmQgdGhlIGxpa2UgLSBrZWVwcyBpdHMgc3RhdGUgb3V0IG9mXHJcbiAqIHJlYWNoLCBzbyB0aG9zZSBjb21wYXJlIGJ5IGlkZW50aXR5IG9ubHkuIEZ1bmN0aW9ucyBhbmQgc3ltYm9scyBkbyBhcyB3ZWxsLlxyXG4gKlxyXG4gKiBDeWNsaWMgc3RydWN0dXJlcyBhcmUgc3VwcG9ydGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IGFcclxuICogQHBhcmFtIHsqfSBiXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBlcXVhbFBvam8oe2EgOiBbMSwgMl19LCB7YSA6IFsxLCAyXX0pOyAgICAgICAgICAgICAgIC8vIHRydWVcclxuICogZXF1YWxQb2pvKG5ldyBTZXQoWzEsIDJdKSwgbmV3IFNldChbMiwgMV0pKTsgICAgICAgICAvLyB0cnVlLCBhIHNldCBpcyB1bm9yZGVyZWRcclxuICogZXF1YWxQb2pvKG5ldyBEYXRlKDApLCBuZXcgRGF0ZSgxKSk7ICAgICAgICAgICAgICAgICAvLyBmYWxzZVxyXG4gKiBlcXVhbFBvam8obmV3IEVycm9yKFwieFwiKSwgbmV3IEVycm9yKFwieFwiKSk7ICAgICAgICAgICAvLyBmYWxzZSwgY29tcGFyZWQgYnkgaWRlbnRpdHlcclxuICovXHJcbmV4cG9ydCBjb25zdCBlcXVhbFBvam8gPSAoYSwgYikgPT4gaW50ZXJuYWxFcXVhbFBvam8oYSwgYiwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG5cclxuLyoqXHJcbiogQHBhcmFtIHsqfSBhXHJcbiAqIEBwYXJhbSB7Kn0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gaW50ZXJuYWwsIHRyYWNrcyB0aGUgcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpbnRlcm5hbEVxdWFsUG9qbyA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IGlzTnVsbE9yVW5kZWZpbmVkKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHRpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XHJcblx0aWYgKGlzUHJpbWl0aXZlKGEpIHx8IGlzUHJpbWl0aXZlKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHJcblx0Y29uc3QgdHlwZUEgPSB0eXBlb2YgYTtcclxuXHRpZiAodHlwZUEgIT09IHR5cGVvZiBiKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHR5cGVBICE9PSBcIm9iamVjdFwiKSByZXR1cm4gYSA9PT0gYjsgLy8gZnVuY3Rpb24gYW5kIHN5bWJvbFxyXG5cclxuXHRpZiAoaXNDb21wYXJpbmcoc2VlbiwgYSwgYikpIHJldHVybiB0cnVlO1xyXG5cdHJlbWVtYmVyQ29tcGFyaW5nKHNlZW4sIGEsIGIpO1xyXG5cclxuXHRpZihhIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuICBiIGluc3RhbmNlb2YgRGF0ZSA/IE9iamVjdC5pcyhhLmdldFRpbWUoKSwgYi5nZXRUaW1lKCkpIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gYiBpbnN0YW5jZW9mIFJlZ0V4cCA/IChhLnNvdXJjZSA9PT0gYi5zb3VyY2UgJiYgYS5mbGFncyA9PT0gYi5mbGFncykgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIGIgaW5zdGFuY2VvZiBBcnJheSA/IGVxdWFsQXJyYXkoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBTZXQpIHJldHVybiBiIGluc3RhbmNlb2YgU2V0ID8gZXF1YWxTZXQoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBNYXApIHJldHVybiBiIGluc3RhbmNlb2YgTWFwID8gZXF1YWxNYXAoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBmYWxzZTtcdFxyXG5cdGVsc2UgcmV0dXJuIGVxdWFsT2JqZWN0KGEsIGIsIHNlZW4pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgcGxhaW4gb2JqZWN0IG93bnMgZWl0aGVyIG5vIHByb3RvdHlwZSBhdCBhbGwgb3IgYSBwcm90b3R5cGUgdGhhdCBpdHNlbGYgaGFzIG5vbmUuIENoZWNraW5nIHRoZVxyXG4gKiBjaGFpbiBsZW5ndGggaW5zdGVhZCBvZiBjb21wYXJpbmcgYWdhaW5zdCBPYmplY3QucHJvdG90eXBlIGtlZXBzIHRoaXMgd29ya2luZyBhY3Jvc3MgcmVhbG1zLFxyXG4gKiB3aGVyZSBhbiBpZnJhbWUgYnJpbmdzIGl0cyBvd24gT2JqZWN0LnByb3RvdHlwZS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSBvYmplY3RcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xyXG5cdGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xyXG5cdHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvdHlwZSkgPT09IG51bGw7XHJcbn07XHJcblxyXG4vKipcclxuICogV2Fsa3MgYSB2YWx1ZSBhbmQgZGVjaWRlcyB3aGV0aGVyIGV2ZXJ5dGhpbmcgcmVhY2hhYmxlIGZyb20gaXQgaXMgZGF0YS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1dlYWtTZXR9IFtzZWVuXSB2YWx1ZXMgYWxyZWFkeSB3YWxrZWQsIGNsb3NlcyBjeWNsZXNcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFWYWx1ZSA9ICh2YWx1ZSwgc2VlbiA9IG5ldyBXZWFrU2V0KCkpID0+IHtcclxuXHRpZiAoaXNQcmltaXRpdmUodmFsdWUpKSByZXR1cm4gdHJ1ZTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB0cnVlO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0aWYgKHNlZW4uaGFzKHZhbHVlKSkgcmV0dXJuIHRydWU7XHJcblx0c2Vlbi5hZGQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIHZhbHVlLmV2ZXJ5KChlbnRyeSkgPT4gaXNEYXRhVmFsdWUoZW50cnksIHNlZW4pKTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkge1xyXG5cdFx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShrZXksIHNlZW4pIHx8ICFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKVxyXG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBjbGFzcyBpbnN0YW5jZXMgYW5kIGV2ZXJ5IG90aGVyIGV4b3RpYyBvYmplY3RcclxuXHRlbHNlIHtcclxuXHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKHZhbHVlW2tleV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBpcyBhIHB1cmUgZGF0YSBvYmplY3QuXHJcbiAqXHJcbiAqIFRoZSBvYmplY3QgaXRzZWxmIGhhcyB0byBiZSBhIHNpbXBsZSBvYmplY3QgLSBubyBBcnJheSwgTWFwIG9yIHNvbWV0aGluZyBlbHNlLiBFdmVyeSB2YWx1ZVxyXG4gKiByZWFjaGFibGUgZnJvbSBpdCBoYXMgdG8gYmUgZGF0YSBhcyB3ZWxsOiBwcmltaXRpdmVzLCBzaW1wbGUgb2JqZWN0cywgQXJyYXksIERhdGUsIFJlZ0V4cCwgTWFwIG9yXHJcbiAqIFNldC4gRnVuY3Rpb25zIGFuZCBjbGFzcyBpbnN0YW5jZXMgYXJlIHJlamVjdGVkIGF0IGFueSBkZXB0aCwgaW5jbHVkaW5nIGluc2lkZSBhcnJheXMgYW5kIGluc2lkZVxyXG4gKiB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGEgTWFwIG9yIFNldC5cclxuICpcclxuICogT25seSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBpbnNwZWN0ZWQuIEN5Y2xpYyByZWZlcmVuY2VzIGFyZSBhbGxvd2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGlzUG9qbyh7YSA6IHtiIDogWzEsIG5ldyBEYXRlKCldfX0pOyAgIC8vIHRydWVcclxuICogaXNQb2pvKHthIDogKCkgPT4ge319KTsgICAgICAgICAgICAgICAgLy8gZmFsc2UsIGEgZnVuY3Rpb24gaXMgbm8gZGF0YVxyXG4gKiBpc1Bvam8oe2EgOiBbe2IgOiBuZXcgRm9vKCl9XX0pOyAgICAgICAvLyBmYWxzZSwgcmVqZWN0ZWQgYXQgYW55IGRlcHRoXHJcbiAqIGlzUG9qbyhbXSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbHNlLCB0aGUgb2JqZWN0IGl0c2VsZiBoYXMgdG8gYmUgYSBzaW1wbGUgb25lXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNQb2pvID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChpc051bGxPclVuZGVmaW5lZChvYmplY3QpIHx8ICFpc1BsYWluT2JqZWN0KG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIGlzRGF0YVZhbHVlKG9iamVjdCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwZW5kcyBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIG9iamVjdC4gSWYgdGhlIHByb3BlcnR5IGFscmVhZHkgaG9sZHMgYSB2YWx1ZSwgaXQgaXMgY29udmVydGVkXHJcbiAqIGludG8gYW4gYXJyYXkgY2FycnlpbmcgYm90aC4gQW4gdW5kZWZpbmVkIHZhbHVlIGlzIGlnbm9yZWQuXHJcbiAqXHJcbiAqIFRoZSBrZXkgbWF5IGFkZHJlc3MgYSBuZXN0ZWQgcHJvcGVydHkgYnkgYSBkb3R0ZWQgcGF0aCwgbWlzc2luZyBzdGVwcyBhcmUgY3JlYXRlZCBvbiB0aGUgd2F5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYUtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMgYSBuZXN0ZWQgb25lXHJcbiAqIEBwYXJhbSB7Kn0gYURhdGEgcHJvcGVydHkgdmFsdWVcclxuICogQHBhcmFtIHtvYmplY3R9IGFPYmplY3QgdGhlIG9iamVjdCB0byBhcHBlbmQgdGhlIHByb3BlcnR5IHRvXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSBjaGFuZ2VkIG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBhcHBlbmQoXCJhXCIsIDEsIHt9KTsgICAgICAgICAgICAgLy8ge2EgOiAxfVxyXG4gKiBhcHBlbmQoXCJhXCIsIDIsIHthIDogMX0pOyAgICAgICAgLy8ge2EgOiBbMSwgMl19XHJcbiAqIGFwcGVuZChcImEuYlwiLCAxLCB7fSk7ICAgICAgICAgICAvLyB7YSA6IHtiIDogMX19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYXBwZW5kID0gKGFLZXksIGFEYXRhLCBhT2JqZWN0KSA9PiB7XHJcblx0aWYgKHR5cGVvZiBhRGF0YSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0Y29uc3QgcHJvcGVydHkgPSBPYmplY3RQcm9wZXJ0eS5sb2FkKGFPYmplY3QsIGFLZXksIHRydWUpO1xyXG5cdFx0cHJvcGVydHkuYXBwZW5kID0gYURhdGE7XHJcblx0fVxyXG5cdHJldHVybiBhT2JqZWN0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE93biBlbnVtZXJhYmxlIGtleXMsIHN0cmluZ3MgYW5kIHN5bWJvbHMgYWxpa2UgLSB0aGUgc2FtZSBzZXQgT2JqZWN0LmFzc2lnbiBjb3BpZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gc291cmNlXHJcbiAqIEByZXR1cm5zIHtBcnJheTxzdHJpbmd8c3ltYm9sPn1cclxuICovXHJcbmNvbnN0IGFzc2lnbmFibGVLZXlzID0gKHNvdXJjZSkgPT4ge1xyXG5cdGNvbnN0IG9iamVjdCA9IE9iamVjdChzb3VyY2UpO1xyXG5cdHJldHVybiBSZWZsZWN0Lm93bktleXMob2JqZWN0KS5maWx0ZXIoKGtleSkgPT4gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwga2V5KSk7XHJcbn07XHJcblxyXG4vKipcclxuICogTWVyZ2VzIG9iamVjdHMgaW50byBhIHRhcmdldCBvYmplY3QgLSBhIHJlY3Vyc2l2ZSBPYmplY3QuYXNzaWduLiBJdCBzdGVwcyBpbnRvIG9iamVjdHMgYW5kIHN1YlxyXG4gKiBvYmplY3RzLiBFdmVyeSBvdGhlciB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgdmFsdWUgZnJvbSB0aGUgc291cmNlIG9iamVjdC5cclxuICpcclxuICogTGlrZSBPYmplY3QuYXNzaWduIGl0IGNvcGllcyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIC0gc3RyaW5nIGFuZCBzeW1ib2wga2V5cyBhbGlrZSAtLCBpZ25vcmVzXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBzb3VyY2VzIGFuZCByZXR1cm5zIHRoZSB0YXJnZXQuIFVubGlrZSBPYmplY3QuYXNzaWduIGl0IHN0ZXBzIGludG8gYSBwcm9wZXJ0eVxyXG4gKiB3aGVuIHRhcmdldCBhbmQgc291cmNlIGJvdGggaG9sZCBhbiBvYmplY3QsIGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0LlxyXG4gKlxyXG4gKiBBIGNsYXNzIGluc3RhbmNlIGNvdW50cyBhcyBhbiBvYmplY3QgaGVyZSBhbmQgaXMgbWVyZ2VkIHByb3BlcnR5IGJ5IHByb3BlcnR5IGp1c3QgbGlrZSBhIHNpbXBsZVxyXG4gKiBvbmUuIFRoZSB0YXJnZXQga2VlcHMgaXRzIG93biBwcm90b3R5cGUsIG9ubHkgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHNvdXJjZSBhcmUgYXBwbGllZCB0byBpdCAtIGFcclxuICogbWVyZ2UgbmV2ZXIgdHVybnMgdGhlIHRhcmdldCBpbnRvIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcyBvZiB0aGUgc291cmNlLlxyXG4gKlxyXG4gKiBBbiBBcnJheSwgU2V0LCBNYXAsIERhdGUgb3IgUmVnRXhwIGlzIGFsd2F5cyByZXBsYWNlZCBhcyBhIHdob2xlLCBuZXZlciBtZXJnZWQgZW50cnkgYnkgZW50cnkuXHJcbiAqIFRoYXQgYWxyZWFkeSBhcHBsaWVzIHdoZW4gb25seSBvbmUgb2YgYm90aCBzaWRlcyBob2xkcyBvbmUuIFRoZSByZXN1bHQgdGhlcmVmb3JlIGNhcnJpZXMgdGhlXHJcbiAqIGNvbnRhaW5lciBvZiB0aGUgc291cmNlIHdpdGggaXRzIG93biBsZW5ndGggLSBub3RoaW5nIG9mIHRoZSB0YXJnZXQgc3Vydml2ZXMgaXQsIG5vdCBldmVuIGFuXHJcbiAqIG9iamVjdCBzaXR0aW5nIGF0IHRoZSBzYW1lIGluZGV4IG9yIHVuZGVyIHRoZSBzYW1lIGtleS5cclxuICpcclxuICogQSBrZXkgd2hvc2UgdmFsdWUgaXMgYSBzeW1ib2wgaXMgc2tpcHBlZCwgb24gdGhlIHRhcmdldCBzaWRlIGFzIHdlbGwgYXMgb24gdGhlIHNvdXJjZSBzaWRlLiBBXHJcbiAqIHN5bWJvbCBjYXJyaWVzIG5vIGRhdGEsIHNvIHN1Y2ggYSBwcm9wZXJ0eSBpcyBsZWZ0IHVudG91Y2hlZC5cclxuICpcclxuICogVGhlIGtleSBfX3Byb3RvX18gaXMgc2tpcHBlZC4gT2JqZWN0LmFzc2lnbiB3b3VsZCBvbmx5IHJlcG9pbnQgdGhlIHByb3RvdHlwZSBvZiB0aGUgdGFyZ2V0LCBidXRcclxuICogbWVyZ2luZyBpbnRvIGl0IHdvdWxkIHdhbGsgaW50byBPYmplY3QucHJvdG90eXBlIGFuZCBsZWFrIGludG8gZXZlcnkgb2JqZWN0LlxyXG4gKlxyXG4gKiBUaGUgdGFyZ2V0IGlzIG1vZGlmaWVkIGluIHBsYWNlLiBBIHN1YiBvYmplY3Qgb2YgYSBzb3VyY2UgdGhhdCBoYXMgbm8gY291bnRlcnBhcnQgaW4gdGhlIHRhcmdldCBpc1xyXG4gKiB0YWtlbiBvdmVyIGJ5IHJlZmVyZW5jZSwganVzdCBsaWtlIE9iamVjdC5hc3NpZ24gZG9lcy5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCB0aGUgdGFyZ2V0IG9iamVjdCB0byBtZXJnZSBpbnRvLCBhIG5ldyBvYmplY3Qgd2hlbiBmYWxzeVxyXG4gKiBAcGFyYW0gey4uLm9iamVjdH0gc291cmNlcyB0aGUgc291cmNlIG9iamVjdHMsIGFwcGxpZWQgaW4gb3JkZXJcclxuICogQHJldHVybnMge29iamVjdH0gdGhlIHRhcmdldCBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbWVyZ2Uoe2EgOiAxfSwge2IgOiAyfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDEsIGIgOiAyfVxyXG4gKiBtZXJnZSh7YSA6IHt4IDogMX19LCB7YSA6IHt5IDogMn19KTsgICAgICAgICAgICAgIC8vIHthIDoge3ggOiAxLCB5IDogMn19XHJcbiAqIG1lcmdlKHthIDogWzEsIDIsIDNdfSwge2EgOiBbOV19KTsgICAgICAgICAgICAgICAgLy8ge2EgOiBbOV19LCByZXBsYWNlZCBhcyBhIHdob2xlXHJcbiAqIG1lcmdlKHthIDogbmV3IEZvbygxKX0sIHthIDogbmV3IEJhcigyKX0pOyAgICAgICAgLy8gYSBzdGF5cyBhIEZvbywgY2FycnlpbmcgdGhlIHByb3BlcnRpZXMgb2YgYm90aFxyXG4gKiBtZXJnZSh7fSwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWVyZ2UgPSAodGFyZ2V0LCAuLi5zb3VyY2VzKSA9PiB7XHJcblx0aWYgKCF0YXJnZXQpIHRhcmdldCA9IHt9O1xyXG5cclxuXHRzb3VyY2VzXHJcblx0XHQuZmlsdGVyKChzb3VyY2UpID0+ICFpc051bGxPclVuZGVmaW5lZChzb3VyY2UpKVxyXG5cdFx0LmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG5cdFx0XHRjb25zdCBrZXlzID0gYXNzaWduYWJsZUtleXMoc291cmNlKTtcclxuXHRcdFx0a2V5c1xyXG5cdFx0XHRcdC5maWx0ZXIoKGtleSkgPT4ga2V5ICE9IFwiX19wcm90b19fXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2YgdGFyZ2V0W2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2Ygc291cmNlW2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZvckVhY2goKGtleSkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzb3VyY2Vba2V5XTtcclxuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnQgPSB0YXJnZXRba2V5XTtcclxuXHJcblx0XHRcdFx0XHRpZihjdXJyZW50ID09IG51bGwgKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiggdHlwZW9mIGN1cnJlbnQgIT09IHR5cGVvZiB2YWx1ZSApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgQXJyYXkgfHwgdmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBTZXQgfHwgdmFsdWUgaW5zdGFuY2VvZiBTZXQpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgTWFwIHx8IHZhbHVlIGluc3RhbmNlb2YgTWFwKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIERhdGUgfHwgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFJlZ0V4cCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGlzT2JqZWN0KGN1cnJlbnQpICYmIGlzT2JqZWN0KHZhbHVlKSkgbWVyZ2UoY3VycmVudCwgdmFsdWUpO1xyXG5cdFx0XHRcdFx0ZWxzZSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdHJldHVybiB0YXJnZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVjaWRlcyB3aGV0aGVyIGEgc2luZ2xlIHByb3BlcnR5IGlzIHRha2VuIG92ZXIgYnkge0BsaW5rIGZpbHRlcn0uXHJcbiAqXHJcbiAqIEBjYWxsYmFjayBQcm9wZXJ0eUZpbHRlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0aGUgb2JqZWN0IHRoZSBwcm9wZXJ0eSBiZWxvbmdzIHRvXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIHRvIGtlZXAgdGhlIHByb3BlcnR5XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIHtAbGluayBQcm9wZXJ0eUZpbHRlcn0gYWNjZXB0aW5nIG9yIHJlamVjdGluZyBhIGZpeGVkIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gb3B0aW9ucy5uYW1lcyB0aGUgcHJvcGVydHkgbmFtZXMgdG8gZGVjaWRlIG9uXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5hbGxvd2VkIHRydWUgdHVybnMgdGhlIGxpc3QgaW50byBhbiBhbGxvdyBsaXN0LCBmYWxzZSBpbnRvIGEgZGVueSBsaXN0XHJcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eUZpbHRlcn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZGVueSA9IGJ1aWxkUHJvcGVydHlGaWx0ZXIoe25hbWVzIDogW1wicGFzc3dvcmRcIl0sIGFsbG93ZWQgOiBmYWxzZX0pO1xyXG4gKiBmaWx0ZXIodXNlciwgZGVueSk7ICAgLy8gZXZlcnkgcHJvcGVydHkgYnV0IHBhc3N3b3JkXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYnVpbGRQcm9wZXJ0eUZpbHRlciA9ICh7IG5hbWVzLCBhbGxvd2VkIH0pID0+IHtcclxuXHRyZXR1cm4gKG5hbWUsIHZhbHVlLCBjb250ZXh0KSA9PiB7XHJcblx0XHRyZXR1cm4gbmFtZXMuaW5jbHVkZXMobmFtZSkgPT09IGFsbG93ZWQ7XHJcblx0fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWJ1aWxkcyBhbiBBcnJheSwgU2V0IG9yIE1hcCB3aXRoIGl0cyB2YWx1ZXMgZmlsdGVyZWQuIEEgY29udGFpbmVyIGtlZXBzIGFsbCBvZiBpdHMgZW50cmllcyAtXHJcbiAqIG9ubHkgdGhlIHZhbHVlcyBpbnNpZGUgZ2V0IGZpbHRlcmVkLiBUaGUga2V5cyBvZiBhIE1hcCBzdGF5IHVudG91Y2hlZCwgcmVwbGFjaW5nIHRoZW0gd291bGQgYnJlYWtcclxuICogZXZlcnkgbG9va3VwIGFnYWluc3QgdGhlIHJlc3VsdC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtBcnJheXxTZXR8TWFwfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVlcFxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IGNvcGllcyBtYXBzIGFuIG9yaWdpbmFsIG9udG8gaXRzIGZpbHRlcmVkIGNvcHlcclxuICogQHJldHVybnMge0FycmF5fFNldHxNYXB9XHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJDb250YWluZXIgPSAodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblx0XHRjb25zdCBjb3B5ID0gW107XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkucHVzaChmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdFx0cmV0dXJuIGNvcHk7XHJcblx0fVxyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGNvbnN0IGNvcHkgPSBuZXcgU2V0KCk7XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkuYWRkKGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0XHRyZXR1cm4gY29weTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGNvcHkgPSBuZXcgTWFwKCk7XHJcblx0Y29waWVzLnNldCh2YWx1ZSwgY29weSk7XHJcblx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIGNvcHkuc2V0KGtleSwgZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRyZXR1cm4gY29weTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXJzIGEgc2luZ2xlIHZhbHVlLCBkaXNwYXRjaGluZyBvbiB3aGF0IGl0IGlzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7Kn0gdGhlIGZpbHRlcmVkIHZhbHVlLCBvciB0aGUgdmFsdWUgaXRzZWxmIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBmaWx0ZXJcclxuICovXHJcbmNvbnN0IGZpbHRlclZhbHVlID0gKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpID0+IHtcclxuXHRpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdmFsdWU7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHZhbHVlOyAvLyBjYXJyeSBubyBwcm9wZXJ0aWVzIHRvIGZpbHRlclxyXG5cclxuXHQvLyBhIHZhbHVlIHNlZW4gYmVmb3JlIGNsb3NlcyBhIGN5Y2xlIC0gaXRzIGNvcHkgc3RhbmRzIGluLCBzbyBub3RoaW5nIHVuZmlsdGVyZWQgbGVha3MgYmFjayBpblxyXG5cdGlmIChjb3BpZXMuaGFzKHZhbHVlKSkgcmV0dXJuIGNvcGllcy5nZXQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGZpbHRlckNvbnRhaW5lcih2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxuXHJcblx0cmV0dXJuIGZpbHRlck9iamVjdCh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgdGhlIGZpbHRlcmVkIGNvcHkgb2YgYW4gb2JqZWN0LiBUaGUgY29weSBpcyByZWdpc3RlcmVkIGJlZm9yZSBpdCBpcyBmaWxsZWQsIHNvIGEgY3ljbGVcclxuICogcnVubmluZyBiYWNrIGludG8gaXQgcmVzb2x2ZXMgdG8gdGhlIGNvcHkgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuY29uc3QgZmlsdGVyT2JqZWN0ID0gKGRhdGEsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cdGNvcGllcy5zZXQoZGF0YSwgcmVzdWx0KTtcclxuXHJcblx0Zm9yIChjb25zdCBuYW1lIGluIGRhdGEpIHtcclxuXHRcdGNvbnN0IHZhbHVlID0gZGF0YVtuYW1lXTtcclxuXHRcdGlmIChwcm9wRmlsdGVyKG5hbWUsIHZhbHVlLCBkYXRhKSl7XHJcblx0XHRcdHJlc3VsdFtuYW1lXSA9IGRlZXAgPyBmaWx0ZXJWYWx1ZSh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA6IHZhbHVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBuZXcgb2JqZWN0IGhvbGRpbmcgdGhlIHByb3BlcnRpZXMgYSBmaWx0ZXIgYWNjZXB0cy5cclxuICpcclxuICogVGhlIGZpbHRlciBpcyBjYWxsZWQgZm9yIGV2ZXJ5IGVudW1lcmFibGUgcHJvcGVydHksIGluaGVyaXRlZCBvbmVzIGluY2x1ZGVkIC0gZmlsdGVyaW5nIGEgd2luZG93XHJcbiAqIHJlbGllcyBvbiB0aGF0LCBzaW5jZSBtb3N0IG9mIGl0cyBtZW1iZXJzIHNpdCBvbiB0aGUgcHJvdG90eXBlLlxyXG4gKlxyXG4gKiBXaXRoIGRlZXAgdGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvIHN1YiBvYmplY3RzIGFzIHdlbGwuIEFycmF5LCBTZXQgYW5kIE1hcCBhcmUgcmVidWlsdCB3aXRoIHRoZWlyXHJcbiAqIHZhbHVlcyBmaWx0ZXJlZCwga2VlcGluZyBhbGwgb2YgdGhlaXIgZW50cmllcyBhbmQsIGZvciBhIE1hcCwgaXRzIGtleXMuIERhdGUgYW5kIFJlZ0V4cCBhcmUgdGFrZW5cclxuICogb3ZlciBhcyB0aGV5IGFyZS4gQSBjeWNsaWMgcmVmZXJlbmNlIHJlc29sdmVzIHRvIHRoZSBmaWx0ZXJlZCBjb3B5LCBzbyB0aGUgcmVzdWx0IG5ldmVyIGNhcnJpZXMgYVxyXG4gKiByZWZlcmVuY2UgaW50byB0aGUgdW50b3VjaGVkIG9yaWdpbmFsLlxyXG4gKlxyXG4gKiBXaXRob3V0IGRlZXAgdGhlIGFjY2VwdGVkIHZhbHVlcyBhcmUgdGFrZW4gb3ZlciBhcyB0aGV5IGFyZSwgc3ViIG9iamVjdHMgYnkgcmVmZXJlbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0aGUgb2JqZWN0IHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXIgZGVjaWRlcyBwZXIgcHJvcGVydHksIHNlZSB7QGxpbmsgYnVpbGRQcm9wZXJ0eUZpbHRlcn1cclxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXA9ZmFsc2VdIGZpbHRlciBzdWIgb2JqZWN0cyB0b29cclxuICogQHJldHVybnMge29iamVjdH0gYSBuZXcgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGRlbnkgPSBidWlsZFByb3BlcnR5RmlsdGVyKHtuYW1lcyA6IFtcInNlY3JldFwiXSwgYWxsb3dlZCA6IGZhbHNlfSk7XHJcbiAqXHJcbiAqIGZpbHRlcih7c2VjcmV0IDogXCJ4XCIsIGEgOiAxfSwgZGVueSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDF9XHJcbiAqIGZpbHRlcih7c3ViIDoge3NlY3JldCA6IFwieFwiLCBhIDogMX19LCBkZW55LCB7ZGVlcCA6IHRydWV9KTsgICAgICAvLyB7c3ViIDoge2EgOiAxfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoZGF0YSwgcHJvcEZpbHRlciwgeyBkZWVwID0gZmFsc2UgfSA9IHt9KSA9PiBmaWx0ZXJPYmplY3QoZGF0YSwgcHJvcEZpbHRlciwgZGVlcCwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIGNvbnN0YW50LCBub24gZW51bWVyYWJsZSBwcm9wZXJ0eS5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdGhlIHZhbHVlLCBuZWl0aGVyIHdyaXRhYmxlIG5vciBjb25maWd1cmFibGVcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmVmFsdWUgPSAobywgbmFtZSwgdmFsdWUpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0dmFsdWUsXHJcblx0XHR3cml0YWJsZTogZmFsc2UsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIHJlYWQgb25seSwgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZHZXQgPSAobywgbmFtZSwgZ2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyIGFuZCBhIHNldHRlci5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gc2V0IHRha2VzIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZkdldFNldCA9IChvLCBuYW1lLCBnZXQsIHNldCkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHRnZXQsXHJcblx0XHRzZXQsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0aXNOdWxsT3JVbmRlZmluZWQsXHJcblx0aXNPYmplY3QsXHJcblx0aXNQcmltaXRpdmUsXHJcblx0ZXF1YWxQb2pvLFxyXG5cdGlzUG9qbyxcclxuXHRhcHBlbmQsXHJcblx0bWVyZ2UsXHJcblx0ZmlsdGVyLFxyXG5cdGJ1aWxkUHJvcGVydHlGaWx0ZXIsXHJcblx0ZGVmVmFsdWUsXHJcblx0ZGVmR2V0LFxyXG5cdGRlZkdldFNldCxcclxufTtcclxuIiwiLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDYWNoZUVudHJ5XG4gKiBAcHJvcGVydHkge251bWJlcn0gbGFzdEhpdCAtIE1vbm90b25pYyBtYXJrZXIgb2YgdGhlIGxhc3QgcmVhZCBvciB3cml0ZSwgdGhlIGV2aWN0aW9uIG9yZGVyLlxuICogQHByb3BlcnR5IHtzdHJpbmd9IGtleVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gdmFsdWVcbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENvZGVDYWNoZU9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc2l6ZV0gLSBNYXhpbXVtIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjYWNoZSwgYSBmcmFjdGlvbiByb3VuZGVkIGRvd24uIElmIHNldFxuICogdG8gMCBvciBsZXNzLCBjYWNoaW5nIGlzIGRpc2FibGVkLiBMZWZ0IG91dCwgdGhlIHNpemUgc3RheXMgYXMgaXQgaXMgLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMy5cbiAqL1xuXG4vKiogVGhlIHNpemUgZXZlcnkgY2FjaGUgc3RhcnRzIHdpdGggLSBTUEVDSUZJQ0FUSU9OLm1kIDkuMy4gKi9cbmNvbnN0IFNUQVJUX1NJWkUgPSA1MDAwO1xuXG4vKipcbiAqIENvZGVDYWNoZSBjbGFzcyB0byBtYW5hZ2UgY2FjaGluZyBvZiBnZW5lcmF0ZWQgY29kZSBzbmlwcGV0cy5cbiAqXG4gKiBFbnRyaWVzIGFyZSBldmljdGVkIGxlYXN0IHJlY2VudGx5IHVzZWQgZmlyc3Q6IGV2ZXJ5IGhpdCByZWZyZXNoZXMgdGhlIGVudHJ5LCBzbyBhblxuICogZXhwcmVzc2lvbiB0aGF0IGtlZXBzIGJlaW5nIHJlc29sdmVkIG91dGxpdmVzIG9uZSB0aGF0IHdhcyBjb21waWxlZCBvbmNlIGFuZCBkcm9wcGVkLlxuICogVGhlIG1hcmtlciBpcyBhIGNvdW50ZXIgcmF0aGVyIHRoYW4gYSB0aW1lc3RhbXAg4oCUIGEgYnVyc3Qgb2YgZmlyc3QtdGltZSBjb21waWxhdGlvbnNcbiAqIGZhbGxzIGludG8gYSBzaW5nbGUgbWlsbGlzZWNvbmQsIHdoaWNoIHdvdWxkIGxlYXZlIHRoZSBldmljdGlvbiBvcmRlciB0byBjaGFuY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVDYWNoZSB7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I2Rpc2FibGVkID0gZmFsc2U7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjc2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjbWF4U2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7QXJyYXk8Q2FjaGVFbnRyeT59ICovXG5cdCNlbnRyaWVzID0gW107XG5cdC8qKiBAdHlwZSB7TWFwPHN0cmluZyxDYWNoZUVudHJ5Pn0gKi9cblx0I2VudHJ5TWFwID0gbmV3IE1hcCgpO1xuXHQvKiogQHR5cGUge251bWJlcn0gLSBIYW5kcyBvdXQgdGhlIGBsYXN0SGl0YCBtYXJrZXJzLCBuZXZlciByZXNldC4gKi9cblx0I2Nsb2NrID0gMDtcblxuXG5cdC8qKlxuXHQgKiBTdGFydHMgd2l0aCBhIHNpemUgb2YgNTAwMCwgdGhlbiBhcHBsaWVzIHRoZSBvcHRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuI3Jlc2l6ZShTVEFSVF9TSVpFKTtcblx0XHR0aGlzLnNldHVwKG9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgd2hhdCB0aGUgb3B0aW9ucyBjYXJyeSBhbmQgbGVhdmVzIGV2ZXJ5dGhpbmcgZWxzZSBhcyBpdCBpcy4gQSBzaXplIG9mIDAgb3IgbGVzc1xuXHQgKiBkaXNhYmxlcyB0aGUgY2FjaGUgYW5kIHJlbGVhc2VzIGl0cyBlbnRyaWVzLCBhIGxhdGVyIHBvc2l0aXZlIHNpemUgZW5hYmxlcyBpdCBhZ2FpbiBhbmQgc3RhcnRzXG5cdCAqIGVtcHR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgc2l6ZSBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG5cdCAqL1xuXHRzZXR1cCh7IHNpemUgfSA9IHt9KSB7XG5cdFx0aWYgKHNpemUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2Ygc2l6ZSAhPT0gXCJudW1iZXJcIiB8fCAhTnVtYmVyLmlzRmluaXRlKHNpemUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgc2l6ZSBvZiBhIGNvZGUgY2FjaGUgaXMgYSBmaW5pdGUgbnVtYmVyLCBub3QgJHtTdHJpbmcoc2l6ZSl9IWApO1xuXG5cdFx0dGhpcy4jcmVzaXplKE1hdGguZmxvb3Ioc2l6ZSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBhU2l6ZSBhIHdob2xlIG51bWJlclxuXHQgKi9cblx0I3Jlc2l6ZShhU2l6ZSkge1xuXHRcdHRoaXMuI2Rpc2FibGVkID0gYVNpemUgPD0gMDtcblx0XHRpZiAodGhpcy4jZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMuI3NpemUgPSAwO1xuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IDA7XG5cdFx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuI3NpemUgPSBhU2l6ZTtcblx0XHRcdHRoaXMuI21heFNpemUgPSBNYXRoLmZsb29yKGFTaXplICogMS4xKTtcblx0XHRcdHRoaXMuI3RyaW0oKTtcblx0XHR9XG5cdH1cblxuXHRoYXMoa2V5KSB7XG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gdGhpcy4jZW50cnlNYXAuaGFzKGtleSk7XG5cdH1cblxuXHRnZXQoa2V5KSB7XG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybiBudWxsO1xuXHRcdGNvbnN0IGVudHJ5ID0gdGhpcy4jZW50cnlNYXAuZ2V0KGtleSk7XG5cdFx0aWYgKGVudHJ5KSB7XG5cdFx0XHRlbnRyeS5sYXN0SGl0ID0gKyt0aGlzLiNjbG9jaztcblx0XHRcdHJldHVybiBlbnRyeS52YWx1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRzZXQoa2V5LCBjb2RlKSB7XG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybjtcblx0XHRsZXQgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0ZW50cnkudmFsdWUgPSBjb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbnRyeSA9IHtcblx0XHRcdFx0bGFzdEhpdDogKyt0aGlzLiNjbG9jayxcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHR2YWx1ZTogY29kZSxcblx0XHRcdH07XG5cdFx0XHR0aGlzLiNlbnRyaWVzLnB1c2goZW50cnkpO1xuXHRcdFx0dGhpcy4jZW50cnlNYXAuc2V0KGtleSwgZW50cnkpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLiNlbnRyeU1hcC5zaXplID49IHRoaXMuI21heFNpemUpIHRoaXMuI3RyaW0oKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuI2VudHJpZXMgPSBbXTtcblx0XHR0aGlzLiNlbnRyeU1hcCA9IG5ldyBNYXAoKTtcblx0fVxuXG5cdCN0cmltKCkge1xuXHRcdHRoaXMuI2VudHJpZXMuc29ydCgoYSwgYikgPT4gYi5sYXN0SGl0IC0gYS5sYXN0SGl0KTtcblx0XHRpZiAodGhpcy4jZW50cmllcy5sZW5ndGggPiB0aGlzLiNzaXplKSB7XG5cdFx0XHRjb25zdCBlbnRyaWVzVG9SZW1vdmUgPSB0aGlzLiNlbnRyaWVzLnNwbGljZSh0aGlzLiNzaXplKTtcblx0XHRcdGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllc1RvUmVtb3ZlKSB7XG5cdFx0XHRcdHRoaXMuI2VudHJ5TWFwLmRlbGV0ZShlbnRyeS5rZXkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcbiIsIi8qKlxuICogb2JqZWN0IGZvciBkZWZhdWx0IHZhbHVlXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIERlZmF1bHRWYWx1ZVxuICogQHR5cGVkZWYge0RlZmF1bHRWYWx1ZX1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmYXVsdFZhbHVlIHtcblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRGVmYXVsdFZhbHVlLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IodmFsdWUpe1xuXHRcdHRoaXMuaGFzVmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDE7XG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR9XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhlY3V0ZXJ7XG5cblx0I2V4ZWN1dGlvbjtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb24uZXhlY3V0aW9uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih7ZXhlY3V0aW9ufSA9IHt9KXtcblx0XHR0aGlzLiNleGVjdXRpb24gPSBleGVjdXRpb24gfHwgKCgpID0+IHt0aHJvdyBuZXcgRXJyb3IoXCJub3QgaW1wbGVtZW50ZWRcIil9KTtcblx0fVxuXG5cdGV4ZWN1dGUoYVN0YXRlbWVudCwgYUNvbnRleHQpe1xuXHRcdHJldHVybiB0aGlzLiNleGVjdXRpb24oYVN0YXRlbWVudCwgYUNvbnRleHQpO1xuXHR9XG59O1xuIiwiaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuL0V4ZWN1dGVyLmpzXCI7XG5cbmNvbnN0IEVYRUNVVEVSUyA9IG5ldyBNYXAoKTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFOYW1lXG4gKiBAcGFyYW0ge0V4ZWN1dGVyfSBhbkV4ZWN1dGVyXG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RyYXRlID0gKGFOYW1lLCBhbkV4ZWN1dGVyKSA9PiB7XG5cdEVYRUNVVEVSUy5zZXQoYU5hbWUsIGFuRXhlY3V0ZXIpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFOYW1lXG4gKiBAcmV0dXJucyB7RXhlY3V0ZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeGVjdXRlciA9IChhTmFtZSkgPT4ge1xuXHRjb25zdCBleGVjdXRlciA9IEVYRUNVVEVSUy5nZXQoYU5hbWUpO1xuXHRpZiAoIWV4ZWN1dGVyKSB0aHJvdyBuZXcgRXJyb3IoYEV4ZWN1dGVyIFwiJHthTmFtZX1cIiBpcyBub3QgcmVnaXN0cmF0ZWQhYCk7XG5cdHJldHVybiBleGVjdXRlcjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldEV4ZWN1dGVyO1xuIiwiaW1wb3J0IE9iamVjdFV0aWxzIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qc1wiO1xuaW1wb3J0IERlZmF1bHRWYWx1ZSBmcm9tIFwiLi9EZWZhdWx0VmFsdWUuanNcIjtcbmltcG9ydCBnZXRFeGVjdXRlclR5cGUgZnJvbSBcIi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IERlZmF1bHRFeGVjdXRlciBmcm9tIFwiLi9leGVjdXRlci9Db250ZXh0RGVjb25zdHJ1Y3RvckV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgUmVzb2x2ZXJDb250ZXh0SGFuZGxlIGZyb20gXCIuL1Jlc29sdmVyQ29udGV4dEhhbmRsZS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgeyBzY2FuLCBwYXJzZUV4cHJlc3Npb24gfSBmcm9tIFwiLi9FeHByZXNzaW9uU2Nhbm5lci5qc1wiO1xuaW1wb3J0IHsgaXNOYW1lQ2hhcmFjdGVyLCBub3JtYWxpemUgfSBmcm9tIFwiLi9VdGlscy5qc1wiO1xuXG4vKiogQHR5cGUge0V4ZWN1dGVyfSAqL1xubGV0IERFRkFVTFRfRVhFQ1VURVIgPSBEZWZhdWx0RXhlY3V0ZXI7XG5cbmNvbnN0IERFRkFVTFRfTk9UX0RFRklORUQgPSBuZXcgRGVmYXVsdFZhbHVlKCk7XG5jb25zdCB0b0RlZmF1bHRWYWx1ZSA9ICh2YWx1ZSkgPT4ge1xuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEZWZhdWx0VmFsdWUpIHJldHVybiB2YWx1ZTtcblxuXHRyZXR1cm4gbmV3IERlZmF1bHRWYWx1ZSh2YWx1ZSk7XG59O1xuXG5sZXQgTkFNRV9DT1VOVEVSID0gMDtcbi8qKlxuICogVGhlIG5hbWUgYSByZXNvbHZlciBjYXJyaWVzIHdoZXJlIHRoZSBjYWxsZXIgcGFzc2VkIG5vbmUuIE9ubHkgdW5pcXVlbmVzcyBpcyBwcm9taXNlZCwgdGhlIHNoYXBlXG4gKiBpcyBub3QgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuMS5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5jb25zdCBnZW5lcmF0ZU5hbWUgPSAoKSA9PiBgRVIkeysrTkFNRV9DT1VOVEVSfWA7XG5cbi8qKlxuICogVGhlIG5hbWUgYSByZXNvbHZlciBrZWVwczogdGhlIG9uZSBwYXNzZWQsIHRyaW1tZWQgYW5kIGhlbGQgdG8gdGhlIHJ1bGUgb2YgMy4zLCBvciBhIGdlbmVyYXRlZCBvbmVcbiAqIHdoZXJlIG5vbmUgd2FzIHBhc3NlZCAtIFNQRUNJRklDQVRJT04ubWQgNS4xLlxuICpcbiAqIEBwYXJhbSB7P3N0cmluZ30gYU5hbWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBuYW1lIGlzIG5vIHN0cmluZywgZW1wdHksIG9yIGNhcnJpZXMgYSBjaGFyYWN0ZXIgMy4zIGRvZXMgbm90IGFsbG93XG4gKi9cbmNvbnN0IHRvTmFtZSA9IChhTmFtZSkgPT4ge1xuXHRpZiAoYU5hbWUgPT0gbnVsbCkgcmV0dXJuIGdlbmVyYXRlTmFtZSgpO1xuXHRpZiAodHlwZW9mIGFOYW1lICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgb3B0aW9uIG5hbWUgdGFrZXMgYSBzdHJpbmcsIG5vdCBhICR7dHlwZW9mIGFOYW1lfSFgKTtcblxuXHRjb25zdCBuYW1lID0gbm9ybWFsaXplKGFOYW1lKTtcblx0aWYgKG5hbWUgPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBvcHRpb24gbmFtZSB0YWtlcyBhIG5hbWUsIG5vdCBhbiBlbXB0eSBzdHJpbmchXCIpO1xuXHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbmFtZS5sZW5ndGg7IGluZGV4KyspXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIobmFtZS5jaGFyQ29kZUF0KGluZGV4KSkpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBuYW1lIFwiJHtuYW1lfVwiIGNhcnJpZXMgYSBjaGFyYWN0ZXIgYSBzY29wZSBuYW1lIGNhbm5vdCBjYXJyeSAoU1BFQ0lGSUNBVElPTi5tZCAzLjMpIWApO1xuXG5cdHJldHVybiBuYW1lO1xufTtcblxuLyoqXG4gKiBUaGUgc2NvcGUgbmFtZSBhIGZpbHRlciBvZiB0aGUgZGF0YSBtZXRob2RzIHNlbGVjdHMsIHJlYWQgbGlrZSBhIHNjb3BlIHByZWZpeDogdHJpbW1lZCwgYW5kIG51bGxcbiAqIHdoZXJlIHRoZXJlIGlzIG5vbmUgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cbiAqXG4gKiBAcGFyYW0gez9zdHJpbmd9IGFGaWx0ZXJcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgZmlsdGVyIGlzIG5vIHN0cmluZ1xuICovXG5jb25zdCB0b1Njb3BlID0gKGFGaWx0ZXIpID0+IHtcblx0aWYgKGFGaWx0ZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cdGlmICh0eXBlb2YgYUZpbHRlciAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgQSBmaWx0ZXIgaXMgYSBzY29wZSBuYW1lLCBub3QgYSAke3R5cGVvZiBhRmlsdGVyfSFgKTtcblxuXHRyZXR1cm4gbm9ybWFsaXplKGFGaWx0ZXIpO1xufTtcblxuLyoqXG4gKiBUaGUgcHJvcGVydHkga2V5IGEgZGF0YSBtZXRob2Qgd29ya3Mgd2l0aCAtIGEgc3RyaW5nLCBcIlwiIGluY2x1ZGVkLCBhIHN5bWJvbCwgb3IgYSBudW1iZXIsIHdoaWNoXG4gKiBuYW1lcyB0aGUgc2FtZSBwcm9wZXJ0eSBhcyBpdHMgc3RyaW5nIGFuZCBpcyBsb29rZWQgdXAgYXMgb25lIC0gU1BFQ0lGSUNBVElPTi5tZCA2LjYuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfHN5bWJvbH0gYUtleVxuICogQHJldHVybnMge3N0cmluZ3xzeW1ib2x9XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBrZXkgaXMgbm9uZSwgb3Igb2YgYSB0eXBlIG5vIHByb3BlcnR5IGtleSBoYXNcbiAqL1xuY29uc3QgdG9LZXkgPSAoYUtleSkgPT4ge1xuXHRjb25zdCB0eXBlID0gdHlwZW9mIGFLZXk7XG5cdGlmICh0eXBlID09PSBcInN0cmluZ1wiIHx8IHR5cGUgPT09IFwic3ltYm9sXCIpIHJldHVybiBhS2V5O1xuXHRpZiAodHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIFN0cmluZyhhS2V5KTtcblxuXHR0aHJvdyBuZXcgVHlwZUVycm9yKGBBIGtleSBpcyBhIHN0cmluZywgYSBudW1iZXIgb3IgYSBzeW1ib2wsIG5vdCAke2FLZXkgPT0gbnVsbCA/IFwibWlzc2luZ1wiIDogYGEgJHt0eXBlfWB9IWApO1xufTtcblxuY29uc3QgZXhlY3V0ZSA9IGFzeW5jIGZ1bmN0aW9uIChhbkV4ZWN1dGVyLCBhU3RhdGVtZW50LCBhQ29udGV4dCkge1xuXHQvLyAzLjQ6IGFuIGVtcHR5IHN0YXRlbWVudCBhbnN3ZXJzIHVuZGVmaW5lZCwgdGhlIHNhbWUgYXMgYHJldHVybjtgIGluIEphdmFTY3JpcHQuIFRoZSBzY2FubmVyXG5cdC8vIGhhbmRzIGV2ZXJ5IHN0YXRlbWVudCBvdmVyIHRyaW1tZWQsIGFuZCBhbiBlbXB0eSBvbmUgYXMgbnVsbC5cblx0aWYgKGFTdGF0ZW1lbnQgPT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0aWYgKHR5cGVvZiBhU3RhdGVtZW50ICE9PSBcInN0cmluZ1wiKSByZXR1cm4gYVN0YXRlbWVudDtcblxuXHQvLyBhbiBlcnJvciBpcyBkZWxpYmVyYXRlbHkgbm90IGNhdWdodCBoZXJlOiBzZWN0aW9uIDcgZ2l2ZXMgdGhlIHR3byBlbnRyeSBwb2ludHMgZGlmZmVyZW50XG5cdC8vIGFuc3dlcnMgdG8gaXQsIHNvIGVhY2ggb2YgdGhlbSBoYW5kbGVzIGl0IGZvciBpdHNlbGZcblx0cmV0dXJuIGF3YWl0IGFuRXhlY3V0ZXIuZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCk7XG59O1xuXG5jb25zdCB3YXJuRmFpbGVkU3RhdGVtZW50ID0gKGFTdGF0ZW1lbnQsIGFuRXJyb3IpID0+IHtcblx0Y29uc29sZS53YXJuKGBFeGVjdXRpb24gZXJyb3Igb24gc3RhdGVtZW50IVxuXHRcdHN0YXRlbWVudDpcblx0XHQke2FTdGF0ZW1lbnR9XG5cdFx0ZXJyb3I6XG5cdFx0JHthbkVycm9yfVxuXHRcdGApO1xufTtcblxuY29uc3Qgd2l0aERlZmF1bHQgPSAoYVJlc3VsdCwgYURlZmF1bHQpID0+IHtcblx0aWYgKGFSZXN1bHQgIT09IG51bGwgJiYgdHlwZW9mIGFSZXN1bHQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBhUmVzdWx0O1xuXHRlbHNlIGlmIChhRGVmYXVsdCBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSAmJiBhRGVmYXVsdC5oYXNWYWx1ZSkgcmV0dXJuIGFEZWZhdWx0LnZhbHVlO1xuXHRyZXR1cm4gYVJlc3VsdDtcbn07XG5cbmNvbnN0IHJlc29sdmUgPSBhc3luYyBmdW5jdGlvbiAoYUV4ZWN1dGVyID0gREVGQVVMVF9FWEVDVVRFUiwgYVJlc29sdmVyLCBhRXhwcmVzc2lvbiwgYUZpbHRlciwgYURlZmF1bHQpIHtcblx0Ly8gNS4zOiBjbGltYnMgaW4gYSBsb29wIHJhdGhlciB0aGFuIGJ5IHJlY3Vyc2lvbiAtIG9uZSBjYWxsIHBlciByZXNvbHZlciBjbGltYmVkIGNvc3QgYSBwcm9taXNlXG5cdC8vIGVhY2ggYW5kIG92ZXJmbG93ZWQgdGhlIHN0YWNrIG9uIGEgZGVlcCBjaGFpbi4gQSBzY29wZSBubyByZXNvbHZlciBvZiB0aGUgY2hhaW4gY2Fycmllc1xuXHQvLyBhbnN3ZXJzIHVuZGVmaW5lZCwgYW5kIHRoZSBkZWZhdWx0IGFwcGxpZXMgdG8gaXQgbGlrZSB0byBhbnkgb3RoZXIgcmVzdWx0IC0gc2VlXG5cdC8vIFNQRUNJRklDQVRJT04ubWQgNS40XG5cdGlmIChhRmlsdGVyKVxuXHRcdHdoaWxlIChhUmVzb2x2ZXIubmFtZSAhPSBhRmlsdGVyKSB7XG5cdFx0XHRhUmVzb2x2ZXIgPSBhUmVzb2x2ZXIucGFyZW50O1xuXHRcdFx0aWYgKCFhUmVzb2x2ZXIpIHJldHVybiB3aXRoRGVmYXVsdCh1bmRlZmluZWQsIGFEZWZhdWx0KTtcblx0XHR9XG5cblx0cmV0dXJuIHdpdGhEZWZhdWx0KGF3YWl0IGV4ZWN1dGUoYUV4ZWN1dGVyLCBhRXhwcmVzc2lvbiwgYVJlc29sdmVyLmNvbnRleHQpLCBhRGVmYXVsdCk7XG59O1xuXG4vLyA0LjE6IHRoZSBmaXJzdCBhcmd1bWVudCBvZiBhIHN0YXRpYyBlbnRyeSBwb2ludCBpcyBhIHN0cmluZywgb3IgYSBjb25maWd1cmF0aW9uIG9iamVjdFxuY29uc3QgaXNDb25maWd1cmF0aW9uID0gKGFWYWx1ZSkgPT4gYVZhbHVlICE9PSBudWxsICYmIHR5cGVvZiBhVmFsdWUgPT09IFwib2JqZWN0XCI7XG5cbi8vIDQuMTogYSBjb25maWd1cmF0aW9uIGNvdW50cyBhcyBwYXNzaW5nIGEgZGVmYXVsdCB3aGVyZSBpdCBjYXJyaWVzIHRoZSBrZXksIHdoYXRldmVyIGl0IGhvbGRzXG5jb25zdCBkZWZhdWx0T2YgPSAoYUNvbmZpZ3VyYXRpb24pID0+IChcImRlZmF1bHRWYWx1ZVwiIGluIGFDb25maWd1cmF0aW9uID8gYUNvbmZpZ3VyYXRpb24uZGVmYXVsdFZhbHVlIDogREVGQVVMVF9OT1RfREVGSU5FRCk7XG5cbi8qKlxuICogRXhwcmVzc2lvblJlc29sdmVyXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEV4cHJlc3Npb25SZXNvbHZlclxuICogQHR5cGVkZWYge0V4cHJlc3Npb25SZXNvbHZlcn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyIHtcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhbkV4ZWN1dGVyTmFtZVxuXHQgKi9cblx0c3RhdGljIHNldCBkZWZhdWx0RXhlY3V0ZXIoYW5FeGVjdXRlcikge1xuXHRcdGlmICggYW5FeGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSBERUZBVUxUX0VYRUNVVEVSID0gYW5FeGVjdXRlcjtcblx0XHRlbHNlIERFRkFVTFRfRVhFQ1VURVIgPSBnZXRFeGVjdXRlclR5cGUoYW5FeGVjdXRlcik7XG5cdFx0Y29uc29sZS5pbmZvKGBDaGFuZ2VkIGRlZmF1bHQgZXhlY3V0ZXIgZm9yIEV4cHJlc3Npb25SZXNvbHZlciFgKTtcblx0fVxuXG5cdHN0YXRpYyBnZXQgZGVmYXVsdEV4ZWN1dGVyKCkge1xuXHRcdHJldHVybiBERUZBVUxUX0VYRUNVVEVSO1xuXHR9XG5cblx0LyoqIEB0eXBlIHtzdHJpbmd8bnVsbH0gKi9cblx0I25hbWUgPSBudWxsO1xuXHQvKiogQHR5cGUge0V4cHJlc3Npb25SZXNvbHZlcnxudWxsfSAqL1xuXHQjcGFyZW50ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtmdW5jdGlvbnxudWxsfSAqL1xuXHQjZXhlY3V0ZXIgPSBudWxsO1xuXHQvKiogQHR5cGUge1Byb3h5fG51bGx9ICovXG5cdCNjb250ZXh0ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH0gKi9cblx0I2NvbnRleHRIYW5kbGUgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIEV4cHJlc3Npb25SZXNvbHZlci5cblx0ICogQGRhdGUgMy8xMC8yMDI0IC0gNzoyNzo1NyBQTVxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHt7IGNvbnRleHQ/OiBhbnk7IHBhcmVudD86IGFueTsgbmFtZT86IGFueTsgZXhlY3V0ZXI/OiAoc3RyaW5nfEV4ZWN1dGVyKTsgfX0gb3B0aW9uc1xuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuY29udGV4dF0gd2hlcmUgbm9uZSBpcyBwYXNzZWQsIHRoZSByZXNvbHZlciBoYXMgbm8gY29udGV4dCBvZiBpdHMgb3duIC0gNC4yXG5cdCAqIEBwYXJhbSB7RXhwcmVzc2lvblJlc29sdmVyfSBbb3B0aW9ucy5wYXJlbnQ9bnVsbF1cblx0ICogQHBhcmFtIHs/c3RyaW5nfSBbb3B0aW9ucy5uYW1lPW51bGxdIGtlcHQgdHJpbW1lZDsgd2hlcmUgbm9uZSBpcyBwYXNzZWQsIG9uZSBpcyBnZW5lcmF0ZWQgLSA1LjFcblx0ICogQHBhcmFtIHsoc3RyaW5nfEV4ZWN1dGVyKX0gW29wdGlvbnMuZXhlY3V0ZXJdIHRoZSByZWdpc3RlcmVkIG5hbWUgb2YgYW4gZXhlY3V0ZXIsIG9yIGFuXG5cdCAqIGBFeGVjdXRlcmAgaW5zdGFuY2UuIEEgbmFtZSB0aGF0IGlzIG5vdCByZWdpc3RlcmVkIHRocm93czsgYW4gaW5zdGFuY2UgbmVlZHMgbm8gcmVnaXN0cmF0aW9uLFxuXHQgKiBiZWNhdXNlIGl0IGFkZHJlc3NlcyB0aGUgZXhlY3V0ZXIgZGlyZWN0bHkuIFdpdGhvdXQgdGhlIG9wdGlvbiB0aGUgcmVzb2x2ZXIgdXNlc1xuXHQgKiBgRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlcmAgLSA0LjIuXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHBhcmVudCBpcyBubyByZXNvbHZlciwgdGhlIGNvbnRleHQgYSBwcmltaXRpdmUsIG9yIHRoZSBuYW1lIGJyZWFrc1xuXHQgKiB0aGUgcnVsZSBvZiA1LjEgLSA0LjJcblx0ICovXG5cdGNvbnN0cnVjdG9yKHsgY29udGV4dCwgcGFyZW50ID0gbnVsbCwgbmFtZSA9IG51bGwsIGV4ZWN1dGVyIH0gPSB7fSkge1xuXHRcdGlmIChwYXJlbnQgIT0gbnVsbCAmJiAhKHBhcmVudCBpbnN0YW5jZW9mIEV4cHJlc3Npb25SZXNvbHZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUaGUgb3B0aW9uIHBhcmVudCB0YWtlcyBhbiBFeHByZXNzaW9uUmVzb2x2ZXIhXCIpO1xuXHRcdGlmIChjb250ZXh0ICE9IG51bGwgJiYgdHlwZW9mIGNvbnRleHQgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGNvbnRleHQgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIG9wdGlvbiBjb250ZXh0IHRha2VzIGFuIG9iamVjdCwgbm90IGEgJHt0eXBlb2YgY29udGV4dH0hYCk7XG5cdFx0dGhpcy4jbmFtZSA9IHRvTmFtZShuYW1lKTtcblxuXHRcdGlmKGV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpIHRoaXMuI2V4ZWN1dGVyID0gIGV4ZWN1dGVyO1xuXHRcdGVsc2UgaWYgKHR5cGVvZiBleGVjdXRlciA9PT0gXCJzdHJpbmdcIikgdGhpcy4jZXhlY3V0ZXIgPSBnZXRFeGVjdXRlclR5cGUoZXhlY3V0ZXIpO1xuXHRcdGVsc2UgaWYocGFyZW50ICE9IG51bGwpIHRoaXMuI2V4ZWN1dGVyID0gcGFyZW50LmV4ZWN1dGVyO1xuXHRcdGVsc2UgdGhpcy4jZXhlY3V0ZXIgPSBFeHByZXNzaW9uUmVzb2x2ZXIuZGVmYXVsdEV4ZWN1dGVyO1xuXG5cdFx0dGhpcy4jcGFyZW50ID0gcGFyZW50O1xuXHRcdHRoaXMuI2NvbnRleHRIYW5kbGUgPSBuZXcgUmVzb2x2ZXJDb250ZXh0SGFuZGxlKGNvbnRleHQgLCB0aGlzLiNwYXJlbnQgPyB0aGlzLiNwYXJlbnQuY29udGV4dEhhbmRsZSA6IG51bGwpO1xuXHRcdHRoaXMuI2NvbnRleHQgPSB0aGlzLiNjb250ZXh0SGFuZGxlLnByb3h5O1xuXHR9XG5cblx0Z2V0IG5hbWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI25hbWU7XG5cdH1cblxuXHRnZXQgcGFyZW50KCkge1xuXHRcdHJldHVybiB0aGlzLiNwYXJlbnQ7XG5cdH1cblxuXHRnZXQgY29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dDtcblx0fVxuXG5cdGdldCBleGVjdXRlcigpIHtcblx0XHRyZXR1cm4gdGhpcy4jZXhlY3V0ZXI7XG5cdH1cblxuXHRnZXQgY29udGV4dEhhbmRsZSgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dEhhbmRsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBnZXQgY2hhaW4gcGF0aFxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdGdldCBjaGFpbigpIHtcblx0XHQvLyBhIGxvb3AsIG5vdCBhIHJlY3Vyc2lvbiBpbnRvIHRoZSBwYXJlbnQ6IGEgZGVlcCBjaGFpbiBvdmVyZmxvd2VkIHRoZSBzdGFja1xuXHRcdGxldCBwYXRoID0gXCJcIjtcblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0cGF0aCA9IGAvJHtyZXNvbHZlci5uYW1lfSR7cGF0aH1gO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGVmZmVjdGl2ZSBjaGFpbiBwYXRoXG5cdCAqXG5cdCAqIE9ubHkgdGhlIHJlc29sdmVycyB0aGF0IHByb3ZpZGUgYSBjb250ZXh0IGFwcGVhciwgc28gdGhpcyBkZXNjcmliZXMgYSBzdGF0ZSBhbmQgbm90IHRoZVxuXHQgKiBzdHJ1Y3R1cmUgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS4gV2hlcmUgbm9uZSBwcm92aWRlcyBvbmUsIHRoZSBhbnN3ZXIgaXMgdGhlIGVtcHR5IHN0cmluZy5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHRnZXQgZWZmZWN0aXZlQ2hhaW4oKSB7XG5cdFx0Ly8gYSBsb29wLCBub3QgYSByZWN1cnNpb24gaW50byB0aGUgcGFyZW50OiBhIGRlZXAgY2hhaW4gb3ZlcmZsb3dlZCB0aGUgc3RhY2tcblx0XHRsZXQgcGF0aCA9IFwiXCI7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLnByb3ZpZGVzRGF0YSkgcGF0aCA9IGAvJHtyZXNvbHZlci5uYW1lfSR7cGF0aH1gO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGNvbnRleHQgY2hhaW5cblx0ICpcblx0ICogVGhlIGNvbnRleHRzIG9mIGV4YWN0bHkgdGhlIHJlc29sdmVycyB0aGF0IHByb3ZpZGUgb25lLCB0aGlzIHJlc29sdmVyJ3MgZmlyc3QgYW5kIHRoZSByb290J3Ncblx0ICogbGFzdCAtIFNQRUNJRklDQVRJT04ubWQgNS41LlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHJldHVybnMge0NvbnRleHRbXX1cblx0ICovXG5cdGdldCBjb250ZXh0Q2hhaW4oKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLnByb3ZpZGVzRGF0YSkgcmVzdWx0LnB1c2gocmVzb2x2ZXIuY29udGV4dCk7XG5cblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHJlc29sdmVyIGEgY2FsbCBhZGRyZXNzZXM6IHRoZSBvbmUgdGhlIGZpbHRlciBuYW1lcywgb3IgdGhlIHJlc29sdmVyIHRoZSBjYWxsIHdhcyBtYWRlIG9uXG5cdCAqIHdoZXJlIG5vIGZpbHRlciBpcyBnaXZlbi5cblx0ICpcblx0ICogQSBmaWx0ZXIgc2VsZWN0cyBleGFjdGx5IG9uZSByZXNvbHZlciBieSB0aGUgcnVsZSBvZiA1LjMsIGFuZCBhIGZpbHRlciBtYXRjaGluZyBub25lIHRocm93cyAtXG5cdCAqIGEgd3JvbmcgbmFtZSBpbiBhbiBBUEkgY2FsbCBpcyBhIG1pc3Rha2UgaW4gdGhlIGNhbGxpbmcgY29kZSwgdW5saWtlIGEgc2NvcGUgcHJlZml4IGluc2lkZSBhblxuXHQgKiBleHByZXNzaW9uLCB3aGljaCBhbnN3ZXJzIHVuZGVmaW5lZCAoNS40KS4gU2VlIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGFTY29wZSB0aGUgZmlsdGVyIGFzIGB0b1Njb3BlYCByZWFkcyBpdFxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfVxuXHQgKi9cblx0I2ZpbmRSZXNvbHZlcihhU2NvcGUpIHtcblx0XHRpZiAoIWFTY29wZSkgcmV0dXJuIHRoaXM7XG5cblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0aWYgKHJlc29sdmVyLm5hbWUgPT09IGFTY29wZSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBGaWx0ZXIgXCIke2FTY29wZX1cIiBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpbiFgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmVhcmVzdCByZXNvbHZlciBmcm9tIGhlcmUgdG8gdGhlIHJvb3QgdGhhdCBjYXJyaWVzIHRoZSBrZXkgaXRzZWxmLCBvciBudWxsIHdoZXJlIG5vbmVcblx0ICogY2FycmllcyBpdC4gV2hhdCBkZWNpZGVzIGlzIHdoZXRoZXIgYSByZXNvbHZlciBwcm92aWRlcyB0aGUgbmFtZSwgbm90IHdoYXQgaXQgaG9sZHMgLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDUuMi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9XG5cdCAqL1xuXHQjcmVzb2x2ZXJGb3JLZXkoa2V5KSB7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLmhhc0RhdGEoa2V5KSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGRhdGEgZnJvbSBjb250ZXh0XG5cdCAqXG5cdCAqIFJlYWRzIGFsb25nIHRoZSBjaGFpbiBmcm9tIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIgYnkgdGhlIHJ1bGUgb2YgNS4yLiBXaXRob3V0IGEga2V5IGl0IGFuc3dlcnMgdGhlXG5cdCAqIHdob2xlIGNvbnRleHQgb2YgdGhhdCByZXNvbHZlciAtIHRoZSBwcm94eSwgc28gZXZlcnkgYWNjZXNzIG9uIGl0IHN0aWxsIHNlZXMgdGhlIGNoYWluLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gZmlsdGVyXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKi9cblx0Z2V0RGF0YShrZXksIGZpbHRlcikge1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKHRvU2NvcGUoZmlsdGVyKSk7XG5cdFx0aWYgKGtleSA9PSBudWxsKSByZXR1cm4gcmVzb2x2ZXIuY29udGV4dDtcblxuXHRcdHJldHVybiByZXNvbHZlci5jb250ZXh0W3RvS2V5KGtleSldO1xuXHR9XG5cblx0LyoqXG5cdCAqIHVwZGF0ZSBkYXRhIGF0IGNvbnRleHRcblx0ICpcblx0ICogV2l0aG91dCBhIGZpbHRlciB0aGUgdmFsdWUgaXMgY2hhbmdlZCB3aGVyZSB0aGUga2V5IGxpdmVzLCBjb3VudGluZyBmcm9tIGhlcmUgdG93YXJkcyB0aGUgcm9vdCxcblx0ICogYW5kIGNyZWF0ZWQgaGVyZSB3aGVyZSBubyByZXNvbHZlciBjYXJyaWVzIGl0LiBXaXRoIGEgZmlsdGVyIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIgaXMgdGhlXG5cdCAqIHRhcmdldCBvdXRyaWdodCAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWVcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICovXG5cdHVwZGF0ZURhdGEoa2V5LCB2YWx1ZSwgZmlsdGVyKSB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSB0b0tleShrZXkpO1xuXHRcdGNvbnN0IHNjb3BlID0gdG9TY29wZShmaWx0ZXIpO1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKHNjb3BlKTtcblxuXHRcdGNvbnN0IHRhcmdldCA9IHNjb3BlID8gcmVzb2x2ZXIgOiB0aGlzLiNyZXNvbHZlckZvcktleShwcm9wZXJ0eSkgfHwgdGhpcztcblx0XHR0YXJnZXQuY29udGV4dFtwcm9wZXJ0eV0gPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBkZWxldGUgZGF0YSBmcm9tIGNvbnRleHRcblx0ICpcblx0ICogUmVtb3ZlcyB0aGUga2V5IGZyb20gb25lIHJlc29sdmVyIC0gdGhlIGFkZHJlc3NlZCBvbmUgd2l0aCBhIGZpbHRlciwgYW5kIHdpdGhvdXQgb25lIHRoZSBmaXJzdFxuXHQgKiByZXNvbHZlciBjYXJyeWluZyBpdCwgY291bnRpbmcgZnJvbSBoZXJlIHRvd2FyZHMgdGhlIHJvb3QuIFJlbW92aW5nIGl0IHVuY292ZXJzIHRoZSB2YWx1ZSBvZlxuXHQgKiB0aGUgbmV4dCByZXNvbHZlciB0aGF0IGNhcnJpZXMgdGhlIHNhbWUga2V5IC0gU1BFQ0lGSUNBVElPTi5tZCA2LjYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICovXG5cdGRlbGV0ZURhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHRvS2V5KGtleSk7XG5cdFx0Y29uc3Qgc2NvcGUgPSB0b1Njb3BlKGZpbHRlcik7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoc2NvcGUpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2NvcGUgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KHByb3BlcnR5KTtcblx0XHRpZiAodGFyZ2V0KSBkZWxldGUgdGFyZ2V0LmNvbnRleHRbcHJvcGVydHldO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lcmdlIGNvbnRleHQgb2JqZWN0XG5cdCAqXG5cdCAqIEEgc2hhbGxvdyBhc3NpZ25tZW50IGludG8gdGhlIGNvbnRleHQgb2YgdGhlIGFkZHJlc3NlZCByZXNvbHZlciwgcmVwbGFjaW5nIHdoYXQgaXMgdGhlcmUgYW5kIGFkZGluZ1xuXHQgKiB3aGF0IGlzIG5vdC4gTm8gc2VhcmNoIGFsb25nIHRoZSBjaGFpbjogYSBtZXJnZWQga2V5IHNoYWRvd3MgdGhlIHJlc29sdmVycyBhYm92ZSBmcm9tIGhlcmUgb24gLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICovXG5cdG1lcmdlQ29udGV4dChjb250ZXh0LCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcih0b1Njb3BlKGZpbHRlcikpO1xuXHRcdGlmIChjb250ZXh0ID09IG51bGwpIHJldHVybjtcblx0XHRpZiAodHlwZW9mIGNvbnRleHQgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGNvbnRleHQgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgbWVyZ2VDb250ZXh0IHRha2VzIGFuIG9iamVjdCwgbm90IGEgJHt0eXBlb2YgY29udGV4dH0hYCk7XG5cblx0XHRyZXNvbHZlci5jb250ZXh0SGFuZGxlLm1lcmdlRGF0YShjb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXNvbHZlZCBhbiBleHByZXNzaW9uIHN0cmluZyB0byBkYXRhXG5cdCAqXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHJldHVybnMge1Byb21pc2U8Kj59XG5cdCAqL1xuXHRhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhRGVmYXVsdCkge1xuXHRcdC8vIDQuMjogYSBtaXN0YWtlIGluIHRoZSBjYWxsaW5nIGNvZGUsIG5vdCBhIGZhaWxlZCBzdGF0ZW1lbnQgLSBzbyBubyB3YXJuaW5nIGFuZCBubyBkZWZhdWx0XG5cdFx0aWYgKHR5cGVvZiBhRXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgcmVzb2x2ZSB0YWtlcyBhbiBleHByZXNzaW9uIGFzIGEgc3RyaW5nLCBub3QgYSAke3R5cGVvZiBhRXhwcmVzc2lvbn0hYCk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHR0cnkge1xuXHRcdFx0Ly8gNC4zOiB0aGUgZGVsaW1pdGVkIGZvcm0gb3IgYSBiYXJlIHN0YXRlbWVudCwgdG9sZCBhcGFydCBieSB0aGUgc2Nhbm5lclxuXHRcdFx0Y29uc3QgeyBzY29wZSwgc3RhdGVtZW50IH0gPSBwYXJzZUV4cHJlc3Npb24oYUV4cHJlc3Npb24pO1xuXHRcdFx0cmV0dXJuIGF3YWl0IHJlc29sdmUodGhpcy4jZXhlY3V0ZXIsIHRoaXMsIHN0YXRlbWVudCwgc2NvcGUsIGRlZmF1bHRWYWx1ZSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0Ly8gNzogdGhlIGVycm9yIGlzIGxvZ2dlZCBhbmQgaGFuZGVkIG9uLiByZXNvbHZlIGFuc3dlcnMgYSB2YWx1ZSBvciBzYXlzIHdoeSBpdCBjYW5ub3QsXG5cdFx0XHQvLyBhbmQgYSBkZWZhdWx0IHZhbHVlIGNvdmVycyBhIG1pc3NpbmcgcmVzdWx0LCBuZXZlciBhbiBlcnJvci5cblx0XHRcdHdhcm5GYWlsZWRTdGF0ZW1lbnQoYUV4cHJlc3Npb24sIGUpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogcmVwbGFjZSBhbGwgZXhwcmVzc2lvbnMgYXQgYSBzdHJpbmdcdCAqXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHJldHVybnMge1Byb21pc2U8Kj59XG5cdCAqL1xuXHRhc3luYyByZXNvbHZlVGV4dChhVGV4dCwgYURlZmF1bHQpIHtcblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGByZXNvbHZlVGV4dCB0YWtlcyBhIHRleHQgYXMgYSBzdHJpbmcsIG5vdCBhICR7dHlwZW9mIGFUZXh0fSFgKTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXG5cdFx0Y29uc3Qgb2NjdXJyZW5jZXMgPSBzY2FuKGFUZXh0KTtcblx0XHRpZiAoIW9jY3VycmVuY2VzKSByZXR1cm4gYVRleHQ7XG5cblx0XHRsZXQgdGV4dCA9IFwiXCI7XG5cdFx0bGV0IHBvc2l0aW9uID0gMDtcblx0XHRmb3IgKGNvbnN0IG9jY3VycmVuY2Ugb2Ygb2NjdXJyZW5jZXMpIHtcblx0XHRcdC8vIDMuMjogYW4gZXNjYXBpbmcgYmFja3NsYXNoIGlzIGNvbnN1bWVkLCBldmVyeXRoaW5nIGVsc2UgaW4gZnJvbnQgb2YgdGhlIGV4cHJlc3Npb25cblx0XHRcdC8vIHN0YW5kcyBhcyB3cml0dGVuXG5cdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhwb3NpdGlvbiwgb2NjdXJyZW5jZS5lc2NhcGVkID8gb2NjdXJyZW5jZS5zdGFydCAtIDEgOiBvY2N1cnJlbmNlLnN0YXJ0KTtcblx0XHRcdHBvc2l0aW9uID0gb2NjdXJyZW5jZS5lbmQ7XG5cblx0XHRcdGlmIChvY2N1cnJlbmNlLmVzY2FwZWQpIHtcblx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR0ZXh0ICs9IGF3YWl0IHJlc29sdmUodGhpcy4jZXhlY3V0ZXIsIHRoaXMsIG9jY3VycmVuY2Uuc3RhdGVtZW50LCBvY2N1cnJlbmNlLnNjb3BlLCBkZWZhdWx0VmFsdWUpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Ly8gNzogYW4gZXhwcmVzc2lvbiB3aG9zZSBzdGF0ZW1lbnQgZmFpbGVkIHN0YW5kcyBhcyB3cml0dGVuLCBhbmQgdGhlIGRlZmF1bHQgdmFsdWVcblx0XHRcdFx0XHQvLyBkb2VzIG5vdCBjb3ZlciBpdC4gVGhlIHJlc3Qgb2YgdGhlIHRleHQga2VlcHMgcmVuZGVyaW5nLlxuXHRcdFx0XHRcdHdhcm5GYWlsZWRTdGF0ZW1lbnQob2NjdXJyZW5jZS5zdGF0ZW1lbnQsIGUpO1xuXHRcdFx0XHRcdHRleHQgKz0gYVRleHQuc3Vic3RyaW5nKG9jY3VycmVuY2Uuc3RhcnQsIG9jY3VycmVuY2UuZW5kKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0ICsgYVRleHQuc3Vic3RyaW5nKHBvc2l0aW9uKTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXNvbHZlIGFuIGV4cHJlc3Npb24gc3RyaW5nIHRvIGRhdGFcblx0ICpcblx0ICogVGFrZXMgdGhlIGFyZ3VtZW50cyBwb3NpdGlvbmFsbHksIG9yIG9uZSBjb25maWd1cmF0aW9uIG9iamVjdFxuXHQgKiBgeyBleHByZXNzaW9uLCBjb250ZXh0LCBkZWZhdWx0VmFsdWUsIHRpbWVvdXQgfWAsIGJlaGluZCB3aGljaCBldmVyeSBhcmd1bWVudCBpcyBpZ25vcmVkIC1cblx0ICogU1BFQ0lGSUNBVElPTi5tZCA0LjEuIEEgZmlyc3QgYXJndW1lbnQgdGhhdCBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBvYmplY3QsIGFuZCBhXG5cdCAqIGNvbmZpZ3VyYXRpb24gd2l0aG91dCBhIHN0cmluZyB1bmRlciBgZXhwcmVzc2lvbmAsIHJlamVjdCB3aXRoIGEgYFR5cGVFcnJvcmAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfHsgZXhwcmVzc2lvbjogc3RyaW5nLCBjb250ZXh0Pzogb2JqZWN0LCBkZWZhdWx0VmFsdWU/OiAqLCB0aW1lb3V0PzogbnVtYmVyIH19IGFFeHByZXNzaW9uXG5cdCAqIEBwYXJhbSB7P29iamVjdH0gYUNvbnRleHRcblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBhVGltZW91dFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICovXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XG5cdFx0aWYgKGlzQ29uZmlndXJhdGlvbihhcmd1bWVudHNbMF0pKSB7XG5cdFx0XHRjb25zdCB7IGV4cHJlc3Npb24sIGNvbnRleHQsIHRpbWVvdXQgfSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdGlmICh0eXBlb2YgZXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlIHRha2VzIGEgY29uZmlndXJhdGlvbiBjYXJyeWluZyB0aGUgZXhwcmVzc2lvbiBhcyBhIHN0cmluZyB1bmRlciB0aGUga2V5IGV4cHJlc3Npb24hXCIpO1xuXHRcdFx0cmV0dXJuIEV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlKGV4cHJlc3Npb24sIGNvbnRleHQsIGRlZmF1bHRPZihhcmd1bWVudHNbMF0pLCB0aW1lb3V0KTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBhRXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlIHRha2VzIGEgc3RyaW5nIG9yIGEgY29uZmlndXJhdGlvbiBvYmplY3QhXCIpO1xuXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dDogYUNvbnRleHQgfSk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdGlmICh0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKSk7XG5cdFx0XHRcdH0sIGFUaW1lb3V0KTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLnJlc29sdmUoYUV4cHJlc3Npb24sIGRlZmF1bHRWYWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogcmVwbGFjZSBleHByZXNzaW9uIGF0IHRleHRcblx0ICpcblx0ICogVGFrZXMgdGhlIGFyZ3VtZW50cyBwb3NpdGlvbmFsbHksIG9yIG9uZSBjb25maWd1cmF0aW9uIG9iamVjdFxuXHQgKiBgeyB0ZXh0LCBjb250ZXh0LCBkZWZhdWx0VmFsdWUsIHRpbWVvdXQgfWAsIGJlaGluZCB3aGljaCBldmVyeSBhcmd1bWVudCBpcyBpZ25vcmVkIC1cblx0ICogU1BFQ0lGSUNBVElPTi5tZCA0LjEuIEEgZmlyc3QgYXJndW1lbnQgdGhhdCBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBvYmplY3QsIGFuZCBhXG5cdCAqIGNvbmZpZ3VyYXRpb24gd2l0aG91dCBhIHN0cmluZyB1bmRlciBgdGV4dGAsIHJlamVjdCB3aXRoIGEgYFR5cGVFcnJvcmAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfHsgdGV4dDogc3RyaW5nLCBjb250ZXh0Pzogb2JqZWN0LCBkZWZhdWx0VmFsdWU/OiAqLCB0aW1lb3V0PzogbnVtYmVyIH19IGFUZXh0XG5cdCAqIEBwYXJhbSB7P29iamVjdH0gYUNvbnRleHRcblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBhVGltZW91dFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICovXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlVGV4dChhVGV4dCwgYUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCkge1x0XHRcblx0XHRpZiAoaXNDb25maWd1cmF0aW9uKGFyZ3VtZW50c1swXSkpIHtcblx0XHRcdGNvbnN0IHsgdGV4dCwgY29udGV4dCwgdGltZW91dCB9ID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0aWYgKHR5cGVvZiB0ZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmVUZXh0IHRha2VzIGEgY29uZmlndXJhdGlvbiBjYXJyeWluZyB0aGUgdGV4dCBhcyBhIHN0cmluZyB1bmRlciB0aGUga2V5IHRleHQhXCIpO1xuXHRcdFx0cmV0dXJuIEV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlVGV4dCh0ZXh0LCBjb250ZXh0LCBkZWZhdWx0T2YoYXJndW1lbnRzWzBdKSwgdGltZW91dCk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgYVRleHQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZVRleHQgdGFrZXMgYSBzdHJpbmcgb3IgYSBjb25maWd1cmF0aW9uIG9iamVjdCFcIik7XG5cblx0XHRjb25zdCByZXNvbHZlciA9IG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0OiBhQ29udGV4dCB9KTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0aWYgKHR5cGVvZiBhVGltZW91dCA9PT0gXCJudW1iZXJcIiAmJiBhVGltZW91dCA+IDApXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNvbHZlci5yZXNvbHZlVGV4dChhVGV4dCwgZGVmYXVsdFZhbHVlKSk7XG5cdFx0XHRcdH0sIGFUaW1lb3V0KTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLnJlc29sdmVUZXh0KGFUZXh0LCBkZWZhdWx0VmFsdWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIGJ1aWxkIGEgcmVzb2x2ZXIgb3ZlciBhIGZpbHRlcmVkIGNvcHkgb2YgdGhlIGNvbnRleHRcblx0ICpcblx0ICogVGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvIHRoZSBjb250ZXh0IG9ubHksIG5ldmVyIHRvIHRoZSBnbG9iYWxzLCBzbyB0aGlzIGlzIGEgd2F5IHRvIGhhbmRcblx0ICogb3ZlciBhIGNsZWFuZWQgY29udGV4dCBhbmQgbm90IGEgc2FuZGJveC5cblx0ICpcblx0ICogYG9wdGlvbmAgY2FycmllcyB0aGUgZmlsdGVyJ3Mgb3duIGBkZWVwYCB0b2dldGhlciB3aXRoIHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGBuYW1lYCxcblx0ICogYHBhcmVudGAgYW5kIGBleGVjdXRlcmAsIHdoaWNoIGFyZSBoYW5kZWQgb24gYXMgdGhleSBhcmUuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZyB0aGUgZmlsdGVyIGFyZ3VtZW50cywgcGx1cyB0aGUgd2hvbGUgY29uc3RydWN0b3Igb3B0aW9uIHNldFxuXHQgKiBAcGFyYW0ge29iamVjdH0gYXJnLmNvbnRleHRcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gYXJnLnByb3BGaWx0ZXJcblx0ICogQHBhcmFtIHtvYmplY3R9IFthcmcub3B0aW9uPXsgZGVlcDogdHJ1ZSwgbmFtZTogbnVsbCwgcGFyZW50OiBudWxsLCBleGVjdXRlcjogbnVsbCB9XVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFthcmcub3B0aW9uLmRlZXA9dHJ1ZV1cblx0ICogQHBhcmFtIHtzdHJpbmd9IFthcmcub3B0aW9uLm5hbWU9bnVsbF1cblx0ICogQHBhcmFtIHtFeHByZXNzaW9uUmVzb2x2ZXJ9IFthcmcub3B0aW9uLnBhcmVudD1udWxsXVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2FyZy5vcHRpb24uZXhlY3V0ZXI9bnVsbF1cblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcn1cblx0ICovXG5cdHN0YXRpYyBidWlsZFNlY3VyZSh7IGNvbnRleHQsIHByb3BGaWx0ZXIsIG9wdGlvbiA9IHsgZGVlcDogdHJ1ZSwgbmFtZTogbnVsbCwgcGFyZW50OiBudWxsLCBleGVjdXRlcjogbnVsbCB9IH0pIHtcblx0XHRjb25zdCB7IGRlZXAgPSB0cnVlLCBuYW1lLCBwYXJlbnQsIGV4ZWN1dGVyIH0gPSBvcHRpb247XG5cdFx0Y29udGV4dCA9IE9iamVjdFV0aWxzLmZpbHRlcihjb250ZXh0LCBwcm9wRmlsdGVyLCB7ZGVlcH0pO1xuXHRcdHJldHVybiBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dCwgbmFtZSwgcGFyZW50LCBleGVjdXRlciB9KTtcblx0fVxufVxuXG4iLCIvKipcbiAqIEZpbmRzIHRoZSBleHByZXNzaW9ucyBvZiBhIHRleHQgYW5kIHRha2VzIGEgc2luZ2xlIGV4cHJlc3Npb24gYXBhcnQgLSBTUEVDSUZJQ0FUSU9OLm1kIDMuMSB0b1xuICogMy4zIGFuZCA0LjMuIEl0IHJlYWRzIHdoZXJlIGFuIGV4cHJlc3Npb24gYmVnaW5zIGFuZCBlbmRzLCB3aGV0aGVyIGl0IGlzIGVzY2FwZWQsIGFuZCB3aGljaCBzY29wZVxuICogcHJlZml4IGl0IGNhcnJpZXM7IGV2YWx1YXRpbmcgYSBzdGF0ZW1lbnQgYW5kIGFkZHJlc3NpbmcgYSBzY29wZSBpcyBFeHByZXNzaW9uUmVzb2x2ZXIncy5cbiAqXG4gKiBJbnRlcm5hbCB0byB0aGUgcGFja2FnZTogaW5kZXguanMgZG9lcyBub3QgZXhwb3J0IGl0LlxuICovXG5cbmltcG9ydCB7IFdISVRFU1BBQ0UsIGlzTmFtZUNoYXJhY3Rlciwgbm9ybWFsaXplIH0gZnJvbSBcIi4vVXRpbHMuanNcIjtcblxuY29uc3QgRVhQUkVTU0lPTl9TVEFSVCA9IFwiJHtcIjtcblxuLy8gdGhlIHNjYW5uZXIgc3RhdGVzIC0gZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBjb2RlIGhpZGVzIHRoZSBicmFjZXMgaW5zaWRlIGl0LCBzZWVcbi8vIFNQRUNJRklDQVRJT04ubWQgMy4xXG5jb25zdCBDT0RFID0gMDtcbmNvbnN0IFNJTkdMRV9RVU9URUQgPSAxO1xuY29uc3QgRE9VQkxFX1FVT1RFRCA9IDI7XG5jb25zdCBURU1QTEFURSA9IDM7XG5jb25zdCBSRUdFWCA9IDQ7XG5jb25zdCBSRUdFWF9DTEFTUyA9IDU7XG5jb25zdCBCTE9DS19DT01NRU5UID0gNjtcbmNvbnN0IExJTkVfQ09NTUVOVCA9IDc7XG5cbi8vIGEgXCIvXCIgY29udGludWVzIGFuIGV4cHJlc3Npb24gaW5zdGVhZCBvZiBvcGVuaW5nIGEgcmVndWxhciBleHByZXNzaW9uIHdoZW4gaXQgZm9sbG93cyBvbmUgb2Zcbi8vIHRoZXNlIC0gdGhlIGNsYXNzaWMgZGl2aXNpb24tb3ItcmVnZXggcXVlc3Rpb24sIGRlY2lkZWQgb24gdGhlIGxhc3QgY2hhcmFjdGVyIHRoYXQgaXMgbmVpdGhlclxuLy8gd2hpdGVzcGFjZSBub3IgcGFydCBvZiBhIGNvbW1lbnRcbmNvbnN0IEJFRk9SRV9ESVZJU0lPTiA9IC9bYS16QS1aMC05XyQpXFxdXS87XG5cbi8vIHRoZSBjaGFyYWN0ZXJzIHRoZSBzY2FubmVyIGRlY2lkZXMgb24sIGNvbXBhcmVkIGFzIGNoYXIgY29kZXMgcmF0aGVyIHRoYW4gYXMgb25lLWNoYXJhY3RlciBzdHJpbmdzXG5jb25zdCBCQUNLU0xBU0ggPSAweDVjO1xuY29uc3QgRE9MTEFSID0gMHgyNDtcbmNvbnN0IE9QRU5fQlJBQ0UgPSAweDdiO1xuY29uc3QgQ0xPU0VfQlJBQ0UgPSAweDdkO1xuY29uc3QgU0lOR0xFX1FVT1RFID0gMHgyNztcbmNvbnN0IERPVUJMRV9RVU9URSA9IDB4MjI7XG5jb25zdCBCQUNLVElDSyA9IDB4NjA7XG5jb25zdCBTTEFTSCA9IDB4MmY7XG5jb25zdCBTVEFSID0gMHgyYTtcbmNvbnN0IExJTkVfRkVFRCA9IDB4MGE7XG5jb25zdCBDQVJSSUFHRV9SRVRVUk4gPSAweDBkO1xuY29uc3QgTElORV9TRVBBUkFUT1IgPSAweDIwMjg7XG5jb25zdCBQQVJBR1JBUEhfU0VQQVJBVE9SID0gMHgyMDI5O1xuY29uc3QgT1BFTl9CUkFDS0VUID0gMHg1YjtcbmNvbnN0IENMT1NFX0JSQUNLRVQgPSAweDVkO1xuY29uc3QgQ09MT04gPSAweDNhO1xuXG5jb25zdCBTQ09QRV9TRVBBUkFUT1IgPSBcIjo6XCI7XG5cbi8qKlxuICogV2hldGhlciB0aGUgXCIvXCIgYXQgYUluZGV4IG9wZW5zIGEgcmVndWxhciBleHByZXNzaW9uIGxpdGVyYWwsIGRlY2lkZWQgb24gdGhlIGNoYXJhY3RlciBiZWZvcmUgaXRcbiAqIHRoYXQgaXMgbmVpdGhlciB3aGl0ZXNwYWNlIG5vciBwYXJ0IG9mIGEgY29tbWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBhSW5kZXhcbiAqIEBwYXJhbSB7P0FycmF5PG51bWJlcj59IHRoZUNvbW1lbnRzIHRoZSBjb21tZW50cyByZWFkIHNvIGZhciBhcyBmbGF0IHN0YXJ0IGFuZCBlbmQgaW5kZXggcGFpcnMsIGluXG4gKiB0aGUgb3JkZXIgdGhleSBzdGFuZDsgbnVsbCB3aGVyZSB0aGUgZXhwcmVzc2lvbiBoYXMgbm9uZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IHN0YXJ0c1JlZ2V4ID0gKGFUZXh0LCBhSW5kZXgsIHRoZUNvbW1lbnRzKSA9PiB7XG5cdGxldCBpbmRleCA9IGFJbmRleCAtIDE7XG5cdGxldCBjb21tZW50ID0gdGhlQ29tbWVudHMgPyB0aGVDb21tZW50cy5sZW5ndGggLSAxIDogLTE7XG5cdHdoaWxlIChpbmRleCA+PSAwKSB7XG5cdFx0d2hpbGUgKGluZGV4ID49IDAgJiYgV0hJVEVTUEFDRS50ZXN0KGFUZXh0W2luZGV4XSkpIGluZGV4LS07XG5cdFx0Ly8gYSBsaW5lIGNvbW1lbnQgbWF5IGVuZCBpbiB3aGl0ZXNwYWNlLCBzbyB0aGUgd2FsayBjYW4gbGFuZCBpbnNpZGUgaXQgcmF0aGVyIHRoYW4gb24gaXRzIGVuZFxuXHRcdGlmIChjb21tZW50IDwgMCB8fCBpbmRleCA8IHRoZUNvbW1lbnRzW2NvbW1lbnQgLSAxXSB8fCBpbmRleCA+IHRoZUNvbW1lbnRzW2NvbW1lbnRdKSBicmVhaztcblxuXHRcdGluZGV4ID0gdGhlQ29tbWVudHNbY29tbWVudCAtIDFdIC0gMTtcblx0XHRjb21tZW50IC09IDI7XG5cdH1cblxuXHRyZXR1cm4gaW5kZXggPCAwIHx8ICFCRUZPUkVfRElWSVNJT04udGVzdChhVGV4dFtpbmRleF0pO1xufTtcblxuY29uc3QgZW5kc0xpbmUgPSAoYUNvZGUpID0+IGFDb2RlID09PSBMSU5FX0ZFRUQgfHwgYUNvZGUgPT09IENBUlJJQUdFX1JFVFVSTiB8fCBhQ29kZSA9PT0gTElORV9TRVBBUkFUT1IgfHwgYUNvZGUgPT09IFBBUkFHUkFQSF9TRVBBUkFUT1I7XG5cbi8qXG4gKiBUd28gc3BsaXRzIHRha2UgdGhlIHRleHQgYmV0d2VlbiB0aGUgZGVsaW1pdGVycyBhcGFydCBpbnRvIHRoZSBzY29wZSBwcmVmaXggb2YgMy4zIGFuZCB0aGVcbiAqIHN0YXRlbWVudCAtIHRoaXMgb25lIGZvciBhIHRleHQsIGBzcGxpdFNjb3BlQW5kU3RhdGVtZW50QnlTZXBhcmF0b3JgIGJlaGluZCBgcGFyc2VFeHByZXNzaW9uYCBmb3JcbiAqIHRoZSBzaW5nbGUgZXhwcmVzc2lvbiBvZiBgcmVzb2x2ZWAuIFRoZXkgYXJlIHR3byBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIG9uZSBydWxlLCBlYWNoIG1lYXN1cmVkXG4gKiBmYXN0ZXIgZm9yIG90aGVyIHN0YXRlbWVudHMgKERFQ0lTSU9OUy5tZCwgMjAyNi0wOS0yNyk6IGEgdGV4dCByZWFkcyBmb3J3YXJkcywgdGhlIHNpbmdsZVxuICogZXhwcmVzc2lvbiBmcm9tIHRoZSBmaXJzdCBcIjo6XCIgYmFja3dhcmRzLiB0ZXN0L2V4cHJlc3Npb25zY2FubmVyL3Njb3BlLXByZWZpeC5UZXN0LmpzIGFza3MgZXZlcnlcbiAqIGNhc2Ugb2YgYm90aC5cbiAqL1xuXG4vKipcbiAqIFRoZSBzcGxpdCBvZiBhIHRleHQ6IHJlYWRzIGZvcndhcmRzIG9ubHkgYXMgZmFyIGFzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgYSBuYW1lIGNhbm5vdCBjYXJyeSwgd2hpY2hcbiAqIGZvciBtb3N0IHN0YXRlbWVudHMgaXMgYSBmZXcgY2hhcmFjdGVycy5cbiAqL1xuY29uc3Qgc3BsaXRTY29wZUFuZFN0YXRlbWVudCA9IChhQ29udGVudCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhQ29udGVudC5sZW5ndGg7XG5cdGxldCBpbmRleCA9IDA7XG5cdHdoaWxlIChpbmRleCA8IGxlbmd0aCAmJiBpc05hbWVDaGFyYWN0ZXIoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkpKSBpbmRleCsrO1xuXG5cdGlmIChpbmRleCA9PT0gMCB8fCBhQ29udGVudC5jaGFyQ29kZUF0KGluZGV4KSAhPT0gQ09MT04gfHwgYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCArIDEpICE9PSBDT0xPTilcblx0XHRyZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBub3JtYWxpemUoYUNvbnRlbnQpIH07XG5cblx0cmV0dXJuIHsgc2NvcGU6IG5vcm1hbGl6ZShhQ29udGVudC5zdWJzdHJpbmcoMCwgaW5kZXgpKSwgc3RhdGVtZW50OiBub3JtYWxpemUoYUNvbnRlbnQuc3Vic3RyaW5nKGluZGV4ICsgMikpIH07XG59O1xuXG5jb25zdCBjb3VudEJhY2tzbGFzaGVzID0gKGFUZXh0LCBhSW5kZXgpID0+IHtcblx0bGV0IGNvdW50ID0gMDtcblx0d2hpbGUgKGFJbmRleCAtIGNvdW50ID4gMCAmJiBhVGV4dC5jaGFyQ29kZUF0KGFJbmRleCAtIGNvdW50IC0gMSkgPT09IEJBQ0tTTEFTSCkgY291bnQrKztcblxuXHRyZXR1cm4gY291bnQ7XG59O1xuXG4vKipcbiAqIFJlYWRzIHRoZSBvbmUgZXhwcmVzc2lvbiB3aG9zZSBcIiR7XCIgc3RhbmRzIGF0IGFTdGFydCwgY291bnRpbmcgYnJhY2VzIGJ1dCBub3QgdGhlIG9uZXMgaGlkZGVuXG4gKiBpbnNpZGUgYSBsaXRlcmFsIG9yIGEgY29tbWVudCwgYW5kIHRha2VzIGl0IGFwYXJ0IGludG8gc2NvcGUgcHJlZml4IGFuZCBzdGF0ZW1lbnQuXG4gKlxuICogQW5zd2VycyB0aGUgb2NjdXJyZW5jZSBgc2NhbmAgaGFuZHMgb24sIGBlbmRgIHRoZSBpbmRleCBkaXJlY3RseSBhZnRlciB0aGUgbWF0Y2hpbmcgY2xvc2luZyBicmFjZTtcbiAqIG51bGwgd2hlcmUgdGhlIHRleHQgZW5kcyBiZWZvcmUgdGhhdCBicmFjZSwgd2hpY2ggcGVyIFNQRUNJRklDQVRJT04ubWQgMy4xIG1lYW5zIHRoZXJlIGlzIG5vXG4gKiBleHByZXNzaW9uIGhlcmUgYXQgYWxsOyBhbmQsIHdpdGggYGVuZGAgbmVnYXRlZCwgdGhlIGluZGV4IG9mIGFub3RoZXIgXCIke1wiIG1ldCBvdXRzaWRlIGEgbGl0ZXJhbFxuICogb3IgYSBjb21tZW50LCB3aGljaCBzdGFydHMgYW4gZXhwcmVzc2lvbiBvZiBpdHMgb3duIGFuZCBhYmFuZG9ucyB0aGlzIG9uZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBhU3RhcnRcbiAqIEByZXR1cm5zIHs/eyBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgZXNjYXBlZDogYm9vbGVhbiwgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9fVxuICovXG5jb25zdCByZWFkRXhwcmVzc2lvbiA9IChhVGV4dCwgYVN0YXJ0KSA9PiB7XG5cdGNvbnN0IGxlbmd0aCA9IGFUZXh0Lmxlbmd0aDtcblx0Y29uc3Qgc3RhY2sgPSBbQ09ERV07XG5cdGxldCBjb21tZW50cyA9IG51bGw7XG5cdGxldCBjb21tZW50U3RhcnQgPSAwO1xuXHRsZXQgaW5kZXggPSBhU3RhcnQgKyAyO1xuXG5cdHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuXHRcdGNvbnN0IGNoYXIgPSBhVGV4dC5jaGFyQ29kZUF0KGluZGV4KTtcblx0XHRzd2l0Y2ggKHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdKSB7XG5cdFx0XHRjYXNlIENPREU6XG5cdFx0XHRcdGlmIChjaGFyID09PSBPUEVOX0JSQUNFKSBzdGFjay5wdXNoKENPREUpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBDTE9TRV9CUkFDRSkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdGlmIChzdGFjay5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgc2NvcGUsIHN0YXRlbWVudCB9ID0gc3BsaXRTY29wZUFuZFN0YXRlbWVudChhVGV4dC5zdWJzdHJpbmcoYVN0YXJ0ICsgMiwgaW5kZXgpKTtcblx0XHRcdFx0XHRcdHJldHVybiB7IHN0YXJ0OiBhU3RhcnQsIGVuZDogaW5kZXggKyAxLCBlc2NhcGVkOiBmYWxzZSwgc2NvcGU6IHNjb3BlLCBzdGF0ZW1lbnQ6IHN0YXRlbWVudCB9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChjaGFyID09PSBTSU5HTEVfUVVPVEUpIHN0YWNrLnB1c2goU0lOR0xFX1FVT1RFRCk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPVUJMRV9RVU9URSkgc3RhY2sucHVzaChET1VCTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQkFDS1RJQ0spIHN0YWNrLnB1c2goVEVNUExBVEUpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBET0xMQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBPUEVOX0JSQUNFKSByZXR1cm4geyBzdGFydDogYVN0YXJ0LCBlbmQ6IC1pbmRleCwgZXNjYXBlZDogZmFsc2UsIHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG51bGwgfTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gU0xBU0gpIHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpO1xuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTVEFSIHx8IG5leHQgPT09IFNMQVNIKSB7XG5cdFx0XHRcdFx0XHRzdGFjay5wdXNoKG5leHQgPT09IFNUQVIgPyBCTE9DS19DT01NRU5UIDogTElORV9DT01NRU5UKTtcblx0XHRcdFx0XHRcdGNvbW1lbnRTdGFydCA9IGluZGV4O1xuXHRcdFx0XHRcdFx0aW5kZXgrKztcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHN0YXJ0c1JlZ2V4KGFUZXh0LCBpbmRleCwgY29tbWVudHMpKSBzdGFjay5wdXNoKFJFR0VYKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgQkxPQ0tfQ09NTUVOVDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFNUQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBTTEFTSCkge1xuXHRcdFx0XHRcdHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRcdGluZGV4Kys7XG5cdFx0XHRcdFx0KGNvbW1lbnRzID8/PSBbXSkucHVzaChjb21tZW50U3RhcnQsIGluZGV4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgTElORV9DT01NRU5UOlxuXHRcdFx0XHRpZiAoZW5kc0xpbmUoY2hhcikpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHQoY29tbWVudHMgPz89IFtdKS5wdXNoKGNvbW1lbnRTdGFydCwgaW5kZXggLSAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgU0lOR0xFX1FVT1RFRDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gU0lOR0xFX1FVT1RFKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERPVUJMRV9RVU9URUQ6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPVUJMRV9RVU9URSkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBURU1QTEFURTpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQkFDS1RJQ0spIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBET0xMQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBPUEVOX0JSQUNFKSB7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChDT0RFKTtcblx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBSRUdFWDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gT1BFTl9CUkFDS0VUKSBzdGFjay5wdXNoKFJFR0VYX0NMQVNTKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gU0xBU0gpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgUkVHRVhfQ0xBU1M6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IENMT1NFX0JSQUNLRVQpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aW5kZXgrKztcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBBbnN3ZXJzIGV2ZXJ5IGV4cHJlc3Npb24gb2YgYSB0ZXh0LCBpbiB0aGUgb3JkZXIgdGhleSBzdGFuZCwgb3IgbnVsbCB3aGVyZSB0aGUgdGV4dCBjYXJyaWVzXG4gKiBub25lLiBgc3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgXCIkXCIsIGBlbmRgIHRoZSBpbmRleCBhZnRlciB0aGUgbWF0Y2hpbmcgY2xvc2luZyBicmFjZSwgc28gYVxuICogY2FsbGVyIHJlcGxhY2VzIGJ5IHBvc2l0aW9uIGFuZCBuZXZlciB0b3VjaGVzIGFuIG9jY3VycmVuY2UgdHdpY2UuIFRoZSB0ZXh0IGJldHdlZW4gdHdvXG4gKiBleHByZXNzaW9ucyBpcyBza2lwcGVkIGJ5IGEgbmF0aXZlIHNlYXJjaCBmb3IgdGhlIG5leHQgXCIke1wiLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuICogQHJldHVybnMgez9BcnJheTx7IHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCBlc2NhcGVkOiBib29sZWFuLCBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH0+fVxuICovXG5leHBvcnQgY29uc3Qgc2NhbiA9IChhVGV4dCkgPT4ge1xuXHRsZXQgb2NjdXJyZW5jZXMgPSBudWxsO1xuXHRsZXQgc3RhcnQgPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQpO1xuXG5cdHdoaWxlIChzdGFydCA+PSAwKSB7XG5cdFx0Ly8gMy4yOiBhbiBvZGQgcnVuIG9mIGJhY2tzbGFzaGVzIGVzY2FwZXMgdGhlIGRlbGltaXRlciBpdHNlbGYuIEl0IG9wZW5zIG5vdGhpbmcsIHNvIG9ubHlcblx0XHQvLyB0aG9zZSB0d28gY2hhcmFjdGVycyBhcmUgdGFrZW4gb3V0IG9mIHRoZSB0ZXh0IGFuZCB0aGUgc2NhbiBjYXJyaWVzIG9uIGJlaGluZCB0aGVtIC1cblx0XHQvLyB3aGF0IHdvdWxkIGhhdmUgYmVlbiB0aGUgc3RhdGVtZW50IGlzIG9yZGluYXJ5IHRleHQgYW5kIG1heSBob2xkIGV4cHJlc3Npb25zIG9mIGl0cyBvd24uXG5cdFx0aWYgKGNvdW50QmFja3NsYXNoZXMoYVRleHQsIHN0YXJ0KSAlIDIgPT09IDEpIHtcblx0XHRcdGlmICghb2NjdXJyZW5jZXMpIG9jY3VycmVuY2VzID0gW107XG5cdFx0XHRvY2N1cnJlbmNlcy5wdXNoKHsgc3RhcnQ6IHN0YXJ0LCBlbmQ6IHN0YXJ0ICsgMiwgZXNjYXBlZDogdHJ1ZSwgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbnVsbCB9KTtcblx0XHRcdHN0YXJ0ID0gYVRleHQuaW5kZXhPZihFWFBSRVNTSU9OX1NUQVJULCBzdGFydCArIDIpO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb2NjdXJyZW5jZSA9IHJlYWRFeHByZXNzaW9uKGFUZXh0LCBzdGFydCk7XG5cdFx0Ly8gbm8gbWF0Y2hpbmcgYnJhY2U6IHRoZSB0ZXh0IHN0YW5kcyBhcyB3cml0dGVuLCBhbmQgbm90aGluZyBiZWhpbmQgaXQgY2FuIGJlIGFuXG5cdFx0Ly8gZXhwcmVzc2lvbiBlaXRoZXIgLSBhIFwiJHtcIiBvdXRzaWRlIGEgbGl0ZXJhbCBvciBhIGNvbW1lbnQgd291bGQgaGF2ZSByZXN0YXJ0ZWQgdGhlIHNjYW4gaW5zdGVhZFxuXHRcdGlmICghb2NjdXJyZW5jZSkgYnJlYWs7XG5cdFx0aWYgKG9jY3VycmVuY2UuZW5kIDwgMCkge1xuXHRcdFx0c3RhcnQgPSAtb2NjdXJyZW5jZS5lbmQ7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIW9jY3VycmVuY2VzKSBvY2N1cnJlbmNlcyA9IFtdO1xuXHRcdG9jY3VycmVuY2VzLnB1c2gob2NjdXJyZW5jZSk7XG5cdFx0c3RhcnQgPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQsIG9jY3VycmVuY2UuZW5kKTtcblx0fVxuXG5cdHJldHVybiBvY2N1cnJlbmNlcztcbn07XG5cbi8qKlxuICogVGFrZXMgdGhlIG9uZSBleHByZXNzaW9uIGByZXNvbHZlYCBpcyBoYW5kZWQgYXBhcnQgLSBTUEVDSUZJQ0FUSU9OLm1kIDQuMy5cbiAqXG4gKiBXaGljaCBmb3JtIGlzIGluIGhhbmQgaXMgZGVjaWRlZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVycyBvZiB0aGUgdHJpbW1lZCBpbnB1dC4gVGhlIHdob2xlIGlucHV0XG4gKiBpcyBvbmUgZXhwcmVzc2lvbiwgc28gaXRzIGVuZCBpcyB0aGUgZW5kIG9mIHRoZSBpbnB1dC4gVGhlIGVzY2FwaW5nIG9mIDMuMiBkb2VzIG5vdCBhcHBseSBoZXJlIC1cbiAqIGl0IGlzIGEgcnVsZSBvZiB0aGUgdGV4dCBmb3JtLCBhbmQgdGhlcmUgaXMgbm8gc3Vycm91bmRpbmcgdGV4dCwgc28gYSBiYWNrc2xhc2ggYmVsb25ncyB0byB0aGVcbiAqIHN0YXRlbWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cbiAqIEByZXR1cm5zIHt7IHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfX1cbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSB3aGVyZSB0aGUgaW5wdXQgb3BlbnMgd2l0aCBcIiR7XCIgYW5kIGRvZXMgbm90IGVuZCB3aXRoIFwifVwiXG4gKi9cbmV4cG9ydCBjb25zdCBwYXJzZUV4cHJlc3Npb24gPSAoYUV4cHJlc3Npb24pID0+IHtcblx0YUV4cHJlc3Npb24gPSBhRXhwcmVzc2lvbi50cmltKCk7XG5cblx0aWYgKGFFeHByZXNzaW9uLnN0YXJ0c1dpdGgoRVhQUkVTU0lPTl9TVEFSVCkpIHtcblx0XHRpZiAoIWFFeHByZXNzaW9uLmVuZHNXaXRoKFwifVwiKSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBFeHByZXNzaW9uIGRvZXMgbm90IGVuZCB3aXRoIFwifVwiOiAke2FFeHByZXNzaW9ufWApO1xuXG5cdFx0cmV0dXJuIHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRCeVNlcGFyYXRvcihhRXhwcmVzc2lvbi5zdWJzdHJpbmcoMiwgYUV4cHJlc3Npb24ubGVuZ3RoIC0gMSkpO1xuXHR9XG5cblx0Ly8gYW55dGhpbmcgZWxzZSBpcyBhIHN0YXRlbWVudCBpbiBmdWxsLCBhbmQgY2FycmllcyBubyBzY29wZSBwcmVmaXhcblx0cmV0dXJuIHsgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbm9ybWFsaXplKGFFeHByZXNzaW9uKSB9O1xufTtcblxuLyoqXG4gKiBUaGUgc3BsaXQgb2YgdGhlIHNpbmdsZSBleHByZXNzaW9uOiBtb3N0IHN0YXRlbWVudHMgY2Fycnkgbm8gXCI6OlwiIGF0IGFsbCBhbmQgYXJlIGRvbmUgYWZ0ZXIgb25lXG4gKiBuYXRpdmUgc2VhcmNoLiBXaGVyZSBvbmUgc3RhbmRzLCBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZmlyc3Qgb2YgdGhlbSBoYXMgdG8gYmUgYSBuYW1lLCBjaGVja2VkXG4gKiBiYWNrd2FyZHMgZnJvbSBpdDogYSBcIjo6XCIgaW5zaWRlIGEgc3RhdGVtZW50IC0gYSBxdW90ZWQgb25lIC0gdXN1YWxseSBoYXMgYSBjaGFyYWN0ZXIgbm8gbmFtZVxuICogY2FycmllcyByaWdodCBpbiBmcm9udCBvZiBpdC5cbiAqL1xuY29uc3Qgc3BsaXRTY29wZUFuZFN0YXRlbWVudEJ5U2VwYXJhdG9yID0gKGFDb250ZW50KSA9PiB7XG5cdGNvbnN0IGVuZCA9IGFDb250ZW50LmluZGV4T2YoU0NPUEVfU0VQQVJBVE9SKTtcblx0aWYgKGVuZCA8IDEpIHJldHVybiB7IHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG5vcm1hbGl6ZShhQ29udGVudCkgfTtcblxuXHRmb3IgKGxldCBpbmRleCA9IGVuZCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBub3JtYWxpemUoYUNvbnRlbnQpIH07XG5cblx0cmV0dXJuIHsgc2NvcGU6IG5vcm1hbGl6ZShhQ29udGVudC5zdWJzdHJpbmcoMCwgZW5kKSksIHN0YXRlbWVudDogbm9ybWFsaXplKGFDb250ZW50LnN1YnN0cmluZyhlbmQgKyAyKSkgfTtcbn07XG4iLCJpbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcbmltcG9ydCB7IGlzTnVsbE9yVW5kZWZpbmVkIH0gZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5cbi8qKlxuICogVGhlIGRlc2NyaXB0b3IgYSBwcm9wZXJ0eSBoYXMgd2hlcmUgaXQgaXMgZGVmaW5lZCAtIG93biBvciBhbnl3aGVyZSB1cCB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gKiB0aGUgb2JqZWN0IGhvbGRpbmcgaXQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfHN5bWJvbH0gcHJvcGVydHlcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eURlc2NyaXB0b3J8bnVsbH1cbiAqL1xuY29uc3QgZmluZFByb3BlcnR5RGVzY3JpcHRvciA9IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRsZXQgdHlwZSA9IGRhdGE7XG5cdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodHlwZSwgcHJvcGVydHkpO1xuXHRcdGlmIChkZXNjcmlwdG9yKSByZXR1cm4gZGVzY3JpcHRvcjtcblx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBQcm9wZXJ0eSBjYWNoZSBmb3IgYSBjb250ZXh0IHRoYXQgaXMgdGhlIGdsb2JhbCBvYmplY3QgaXRzZWxmLlxuICpcbiAqIEl0IGFuc3dlcnMgbGlrZSB0aGUgTWFwIGl0IHJlcGxhY2VzOiBldmVyeSBuYW1lIGlzIHByZXNlbnQsIGFuZCB0aGUgdmFsdWUgaXMgdGhlIGhhbmRsZVxuICogaG9sZGluZyBpdCAtIG5ldmVyIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuIFRoYXQgaXMgdGhlIGNvbnRyYWN0IG9mICNnZXRQcm9wZXJ0eURlZixcbiAqIHdob3NlIGNhbGxlciByZWFkcyB0aGUgcHJvcGVydHkgb2ZmIHRoZSBoYW5kbGUgaXQgZ2V0cyBiYWNrLlxuICpcbiAqIEJlY2F1c2UgZXZlcnkgbmFtZSBpcyBwcmVzZW50LCBzdWNoIGEgcmVzb2x2ZXIgYW5zd2VycyBldmVyeSBsb29rdXAgYW5kIG5vdGhpbmcgYmVsb3cgaXQgaXNcbiAqIHJlYWNoZWQsIGFuZCBvd25LZXlzIHJlcG9ydHMgZXZlcnkgb3duIGtleSBvZiB0aGUgZ2xvYmFsIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1Jlc29sdmVyQ29udGV4dEhhbmRsZX0gaGFuZGxlXG4gKi9cbmNvbnN0IGNyZWF0ZUdsb2JhbENhY2hlV3JhcHBlciA9IChoYW5kbGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYXM6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSxcblx0XHRnZXQ6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGhhbmRsZTtcblx0XHR9LFxuXHRcdHNldDogKHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0ZGVsZXRlOiAocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdGtleXM6ICgpID0+IHtcblx0XHRcdC8vIE5vIG5hbWUgb2YgaXRzIG93bi4gYGhhc2AgYWxyZWFkeSBhbnN3ZXJzIGV2ZXJ5IGxvb2t1cCwgc28gYSBuYW1lIG9mIHRoZSBnbG9iYWwgb2JqZWN0XG5cdFx0XHQvLyBpcyBmb3VuZCBmcm9tIGFueXdoZXJlIGJlbG93OyBsaXN0aW5nIGl0IGFzIHdlbGwgd291bGQgb25seSBoYW5kIGl0IHRvIGFuIGV4ZWN1dGVyIHRoYXRcblx0XHRcdC8vIHR1cm5zIGEgbmFtZSBpbnRvIGNvZGUsIHdoaWNoIHRoZW4gZmFpbHMgb3ZlciBuYW1lcyBpdCBuZXZlciBuZWVkZWQgLSB0aGUgaW5kZXggXCIwXCIgb2Zcblx0XHRcdC8vIGEgZnJhbWUsIGEgc3ltYm9sIGFub3RoZXIgbGlicmFyeSBwbGFudGVkLiBBIHN0YXRlbWVudCByZWFjaGVzIGEgZ2xvYmFsIHRocm91Z2ggdGhlXG5cdFx0XHQvLyBvcmRpbmFyeSBzY29wZSBjaGFpbiBhbnl3YXkgKFNQRUNJRklDQVRJT04ubWQgNi40LCA5LjgpLlxuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKipcbiAqIENvbnRleHQgb2JqZWN0IHRvIGhhbmRsZSBkYXRhIGFjY2Vzc1xuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBSZXNvbHZlckNvbnRleHRIYW5kbGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzb2x2ZXJDb250ZXh0SGFuZGxlIHtcblx0LyoqIEB0eXBlIHtQcm94eXxudWxsfSAqL1xuXHQjcHJveHkgPSBudWxsO1xuXHQvKiogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfSAqL1xuXHQjcGFyZW50ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtvYmplY3R8bnVsbH0gKi9cblx0I2RhdGEgPSBudWxsO1xuXHQvKiogQHR5cGUge01hcDxzdHJpbmd8c3ltYm9sLFJlc29sdmVyQ29udGV4dEhhbmRsZT58bnVsbH0gKi9cblx0I2NhY2hlID0gbnVsbDtcblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHQjcHJvdmlkZXNEYXRhID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgQ29udGV4dC5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHdoZXJlIG5vbmUgaXMgcGFzc2VkLCB0aGUgaGFuZGxlIGhvbGRzIG5vIG9iamVjdCBhdCBhbGwgYW5kIGNhcnJpZXMgbm9cblx0ICogbmFtZSwgbm90IGV2ZW4gb25lIG9mIE9iamVjdC5wcm90b3R5cGUgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuMy4gSXQgZ2V0cyBhbiBvYmplY3Qgb24gdGhlIGZpcnN0XG5cdCAqIHdyaXRlLlxuXHQgKiBAcGFyYW0ge1Jlc29sdmVyQ29udGV4dEhhbmRsZX0gcGFyZW50XG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihjb250ZXh0LCBwYXJlbnQpIHtcblx0XHR0aGlzLiNkYXRhID0gaXNOdWxsT3JVbmRlZmluZWQoY29udGV4dCkgPyBudWxsIDogY29udGV4dDtcblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQgOiBudWxsO1xuXHRcdHRoaXMuI3Byb3ZpZGVzRGF0YSA9ICFpc051bGxPclVuZGVmaW5lZChjb250ZXh0KTtcblxuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblxuXHRcdGlmIChHTE9CQUwgPT09IHRoaXMuI2RhdGEpXG5cdFx0XHR0aGlzLiNwcm94eSA9IHRoaXMuI2RhdGE7XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBUaGUgcHJveHkgYW5zd2VycyBmb3IgdGhlIHdob2xlIGNoYWluLCB3aGljaCBpcyBtb3JlIHRoYW4gdGhlIG9iamVjdCBoYW5kZWQgdG8gdGhpc1xuXHRcdFx0Ly8gcmVzb2x2ZXIgaG9sZHMuIEEgcHJveHkgbWF5IG5vdCBzcGVhayB0aGF0IGZyZWVseSBmb3IgYSB0YXJnZXQgdGhhdCBndWFyYW50ZWVzXG5cdFx0XHQvLyBhbnl0aGluZyBhYm91dCBpdHMgb3duIGtleXMgLSBhIGZyb3plbiBvciBzZWFsZWQgY29udGV4dCBpcyB3aGVyZSB0aGF0IGVuZHMgaW4gYVxuXHRcdFx0Ly8gVHlwZUVycm9yIC0gc28gaXQgZ2V0cyBhbiBlbXB0eSB0YXJnZXQgb2YgaXRzIG93bi4gTm8gdHJhcCByZWFkcyBpdDsgZXZlcnkgb25lIG9mXG5cdFx0XHQvLyB0aGVtIHdvcmtzIG9uICNkYXRhIGFuZCAjY2FjaGUuXG5cdFx0XHR0aGlzLiNwcm94eSA9IG5ldyBQcm94eSh7fSwge1xuXHRcdFx0XHRoYXM6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJoYXMgcHJvcGVydHk6XCIsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy4jZ2V0UHJvcGVydHlEZWYocHJvcGVydHkpICE9IG51bGw7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldDogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImdldCBwcm9wZXJ0eTpcIiwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdGNvbnN0IHByb3h5ID0gdGhpcy4jZ2V0UHJvcGVydHlEZWYocHJvcGVydHkpO1xuXHRcdFx0XHRcdHJldHVybiBwcm94eSA/IHByb3h5LiNkYXRhW3Byb3BlcnR5XSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0OiAoZGF0YSwgcHJvcGVydHksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInNldCBwcm9wZXJ0eTpcIiwgcHJvcGVydHksIFwiPVwiLCB2YWx1ZSk7XG5cdFx0XHRcdFx0dGhpcy4jZGF0YSA/Pz0ge307XG5cdFx0XHRcdFx0dGhpcy4jZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcblx0XHRcdFx0XHR0aGlzLiNjYWNoZS5zZXQocHJvcGVydHksIHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMuI3Byb3ZpZGVzRGF0YSA9IHRydWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRlbGV0ZVByb3BlcnR5OiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eURlZiA9IHRoaXMuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5RGVmKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy4jZGF0YVtwcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHR0aGlzLiNjYWNoZS5kZWxldGUocHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBwcm94eSA9IHRoaXMuI2dldFByb3BlcnR5RGVmKHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAoIXByb3h5KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0XHRcdFx0Ly8gUmVhZCB0aHJvdWdoIGEgZ2V0dGVyIHJhdGhlciB0aGFuIHVwIGZyb250LCBzbyBlbnVtZXJhdGluZyBhIGNvbnRleHQgZG9lcyBub3Rcblx0XHRcdFx0XHQvLyBldmFsdWF0ZSB3aGF0IG5vYm9keSBhc2tlZCBmb3IsIGFuZCBzbyBhIHZhbHVlIHN0YXlzIGxpdmUgKDYuMikuIEVudW1lcmFiaWxpdHlcblx0XHRcdFx0XHQvLyBpcyB0YWtlbiBmcm9tIHdoZXJlIHRoZSBwcm9wZXJ0eSBpcyBkZWZpbmVkIC0gdGhhdCBpcyB3aGF0IGtlZXBzIHRoZSBtZW1iZXJzXG5cdFx0XHRcdFx0Ly8gb2YgT2JqZWN0LnByb3RvdHlwZSBvdXQgb2YgT2JqZWN0LmtleXMgLSB3aGlsZSBjb25maWd1cmFibGUgaGFzIHRvIGJlIHRydWU6XG5cdFx0XHRcdFx0Ly8gYSBwcm94eSBtYXkgbm90IGNsYWltIGEgZml4ZWQgcHJvcGVydHkgaXRzIHRhcmdldCBkb2VzIG5vdCBoYXZlLlxuXHRcdFx0XHRcdGNvbnN0IGRlc2NyaXB0b3IgPSBmaW5kUHJvcGVydHlEZXNjcmlwdG9yKHByb3h5LiNkYXRhLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGdldDogKCkgPT4gcHJveHkuI2RhdGFbcHJvcGVydHldLFxuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZGVzY3JpcHRvciA/IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA6IHRydWUsXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvd25LZXlzOiAoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJvd25LZXlzXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQoKTtcblx0XHRcdFx0XHRsZXQgaGFuZGxlID0gdGhpcztcblx0XHRcdFx0XHR3aGlsZSAoaGFuZGxlKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBrZXkgb2YgaGFuZGxlLiNjYWNoZS5rZXlzKCkpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0LmFkZChrZXkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aGFuZGxlID0gaGFuZGxlLiNwYXJlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBBcnJheS5mcm9tKHJlc3VsdCk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly9AVE9ETyBuZWVkIHRvIHN1cHBvcnQgdGhlIG90aGVyIHByb3h5IGFjdGlvbnNcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge1Byb3h5fVxuXHQgKi9cblx0Z2V0IHByb3h5KCkge1xuXHRcdHJldHVybiB0aGlzLiNwcm94eTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxuXHQgKi9cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhpcyBoYW5kbGUgcHJvdmlkZXMgdGhlIG5hbWUgaXRzZWxmLiBFdmVyeSBuYW1lIG9mIGl0cyBvd24gY29udGV4dCBjb3VudHMsIHRoZSBvbmVzXG5cdCAqIGluaGVyaXRlZCB0aHJvdWdoIHRoZSBwcm90b3R5cGUgY2hhaW4gaW5jbHVkZWQgKDUuMik7IGEgaGFuZGxlIG92ZXIgdGhlIGdsb2JhbCBvYmplY3Rcblx0ICogcHJvdmlkZXMgZXZlcnkgbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdGhhc0RhdGEoa2V5KSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NhY2hlLmhhcyhrZXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhpcyBoYW5kbGUgcHJvdmlkZXMgYSBjb250ZXh0OiBvbmUgd2FzIGhhbmRlZCB0byB0aGUgY29uc3RydWN0b3IsIG9yIGEgdmFsdWUgaGFzIGJlZW5cblx0ICogd3JpdHRlbiBzaW5jZS4gV2hhdCB0aGUgZGF0YSBob2xkcyBkZWNpZGVzIG5vdGhpbmcgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtib29sZWFufVxuXHQgKi9cblx0Z2V0IHByb3ZpZGVzRGF0YSgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcHJvdmlkZXNEYXRhO1xuXHR9XG5cblx0dXBkYXRlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy4jZGF0YSA9IGlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpID8gbnVsbCA6IGRhdGE7XG5cdFx0dGhpcy4jcHJvdmlkZXNEYXRhID0gIWlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblx0fVxuXG5cdG1lcmdlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy4jZGF0YSA/Pz0ge307XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLiNkYXRhLCBkYXRhKTtcblx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSB0cnVlO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblx0fVxuXG5cdHJlc2V0Q2FjaGUoKSB7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtNYXA8c3RyaW5nLFByb3BlcnR5RGVmaW5pdGlvbj59XG5cdCAqL1xuXHQjaW5pdFByb3BlcnR5Q2FjaGUoKSB7XG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuI2RhdGE7XG5cdFx0aWYgKEdMT0JBTCA9PT0gZGF0YSkgXG5cdFx0XHRyZXR1cm4gY3JlYXRlR2xvYmFsQ2FjaGVXcmFwcGVyKHRoaXMpO1xuXG5cdFx0Ly8gZXZlcnkga2V5IEphdmFTY3JpcHQgc2F5cyB0aGUgb2JqZWN0IGNhcnJpZXMsIG5vdGhpbmcgZmlsdGVyZWQgLSB3aGljaCBvZiB0aGVtIGFuIGV4ZWN1dGVyXG5cdFx0Ly8gY2FuIHB1dCBpbnRvIGl0cyBjb2RlIGlzIHRoZSBleGVjdXRlcidzIGJ1c2luZXNzIChERUNJU0lPTlMubWQgMjAyNi0wOC0zMCwgMjAyNi0wOS0yMilcblx0XHRjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblx0XHRsZXQgdHlwZSA9IGRhdGE7XG5cdFx0d2hpbGUgKCFpc051bGxPclVuZGVmaW5lZCh0eXBlKSkge1xuXHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBSZWZsZWN0Lm93bktleXModHlwZSkpIGNhY2hlLnNldChuYW1lLCB0aGlzKTtcblx0XHRcdHR5cGUgPSBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHR5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcblx0ICogQHJldHVybnMge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxuXHQgKi9cblx0I2dldFByb3BlcnR5RGVmKHByb3BlcnR5KSB7XG5cdFx0aWYgKHRoaXMuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiB0aGlzLiNjYWNoZS5nZXQocHJvcGVydHkpO1xuXHRcdGxldCBwYXJlbnQgPSB0aGlzLiNwYXJlbnQ7XG5cdFx0d2hpbGUgKHBhcmVudCkge1xuXHRcdFx0aWYgKHBhcmVudC4jY2FjaGUuaGFzKHByb3BlcnR5KSkgcmV0dXJuIHBhcmVudC4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRcdHBhcmVudCA9IHBhcmVudC4jcGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuIiwiLyoqXG4gKiBUaGUgaGVscGVycyBtb3JlIHRoYW4gb25lIGNvbXBvbmVudCB1c2VzIC0gQUdFTlRTLm1kLCBDb252ZW50aW9ucy4gSW50ZXJuYWwgdG8gdGhlIHBhY2thZ2U6XG4gKiBpbmRleC5qcyBkb2VzIG5vdCBleHBvcnQgdGhlbS5cbiAqL1xuXG4vKiogV2hpdGVzcGFjZSBpbiB0aGUgc2Vuc2Ugb2YgYFxcc2AuICovXG5leHBvcnQgY29uc3QgV0hJVEVTUEFDRSA9IC9cXHMvO1xuXG4vKipcbiAqIFdoZXRoZXIgYSBjaGFyYWN0ZXIgbWF5IHN0YW5kIGluIGEgc2NvcGUgbmFtZSAtIFNQRUNJRklDQVRJT04ubWQgMy4zOiBhbiBBU0NJSSBsZXR0ZXIsIGEgZGlnaXQsXG4gKiBcIi1cIiwgXCJfXCIsIG9yIHdoaXRlc3BhY2UgaW4gdGhlIHNlbnNlIG9mIGBcXHNgLCB3aGljaCBwYXN0IEFTQ0lJIGlzIGxlZnQgdG8gdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gYUNvZGUgdGhlIGNoYXIgY29kZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBjb25zdCBpc05hbWVDaGFyYWN0ZXIgPSAoYUNvZGUpID0+IHtcblx0aWYgKGFDb2RlIDwgMHg4MClcblx0XHRyZXR1cm4gKFxuXHRcdFx0KGFDb2RlID49IDB4NjEgJiYgYUNvZGUgPD0gMHg3YSkgfHxcblx0XHRcdChhQ29kZSA+PSAweDQxICYmIGFDb2RlIDw9IDB4NWEpIHx8XG5cdFx0XHQoYUNvZGUgPj0gMHgzMCAmJiBhQ29kZSA8PSAweDM5KSB8fFxuXHRcdFx0YUNvZGUgPT09IDB4MmQgfHxcblx0XHRcdGFDb2RlID09PSAweDVmIHx8XG5cdFx0XHRhQ29kZSA9PT0gMHgyMCB8fFxuXHRcdFx0KGFDb2RlID49IDB4MDkgJiYgYUNvZGUgPD0gMHgwZClcblx0XHQpO1xuXG5cdHJldHVybiBXSElURVNQQUNFLnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShhQ29kZSkpO1xufTtcblxuLyoqXG4gKiBUcmltcyBhIHN0cmluZywgYW5kIGFuc3dlcnMgbnVsbCBmb3Igb25lIHRoYXQgaXMgZW1wdHkuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBub3JtYWxpemUgPSAodmFsdWUpID0+IHtcblx0aWYgKHZhbHVlKSB7XG5cdFx0dmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PSAwID8gbnVsbCA6IHZhbHVlO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuZXhwb3J0IGNvbnN0IHN0cmluZ1RvSGFzaGNvZGUgPSAoYVN0cmluZykgPT4ge1xuXHRsZXQgaGFzaCA9IDA7XG5cdGlmIChhU3RyaW5nLmxlbmd0aCA9PSAwKSByZXR1cm4gaGFzaDtcblx0Y29uc3QgbGVuZ3RoID0gYVN0cmluZy5sZW5ndGg7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBjaGFyID0gYVN0cmluZy5jaGFyQ29kZUF0KGkpO1xuXHRcdGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIGNoYXI7XG5cdFx0aGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcblx0fVxuXHRyZXR1cm4gaGFzaDtcbn07XG4iLCJpbXBvcnQgeyByZWdpc3RyYXRlIH0gZnJvbSBcIi4uL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBDb2RlQ2FjaGUgZnJvbSBcIi4uL0NvZGVDYWNoZS5qc1wiO1xuaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5cbmxldCBERUJVRyA9IGZhbHNlO1xuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1kZWNvbnN0cnVjdGlvbi1leGVjdXRlclwiO1xuY29uc3QgRVhQUkVTU0lPTl9DQUNIRSA9IG5ldyBDb2RlQ2FjaGUoKTtcblxuLyoqXG4gKiBIb3cgbWFueSBuYW1lcyBhIGNvbnRleHQgbWF5IGNhcnJ5IGJlZm9yZSB0aGlzIGV4ZWN1dGVyIHNheXMgdGhhdCBiaW5kaW5nIHRoZW0gYWxsIGNvc3RzLiBFdmVyeVxuICogb3JkaW5hcnkgb2JqZWN0IGJyaW5ncyBzZXZlbiBvZiB0aGVtIGFsb25nIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLCBzbyB0aGUgbnVtYmVyIGNvdW50cyBhIGdvb2RcbiAqIG1hbnkgb3duIGtleXMgYmVmb3JlIGl0IGlzIHJlYWNoZWQuXG4gKi9cbmNvbnN0IEhJR0hfUFJPUEVSVFlfQ09VTlQgPSAyNTtcblxuLyoqXG4gKiBUaGUgbmFtZXMgdGhhdCBtYWRlIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZmFpbCB0byBjb21waWxlLCBhc2tlZCBvZiBKYXZhU2NyaXB0IGl0c2VsZiByYXRoZXJcbiAqIHRoYW4gb2YgYSBsaXN0IGtlcHQgaGVyZTogYSBuYW1lIGlzIHVzYWJsZSB3aGVuIGl0IGNhbiBzdGFuZCBpbiBhIGRlc3RydWN0dXJpbmcgcGF0dGVybi5cbiAqXG4gKiBPbmx5IGV2ZXIgY2FsbGVkIG9uIHRoZSBmYWlsdXJlIHBhdGgsIHNvIHRoZSBjb3N0IG9mIGNvbXBpbGluZyBvbmUgcGF0dGVybiBwZXIgbmFtZSBpcyBwYWlkIGJ5IGFcbiAqIGNvbnRleHQgdGhhdCBpcyBicm9rZW4gZm9yIHRoaXMgZXhlY3V0ZXIgYW55d2F5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfHN5bWJvbD59IHRoZU5hbWVzXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPn1cbiAqL1xuY29uc3QgdW51c2FibGVOYW1lcyA9ICh0aGVOYW1lcykgPT5cblx0dGhlTmFtZXNcblx0XHQuZmlsdGVyKChuYW1lKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIHJldHVybiB0cnVlO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0bmV3IEZ1bmN0aW9uKGB7JHtuYW1lfX1gLCBcIlwiKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5tYXAoU3RyaW5nKTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtib29sZWFufSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3Qgc2V0RGVidWcgPSAodmFsdWUpID0+IHtcblx0REVCVUcgPSB2YWx1ZTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuY29uc3QgZ2V0UHJvcGVydHlOYW1lcyA9IChhQ29udGV4dCkgPT4ge1xuXHRpZiAoR0xPQkFMID09PSBhQ29udGV4dCkgcmV0dXJuIFtdO1xuXHRyZXR1cm4gUmVmbGVjdC5vd25LZXlzKGFDb250ZXh0KTtcbn07XG5cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCwgY29udGV4dFByb3BlcnRpZXMpID0+IHtcblx0Ly8gQSBzeW1ib2wgaGFzIHRvIGJlIHdyaXR0ZW4gb3V0IHJhdGhlciB0aGFuIGpvaW5lZCAtIGBqb2luYCBhbG9uZSByYWlzZXMgYSBUeXBlRXJyb3IgdGhhdCBzYXlzXG5cdC8vIG5vdGhpbmcgYWJvdXQgdGhlIGNvbnRleHQgaXQgY2FtZSBmcm9tLiBXcml0dGVuIG91dCBpdCByZWFjaGVzIHRoZSBwYXR0ZXJuLCB3aGVyZSBpdCBmYWlscyB0b1xuXHQvLyBjb21waWxlIGxpa2UgYW55IG90aGVyIG5hbWUgdGhhdCBpcyBubyBpZGVudGlmaWVyLCBhbmQgZ2VuZXJhdGUoKSBuYW1lcyBpdC5cblx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGNvbnRleHRQcm9wZXJ0aWVzLm1hcChTdHJpbmcpLmpvaW4oXCIsXCIpO1xuXHRjb25zdCBjYWNoZUtleSA9IGAke2FTdGF0ZW1lbnQubGVuZ3RofTo6JHtwcm9wZXJ0eU5hbWVzfTo6JHthU3RhdGVtZW50fWA7XG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50LCBwcm9wZXJ0eU5hbWVzLCBjb250ZXh0UHJvcGVydGllcyk7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGNhY2hlS2V5LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIFRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZGVzdHJ1Y3R1cmVzIHRoZSBjb250ZXh0IGluIGl0cyBwYXJhbWV0ZXIgbGlzdCBhbmQgcnVucyB0aGUgc3RhdGVtZW50IG92ZXJcbiAqIHRoZSBsb2NhbCBiaW5kaW5ncyB0aGF0IHByb2R1Y2VzLlxuICpcbiAqICoqTm90aGluZyBpcyBjYXJyaWVkIGJhY2suKiogQSBzdGF0ZW1lbnQgdGhhdCBhc3NpZ25zIHRvIGEgY29udGV4dCBuYW1lIHdyaXRlcyBpbnRvIGEgbG9jYWxcbiAqIGJpbmRpbmcsIGFuZCB0aGF0IGJpbmRpbmcgaXMgZ29uZSB3aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIC0gc28gYSB3cml0ZSBpcyBub3QgcmVhZGFibGVcbiAqIGFmdGVyd2FyZHMgKGBjb250ZXh0LXdyaXRlYCwgU1BFQ0lGSUNBVElPTi5tZCA5LjcpLiBUaGF0IGlzIGEgZGVjaXNpb24gcmF0aGVyIHRoYW4gYSBnYXA6IHRoZVxuICogd3JpdGUtYmFjayB0aGlzIGV4ZWN1dGVyIGNhcnJpZWQgYmV0d2VlbiAyMDI2LTA5LTA3IGFuZCAyMDI2LTA5LTIwIGNvc3QgYSBmYWN0b3Igb2YgZWxldmVuIG9uIGFcbiAqIGNhY2hlIG1pc3MsIGJlY2F1c2UgaXQgbmVlZHMgZXZlcnkgY29udGV4dCBuYW1lIGRlY2xhcmVkIGluIHRoZSBib2R5IGluc3RlYWQgb2YgbGlzdGVkIGluIHRoZVxuICogcGFyYW1ldGVyIGxpc3QuIFNwZWVkIGlzIHdoYXQgdGhpcyBleGVjdXRlciBpcyBmb3IsIGFuZCBhIGNvbnN1bWVyIHdobyBuZWVkcyBhIHdyaXRlIHRvIHBlcnNpc3RcbiAqIHBpY2tzIGBjb250ZXh0LW9iamVjdC1leGVjdXRlcmAuIFNlZSBgREVDSVNJT05TLm1kYCwgMjAyNi0wOS0yMC5cbiAqXG4gKiBXaGF0IHN0aWxsIHJlYWNoZXMgdGhlIGNvbnRleHQgaXMgYSAqKm11dGF0aW9uKio6IGBob2xkZXIubmFtZSA9IFwiYWZ0ZXJcImAgY2hhbmdlcyBhbiBvYmplY3QgdGhlXG4gKiBiaW5kaW5nIGFuZCB0aGUgY29udGV4dCBib3RoIHBvaW50IGF0LCBhbmQgbmVlZHMgbm90aGluZyBjYXJyaWVkIGJhY2suXG4gKlxuICogVGhlIGNvbnRleHQgaXMgZGVzdHJ1Y3R1cmVkIGluIHRoZSBwYXJhbWV0ZXIgbGlzdCByYXRoZXIgdGhhbiBkZWNsYXJlZCBpbiB0aGUgYm9keSBzbyB0aGF0IHRoZVxuICogZ2VuZXJhdGVkIHNvdXJjZSBzdGF5cyBvbmUgbGluZSBwZXIgc3RhdGVtZW50IGluc3RlYWQgb2Ygb25lIGxpbmUgcGVyIGNvbnRleHQgbmFtZSAtIGBuZXcgRnVuY3Rpb25gXG4gKiBwYXJzZXMgdGhhdCBzb3VyY2Ugb24gZXZlcnkgY2FjaGUgbWlzcywgYW5kIGl0cyBsZW5ndGggaXMgd2hhdCB0aGUgbWlzcyBjb3N0cy4gSXQgYWxzbyBkZWNsYXJlcyBub1xuICogbmFtZSBvZiBpdHMgb3duOiB0aGUgc3RhdGVtZW50IGNhbiB0aGVyZWZvcmUgbmV2ZXIgY29sbGlkZSB3aXRoIGEgYmluZGluZyBvZiB0aGlzIGZ1bmN0aW9uLCB3aGljaFxuICogaXMgd2hhdCB0aGUgcmFuZG9tIHN1ZmZpeCByZW1vdmVkIG9uIDIwMjYtMDktMjAgdXNlZCB0byBndWFyZC5cbiAqXG4gKiAqKk5vdGhpbmcgaXMgZmlsdGVyZWQgb3V0IG9mIHRoZSBwYXR0ZXJuLioqIEV2ZXJ5IG5hbWUgdGhlIGNvbnRleHQgY2FycmllcyBpcyBib3VuZCwgYSBuYW1lIHRoYXRcbiAqIGNhbm5vdCBiZSBhIHZhcmlhYmxlIGluY2x1ZGVkIC0gYSBrZXkgbGlrZSBgdGVzdC10ZXN0YCwgYSByZXNlcnZlZCB3b3JkLCBhIHN5bWJvbCwgdGhlIGluZGV4IG9mIGFuXG4gKiBhcnJheS4gU3VjaCBhIGNvbnRleHQgY2Fubm90IGJlIHJ1biBvdmVyIGJ5IHRoaXMgZXhlY3V0ZXIgYXQgYWxsLCBhbmQgZHJvcHBpbmcgdGhlIG5hbWUgc2lsZW50bHlcbiAqIHdvdWxkIGhpZGUgYSBwcm9wZXJ0eSB0aGUgY2FsbGVyIGRlZmluZWQuIFdoYXQgdGhpcyBleGVjdXRlciBvd2VzIHRoZSBjYWxsZXIgaW5zdGVhZCBpcyBhIG1lc3NhZ2VcbiAqIHRoYXQgc2F5cyB3aGljaCBzdGF0ZW1lbnQgZmFpbGVkIGFuZCB3aGljaCBuYW1lIGRpZCBpdCwgYmVjYXVzZSB0aGUgc3RhdGVtZW50IGl0c2VsZiBuZWVkIG5vdFxuICogbWVudGlvbiB0aGF0IG5hbWUgLSBzZWUgYERFQ0lTSU9OUy5tZGAsIDIwMjYtMDktMjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aGVQcm9wZXJ0eU5hbWVTdHJpbmcgdGhlIGNvbnRleHQgbmFtZXMsIGNvbW1hIHNlcGFyYXRlZCwgYXMgdGhlIGRlc3RydWN0dXJpbmdcbiAqICAgICAgICAgICAgICAgICBwYXR0ZXJuIHNwZWxscyB0aGVtXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZ3xzeW1ib2w+fSB0aGVOYW1lcyB0aGUgc2FtZSBuYW1lcyB1bndyaXR0ZW4sIGZvciB0aGUgZXJyb3IgbWVzc2FnZVxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50LCB0aGVQcm9wZXJ0eU5hbWVTdHJpbmcsIHRoZU5hbWVzKSA9PiB7XG5cdC8vIE9ubHkgaGVyZSwgYW5kIHRoZXJlZm9yZSBvbmNlIHBlciBjb250ZXh0IHNoYXBlIGFuZCBzdGF0ZW1lbnQgcmF0aGVyIHRoYW4gb24gZXZlcnkgZXhlY3V0aW9uOlxuXHQvLyBhIGNvbnNvbGUgd3JpdGUgaW4gYSBicm93c2VyIGNvc3RzIG1vcmUgdGhhbiBhIHJlc29sdXRpb24gZG9lcywgYW5kIHdhcm5pbmcgcGVyIGV4ZWN1dGlvbiBjb3N0XG5cdC8vIHRoaXMgZXhlY3V0ZXIgYSBmYWN0b3Igb2YgZm91ciB0byB0d2VudHktZml2ZSAobWVhc3VyZWQgMjAyNi0wOS0yMiwgYG5wbSBydW4gYmVuY2hgKS5cblx0aWYgKHRoZU5hbWVzLmxlbmd0aCA+IEhJR0hfUFJPUEVSVFlfQ09VTlQpXG5cdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0YEhpZ2ggY291bnQgb2YgcHJvcGVydGllcyBhdCBmaXJzdCBsZXZlbCwgY2FuIGJlIGRlY3JlYXNlIHRoZSBwZXJmb3JtZW5jZSEgY291bnQ6ICR7dGhlTmFtZXMubGVuZ3RofWAsXG5cdFx0KTtcblxuXHRjb25zdCBjb2RlID0gYFxucmV0dXJuIChhc3luYyAoeyR7dGhlUHJvcGVydHlOYW1lU3RyaW5nfX0pID0+IHtcbiAgICB0cnl7XG4gICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoY29udGV4dCB8fCB7fSk7YDtcblxuXHRpZiAoREVCVUcpIGNvbnNvbGUubG9nKFwiZ2VuZXJlcmF0ZWQgY29kZTogXFxuXCIsIGNvZGUpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRjb25zdCB1bnVzYWJsZSA9IHVudXNhYmxlTmFtZXModGhlTmFtZXMpO1xuXHRcdC8vIG5vdGhpbmcgd3Jvbmcgd2l0aCB0aGUgbmFtZXM6IHRoZSBzdGF0ZW1lbnQgaXRzZWxmIGRvZXMgbm90IGNvbXBpbGUsIGFuZCB0aGF0IGVycm9yIHNheXNcblx0XHQvLyBtb3JlIHRoYW4gYW55dGhpbmcgdGhpcyBleGVjdXRlciBjb3VsZCBhZGRcblx0XHRpZiAodW51c2FibGUubGVuZ3RoID09PSAwKSB0aHJvdyBlO1xuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKFxuXHRcdFx0YENvbnRleHQgcHJvcGVydHkgJHt1bnVzYWJsZS5sZW5ndGggPT09IDEgPyBcIm5hbWVcIiA6IFwibmFtZXNcIn0gXCIke3VudXNhYmxlLmpvaW4oJ1wiLCBcIicpfVwiIGNhbm5vdCBiZSB1c2VkIGFzIGEgdmFyaWFibGUgYnkgJHtFWEVDVVRFUk5BTUV9LCBzbyB0aGlzIHN0YXRlbWVudCBjYW5ub3QgcnVuIG92ZXIgdGhpcyBjb250ZXh0ISBzdGF0ZW1lbnQ6ICR7YVN0YXRlbWVudH1gLFxuXHRcdFx0eyBjYXVzZTogZSB9LFxuXHRcdCk7XG5cdH1cbn07XG5cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzID0gZ2V0UHJvcGVydHlOYW1lcyhhQ29udGV4dCk7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCwgcHJvcGVydHlOYW1lcyk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IHsgcmVnaXN0cmF0ZSB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcblxuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKCk7XG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRjb25zdCBjb2RlID0gYFxucmV0dXJuIChhc3luYyAoY3R4KSA9PiB7XG4gICAgdHJ5e1xuICAgICAgICByZXR1cm4gJHthU3RhdGVtZW50fVxuICAgIH1jYXRjaChlKXtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59KShjb250ZXh0IHx8IHt9KTtgO1xuXG5cdC8vY29uc29sZS5sb2coXCJjb2RlXCIsIGNvZGUpO1xuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oXCJjb250ZXh0XCIsIGNvZGUpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50KSA9PiB7XG5cblx0Y29uc3QgY2FjaGVLZXkgPSBhU3RhdGVtZW50O1xuXG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoY2FjaGVLZXksIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50KTtcblx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IHtyZWdpc3RyYXRlfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcIndpdGgtc2NvcGVkLWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSgpO1xuXG4vKipcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9Db2RlQ2FjaGUuanMnKS5Db2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcbn07XG5cbmxldCBpbml0aWFsQ2FsbCA9IHRydWU7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQpID0+IHtcbmNvbnN0IGNvZGUgPSBgXG5cdHJldHVybiAoYXN5bmMgKGNvbnRleHQpID0+IHtcblx0XHR3aXRoKGNvbnRleHQpe1xuXHRcdFx0dHJ5e1xuXHRcdFx0XHRyZXR1cm4gJHthU3RhdGVtZW50fVxuXHRcdFx0fWNhdGNoKGUpe1xuXHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSkoY29udGV4dCB8fCB7fSk7XG5gO1xuXHQvL2NvbnNvbGUubG9nKFwiY29kZVwiLCBjb2RlKTtcblxuXHRyZXR1cm4gbmV3IEZ1bmN0aW9uKFwiY29udGV4dFwiLCBjb2RlKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRpZiAoRVhQUkVTU0lPTl9DQUNIRS5oYXMoYVN0YXRlbWVudCkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoYVN0YXRlbWVudCk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChhU3RhdGVtZW50LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5cblxuY29uc3QgRVhFQ1VURVIgPSBuZXcgRXhlY3V0ZXIoe2V4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0aWYoaW5pdGlhbENhbGwpe1xuXHRcdFx0aW5pdGlhbENhbGwgPSBmYWxzZTtcblx0XHRcdGNvbnNvbGUud2FybihuZXcgRXJyb3IoYFdpdGggU2NvcGVkIGV4cHJlc3Npb24gZXhlY3V0aW9uIGlzIG1hcmtlZCBhcyBkZXByZWNhdGVkLmApKTtcblx0XHR9XG5cblx0XHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50KTtcblx0XHRyZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dCk7XG5cdH19KTtcbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IFwiLi9XaXRoU2NvcGVkRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBcIi4vQ29udGV4dE9iamVjdEV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgXCIuL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanNcIjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbmNvbnN0IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0Y29uc3QgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdGNvbnN0IG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHRjb25zdCBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlci92YWx1ZSBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0aWYoQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSkge1xuXHRcdHZhciBpID0gMDtcblx0XHR3aGlsZShpIDwgZGVmaW5pdGlvbi5sZW5ndGgpIHtcblx0XHRcdHZhciBrZXkgPSBkZWZpbml0aW9uW2krK107XG5cdFx0XHR2YXIgYmluZGluZyA9IGRlZmluaXRpb25baSsrXTtcblx0XHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0XHRpZihiaW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogZGVmaW5pdGlvbltpKytdIH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBiaW5kaW5nIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoYmluZGluZyA9PT0gMCkgeyBpKys7IH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QuaGFzT3duKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYoU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IEV4cHJlc3Npb25SZXNvbHZlciBmcm9tIFwiLi9zcmMvRXhwcmVzc2lvblJlc29sdmVyLmpzXCI7XG5pbXBvcnQgXCIuL3NyYy9leGVjdXRlci9pbmRleC5qc1wiO1xuaW1wb3J0ICogYXMgRXhlY3V0ZXJSZWdpc3RyeSBmcm9tIFwiLi9zcmMvRXhlY3V0ZXJSZWdpc3RyeS5qc1wiXG5cbmV4cG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9