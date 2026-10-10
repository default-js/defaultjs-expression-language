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

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/Escaper.js"
/*!************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/Escaper.js ***!
  \************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MODES: () => (/* binding */ MODES),
/* harmony export */   REGEXP_ESCAPER: () => (/* binding */ REGEXP_ESCAPER),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Replacing characters in a text and taking the replacement back out.
 *
 * @module Escaper
 */

// the one list of characters carrying a meaning inside a regular expression. quote and the map of
// REGEXP_ESCAPER are both derived from it, so a character can never be in one and missing in the
// other.
const REGEXCHARS = ["\\", "?", "*", "+", "|", "[", "]", "{", "}", "(", ")", ".", "^", "$"];

const REGEXQUOTE = new RegExp(`[${REGEXCHARS.map((char) => "\\" + char).join("")}]`, "g");

/**
 * Takes the regex meaning out of a text, so a filter is matched as the literal text it is.
 *
 * @private
 * @param {string} aText
 * @returns {string}
 */
const quote = (aText) => aText.replace(REGEXQUOTE, (char) => "\\" + char);

/**
 * The two directions an entry of a char map can take part in.
 *
 * Meant for the at of a {@link CharMapEntry}. The values are the plain texts "escape" and "unescape",
 * and an at is compared in lower case, so "Escape" and "ESCAPE" name the same direction. Writing the
 * text by hand is therefore fine - MODES is the safer way to spell it, not the only one.
 *
 * Frozen: the values are part of the contract, and a changed one would silently move what a map means.
 *
 * @readonly
 * @enum {string}
 *
 * @example
 * new Escaper([
 *     {char : "&", escaped : "&amp;"},
 *     {char : "&", escaped : "&#38;", at : MODES.unescape},
 * ], true);
 */
const MODES = Object.freeze({
	/** the entry takes part while escaping */
	escape: "escape".toLowerCase(),
	/** the entry takes part while unescaping */
	unescape: "unescape".toLowerCase()
});

/**
 * Collects everything wrong with one entry of a char map.
 *
 * char has to name something to look for, so an empty one is rejected - it would compile into a
 * regex matching at every position. An empty escaped is allowed: dropping a character is a sensible
 * thing to escape to, it just cannot be undone, so such an entry only takes part in escaping.
 *
 * at is read in lower case, so only a direction that is not one of the two at all is a problem.
 *
 * @private
 * @param {*} item
 * @param {number} index position in the char map, to point at the entry in the message
 * @returns {Array<string>} one text per problem, empty when the entry is fine
 */
const problemsOfEntry = (item, index) => {
	if (item === null || typeof item !== "object") return [`entry ${index} is no object`];

	const problems = [];
	if (typeof item.char !== "string") problems.push(`entry ${index}: char has to be a string`);
	else if (item.char.length === 0) problems.push(`entry ${index}: char must not be empty`);

	if (typeof item.escaped !== "string") problems.push(`entry ${index}: escaped has to be a string`);
	
	// no at at all is the normal case - only look closer once there is one, otherwise the lower casing
	// below would run against undefined
	if (typeof item.at !== "undefined") {
		if (typeof item.at !== "string") problems.push(`entry ${index}: at has to be a string or undefined`);
		else if (item.at.toLowerCase() !== MODES.escape && item.at.toLowerCase() !== MODES.unescape)
			problems.push(`entry ${index}: at has to be "${MODES.escape}" or "${MODES.unescape}", not ${JSON.stringify(item.at)}`);
	}

	return problems;
};

/**
 * Checks a whole char map and reports every problem at once - fixing a map one thrown error at a
 * time is no fun.
 *
 * @private
 * @param {*} aCharMap
 * @returns {void}
 * @throws {TypeError} when the map is no array or any of its entries is unusable
 */
const validateCharMap = (aCharMap) => {
	if (!Array.isArray(aCharMap)) throw new TypeError(`Escaper: the char map has to be an array, not ${aCharMap === null ? "null" : typeof aCharMap}`);

	const problems = aCharMap.flatMap(problemsOfEntry);
	if (problems.length > 0) throw new TypeError(`Escaper: unusable char map\n\t${problems.join("\n\t")}`);
};

/**
 * Builds the list of replacements for one direction. An entry takes part in a direction when it
 * carries no at at all or names that direction, and when the text it has to look for in that
 * direction is not empty - there is nothing to search for otherwise.
 *
 * The order of the map is kept: it decides which entry wins where two of them can match at the same
 * position.
 *
 * @private
 * @param {Array<CharMapEntry>} aCharMap
 * @param {MODES} mode the direction to build for
 * @returns {Array} entries of {filter, value}, filter being the literal text to look for
 */
const buildMappingList = (aCharMap, mode) => {
	const from = mode == MODES.escape ? "char" : "escaped";
	const to = mode == MODES.escape ? "escaped" : "char";

	return aCharMap
		.filter((item) => !item.at || item.at.toLowerCase() == mode)
		.filter((item) => item[from].length > 0)
		.map((item) => {
			return { filter: item[from], value: item[to] };
		});
};

/**
 * Compiles one regex covering every filter of a direction, so a text can be walked in a single pass.
 *
 * Every filter becomes a capture group of its own. Which group took part in a match tells which
 * replacement belongs to it - that only works because quote escapes ( and ), so a filter can never
 * bring a group of its own and shift the numbering.
 *
 * @private
 * @param {Array} theFilters
 * @param {boolean} isCaseSensitive
 * @returns {RegExp|null} null when there is nothing to look for
 */
const buildMatcher = (theFilters, isCaseSensitive) => {
	// an empty alternation would compile into a regex matching at every position
	if (theFilters.length === 0) return null;

	const source = theFilters.map((item) => `(${quote(item.filter)})`).join("|");

	// no m flag - the filters are quoted literals, ^ and $ never reach the regex as anchors
	return new RegExp(source, isCaseSensitive ? "g" : "gi");
};

/**
 * Replaces every filter of a direction in one pass over the text.
 *
 * One pass is what keeps the rules apart: whatever a replacement inserts is behind the position the
 * walk continues at, so no other rule can ever see it. The replacement comes from a callback, whose
 * return value String.replace takes literally - a value carrying $&, $` or $1 is inserted as written.
 *
 * @private
 * @param {string} aText
 * @param {Array} theFilters
 * @param {RegExp|null} aMatcher
 * @returns {string}
 */
const mapping = (aText, theFilters, aMatcher) => {
	if (aMatcher === null) return aText;

	return aText.replace(aMatcher, (...args) => {
		// the whole match comes first, then one entry per group, then offset and text - exactly one
		// of the groups took part
		const groups = args.slice(1, 1 + theFilters.length);
		return theFilters[groups.findIndex((group) => typeof group !== "undefined")].value;
	});
};

/**
 * One entry of a char map.
 *
 * @typedef {object} CharMapEntry
 * @property {string} char the text to look for while escaping, must not be empty
 * @property {string} escaped what it is replaced with. An empty one drops the text, which cannot be
 *   undone - such an entry takes part in escaping only.
 * @property {MODES} [at] limits the entry to one direction, {@link MODES}.escape or
 *   {@link MODES}.unescape. Compared in lower case, so the spelling of the direction does not matter.
 *   Taking part in both is the default. Anything else is rejected.
 */

/**
 * Replaces texts by a char map and takes the replacement back out.
 *
 * Both directions walk the text once, so a replacement is never touched again by another entry. Where
 * two entries can match at the same place, the one written first in the map wins.
 *
 * char and escaped are texts, not single characters - an entry may look for "aa" and replace it with
 * "xyz". A character carrying a meaning in a regular expression is matched literally.
 *
 * An entry may name a direction through the at of its {@link CharMapEntry}, see {@link MODES}.
 *
 * @example
 * const escaper = new Escaper([
 *     {char : "\\", escaped : "\\\\"},
 *     {char : "\"", escaped : "\\\""},
 * ], true);
 *
 * escaper.escape(`say "hi"`);      // 'say \\"hi\\"'
 * escaper.unescape('say \\"hi\\"');   // 'say "hi"'
 */
class Escaper {

	/**
	 * The replacements of the escape direction, in the order of the char map.
	 *
	 * @private
	 * @type {Array<{filter : string, value : string}>}
	 */
	#escapeMap = null;

	/**
	 * The replacements of the unescape direction. Shorter than the escape one whenever an entry names
	 * a direction or drops its text.
	 *
	 * @private
	 * @type {Array<{filter : string, value : string}>}
	 */
	#unescapeMap = null;

	/**
	 * The compiled regex covering every filter of the escape direction, null when there is nothing to
	 * look for. Its capture groups line up with #escapeMap.
	 *
	 * @private
	 * @type {RegExp|null}
	 */
	#escapeMatcher = null;

	/**
	 * The same for the unescape direction, lined up with #unescapeMap.
	 *
	 * @private
	 * @type {RegExp|null}
	 */
	#unescapeMatcher = null;

	/**
	 * @param {Array<CharMapEntry>} escapeMap
	 * @param {boolean} [isCaseSensitive=false] leaving it out gives a case insensitive escaper, which
	 *   also matches the other case of a char and therefore does not carry the case through a
	 *   roundtrip
	 * @throws {TypeError} when the map is no array or any of its entries is unusable. Every problem of
	 *   the map is reported at once.
	 */
	constructor(escapeMap, isCaseSensitive) {
		validateCharMap(escapeMap);
		this.#escapeMap = buildMappingList(escapeMap, MODES.escape);
		this.#unescapeMap = buildMappingList(escapeMap, MODES.unescape);
		this.#escapeMatcher = buildMatcher(this.#escapeMap, isCaseSensitive);
		this.#unescapeMatcher = buildMatcher(this.#unescapeMap, isCaseSensitive);
	}

	/**
	 * Replaces every char of the map with its escaped text.
	 *
	 * @param {string} aText
	 * @returns {string}
	 * @throws {TypeError} when the argument is no string
	 */
	escape(aText) {
		if (typeof aText !== "string") throw new TypeError("Expected a string");
		return mapping(aText, this.#escapeMap, this.#escapeMatcher);
	}

	/**
	 * Replaces every escaped text of the map with its char.
	 *
	 * @param {string} aText
	 * @returns {string}
	 * @throws {TypeError} when the argument is no string
	 */
	unescape(aText) {
		if (typeof aText !== "string") throw new TypeError("Expected a string");
		return mapping(aText, this.#unescapeMap, this.#unescapeMatcher);
	}

	/**
	 * The escaper for regular expressions, see {@link REGEXP_ESCAPER}.
	 *
	 * @returns {Escaper} always the same instance
	 */
	static REGEXP_ESCAPER() {
		return REGEXP_ESCAPER;
	}
}

/**
 * Escaper taking the meaning out of every character a regular expression reads specially, so a text
 * can be put into a pattern and matched literally.
 *
 * @type {Escaper}
 *
 * @example
 * const pattern = new RegExp(`^${REGEXP_ESCAPER.escape("a+b")}$`);
 * pattern.test("a+b");   // true
 * pattern.test("aab");   // false
 */
// has to come after the class - the singleton is built while the module is evaluated, and a class
// stays in its temporal dead zone until its declaration has run
const REGEXP_ESCAPER = new Escaper(
	REGEXCHARS.map((char) => {
		return { char, escaped: "\\" + char };
	}),
);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Escaper);


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

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/PrivateProperty.js"
/*!********************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/PrivateProperty.js ***!
  \********************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   privateProperty: () => (/* binding */ privateProperty),
/* harmony export */   privatePropertyAccessor: () => (/* binding */ privatePropertyAccessor),
/* harmony export */   privateStore: () => (/* binding */ privateStore)
/* harmony export */ });
/**
 * Private state for an object, held outside of it.
 *
 * The values live in a WeakMap keyed by the object, so nothing is added to the object itself and
 * nothing shows up in Object.keys or JSON. Once the object is gone its state is collectable too.
 *
 * @module PrivateProperty
 */
const PRIVATE_PROPERTIES = new WeakMap();

/**
 * The store belonging to an object. Created on the first call, the same one from then on.
 *
 * @param {object} obj
 * @returns {object} the store, writable directly
 */
const privateStore = (obj) => {
	if(PRIVATE_PROPERTIES.has(obj))
		return PRIVATE_PROPERTIES.get(obj);

	const data = {};
	PRIVATE_PROPERTIES.set(obj, data);
	return data;
};

/**
 * Reads or writes private state, depending on how many arguments it is called with.
 *
 * Passing undefined as the value still counts as a write - what decides is the number of arguments,
 * not their content.
 *
 * @param {object} obj the object the state belongs to
 * @param {string} [name] name of the property
 * @param {*} [value] the value to write
 * @returns {*} the whole store with one argument, the value with two, nothing with three
 * @throws {Error} when called with more than three arguments
 *
 * @example
 * privateProperty(instance, "count", 1);   // write
 * privateProperty(instance, "count");      // 1
 * privateProperty(instance);               // {count : 1}
 */
const privateProperty = function(obj, name, value) {
	const data = privateStore(obj);
	if(arguments.length === 1)
		return data;
	else if(arguments.length === 2)
		return data[name];
	else if(arguments.length === 3)
		data[name] = value;
	else
		throw new Error("Not allowed size of arguments!");
};

/**
 * Builds a function reading and writing one fixed property, so the name is written once instead of
 * at every call.
 *
 * @param {string} varname name of the property
 * @returns {Function} called with (self) it reads, called with (self, value) it writes
 *
 * @example
 * const count = privatePropertyAccessor("count");
 * count(instance, 1);   // write
 * count(instance);      // 1
 */
const privatePropertyAccessor = (varname) => {
	return function(self, value){
		if(arguments.length == 2)
			privateProperty(self, varname, value);
		else
			return privateProperty(self, varname);
	};
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({privateProperty, privatePropertyAccessor, privateStore});


/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/PromiseUtils.js"
/*!*****************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/PromiseUtils.js ***!
  \*****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   lazyPromise: () => (/* binding */ lazyPromise),
/* harmony export */   timeoutPromise: () => (/* binding */ timeoutPromise)
/* harmony export */ });
/* harmony import */ var _ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ObjectUtils.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js");
/**
 * Two ways of building a promise that something outside of it settles.
 *
 * {@link timeoutPromise} runs a function once a timeout has passed and lets the whole chain behind
 * it be canceled. {@link lazyPromise} hands out a promise together with its resolve and reject, for
 * the cases where the settling is driven from somewhere else - a framework callback, an event,
 * foreign code - and packing all of that into the executor would only blow the code up or is not
 * possible at all.
 *
 * The two carry different state on purpose: a timeoutPromise reports its cancellation through a
 * rejection and an AbortSignal, a lazyPromise reports its outcome through resolved, error and value.
 *
 * @module PromiseUtils
 */


/**
 * The reason an aborted operation rejects with. A DOMException named AbortError is what
 * AbortController itself uses, an Error carrying the same name stands in where it is missing.
 *
 * @private
 * @returns {Error|DOMException}
 */
const abortError = () => {
	if (typeof DOMException !== "undefined") return new DOMException("The operation was aborted.", "AbortError");

	/* istanbul ignore next - every browser the suite runs in brings DOMException, so this line only
	   stands in for environments the test run cannot reach */
	return Object.assign(new Error("The operation was aborted."), { name: "AbortError" });
};

/**
 * The reason a signal carries. abort() fills it in on its own, older implementations know the
 * method but not the property.
 *
 * @private
 * @param {AbortSignal} signal
 * @returns {*}
 */
const abortReason = (signal) => (typeof signal.reason === "undefined" ? abortError() : signal.reason);

/**
 * Adds the cancel api to a promise and to every promise derived from it. All of them share one
 * controller, so a chain can be canceled from any of its links.
 *
 * @private
 * @param {Promise} promise
 * @param {AbortController} controller
 * @param {Function} cancel
 * @returns {Promise} the promise itself
 */
const cancelable = (promise, controller, cancel) => {
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defValue)(promise, "cancel", cancel);
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defGet)(promise, "signal", () => controller.signal);
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defGet)(promise, "canceled", () => controller.signal.aborted);

	// then has to hand both handlers through and return the derived promise - catch, finally and
	// await are defined in terms of then, so anything less silently breaks those as well
	const then = promise.then;
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defValue)(promise, "then", (onFulfilled, onRejected) => cancelable(then.call(promise, onFulfilled, onRejected), controller, cancel));

	return promise;
};

/**
 * Calls a function after a timeout and settles with whatever it produces.
 *
 * The function is called with resolve, reject and the AbortSignal of the promise, so work started
 * inside it can be aborted along with it. An exception thrown by the function rejects the promise
 * instead of escaping into the timer.
 *
 * The promise brings its own AbortController. cancel() clears a pending timeout and rejects with an
 * AbortError, which travels down the whole chain - no then handler behind it runs. cancel() sits on
 * every promise derived from it and does nothing once the promise has settled.
 *
 * @param {Function} fn called with (resolve, reject, signal) once the timeout has passed
 * @param {number} ms the timeout in milliseconds
 * @returns {Promise} a promise carrying cancel(), signal and canceled
 *
 * @example
 * const promise = timeoutPromise((resolve) => resolve("done"), 1000);
 * await promise;                                  // "done"
 *
 * @example
 * const promise = timeoutPromise((resolve) => resolve("done"), 1000);
 * promise.then(() => console.log("never runs"));
 * promise.cancel();
 * await promise;                                  // throws AbortError
 */
const timeoutPromise = (fn, ms) => {
	const controller = new AbortController();
	const signal = controller.signal;
	let timeout = null;
	let settled = false;

	const promise = new Promise((resolve, reject) => {
		// the timeout is cleared on every way out, a canceled promise must not keep the timer alive
		const settle = (handler) => (value) => {
			if (settled) return;

			settled = true;
			if (timeout !== null) {
				clearTimeout(timeout);
				timeout = null;
			}
			handler(value);
		};

		const onResolve = settle(resolve);
		const onReject = settle(reject);

		signal.addEventListener("abort", () => onReject(abortReason(signal)), { once: true });

		timeout = setTimeout(() => {
			timeout = null;
			try {
				fn(onResolve, onReject, signal);
			} catch (error) {
				onReject(error);
			}
		}, ms);
	});

	return cancelable(promise, controller, (reason) => {
		if (settled || signal.aborted) return;

		controller.abort(typeof reason === "undefined" ? abortError() : reason);
	});
};

/**
 * Builds a promise together with the two functions settling it.
 *
 * The point is to have the promise and its resolve and reject apart from each other: whatever
 * settles it does not have to sit inside the executor. That keeps a promise usable where the
 * settling is driven by a framework callback, an event or any other foreign code the executor has no
 * way of reaching.
 *
 * The promise carries three read only properties:
 *
 * - resolved says the promise has been settled. It says nothing about the outcome - it is true for a
 *   failure just as well.
 * - error tells the two apart.
 * - value holds whatever the promise was settled with: the result after a resolve, the reason after
 *   a reject. error is what decides how to read it.
 *
 * An Error always leads to a rejection, in both directions - handing one to resolve rejects the
 * promise just like reject would. A reason that is no Error is wrapped into one, and a reject
 * without a reason gets an Error of its own, so there is always a message to read.
 *
 * Both functions settle the promise once. A second call throws instead of settling again, so the
 * three properties can never end up disagreeing with the promise.
 *
 * @returns {Promise} a promise carrying resolve(), reject(), value, error and resolved
 * @throws {Error} from resolve or reject when the promise has already been settled
 *
 * @example
 * const promise = lazyPromise();
 * element.addEventListener("load", () => promise.resolve(element), {once : true});
 * await promise;
 *
 * @example
 * const promise = lazyPromise();
 * promise.reject("no connection");   // rejects with an Error carrying that message
 * promise.resolved;                  // true - settled, not successful
 * promise.error;                     // true
 * promise.value;                     // "no connection"
 */
const lazyPromise = () => {
	let promiseResolve = null;
	let promiseReject = null;
	let resolved = false;
	let error = false;
	let value = undefined;

	const promise = new Promise((r, e) => {
		promiseResolve = r;
		promiseReject = (anError) => e(anError instanceof Error ? anError : new Error(anError == null ? "Promise rejected with no reason" : anError));
	});

	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defValue)(promise, "resolve", (result) => {
		if (resolved) throw new Error("Promise already resolved!");
		resolved = true;
		value = result;
		if (value instanceof Error) {
			error = true;
			promiseReject(value);
		} else promiseResolve(value);
	});
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defValue)(promise, "reject", (result) => {
		if (resolved) throw new Error("Promise already resolved!");
		resolved = true;
		value = result;
		error = true;
		promiseReject(result);
	});

	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defGet)(promise, "value", () => value);
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defGet)(promise, "error", () => error);
	(0,_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_0__.defGet)(promise, "resolved", () => resolved);

	return promise;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	lazyPromise,
	timeoutPromise,
});


/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/UUID.js"
/*!*********************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/UUID.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UUID_SCHEMA: () => (/* binding */ UUID_SCHEMA),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   uuid: () => (/* binding */ uuid)
/* harmony export */ });
/* harmony import */ var _Global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");
/**
 * Creation of random UUIDs.
 *
 * @module UUID
 */
//the solution is found here: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid



/**
 * The layout of a version 4 UUID. x is a random hex digit, y is the variant digit and becomes one of
 * 8, 9, a or b.
 *
 * @type {string}
 */
const UUID_SCHEMA = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

/**
 * Creates a random UUID of version 4.
 *
 * The digits come from crypto.getRandomValues, not from Math.random. Requires a crypto on the global
 * scope, which every browser and every web worker brings.
 *
 * @returns {string} 36 characters, following {@link UUID_SCHEMA}
 *
 * @example
 * uuid();   // "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
 */
const uuid = () => {
	const buf = new Uint32Array(4);
	_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"].crypto.getRandomValues(buf);
	let idx = -1;
	return UUID_SCHEMA.replace(/[xy]/g, (c) => {
		idx++;
		const r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15;
		const v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ uuid });


/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/ValueHelper.js"
/*!****************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/ValueHelper.js ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   emptyOrBlank: () => (/* binding */ emptyOrBlank),
/* harmony export */   emtpyOrNoValueString: () => (/* binding */ emtpyOrNoValueString),
/* harmony export */   noValue: () => (/* binding */ noValue)
/* harmony export */ });
/**
 * Small checks on plain values.
 *
 * noValue answers the same question as ObjectUtils.isNullOrUndefined and is kept as its own function
 * on purpose: this module is the one to reach for when all that is needed is a look at a value, and
 * it stays free of any dependency on ObjectUtils. The duplication is the price for that, and it is
 * accepted - both are two lines and neither is going to change.
 *
 * @module ValueHelper
 */

/**
 * Checks whether a value is null or undefined.
 *
 * @param {*} value
 * @returns {boolean}
 */
const noValue = (value) => {
	return value == null || typeof value === "undefined";
};

/**
 * Checks whether a string carries nothing to work with - null, undefined, empty or whitespace only.
 *
 * Expects a string for everything else and throws on a value without trim, a number for instance.
 *
 * @param {string} value
 * @returns {boolean}
 *
 * @example
 * emptyOrBlank("  ");     // true
 * emptyOrBlank(null);     // true
 * emptyOrBlank("test");   // false
 */
const emptyOrBlank = (value) => {
	return noValue(value) || value.trim().length == 0;
};

/**
 * @deprecated use {@link emptyOrBlank}
 * @param {string} value
 * @returns {boolean}
 */
const emtpyOrNoValueString = (value) => {
	console.warn("emtpyOrNoValueString is deprecated! use emptyOrBlank");
	return emptyOrBlank(value);
};


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	noValue,
	emptyOrBlank,
	emtpyOrNoValueString
});

/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/index.js"
/*!**********************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/index.js ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Escaper: () => (/* reexport safe */ _Escaper_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   GLOBAL: () => (/* reexport safe */ _Global_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   ObjectUtils: () => (/* reexport safe */ _ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   PrivateProperty: () => (/* reexport safe */ _PrivateProperty_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   PromiseUtils: () => (/* reexport safe */ _PromiseUtils_js__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   UUID: () => (/* reexport safe */ _UUID_js__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   ValueHelper: () => (/* reexport safe */ _ValueHelper_js__WEBPACK_IMPORTED_MODULE_4__["default"])
/* harmony export */ });
/* harmony import */ var _javascript_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./javascript/index.js */ "./node_modules/@default-js/defaultjs-common-utils/src/javascript/index.js");
/* harmony import */ var _ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ObjectUtils.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js");
/* harmony import */ var _Global_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");
/* harmony import */ var _Escaper_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Escaper.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Escaper.js");
/* harmony import */ var _ValueHelper_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ValueHelper.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ValueHelper.js");
/* harmony import */ var _PromiseUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PromiseUtils.js */ "./node_modules/@default-js/defaultjs-common-utils/src/PromiseUtils.js");
/* harmony import */ var _PrivateProperty_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./PrivateProperty.js */ "./node_modules/@default-js/defaultjs-common-utils/src/PrivateProperty.js");
/* harmony import */ var _UUID_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./UUID.js */ "./node_modules/@default-js/defaultjs-common-utils/src/UUID.js");
/**
 * Entry point of the package.
 *
 * Importing it also pulls in the javascript module, which extends String and Map - see the note
 * there. Ready, ServiceHelper and the XmlToJson converter are not part of this surface and have to be
 * imported from their own file.
 *
 * @module defaultjs-common-utils
 */











/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/javascript/Map.js"
/*!*******************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/javascript/Map.js ***!
  \*******************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/**
 * Adds toObject() to every Map - see the note on patching prototypes in ./index.js.
 *
 * A nested Map is converted along with it. Every key becomes a property name, so a key that is no
 * string is turned into one the way javascript does it - an object key ends up as "[object Object]",
 * and two keys collapsing onto the same name overwrite each other.
 *
 * Only defined when nothing else carries that name already.
 *
 * @returns {object}
 *
 * @example
 * new Map([["a", 1], ["b", new Map([["c", 2]])]]).toObject();   // {a : 1, b : {c : 2}}
 */
if (!Map.prototype.toObject)
	Map.prototype.toObject = function () {
		const object = {};
		for (const [key, value] of this.entries()) object[key] = value instanceof Map ? value.toObject() : value;

		return object;
	};


/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/javascript/String.js"
/*!**********************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/javascript/String.js ***!
  \**********************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/**
 * Adds hashcode() to every string - see the note on patching prototypes in ./index.js.
 *
 * The hash is the one java uses for its strings: h = 31 * h + char, kept inside 32 signed bits. It
 * is meant for bucketing and for telling texts apart cheaply, not for anything where collisions
 * matter - two different texts can share a hash, and it is no cryptographic digest.
 *
 * Only defined when nothing else carries that name already.
 *
 * @returns {number} a 32 bit signed integer, 0 for the empty string
 *
 * @example
 * "test".hashcode();   // 3556498
 */
if (!String.prototype.hashcode)
	String.prototype.hashcode = function() {
		if (this.length === 0)
			return 0;
		
		let hash = 0;
		const length = this.length;
		for (let i = 0; i < length; i++) {
			const c = this.charCodeAt(i);
			hash = ((hash << 5) - hash) + c;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	};

/***/ },

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/javascript/index.js"
/*!*********************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/javascript/index.js ***!
  \*********************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _String_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./String.js */ "./node_modules/@default-js/defaultjs-common-utils/src/javascript/String.js");
/* harmony import */ var _Map_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Map.js */ "./node_modules/@default-js/defaultjs-common-utils/src/javascript/Map.js");
/**
 * Extensions to the built in javascript types.
 *
 * Importing this module patches prototypes - that is what it is for, and it is deliberate. The
 * package imports it from its own entry point, so anything using it gets the extensions without
 * asking for them separately. They are meant to read like part of the language at the call site:
 * "text".hashcode() instead of hashcode("text").
 *
 * Every extension is added only when the type does not already carry that name, so a newer engine
 * or another library defining the same member keeps the upper hand and nothing is overwritten.
 *
 * @module javascript
 */



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
/* harmony export */   trimToNull: () => (/* binding */ trimToNull),
/* harmony export */   undeclaredVarname: () => (/* binding */ undeclaredVarname)
/* harmony export */ });
/* harmony import */ var _default_js_defaultjs_common_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @default-js/defaultjs-common-utils */ "./node_modules/@default-js/defaultjs-common-utils/src/index.js");


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

const ID_CHARACTER = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateId = (aLength) => {
	let id = "";
	for (let i = 0; i < aLength; i++)
		id += ID_CHARACTER.charAt(Math.floor(Math.random() * ID_CHARACTER.length));
	return id;
};

const undeclaredVarname = ({ prefix, suffix, minLength = 10 } = {}) => {
	let count = minLength;
	do {
		for (let i = 0; i < ID_CHARACTER.length * count; i++) {
			const name = `${prefix || ""}${generateId(count)}${suffix || ""}`;
			if (!_default_js_defaultjs_common_utils__WEBPACK_IMPORTED_MODULE_0__.GLOBAL.hasOwnProperty(name)) return name;
		}
		count += 4;
	} while (true);
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
/* harmony import */ var _Utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Utils.js */ "./src/Utils.js");






let DEBUG = false;
/** The name this executer is registered under, and the default executer. */
const EXECUTERNAME = "context-deconstruction-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();
const RESERVED_VARNAME = (0,_Utils_js__WEBPACK_IMPORTED_MODULE_4__.undeclaredVarname)({ prefix: "$CDE_", suffix: "_CDE$", minLength: 32 });


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
})(${RESERVED_VARNAME} || {});`;

	if (DEBUG) console.log("genererated code: \n", code);

	try {
		return new Function(RESERVED_VARNAME, code);
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
})(${CONTEXT_VAR} || {});`;

	//console.log("code", code);

	return new Function(CONTEXT_VAR, code);
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
/* harmony import */ var _Utils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Utils.js */ "./src/Utils.js");





/** The name this executer is registered under. */
const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]();

const RESERVED_VARNAME = (0,_Utils_js__WEBPACK_IMPORTED_MODULE_3__.undeclaredVarname)({ prefix: "$WSE_", suffix: "_WSE$", minLength: 32 });

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
	return (async (${RESERVED_VARNAME}) => {
		with(${RESERVED_VARNAME}){
			try{
				return ${aStatement}
			}catch(e){
				throw e;
			}
		}
	})(${RESERVED_VARNAME} || {});
`;
	//console.log("code", code);

	return new Function(RESERVED_VARNAME, code);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSmhEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMERBQTBELEtBQUs7O0FBRS9ELGtDQUFrQywrQ0FBK0M7O0FBRWpGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixtQkFBbUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLFFBQVEsNEJBQTRCLEVBQUU7QUFDdEMsUUFBUSw0QkFBNEIsdUJBQXVCO0FBQzNEO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLFdBQVcsUUFBUTtBQUNuQixhQUFhLGVBQWU7QUFDNUI7QUFDQTtBQUNBLGlFQUFpRSxPQUFPOztBQUV4RTtBQUNBLDJEQUEyRCxNQUFNO0FBQ2pFLHlEQUF5RCxNQUFNOztBQUUvRCw4REFBOEQsTUFBTTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxNQUFNO0FBQ2hFO0FBQ0EsMEJBQTBCLE1BQU0sa0JBQWtCLGFBQWEsUUFBUSxlQUFlLFNBQVMsd0JBQXdCO0FBQ3ZIOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWE7QUFDYixZQUFZLFdBQVc7QUFDdkI7QUFDQTtBQUNBLG9HQUFvRyw2Q0FBNkM7O0FBRWpKO0FBQ0EsK0VBQStFLHNCQUFzQjtBQUNyRzs7QUFFQTtBQUNBO0FBQ0E7QUFD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V0FDSDtXQUNBO1dBQ0EsMENBQTBDLHdDQUF3QztXQUNsRjtXQUNBO1dBQ0E7V0FDQSxFOzs7OztXQ3RCQSxpRTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTmtFO0FBQ0k7QUFDM0I7O0FBRTNDLHdGQUFNLGFBQWEsd0ZBQU07QUFDekIsd0ZBQU0sZ0JBQWdCLHdGQUFNO0FBQzVCLFFBQVE7QUFDUixtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCOztBQUVnRCIsInNvdXJjZXMiOlsid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvRXNjYXBlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvT2JqZWN0UHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvT2JqZWN0VXRpbHMuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvUHJpdmF0ZVByb3BlcnR5LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL1Byb21pc2VVdGlscy5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9VVUlELmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL1ZhbHVlSGVscGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL2luZGV4LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL2phdmFzY3JpcHQvTWFwLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL2phdmFzY3JpcHQvU3RyaW5nLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL2phdmFzY3JpcHQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvQ29kZUNhY2hlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0RlZmF1bHRWYWx1ZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeGVjdXRlclJlZ2lzdHJ5LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0V4cHJlc3Npb25SZXNvbHZlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeHByZXNzaW9uU2Nhbm5lci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9SZXNvbHZlckNvbnRleHRIYW5kbGUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvVXRpbHMuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9Db250ZXh0T2JqZWN0RXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvV2l0aFNjb3BlZEV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL2luZGV4LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL3ZlcnNpb24uanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL2Jyb3dzZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cHJlc3Npb25SZXNvbHZlciBmcm9tIFwiLi9zcmMvRXhwcmVzc2lvblJlc29sdmVyLmpzXCI7XG5pbXBvcnQgXCIuL3NyYy9leGVjdXRlci9pbmRleC5qc1wiO1xuaW1wb3J0ICogYXMgRXhlY3V0ZXJSZWdpc3RyeSBmcm9tIFwiLi9zcmMvRXhlY3V0ZXJSZWdpc3RyeS5qc1wiXG5cbmV4cG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9O1xuIiwiLyoqXG4gKiBSZXBsYWNpbmcgY2hhcmFjdGVycyBpbiBhIHRleHQgYW5kIHRha2luZyB0aGUgcmVwbGFjZW1lbnQgYmFjayBvdXQuXG4gKlxuICogQG1vZHVsZSBFc2NhcGVyXG4gKi9cblxuLy8gdGhlIG9uZSBsaXN0IG9mIGNoYXJhY3RlcnMgY2FycnlpbmcgYSBtZWFuaW5nIGluc2lkZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbi4gcXVvdGUgYW5kIHRoZSBtYXAgb2Zcbi8vIFJFR0VYUF9FU0NBUEVSIGFyZSBib3RoIGRlcml2ZWQgZnJvbSBpdCwgc28gYSBjaGFyYWN0ZXIgY2FuIG5ldmVyIGJlIGluIG9uZSBhbmQgbWlzc2luZyBpbiB0aGVcbi8vIG90aGVyLlxuY29uc3QgUkVHRVhDSEFSUyA9IFtcIlxcXFxcIiwgXCI/XCIsIFwiKlwiLCBcIitcIiwgXCJ8XCIsIFwiW1wiLCBcIl1cIiwgXCJ7XCIsIFwifVwiLCBcIihcIiwgXCIpXCIsIFwiLlwiLCBcIl5cIiwgXCIkXCJdO1xuXG5jb25zdCBSRUdFWFFVT1RFID0gbmV3IFJlZ0V4cChgWyR7UkVHRVhDSEFSUy5tYXAoKGNoYXIpID0+IFwiXFxcXFwiICsgY2hhcikuam9pbihcIlwiKX1dYCwgXCJnXCIpO1xuXG4vKipcbiAqIFRha2VzIHRoZSByZWdleCBtZWFuaW5nIG91dCBvZiBhIHRleHQsIHNvIGEgZmlsdGVyIGlzIG1hdGNoZWQgYXMgdGhlIGxpdGVyYWwgdGV4dCBpdCBpcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5jb25zdCBxdW90ZSA9IChhVGV4dCkgPT4gYVRleHQucmVwbGFjZShSRUdFWFFVT1RFLCAoY2hhcikgPT4gXCJcXFxcXCIgKyBjaGFyKTtcblxuLyoqXG4gKiBUaGUgdHdvIGRpcmVjdGlvbnMgYW4gZW50cnkgb2YgYSBjaGFyIG1hcCBjYW4gdGFrZSBwYXJ0IGluLlxuICpcbiAqIE1lYW50IGZvciB0aGUgYXQgb2YgYSB7QGxpbmsgQ2hhck1hcEVudHJ5fS4gVGhlIHZhbHVlcyBhcmUgdGhlIHBsYWluIHRleHRzIFwiZXNjYXBlXCIgYW5kIFwidW5lc2NhcGVcIixcbiAqIGFuZCBhbiBhdCBpcyBjb21wYXJlZCBpbiBsb3dlciBjYXNlLCBzbyBcIkVzY2FwZVwiIGFuZCBcIkVTQ0FQRVwiIG5hbWUgdGhlIHNhbWUgZGlyZWN0aW9uLiBXcml0aW5nIHRoZVxuICogdGV4dCBieSBoYW5kIGlzIHRoZXJlZm9yZSBmaW5lIC0gTU9ERVMgaXMgdGhlIHNhZmVyIHdheSB0byBzcGVsbCBpdCwgbm90IHRoZSBvbmx5IG9uZS5cbiAqXG4gKiBGcm96ZW46IHRoZSB2YWx1ZXMgYXJlIHBhcnQgb2YgdGhlIGNvbnRyYWN0LCBhbmQgYSBjaGFuZ2VkIG9uZSB3b3VsZCBzaWxlbnRseSBtb3ZlIHdoYXQgYSBtYXAgbWVhbnMuXG4gKlxuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICpcbiAqIEBleGFtcGxlXG4gKiBuZXcgRXNjYXBlcihbXG4gKiAgICAge2NoYXIgOiBcIiZcIiwgZXNjYXBlZCA6IFwiJmFtcDtcIn0sXG4gKiAgICAge2NoYXIgOiBcIiZcIiwgZXNjYXBlZCA6IFwiJiMzODtcIiwgYXQgOiBNT0RFUy51bmVzY2FwZX0sXG4gKiBdLCB0cnVlKTtcbiAqL1xuZXhwb3J0IGNvbnN0IE1PREVTID0gT2JqZWN0LmZyZWV6ZSh7XG5cdC8qKiB0aGUgZW50cnkgdGFrZXMgcGFydCB3aGlsZSBlc2NhcGluZyAqL1xuXHRlc2NhcGU6IFwiZXNjYXBlXCIudG9Mb3dlckNhc2UoKSxcblx0LyoqIHRoZSBlbnRyeSB0YWtlcyBwYXJ0IHdoaWxlIHVuZXNjYXBpbmcgKi9cblx0dW5lc2NhcGU6IFwidW5lc2NhcGVcIi50b0xvd2VyQ2FzZSgpXG59KTtcblxuLyoqXG4gKiBDb2xsZWN0cyBldmVyeXRoaW5nIHdyb25nIHdpdGggb25lIGVudHJ5IG9mIGEgY2hhciBtYXAuXG4gKlxuICogY2hhciBoYXMgdG8gbmFtZSBzb21ldGhpbmcgdG8gbG9vayBmb3IsIHNvIGFuIGVtcHR5IG9uZSBpcyByZWplY3RlZCAtIGl0IHdvdWxkIGNvbXBpbGUgaW50byBhXG4gKiByZWdleCBtYXRjaGluZyBhdCBldmVyeSBwb3NpdGlvbi4gQW4gZW1wdHkgZXNjYXBlZCBpcyBhbGxvd2VkOiBkcm9wcGluZyBhIGNoYXJhY3RlciBpcyBhIHNlbnNpYmxlXG4gKiB0aGluZyB0byBlc2NhcGUgdG8sIGl0IGp1c3QgY2Fubm90IGJlIHVuZG9uZSwgc28gc3VjaCBhbiBlbnRyeSBvbmx5IHRha2VzIHBhcnQgaW4gZXNjYXBpbmcuXG4gKlxuICogYXQgaXMgcmVhZCBpbiBsb3dlciBjYXNlLCBzbyBvbmx5IGEgZGlyZWN0aW9uIHRoYXQgaXMgbm90IG9uZSBvZiB0aGUgdHdvIGF0IGFsbCBpcyBhIHByb2JsZW0uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gaXRlbVxuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IHBvc2l0aW9uIGluIHRoZSBjaGFyIG1hcCwgdG8gcG9pbnQgYXQgdGhlIGVudHJ5IGluIHRoZSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPn0gb25lIHRleHQgcGVyIHByb2JsZW0sIGVtcHR5IHdoZW4gdGhlIGVudHJ5IGlzIGZpbmVcbiAqL1xuY29uc3QgcHJvYmxlbXNPZkVudHJ5ID0gKGl0ZW0sIGluZGV4KSA9PiB7XG5cdGlmIChpdGVtID09PSBudWxsIHx8IHR5cGVvZiBpdGVtICE9PSBcIm9iamVjdFwiKSByZXR1cm4gW2BlbnRyeSAke2luZGV4fSBpcyBubyBvYmplY3RgXTtcblxuXHRjb25zdCBwcm9ibGVtcyA9IFtdO1xuXHRpZiAodHlwZW9mIGl0ZW0uY2hhciAhPT0gXCJzdHJpbmdcIikgcHJvYmxlbXMucHVzaChgZW50cnkgJHtpbmRleH06IGNoYXIgaGFzIHRvIGJlIGEgc3RyaW5nYCk7XG5cdGVsc2UgaWYgKGl0ZW0uY2hhci5sZW5ndGggPT09IDApIHByb2JsZW1zLnB1c2goYGVudHJ5ICR7aW5kZXh9OiBjaGFyIG11c3Qgbm90IGJlIGVtcHR5YCk7XG5cblx0aWYgKHR5cGVvZiBpdGVtLmVzY2FwZWQgIT09IFwic3RyaW5nXCIpIHByb2JsZW1zLnB1c2goYGVudHJ5ICR7aW5kZXh9OiBlc2NhcGVkIGhhcyB0byBiZSBhIHN0cmluZ2ApO1xuXHRcblx0Ly8gbm8gYXQgYXQgYWxsIGlzIHRoZSBub3JtYWwgY2FzZSAtIG9ubHkgbG9vayBjbG9zZXIgb25jZSB0aGVyZSBpcyBvbmUsIG90aGVyd2lzZSB0aGUgbG93ZXIgY2FzaW5nXG5cdC8vIGJlbG93IHdvdWxkIHJ1biBhZ2FpbnN0IHVuZGVmaW5lZFxuXHRpZiAodHlwZW9mIGl0ZW0uYXQgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRpZiAodHlwZW9mIGl0ZW0uYXQgIT09IFwic3RyaW5nXCIpIHByb2JsZW1zLnB1c2goYGVudHJ5ICR7aW5kZXh9OiBhdCBoYXMgdG8gYmUgYSBzdHJpbmcgb3IgdW5kZWZpbmVkYCk7XG5cdFx0ZWxzZSBpZiAoaXRlbS5hdC50b0xvd2VyQ2FzZSgpICE9PSBNT0RFUy5lc2NhcGUgJiYgaXRlbS5hdC50b0xvd2VyQ2FzZSgpICE9PSBNT0RFUy51bmVzY2FwZSlcblx0XHRcdHByb2JsZW1zLnB1c2goYGVudHJ5ICR7aW5kZXh9OiBhdCBoYXMgdG8gYmUgXCIke01PREVTLmVzY2FwZX1cIiBvciBcIiR7TU9ERVMudW5lc2NhcGV9XCIsIG5vdCAke0pTT04uc3RyaW5naWZ5KGl0ZW0uYXQpfWApO1xuXHR9XG5cblx0cmV0dXJuIHByb2JsZW1zO1xufTtcblxuLyoqXG4gKiBDaGVja3MgYSB3aG9sZSBjaGFyIG1hcCBhbmQgcmVwb3J0cyBldmVyeSBwcm9ibGVtIGF0IG9uY2UgLSBmaXhpbmcgYSBtYXAgb25lIHRocm93biBlcnJvciBhdCBhXG4gKiB0aW1lIGlzIG5vIGZ1bi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSBhQ2hhck1hcFxuICogQHJldHVybnMge3ZvaWR9XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gdGhlIG1hcCBpcyBubyBhcnJheSBvciBhbnkgb2YgaXRzIGVudHJpZXMgaXMgdW51c2FibGVcbiAqL1xuY29uc3QgdmFsaWRhdGVDaGFyTWFwID0gKGFDaGFyTWFwKSA9PiB7XG5cdGlmICghQXJyYXkuaXNBcnJheShhQ2hhck1hcCkpIHRocm93IG5ldyBUeXBlRXJyb3IoYEVzY2FwZXI6IHRoZSBjaGFyIG1hcCBoYXMgdG8gYmUgYW4gYXJyYXksIG5vdCAke2FDaGFyTWFwID09PSBudWxsID8gXCJudWxsXCIgOiB0eXBlb2YgYUNoYXJNYXB9YCk7XG5cblx0Y29uc3QgcHJvYmxlbXMgPSBhQ2hhck1hcC5mbGF0TWFwKHByb2JsZW1zT2ZFbnRyeSk7XG5cdGlmIChwcm9ibGVtcy5sZW5ndGggPiAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBFc2NhcGVyOiB1bnVzYWJsZSBjaGFyIG1hcFxcblxcdCR7cHJvYmxlbXMuam9pbihcIlxcblxcdFwiKX1gKTtcbn07XG5cbi8qKlxuICogQnVpbGRzIHRoZSBsaXN0IG9mIHJlcGxhY2VtZW50cyBmb3Igb25lIGRpcmVjdGlvbi4gQW4gZW50cnkgdGFrZXMgcGFydCBpbiBhIGRpcmVjdGlvbiB3aGVuIGl0XG4gKiBjYXJyaWVzIG5vIGF0IGF0IGFsbCBvciBuYW1lcyB0aGF0IGRpcmVjdGlvbiwgYW5kIHdoZW4gdGhlIHRleHQgaXQgaGFzIHRvIGxvb2sgZm9yIGluIHRoYXRcbiAqIGRpcmVjdGlvbiBpcyBub3QgZW1wdHkgLSB0aGVyZSBpcyBub3RoaW5nIHRvIHNlYXJjaCBmb3Igb3RoZXJ3aXNlLlxuICpcbiAqIFRoZSBvcmRlciBvZiB0aGUgbWFwIGlzIGtlcHQ6IGl0IGRlY2lkZXMgd2hpY2ggZW50cnkgd2lucyB3aGVyZSB0d28gb2YgdGhlbSBjYW4gbWF0Y2ggYXQgdGhlIHNhbWVcbiAqIHBvc2l0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5PENoYXJNYXBFbnRyeT59IGFDaGFyTWFwXG4gKiBAcGFyYW0ge01PREVTfSBtb2RlIHRoZSBkaXJlY3Rpb24gdG8gYnVpbGQgZm9yXG4gKiBAcmV0dXJucyB7QXJyYXl9IGVudHJpZXMgb2Yge2ZpbHRlciwgdmFsdWV9LCBmaWx0ZXIgYmVpbmcgdGhlIGxpdGVyYWwgdGV4dCB0byBsb29rIGZvclxuICovXG5jb25zdCBidWlsZE1hcHBpbmdMaXN0ID0gKGFDaGFyTWFwLCBtb2RlKSA9PiB7XG5cdGNvbnN0IGZyb20gPSBtb2RlID09IE1PREVTLmVzY2FwZSA/IFwiY2hhclwiIDogXCJlc2NhcGVkXCI7XG5cdGNvbnN0IHRvID0gbW9kZSA9PSBNT0RFUy5lc2NhcGUgPyBcImVzY2FwZWRcIiA6IFwiY2hhclwiO1xuXG5cdHJldHVybiBhQ2hhck1hcFxuXHRcdC5maWx0ZXIoKGl0ZW0pID0+ICFpdGVtLmF0IHx8IGl0ZW0uYXQudG9Mb3dlckNhc2UoKSA9PSBtb2RlKVxuXHRcdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW1bZnJvbV0ubGVuZ3RoID4gMClcblx0XHQubWFwKChpdGVtKSA9PiB7XG5cdFx0XHRyZXR1cm4geyBmaWx0ZXI6IGl0ZW1bZnJvbV0sIHZhbHVlOiBpdGVtW3RvXSB9O1xuXHRcdH0pO1xufTtcblxuLyoqXG4gKiBDb21waWxlcyBvbmUgcmVnZXggY292ZXJpbmcgZXZlcnkgZmlsdGVyIG9mIGEgZGlyZWN0aW9uLCBzbyBhIHRleHQgY2FuIGJlIHdhbGtlZCBpbiBhIHNpbmdsZSBwYXNzLlxuICpcbiAqIEV2ZXJ5IGZpbHRlciBiZWNvbWVzIGEgY2FwdHVyZSBncm91cCBvZiBpdHMgb3duLiBXaGljaCBncm91cCB0b29rIHBhcnQgaW4gYSBtYXRjaCB0ZWxscyB3aGljaFxuICogcmVwbGFjZW1lbnQgYmVsb25ncyB0byBpdCAtIHRoYXQgb25seSB3b3JrcyBiZWNhdXNlIHF1b3RlIGVzY2FwZXMgKCBhbmQgKSwgc28gYSBmaWx0ZXIgY2FuIG5ldmVyXG4gKiBicmluZyBhIGdyb3VwIG9mIGl0cyBvd24gYW5kIHNoaWZ0IHRoZSBudW1iZXJpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHRoZUZpbHRlcnNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNDYXNlU2Vuc2l0aXZlXG4gKiBAcmV0dXJucyB7UmVnRXhwfG51bGx9IG51bGwgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGxvb2sgZm9yXG4gKi9cbmNvbnN0IGJ1aWxkTWF0Y2hlciA9ICh0aGVGaWx0ZXJzLCBpc0Nhc2VTZW5zaXRpdmUpID0+IHtcblx0Ly8gYW4gZW1wdHkgYWx0ZXJuYXRpb24gd291bGQgY29tcGlsZSBpbnRvIGEgcmVnZXggbWF0Y2hpbmcgYXQgZXZlcnkgcG9zaXRpb25cblx0aWYgKHRoZUZpbHRlcnMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcblxuXHRjb25zdCBzb3VyY2UgPSB0aGVGaWx0ZXJzLm1hcCgoaXRlbSkgPT4gYCgke3F1b3RlKGl0ZW0uZmlsdGVyKX0pYCkuam9pbihcInxcIik7XG5cblx0Ly8gbm8gbSBmbGFnIC0gdGhlIGZpbHRlcnMgYXJlIHF1b3RlZCBsaXRlcmFscywgXiBhbmQgJCBuZXZlciByZWFjaCB0aGUgcmVnZXggYXMgYW5jaG9yc1xuXHRyZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIGlzQ2FzZVNlbnNpdGl2ZSA/IFwiZ1wiIDogXCJnaVwiKTtcbn07XG5cbi8qKlxuICogUmVwbGFjZXMgZXZlcnkgZmlsdGVyIG9mIGEgZGlyZWN0aW9uIGluIG9uZSBwYXNzIG92ZXIgdGhlIHRleHQuXG4gKlxuICogT25lIHBhc3MgaXMgd2hhdCBrZWVwcyB0aGUgcnVsZXMgYXBhcnQ6IHdoYXRldmVyIGEgcmVwbGFjZW1lbnQgaW5zZXJ0cyBpcyBiZWhpbmQgdGhlIHBvc2l0aW9uIHRoZVxuICogd2FsayBjb250aW51ZXMgYXQsIHNvIG5vIG90aGVyIHJ1bGUgY2FuIGV2ZXIgc2VlIGl0LiBUaGUgcmVwbGFjZW1lbnQgY29tZXMgZnJvbSBhIGNhbGxiYWNrLCB3aG9zZVxuICogcmV0dXJuIHZhbHVlIFN0cmluZy5yZXBsYWNlIHRha2VzIGxpdGVyYWxseSAtIGEgdmFsdWUgY2FycnlpbmcgJCYsICRgIG9yICQxIGlzIGluc2VydGVkIGFzIHdyaXR0ZW4uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuICogQHBhcmFtIHtBcnJheX0gdGhlRmlsdGVyc1xuICogQHBhcmFtIHtSZWdFeHB8bnVsbH0gYU1hdGNoZXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IG1hcHBpbmcgPSAoYVRleHQsIHRoZUZpbHRlcnMsIGFNYXRjaGVyKSA9PiB7XG5cdGlmIChhTWF0Y2hlciA9PT0gbnVsbCkgcmV0dXJuIGFUZXh0O1xuXG5cdHJldHVybiBhVGV4dC5yZXBsYWNlKGFNYXRjaGVyLCAoLi4uYXJncykgPT4ge1xuXHRcdC8vIHRoZSB3aG9sZSBtYXRjaCBjb21lcyBmaXJzdCwgdGhlbiBvbmUgZW50cnkgcGVyIGdyb3VwLCB0aGVuIG9mZnNldCBhbmQgdGV4dCAtIGV4YWN0bHkgb25lXG5cdFx0Ly8gb2YgdGhlIGdyb3VwcyB0b29rIHBhcnRcblx0XHRjb25zdCBncm91cHMgPSBhcmdzLnNsaWNlKDEsIDEgKyB0aGVGaWx0ZXJzLmxlbmd0aCk7XG5cdFx0cmV0dXJuIHRoZUZpbHRlcnNbZ3JvdXBzLmZpbmRJbmRleCgoZ3JvdXApID0+IHR5cGVvZiBncm91cCAhPT0gXCJ1bmRlZmluZWRcIildLnZhbHVlO1xuXHR9KTtcbn07XG5cbi8qKlxuICogT25lIGVudHJ5IG9mIGEgY2hhciBtYXAuXG4gKlxuICogQHR5cGVkZWYge29iamVjdH0gQ2hhck1hcEVudHJ5XG4gKiBAcHJvcGVydHkge3N0cmluZ30gY2hhciB0aGUgdGV4dCB0byBsb29rIGZvciB3aGlsZSBlc2NhcGluZywgbXVzdCBub3QgYmUgZW1wdHlcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBlc2NhcGVkIHdoYXQgaXQgaXMgcmVwbGFjZWQgd2l0aC4gQW4gZW1wdHkgb25lIGRyb3BzIHRoZSB0ZXh0LCB3aGljaCBjYW5ub3QgYmVcbiAqICAgdW5kb25lIC0gc3VjaCBhbiBlbnRyeSB0YWtlcyBwYXJ0IGluIGVzY2FwaW5nIG9ubHkuXG4gKiBAcHJvcGVydHkge01PREVTfSBbYXRdIGxpbWl0cyB0aGUgZW50cnkgdG8gb25lIGRpcmVjdGlvbiwge0BsaW5rIE1PREVTfS5lc2NhcGUgb3JcbiAqICAge0BsaW5rIE1PREVTfS51bmVzY2FwZS4gQ29tcGFyZWQgaW4gbG93ZXIgY2FzZSwgc28gdGhlIHNwZWxsaW5nIG9mIHRoZSBkaXJlY3Rpb24gZG9lcyBub3QgbWF0dGVyLlxuICogICBUYWtpbmcgcGFydCBpbiBib3RoIGlzIHRoZSBkZWZhdWx0LiBBbnl0aGluZyBlbHNlIGlzIHJlamVjdGVkLlxuICovXG5cbi8qKlxuICogUmVwbGFjZXMgdGV4dHMgYnkgYSBjaGFyIG1hcCBhbmQgdGFrZXMgdGhlIHJlcGxhY2VtZW50IGJhY2sgb3V0LlxuICpcbiAqIEJvdGggZGlyZWN0aW9ucyB3YWxrIHRoZSB0ZXh0IG9uY2UsIHNvIGEgcmVwbGFjZW1lbnQgaXMgbmV2ZXIgdG91Y2hlZCBhZ2FpbiBieSBhbm90aGVyIGVudHJ5LiBXaGVyZVxuICogdHdvIGVudHJpZXMgY2FuIG1hdGNoIGF0IHRoZSBzYW1lIHBsYWNlLCB0aGUgb25lIHdyaXR0ZW4gZmlyc3QgaW4gdGhlIG1hcCB3aW5zLlxuICpcbiAqIGNoYXIgYW5kIGVzY2FwZWQgYXJlIHRleHRzLCBub3Qgc2luZ2xlIGNoYXJhY3RlcnMgLSBhbiBlbnRyeSBtYXkgbG9vayBmb3IgXCJhYVwiIGFuZCByZXBsYWNlIGl0IHdpdGhcbiAqIFwieHl6XCIuIEEgY2hhcmFjdGVyIGNhcnJ5aW5nIGEgbWVhbmluZyBpbiBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBtYXRjaGVkIGxpdGVyYWxseS5cbiAqXG4gKiBBbiBlbnRyeSBtYXkgbmFtZSBhIGRpcmVjdGlvbiB0aHJvdWdoIHRoZSBhdCBvZiBpdHMge0BsaW5rIENoYXJNYXBFbnRyeX0sIHNlZSB7QGxpbmsgTU9ERVN9LlxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBlc2NhcGVyID0gbmV3IEVzY2FwZXIoW1xuICogICAgIHtjaGFyIDogXCJcXFxcXCIsIGVzY2FwZWQgOiBcIlxcXFxcXFxcXCJ9LFxuICogICAgIHtjaGFyIDogXCJcXFwiXCIsIGVzY2FwZWQgOiBcIlxcXFxcXFwiXCJ9LFxuICogXSwgdHJ1ZSk7XG4gKlxuICogZXNjYXBlci5lc2NhcGUoYHNheSBcImhpXCJgKTsgICAgICAvLyAnc2F5IFxcXFxcImhpXFxcXFwiJ1xuICogZXNjYXBlci51bmVzY2FwZSgnc2F5IFxcXFxcImhpXFxcXFwiJyk7ICAgLy8gJ3NheSBcImhpXCInXG4gKi9cbmNsYXNzIEVzY2FwZXIge1xuXG5cdC8qKlxuXHQgKiBUaGUgcmVwbGFjZW1lbnRzIG9mIHRoZSBlc2NhcGUgZGlyZWN0aW9uLCBpbiB0aGUgb3JkZXIgb2YgdGhlIGNoYXIgbWFwLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdHlwZSB7QXJyYXk8e2ZpbHRlciA6IHN0cmluZywgdmFsdWUgOiBzdHJpbmd9Pn1cblx0ICovXG5cdCNlc2NhcGVNYXAgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgcmVwbGFjZW1lbnRzIG9mIHRoZSB1bmVzY2FwZSBkaXJlY3Rpb24uIFNob3J0ZXIgdGhhbiB0aGUgZXNjYXBlIG9uZSB3aGVuZXZlciBhbiBlbnRyeSBuYW1lc1xuXHQgKiBhIGRpcmVjdGlvbiBvciBkcm9wcyBpdHMgdGV4dC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHR5cGUge0FycmF5PHtmaWx0ZXIgOiBzdHJpbmcsIHZhbHVlIDogc3RyaW5nfT59XG5cdCAqL1xuXHQjdW5lc2NhcGVNYXAgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tcGlsZWQgcmVnZXggY292ZXJpbmcgZXZlcnkgZmlsdGVyIG9mIHRoZSBlc2NhcGUgZGlyZWN0aW9uLCBudWxsIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0b1xuXHQgKiBsb29rIGZvci4gSXRzIGNhcHR1cmUgZ3JvdXBzIGxpbmUgdXAgd2l0aCAjZXNjYXBlTWFwLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdHlwZSB7UmVnRXhwfG51bGx9XG5cdCAqL1xuXHQjZXNjYXBlTWF0Y2hlciA9IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBzYW1lIGZvciB0aGUgdW5lc2NhcGUgZGlyZWN0aW9uLCBsaW5lZCB1cCB3aXRoICN1bmVzY2FwZU1hcC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHR5cGUge1JlZ0V4cHxudWxsfVxuXHQgKi9cblx0I3VuZXNjYXBlTWF0Y2hlciA9IG51bGw7XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7QXJyYXk8Q2hhck1hcEVudHJ5Pn0gZXNjYXBlTWFwXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzQ2FzZVNlbnNpdGl2ZT1mYWxzZV0gbGVhdmluZyBpdCBvdXQgZ2l2ZXMgYSBjYXNlIGluc2Vuc2l0aXZlIGVzY2FwZXIsIHdoaWNoXG5cdCAqICAgYWxzbyBtYXRjaGVzIHRoZSBvdGhlciBjYXNlIG9mIGEgY2hhciBhbmQgdGhlcmVmb3JlIGRvZXMgbm90IGNhcnJ5IHRoZSBjYXNlIHRocm91Z2ggYVxuXHQgKiAgIHJvdW5kdHJpcFxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gdGhlIG1hcCBpcyBubyBhcnJheSBvciBhbnkgb2YgaXRzIGVudHJpZXMgaXMgdW51c2FibGUuIEV2ZXJ5IHByb2JsZW0gb2Zcblx0ICogICB0aGUgbWFwIGlzIHJlcG9ydGVkIGF0IG9uY2UuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihlc2NhcGVNYXAsIGlzQ2FzZVNlbnNpdGl2ZSkge1xuXHRcdHZhbGlkYXRlQ2hhck1hcChlc2NhcGVNYXApO1xuXHRcdHRoaXMuI2VzY2FwZU1hcCA9IGJ1aWxkTWFwcGluZ0xpc3QoZXNjYXBlTWFwLCBNT0RFUy5lc2NhcGUpO1xuXHRcdHRoaXMuI3VuZXNjYXBlTWFwID0gYnVpbGRNYXBwaW5nTGlzdChlc2NhcGVNYXAsIE1PREVTLnVuZXNjYXBlKTtcblx0XHR0aGlzLiNlc2NhcGVNYXRjaGVyID0gYnVpbGRNYXRjaGVyKHRoaXMuI2VzY2FwZU1hcCwgaXNDYXNlU2Vuc2l0aXZlKTtcblx0XHR0aGlzLiN1bmVzY2FwZU1hdGNoZXIgPSBidWlsZE1hdGNoZXIodGhpcy4jdW5lc2NhcGVNYXAsIGlzQ2FzZVNlbnNpdGl2ZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZXMgZXZlcnkgY2hhciBvZiB0aGUgbWFwIHdpdGggaXRzIGVzY2FwZWQgdGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiB0aGUgYXJndW1lbnQgaXMgbm8gc3RyaW5nXG5cdCAqL1xuXHRlc2NhcGUoYVRleHQpIHtcblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwZWN0ZWQgYSBzdHJpbmdcIik7XG5cdFx0cmV0dXJuIG1hcHBpbmcoYVRleHQsIHRoaXMuI2VzY2FwZU1hcCwgdGhpcy4jZXNjYXBlTWF0Y2hlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZXMgZXZlcnkgZXNjYXBlZCB0ZXh0IG9mIHRoZSBtYXAgd2l0aCBpdHMgY2hhci5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiB0aGUgYXJndW1lbnQgaXMgbm8gc3RyaW5nXG5cdCAqL1xuXHR1bmVzY2FwZShhVGV4dCkge1xuXHRcdGlmICh0eXBlb2YgYVRleHQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCBhIHN0cmluZ1wiKTtcblx0XHRyZXR1cm4gbWFwcGluZyhhVGV4dCwgdGhpcy4jdW5lc2NhcGVNYXAsIHRoaXMuI3VuZXNjYXBlTWF0Y2hlcik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGVzY2FwZXIgZm9yIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIHNlZSB7QGxpbmsgUkVHRVhQX0VTQ0FQRVJ9LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7RXNjYXBlcn0gYWx3YXlzIHRoZSBzYW1lIGluc3RhbmNlXG5cdCAqL1xuXHRzdGF0aWMgUkVHRVhQX0VTQ0FQRVIoKSB7XG5cdFx0cmV0dXJuIFJFR0VYUF9FU0NBUEVSO1xuXHR9XG59XG5cbi8qKlxuICogRXNjYXBlciB0YWtpbmcgdGhlIG1lYW5pbmcgb3V0IG9mIGV2ZXJ5IGNoYXJhY3RlciBhIHJlZ3VsYXIgZXhwcmVzc2lvbiByZWFkcyBzcGVjaWFsbHksIHNvIGEgdGV4dFxuICogY2FuIGJlIHB1dCBpbnRvIGEgcGF0dGVybiBhbmQgbWF0Y2hlZCBsaXRlcmFsbHkuXG4gKlxuICogQHR5cGUge0VzY2FwZXJ9XG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKGBeJHtSRUdFWFBfRVNDQVBFUi5lc2NhcGUoXCJhK2JcIil9JGApO1xuICogcGF0dGVybi50ZXN0KFwiYStiXCIpOyAgIC8vIHRydWVcbiAqIHBhdHRlcm4udGVzdChcImFhYlwiKTsgICAvLyBmYWxzZVxuICovXG4vLyBoYXMgdG8gY29tZSBhZnRlciB0aGUgY2xhc3MgLSB0aGUgc2luZ2xldG9uIGlzIGJ1aWx0IHdoaWxlIHRoZSBtb2R1bGUgaXMgZXZhbHVhdGVkLCBhbmQgYSBjbGFzc1xuLy8gc3RheXMgaW4gaXRzIHRlbXBvcmFsIGRlYWQgem9uZSB1bnRpbCBpdHMgZGVjbGFyYXRpb24gaGFzIHJ1blxuZXhwb3J0IGNvbnN0IFJFR0VYUF9FU0NBUEVSID0gbmV3IEVzY2FwZXIoXG5cdFJFR0VYQ0hBUlMubWFwKChjaGFyKSA9PiB7XG5cdFx0cmV0dXJuIHsgY2hhciwgZXNjYXBlZDogXCJcXFxcXCIgKyBjaGFyIH07XG5cdH0pLFxuKTtcblxuZXhwb3J0IGRlZmF1bHQgRXNjYXBlcjtcbiIsIi8qKlxuICogVGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC5cbiAqXG4gKiBSZXNvbHZlZCBvbmNlIHdoZW4gdGhlIG1vZHVsZSBpcyBsb2FkZWQ6IGdsb2JhbFRoaXMsIHRoZW4gZ2xvYmFsLCB3aW5kb3cgYW5kIHNlbGYgZm9yIGVuZ2luZXMgbm90XG4gKiBrbm93aW5nIGl0IHlldC4gQW4gZW1wdHkgb2JqZWN0IHdoZW4gbm9uZSBvZiB0aGVtIGV4aXN0cywgc28gcmVhZGluZyBmcm9tIGl0IG5ldmVyIHRocm93cy5cbiAqXG4gKiBAbW9kdWxlIEdsb2JhbFxuICpcbiAqIEBleGFtcGxlXG4gKiBHTE9CQUwuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWZmZXIpO1xuICovXG5jb25zdCBHTE9CQUwgPSAoKCkgPT4ge1xuXHRpZih0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdGlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBnbG9iYWw7XG5cdGlmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiB3aW5kb3c7XG5cdGlmKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gc2VsZjtcblx0cmV0dXJuIHt9O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgR0xPQkFMO1xuIiwiLyoqXHJcbiAqIE9ubHkgYW4gb2JqZWN0IGNhbiBjYXJyeSBhIHByb3BlcnR5LCBzbyBhIHBhdGggc3RvcHMgYXQgYSBwcmltaXRpdmUgaW5zdGVhZCBvZiBoYW5kaW5nIG91dCBhXHJcbiAqIHByb3BlcnR5IHRoYXQgY2Fubm90IGJlIHJlYWQgb3Igd3JpdHRlbi4gQW4gQXJyYXksIE1hcCBvciBEYXRlIHBhc3NlcyAtIHRoZXkgYXJlIG9iamVjdHMgYW5kIHRha2VcclxuICogYSBwcm9wZXJ0eSBsaWtlIGFueSBvdGhlciBvbmUsIHdoaWNoIGlzIHdoYXQgbWFrZXMgYSBwYXRoIGxpa2UgXCJsaXN0LjBcIiB3b3JrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHRoZSB2YWx1ZSBhIHN0ZXAgb2YgdGhlIHBhdGggcmVzb2x2ZWQgdG9cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhhdCBzdGVwXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgdGhlIHdob2xlIHBhdGgsIHRvIHRlbGwgd2hpY2ggb25lIG9mIHNldmVyYWwgc3RlcHMgZmFpbGVkXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gdGhlIHN0ZXAgY2FycmllcyBubyBvYmplY3RcclxuICovXHJcbmNvbnN0IGFzc2VydERlc2NlbmRhYmxlID0gKHZhbHVlLCBuYW1lLCBrZXkpID0+IHtcclxuXHRpZih2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpXHJcblx0XHRyZXR1cm47XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB2YWx1ZSA9PT0gbnVsbCA/IFwibnVsbFwiIDogYGEgJHt0eXBlb2YgdmFsdWV9YDtcclxuXHR0aHJvdyBuZXcgVHlwZUVycm9yKGBjYW5ub3QgZGVzY2VuZCBpbnRvIFwiJHtuYW1lfVwiIG9mIHBhdGggXCIke2tleX1cIiAtICR7dHlwZX0gaXMgbm8gb2JqZWN0YCk7XHJcbn07XHJcblxyXG4vKipcclxuICogT25lIHByb3BlcnR5IG9mIGFuIG9iamVjdCwgYWRkcmVzc2VkIGJ5IG5hbWUsIHRvZ2V0aGVyIHdpdGggdGhlIG9iamVjdCBjYXJyeWluZyBpdC5cclxuICpcclxuICogQnVpbHQgdGhyb3VnaCB7QGxpbmsgT2JqZWN0UHJvcGVydHkubG9hZH0sIHdoaWNoIHdhbGtzIGEgZG90dGVkIHBhdGggYW5kIGhhbmRzIGJhY2sgdGhlIHByb3BlcnR5IGF0XHJcbiAqIGl0cyBlbmQuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IHByb3BlcnR5ID0gT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IHtiIDogMX19LCBcImEuYlwiKTtcclxuICogcHJvcGVydHkudmFsdWU7ICAgICAgLy8gMVxyXG4gKiBwcm9wZXJ0eS52YWx1ZSA9IDI7ICAvLyB3cml0ZXMgaW50byB0aGUgb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYmplY3RQcm9wZXJ0eSB7XHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgY2FycnlpbmcgaXRcclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihrZXksIGNvbnRleHQpe1xyXG5cdFx0dGhpcy5rZXkgPSBrZXk7XHJcblx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogV2hldGhlciB0aGUga2V5IGlzIHJlYWNoYWJsZSBvbiB0aGUgY29udGV4dCBhdCBhbGwuXHJcblx0ICpcclxuXHQgKiBUaGlzIGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBwcm90b3R5cGUgY2hhaW4sIG5vdCBvbmx5IGZvciBvd24gcHJvcGVydGllcyAtIGxvYWQoe30sIFwidG9TdHJpbmdcIilcclxuXHQgKiByZXBvcnRzIHRydWUuIFRoYXQgaXMgZGVsaWJlcmF0ZTogYSBwYXRoIG1heSBhZGRyZXNzIGEgcHJvdG90eXBlIGFuZCBleHRlbmQgaXQsIHNvIGFuIGluaGVyaXRlZFxyXG5cdCAqIGtleSBpcyBhIGtleSBsaWtlIGFueSBvdGhlciBoZXJlLiBVc2UgaGFzVmFsdWUgdG8gYXNrIHdoZXRoZXIgc29tZXRoaW5nIGlzIGFjdHVhbGx5IHN0b3JlZC5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGdldCBrZXlEZWZpbmVkKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5rZXkgaW4gdGhpcy5jb250ZXh0O1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBXaGV0aGVyIHNvbWV0aGluZyBpcyBzdG9yZWQgdW5kZXIgdGhlIGtleS4gT25seSB1bmRlZmluZWQgY291bnRzIGFzIG5vdGhpbmcgLSAwLCBcIlwiLCBmYWxzZSBhbmRcclxuXHQgKiBudWxsIGFyZSB2YWx1ZXMuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRnZXQgaGFzVmFsdWUoKXtcclxuXHRcdHJldHVybiB0eXBlb2YgdGhpcy5jb250ZXh0W3RoaXMua2V5XSAhPT0gXCJ1bmRlZmluZWRcIjtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEByZXR1cm5zIHsqfSB0aGUgc3RvcmVkIHZhbHVlLCB1bmRlZmluZWQgd2hlbiB0aGVyZSBpcyBub25lXHJcblx0ICovXHJcblx0Z2V0IHZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5jb250ZXh0W3RoaXMua2V5XTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7Kn0gZGF0YVxyXG5cdCAqL1xyXG5cdHNldCB2YWx1ZShkYXRhKXtcclxuXHRcdHRoaXMuY29udGV4dFt0aGlzLmtleV0gPSBkYXRhO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQWRkcyBhIHZhbHVlIG5leHQgdG8gd2hhdCBpcyBhbHJlYWR5IHRoZXJlOiB3cml0ZXMgaXQgd2hlbiB0aGUga2V5IGhvbGRzIG5vdGhpbmcsIHR1cm5zIHRoZVxyXG5cdCAqIHZhbHVlIGludG8gYW4gYXJyYXkgb2YgYm90aCB3aGVuIGl0IGhvbGRzIG9uZSwgYW5kIHB1c2hlcyBvbnRvIHRoZSBhcnJheSB3aGVuIGl0IGhvbGRzIG9uZVxyXG5cdCAqIGFscmVhZHkuXHJcblx0ICpcclxuXHQgKiBUaGUgdmFsdWUgaXRzZWxmIGlzIG5vdCBsb29rZWQgYXQgLSBhcHBlbmRpbmcgdW5kZWZpbmVkIHB1dHMgdW5kZWZpbmVkIGludG8gdGhlIGFycmF5LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHsqfSBkYXRhXHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDE7ICAgLy8ge2tleSA6IDF9XHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMjsgICAvLyB7a2V5IDogWzEsIDJdfVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDM7ICAgLy8ge2tleSA6IFsxLCAyLCAzXX1cclxuXHQgKi9cclxuXHRzZXQgYXBwZW5kKGRhdGEpIHtcclxuXHRcdGlmKCF0aGlzLmhhc1ZhbHVlKVxyXG5cdFx0XHR0aGlzLnZhbHVlID0gZGF0YTtcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRcdGlmKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpXHJcblx0XHRcdFx0dmFsdWUucHVzaChkYXRhKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMudmFsdWUgPSBbdGhpcy52YWx1ZSwgZGF0YV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBEZWxldGVzIHRoZSBrZXkgZnJvbSB0aGUgb2JqZWN0LiBEb2VzIG5vdGhpbmcgd2hlbiBpdCBpcyBub3QgdGhlcmUuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7dm9pZH1cclxuXHQgKi9cclxuXHRyZW1vdmUoKXtcclxuXHRcdGRlbGV0ZSB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBMb2FkcyB0aGUgcHJvcGVydHkgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMuIEV2ZXJ5IHBhcnQgb2YgdGhlIHBhdGggaXMgdHJpbW1lZCwgc28gXCIgYSAuIGIgXCJcclxuXHQgKiBhZGRyZXNzZXMgdGhlIHNhbWUgcHJvcGVydHkgYXMgXCJhLmJcIi5cclxuXHQgKlxyXG5cdCAqIEEgbWlzc2luZyBzdGVwIGlzIGNyZWF0ZWQgd2l0aCBjcmVhdGUsIG90aGVyd2lzZSB0aGUgcGF0aCBpcyByZXBvcnRlZCBhcyBub3QgbG9hZGFibGUuIEEgc3RlcFxyXG5cdCAqIGhvbGRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0IGNhbm5vdCBiZSB3YWxrZWQgaW50byBhdCBhbGwgLSB0aGF0IGlzIGEgYnJva2VuIHBhdGgsIG5vdCBhXHJcblx0ICogbWlzc2luZyBvbmUsIGFuZCBpdCBpcyByZXBvcnRlZCBhcyBhbiBlcnJvciByZWdhcmRsZXNzIG9mIGNyZWF0ZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRoZSBvYmplY3QgdG8gd2Fsa1xyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbmFtZSBvZiB0aGUgcHJvcGVydHksIGEgZG90dGVkIHBhdGggYWRkcmVzc2VzIGEgbmVzdGVkIG9uZVxyXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NyZWF0ZT10cnVlXSBjcmVhdGUgYSBtaXNzaW5nIHN0ZXAgb24gdGhlIHdheVxyXG5cdCAqIEByZXR1cm5zIHtPYmplY3RQcm9wZXJ0eXxudWxsfSBudWxsIHdoZW4gYSBzdGVwIGlzIG1pc3NpbmcgYW5kIGNyZWF0ZSBpcyBmYWxzZVxyXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiBhIHN0ZXAgb2YgdGhlIHBhdGggaG9sZHMgc29tZXRoaW5nIHRoYXQgaXMgbm8gb2JqZWN0XHJcblx0ICpcclxuXHQgKiBAZXhhbXBsZVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiB7YiA6IDF9fSwgXCJhLmJcIikudmFsdWU7ICAgLy8gMVxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2xpc3QgOiBbMSwgMl19LCBcImxpc3QuMVwiKS52YWx1ZTsgICAvLyAyLCBhbiBhcnJheSBpcyBhbiBvYmplY3RcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHt9LCBcImEuYlwiLCBmYWxzZSk7ICAgICAgICAgICAgIC8vIG51bGxcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDogMH0sIFwiYS5iXCIpOyAgICAgICAgICAgICAgIC8vIHRocm93cywgMCBpcyBubyBvYmplY3RcclxuXHQgKi9cclxuXHRzdGF0aWMgbG9hZChkYXRhLCBrZXksIGNyZWF0ZT10cnVlKSB7XHJcblx0XHRsZXQgY29udGV4dCA9IGRhdGE7XHJcblx0XHRjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiLlwiKTtcclxuXHRcdGxldCBuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdHdoaWxlKGtleXMubGVuZ3RoID4gMCl7XHJcblx0XHRcdGlmKHR5cGVvZiBjb250ZXh0W25hbWVdID09PSBcInVuZGVmaW5lZFwiIHx8IGNvbnRleHRbbmFtZV0gPT09IG51bGwpe1xyXG5cdFx0XHRcdGlmKCFjcmVhdGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHJcblx0XHRcdFx0Y29udGV4dFtuYW1lXSA9IHt9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGFzc2VydERlc2NlbmRhYmxlKGNvbnRleHRbbmFtZV0sIG5hbWUsIGtleSk7XHJcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0W25hbWVdO1xyXG5cdFx0XHRuYW1lID0ga2V5cy5zaGlmdCgpLnRyaW0oKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3IE9iamVjdFByb3BlcnR5KG5hbWUsIGNvbnRleHQpO1xyXG5cdH1cclxufTsiLCIvKipcclxuICogVXRpbGl0aWVzIHRvIGluc3BlY3QsIGNvbXBhcmUsIG1lcmdlIGFuZCBmaWx0ZXIgamF2YXNjcmlwdCBvYmplY3RzLlxyXG4gKlxyXG4gKiBTZXZlcmFsIGZ1bmN0aW9ucyBzaGFyZSBvbmUgbm90aW9uIG9mIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZSBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXBcclxuICogYW5kIFNldC4ge0BsaW5rIGlzUG9qb30gZGVjaWRlcyB3aGV0aGVyIGEgdmFsdWUgc3RheXMgd2l0aGluIGl0LCB7QGxpbmsgZXF1YWxQb2pvfSBjb21wYXJlcyB0aG9zZVxyXG4gKiB0eXBlcyBieSB2YWx1ZSwgYW5kIHtAbGluayBtZXJnZX0gdHJlYXRzIGV2ZXJ5dGhpbmcgb3V0c2lkZSBvZiBpdCBhcyBhIHZhbHVlIHRvIGJlIHJlcGxhY2VkLlxyXG4gKlxyXG4gKiBAbW9kdWxlIE9iamVjdFV0aWxzXHJcbiAqL1xyXG5pbXBvcnQgT2JqZWN0UHJvcGVydHkgZnJvbSBcIi4vT2JqZWN0UHJvcGVydHkuanNcIjtcclxuXHJcbi8qKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fSBhXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxBcnJheSA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCBsZW5ndGggPSBhLmxlbmd0aDtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSBpZiAoIWludGVybmFsRXF1YWxQb2pvKGFbaV0sIGJbaV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgc2V0IGlzIHVub3JkZXJlZCwgc28gZXZlcnkgZW50cnkgb2YgYSBoYXMgdG8gZmluZCBpdHMgb3duIHBhcnRuZXIgaW4gYi5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtTZXR9IGFcclxuICogQHBhcmFtIHtTZXR9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxTZXQgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChhLnNpemUgIT09IGIuc2l6ZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCByZW1haW5pbmcgPSBBcnJheS5mcm9tKGIpO1xyXG5cdGZvciAoY29uc3QgZW50cnlBIG9mIGEpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gcmVtYWluaW5nLmZpbmRJbmRleCgoZW50cnlCKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhlbnRyeUEsIGVudHJ5Qiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBtYXAgaXMgdW5vcmRlcmVkIGFzIHdlbGwgYW5kIGl0cyBrZXlzIG1heSBiZSBvYmplY3RzLCBzbyB0aGUga2V5cyBnZXQgY29tcGFyZWQgYnkgdmFsdWUgdG9vLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge01hcH0gYVxyXG4gKiBAcGFyYW0ge01hcH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE1hcCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHJlbWFpbmluZyA9IEFycmF5LmZyb20oYik7XHJcblx0Zm9yIChjb25zdCBba2V5QSwgdmFsdWVBXSBvZiBhKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IHJlbWFpbmluZy5maW5kSW5kZXgoKFtrZXlCLCB2YWx1ZUJdKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhrZXlBLCBrZXlCLCBzZWVuKSAmJiBpbnRlcm5hbEVxdWFsUG9qbyh2YWx1ZUEsIHZhbHVlQiwgc2VlbikpO1xyXG5cdFx0aWYgKGluZGV4IDwgMCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdHJlbWFpbmluZy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIG9iamVjdHMgYnkgcHJvdG90eXBlIGFuZCBieSB0aGVpciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbE9iamVjdCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZihhKSAhPT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGIpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHByb3BlcnRpZXNBID0gT2JqZWN0LmtleXMoYSk7XHJcblx0Y29uc3QgcHJvcGVydGllc0IgPSBPYmplY3Qua2V5cyhiKTtcclxuXHRpZiAocHJvcGVydGllc0EubGVuZ3RoICE9PSBwcm9wZXJ0aWVzQi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Zm9yIChjb25zdCBrZXkgb2YgcHJvcGVydGllc0EpIHtcclxuXHRcdC8vIGVxdWFsIGtleSBjb3VudHMgYWxvbmUgd291bGQgbGV0IHt4OjEsIHk6dW5kZWZpbmVkfSBwYXNzIGFnYWluc3Qge3g6MSwgejp1bmRlZmluZWR9XHJcblx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpKSByZXR1cm4gZmFsc2U7XHJcblx0XHRpZiAoIWludGVybmFsRXF1YWxQb2pvKGFba2V5XSwgYltrZXldLCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBjeWNsaWMgc3RydWN0dXJlIGNhbiBvbmx5IGJlIGRlY2lkZWQgY28taW5kdWN0aXZlbHk6IGEgcGFpciBhbHJlYWR5IHVuZGVyIGNvbXBhcmlzb24gY291bnRzIGFzXHJcbiAqIGVxdWFsLCBvdGhlcndpc2UgdGhlIHdhbGsgd291bGQgbmV2ZXIgY29tZSBiYWNrLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgd2hlbiB0aGlzIHBhaXIgaXMgYWxyZWFkeSBiZWluZyBjb21wYXJlZCBmdXJ0aGVyIHVwIHRoZSBzdGFja1xyXG4gKi9cclxuY29uc3QgaXNDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0cmV0dXJuICEhcGFydG5lcnMgJiYgcGFydG5lcnMuaGFzKGIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE5vdGVzIGEgcGFpciBhcyBiZWluZyBjb21wYXJlZCwgc28gYSBjeWNsZSBydW5uaW5nIHRocm91Z2ggaXQgdGVybWluYXRlcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuY29uc3QgcmVtZW1iZXJDb21wYXJpbmcgPSAoc2VlbiwgYSwgYikgPT4ge1xyXG5cdGNvbnN0IHBhcnRuZXJzID0gc2Vlbi5nZXQoYSk7XHJcblx0aWYgKHBhcnRuZXJzKSBwYXJ0bmVycy5hZGQoYik7XHJcblx0ZWxzZSBzZWVuLnNldChhLCBuZXcgV2Vha1NldChbYl0pKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIG51bGwgb3IgdW5kZWZpbmVkLlxyXG4gKlxyXG4gKiBWYWx1ZUhlbHBlci5ub1ZhbHVlIGFuc3dlcnMgdGhlIHNhbWUgcXVlc3Rpb24uIEJvdGggYXJlIGtlcHQgb24gcHVycG9zZSwgc28gVmFsdWVIZWxwZXIgc3RheXMgZnJlZVxyXG4gKiBvZiBhIGRlcGVuZGVuY3kgb24gdGhpcyBtb2R1bGUgLSBzZWUgdGhlIG5vdGUgdGhlcmUuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzTnVsbE9yVW5kZWZpbmVkID0gKG9iamVjdCkgPT4ge1xyXG5cdHJldHVybiBvYmplY3QgPT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ID09PSBcInVuZGVmaW5lZFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgYSBwcmltaXRpdmUuXHJcbiAqXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBjb3VudCBhcyBwcmltaXRpdmVzLiBBIHN5bWJvbCBkb2VzIG5vdCAtIGl0IGlzIHRyZWF0ZWQgYXMgYW4gb3BhcXVlIHZhbHVlXHJcbiAqIHRocm91Z2hvdXQgdGhpcyBtb2R1bGUsIHNvIHRoYXQge0BsaW5rIGlzUG9qb30ga2VlcHMgcmVqZWN0aW5nIGl0IGFzIGRhdGEuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzUHJpbWl0aXZlID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcblxyXG5cdGNvbnN0IHR5cGUgPSB0eXBlb2Ygb2JqZWN0O1xyXG5cdHN3aXRjaCAodHlwZSkge1xyXG5cdFx0Y2FzZSBcIm51bWJlclwiOlxyXG5cdFx0Y2FzZSBcImJpZ2ludFwiOlxyXG5cdFx0Y2FzZSBcImJvb2xlYW5cIjpcclxuXHRcdGNhc2UgXCJzdHJpbmdcIjpcclxuXHRcdGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhbiBvYmplY3QuXHJcbiAqXHJcbiAqIEV2ZXJ5IG9iamVjdCBjb3VudHMsIEFycmF5LCBNYXAsIERhdGUgYW5kIGNsYXNzIGluc3RhbmNlcyBpbmNsdWRlZC4gVXNlIHtAbGluayBpc1Bvam99IHRvIGFzayBmb3JcclxuICogYSBzaW1wbGUgZGF0YSBvYmplY3QgaW5zdGVhZC5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNPYmplY3QgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQ29tcGFyZXMgdHdvIHZhbHVlcyBieSB2YWx1ZS5cclxuICpcclxuICogVGhlIHR5cGVzIGNvbXBhcmVkIGJ5IHZhbHVlIGFyZSB0aGUgb25lcyB7QGxpbmsgaXNQb2pvfSBhY2NlcHRzIGFzIGRhdGE6IHByaW1pdGl2ZXMsIHNpbXBsZVxyXG4gKiBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXAgYW5kIFNldC4gQSBEYXRlIGlzIGNvbXBhcmVkIGJ5IGl0cyB0aW1lLCBhIFJlZ0V4cCBieSBzb3VyY2UgYW5kXHJcbiAqIGZsYWdzLiBTZXQgYW5kIE1hcCBhcmUgdW5vcmRlcmVkLCBzbyB0aGVpciBlbnRyaWVzIGFyZSBtYXRjaGVkIGJ5IHZhbHVlIGluc3RlYWQgb2YgYnkgcG9zaXRpb24sXHJcbiAqIGFuZCB0aGUga2V5cyBvZiBhIE1hcCB0YWtlIHBhcnQgaW4gdGhhdCBjb21wYXJpc29uLlxyXG4gKlxyXG4gKiBTaW1wbGUgb2JqZWN0cyBhbmQgY2xhc3MgaW5zdGFuY2VzIG5lZWQgdGhlIHNhbWUgcHJvdG90eXBlIGFuZCB0aGUgc2FtZSBvd24gZW51bWVyYWJsZVxyXG4gKiBwcm9wZXJ0aWVzLiBFdmVyeSBvdGhlciBvYmplY3QgLSBFcnJvciwgUHJvbWlzZSwgV2Vha01hcCBhbmQgdGhlIGxpa2UgLSBrZWVwcyBpdHMgc3RhdGUgb3V0IG9mXHJcbiAqIHJlYWNoLCBzbyB0aG9zZSBjb21wYXJlIGJ5IGlkZW50aXR5IG9ubHkuIEZ1bmN0aW9ucyBhbmQgc3ltYm9scyBkbyBhcyB3ZWxsLlxyXG4gKlxyXG4gKiBDeWNsaWMgc3RydWN0dXJlcyBhcmUgc3VwcG9ydGVkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IGFcclxuICogQHBhcmFtIHsqfSBiXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBlcXVhbFBvam8oe2EgOiBbMSwgMl19LCB7YSA6IFsxLCAyXX0pOyAgICAgICAgICAgICAgIC8vIHRydWVcclxuICogZXF1YWxQb2pvKG5ldyBTZXQoWzEsIDJdKSwgbmV3IFNldChbMiwgMV0pKTsgICAgICAgICAvLyB0cnVlLCBhIHNldCBpcyB1bm9yZGVyZWRcclxuICogZXF1YWxQb2pvKG5ldyBEYXRlKDApLCBuZXcgRGF0ZSgxKSk7ICAgICAgICAgICAgICAgICAvLyBmYWxzZVxyXG4gKiBlcXVhbFBvam8obmV3IEVycm9yKFwieFwiKSwgbmV3IEVycm9yKFwieFwiKSk7ICAgICAgICAgICAvLyBmYWxzZSwgY29tcGFyZWQgYnkgaWRlbnRpdHlcclxuICovXHJcbmV4cG9ydCBjb25zdCBlcXVhbFBvam8gPSAoYSwgYikgPT4gaW50ZXJuYWxFcXVhbFBvam8oYSwgYiwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG5cclxuLyoqXHJcbiogQHBhcmFtIHsqfSBhXHJcbiAqIEBwYXJhbSB7Kn0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gaW50ZXJuYWwsIHRyYWNrcyB0aGUgcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpbnRlcm5hbEVxdWFsUG9qbyA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKGEpIHx8IGlzTnVsbE9yVW5kZWZpbmVkKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHRpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XHJcblx0aWYgKGlzUHJpbWl0aXZlKGEpIHx8IGlzUHJpbWl0aXZlKGIpKSByZXR1cm4gYSA9PT0gYjtcclxuXHJcblx0Y29uc3QgdHlwZUEgPSB0eXBlb2YgYTtcclxuXHRpZiAodHlwZUEgIT09IHR5cGVvZiBiKSByZXR1cm4gZmFsc2U7XHJcblx0aWYgKHR5cGVBICE9PSBcIm9iamVjdFwiKSByZXR1cm4gYSA9PT0gYjsgLy8gZnVuY3Rpb24gYW5kIHN5bWJvbFxyXG5cclxuXHRpZiAoaXNDb21wYXJpbmcoc2VlbiwgYSwgYikpIHJldHVybiB0cnVlO1xyXG5cdHJlbWVtYmVyQ29tcGFyaW5nKHNlZW4sIGEsIGIpO1xyXG5cclxuXHRpZihhIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuICBiIGluc3RhbmNlb2YgRGF0ZSA/IE9iamVjdC5pcyhhLmdldFRpbWUoKSwgYi5nZXRUaW1lKCkpIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gYiBpbnN0YW5jZW9mIFJlZ0V4cCA/IChhLnNvdXJjZSA9PT0gYi5zb3VyY2UgJiYgYS5mbGFncyA9PT0gYi5mbGFncykgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIGIgaW5zdGFuY2VvZiBBcnJheSA/IGVxdWFsQXJyYXkoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBTZXQpIHJldHVybiBiIGluc3RhbmNlb2YgU2V0ID8gZXF1YWxTZXQoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBNYXApIHJldHVybiBiIGluc3RhbmNlb2YgTWFwID8gZXF1YWxNYXAoYSwgYiwgc2VlbikgOiBmYWxzZTtcclxuXHRlbHNlIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgIT09IFwiW29iamVjdCBPYmplY3RdXCIpIHJldHVybiBmYWxzZTtcdFxyXG5cdGVsc2UgcmV0dXJuIGVxdWFsT2JqZWN0KGEsIGIsIHNlZW4pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgcGxhaW4gb2JqZWN0IG93bnMgZWl0aGVyIG5vIHByb3RvdHlwZSBhdCBhbGwgb3IgYSBwcm90b3R5cGUgdGhhdCBpdHNlbGYgaGFzIG5vbmUuIENoZWNraW5nIHRoZVxyXG4gKiBjaGFpbiBsZW5ndGggaW5zdGVhZCBvZiBjb21wYXJpbmcgYWdhaW5zdCBPYmplY3QucHJvdG90eXBlIGtlZXBzIHRoaXMgd29ya2luZyBhY3Jvc3MgcmVhbG1zLFxyXG4gKiB3aGVyZSBhbiBpZnJhbWUgYnJpbmdzIGl0cyBvd24gT2JqZWN0LnByb3RvdHlwZS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSBvYmplY3RcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc1BsYWluT2JqZWN0ID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChvYmplY3QgPT09IG51bGwgfHwgdHlwZW9mIG9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xyXG5cdGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xyXG5cdHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvdHlwZSkgPT09IG51bGw7XHJcbn07XHJcblxyXG4vKipcclxuICogV2Fsa3MgYSB2YWx1ZSBhbmQgZGVjaWRlcyB3aGV0aGVyIGV2ZXJ5dGhpbmcgcmVhY2hhYmxlIGZyb20gaXQgaXMgZGF0YS5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1dlYWtTZXR9IFtzZWVuXSB2YWx1ZXMgYWxyZWFkeSB3YWxrZWQsIGNsb3NlcyBjeWNsZXNcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBpc0RhdGFWYWx1ZSA9ICh2YWx1ZSwgc2VlbiA9IG5ldyBXZWFrU2V0KCkpID0+IHtcclxuXHRpZiAoaXNQcmltaXRpdmUodmFsdWUpKSByZXR1cm4gdHJ1ZTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiB0cnVlO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0aWYgKHNlZW4uaGFzKHZhbHVlKSkgcmV0dXJuIHRydWU7XHJcblx0c2Vlbi5hZGQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIHZhbHVlLmV2ZXJ5KChlbnRyeSkgPT4gaXNEYXRhVmFsdWUoZW50cnksIHNlZW4pKTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE1hcCkge1xyXG5cdFx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShrZXksIHNlZW4pIHx8ICFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH0gZWxzZSBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKVxyXG5cdFx0cmV0dXJuIGZhbHNlOyAvLyBjbGFzcyBpbnN0YW5jZXMgYW5kIGV2ZXJ5IG90aGVyIGV4b3RpYyBvYmplY3RcclxuXHRlbHNlIHtcclxuXHRcdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKHZhbHVlW2tleV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGFuIG9iamVjdCBpcyBhIHB1cmUgZGF0YSBvYmplY3QuXHJcbiAqXHJcbiAqIFRoZSBvYmplY3QgaXRzZWxmIGhhcyB0byBiZSBhIHNpbXBsZSBvYmplY3QgLSBubyBBcnJheSwgTWFwIG9yIHNvbWV0aGluZyBlbHNlLiBFdmVyeSB2YWx1ZVxyXG4gKiByZWFjaGFibGUgZnJvbSBpdCBoYXMgdG8gYmUgZGF0YSBhcyB3ZWxsOiBwcmltaXRpdmVzLCBzaW1wbGUgb2JqZWN0cywgQXJyYXksIERhdGUsIFJlZ0V4cCwgTWFwIG9yXHJcbiAqIFNldC4gRnVuY3Rpb25zIGFuZCBjbGFzcyBpbnN0YW5jZXMgYXJlIHJlamVjdGVkIGF0IGFueSBkZXB0aCwgaW5jbHVkaW5nIGluc2lkZSBhcnJheXMgYW5kIGluc2lkZVxyXG4gKiB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGEgTWFwIG9yIFNldC5cclxuICpcclxuICogT25seSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGFyZSBpbnNwZWN0ZWQuIEN5Y2xpYyByZWZlcmVuY2VzIGFyZSBhbGxvd2VkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgb2JqZWN0IHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGlzUG9qbyh7YSA6IHtiIDogWzEsIG5ldyBEYXRlKCldfX0pOyAgIC8vIHRydWVcclxuICogaXNQb2pvKHthIDogKCkgPT4ge319KTsgICAgICAgICAgICAgICAgLy8gZmFsc2UsIGEgZnVuY3Rpb24gaXMgbm8gZGF0YVxyXG4gKiBpc1Bvam8oe2EgOiBbe2IgOiBuZXcgRm9vKCl9XX0pOyAgICAgICAvLyBmYWxzZSwgcmVqZWN0ZWQgYXQgYW55IGRlcHRoXHJcbiAqIGlzUG9qbyhbXSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhbHNlLCB0aGUgb2JqZWN0IGl0c2VsZiBoYXMgdG8gYmUgYSBzaW1wbGUgb25lXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNQb2pvID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChpc051bGxPclVuZGVmaW5lZChvYmplY3QpIHx8ICFpc1BsYWluT2JqZWN0KG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIGlzRGF0YVZhbHVlKG9iamVjdCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQXBwZW5kcyBhIHByb3BlcnR5IHZhbHVlIHRvIGFuIG9iamVjdC4gSWYgdGhlIHByb3BlcnR5IGFscmVhZHkgaG9sZHMgYSB2YWx1ZSwgaXQgaXMgY29udmVydGVkXHJcbiAqIGludG8gYW4gYXJyYXkgY2FycnlpbmcgYm90aC4gQW4gdW5kZWZpbmVkIHZhbHVlIGlzIGlnbm9yZWQuXHJcbiAqXHJcbiAqIFRoZSBrZXkgbWF5IGFkZHJlc3MgYSBuZXN0ZWQgcHJvcGVydHkgYnkgYSBkb3R0ZWQgcGF0aCwgbWlzc2luZyBzdGVwcyBhcmUgY3JlYXRlZCBvbiB0aGUgd2F5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYUtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMgYSBuZXN0ZWQgb25lXHJcbiAqIEBwYXJhbSB7Kn0gYURhdGEgcHJvcGVydHkgdmFsdWVcclxuICogQHBhcmFtIHtvYmplY3R9IGFPYmplY3QgdGhlIG9iamVjdCB0byBhcHBlbmQgdGhlIHByb3BlcnR5IHRvXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSBjaGFuZ2VkIG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBhcHBlbmQoXCJhXCIsIDEsIHt9KTsgICAgICAgICAgICAgLy8ge2EgOiAxfVxyXG4gKiBhcHBlbmQoXCJhXCIsIDIsIHthIDogMX0pOyAgICAgICAgLy8ge2EgOiBbMSwgMl19XHJcbiAqIGFwcGVuZChcImEuYlwiLCAxLCB7fSk7ICAgICAgICAgICAvLyB7YSA6IHtiIDogMX19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYXBwZW5kID0gKGFLZXksIGFEYXRhLCBhT2JqZWN0KSA9PiB7XHJcblx0aWYgKHR5cGVvZiBhRGF0YSAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cdFx0Y29uc3QgcHJvcGVydHkgPSBPYmplY3RQcm9wZXJ0eS5sb2FkKGFPYmplY3QsIGFLZXksIHRydWUpO1xyXG5cdFx0cHJvcGVydHkuYXBwZW5kID0gYURhdGE7XHJcblx0fVxyXG5cdHJldHVybiBhT2JqZWN0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE93biBlbnVtZXJhYmxlIGtleXMsIHN0cmluZ3MgYW5kIHN5bWJvbHMgYWxpa2UgLSB0aGUgc2FtZSBzZXQgT2JqZWN0LmFzc2lnbiBjb3BpZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gc291cmNlXHJcbiAqIEByZXR1cm5zIHtBcnJheTxzdHJpbmd8c3ltYm9sPn1cclxuICovXHJcbmNvbnN0IGFzc2lnbmFibGVLZXlzID0gKHNvdXJjZSkgPT4ge1xyXG5cdGNvbnN0IG9iamVjdCA9IE9iamVjdChzb3VyY2UpO1xyXG5cdHJldHVybiBSZWZsZWN0Lm93bktleXMob2JqZWN0KS5maWx0ZXIoKGtleSkgPT4gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwga2V5KSk7XHJcbn07XHJcblxyXG4vKipcclxuICogTWVyZ2VzIG9iamVjdHMgaW50byBhIHRhcmdldCBvYmplY3QgLSBhIHJlY3Vyc2l2ZSBPYmplY3QuYXNzaWduLiBJdCBzdGVwcyBpbnRvIG9iamVjdHMgYW5kIHN1YlxyXG4gKiBvYmplY3RzLiBFdmVyeSBvdGhlciB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgdmFsdWUgZnJvbSB0aGUgc291cmNlIG9iamVjdC5cclxuICpcclxuICogTGlrZSBPYmplY3QuYXNzaWduIGl0IGNvcGllcyBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIC0gc3RyaW5nIGFuZCBzeW1ib2wga2V5cyBhbGlrZSAtLCBpZ25vcmVzXHJcbiAqIG51bGwgYW5kIHVuZGVmaW5lZCBzb3VyY2VzIGFuZCByZXR1cm5zIHRoZSB0YXJnZXQuIFVubGlrZSBPYmplY3QuYXNzaWduIGl0IHN0ZXBzIGludG8gYSBwcm9wZXJ0eVxyXG4gKiB3aGVuIHRhcmdldCBhbmQgc291cmNlIGJvdGggaG9sZCBhbiBvYmplY3QsIGluc3RlYWQgb2YgcmVwbGFjaW5nIGl0LlxyXG4gKlxyXG4gKiBBIGNsYXNzIGluc3RhbmNlIGNvdW50cyBhcyBhbiBvYmplY3QgaGVyZSBhbmQgaXMgbWVyZ2VkIHByb3BlcnR5IGJ5IHByb3BlcnR5IGp1c3QgbGlrZSBhIHNpbXBsZVxyXG4gKiBvbmUuIFRoZSB0YXJnZXQga2VlcHMgaXRzIG93biBwcm90b3R5cGUsIG9ubHkgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHNvdXJjZSBhcmUgYXBwbGllZCB0byBpdCAtIGFcclxuICogbWVyZ2UgbmV2ZXIgdHVybnMgdGhlIHRhcmdldCBpbnRvIGFuIGluc3RhbmNlIG9mIHRoZSBjbGFzcyBvZiB0aGUgc291cmNlLlxyXG4gKlxyXG4gKiBBbiBBcnJheSwgU2V0LCBNYXAsIERhdGUgb3IgUmVnRXhwIGlzIGFsd2F5cyByZXBsYWNlZCBhcyBhIHdob2xlLCBuZXZlciBtZXJnZWQgZW50cnkgYnkgZW50cnkuXHJcbiAqIFRoYXQgYWxyZWFkeSBhcHBsaWVzIHdoZW4gb25seSBvbmUgb2YgYm90aCBzaWRlcyBob2xkcyBvbmUuIFRoZSByZXN1bHQgdGhlcmVmb3JlIGNhcnJpZXMgdGhlXHJcbiAqIGNvbnRhaW5lciBvZiB0aGUgc291cmNlIHdpdGggaXRzIG93biBsZW5ndGggLSBub3RoaW5nIG9mIHRoZSB0YXJnZXQgc3Vydml2ZXMgaXQsIG5vdCBldmVuIGFuXHJcbiAqIG9iamVjdCBzaXR0aW5nIGF0IHRoZSBzYW1lIGluZGV4IG9yIHVuZGVyIHRoZSBzYW1lIGtleS5cclxuICpcclxuICogQSBrZXkgd2hvc2UgdmFsdWUgaXMgYSBzeW1ib2wgaXMgc2tpcHBlZCwgb24gdGhlIHRhcmdldCBzaWRlIGFzIHdlbGwgYXMgb24gdGhlIHNvdXJjZSBzaWRlLiBBXHJcbiAqIHN5bWJvbCBjYXJyaWVzIG5vIGRhdGEsIHNvIHN1Y2ggYSBwcm9wZXJ0eSBpcyBsZWZ0IHVudG91Y2hlZC5cclxuICpcclxuICogVGhlIGtleSBfX3Byb3RvX18gaXMgc2tpcHBlZC4gT2JqZWN0LmFzc2lnbiB3b3VsZCBvbmx5IHJlcG9pbnQgdGhlIHByb3RvdHlwZSBvZiB0aGUgdGFyZ2V0LCBidXRcclxuICogbWVyZ2luZyBpbnRvIGl0IHdvdWxkIHdhbGsgaW50byBPYmplY3QucHJvdG90eXBlIGFuZCBsZWFrIGludG8gZXZlcnkgb2JqZWN0LlxyXG4gKlxyXG4gKiBUaGUgdGFyZ2V0IGlzIG1vZGlmaWVkIGluIHBsYWNlLiBBIHN1YiBvYmplY3Qgb2YgYSBzb3VyY2UgdGhhdCBoYXMgbm8gY291bnRlcnBhcnQgaW4gdGhlIHRhcmdldCBpc1xyXG4gKiB0YWtlbiBvdmVyIGJ5IHJlZmVyZW5jZSwganVzdCBsaWtlIE9iamVjdC5hc3NpZ24gZG9lcy5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCB0aGUgdGFyZ2V0IG9iamVjdCB0byBtZXJnZSBpbnRvLCBhIG5ldyBvYmplY3Qgd2hlbiBmYWxzeVxyXG4gKiBAcGFyYW0gey4uLm9iamVjdH0gc291cmNlcyB0aGUgc291cmNlIG9iamVjdHMsIGFwcGxpZWQgaW4gb3JkZXJcclxuICogQHJldHVybnMge29iamVjdH0gdGhlIHRhcmdldCBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogbWVyZ2Uoe2EgOiAxfSwge2IgOiAyfSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDEsIGIgOiAyfVxyXG4gKiBtZXJnZSh7YSA6IHt4IDogMX19LCB7YSA6IHt5IDogMn19KTsgICAgICAgICAgICAgIC8vIHthIDoge3ggOiAxLCB5IDogMn19XHJcbiAqIG1lcmdlKHthIDogWzEsIDIsIDNdfSwge2EgOiBbOV19KTsgICAgICAgICAgICAgICAgLy8ge2EgOiBbOV19LCByZXBsYWNlZCBhcyBhIHdob2xlXHJcbiAqIG1lcmdlKHthIDogbmV3IEZvbygxKX0sIHthIDogbmV3IEJhcigyKX0pOyAgICAgICAgLy8gYSBzdGF5cyBhIEZvbywgY2FycnlpbmcgdGhlIHByb3BlcnRpZXMgb2YgYm90aFxyXG4gKiBtZXJnZSh7fSwgc291cmNlMSwgc291cmNlMiwgc291cmNlMyk7XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWVyZ2UgPSAodGFyZ2V0LCAuLi5zb3VyY2VzKSA9PiB7XHJcblx0aWYgKCF0YXJnZXQpIHRhcmdldCA9IHt9O1xyXG5cclxuXHRzb3VyY2VzXHJcblx0XHQuZmlsdGVyKChzb3VyY2UpID0+ICFpc051bGxPclVuZGVmaW5lZChzb3VyY2UpKVxyXG5cdFx0LmZvckVhY2goKHNvdXJjZSkgPT4ge1xyXG5cdFx0XHRjb25zdCBrZXlzID0gYXNzaWduYWJsZUtleXMoc291cmNlKTtcclxuXHRcdFx0a2V5c1xyXG5cdFx0XHRcdC5maWx0ZXIoKGtleSkgPT4ga2V5ICE9IFwiX19wcm90b19fXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2YgdGFyZ2V0W2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiB0eXBlb2Ygc291cmNlW2tleV0gIT09IFwic3ltYm9sXCIpXHJcblx0XHRcdFx0LmZvckVhY2goKGtleSkgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBzb3VyY2Vba2V5XTtcclxuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnQgPSB0YXJnZXRba2V5XTtcclxuXHJcblx0XHRcdFx0XHRpZihjdXJyZW50ID09IG51bGwgKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiggdHlwZW9mIGN1cnJlbnQgIT09IHR5cGVvZiB2YWx1ZSApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgQXJyYXkgfHwgdmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBTZXQgfHwgdmFsdWUgaW5zdGFuY2VvZiBTZXQpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgTWFwIHx8IHZhbHVlIGluc3RhbmNlb2YgTWFwKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIERhdGUgfHwgdmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFJlZ0V4cCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGlzT2JqZWN0KGN1cnJlbnQpICYmIGlzT2JqZWN0KHZhbHVlKSkgbWVyZ2UoY3VycmVudCwgdmFsdWUpO1xyXG5cdFx0XHRcdFx0ZWxzZSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdHJldHVybiB0YXJnZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVjaWRlcyB3aGV0aGVyIGEgc2luZ2xlIHByb3BlcnR5IGlzIHRha2VuIG92ZXIgYnkge0BsaW5rIGZpbHRlcn0uXHJcbiAqXHJcbiAqIEBjYWxsYmFjayBQcm9wZXJ0eUZpbHRlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0aGUgb2JqZWN0IHRoZSBwcm9wZXJ0eSBiZWxvbmdzIHRvXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIHRvIGtlZXAgdGhlIHByb3BlcnR5XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIHtAbGluayBQcm9wZXJ0eUZpbHRlcn0gYWNjZXB0aW5nIG9yIHJlamVjdGluZyBhIGZpeGVkIGxpc3Qgb2YgcHJvcGVydHkgbmFtZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gb3B0aW9ucy5uYW1lcyB0aGUgcHJvcGVydHkgbmFtZXMgdG8gZGVjaWRlIG9uXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5hbGxvd2VkIHRydWUgdHVybnMgdGhlIGxpc3QgaW50byBhbiBhbGxvdyBsaXN0LCBmYWxzZSBpbnRvIGEgZGVueSBsaXN0XHJcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eUZpbHRlcn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZGVueSA9IGJ1aWxkUHJvcGVydHlGaWx0ZXIoe25hbWVzIDogW1wicGFzc3dvcmRcIl0sIGFsbG93ZWQgOiBmYWxzZX0pO1xyXG4gKiBmaWx0ZXIodXNlciwgZGVueSk7ICAgLy8gZXZlcnkgcHJvcGVydHkgYnV0IHBhc3N3b3JkXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgYnVpbGRQcm9wZXJ0eUZpbHRlciA9ICh7IG5hbWVzLCBhbGxvd2VkIH0pID0+IHtcclxuXHRyZXR1cm4gKG5hbWUsIHZhbHVlLCBjb250ZXh0KSA9PiB7XHJcblx0XHRyZXR1cm4gbmFtZXMuaW5jbHVkZXMobmFtZSkgPT09IGFsbG93ZWQ7XHJcblx0fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWJ1aWxkcyBhbiBBcnJheSwgU2V0IG9yIE1hcCB3aXRoIGl0cyB2YWx1ZXMgZmlsdGVyZWQuIEEgY29udGFpbmVyIGtlZXBzIGFsbCBvZiBpdHMgZW50cmllcyAtXHJcbiAqIG9ubHkgdGhlIHZhbHVlcyBpbnNpZGUgZ2V0IGZpbHRlcmVkLiBUaGUga2V5cyBvZiBhIE1hcCBzdGF5IHVudG91Y2hlZCwgcmVwbGFjaW5nIHRoZW0gd291bGQgYnJlYWtcclxuICogZXZlcnkgbG9va3VwIGFnYWluc3QgdGhlIHJlc3VsdC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtBcnJheXxTZXR8TWFwfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVlcFxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IGNvcGllcyBtYXBzIGFuIG9yaWdpbmFsIG9udG8gaXRzIGZpbHRlcmVkIGNvcHlcclxuICogQHJldHVybnMge0FycmF5fFNldHxNYXB9XHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJDb250YWluZXIgPSAodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblx0XHRjb25zdCBjb3B5ID0gW107XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkucHVzaChmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdFx0cmV0dXJuIGNvcHk7XHJcblx0fVxyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBTZXQpIHtcclxuXHRcdGNvbnN0IGNvcHkgPSBuZXcgU2V0KCk7XHJcblx0XHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgdmFsdWUpIGNvcHkuYWRkKGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0XHRyZXR1cm4gY29weTtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGNvcHkgPSBuZXcgTWFwKCk7XHJcblx0Y29waWVzLnNldCh2YWx1ZSwgY29weSk7XHJcblx0Zm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdmFsdWUpIGNvcHkuc2V0KGtleSwgZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRyZXR1cm4gY29weTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXJzIGEgc2luZ2xlIHZhbHVlLCBkaXNwYXRjaGluZyBvbiB3aGF0IGl0IGlzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7Kn0gdGhlIGZpbHRlcmVkIHZhbHVlLCBvciB0aGUgdmFsdWUgaXRzZWxmIHdoZW4gdGhlcmUgaXMgbm90aGluZyB0byBmaWx0ZXJcclxuICovXHJcbmNvbnN0IGZpbHRlclZhbHVlID0gKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpID0+IHtcclxuXHRpZiAodmFsdWUgPT09IG51bGwgfHwgdHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiKSByZXR1cm4gdmFsdWU7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHZhbHVlOyAvLyBjYXJyeSBubyBwcm9wZXJ0aWVzIHRvIGZpbHRlclxyXG5cclxuXHQvLyBhIHZhbHVlIHNlZW4gYmVmb3JlIGNsb3NlcyBhIGN5Y2xlIC0gaXRzIGNvcHkgc3RhbmRzIGluLCBzbyBub3RoaW5nIHVuZmlsdGVyZWQgbGVha3MgYmFjayBpblxyXG5cdGlmIChjb3BpZXMuaGFzKHZhbHVlKSkgcmV0dXJuIGNvcGllcy5nZXQodmFsdWUpO1xyXG5cclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGZpbHRlckNvbnRhaW5lcih2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxuXHJcblx0cmV0dXJuIGZpbHRlck9iamVjdCh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgdGhlIGZpbHRlcmVkIGNvcHkgb2YgYW4gb2JqZWN0LiBUaGUgY29weSBpcyByZWdpc3RlcmVkIGJlZm9yZSBpdCBpcyBmaWxsZWQsIHNvIGEgY3ljbGVcclxuICogcnVubmluZyBiYWNrIGludG8gaXQgcmVzb2x2ZXMgdG8gdGhlIGNvcHkgaW5zdGVhZCBvZiB0aGUgb3JpZ2luYWwuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxyXG4gKi9cclxuY29uc3QgZmlsdGVyT2JqZWN0ID0gKGRhdGEsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cdGNvcGllcy5zZXQoZGF0YSwgcmVzdWx0KTtcclxuXHJcblx0Zm9yIChjb25zdCBuYW1lIGluIGRhdGEpIHtcclxuXHRcdGNvbnN0IHZhbHVlID0gZGF0YVtuYW1lXTtcclxuXHRcdGlmIChwcm9wRmlsdGVyKG5hbWUsIHZhbHVlLCBkYXRhKSl7XHJcblx0XHRcdHJlc3VsdFtuYW1lXSA9IGRlZXAgPyBmaWx0ZXJWYWx1ZSh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA6IHZhbHVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSBuZXcgb2JqZWN0IGhvbGRpbmcgdGhlIHByb3BlcnRpZXMgYSBmaWx0ZXIgYWNjZXB0cy5cclxuICpcclxuICogVGhlIGZpbHRlciBpcyBjYWxsZWQgZm9yIGV2ZXJ5IGVudW1lcmFibGUgcHJvcGVydHksIGluaGVyaXRlZCBvbmVzIGluY2x1ZGVkIC0gZmlsdGVyaW5nIGEgd2luZG93XHJcbiAqIHJlbGllcyBvbiB0aGF0LCBzaW5jZSBtb3N0IG9mIGl0cyBtZW1iZXJzIHNpdCBvbiB0aGUgcHJvdG90eXBlLlxyXG4gKlxyXG4gKiBXaXRoIGRlZXAgdGhlIGZpbHRlciBpcyBhcHBsaWVkIHRvIHN1YiBvYmplY3RzIGFzIHdlbGwuIEFycmF5LCBTZXQgYW5kIE1hcCBhcmUgcmVidWlsdCB3aXRoIHRoZWlyXHJcbiAqIHZhbHVlcyBmaWx0ZXJlZCwga2VlcGluZyBhbGwgb2YgdGhlaXIgZW50cmllcyBhbmQsIGZvciBhIE1hcCwgaXRzIGtleXMuIERhdGUgYW5kIFJlZ0V4cCBhcmUgdGFrZW5cclxuICogb3ZlciBhcyB0aGV5IGFyZS4gQSBjeWNsaWMgcmVmZXJlbmNlIHJlc29sdmVzIHRvIHRoZSBmaWx0ZXJlZCBjb3B5LCBzbyB0aGUgcmVzdWx0IG5ldmVyIGNhcnJpZXMgYVxyXG4gKiByZWZlcmVuY2UgaW50byB0aGUgdW50b3VjaGVkIG9yaWdpbmFsLlxyXG4gKlxyXG4gKiBXaXRob3V0IGRlZXAgdGhlIGFjY2VwdGVkIHZhbHVlcyBhcmUgdGFrZW4gb3ZlciBhcyB0aGV5IGFyZSwgc3ViIG9iamVjdHMgYnkgcmVmZXJlbmNlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0aGUgb2JqZWN0IHRvIGJlIGZpbHRlcmVkXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXIgZGVjaWRlcyBwZXIgcHJvcGVydHksIHNlZSB7QGxpbmsgYnVpbGRQcm9wZXJ0eUZpbHRlcn1cclxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXA9ZmFsc2VdIGZpbHRlciBzdWIgb2JqZWN0cyB0b29cclxuICogQHJldHVybnMge29iamVjdH0gYSBuZXcgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGRlbnkgPSBidWlsZFByb3BlcnR5RmlsdGVyKHtuYW1lcyA6IFtcInNlY3JldFwiXSwgYWxsb3dlZCA6IGZhbHNlfSk7XHJcbiAqXHJcbiAqIGZpbHRlcih7c2VjcmV0IDogXCJ4XCIsIGEgOiAxfSwgZGVueSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB7YSA6IDF9XHJcbiAqIGZpbHRlcih7c3ViIDoge3NlY3JldCA6IFwieFwiLCBhIDogMX19LCBkZW55LCB7ZGVlcCA6IHRydWV9KTsgICAgICAvLyB7c3ViIDoge2EgOiAxfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBmaWx0ZXIgPSAoZGF0YSwgcHJvcEZpbHRlciwgeyBkZWVwID0gZmFsc2UgfSA9IHt9KSA9PiBmaWx0ZXJPYmplY3QoZGF0YSwgcHJvcEZpbHRlciwgZGVlcCwgbmV3IFdlYWtNYXAoKSk7XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIGNvbnN0YW50LCBub24gZW51bWVyYWJsZSBwcm9wZXJ0eS5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdGhlIHZhbHVlLCBuZWl0aGVyIHdyaXRhYmxlIG5vciBjb25maWd1cmFibGVcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmVmFsdWUgPSAobywgbmFtZSwgdmFsdWUpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0dmFsdWUsXHJcblx0XHR3cml0YWJsZTogZmFsc2UsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIHJlYWQgb25seSwgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZHZXQgPSAobywgbmFtZSwgZ2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgbm9uIGVudW1lcmFibGUgcHJvcGVydHkgYmFja2VkIGJ5IGEgZ2V0dGVyIGFuZCBhIHNldHRlci5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gc2V0IHRha2VzIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZkdldFNldCA9IChvLCBuYW1lLCBnZXQsIHNldCkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHRnZXQsXHJcblx0XHRzZXQsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0aXNOdWxsT3JVbmRlZmluZWQsXHJcblx0aXNPYmplY3QsXHJcblx0aXNQcmltaXRpdmUsXHJcblx0ZXF1YWxQb2pvLFxyXG5cdGlzUG9qbyxcclxuXHRhcHBlbmQsXHJcblx0bWVyZ2UsXHJcblx0ZmlsdGVyLFxyXG5cdGJ1aWxkUHJvcGVydHlGaWx0ZXIsXHJcblx0ZGVmVmFsdWUsXHJcblx0ZGVmR2V0LFxyXG5cdGRlZkdldFNldCxcclxufTtcclxuIiwiLyoqXG4gKiBQcml2YXRlIHN0YXRlIGZvciBhbiBvYmplY3QsIGhlbGQgb3V0c2lkZSBvZiBpdC5cbiAqXG4gKiBUaGUgdmFsdWVzIGxpdmUgaW4gYSBXZWFrTWFwIGtleWVkIGJ5IHRoZSBvYmplY3QsIHNvIG5vdGhpbmcgaXMgYWRkZWQgdG8gdGhlIG9iamVjdCBpdHNlbGYgYW5kXG4gKiBub3RoaW5nIHNob3dzIHVwIGluIE9iamVjdC5rZXlzIG9yIEpTT04uIE9uY2UgdGhlIG9iamVjdCBpcyBnb25lIGl0cyBzdGF0ZSBpcyBjb2xsZWN0YWJsZSB0b28uXG4gKlxuICogQG1vZHVsZSBQcml2YXRlUHJvcGVydHlcbiAqL1xuY29uc3QgUFJJVkFURV9QUk9QRVJUSUVTID0gbmV3IFdlYWtNYXAoKTtcblxuLyoqXG4gKiBUaGUgc3RvcmUgYmVsb25naW5nIHRvIGFuIG9iamVjdC4gQ3JlYXRlZCBvbiB0aGUgZmlyc3QgY2FsbCwgdGhlIHNhbWUgb25lIGZyb20gdGhlbiBvbi5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgc3RvcmUsIHdyaXRhYmxlIGRpcmVjdGx5XG4gKi9cbmV4cG9ydCBjb25zdCBwcml2YXRlU3RvcmUgPSAob2JqKSA9PiB7XG5cdGlmKFBSSVZBVEVfUFJPUEVSVElFUy5oYXMob2JqKSlcblx0XHRyZXR1cm4gUFJJVkFURV9QUk9QRVJUSUVTLmdldChvYmopO1xuXG5cdGNvbnN0IGRhdGEgPSB7fTtcblx0UFJJVkFURV9QUk9QRVJUSUVTLnNldChvYmosIGRhdGEpO1xuXHRyZXR1cm4gZGF0YTtcbn07XG5cbi8qKlxuICogUmVhZHMgb3Igd3JpdGVzIHByaXZhdGUgc3RhdGUsIGRlcGVuZGluZyBvbiBob3cgbWFueSBhcmd1bWVudHMgaXQgaXMgY2FsbGVkIHdpdGguXG4gKlxuICogUGFzc2luZyB1bmRlZmluZWQgYXMgdGhlIHZhbHVlIHN0aWxsIGNvdW50cyBhcyBhIHdyaXRlIC0gd2hhdCBkZWNpZGVzIGlzIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzLFxuICogbm90IHRoZWlyIGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9iaiB0aGUgb2JqZWN0IHRoZSBzdGF0ZSBiZWxvbmdzIHRvXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWVdIG5hbWUgb2YgdGhlIHByb3BlcnR5XG4gKiBAcGFyYW0geyp9IFt2YWx1ZV0gdGhlIHZhbHVlIHRvIHdyaXRlXG4gKiBAcmV0dXJucyB7Kn0gdGhlIHdob2xlIHN0b3JlIHdpdGggb25lIGFyZ3VtZW50LCB0aGUgdmFsdWUgd2l0aCB0d28sIG5vdGhpbmcgd2l0aCB0aHJlZVxuICogQHRocm93cyB7RXJyb3J9IHdoZW4gY2FsbGVkIHdpdGggbW9yZSB0aGFuIHRocmVlIGFyZ3VtZW50c1xuICpcbiAqIEBleGFtcGxlXG4gKiBwcml2YXRlUHJvcGVydHkoaW5zdGFuY2UsIFwiY291bnRcIiwgMSk7ICAgLy8gd3JpdGVcbiAqIHByaXZhdGVQcm9wZXJ0eShpbnN0YW5jZSwgXCJjb3VudFwiKTsgICAgICAvLyAxXG4gKiBwcml2YXRlUHJvcGVydHkoaW5zdGFuY2UpOyAgICAgICAgICAgICAgIC8vIHtjb3VudCA6IDF9XG4gKi9cbmV4cG9ydCBjb25zdCBwcml2YXRlUHJvcGVydHkgPSBmdW5jdGlvbihvYmosIG5hbWUsIHZhbHVlKSB7XG5cdGNvbnN0IGRhdGEgPSBwcml2YXRlU3RvcmUob2JqKTtcblx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSlcblx0XHRyZXR1cm4gZGF0YTtcblx0ZWxzZSBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKVxuXHRcdHJldHVybiBkYXRhW25hbWVdO1xuXHRlbHNlIGlmKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpXG5cdFx0ZGF0YVtuYW1lXSA9IHZhbHVlO1xuXHRlbHNlXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGFsbG93ZWQgc2l6ZSBvZiBhcmd1bWVudHMhXCIpO1xufTtcblxuLyoqXG4gKiBCdWlsZHMgYSBmdW5jdGlvbiByZWFkaW5nIGFuZCB3cml0aW5nIG9uZSBmaXhlZCBwcm9wZXJ0eSwgc28gdGhlIG5hbWUgaXMgd3JpdHRlbiBvbmNlIGluc3RlYWQgb2ZcbiAqIGF0IGV2ZXJ5IGNhbGwuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhcm5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gY2FsbGVkIHdpdGggKHNlbGYpIGl0IHJlYWRzLCBjYWxsZWQgd2l0aCAoc2VsZiwgdmFsdWUpIGl0IHdyaXRlc1xuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBjb3VudCA9IHByaXZhdGVQcm9wZXJ0eUFjY2Vzc29yKFwiY291bnRcIik7XG4gKiBjb3VudChpbnN0YW5jZSwgMSk7ICAgLy8gd3JpdGVcbiAqIGNvdW50KGluc3RhbmNlKTsgICAgICAvLyAxXG4gKi9cbmV4cG9ydCBjb25zdCBwcml2YXRlUHJvcGVydHlBY2Nlc3NvciA9ICh2YXJuYW1lKSA9PiB7XG5cdHJldHVybiBmdW5jdGlvbihzZWxmLCB2YWx1ZSl7XG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAyKVxuXHRcdFx0cHJpdmF0ZVByb3BlcnR5KHNlbGYsIHZhcm5hbWUsIHZhbHVlKTtcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gcHJpdmF0ZVByb3BlcnR5KHNlbGYsIHZhcm5hbWUpO1xuXHR9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQge3ByaXZhdGVQcm9wZXJ0eSwgcHJpdmF0ZVByb3BlcnR5QWNjZXNzb3IsIHByaXZhdGVTdG9yZX07XG4iLCIvKipcbiAqIFR3byB3YXlzIG9mIGJ1aWxkaW5nIGEgcHJvbWlzZSB0aGF0IHNvbWV0aGluZyBvdXRzaWRlIG9mIGl0IHNldHRsZXMuXG4gKlxuICoge0BsaW5rIHRpbWVvdXRQcm9taXNlfSBydW5zIGEgZnVuY3Rpb24gb25jZSBhIHRpbWVvdXQgaGFzIHBhc3NlZCBhbmQgbGV0cyB0aGUgd2hvbGUgY2hhaW4gYmVoaW5kXG4gKiBpdCBiZSBjYW5jZWxlZC4ge0BsaW5rIGxhenlQcm9taXNlfSBoYW5kcyBvdXQgYSBwcm9taXNlIHRvZ2V0aGVyIHdpdGggaXRzIHJlc29sdmUgYW5kIHJlamVjdCwgZm9yXG4gKiB0aGUgY2FzZXMgd2hlcmUgdGhlIHNldHRsaW5nIGlzIGRyaXZlbiBmcm9tIHNvbWV3aGVyZSBlbHNlIC0gYSBmcmFtZXdvcmsgY2FsbGJhY2ssIGFuIGV2ZW50LFxuICogZm9yZWlnbiBjb2RlIC0gYW5kIHBhY2tpbmcgYWxsIG9mIHRoYXQgaW50byB0aGUgZXhlY3V0b3Igd291bGQgb25seSBibG93IHRoZSBjb2RlIHVwIG9yIGlzIG5vdFxuICogcG9zc2libGUgYXQgYWxsLlxuICpcbiAqIFRoZSB0d28gY2FycnkgZGlmZmVyZW50IHN0YXRlIG9uIHB1cnBvc2U6IGEgdGltZW91dFByb21pc2UgcmVwb3J0cyBpdHMgY2FuY2VsbGF0aW9uIHRocm91Z2ggYVxuICogcmVqZWN0aW9uIGFuZCBhbiBBYm9ydFNpZ25hbCwgYSBsYXp5UHJvbWlzZSByZXBvcnRzIGl0cyBvdXRjb21lIHRocm91Z2ggcmVzb2x2ZWQsIGVycm9yIGFuZCB2YWx1ZS5cbiAqXG4gKiBAbW9kdWxlIFByb21pc2VVdGlsc1xuICovXG5pbXBvcnQgeyBkZWZWYWx1ZSwgZGVmR2V0IH0gZnJvbSBcIi4vT2JqZWN0VXRpbHMuanNcIjtcblxuLyoqXG4gKiBUaGUgcmVhc29uIGFuIGFib3J0ZWQgb3BlcmF0aW9uIHJlamVjdHMgd2l0aC4gQSBET01FeGNlcHRpb24gbmFtZWQgQWJvcnRFcnJvciBpcyB3aGF0XG4gKiBBYm9ydENvbnRyb2xsZXIgaXRzZWxmIHVzZXMsIGFuIEVycm9yIGNhcnJ5aW5nIHRoZSBzYW1lIG5hbWUgc3RhbmRzIGluIHdoZXJlIGl0IGlzIG1pc3NpbmcuXG4gKlxuICogQHByaXZhdGVcbiAqIEByZXR1cm5zIHtFcnJvcnxET01FeGNlcHRpb259XG4gKi9cbmNvbnN0IGFib3J0RXJyb3IgPSAoKSA9PiB7XG5cdGlmICh0eXBlb2YgRE9NRXhjZXB0aW9uICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gbmV3IERPTUV4Y2VwdGlvbihcIlRoZSBvcGVyYXRpb24gd2FzIGFib3J0ZWQuXCIsIFwiQWJvcnRFcnJvclwiKTtcblxuXHQvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAtIGV2ZXJ5IGJyb3dzZXIgdGhlIHN1aXRlIHJ1bnMgaW4gYnJpbmdzIERPTUV4Y2VwdGlvbiwgc28gdGhpcyBsaW5lIG9ubHlcblx0ICAgc3RhbmRzIGluIGZvciBlbnZpcm9ubWVudHMgdGhlIHRlc3QgcnVuIGNhbm5vdCByZWFjaCAqL1xuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoXCJUaGUgb3BlcmF0aW9uIHdhcyBhYm9ydGVkLlwiKSwgeyBuYW1lOiBcIkFib3J0RXJyb3JcIiB9KTtcbn07XG5cbi8qKlxuICogVGhlIHJlYXNvbiBhIHNpZ25hbCBjYXJyaWVzLiBhYm9ydCgpIGZpbGxzIGl0IGluIG9uIGl0cyBvd24sIG9sZGVyIGltcGxlbWVudGF0aW9ucyBrbm93IHRoZVxuICogbWV0aG9kIGJ1dCBub3QgdGhlIHByb3BlcnR5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Fib3J0U2lnbmFsfSBzaWduYWxcbiAqIEByZXR1cm5zIHsqfVxuICovXG5jb25zdCBhYm9ydFJlYXNvbiA9IChzaWduYWwpID0+ICh0eXBlb2Ygc2lnbmFsLnJlYXNvbiA9PT0gXCJ1bmRlZmluZWRcIiA/IGFib3J0RXJyb3IoKSA6IHNpZ25hbC5yZWFzb24pO1xuXG4vKipcbiAqIEFkZHMgdGhlIGNhbmNlbCBhcGkgdG8gYSBwcm9taXNlIGFuZCB0byBldmVyeSBwcm9taXNlIGRlcml2ZWQgZnJvbSBpdC4gQWxsIG9mIHRoZW0gc2hhcmUgb25lXG4gKiBjb250cm9sbGVyLCBzbyBhIGNoYWluIGNhbiBiZSBjYW5jZWxlZCBmcm9tIGFueSBvZiBpdHMgbGlua3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7UHJvbWlzZX0gcHJvbWlzZVxuICogQHBhcmFtIHtBYm9ydENvbnRyb2xsZXJ9IGNvbnRyb2xsZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbmNlbFxuICogQHJldHVybnMge1Byb21pc2V9IHRoZSBwcm9taXNlIGl0c2VsZlxuICovXG5jb25zdCBjYW5jZWxhYmxlID0gKHByb21pc2UsIGNvbnRyb2xsZXIsIGNhbmNlbCkgPT4ge1xuXHRkZWZWYWx1ZShwcm9taXNlLCBcImNhbmNlbFwiLCBjYW5jZWwpO1xuXHRkZWZHZXQocHJvbWlzZSwgXCJzaWduYWxcIiwgKCkgPT4gY29udHJvbGxlci5zaWduYWwpO1xuXHRkZWZHZXQocHJvbWlzZSwgXCJjYW5jZWxlZFwiLCAoKSA9PiBjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKTtcblxuXHQvLyB0aGVuIGhhcyB0byBoYW5kIGJvdGggaGFuZGxlcnMgdGhyb3VnaCBhbmQgcmV0dXJuIHRoZSBkZXJpdmVkIHByb21pc2UgLSBjYXRjaCwgZmluYWxseSBhbmRcblx0Ly8gYXdhaXQgYXJlIGRlZmluZWQgaW4gdGVybXMgb2YgdGhlbiwgc28gYW55dGhpbmcgbGVzcyBzaWxlbnRseSBicmVha3MgdGhvc2UgYXMgd2VsbFxuXHRjb25zdCB0aGVuID0gcHJvbWlzZS50aGVuO1xuXHRkZWZWYWx1ZShwcm9taXNlLCBcInRoZW5cIiwgKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSA9PiBjYW5jZWxhYmxlKHRoZW4uY2FsbChwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCksIGNvbnRyb2xsZXIsIGNhbmNlbCkpO1xuXG5cdHJldHVybiBwcm9taXNlO1xufTtcblxuLyoqXG4gKiBDYWxscyBhIGZ1bmN0aW9uIGFmdGVyIGEgdGltZW91dCBhbmQgc2V0dGxlcyB3aXRoIHdoYXRldmVyIGl0IHByb2R1Y2VzLlxuICpcbiAqIFRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCByZXNvbHZlLCByZWplY3QgYW5kIHRoZSBBYm9ydFNpZ25hbCBvZiB0aGUgcHJvbWlzZSwgc28gd29yayBzdGFydGVkXG4gKiBpbnNpZGUgaXQgY2FuIGJlIGFib3J0ZWQgYWxvbmcgd2l0aCBpdC4gQW4gZXhjZXB0aW9uIHRocm93biBieSB0aGUgZnVuY3Rpb24gcmVqZWN0cyB0aGUgcHJvbWlzZVxuICogaW5zdGVhZCBvZiBlc2NhcGluZyBpbnRvIHRoZSB0aW1lci5cbiAqXG4gKiBUaGUgcHJvbWlzZSBicmluZ3MgaXRzIG93biBBYm9ydENvbnRyb2xsZXIuIGNhbmNlbCgpIGNsZWFycyBhIHBlbmRpbmcgdGltZW91dCBhbmQgcmVqZWN0cyB3aXRoIGFuXG4gKiBBYm9ydEVycm9yLCB3aGljaCB0cmF2ZWxzIGRvd24gdGhlIHdob2xlIGNoYWluIC0gbm8gdGhlbiBoYW5kbGVyIGJlaGluZCBpdCBydW5zLiBjYW5jZWwoKSBzaXRzIG9uXG4gKiBldmVyeSBwcm9taXNlIGRlcml2ZWQgZnJvbSBpdCBhbmQgZG9lcyBub3RoaW5nIG9uY2UgdGhlIHByb21pc2UgaGFzIHNldHRsZWQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gY2FsbGVkIHdpdGggKHJlc29sdmUsIHJlamVjdCwgc2lnbmFsKSBvbmNlIHRoZSB0aW1lb3V0IGhhcyBwYXNzZWRcbiAqIEBwYXJhbSB7bnVtYmVyfSBtcyB0aGUgdGltZW91dCBpbiBtaWxsaXNlY29uZHNcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBhIHByb21pc2UgY2FycnlpbmcgY2FuY2VsKCksIHNpZ25hbCBhbmQgY2FuY2VsZWRcbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcHJvbWlzZSA9IHRpbWVvdXRQcm9taXNlKChyZXNvbHZlKSA9PiByZXNvbHZlKFwiZG9uZVwiKSwgMTAwMCk7XG4gKiBhd2FpdCBwcm9taXNlOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcImRvbmVcIlxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBwcm9taXNlID0gdGltZW91dFByb21pc2UoKHJlc29sdmUpID0+IHJlc29sdmUoXCJkb25lXCIpLCAxMDAwKTtcbiAqIHByb21pc2UudGhlbigoKSA9PiBjb25zb2xlLmxvZyhcIm5ldmVyIHJ1bnNcIikpO1xuICogcHJvbWlzZS5jYW5jZWwoKTtcbiAqIGF3YWl0IHByb21pc2U7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRocm93cyBBYm9ydEVycm9yXG4gKi9cbmV4cG9ydCBjb25zdCB0aW1lb3V0UHJvbWlzZSA9IChmbiwgbXMpID0+IHtcblx0Y29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcblx0Y29uc3Qgc2lnbmFsID0gY29udHJvbGxlci5zaWduYWw7XG5cdGxldCB0aW1lb3V0ID0gbnVsbDtcblx0bGV0IHNldHRsZWQgPSBmYWxzZTtcblxuXHRjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdC8vIHRoZSB0aW1lb3V0IGlzIGNsZWFyZWQgb24gZXZlcnkgd2F5IG91dCwgYSBjYW5jZWxlZCBwcm9taXNlIG11c3Qgbm90IGtlZXAgdGhlIHRpbWVyIGFsaXZlXG5cdFx0Y29uc3Qgc2V0dGxlID0gKGhhbmRsZXIpID0+ICh2YWx1ZSkgPT4ge1xuXHRcdFx0aWYgKHNldHRsZWQpIHJldHVybjtcblxuXHRcdFx0c2V0dGxlZCA9IHRydWU7XG5cdFx0XHRpZiAodGltZW91dCAhPT0gbnVsbCkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0aGFuZGxlcih2YWx1ZSk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uUmVzb2x2ZSA9IHNldHRsZShyZXNvbHZlKTtcblx0XHRjb25zdCBvblJlamVjdCA9IHNldHRsZShyZWplY3QpO1xuXG5cdFx0c2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiBvblJlamVjdChhYm9ydFJlYXNvbihzaWduYWwpKSwgeyBvbmNlOiB0cnVlIH0pO1xuXG5cdFx0dGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGltZW91dCA9IG51bGw7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRmbihvblJlc29sdmUsIG9uUmVqZWN0LCBzaWduYWwpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0b25SZWplY3QoZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0sIG1zKTtcblx0fSk7XG5cblx0cmV0dXJuIGNhbmNlbGFibGUocHJvbWlzZSwgY29udHJvbGxlciwgKHJlYXNvbikgPT4ge1xuXHRcdGlmIChzZXR0bGVkIHx8IHNpZ25hbC5hYm9ydGVkKSByZXR1cm47XG5cblx0XHRjb250cm9sbGVyLmFib3J0KHR5cGVvZiByZWFzb24gPT09IFwidW5kZWZpbmVkXCIgPyBhYm9ydEVycm9yKCkgOiByZWFzb24pO1xuXHR9KTtcbn07XG5cbi8qKlxuICogQnVpbGRzIGEgcHJvbWlzZSB0b2dldGhlciB3aXRoIHRoZSB0d28gZnVuY3Rpb25zIHNldHRsaW5nIGl0LlxuICpcbiAqIFRoZSBwb2ludCBpcyB0byBoYXZlIHRoZSBwcm9taXNlIGFuZCBpdHMgcmVzb2x2ZSBhbmQgcmVqZWN0IGFwYXJ0IGZyb20gZWFjaCBvdGhlcjogd2hhdGV2ZXJcbiAqIHNldHRsZXMgaXQgZG9lcyBub3QgaGF2ZSB0byBzaXQgaW5zaWRlIHRoZSBleGVjdXRvci4gVGhhdCBrZWVwcyBhIHByb21pc2UgdXNhYmxlIHdoZXJlIHRoZVxuICogc2V0dGxpbmcgaXMgZHJpdmVuIGJ5IGEgZnJhbWV3b3JrIGNhbGxiYWNrLCBhbiBldmVudCBvciBhbnkgb3RoZXIgZm9yZWlnbiBjb2RlIHRoZSBleGVjdXRvciBoYXMgbm9cbiAqIHdheSBvZiByZWFjaGluZy5cbiAqXG4gKiBUaGUgcHJvbWlzZSBjYXJyaWVzIHRocmVlIHJlYWQgb25seSBwcm9wZXJ0aWVzOlxuICpcbiAqIC0gcmVzb2x2ZWQgc2F5cyB0aGUgcHJvbWlzZSBoYXMgYmVlbiBzZXR0bGVkLiBJdCBzYXlzIG5vdGhpbmcgYWJvdXQgdGhlIG91dGNvbWUgLSBpdCBpcyB0cnVlIGZvciBhXG4gKiAgIGZhaWx1cmUganVzdCBhcyB3ZWxsLlxuICogLSBlcnJvciB0ZWxscyB0aGUgdHdvIGFwYXJ0LlxuICogLSB2YWx1ZSBob2xkcyB3aGF0ZXZlciB0aGUgcHJvbWlzZSB3YXMgc2V0dGxlZCB3aXRoOiB0aGUgcmVzdWx0IGFmdGVyIGEgcmVzb2x2ZSwgdGhlIHJlYXNvbiBhZnRlclxuICogICBhIHJlamVjdC4gZXJyb3IgaXMgd2hhdCBkZWNpZGVzIGhvdyB0byByZWFkIGl0LlxuICpcbiAqIEFuIEVycm9yIGFsd2F5cyBsZWFkcyB0byBhIHJlamVjdGlvbiwgaW4gYm90aCBkaXJlY3Rpb25zIC0gaGFuZGluZyBvbmUgdG8gcmVzb2x2ZSByZWplY3RzIHRoZVxuICogcHJvbWlzZSBqdXN0IGxpa2UgcmVqZWN0IHdvdWxkLiBBIHJlYXNvbiB0aGF0IGlzIG5vIEVycm9yIGlzIHdyYXBwZWQgaW50byBvbmUsIGFuZCBhIHJlamVjdFxuICogd2l0aG91dCBhIHJlYXNvbiBnZXRzIGFuIEVycm9yIG9mIGl0cyBvd24sIHNvIHRoZXJlIGlzIGFsd2F5cyBhIG1lc3NhZ2UgdG8gcmVhZC5cbiAqXG4gKiBCb3RoIGZ1bmN0aW9ucyBzZXR0bGUgdGhlIHByb21pc2Ugb25jZS4gQSBzZWNvbmQgY2FsbCB0aHJvd3MgaW5zdGVhZCBvZiBzZXR0bGluZyBhZ2Fpbiwgc28gdGhlXG4gKiB0aHJlZSBwcm9wZXJ0aWVzIGNhbiBuZXZlciBlbmQgdXAgZGlzYWdyZWVpbmcgd2l0aCB0aGUgcHJvbWlzZS5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBwcm9taXNlIGNhcnJ5aW5nIHJlc29sdmUoKSwgcmVqZWN0KCksIHZhbHVlLCBlcnJvciBhbmQgcmVzb2x2ZWRcbiAqIEB0aHJvd3Mge0Vycm9yfSBmcm9tIHJlc29sdmUgb3IgcmVqZWN0IHdoZW4gdGhlIHByb21pc2UgaGFzIGFscmVhZHkgYmVlbiBzZXR0bGVkXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IHByb21pc2UgPSBsYXp5UHJvbWlzZSgpO1xuICogZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiBwcm9taXNlLnJlc29sdmUoZWxlbWVudCksIHtvbmNlIDogdHJ1ZX0pO1xuICogYXdhaXQgcHJvbWlzZTtcbiAqXG4gKiBAZXhhbXBsZVxuICogY29uc3QgcHJvbWlzZSA9IGxhenlQcm9taXNlKCk7XG4gKiBwcm9taXNlLnJlamVjdChcIm5vIGNvbm5lY3Rpb25cIik7ICAgLy8gcmVqZWN0cyB3aXRoIGFuIEVycm9yIGNhcnJ5aW5nIHRoYXQgbWVzc2FnZVxuICogcHJvbWlzZS5yZXNvbHZlZDsgICAgICAgICAgICAgICAgICAvLyB0cnVlIC0gc2V0dGxlZCwgbm90IHN1Y2Nlc3NmdWxcbiAqIHByb21pc2UuZXJyb3I7ICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZVxuICogcHJvbWlzZS52YWx1ZTsgICAgICAgICAgICAgICAgICAgICAvLyBcIm5vIGNvbm5lY3Rpb25cIlxuICovXG5leHBvcnQgY29uc3QgbGF6eVByb21pc2UgPSAoKSA9PiB7XG5cdGxldCBwcm9taXNlUmVzb2x2ZSA9IG51bGw7XG5cdGxldCBwcm9taXNlUmVqZWN0ID0gbnVsbDtcblx0bGV0IHJlc29sdmVkID0gZmFsc2U7XG5cdGxldCBlcnJvciA9IGZhbHNlO1xuXHRsZXQgdmFsdWUgPSB1bmRlZmluZWQ7XG5cblx0Y29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyLCBlKSA9PiB7XG5cdFx0cHJvbWlzZVJlc29sdmUgPSByO1xuXHRcdHByb21pc2VSZWplY3QgPSAoYW5FcnJvcikgPT4gZShhbkVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBhbkVycm9yIDogbmV3IEVycm9yKGFuRXJyb3IgPT0gbnVsbCA/IFwiUHJvbWlzZSByZWplY3RlZCB3aXRoIG5vIHJlYXNvblwiIDogYW5FcnJvcikpO1xuXHR9KTtcblxuXHRkZWZWYWx1ZShwcm9taXNlLCBcInJlc29sdmVcIiwgKHJlc3VsdCkgPT4ge1xuXHRcdGlmIChyZXNvbHZlZCkgdGhyb3cgbmV3IEVycm9yKFwiUHJvbWlzZSBhbHJlYWR5IHJlc29sdmVkIVwiKTtcblx0XHRyZXNvbHZlZCA9IHRydWU7XG5cdFx0dmFsdWUgPSByZXN1bHQ7XG5cdFx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRXJyb3IpIHtcblx0XHRcdGVycm9yID0gdHJ1ZTtcblx0XHRcdHByb21pc2VSZWplY3QodmFsdWUpO1xuXHRcdH0gZWxzZSBwcm9taXNlUmVzb2x2ZSh2YWx1ZSk7XG5cdH0pO1xuXHRkZWZWYWx1ZShwcm9taXNlLCBcInJlamVjdFwiLCAocmVzdWx0KSA9PiB7XG5cdFx0aWYgKHJlc29sdmVkKSB0aHJvdyBuZXcgRXJyb3IoXCJQcm9taXNlIGFscmVhZHkgcmVzb2x2ZWQhXCIpO1xuXHRcdHJlc29sdmVkID0gdHJ1ZTtcblx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRlcnJvciA9IHRydWU7XG5cdFx0cHJvbWlzZVJlamVjdChyZXN1bHQpO1xuXHR9KTtcblxuXHRkZWZHZXQocHJvbWlzZSwgXCJ2YWx1ZVwiLCAoKSA9PiB2YWx1ZSk7XG5cdGRlZkdldChwcm9taXNlLCBcImVycm9yXCIsICgpID0+IGVycm9yKTtcblx0ZGVmR2V0KHByb21pc2UsIFwicmVzb2x2ZWRcIiwgKCkgPT4gcmVzb2x2ZWQpO1xuXG5cdHJldHVybiBwcm9taXNlO1xufTtcbmV4cG9ydCBkZWZhdWx0IHtcblx0bGF6eVByb21pc2UsXG5cdHRpbWVvdXRQcm9taXNlLFxufTtcbiIsIi8qKlxuICogQ3JlYXRpb24gb2YgcmFuZG9tIFVVSURzLlxuICpcbiAqIEBtb2R1bGUgVVVJRFxuICovXG4vL3RoZSBzb2x1dGlvbiBpcyBmb3VuZCBoZXJlOiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZFxuXG5pbXBvcnQgR0xPQkFMIGZyb20gXCIuL0dsb2JhbC5qc1wiO1xuXG4vKipcbiAqIFRoZSBsYXlvdXQgb2YgYSB2ZXJzaW9uIDQgVVVJRC4geCBpcyBhIHJhbmRvbSBoZXggZGlnaXQsIHkgaXMgdGhlIHZhcmlhbnQgZGlnaXQgYW5kIGJlY29tZXMgb25lIG9mXG4gKiA4LCA5LCBhIG9yIGIuXG4gKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IFVVSURfU0NIRU1BID0gXCJ4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHhcIjtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmFuZG9tIFVVSUQgb2YgdmVyc2lvbiA0LlxuICpcbiAqIFRoZSBkaWdpdHMgY29tZSBmcm9tIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMsIG5vdCBmcm9tIE1hdGgucmFuZG9tLiBSZXF1aXJlcyBhIGNyeXB0byBvbiB0aGUgZ2xvYmFsXG4gKiBzY29wZSwgd2hpY2ggZXZlcnkgYnJvd3NlciBhbmQgZXZlcnkgd2ViIHdvcmtlciBicmluZ3MuXG4gKlxuICogQHJldHVybnMge3N0cmluZ30gMzYgY2hhcmFjdGVycywgZm9sbG93aW5nIHtAbGluayBVVUlEX1NDSEVNQX1cbiAqXG4gKiBAZXhhbXBsZVxuICogdXVpZCgpOyAgIC8vIFwiMWI5ZDZiY2QtYmJmZC00YjJkLTliNWQtYWI4ZGZiYmQ0YmVkXCJcbiAqL1xuZXhwb3J0IGNvbnN0IHV1aWQgPSAoKSA9PiB7XG5cdGNvbnN0IGJ1ZiA9IG5ldyBVaW50MzJBcnJheSg0KTtcblx0R0xPQkFMLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnVmKTtcblx0bGV0IGlkeCA9IC0xO1xuXHRyZXR1cm4gVVVJRF9TQ0hFTUEucmVwbGFjZSgvW3h5XS9nLCAoYykgPT4ge1xuXHRcdGlkeCsrO1xuXHRcdGNvbnN0IHIgPSAoYnVmW2lkeCA+PiAzXSA+PiAoKGlkeCAlIDgpICogNCkpICYgMTU7XG5cdFx0Y29uc3QgdiA9IGMgPT0gXCJ4XCIgPyByIDogKHIgJiAweDMpIHwgMHg4O1xuXHRcdHJldHVybiB2LnRvU3RyaW5nKDE2KTtcblx0fSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7IHV1aWQgfTtcbiIsIi8qKlxyXG4gKiBTbWFsbCBjaGVja3Mgb24gcGxhaW4gdmFsdWVzLlxyXG4gKlxyXG4gKiBub1ZhbHVlIGFuc3dlcnMgdGhlIHNhbWUgcXVlc3Rpb24gYXMgT2JqZWN0VXRpbHMuaXNOdWxsT3JVbmRlZmluZWQgYW5kIGlzIGtlcHQgYXMgaXRzIG93biBmdW5jdGlvblxyXG4gKiBvbiBwdXJwb3NlOiB0aGlzIG1vZHVsZSBpcyB0aGUgb25lIHRvIHJlYWNoIGZvciB3aGVuIGFsbCB0aGF0IGlzIG5lZWRlZCBpcyBhIGxvb2sgYXQgYSB2YWx1ZSwgYW5kXHJcbiAqIGl0IHN0YXlzIGZyZWUgb2YgYW55IGRlcGVuZGVuY3kgb24gT2JqZWN0VXRpbHMuIFRoZSBkdXBsaWNhdGlvbiBpcyB0aGUgcHJpY2UgZm9yIHRoYXQsIGFuZCBpdCBpc1xyXG4gKiBhY2NlcHRlZCAtIGJvdGggYXJlIHR3byBsaW5lcyBhbmQgbmVpdGhlciBpcyBnb2luZyB0byBjaGFuZ2UuXHJcbiAqXHJcbiAqIEBtb2R1bGUgVmFsdWVIZWxwZXJcclxuICovXHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBudWxsIG9yIHVuZGVmaW5lZC5cclxuICpcclxuICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmV4cG9ydCBjb25zdCBub1ZhbHVlID0gKHZhbHVlKSA9PiB7XHJcblx0cmV0dXJuIHZhbHVlID09IG51bGwgfHwgdHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgc3RyaW5nIGNhcnJpZXMgbm90aGluZyB0byB3b3JrIHdpdGggLSBudWxsLCB1bmRlZmluZWQsIGVtcHR5IG9yIHdoaXRlc3BhY2Ugb25seS5cclxuICpcclxuICogRXhwZWN0cyBhIHN0cmluZyBmb3IgZXZlcnl0aGluZyBlbHNlIGFuZCB0aHJvd3Mgb24gYSB2YWx1ZSB3aXRob3V0IHRyaW0sIGEgbnVtYmVyIGZvciBpbnN0YW5jZS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBlbXB0eU9yQmxhbmsoXCIgIFwiKTsgICAgIC8vIHRydWVcclxuICogZW1wdHlPckJsYW5rKG51bGwpOyAgICAgLy8gdHJ1ZVxyXG4gKiBlbXB0eU9yQmxhbmsoXCJ0ZXN0XCIpOyAgIC8vIGZhbHNlXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZW1wdHlPckJsYW5rID0gKHZhbHVlKSA9PiB7XHJcblx0cmV0dXJuIG5vVmFsdWUodmFsdWUpIHx8IHZhbHVlLnRyaW0oKS5sZW5ndGggPT0gMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rIGVtcHR5T3JCbGFua31cclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVtdHB5T3JOb1ZhbHVlU3RyaW5nID0gKHZhbHVlKSA9PiB7XHJcblx0Y29uc29sZS53YXJuKFwiZW10cHlPck5vVmFsdWVTdHJpbmcgaXMgZGVwcmVjYXRlZCEgdXNlIGVtcHR5T3JCbGFua1wiKTtcclxuXHRyZXR1cm4gZW1wdHlPckJsYW5rKHZhbHVlKTtcclxufTtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcblx0bm9WYWx1ZSxcclxuXHRlbXB0eU9yQmxhbmssXHJcblx0ZW10cHlPck5vVmFsdWVTdHJpbmdcclxufTsiLCIvKipcbiAqIEVudHJ5IHBvaW50IG9mIHRoZSBwYWNrYWdlLlxuICpcbiAqIEltcG9ydGluZyBpdCBhbHNvIHB1bGxzIGluIHRoZSBqYXZhc2NyaXB0IG1vZHVsZSwgd2hpY2ggZXh0ZW5kcyBTdHJpbmcgYW5kIE1hcCAtIHNlZSB0aGUgbm90ZVxuICogdGhlcmUuIFJlYWR5LCBTZXJ2aWNlSGVscGVyIGFuZCB0aGUgWG1sVG9Kc29uIGNvbnZlcnRlciBhcmUgbm90IHBhcnQgb2YgdGhpcyBzdXJmYWNlIGFuZCBoYXZlIHRvIGJlXG4gKiBpbXBvcnRlZCBmcm9tIHRoZWlyIG93biBmaWxlLlxuICpcbiAqIEBtb2R1bGUgZGVmYXVsdGpzLWNvbW1vbi11dGlsc1xuICovXG5pbXBvcnQgXCIuL2phdmFzY3JpcHQvaW5kZXguanNcIjtcbmltcG9ydCBPYmplY3RVdGlscyBmcm9tIFwiLi9PYmplY3RVdGlscy5qc1wiO1xuaW1wb3J0IEdMT0JBTCBmcm9tIFwiLi9HbG9iYWwuanNcIjtcbmltcG9ydCBFc2NhcGVyIGZyb20gXCIuL0VzY2FwZXIuanNcIjtcbmltcG9ydCBWYWx1ZUhlbHBlciBmcm9tIFwiLi9WYWx1ZUhlbHBlci5qc1wiO1xuaW1wb3J0IFByb21pc2VVdGlscyBmcm9tIFwiLi9Qcm9taXNlVXRpbHMuanNcIjtcbmltcG9ydCBQcml2YXRlUHJvcGVydHkgZnJvbSBcIi4vUHJpdmF0ZVByb3BlcnR5LmpzXCI7XG5pbXBvcnQgVVVJRCBmcm9tIFwiLi9VVUlELmpzXCI7XG5cbmV4cG9ydCB7XG5cdEdMT0JBTCAsXG5cdE9iamVjdFV0aWxzLFxuXHRFc2NhcGVyLFxuXHRWYWx1ZUhlbHBlcixcblx0UHJvbWlzZVV0aWxzLFxuXHRQcml2YXRlUHJvcGVydHksXG5cdFVVSURcbn07IiwiLyoqXHJcbiAqIEFkZHMgdG9PYmplY3QoKSB0byBldmVyeSBNYXAgLSBzZWUgdGhlIG5vdGUgb24gcGF0Y2hpbmcgcHJvdG90eXBlcyBpbiAuL2luZGV4LmpzLlxyXG4gKlxyXG4gKiBBIG5lc3RlZCBNYXAgaXMgY29udmVydGVkIGFsb25nIHdpdGggaXQuIEV2ZXJ5IGtleSBiZWNvbWVzIGEgcHJvcGVydHkgbmFtZSwgc28gYSBrZXkgdGhhdCBpcyBub1xyXG4gKiBzdHJpbmcgaXMgdHVybmVkIGludG8gb25lIHRoZSB3YXkgamF2YXNjcmlwdCBkb2VzIGl0IC0gYW4gb2JqZWN0IGtleSBlbmRzIHVwIGFzIFwiW29iamVjdCBPYmplY3RdXCIsXHJcbiAqIGFuZCB0d28ga2V5cyBjb2xsYXBzaW5nIG9udG8gdGhlIHNhbWUgbmFtZSBvdmVyd3JpdGUgZWFjaCBvdGhlci5cclxuICpcclxuICogT25seSBkZWZpbmVkIHdoZW4gbm90aGluZyBlbHNlIGNhcnJpZXMgdGhhdCBuYW1lIGFscmVhZHkuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIG5ldyBNYXAoW1tcImFcIiwgMV0sIFtcImJcIiwgbmV3IE1hcChbW1wiY1wiLCAyXV0pXV0pLnRvT2JqZWN0KCk7ICAgLy8ge2EgOiAxLCBiIDoge2MgOiAyfX1cclxuICovXHJcbmlmICghTWFwLnByb3RvdHlwZS50b09iamVjdClcclxuXHRNYXAucHJvdG90eXBlLnRvT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0Y29uc3Qgb2JqZWN0ID0ge307XHJcblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkgb2JqZWN0W2tleV0gPSB2YWx1ZSBpbnN0YW5jZW9mIE1hcCA/IHZhbHVlLnRvT2JqZWN0KCkgOiB2YWx1ZTtcclxuXHJcblx0XHRyZXR1cm4gb2JqZWN0O1xyXG5cdH07XHJcbiIsIi8qKlxyXG4gKiBBZGRzIGhhc2hjb2RlKCkgdG8gZXZlcnkgc3RyaW5nIC0gc2VlIHRoZSBub3RlIG9uIHBhdGNoaW5nIHByb3RvdHlwZXMgaW4gLi9pbmRleC5qcy5cclxuICpcclxuICogVGhlIGhhc2ggaXMgdGhlIG9uZSBqYXZhIHVzZXMgZm9yIGl0cyBzdHJpbmdzOiBoID0gMzEgKiBoICsgY2hhciwga2VwdCBpbnNpZGUgMzIgc2lnbmVkIGJpdHMuIEl0XHJcbiAqIGlzIG1lYW50IGZvciBidWNrZXRpbmcgYW5kIGZvciB0ZWxsaW5nIHRleHRzIGFwYXJ0IGNoZWFwbHksIG5vdCBmb3IgYW55dGhpbmcgd2hlcmUgY29sbGlzaW9uc1xyXG4gKiBtYXR0ZXIgLSB0d28gZGlmZmVyZW50IHRleHRzIGNhbiBzaGFyZSBhIGhhc2gsIGFuZCBpdCBpcyBubyBjcnlwdG9ncmFwaGljIGRpZ2VzdC5cclxuICpcclxuICogT25seSBkZWZpbmVkIHdoZW4gbm90aGluZyBlbHNlIGNhcnJpZXMgdGhhdCBuYW1lIGFscmVhZHkuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGEgMzIgYml0IHNpZ25lZCBpbnRlZ2VyLCAwIGZvciB0aGUgZW1wdHkgc3RyaW5nXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIFwidGVzdFwiLmhhc2hjb2RlKCk7ICAgLy8gMzU1NjQ5OFxyXG4gKi9cclxuaWYgKCFTdHJpbmcucHJvdG90eXBlLmhhc2hjb2RlKVxyXG5cdFN0cmluZy5wcm90b3R5cGUuaGFzaGNvZGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdGlmICh0aGlzLmxlbmd0aCA9PT0gMClcclxuXHRcdFx0cmV0dXJuIDA7XHJcblx0XHRcclxuXHRcdGxldCBoYXNoID0gMDtcclxuXHRcdGNvbnN0IGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG5cdFx0XHRjb25zdCBjID0gdGhpcy5jaGFyQ29kZUF0KGkpO1xyXG5cdFx0XHRoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBjO1xyXG5cdFx0XHRoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGhhc2g7XHJcblx0fTsiLCIvKipcclxuICogRXh0ZW5zaW9ucyB0byB0aGUgYnVpbHQgaW4gamF2YXNjcmlwdCB0eXBlcy5cclxuICpcclxuICogSW1wb3J0aW5nIHRoaXMgbW9kdWxlIHBhdGNoZXMgcHJvdG90eXBlcyAtIHRoYXQgaXMgd2hhdCBpdCBpcyBmb3IsIGFuZCBpdCBpcyBkZWxpYmVyYXRlLiBUaGVcclxuICogcGFja2FnZSBpbXBvcnRzIGl0IGZyb20gaXRzIG93biBlbnRyeSBwb2ludCwgc28gYW55dGhpbmcgdXNpbmcgaXQgZ2V0cyB0aGUgZXh0ZW5zaW9ucyB3aXRob3V0XHJcbiAqIGFza2luZyBmb3IgdGhlbSBzZXBhcmF0ZWx5LiBUaGV5IGFyZSBtZWFudCB0byByZWFkIGxpa2UgcGFydCBvZiB0aGUgbGFuZ3VhZ2UgYXQgdGhlIGNhbGwgc2l0ZTpcclxuICogXCJ0ZXh0XCIuaGFzaGNvZGUoKSBpbnN0ZWFkIG9mIGhhc2hjb2RlKFwidGV4dFwiKS5cclxuICpcclxuICogRXZlcnkgZXh0ZW5zaW9uIGlzIGFkZGVkIG9ubHkgd2hlbiB0aGUgdHlwZSBkb2VzIG5vdCBhbHJlYWR5IGNhcnJ5IHRoYXQgbmFtZSwgc28gYSBuZXdlciBlbmdpbmVcclxuICogb3IgYW5vdGhlciBsaWJyYXJ5IGRlZmluaW5nIHRoZSBzYW1lIG1lbWJlciBrZWVwcyB0aGUgdXBwZXIgaGFuZCBhbmQgbm90aGluZyBpcyBvdmVyd3JpdHRlbi5cclxuICpcclxuICogQG1vZHVsZSBqYXZhc2NyaXB0XHJcbiAqL1xyXG5pbXBvcnQgXCIuL1N0cmluZy5qc1wiO1xyXG5pbXBvcnQgXCIuL01hcC5qc1wiOyIsIi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ2FjaGVFbnRyeVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGxhc3RIaXQgLSBNb25vdG9uaWMgbWFya2VyIG9mIHRoZSBsYXN0IHJlYWQgb3Igd3JpdGUsIHRoZSBldmljdGlvbiBvcmRlci5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBrZXlcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHZhbHVlXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb2RlQ2FjaGVPcHRpb25zXG4gKiBAcHJvcGVydHkge251bWJlcn0gW3NpemVdIC0gTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2FjaGUsIGEgZnJhY3Rpb24gcm91bmRlZCBkb3duLiBJZiBzZXRcbiAqIHRvIDAgb3IgbGVzcywgY2FjaGluZyBpcyBkaXNhYmxlZC4gTGVmdCBvdXQsIHRoZSBzaXplIHN0YXlzIGFzIGl0IGlzLlxuICovXG5cbi8qKiBUaGUgc2l6ZSBldmVyeSBjYWNoZSBzdGFydHMgd2l0aC4gKi9cbmNvbnN0IFNUQVJUX1NJWkUgPSA1MDAwO1xuXG4vKipcbiAqIENvZGVDYWNoZSBjbGFzcyB0byBtYW5hZ2UgY2FjaGluZyBvZiBnZW5lcmF0ZWQgY29kZSBzbmlwcGV0cy5cbiAqXG4gKiBFbnRyaWVzIGFyZSBldmljdGVkIGxlYXN0IHJlY2VudGx5IHVzZWQgZmlyc3Q6IGV2ZXJ5IGhpdCByZWZyZXNoZXMgdGhlIGVudHJ5LCBzbyBhblxuICogZXhwcmVzc2lvbiB0aGF0IGtlZXBzIGJlaW5nIHJlc29sdmVkIG91dGxpdmVzIG9uZSB0aGF0IHdhcyBjb21waWxlZCBvbmNlIGFuZCBkcm9wcGVkLlxuICogVGhlIG1hcmtlciBpcyBhIGNvdW50ZXIgcmF0aGVyIHRoYW4gYSB0aW1lc3RhbXAg4oCUIGEgYnVyc3Qgb2YgZmlyc3QtdGltZSBjb21waWxhdGlvbnNcbiAqIGZhbGxzIGludG8gYSBzaW5nbGUgbWlsbGlzZWNvbmQsIHdoaWNoIHdvdWxkIGxlYXZlIHRoZSBldmljdGlvbiBvcmRlciB0byBjaGFuY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVDYWNoZSB7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I2Rpc2FibGVkID0gZmFsc2U7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjc2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjbWF4U2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7QXJyYXk8Q2FjaGVFbnRyeT59ICovXG5cdCNlbnRyaWVzID0gW107XG5cdC8qKiBAdHlwZSB7TWFwPHN0cmluZyxDYWNoZUVudHJ5Pn0gKi9cblx0I2VudHJ5TWFwID0gbmV3IE1hcCgpO1xuXHQvKiogQHR5cGUge251bWJlcn0gLSBIYW5kcyBvdXQgdGhlIGBsYXN0SGl0YCBtYXJrZXJzLCBuZXZlciByZXNldC4gKi9cblx0I2Nsb2NrID0gMDtcblxuXG5cdC8qKlxuXHQgKiBTdGFydHMgd2l0aCBhIHNpemUgb2YgNTAwMCwgdGhlbiBhcHBsaWVzIHRoZSBvcHRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuI3Jlc2l6ZShTVEFSVF9TSVpFKTtcblx0XHR0aGlzLnNldHVwKG9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgd2hhdCB0aGUgb3B0aW9ucyBjYXJyeSBhbmQgbGVhdmVzIGV2ZXJ5dGhpbmcgZWxzZSBhcyBpdCBpcy4gQSBzaXplIG9mIDAgb3IgbGVzc1xuXHQgKiBkaXNhYmxlcyB0aGUgY2FjaGUgYW5kIHJlbGVhc2VzIGl0cyBlbnRyaWVzLCBhIGxhdGVyIHBvc2l0aXZlIHNpemUgZW5hYmxlcyBpdCBhZ2FpbiBhbmQgc3RhcnRzXG5cdCAqIGVtcHR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgc2l6ZSBpcyBub3QgYSBmaW5pdGUgbnVtYmVyXG5cdCAqL1xuXHRzZXR1cCh7IHNpemUgfSA9IHt9KSB7XG5cdFx0aWYgKHNpemUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdGlmICh0eXBlb2Ygc2l6ZSAhPT0gXCJudW1iZXJcIiB8fCAhTnVtYmVyLmlzRmluaXRlKHNpemUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgc2l6ZSBvZiBhIGNvZGUgY2FjaGUgaXMgYSBmaW5pdGUgbnVtYmVyLCBub3QgJHtTdHJpbmcoc2l6ZSl9IWApO1xuXG5cdFx0dGhpcy4jcmVzaXplKE1hdGguZmxvb3Ioc2l6ZSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBhU2l6ZSBhIHdob2xlIG51bWJlclxuXHQgKi9cblx0I3Jlc2l6ZShhU2l6ZSkge1xuXHRcdHRoaXMuI2Rpc2FibGVkID0gYVNpemUgPD0gMDtcblx0XHRpZiAodGhpcy4jZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMuI3NpemUgPSAwO1xuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IDA7XG5cdFx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuI3NpemUgPSBhU2l6ZTtcblx0XHRcdHRoaXMuI21heFNpemUgPSBNYXRoLmZsb29yKGFTaXplICogMS4xKTtcblx0XHRcdHRoaXMuI3RyaW0oKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciBhbiBlbnRyeSBpcyBoZWxkIHVuZGVyIHRoZSBrZXkuIEEgZGlzYWJsZWQgY2FjaGUgaG9sZHMgbm9uZS4gQXNraW5nIGRvZXMgbm90IGNvdW50IGFzIGFcblx0ICogaGl0LCBzbyBpdCBsZWF2ZXMgdGhlIGV2aWN0aW9uIG9yZGVyIGFsb25lLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzKGtleSkge1xuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHRoaXMuI2VudHJ5TWFwLmhhcyhrZXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb2RlIGhlbGQgdW5kZXIgdGhlIGtleSwgb3IgbnVsbCB3aGVyZSBub25lIGlzIGhlbGQgb3IgdGhlIGNhY2hlIGlzIGRpc2FibGVkLiBBIGhpdFxuXHQgKiByZWZyZXNoZXMgdGhlIGVudHJ5LCBzbyBpdCBpcyBldmljdGVkIGxhc3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHJldHVybnMgez9GdW5jdGlvbn1cblx0ICovXG5cdGdldChrZXkpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIG51bGw7XG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0cmV0dXJuIGVudHJ5LnZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBIb2xkcyB0aGUgY29kZSB1bmRlciB0aGUga2V5LCByZXBsYWNpbmcgd2hhdCB3YXMgaGVsZCB0aGVyZSwgYW5kIHJlZnJlc2hlcyB0aGUgZW50cnkuIE9uY2UgdGhlXG5cdCAqIGNhY2hlIHJlYWNoZXMgYSB0ZW50aCBwYXN0IGl0cyBzaXplLCB0aGUgbGVhc3QgcmVjZW50bHkgdXNlZCBlbnRyaWVzIGFyZSBldmljdGVkIGRvd24gdG8gdGhlXG5cdCAqIHNpemUuXG5cdCAqIEEgZGlzYWJsZWQgY2FjaGUga2VlcHMgbm90aGluZy5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb2RlXG5cdCAqL1xuXHRzZXQoa2V5LCBjb2RlKSB7XG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybjtcblx0XHRsZXQgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0ZW50cnkudmFsdWUgPSBjb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbnRyeSA9IHtcblx0XHRcdFx0bGFzdEhpdDogKyt0aGlzLiNjbG9jayxcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHR2YWx1ZTogY29kZSxcblx0XHRcdH07XG5cdFx0XHR0aGlzLiNlbnRyaWVzLnB1c2goZW50cnkpO1xuXHRcdFx0dGhpcy4jZW50cnlNYXAuc2V0KGtleSwgZW50cnkpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLiNlbnRyeU1hcC5zaXplID49IHRoaXMuI21heFNpemUpIHRoaXMuI3RyaW0oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEcm9wcyBldmVyeSBlbnRyeS4gVGhlIHNpemUgc3RheXMgYXMgaXQgaXMuXG5cdCAqL1xuXHRjbGVhcigpIHtcblx0XHR0aGlzLiNlbnRyaWVzID0gW107XG5cdFx0dGhpcy4jZW50cnlNYXAgPSBuZXcgTWFwKCk7XG5cdH1cblxuXHQjdHJpbSgpIHtcblx0XHR0aGlzLiNlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGIubGFzdEhpdCAtIGEubGFzdEhpdCk7XG5cdFx0aWYgKHRoaXMuI2VudHJpZXMubGVuZ3RoID4gdGhpcy4jc2l6ZSkge1xuXHRcdFx0Y29uc3QgZW50cmllc1RvUmVtb3ZlID0gdGhpcy4jZW50cmllcy5zcGxpY2UodGhpcy4jc2l6ZSk7XG5cdFx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXNUb1JlbW92ZSkge1xuXHRcdFx0XHR0aGlzLiNlbnRyeU1hcC5kZWxldGUoZW50cnkua2V5KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG4iLCIvKipcbiAqIEEgZGVmYXVsdCB2YWx1ZSBhcyB0aGUgcmVzb2x2ZXIgY2FycmllcyBpdCwgd2hpY2ggdGVsbHMgXCJubyBkZWZhdWx0IHBhc3NlZFwiIGFwYXJ0IGZyb20gXCJ0aGVcbiAqIGRlZmF1bHQgaXMgdW5kZWZpbmVkXCIuXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIERlZmF1bHRWYWx1ZVxuICogQHR5cGVkZWYge0RlZmF1bHRWYWx1ZX1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmYXVsdFZhbHVlIHtcblx0LyoqXG5cdCAqIENyZWF0ZWQgd2l0aG91dCBhbiBhcmd1bWVudCwgaXQgY2FycmllcyBubyBkZWZhdWx0OyBjcmVhdGVkIHdpdGggb25lLCBpdCBjYXJyaWVzIHRoYXRcblx0ICogYXJndW1lbnQsIHVuZGVmaW5lZCBpbmNsdWRlZC5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7Kn0gW3ZhbHVlXVxuXHQgKi9cblx0Y29uc3RydWN0b3IodmFsdWUpe1xuXHRcdC8qKiBAdHlwZSB7Ym9vbGVhbn0gd2hldGhlciBhIGRlZmF1bHQgd2FzIHBhc3NlZCAqL1xuXHRcdHRoaXMuaGFzVmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDE7XG5cdFx0LyoqIEB0eXBlIHsqfSB0aGUgZGVmYXVsdCwgbWVhbmluZ2Z1bCBvbmx5IHdoZXJlIGhhc1ZhbHVlIGlzIHRydWUgKi9cblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdH1cbn07XG4iLCIvKipcbiAqIFRoZSBpbnRlcmZhY2UgZXZlcnkgZXhlY3V0ZXIgaW1wbGVtZW50cy4gQW4gZXhlY3V0ZXIgcnVucyBzdGF0ZW1lbnRzIGFuZFxuICogaG9sZHMgbm8gY29udGV4dCBvZiBpdHMgb3duOiB0aGUgY29udGV4dCBhbHdheXMgY29tZXMgZnJvbSB0aGUgcmVzb2x2ZXIuXG4gKlxuICogQW4gb3duIGltcGxlbWVudGF0aW9uIGlzIGJ1aWx0IGZyb20gaXQgYnkgaGFuZGluZyBvdmVyIHRoZSBmdW5jdGlvbiB0aGF0IGRvZXMgdGhlIHdvcmsuXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEV4ZWN1dGVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4ZWN1dGVye1xuXG5cdCNleGVjdXRpb247XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cblx0ICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcsIG9iamVjdCk6ICp9IG9wdGlvbi5leGVjdXRpb24gcnVucyBhIHN0YXRlbWVudCBvdmVyIGEgY29udGV4dCBhbmRcblx0ICogYW5zd2VycyB0aGUgcmVzdWx0LCBhIHByb21pc2UgaW5jbHVkZWQuIFdpdGhvdXQgb25lLCBldmVyeSBleGVjdXRpb24gdGhyb3dzLlxuXHQgKi9cblx0Y29uc3RydWN0b3Ioe2V4ZWN1dGlvbn0gPSB7fSl7XG5cdFx0dGhpcy4jZXhlY3V0aW9uID0gZXhlY3V0aW9uIHx8ICgoKSA9PiB7dGhyb3cgbmV3IEVycm9yKFwibm90IGltcGxlbWVudGVkXCIpfSk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhIHN0YXRlbWVudCBvdmVyIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnQgdGhlIHN0YXRlbWVudCwgd2l0aG91dCBkZWxpbWl0ZXJzIGFuZCBzY29wZSBwcmVmaXhcblx0ICogQHBhcmFtIHtvYmplY3R9IGFDb250ZXh0IHRoZSBjb250ZXh0IG9mIHRoZSByZXNvbHZlciB0aGUgc3RhdGVtZW50IGlzIGV2YWx1YXRlZCBvblxuXHQgKiBAcmV0dXJucyB7Kn0gd2hhdCB0aGUgZXhlY3V0aW9uIGFuc3dlcnMsIGEgcHJvbWlzZSBpbmNsdWRlZFxuXHQgKi9cblx0ZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCl7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGlvbihhU3RhdGVtZW50LCBhQ29udGV4dCk7XG5cdH1cbn07XG4iLCJpbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcblxuY29uc3QgRVhFQ1VURVJTID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEtlZXBzIGFuIGV4ZWN1dGVyIHVuZGVyIGEgbmFtZSwgc28gYSByZXNvbHZlciBjYW4gYmUgZ2l2ZW4gdGhlIG5hbWUgaW5zdGVhZCBvZiB0aGUgaW5zdGFuY2UuXG4gKiBBbiBleGVjdXRlciBhbHJlYWR5IGtlcHQgdW5kZXIgdGhlIG5hbWUgaXMgcmVwbGFjZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFOYW1lXG4gKiBAcGFyYW0ge0V4ZWN1dGVyfSBhbkV4ZWN1dGVyXG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlciA9IChhTmFtZSwgYW5FeGVjdXRlcikgPT4ge1xuXHRFWEVDVVRFUlMuc2V0KGFOYW1lLCBhbkV4ZWN1dGVyKTtcbn07XG5cbi8qKlxuICogVGhlIGV4ZWN1dGVyIGtlcHQgdW5kZXIgYSBuYW1lLiBBbHNvIHRoZSBkZWZhdWx0IGV4cG9ydCBvZiB0aGlzIG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEByZXR1cm5zIHtFeGVjdXRlcn1cbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSBubyBleGVjdXRlciBpcyBrZXB0IHVuZGVyIHRoZSBuYW1lXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeGVjdXRlciA9IChhTmFtZSkgPT4ge1xuXHRjb25zdCBleGVjdXRlciA9IEVYRUNVVEVSUy5nZXQoYU5hbWUpO1xuXHRpZiAoIWV4ZWN1dGVyKSB0aHJvdyBuZXcgRXJyb3IoYEV4ZWN1dGVyIFwiJHthTmFtZX1cIiBpcyBub3QgcmVnaXN0ZXJlZCFgKTtcblx0cmV0dXJuIGV4ZWN1dGVyO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RXhlY3V0ZXI7XG4iLCJpbXBvcnQgT2JqZWN0VXRpbHMgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5pbXBvcnQgRGVmYXVsdFZhbHVlIGZyb20gXCIuL0RlZmF1bHRWYWx1ZS5qc1wiO1xuaW1wb3J0IHsgZ2V0RXhlY3V0ZXIgfSBmcm9tIFwiLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRGVmYXVsdEV4ZWN1dGVyIGZyb20gXCIuL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBSZXNvbHZlckNvbnRleHRIYW5kbGUgZnJvbSBcIi4vUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCB7IHNjYW4sIHBhcnNlRXhwcmVzc2lvbiB9IGZyb20gXCIuL0V4cHJlc3Npb25TY2FubmVyLmpzXCI7XG5pbXBvcnQgeyBpc05hbWVDaGFyYWN0ZXIsIHRyaW1Ub051bGwgfSBmcm9tIFwiLi9VdGlscy5qc1wiO1xuXG4vKiogQHR5cGUge0V4ZWN1dGVyfSAqL1xubGV0IERFRkFVTFRfRVhFQ1VURVIgPSBEZWZhdWx0RXhlY3V0ZXI7XG5cbmNvbnN0IERFRkFVTFRfTk9UX0RFRklORUQgPSBuZXcgRGVmYXVsdFZhbHVlKCk7XG5jb25zdCB0b0RlZmF1bHRWYWx1ZSA9ICh2YWx1ZSkgPT4ge1xuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEZWZhdWx0VmFsdWUpIHJldHVybiB2YWx1ZTtcblxuXHRyZXR1cm4gbmV3IERlZmF1bHRWYWx1ZSh2YWx1ZSk7XG59O1xuXG5sZXQgTkFNRV9DT1VOVEVSID0gMDtcbi8qKlxuICogVGhlIG5hbWUgYSByZXNvbHZlciBjYXJyaWVzIHdoZXJlIHRoZSBjYWxsZXIgcGFzc2VkIG5vbmUuIE9ubHkgdW5pcXVlbmVzcyBpcyBwcm9taXNlZCwgdGhlIHNoYXBlXG4gKiBpcyBub3QuXG4gKlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgZ2VuZXJhdGVOYW1lID0gKCkgPT4gYEVSJHsrK05BTUVfQ09VTlRFUn1gO1xuXG4vKipcbiAqIFRoZSBuYW1lIGEgcmVzb2x2ZXIga2VlcHM6IHRoZSBvbmUgcGFzc2VkLCB0cmltbWVkIGFuZCBoZWxkIHRvIHRoZSBjaGFyYWN0ZXJzIGEgc2NvcGUgbmFtZSBtYXlcbiAqIGNhcnJ5LCBvciBhIGdlbmVyYXRlZCBvbmUgd2hlcmUgbm9uZSB3YXMgcGFzc2VkLlxuICpcbiAqIEBwYXJhbSB7P3N0cmluZ30gYU5hbWVcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBuYW1lIGlzIG5vIHN0cmluZywgZW1wdHksIG9yIGNhcnJpZXMgYSBjaGFyYWN0ZXIgYSBzY29wZSBuYW1lIGNhbm5vdFxuICogY2FycnlcbiAqL1xuY29uc3QgdG9OYW1lID0gKGFOYW1lKSA9PiB7XG5cdGlmIChhTmFtZSA9PSBudWxsKSByZXR1cm4gZ2VuZXJhdGVOYW1lKCk7XG5cdGlmICh0eXBlb2YgYU5hbWUgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBvcHRpb24gbmFtZSB0YWtlcyBhIHN0cmluZywgbm90IGEgJHt0eXBlb2YgYU5hbWV9IWApO1xuXG5cdGNvbnN0IG5hbWUgPSB0cmltVG9OdWxsKGFOYW1lKTtcblx0aWYgKG5hbWUgPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBvcHRpb24gbmFtZSB0YWtlcyBhIG5hbWUsIG5vdCBhbiBlbXB0eSBzdHJpbmchXCIpO1xuXHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbmFtZS5sZW5ndGg7IGluZGV4KyspXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIobmFtZS5jaGFyQ29kZUF0KGluZGV4KSkpIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBuYW1lIFwiJHtuYW1lfVwiIGNhcnJpZXMgYSBjaGFyYWN0ZXIgYSBzY29wZSBuYW1lIGNhbm5vdCBjYXJyeSAtIG9ubHkgQVNDSUkgbGV0dGVycywgZGlnaXRzLCBcIi1cIiwgXCJfXCIgYW5kIHdoaXRlc3BhY2UgYXJlIGFsbG93ZWQhYCk7XG5cblx0cmV0dXJuIG5hbWU7XG59O1xuXG4vKipcbiAqIFRoZSBzY29wZSBuYW1lIGEgZmlsdGVyIG9mIHRoZSBkYXRhIG1ldGhvZHMgc2VsZWN0cywgcmVhZCBsaWtlIGEgc2NvcGUgcHJlZml4OiB0cmltbWVkLCBhbmQgbnVsbFxuICogd2hlcmUgdGhlcmUgaXMgbm9uZS5cbiAqXG4gKiBAcGFyYW0gez9zdHJpbmd9IGFGaWx0ZXJcbiAqIEByZXR1cm5zIHs/c3RyaW5nfVxuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgZmlsdGVyIGlzIG5vIHN0cmluZ1xuICovXG5jb25zdCB0b1Njb3BlID0gKGFGaWx0ZXIpID0+IHtcblx0aWYgKGFGaWx0ZXIgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cdGlmICh0eXBlb2YgYUZpbHRlciAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgQSBmaWx0ZXIgaXMgYSBzY29wZSBuYW1lLCBub3QgYSAke3R5cGVvZiBhRmlsdGVyfSFgKTtcblxuXHRyZXR1cm4gdHJpbVRvTnVsbChhRmlsdGVyKTtcbn07XG5cbi8qKlxuICogVGhlIHByb3BlcnR5IGtleSBhIGRhdGEgbWV0aG9kIHdvcmtzIHdpdGggLSBhIHN0cmluZywgXCJcIiBpbmNsdWRlZCwgYSBzeW1ib2wsIG9yIGEgbnVtYmVyLCB3aGljaFxuICogbmFtZXMgdGhlIHNhbWUgcHJvcGVydHkgYXMgaXRzIHN0cmluZyBhbmQgaXMgbG9va2VkIHVwIGFzIG9uZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8c3ltYm9sfSBhS2V5XG4gKiBAcmV0dXJucyB7c3RyaW5nfHN5bWJvbH1cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGtleSBpcyBub25lLCBvciBvZiBhIHR5cGUgbm8gcHJvcGVydHkga2V5IGhhc1xuICovXG5jb25zdCB0b0tleSA9IChhS2V5KSA9PiB7XG5cdGNvbnN0IHR5cGUgPSB0eXBlb2YgYUtleTtcblx0aWYgKHR5cGUgPT09IFwic3RyaW5nXCIgfHwgdHlwZSA9PT0gXCJzeW1ib2xcIikgcmV0dXJuIGFLZXk7XG5cdGlmICh0eXBlID09PSBcIm51bWJlclwiKSByZXR1cm4gU3RyaW5nKGFLZXkpO1xuXG5cdHRocm93IG5ldyBUeXBlRXJyb3IoYEEga2V5IGlzIGEgc3RyaW5nLCBhIG51bWJlciBvciBhIHN5bWJvbCwgbm90ICR7YUtleSA9PSBudWxsID8gXCJtaXNzaW5nXCIgOiBgYSAke3R5cGV9YH0hYCk7XG59O1xuXG5jb25zdCB3YXJuRmFpbGVkU3RhdGVtZW50ID0gKGFTdGF0ZW1lbnQsIGFuRXJyb3IpID0+IHtcblx0Y29uc29sZS53YXJuKGBFeGVjdXRpb24gZXJyb3Igb24gc3RhdGVtZW50IVxuXHRcdHN0YXRlbWVudDpcblx0XHQke2FTdGF0ZW1lbnR9XG5cdFx0ZXJyb3I6XG5cdFx0JHthbkVycm9yfVxuXHRcdGApO1xufTtcblxuLyoqXG4gKiBAcGFyYW0geyp9IGFSZXN1bHRcbiAqIEBwYXJhbSB7RGVmYXVsdFZhbHVlfSBhRGVmYXVsdFxuICogQHJldHVybnMgeyp9XG4gKi9cbmNvbnN0IHdpdGhEZWZhdWx0ID0gKGFSZXN1bHQsIGFEZWZhdWx0KSA9PiB7XG5cdGlmIChhUmVzdWx0ICE9PSBudWxsICYmIHR5cGVvZiBhUmVzdWx0ICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gYVJlc3VsdDtcblx0ZWxzZSBpZiAoYURlZmF1bHQuaGFzVmFsdWUpIHJldHVybiBhRGVmYXVsdC52YWx1ZTtcblx0cmV0dXJuIGFSZXN1bHQ7XG59O1xuXG4vLyB0aGUgZmlyc3QgYXJndW1lbnQgb2YgYSBzdGF0aWMgZW50cnkgcG9pbnQgaXMgYSBzdHJpbmcsIG9yIGEgY29uZmlndXJhdGlvbiBvYmplY3RcbmNvbnN0IGlzQ29uZmlndXJhdGlvbiA9IChhVmFsdWUpID0+IGFWYWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgYVZhbHVlID09PSBcIm9iamVjdFwiO1xuXG4vLyBhIGNvbmZpZ3VyYXRpb24gY291bnRzIGFzIHBhc3NpbmcgYSBkZWZhdWx0IHdoZXJlIGl0IGNhcnJpZXMgdGhlIGtleSwgd2hhdGV2ZXIgaXQgaG9sZHNcbmNvbnN0IGRlZmF1bHRPZiA9IChhQ29uZmlndXJhdGlvbikgPT4gKFwiZGVmYXVsdFZhbHVlXCIgaW4gYUNvbmZpZ3VyYXRpb24gPyBhQ29uZmlndXJhdGlvbi5kZWZhdWx0VmFsdWUgOiBERUZBVUxUX05PVF9ERUZJTkVEKTtcblxuLyoqXG4gKiBSZXNvbHZlcyBgJHsuLi59YCBleHByZXNzaW9ucyBhZ2FpbnN0IGEgY29udGV4dC4gQSByZXNvbHZlciBtYXkgaGF2ZSBhIHBhcmVudCwgYW5kIHRoZSByZXNvbHZlcnNcbiAqIGZyb20gaXQgdXAgdG8gdGhlIHJvb3QgZm9ybSBhIGNoYWluOiBhIG5hbWUgaXMgbG9va2VkIHVwIGZyb20gdGhpcyByZXNvbHZlciB0b3dhcmRzIHRoZSByb290LCBhbmRcbiAqIGEgc2NvcGUgcHJlZml4IGAke25hbWU6OnN0YXRlbWVudH1gIGFkZHJlc3NlcyBvbmUgcmVzb2x2ZXIgb2YgdGhlIGNoYWluLlxuICpcbiAqIFVzZWQgc3RhdGljYWxseSB3aXRoIGFuIGFkLWhvYyBjb250ZXh0IChgcmVzb2x2ZWAsIGByZXNvbHZlVGV4dGApLCBvciBhcyBhbiBpbnN0YW5jZSB3aXRoaW4gYVxuICogY2hhaW4uXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIEV4cHJlc3Npb25SZXNvbHZlclxuICogQHR5cGVkZWYge0V4cHJlc3Npb25SZXNvbHZlcn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyIHtcblx0LyoqXG5cdCAqIFNldHMgdGhlIGV4ZWN1dGVyIGEgcmVzb2x2ZXIgd2l0aG91dCBhIHBhcmVudCB0YWtlcyB3aGVyZSB0aGUgYGV4ZWN1dGVyYCBvcHRpb24gaXMgbGVmdCBvdXQsXG5cdCAqIGFuZCBzbyB0aGUgZXhlY3V0ZXIgb2YgdGhlIHN0YXRpYyBlbnRyeSBwb2ludHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfEV4ZWN1dGVyfSBhbkV4ZWN1dGVyIGEgcmVnaXN0ZXJlZCBuYW1lIG9yIGFuIGBFeGVjdXRlcmAgaW5zdGFuY2Vcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgdmFsdWUgaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYW4gYEV4ZWN1dGVyYCBpbnN0YW5jZVxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgYSBuYW1lIGlzIG5vdCByZWdpc3RlcmVkXG5cdCAqL1xuXHRzdGF0aWMgc2V0IGRlZmF1bHRFeGVjdXRlcihhbkV4ZWN1dGVyKSB7XG5cdFx0aWYgKGFuRXhlY3V0ZXIgaW5zdGFuY2VvZiBFeGVjdXRlcikgREVGQVVMVF9FWEVDVVRFUiA9IGFuRXhlY3V0ZXI7XG5cdFx0ZWxzZSBpZiAodHlwZW9mIGFuRXhlY3V0ZXIgPT09IFwic3RyaW5nXCIpIERFRkFVTFRfRVhFQ1VURVIgPSBnZXRFeGVjdXRlcihhbkV4ZWN1dGVyKTtcblx0XHRlbHNlIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cHJlc3Npb25SZXNvbHZlci5kZWZhdWx0RXhlY3V0ZXIgdGFrZXMgYSByZWdpc3RlcmVkIG5hbWUgb3IgYW4gRXhlY3V0ZXIsIG5vdCBhICR7dHlwZW9mIGFuRXhlY3V0ZXJ9IWApO1xuXHRcdGNvbnNvbGUuaW5mbyhgQ2hhbmdlZCBkZWZhdWx0IGV4ZWN1dGVyIGZvciBFeHByZXNzaW9uUmVzb2x2ZXIhYCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGV4ZWN1dGVyIGEgcmVzb2x2ZXIgd2l0aG91dCBhIHBhcmVudCB0YWtlcyB3aGVyZSB0aGUgYGV4ZWN1dGVyYCBvcHRpb24gaXMgbGVmdCBvdXQ7XG5cdCAqIGBjb250ZXh0LWRlY29uc3RydWN0aW9uLWV4ZWN1dGVyYCB1bnRpbCBpdCBpcyBzZXQuXG5cdCAqXG5cdCAqIEB0eXBlIHtFeGVjdXRlcn1cblx0ICovXG5cdHN0YXRpYyBnZXQgZGVmYXVsdEV4ZWN1dGVyKCkge1xuXHRcdHJldHVybiBERUZBVUxUX0VYRUNVVEVSO1xuXHR9XG5cblx0LyoqIEB0eXBlIHtzdHJpbmd8bnVsbH0gKi9cblx0I25hbWUgPSBudWxsO1xuXHQvKiogQHR5cGUge0V4cHJlc3Npb25SZXNvbHZlcnxudWxsfSAqL1xuXHQjcGFyZW50ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtFeGVjdXRlcnxudWxsfSAqL1xuXHQjZXhlY3V0ZXIgPSBudWxsO1xuXHQvKiogQHR5cGUge29iamVjdHxudWxsfSAqL1xuXHQjY29udGV4dCA9IG51bGw7XG5cdC8qKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9ICovXG5cdCNjb250ZXh0SGFuZGxlID0gbnVsbDtcblxuXHQvKipcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmNvbnRleHRdIGFueSBvYmplY3Q7IHdoZXJlIG5vbmUgaXMgcGFzc2VkIC0gbGVmdCBvdXQsIG51bGwgb3Jcblx0ICogdW5kZWZpbmVkIC0gdGhlIHJlc29sdmVyIGhhcyBubyBjb250ZXh0IG9mIGl0cyBvd25cblx0ICogQHBhcmFtIHtFeHByZXNzaW9uUmVzb2x2ZXJ9IFtvcHRpb25zLnBhcmVudD1udWxsXVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtvcHRpb25zLm5hbWU9bnVsbF0ga2VwdCB0cmltbWVkOyB3aGVyZSBub25lIGlzIHBhc3NlZCwgb25lIGlzIGdlbmVyYXRlZFxuXHQgKiBAcGFyYW0geyhzdHJpbmd8RXhlY3V0ZXIpfSBbb3B0aW9ucy5leGVjdXRlcl0gdGhlIHJlZ2lzdGVyZWQgbmFtZSBvZiBhbiBleGVjdXRlciwgb3IgYW5cblx0ICogYEV4ZWN1dGVyYCBpbnN0YW5jZS4gQSBuYW1lIHRoYXQgaXMgbm90IHJlZ2lzdGVyZWQgdGhyb3dzOyBhbiBpbnN0YW5jZSBuZWVkcyBubyByZWdpc3RyYXRpb24sXG5cdCAqIGJlY2F1c2UgaXQgYWRkcmVzc2VzIHRoZSBleGVjdXRlciBkaXJlY3RseS4gTnVsbCBhbmQgdW5kZWZpbmVkIGNvdW50IGFzIGxlZnQgb3V0LiBXaXRob3V0IHRoZVxuXHQgKiBvcHRpb24gdGhlIHJlc29sdmVyIHRha2VzIHRoZSBleGVjdXRlciBvZiBpdHMgcGFyZW50LCBhbmQgb25lIHdpdGhvdXQgYSBwYXJlbnRcblx0ICogYEV4cHJlc3Npb25SZXNvbHZlci5kZWZhdWx0RXhlY3V0ZXJgLlxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBwYXJlbnQgaXMgbm8gcmVzb2x2ZXIsIHRoZSBjb250ZXh0IGEgcHJpbWl0aXZlLCB0aGUgbmFtZSBub1xuXHQgKiBzdHJpbmcsIGVtcHR5LCBvciBjYXJyeWluZyBhIGNoYXJhY3RlciBhIHNjb3BlIG5hbWUgY2Fubm90IGNhcnJ5LCBvciB0aGUgZXhlY3V0ZXIgbmVpdGhlciBhXG5cdCAqIHN0cmluZyBub3IgYW4gYEV4ZWN1dGVyYCBpbnN0YW5jZVxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgdGhlIGV4ZWN1dGVyIGlzIG5hbWVkIGFuZCB0aGUgbmFtZSBpcyBub3QgcmVnaXN0ZXJlZFxuXHQgKi9cblx0Y29uc3RydWN0b3IoeyBjb250ZXh0LCBwYXJlbnQgPSBudWxsLCBuYW1lID0gbnVsbCwgZXhlY3V0ZXIgfSA9IHt9KSB7XG5cdFx0aWYgKHBhcmVudCAhPSBudWxsICYmICEocGFyZW50IGluc3RhbmNlb2YgRXhwcmVzc2lvblJlc29sdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlRoZSBvcHRpb24gcGFyZW50IHRha2VzIGFuIEV4cHJlc3Npb25SZXNvbHZlciFcIik7XG5cdFx0aWYgKGNvbnRleHQgIT0gbnVsbCAmJiB0eXBlb2YgY29udGV4dCAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgY29udGV4dCAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBUaGUgb3B0aW9uIGNvbnRleHQgdGFrZXMgYW4gb2JqZWN0LCBub3QgYSAke3R5cGVvZiBjb250ZXh0fSFgKTtcblx0XHRpZiAoZXhlY3V0ZXIgIT0gbnVsbCAmJiB0eXBlb2YgZXhlY3V0ZXIgIT09IFwic3RyaW5nXCIgJiYgIShleGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihgVGhlIG9wdGlvbiBleGVjdXRlciB0YWtlcyBhIHJlZ2lzdGVyZWQgbmFtZSBvciBhbiBFeGVjdXRlciwgbm90IGEgJHt0eXBlb2YgZXhlY3V0ZXJ9IWApO1xuXHRcdHRoaXMuI25hbWUgPSB0b05hbWUobmFtZSk7XG5cblx0XHRpZihleGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSB0aGlzLiNleGVjdXRlciA9ICBleGVjdXRlcjtcblx0XHRlbHNlIGlmICh0eXBlb2YgZXhlY3V0ZXIgPT09IFwic3RyaW5nXCIpIHRoaXMuI2V4ZWN1dGVyID0gZ2V0RXhlY3V0ZXIoZXhlY3V0ZXIpO1xuXHRcdGVsc2UgaWYocGFyZW50ICE9IG51bGwpIHRoaXMuI2V4ZWN1dGVyID0gcGFyZW50LmV4ZWN1dGVyO1xuXHRcdGVsc2UgdGhpcy4jZXhlY3V0ZXIgPSBFeHByZXNzaW9uUmVzb2x2ZXIuZGVmYXVsdEV4ZWN1dGVyO1xuXG5cdFx0dGhpcy4jcGFyZW50ID0gcGFyZW50O1xuXHRcdHRoaXMuI2NvbnRleHRIYW5kbGUgPSBuZXcgUmVzb2x2ZXJDb250ZXh0SGFuZGxlKGNvbnRleHQgLCB0aGlzLiNwYXJlbnQgPyB0aGlzLiNwYXJlbnQuY29udGV4dEhhbmRsZSA6IG51bGwpO1xuXHRcdHRoaXMuI2NvbnRleHQgPSB0aGlzLiNjb250ZXh0SGFuZGxlLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5hbWUgdGhpcyByZXNvbHZlciBpcyBhZGRyZXNzZWQgYnkgaW4gYSBzY29wZSBwcmVmaXggYW5kIGEgZmlsdGVyLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdGdldCBuYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLiNuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9XG5cdCAqL1xuXHRnZXQgcGFyZW50KCkge1xuXHRcdHJldHVybiB0aGlzLiNwYXJlbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbnRleHQgb2YgdGhpcyByZXNvbHZlciBhcyBhbiBleHByZXNzaW9uIHNlZXMgaXQuIEl0IGlzIG5vdCB0aGUgb2JqZWN0IHBhc3NlZCB0byB0aGVcblx0ICogY29uc3RydWN0b3IgYW5kIGl0IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbi4gT3ZlciB0aGUgZ2xvYmFsIG9iamVjdCBpdCBpcyB0aGUgZ2xvYmFsXG5cdCAqIG9iamVjdCBpdHNlbGYuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0IGNvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGV4ZWN1dGVyIGluIHVzZSwgY2hvc2VuIG9uY2UgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge0V4ZWN1dGVyfVxuXHQgKi9cblx0Z2V0IGV4ZWN1dGVyKCkge1xuXHRcdHJldHVybiB0aGlzLiNleGVjdXRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW50ZXJuYWwgaGFuZGxlIGJlaGluZCB0aGUgY29udGV4dCwgcHVibGljIGZvciBgcmVzZXRDYWNoZWAuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfVxuXHQgKi9cblx0Z2V0IGNvbnRleHRIYW5kbGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHRIYW5kbGU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5hbWVzIG9mIGV2ZXJ5IHJlc29sdmVyIGZyb20gdGhlIHJvb3QgZG93biB0byB0aGlzIG9uZSwgYXMgYSBwYXRoIC0gYC9yb290L+KApi90aGlzYC4gSXRcblx0ICogZGVzY3JpYmVzIHRoZSBzdHJ1Y3R1cmUgYW5kIGRvZXMgbm90IGNoYW5nZS5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHRnZXQgY2hhaW4oKSB7XG5cdFx0Ly8gYSBsb29wLCBub3QgYSByZWN1cnNpb24gaW50byB0aGUgcGFyZW50OiBhIGRlZXAgY2hhaW4gb3ZlcmZsb3dlZCB0aGUgc3RhY2tcblx0XHRsZXQgcGF0aCA9IFwiXCI7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdHBhdGggPSBgLyR7cmVzb2x2ZXIubmFtZX0ke3BhdGh9YDtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBuYW1lcyBvZiB0aGUgcmVzb2x2ZXJzIGZyb20gdGhlIHJvb3QgZG93biB0byB0aGlzIG9uZSB0aGF0IHByb3ZpZGUgYSBjb250ZXh0LCBhcyBhIHBhdGhcblx0ICogbGlrZSBgY2hhaW5gLiBBIHJlc29sdmVyIGJ1aWx0IHdpdGhvdXQgYSBjb250ZXh0IGpvaW5zIGl0IHRoZSBtb21lbnQgYSB2YWx1ZSBpcyBzZXQgb24gaXQsIHNvXG5cdCAqIHRoaXMgZGVzY3JpYmVzIGEgc3RhdGUgYW5kIG5vdCB0aGUgc3RydWN0dXJlLiBXaGVyZSBub25lIHByb3ZpZGVzIG9uZSxcblx0ICogdGhlIGFuc3dlciBpcyB0aGUgZW1wdHkgc3RyaW5nLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdGdldCBlZmZlY3RpdmVDaGFpbigpIHtcblx0XHQvLyBhIGxvb3AsIG5vdCBhIHJlY3Vyc2lvbiBpbnRvIHRoZSBwYXJlbnQ6IGEgZGVlcCBjaGFpbiBvdmVyZmxvd2VkIHRoZSBzdGFja1xuXHRcdGxldCBwYXRoID0gXCJcIjtcblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0aWYgKHJlc29sdmVyLmNvbnRleHRIYW5kbGUucHJvdmlkZXNDb250ZXh0KSBwYXRoID0gYC8ke3Jlc29sdmVyLm5hbWV9JHtwYXRofWA7XG5cdFx0XHRyZXNvbHZlciA9IHJlc29sdmVyLnBhcmVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29udGV4dHMgb2YgZXhhY3RseSB0aGUgcmVzb2x2ZXJzIGBlZmZlY3RpdmVDaGFpbmAgbmFtZXMsIGFzIGFuIGFycmF5LCB0aGlzIHJlc29sdmVyJ3Ncblx0ICogZmlyc3QgYW5kIHRoZSByb290J3MgbGFzdC4gQSBzdGF0ZSBsaWtlIGBlZmZlY3RpdmVDaGFpbmAuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7QXJyYXk8b2JqZWN0Pn1cblx0ICovXG5cdGdldCBjb250ZXh0Q2hhaW4oKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLnByb3ZpZGVzQ29udGV4dCkgcmVzdWx0LnB1c2gocmVzb2x2ZXIuY29udGV4dCk7XG5cblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHJlc29sdmVyIGEgY2FsbCBhZGRyZXNzZXM6IHRoZSBvbmUgdGhlIGZpbHRlciBuYW1lcywgb3IgdGhlIHJlc29sdmVyIHRoZSBjYWxsIHdhcyBtYWRlIG9uXG5cdCAqIHdoZXJlIG5vIGZpbHRlciBpcyBnaXZlbi5cblx0ICpcblx0ICogQSBmaWx0ZXIgc2VsZWN0cyBleGFjdGx5IG9uZSByZXNvbHZlciwgdGhlIG5lYXJlc3Qgb2YgdGhhdCBuYW1lIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LCBhbmRcblx0ICogYSBmaWx0ZXIgbWF0Y2hpbmcgbm9uZSB0aHJvd3MgLSBhIHdyb25nIG5hbWUgaW4gYW4gQVBJIGNhbGwgaXMgYSBtaXN0YWtlIGluIHRoZSBjYWxsaW5nIGNvZGUsXG5cdCAqIHVubGlrZSBhIHNjb3BlIHByZWZpeCBpbnNpZGUgYW4gZXhwcmVzc2lvbiwgd2hpY2ggYW5zd2VycyB1bmRlZmluZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gYVNjb3BlIHRoZSBmaWx0ZXIgYXMgYHRvU2NvcGVgIHJlYWRzIGl0XG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XG5cdCAqL1xuXHQjZmluZFJlc29sdmVyKGFTY29wZSkge1xuXHRcdGlmICghYVNjb3BlKSByZXR1cm4gdGhpcztcblxuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jcmVzb2x2ZXJGb3JTY29wZShhU2NvcGUpO1xuXHRcdGlmIChyZXNvbHZlcikgcmV0dXJuIHJlc29sdmVyO1xuXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBGaWx0ZXIgXCIke2FTY29wZX1cIiBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpbiFgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmVhcmVzdCByZXNvbHZlciBmcm9tIGhlcmUgdG8gdGhlIHJvb3QgdGhhdCBjYXJyaWVzIHRoZSBzY29wZSBuYW1lLCBvciBudWxsIHdoZXJlIG5vbmVcblx0ICogY2FycmllcyBpdC4gQSBmaWx0ZXIgYW5kIGEgc2NvcGUgcHJlZml4IGFuc3dlciBhIG1pc3MgZGlmZmVyZW50bHksIHNvIGVhY2ggY2FsbGVyIGRvZXMgdGhhdFxuXHQgKiBmb3IgaXRzZWxmLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gYVNjb3BlXG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ8bnVsbH1cblx0ICovXG5cdCNyZXNvbHZlckZvclNjb3BlKGFTY29wZSkge1xuXHRcdC8vIGEgbG9vcCwgbm90IGEgcmVjdXJzaW9uIGludG8gdGhlIHBhcmVudDogb25lIGNhbGwgcGVyIHJlc29sdmVyIGNsaW1iZWQgb3ZlcmZsb3dlZCB0aGVcblx0XHQvLyBzdGFjayBvbiBhIGRlZXAgY2hhaW5cblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0aWYgKHJlc29sdmVyLiNuYW1lID09PSBhU2NvcGUpIHJldHVybiByZXNvbHZlcjtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIuI3BhcmVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kcyBhIHN0YXRlbWVudCB0byB0aGUgcmVzb2x2ZXIgaXQgYWRkcmVzc2VzIC0gdGhlIG9uZSBpdHMgc2NvcGUgcHJlZml4IG5hbWVzLCBvciB0aGlzIG9uZVxuXHQgKiB3aXRob3V0IGEgcHJlZml4IC0gYW5kIGFuc3dlcnMgd2hhdCB0aGF0IHJlc29sdmVyJ3MgZXhlY3V0ZXIgYW5zd2VycywgYSBwcm9taXNlIGluY2x1ZGVkLiBBblxuXHQgKiBlbXB0eSBzdGF0ZW1lbnQgYW5kIGEgcHJlZml4IG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpbiBjYXJyaWVzIGFuc3dlciB1bmRlZmluZWQsIGFuZCB0aGUgZGVmYXVsdFxuXHQgKiBhcHBsaWVzIHRvIGl0IGxpa2UgdG8gYW55IG90aGVyIHJlc3VsdC5cblx0ICpcblx0ICogRGVsaWJlcmF0ZWx5IG5vdCBhc3luYzogdGhlIGVudHJ5IHBvaW50IGF3YWl0cyB0aGUgYW5zd2VyIG9uY2UsIGFuZCBhIHN5bmNocm9ub3VzIHRocm93IG9mIHRoZVxuXHQgKiBleGVjdXRlciBsYW5kcyBpbiBpdHMgYHRyeWAgYWxsIHRoZSBzYW1lLiBBbiBlcnJvciBpcyBub3QgY2F1Z2h0IGhlcmUsIGJlY2F1c2UgdGhlIHR3byBlbnRyeVxuXHQgKiBwb2ludHMgYW5zd2VyIGl0IGRpZmZlcmVudGx5LlxuXHQgKlxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGFTdGF0ZW1lbnQgdHJpbW1lZCwgYW5kIG51bGwgd2hlcmUgaXQgaXMgZW1wdHlcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBhU2NvcGUgdGhlIHNjb3BlIHByZWZpeCwgbnVsbCB3aGVyZSB0aGVyZSBpcyBub25lXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKi9cblx0I2V4ZWN1dGUoYVN0YXRlbWVudCwgYVNjb3BlKSB7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBhU2NvcGUgPyB0aGlzLiNyZXNvbHZlckZvclNjb3BlKGFTY29wZSkgOiB0aGlzO1xuXHRcdC8vIGFuIGVtcHR5IHN0YXRlbWVudCBhbnN3ZXJzIHVuZGVmaW5lZCwgdGhlIHNhbWUgYXMgYHJldHVybjtgIGluIEphdmFTY3JpcHRcblx0XHRpZiAocmVzb2x2ZXIgPT09IG51bGwgfHwgYVN0YXRlbWVudCA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLiNleGVjdXRlci5leGVjdXRlKGFTdGF0ZW1lbnQsIHJlc29sdmVyLiNjb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmVhcmVzdCByZXNvbHZlciBmcm9tIGhlcmUgdG8gdGhlIHJvb3QgdGhhdCBjYXJyaWVzIHRoZSBrZXkgaXRzZWxmLCBvciBudWxsIHdoZXJlIG5vbmVcblx0ICogY2FycmllcyBpdC4gV2hhdCBkZWNpZGVzIGlzIHdoZXRoZXIgYSByZXNvbHZlciBwcm92aWRlcyB0aGUgbmFtZSwgbm90IHdoYXQgaXQgaG9sZHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcnxudWxsfVxuXHQgKi9cblx0I3Jlc29sdmVyRm9yS2V5KGtleSkge1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5oYXNOYW1lKGtleSkpIHJldHVybiByZXNvbHZlcjtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGEgdmFsdWUgYWxvbmcgdGhlIGNoYWluLCBmcm9tIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIgdG93YXJkcyB0aGUgcm9vdC4gV2l0aG91dCBhIGtleSAtXG5cdCAqIG51bGwgb3IgdW5kZWZpbmVkIC0gaXQgYW5zd2VycyB0aGUgd2hvbGUgY29udGV4dCBvZiB0aGF0IHJlc29sdmVyLCB3aGljaCBzdGlsbCBzZWVzIHRoZSBjaGFpbiBvblxuXHQgKiBldmVyeSBhY2Nlc3MuXG5cdCAqXG5cdCAqIEBwYXJhbSB7PyhzdHJpbmd8bnVtYmVyfHN5bWJvbCl9IFtrZXldIGEgcHJvcGVydHkga2V5OyBhIG51bWJlciBpcyBsb29rZWQgdXAgYXMgaXRzIHN0cmluZ1xuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtmaWx0ZXJdIHRoZSBzY29wZSBuYW1lIG9mIHRoZSByZXNvbHZlciB0aGUgY2FsbCBhZGRyZXNzZXM7IHdpdGhvdXQgb25lLCB0aGlzXG5cdCAqIHJlc29sdmVyXG5cdCAqIEByZXR1cm5zIHsqfSB0aGUgdmFsdWUsIG9yIHRoZSB3aG9sZSBjb250ZXh0IHdpdGhvdXQgYSBrZXlcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUga2V5IGlzIG9mIGEgdHlwZSBubyBwcm9wZXJ0eSBrZXkgaGFzLCBvciB0aGUgZmlsdGVyIG5vIHN0cmluZ1xuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgdGhlIGZpbHRlciBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpblxuXHQgKi9cblx0Z2V0RGF0YShrZXksIGZpbHRlcikge1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKHRvU2NvcGUoZmlsdGVyKSk7XG5cdFx0aWYgKGtleSA9PSBudWxsKSByZXR1cm4gcmVzb2x2ZXIuY29udGV4dDtcblxuXHRcdHJldHVybiByZXNvbHZlci5jb250ZXh0W3RvS2V5KGtleSldO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSB2YWx1ZSwgaW4gdGhlIG9iamVjdCB0aGUgY2FsbGVyIGhhbmRlZCBvdmVyLiBXaXRob3V0IGEgZmlsdGVyIHRoZSB2YWx1ZSBpcyBjaGFuZ2VkIHdoZXJlXG5cdCAqIHRoZSBrZXkgbGl2ZXMsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LCBhbmQgY3JlYXRlZCBoZXJlIHdoZXJlIG5vIHJlc29sdmVyIGNhcnJpZXNcblx0ICogaXQuIFdpdGggYSBmaWx0ZXIgdGhlIGFkZHJlc3NlZCByZXNvbHZlciBpcyB0aGUgdGFyZ2V0IG91dHJpZ2h0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8c3ltYm9sfSBrZXkgYSBwcm9wZXJ0eSBrZXk7IGEgbnVtYmVyIGlzIGxvb2tlZCB1cCBhcyBpdHMgc3RyaW5nXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWVcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBbZmlsdGVyXSB0aGUgc2NvcGUgbmFtZSBvZiB0aGUgcmVzb2x2ZXIgdGhlIGNhbGwgYWRkcmVzc2VzXG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIGtleSBpcyBtaXNzaW5nIG9yIG9mIGEgdHlwZSBubyBwcm9wZXJ0eSBrZXkgaGFzLCB0aGUgZmlsdGVyIG5vXG5cdCAqIHN0cmluZywgb3IgdGhlIG9iamVjdCByZWZ1c2VzIHRoZSB3cml0ZVxuXHQgKiBAdGhyb3dzIHtFcnJvcn0gd2hlcmUgdGhlIGZpbHRlciBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpblxuXHQgKi9cblx0dXBkYXRlRGF0YShrZXksIHZhbHVlLCBmaWx0ZXIpIHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHRvS2V5KGtleSk7XG5cdFx0Y29uc3Qgc2NvcGUgPSB0b1Njb3BlKGZpbHRlcik7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoc2NvcGUpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2NvcGUgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KHByb3BlcnR5KSB8fCB0aGlzO1xuXHRcdHRhcmdldC5jb250ZXh0W3Byb3BlcnR5XSA9IHZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIGtleSBmcm9tIG9uZSByZXNvbHZlciAtIHRoZSBhZGRyZXNzZWQgb25lIHdpdGggYSBmaWx0ZXIsIGFuZCB3aXRob3V0IG9uZSB0aGUgZmlyc3Rcblx0ICogcmVzb2x2ZXIgY2FycnlpbmcgaXQsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LiBSZW1vdmluZyBpdCB1bmNvdmVycyB0aGUgdmFsdWUgb2Zcblx0ICogdGhlIG5leHQgcmVzb2x2ZXIgdGhhdCBjYXJyaWVzIHRoZSBzYW1lIGtleS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfHN5bWJvbH0ga2V5IGEgcHJvcGVydHkga2V5OyBhIG51bWJlciBpcyBsb29rZWQgdXAgYXMgaXRzIHN0cmluZ1xuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtmaWx0ZXJdIHRoZSBzY29wZSBuYW1lIG9mIHRoZSByZXNvbHZlciB0aGUgY2FsbCBhZGRyZXNzZXNcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUga2V5IGlzIG1pc3Npbmcgb3Igb2YgYSB0eXBlIG5vIHByb3BlcnR5IGtleSBoYXMsIHRoZSBmaWx0ZXIgbm9cblx0ICogc3RyaW5nLCBvciB0aGUgb2JqZWN0IHJlZnVzZXMgdGhlIGRlbGV0aW9uXG5cdCAqIEB0aHJvd3Mge0Vycm9yfSB3aGVyZSB0aGUgZmlsdGVyIG1hdGNoZXMgbm8gcmVzb2x2ZXIgb2YgdGhlIGNoYWluXG5cdCAqL1xuXHRkZWxldGVEYXRhKGtleSwgZmlsdGVyKSB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSB0b0tleShrZXkpO1xuXHRcdGNvbnN0IHNjb3BlID0gdG9TY29wZShmaWx0ZXIpO1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKHNjb3BlKTtcblxuXHRcdGNvbnN0IHRhcmdldCA9IHNjb3BlID8gcmVzb2x2ZXIgOiB0aGlzLiNyZXNvbHZlckZvcktleShwcm9wZXJ0eSk7XG5cdFx0aWYgKHRhcmdldCkgZGVsZXRlIHRhcmdldC5jb250ZXh0W3Byb3BlcnR5XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNoYWxsb3cgYXNzaWdubWVudCwga2V5IGJ5IGtleSwgaW50byB0aGUgY29udGV4dCBvZiB0aGUgYWRkcmVzc2VkIHJlc29sdmVyLCByZXBsYWNpbmcgd2hhdCBpc1xuXHQgKiB0aGVyZSBhbmQgYWRkaW5nIHdoYXQgaXMgbm90LiBObyBzZWFyY2ggYWxvbmcgdGhlIGNoYWluOiBhIG1lcmdlZCBrZXkgc2hhZG93cyB0aGUgcmVzb2x2ZXJzXG5cdCAqIGFib3ZlIGZyb20gaGVyZSBvbi5cblx0ICpcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBjb250ZXh0IHRoZSBrZXlzIHRvIGFzc2lnbjsgbnVsbCBvciB1bmRlZmluZWQgY2hhbmdlcyBub3RoaW5nXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gW2ZpbHRlcl0gdGhlIHNjb3BlIG5hbWUgb2YgdGhlIHJlc29sdmVyIHRoZSBjYWxsIGFkZHJlc3Nlc1xuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBjb250ZXh0IGlzIGEgcHJpbWl0aXZlLCB0aGUgZmlsdGVyIG5vIHN0cmluZywgb3IgdGhlIG9iamVjdFxuXHQgKiByZWZ1c2VzIGEga2V5IC0gdGhlIGtleXMgYmVmb3JlIGl0IGFyZSB3cml0dGVuIGJ5IHRoZW5cblx0ICogQHRocm93cyB7RXJyb3J9IHdoZXJlIHRoZSBmaWx0ZXIgbWF0Y2hlcyBubyByZXNvbHZlciBvZiB0aGUgY2hhaW5cblx0ICovXG5cdG1lcmdlQ29udGV4dChjb250ZXh0LCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcih0b1Njb3BlKGZpbHRlcikpO1xuXHRcdGlmIChjb250ZXh0ID09IG51bGwpIHJldHVybjtcblx0XHRpZiAodHlwZW9mIGNvbnRleHQgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGNvbnRleHQgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgbWVyZ2VDb250ZXh0IHRha2VzIGFuIG9iamVjdCwgbm90IGEgJHt0eXBlb2YgY29udGV4dH0hYCk7XG5cblx0XHRyZXNvbHZlci5jb250ZXh0SGFuZGxlLm1lcmdlRGF0YShjb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBvbmUgZXhwcmVzc2lvbiB0byBpdHMgdmFsdWUsIG9mIHdoYXRldmVyIHR5cGUgdGhlIHN0YXRlbWVudCBhbnN3ZXJzLiBUYWtlcyB0aGVcblx0ICogZGVsaW1pdGVkIGZvcm0gYCR7Li4ufWAsIGEgc2NvcGUgcHJlZml4IGluY2x1ZGVkLCBvciBhIGJhcmUgc3RhdGVtZW50OyBhbiBpbnB1dCB0aGF0IGRvZXMgbm90XG5cdCAqIGJvdGggb3BlbiB3aXRoIGAke2AgYW5kIGVuZCB3aXRoIGB9YCBpcyBhIGJhcmUgc3RhdGVtZW50LiBBbiBlcnJvciBvZiB0aGUgc3RhdGVtZW50IGlzIGxvZ2dlZFxuXHQgKiBhbmQgaGFuZGVkIG9uLCBhbmQgdGhlIGRlZmF1bHQgbmV2ZXIgY292ZXJzIGl0LlxuXHQgKlxuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFFeHByZXNzaW9uXG5cdCAqIEBwYXJhbSB7Kn0gW2FEZWZhdWx0XSByZXBsYWNlcyBhIHJlc3VsdCBvZiBudWxsIG9yIHVuZGVmaW5lZCB3aGVyZSBpdCBpcyBwYXNzZWQsIHVuZGVmaW5lZFxuXHQgKiBpbmNsdWRlZFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgZXhwcmVzc2lvbiBpcyBubyBzdHJpbmdcblx0ICovXG5cdGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFEZWZhdWx0KSB7XG5cdFx0Ly8gYSBtaXN0YWtlIGluIHRoZSBjYWxsaW5nIGNvZGUsIG5vdCBhIGZhaWxlZCBzdGF0ZW1lbnQgLSBzbyBubyB3YXJuaW5nIGFuZCBubyBkZWZhdWx0XG5cdFx0aWYgKHR5cGVvZiBhRXhwcmVzc2lvbiAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihgcmVzb2x2ZSB0YWtlcyBhbiBleHByZXNzaW9uIGFzIGEgc3RyaW5nLCBub3QgYSAke3R5cGVvZiBhRXhwcmVzc2lvbn0hYCk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHR0cnkge1xuXHRcdFx0Ly8gdGhlIGRlbGltaXRlZCBmb3JtIG9yIGEgYmFyZSBzdGF0ZW1lbnQsIHRvbGQgYXBhcnQgYnkgdGhlIHNjYW5uZXJcblx0XHRcdGNvbnN0IHsgc2NvcGUsIHN0YXRlbWVudCB9ID0gcGFyc2VFeHByZXNzaW9uKGFFeHByZXNzaW9uKTtcblx0XHRcdHJldHVybiB3aXRoRGVmYXVsdChhd2FpdCB0aGlzLiNleGVjdXRlKHN0YXRlbWVudCwgc2NvcGUpLCBkZWZhdWx0VmFsdWUpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIHRoZSBlcnJvciBpcyBsb2dnZWQgYW5kIGhhbmRlZCBvbi4gcmVzb2x2ZSBhbnN3ZXJzIGEgdmFsdWUgb3Igc2F5cyB3aHkgaXQgY2Fubm90LFxuXHRcdFx0Ly8gYW5kIGEgZGVmYXVsdCB2YWx1ZSBjb3ZlcnMgYSBtaXNzaW5nIHJlc3VsdCwgbmV2ZXIgYW4gZXJyb3IuXG5cdFx0XHR3YXJuRmFpbGVkU3RhdGVtZW50KGFFeHByZXNzaW9uLCBlKTtcblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2VzIGV2ZXJ5IGV4cHJlc3Npb24gb2YgYSB0ZXh0IGJ5IGl0cyB2YWx1ZSBhbmQgYW5zd2VycyB0aGUgdGV4dC4gQW4gZXhwcmVzc2lvbiB3aG9zZVxuXHQgKiBzdGF0ZW1lbnQgZmFpbHMgc3RhbmRzIGFzIHdyaXR0ZW4sIGEgd2FybmluZyBuYW1lcyBpdCwgYW5kIHRoZSByZXN0IG9mIHRoZSB0ZXh0IGtlZXBzIHJlbmRlcmluZy5cblx0ICpcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuXHQgKiBAcGFyYW0geyp9IFthRGVmYXVsdF0gcmVwbGFjZXMgYSByZXN1bHQgb2YgbnVsbCBvciB1bmRlZmluZWQsIHBlciBleHByZXNzaW9uLCB3aGVyZSBpdCBpc1xuXHQgKiBwYXNzZWRcblx0ICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgdGV4dCBpcyBubyBzdHJpbmdcblx0ICovXG5cdGFzeW5jIHJlc29sdmVUZXh0KGFUZXh0LCBhRGVmYXVsdCkge1xuXHRcdGlmICh0eXBlb2YgYVRleHQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoYHJlc29sdmVUZXh0IHRha2VzIGEgdGV4dCBhcyBhIHN0cmluZywgbm90IGEgJHt0eXBlb2YgYVRleHR9IWApO1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cblx0XHRjb25zdCBvY2N1cnJlbmNlcyA9IHNjYW4oYVRleHQpO1xuXHRcdGlmICghb2NjdXJyZW5jZXMpIHJldHVybiBhVGV4dDtcblxuXHRcdGxldCB0ZXh0ID0gXCJcIjtcblx0XHRsZXQgcG9zaXRpb24gPSAwO1xuXHRcdGZvciAoY29uc3Qgb2NjdXJyZW5jZSBvZiBvY2N1cnJlbmNlcykge1xuXHRcdFx0Ly8gYW4gZXNjYXBpbmcgYmFja3NsYXNoIGlzIGNvbnN1bWVkLCBldmVyeXRoaW5nIGVsc2UgaW4gZnJvbnQgb2YgdGhlIGV4cHJlc3Npb25cblx0XHRcdC8vIHN0YW5kcyBhcyB3cml0dGVuXG5cdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhwb3NpdGlvbiwgb2NjdXJyZW5jZS5lc2NhcGVkID8gb2NjdXJyZW5jZS5zdGFydCAtIDEgOiBvY2N1cnJlbmNlLnN0YXJ0KTtcblx0XHRcdHBvc2l0aW9uID0gb2NjdXJyZW5jZS5lbmQ7XG5cblx0XHRcdGlmIChvY2N1cnJlbmNlLmVzY2FwZWQpIHtcblx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR0ZXh0ICs9IHdpdGhEZWZhdWx0KGF3YWl0IHRoaXMuI2V4ZWN1dGUob2NjdXJyZW5jZS5zdGF0ZW1lbnQsIG9jY3VycmVuY2Uuc2NvcGUpLCBkZWZhdWx0VmFsdWUpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Ly8gYW4gZXhwcmVzc2lvbiB3aG9zZSBzdGF0ZW1lbnQgZmFpbGVkIHN0YW5kcyBhcyB3cml0dGVuLCBhbmQgdGhlIGRlZmF1bHQgdmFsdWVcblx0XHRcdFx0XHQvLyBkb2VzIG5vdCBjb3ZlciBpdC4gVGhlIHJlc3Qgb2YgdGhlIHRleHQga2VlcHMgcmVuZGVyaW5nLlxuXHRcdFx0XHRcdHdhcm5GYWlsZWRTdGF0ZW1lbnQob2NjdXJyZW5jZS5zdGF0ZW1lbnQsIGUpO1xuXHRcdFx0XHRcdHRleHQgKz0gYVRleHQuc3Vic3RyaW5nKG9jY3VycmVuY2Uuc3RhcnQsIG9jY3VycmVuY2UuZW5kKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0ICsgYVRleHQuc3Vic3RyaW5nKHBvc2l0aW9uKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBvbmUgZXhwcmVzc2lvbiBhZ2FpbnN0IGFuIGFkLWhvYyBjb250ZXh0LCB0aHJvdWdoIGEgcmVzb2x2ZXIgb2YgaXRzIG93biwgYXMgdGhlIGluc3RhbmNlXG5cdCAqIGByZXNvbHZlYCBkb2VzLlxuXHQgKlxuXHQgKiBUYWtlcyB0aGUgYXJndW1lbnRzIHBvc2l0aW9uYWxseSwgb3Igb25lIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cdCAqIGB7IGV4cHJlc3Npb24sIGNvbnRleHQsIGRlZmF1bHRWYWx1ZSwgdGltZW91dCB9YCwgYmVoaW5kIHdoaWNoIGV2ZXJ5IGFyZ3VtZW50IGlzIGlnbm9yZWQuIEEgZmlyc3Rcblx0ICogYXJndW1lbnQgdGhhdCBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBvYmplY3QsIGFuZCBhIGNvbmZpZ3VyYXRpb24gd2l0aG91dCBhIHN0cmluZyB1bmRlclxuXHQgKiBgZXhwcmVzc2lvbmAsIHJlamVjdCB3aXRoIGEgYFR5cGVFcnJvcmAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfHsgZXhwcmVzc2lvbjogc3RyaW5nLCBjb250ZXh0Pzogb2JqZWN0LCBkZWZhdWx0VmFsdWU/OiAqLCB0aW1lb3V0PzogbnVtYmVyIH19IGFFeHByZXNzaW9uXG5cdCAqIEBwYXJhbSB7P29iamVjdH0gW2FDb250ZXh0XVxuXHQgKiBAcGFyYW0geyp9IFthRGVmYXVsdF0gcmVwbGFjZXMgYSByZXN1bHQgb2YgbnVsbCBvciB1bmRlZmluZWQgd2hlcmUgaXQgaXMgcGFzc2VkXG5cdCAqIEBwYXJhbSB7P251bWJlcn0gW2FUaW1lb3V0XSBkZWxheXMgdGhlIHN0YXJ0IGJ5IHRoYXQgbWFueSBtaWxsaXNlY29uZHM7IG5vIGRlYWRsaW5lXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBhcmd1bWVudHMgdGFrZSBuZWl0aGVyIGZvcm0sIG9yIHRoZSBjb250ZXh0IGlzIGEgcHJpbWl0aXZlXG5cdCAqL1xuXHRzdGF0aWMgYXN5bmMgcmVzb2x2ZShhRXhwcmVzc2lvbiwgYUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCkge1xuXHRcdGlmIChpc0NvbmZpZ3VyYXRpb24oYXJndW1lbnRzWzBdKSkge1xuXHRcdFx0Y29uc3QgeyBleHByZXNzaW9uLCBjb250ZXh0LCB0aW1lb3V0IH0gPSBhcmd1bWVudHNbMF07XG5cdFx0XHRpZiAodHlwZW9mIGV4cHJlc3Npb24gIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZSB0YWtlcyBhIGNvbmZpZ3VyYXRpb24gY2FycnlpbmcgdGhlIGV4cHJlc3Npb24gYXMgYSBzdHJpbmcgdW5kZXIgdGhlIGtleSBleHByZXNzaW9uIVwiKTtcblx0XHRcdHJldHVybiBFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZShleHByZXNzaW9uLCBjb250ZXh0LCBkZWZhdWx0T2YoYXJndW1lbnRzWzBdKSwgdGltZW91dCk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgYUV4cHJlc3Npb24gIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZSB0YWtlcyBhIHN0cmluZyBvciBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IVwiKTtcblxuXHRcdGNvbnN0IHJlc29sdmVyID0gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQ6IGFDb250ZXh0IH0pO1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHRpZiAodHlwZW9mIGFUaW1lb3V0ID09PSBcIm51bWJlclwiICYmIGFUaW1lb3V0ID4gMClcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRyZXNvbHZlKHJlc29sdmVyLnJlc29sdmUoYUV4cHJlc3Npb24sIGRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHR9LCBhVGltZW91dCk7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiByZXNvbHZlci5yZXNvbHZlKGFFeHByZXNzaW9uLCBkZWZhdWx0VmFsdWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2VzIGV2ZXJ5IGV4cHJlc3Npb24gb2YgYSB0ZXh0IGFnYWluc3QgYW4gYWQtaG9jIGNvbnRleHQsIHRocm91Z2ggYSByZXNvbHZlciBvZiBpdHMgb3duLCBhc1xuXHQgKiB0aGUgaW5zdGFuY2UgYHJlc29sdmVUZXh0YCBkb2VzLlxuXHQgKlxuXHQgKiBUYWtlcyB0aGUgYXJndW1lbnRzIHBvc2l0aW9uYWxseSwgb3Igb25lIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cdCAqIGB7IHRleHQsIGNvbnRleHQsIGRlZmF1bHRWYWx1ZSwgdGltZW91dCB9YCwgYmVoaW5kIHdoaWNoIGV2ZXJ5IGFyZ3VtZW50IGlzIGlnbm9yZWQuIEEgZmlyc3Rcblx0ICogYXJndW1lbnQgdGhhdCBpcyBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBvYmplY3QsIGFuZCBhIGNvbmZpZ3VyYXRpb24gd2l0aG91dCBhIHN0cmluZyB1bmRlclxuXHQgKiBgdGV4dGAsIHJlamVjdCB3aXRoIGEgYFR5cGVFcnJvcmAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfHsgdGV4dDogc3RyaW5nLCBjb250ZXh0Pzogb2JqZWN0LCBkZWZhdWx0VmFsdWU/OiAqLCB0aW1lb3V0PzogbnVtYmVyIH19IGFUZXh0XG5cdCAqIEBwYXJhbSB7P29iamVjdH0gW2FDb250ZXh0XVxuXHQgKiBAcGFyYW0geyp9IFthRGVmYXVsdF0gcmVwbGFjZXMgYSByZXN1bHQgb2YgbnVsbCBvciB1bmRlZmluZWQsIHBlciBleHByZXNzaW9uLCB3aGVyZSBpdCBpc1xuXHQgKiBwYXNzZWRcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBbYVRpbWVvdXRdIGRlbGF5cyB0aGUgc3RhcnQgYnkgdGhhdCBtYW55IG1pbGxpc2Vjb25kczsgbm8gZGVhZGxpbmVcblx0ICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn1cblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVyZSB0aGUgYXJndW1lbnRzIHRha2UgbmVpdGhlciBmb3JtLCBvciB0aGUgY29udGV4dCBpcyBhIHByaW1pdGl2ZVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmVUZXh0KGFUZXh0LCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XHRcdFxuXHRcdGlmIChpc0NvbmZpZ3VyYXRpb24oYXJndW1lbnRzWzBdKSkge1xuXHRcdFx0Y29uc3QgeyB0ZXh0LCBjb250ZXh0LCB0aW1lb3V0IH0gPSBhcmd1bWVudHNbMF07XG5cdFx0XHRpZiAodHlwZW9mIHRleHQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZVRleHQgdGFrZXMgYSBjb25maWd1cmF0aW9uIGNhcnJ5aW5nIHRoZSB0ZXh0IGFzIGEgc3RyaW5nIHVuZGVyIHRoZSBrZXkgdGV4dCFcIik7XG5cdFx0XHRyZXR1cm4gRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmVUZXh0KHRleHQsIGNvbnRleHQsIGRlZmF1bHRPZihhcmd1bWVudHNbMF0pLCB0aW1lb3V0KTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBhVGV4dCAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlVGV4dCB0YWtlcyBhIHN0cmluZyBvciBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IVwiKTtcblxuXHRcdGNvbnN0IHJlc29sdmVyID0gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQ6IGFDb250ZXh0IH0pO1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHRpZiAodHlwZW9mIGFUaW1lb3V0ID09PSBcIm51bWJlclwiICYmIGFUaW1lb3V0ID4gMClcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRyZXNvbHZlKHJlc29sdmVyLnJlc29sdmVUZXh0KGFUZXh0LCBkZWZhdWx0VmFsdWUpKTtcblx0XHRcdFx0fSwgYVRpbWVvdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZVRleHQoYVRleHQsIGRlZmF1bHRWYWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIGEgcmVzb2x2ZXIgb3ZlciBhIGZpbHRlcmVkIGNvcHkgb2YgdGhlIGNvbnRleHQuXG5cdCAqXG5cdCAqIFRoZSBmaWx0ZXIgaXMgYXBwbGllZCB0byB0aGUgY29udGV4dCBvbmx5LCBuZXZlciB0byB0aGUgZ2xvYmFscywgc28gdGhpcyBpcyBhIHdheSB0byBoYW5kXG5cdCAqIG92ZXIgYSBjbGVhbmVkIGNvbnRleHQgYW5kIG5vdCBhIHNhbmRib3guXG5cdCAqXG5cdCAqIGBvcHRpb25gIGNhcnJpZXMgdGhlIGZpbHRlcidzIG93biBgZGVlcGAgdG9nZXRoZXIgd2l0aCB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBgbmFtZWAsXG5cdCAqIGBwYXJlbnRgIGFuZCBgZXhlY3V0ZXJgLCB3aGljaCBhcmUgaGFuZGVkIG9uIGFzIHRoZXkgYXJlLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhcmcgdGhlIGZpbHRlciBhcmd1bWVudHMsIHBsdXMgdGhlIHdob2xlIGNvbnN0cnVjdG9yIG9wdGlvbiBzZXRcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZy5jb250ZXh0IHRoZSBvYmplY3QgdG8gY29weTsgaXQgaXMgbGVmdCB1bnRvdWNoZWRcblx0ICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcsICosIG9iamVjdCk6IGJvb2xlYW59IGFyZy5wcm9wRmlsdGVyIGNhbGxlZCB3aXRoIG5hbWUsIHZhbHVlIGFuZCB0aGVcblx0ICogb2JqZWN0IGhvbGRpbmcgaXQgZm9yIGV2ZXJ5IGVudW1lcmFibGUgcHJvcGVydHksIGluaGVyaXRlZCBvbmVzIGluY2x1ZGVkOyBhIHByb3BlcnR5IGl0XG5cdCAqIGFuc3dlcnMgZmFsc2UgZm9yIGlzIGxlZnQgb3V0IG9mIHRoZSBjb3B5XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbYXJnLm9wdGlvbj17IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfV1cblx0ICogQHBhcmFtIHtib29sZWFufSBbYXJnLm9wdGlvbi5kZWVwPXRydWVdIGZpbHRlcnMgc3ViIG9iamVjdHMgYXMgd2VsbFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2FyZy5vcHRpb24ubmFtZT1udWxsXVxuXHQgKiBAcGFyYW0ge0V4cHJlc3Npb25SZXNvbHZlcn0gW2FyZy5vcHRpb24ucGFyZW50PW51bGxdXG5cdCAqIEBwYXJhbSB7KHN0cmluZ3xFeGVjdXRlcil9IFthcmcub3B0aW9uLmV4ZWN1dGVyPW51bGxdXG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XG5cdCAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgYSBjb25zdHJ1Y3RvciBvcHRpb24gaXMgb2YgdGhlIHdyb25nIGtpbmQsIGFzIHRoZSBjb25zdHJ1Y3RvciB0aHJvd3Ncblx0ICovXG5cdHN0YXRpYyBidWlsZEZpbHRlcmVkKHsgY29udGV4dCwgcHJvcEZpbHRlciwgb3B0aW9uID0geyBkZWVwOiB0cnVlLCBuYW1lOiBudWxsLCBwYXJlbnQ6IG51bGwsIGV4ZWN1dGVyOiBudWxsIH0gfSkge1xuXHRcdGNvbnN0IHsgZGVlcCA9IHRydWUsIG5hbWUsIHBhcmVudCwgZXhlY3V0ZXIgfSA9IG9wdGlvbjtcblx0XHRjb250ZXh0ID0gT2JqZWN0VXRpbHMuZmlsdGVyKGNvbnRleHQsIHByb3BGaWx0ZXIsIHtkZWVwfSk7XG5cdFx0cmV0dXJuIG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0LCBuYW1lLCBwYXJlbnQsIGV4ZWN1dGVyIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmb3JtZXIgbmFtZSBvZiBgYnVpbGRGaWx0ZXJlZGAuIEl0IHByb21pc2VkIGEgc2VjdXJpdHkgdGhlIG1ldGhvZCBkb2VzIG5vdCBnaXZlLlxuXHQgKlxuXHQgKiBAZGVwcmVjYXRlZCB1c2UgYGJ1aWxkRmlsdGVyZWRgXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZyB0aGUgYXJndW1lbnRzIG9mIGBidWlsZEZpbHRlcmVkYFxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfVxuXHQgKi9cblx0c3RhdGljIGJ1aWxkU2VjdXJlKGFyZykge1xuXHRcdHJldHVybiBFeHByZXNzaW9uUmVzb2x2ZXIuYnVpbGRGaWx0ZXJlZChhcmcpO1xuXHR9XG59XG5cbiIsIi8qKlxuICogRmluZHMgdGhlIGV4cHJlc3Npb25zIG9mIGEgdGV4dCBhbmQgdGFrZXMgYSBzaW5nbGUgZXhwcmVzc2lvbiBhcGFydC4gSXQgcmVhZHMgd2hlcmUgYW4gZXhwcmVzc2lvblxuICogYmVnaW5zIGFuZCBlbmRzLCB3aGV0aGVyIGl0IGlzIGVzY2FwZWQsIGFuZCB3aGljaCBzY29wZSBwcmVmaXggaXQgY2FycmllczsgZXZhbHVhdGluZyBhIHN0YXRlbWVudFxuICogYW5kIGFkZHJlc3NpbmcgYSBzY29wZSBpcyBFeHByZXNzaW9uUmVzb2x2ZXIncy5cbiAqXG4gKiBJbnRlcm5hbCB0byB0aGUgcGFja2FnZTogaW5kZXguanMgZG9lcyBub3QgZXhwb3J0IGl0LlxuICovXG5cbmltcG9ydCB7IFdISVRFU1BBQ0UsIGlzTmFtZUNoYXJhY3RlciwgdHJpbVRvTnVsbCB9IGZyb20gXCIuL1V0aWxzLmpzXCI7XG5cbmNvbnN0IEVYUFJFU1NJT05fU1RBUlQgPSBcIiR7XCI7XG5cbi8vIHRoZSBzY2FubmVyIHN0YXRlcyAtIGV2ZXJ5dGhpbmcgdGhhdCBpcyBub3QgY29kZSBoaWRlcyB0aGUgYnJhY2VzIGluc2lkZSBpdFxuY29uc3QgQ09ERSA9IDA7XG5jb25zdCBTSU5HTEVfUVVPVEVEID0gMTtcbmNvbnN0IERPVUJMRV9RVU9URUQgPSAyO1xuY29uc3QgVEVNUExBVEUgPSAzO1xuY29uc3QgUkVHRVggPSA0O1xuY29uc3QgUkVHRVhfQ0xBU1MgPSA1O1xuY29uc3QgQkxPQ0tfQ09NTUVOVCA9IDY7XG5jb25zdCBMSU5FX0NPTU1FTlQgPSA3O1xuXG4vLyBhIFwiL1wiIGNvbnRpbnVlcyBhbiBleHByZXNzaW9uIGluc3RlYWQgb2Ygb3BlbmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB3aGVuIGl0IGZvbGxvd3Mgb25lIG9mXG4vLyB0aGVzZSAtIHRoZSBjbGFzc2ljIGRpdmlzaW9uLW9yLXJlZ2V4IHF1ZXN0aW9uLCBkZWNpZGVkIG9uIHRoZSBsYXN0IGNoYXJhY3RlciB0aGF0IGlzIG5laXRoZXJcbi8vIHdoaXRlc3BhY2Ugbm9yIHBhcnQgb2YgYSBjb21tZW50XG5jb25zdCBCRUZPUkVfRElWSVNJT04gPSAvW2EtekEtWjAtOV8kKVxcXV0vO1xuXG4vLyB0aGUgY2hhcmFjdGVycyB0aGUgc2Nhbm5lciBkZWNpZGVzIG9uLCBjb21wYXJlZCBhcyBjaGFyIGNvZGVzIHJhdGhlciB0aGFuIGFzIG9uZS1jaGFyYWN0ZXIgc3RyaW5nc1xuY29uc3QgQkFDS1NMQVNIID0gMHg1YztcbmNvbnN0IERPTExBUiA9IDB4MjQ7XG5jb25zdCBPUEVOX0JSQUNFID0gMHg3YjtcbmNvbnN0IENMT1NFX0JSQUNFID0gMHg3ZDtcbmNvbnN0IFNJTkdMRV9RVU9URSA9IDB4Mjc7XG5jb25zdCBET1VCTEVfUVVPVEUgPSAweDIyO1xuY29uc3QgQkFDS1RJQ0sgPSAweDYwO1xuY29uc3QgU0xBU0ggPSAweDJmO1xuY29uc3QgU1RBUiA9IDB4MmE7XG5jb25zdCBMSU5FX0ZFRUQgPSAweDBhO1xuY29uc3QgQ0FSUklBR0VfUkVUVVJOID0gMHgwZDtcbmNvbnN0IExJTkVfU0VQQVJBVE9SID0gMHgyMDI4O1xuY29uc3QgUEFSQUdSQVBIX1NFUEFSQVRPUiA9IDB4MjAyOTtcbmNvbnN0IE9QRU5fQlJBQ0tFVCA9IDB4NWI7XG5jb25zdCBDTE9TRV9CUkFDS0VUID0gMHg1ZDtcbmNvbnN0IENPTE9OID0gMHgzYTtcblxuY29uc3QgU0NPUEVfU0VQQVJBVE9SID0gXCI6OlwiO1xuXG4vKipcbiAqIFdoZXRoZXIgdGhlIFwiL1wiIGF0IGFJbmRleCBvcGVucyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBsaXRlcmFsLCBkZWNpZGVkIG9uIHRoZSBjaGFyYWN0ZXIgYmVmb3JlIGl0XG4gKiB0aGF0IGlzIG5laXRoZXIgd2hpdGVzcGFjZSBub3IgcGFydCBvZiBhIGNvbW1lbnQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gYUluZGV4XG4gKiBAcGFyYW0gez9BcnJheTxudW1iZXI+fSB0aGVDb21tZW50cyB0aGUgY29tbWVudHMgcmVhZCBzbyBmYXIgYXMgZmxhdCBzdGFydCBhbmQgZW5kIGluZGV4IHBhaXJzLCBpblxuICogdGhlIG9yZGVyIHRoZXkgc3RhbmQ7IG51bGwgd2hlcmUgdGhlIGV4cHJlc3Npb24gaGFzIG5vbmVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5jb25zdCBzbGFzaE9wZW5zUmVnZXggPSAoYVRleHQsIGFJbmRleCwgdGhlQ29tbWVudHMpID0+IHtcblx0bGV0IGluZGV4ID0gYUluZGV4IC0gMTtcblx0bGV0IGNvbW1lbnQgPSB0aGVDb21tZW50cyA/IHRoZUNvbW1lbnRzLmxlbmd0aCAtIDEgOiAtMTtcblx0d2hpbGUgKGluZGV4ID49IDApIHtcblx0XHR3aGlsZSAoaW5kZXggPj0gMCAmJiBXSElURVNQQUNFLnRlc3QoYVRleHRbaW5kZXhdKSkgaW5kZXgtLTtcblx0XHQvLyBhIGxpbmUgY29tbWVudCBtYXkgZW5kIGluIHdoaXRlc3BhY2UsIHNvIHRoZSB3YWxrIGNhbiBsYW5kIGluc2lkZSBpdCByYXRoZXIgdGhhbiBvbiBpdHMgZW5kXG5cdFx0aWYgKGNvbW1lbnQgPCAwIHx8IGluZGV4IDwgdGhlQ29tbWVudHNbY29tbWVudCAtIDFdIHx8IGluZGV4ID4gdGhlQ29tbWVudHNbY29tbWVudF0pIGJyZWFrO1xuXG5cdFx0aW5kZXggPSB0aGVDb21tZW50c1tjb21tZW50IC0gMV0gLSAxO1xuXHRcdGNvbW1lbnQgLT0gMjtcblx0fVxuXG5cdHJldHVybiBpbmRleCA8IDAgfHwgIUJFRk9SRV9ESVZJU0lPTi50ZXN0KGFUZXh0W2luZGV4XSk7XG59O1xuXG4vKipcbiAqIFdoZXRoZXIgYSBjaGFyIGNvZGUgZW5kcyBhIGxpbmUgY29tbWVudCAtIGEgbGluZSB0ZXJtaW5hdG9yIGluIHRoZSBzZW5zZSBvZiBFQ01BU2NyaXB0LlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBhQ29kZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzTGluZVRlcm1pbmF0b3IgPSAoYUNvZGUpID0+IGFDb2RlID09PSBMSU5FX0ZFRUQgfHwgYUNvZGUgPT09IENBUlJJQUdFX1JFVFVSTiB8fCBhQ29kZSA9PT0gTElORV9TRVBBUkFUT1IgfHwgYUNvZGUgPT09IFBBUkFHUkFQSF9TRVBBUkFUT1I7XG5cbi8qXG4gKiBUd28gc3BsaXRzIHRha2UgdGhlIHRleHQgYmV0d2VlbiB0aGUgZGVsaW1pdGVycyBhcGFydCBpbnRvIHRoZSBzY29wZSBwcmVmaXggYW5kIHRoZVxuICogc3RhdGVtZW50IC0gdGhpcyBvbmUgZm9yIGEgdGV4dCwgYHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRCeVNlcGFyYXRvcmAgYmVoaW5kIGBwYXJzZUV4cHJlc3Npb25gIGZvclxuICogdGhlIHNpbmdsZSBleHByZXNzaW9uIG9mIGByZXNvbHZlYC4gVGhleSBhcmUgdHdvIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgb25lIHJ1bGUsIGVhY2ggbWVhc3VyZWRcbiAqIGZhc3RlciBmb3Igb3RoZXIgc3RhdGVtZW50czogYSB0ZXh0IHJlYWRzIGZvcndhcmRzLCB0aGUgc2luZ2xlIGV4cHJlc3Npb24gZnJvbSB0aGUgZmlyc3QgXCI6OlwiXG4gKiBiYWNrd2FyZHMuIEJvdGggaGF2ZSB0byBhbnN3ZXIgZXZlcnkgY2FzZSBhbGlrZS5cbiAqL1xuXG4vKipcbiAqIFRoZSBzcGxpdCBvZiBhIHRleHQ6IHJlYWRzIGZvcndhcmRzIG9ubHkgYXMgZmFyIGFzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgYSBuYW1lIGNhbm5vdCBjYXJyeSwgd2hpY2hcbiAqIGZvciBtb3N0IHN0YXRlbWVudHMgaXMgYSBmZXcgY2hhcmFjdGVycy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYUNvbnRlbnQgdGhlIHRleHQgYmV0d2VlbiB0aGUgZGVsaW1pdGVyc1xuICogQHJldHVybnMge3sgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9fSBib3RoIHRyaW1tZWQsIG51bGwgd2hlcmUgZW1wdHlcbiAqL1xuY29uc3Qgc3BsaXRTY29wZUFuZFN0YXRlbWVudEZvcndhcmQgPSAoYUNvbnRlbnQpID0+IHtcblx0Y29uc3QgbGVuZ3RoID0gYUNvbnRlbnQubGVuZ3RoO1xuXHRsZXQgaW5kZXggPSAwO1xuXHR3aGlsZSAoaW5kZXggPCBsZW5ndGggJiYgaXNOYW1lQ2hhcmFjdGVyKGFDb250ZW50LmNoYXJDb2RlQXQoaW5kZXgpKSkgaW5kZXgrKztcblxuXHRpZiAoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkgIT09IENPTE9OIHx8IGFDb250ZW50LmNoYXJDb2RlQXQoaW5kZXggKyAxKSAhPT0gQ09MT04pXG5cdFx0cmV0dXJuIHsgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudCkgfTtcblxuXHQvLyBhbiBlbXB0eSBuYW1lIGlzIG5vIG5hbWUsIGJ1dCBpdHMgc2VwYXJhdG9yIGdvZXMgd2l0aCBpdCBhbGwgdGhlIHNhbWVcblx0cmV0dXJuIHsgc2NvcGU6IHRyaW1Ub051bGwoYUNvbnRlbnQuc3Vic3RyaW5nKDAsIGluZGV4KSksIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudC5zdWJzdHJpbmcoaW5kZXggKyAyKSkgfTtcbn07XG5cbi8qKlxuICogVGhlIG51bWJlciBvZiBiYWNrc2xhc2hlcyBzdGFuZGluZyBkaXJlY3RseSBpbiBmcm9udCBvZiB0aGUgaW5kZXguXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG4gKiBAcGFyYW0ge251bWJlcn0gYUluZGV4XG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5jb25zdCBjb3VudEJhY2tzbGFzaGVzQmVmb3JlID0gKGFUZXh0LCBhSW5kZXgpID0+IHtcblx0bGV0IGNvdW50ID0gMDtcblx0d2hpbGUgKGFJbmRleCAtIGNvdW50ID4gMCAmJiBhVGV4dC5jaGFyQ29kZUF0KGFJbmRleCAtIGNvdW50IC0gMSkgPT09IEJBQ0tTTEFTSCkgY291bnQrKztcblxuXHRyZXR1cm4gY291bnQ7XG59O1xuXG4vKipcbiAqIFJlYWRzIHRoZSBvbmUgZXhwcmVzc2lvbiB3aG9zZSBcIiR7XCIgc3RhbmRzIGF0IGFTdGFydCwgY291bnRpbmcgYnJhY2VzIGJ1dCBub3QgdGhlIG9uZXMgaGlkZGVuXG4gKiBpbnNpZGUgYSBsaXRlcmFsIG9yIGEgY29tbWVudCwgYW5kIHRha2VzIGl0IGFwYXJ0IGludG8gc2NvcGUgcHJlZml4IGFuZCBzdGF0ZW1lbnQuXG4gKlxuICogQW5zd2VycyB0aGUgb2NjdXJyZW5jZSBgc2NhbmAgaGFuZHMgb24sIGBlbmRgIHRoZSBpbmRleCBkaXJlY3RseSBhZnRlciB0aGUgbWF0Y2hpbmcgY2xvc2luZyBicmFjZTtcbiAqIG51bGwgd2hlcmUgdGhlIHRleHQgZW5kcyBiZWZvcmUgdGhhdCBicmFjZSwgd2hpY2ggbWVhbnMgdGhlcmUgaXMgbm9cbiAqIGV4cHJlc3Npb24gaGVyZSBhdCBhbGw7IGFuZCwgd2l0aCBgZW5kYCBuZWdhdGVkLCB0aGUgaW5kZXggb2YgYW5vdGhlciBcIiR7XCIgbWV0IG91dHNpZGUgYSBsaXRlcmFsXG4gKiBvciBhIGNvbW1lbnQsIHdoaWNoIHN0YXJ0cyBhbiBleHByZXNzaW9uIG9mIGl0cyBvd24gYW5kIGFiYW5kb25zIHRoaXMgb25lLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuICogQHBhcmFtIHtudW1iZXJ9IGFTdGFydFxuICogQHJldHVybnMgez97IHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCBlc2NhcGVkOiBib29sZWFuLCBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH19XG4gKi9cbmNvbnN0IHJlYWRFeHByZXNzaW9uID0gKGFUZXh0LCBhU3RhcnQpID0+IHtcblx0Y29uc3QgbGVuZ3RoID0gYVRleHQubGVuZ3RoO1xuXHRjb25zdCBzdGFjayA9IFtDT0RFXTtcblx0bGV0IGNvbW1lbnRzID0gbnVsbDtcblx0bGV0IGNvbW1lbnRTdGFydCA9IDA7XG5cdGxldCBpbmRleCA9IGFTdGFydCArIDI7XG5cblx0d2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG5cdFx0Y29uc3QgY2hhciA9IGFUZXh0LmNoYXJDb2RlQXQoaW5kZXgpO1xuXHRcdHN3aXRjaCAoc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0pIHtcblx0XHRcdGNhc2UgQ09ERTpcblx0XHRcdFx0aWYgKGNoYXIgPT09IE9QRU5fQlJBQ0UpIHN0YWNrLnB1c2goQ09ERSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IENMT1NFX0JSQUNFKSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0aWYgKHN0YWNrLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgeyBzY29wZSwgc3RhdGVtZW50IH0gPSBzcGxpdFNjb3BlQW5kU3RhdGVtZW50Rm9yd2FyZChhVGV4dC5zdWJzdHJpbmcoYVN0YXJ0ICsgMiwgaW5kZXgpKTtcblx0XHRcdFx0XHRcdHJldHVybiB7IHN0YXJ0OiBhU3RhcnQsIGVuZDogaW5kZXggKyAxLCBlc2NhcGVkOiBmYWxzZSwgc2NvcGU6IHNjb3BlLCBzdGF0ZW1lbnQ6IHN0YXRlbWVudCB9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChjaGFyID09PSBTSU5HTEVfUVVPVEUpIHN0YWNrLnB1c2goU0lOR0xFX1FVT1RFRCk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPVUJMRV9RVU9URSkgc3RhY2sucHVzaChET1VCTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQkFDS1RJQ0spIHN0YWNrLnB1c2goVEVNUExBVEUpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBET0xMQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBPUEVOX0JSQUNFKSByZXR1cm4geyBzdGFydDogYVN0YXJ0LCBlbmQ6IC1pbmRleCwgZXNjYXBlZDogZmFsc2UsIHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG51bGwgfTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gU0xBU0gpIHtcblx0XHRcdFx0XHRjb25zdCBuZXh0ID0gYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpO1xuXHRcdFx0XHRcdGlmIChuZXh0ID09PSBTVEFSIHx8IG5leHQgPT09IFNMQVNIKSB7XG5cdFx0XHRcdFx0XHRzdGFjay5wdXNoKG5leHQgPT09IFNUQVIgPyBCTE9DS19DT01NRU5UIDogTElORV9DT01NRU5UKTtcblx0XHRcdFx0XHRcdGNvbW1lbnRTdGFydCA9IGluZGV4O1xuXHRcdFx0XHRcdFx0aW5kZXgrKztcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHNsYXNoT3BlbnNSZWdleChhVGV4dCwgaW5kZXgsIGNvbW1lbnRzKSkgc3RhY2sucHVzaChSRUdFWCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEJMT0NLX0NPTU1FTlQ6XG5cdFx0XHRcdGlmIChjaGFyID09PSBTVEFSICYmIGFUZXh0LmNoYXJDb2RlQXQoaW5kZXggKyAxKSA9PT0gU0xBU0gpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHRcdChjb21tZW50cyA/Pz0gW10pLnB1c2goY29tbWVudFN0YXJ0LCBpbmRleCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIExJTkVfQ09NTUVOVDpcblx0XHRcdFx0aWYgKGlzTGluZVRlcm1pbmF0b3IoY2hhcikpIHtcblx0XHRcdFx0XHRzdGFjay5wb3AoKTtcblx0XHRcdFx0XHQoY29tbWVudHMgPz89IFtdKS5wdXNoKGNvbW1lbnRTdGFydCwgaW5kZXggLSAxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgU0lOR0xFX1FVT1RFRDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gU0lOR0xFX1FVT1RFKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERPVUJMRV9RVU9URUQ6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPVUJMRV9RVU9URSkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBURU1QTEFURTpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gQkFDS1RJQ0spIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBET0xMQVIgJiYgYVRleHQuY2hhckNvZGVBdChpbmRleCArIDEpID09PSBPUEVOX0JSQUNFKSB7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChDT0RFKTtcblx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBSRUdFWDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IEJBQ0tTTEFTSCkgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gT1BFTl9CUkFDS0VUKSBzdGFjay5wdXNoKFJFR0VYX0NMQVNTKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gU0xBU0gpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgUkVHRVhfQ0xBU1M6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IENMT1NFX0JSQUNLRVQpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0aW5kZXgrKztcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBBbnN3ZXJzIGV2ZXJ5IGV4cHJlc3Npb24gb2YgYSB0ZXh0LCBpbiB0aGUgb3JkZXIgdGhleSBzdGFuZCwgb3IgbnVsbCB3aGVyZSB0aGUgdGV4dCBjYXJyaWVzXG4gKiBub25lLiBgc3RhcnRgIGlzIHRoZSBpbmRleCBvZiB0aGUgXCIkXCIsIGBlbmRgIHRoZSBpbmRleCBhZnRlciB0aGUgbWF0Y2hpbmcgY2xvc2luZyBicmFjZSwgc28gYVxuICogY2FsbGVyIHJlcGxhY2VzIGJ5IHBvc2l0aW9uIGFuZCBuZXZlciB0b3VjaGVzIGFuIG9jY3VycmVuY2UgdHdpY2UuIFRoZSB0ZXh0IGJldHdlZW4gdHdvXG4gKiBleHByZXNzaW9ucyBpcyBza2lwcGVkIGJ5IGEgbmF0aXZlIHNlYXJjaCBmb3IgdGhlIG5leHQgXCIke1wiLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuICogQHJldHVybnMgez9BcnJheTx7IHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCBlc2NhcGVkOiBib29sZWFuLCBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH0+fVxuICovXG5leHBvcnQgY29uc3Qgc2NhbiA9IChhVGV4dCkgPT4ge1xuXHRsZXQgb2NjdXJyZW5jZXMgPSBudWxsO1xuXHRsZXQgc3RhcnQgPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQpO1xuXG5cdHdoaWxlIChzdGFydCA+PSAwKSB7XG5cdFx0Ly8gYW4gb2RkIHJ1biBvZiBiYWNrc2xhc2hlcyBlc2NhcGVzIHRoZSBkZWxpbWl0ZXIgaXRzZWxmLiBJdCBvcGVucyBub3RoaW5nLCBzbyBvbmx5XG5cdFx0Ly8gdGhvc2UgdHdvIGNoYXJhY3RlcnMgYXJlIHRha2VuIG91dCBvZiB0aGUgdGV4dCBhbmQgdGhlIHNjYW4gY2FycmllcyBvbiBiZWhpbmQgdGhlbSAtXG5cdFx0Ly8gd2hhdCB3b3VsZCBoYXZlIGJlZW4gdGhlIHN0YXRlbWVudCBpcyBvcmRpbmFyeSB0ZXh0IGFuZCBtYXkgaG9sZCBleHByZXNzaW9ucyBvZiBpdHMgb3duLlxuXHRcdGlmIChjb3VudEJhY2tzbGFzaGVzQmVmb3JlKGFUZXh0LCBzdGFydCkgJSAyID09PSAxKSB7XG5cdFx0XHRpZiAoIW9jY3VycmVuY2VzKSBvY2N1cnJlbmNlcyA9IFtdO1xuXHRcdFx0b2NjdXJyZW5jZXMucHVzaCh7IHN0YXJ0OiBzdGFydCwgZW5kOiBzdGFydCArIDIsIGVzY2FwZWQ6IHRydWUsIHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG51bGwgfSk7XG5cdFx0XHRzdGFydCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCwgc3RhcnQgKyAyKTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9jY3VycmVuY2UgPSByZWFkRXhwcmVzc2lvbihhVGV4dCwgc3RhcnQpO1xuXHRcdC8vIG5vIG1hdGNoaW5nIGJyYWNlOiB0aGUgdGV4dCBzdGFuZHMgYXMgd3JpdHRlbiwgYW5kIG5vdGhpbmcgYmVoaW5kIGl0IGNhbiBiZSBhblxuXHRcdC8vIGV4cHJlc3Npb24gZWl0aGVyIC0gYSBcIiR7XCIgb3V0c2lkZSBhIGxpdGVyYWwgb3IgYSBjb21tZW50IHdvdWxkIGhhdmUgcmVzdGFydGVkIHRoZSBzY2FuIGluc3RlYWRcblx0XHRpZiAoIW9jY3VycmVuY2UpIGJyZWFrO1xuXHRcdGlmIChvY2N1cnJlbmNlLmVuZCA8IDApIHtcblx0XHRcdHN0YXJ0ID0gLW9jY3VycmVuY2UuZW5kO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKCFvY2N1cnJlbmNlcykgb2NjdXJyZW5jZXMgPSBbXTtcblx0XHRvY2N1cnJlbmNlcy5wdXNoKG9jY3VycmVuY2UpO1xuXHRcdHN0YXJ0ID0gYVRleHQuaW5kZXhPZihFWFBSRVNTSU9OX1NUQVJULCBvY2N1cnJlbmNlLmVuZCk7XG5cdH1cblxuXHRyZXR1cm4gb2NjdXJyZW5jZXM7XG59O1xuXG4vKipcbiAqIFRha2VzIHRoZSBvbmUgZXhwcmVzc2lvbiBgcmVzb2x2ZWAgaXMgaGFuZGVkIGFwYXJ0LlxuICpcbiAqIFdoaWNoIGZvcm0gaXMgaW4gaGFuZCBpcyBkZWNpZGVkIGJ5IHRoZSB0d28gZW5kcyBvZiB0aGUgdHJpbW1lZCBpbnB1dDogYW4gaW5wdXQgdGhhdCBvcGVucyB3aXRoXG4gKiBcIiR7XCIgYW5kIGVuZHMgd2l0aCBcIn1cIiBpcyB0aGUgZGVsaW1pdGVkIGZvcm0sIGFueXRoaW5nIGVsc2UgaXMgYSBiYXJlIHN0YXRlbWVudC4gVGhlIHdob2xlIGlucHV0XG4gKiBpcyBvbmUgZXhwcmVzc2lvbiwgc28gaXRzIGVuZCBpcyB0aGUgZW5kIG9mIHRoZSBpbnB1dC4gRXNjYXBpbmcgYSBkZWxpbWl0ZXIgZG9lcyBub3QgYXBwbHkgaGVyZSAtXG4gKiBpdCBpcyBhIHJ1bGUgb2YgdGhlIHRleHQgZm9ybSwgYW5kIHRoZXJlIGlzIG5vIHN1cnJvdW5kaW5nIHRleHQsIHNvIGEgYmFja3NsYXNoIGJlbG9uZ3MgdG8gdGhlXG4gKiBzdGF0ZW1lbnQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFFeHByZXNzaW9uXG4gKiBAcmV0dXJucyB7eyBzY29wZTogP3N0cmluZywgc3RhdGVtZW50OiA/c3RyaW5nIH19XG4gKi9cbmV4cG9ydCBjb25zdCBwYXJzZUV4cHJlc3Npb24gPSAoYUV4cHJlc3Npb24pID0+IHtcblx0YUV4cHJlc3Npb24gPSBhRXhwcmVzc2lvbi50cmltKCk7XG5cblx0aWYgKGFFeHByZXNzaW9uLnN0YXJ0c1dpdGgoRVhQUkVTU0lPTl9TVEFSVCkgJiYgYUV4cHJlc3Npb24uZW5kc1dpdGgoXCJ9XCIpKVxuXHRcdHJldHVybiBzcGxpdFNjb3BlQW5kU3RhdGVtZW50QnlTZXBhcmF0b3IoYUV4cHJlc3Npb24uc3Vic3RyaW5nKDIsIGFFeHByZXNzaW9uLmxlbmd0aCAtIDEpKTtcblxuXHQvLyBhbnl0aGluZyBlbHNlIGlzIGEgc3RhdGVtZW50IGluIGZ1bGwsIGFuZCBjYXJyaWVzIG5vIHNjb3BlIHByZWZpeFxuXHRyZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiB0cmltVG9OdWxsKGFFeHByZXNzaW9uKSB9O1xufTtcblxuLyoqXG4gKiBUaGUgc3BsaXQgb2YgdGhlIHNpbmdsZSBleHByZXNzaW9uOiBtb3N0IHN0YXRlbWVudHMgY2Fycnkgbm8gXCI6OlwiIGF0IGFsbCBhbmQgYXJlIGRvbmUgYWZ0ZXIgb25lXG4gKiBuYXRpdmUgc2VhcmNoLiBXaGVyZSBvbmUgc3RhbmRzLCBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZmlyc3Qgb2YgdGhlbSBoYXMgdG8gYmUgYSBuYW1lLCBjaGVja2VkXG4gKiBiYWNrd2FyZHMgZnJvbSBpdDogYSBcIjo6XCIgaW5zaWRlIGEgc3RhdGVtZW50IC0gYSBxdW90ZWQgb25lIC0gdXN1YWxseSBoYXMgYSBjaGFyYWN0ZXIgbm8gbmFtZVxuICogY2FycmllcyByaWdodCBpbiBmcm9udCBvZiBpdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYUNvbnRlbnQgdGhlIHRleHQgYmV0d2VlbiB0aGUgZGVsaW1pdGVyc1xuICogQHJldHVybnMge3sgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9fSBib3RoIHRyaW1tZWQsIG51bGwgd2hlcmUgZW1wdHlcbiAqL1xuY29uc3Qgc3BsaXRTY29wZUFuZFN0YXRlbWVudEJ5U2VwYXJhdG9yID0gKGFDb250ZW50KSA9PiB7XG5cdGNvbnN0IGVuZCA9IGFDb250ZW50LmluZGV4T2YoU0NPUEVfU0VQQVJBVE9SKTtcblx0aWYgKGVuZCA8IDApIHJldHVybiB7IHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IHRyaW1Ub051bGwoYUNvbnRlbnQpIH07XG5cblx0Zm9yIChsZXQgaW5kZXggPSBlbmQgLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKVxuXHRcdGlmICghaXNOYW1lQ2hhcmFjdGVyKGFDb250ZW50LmNoYXJDb2RlQXQoaW5kZXgpKSkgcmV0dXJuIHsgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudCkgfTtcblxuXHRyZXR1cm4geyBzY29wZTogdHJpbVRvTnVsbChhQ29udGVudC5zdWJzdHJpbmcoMCwgZW5kKSksIHN0YXRlbWVudDogdHJpbVRvTnVsbChhQ29udGVudC5zdWJzdHJpbmcoZW5kICsgMikpIH07XG59O1xuIiwiaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5pbXBvcnQgeyBpc051bGxPclVuZGVmaW5lZCB9IGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qc1wiO1xuXG4vKipcbiAqIFRoZSBkZXNjcmlwdG9yIGEgcHJvcGVydHkgaGFzIHdoZXJlIGl0IGlzIGRlZmluZWQgLSBvd24gb3IgYW55d2hlcmUgdXAgdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICogdGhlIG9iamVjdCBob2xkaW5nIGl0LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge3N0cmluZ3xzeW1ib2x9IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7UHJvcGVydHlEZXNjcmlwdG9yfG51bGx9XG4gKi9cbmNvbnN0IGZpbmRQcm9wZXJ0eURlc2NyaXB0b3IgPSAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0bGV0IHR5cGUgPSBkYXRhO1xuXHR3aGlsZSAoIWlzTnVsbE9yVW5kZWZpbmVkKHR5cGUpKSB7XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHR5cGUsIHByb3BlcnR5KTtcblx0XHRpZiAoZGVzY3JpcHRvcikgcmV0dXJuIGRlc2NyaXB0b3I7XG5cdFx0dHlwZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodHlwZSk7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogVGhlIG5hbWVzIGEgaGFuZGxlIHByb3ZpZGVzLCBlYWNoIG1hcHBlZCB0byB0aGUgaGFuZGxlIHByb3ZpZGluZyBpdDogYSBNYXAsIG9yIHRoZSBzdGFuZC1pbiBvZlxuICogYGNyZWF0ZUdsb2JhbE5hbWVDYWNoZWAgb3ZlciB0aGUgZ2xvYmFsIG9iamVjdCwgd2hpY2ggYW5zd2VycyB0aGUgc2FtZSBjYWxscy5cbiAqXG4gKiBAdHlwZWRlZiB7TWFwPHN0cmluZ3xzeW1ib2wsUmVzb2x2ZXJDb250ZXh0SGFuZGxlPn0gTmFtZUNhY2hlXG4gKi9cblxuLyoqXG4gKiBOYW1lIGNhY2hlIGZvciBhIGNvbnRleHQgdGhhdCBpcyB0aGUgZ2xvYmFsIG9iamVjdCBpdHNlbGYuXG4gKlxuICogSXQgYW5zd2VycyBsaWtlIHRoZSBNYXAgaXQgcmVwbGFjZXM6IGV2ZXJ5IG5hbWUgaXMgcHJlc2VudCwgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgaGFuZGxlXG4gKiBob2xkaW5nIGl0IC0gbmV2ZXIgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS4gVGhhdCBpcyB0aGUgY29udHJhY3Qgb2YgI2ZpbmRIYW5kbGUsXG4gKiB3aG9zZSBjYWxsZXIgcmVhZHMgdGhlIHByb3BlcnR5IG9mZiB0aGUgaGFuZGxlIGl0IGdldHMgYmFjay5cbiAqXG4gKiBCZWNhdXNlIGV2ZXJ5IG5hbWUgaXMgcHJlc2VudCwgc3VjaCBhIHJlc29sdmVyIGFuc3dlcnMgZXZlcnkgbG9va3VwIHRoYXQgcmVhY2hlcyBpdCwgYW5kIG5vXG4gKiBoYW5kbGUgbmVhcmVyIHRoZSByb290IGlzIHJlYWNoZWQuIEl0IGxpc3RzIG5vIG5hbWUgb2YgaXRzIG93biwgc28gdGhlIG93bktleXMgdHJhcCBvZiBhIGhhbmRsZVxuICogZnVydGhlciBmcm9tIHRoZSByb290IHJlcG9ydHMgbm9uZSBvZiB0aGUgZ2xvYmFsIG9iamVjdCdzLlxuICpcbiAqIEBwYXJhbSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfSBoYW5kbGVcbiAqIEByZXR1cm5zIHtOYW1lQ2FjaGV9XG4gKi9cbmNvbnN0IGNyZWF0ZUdsb2JhbE5hbWVDYWNoZSA9IChoYW5kbGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYXM6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSxcblx0XHRnZXQ6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGhhbmRsZTtcblx0XHR9LFxuXHRcdHNldDogKHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0ZGVsZXRlOiAocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdGtleXM6ICgpID0+IHtcblx0XHRcdC8vIE5vIG5hbWUgb2YgaXRzIG93bi4gYGhhc2AgYWxyZWFkeSBhbnN3ZXJzIGV2ZXJ5IGxvb2t1cCwgc28gYSBuYW1lIG9mIHRoZSBnbG9iYWwgb2JqZWN0XG5cdFx0XHQvLyBpcyBmb3VuZCBmcm9tIGFueXdoZXJlIGJlbG93OyBsaXN0aW5nIGl0IGFzIHdlbGwgd291bGQgb25seSBoYW5kIGl0IHRvIGFuIGV4ZWN1dGVyIHRoYXRcblx0XHRcdC8vIHR1cm5zIGEgbmFtZSBpbnRvIGNvZGUsIHdoaWNoIHRoZW4gZmFpbHMgb3ZlciBuYW1lcyBpdCBuZXZlciBuZWVkZWQgLSB0aGUgaW5kZXggXCIwXCIgb2Zcblx0XHRcdC8vIGEgZnJhbWUsIGEgc3ltYm9sIGFub3RoZXIgbGlicmFyeSBwbGFudGVkLiBBIHN0YXRlbWVudCByZWFjaGVzIGEgZ2xvYmFsIHRocm91Z2ggdGhlXG5cdFx0XHQvLyBvcmRpbmFyeSBzY29wZSBjaGFpbiBhbnl3YXkuXG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fSxcblx0fTtcbn07XG5cbi8qKlxuICogV2hhdCBzdGFuZHMgYmVoaW5kIHRoZSBjb250ZXh0IG9mIG9uZSByZXNvbHZlcjogdGhlIG9iamVjdCBoYW5kZWQgdG8gaXQsIHRoZSBoYW5kbGUgb2YgaXRzIHBhcmVudCxcbiAqIGFuZCB0aGUgbmFtZSBjYWNoZSB0aGF0IHRlbGxzIHdoaWNoIG5hbWVzIHRoaXMgcmVzb2x2ZXIgcHJvdmlkZXMuIEl0IGhhbmRzIG91dCB0aGUgY29udGV4dCBhblxuICogZXhwcmVzc2lvbiBzZWVzLCBhIHByb3h5IHRoYXQgYW5zd2VycyBmb3IgdGhlIHdob2xlIGNoYWluLlxuICpcbiAqIEludGVybmFsIHRvIHRoZSBwYWNrYWdlOiBpbmRleC5qcyBkb2VzIG5vdCBleHBvcnQgaXQuXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIFJlc29sdmVyQ29udGV4dEhhbmRsZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvbHZlckNvbnRleHRIYW5kbGUge1xuXHQvKiogQHR5cGUge29iamVjdHxudWxsfSAqL1xuXHQjY29udGV4dCA9IG51bGw7XG5cdC8qKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge29iamVjdHxudWxsfSAqL1xuXHQjZGF0YSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7TmFtZUNhY2hlfG51bGx9ICovXG5cdCNjYWNoZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I3Byb3ZpZGVzQ29udGV4dCA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgdGhlIGNhbGxlciBoYW5kZWQgb3Zlciwga2VwdCByYXRoZXIgdGhhbiBjb3BpZWQuIFdoZXJlIG5vbmVcblx0ICogaXMgcGFzc2VkLCB0aGUgaGFuZGxlIGhvbGRzIG5vIG9iamVjdCBhdCBhbGwgYW5kIGNhcnJpZXMgbm8gbmFtZSwgbm90IGV2ZW4gb25lIG9mXG5cdCAqIE9iamVjdC5wcm90b3R5cGUuIEl0IGdldHMgYW4gb2JqZWN0IG9uIHRoZSBmaXJzdCB3cml0ZS5cblx0ICogQHBhcmFtIHs/UmVzb2x2ZXJDb250ZXh0SGFuZGxlfSBwYXJlbnQgdGhlIGhhbmRsZSBvZiB0aGUgcGFyZW50IHJlc29sdmVyXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihjb250ZXh0LCBwYXJlbnQpIHtcblx0XHR0aGlzLiNkYXRhID0gaXNOdWxsT3JVbmRlZmluZWQoY29udGV4dCkgPyBudWxsIDogY29udGV4dDtcblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQgOiBudWxsO1xuXHRcdHRoaXMuI3Byb3ZpZGVzQ29udGV4dCA9ICFpc051bGxPclVuZGVmaW5lZChjb250ZXh0KTtcblxuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jYnVpbGROYW1lQ2FjaGUoKTtcblxuXHRcdGlmIChHTE9CQUwgPT09IHRoaXMuI2RhdGEpXG5cdFx0XHR0aGlzLiNjb250ZXh0ID0gdGhpcy4jZGF0YTtcblx0XHRlbHNlIHtcblx0XHRcdC8vIFRoZSBwcm94eSBhbnN3ZXJzIGZvciB0aGUgd2hvbGUgY2hhaW4sIHdoaWNoIGlzIG1vcmUgdGhhbiB0aGUgb2JqZWN0IGhhbmRlZCB0byB0aGlzXG5cdFx0XHQvLyByZXNvbHZlciBob2xkcy4gQSBwcm94eSBtYXkgbm90IHNwZWFrIHRoYXQgZnJlZWx5IGZvciBhIHRhcmdldCB0aGF0IGd1YXJhbnRlZXNcblx0XHRcdC8vIGFueXRoaW5nIGFib3V0IGl0cyBvd24ga2V5cyAtIGEgZnJvemVuIG9yIHNlYWxlZCBjb250ZXh0IGlzIHdoZXJlIHRoYXQgZW5kcyBpbiBhXG5cdFx0XHQvLyBUeXBlRXJyb3IgLSBzbyBpdCBnZXRzIGFuIGVtcHR5IHRhcmdldCBvZiBpdHMgb3duLiBObyB0cmFwIHJlYWRzIGl0OyBldmVyeSBvbmUgb2Zcblx0XHRcdC8vIHRoZW0gd29ya3Mgb24gI2RhdGEgYW5kICNjYWNoZS5cblx0XHRcdHRoaXMuI2NvbnRleHQgPSBuZXcgUHJveHkoe30sIHtcblx0XHRcdFx0aGFzOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiaGFzIHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuI2ZpbmRIYW5kbGUocHJvcGVydHkpICE9IG51bGw7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldDogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImdldCBwcm9wZXJ0eTpcIiwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdGNvbnN0IGhhbmRsZSA9IHRoaXMuI2ZpbmRIYW5kbGUocHJvcGVydHkpO1xuXHRcdFx0XHRcdHJldHVybiBoYW5kbGUgPyBoYW5kbGUuI2RhdGFbcHJvcGVydHldIDogdW5kZWZpbmVkO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQ6IChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwic2V0IHByb3BlcnR5OlwiLCBwcm9wZXJ0eSwgXCI9XCIsIHZhbHVlKTtcblx0XHRcdFx0XHR0aGlzLiNkYXRhID8/PSB7fTtcblx0XHRcdFx0XHR0aGlzLiNkYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHRoaXMuI2NhY2hlLnNldChwcm9wZXJ0eSwgdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy4jcHJvdmlkZXNDb250ZXh0ID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGVsZXRlUHJvcGVydHk6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGhhbmRsZSA9IHRoaXMuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0aWYgKGhhbmRsZSkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuI2RhdGFbcHJvcGVydHldO1xuXHRcdFx0XHRcdFx0dGhpcy4jY2FjaGUuZGVsZXRlKHByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgaGFuZGxlID0gdGhpcy4jZmluZEhhbmRsZShwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0aWYgKCFoYW5kbGUpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRcdFx0XHQvLyBSZWFkIHRocm91Z2ggYSBnZXR0ZXIgcmF0aGVyIHRoYW4gdXAgZnJvbnQsIHNvIGVudW1lcmF0aW5nIGEgY29udGV4dCBkb2VzIG5vdFxuXHRcdFx0XHRcdC8vIGV2YWx1YXRlIHdoYXQgbm9ib2R5IGFza2VkIGZvciwgYW5kIHNvIGEgdmFsdWUgc3RheXMgbGl2ZS4gRW51bWVyYWJpbGl0eVxuXHRcdFx0XHRcdC8vIGlzIHRha2VuIGZyb20gd2hlcmUgdGhlIHByb3BlcnR5IGlzIGRlZmluZWQgLSB0aGF0IGlzIHdoYXQga2VlcHMgdGhlIG1lbWJlcnNcblx0XHRcdFx0XHQvLyBvZiBPYmplY3QucHJvdG90eXBlIG91dCBvZiBPYmplY3Qua2V5cyAtIHdoaWxlIGNvbmZpZ3VyYWJsZSBoYXMgdG8gYmUgdHJ1ZTpcblx0XHRcdFx0XHQvLyBhIHByb3h5IG1heSBub3QgY2xhaW0gYSBmaXhlZCBwcm9wZXJ0eSBpdHMgdGFyZ2V0IGRvZXMgbm90IGhhdmUuXG5cdFx0XHRcdFx0Y29uc3QgZGVzY3JpcHRvciA9IGZpbmRQcm9wZXJ0eURlc2NyaXB0b3IoaGFuZGxlLiNkYXRhLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGdldDogKCkgPT4gaGFuZGxlLiNkYXRhW3Byb3BlcnR5XSxcblx0XHRcdFx0XHRcdGVudW1lcmFibGU6IGRlc2NyaXB0b3IgPyBkZXNjcmlwdG9yLmVudW1lcmFibGUgOiB0cnVlLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSxcblx0XHRcdFx0b3duS2V5czogKGRhdGEpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwib3duS2V5c1wiKTtcblx0XHRcdFx0XHRjb25zdCByZXN1bHQgPSBuZXcgU2V0KCk7XG5cdFx0XHRcdFx0bGV0IGhhbmRsZSA9IHRoaXM7XG5cdFx0XHRcdFx0d2hpbGUgKGhhbmRsZSkge1xuXHRcdFx0XHRcdFx0Ly8gYSBoYW5kbGUgd2l0aG91dCBhbiBvYmplY3QgY2FycmllcyBubyBuYW1lIC0gaXRzIGVtcHR5IGNhY2hlIGlzIHBhc3NlZCBieVxuXHRcdFx0XHRcdFx0aWYgKGhhbmRsZS4jZGF0YSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRmb3IgKGxldCBrZXkgb2YgaGFuZGxlLiNjYWNoZS5rZXlzKCkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXN1bHQuYWRkKGtleSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGhhbmRsZSA9IGhhbmRsZS4jcGFyZW50O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gQXJyYXkuZnJvbShyZXN1bHQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZXh0IGFuIGV4cHJlc3Npb24gc2VlczogYSBwcm94eSB0aGF0IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbiwgb3Igb3ZlciB0aGUgZ2xvYmFsXG5cdCAqIG9iamVjdCB0aGUgZ2xvYmFsIG9iamVjdCBpdHNlbGYuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0IGNvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH1cblx0ICovXG5cdGdldCBwYXJlbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI3BhcmVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRoaXMgaGFuZGxlIHByb3ZpZGVzIHRoZSBuYW1lIGl0c2VsZi4gRXZlcnkgbmFtZSBvZiBpdHMgb3duIGNvbnRleHQgY291bnRzLCB0aGUgb25lc1xuXHQgKiBpbmhlcml0ZWQgdGhyb3VnaCB0aGUgcHJvdG90eXBlIGNoYWluIGluY2x1ZGVkOyBhIGhhbmRsZSBvdmVyIHRoZSBnbG9iYWwgb2JqZWN0XG5cdCAqIHByb3ZpZGVzIGV2ZXJ5IG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfHN5bWJvbH0ga2V5XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzTmFtZShrZXkpIHtcblx0XHRyZXR1cm4gdGhpcy4jY2FjaGUuaGFzKGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciB0aGlzIGhhbmRsZSBwcm92aWRlcyBhIGNvbnRleHQ6IG9uZSB3YXMgaGFuZGVkIHRvIHRoZSBjb25zdHJ1Y3Rvciwgb3IgYSB2YWx1ZSBoYXMgYmVlblxuXHQgKiB3cml0dGVuIHNpbmNlLiBXaGF0IHRoZSBkYXRhIGhvbGRzIGRlY2lkZXMgbm90aGluZy5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtib29sZWFufVxuXHQgKi9cblx0Z2V0IHByb3ZpZGVzQ29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcHJvdmlkZXNDb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2VzIHRoZSBvYmplY3QgdGhpcyBoYW5kbGUgaG9sZHMsIGFuZCB3aXRoIGl0IHRoZSBuYW1lcyBpdCBwcm92aWRlcy5cblx0ICpcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBkYXRhIHRoZSBuZXcgb2JqZWN0OyBudWxsIG9yIHVuZGVmaW5lZCBsZWF2ZXMgdGhlIGhhbmRsZSB3aXRob3V0IG9uZVxuXHQgKi9cblx0cmVwbGFjZURhdGEoZGF0YSkge1xuXHRcdHRoaXMuI2RhdGEgPSBpc051bGxPclVuZGVmaW5lZChkYXRhKSA/IG51bGwgOiBkYXRhO1xuXHRcdHRoaXMuI3Byb3ZpZGVzQ29udGV4dCA9ICFpc051bGxPclVuZGVmaW5lZChkYXRhKTtcblx0XHR0aGlzLiNjYWNoZSA9IHRoaXMuI2J1aWxkTmFtZUNhY2hlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQXNzaWducyB0aGUga2V5cyBvZiBhbiBvYmplY3QgaW50byB0aGUgb25lIHRoaXMgaGFuZGxlIGhvbGRzLCBrZXkgYnkga2V5LCBjcmVhdGluZyB0aGF0IG9iamVjdFxuXHQgKiB3aGVyZSB0aGVyZSBpcyBub25lLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBvYmplY3QgaGVsZCByZWZ1c2VzIGEga2V5IC0gdGhlIGtleXMgYmVmb3JlIGl0IGFyZSB3cml0dGVuIGJ5IHRoZW5cblx0ICovXG5cdG1lcmdlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy4jZGF0YSA/Pz0ge307XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLiNkYXRhLCBkYXRhKTtcblx0XHR0aGlzLiNwcm92aWRlc0NvbnRleHQgPSB0cnVlO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jYnVpbGROYW1lQ2FjaGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUYWtlcyB1cCB0aGUga2V5cyBhZGRlZCB0byB0aGUgaGFuZGVkLWluIG9iamVjdCBzaW5jZSB0aGUgaGFuZGxlIHdhcyBidWlsdCwgd2hpY2ggYXJlIG5vdFxuXHQgKiBwcm92aWRlZCB1bnRpbCB0aGVuLlxuXHQgKi9cblx0cmVzZXRDYWNoZSgpIHtcblx0XHR0aGlzLiNjYWNoZSA9IHRoaXMuI2J1aWxkTmFtZUNhY2hlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQSBuZXcgbmFtZSBjYWNoZSBmb3IgdGhlIG9iamVjdCB0aGlzIGhhbmRsZSBob2xkczogZXZlcnkga2V5IGl0IGNhcnJpZXMsIGl0cyBwcm90b3R5cGUgY2hhaW5cblx0ICogaW5jbHVkZWQsIGVhY2ggbWFwcGVkIHRvIHRoaXMgaGFuZGxlLiBPdmVyIHRoZSBnbG9iYWwgb2JqZWN0IHRoZSBzdGFuZC1pbiBvZlxuXHQgKiBgY3JlYXRlR2xvYmFsTmFtZUNhY2hlYCwgd2hpY2ggcHJvdmlkZXMgZXZlcnkgbmFtZS5cblx0ICpcblx0ICogQHJldHVybnMge05hbWVDYWNoZX1cblx0ICovXG5cdCNidWlsZE5hbWVDYWNoZSgpIHtcblx0XHRjb25zdCBkYXRhID0gdGhpcy4jZGF0YTtcblx0XHRpZiAoR0xPQkFMID09PSBkYXRhKSBcblx0XHRcdHJldHVybiBjcmVhdGVHbG9iYWxOYW1lQ2FjaGUodGhpcyk7XG5cblx0XHQvLyBldmVyeSBrZXkgSmF2YVNjcmlwdCBzYXlzIHRoZSBvYmplY3QgY2Fycmllcywgbm90aGluZyBmaWx0ZXJlZCAtIHdoaWNoIG9mIHRoZW0gYW4gZXhlY3V0ZXJcblx0XHQvLyBjYW4gcHV0IGludG8gaXRzIGNvZGUgaXMgdGhlIGV4ZWN1dGVyJ3MgYnVzaW5lc3Ncblx0XHRjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblx0XHRsZXQgdHlwZSA9IGRhdGE7XG5cdFx0d2hpbGUgKCFpc051bGxPclVuZGVmaW5lZCh0eXBlKSkge1xuXHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBSZWZsZWN0Lm93bktleXModHlwZSkpIGNhY2hlLnNldChuYW1lLCB0aGlzKTtcblx0XHRcdHR5cGUgPSBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHR5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmVhcmVzdCBoYW5kbGUgZnJvbSB0aGlzIG9uZSB0byB0aGUgcm9vdCB0aGF0IHByb3ZpZGVzIHRoZSBuYW1lLCBvciBudWxsIHdoZXJlIG5vbmUgZG9lcy5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd8c3ltYm9sfSBwcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9XG5cdCAqL1xuXHQjZmluZEhhbmRsZShwcm9wZXJ0eSkge1xuXHRcdC8vIEEgaGFuZGxlIHdpdGhvdXQgYW4gb2JqZWN0IGNhcnJpZXMgbm8gbmFtZSwgc28gaXQgaXMgcGFzc2VkIGJ5IHdpdGhvdXQgYXNraW5nIGl0cyBjYWNoZSAtXG5cdFx0Ly8gbW9zdCByZXNvbHZlcnMgb2YgYSBjaGFpbiBhcmUgYnVpbHQgd2l0aG91dCBhIGNvbnRleHQuXG5cdFx0bGV0IGhhbmRsZSA9IHRoaXM7XG5cdFx0d2hpbGUgKGhhbmRsZSkge1xuXHRcdFx0aWYgKGhhbmRsZS4jZGF0YSAhPT0gbnVsbCAmJiBoYW5kbGUuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiBoYW5kbGUuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRoYW5kbGUgPSBoYW5kbGUuI3BhcmVudDtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cbiIsImltcG9ydCB7IEdMT0JBTCB9IGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzXCI7XG5cbi8qKlxuICogVGhlIGhlbHBlcnMgbW9yZSB0aGFuIG9uZSBjb21wb25lbnQgdXNlcy4gSW50ZXJuYWwgdG8gdGhlIHBhY2thZ2U6IGluZGV4LmpzIGRvZXMgbm90IGV4cG9ydFxuICogdGhlbS5cbiAqL1xuXG4vKiogV2hpdGVzcGFjZSBpbiB0aGUgc2Vuc2Ugb2YgYFxcc2AuICovXG5leHBvcnQgY29uc3QgV0hJVEVTUEFDRSA9IC9cXHMvO1xuXG4vKipcbiAqIFdoZXRoZXIgYSBjaGFyYWN0ZXIgbWF5IHN0YW5kIGluIGEgc2NvcGUgbmFtZTogYW4gQVNDSUkgbGV0dGVyLCBhIGRpZ2l0LFxuICogXCItXCIsIFwiX1wiLCBvciB3aGl0ZXNwYWNlIGluIHRoZSBzZW5zZSBvZiBgXFxzYCwgd2hpY2ggcGFzdCBBU0NJSSBpcyBsZWZ0IHRvIHRoZSByZWd1bGFyIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGFDb2RlIHRoZSBjaGFyIGNvZGVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgY29uc3QgaXNOYW1lQ2hhcmFjdGVyID0gKGFDb2RlKSA9PiB7XG5cdGlmIChhQ29kZSA8IDB4ODApXG5cdFx0cmV0dXJuIChcblx0XHRcdChhQ29kZSA+PSAweDYxICYmIGFDb2RlIDw9IDB4N2EpIHx8XG5cdFx0XHQoYUNvZGUgPj0gMHg0MSAmJiBhQ29kZSA8PSAweDVhKSB8fFxuXHRcdFx0KGFDb2RlID49IDB4MzAgJiYgYUNvZGUgPD0gMHgzOSkgfHxcblx0XHRcdGFDb2RlID09PSAweDJkIHx8XG5cdFx0XHRhQ29kZSA9PT0gMHg1ZiB8fFxuXHRcdFx0YUNvZGUgPT09IDB4MjAgfHxcblx0XHRcdChhQ29kZSA+PSAweDA5ICYmIGFDb2RlIDw9IDB4MGQpXG5cdFx0KTtcblxuXHRyZXR1cm4gV0hJVEVTUEFDRS50ZXN0KFN0cmluZy5mcm9tQ2hhckNvZGUoYUNvZGUpKTtcbn07XG5cbi8qKlxuICogVHJpbXMgYSBzdHJpbmcsIGFuZCBhbnN3ZXJzIG51bGwgZm9yIG9uZSB0aGF0IGlzIGVtcHR5IGFmdGVyIHRyaW1taW5nLCBhbmQgZm9yIG5vbmUuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCB0cmltVG9OdWxsID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSkge1xuXHRcdHZhbHVlID0gdmFsdWUudHJpbSgpO1xuXHRcdHJldHVybiB2YWx1ZS5sZW5ndGggPT0gMCA/IG51bGwgOiB2YWx1ZTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQSAzMiBiaXQgaGFzaCBvZiBhIHN0cmluZywgaW4gdGhlIG1hbm5lciBvZiBKYXZhJ3MgYFN0cmluZy5oYXNoQ29kZWAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdHJpbmdcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBzdHJpbmdUb0hhc2hjb2RlID0gKGFTdHJpbmcpID0+IHtcblx0bGV0IGhhc2ggPSAwO1xuXHRpZiAoYVN0cmluZy5sZW5ndGggPT0gMCkgcmV0dXJuIGhhc2g7XG5cdGNvbnN0IGxlbmd0aCA9IGFTdHJpbmcubGVuZ3RoO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgY2hhciA9IGFTdHJpbmcuY2hhckNvZGVBdChpKTtcblx0XHRoYXNoID0gKGhhc2ggPDwgNSkgLSBoYXNoICsgY2hhcjtcblx0XHRoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuXHR9XG5cdHJldHVybiBoYXNoO1xufTtcblxuY29uc3QgSURfQ0hBUkFDVEVSID0gXCJhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCI7XG5cbmNvbnN0IGdlbmVyYXRlSWQgPSAoYUxlbmd0aCkgPT4ge1xuXHRsZXQgaWQgPSBcIlwiO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFMZW5ndGg7IGkrKylcblx0XHRpZCArPSBJRF9DSEFSQUNURVIuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIElEX0NIQVJBQ1RFUi5sZW5ndGgpKTtcblx0cmV0dXJuIGlkO1xufTtcblxuZXhwb3J0IGNvbnN0IHVuZGVjbGFyZWRWYXJuYW1lID0gKHsgcHJlZml4LCBzdWZmaXgsIG1pbkxlbmd0aCA9IDEwIH0gPSB7fSkgPT4ge1xuXHRsZXQgY291bnQgPSBtaW5MZW5ndGg7XG5cdGRvIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IElEX0NIQVJBQ1RFUi5sZW5ndGggKiBjb3VudDsgaSsrKSB7XG5cdFx0XHRjb25zdCBuYW1lID0gYCR7cHJlZml4IHx8IFwiXCJ9JHtnZW5lcmF0ZUlkKGNvdW50KX0ke3N1ZmZpeCB8fCBcIlwifWA7XG5cdFx0XHRpZiAoIUdMT0JBTC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgcmV0dXJuIG5hbWU7XG5cdFx0fVxuXHRcdGNvdW50ICs9IDQ7XG5cdH0gd2hpbGUgKHRydWUpO1xufTtcbiIsImltcG9ydCB7IHJlZ2lzdGVyIH0gZnJvbSBcIi4uL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBDb2RlQ2FjaGUgZnJvbSBcIi4uL0NvZGVDYWNoZS5qc1wiO1xuaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5pbXBvcnQgeyB1bmRlY2xhcmVkVmFybmFtZSB9IGZyb20gXCIuLi9VdGlscy5qc1wiO1xuXG5sZXQgREVCVUcgPSBmYWxzZTtcbi8qKiBUaGUgbmFtZSB0aGlzIGV4ZWN1dGVyIGlzIHJlZ2lzdGVyZWQgdW5kZXIsIGFuZCB0aGUgZGVmYXVsdCBleGVjdXRlci4gKi9cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcImNvbnRleHQtZGVjb25zdHJ1Y3Rpb24tZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKCk7XG5jb25zdCBSRVNFUlZFRF9WQVJOQU1FID0gdW5kZWNsYXJlZFZhcm5hbWUoeyBwcmVmaXg6IFwiJENERV9cIiwgc3VmZml4OiBcIl9DREUkXCIsIG1pbkxlbmd0aDogMzIgfSk7XG5cblxuLyoqXG4gKiBIb3cgbWFueSBuYW1lcyBhIGNvbnRleHQgbWF5IGNhcnJ5IGJlZm9yZSB0aGlzIGV4ZWN1dGVyIHNheXMgdGhhdCBiaW5kaW5nIHRoZW0gYWxsIGNvc3RzLiBFdmVyeVxuICogb3JkaW5hcnkgb2JqZWN0IGJyaW5ncyBzZXZlbiBvZiB0aGVtIGFsb25nIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLCBzbyB0aGUgbnVtYmVyIGNvdW50cyBhIGdvb2RcbiAqIG1hbnkgb3duIGtleXMgYmVmb3JlIGl0IGlzIHJlYWNoZWQuXG4gKi9cbmNvbnN0IEhJR0hfUFJPUEVSVFlfQ09VTlQgPSAyNTtcblxuLyoqXG4gKiBUaGUgbmFtZXMgdGhhdCBtYWRlIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZmFpbCB0byBjb21waWxlLCBhc2tlZCBvZiBKYXZhU2NyaXB0IGl0c2VsZiByYXRoZXJcbiAqIHRoYW4gb2YgYSBsaXN0IGtlcHQgaGVyZTogYSBuYW1lIGlzIHVzYWJsZSB3aGVuIGl0IGNhbiBzdGFuZCBpbiBhIGRlc3RydWN0dXJpbmcgcGF0dGVybi5cbiAqXG4gKiBPbmx5IGV2ZXIgY2FsbGVkIG9uIHRoZSBmYWlsdXJlIHBhdGgsIHNvIHRoZSBjb3N0IG9mIGNvbXBpbGluZyBvbmUgcGF0dGVybiBwZXIgbmFtZSBpcyBwYWlkIGJ5IGFcbiAqIGNvbnRleHQgdGhhdCBpcyBicm9rZW4gZm9yIHRoaXMgZXhlY3V0ZXIgYW55d2F5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfHN5bWJvbD59IHRoZU5hbWVzXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPn1cbiAqL1xuY29uc3QgdW51c2FibGVOYW1lcyA9ICh0aGVOYW1lcykgPT5cblx0dGhlTmFtZXNcblx0XHQuZmlsdGVyKChuYW1lKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIHJldHVybiB0cnVlO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0bmV3IEZ1bmN0aW9uKGB7JHtuYW1lfX1gLCBcIlwiKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5tYXAoU3RyaW5nKTtcblxuLyoqXG4gKiBTd2l0Y2hlcyB0aGUgbG9nZ2luZyBvZiBldmVyeSBmdW5jdGlvbiB0aGlzIGV4ZWN1dGVyIGdlbmVyYXRlcyB0byB0aGUgY29uc29sZS5cbiAqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBzZXREZWJ1ZyA9ICh2YWx1ZSkgPT4ge1xuXHRERUJVRyA9IHZhbHVlO1xufTtcblxuLyoqXG4gKiBDb25maWd1cmVzIHRoZSBjb2RlIGNhY2hlIG9mIHRoaXMgZXhlY3V0ZXIuIGBzaXplYCBpcyB0aGUgb25seSBvcHRpb25cbiAqIHRvZGF5OyBhbiBvcHRpb24gbGVmdCBvdXQgY2hhbmdlcyBub3RoaW5nLlxuICpcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9Db2RlQ2FjaGUuanMnKS5Db2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG4gKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZXJlIHRoZSBzaXplIGlzIG5vdCBhIGZpbml0ZSBudW1iZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuY29uc3QgZ2V0UHJvcGVydHlOYW1lcyA9IChhQ29udGV4dCkgPT4ge1xuXHRpZiAoR0xPQkFMID09PSBhQ29udGV4dCkgcmV0dXJuIFtdO1xuXHRyZXR1cm4gUmVmbGVjdC5vd25LZXlzKGFDb250ZXh0KTtcbn07XG5cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCwgY29udGV4dFByb3BlcnRpZXMpID0+IHtcblx0Ly8gQSBzeW1ib2wgaGFzIHRvIGJlIHdyaXR0ZW4gb3V0IHJhdGhlciB0aGFuIGpvaW5lZCAtIGBqb2luYCBhbG9uZSByYWlzZXMgYSBUeXBlRXJyb3IgdGhhdCBzYXlzXG5cdC8vIG5vdGhpbmcgYWJvdXQgdGhlIGNvbnRleHQgaXQgY2FtZSBmcm9tLiBXcml0dGVuIG91dCBpdCByZWFjaGVzIHRoZSBwYXR0ZXJuLCB3aGVyZSBpdCBmYWlscyB0b1xuXHQvLyBjb21waWxlIGxpa2UgYW55IG90aGVyIG5hbWUgdGhhdCBpcyBubyBpZGVudGlmaWVyLCBhbmQgZ2VuZXJhdGUoKSBuYW1lcyBpdC5cblx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGNvbnRleHRQcm9wZXJ0aWVzLm1hcChTdHJpbmcpLmpvaW4oXCIsXCIpO1xuXHRjb25zdCBjYWNoZUtleSA9IGAke2FTdGF0ZW1lbnQubGVuZ3RofTo6JHtwcm9wZXJ0eU5hbWVzfTo6JHthU3RhdGVtZW50fWA7XG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50LCBwcm9wZXJ0eU5hbWVzLCBjb250ZXh0UHJvcGVydGllcyk7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGNhY2hlS2V5LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIFRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZGVzdHJ1Y3R1cmVzIHRoZSBjb250ZXh0IGluIGl0cyBwYXJhbWV0ZXIgbGlzdCBhbmQgcnVucyB0aGUgc3RhdGVtZW50IG92ZXJcbiAqIHRoZSBsb2NhbCBiaW5kaW5ncyB0aGF0IHByb2R1Y2VzLlxuICpcbiAqICoqTm90aGluZyBpcyBjYXJyaWVkIGJhY2suKiogQSBzdGF0ZW1lbnQgdGhhdCBhc3NpZ25zIHRvIGEgY29udGV4dCBuYW1lIHdyaXRlcyBpbnRvIGEgbG9jYWxcbiAqIGJpbmRpbmcsIGFuZCB0aGF0IGJpbmRpbmcgaXMgZ29uZSB3aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIC0gc28gYSB3cml0ZSBpcyBub3QgcmVhZGFibGVcbiAqIGFmdGVyd2FyZHMsIHdoaWNoIHRoZSByZXNvbHZlciBsZWF2ZXMgdG8gZWFjaCBleGVjdXRlci4gVGhhdCBpcyBhIGRlY2lzaW9uIHJhdGhlciB0aGFuIGEgZ2FwOiB0aGVcbiAqIHdyaXRlLWJhY2sgdGhpcyBleGVjdXRlciBjYXJyaWVkIGJldHdlZW4gMjAyNi0wOS0wNyBhbmQgMjAyNi0wOS0yMCBjb3N0IGEgZmFjdG9yIG9mIGVsZXZlbiBvbiBhXG4gKiBjYWNoZSBtaXNzLCBiZWNhdXNlIGl0IG5lZWRzIGV2ZXJ5IGNvbnRleHQgbmFtZSBkZWNsYXJlZCBpbiB0aGUgYm9keSBpbnN0ZWFkIG9mIGxpc3RlZCBpbiB0aGVcbiAqIHBhcmFtZXRlciBsaXN0LiBTcGVlZCBpcyB3aGF0IHRoaXMgZXhlY3V0ZXIgaXMgZm9yLCBhbmQgYSBjb25zdW1lciB3aG8gbmVlZHMgYSB3cml0ZSB0byBwZXJzaXN0XG4gKiBwaWNrcyBgY29udGV4dC1vYmplY3QtZXhlY3V0ZXJgLlxuICpcbiAqIFdoYXQgc3RpbGwgcmVhY2hlcyB0aGUgY29udGV4dCBpcyBhICoqbXV0YXRpb24qKjogYGhvbGRlci5uYW1lID0gXCJhZnRlclwiYCBjaGFuZ2VzIGFuIG9iamVjdCB0aGVcbiAqIGJpbmRpbmcgYW5kIHRoZSBjb250ZXh0IGJvdGggcG9pbnQgYXQsIGFuZCBuZWVkcyBub3RoaW5nIGNhcnJpZWQgYmFjay5cbiAqXG4gKiBUaGUgY29udGV4dCBpcyBkZXN0cnVjdHVyZWQgaW4gdGhlIHBhcmFtZXRlciBsaXN0IHJhdGhlciB0aGFuIGRlY2xhcmVkIGluIHRoZSBib2R5IHNvIHRoYXQgdGhlXG4gKiBnZW5lcmF0ZWQgc291cmNlIHN0YXlzIG9uZSBsaW5lIHBlciBzdGF0ZW1lbnQgaW5zdGVhZCBvZiBvbmUgbGluZSBwZXIgY29udGV4dCBuYW1lIC0gYG5ldyBGdW5jdGlvbmBcbiAqIHBhcnNlcyB0aGF0IHNvdXJjZSBvbiBldmVyeSBjYWNoZSBtaXNzLCBhbmQgaXRzIGxlbmd0aCBpcyB3aGF0IHRoZSBtaXNzIGNvc3RzLiBJdCBhbHNvIGRlY2xhcmVzIG5vXG4gKiBuYW1lIG9mIGl0cyBvd246IHRoZSBzdGF0ZW1lbnQgY2FuIHRoZXJlZm9yZSBuZXZlciBjb2xsaWRlIHdpdGggYSBiaW5kaW5nIG9mIHRoaXMgZnVuY3Rpb24sIHdoaWNoXG4gKiBpcyB3aGF0IHRoZSByYW5kb20gc3VmZml4IHJlbW92ZWQgb24gMjAyNi0wOS0yMCB1c2VkIHRvIGd1YXJkLlxuICpcbiAqICoqTm90aGluZyBpcyBmaWx0ZXJlZCBvdXQgb2YgdGhlIHBhdHRlcm4uKiogRXZlcnkgbmFtZSB0aGUgY29udGV4dCBjYXJyaWVzIGlzIGJvdW5kLCBhIG5hbWUgdGhhdFxuICogY2Fubm90IGJlIGEgdmFyaWFibGUgaW5jbHVkZWQgLSBhIGtleSBsaWtlIGB0ZXN0LXRlc3RgLCBhIHJlc2VydmVkIHdvcmQsIGEgc3ltYm9sLCB0aGUgaW5kZXggb2YgYW5cbiAqIGFycmF5LiBTdWNoIGEgY29udGV4dCBjYW5ub3QgYmUgcnVuIG92ZXIgYnkgdGhpcyBleGVjdXRlciBhdCBhbGwsIGFuZCBkcm9wcGluZyB0aGUgbmFtZSBzaWxlbnRseVxuICogd291bGQgaGlkZSBhIHByb3BlcnR5IHRoZSBjYWxsZXIgZGVmaW5lZC4gV2hhdCB0aGlzIGV4ZWN1dGVyIG93ZXMgdGhlIGNhbGxlciBpbnN0ZWFkIGlzIGEgbWVzc2FnZVxuICogdGhhdCBzYXlzIHdoaWNoIHN0YXRlbWVudCBmYWlsZWQgYW5kIHdoaWNoIG5hbWUgZGlkIGl0LCBiZWNhdXNlIHRoZSBzdGF0ZW1lbnQgaXRzZWxmIG5lZWQgbm90XG4gKiBtZW50aW9uIHRoYXQgbmFtZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZVByb3BlcnR5TmFtZVN0cmluZyB0aGUgY29udGV4dCBuYW1lcywgY29tbWEgc2VwYXJhdGVkLCBhcyB0aGUgZGVzdHJ1Y3R1cmluZ1xuICogICAgICAgICAgICAgICAgIHBhdHRlcm4gc3BlbGxzIHRoZW1cbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfHN5bWJvbD59IHRoZU5hbWVzIHRoZSBzYW1lIG5hbWVzIHVud3JpdHRlbiwgZm9yIHRoZSBlcnJvciBtZXNzYWdlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQsIHRoZVByb3BlcnR5TmFtZVN0cmluZywgdGhlTmFtZXMpID0+IHtcblx0Ly8gT25seSBoZXJlLCBhbmQgdGhlcmVmb3JlIG9uY2UgcGVyIGNvbnRleHQgc2hhcGUgYW5kIHN0YXRlbWVudCByYXRoZXIgdGhhbiBvbiBldmVyeSBleGVjdXRpb246XG5cdC8vIGEgY29uc29sZSB3cml0ZSBpbiBhIGJyb3dzZXIgY29zdHMgbW9yZSB0aGFuIGEgcmVzb2x1dGlvbiBkb2VzLCBhbmQgd2FybmluZyBwZXIgZXhlY3V0aW9uIGNvc3Rcblx0Ly8gdGhpcyBleGVjdXRlciBhIGZhY3RvciBvZiBmb3VyIHRvIHR3ZW50eS1maXZlIChtZWFzdXJlZCAyMDI2LTA5LTIyLCBgbnBtIHJ1biBiZW5jaGApLlxuXHRpZiAodGhlTmFtZXMubGVuZ3RoID4gSElHSF9QUk9QRVJUWV9DT1VOVClcblx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRgSGlnaCBjb3VudCBvZiBwcm9wZXJ0aWVzIGF0IGZpcnN0IGxldmVsLCBjYW4gYmUgZGVjcmVhc2UgdGhlIHBlcmZvcm1lbmNlISBjb3VudDogJHt0aGVOYW1lcy5sZW5ndGh9YCxcblx0XHQpO1xuXG5cdGNvbnN0IGNvZGUgPSBgXG5yZXR1cm4gKGFzeW5jICh7JHt0aGVQcm9wZXJ0eU5hbWVTdHJpbmd9fSkgPT4ge1xuICAgIHRyeXtcbiAgICAgICByZXR1cm4gJHthU3RhdGVtZW50fVxuICAgIH1jYXRjaChlKXtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59KSgke1JFU0VSVkVEX1ZBUk5BTUV9IHx8IHt9KTtgO1xuXG5cdGlmIChERUJVRykgY29uc29sZS5sb2coXCJnZW5lcmVyYXRlZCBjb2RlOiBcXG5cIiwgY29kZSk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uKFJFU0VSVkVEX1ZBUk5BTUUsIGNvZGUpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gb25seSBhIHN5bnRheCBlcnJvciBjYW4gY29tZSBmcm9tIGEgbmFtZS4gQW55dGhpbmcgZWxzZSAtIHRoZSBFdmFsRXJyb3Igb2YgYSBDb250ZW50IFNlY3VyaXR5XG5cdFx0Ly8gUG9saWN5IHdpdGhvdXQgJ3Vuc2FmZS1ldmFsJyBhbW9uZyB0aGVtIC0gaXMgaGFuZGVkIG9uOiBhc2tpbmcgYWJvdXQgdGhlIG5hbWVzIHdvdWxkIGJlXG5cdFx0Ly8gcmVmdXNlZCBhcyB3ZWxsLCBhbmQgZXZlcnkgbmFtZSB3b3VsZCBiZSBibGFtZWRcblx0XHRpZiAoIShlIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpKSB0aHJvdyBlO1xuXG5cdFx0Y29uc3QgdW51c2FibGUgPSB1bnVzYWJsZU5hbWVzKHRoZU5hbWVzKTtcblx0XHQvLyBub3RoaW5nIHdyb25nIHdpdGggdGhlIG5hbWVzOiB0aGUgc3RhdGVtZW50IGl0c2VsZiBkb2VzIG5vdCBjb21waWxlLCBhbmQgdGhhdCBlcnJvciBzYXlzXG5cdFx0Ly8gbW9yZSB0aGFuIGFueXRoaW5nIHRoaXMgZXhlY3V0ZXIgY291bGQgYWRkXG5cdFx0aWYgKHVudXNhYmxlLmxlbmd0aCA9PT0gMCkgdGhyb3cgZTtcblxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihcblx0XHRcdGBDb250ZXh0IHByb3BlcnR5ICR7dW51c2FibGUubGVuZ3RoID09PSAxID8gXCJuYW1lXCIgOiBcIm5hbWVzXCJ9IFwiJHt1bnVzYWJsZS5qb2luKCdcIiwgXCInKX1cIiBjYW5ub3QgYmUgdXNlZCBhcyBhIHZhcmlhYmxlIGJ5ICR7RVhFQ1VURVJOQU1FfSwgc28gdGhpcyBzdGF0ZW1lbnQgY2Fubm90IHJ1biBvdmVyIHRoaXMgY29udGV4dCEgc3RhdGVtZW50OiAke2FTdGF0ZW1lbnR9YCxcblx0XHRcdHsgY2F1c2U6IGUgfSxcblx0XHQpO1xuXHR9XG59O1xuXG4vKipcbiAqIFRoZSBleGVjdXRlcjogZGVzdHJ1Y3R1cmVzIHRoZSBjb250ZXh0IGludG8gdGhlIHBhcmFtZXRlcnMgb2YgYSBnZW5lcmF0ZWQgZnVuY3Rpb24sIHNvIGFcbiAqIHN0YXRlbWVudCBhZGRyZXNzZXMgYSBjb250ZXh0IHZhbHVlIGJ5IGl0cyBiYXJlIG5hbWUgLSBzZWUgYFJFQURNRS5tZGAuXG4gKiBSZWdpc3RlcmVkIHVuZGVyIGBFWEVDVVRFUk5BTUVgIG9uIGltcG9ydC5cbiAqXG4gKiBAdHlwZSB7RXhlY3V0ZXJ9XG4gKi9cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzID0gZ2V0UHJvcGVydHlOYW1lcyhhQ29udGV4dCk7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCwgcHJvcGVydHlOYW1lcyk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdGVyKEVYRUNVVEVSTkFNRSwgRVhFQ1VURVIpO1xuXG5leHBvcnQgZGVmYXVsdCBFWEVDVVRFUjtcbiIsImltcG9ydCB7IHJlZ2lzdGVyIH0gZnJvbSBcIi4uL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBDb2RlQ2FjaGUgZnJvbSBcIi4uL0NvZGVDYWNoZS5qc1wiO1xuXG4vKiogVGhlIG5hbWUgdGhpcyBleGVjdXRlciBpcyByZWdpc3RlcmVkIHVuZGVyLiAqL1xuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKCk7XG4vKiogVGhlIG5hbWUgYSBzdGF0ZW1lbnQgYWRkcmVzc2VzIHRoZSBjb250ZXh0IGJ5LiAqL1xubGV0IENPTlRFWFRfVkFSID0gXCJjdHhcIjtcblxuLyoqXG4gKiBDb25maWd1cmVzIHRoaXMgZXhlY3V0ZXI6IHRoZSBzaXplIG9mIGl0cyBjb2RlIGNhY2hlIGFuZCB0aGUgbmFtZSBhIHN0YXRlbWVudCBhZGRyZXNzZXMgdGhlXG4gKiBjb250ZXh0IGJ5LiBBbiBvcHRpb24gbGVmdCBvdXQgY2hhbmdlcyBub3RoaW5nLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5zaXplXSB0aGUgc2l6ZSBvZiB0aGUgY29kZSBjYWNoZSwgYXMgYENvZGVDYWNoZU9wdGlvbnNgIGRlc2NyaWJlcyBpdCBpblxuICogYENvZGVDYWNoZS5qc2BcbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jb250ZXh0VmFyXSB0aGUgbmFtZSBhIHN0YXRlbWVudCBhZGRyZXNzZXMgdGhlIGNvbnRleHQgYnksIGBjdHhgIHVudGlsIGl0XG4gKiBpcyBzZXQuIEl0IGhvbGRzIGZvciBldmVyeSBzdGF0ZW1lbnQgdGhpcyBleGVjdXRlciBydW5zIGZyb20gdGhlbiBvbiwgd2hpY2hldmVyIHJlc29sdmVyIGhhbmRzIGl0XG4gKiBvdmVyLiBOdWxsLCB1bmRlZmluZWQgYW5kIGEgc3RyaW5nIHRoYXQgaXMgZW1wdHkgYWZ0ZXIgdHJpbW1pbmcgbGVhdmUgdGhlIG5hbWUgYXMgaXQgaXMuIEEgbmFtZVxuICogdGhhdCBjYW5ub3QgYmUgYSBwYXJhbWV0ZXIgbmFtZSBpcyBub3QgcmVqZWN0ZWQgaGVyZTogZXZlcnkgc3RhdGVtZW50IHRoZW4gdGhyb3dzIGEgYFN5bnRheEVycm9yYC5cbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHNpemUgaXMgbm90IGEgZmluaXRlIG51bWJlciwgb3IgdGhlIG5hbWUgaXMgbmVpdGhlciBhIHN0cmluZyBub3JcbiAqIG51bGwgb3IgdW5kZWZpbmVkXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcblx0Q09OVEVYVF9WQVIgPSBvcHRpb25zPy5jb250ZXh0VmFyID09IG51bGwgfHwgb3B0aW9ucz8uY29udGV4dFZhci50cmltKCkubGVuZ3RoID09PSAwID8gQ09OVEVYVF9WQVIgOiBvcHRpb25zPy5jb250ZXh0VmFyO1xufTtcblxuLyoqXG4gKiBUaGUgbmFtZSBhIHN0YXRlbWVudCBhZGRyZXNzZXMgdGhlIGNvbnRleHQgYnk6IGBjdHhgLCBvciB0aGUgb25lIGBzZXR1cEV4ZWN1dGVyYCBzZXQgbGFzdC5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgZ2V0Q29udGV4dFZhciA9ICgpID0+IENPTlRFWFRfVkFSO1xuXG4vKipcbiAqIENvbXBpbGVzIGEgc3RhdGVtZW50IGludG8gYSBmdW5jdGlvbiB0aGF0IGhhbmRzIHRoZSBjb250ZXh0IG92ZXIgdW5kZXIgdGhlIG5hbWUgYSBzdGF0ZW1lbnRcbiAqIGFkZHJlc3NlcyBpdCBieS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50KSA9PiB7XG5cdGNvbnN0IGNvZGUgPSBgXG5yZXR1cm4gKGFzeW5jICgke0NPTlRFWFRfVkFSfSkgPT4ge1xuICAgIHRyeXtcbiAgICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoJHtDT05URVhUX1ZBUn0gfHwge30pO2A7XG5cblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihDT05URVhUX1ZBUiwgY29kZSk7XG59O1xuXG4vKipcbiAqIFRoZSBjb21waWxlZCBmdW5jdGlvbiBmb3IgYSBzdGF0ZW1lbnQsIGZyb20gdGhlIGNhY2hlIG9yIGNvbXBpbGVkIG5vdyBhbmQgY2FjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRjb25zdCBjYWNoZUtleSA9IGAke0NPTlRFWFRfVkFSfTo6JHthU3RhdGVtZW50fWA7XG5cblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGNhY2hlS2V5KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChjYWNoZUtleSwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuLyoqXG4gKiBUaGUgZXhlY3V0ZXI6IGhhbmRzIHRoZSBjb250ZXh0IG92ZXIgYXMgb25lIG9iamVjdCBuYW1lZCBgY3R4YCwgb3IgdGhlIG5hbWUgYHNldHVwRXhlY3V0ZXJgIHNldHMsXG4gKiBzbyBhIHN0YXRlbWVudCBhZGRyZXNzZXMgYSBjb250ZXh0IHZhbHVlIGFzIGBjdHgudmFsdWVgIC0gc2VlIGBSRUFETUUubWRgLiBSZWdpc3RlcmVkIHVuZGVyXG4gKiBgRVhFQ1VURVJOQU1FYCBvbiBpbXBvcnQuXG4gKlxuICogQHR5cGUge0V4ZWN1dGVyfVxuICovXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7XG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCk7XG5cdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fSxcbn0pO1xuXG5yZWdpc3RlcihFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCJpbXBvcnQgeyByZWdpc3RlciB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcbmltcG9ydCB7IHVuZGVjbGFyZWRWYXJuYW1lIH0gZnJvbSBcIi4uL1V0aWxzLmpzXCI7XG5cbi8qKiBUaGUgbmFtZSB0aGlzIGV4ZWN1dGVyIGlzIHJlZ2lzdGVyZWQgdW5kZXIuICovXG5leHBvcnQgY29uc3QgRVhFQ1VURVJOQU1FID0gXCJ3aXRoLXNjb3BlZC1leGVjdXRlclwiO1xuY29uc3QgRVhQUkVTU0lPTl9DQUNIRSA9IG5ldyBDb2RlQ2FjaGUoKTtcblxuY29uc3QgUkVTRVJWRURfVkFSTkFNRSA9IHVuZGVjbGFyZWRWYXJuYW1lKHsgcHJlZml4OiBcIiRXU0VfXCIsIHN1ZmZpeDogXCJfV1NFJFwiLCBtaW5MZW5ndGg6IDMyIH0pO1xuXG4vKipcbiAqIENvbmZpZ3VyZXMgdGhlIGNvZGUgY2FjaGUgb2YgdGhpcyBleGVjdXRlci4gYHNpemVgIGlzIHRoZSBvbmx5IG9wdGlvblxuICogdG9kYXk7IGFuIG9wdGlvbiBsZWZ0IG91dCBjaGFuZ2VzIG5vdGhpbmcuXG4gKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlcmUgdGhlIHNpemUgaXMgbm90IGEgZmluaXRlIG51bWJlclxuICovXG5leHBvcnQgY29uc3Qgc2V0dXBFeGVjdXRlciA9IChvcHRpb25zKSA9PiB7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XG59O1xuXG5sZXQgaW5pdGlhbENhbGwgPSB0cnVlO1xuXG4vKipcbiAqIENvbXBpbGVzIGEgc3RhdGVtZW50IGludG8gYSBmdW5jdGlvbiB0aGF0IHJ1bnMgaXQgaW5zaWRlIGEgYHdpdGhgIGJsb2NrIG92ZXIgdGhlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRjb25zdCBjb2RlID0gYFxuXHRyZXR1cm4gKGFzeW5jICgke1JFU0VSVkVEX1ZBUk5BTUV9KSA9PiB7XG5cdFx0d2l0aCgke1JFU0VSVkVEX1ZBUk5BTUV9KXtcblx0XHRcdHRyeXtcblx0XHRcdFx0cmV0dXJuICR7YVN0YXRlbWVudH1cblx0XHRcdH1jYXRjaChlKXtcblx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pKCR7UkVTRVJWRURfVkFSTkFNRX0gfHwge30pO1xuYDtcblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihSRVNFUlZFRF9WQVJOQU1FLCBjb2RlKTtcbn07XG5cbi8qKlxuICogVGhlIGNvbXBpbGVkIGZ1bmN0aW9uIGZvciBhIHN0YXRlbWVudCwgZnJvbSB0aGUgY2FjaGUgb3IgY29tcGlsZWQgbm93IGFuZCBjYWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50KSA9PiB7XG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhhU3RhdGVtZW50KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChhU3RhdGVtZW50KTtcblx0fVxuXHRjb25zdCBleHByZXNzaW9uID0gZ2VuZXJhdGUoYVN0YXRlbWVudCk7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGFTdGF0ZW1lbnQsIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbi8qKlxuICogVGhlIGV4ZWN1dGVyOiBydW5zIGEgc3RhdGVtZW50IGluc2lkZSBhIGB3aXRoYCBibG9jayBvdmVyIHRoZSBjb250ZXh0LCBzbyBhIHN0YXRlbWVudCBhZGRyZXNzZXMgYVxuICogY29udGV4dCB2YWx1ZSBieSBpdHMgYmFyZSBuYW1lIC0gc2VlIGBSRUFETUUubWRgLiBSZWdpc3RlcmVkIHVuZGVyXG4gKiBgRVhFQ1VURVJOQU1FYCBvbiBpbXBvcnQuXG4gKlxuICogQGRlcHJlY2F0ZWQgYmVjYXVzZSBgd2l0aGAgaXM7IGFubm91bmNlcyBpdCBvbiB0aGUgZmlyc3Qgc3RhdGVtZW50IGl0IHJ1bnNcbiAqIEB0eXBlIHtFeGVjdXRlcn1cbiAqL1xuY29uc3QgRVhFQ1VURVIgPSBuZXcgRXhlY3V0ZXIoe1xuXHRleGVjdXRpb246IChhU3RhdGVtZW50LCBhQ29udGV4dCkgPT4ge1xuXHRcdGlmIChpbml0aWFsQ2FsbCkge1xuXHRcdFx0aW5pdGlhbENhbGwgPSBmYWxzZTtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0bmV3IEVycm9yKGBXaXRoIFNjb3BlZCBleHByZXNzaW9uIGV4ZWN1dGlvbiBpcyBtYXJrZWQgYXMgZGVwcmVjYXRlZC5gKSxcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5yZWdpc3RlcihFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCJpbXBvcnQgXCIuL1dpdGhTY29wZWRFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFwiLi9Db250ZXh0T2JqZWN0RXhlY3V0ZXIuanNcIjtcbmltcG9ydCBcIi4vQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qc1wiO1xuIiwiLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gKlxuICogR2VuZXJhdGVkIGZyb20gcGFja2FnZS5qc29uIGJ5IHNjcmlwdHMvZ2VuZXJhdGUtdmVyc2lvbi5qcyBiZWZvcmUgZXZlcnkgYnVpbGQuIERvIG5vdCBlZGl0IC1cbiAqIHRoZSBuZXh0IGJ1aWxkIG92ZXJ3cml0ZXMgaXQuXG4gKlxuICogQG1vZHVsZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gXCIzLjAuMFwiO1xuXG5leHBvcnQgZGVmYXVsdCBWRVJTSU9OO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxuY29uc3QgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRjb25zdCBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0Y29uc3QgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdGNvbnN0IGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyL3ZhbHVlIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRpZihBcnJheS5pc0FycmF5KGRlZmluaXRpb24pKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHdoaWxlKGkgPCBkZWZpbml0aW9uLmxlbmd0aCkge1xuXHRcdFx0dmFyIGtleSA9IGRlZmluaXRpb25baSsrXTtcblx0XHRcdHZhciBiaW5kaW5nID0gZGVmaW5pdGlvbltpKytdO1xuXHRcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRcdGlmKGJpbmRpbmcgPT09IDApIHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiBkZWZpbml0aW9uW2krK10gfSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGJpbmRpbmcgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZihiaW5kaW5nID09PSAwKSB7IGkrKzsgfVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5oYXNPd24ob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZihTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSBcIi4vc3JjL3ZlcnNpb24uanNcIjtcblxuR0xPQkFMLmRlZmF1bHRqcyA9IEdMT0JBTC5kZWZhdWx0anMgfHwge307XG5HTE9CQUwuZGVmYXVsdGpzLmVsID0gR0xPQkFMLmRlZmF1bHRqcy5lbCB8fCB7XG5cdFZFUlNJT04sXG5cdEV4cHJlc3Npb25SZXNvbHZlcixcblx0RXhlY3V0ZXJSZWdpc3RyeVxufTtcblxuZXhwb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBFeGVjdXRlclJlZ2lzdHJ5IH07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=