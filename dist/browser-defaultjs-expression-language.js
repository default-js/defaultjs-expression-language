/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js"
/*!******************!*\
  !*** ./index.js ***!
  \******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExecuterRegistry: () => (/* reexport module object */ _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   ExpressionResolver: () => (/* reexport safe */ _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/ExpressionResolver.js */ "./src/ExpressionResolver.js");
/* harmony import */ var _src_executer_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/executer/index.js */ "./src/executer/index.js");
/* harmony import */ var _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/ExecuterRegistry.js */ "./src/ExecuterRegistry.js");







/***/ },

/***/ "./src/CodeCache.js"
/*!**************************!*\
  !*** ./src/CodeCache.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
 * @property {number} [size=1000] - Maximum number of entries in the cache. If set to 0 or less, caching is disabled.
 */

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
	 * @param {CodeCacheOptions} options
	 */
	constructor(options = {}) {
		this.setup(options);
	}

	/**
	 * Applies a new size. A size of 0 or less disables the cache and releases its entries,
	 * a later positive size enables it again and starts empty.
	 *
	 * @param {CodeCacheOptions} options
	 */
	setup({ size = 1000 } = {}) {
		this.#disabled = size <= 0;
		if (this.#disabled) {
			this.#size = 0;
			this.#maxSize = 0;
			this.clear();
		} else {
			this.#size = size;
			this.#maxSize = Math.floor(size * 1.1);
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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
	// each and overflowed the stack on a deep chain. A scope no link of the chain carries answers
	// undefined, and the default applies to it like to any other result - see SPECIFICATION.md 5.4
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
	 * @param {?string} [options.name=null] where none is passed, one is generated - 5.1
	 * @param {(string|Executer)} [options.executer] the registered name of an executer, or an
	 * `Executer` instance. A name that is not registered throws; an instance needs no registration,
	 * because it addresses the executer directly. Without the option the resolver uses
	 * `ExpressionResolver.defaultExecuter` - 4.2.
	 */
	constructor({ context, parent = null, name = null, executer } = {}) {
		if(executer instanceof _Executer_js__WEBPACK_IMPORTED_MODULE_5__["default"]) this.#executer =  executer;
		else if (typeof executer === "string") this.#executer = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__["default"])(executer);
		else if(parent != null) this.#executer = parent.executer;
		else this.#executer = ExpressionResolver.defaultExecuter;
		
		this.#parent = parent instanceof ExpressionResolver ? parent : null;
		this.#name = name || generateName();		
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
	 * @param {?string} filter
	 * @returns {ExpressionResolver}
	 */
	#findResolver(filter) {
		if (!filter) return this;

		let resolver = this;
		while (resolver) {
			if (resolver.name === filter) return resolver;
			resolver = resolver.parent;
		}

		throw new Error(`Filter "${filter}" matches no resolver of the chain!`);
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
		const resolver = this.#findResolver(filter);
		if (!key) return resolver.context;

		return resolver.context[key];
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
		const resolver = this.#findResolver(filter);
		if (!key) return;

		const target = filter ? resolver : this.#resolverForKey(key) || this;
		target.context[key] = value;
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
		const resolver = this.#findResolver(filter);
		if (!key) return;

		const target = filter ? resolver : this.#resolverForKey(key);
		if (target) delete target.context[key];
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
		this.#findResolver(filter).contextHandle.mergeData(context);
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
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if (typeof aText !== "string") return aText;

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   normalize: () => (/* binding */ normalize),
/* harmony export */   parseExpression: () => (/* binding */ parseExpression),
/* harmony export */   scan: () => (/* binding */ scan)
/* harmony export */ });
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

// a "/" continues an expression instead of opening a regular expression when it follows one of
// these - the classic division-or-regex question, decided on the last character that is not
// whitespace
const BEFORE_DIVISION = /[a-zA-Z0-9_$)\]]/;
const WHITESPACE = /\s/;

// the characters the scanner decides on, compared as char codes rather than as one-character strings
const BACKSLASH = 0x5c;
const DOLLAR = 0x24;
const OPEN_BRACE = 0x7b;
const CLOSE_BRACE = 0x7d;
const SINGLE_QUOTE = 0x27;
const DOUBLE_QUOTE = 0x22;
const BACKTICK = 0x60;
const SLASH = 0x2f;
const OPEN_BRACKET = 0x5b;
const CLOSE_BRACKET = 0x5d;
const COLON = 0x3a;

const SCOPE_SEPARATOR = "::";

/**
 * Whether a character may stand in a scope name - SPECIFICATION.md 3.3: an ASCII letter, a digit,
 * "-", "_", or whitespace in the sense of `\s`, which past ASCII is left to the regular expression.
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
 * Trims a statement, and answers null for one that is empty.
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

const startsRegex = (aText, aIndex) => {
	let index = aIndex - 1;
	while (index >= 0 && WHITESPACE.test(aText[index])) index--;

	return index < 0 || !BEFORE_DIVISION.test(aText[index]);
};

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
	while (index < length && isNameCharacter(aContent.charCodeAt(index))) index++;

	if (index === 0 || aContent.charCodeAt(index) !== COLON || aContent.charCodeAt(index + 1) !== COLON)
		return { scope: null, statement: normalize(aContent) };

	return { scope: normalize(aContent.substring(0, index)), statement: normalize(aContent.substring(index + 2)) };
};

const countBackslashes = (aText, aIndex) => {
	let count = 0;
	while (aIndex - count > 0 && aText.charCodeAt(aIndex - count - 1) === BACKSLASH) count++;

	return count;
};

/**
 * Reads the one expression whose "${" stands at aStart, counting braces but not the ones hidden
 * inside a literal, and takes it apart into scope prefix and statement.
 *
 * Answers the occurrence `scan` hands on, `end` the index directly after the matching closing brace;
 * null where the text ends before that brace, which per SPECIFICATION.md 3.1 means there is no
 * expression here at all; and, with `end` negated, the index of another "${" met outside a literal,
 * which starts an expression of its own and abandons this one.
 *
 * @param {string} aText
 * @param {number} aStart
 * @returns {?{ start: number, end: number, escaped: boolean, scope: ?string, statement: ?string }}
 */
const readExpression = (aText, aStart) => {
	const length = aText.length;
	const stack = [CODE];
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
				else if (char === SLASH && startsRegex(aText, index)) stack.push(REGEX);
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
		// expression either - a "${" outside a literal would have restarted the scan instead
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
	return { scope: null, statement: normalize(aExpression) };
};

/**
 * The split of the single expression: most statements carry no "::" at all and are done after one
 * native search. Where one stands, everything before the first of them has to be a name, checked
 * backwards from it: a "::" inside a statement - a quoted one - usually has a character no name
 * carries right in front of it.
 */
const splitScopeAndStatementBySeparator = (aContent) => {
	const end = aContent.indexOf(SCOPE_SEPARATOR);
	if (end < 1) return { scope: null, statement: normalize(aContent) };

	for (let index = end - 1; index >= 0; index--)
		if (!isNameCharacter(aContent.charCodeAt(index))) return { scope: null, statement: normalize(aContent) };

	return { scope: normalize(aContent.substring(0, end)), statement: normalize(aContent.substring(end + 2)) };
};


/***/ },

/***/ "./src/ResolverContextHandle.js"
/*!**************************************!*\
  !*** ./src/ResolverContextHandle.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
		this.#data = (0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(context) ? null : context || {};
		this.#parent = parent ? parent : null;
		this.#providesData = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(context);

		this.#cache = this.#initPropertyCache();

		if (_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"] === this.#data)
			this.#proxy = this.#data;
		else {
			// The proxy answers for the whole chain, which is more than the object handed to this
			// link holds. A proxy may not speak that freely for a target that guarantees anything
			// about its own keys - a frozen or sealed context is where that ends in a TypeError -
			// so it gets an empty target of its own. No trap reads it; every one of them works on
			// #data and #cache.
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
		this.#data = (0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data) ? null : data || {};
		this.#providesData = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data);
		this.#cache = this.#initPropertyCache();
	}

	mergeData(data) {
		if (typeof data !== "object" || data == null) return;
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

/***/ "./src/executer/ContextDeconstructorExecuter.js"
/*!******************************************************!*\
  !*** ./src/executer/ContextDeconstructorExecuter.js ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]({ size: 5000 });

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]({ size: 5000 });

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_2__["default"]({ size: 5000 });

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
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _WithScopedExecuter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WithScopedExecuter.js */ "./src/executer/WithScopedExecuter.js");
/* harmony import */ var _ContextObjectExecuter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ContextObjectExecuter.js */ "./src/executer/ContextObjectExecuter.js");
/* harmony import */ var _ContextDeconstructorExecuter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ContextDeconstructorExecuter.js */ "./src/executer/ContextDeconstructorExecuter.js");
//import "./EsprimaExecuter.js";





/***/ },

/***/ "./src/version.js"
/*!************************!*\
  !*** ./src/version.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7OztBQ0poRDtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFFBQVE7QUFDdEIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsVUFBVTtBQUN4Qjs7QUFFQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFFBQVE7QUFDdEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlO0FBQ2YsWUFBWSxTQUFTO0FBQ3JCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsWUFBWSxtQkFBbUI7QUFDL0I7QUFDQSxZQUFZLHdCQUF3QjtBQUNwQztBQUNBLFlBQVksUUFBUTtBQUNwQjs7O0FBR0E7QUFDQSxZQUFZLGtCQUFrQjtBQUM5QjtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxrQkFBa0I7QUFDOUI7QUFDQSxTQUFTLGNBQWMsSUFBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ2U7QUFDZjtB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Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05rRTtBQUNJO0FBQzNCOztBQUUzQyx3RkFBTSxhQUFhLHdGQUFNO0FBQ3pCLHdGQUFNLGdCQUFnQix3RkFBTTtBQUM1QixRQUFRO0FBQ1IsbUJBQW1CO0FBQ25CLGlCQUFpQjtBQUNqQjs7QUFFZ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL2luZGV4LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0NvZGVDYWNoZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9EZWZhdWx0VmFsdWUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXJSZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhwcmVzc2lvblNjYW5uZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvQ29udGV4dE9iamVjdEV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL1dpdGhTY29wZWRFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy92ZXJzaW9uLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vYnJvd3Nlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvblJlc29sdmVyIGZyb20gXCIuL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanNcIjtcbmltcG9ydCBcIi4vc3JjL2V4ZWN1dGVyL2luZGV4LmpzXCI7XG5pbXBvcnQgKiBhcyBFeGVjdXRlclJlZ2lzdHJ5IGZyb20gXCIuL3NyYy9FeGVjdXRlclJlZ2lzdHJ5LmpzXCJcblxuZXhwb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBFeGVjdXRlclJlZ2lzdHJ5IH07XG4iLCIvKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENhY2hlRW50cnlcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsYXN0SGl0IC0gTW9ub3RvbmljIG1hcmtlciBvZiB0aGUgbGFzdCByZWFkIG9yIHdyaXRlLCB0aGUgZXZpY3Rpb24gb3JkZXIuXG4gKiBAcHJvcGVydHkge3N0cmluZ30ga2V5XG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSB2YWx1ZVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29kZUNhY2hlT3B0aW9uc1xuICogQHByb3BlcnR5IHtudW1iZXJ9IFtzaXplPTEwMDBdIC0gTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2FjaGUuIElmIHNldCB0byAwIG9yIGxlc3MsIGNhY2hpbmcgaXMgZGlzYWJsZWQuXG4gKi9cblxuLyoqXG4gKiBDb2RlQ2FjaGUgY2xhc3MgdG8gbWFuYWdlIGNhY2hpbmcgb2YgZ2VuZXJhdGVkIGNvZGUgc25pcHBldHMuXG4gKlxuICogRW50cmllcyBhcmUgZXZpY3RlZCBsZWFzdCByZWNlbnRseSB1c2VkIGZpcnN0OiBldmVyeSBoaXQgcmVmcmVzaGVzIHRoZSBlbnRyeSwgc28gYW5cbiAqIGV4cHJlc3Npb24gdGhhdCBrZWVwcyBiZWluZyByZXNvbHZlZCBvdXRsaXZlcyBvbmUgdGhhdCB3YXMgY29tcGlsZWQgb25jZSBhbmQgZHJvcHBlZC5cbiAqIFRoZSBtYXJrZXIgaXMgYSBjb3VudGVyIHJhdGhlciB0aGFuIGEgdGltZXN0YW1wIOKAlCBhIGJ1cnN0IG9mIGZpcnN0LXRpbWUgY29tcGlsYXRpb25zXG4gKiBmYWxscyBpbnRvIGEgc2luZ2xlIG1pbGxpc2Vjb25kLCB3aGljaCB3b3VsZCBsZWF2ZSB0aGUgZXZpY3Rpb24gb3JkZXIgdG8gY2hhbmNlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlQ2FjaGUge1xuXHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdCNkaXNhYmxlZCA9IGZhbHNlO1xuXHQvKiogQHR5cGUge251bWJlcn0gKi9cblx0I3NpemUgPSAwO1xuXHQvKiogQHR5cGUge251bWJlcn0gKi9cblx0I21heFNpemUgPSAwO1xuXHQvKiogQHR5cGUge0FycmF5PENhY2hlRW50cnk+fSAqL1xuXHQjZW50cmllcyA9IFtdO1xuXHQvKiogQHR5cGUge01hcDxzdHJpbmcsQ2FjaGVFbnRyeT59ICovXG5cdCNlbnRyeU1hcCA9IG5ldyBNYXAoKTtcblx0LyoqIEB0eXBlIHtudW1iZXJ9IC0gSGFuZHMgb3V0IHRoZSBgbGFzdEhpdGAgbWFya2VycywgbmV2ZXIgcmVzZXQuICovXG5cdCNjbG9jayA9IDA7XG5cblxuXHQvKipcblx0ICogQHBhcmFtIHtDb2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLnNldHVwKG9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgYSBuZXcgc2l6ZS4gQSBzaXplIG9mIDAgb3IgbGVzcyBkaXNhYmxlcyB0aGUgY2FjaGUgYW5kIHJlbGVhc2VzIGl0cyBlbnRyaWVzLFxuXHQgKiBhIGxhdGVyIHBvc2l0aXZlIHNpemUgZW5hYmxlcyBpdCBhZ2FpbiBhbmQgc3RhcnRzIGVtcHR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICovXG5cdHNldHVwKHsgc2l6ZSA9IDEwMDAgfSA9IHt9KSB7XG5cdFx0dGhpcy4jZGlzYWJsZWQgPSBzaXplIDw9IDA7XG5cdFx0aWYgKHRoaXMuI2Rpc2FibGVkKSB7XG5cdFx0XHR0aGlzLiNzaXplID0gMDtcblx0XHRcdHRoaXMuI21heFNpemUgPSAwO1xuXHRcdFx0dGhpcy5jbGVhcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLiNzaXplID0gc2l6ZTtcblx0XHRcdHRoaXMuI21heFNpemUgPSBNYXRoLmZsb29yKHNpemUgKiAxLjEpO1xuXHRcdFx0dGhpcy4jdHJpbSgpO1xuXHRcdH1cblx0fVxuXG5cdGhhcyhrZXkpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiB0aGlzLiNlbnRyeU1hcC5oYXMoa2V5KTtcblx0fVxuXG5cdGdldChrZXkpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIG51bGw7XG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0cmV0dXJuIGVudHJ5LnZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHNldChrZXksIGNvZGUpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuO1xuXHRcdGxldCBlbnRyeSA9IHRoaXMuI2VudHJ5TWFwLmdldChrZXkpO1xuXHRcdGlmIChlbnRyeSkge1xuXHRcdFx0ZW50cnkubGFzdEhpdCA9ICsrdGhpcy4jY2xvY2s7XG5cdFx0XHRlbnRyeS52YWx1ZSA9IGNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVudHJ5ID0ge1xuXHRcdFx0XHRsYXN0SGl0OiArK3RoaXMuI2Nsb2NrLFxuXHRcdFx0XHRrZXksXG5cdFx0XHRcdHZhbHVlOiBjb2RlLFxuXHRcdFx0fTtcblx0XHRcdHRoaXMuI2VudHJpZXMucHVzaChlbnRyeSk7XG5cdFx0XHR0aGlzLiNlbnRyeU1hcC5zZXQoa2V5LCBlbnRyeSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuI2VudHJ5TWFwLnNpemUgPj0gdGhpcy4jbWF4U2l6ZSkgdGhpcy4jdHJpbSgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy4jZW50cmllcyA9IFtdO1xuXHRcdHRoaXMuI2VudHJ5TWFwID0gbmV3IE1hcCgpO1xuXHR9XG5cblx0I3RyaW0oKSB7XG5cdFx0dGhpcy4jZW50cmllcy5zb3J0KChhLCBiKSA9PiBiLmxhc3RIaXQgLSBhLmxhc3RIaXQpO1xuXHRcdGlmICh0aGlzLiNlbnRyaWVzLmxlbmd0aCA+IHRoaXMuI3NpemUpIHtcblx0XHRcdGNvbnN0IGVudHJpZXNUb1JlbW92ZSA9IHRoaXMuI2VudHJpZXMuc3BsaWNlKHRoaXMuI3NpemUpO1xuXHRcdFx0Zm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzVG9SZW1vdmUpIHtcblx0XHRcdFx0dGhpcy4jZW50cnlNYXAuZGVsZXRlKGVudHJ5LmtleSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuIiwiLyoqXG4gKiBvYmplY3QgZm9yIGRlZmF1bHQgdmFsdWVcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRGVmYXVsdFZhbHVlXG4gKiBAdHlwZWRlZiB7RGVmYXVsdFZhbHVlfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWZhdWx0VmFsdWUge1xuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBEZWZhdWx0VmFsdWUuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0geyp9IHZhbHVlXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZSl7XG5cdFx0dGhpcy5oYXNWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMTtcblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdH1cbn07XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFeGVjdXRlcntcblxuXHQjZXhlY3V0aW9uO1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbi5leGVjdXRpb25cblx0ICovXG5cdGNvbnN0cnVjdG9yKHtleGVjdXRpb259ID0ge30pe1xuXHRcdHRoaXMuI2V4ZWN1dGlvbiA9IGV4ZWN1dGlvbiB8fCAoKCkgPT4ge3Rocm93IG5ldyBFcnJvcihcIm5vdCBpbXBsZW1lbnRlZFwiKX0pO1xuXHR9XG5cblx0ZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCl7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGlvbihhU3RhdGVtZW50LCBhQ29udGV4dCk7XG5cdH1cbn07XG4iLCJpbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcblxuY29uc3QgRVhFQ1VURVJTID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEBwYXJhbSB7RXhlY3V0ZXJ9IGFuRXhlY3V0ZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdHJhdGUgPSAoYU5hbWUsIGFuRXhlY3V0ZXIpID0+IHtcblx0RVhFQ1VURVJTLnNldChhTmFtZSwgYW5FeGVjdXRlcik7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEByZXR1cm5zIHtFeGVjdXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4ZWN1dGVyID0gKGFOYW1lKSA9PiB7XG5cdGNvbnN0IGV4ZWN1dGVyID0gRVhFQ1VURVJTLmdldChhTmFtZSk7XG5cdGlmICghZXhlY3V0ZXIpIHRocm93IG5ldyBFcnJvcihgRXhlY3V0ZXIgXCIke2FOYW1lfVwiIGlzIG5vdCByZWdpc3RyYXRlZCFgKTtcblx0cmV0dXJuIGV4ZWN1dGVyO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RXhlY3V0ZXI7XG4iLCJpbXBvcnQgT2JqZWN0VXRpbHMgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5pbXBvcnQgRGVmYXVsdFZhbHVlIGZyb20gXCIuL0RlZmF1bHRWYWx1ZS5qc1wiO1xuaW1wb3J0IGdldEV4ZWN1dGVyVHlwZSBmcm9tIFwiLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRGVmYXVsdEV4ZWN1dGVyIGZyb20gXCIuL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBSZXNvbHZlckNvbnRleHRIYW5kbGUgZnJvbSBcIi4vUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCB7IHNjYW4sIHBhcnNlRXhwcmVzc2lvbiB9IGZyb20gXCIuL0V4cHJlc3Npb25TY2FubmVyLmpzXCI7XG5cbi8qKiBAdHlwZSB7RXhlY3V0ZXJ9ICovXG5sZXQgREVGQVVMVF9FWEVDVVRFUiA9IERlZmF1bHRFeGVjdXRlcjtcblxuY29uc3QgREVGQVVMVF9OT1RfREVGSU5FRCA9IG5ldyBEZWZhdWx0VmFsdWUoKTtcbmNvbnN0IHRvRGVmYXVsdFZhbHVlID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSkgcmV0dXJuIHZhbHVlO1xuXG5cdHJldHVybiBuZXcgRGVmYXVsdFZhbHVlKHZhbHVlKTtcbn07XG5cbmxldCBOQU1FX0NPVU5URVIgPSAwO1xuLyoqXG4gKiBUaGUgbmFtZSBhIHJlc29sdmVyIGNhcnJpZXMgd2hlcmUgdGhlIGNhbGxlciBwYXNzZWQgbm9uZS4gT25seSB1bmlxdWVuZXNzIGlzIHByb21pc2VkLCB0aGUgc2hhcGVcbiAqIGlzIG5vdCAtIFNQRUNJRklDQVRJT04ubWQgNS4xLlxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdlbmVyYXRlTmFtZSA9ICgpID0+IGBFUiR7KytOQU1FX0NPVU5URVJ9YDtcblxuY29uc3QgZXhlY3V0ZSA9IGFzeW5jIGZ1bmN0aW9uIChhbkV4ZWN1dGVyLCBhU3RhdGVtZW50LCBhQ29udGV4dCkge1xuXHQvLyAzLjQ6IGFuIGVtcHR5IHN0YXRlbWVudCBhbnN3ZXJzIHVuZGVmaW5lZCwgdGhlIHNhbWUgYXMgYHJldHVybjtgIGluIEphdmFTY3JpcHQuIFRoZSBzY2FubmVyXG5cdC8vIGhhbmRzIGV2ZXJ5IHN0YXRlbWVudCBvdmVyIHRyaW1tZWQsIGFuZCBhbiBlbXB0eSBvbmUgYXMgbnVsbC5cblx0aWYgKGFTdGF0ZW1lbnQgPT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0aWYgKHR5cGVvZiBhU3RhdGVtZW50ICE9PSBcInN0cmluZ1wiKSByZXR1cm4gYVN0YXRlbWVudDtcblxuXHQvLyBhbiBlcnJvciBpcyBkZWxpYmVyYXRlbHkgbm90IGNhdWdodCBoZXJlOiBzZWN0aW9uIDcgZ2l2ZXMgdGhlIHR3byBlbnRyeSBwb2ludHMgZGlmZmVyZW50XG5cdC8vIGFuc3dlcnMgdG8gaXQsIHNvIGVhY2ggb2YgdGhlbSBoYW5kbGVzIGl0IGZvciBpdHNlbGZcblx0cmV0dXJuIGF3YWl0IGFuRXhlY3V0ZXIuZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCk7XG59O1xuXG5jb25zdCB3YXJuRmFpbGVkU3RhdGVtZW50ID0gKGFTdGF0ZW1lbnQsIGFuRXJyb3IpID0+IHtcblx0Y29uc29sZS53YXJuKGBFeGVjdXRpb24gZXJyb3Igb24gc3RhdGVtZW50IVxuXHRcdHN0YXRlbWVudDpcblx0XHQke2FTdGF0ZW1lbnR9XG5cdFx0ZXJyb3I6XG5cdFx0JHthbkVycm9yfVxuXHRcdGApO1xufTtcblxuY29uc3Qgd2l0aERlZmF1bHQgPSAoYVJlc3VsdCwgYURlZmF1bHQpID0+IHtcblx0aWYgKGFSZXN1bHQgIT09IG51bGwgJiYgdHlwZW9mIGFSZXN1bHQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBhUmVzdWx0O1xuXHRlbHNlIGlmIChhRGVmYXVsdCBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSAmJiBhRGVmYXVsdC5oYXNWYWx1ZSkgcmV0dXJuIGFEZWZhdWx0LnZhbHVlO1xuXHRyZXR1cm4gYVJlc3VsdDtcbn07XG5cbmNvbnN0IHJlc29sdmUgPSBhc3luYyBmdW5jdGlvbiAoYUV4ZWN1dGVyID0gREVGQVVMVF9FWEVDVVRFUiwgYVJlc29sdmVyLCBhRXhwcmVzc2lvbiwgYUZpbHRlciwgYURlZmF1bHQpIHtcblx0Ly8gNS4zOiBjbGltYnMgaW4gYSBsb29wIHJhdGhlciB0aGFuIGJ5IHJlY3Vyc2lvbiAtIG9uZSBjYWxsIHBlciByZXNvbHZlciBjbGltYmVkIGNvc3QgYSBwcm9taXNlXG5cdC8vIGVhY2ggYW5kIG92ZXJmbG93ZWQgdGhlIHN0YWNrIG9uIGEgZGVlcCBjaGFpbi4gQSBzY29wZSBubyBsaW5rIG9mIHRoZSBjaGFpbiBjYXJyaWVzIGFuc3dlcnNcblx0Ly8gdW5kZWZpbmVkLCBhbmQgdGhlIGRlZmF1bHQgYXBwbGllcyB0byBpdCBsaWtlIHRvIGFueSBvdGhlciByZXN1bHQgLSBzZWUgU1BFQ0lGSUNBVElPTi5tZCA1LjRcblx0aWYgKGFGaWx0ZXIpXG5cdFx0d2hpbGUgKGFSZXNvbHZlci5uYW1lICE9IGFGaWx0ZXIpIHtcblx0XHRcdGFSZXNvbHZlciA9IGFSZXNvbHZlci5wYXJlbnQ7XG5cdFx0XHRpZiAoIWFSZXNvbHZlcikgcmV0dXJuIHdpdGhEZWZhdWx0KHVuZGVmaW5lZCwgYURlZmF1bHQpO1xuXHRcdH1cblxuXHRyZXR1cm4gd2l0aERlZmF1bHQoYXdhaXQgZXhlY3V0ZShhRXhlY3V0ZXIsIGFFeHByZXNzaW9uLCBhUmVzb2x2ZXIuY29udGV4dCksIGFEZWZhdWx0KTtcbn07XG5cbi8vIDQuMTogdGhlIGZpcnN0IGFyZ3VtZW50IG9mIGEgc3RhdGljIGVudHJ5IHBvaW50IGlzIGEgc3RyaW5nLCBvciBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5jb25zdCBpc0NvbmZpZ3VyYXRpb24gPSAoYVZhbHVlKSA9PiBhVmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIGFWYWx1ZSA9PT0gXCJvYmplY3RcIjtcblxuLy8gNC4xOiBhIGNvbmZpZ3VyYXRpb24gY291bnRzIGFzIHBhc3NpbmcgYSBkZWZhdWx0IHdoZXJlIGl0IGNhcnJpZXMgdGhlIGtleSwgd2hhdGV2ZXIgaXQgaG9sZHNcbmNvbnN0IGRlZmF1bHRPZiA9IChhQ29uZmlndXJhdGlvbikgPT4gKFwiZGVmYXVsdFZhbHVlXCIgaW4gYUNvbmZpZ3VyYXRpb24gPyBhQ29uZmlndXJhdGlvbi5kZWZhdWx0VmFsdWUgOiBERUZBVUxUX05PVF9ERUZJTkVEKTtcblxuLyoqXG4gKiBFeHByZXNzaW9uUmVzb2x2ZXJcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyXG4gKiBAdHlwZWRlZiB7RXhwcmVzc2lvblJlc29sdmVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uUmVzb2x2ZXIge1xuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFuRXhlY3V0ZXJOYW1lXG5cdCAqL1xuXHRzdGF0aWMgc2V0IGRlZmF1bHRFeGVjdXRlcihhbkV4ZWN1dGVyKSB7XG5cdFx0aWYgKCBhbkV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpIERFRkFVTFRfRVhFQ1VURVIgPSBhbkV4ZWN1dGVyO1xuXHRcdGVsc2UgREVGQVVMVF9FWEVDVVRFUiA9IGdldEV4ZWN1dGVyVHlwZShhbkV4ZWN1dGVyKTtcblx0XHRjb25zb2xlLmluZm8oYENoYW5nZWQgZGVmYXVsdCBleGVjdXRlciBmb3IgRXhwcmVzc2lvblJlc29sdmVyIWApO1xuXHR9XG5cblx0c3RhdGljIGdldCBkZWZhdWx0RXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRVhFQ1VURVI7XG5cdH1cblxuXHQvKiogQHR5cGUge3N0cmluZ3xudWxsfSAqL1xuXHQjbmFtZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge2Z1bmN0aW9ufG51bGx9ICovXG5cdCNleGVjdXRlciA9IG51bGw7XG5cdC8qKiBAdHlwZSB7UHJveHl8bnVsbH0gKi9cblx0I2NvbnRleHQgPSBudWxsO1xuXHQvKiogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfSAqL1xuXHQjY29udGV4dEhhbmRsZSA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRXhwcmVzc2lvblJlc29sdmVyLlxuXHQgKiBAZGF0ZSAzLzEwLzIwMjQgLSA3OjI3OjU3IFBNXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge3sgY29udGV4dD86IGFueTsgcGFyZW50PzogYW55OyBuYW1lPzogYW55OyBleGVjdXRlcj86IChzdHJpbmd8RXhlY3V0ZXIpOyB9fSBvcHRpb25zXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5jb250ZXh0XSB3aGVyZSBub25lIGlzIHBhc3NlZCwgdGhlIHJlc29sdmVyIGhhcyBubyBjb250ZXh0IG9mIGl0cyBvd24gLSA0LjJcblx0ICogQHBhcmFtIHtFeHByZXNzaW9uUmVzb2x2ZXJ9IFtvcHRpb25zLnBhcmVudD1udWxsXVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtvcHRpb25zLm5hbWU9bnVsbF0gd2hlcmUgbm9uZSBpcyBwYXNzZWQsIG9uZSBpcyBnZW5lcmF0ZWQgLSA1LjFcblx0ICogQHBhcmFtIHsoc3RyaW5nfEV4ZWN1dGVyKX0gW29wdGlvbnMuZXhlY3V0ZXJdIHRoZSByZWdpc3RlcmVkIG5hbWUgb2YgYW4gZXhlY3V0ZXIsIG9yIGFuXG5cdCAqIGBFeGVjdXRlcmAgaW5zdGFuY2UuIEEgbmFtZSB0aGF0IGlzIG5vdCByZWdpc3RlcmVkIHRocm93czsgYW4gaW5zdGFuY2UgbmVlZHMgbm8gcmVnaXN0cmF0aW9uLFxuXHQgKiBiZWNhdXNlIGl0IGFkZHJlc3NlcyB0aGUgZXhlY3V0ZXIgZGlyZWN0bHkuIFdpdGhvdXQgdGhlIG9wdGlvbiB0aGUgcmVzb2x2ZXIgdXNlc1xuXHQgKiBgRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlcmAgLSA0LjIuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih7IGNvbnRleHQsIHBhcmVudCA9IG51bGwsIG5hbWUgPSBudWxsLCBleGVjdXRlciB9ID0ge30pIHtcblx0XHRpZihleGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSB0aGlzLiNleGVjdXRlciA9ICBleGVjdXRlcjtcblx0XHRlbHNlIGlmICh0eXBlb2YgZXhlY3V0ZXIgPT09IFwic3RyaW5nXCIpIHRoaXMuI2V4ZWN1dGVyID0gZ2V0RXhlY3V0ZXJUeXBlKGV4ZWN1dGVyKTtcblx0XHRlbHNlIGlmKHBhcmVudCAhPSBudWxsKSB0aGlzLiNleGVjdXRlciA9IHBhcmVudC5leGVjdXRlcjtcblx0XHRlbHNlIHRoaXMuI2V4ZWN1dGVyID0gRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlcjtcblx0XHRcblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQgaW5zdGFuY2VvZiBFeHByZXNzaW9uUmVzb2x2ZXIgPyBwYXJlbnQgOiBudWxsO1xuXHRcdHRoaXMuI25hbWUgPSBuYW1lIHx8IGdlbmVyYXRlTmFtZSgpO1x0XHRcblx0XHR0aGlzLiNjb250ZXh0SGFuZGxlID0gbmV3IFJlc29sdmVyQ29udGV4dEhhbmRsZShjb250ZXh0ICwgdGhpcy4jcGFyZW50ID8gdGhpcy4jcGFyZW50LmNvbnRleHRIYW5kbGUgOiBudWxsKTtcblx0XHR0aGlzLiNjb250ZXh0ID0gdGhpcy4jY29udGV4dEhhbmRsZS5wcm94eTtcblx0fVxuXG5cdGdldCBuYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLiNuYW1lO1xuXHR9XG5cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0Z2V0IGNvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHQ7XG5cdH1cblxuXHRnZXQgZXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGVyO1xuXHR9XG5cblx0Z2V0IGNvbnRleHRIYW5kbGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHRIYW5kbGU7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGNoYWluIHBhdGhcblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHRnZXQgY2hhaW4oKSB7XG5cdFx0Ly8gYSBsb29wLCBub3QgYSByZWN1cnNpb24gaW50byB0aGUgcGFyZW50OiBhIGRlZXAgY2hhaW4gb3ZlcmZsb3dlZCB0aGUgc3RhY2tcblx0XHRsZXQgcGF0aCA9IFwiXCI7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdHBhdGggPSBgLyR7cmVzb2x2ZXIubmFtZX0ke3BhdGh9YDtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIGdldCBlZmZlY3RpdmUgY2hhaW4gcGF0aFxuXHQgKlxuXHQgKiBPbmx5IHRoZSByZXNvbHZlcnMgdGhhdCBwcm92aWRlIGEgY29udGV4dCBhcHBlYXIsIHNvIHRoaXMgZGVzY3JpYmVzIGEgc3RhdGUgYW5kIG5vdCB0aGVcblx0ICogc3RydWN0dXJlIC0gU1BFQ0lGSUNBVElPTi5tZCA1LjUuIFdoZXJlIG5vbmUgcHJvdmlkZXMgb25lLCB0aGUgYW5zd2VyIGlzIHRoZSBlbXB0eSBzdHJpbmcuXG5cdCAqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKi9cblx0Z2V0IGVmZmVjdGl2ZUNoYWluKCkge1xuXHRcdC8vIGEgbG9vcCwgbm90IGEgcmVjdXJzaW9uIGludG8gdGhlIHBhcmVudDogYSBkZWVwIGNoYWluIG92ZXJmbG93ZWQgdGhlIHN0YWNrXG5cdFx0bGV0IHBhdGggPSBcIlwiO1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5wcm92aWRlc0RhdGEpIHBhdGggPSBgLyR7cmVzb2x2ZXIubmFtZX0ke3BhdGh9YDtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIGdldCBjb250ZXh0IGNoYWluXG5cdCAqXG5cdCAqIFRoZSBjb250ZXh0cyBvZiBleGFjdGx5IHRoZSByZXNvbHZlcnMgdGhhdCBwcm92aWRlIG9uZSwgdGhpcyByZXNvbHZlcidzIGZpcnN0IGFuZCB0aGUgcm9vdCdzXG5cdCAqIGxhc3QgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEByZXR1cm5zIHtDb250ZXh0W119XG5cdCAqL1xuXHRnZXQgY29udGV4dENoYWluKCkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5wcm92aWRlc0RhdGEpIHJlc3VsdC5wdXNoKHJlc29sdmVyLmNvbnRleHQpO1xuXG5cdFx0XHRyZXNvbHZlciA9IHJlc29sdmVyLnBhcmVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSByZXNvbHZlciBhIGNhbGwgYWRkcmVzc2VzOiB0aGUgb25lIHRoZSBmaWx0ZXIgbmFtZXMsIG9yIHRoZSByZXNvbHZlciB0aGUgY2FsbCB3YXMgbWFkZSBvblxuXHQgKiB3aGVyZSBubyBmaWx0ZXIgaXMgZ2l2ZW4uXG5cdCAqXG5cdCAqIEEgZmlsdGVyIHNlbGVjdHMgZXhhY3RseSBvbmUgcmVzb2x2ZXIgYnkgdGhlIHJ1bGUgb2YgNS4zLCBhbmQgYSBmaWx0ZXIgbWF0Y2hpbmcgbm9uZSB0aHJvd3MgLVxuXHQgKiBhIHdyb25nIG5hbWUgaW4gYW4gQVBJIGNhbGwgaXMgYSBtaXN0YWtlIGluIHRoZSBjYWxsaW5nIGNvZGUsIHVubGlrZSBhIHNjb3BlIHByZWZpeCBpbnNpZGUgYW5cblx0ICogZXhwcmVzc2lvbiwgd2hpY2ggYW5zd2VycyB1bmRlZmluZWQgKDUuNCkuIFNlZSBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cblx0ICpcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcn1cblx0ICovXG5cdCNmaW5kUmVzb2x2ZXIoZmlsdGVyKSB7XG5cdFx0aWYgKCFmaWx0ZXIpIHJldHVybiB0aGlzO1xuXG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5uYW1lID09PSBmaWx0ZXIpIHJldHVybiByZXNvbHZlcjtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBFcnJvcihgRmlsdGVyIFwiJHtmaWx0ZXJ9XCIgbWF0Y2hlcyBubyByZXNvbHZlciBvZiB0aGUgY2hhaW4hYCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5lYXJlc3QgcmVzb2x2ZXIgZnJvbSBoZXJlIHRvIHRoZSByb290IHRoYXQgY2FycmllcyB0aGUga2V5IGl0c2VsZiwgb3IgbnVsbCB3aGVyZSBub25lXG5cdCAqIGNhcnJpZXMgaXQuIFdoYXQgZGVjaWRlcyBpcyB3aGV0aGVyIGEgcmVzb2x2ZXIgcHJvdmlkZXMgdGhlIG5hbWUsIG5vdCB3aGF0IGl0IGhvbGRzIC1cblx0ICogU1BFQ0lGSUNBVElPTi5tZCA1LjIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcnxudWxsfVxuXHQgKi9cblx0I3Jlc29sdmVyRm9yS2V5KGtleSkge1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5oYXNEYXRhKGtleSkpIHJldHVybiByZXNvbHZlcjtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIGdldCBkYXRhIGZyb20gY29udGV4dFxuXHQgKlxuXHQgKiBSZWFkcyBhbG9uZyB0aGUgY2hhaW4gZnJvbSB0aGUgYWRkcmVzc2VkIHJlc29sdmVyIGJ5IHRoZSBydWxlIG9mIDUuMi4gV2l0aG91dCBhIGtleSBpdCBhbnN3ZXJzIHRoZVxuXHQgKiB3aG9sZSBjb250ZXh0IG9mIHRoYXQgcmVzb2x2ZXIgLSB0aGUgcHJveHksIHNvIGV2ZXJ5IGFjY2VzcyBvbiBpdCBzdGlsbCBzZWVzIHRoZSBjaGFpbi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGdldERhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcihmaWx0ZXIpO1xuXHRcdGlmICgha2V5KSByZXR1cm4gcmVzb2x2ZXIuY29udGV4dDtcblxuXHRcdHJldHVybiByZXNvbHZlci5jb250ZXh0W2tleV07XG5cdH1cblxuXHQvKipcblx0ICogdXBkYXRlIGRhdGEgYXQgY29udGV4dFxuXHQgKlxuXHQgKiBXaXRob3V0IGEgZmlsdGVyIHRoZSB2YWx1ZSBpcyBjaGFuZ2VkIHdoZXJlIHRoZSBrZXkgbGl2ZXMsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LFxuXHQgKiBhbmQgY3JlYXRlZCBoZXJlIHdoZXJlIG5vIHJlc29sdmVyIGNhcnJpZXMgaXQuIFdpdGggYSBmaWx0ZXIgdGhlIGFkZHJlc3NlZCByZXNvbHZlciBpcyB0aGVcblx0ICogdGFyZ2V0IG91dHJpZ2h0IC0gU1BFQ0lGSUNBVElPTi5tZCA2LjYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxuXHQgKi9cblx0dXBkYXRlRGF0YShrZXksIHZhbHVlLCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcihmaWx0ZXIpO1xuXHRcdGlmICgha2V5KSByZXR1cm47XG5cblx0XHRjb25zdCB0YXJnZXQgPSBmaWx0ZXIgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KGtleSkgfHwgdGhpcztcblx0XHR0YXJnZXQuY29udGV4dFtrZXldID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogZGVsZXRlIGRhdGEgZnJvbSBjb250ZXh0XG5cdCAqXG5cdCAqIFJlbW92ZXMgdGhlIGtleSBmcm9tIG9uZSByZXNvbHZlciAtIHRoZSBhZGRyZXNzZWQgb25lIHdpdGggYSBmaWx0ZXIsIGFuZCB3aXRob3V0IG9uZSB0aGUgZmlyc3Rcblx0ICogcmVzb2x2ZXIgY2FycnlpbmcgaXQsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LiBSZW1vdmluZyBpdCB1bmNvdmVycyB0aGUgdmFsdWUgb2Zcblx0ICogdGhlIG5leHQgcmVzb2x2ZXIgdGhhdCBjYXJyaWVzIHRoZSBzYW1lIGtleSAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gZmlsdGVyXG5cdCAqL1xuXHRkZWxldGVEYXRhKGtleSwgZmlsdGVyKSB7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoZmlsdGVyKTtcblx0XHRpZiAoIWtleSkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gZmlsdGVyID8gcmVzb2x2ZXIgOiB0aGlzLiNyZXNvbHZlckZvcktleShrZXkpO1xuXHRcdGlmICh0YXJnZXQpIGRlbGV0ZSB0YXJnZXQuY29udGV4dFtrZXldO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lcmdlIGNvbnRleHQgb2JqZWN0XG5cdCAqXG5cdCAqIEEgc2hhbGxvdyBhc3NpZ25tZW50IGludG8gdGhlIGNvbnRleHQgb2YgdGhlIGFkZHJlc3NlZCByZXNvbHZlciwgcmVwbGFjaW5nIHdoYXQgaXMgdGhlcmUgYW5kIGFkZGluZ1xuXHQgKiB3aGF0IGlzIG5vdC4gTm8gc2VhcmNoIGFsb25nIHRoZSBjaGFpbjogYSBtZXJnZWQga2V5IHNoYWRvd3MgdGhlIHJlc29sdmVycyBhYm92ZSBmcm9tIGhlcmUgb24gLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICovXG5cdG1lcmdlQ29udGV4dChjb250ZXh0LCBmaWx0ZXIpIHtcblx0XHR0aGlzLiNmaW5kUmVzb2x2ZXIoZmlsdGVyKS5jb250ZXh0SGFuZGxlLm1lcmdlRGF0YShjb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXNvbHZlZCBhbiBleHByZXNzaW9uIHN0cmluZyB0byBkYXRhXG5cdCAqXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHJldHVybnMge1Byb21pc2U8Kj59XG5cdCAqL1xuXHRhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhRGVmYXVsdCkge1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIDQuMzogdGhlIGRlbGltaXRlZCBmb3JtIG9yIGEgYmFyZSBzdGF0ZW1lbnQsIHRvbGQgYXBhcnQgYnkgdGhlIHNjYW5uZXJcblx0XHRcdGNvbnN0IHsgc2NvcGUsIHN0YXRlbWVudCB9ID0gcGFyc2VFeHByZXNzaW9uKGFFeHByZXNzaW9uKTtcblx0XHRcdHJldHVybiBhd2FpdCByZXNvbHZlKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBzdGF0ZW1lbnQsIHNjb3BlLCBkZWZhdWx0VmFsdWUpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIDc6IHRoZSBlcnJvciBpcyBsb2dnZWQgYW5kIGhhbmRlZCBvbi4gcmVzb2x2ZSBhbnN3ZXJzIGEgdmFsdWUgb3Igc2F5cyB3aHkgaXQgY2Fubm90LFxuXHRcdFx0Ly8gYW5kIGEgZGVmYXVsdCB2YWx1ZSBjb3ZlcnMgYSBtaXNzaW5nIHJlc3VsdCwgbmV2ZXIgYW4gZXJyb3IuXG5cdFx0XHR3YXJuRmFpbGVkU3RhdGVtZW50KGFFeHByZXNzaW9uLCBlKTtcblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIHJlcGxhY2UgYWxsIGV4cHJlc3Npb25zIGF0IGEgc3RyaW5nXHQgKlxuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG5cdCAqIEBwYXJhbSB7Pyp9IGFEZWZhdWx0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0YXN5bmMgcmVzb2x2ZVRleHQoYVRleHQsIGFEZWZhdWx0KSB7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSByZXR1cm4gYVRleHQ7XG5cblx0XHRjb25zdCBvY2N1cnJlbmNlcyA9IHNjYW4oYVRleHQpO1xuXHRcdGlmICghb2NjdXJyZW5jZXMpIHJldHVybiBhVGV4dDtcblxuXHRcdGxldCB0ZXh0ID0gXCJcIjtcblx0XHRsZXQgcG9zaXRpb24gPSAwO1xuXHRcdGZvciAoY29uc3Qgb2NjdXJyZW5jZSBvZiBvY2N1cnJlbmNlcykge1xuXHRcdFx0Ly8gMy4yOiBhbiBlc2NhcGluZyBiYWNrc2xhc2ggaXMgY29uc3VtZWQsIGV2ZXJ5dGhpbmcgZWxzZSBpbiBmcm9udCBvZiB0aGUgZXhwcmVzc2lvblxuXHRcdFx0Ly8gc3RhbmRzIGFzIHdyaXR0ZW5cblx0XHRcdHRleHQgKz0gYVRleHQuc3Vic3RyaW5nKHBvc2l0aW9uLCBvY2N1cnJlbmNlLmVzY2FwZWQgPyBvY2N1cnJlbmNlLnN0YXJ0IC0gMSA6IG9jY3VycmVuY2Uuc3RhcnQpO1xuXHRcdFx0cG9zaXRpb24gPSBvY2N1cnJlbmNlLmVuZDtcblxuXHRcdFx0aWYgKG9jY3VycmVuY2UuZXNjYXBlZCkge1xuXHRcdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhvY2N1cnJlbmNlLnN0YXJ0LCBvY2N1cnJlbmNlLmVuZCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHRleHQgKz0gYXdhaXQgcmVzb2x2ZSh0aGlzLiNleGVjdXRlciwgdGhpcywgb2NjdXJyZW5jZS5zdGF0ZW1lbnQsIG9jY3VycmVuY2Uuc2NvcGUsIGRlZmF1bHRWYWx1ZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHQvLyA3OiBhbiBleHByZXNzaW9uIHdob3NlIHN0YXRlbWVudCBmYWlsZWQgc3RhbmRzIGFzIHdyaXR0ZW4sIGFuZCB0aGUgZGVmYXVsdCB2YWx1ZVxuXHRcdFx0XHRcdC8vIGRvZXMgbm90IGNvdmVyIGl0LiBUaGUgcmVzdCBvZiB0aGUgdGV4dCBrZWVwcyByZW5kZXJpbmcuXG5cdFx0XHRcdFx0d2FybkZhaWxlZFN0YXRlbWVudChvY2N1cnJlbmNlLnN0YXRlbWVudCwgZSk7XG5cdFx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHQgKyBhVGV4dC5zdWJzdHJpbmcocG9zaXRpb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlc29sdmUgYW4gZXhwcmVzc2lvbiBzdHJpbmcgdG8gZGF0YVxuXHQgKlxuXHQgKiBUYWtlcyB0aGUgYXJndW1lbnRzIHBvc2l0aW9uYWxseSwgb3Igb25lIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cdCAqIGB7IGV4cHJlc3Npb24sIGNvbnRleHQsIGRlZmF1bHRWYWx1ZSwgdGltZW91dCB9YCwgYmVoaW5kIHdoaWNoIGV2ZXJ5IGFyZ3VtZW50IGlzIGlnbm9yZWQgLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDQuMS4gQSBmaXJzdCBhcmd1bWVudCB0aGF0IGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIG9iamVjdCwgYW5kIGFcblx0ICogY29uZmlndXJhdGlvbiB3aXRob3V0IGEgc3RyaW5nIHVuZGVyIGBleHByZXNzaW9uYCwgcmVqZWN0IHdpdGggYSBgVHlwZUVycm9yYC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd8eyBleHByZXNzaW9uOiBzdHJpbmcsIGNvbnRleHQ/OiBvYmplY3QsIGRlZmF1bHRWYWx1ZT86ICosIHRpbWVvdXQ/OiBudW1iZXIgfX0gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IGFUaW1lb3V0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFDb250ZXh0LCBhRGVmYXVsdCwgYVRpbWVvdXQpIHtcblx0XHRpZiAoaXNDb25maWd1cmF0aW9uKGFyZ3VtZW50c1swXSkpIHtcblx0XHRcdGNvbnN0IHsgZXhwcmVzc2lvbiwgY29udGV4dCwgdGltZW91dCB9ID0gYXJndW1lbnRzWzBdO1xuXHRcdFx0aWYgKHR5cGVvZiBleHByZXNzaW9uICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmUgdGFrZXMgYSBjb25maWd1cmF0aW9uIGNhcnJ5aW5nIHRoZSBleHByZXNzaW9uIGFzIGEgc3RyaW5nIHVuZGVyIHRoZSBrZXkgZXhwcmVzc2lvbiFcIik7XG5cdFx0XHRyZXR1cm4gRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmUoZXhwcmVzc2lvbiwgY29udGV4dCwgZGVmYXVsdE9mKGFyZ3VtZW50c1swXSksIHRpbWVvdXQpO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIGFFeHByZXNzaW9uICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmUgdGFrZXMgYSBzdHJpbmcgb3IgYSBjb25maWd1cmF0aW9uIG9iamVjdCFcIik7XG5cblx0XHRjb25zdCByZXNvbHZlciA9IG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0OiBhQ29udGV4dCB9KTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0aWYgKHR5cGVvZiBhVGltZW91dCA9PT0gXCJudW1iZXJcIiAmJiBhVGltZW91dCA+IDApXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNvbHZlci5yZXNvbHZlKGFFeHByZXNzaW9uLCBkZWZhdWx0VmFsdWUpKTtcblx0XHRcdFx0fSwgYVRpbWVvdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXBsYWNlIGV4cHJlc3Npb24gYXQgdGV4dFxuXHQgKlxuXHQgKiBUYWtlcyB0aGUgYXJndW1lbnRzIHBvc2l0aW9uYWxseSwgb3Igb25lIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG5cdCAqIGB7IHRleHQsIGNvbnRleHQsIGRlZmF1bHRWYWx1ZSwgdGltZW91dCB9YCwgYmVoaW5kIHdoaWNoIGV2ZXJ5IGFyZ3VtZW50IGlzIGlnbm9yZWQgLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDQuMS4gQSBmaXJzdCBhcmd1bWVudCB0aGF0IGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIG9iamVjdCwgYW5kIGFcblx0ICogY29uZmlndXJhdGlvbiB3aXRob3V0IGEgc3RyaW5nIHVuZGVyIGB0ZXh0YCwgcmVqZWN0IHdpdGggYSBgVHlwZUVycm9yYC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd8eyB0ZXh0OiBzdHJpbmcsIGNvbnRleHQ/OiBvYmplY3QsIGRlZmF1bHRWYWx1ZT86ICosIHRpbWVvdXQ/OiBudW1iZXIgfX0gYVRleHRcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IGFUaW1lb3V0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmVUZXh0KGFUZXh0LCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XHRcdFxuXHRcdGlmIChpc0NvbmZpZ3VyYXRpb24oYXJndW1lbnRzWzBdKSkge1xuXHRcdFx0Y29uc3QgeyB0ZXh0LCBjb250ZXh0LCB0aW1lb3V0IH0gPSBhcmd1bWVudHNbMF07XG5cdFx0XHRpZiAodHlwZW9mIHRleHQgIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZVRleHQgdGFrZXMgYSBjb25maWd1cmF0aW9uIGNhcnJ5aW5nIHRoZSB0ZXh0IGFzIGEgc3RyaW5nIHVuZGVyIHRoZSBrZXkgdGV4dCFcIik7XG5cdFx0XHRyZXR1cm4gRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmVUZXh0KHRleHQsIGNvbnRleHQsIGRlZmF1bHRPZihhcmd1bWVudHNbMF0pLCB0aW1lb3V0KTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBhVGV4dCAhPT0gXCJzdHJpbmdcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkV4cHJlc3Npb25SZXNvbHZlci5yZXNvbHZlVGV4dCB0YWtlcyBhIHN0cmluZyBvciBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IVwiKTtcblxuXHRcdGNvbnN0IHJlc29sdmVyID0gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQ6IGFDb250ZXh0IH0pO1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHRpZiAodHlwZW9mIGFUaW1lb3V0ID09PSBcIm51bWJlclwiICYmIGFUaW1lb3V0ID4gMClcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRyZXNvbHZlKHJlc29sdmVyLnJlc29sdmVUZXh0KGFUZXh0LCBkZWZhdWx0VmFsdWUpKTtcblx0XHRcdFx0fSwgYVRpbWVvdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZVRleHQoYVRleHQsIGRlZmF1bHRWYWx1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogYnVpbGQgYSByZXNvbHZlciBvdmVyIGEgZmlsdGVyZWQgY29weSBvZiB0aGUgY29udGV4dFxuXHQgKlxuXHQgKiBUaGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gdGhlIGNvbnRleHQgb25seSwgbmV2ZXIgdG8gdGhlIGdsb2JhbHMsIHNvIHRoaXMgaXMgYSB3YXkgdG8gaGFuZFxuXHQgKiBvdmVyIGEgY2xlYW5lZCBjb250ZXh0IGFuZCBub3QgYSBzYW5kYm94LlxuXHQgKlxuXHQgKiBgb3B0aW9uYCBjYXJyaWVzIHRoZSBmaWx0ZXIncyBvd24gYGRlZXBgIHRvZ2V0aGVyIHdpdGggdGhlIGNvbnN0cnVjdG9yIG9wdGlvbnMgYG5hbWVgLFxuXHQgKiBgcGFyZW50YCBhbmQgYGV4ZWN1dGVyYCwgd2hpY2ggYXJlIGhhbmRlZCBvbiBhcyB0aGV5IGFyZS5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0ge29iamVjdH0gYXJnIHRoZSBmaWx0ZXIgYXJndW1lbnRzLCBwbHVzIHRoZSB3aG9sZSBjb25zdHJ1Y3RvciBvcHRpb24gc2V0XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhcmcuY29udGV4dFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBhcmcucHJvcEZpbHRlclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW2FyZy5vcHRpb249eyBkZWVwOiB0cnVlLCBuYW1lOiBudWxsLCBwYXJlbnQ6IG51bGwsIGV4ZWN1dGVyOiBudWxsIH1dXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FyZy5vcHRpb24uZGVlcD10cnVlXVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2FyZy5vcHRpb24ubmFtZT1udWxsXVxuXHQgKiBAcGFyYW0ge0V4cHJlc3Npb25SZXNvbHZlcn0gW2FyZy5vcHRpb24ucGFyZW50PW51bGxdXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbYXJnLm9wdGlvbi5leGVjdXRlcj1udWxsXVxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfVxuXHQgKi9cblx0c3RhdGljIGJ1aWxkU2VjdXJlKHsgY29udGV4dCwgcHJvcEZpbHRlciwgb3B0aW9uID0geyBkZWVwOiB0cnVlLCBuYW1lOiBudWxsLCBwYXJlbnQ6IG51bGwsIGV4ZWN1dGVyOiBudWxsIH0gfSkge1xuXHRcdGNvbnN0IHsgZGVlcCA9IHRydWUsIG5hbWUsIHBhcmVudCwgZXhlY3V0ZXIgfSA9IG9wdGlvbjtcblx0XHRjb250ZXh0ID0gT2JqZWN0VXRpbHMuZmlsdGVyKGNvbnRleHQsIHByb3BGaWx0ZXIsIHtkZWVwfSk7XG5cdFx0cmV0dXJuIG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0LCBuYW1lLCBwYXJlbnQsIGV4ZWN1dGVyIH0pO1xuXHR9XG59XG5cbiIsIi8qKlxuICogRmluZHMgdGhlIGV4cHJlc3Npb25zIG9mIGEgdGV4dCBhbmQgdGFrZXMgYSBzaW5nbGUgZXhwcmVzc2lvbiBhcGFydCAtIFNQRUNJRklDQVRJT04ubWQgMy4xIHRvXG4gKiAzLjMgYW5kIDQuMy4gSXQgcmVhZHMgd2hlcmUgYW4gZXhwcmVzc2lvbiBiZWdpbnMgYW5kIGVuZHMsIHdoZXRoZXIgaXQgaXMgZXNjYXBlZCwgYW5kIHdoaWNoIHNjb3BlXG4gKiBwcmVmaXggaXQgY2FycmllczsgZXZhbHVhdGluZyBhIHN0YXRlbWVudCBhbmQgYWRkcmVzc2luZyBhIHNjb3BlIGlzIEV4cHJlc3Npb25SZXNvbHZlcidzLlxuICpcbiAqIEludGVybmFsIHRvIHRoZSBwYWNrYWdlOiBpbmRleC5qcyBkb2VzIG5vdCBleHBvcnQgaXQuXG4gKi9cblxuY29uc3QgRVhQUkVTU0lPTl9TVEFSVCA9IFwiJHtcIjtcblxuLy8gdGhlIHNjYW5uZXIgc3RhdGVzIC0gZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBjb2RlIGhpZGVzIHRoZSBicmFjZXMgaW5zaWRlIGl0LCBzZWVcbi8vIFNQRUNJRklDQVRJT04ubWQgMy4xXG5jb25zdCBDT0RFID0gMDtcbmNvbnN0IFNJTkdMRV9RVU9URUQgPSAxO1xuY29uc3QgRE9VQkxFX1FVT1RFRCA9IDI7XG5jb25zdCBURU1QTEFURSA9IDM7XG5jb25zdCBSRUdFWCA9IDQ7XG5jb25zdCBSRUdFWF9DTEFTUyA9IDU7XG5cbi8vIGEgXCIvXCIgY29udGludWVzIGFuIGV4cHJlc3Npb24gaW5zdGVhZCBvZiBvcGVuaW5nIGEgcmVndWxhciBleHByZXNzaW9uIHdoZW4gaXQgZm9sbG93cyBvbmUgb2Zcbi8vIHRoZXNlIC0gdGhlIGNsYXNzaWMgZGl2aXNpb24tb3ItcmVnZXggcXVlc3Rpb24sIGRlY2lkZWQgb24gdGhlIGxhc3QgY2hhcmFjdGVyIHRoYXQgaXMgbm90XG4vLyB3aGl0ZXNwYWNlXG5jb25zdCBCRUZPUkVfRElWSVNJT04gPSAvW2EtekEtWjAtOV8kKVxcXV0vO1xuY29uc3QgV0hJVEVTUEFDRSA9IC9cXHMvO1xuXG4vLyB0aGUgY2hhcmFjdGVycyB0aGUgc2Nhbm5lciBkZWNpZGVzIG9uLCBjb21wYXJlZCBhcyBjaGFyIGNvZGVzIHJhdGhlciB0aGFuIGFzIG9uZS1jaGFyYWN0ZXIgc3RyaW5nc1xuY29uc3QgQkFDS1NMQVNIID0gMHg1YztcbmNvbnN0IERPTExBUiA9IDB4MjQ7XG5jb25zdCBPUEVOX0JSQUNFID0gMHg3YjtcbmNvbnN0IENMT1NFX0JSQUNFID0gMHg3ZDtcbmNvbnN0IFNJTkdMRV9RVU9URSA9IDB4Mjc7XG5jb25zdCBET1VCTEVfUVVPVEUgPSAweDIyO1xuY29uc3QgQkFDS1RJQ0sgPSAweDYwO1xuY29uc3QgU0xBU0ggPSAweDJmO1xuY29uc3QgT1BFTl9CUkFDS0VUID0gMHg1YjtcbmNvbnN0IENMT1NFX0JSQUNLRVQgPSAweDVkO1xuY29uc3QgQ09MT04gPSAweDNhO1xuXG5jb25zdCBTQ09QRV9TRVBBUkFUT1IgPSBcIjo6XCI7XG5cbi8qKlxuICogV2hldGhlciBhIGNoYXJhY3RlciBtYXkgc3RhbmQgaW4gYSBzY29wZSBuYW1lIC0gU1BFQ0lGSUNBVElPTi5tZCAzLjM6IGFuIEFTQ0lJIGxldHRlciwgYSBkaWdpdCxcbiAqIFwiLVwiLCBcIl9cIiwgb3Igd2hpdGVzcGFjZSBpbiB0aGUgc2Vuc2Ugb2YgYFxcc2AsIHdoaWNoIHBhc3QgQVNDSUkgaXMgbGVmdCB0byB0aGUgcmVndWxhciBleHByZXNzaW9uLlxuICovXG5jb25zdCBpc05hbWVDaGFyYWN0ZXIgPSAoYUNvZGUpID0+IHtcblx0aWYgKGFDb2RlIDwgMHg4MClcblx0XHRyZXR1cm4gKFxuXHRcdFx0KGFDb2RlID49IDB4NjEgJiYgYUNvZGUgPD0gMHg3YSkgfHxcblx0XHRcdChhQ29kZSA+PSAweDQxICYmIGFDb2RlIDw9IDB4NWEpIHx8XG5cdFx0XHQoYUNvZGUgPj0gMHgzMCAmJiBhQ29kZSA8PSAweDM5KSB8fFxuXHRcdFx0YUNvZGUgPT09IDB4MmQgfHxcblx0XHRcdGFDb2RlID09PSAweDVmIHx8XG5cdFx0XHRhQ29kZSA9PT0gMHgyMCB8fFxuXHRcdFx0KGFDb2RlID49IDB4MDkgJiYgYUNvZGUgPD0gMHgwZClcblx0XHQpO1xuXG5cdHJldHVybiBXSElURVNQQUNFLnRlc3QoU3RyaW5nLmZyb21DaGFyQ29kZShhQ29kZSkpO1xufTtcblxuLyoqXG4gKiBUcmltcyBhIHN0YXRlbWVudCwgYW5kIGFuc3dlcnMgbnVsbCBmb3Igb25lIHRoYXQgaXMgZW1wdHkuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMgez9zdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBub3JtYWxpemUgPSAodmFsdWUpID0+IHtcblx0aWYgKHZhbHVlKSB7XG5cdFx0dmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PSAwID8gbnVsbCA6IHZhbHVlO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuY29uc3Qgc3RhcnRzUmVnZXggPSAoYVRleHQsIGFJbmRleCkgPT4ge1xuXHRsZXQgaW5kZXggPSBhSW5kZXggLSAxO1xuXHR3aGlsZSAoaW5kZXggPj0gMCAmJiBXSElURVNQQUNFLnRlc3QoYVRleHRbaW5kZXhdKSkgaW5kZXgtLTtcblxuXHRyZXR1cm4gaW5kZXggPCAwIHx8ICFCRUZPUkVfRElWSVNJT04udGVzdChhVGV4dFtpbmRleF0pO1xufTtcblxuLypcbiAqIFR3byBzcGxpdHMgdGFrZSB0aGUgdGV4dCBiZXR3ZWVuIHRoZSBkZWxpbWl0ZXJzIGFwYXJ0IGludG8gdGhlIHNjb3BlIHByZWZpeCBvZiAzLjMgYW5kIHRoZVxuICogc3RhdGVtZW50IC0gdGhpcyBvbmUgZm9yIGEgdGV4dCwgYHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRCeVNlcGFyYXRvcmAgYmVoaW5kIGBwYXJzZUV4cHJlc3Npb25gIGZvclxuICogdGhlIHNpbmdsZSBleHByZXNzaW9uIG9mIGByZXNvbHZlYC4gVGhleSBhcmUgdHdvIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgb25lIHJ1bGUsIGVhY2ggbWVhc3VyZWRcbiAqIGZhc3RlciBmb3Igb3RoZXIgc3RhdGVtZW50cyAoREVDSVNJT05TLm1kLCAyMDI2LTA5LTI3KTogYSB0ZXh0IHJlYWRzIGZvcndhcmRzLCB0aGUgc2luZ2xlXG4gKiBleHByZXNzaW9uIGZyb20gdGhlIGZpcnN0IFwiOjpcIiBiYWNrd2FyZHMuIHRlc3QvZXhwcmVzc2lvbnNjYW5uZXIvc2NvcGUtcHJlZml4LlRlc3QuanMgYXNrcyBldmVyeVxuICogY2FzZSBvZiBib3RoLlxuICovXG5cbi8qKlxuICogVGhlIHNwbGl0IG9mIGEgdGV4dDogcmVhZHMgZm9yd2FyZHMgb25seSBhcyBmYXIgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhIG5hbWUgY2Fubm90IGNhcnJ5LCB3aGljaFxuICogZm9yIG1vc3Qgc3RhdGVtZW50cyBpcyBhIGZldyBjaGFyYWN0ZXJzLlxuICovXG5jb25zdCBzcGxpdFNjb3BlQW5kU3RhdGVtZW50ID0gKGFDb250ZW50KSA9PiB7XG5cdGNvbnN0IGxlbmd0aCA9IGFDb250ZW50Lmxlbmd0aDtcblx0bGV0IGluZGV4ID0gMDtcblx0d2hpbGUgKGluZGV4IDwgbGVuZ3RoICYmIGlzTmFtZUNoYXJhY3RlcihhQ29udGVudC5jaGFyQ29kZUF0KGluZGV4KSkpIGluZGV4Kys7XG5cblx0aWYgKGluZGV4ID09PSAwIHx8IGFDb250ZW50LmNoYXJDb2RlQXQoaW5kZXgpICE9PSBDT0xPTiB8fCBhQ29udGVudC5jaGFyQ29kZUF0KGluZGV4ICsgMSkgIT09IENPTE9OKVxuXHRcdHJldHVybiB7IHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG5vcm1hbGl6ZShhQ29udGVudCkgfTtcblxuXHRyZXR1cm4geyBzY29wZTogbm9ybWFsaXplKGFDb250ZW50LnN1YnN0cmluZygwLCBpbmRleCkpLCBzdGF0ZW1lbnQ6IG5vcm1hbGl6ZShhQ29udGVudC5zdWJzdHJpbmcoaW5kZXggKyAyKSkgfTtcbn07XG5cbmNvbnN0IGNvdW50QmFja3NsYXNoZXMgPSAoYVRleHQsIGFJbmRleCkgPT4ge1xuXHRsZXQgY291bnQgPSAwO1xuXHR3aGlsZSAoYUluZGV4IC0gY291bnQgPiAwICYmIGFUZXh0LmNoYXJDb2RlQXQoYUluZGV4IC0gY291bnQgLSAxKSA9PT0gQkFDS1NMQVNIKSBjb3VudCsrO1xuXG5cdHJldHVybiBjb3VudDtcbn07XG5cbi8qKlxuICogUmVhZHMgdGhlIG9uZSBleHByZXNzaW9uIHdob3NlIFwiJHtcIiBzdGFuZHMgYXQgYVN0YXJ0LCBjb3VudGluZyBicmFjZXMgYnV0IG5vdCB0aGUgb25lcyBoaWRkZW5cbiAqIGluc2lkZSBhIGxpdGVyYWwsIGFuZCB0YWtlcyBpdCBhcGFydCBpbnRvIHNjb3BlIHByZWZpeCBhbmQgc3RhdGVtZW50LlxuICpcbiAqIEFuc3dlcnMgdGhlIG9jY3VycmVuY2UgYHNjYW5gIGhhbmRzIG9uLCBgZW5kYCB0aGUgaW5kZXggZGlyZWN0bHkgYWZ0ZXIgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2U7XG4gKiBudWxsIHdoZXJlIHRoZSB0ZXh0IGVuZHMgYmVmb3JlIHRoYXQgYnJhY2UsIHdoaWNoIHBlciBTUEVDSUZJQ0FUSU9OLm1kIDMuMSBtZWFucyB0aGVyZSBpcyBub1xuICogZXhwcmVzc2lvbiBoZXJlIGF0IGFsbDsgYW5kLCB3aXRoIGBlbmRgIG5lZ2F0ZWQsIHRoZSBpbmRleCBvZiBhbm90aGVyIFwiJHtcIiBtZXQgb3V0c2lkZSBhIGxpdGVyYWwsXG4gKiB3aGljaCBzdGFydHMgYW4gZXhwcmVzc2lvbiBvZiBpdHMgb3duIGFuZCBhYmFuZG9ucyB0aGlzIG9uZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBhU3RhcnRcbiAqIEByZXR1cm5zIHs/eyBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgZXNjYXBlZDogYm9vbGVhbiwgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9fVxuICovXG5jb25zdCByZWFkRXhwcmVzc2lvbiA9IChhVGV4dCwgYVN0YXJ0KSA9PiB7XG5cdGNvbnN0IGxlbmd0aCA9IGFUZXh0Lmxlbmd0aDtcblx0Y29uc3Qgc3RhY2sgPSBbQ09ERV07XG5cdGxldCBpbmRleCA9IGFTdGFydCArIDI7XG5cblx0d2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG5cdFx0Y29uc3QgY2hhciA9IGFUZXh0LmNoYXJDb2RlQXQoaW5kZXgpO1xuXHRcdHN3aXRjaCAoc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0pIHtcblx0XHRcdGNhc2UgQ09ERTpcblx0XHRcdFx0aWYgKGNoYXIgPT09IE9QRU5fQlJBQ0UpIHN0YWNrLnB1c2goQ09ERSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IENMT1NFX0JSQUNFKSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0aWYgKHN0YWNrLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgeyBzY29wZSwgc3RhdGVtZW50IH0gPSBzcGxpdFNjb3BlQW5kU3RhdGVtZW50KGFUZXh0LnN1YnN0cmluZyhhU3RhcnQgKyAyLCBpbmRleCkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHsgc3RhcnQ6IGFTdGFydCwgZW5kOiBpbmRleCArIDEsIGVzY2FwZWQ6IGZhbHNlLCBzY29wZTogc2NvcGUsIHN0YXRlbWVudDogc3RhdGVtZW50IH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGNoYXIgPT09IFNJTkdMRV9RVU9URSkgc3RhY2sucHVzaChTSU5HTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gRE9VQkxFX1FVT1RFKSBzdGFjay5wdXNoKERPVUJMRV9RVU9URUQpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBCQUNLVElDSykgc3RhY2sucHVzaChURU1QTEFURSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IERPTExBUiAmJiBhVGV4dC5jaGFyQ29kZUF0KGluZGV4ICsgMSkgPT09IE9QRU5fQlJBQ0UpIHJldHVybiB7IHN0YXJ0OiBhU3RhcnQsIGVuZDogLWluZGV4LCBlc2NhcGVkOiBmYWxzZSwgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbnVsbCB9O1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBTTEFTSCAmJiBzdGFydHNSZWdleChhVGV4dCwgaW5kZXgpKSBzdGFjay5wdXNoKFJFR0VYKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFNJTkdMRV9RVU9URUQ6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFNJTkdMRV9RVU9URSkgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBET1VCTEVfUVVPVEVEOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBET1VCTEVfUVVPVEUpIHN0YWNrLnBvcCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVEVNUExBVEU6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IEJBQ0tUSUNLKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gRE9MTEFSICYmIGFUZXh0LmNoYXJDb2RlQXQoaW5kZXggKyAxKSA9PT0gT1BFTl9CUkFDRSkge1xuXHRcdFx0XHRcdHN0YWNrLnB1c2goQ09ERSk7XG5cdFx0XHRcdFx0aW5kZXgrKztcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgUkVHRVg6XG5cdFx0XHRcdGlmIChjaGFyID09PSBCQUNLU0xBU0gpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IE9QRU5fQlJBQ0tFVCkgc3RhY2sucHVzaChSRUdFWF9DTEFTUyk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFNMQVNIKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFJFR0VYX0NMQVNTOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gQkFDS1NMQVNIKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBDTE9TRV9CUkFDS0VUKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGluZGV4Kys7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogQW5zd2VycyBldmVyeSBleHByZXNzaW9uIG9mIGEgdGV4dCwgaW4gdGhlIG9yZGVyIHRoZXkgc3RhbmQsIG9yIG51bGwgd2hlcmUgdGhlIHRleHQgY2Fycmllc1xuICogbm9uZS4gYHN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIFwiJFwiLCBgZW5kYCB0aGUgaW5kZXggYWZ0ZXIgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2UsIHNvIGFcbiAqIGNhbGxlciByZXBsYWNlcyBieSBwb3NpdGlvbiBhbmQgbmV2ZXIgdG91Y2hlcyBhbiBvY2N1cnJlbmNlIHR3aWNlLiBUaGUgdGV4dCBiZXR3ZWVuIHR3b1xuICogZXhwcmVzc2lvbnMgaXMgc2tpcHBlZCBieSBhIG5hdGl2ZSBzZWFyY2ggZm9yIHRoZSBuZXh0IFwiJHtcIi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcbiAqIEByZXR1cm5zIHs/QXJyYXk8eyBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgZXNjYXBlZDogYm9vbGVhbiwgc2NvcGU6ID9zdHJpbmcsIHN0YXRlbWVudDogP3N0cmluZyB9Pn1cbiAqL1xuZXhwb3J0IGNvbnN0IHNjYW4gPSAoYVRleHQpID0+IHtcblx0bGV0IG9jY3VycmVuY2VzID0gbnVsbDtcblx0bGV0IHN0YXJ0ID0gYVRleHQuaW5kZXhPZihFWFBSRVNTSU9OX1NUQVJUKTtcblxuXHR3aGlsZSAoc3RhcnQgPj0gMCkge1xuXHRcdC8vIDMuMjogYW4gb2RkIHJ1biBvZiBiYWNrc2xhc2hlcyBlc2NhcGVzIHRoZSBkZWxpbWl0ZXIgaXRzZWxmLiBJdCBvcGVucyBub3RoaW5nLCBzbyBvbmx5XG5cdFx0Ly8gdGhvc2UgdHdvIGNoYXJhY3RlcnMgYXJlIHRha2VuIG91dCBvZiB0aGUgdGV4dCBhbmQgdGhlIHNjYW4gY2FycmllcyBvbiBiZWhpbmQgdGhlbSAtXG5cdFx0Ly8gd2hhdCB3b3VsZCBoYXZlIGJlZW4gdGhlIHN0YXRlbWVudCBpcyBvcmRpbmFyeSB0ZXh0IGFuZCBtYXkgaG9sZCBleHByZXNzaW9ucyBvZiBpdHMgb3duLlxuXHRcdGlmIChjb3VudEJhY2tzbGFzaGVzKGFUZXh0LCBzdGFydCkgJSAyID09PSAxKSB7XG5cdFx0XHRpZiAoIW9jY3VycmVuY2VzKSBvY2N1cnJlbmNlcyA9IFtdO1xuXHRcdFx0b2NjdXJyZW5jZXMucHVzaCh7IHN0YXJ0OiBzdGFydCwgZW5kOiBzdGFydCArIDIsIGVzY2FwZWQ6IHRydWUsIHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG51bGwgfSk7XG5cdFx0XHRzdGFydCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCwgc3RhcnQgKyAyKTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9jY3VycmVuY2UgPSByZWFkRXhwcmVzc2lvbihhVGV4dCwgc3RhcnQpO1xuXHRcdC8vIG5vIG1hdGNoaW5nIGJyYWNlOiB0aGUgdGV4dCBzdGFuZHMgYXMgd3JpdHRlbiwgYW5kIG5vdGhpbmcgYmVoaW5kIGl0IGNhbiBiZSBhblxuXHRcdC8vIGV4cHJlc3Npb24gZWl0aGVyIC0gYSBcIiR7XCIgb3V0c2lkZSBhIGxpdGVyYWwgd291bGQgaGF2ZSByZXN0YXJ0ZWQgdGhlIHNjYW4gaW5zdGVhZFxuXHRcdGlmICghb2NjdXJyZW5jZSkgYnJlYWs7XG5cdFx0aWYgKG9jY3VycmVuY2UuZW5kIDwgMCkge1xuXHRcdFx0c3RhcnQgPSAtb2NjdXJyZW5jZS5lbmQ7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoIW9jY3VycmVuY2VzKSBvY2N1cnJlbmNlcyA9IFtdO1xuXHRcdG9jY3VycmVuY2VzLnB1c2gob2NjdXJyZW5jZSk7XG5cdFx0c3RhcnQgPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQsIG9jY3VycmVuY2UuZW5kKTtcblx0fVxuXG5cdHJldHVybiBvY2N1cnJlbmNlcztcbn07XG5cbi8qKlxuICogVGFrZXMgdGhlIG9uZSBleHByZXNzaW9uIGByZXNvbHZlYCBpcyBoYW5kZWQgYXBhcnQgLSBTUEVDSUZJQ0FUSU9OLm1kIDQuMy5cbiAqXG4gKiBXaGljaCBmb3JtIGlzIGluIGhhbmQgaXMgZGVjaWRlZCBieSB0aGUgZmlyc3QgY2hhcmFjdGVycyBvZiB0aGUgdHJpbW1lZCBpbnB1dC4gVGhlIHdob2xlIGlucHV0XG4gKiBpcyBvbmUgZXhwcmVzc2lvbiwgc28gaXRzIGVuZCBpcyB0aGUgZW5kIG9mIHRoZSBpbnB1dC4gVGhlIGVzY2FwaW5nIG9mIDMuMiBkb2VzIG5vdCBhcHBseSBoZXJlIC1cbiAqIGl0IGlzIGEgcnVsZSBvZiB0aGUgdGV4dCBmb3JtLCBhbmQgdGhlcmUgaXMgbm8gc3Vycm91bmRpbmcgdGV4dCwgc28gYSBiYWNrc2xhc2ggYmVsb25ncyB0byB0aGVcbiAqIHN0YXRlbWVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cbiAqIEByZXR1cm5zIHt7IHNjb3BlOiA/c3RyaW5nLCBzdGF0ZW1lbnQ6ID9zdHJpbmcgfX1cbiAqIEB0aHJvd3Mge1N5bnRheEVycm9yfSB3aGVyZSB0aGUgaW5wdXQgb3BlbnMgd2l0aCBcIiR7XCIgYW5kIGRvZXMgbm90IGVuZCB3aXRoIFwifVwiXG4gKi9cbmV4cG9ydCBjb25zdCBwYXJzZUV4cHJlc3Npb24gPSAoYUV4cHJlc3Npb24pID0+IHtcblx0YUV4cHJlc3Npb24gPSBhRXhwcmVzc2lvbi50cmltKCk7XG5cblx0aWYgKGFFeHByZXNzaW9uLnN0YXJ0c1dpdGgoRVhQUkVTU0lPTl9TVEFSVCkpIHtcblx0XHRpZiAoIWFFeHByZXNzaW9uLmVuZHNXaXRoKFwifVwiKSkgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBFeHByZXNzaW9uIGRvZXMgbm90IGVuZCB3aXRoIFwifVwiOiAke2FFeHByZXNzaW9ufWApO1xuXG5cdFx0cmV0dXJuIHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnRCeVNlcGFyYXRvcihhRXhwcmVzc2lvbi5zdWJzdHJpbmcoMiwgYUV4cHJlc3Npb24ubGVuZ3RoIC0gMSkpO1xuXHR9XG5cblx0Ly8gYW55dGhpbmcgZWxzZSBpcyBhIHN0YXRlbWVudCBpbiBmdWxsLCBhbmQgY2FycmllcyBubyBzY29wZSBwcmVmaXhcblx0cmV0dXJuIHsgc2NvcGU6IG51bGwsIHN0YXRlbWVudDogbm9ybWFsaXplKGFFeHByZXNzaW9uKSB9O1xufTtcblxuLyoqXG4gKiBUaGUgc3BsaXQgb2YgdGhlIHNpbmdsZSBleHByZXNzaW9uOiBtb3N0IHN0YXRlbWVudHMgY2Fycnkgbm8gXCI6OlwiIGF0IGFsbCBhbmQgYXJlIGRvbmUgYWZ0ZXIgb25lXG4gKiBuYXRpdmUgc2VhcmNoLiBXaGVyZSBvbmUgc3RhbmRzLCBldmVyeXRoaW5nIGJlZm9yZSB0aGUgZmlyc3Qgb2YgdGhlbSBoYXMgdG8gYmUgYSBuYW1lLCBjaGVja2VkXG4gKiBiYWNrd2FyZHMgZnJvbSBpdDogYSBcIjo6XCIgaW5zaWRlIGEgc3RhdGVtZW50IC0gYSBxdW90ZWQgb25lIC0gdXN1YWxseSBoYXMgYSBjaGFyYWN0ZXIgbm8gbmFtZVxuICogY2FycmllcyByaWdodCBpbiBmcm9udCBvZiBpdC5cbiAqL1xuY29uc3Qgc3BsaXRTY29wZUFuZFN0YXRlbWVudEJ5U2VwYXJhdG9yID0gKGFDb250ZW50KSA9PiB7XG5cdGNvbnN0IGVuZCA9IGFDb250ZW50LmluZGV4T2YoU0NPUEVfU0VQQVJBVE9SKTtcblx0aWYgKGVuZCA8IDEpIHJldHVybiB7IHNjb3BlOiBudWxsLCBzdGF0ZW1lbnQ6IG5vcm1hbGl6ZShhQ29udGVudCkgfTtcblxuXHRmb3IgKGxldCBpbmRleCA9IGVuZCAtIDE7IGluZGV4ID49IDA7IGluZGV4LS0pXG5cdFx0aWYgKCFpc05hbWVDaGFyYWN0ZXIoYUNvbnRlbnQuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBub3JtYWxpemUoYUNvbnRlbnQpIH07XG5cblx0cmV0dXJuIHsgc2NvcGU6IG5vcm1hbGl6ZShhQ29udGVudC5zdWJzdHJpbmcoMCwgZW5kKSksIHN0YXRlbWVudDogbm9ybWFsaXplKGFDb250ZW50LnN1YnN0cmluZyhlbmQgKyAyKSkgfTtcbn07XG4iLCJpbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcbmltcG9ydCB7IGlzTnVsbE9yVW5kZWZpbmVkIH0gZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5cbi8qKlxuICogVGhlIGRlc2NyaXB0b3IgYSBwcm9wZXJ0eSBoYXMgd2hlcmUgaXQgaXMgZGVmaW5lZCAtIG93biBvciBhbnl3aGVyZSB1cCB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gKiB0aGUgb2JqZWN0IGhvbGRpbmcgaXQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfHN5bWJvbH0gcHJvcGVydHlcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eURlc2NyaXB0b3J8bnVsbH1cbiAqL1xuY29uc3QgZmluZFByb3BlcnR5RGVzY3JpcHRvciA9IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRsZXQgdHlwZSA9IGRhdGE7XG5cdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodHlwZSwgcHJvcGVydHkpO1xuXHRcdGlmIChkZXNjcmlwdG9yKSByZXR1cm4gZGVzY3JpcHRvcjtcblx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBQcm9wZXJ0eSBjYWNoZSBmb3IgYSBjb250ZXh0IHRoYXQgaXMgdGhlIGdsb2JhbCBvYmplY3QgaXRzZWxmLlxuICpcbiAqIEl0IGFuc3dlcnMgbGlrZSB0aGUgTWFwIGl0IHJlcGxhY2VzOiBldmVyeSBuYW1lIGlzIHByZXNlbnQsIGFuZCB0aGUgdmFsdWUgaXMgdGhlIGhhbmRsZVxuICogaG9sZGluZyBpdCAtIG5ldmVyIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuIFRoYXQgaXMgdGhlIGNvbnRyYWN0IG9mICNnZXRQcm9wZXJ0eURlZixcbiAqIHdob3NlIGNhbGxlciByZWFkcyB0aGUgcHJvcGVydHkgb2ZmIHRoZSBoYW5kbGUgaXQgZ2V0cyBiYWNrLlxuICpcbiAqIEJlY2F1c2UgZXZlcnkgbmFtZSBpcyBwcmVzZW50LCBzdWNoIGEgcmVzb2x2ZXIgYW5zd2VycyBldmVyeSBsb29rdXAgYW5kIG5vdGhpbmcgYmVsb3cgaXQgaXNcbiAqIHJlYWNoZWQsIGFuZCBvd25LZXlzIHJlcG9ydHMgZXZlcnkgb3duIGtleSBvZiB0aGUgZ2xvYmFsIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1Jlc29sdmVyQ29udGV4dEhhbmRsZX0gaGFuZGxlXG4gKi9cbmNvbnN0IGNyZWF0ZUdsb2JhbENhY2hlV3JhcHBlciA9IChoYW5kbGUpID0+IHtcblx0cmV0dXJuIHtcblx0XHRoYXM6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSxcblx0XHRnZXQ6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGhhbmRsZTtcblx0XHR9LFxuXHRcdHNldDogKHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0ZGVsZXRlOiAocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdGtleXM6ICgpID0+IHtcblx0XHRcdC8vIE5vIG5hbWUgb2YgaXRzIG93bi4gYGhhc2AgYWxyZWFkeSBhbnN3ZXJzIGV2ZXJ5IGxvb2t1cCwgc28gYSBuYW1lIG9mIHRoZSBnbG9iYWwgb2JqZWN0XG5cdFx0XHQvLyBpcyBmb3VuZCBmcm9tIGFueXdoZXJlIGJlbG93OyBsaXN0aW5nIGl0IGFzIHdlbGwgd291bGQgb25seSBoYW5kIGl0IHRvIGFuIGV4ZWN1dGVyIHRoYXRcblx0XHRcdC8vIHR1cm5zIGEgbmFtZSBpbnRvIGNvZGUsIHdoaWNoIHRoZW4gZmFpbHMgb3ZlciBuYW1lcyBpdCBuZXZlciBuZWVkZWQgLSB0aGUgaW5kZXggXCIwXCIgb2Zcblx0XHRcdC8vIGEgZnJhbWUsIGEgc3ltYm9sIGFub3RoZXIgbGlicmFyeSBwbGFudGVkLiBBIHN0YXRlbWVudCByZWFjaGVzIGEgZ2xvYmFsIHRocm91Z2ggdGhlXG5cdFx0XHQvLyBvcmRpbmFyeSBzY29wZSBjaGFpbiBhbnl3YXkgKFNQRUNJRklDQVRJT04ubWQgNi40LCA5LjgpLlxuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH0sXG5cdH07XG59O1xuXG4vKipcbiAqIENvbnRleHQgb2JqZWN0IHRvIGhhbmRsZSBkYXRhIGFjY2Vzc1xuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBSZXNvbHZlckNvbnRleHRIYW5kbGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzb2x2ZXJDb250ZXh0SGFuZGxlIHtcblx0LyoqIEB0eXBlIHtQcm94eXxudWxsfSAqL1xuXHQjcHJveHkgPSBudWxsO1xuXHQvKiogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfSAqL1xuXHQjcGFyZW50ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtvYmplY3R8bnVsbH0gKi9cblx0I2RhdGEgPSBudWxsO1xuXHQvKiogQHR5cGUge01hcDxzdHJpbmd8c3ltYm9sLFJlc29sdmVyQ29udGV4dEhhbmRsZT58bnVsbH0gKi9cblx0I2NhY2hlID0gbnVsbDtcblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHQjcHJvdmlkZXNEYXRhID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgQ29udGV4dC5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHdoZXJlIG5vbmUgaXMgcGFzc2VkLCB0aGUgaGFuZGxlIGhvbGRzIG5vIG9iamVjdCBhdCBhbGwgYW5kIGNhcnJpZXMgbm9cblx0ICogbmFtZSwgbm90IGV2ZW4gb25lIG9mIE9iamVjdC5wcm90b3R5cGUgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuMy4gSXQgZ2V0cyBhbiBvYmplY3Qgb24gdGhlIGZpcnN0XG5cdCAqIHdyaXRlLlxuXHQgKiBAcGFyYW0ge1Jlc29sdmVyQ29udGV4dEhhbmRsZX0gcGFyZW50XG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihjb250ZXh0LCBwYXJlbnQpIHtcblx0XHR0aGlzLiNkYXRhID0gaXNOdWxsT3JVbmRlZmluZWQoY29udGV4dCkgPyBudWxsIDogY29udGV4dCB8fCB7fTtcblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQgOiBudWxsO1xuXHRcdHRoaXMuI3Byb3ZpZGVzRGF0YSA9ICFpc051bGxPclVuZGVmaW5lZChjb250ZXh0KTtcblxuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblxuXHRcdGlmIChHTE9CQUwgPT09IHRoaXMuI2RhdGEpXG5cdFx0XHR0aGlzLiNwcm94eSA9IHRoaXMuI2RhdGE7XG5cdFx0ZWxzZSB7XG5cdFx0XHQvLyBUaGUgcHJveHkgYW5zd2VycyBmb3IgdGhlIHdob2xlIGNoYWluLCB3aGljaCBpcyBtb3JlIHRoYW4gdGhlIG9iamVjdCBoYW5kZWQgdG8gdGhpc1xuXHRcdFx0Ly8gbGluayBob2xkcy4gQSBwcm94eSBtYXkgbm90IHNwZWFrIHRoYXQgZnJlZWx5IGZvciBhIHRhcmdldCB0aGF0IGd1YXJhbnRlZXMgYW55dGhpbmdcblx0XHRcdC8vIGFib3V0IGl0cyBvd24ga2V5cyAtIGEgZnJvemVuIG9yIHNlYWxlZCBjb250ZXh0IGlzIHdoZXJlIHRoYXQgZW5kcyBpbiBhIFR5cGVFcnJvciAtXG5cdFx0XHQvLyBzbyBpdCBnZXRzIGFuIGVtcHR5IHRhcmdldCBvZiBpdHMgb3duLiBObyB0cmFwIHJlYWRzIGl0OyBldmVyeSBvbmUgb2YgdGhlbSB3b3JrcyBvblxuXHRcdFx0Ly8gI2RhdGEgYW5kICNjYWNoZS5cblx0XHRcdHRoaXMuI3Byb3h5ID0gbmV3IFByb3h5KHt9LCB7XG5cdFx0XHRcdGhhczogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImhhcyBwcm9wZXJ0eTpcIiwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLiNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSkgIT0gbnVsbDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0OiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0IHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0Y29uc3QgcHJveHkgPSB0aGlzLiNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIHByb3h5ID8gcHJveHkuI2RhdGFbcHJvcGVydHldIDogdW5kZWZpbmVkO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQ6IChkYXRhLCBwcm9wZXJ0eSwgdmFsdWUpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwic2V0IHByb3BlcnR5OlwiLCBwcm9wZXJ0eSwgXCI9XCIsIHZhbHVlKTtcblx0XHRcdFx0XHR0aGlzLiNkYXRhID8/PSB7fTtcblx0XHRcdFx0XHR0aGlzLiNkYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHRoaXMuI2NhY2hlLnNldChwcm9wZXJ0eSwgdGhpcyk7XG5cdFx0XHRcdFx0dGhpcy4jcHJvdmlkZXNEYXRhID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZGVsZXRlUHJvcGVydHk6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5RGVmID0gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAocHJvcGVydHlEZWYpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLiNkYXRhW3Byb3BlcnR5XTtcblx0XHRcdFx0XHRcdHRoaXMuI2NhY2hlLmRlbGV0ZShwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHByb3h5ID0gdGhpcy4jZ2V0UHJvcGVydHlEZWYocHJvcGVydHkpO1xuXHRcdFx0XHRcdGlmICghcHJveHkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRcdFx0XHQvLyBSZWFkIHRocm91Z2ggYSBnZXR0ZXIgcmF0aGVyIHRoYW4gdXAgZnJvbnQsIHNvIGVudW1lcmF0aW5nIGEgY29udGV4dCBkb2VzIG5vdFxuXHRcdFx0XHRcdC8vIGV2YWx1YXRlIHdoYXQgbm9ib2R5IGFza2VkIGZvciwgYW5kIHNvIGEgdmFsdWUgc3RheXMgbGl2ZSAoNi4yKS4gRW51bWVyYWJpbGl0eVxuXHRcdFx0XHRcdC8vIGlzIHRha2VuIGZyb20gd2hlcmUgdGhlIHByb3BlcnR5IGlzIGRlZmluZWQgLSB0aGF0IGlzIHdoYXQga2VlcHMgdGhlIG1lbWJlcnNcblx0XHRcdFx0XHQvLyBvZiBPYmplY3QucHJvdG90eXBlIG91dCBvZiBPYmplY3Qua2V5cyAtIHdoaWxlIGNvbmZpZ3VyYWJsZSBoYXMgdG8gYmUgdHJ1ZTpcblx0XHRcdFx0XHQvLyBhIHByb3h5IG1heSBub3QgY2xhaW0gYSBmaXhlZCBwcm9wZXJ0eSBpdHMgdGFyZ2V0IGRvZXMgbm90IGhhdmUuXG5cdFx0XHRcdFx0Y29uc3QgZGVzY3JpcHRvciA9IGZpbmRQcm9wZXJ0eURlc2NyaXB0b3IocHJveHkuI2RhdGEsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Z2V0OiAoKSA9PiBwcm94eS4jZGF0YVtwcm9wZXJ0eV0sXG5cdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiBkZXNjcmlwdG9yID8gZGVzY3JpcHRvci5lbnVtZXJhYmxlIDogdHJ1ZSxcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG93bktleXM6IChkYXRhKSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIm93bktleXNcIik7XG5cdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IFNldCgpO1xuXHRcdFx0XHRcdGxldCBoYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHdoaWxlIChoYW5kbGUpIHtcblx0XHRcdFx0XHRcdGZvciAobGV0IGtleSBvZiBoYW5kbGUuI2NhY2hlLmtleXMoKSkge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQuYWRkKGtleSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRoYW5kbGUgPSBoYW5kbGUuI3BhcmVudDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIEFycmF5LmZyb20ocmVzdWx0KTtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHQvL0BUT0RPIG5lZWQgdG8gc3VwcG9ydCB0aGUgb3RoZXIgcHJveHkgYWN0aW9uc1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7UHJveHl9XG5cdCAqL1xuXHRnZXQgcHJveHkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI3Byb3h5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9XG5cdCAqL1xuXHRnZXQgcGFyZW50KCkge1xuXHRcdHJldHVybiB0aGlzLiNwYXJlbnQ7XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciB0aGlzIGhhbmRsZSBwcm92aWRlcyB0aGUgbmFtZSBpdHNlbGYuIEV2ZXJ5IG5hbWUgb2YgaXRzIG93biBjb250ZXh0IGNvdW50cywgdGhlIG9uZXNcblx0ICogaW5oZXJpdGVkIHRocm91Z2ggdGhlIHByb3RvdHlwZSBjaGFpbiBpbmNsdWRlZCAoNS4yKTsgYSBoYW5kbGUgb3ZlciB0aGUgZ2xvYmFsIG9iamVjdFxuXHQgKiBwcm92aWRlcyBldmVyeSBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzRGF0YShrZXkpIHtcblx0XHRyZXR1cm4gdGhpcy4jY2FjaGUuaGFzKGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciB0aGlzIGhhbmRsZSBwcm92aWRlcyBhIGNvbnRleHQ6IG9uZSB3YXMgaGFuZGVkIHRvIHRoZSBjb25zdHJ1Y3Rvciwgb3IgYSB2YWx1ZSBoYXMgYmVlblxuXHQgKiB3cml0dGVuIHNpbmNlLiBXaGF0IHRoZSBkYXRhIGhvbGRzIGRlY2lkZXMgbm90aGluZyAtIFNQRUNJRklDQVRJT04ubWQgNS41LlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge2Jvb2xlYW59XG5cdCAqL1xuXHRnZXQgcHJvdmlkZXNEYXRhKCkge1xuXHRcdHJldHVybiB0aGlzLiNwcm92aWRlc0RhdGE7XG5cdH1cblxuXHR1cGRhdGVEYXRhKGRhdGEpIHtcblx0XHR0aGlzLiNkYXRhID0gaXNOdWxsT3JVbmRlZmluZWQoZGF0YSkgPyBudWxsIDogZGF0YSB8fCB7fTtcblx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSAhaXNOdWxsT3JVbmRlZmluZWQoZGF0YSk7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xuXHR9XG5cblx0bWVyZ2VEYXRhKGRhdGEpIHtcblx0XHRpZiAodHlwZW9mIGRhdGEgIT09IFwib2JqZWN0XCIgfHwgZGF0YSA9PSBudWxsKSByZXR1cm47XG5cdFx0dGhpcy4jZGF0YSA/Pz0ge307XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLiNkYXRhLCBkYXRhKTtcblx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSB0cnVlO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblx0fVxuXG5cdHJlc2V0Q2FjaGUoKSB7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtNYXA8c3RyaW5nLFByb3BlcnR5RGVmaW5pdGlvbj59XG5cdCAqL1xuXHQjaW5pdFByb3BlcnR5Q2FjaGUoKSB7XG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuI2RhdGE7XG5cdFx0aWYgKEdMT0JBTCA9PT0gZGF0YSkgXG5cdFx0XHRyZXR1cm4gY3JlYXRlR2xvYmFsQ2FjaGVXcmFwcGVyKHRoaXMpO1xuXG5cdFx0Ly8gZXZlcnkga2V5IEphdmFTY3JpcHQgc2F5cyB0aGUgb2JqZWN0IGNhcnJpZXMsIG5vdGhpbmcgZmlsdGVyZWQgLSB3aGljaCBvZiB0aGVtIGFuIGV4ZWN1dGVyXG5cdFx0Ly8gY2FuIHB1dCBpbnRvIGl0cyBjb2RlIGlzIHRoZSBleGVjdXRlcidzIGJ1c2luZXNzIChERUNJU0lPTlMubWQgMjAyNi0wOC0zMCwgMjAyNi0wOS0yMilcblx0XHRjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblx0XHRsZXQgdHlwZSA9IGRhdGE7XG5cdFx0d2hpbGUgKCFpc051bGxPclVuZGVmaW5lZCh0eXBlKSkge1xuXHRcdFx0Zm9yIChsZXQgbmFtZSBvZiBSZWZsZWN0Lm93bktleXModHlwZSkpIGNhY2hlLnNldChuYW1lLCB0aGlzKTtcblx0XHRcdHR5cGUgPSBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHR5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHlcblx0ICogQHJldHVybnMge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxuXHQgKi9cblx0I2dldFByb3BlcnR5RGVmKHByb3BlcnR5KSB7XG5cdFx0aWYgKHRoaXMuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiB0aGlzLiNjYWNoZS5nZXQocHJvcGVydHkpO1xuXHRcdGxldCBwYXJlbnQgPSB0aGlzLiNwYXJlbnQ7XG5cdFx0d2hpbGUgKHBhcmVudCkge1xuXHRcdFx0aWYgKHBhcmVudC4jY2FjaGUuaGFzKHByb3BlcnR5KSkgcmV0dXJuIHBhcmVudC4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRcdHBhcmVudCA9IHBhcmVudC4jcGFyZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuIiwiaW1wb3J0IHsgcmVnaXN0cmF0ZSB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcbmltcG9ydCBHTE9CQUwgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qc1wiO1xuXG5sZXQgREVCVUcgPSBmYWxzZTtcbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcImNvbnRleHQtZGVjb25zdHJ1Y3Rpb24tZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgc2l6ZTogNTAwMCB9KTtcblxuLyoqXG4gKiBIb3cgbWFueSBuYW1lcyBhIGNvbnRleHQgbWF5IGNhcnJ5IGJlZm9yZSB0aGlzIGV4ZWN1dGVyIHNheXMgdGhhdCBiaW5kaW5nIHRoZW0gYWxsIGNvc3RzLiBFdmVyeVxuICogb3JkaW5hcnkgb2JqZWN0IGJyaW5ncyBzZXZlbiBvZiB0aGVtIGFsb25nIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLCBzbyB0aGUgbnVtYmVyIGNvdW50cyBhIGdvb2RcbiAqIG1hbnkgb3duIGtleXMgYmVmb3JlIGl0IGlzIHJlYWNoZWQuXG4gKi9cbmNvbnN0IEhJR0hfUFJPUEVSVFlfQ09VTlQgPSAyNTtcblxuLyoqXG4gKiBUaGUgbmFtZXMgdGhhdCBtYWRlIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZmFpbCB0byBjb21waWxlLCBhc2tlZCBvZiBKYXZhU2NyaXB0IGl0c2VsZiByYXRoZXJcbiAqIHRoYW4gb2YgYSBsaXN0IGtlcHQgaGVyZTogYSBuYW1lIGlzIHVzYWJsZSB3aGVuIGl0IGNhbiBzdGFuZCBpbiBhIGRlc3RydWN0dXJpbmcgcGF0dGVybi5cbiAqXG4gKiBPbmx5IGV2ZXIgY2FsbGVkIG9uIHRoZSBmYWlsdXJlIHBhdGgsIHNvIHRoZSBjb3N0IG9mIGNvbXBpbGluZyBvbmUgcGF0dGVybiBwZXIgbmFtZSBpcyBwYWlkIGJ5IGFcbiAqIGNvbnRleHQgdGhhdCBpcyBicm9rZW4gZm9yIHRoaXMgZXhlY3V0ZXIgYW55d2F5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfHN5bWJvbD59IHRoZU5hbWVzXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nPn1cbiAqL1xuY29uc3QgdW51c2FibGVOYW1lcyA9ICh0aGVOYW1lcykgPT5cblx0dGhlTmFtZXNcblx0XHQuZmlsdGVyKChuYW1lKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIHJldHVybiB0cnVlO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0bmV3IEZ1bmN0aW9uKGB7JHtuYW1lfX1gLCBcIlwiKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5tYXAoU3RyaW5nKTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtib29sZWFufSB2YWx1ZVxuICovXG5leHBvcnQgY29uc3Qgc2V0RGVidWcgPSAodmFsdWUpID0+IHtcblx0REVCVUcgPSB2YWx1ZTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuY29uc3QgZ2V0UHJvcGVydHlOYW1lcyA9IChhQ29udGV4dCkgPT4ge1xuXHRpZiAoR0xPQkFMID09PSBhQ29udGV4dCkgcmV0dXJuIFtdO1xuXHRyZXR1cm4gUmVmbGVjdC5vd25LZXlzKGFDb250ZXh0KTtcbn07XG5cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCwgY29udGV4dFByb3BlcnRpZXMpID0+IHtcblx0Ly8gQSBzeW1ib2wgaGFzIHRvIGJlIHdyaXR0ZW4gb3V0IHJhdGhlciB0aGFuIGpvaW5lZCAtIGBqb2luYCBhbG9uZSByYWlzZXMgYSBUeXBlRXJyb3IgdGhhdCBzYXlzXG5cdC8vIG5vdGhpbmcgYWJvdXQgdGhlIGNvbnRleHQgaXQgY2FtZSBmcm9tLiBXcml0dGVuIG91dCBpdCByZWFjaGVzIHRoZSBwYXR0ZXJuLCB3aGVyZSBpdCBmYWlscyB0b1xuXHQvLyBjb21waWxlIGxpa2UgYW55IG90aGVyIG5hbWUgdGhhdCBpcyBubyBpZGVudGlmaWVyLCBhbmQgZ2VuZXJhdGUoKSBuYW1lcyBpdC5cblx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGNvbnRleHRQcm9wZXJ0aWVzLm1hcChTdHJpbmcpLmpvaW4oXCIsXCIpO1xuXHRjb25zdCBjYWNoZUtleSA9IGAke2FTdGF0ZW1lbnQubGVuZ3RofTo6JHtwcm9wZXJ0eU5hbWVzfTo6JHthU3RhdGVtZW50fWA7XG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50LCBwcm9wZXJ0eU5hbWVzLCBjb250ZXh0UHJvcGVydGllcyk7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGNhY2hlS2V5LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG4vKipcbiAqIFRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gZGVzdHJ1Y3R1cmVzIHRoZSBjb250ZXh0IGluIGl0cyBwYXJhbWV0ZXIgbGlzdCBhbmQgcnVucyB0aGUgc3RhdGVtZW50IG92ZXJcbiAqIHRoZSBsb2NhbCBiaW5kaW5ncyB0aGF0IHByb2R1Y2VzLlxuICpcbiAqICoqTm90aGluZyBpcyBjYXJyaWVkIGJhY2suKiogQSBzdGF0ZW1lbnQgdGhhdCBhc3NpZ25zIHRvIGEgY29udGV4dCBuYW1lIHdyaXRlcyBpbnRvIGEgbG9jYWxcbiAqIGJpbmRpbmcsIGFuZCB0aGF0IGJpbmRpbmcgaXMgZ29uZSB3aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIC0gc28gYSB3cml0ZSBpcyBub3QgcmVhZGFibGVcbiAqIGFmdGVyd2FyZHMgKGBjb250ZXh0LXdyaXRlYCwgU1BFQ0lGSUNBVElPTi5tZCA5LjcpLiBUaGF0IGlzIGEgZGVjaXNpb24gcmF0aGVyIHRoYW4gYSBnYXA6IHRoZVxuICogd3JpdGUtYmFjayB0aGlzIGV4ZWN1dGVyIGNhcnJpZWQgYmV0d2VlbiAyMDI2LTA5LTA3IGFuZCAyMDI2LTA5LTIwIGNvc3QgYSBmYWN0b3Igb2YgZWxldmVuIG9uIGFcbiAqIGNhY2hlIG1pc3MsIGJlY2F1c2UgaXQgbmVlZHMgZXZlcnkgY29udGV4dCBuYW1lIGRlY2xhcmVkIGluIHRoZSBib2R5IGluc3RlYWQgb2YgbGlzdGVkIGluIHRoZVxuICogcGFyYW1ldGVyIGxpc3QuIFNwZWVkIGlzIHdoYXQgdGhpcyBleGVjdXRlciBpcyBmb3IsIGFuZCBhIGNvbnN1bWVyIHdobyBuZWVkcyBhIHdyaXRlIHRvIHBlcnNpc3RcbiAqIHBpY2tzIGBjb250ZXh0LW9iamVjdC1leGVjdXRlcmAuIFNlZSBgREVDSVNJT05TLm1kYCwgMjAyNi0wOS0yMC5cbiAqXG4gKiBXaGF0IHN0aWxsIHJlYWNoZXMgdGhlIGNvbnRleHQgaXMgYSAqKm11dGF0aW9uKio6IGBob2xkZXIubmFtZSA9IFwiYWZ0ZXJcImAgY2hhbmdlcyBhbiBvYmplY3QgdGhlXG4gKiBiaW5kaW5nIGFuZCB0aGUgY29udGV4dCBib3RoIHBvaW50IGF0LCBhbmQgbmVlZHMgbm90aGluZyBjYXJyaWVkIGJhY2suXG4gKlxuICogVGhlIGNvbnRleHQgaXMgZGVzdHJ1Y3R1cmVkIGluIHRoZSBwYXJhbWV0ZXIgbGlzdCByYXRoZXIgdGhhbiBkZWNsYXJlZCBpbiB0aGUgYm9keSBzbyB0aGF0IHRoZVxuICogZ2VuZXJhdGVkIHNvdXJjZSBzdGF5cyBvbmUgbGluZSBwZXIgc3RhdGVtZW50IGluc3RlYWQgb2Ygb25lIGxpbmUgcGVyIGNvbnRleHQgbmFtZSAtIGBuZXcgRnVuY3Rpb25gXG4gKiBwYXJzZXMgdGhhdCBzb3VyY2Ugb24gZXZlcnkgY2FjaGUgbWlzcywgYW5kIGl0cyBsZW5ndGggaXMgd2hhdCB0aGUgbWlzcyBjb3N0cy4gSXQgYWxzbyBkZWNsYXJlcyBub1xuICogbmFtZSBvZiBpdHMgb3duOiB0aGUgc3RhdGVtZW50IGNhbiB0aGVyZWZvcmUgbmV2ZXIgY29sbGlkZSB3aXRoIGEgYmluZGluZyBvZiB0aGlzIGZ1bmN0aW9uLCB3aGljaFxuICogaXMgd2hhdCB0aGUgcmFuZG9tIHN1ZmZpeCByZW1vdmVkIG9uIDIwMjYtMDktMjAgdXNlZCB0byBndWFyZC5cbiAqXG4gKiAqKk5vdGhpbmcgaXMgZmlsdGVyZWQgb3V0IG9mIHRoZSBwYXR0ZXJuLioqIEV2ZXJ5IG5hbWUgdGhlIGNvbnRleHQgY2FycmllcyBpcyBib3VuZCwgYSBuYW1lIHRoYXRcbiAqIGNhbm5vdCBiZSBhIHZhcmlhYmxlIGluY2x1ZGVkIC0gYSBrZXkgbGlrZSBgdGVzdC10ZXN0YCwgYSByZXNlcnZlZCB3b3JkLCBhIHN5bWJvbCwgdGhlIGluZGV4IG9mIGFuXG4gKiBhcnJheS4gU3VjaCBhIGNvbnRleHQgY2Fubm90IGJlIHJ1biBvdmVyIGJ5IHRoaXMgZXhlY3V0ZXIgYXQgYWxsLCBhbmQgZHJvcHBpbmcgdGhlIG5hbWUgc2lsZW50bHlcbiAqIHdvdWxkIGhpZGUgYSBwcm9wZXJ0eSB0aGUgY2FsbGVyIGRlZmluZWQuIFdoYXQgdGhpcyBleGVjdXRlciBvd2VzIHRoZSBjYWxsZXIgaW5zdGVhZCBpcyBhIG1lc3NhZ2VcbiAqIHRoYXQgc2F5cyB3aGljaCBzdGF0ZW1lbnQgZmFpbGVkIGFuZCB3aGljaCBuYW1lIGRpZCBpdCwgYmVjYXVzZSB0aGUgc3RhdGVtZW50IGl0c2VsZiBuZWVkIG5vdFxuICogbWVudGlvbiB0aGF0IG5hbWUgLSBzZWUgYERFQ0lTSU9OUy5tZGAsIDIwMjYtMDktMjIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aGVQcm9wZXJ0eU5hbWVTdHJpbmcgdGhlIGNvbnRleHQgbmFtZXMsIGNvbW1hIHNlcGFyYXRlZCwgYXMgdGhlIGRlc3RydWN0dXJpbmdcbiAqICAgICAgICAgICAgICAgICBwYXR0ZXJuIHNwZWxscyB0aGVtXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZ3xzeW1ib2w+fSB0aGVOYW1lcyB0aGUgc2FtZSBuYW1lcyB1bndyaXR0ZW4sIGZvciB0aGUgZXJyb3IgbWVzc2FnZVxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50LCB0aGVQcm9wZXJ0eU5hbWVTdHJpbmcsIHRoZU5hbWVzKSA9PiB7XG5cdC8vIE9ubHkgaGVyZSwgYW5kIHRoZXJlZm9yZSBvbmNlIHBlciBjb250ZXh0IHNoYXBlIGFuZCBzdGF0ZW1lbnQgcmF0aGVyIHRoYW4gb24gZXZlcnkgZXhlY3V0aW9uOlxuXHQvLyBhIGNvbnNvbGUgd3JpdGUgaW4gYSBicm93c2VyIGNvc3RzIG1vcmUgdGhhbiBhIHJlc29sdXRpb24gZG9lcywgYW5kIHdhcm5pbmcgcGVyIGV4ZWN1dGlvbiBjb3N0XG5cdC8vIHRoaXMgZXhlY3V0ZXIgYSBmYWN0b3Igb2YgZm91ciB0byB0d2VudHktZml2ZSAobWVhc3VyZWQgMjAyNi0wOS0yMiwgYG5wbSBydW4gYmVuY2hgKS5cblx0aWYgKHRoZU5hbWVzLmxlbmd0aCA+IEhJR0hfUFJPUEVSVFlfQ09VTlQpXG5cdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0YEhpZ2ggY291bnQgb2YgcHJvcGVydGllcyBhdCBmaXJzdCBsZXZlbCwgY2FuIGJlIGRlY3JlYXNlIHRoZSBwZXJmb3JtZW5jZSEgY291bnQ6ICR7dGhlTmFtZXMubGVuZ3RofWAsXG5cdFx0KTtcblxuXHRjb25zdCBjb2RlID0gYFxucmV0dXJuIChhc3luYyAoeyR7dGhlUHJvcGVydHlOYW1lU3RyaW5nfX0pID0+IHtcbiAgICB0cnl7XG4gICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoY29udGV4dCB8fCB7fSk7YDtcblxuXHRpZiAoREVCVUcpIGNvbnNvbGUubG9nKFwiZ2VuZXJlcmF0ZWQgY29kZTogXFxuXCIsIGNvZGUpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRjb25zdCB1bnVzYWJsZSA9IHVudXNhYmxlTmFtZXModGhlTmFtZXMpO1xuXHRcdC8vIG5vdGhpbmcgd3Jvbmcgd2l0aCB0aGUgbmFtZXM6IHRoZSBzdGF0ZW1lbnQgaXRzZWxmIGRvZXMgbm90IGNvbXBpbGUsIGFuZCB0aGF0IGVycm9yIHNheXNcblx0XHQvLyBtb3JlIHRoYW4gYW55dGhpbmcgdGhpcyBleGVjdXRlciBjb3VsZCBhZGRcblx0XHRpZiAodW51c2FibGUubGVuZ3RoID09PSAwKSB0aHJvdyBlO1xuXG5cdFx0dGhyb3cgbmV3IFN5bnRheEVycm9yKFxuXHRcdFx0YENvbnRleHQgcHJvcGVydHkgJHt1bnVzYWJsZS5sZW5ndGggPT09IDEgPyBcIm5hbWVcIiA6IFwibmFtZXNcIn0gXCIke3VudXNhYmxlLmpvaW4oJ1wiLCBcIicpfVwiIGNhbm5vdCBiZSB1c2VkIGFzIGEgdmFyaWFibGUgYnkgJHtFWEVDVVRFUk5BTUV9LCBzbyB0aGlzIHN0YXRlbWVudCBjYW5ub3QgcnVuIG92ZXIgdGhpcyBjb250ZXh0ISBzdGF0ZW1lbnQ6ICR7YVN0YXRlbWVudH1gLFxuXHRcdFx0eyBjYXVzZTogZSB9LFxuXHRcdCk7XG5cdH1cbn07XG5cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzID0gZ2V0UHJvcGVydHlOYW1lcyhhQ29udGV4dCk7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCwgcHJvcGVydHlOYW1lcyk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IHsgcmVnaXN0cmF0ZSB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcblxuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgc2l6ZTogNTAwMCB9KTtcblxuLyoqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuICovXG5leHBvcnQgY29uc3Qgc2V0dXBFeGVjdXRlciA9IChvcHRpb25zKSA9PiB7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50KSA9PiB7XG5cdGNvbnN0IGNvZGUgPSBgXG5yZXR1cm4gKGFzeW5jIChjdHgpID0+IHtcbiAgICB0cnl7XG4gICAgICAgIHJldHVybiAke2FTdGF0ZW1lbnR9XG4gICAgfWNhdGNoKGUpe1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn0pKGNvbnRleHQgfHwge30pO2A7XG5cblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZXRPckNyZWF0ZUZ1bmN0aW9uID0gKGFTdGF0ZW1lbnQpID0+IHtcblxuXHRjb25zdCBjYWNoZUtleSA9IGFTdGF0ZW1lbnQ7XG5cblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGNhY2hlS2V5KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChjYWNoZUtleSwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuY29uc3QgRVhFQ1VURVIgPSBuZXcgRXhlY3V0ZXIoe1xuXHRleGVjdXRpb246IChhU3RhdGVtZW50LCBhQ29udGV4dCkgPT4ge1xuXHRcdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQpO1xuXHRyZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dCk7XG5cdH0sXG59KTtcblxucmVnaXN0cmF0ZShFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCJpbXBvcnQge3JlZ2lzdHJhdGV9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcblxuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwid2l0aC1zY29wZWQtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgc2l6ZTogNTAwMCB9KTtcblxuLyoqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuICovXG5leHBvcnQgY29uc3Qgc2V0dXBFeGVjdXRlciA9IChvcHRpb25zKSA9PiB7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XG59O1xuXG5sZXQgaW5pdGlhbENhbGwgPSB0cnVlO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50KSA9PiB7XG5jb25zdCBjb2RlID0gYFxuXHRyZXR1cm4gKGFzeW5jIChjb250ZXh0KSA9PiB7XG5cdFx0d2l0aChjb250ZXh0KXtcblx0XHRcdHRyeXtcblx0XHRcdFx0cmV0dXJuICR7YVN0YXRlbWVudH1cblx0XHRcdH1jYXRjaChlKXtcblx0XHRcdFx0dGhyb3cgZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pKGNvbnRleHQgfHwge30pO1xuYDtcblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZXRPckNyZWF0ZUZ1bmN0aW9uID0gKGFTdGF0ZW1lbnQpID0+IHtcblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGFTdGF0ZW1lbnQpKSB7XG5cdFx0cmV0dXJuIEVYUFJFU1NJT05fQ0FDSEUuZ2V0KGFTdGF0ZW1lbnQpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoYVN0YXRlbWVudCwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuXG5cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtleGVjdXRpb246IChhU3RhdGVtZW50LCBhQ29udGV4dCkgPT4ge1xuXHRcdGlmKGluaXRpYWxDYWxsKXtcblx0XHRcdGluaXRpYWxDYWxsID0gZmFsc2U7XG5cdFx0XHRjb25zb2xlLndhcm4obmV3IEVycm9yKGBXaXRoIFNjb3BlZCBleHByZXNzaW9uIGV4ZWN1dGlvbiBpcyBtYXJrZWQgYXMgZGVwcmVjYXRlZC5gKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9fSk7XG5yZWdpc3RyYXRlKEVYRUNVVEVSTkFNRSwgRVhFQ1VURVIpO1xuXG5leHBvcnQgZGVmYXVsdCBFWEVDVVRFUjtcbiIsIi8vaW1wb3J0IFwiLi9Fc3ByaW1hRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBcIi4vV2l0aFNjb3BlZEV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgXCIuL0NvbnRleHRPYmplY3RFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFwiLi9Db250ZXh0RGVjb25zdHJ1Y3RvckV4ZWN1dGVyLmpzXCI7XG4iLCIvKipcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoaXMgcGFja2FnZS5cbiAqXG4gKiBHZW5lcmF0ZWQgZnJvbSBwYWNrYWdlLmpzb24gYnkgc2NyaXB0cy9nZW5lcmF0ZS12ZXJzaW9uLmpzIGJlZm9yZSBldmVyeSBidWlsZC4gRG8gbm90IGVkaXQgLVxuICogdGhlIG5leHQgYnVpbGQgb3ZlcndyaXRlcyBpdC5cbiAqXG4gKiBAbW9kdWxlIHZlcnNpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFZFUlNJT04gPSBcIjMuMC4wXCI7XG5cbmV4cG9ydCBkZWZhdWx0IFZFUlNJT047XG4iLCIvKipcbiAqIFRoZSBnbG9iYWwgc2NvcGUgb2YgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQuXG4gKlxuICogUmVzb2x2ZWQgb25jZSB3aGVuIHRoZSBtb2R1bGUgaXMgbG9hZGVkOiBnbG9iYWxUaGlzLCB0aGVuIGdsb2JhbCwgd2luZG93IGFuZCBzZWxmIGZvciBlbmdpbmVzIG5vdFxuICoga25vd2luZyBpdCB5ZXQuIEFuIGVtcHR5IG9iamVjdCB3aGVuIG5vbmUgb2YgdGhlbSBleGlzdHMsIHNvIHJlYWRpbmcgZnJvbSBpdCBuZXZlciB0aHJvd3MuXG4gKlxuICogQG1vZHVsZSBHbG9iYWxcbiAqXG4gKiBAZXhhbXBsZVxuICogR0xPQkFMLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnVmZmVyKTtcbiAqL1xuY29uc3QgR0xPQkFMID0gKCgpID0+IHtcblx0aWYodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBnbG9iYWxUaGlzO1xuXHRpZih0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gZ2xvYmFsO1xuXHRpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gd2luZG93O1xuXHRpZih0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHNlbGY7XG5cdHJldHVybiB7fTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IEdMT0JBTDtcbiIsIi8qKlxyXG4gKiBPbmx5IGFuIG9iamVjdCBjYW4gY2FycnkgYSBwcm9wZXJ0eSwgc28gYSBwYXRoIHN0b3BzIGF0IGEgcHJpbWl0aXZlIGluc3RlYWQgb2YgaGFuZGluZyBvdXQgYVxyXG4gKiBwcm9wZXJ0eSB0aGF0IGNhbm5vdCBiZSByZWFkIG9yIHdyaXR0ZW4uIEFuIEFycmF5LCBNYXAgb3IgRGF0ZSBwYXNzZXMgLSB0aGV5IGFyZSBvYmplY3RzIGFuZCB0YWtlXHJcbiAqIGEgcHJvcGVydHkgbGlrZSBhbnkgb3RoZXIgb25lLCB3aGljaCBpcyB3aGF0IG1ha2VzIGEgcGF0aCBsaWtlIFwibGlzdC4wXCIgd29yay5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZSB0aGUgdmFsdWUgYSBzdGVwIG9mIHRoZSBwYXRoIHJlc29sdmVkIHRvXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9mIHRoYXQgc3RlcFxyXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IHRoZSB3aG9sZSBwYXRoLCB0byB0ZWxsIHdoaWNoIG9uZSBvZiBzZXZlcmFsIHN0ZXBzIGZhaWxlZFxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVuIHRoZSBzdGVwIGNhcnJpZXMgbm8gb2JqZWN0XHJcbiAqL1xyXG5jb25zdCBhc3NlcnREZXNjZW5kYWJsZSA9ICh2YWx1ZSwgbmFtZSwga2V5KSA9PiB7XHJcblx0aWYodmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKVxyXG5cdFx0cmV0dXJuO1xyXG5cclxuXHRjb25zdCB0eXBlID0gdmFsdWUgPT09IG51bGwgPyBcIm51bGxcIiA6IGBhICR7dHlwZW9mIHZhbHVlfWA7XHJcblx0dGhyb3cgbmV3IFR5cGVFcnJvcihgY2Fubm90IGRlc2NlbmQgaW50byBcIiR7bmFtZX1cIiBvZiBwYXRoIFwiJHtrZXl9XCIgLSAke3R5cGV9IGlzIG5vIG9iamVjdGApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE9uZSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QsIGFkZHJlc3NlZCBieSBuYW1lLCB0b2dldGhlciB3aXRoIHRoZSBvYmplY3QgY2FycnlpbmcgaXQuXHJcbiAqXHJcbiAqIEJ1aWx0IHRocm91Z2gge0BsaW5rIE9iamVjdFByb3BlcnR5LmxvYWR9LCB3aGljaCB3YWxrcyBhIGRvdHRlZCBwYXRoIGFuZCBoYW5kcyBiYWNrIHRoZSBwcm9wZXJ0eSBhdFxyXG4gKiBpdHMgZW5kLlxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBwcm9wZXJ0eSA9IE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiB7YiA6IDF9fSwgXCJhLmJcIik7XHJcbiAqIHByb3BlcnR5LnZhbHVlOyAgICAgIC8vIDFcclxuICogcHJvcGVydHkudmFsdWUgPSAyOyAgLy8gd3JpdGVzIGludG8gdGhlIG9iamVjdFxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JqZWN0UHJvcGVydHkge1xyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB0aGUgb2JqZWN0IGNhcnJ5aW5nIGl0XHJcblx0ICovXHJcblx0Y29uc3RydWN0b3Ioa2V5LCBjb250ZXh0KXtcclxuXHRcdHRoaXMua2V5ID0ga2V5O1xyXG5cdFx0dGhpcy5jb250ZXh0ID0gY29udGV4dDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFdoZXRoZXIgdGhlIGtleSBpcyByZWFjaGFibGUgb24gdGhlIGNvbnRleHQgYXQgYWxsLlxyXG5cdCAqXHJcblx0ICogVGhpcyBhbnN3ZXJzIGZvciB0aGUgd2hvbGUgcHJvdG90eXBlIGNoYWluLCBub3Qgb25seSBmb3Igb3duIHByb3BlcnRpZXMgLSBsb2FkKHt9LCBcInRvU3RyaW5nXCIpXHJcblx0ICogcmVwb3J0cyB0cnVlLiBUaGF0IGlzIGRlbGliZXJhdGU6IGEgcGF0aCBtYXkgYWRkcmVzcyBhIHByb3RvdHlwZSBhbmQgZXh0ZW5kIGl0LCBzbyBhbiBpbmhlcml0ZWRcclxuXHQgKiBrZXkgaXMgYSBrZXkgbGlrZSBhbnkgb3RoZXIgaGVyZS4gVXNlIGhhc1ZhbHVlIHRvIGFzayB3aGV0aGVyIHNvbWV0aGluZyBpcyBhY3R1YWxseSBzdG9yZWQuXHJcblx0ICpcclxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHQgKi9cclxuXHRnZXQga2V5RGVmaW5lZCgpe1xyXG5cdFx0cmV0dXJuIHRoaXMua2V5IGluIHRoaXMuY29udGV4dDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogV2hldGhlciBzb21ldGhpbmcgaXMgc3RvcmVkIHVuZGVyIHRoZSBrZXkuIE9ubHkgdW5kZWZpbmVkIGNvdW50cyBhcyBub3RoaW5nIC0gMCwgXCJcIiwgZmFsc2UgYW5kXHJcblx0ICogbnVsbCBhcmUgdmFsdWVzLlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0Z2V0IGhhc1ZhbHVlKCl7XHJcblx0XHRyZXR1cm4gdHlwZW9mIHRoaXMuY29udGV4dFt0aGlzLmtleV0gIT09IFwidW5kZWZpbmVkXCI7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmV0dXJucyB7Kn0gdGhlIHN0b3JlZCB2YWx1ZSwgdW5kZWZpbmVkIHdoZW4gdGhlcmUgaXMgbm9uZVxyXG5cdCAqL1xyXG5cdGdldCB2YWx1ZSgpe1xyXG5cdFx0cmV0dXJuIHRoaXMuY29udGV4dFt0aGlzLmtleV07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcGFyYW0geyp9IGRhdGFcclxuXHQgKi9cclxuXHRzZXQgdmFsdWUoZGF0YSl7XHJcblx0XHR0aGlzLmNvbnRleHRbdGhpcy5rZXldID0gZGF0YTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgYSB2YWx1ZSBuZXh0IHRvIHdoYXQgaXMgYWxyZWFkeSB0aGVyZTogd3JpdGVzIGl0IHdoZW4gdGhlIGtleSBob2xkcyBub3RoaW5nLCB0dXJucyB0aGVcclxuXHQgKiB2YWx1ZSBpbnRvIGFuIGFycmF5IG9mIGJvdGggd2hlbiBpdCBob2xkcyBvbmUsIGFuZCBwdXNoZXMgb250byB0aGUgYXJyYXkgd2hlbiBpdCBob2xkcyBvbmVcclxuXHQgKiBhbHJlYWR5LlxyXG5cdCAqXHJcblx0ICogVGhlIHZhbHVlIGl0c2VsZiBpcyBub3QgbG9va2VkIGF0IC0gYXBwZW5kaW5nIHVuZGVmaW5lZCBwdXRzIHVuZGVmaW5lZCBpbnRvIHRoZSBhcnJheS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB7Kn0gZGF0YVxyXG5cdCAqXHJcblx0ICogQGV4YW1wbGVcclxuXHQgKiBwcm9wZXJ0eS5hcHBlbmQgPSAxOyAgIC8vIHtrZXkgOiAxfVxyXG5cdCAqIHByb3BlcnR5LmFwcGVuZCA9IDI7ICAgLy8ge2tleSA6IFsxLCAyXX1cclxuXHQgKiBwcm9wZXJ0eS5hcHBlbmQgPSAzOyAgIC8vIHtrZXkgOiBbMSwgMiwgM119XHJcblx0ICovXHJcblx0c2V0IGFwcGVuZChkYXRhKSB7XHJcblx0XHRpZighdGhpcy5oYXNWYWx1ZSlcclxuXHRcdFx0dGhpcy52YWx1ZSA9IGRhdGE7XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y29uc3QgdmFsdWUgPSB0aGlzLnZhbHVlO1xyXG5cdFx0XHRpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KVxyXG5cdFx0XHRcdHZhbHVlLnB1c2goZGF0YSk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR0aGlzLnZhbHVlID0gW3RoaXMudmFsdWUsIGRhdGFdO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRGVsZXRlcyB0aGUga2V5IGZyb20gdGhlIG9iamVjdC4gRG9lcyBub3RoaW5nIHdoZW4gaXQgaXMgbm90IHRoZXJlLlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge3ZvaWR9XHJcblx0ICovXHJcblx0cmVtb3ZlKCl7XHJcblx0XHRkZWxldGUgdGhpcy5jb250ZXh0W3RoaXMua2V5XTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogTG9hZHMgdGhlIHByb3BlcnR5IGEgZG90dGVkIHBhdGggYWRkcmVzc2VzLiBFdmVyeSBwYXJ0IG9mIHRoZSBwYXRoIGlzIHRyaW1tZWQsIHNvIFwiIGEgLiBiIFwiXHJcblx0ICogYWRkcmVzc2VzIHRoZSBzYW1lIHByb3BlcnR5IGFzIFwiYS5iXCIuXHJcblx0ICpcclxuXHQgKiBBIG1pc3Npbmcgc3RlcCBpcyBjcmVhdGVkIHdpdGggY3JlYXRlLCBvdGhlcndpc2UgdGhlIHBhdGggaXMgcmVwb3J0ZWQgYXMgbm90IGxvYWRhYmxlLiBBIHN0ZXBcclxuXHQgKiBob2xkaW5nIHNvbWV0aGluZyB0aGF0IGlzIG5vIG9iamVjdCBjYW5ub3QgYmUgd2Fsa2VkIGludG8gYXQgYWxsIC0gdGhhdCBpcyBhIGJyb2tlbiBwYXRoLCBub3QgYVxyXG5cdCAqIG1pc3Npbmcgb25lLCBhbmQgaXQgaXMgcmVwb3J0ZWQgYXMgYW4gZXJyb3IgcmVnYXJkbGVzcyBvZiBjcmVhdGUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YSB0aGUgb2JqZWN0IHRvIHdhbGtcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IG5hbWUgb2YgdGhlIHByb3BlcnR5LCBhIGRvdHRlZCBwYXRoIGFkZHJlc3NlcyBhIG5lc3RlZCBvbmVcclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtjcmVhdGU9dHJ1ZV0gY3JlYXRlIGEgbWlzc2luZyBzdGVwIG9uIHRoZSB3YXlcclxuXHQgKiBAcmV0dXJucyB7T2JqZWN0UHJvcGVydHl8bnVsbH0gbnVsbCB3aGVuIGEgc3RlcCBpcyBtaXNzaW5nIGFuZCBjcmVhdGUgaXMgZmFsc2VcclxuXHQgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IHdoZW4gYSBzdGVwIG9mIHRoZSBwYXRoIGhvbGRzIHNvbWV0aGluZyB0aGF0IGlzIG5vIG9iamVjdFxyXG5cdCAqXHJcblx0ICogQGV4YW1wbGVcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDoge2IgOiAxfX0sIFwiYS5iXCIpLnZhbHVlOyAgIC8vIDFcclxuXHQgKiBPYmplY3RQcm9wZXJ0eS5sb2FkKHtsaXN0IDogWzEsIDJdfSwgXCJsaXN0LjFcIikudmFsdWU7ICAgLy8gMiwgYW4gYXJyYXkgaXMgYW4gb2JqZWN0XHJcblx0ICogT2JqZWN0UHJvcGVydHkubG9hZCh7fSwgXCJhLmJcIiwgZmFsc2UpOyAgICAgICAgICAgICAvLyBudWxsXHJcblx0ICogT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IDB9LCBcImEuYlwiKTsgICAgICAgICAgICAgICAvLyB0aHJvd3MsIDAgaXMgbm8gb2JqZWN0XHJcblx0ICovXHJcblx0c3RhdGljIGxvYWQoZGF0YSwga2V5LCBjcmVhdGU9dHJ1ZSkge1xyXG5cdFx0bGV0IGNvbnRleHQgPSBkYXRhO1xyXG5cdFx0Y29uc3Qga2V5cyA9IGtleS5zcGxpdChcIi5cIik7XHJcblx0XHRsZXQgbmFtZSA9IGtleXMuc2hpZnQoKS50cmltKCk7XHJcblx0XHR3aGlsZShrZXlzLmxlbmd0aCA+IDApe1xyXG5cdFx0XHRpZih0eXBlb2YgY29udGV4dFtuYW1lXSA9PT0gXCJ1bmRlZmluZWRcIiB8fCBjb250ZXh0W25hbWVdID09PSBudWxsKXtcclxuXHRcdFx0XHRpZighY3JlYXRlKVxyXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblxyXG5cdFx0XHRcdGNvbnRleHRbbmFtZV0gPSB7fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRhc3NlcnREZXNjZW5kYWJsZShjb250ZXh0W25hbWVdLCBuYW1lLCBrZXkpO1xyXG5cdFx0XHRjb250ZXh0ID0gY29udGV4dFtuYW1lXTtcclxuXHRcdFx0bmFtZSA9IGtleXMuc2hpZnQoKS50cmltKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBPYmplY3RQcm9wZXJ0eShuYW1lLCBjb250ZXh0KTtcclxuXHR9XHJcbn07IiwiLyoqXHJcbiAqIFV0aWxpdGllcyB0byBpbnNwZWN0LCBjb21wYXJlLCBtZXJnZSBhbmQgZmlsdGVyIGphdmFzY3JpcHQgb2JqZWN0cy5cclxuICpcclxuICogU2V2ZXJhbCBmdW5jdGlvbnMgc2hhcmUgb25lIG5vdGlvbiBvZiBkYXRhOiBwcmltaXRpdmVzLCBzaW1wbGUgb2JqZWN0cywgQXJyYXksIERhdGUsIFJlZ0V4cCwgTWFwXHJcbiAqIGFuZCBTZXQuIHtAbGluayBpc1Bvam99IGRlY2lkZXMgd2hldGhlciBhIHZhbHVlIHN0YXlzIHdpdGhpbiBpdCwge0BsaW5rIGVxdWFsUG9qb30gY29tcGFyZXMgdGhvc2VcclxuICogdHlwZXMgYnkgdmFsdWUsIGFuZCB7QGxpbmsgbWVyZ2V9IHRyZWF0cyBldmVyeXRoaW5nIG91dHNpZGUgb2YgaXQgYXMgYSB2YWx1ZSB0byBiZSByZXBsYWNlZC5cclxuICpcclxuICogQG1vZHVsZSBPYmplY3RVdGlsc1xyXG4gKi9cclxuaW1wb3J0IE9iamVjdFByb3BlcnR5IGZyb20gXCIuL09iamVjdFByb3BlcnR5LmpzXCI7XHJcblxyXG4vKipcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtBcnJheX0gYVxyXG4gKiBAcGFyYW0ge0FycmF5fSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGVxdWFsQXJyYXkgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Y29uc3QgbGVuZ3RoID0gYS5sZW5ndGg7XHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykgaWYgKCFpbnRlcm5hbEVxdWFsUG9qbyhhW2ldLCBiW2ldLCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIHNldCBpcyB1bm9yZGVyZWQsIHNvIGV2ZXJ5IGVudHJ5IG9mIGEgaGFzIHRvIGZpbmQgaXRzIG93biBwYXJ0bmVyIGluIGIuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7U2V0fSBhXHJcbiAqIEBwYXJhbSB7U2V0fSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGVxdWFsU2V0ID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoYS5zaXplICE9PSBiLnNpemUpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Y29uc3QgcmVtYWluaW5nID0gQXJyYXkuZnJvbShiKTtcclxuXHRmb3IgKGNvbnN0IGVudHJ5QSBvZiBhKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IHJlbWFpbmluZy5maW5kSW5kZXgoKGVudHJ5QikgPT4gaW50ZXJuYWxFcXVhbFBvam8oZW50cnlBLCBlbnRyeUIsIHNlZW4pKTtcclxuXHRcdGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRyZW1haW5pbmcuc3BsaWNlKGluZGV4LCAxKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgbWFwIGlzIHVub3JkZXJlZCBhcyB3ZWxsIGFuZCBpdHMga2V5cyBtYXkgYmUgb2JqZWN0cywgc28gdGhlIGtleXMgZ2V0IGNvbXBhcmVkIGJ5IHZhbHVlIHRvby5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtNYXB9IGFcclxuICogQHBhcmFtIHtNYXB9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxNYXAgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChhLnNpemUgIT09IGIuc2l6ZSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCByZW1haW5pbmcgPSBBcnJheS5mcm9tKGIpO1xyXG5cdGZvciAoY29uc3QgW2tleUEsIHZhbHVlQV0gb2YgYSkge1xyXG5cdFx0Y29uc3QgaW5kZXggPSByZW1haW5pbmcuZmluZEluZGV4KChba2V5QiwgdmFsdWVCXSkgPT4gaW50ZXJuYWxFcXVhbFBvam8oa2V5QSwga2V5Qiwgc2VlbikgJiYgaW50ZXJuYWxFcXVhbFBvam8odmFsdWVBLCB2YWx1ZUIsIHNlZW4pKTtcclxuXHRcdGlmIChpbmRleCA8IDApIHJldHVybiBmYWxzZTtcclxuXHJcblx0XHRyZW1haW5pbmcuc3BsaWNlKGluZGV4LCAxKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENvbXBhcmVzIHR3byBvYmplY3RzIGJ5IHByb3RvdHlwZSBhbmQgYnkgdGhlaXIgb3duIGVudW1lcmFibGUgcHJvcGVydGllcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgZXF1YWxPYmplY3QgPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YoYSkgIT09IE9iamVjdC5nZXRQcm90b3R5cGVPZihiKSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRjb25zdCBwcm9wZXJ0aWVzQSA9IE9iamVjdC5rZXlzKGEpO1xyXG5cdGNvbnN0IHByb3BlcnRpZXNCID0gT2JqZWN0LmtleXMoYik7XHJcblx0aWYgKHByb3BlcnRpZXNBLmxlbmd0aCAhPT0gcHJvcGVydGllc0IubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGZvciAoY29uc3Qga2V5IG9mIHByb3BlcnRpZXNBKSB7XHJcblx0XHQvLyBlcXVhbCBrZXkgY291bnRzIGFsb25lIHdvdWxkIGxldCB7eDoxLCB5OnVuZGVmaW5lZH0gcGFzcyBhZ2FpbnN0IHt4OjEsIHo6dW5kZWZpbmVkfVxyXG5cdFx0aWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwga2V5KSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0aWYgKCFpbnRlcm5hbEVxdWFsUG9qbyhhW2tleV0sIGJba2V5XSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEEgY3ljbGljIHN0cnVjdHVyZSBjYW4gb25seSBiZSBkZWNpZGVkIGNvLWluZHVjdGl2ZWx5OiBhIHBhaXIgYWxyZWFkeSB1bmRlciBjb21wYXJpc29uIGNvdW50cyBhc1xyXG4gKiBlcXVhbCwgb3RoZXJ3aXNlIHRoZSB3YWxrIHdvdWxkIG5ldmVyIGNvbWUgYmFjay5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIHdoZW4gdGhpcyBwYWlyIGlzIGFscmVhZHkgYmVpbmcgY29tcGFyZWQgZnVydGhlciB1cCB0aGUgc3RhY2tcclxuICovXHJcbmNvbnN0IGlzQ29tcGFyaW5nID0gKHNlZW4sIGEsIGIpID0+IHtcclxuXHRjb25zdCBwYXJ0bmVycyA9IHNlZW4uZ2V0KGEpO1xyXG5cdHJldHVybiAhIXBhcnRuZXJzICYmIHBhcnRuZXJzLmhhcyhiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBOb3RlcyBhIHBhaXIgYXMgYmVpbmcgY29tcGFyZWQsIHNvIGEgY3ljbGUgcnVubmluZyB0aHJvdWdoIGl0IHRlcm1pbmF0ZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmNvbnN0IHJlbWVtYmVyQ29tcGFyaW5nID0gKHNlZW4sIGEsIGIpID0+IHtcclxuXHRjb25zdCBwYXJ0bmVycyA9IHNlZW4uZ2V0KGEpO1xyXG5cdGlmIChwYXJ0bmVycykgcGFydG5lcnMuYWRkKGIpO1xyXG5cdGVsc2Ugc2Vlbi5zZXQoYSwgbmV3IFdlYWtTZXQoW2JdKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBudWxsIG9yIHVuZGVmaW5lZC5cclxuICpcclxuICogVmFsdWVIZWxwZXIubm9WYWx1ZSBhbnN3ZXJzIHRoZSBzYW1lIHF1ZXN0aW9uLiBCb3RoIGFyZSBrZXB0IG9uIHB1cnBvc2UsIHNvIFZhbHVlSGVscGVyIHN0YXlzIGZyZWVcclxuICogb2YgYSBkZXBlbmRlbmN5IG9uIHRoaXMgbW9kdWxlIC0gc2VlIHRoZSBub3RlIHRoZXJlLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgdmFsdWUgdG8gYmUgdGVzdGluZ1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmV4cG9ydCBjb25zdCBpc051bGxPclVuZGVmaW5lZCA9IChvYmplY3QpID0+IHtcclxuXHRyZXR1cm4gb2JqZWN0ID09IG51bGwgfHwgdHlwZW9mIG9iamVjdCA9PT0gXCJ1bmRlZmluZWRcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIGEgcHJpbWl0aXZlLlxyXG4gKlxyXG4gKiBudWxsIGFuZCB1bmRlZmluZWQgY291bnQgYXMgcHJpbWl0aXZlcy4gQSBzeW1ib2wgZG9lcyBub3QgLSBpdCBpcyB0cmVhdGVkIGFzIGFuIG9wYXF1ZSB2YWx1ZVxyXG4gKiB0aHJvdWdob3V0IHRoaXMgbW9kdWxlLCBzbyB0aGF0IHtAbGluayBpc1Bvam99IGtlZXBzIHJlamVjdGluZyBpdCBhcyBkYXRhLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgdmFsdWUgdG8gYmUgdGVzdGluZ1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmV4cG9ydCBjb25zdCBpc1ByaW1pdGl2ZSA9IChvYmplY3QpID0+IHtcclxuXHRpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiB0cnVlO1xyXG5cclxuXHRjb25zdCB0eXBlID0gdHlwZW9mIG9iamVjdDtcclxuXHRzd2l0Y2ggKHR5cGUpIHtcclxuXHRcdGNhc2UgXCJudW1iZXJcIjpcclxuXHRcdGNhc2UgXCJiaWdpbnRcIjpcclxuXHRcdGNhc2UgXCJib29sZWFuXCI6XHJcblx0XHRjYXNlIFwic3RyaW5nXCI6XHJcblx0XHRjYXNlIFwidW5kZWZpbmVkXCI6XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgYW4gb2JqZWN0LlxyXG4gKlxyXG4gKiBFdmVyeSBvYmplY3QgY291bnRzLCBBcnJheSwgTWFwLCBEYXRlIGFuZCBjbGFzcyBpbnN0YW5jZXMgaW5jbHVkZWQuIFVzZSB7QGxpbmsgaXNQb2pvfSB0byBhc2sgZm9yXHJcbiAqIGEgc2ltcGxlIGRhdGEgb2JqZWN0IGluc3RlYWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSB2YWx1ZSB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzT2JqZWN0ID0gKG9iamVjdCkgPT4ge1xyXG5cdGlmIChpc051bGxPclVuZGVmaW5lZChvYmplY3QpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENvbXBhcmVzIHR3byB2YWx1ZXMgYnkgdmFsdWUuXHJcbiAqXHJcbiAqIFRoZSB0eXBlcyBjb21wYXJlZCBieSB2YWx1ZSBhcmUgdGhlIG9uZXMge0BsaW5rIGlzUG9qb30gYWNjZXB0cyBhcyBkYXRhOiBwcmltaXRpdmVzLCBzaW1wbGVcclxuICogb2JqZWN0cywgQXJyYXksIERhdGUsIFJlZ0V4cCwgTWFwIGFuZCBTZXQuIEEgRGF0ZSBpcyBjb21wYXJlZCBieSBpdHMgdGltZSwgYSBSZWdFeHAgYnkgc291cmNlIGFuZFxyXG4gKiBmbGFncy4gU2V0IGFuZCBNYXAgYXJlIHVub3JkZXJlZCwgc28gdGhlaXIgZW50cmllcyBhcmUgbWF0Y2hlZCBieSB2YWx1ZSBpbnN0ZWFkIG9mIGJ5IHBvc2l0aW9uLFxyXG4gKiBhbmQgdGhlIGtleXMgb2YgYSBNYXAgdGFrZSBwYXJ0IGluIHRoYXQgY29tcGFyaXNvbi5cclxuICpcclxuICogU2ltcGxlIG9iamVjdHMgYW5kIGNsYXNzIGluc3RhbmNlcyBuZWVkIHRoZSBzYW1lIHByb3RvdHlwZSBhbmQgdGhlIHNhbWUgb3duIGVudW1lcmFibGVcclxuICogcHJvcGVydGllcy4gRXZlcnkgb3RoZXIgb2JqZWN0IC0gRXJyb3IsIFByb21pc2UsIFdlYWtNYXAgYW5kIHRoZSBsaWtlIC0ga2VlcHMgaXRzIHN0YXRlIG91dCBvZlxyXG4gKiByZWFjaCwgc28gdGhvc2UgY29tcGFyZSBieSBpZGVudGl0eSBvbmx5LiBGdW5jdGlvbnMgYW5kIHN5bWJvbHMgZG8gYXMgd2VsbC5cclxuICpcclxuICogQ3ljbGljIHN0cnVjdHVyZXMgYXJlIHN1cHBvcnRlZC5cclxuICpcclxuICogQHBhcmFtIHsqfSBhXHJcbiAqIEBwYXJhbSB7Kn0gYlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogZXF1YWxQb2pvKHthIDogWzEsIDJdfSwge2EgOiBbMSwgMl19KTsgICAgICAgICAgICAgICAvLyB0cnVlXHJcbiAqIGVxdWFsUG9qbyhuZXcgU2V0KFsxLCAyXSksIG5ldyBTZXQoWzIsIDFdKSk7ICAgICAgICAgLy8gdHJ1ZSwgYSBzZXQgaXMgdW5vcmRlcmVkXHJcbiAqIGVxdWFsUG9qbyhuZXcgRGF0ZSgwKSwgbmV3IERhdGUoMSkpOyAgICAgICAgICAgICAgICAgLy8gZmFsc2VcclxuICogZXF1YWxQb2pvKG5ldyBFcnJvcihcInhcIiksIG5ldyBFcnJvcihcInhcIikpOyAgICAgICAgICAgLy8gZmFsc2UsIGNvbXBhcmVkIGJ5IGlkZW50aXR5XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZXF1YWxQb2pvID0gKGEsIGIpID0+IGludGVybmFsRXF1YWxQb2pvKGEsIGIsIG5ldyBXZWFrTWFwKCkpO1xyXG5cclxuXHJcbi8qKlxyXG4qIEBwYXJhbSB7Kn0gYVxyXG4gKiBAcGFyYW0geyp9IGJcclxuICogQHBhcmFtIHtXZWFrTWFwfSBzZWVuIGludGVybmFsLCB0cmFja3MgdGhlIHBhaXJzIGN1cnJlbnRseSB1bmRlciBjb21wYXJpc29uXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgaW50ZXJuYWxFcXVhbFBvam8gPSAoYSwgYiwgc2VlbikgPT4ge1xyXG5cdGlmIChpc051bGxPclVuZGVmaW5lZChhKSB8fCBpc051bGxPclVuZGVmaW5lZChiKSkgcmV0dXJuIGEgPT09IGI7XHJcblx0aWYgKGEgPT09IGIpIHJldHVybiB0cnVlO1xyXG5cdGlmIChpc1ByaW1pdGl2ZShhKSB8fCBpc1ByaW1pdGl2ZShiKSkgcmV0dXJuIGEgPT09IGI7XHJcblxyXG5cdGNvbnN0IHR5cGVBID0gdHlwZW9mIGE7XHJcblx0aWYgKHR5cGVBICE9PSB0eXBlb2YgYikgcmV0dXJuIGZhbHNlO1xyXG5cdGlmICh0eXBlQSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGEgPT09IGI7IC8vIGZ1bmN0aW9uIGFuZCBzeW1ib2xcclxuXHJcblx0aWYgKGlzQ29tcGFyaW5nKHNlZW4sIGEsIGIpKSByZXR1cm4gdHJ1ZTtcclxuXHRyZW1lbWJlckNvbXBhcmluZyhzZWVuLCBhLCBiKTtcclxuXHJcblx0aWYoYSBpbnN0YW5jZW9mIERhdGUpIHJldHVybiAgYiBpbnN0YW5jZW9mIERhdGUgPyBPYmplY3QuaXMoYS5nZXRUaW1lKCksIGIuZ2V0VGltZSgpKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIGIgaW5zdGFuY2VvZiBSZWdFeHAgPyAoYS5zb3VyY2UgPT09IGIuc291cmNlICYmIGEuZmxhZ3MgPT09IGIuZmxhZ3MpIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgQXJyYXkpIHJldHVybiBiIGluc3RhbmNlb2YgQXJyYXkgPyBlcXVhbEFycmF5KGEsIGIsIHNlZW4pIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgU2V0KSByZXR1cm4gYiBpbnN0YW5jZW9mIFNldCA/IGVxdWFsU2V0KGEsIGIsIHNlZW4pIDogZmFsc2U7XHJcblx0ZWxzZSBpZihhIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gYiBpbnN0YW5jZW9mIE1hcCA/IGVxdWFsTWFwKGEsIGIsIHNlZW4pIDogZmFsc2U7XHJcblx0ZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpICE9PSBcIltvYmplY3QgT2JqZWN0XVwiKSByZXR1cm4gZmFsc2U7XHRcclxuXHRlbHNlIHJldHVybiBlcXVhbE9iamVjdChhLCBiLCBzZWVuKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIHBsYWluIG9iamVjdCBvd25zIGVpdGhlciBubyBwcm90b3R5cGUgYXQgYWxsIG9yIGEgcHJvdG90eXBlIHRoYXQgaXRzZWxmIGhhcyBub25lLiBDaGVja2luZyB0aGVcclxuICogY2hhaW4gbGVuZ3RoIGluc3RlYWQgb2YgY29tcGFyaW5nIGFnYWluc3QgT2JqZWN0LnByb3RvdHlwZSBrZWVwcyB0aGlzIHdvcmtpbmcgYWNyb3NzIHJlYWxtcyxcclxuICogd2hlcmUgYW4gaWZyYW1lIGJyaW5ncyBpdHMgb3duIE9iamVjdC5wcm90b3R5cGUuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0XHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgaXNQbGFpbk9iamVjdCA9IChvYmplY3QpID0+IHtcclxuXHRpZiAob2JqZWN0ID09PSBudWxsIHx8IHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcclxuXHRjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcclxuXHRyZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpID09PSBudWxsO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFdhbGtzIGEgdmFsdWUgYW5kIGRlY2lkZXMgd2hldGhlciBldmVyeXRoaW5nIHJlYWNoYWJsZSBmcm9tIGl0IGlzIGRhdGEuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcclxuICogQHBhcmFtIHtXZWFrU2V0fSBbc2Vlbl0gdmFsdWVzIGFscmVhZHkgd2Fsa2VkLCBjbG9zZXMgY3ljbGVzXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgaXNEYXRhVmFsdWUgPSAodmFsdWUsIHNlZW4gPSBuZXcgV2Vha1NldCgpKSA9PiB7XHJcblx0aWYgKGlzUHJpbWl0aXZlKHZhbHVlKSkgcmV0dXJuIHRydWU7XHJcblx0ZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcclxuXHRlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHRydWU7XHJcblxyXG5cdGlmIChzZWVuLmhhcyh2YWx1ZSkpIHJldHVybiB0cnVlO1xyXG5cdHNlZW4uYWRkKHZhbHVlKTtcclxuXHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHJldHVybiB2YWx1ZS5ldmVyeSgoZW50cnkpID0+IGlzRGF0YVZhbHVlKGVudHJ5LCBzZWVuKSk7XHJcblx0ZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBNYXApIHtcclxuXHRcdGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIHZhbHVlKSB7XHJcblx0XHRcdGlmICghaXNEYXRhVmFsdWUoa2V5LCBzZWVuKSB8fCAhaXNEYXRhVmFsdWUoZW50cnksIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XHJcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIHZhbHVlKSB7XHJcblx0XHRcdGlmICghaXNEYXRhVmFsdWUoZW50cnksIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9IGVsc2UgaWYgKCFpc1BsYWluT2JqZWN0KHZhbHVlKSlcclxuXHRcdHJldHVybiBmYWxzZTsgLy8gY2xhc3MgaW5zdGFuY2VzIGFuZCBldmVyeSBvdGhlciBleG90aWMgb2JqZWN0XHJcblx0ZWxzZSB7XHJcblx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh2YWx1ZSkpIHtcclxuXHRcdFx0aWYgKCFpc0RhdGFWYWx1ZSh2YWx1ZVtrZXldLCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhbiBvYmplY3QgaXMgYSBwdXJlIGRhdGEgb2JqZWN0LlxyXG4gKlxyXG4gKiBUaGUgb2JqZWN0IGl0c2VsZiBoYXMgdG8gYmUgYSBzaW1wbGUgb2JqZWN0IC0gbm8gQXJyYXksIE1hcCBvciBzb21ldGhpbmcgZWxzZS4gRXZlcnkgdmFsdWVcclxuICogcmVhY2hhYmxlIGZyb20gaXQgaGFzIHRvIGJlIGRhdGEgYXMgd2VsbDogcHJpbWl0aXZlcywgc2ltcGxlIG9iamVjdHMsIEFycmF5LCBEYXRlLCBSZWdFeHAsIE1hcCBvclxyXG4gKiBTZXQuIEZ1bmN0aW9ucyBhbmQgY2xhc3MgaW5zdGFuY2VzIGFyZSByZWplY3RlZCBhdCBhbnkgZGVwdGgsIGluY2x1ZGluZyBpbnNpZGUgYXJyYXlzIGFuZCBpbnNpZGVcclxuICogdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhIE1hcCBvciBTZXQuXHJcbiAqXHJcbiAqIE9ubHkgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBhcmUgaW5zcGVjdGVkLiBDeWNsaWMgcmVmZXJlbmNlcyBhcmUgYWxsb3dlZC5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIG9iamVjdCB0byBiZSB0ZXN0aW5nXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBpc1Bvam8oe2EgOiB7YiA6IFsxLCBuZXcgRGF0ZSgpXX19KTsgICAvLyB0cnVlXHJcbiAqIGlzUG9qbyh7YSA6ICgpID0+IHt9fSk7ICAgICAgICAgICAgICAgIC8vIGZhbHNlLCBhIGZ1bmN0aW9uIGlzIG5vIGRhdGFcclxuICogaXNQb2pvKHthIDogW3tiIDogbmV3IEZvbygpfV19KTsgICAgICAgLy8gZmFsc2UsIHJlamVjdGVkIGF0IGFueSBkZXB0aFxyXG4gKiBpc1Bvam8oW10pOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxzZSwgdGhlIG9iamVjdCBpdHNlbGYgaGFzIHRvIGJlIGEgc2ltcGxlIG9uZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzUG9qbyA9IChvYmplY3QpID0+IHtcclxuXHRpZiAoaXNOdWxsT3JVbmRlZmluZWQob2JqZWN0KSB8fCAhaXNQbGFpbk9iamVjdChvYmplY3QpKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdHJldHVybiBpc0RhdGFWYWx1ZShvYmplY3QpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEFwcGVuZHMgYSBwcm9wZXJ0eSB2YWx1ZSB0byBhbiBvYmplY3QuIElmIHRoZSBwcm9wZXJ0eSBhbHJlYWR5IGhvbGRzIGEgdmFsdWUsIGl0IGlzIGNvbnZlcnRlZFxyXG4gKiBpbnRvIGFuIGFycmF5IGNhcnJ5aW5nIGJvdGguIEFuIHVuZGVmaW5lZCB2YWx1ZSBpcyBpZ25vcmVkLlxyXG4gKlxyXG4gKiBUaGUga2V5IG1heSBhZGRyZXNzIGEgbmVzdGVkIHByb3BlcnR5IGJ5IGEgZG90dGVkIHBhdGgsIG1pc3Npbmcgc3RlcHMgYXJlIGNyZWF0ZWQgb24gdGhlIHdheS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGFLZXkgbmFtZSBvZiB0aGUgcHJvcGVydHksIGEgZG90dGVkIHBhdGggYWRkcmVzc2VzIGEgbmVzdGVkIG9uZVxyXG4gKiBAcGFyYW0geyp9IGFEYXRhIHByb3BlcnR5IHZhbHVlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhT2JqZWN0IHRoZSBvYmplY3QgdG8gYXBwZW5kIHRoZSBwcm9wZXJ0eSB0b1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgY2hhbmdlZCBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogYXBwZW5kKFwiYVwiLCAxLCB7fSk7ICAgICAgICAgICAgIC8vIHthIDogMX1cclxuICogYXBwZW5kKFwiYVwiLCAyLCB7YSA6IDF9KTsgICAgICAgIC8vIHthIDogWzEsIDJdfVxyXG4gKiBhcHBlbmQoXCJhLmJcIiwgMSwge30pOyAgICAgICAgICAgLy8ge2EgOiB7YiA6IDF9fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGFwcGVuZCA9IChhS2V5LCBhRGF0YSwgYU9iamVjdCkgPT4ge1xyXG5cdGlmICh0eXBlb2YgYURhdGEgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuXHRcdGNvbnN0IHByb3BlcnR5ID0gT2JqZWN0UHJvcGVydHkubG9hZChhT2JqZWN0LCBhS2V5LCB0cnVlKTtcclxuXHRcdHByb3BlcnR5LmFwcGVuZCA9IGFEYXRhO1xyXG5cdH1cclxuXHRyZXR1cm4gYU9iamVjdDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBPd24gZW51bWVyYWJsZSBrZXlzLCBzdHJpbmdzIGFuZCBzeW1ib2xzIGFsaWtlIC0gdGhlIHNhbWUgc2V0IE9iamVjdC5hc3NpZ24gY29waWVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHNvdXJjZVxyXG4gKiBAcmV0dXJucyB7QXJyYXk8c3RyaW5nfHN5bWJvbD59XHJcbiAqL1xyXG5jb25zdCBhc3NpZ25hYmxlS2V5cyA9IChzb3VyY2UpID0+IHtcclxuXHRjb25zdCBvYmplY3QgPSBPYmplY3Qoc291cmNlKTtcclxuXHRyZXR1cm4gUmVmbGVjdC5vd25LZXlzKG9iamVjdCkuZmlsdGVyKChrZXkpID0+IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIGtleSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1lcmdlcyBvYmplY3RzIGludG8gYSB0YXJnZXQgb2JqZWN0IC0gYSByZWN1cnNpdmUgT2JqZWN0LmFzc2lnbi4gSXQgc3RlcHMgaW50byBvYmplY3RzIGFuZCBzdWJcclxuICogb2JqZWN0cy4gRXZlcnkgb3RoZXIgdmFsdWUgaXMgcmVwbGFjZWQgYnkgdGhlIHZhbHVlIGZyb20gdGhlIHNvdXJjZSBvYmplY3QuXHJcbiAqXHJcbiAqIExpa2UgT2JqZWN0LmFzc2lnbiBpdCBjb3BpZXMgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyAtIHN0cmluZyBhbmQgc3ltYm9sIGtleXMgYWxpa2UgLSwgaWdub3Jlc1xyXG4gKiBudWxsIGFuZCB1bmRlZmluZWQgc291cmNlcyBhbmQgcmV0dXJucyB0aGUgdGFyZ2V0LiBVbmxpa2UgT2JqZWN0LmFzc2lnbiBpdCBzdGVwcyBpbnRvIGEgcHJvcGVydHlcclxuICogd2hlbiB0YXJnZXQgYW5kIHNvdXJjZSBib3RoIGhvbGQgYW4gb2JqZWN0LCBpbnN0ZWFkIG9mIHJlcGxhY2luZyBpdC5cclxuICpcclxuICogQSBjbGFzcyBpbnN0YW5jZSBjb3VudHMgYXMgYW4gb2JqZWN0IGhlcmUgYW5kIGlzIG1lcmdlZCBwcm9wZXJ0eSBieSBwcm9wZXJ0eSBqdXN0IGxpa2UgYSBzaW1wbGVcclxuICogb25lLiBUaGUgdGFyZ2V0IGtlZXBzIGl0cyBvd24gcHJvdG90eXBlLCBvbmx5IHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBzb3VyY2UgYXJlIGFwcGxpZWQgdG8gaXQgLSBhXHJcbiAqIG1lcmdlIG5ldmVyIHR1cm5zIHRoZSB0YXJnZXQgaW50byBhbiBpbnN0YW5jZSBvZiB0aGUgY2xhc3Mgb2YgdGhlIHNvdXJjZS5cclxuICpcclxuICogQW4gQXJyYXksIFNldCwgTWFwLCBEYXRlIG9yIFJlZ0V4cCBpcyBhbHdheXMgcmVwbGFjZWQgYXMgYSB3aG9sZSwgbmV2ZXIgbWVyZ2VkIGVudHJ5IGJ5IGVudHJ5LlxyXG4gKiBUaGF0IGFscmVhZHkgYXBwbGllcyB3aGVuIG9ubHkgb25lIG9mIGJvdGggc2lkZXMgaG9sZHMgb25lLiBUaGUgcmVzdWx0IHRoZXJlZm9yZSBjYXJyaWVzIHRoZVxyXG4gKiBjb250YWluZXIgb2YgdGhlIHNvdXJjZSB3aXRoIGl0cyBvd24gbGVuZ3RoIC0gbm90aGluZyBvZiB0aGUgdGFyZ2V0IHN1cnZpdmVzIGl0LCBub3QgZXZlbiBhblxyXG4gKiBvYmplY3Qgc2l0dGluZyBhdCB0aGUgc2FtZSBpbmRleCBvciB1bmRlciB0aGUgc2FtZSBrZXkuXHJcbiAqXHJcbiAqIEEga2V5IHdob3NlIHZhbHVlIGlzIGEgc3ltYm9sIGlzIHNraXBwZWQsIG9uIHRoZSB0YXJnZXQgc2lkZSBhcyB3ZWxsIGFzIG9uIHRoZSBzb3VyY2Ugc2lkZS4gQVxyXG4gKiBzeW1ib2wgY2FycmllcyBubyBkYXRhLCBzbyBzdWNoIGEgcHJvcGVydHkgaXMgbGVmdCB1bnRvdWNoZWQuXHJcbiAqXHJcbiAqIFRoZSBrZXkgX19wcm90b19fIGlzIHNraXBwZWQuIE9iamVjdC5hc3NpZ24gd291bGQgb25seSByZXBvaW50IHRoZSBwcm90b3R5cGUgb2YgdGhlIHRhcmdldCwgYnV0XHJcbiAqIG1lcmdpbmcgaW50byBpdCB3b3VsZCB3YWxrIGludG8gT2JqZWN0LnByb3RvdHlwZSBhbmQgbGVhayBpbnRvIGV2ZXJ5IG9iamVjdC5cclxuICpcclxuICogVGhlIHRhcmdldCBpcyBtb2RpZmllZCBpbiBwbGFjZS4gQSBzdWIgb2JqZWN0IG9mIGEgc291cmNlIHRoYXQgaGFzIG5vIGNvdW50ZXJwYXJ0IGluIHRoZSB0YXJnZXQgaXNcclxuICogdGFrZW4gb3ZlciBieSByZWZlcmVuY2UsIGp1c3QgbGlrZSBPYmplY3QuYXNzaWduIGRvZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgdGhlIHRhcmdldCBvYmplY3QgdG8gbWVyZ2UgaW50bywgYSBuZXcgb2JqZWN0IHdoZW4gZmFsc3lcclxuICogQHBhcmFtIHsuLi5vYmplY3R9IHNvdXJjZXMgdGhlIHNvdXJjZSBvYmplY3RzLCBhcHBsaWVkIGluIG9yZGVyXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSB0YXJnZXQgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIG1lcmdlKHthIDogMX0sIHtiIDogMn0pOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8ge2EgOiAxLCBiIDogMn1cclxuICogbWVyZ2Uoe2EgOiB7eCA6IDF9fSwge2EgOiB7eSA6IDJ9fSk7ICAgICAgICAgICAgICAvLyB7YSA6IHt4IDogMSwgeSA6IDJ9fVxyXG4gKiBtZXJnZSh7YSA6IFsxLCAyLCAzXX0sIHthIDogWzldfSk7ICAgICAgICAgICAgICAgIC8vIHthIDogWzldfSwgcmVwbGFjZWQgYXMgYSB3aG9sZVxyXG4gKiBtZXJnZSh7YSA6IG5ldyBGb28oMSl9LCB7YSA6IG5ldyBCYXIoMil9KTsgICAgICAgIC8vIGEgc3RheXMgYSBGb28sIGNhcnJ5aW5nIHRoZSBwcm9wZXJ0aWVzIG9mIGJvdGhcclxuICogbWVyZ2Uoe30sIHNvdXJjZTEsIHNvdXJjZTIsIHNvdXJjZTMpO1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG1lcmdlID0gKHRhcmdldCwgLi4uc291cmNlcykgPT4ge1xyXG5cdGlmICghdGFyZ2V0KSB0YXJnZXQgPSB7fTtcclxuXHJcblx0c291cmNlc1xyXG5cdFx0LmZpbHRlcigoc291cmNlKSA9PiAhaXNOdWxsT3JVbmRlZmluZWQoc291cmNlKSlcclxuXHRcdC5mb3JFYWNoKChzb3VyY2UpID0+IHtcclxuXHRcdFx0Y29uc3Qga2V5cyA9IGFzc2lnbmFibGVLZXlzKHNvdXJjZSk7XHJcblx0XHRcdGtleXNcclxuXHRcdFx0XHQuZmlsdGVyKChrZXkpID0+IGtleSAhPSBcIl9fcHJvdG9fX1wiKVxyXG5cdFx0XHRcdC5maWx0ZXIoKGtleSkgPT4gdHlwZW9mIHRhcmdldFtrZXldICE9PSBcInN5bWJvbFwiKVxyXG5cdFx0XHRcdC5maWx0ZXIoKGtleSkgPT4gdHlwZW9mIHNvdXJjZVtrZXldICE9PSBcInN5bWJvbFwiKVxyXG5cdFx0XHRcdC5mb3JFYWNoKChrZXkpID0+IHtcclxuXHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gc291cmNlW2tleV07XHJcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50ID0gdGFyZ2V0W2tleV07XHJcblxyXG5cdFx0XHRcdFx0aWYoY3VycmVudCA9PSBudWxsICkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYoIHR5cGVvZiBjdXJyZW50ICE9PSB0eXBlb2YgdmFsdWUgKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIEFycmF5IHx8IHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgU2V0IHx8IHZhbHVlIGluc3RhbmNlb2YgU2V0KSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIE1hcCB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBEYXRlIHx8IHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBSZWdFeHAgfHwgdmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChpc09iamVjdChjdXJyZW50KSAmJiBpc09iamVjdCh2YWx1ZSkpIG1lcmdlKGN1cnJlbnQsIHZhbHVlKTtcclxuXHRcdFx0XHRcdGVsc2UgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cclxuXHRyZXR1cm4gdGFyZ2V0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlY2lkZXMgd2hldGhlciBhIHNpbmdsZSBwcm9wZXJ0eSBpcyB0YWtlbiBvdmVyIGJ5IHtAbGluayBmaWx0ZXJ9LlxyXG4gKlxyXG4gKiBAY2FsbGJhY2sgUHJvcGVydHlGaWx0ZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHsqfSB2YWx1ZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGhlIG9iamVjdCB0aGUgcHJvcGVydHkgYmVsb25ncyB0b1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSB0byBrZWVwIHRoZSBwcm9wZXJ0eVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSB7QGxpbmsgUHJvcGVydHlGaWx0ZXJ9IGFjY2VwdGluZyBvciByZWplY3RpbmcgYSBmaXhlZCBsaXN0IG9mIHByb3BlcnR5IG5hbWVzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IG9wdGlvbnMubmFtZXMgdGhlIHByb3BlcnR5IG5hbWVzIHRvIGRlY2lkZSBvblxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuYWxsb3dlZCB0cnVlIHR1cm5zIHRoZSBsaXN0IGludG8gYW4gYWxsb3cgbGlzdCwgZmFsc2UgaW50byBhIGRlbnkgbGlzdFxyXG4gKiBAcmV0dXJucyB7UHJvcGVydHlGaWx0ZXJ9XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IGRlbnkgPSBidWlsZFByb3BlcnR5RmlsdGVyKHtuYW1lcyA6IFtcInBhc3N3b3JkXCJdLCBhbGxvd2VkIDogZmFsc2V9KTtcclxuICogZmlsdGVyKHVzZXIsIGRlbnkpOyAgIC8vIGV2ZXJ5IHByb3BlcnR5IGJ1dCBwYXNzd29yZFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGJ1aWxkUHJvcGVydHlGaWx0ZXIgPSAoeyBuYW1lcywgYWxsb3dlZCB9KSA9PiB7XHJcblx0cmV0dXJuIChuYW1lLCB2YWx1ZSwgY29udGV4dCkgPT4ge1xyXG5cdFx0cmV0dXJuIG5hbWVzLmluY2x1ZGVzKG5hbWUpID09PSBhbGxvd2VkO1xyXG5cdH07XHJcbn07XHJcblxyXG4vKipcclxuICogUmVidWlsZHMgYW4gQXJyYXksIFNldCBvciBNYXAgd2l0aCBpdHMgdmFsdWVzIGZpbHRlcmVkLiBBIGNvbnRhaW5lciBrZWVwcyBhbGwgb2YgaXRzIGVudHJpZXMgLVxyXG4gKiBvbmx5IHRoZSB2YWx1ZXMgaW5zaWRlIGdldCBmaWx0ZXJlZC4gVGhlIGtleXMgb2YgYSBNYXAgc3RheSB1bnRvdWNoZWQsIHJlcGxhY2luZyB0aGVtIHdvdWxkIGJyZWFrXHJcbiAqIGV2ZXJ5IGxvb2t1cCBhZ2FpbnN0IHRoZSByZXN1bHQuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl8U2V0fE1hcH0gdmFsdWVcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlclxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRlZXBcclxuICogQHBhcmFtIHtXZWFrTWFwfSBjb3BpZXMgbWFwcyBhbiBvcmlnaW5hbCBvbnRvIGl0cyBmaWx0ZXJlZCBjb3B5XHJcbiAqIEByZXR1cm5zIHtBcnJheXxTZXR8TWFwfVxyXG4gKi9cclxuY29uc3QgZmlsdGVyQ29udGFpbmVyID0gKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpID0+IHtcclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkge1xyXG5cdFx0Y29uc3QgY29weSA9IFtdO1xyXG5cdFx0Y29waWVzLnNldCh2YWx1ZSwgY29weSk7XHJcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIHZhbHVlKSBjb3B5LnB1c2goZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRcdHJldHVybiBjb3B5O1xyXG5cdH1cclxuXHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgU2V0KSB7XHJcblx0XHRjb25zdCBjb3B5ID0gbmV3IFNldCgpO1xyXG5cdFx0Y29waWVzLnNldCh2YWx1ZSwgY29weSk7XHJcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIHZhbHVlKSBjb3B5LmFkZChmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdFx0cmV0dXJuIGNvcHk7XHJcblx0fVxyXG5cclxuXHRjb25zdCBjb3B5ID0gbmV3IE1hcCgpO1xyXG5cdGNvcGllcy5zZXQodmFsdWUsIGNvcHkpO1xyXG5cdGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIHZhbHVlKSBjb3B5LnNldChrZXksIGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0cmV0dXJuIGNvcHk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmlsdGVycyBhIHNpbmdsZSB2YWx1ZSwgZGlzcGF0Y2hpbmcgb24gd2hhdCBpdCBpcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSB2YWx1ZVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVlcFxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IGNvcGllcyBtYXBzIGFuIG9yaWdpbmFsIG9udG8gaXRzIGZpbHRlcmVkIGNvcHlcclxuICogQHJldHVybnMgeyp9IHRoZSBmaWx0ZXJlZCB2YWx1ZSwgb3IgdGhlIHZhbHVlIGl0c2VsZiB3aGVuIHRoZXJlIGlzIG5vdGhpbmcgdG8gZmlsdGVyXHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJWYWx1ZSA9ICh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA9PiB7XHJcblx0aWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHZhbHVlO1xyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUgfHwgdmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiB2YWx1ZTsgLy8gY2Fycnkgbm8gcHJvcGVydGllcyB0byBmaWx0ZXJcclxuXHJcblx0Ly8gYSB2YWx1ZSBzZWVuIGJlZm9yZSBjbG9zZXMgYSBjeWNsZSAtIGl0cyBjb3B5IHN0YW5kcyBpbiwgc28gbm90aGluZyB1bmZpbHRlcmVkIGxlYWtzIGJhY2sgaW5cclxuXHRpZiAoY29waWVzLmhhcyh2YWx1ZSkpIHJldHVybiBjb3BpZXMuZ2V0KHZhbHVlKTtcclxuXHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgfHwgdmFsdWUgaW5zdGFuY2VvZiBTZXQgfHwgdmFsdWUgaW5zdGFuY2VvZiBNYXApIHJldHVybiBmaWx0ZXJDb250YWluZXIodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcyk7XHJcblxyXG5cdHJldHVybiBmaWx0ZXJPYmplY3QodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcyk7XHJcbn07XHJcblxyXG4vKipcclxuICogQnVpbGRzIHRoZSBmaWx0ZXJlZCBjb3B5IG9mIGFuIG9iamVjdC4gVGhlIGNvcHkgaXMgcmVnaXN0ZXJlZCBiZWZvcmUgaXQgaXMgZmlsbGVkLCBzbyBhIGN5Y2xlXHJcbiAqIHJ1bm5pbmcgYmFjayBpbnRvIGl0IHJlc29sdmVzIHRvIHRoZSBjb3B5IGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVlcFxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IGNvcGllcyBtYXBzIGFuIG9yaWdpbmFsIG9udG8gaXRzIGZpbHRlcmVkIGNvcHlcclxuICogQHJldHVybnMge29iamVjdH1cclxuICovXHJcbmNvbnN0IGZpbHRlck9iamVjdCA9IChkYXRhLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpID0+IHtcclxuXHRjb25zdCByZXN1bHQgPSB7fTtcclxuXHRjb3BpZXMuc2V0KGRhdGEsIHJlc3VsdCk7XHJcblxyXG5cdGZvciAoY29uc3QgbmFtZSBpbiBkYXRhKSB7XHJcblx0XHRjb25zdCB2YWx1ZSA9IGRhdGFbbmFtZV07XHJcblx0XHRpZiAocHJvcEZpbHRlcihuYW1lLCB2YWx1ZSwgZGF0YSkpe1xyXG5cdFx0XHRyZXN1bHRbbmFtZV0gPSBkZWVwID8gZmlsdGVyVmFsdWUodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgOiB2YWx1ZTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQnVpbGRzIGEgbmV3IG9iamVjdCBob2xkaW5nIHRoZSBwcm9wZXJ0aWVzIGEgZmlsdGVyIGFjY2VwdHMuXHJcbiAqXHJcbiAqIFRoZSBmaWx0ZXIgaXMgY2FsbGVkIGZvciBldmVyeSBlbnVtZXJhYmxlIHByb3BlcnR5LCBpbmhlcml0ZWQgb25lcyBpbmNsdWRlZCAtIGZpbHRlcmluZyBhIHdpbmRvd1xyXG4gKiByZWxpZXMgb24gdGhhdCwgc2luY2UgbW9zdCBvZiBpdHMgbWVtYmVycyBzaXQgb24gdGhlIHByb3RvdHlwZS5cclxuICpcclxuICogV2l0aCBkZWVwIHRoZSBmaWx0ZXIgaXMgYXBwbGllZCB0byBzdWIgb2JqZWN0cyBhcyB3ZWxsLiBBcnJheSwgU2V0IGFuZCBNYXAgYXJlIHJlYnVpbHQgd2l0aCB0aGVpclxyXG4gKiB2YWx1ZXMgZmlsdGVyZWQsIGtlZXBpbmcgYWxsIG9mIHRoZWlyIGVudHJpZXMgYW5kLCBmb3IgYSBNYXAsIGl0cyBrZXlzLiBEYXRlIGFuZCBSZWdFeHAgYXJlIHRha2VuXHJcbiAqIG92ZXIgYXMgdGhleSBhcmUuIEEgY3ljbGljIHJlZmVyZW5jZSByZXNvbHZlcyB0byB0aGUgZmlsdGVyZWQgY29weSwgc28gdGhlIHJlc3VsdCBuZXZlciBjYXJyaWVzIGFcclxuICogcmVmZXJlbmNlIGludG8gdGhlIHVudG91Y2hlZCBvcmlnaW5hbC5cclxuICpcclxuICogV2l0aG91dCBkZWVwIHRoZSBhY2NlcHRlZCB2YWx1ZXMgYXJlIHRha2VuIG92ZXIgYXMgdGhleSBhcmUsIHN1YiBvYmplY3RzIGJ5IHJlZmVyZW5jZS5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGEgdGhlIG9iamVjdCB0byBiZSBmaWx0ZXJlZFxyXG4gKiBAcGFyYW0ge1Byb3BlcnR5RmlsdGVyfSBwcm9wRmlsdGVyIGRlY2lkZXMgcGVyIHByb3BlcnR5LCBzZWUge0BsaW5rIGJ1aWxkUHJvcGVydHlGaWx0ZXJ9XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwPWZhbHNlXSBmaWx0ZXIgc3ViIG9iamVjdHMgdG9vXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IGEgbmV3IG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBkZW55ID0gYnVpbGRQcm9wZXJ0eUZpbHRlcih7bmFtZXMgOiBbXCJzZWNyZXRcIl0sIGFsbG93ZWQgOiBmYWxzZX0pO1xyXG4gKlxyXG4gKiBmaWx0ZXIoe3NlY3JldCA6IFwieFwiLCBhIDogMX0sIGRlbnkpOyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8ge2EgOiAxfVxyXG4gKiBmaWx0ZXIoe3N1YiA6IHtzZWNyZXQgOiBcInhcIiwgYSA6IDF9fSwgZGVueSwge2RlZXAgOiB0cnVlfSk7ICAgICAgLy8ge3N1YiA6IHthIDogMX19XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZmlsdGVyID0gKGRhdGEsIHByb3BGaWx0ZXIsIHsgZGVlcCA9IGZhbHNlIH0gPSB7fSkgPT4gZmlsdGVyT2JqZWN0KGRhdGEsIHByb3BGaWx0ZXIsIGRlZXAsIG5ldyBXZWFrTWFwKCkpO1xyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBjb25zdGFudCwgbm9uIGVudW1lcmFibGUgcHJvcGVydHkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvIHRoZSBvYmplY3QgdG8gZGVmaW5lIHRoZSBwcm9wZXJ0eSBvblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlIHRoZSB2YWx1ZSwgbmVpdGhlciB3cml0YWJsZSBub3IgY29uZmlndXJhYmxlXHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZlZhbHVlID0gKG8sIG5hbWUsIHZhbHVlKSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdHZhbHVlLFxyXG5cdFx0d3JpdGFibGU6IGZhbHNlLFxyXG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSByZWFkIG9ubHksIG5vbiBlbnVtZXJhYmxlIHByb3BlcnR5IGJhY2tlZCBieSBhIGdldHRlci5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG8gdGhlIG9iamVjdCB0byBkZWZpbmUgdGhlIHByb3BlcnR5IG9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldCByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmR2V0ID0gKG8sIG5hbWUsIGdldCkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHRnZXQsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRGVmaW5lcyBhIG5vbiBlbnVtZXJhYmxlIHByb3BlcnR5IGJhY2tlZCBieSBhIGdldHRlciBhbmQgYSBzZXR0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvIHRoZSBvYmplY3QgdG8gZGVmaW5lIHRoZSBwcm9wZXJ0eSBvblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXQgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHNldCB0YWtlcyB0aGUgbmV3IHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZHZXRTZXQgPSAobywgbmFtZSwgZ2V0LCBzZXQpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0Z2V0LFxyXG5cdFx0c2V0LFxyXG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG5cdGlzTnVsbE9yVW5kZWZpbmVkLFxyXG5cdGlzT2JqZWN0LFxyXG5cdGlzUHJpbWl0aXZlLFxyXG5cdGVxdWFsUG9qbyxcclxuXHRpc1Bvam8sXHJcblx0YXBwZW5kLFxyXG5cdG1lcmdlLFxyXG5cdGZpbHRlcixcclxuXHRidWlsZFByb3BlcnR5RmlsdGVyLFxyXG5cdGRlZlZhbHVlLFxyXG5cdGRlZkdldCxcclxuXHRkZWZHZXRTZXQsXHJcbn07XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbmNvbnN0IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0Y29uc3QgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdGNvbnN0IG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHRjb25zdCBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlci92YWx1ZSBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0aWYoQXJyYXkuaXNBcnJheShkZWZpbml0aW9uKSkge1xuXHRcdHZhciBpID0gMDtcblx0XHR3aGlsZShpIDwgZGVmaW5pdGlvbi5sZW5ndGgpIHtcblx0XHRcdHZhciBrZXkgPSBkZWZpbml0aW9uW2krK107XG5cdFx0XHR2YXIgYmluZGluZyA9IGRlZmluaXRpb25baSsrXTtcblx0XHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0XHRpZihiaW5kaW5nID09PSAwKSB7XG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogZGVmaW5pdGlvbltpKytdIH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBiaW5kaW5nIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoYmluZGluZyA9PT0gMCkgeyBpKys7IH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QuaGFzT3duKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYoU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBFeGVjdXRlclJlZ2lzdHJ5IH0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBHTE9CQUwgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qc1wiO1xuaW1wb3J0IHsgVkVSU0lPTiB9IGZyb20gXCIuL3NyYy92ZXJzaW9uLmpzXCI7XG5cbkdMT0JBTC5kZWZhdWx0anMgPSBHTE9CQUwuZGVmYXVsdGpzIHx8IHt9O1xuR0xPQkFMLmRlZmF1bHRqcy5lbCA9IEdMT0JBTC5kZWZhdWx0anMuZWwgfHwge1xuXHRWRVJTSU9OLFxuXHRFeHByZXNzaW9uUmVzb2x2ZXIsXG5cdEV4ZWN1dGVyUmVnaXN0cnlcbn07XG5cbmV4cG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9