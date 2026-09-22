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







/** @type {Executer} */
let DEFAULT_EXECUTER = _executer_ContextDeconstructorExecuter_js__WEBPACK_IMPORTED_MODULE_3__["default"];

const EXECUTION_WARN_TIMEOUT = 1000;
const EXPRESSION_START = "${";
const EXPRESSION_SCOPE = /^([a-zA-Z0-9\-_\s]+)::/;

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
	// 3.4: an empty statement answers undefined, the same as `return;` in JavaScript
	if (aStatement == null) return undefined;
	if (typeof aStatement !== "string") return aStatement;
	aStatement = normalize(aStatement);
	if (aStatement == null) return undefined;

	// an error is deliberately not caught here: section 7 gives the two entry points different
	// answers to it, so each of them handles it for itself
	const timeout = setTimeout(
		() =>
			console.warn(`Long running statement:
				"${aStatement}"
			`),
		EXECUTION_WARN_TIMEOUT,
	);
	try {
		return await anExecuter.execute(aStatement, aContext);
	} finally {
		clearTimeout(timeout);
	}
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
	// a scope no link of the chain carries answers undefined, and the default applies to it like
	// to any other result - see SPECIFICATION.md 5.4
	if (aFilter && aResolver.name != aFilter)
		return aResolver.parent ? resolve(aExecuter, aResolver.parent, aExpression, aFilter, aDefault) : withDefault(undefined, aDefault);

	return withDefault(await execute(aExecuter, aExpression, aResolver.context), aDefault);
};

const normalize = (value) => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

// 4.1: the first argument of a static entry point is a string, or a configuration object
const isConfiguration = (aValue) => aValue !== null && typeof aValue === "object";

// 4.1: a configuration counts as passing a default where it carries the key, whatever it holds
const defaultOf = (aConfiguration) => ("defaultValue" in aConfiguration ? aConfiguration.defaultValue : DEFAULT_NOT_DEFINED);

const toText = (aValue) => (typeof aValue === "undefined" ? "undefined" : aValue === null ? "null" : aValue);

const startsRegex = (aText, aIndex) => {
	let index = aIndex - 1;
	while (index >= 0 && WHITESPACE.test(aText[index])) index--;

	return index < 0 || !BEFORE_DIVISION.test(aText[index]);
};

/**
 * Splits the text between the delimiters into the scope prefix of 3.3 and the statement. Both
 * entry points parse the prefix through this, so there is one rule for it and not two.
 */
const splitScopeAndStatement = (aContent) => {
	const scope = EXPRESSION_SCOPE.exec(aContent);
	if (!scope) return { scope: null, statement: normalize(aContent) };

	return { scope: normalize(scope[1]), statement: normalize(aContent.substring(scope[0].length)) };
};

const countBackslashes = (aText, aIndex) => {
	let count = 0;
	while (aIndex - count > 0 && aText[aIndex - count - 1] === "\\") count++;

	return count;
};

/**
 * Scans the one expression that opens with the "${" at aStart, counting braces but not the ones
 * hidden inside a literal.
 *
 * Answers a positive index directly after the matching closing brace; 0 where the text ends
 * before that brace, which per SPECIFICATION.md 3.1 means there is no expression here at all;
 * and the negated index of another "${" met outside a literal, which starts an expression of its
 * own and abandons this one.
 */
const scanExpression = (aText, aStart) => {
	const length = aText.length;
	const stack = [CODE];
	let index = aStart + 2;

	while (index < length) {
		const char = aText[index];
		switch (stack[stack.length - 1]) {
			case CODE:
				if (char === "{") stack.push(CODE);
				else if (char === "}") {
					stack.pop();
					if (stack.length === 0) return index + 1;
				} else if (char === "'") stack.push(SINGLE_QUOTED);
				else if (char === '"') stack.push(DOUBLE_QUOTED);
				else if (char === "`") stack.push(TEMPLATE);
				else if (char === "$" && aText[index + 1] === "{") return -index;
				else if (char === "/" && startsRegex(aText, index)) stack.push(REGEX);
				break;
			case SINGLE_QUOTED:
				if (char === "\\") index++;
				else if (char === "'") stack.pop();
				break;
			case DOUBLE_QUOTED:
				if (char === "\\") index++;
				else if (char === '"') stack.pop();
				break;
			case TEMPLATE:
				if (char === "\\") index++;
				else if (char === "`") stack.pop();
				else if (char === "$" && aText[index + 1] === "{") {
					stack.push(CODE);
					index++;
				}
				break;
			case REGEX:
				if (char === "\\") index++;
				else if (char === "[") stack.push(REGEX_CLASS);
				else if (char === "/") stack.pop();
				break;
			case REGEX_CLASS:
				if (char === "\\") index++;
				else if (char === "]") stack.pop();
				break;
		}
		index++;
	}

	return 0;
};

/**
 * Answers every expression of a text, in the order they stand, or null where the text carries
 * none. `start` is the index of the "$", `end` the index after the matching closing brace, so a
 * caller replaces by position and never touches an occurrence twice.
 */
const scan = (aText) => {
	let occurrences = null;
	let index = aText.indexOf(EXPRESSION_START);

	while (index >= 0) {
		// 3.2: an odd run of backslashes escapes the delimiter itself. It opens nothing, so only
		// those two characters are taken out of the text and the scan carries on behind them -
		// what would have been the statement is ordinary text and may hold expressions of its own.
		if (countBackslashes(aText, index) % 2 === 1) {
			if (!occurrences) occurrences = [];
			occurrences.push({ start: index, end: index + 2, escaped: true, scope: null, statement: null });
			index = aText.indexOf(EXPRESSION_START, index + 2);
			continue;
		}

		const end = scanExpression(aText, index);
		// no matching brace: the text stands as written, and nothing behind it can be an
		// expression either - a "${" outside a literal would have restarted the scan instead
		if (end === 0) break;
		if (end < 0) {
			index = -end;
			continue;
		}

		const { scope, statement } = splitScopeAndStatement(aText.substring(index + 2, end - 1));
		if (!occurrences) occurrences = [];
		occurrences.push({ start: index, end: end, escaped: false, scope: scope, statement: statement });
		index = aText.indexOf(EXPRESSION_START, end);
	}

	return occurrences;
};

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
		return this.parent ? `${this.parent.chain}/${this.name}` : `/${this.name}`;
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
		const parentEffectiveChain = this.parent ? this.parent.effectiveChain : "";
		return this.#contextHandle.providesData ? `${parentEffectiveChain}/${this.name}` : parentEffectiveChain;
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
			aExpression = aExpression.trim();

			// 4.3: the whole input is one expression, so its end is the end of the input. The
			// escaping of 3.2 does not apply here - it is a rule of the text form, and there is no
			// surrounding text, so a backslash belongs to the statement.
			if (aExpression.startsWith(EXPRESSION_START)) {
				if (!aExpression.endsWith("}")) throw new SyntaxError(`Expression does not end with "}": ${aExpression}`);

				const { scope, statement } = splitScopeAndStatement(aExpression.substring(2, aExpression.length - 1));
				return await resolve(this.#executer, this, statement, scope, defaultValue);
			}

			// 4.3: anything else is a statement in full, and carries no scope prefix
			return await resolve(this.#executer, this, normalize(aExpression), null, defaultValue);
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

		const occurrences = scan(aText);
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
				continue;
			}

			try {
				text += toText(await resolve(this.#executer, this, occurrence.statement, occurrence.scope, defaultValue));
			} catch (e) {
				// 7: an expression whose statement failed stands as written, and the default value
				// does not cover it. The rest of the text keeps rendering.
				warnFailedStatement(occurrence.statement, e);
				text += aText.substring(occurrence.start, occurrence.end);
			}
		}

		return text + aText.substring(position);
	}

	/**
	 * resolve an expression string to data
	 *
	 * Takes the arguments positionally, or one configuration object
	 * `{ expression, context, defaultValue, timeout }` - SPECIFICATION.md 4.1. A first argument
	 * that is neither a string nor an object rejects with a `TypeError`.
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
		if(arguments.length === 1 && isConfiguration(arguments[0])) {
			const { expression, context, timeout } = arguments[0];
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
	 * `{ text, context, defaultValue, timeout }` - SPECIFICATION.md 4.1. A first argument that is
	 * neither a string nor an object rejects with a `TypeError`.
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
		if(arguments.length === 1 && isConfiguration(arguments[0])) {
			const { text, context, timeout } = arguments[0];
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
	const result = Reflect.ownKeys(aContext);

	if (result.length > 10)
		console.warn(
			`High count of properties at first level, can be decrease the performence! count: ${result.length}`,
		);
	return result;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7OztBQ0poRDtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFFBQVE7QUFDdEIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsVUFBVTtBQUN4Qjs7QUFFQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFFBQVE7QUFDdEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlO0FBQ2YsWUFBWSxTQUFTO0FBQ3JCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsWUFBWSxtQkFBbUI7QUFDL0I7QUFDQSxZQUFZLHdCQUF3QjtBQUNwQztBQUNBLFlBQVksUUFBUTtBQUNwQjs7O0FBR0E7QUFDQSxZQUFZLGtCQUFrQjtBQUM5QjtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxrQkFBa0I7QUFDOUI7QUFDQSxTQUFTLGNBQWMsSUFBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ2U7QUFDZjtB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MENBQTBDO1dBQ3JGLE1BQU07V0FDTiwyQ0FBMkMsZ0NBQWdDO1dBQzNFO1dBQ0EsS0FBSyx5QkFBeUI7V0FDOUI7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLDBDQUEwQyx3Q0FBd0M7V0FDbEY7V0FDQTtXQUNBO1dBQ0EsRTs7Ozs7V0N0QkEsaUU7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05rRTtBQUNJO0FBQzNCOztBQUUzQyx3RkFBTSxhQUFhLHdGQUFNO0FBQ3pCLHdGQUFNLGdCQUFnQix3RkFBTTtBQUM1QixRQUFRO0FBQ1IsbUJBQW1CO0FBQ25CLGlCQUFpQjtBQUNqQjs7QUFFZ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL2luZGV4LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0NvZGVDYWNoZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9EZWZhdWx0VmFsdWUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhlY3V0ZXJSZWdpc3RyeS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvQ29udGV4dE9iamVjdEV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL1dpdGhTY29wZWRFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy92ZXJzaW9uLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vYnJvd3Nlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvblJlc29sdmVyIGZyb20gXCIuL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanNcIjtcbmltcG9ydCBcIi4vc3JjL2V4ZWN1dGVyL2luZGV4LmpzXCI7XG5pbXBvcnQgKiBhcyBFeGVjdXRlclJlZ2lzdHJ5IGZyb20gXCIuL3NyYy9FeGVjdXRlclJlZ2lzdHJ5LmpzXCJcblxuZXhwb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBFeGVjdXRlclJlZ2lzdHJ5IH07XG4iLCIvKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IENhY2hlRW50cnlcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsYXN0SGl0IC0gTW9ub3RvbmljIG1hcmtlciBvZiB0aGUgbGFzdCByZWFkIG9yIHdyaXRlLCB0aGUgZXZpY3Rpb24gb3JkZXIuXG4gKiBAcHJvcGVydHkge3N0cmluZ30ga2V5XG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSB2YWx1ZVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ29kZUNhY2hlT3B0aW9uc1xuICogQHByb3BlcnR5IHtudW1iZXJ9IFtzaXplPTEwMDBdIC0gTWF4aW11bSBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2FjaGUuIElmIHNldCB0byAwIG9yIGxlc3MsIGNhY2hpbmcgaXMgZGlzYWJsZWQuXG4gKi9cblxuLyoqXG4gKiBDb2RlQ2FjaGUgY2xhc3MgdG8gbWFuYWdlIGNhY2hpbmcgb2YgZ2VuZXJhdGVkIGNvZGUgc25pcHBldHMuXG4gKlxuICogRW50cmllcyBhcmUgZXZpY3RlZCBsZWFzdCByZWNlbnRseSB1c2VkIGZpcnN0OiBldmVyeSBoaXQgcmVmcmVzaGVzIHRoZSBlbnRyeSwgc28gYW5cbiAqIGV4cHJlc3Npb24gdGhhdCBrZWVwcyBiZWluZyByZXNvbHZlZCBvdXRsaXZlcyBvbmUgdGhhdCB3YXMgY29tcGlsZWQgb25jZSBhbmQgZHJvcHBlZC5cbiAqIFRoZSBtYXJrZXIgaXMgYSBjb3VudGVyIHJhdGhlciB0aGFuIGEgdGltZXN0YW1wIOKAlCBhIGJ1cnN0IG9mIGZpcnN0LXRpbWUgY29tcGlsYXRpb25zXG4gKiBmYWxscyBpbnRvIGEgc2luZ2xlIG1pbGxpc2Vjb25kLCB3aGljaCB3b3VsZCBsZWF2ZSB0aGUgZXZpY3Rpb24gb3JkZXIgdG8gY2hhbmNlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlQ2FjaGUge1xuXHQvKiogQHR5cGUge2Jvb2xlYW59ICovXG5cdCNkaXNhYmxlZCA9IGZhbHNlO1xuXHQvKiogQHR5cGUge251bWJlcn0gKi9cblx0I3NpemUgPSAwO1xuXHQvKiogQHR5cGUge251bWJlcn0gKi9cblx0I21heFNpemUgPSAwO1xuXHQvKiogQHR5cGUge0FycmF5PENhY2hlRW50cnk+fSAqL1xuXHQjZW50cmllcyA9IFtdO1xuXHQvKiogQHR5cGUge01hcDxzdHJpbmcsQ2FjaGVFbnRyeT59ICovXG5cdCNlbnRyeU1hcCA9IG5ldyBNYXAoKTtcblx0LyoqIEB0eXBlIHtudW1iZXJ9IC0gSGFuZHMgb3V0IHRoZSBgbGFzdEhpdGAgbWFya2VycywgbmV2ZXIgcmVzZXQuICovXG5cdCNjbG9jayA9IDA7XG5cblxuXHQvKipcblx0ICogQHBhcmFtIHtDb2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLnNldHVwKG9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgYSBuZXcgc2l6ZS4gQSBzaXplIG9mIDAgb3IgbGVzcyBkaXNhYmxlcyB0aGUgY2FjaGUgYW5kIHJlbGVhc2VzIGl0cyBlbnRyaWVzLFxuXHQgKiBhIGxhdGVyIHBvc2l0aXZlIHNpemUgZW5hYmxlcyBpdCBhZ2FpbiBhbmQgc3RhcnRzIGVtcHR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICovXG5cdHNldHVwKHsgc2l6ZSA9IDEwMDAgfSA9IHt9KSB7XG5cdFx0dGhpcy4jZGlzYWJsZWQgPSBzaXplIDw9IDA7XG5cdFx0aWYgKHRoaXMuI2Rpc2FibGVkKSB7XG5cdFx0XHR0aGlzLiNzaXplID0gMDtcblx0XHRcdHRoaXMuI21heFNpemUgPSAwO1xuXHRcdFx0dGhpcy5jbGVhcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLiNzaXplID0gc2l6ZTtcblx0XHRcdHRoaXMuI21heFNpemUgPSBNYXRoLmZsb29yKHNpemUgKiAxLjEpO1xuXHRcdFx0dGhpcy4jdHJpbSgpO1xuXHRcdH1cblx0fVxuXG5cdGhhcyhrZXkpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiB0aGlzLiNlbnRyeU1hcC5oYXMoa2V5KTtcblx0fVxuXG5cdGdldChrZXkpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIG51bGw7XG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLiNlbnRyeU1hcC5nZXQoa2V5KTtcblx0XHRpZiAoZW50cnkpIHtcblx0XHRcdGVudHJ5Lmxhc3RIaXQgPSArK3RoaXMuI2Nsb2NrO1xuXHRcdFx0cmV0dXJuIGVudHJ5LnZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdHNldChrZXksIGNvZGUpIHtcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuO1xuXHRcdGxldCBlbnRyeSA9IHRoaXMuI2VudHJ5TWFwLmdldChrZXkpO1xuXHRcdGlmIChlbnRyeSkge1xuXHRcdFx0ZW50cnkubGFzdEhpdCA9ICsrdGhpcy4jY2xvY2s7XG5cdFx0XHRlbnRyeS52YWx1ZSA9IGNvZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVudHJ5ID0ge1xuXHRcdFx0XHRsYXN0SGl0OiArK3RoaXMuI2Nsb2NrLFxuXHRcdFx0XHRrZXksXG5cdFx0XHRcdHZhbHVlOiBjb2RlLFxuXHRcdFx0fTtcblx0XHRcdHRoaXMuI2VudHJpZXMucHVzaChlbnRyeSk7XG5cdFx0XHR0aGlzLiNlbnRyeU1hcC5zZXQoa2V5LCBlbnRyeSk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuI2VudHJ5TWFwLnNpemUgPj0gdGhpcy4jbWF4U2l6ZSkgdGhpcy4jdHJpbSgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy4jZW50cmllcyA9IFtdO1xuXHRcdHRoaXMuI2VudHJ5TWFwID0gbmV3IE1hcCgpO1xuXHR9XG5cblx0I3RyaW0oKSB7XG5cdFx0dGhpcy4jZW50cmllcy5zb3J0KChhLCBiKSA9PiBiLmxhc3RIaXQgLSBhLmxhc3RIaXQpO1xuXHRcdGlmICh0aGlzLiNlbnRyaWVzLmxlbmd0aCA+IHRoaXMuI3NpemUpIHtcblx0XHRcdGNvbnN0IGVudHJpZXNUb1JlbW92ZSA9IHRoaXMuI2VudHJpZXMuc3BsaWNlKHRoaXMuI3NpemUpO1xuXHRcdFx0Zm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzVG9SZW1vdmUpIHtcblx0XHRcdFx0dGhpcy4jZW50cnlNYXAuZGVsZXRlKGVudHJ5LmtleSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuIiwiLyoqXG4gKiBvYmplY3QgZm9yIGRlZmF1bHQgdmFsdWVcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRGVmYXVsdFZhbHVlXG4gKiBAdHlwZWRlZiB7RGVmYXVsdFZhbHVlfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWZhdWx0VmFsdWUge1xuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBEZWZhdWx0VmFsdWUuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0geyp9IHZhbHVlXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZSl7XG5cdFx0dGhpcy5oYXNWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMTtcblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdH1cbn07XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFeGVjdXRlcntcblxuXHQjZXhlY3V0aW9uO1xuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbi5leGVjdXRpb25cblx0ICovXG5cdGNvbnN0cnVjdG9yKHtleGVjdXRpb259ID0ge30pe1xuXHRcdHRoaXMuI2V4ZWN1dGlvbiA9IGV4ZWN1dGlvbiB8fCAoKCkgPT4ge3Rocm93IG5ldyBFcnJvcihcIm5vdCBpbXBsZW1lbnRlZFwiKX0pO1xuXHR9XG5cblx0ZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCl7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGlvbihhU3RhdGVtZW50LCBhQ29udGV4dCk7XG5cdH1cbn07XG4iLCJpbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcblxuY29uc3QgRVhFQ1VURVJTID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEBwYXJhbSB7RXhlY3V0ZXJ9IGFuRXhlY3V0ZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdHJhdGUgPSAoYU5hbWUsIGFuRXhlY3V0ZXIpID0+IHtcblx0RVhFQ1VURVJTLnNldChhTmFtZSwgYW5FeGVjdXRlcik7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEByZXR1cm5zIHtFeGVjdXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4ZWN1dGVyID0gKGFOYW1lKSA9PiB7XG5cdGNvbnN0IGV4ZWN1dGVyID0gRVhFQ1VURVJTLmdldChhTmFtZSk7XG5cdGlmICghZXhlY3V0ZXIpIHRocm93IG5ldyBFcnJvcihgRXhlY3V0ZXIgXCIke2FOYW1lfVwiIGlzIG5vdCByZWdpc3RyYXRlZCFgKTtcblx0cmV0dXJuIGV4ZWN1dGVyO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RXhlY3V0ZXI7XG4iLCJpbXBvcnQgT2JqZWN0VXRpbHMgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5pbXBvcnQgRGVmYXVsdFZhbHVlIGZyb20gXCIuL0RlZmF1bHRWYWx1ZS5qc1wiO1xuaW1wb3J0IGdldEV4ZWN1dGVyVHlwZSBmcm9tIFwiLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRGVmYXVsdEV4ZWN1dGVyIGZyb20gXCIuL2V4ZWN1dGVyL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBSZXNvbHZlckNvbnRleHRIYW5kbGUgZnJvbSBcIi4vUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcblxuLyoqIEB0eXBlIHtFeGVjdXRlcn0gKi9cbmxldCBERUZBVUxUX0VYRUNVVEVSID0gRGVmYXVsdEV4ZWN1dGVyO1xuXG5jb25zdCBFWEVDVVRJT05fV0FSTl9USU1FT1VUID0gMTAwMDtcbmNvbnN0IEVYUFJFU1NJT05fU1RBUlQgPSBcIiR7XCI7XG5jb25zdCBFWFBSRVNTSU9OX1NDT1BFID0gL14oW2EtekEtWjAtOVxcLV9cXHNdKyk6Oi87XG5cbi8vIHRoZSBzY2FubmVyIHN0YXRlcyAtIGV2ZXJ5dGhpbmcgdGhhdCBpcyBub3QgY29kZSBoaWRlcyB0aGUgYnJhY2VzIGluc2lkZSBpdCwgc2VlXG4vLyBTUEVDSUZJQ0FUSU9OLm1kIDMuMVxuY29uc3QgQ09ERSA9IDA7XG5jb25zdCBTSU5HTEVfUVVPVEVEID0gMTtcbmNvbnN0IERPVUJMRV9RVU9URUQgPSAyO1xuY29uc3QgVEVNUExBVEUgPSAzO1xuY29uc3QgUkVHRVggPSA0O1xuY29uc3QgUkVHRVhfQ0xBU1MgPSA1O1xuXG4vLyBhIFwiL1wiIGNvbnRpbnVlcyBhbiBleHByZXNzaW9uIGluc3RlYWQgb2Ygb3BlbmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB3aGVuIGl0IGZvbGxvd3Mgb25lIG9mXG4vLyB0aGVzZSAtIHRoZSBjbGFzc2ljIGRpdmlzaW9uLW9yLXJlZ2V4IHF1ZXN0aW9uLCBkZWNpZGVkIG9uIHRoZSBsYXN0IGNoYXJhY3RlciB0aGF0IGlzIG5vdFxuLy8gd2hpdGVzcGFjZVxuY29uc3QgQkVGT1JFX0RJVklTSU9OID0gL1thLXpBLVowLTlfJClcXF1dLztcbmNvbnN0IFdISVRFU1BBQ0UgPSAvXFxzLztcblxuY29uc3QgREVGQVVMVF9OT1RfREVGSU5FRCA9IG5ldyBEZWZhdWx0VmFsdWUoKTtcbmNvbnN0IHRvRGVmYXVsdFZhbHVlID0gKHZhbHVlKSA9PiB7XG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSkgcmV0dXJuIHZhbHVlO1xuXG5cdHJldHVybiBuZXcgRGVmYXVsdFZhbHVlKHZhbHVlKTtcbn07XG5cbmxldCBOQU1FX0NPVU5URVIgPSAwO1xuLyoqXG4gKiBUaGUgbmFtZSBhIHJlc29sdmVyIGNhcnJpZXMgd2hlcmUgdGhlIGNhbGxlciBwYXNzZWQgbm9uZS4gT25seSB1bmlxdWVuZXNzIGlzIHByb21pc2VkLCB0aGUgc2hhcGVcbiAqIGlzIG5vdCAtIFNQRUNJRklDQVRJT04ubWQgNS4xLlxuICpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGdlbmVyYXRlTmFtZSA9ICgpID0+IGBFUiR7KytOQU1FX0NPVU5URVJ9YDtcblxuY29uc3QgZXhlY3V0ZSA9IGFzeW5jIGZ1bmN0aW9uIChhbkV4ZWN1dGVyLCBhU3RhdGVtZW50LCBhQ29udGV4dCkge1xuXHQvLyAzLjQ6IGFuIGVtcHR5IHN0YXRlbWVudCBhbnN3ZXJzIHVuZGVmaW5lZCwgdGhlIHNhbWUgYXMgYHJldHVybjtgIGluIEphdmFTY3JpcHRcblx0aWYgKGFTdGF0ZW1lbnQgPT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0aWYgKHR5cGVvZiBhU3RhdGVtZW50ICE9PSBcInN0cmluZ1wiKSByZXR1cm4gYVN0YXRlbWVudDtcblx0YVN0YXRlbWVudCA9IG5vcm1hbGl6ZShhU3RhdGVtZW50KTtcblx0aWYgKGFTdGF0ZW1lbnQgPT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHQvLyBhbiBlcnJvciBpcyBkZWxpYmVyYXRlbHkgbm90IGNhdWdodCBoZXJlOiBzZWN0aW9uIDcgZ2l2ZXMgdGhlIHR3byBlbnRyeSBwb2ludHMgZGlmZmVyZW50XG5cdC8vIGFuc3dlcnMgdG8gaXQsIHNvIGVhY2ggb2YgdGhlbSBoYW5kbGVzIGl0IGZvciBpdHNlbGZcblx0Y29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoXG5cdFx0KCkgPT5cblx0XHRcdGNvbnNvbGUud2FybihgTG9uZyBydW5uaW5nIHN0YXRlbWVudDpcblx0XHRcdFx0XCIke2FTdGF0ZW1lbnR9XCJcblx0XHRcdGApLFxuXHRcdEVYRUNVVElPTl9XQVJOX1RJTUVPVVQsXG5cdCk7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IGFuRXhlY3V0ZXIuZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCk7XG5cdH0gZmluYWxseSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHR9XG59O1xuXG5jb25zdCB3YXJuRmFpbGVkU3RhdGVtZW50ID0gKGFTdGF0ZW1lbnQsIGFuRXJyb3IpID0+IHtcblx0Y29uc29sZS53YXJuKGBFeGVjdXRpb24gZXJyb3Igb24gc3RhdGVtZW50IVxuXHRcdHN0YXRlbWVudDpcblx0XHQke2FTdGF0ZW1lbnR9XG5cdFx0ZXJyb3I6XG5cdFx0JHthbkVycm9yfVxuXHRcdGApO1xufTtcblxuY29uc3Qgd2l0aERlZmF1bHQgPSAoYVJlc3VsdCwgYURlZmF1bHQpID0+IHtcblx0aWYgKGFSZXN1bHQgIT09IG51bGwgJiYgdHlwZW9mIGFSZXN1bHQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBhUmVzdWx0O1xuXHRlbHNlIGlmIChhRGVmYXVsdCBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSAmJiBhRGVmYXVsdC5oYXNWYWx1ZSkgcmV0dXJuIGFEZWZhdWx0LnZhbHVlO1xuXHRyZXR1cm4gYVJlc3VsdDtcbn07XG5cbmNvbnN0IHJlc29sdmUgPSBhc3luYyBmdW5jdGlvbiAoYUV4ZWN1dGVyID0gREVGQVVMVF9FWEVDVVRFUiwgYVJlc29sdmVyLCBhRXhwcmVzc2lvbiwgYUZpbHRlciwgYURlZmF1bHQpIHtcblx0Ly8gYSBzY29wZSBubyBsaW5rIG9mIHRoZSBjaGFpbiBjYXJyaWVzIGFuc3dlcnMgdW5kZWZpbmVkLCBhbmQgdGhlIGRlZmF1bHQgYXBwbGllcyB0byBpdCBsaWtlXG5cdC8vIHRvIGFueSBvdGhlciByZXN1bHQgLSBzZWUgU1BFQ0lGSUNBVElPTi5tZCA1LjRcblx0aWYgKGFGaWx0ZXIgJiYgYVJlc29sdmVyLm5hbWUgIT0gYUZpbHRlcilcblx0XHRyZXR1cm4gYVJlc29sdmVyLnBhcmVudCA/IHJlc29sdmUoYUV4ZWN1dGVyLCBhUmVzb2x2ZXIucGFyZW50LCBhRXhwcmVzc2lvbiwgYUZpbHRlciwgYURlZmF1bHQpIDogd2l0aERlZmF1bHQodW5kZWZpbmVkLCBhRGVmYXVsdCk7XG5cblx0cmV0dXJuIHdpdGhEZWZhdWx0KGF3YWl0IGV4ZWN1dGUoYUV4ZWN1dGVyLCBhRXhwcmVzc2lvbiwgYVJlc29sdmVyLmNvbnRleHQpLCBhRGVmYXVsdCk7XG59O1xuXG5jb25zdCBub3JtYWxpemUgPSAodmFsdWUpID0+IHtcblx0aWYgKHZhbHVlKSB7XG5cdFx0dmFsdWUgPSB2YWx1ZS50cmltKCk7XG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PSAwID8gbnVsbCA6IHZhbHVlO1xuXHR9XG5cdHJldHVybiBudWxsO1xufTtcblxuLy8gNC4xOiB0aGUgZmlyc3QgYXJndW1lbnQgb2YgYSBzdGF0aWMgZW50cnkgcG9pbnQgaXMgYSBzdHJpbmcsIG9yIGEgY29uZmlndXJhdGlvbiBvYmplY3RcbmNvbnN0IGlzQ29uZmlndXJhdGlvbiA9IChhVmFsdWUpID0+IGFWYWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgYVZhbHVlID09PSBcIm9iamVjdFwiO1xuXG4vLyA0LjE6IGEgY29uZmlndXJhdGlvbiBjb3VudHMgYXMgcGFzc2luZyBhIGRlZmF1bHQgd2hlcmUgaXQgY2FycmllcyB0aGUga2V5LCB3aGF0ZXZlciBpdCBob2xkc1xuY29uc3QgZGVmYXVsdE9mID0gKGFDb25maWd1cmF0aW9uKSA9PiAoXCJkZWZhdWx0VmFsdWVcIiBpbiBhQ29uZmlndXJhdGlvbiA/IGFDb25maWd1cmF0aW9uLmRlZmF1bHRWYWx1ZSA6IERFRkFVTFRfTk9UX0RFRklORUQpO1xuXG5jb25zdCB0b1RleHQgPSAoYVZhbHVlKSA9PiAodHlwZW9mIGFWYWx1ZSA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBhVmFsdWUgPT09IG51bGwgPyBcIm51bGxcIiA6IGFWYWx1ZSk7XG5cbmNvbnN0IHN0YXJ0c1JlZ2V4ID0gKGFUZXh0LCBhSW5kZXgpID0+IHtcblx0bGV0IGluZGV4ID0gYUluZGV4IC0gMTtcblx0d2hpbGUgKGluZGV4ID49IDAgJiYgV0hJVEVTUEFDRS50ZXN0KGFUZXh0W2luZGV4XSkpIGluZGV4LS07XG5cblx0cmV0dXJuIGluZGV4IDwgMCB8fCAhQkVGT1JFX0RJVklTSU9OLnRlc3QoYVRleHRbaW5kZXhdKTtcbn07XG5cbi8qKlxuICogU3BsaXRzIHRoZSB0ZXh0IGJldHdlZW4gdGhlIGRlbGltaXRlcnMgaW50byB0aGUgc2NvcGUgcHJlZml4IG9mIDMuMyBhbmQgdGhlIHN0YXRlbWVudC4gQm90aFxuICogZW50cnkgcG9pbnRzIHBhcnNlIHRoZSBwcmVmaXggdGhyb3VnaCB0aGlzLCBzbyB0aGVyZSBpcyBvbmUgcnVsZSBmb3IgaXQgYW5kIG5vdCB0d28uXG4gKi9cbmNvbnN0IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnQgPSAoYUNvbnRlbnQpID0+IHtcblx0Y29uc3Qgc2NvcGUgPSBFWFBSRVNTSU9OX1NDT1BFLmV4ZWMoYUNvbnRlbnQpO1xuXHRpZiAoIXNjb3BlKSByZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBub3JtYWxpemUoYUNvbnRlbnQpIH07XG5cblx0cmV0dXJuIHsgc2NvcGU6IG5vcm1hbGl6ZShzY29wZVsxXSksIHN0YXRlbWVudDogbm9ybWFsaXplKGFDb250ZW50LnN1YnN0cmluZyhzY29wZVswXS5sZW5ndGgpKSB9O1xufTtcblxuY29uc3QgY291bnRCYWNrc2xhc2hlcyA9IChhVGV4dCwgYUluZGV4KSA9PiB7XG5cdGxldCBjb3VudCA9IDA7XG5cdHdoaWxlIChhSW5kZXggLSBjb3VudCA+IDAgJiYgYVRleHRbYUluZGV4IC0gY291bnQgLSAxXSA9PT0gXCJcXFxcXCIpIGNvdW50Kys7XG5cblx0cmV0dXJuIGNvdW50O1xufTtcblxuLyoqXG4gKiBTY2FucyB0aGUgb25lIGV4cHJlc3Npb24gdGhhdCBvcGVucyB3aXRoIHRoZSBcIiR7XCIgYXQgYVN0YXJ0LCBjb3VudGluZyBicmFjZXMgYnV0IG5vdCB0aGUgb25lc1xuICogaGlkZGVuIGluc2lkZSBhIGxpdGVyYWwuXG4gKlxuICogQW5zd2VycyBhIHBvc2l0aXZlIGluZGV4IGRpcmVjdGx5IGFmdGVyIHRoZSBtYXRjaGluZyBjbG9zaW5nIGJyYWNlOyAwIHdoZXJlIHRoZSB0ZXh0IGVuZHNcbiAqIGJlZm9yZSB0aGF0IGJyYWNlLCB3aGljaCBwZXIgU1BFQ0lGSUNBVElPTi5tZCAzLjEgbWVhbnMgdGhlcmUgaXMgbm8gZXhwcmVzc2lvbiBoZXJlIGF0IGFsbDtcbiAqIGFuZCB0aGUgbmVnYXRlZCBpbmRleCBvZiBhbm90aGVyIFwiJHtcIiBtZXQgb3V0c2lkZSBhIGxpdGVyYWwsIHdoaWNoIHN0YXJ0cyBhbiBleHByZXNzaW9uIG9mIGl0c1xuICogb3duIGFuZCBhYmFuZG9ucyB0aGlzIG9uZS5cbiAqL1xuY29uc3Qgc2NhbkV4cHJlc3Npb24gPSAoYVRleHQsIGFTdGFydCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhVGV4dC5sZW5ndGg7XG5cdGNvbnN0IHN0YWNrID0gW0NPREVdO1xuXHRsZXQgaW5kZXggPSBhU3RhcnQgKyAyO1xuXG5cdHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuXHRcdGNvbnN0IGNoYXIgPSBhVGV4dFtpbmRleF07XG5cdFx0c3dpdGNoIChzdGFja1tzdGFjay5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBDT0RFOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gXCJ7XCIpIHN0YWNrLnB1c2goQ09ERSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwifVwiKSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0aWYgKHN0YWNrLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGluZGV4ICsgMTtcblx0XHRcdFx0fSBlbHNlIGlmIChjaGFyID09PSBcIidcIikgc3RhY2sucHVzaChTSU5HTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gJ1wiJykgc3RhY2sucHVzaChET1VCTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCJgXCIpIHN0YWNrLnB1c2goVEVNUExBVEUpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIiRcIiAmJiBhVGV4dFtpbmRleCArIDFdID09PSBcIntcIikgcmV0dXJuIC1pbmRleDtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCIvXCIgJiYgc3RhcnRzUmVnZXgoYVRleHQsIGluZGV4KSkgc3RhY2sucHVzaChSRUdFWCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBTSU5HTEVfUVVPVEVEOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERPVUJMRV9RVU9URUQ6XG5cdFx0XHRcdGlmIChjaGFyID09PSBcIlxcXFxcIikgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gJ1wiJykgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBURU1QTEFURTpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBcImBcIikgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJFwiICYmIGFUZXh0W2luZGV4ICsgMV0gPT09IFwie1wiKSB7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChDT0RFKTtcblx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBSRUdFWDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIltcIikgc3RhY2sucHVzaChSRUdFWF9DTEFTUyk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiL1wiKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFJFR0VYX0NMQVNTOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiXVwiKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGluZGV4Kys7XG5cdH1cblxuXHRyZXR1cm4gMDtcbn07XG5cbi8qKlxuICogQW5zd2VycyBldmVyeSBleHByZXNzaW9uIG9mIGEgdGV4dCwgaW4gdGhlIG9yZGVyIHRoZXkgc3RhbmQsIG9yIG51bGwgd2hlcmUgdGhlIHRleHQgY2Fycmllc1xuICogbm9uZS4gYHN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIFwiJFwiLCBgZW5kYCB0aGUgaW5kZXggYWZ0ZXIgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2UsIHNvIGFcbiAqIGNhbGxlciByZXBsYWNlcyBieSBwb3NpdGlvbiBhbmQgbmV2ZXIgdG91Y2hlcyBhbiBvY2N1cnJlbmNlIHR3aWNlLlxuICovXG5jb25zdCBzY2FuID0gKGFUZXh0KSA9PiB7XG5cdGxldCBvY2N1cnJlbmNlcyA9IG51bGw7XG5cdGxldCBpbmRleCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCk7XG5cblx0d2hpbGUgKGluZGV4ID49IDApIHtcblx0XHQvLyAzLjI6IGFuIG9kZCBydW4gb2YgYmFja3NsYXNoZXMgZXNjYXBlcyB0aGUgZGVsaW1pdGVyIGl0c2VsZi4gSXQgb3BlbnMgbm90aGluZywgc28gb25seVxuXHRcdC8vIHRob3NlIHR3byBjaGFyYWN0ZXJzIGFyZSB0YWtlbiBvdXQgb2YgdGhlIHRleHQgYW5kIHRoZSBzY2FuIGNhcnJpZXMgb24gYmVoaW5kIHRoZW0gLVxuXHRcdC8vIHdoYXQgd291bGQgaGF2ZSBiZWVuIHRoZSBzdGF0ZW1lbnQgaXMgb3JkaW5hcnkgdGV4dCBhbmQgbWF5IGhvbGQgZXhwcmVzc2lvbnMgb2YgaXRzIG93bi5cblx0XHRpZiAoY291bnRCYWNrc2xhc2hlcyhhVGV4dCwgaW5kZXgpICUgMiA9PT0gMSkge1xuXHRcdFx0aWYgKCFvY2N1cnJlbmNlcykgb2NjdXJyZW5jZXMgPSBbXTtcblx0XHRcdG9jY3VycmVuY2VzLnB1c2goeyBzdGFydDogaW5kZXgsIGVuZDogaW5kZXggKyAyLCBlc2NhcGVkOiB0cnVlLCBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBudWxsIH0pO1xuXHRcdFx0aW5kZXggPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQsIGluZGV4ICsgMik7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCBlbmQgPSBzY2FuRXhwcmVzc2lvbihhVGV4dCwgaW5kZXgpO1xuXHRcdC8vIG5vIG1hdGNoaW5nIGJyYWNlOiB0aGUgdGV4dCBzdGFuZHMgYXMgd3JpdHRlbiwgYW5kIG5vdGhpbmcgYmVoaW5kIGl0IGNhbiBiZSBhblxuXHRcdC8vIGV4cHJlc3Npb24gZWl0aGVyIC0gYSBcIiR7XCIgb3V0c2lkZSBhIGxpdGVyYWwgd291bGQgaGF2ZSByZXN0YXJ0ZWQgdGhlIHNjYW4gaW5zdGVhZFxuXHRcdGlmIChlbmQgPT09IDApIGJyZWFrO1xuXHRcdGlmIChlbmQgPCAwKSB7XG5cdFx0XHRpbmRleCA9IC1lbmQ7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCB7IHNjb3BlLCBzdGF0ZW1lbnQgfSA9IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnQoYVRleHQuc3Vic3RyaW5nKGluZGV4ICsgMiwgZW5kIC0gMSkpO1xuXHRcdGlmICghb2NjdXJyZW5jZXMpIG9jY3VycmVuY2VzID0gW107XG5cdFx0b2NjdXJyZW5jZXMucHVzaCh7IHN0YXJ0OiBpbmRleCwgZW5kOiBlbmQsIGVzY2FwZWQ6IGZhbHNlLCBzY29wZTogc2NvcGUsIHN0YXRlbWVudDogc3RhdGVtZW50IH0pO1xuXHRcdGluZGV4ID0gYVRleHQuaW5kZXhPZihFWFBSRVNTSU9OX1NUQVJULCBlbmQpO1xuXHR9XG5cblx0cmV0dXJuIG9jY3VycmVuY2VzO1xufTtcblxuLyoqXG4gKiBFeHByZXNzaW9uUmVzb2x2ZXJcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyXG4gKiBAdHlwZWRlZiB7RXhwcmVzc2lvblJlc29sdmVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uUmVzb2x2ZXIge1xuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFuRXhlY3V0ZXJOYW1lXG5cdCAqL1xuXHRzdGF0aWMgc2V0IGRlZmF1bHRFeGVjdXRlcihhbkV4ZWN1dGVyKSB7XG5cdFx0aWYgKCBhbkV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpIERFRkFVTFRfRVhFQ1VURVIgPSBhbkV4ZWN1dGVyO1xuXHRcdGVsc2UgREVGQVVMVF9FWEVDVVRFUiA9IGdldEV4ZWN1dGVyVHlwZShhbkV4ZWN1dGVyKTtcblx0XHRjb25zb2xlLmluZm8oYENoYW5nZWQgZGVmYXVsdCBleGVjdXRlciBmb3IgRXhwcmVzc2lvblJlc29sdmVyIWApO1xuXHR9XG5cblx0c3RhdGljIGdldCBkZWZhdWx0RXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRVhFQ1VURVI7XG5cdH1cblxuXHQvKiogQHR5cGUge3N0cmluZ3xudWxsfSAqL1xuXHQjbmFtZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge2Z1bmN0aW9ufG51bGx9ICovXG5cdCNleGVjdXRlciA9IG51bGw7XG5cdC8qKiBAdHlwZSB7UHJveHl8bnVsbH0gKi9cblx0I2NvbnRleHQgPSBudWxsO1xuXHQvKiogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfSAqL1xuXHQjY29udGV4dEhhbmRsZSA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRXhwcmVzc2lvblJlc29sdmVyLlxuXHQgKiBAZGF0ZSAzLzEwLzIwMjQgLSA3OjI3OjU3IFBNXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge3sgY29udGV4dD86IGFueTsgcGFyZW50PzogYW55OyBuYW1lPzogYW55OyBleGVjdXRlcj86IChzdHJpbmd8RXhlY3V0ZXIpOyB9fSBvcHRpb25zXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5jb250ZXh0XSB3aGVyZSBub25lIGlzIHBhc3NlZCwgdGhlIHJlc29sdmVyIGhhcyBubyBjb250ZXh0IG9mIGl0cyBvd24gLSA0LjJcblx0ICogQHBhcmFtIHtFeHByZXNzaW9uUmVzb2x2ZXJ9IFtvcHRpb25zLnBhcmVudD1udWxsXVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtvcHRpb25zLm5hbWU9bnVsbF0gd2hlcmUgbm9uZSBpcyBwYXNzZWQsIG9uZSBpcyBnZW5lcmF0ZWQgLSA1LjFcblx0ICogQHBhcmFtIHsoc3RyaW5nfEV4ZWN1dGVyKX0gW29wdGlvbnMuZXhlY3V0ZXJdIHRoZSByZWdpc3RlcmVkIG5hbWUgb2YgYW4gZXhlY3V0ZXIsIG9yIGFuXG5cdCAqIGBFeGVjdXRlcmAgaW5zdGFuY2UuIEEgbmFtZSB0aGF0IGlzIG5vdCByZWdpc3RlcmVkIHRocm93czsgYW4gaW5zdGFuY2UgbmVlZHMgbm8gcmVnaXN0cmF0aW9uLFxuXHQgKiBiZWNhdXNlIGl0IGFkZHJlc3NlcyB0aGUgZXhlY3V0ZXIgZGlyZWN0bHkuIFdpdGhvdXQgdGhlIG9wdGlvbiB0aGUgcmVzb2x2ZXIgdXNlc1xuXHQgKiBgRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlcmAgLSA0LjIuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih7IGNvbnRleHQsIHBhcmVudCA9IG51bGwsIG5hbWUgPSBudWxsLCBleGVjdXRlciB9ID0ge30pIHtcblx0XHRpZihleGVjdXRlciBpbnN0YW5jZW9mIEV4ZWN1dGVyKSB0aGlzLiNleGVjdXRlciA9ICBleGVjdXRlcjtcblx0XHRlbHNlIGlmICh0eXBlb2YgZXhlY3V0ZXIgPT09IFwic3RyaW5nXCIpIHRoaXMuI2V4ZWN1dGVyID0gZ2V0RXhlY3V0ZXJUeXBlKGV4ZWN1dGVyKTtcblx0XHRlbHNlIGlmKHBhcmVudCAhPSBudWxsKSB0aGlzLiNleGVjdXRlciA9IHBhcmVudC5leGVjdXRlcjtcblx0XHRlbHNlIHRoaXMuI2V4ZWN1dGVyID0gRXhwcmVzc2lvblJlc29sdmVyLmRlZmF1bHRFeGVjdXRlcjtcblx0XHRcblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQgaW5zdGFuY2VvZiBFeHByZXNzaW9uUmVzb2x2ZXIgPyBwYXJlbnQgOiBudWxsO1xuXHRcdHRoaXMuI25hbWUgPSBuYW1lIHx8IGdlbmVyYXRlTmFtZSgpO1x0XHRcblx0XHR0aGlzLiNjb250ZXh0SGFuZGxlID0gbmV3IFJlc29sdmVyQ29udGV4dEhhbmRsZShjb250ZXh0ICwgdGhpcy4jcGFyZW50ID8gdGhpcy4jcGFyZW50LmNvbnRleHRIYW5kbGUgOiBudWxsKTtcblx0XHR0aGlzLiNjb250ZXh0ID0gdGhpcy4jY29udGV4dEhhbmRsZS5wcm94eTtcblx0fVxuXG5cdGdldCBuYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLiNuYW1lO1xuXHR9XG5cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0Z2V0IGNvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHQ7XG5cdH1cblxuXHRnZXQgZXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGVyO1xuXHR9XG5cblx0Z2V0IGNvbnRleHRIYW5kbGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHRIYW5kbGU7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGNoYWluIHBhdGhcblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHRnZXQgY2hhaW4oKSB7XG5cdFx0cmV0dXJuIHRoaXMucGFyZW50ID8gYCR7dGhpcy5wYXJlbnQuY2hhaW59LyR7dGhpcy5uYW1lfWAgOiBgLyR7dGhpcy5uYW1lfWA7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGVmZmVjdGl2ZSBjaGFpbiBwYXRoXG5cdCAqXG5cdCAqIE9ubHkgdGhlIHJlc29sdmVycyB0aGF0IHByb3ZpZGUgYSBjb250ZXh0IGFwcGVhciwgc28gdGhpcyBkZXNjcmliZXMgYSBzdGF0ZSBhbmQgbm90IHRoZVxuXHQgKiBzdHJ1Y3R1cmUgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS4gV2hlcmUgbm9uZSBwcm92aWRlcyBvbmUsIHRoZSBhbnN3ZXIgaXMgdGhlIGVtcHR5IHN0cmluZy5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHRnZXQgZWZmZWN0aXZlQ2hhaW4oKSB7XG5cdFx0Y29uc3QgcGFyZW50RWZmZWN0aXZlQ2hhaW4gPSB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmVmZmVjdGl2ZUNoYWluIDogXCJcIjtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dEhhbmRsZS5wcm92aWRlc0RhdGEgPyBgJHtwYXJlbnRFZmZlY3RpdmVDaGFpbn0vJHt0aGlzLm5hbWV9YCA6IHBhcmVudEVmZmVjdGl2ZUNoYWluO1xuXHR9XG5cblx0LyoqXG5cdCAqIGdldCBjb250ZXh0IGNoYWluXG5cdCAqXG5cdCAqIFRoZSBjb250ZXh0cyBvZiBleGFjdGx5IHRoZSByZXNvbHZlcnMgdGhhdCBwcm92aWRlIG9uZSwgdGhpcyByZXNvbHZlcidzIGZpcnN0IGFuZCB0aGUgcm9vdCdzXG5cdCAqIGxhc3QgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEByZXR1cm5zIHtDb250ZXh0W119XG5cdCAqL1xuXHRnZXQgY29udGV4dENoYWluKCkge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5wcm92aWRlc0RhdGEpIHJlc3VsdC5wdXNoKHJlc29sdmVyLmNvbnRleHQpO1xuXG5cdFx0XHRyZXNvbHZlciA9IHJlc29sdmVyLnBhcmVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSByZXNvbHZlciBhIGNhbGwgYWRkcmVzc2VzOiB0aGUgb25lIHRoZSBmaWx0ZXIgbmFtZXMsIG9yIHRoZSByZXNvbHZlciB0aGUgY2FsbCB3YXMgbWFkZSBvblxuXHQgKiB3aGVyZSBubyBmaWx0ZXIgaXMgZ2l2ZW4uXG5cdCAqXG5cdCAqIEEgZmlsdGVyIHNlbGVjdHMgZXhhY3RseSBvbmUgcmVzb2x2ZXIgYnkgdGhlIHJ1bGUgb2YgNS4zLCBhbmQgYSBmaWx0ZXIgbWF0Y2hpbmcgbm9uZSB0aHJvd3MgLVxuXHQgKiBhIHdyb25nIG5hbWUgaW4gYW4gQVBJIGNhbGwgaXMgYSBtaXN0YWtlIGluIHRoZSBjYWxsaW5nIGNvZGUsIHVubGlrZSBhIHNjb3BlIHByZWZpeCBpbnNpZGUgYW5cblx0ICogZXhwcmVzc2lvbiwgd2hpY2ggYW5zd2VycyB1bmRlZmluZWQgKDUuNCkuIFNlZSBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cblx0ICpcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcn1cblx0ICovXG5cdCNmaW5kUmVzb2x2ZXIoZmlsdGVyKSB7XG5cdFx0aWYgKCFmaWx0ZXIpIHJldHVybiB0aGlzO1xuXG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5uYW1lID09PSBmaWx0ZXIpIHJldHVybiByZXNvbHZlcjtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBFcnJvcihgRmlsdGVyIFwiJHtmaWx0ZXJ9XCIgbWF0Y2hlcyBubyByZXNvbHZlciBvZiB0aGUgY2hhaW4hYCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG5lYXJlc3QgcmVzb2x2ZXIgZnJvbSBoZXJlIHRvIHRoZSByb290IHRoYXQgY2FycmllcyB0aGUga2V5IGl0c2VsZiwgb3IgbnVsbCB3aGVyZSBub25lXG5cdCAqIGNhcnJpZXMgaXQuIFdoYXQgZGVjaWRlcyBpcyB3aGV0aGVyIGEgcmVzb2x2ZXIgcHJvdmlkZXMgdGhlIG5hbWUsIG5vdCB3aGF0IGl0IGhvbGRzIC1cblx0ICogU1BFQ0lGSUNBVElPTi5tZCA1LjIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHJldHVybnMge0V4cHJlc3Npb25SZXNvbHZlcnxudWxsfVxuXHQgKi9cblx0I3Jlc29sdmVyRm9yS2V5KGtleSkge1xuXHRcdGxldCByZXNvbHZlciA9IHRoaXM7XG5cdFx0d2hpbGUgKHJlc29sdmVyKSB7XG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dEhhbmRsZS5oYXNEYXRhKGtleSkpIHJldHVybiByZXNvbHZlcjtcblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIGdldCBkYXRhIGZyb20gY29udGV4dFxuXHQgKlxuXHQgKiBSZWFkcyBhbG9uZyB0aGUgY2hhaW4gZnJvbSB0aGUgYWRkcmVzc2VkIHJlc29sdmVyIGJ5IHRoZSBydWxlIG9mIDUuMi4gV2l0aG91dCBhIGtleSBpdCBhbnN3ZXJzIHRoZVxuXHQgKiB3aG9sZSBjb250ZXh0IG9mIHRoYXQgcmVzb2x2ZXIgLSB0aGUgcHJveHksIHNvIGV2ZXJ5IGFjY2VzcyBvbiBpdCBzdGlsbCBzZWVzIHRoZSBjaGFpbi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGdldERhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcihmaWx0ZXIpO1xuXHRcdGlmICgha2V5KSByZXR1cm4gcmVzb2x2ZXIuY29udGV4dDtcblxuXHRcdHJldHVybiByZXNvbHZlci5jb250ZXh0W2tleV07XG5cdH1cblxuXHQvKipcblx0ICogdXBkYXRlIGRhdGEgYXQgY29udGV4dFxuXHQgKlxuXHQgKiBXaXRob3V0IGEgZmlsdGVyIHRoZSB2YWx1ZSBpcyBjaGFuZ2VkIHdoZXJlIHRoZSBrZXkgbGl2ZXMsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LFxuXHQgKiBhbmQgY3JlYXRlZCBoZXJlIHdoZXJlIG5vIHJlc29sdmVyIGNhcnJpZXMgaXQuIFdpdGggYSBmaWx0ZXIgdGhlIGFkZHJlc3NlZCByZXNvbHZlciBpcyB0aGVcblx0ICogdGFyZ2V0IG91dHJpZ2h0IC0gU1BFQ0lGSUNBVElPTi5tZCA2LjYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxuXHQgKi9cblx0dXBkYXRlRGF0YShrZXksIHZhbHVlLCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcihmaWx0ZXIpO1xuXHRcdGlmICgha2V5KSByZXR1cm47XG5cblx0XHRjb25zdCB0YXJnZXQgPSBmaWx0ZXIgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KGtleSkgfHwgdGhpcztcblx0XHR0YXJnZXQuY29udGV4dFtrZXldID0gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogZGVsZXRlIGRhdGEgZnJvbSBjb250ZXh0XG5cdCAqXG5cdCAqIFJlbW92ZXMgdGhlIGtleSBmcm9tIG9uZSByZXNvbHZlciAtIHRoZSBhZGRyZXNzZWQgb25lIHdpdGggYSBmaWx0ZXIsIGFuZCB3aXRob3V0IG9uZSB0aGUgZmlyc3Rcblx0ICogcmVzb2x2ZXIgY2FycnlpbmcgaXQsIGNvdW50aW5nIGZyb20gaGVyZSB0b3dhcmRzIHRoZSByb290LiBSZW1vdmluZyBpdCB1bmNvdmVycyB0aGUgdmFsdWUgb2Zcblx0ICogdGhlIG5leHQgcmVzb2x2ZXIgdGhhdCBjYXJyaWVzIHRoZSBzYW1lIGtleSAtIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gZmlsdGVyXG5cdCAqL1xuXHRkZWxldGVEYXRhKGtleSwgZmlsdGVyKSB7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLiNmaW5kUmVzb2x2ZXIoZmlsdGVyKTtcblx0XHRpZiAoIWtleSkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gZmlsdGVyID8gcmVzb2x2ZXIgOiB0aGlzLiNyZXNvbHZlckZvcktleShrZXkpO1xuXHRcdGlmICh0YXJnZXQpIGRlbGV0ZSB0YXJnZXQuY29udGV4dFtrZXldO1xuXHR9XG5cblx0LyoqXG5cdCAqIG1lcmdlIGNvbnRleHQgb2JqZWN0XG5cdCAqXG5cdCAqIEEgc2hhbGxvdyBhc3NpZ25tZW50IGludG8gdGhlIGNvbnRleHQgb2YgdGhlIGFkZHJlc3NlZCByZXNvbHZlciwgcmVwbGFjaW5nIHdoYXQgaXMgdGhlcmUgYW5kIGFkZGluZ1xuXHQgKiB3aGF0IGlzIG5vdC4gTm8gc2VhcmNoIGFsb25nIHRoZSBjaGFpbjogYSBtZXJnZWQga2V5IHNoYWRvd3MgdGhlIHJlc29sdmVycyBhYm92ZSBmcm9tIGhlcmUgb24gLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICovXG5cdG1lcmdlQ29udGV4dChjb250ZXh0LCBmaWx0ZXIpIHtcblx0XHR0aGlzLiNmaW5kUmVzb2x2ZXIoZmlsdGVyKS5jb250ZXh0SGFuZGxlLm1lcmdlRGF0YShjb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXNvbHZlZCBhbiBleHByZXNzaW9uIHN0cmluZyB0byBkYXRhXG5cdCAqXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHJldHVybnMge1Byb21pc2U8Kj59XG5cdCAqL1xuXHRhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhRGVmYXVsdCkge1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0dHJ5IHtcblx0XHRcdGFFeHByZXNzaW9uID0gYUV4cHJlc3Npb24udHJpbSgpO1xuXG5cdFx0XHQvLyA0LjM6IHRoZSB3aG9sZSBpbnB1dCBpcyBvbmUgZXhwcmVzc2lvbiwgc28gaXRzIGVuZCBpcyB0aGUgZW5kIG9mIHRoZSBpbnB1dC4gVGhlXG5cdFx0XHQvLyBlc2NhcGluZyBvZiAzLjIgZG9lcyBub3QgYXBwbHkgaGVyZSAtIGl0IGlzIGEgcnVsZSBvZiB0aGUgdGV4dCBmb3JtLCBhbmQgdGhlcmUgaXMgbm9cblx0XHRcdC8vIHN1cnJvdW5kaW5nIHRleHQsIHNvIGEgYmFja3NsYXNoIGJlbG9uZ3MgdG8gdGhlIHN0YXRlbWVudC5cblx0XHRcdGlmIChhRXhwcmVzc2lvbi5zdGFydHNXaXRoKEVYUFJFU1NJT05fU1RBUlQpKSB7XG5cdFx0XHRcdGlmICghYUV4cHJlc3Npb24uZW5kc1dpdGgoXCJ9XCIpKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYEV4cHJlc3Npb24gZG9lcyBub3QgZW5kIHdpdGggXCJ9XCI6ICR7YUV4cHJlc3Npb259YCk7XG5cblx0XHRcdFx0Y29uc3QgeyBzY29wZSwgc3RhdGVtZW50IH0gPSBzcGxpdFNjb3BlQW5kU3RhdGVtZW50KGFFeHByZXNzaW9uLnN1YnN0cmluZygyLCBhRXhwcmVzc2lvbi5sZW5ndGggLSAxKSk7XG5cdFx0XHRcdHJldHVybiBhd2FpdCByZXNvbHZlKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBzdGF0ZW1lbnQsIHNjb3BlLCBkZWZhdWx0VmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyA0LjM6IGFueXRoaW5nIGVsc2UgaXMgYSBzdGF0ZW1lbnQgaW4gZnVsbCwgYW5kIGNhcnJpZXMgbm8gc2NvcGUgcHJlZml4XG5cdFx0XHRyZXR1cm4gYXdhaXQgcmVzb2x2ZSh0aGlzLiNleGVjdXRlciwgdGhpcywgbm9ybWFsaXplKGFFeHByZXNzaW9uKSwgbnVsbCwgZGVmYXVsdFZhbHVlKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvLyA3OiB0aGUgZXJyb3IgaXMgbG9nZ2VkIGFuZCBoYW5kZWQgb24uIHJlc29sdmUgYW5zd2VycyBhIHZhbHVlIG9yIHNheXMgd2h5IGl0IGNhbm5vdCxcblx0XHRcdC8vIGFuZCBhIGRlZmF1bHQgdmFsdWUgY292ZXJzIGEgbWlzc2luZyByZXN1bHQsIG5ldmVyIGFuIGVycm9yLlxuXHRcdFx0d2FybkZhaWxlZFN0YXRlbWVudChhRXhwcmVzc2lvbiwgZSk7XG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiByZXBsYWNlIGFsbCBleHByZXNzaW9ucyBhdCBhIHN0cmluZ1x0ICpcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICovXG5cdGFzeW5jIHJlc29sdmVUZXh0KGFUZXh0LCBhRGVmYXVsdCkge1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT0gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0aWYgKHR5cGVvZiBhVGV4dCAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIGFUZXh0O1xuXG5cdFx0Y29uc3Qgb2NjdXJyZW5jZXMgPSBzY2FuKGFUZXh0KTtcblx0XHRpZiAoIW9jY3VycmVuY2VzKSByZXR1cm4gYVRleHQ7XG5cblx0XHRsZXQgdGV4dCA9IFwiXCI7XG5cdFx0bGV0IHBvc2l0aW9uID0gMDtcblx0XHRmb3IgKGNvbnN0IG9jY3VycmVuY2Ugb2Ygb2NjdXJyZW5jZXMpIHtcblx0XHRcdC8vIDMuMjogYW4gZXNjYXBpbmcgYmFja3NsYXNoIGlzIGNvbnN1bWVkLCBldmVyeXRoaW5nIGVsc2UgaW4gZnJvbnQgb2YgdGhlIGV4cHJlc3Npb25cblx0XHRcdC8vIHN0YW5kcyBhcyB3cml0dGVuXG5cdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhwb3NpdGlvbiwgb2NjdXJyZW5jZS5lc2NhcGVkID8gb2NjdXJyZW5jZS5zdGFydCAtIDEgOiBvY2N1cnJlbmNlLnN0YXJ0KTtcblx0XHRcdHBvc2l0aW9uID0gb2NjdXJyZW5jZS5lbmQ7XG5cblx0XHRcdGlmIChvY2N1cnJlbmNlLmVzY2FwZWQpIHtcblx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGV4dCArPSB0b1RleHQoYXdhaXQgcmVzb2x2ZSh0aGlzLiNleGVjdXRlciwgdGhpcywgb2NjdXJyZW5jZS5zdGF0ZW1lbnQsIG9jY3VycmVuY2Uuc2NvcGUsIGRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHQvLyA3OiBhbiBleHByZXNzaW9uIHdob3NlIHN0YXRlbWVudCBmYWlsZWQgc3RhbmRzIGFzIHdyaXR0ZW4sIGFuZCB0aGUgZGVmYXVsdCB2YWx1ZVxuXHRcdFx0XHQvLyBkb2VzIG5vdCBjb3ZlciBpdC4gVGhlIHJlc3Qgb2YgdGhlIHRleHQga2VlcHMgcmVuZGVyaW5nLlxuXHRcdFx0XHR3YXJuRmFpbGVkU3RhdGVtZW50KG9jY3VycmVuY2Uuc3RhdGVtZW50LCBlKTtcblx0XHRcdFx0dGV4dCArPSBhVGV4dC5zdWJzdHJpbmcob2NjdXJyZW5jZS5zdGFydCwgb2NjdXJyZW5jZS5lbmQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0ICsgYVRleHQuc3Vic3RyaW5nKHBvc2l0aW9uKTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXNvbHZlIGFuIGV4cHJlc3Npb24gc3RyaW5nIHRvIGRhdGFcblx0ICpcblx0ICogVGFrZXMgdGhlIGFyZ3VtZW50cyBwb3NpdGlvbmFsbHksIG9yIG9uZSBjb25maWd1cmF0aW9uIG9iamVjdFxuXHQgKiBgeyBleHByZXNzaW9uLCBjb250ZXh0LCBkZWZhdWx0VmFsdWUsIHRpbWVvdXQgfWAgLSBTUEVDSUZJQ0FUSU9OLm1kIDQuMS4gQSBmaXJzdCBhcmd1bWVudFxuXHQgKiB0aGF0IGlzIG5laXRoZXIgYSBzdHJpbmcgbm9yIGFuIG9iamVjdCByZWplY3RzIHdpdGggYSBgVHlwZUVycm9yYC5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd8eyBleHByZXNzaW9uOiBzdHJpbmcsIGNvbnRleHQ/OiBvYmplY3QsIGRlZmF1bHRWYWx1ZT86ICosIHRpbWVvdXQ/OiBudW1iZXIgfX0gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IGFUaW1lb3V0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFDb250ZXh0LCBhRGVmYXVsdCwgYVRpbWVvdXQpIHtcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGlzQ29uZmlndXJhdGlvbihhcmd1bWVudHNbMF0pKSB7XG5cdFx0XHRjb25zdCB7IGV4cHJlc3Npb24sIGNvbnRleHQsIHRpbWVvdXQgfSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdHJldHVybiBFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZShleHByZXNzaW9uLCBjb250ZXh0LCBkZWZhdWx0T2YoYXJndW1lbnRzWzBdKSwgdGltZW91dCk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgYUV4cHJlc3Npb24gIT09IFwic3RyaW5nXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZSB0YWtlcyBhIHN0cmluZyBvciBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IVwiKTtcblxuXHRcdGNvbnN0IHJlc29sdmVyID0gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQ6IGFDb250ZXh0IH0pO1xuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHRpZiAodHlwZW9mIGFUaW1lb3V0ID09PSBcIm51bWJlclwiICYmIGFUaW1lb3V0ID4gMClcblx0XHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRyZXNvbHZlKHJlc29sdmVyLnJlc29sdmUoYUV4cHJlc3Npb24sIGRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHR9LCBhVGltZW91dCk7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiByZXNvbHZlci5yZXNvbHZlKGFFeHByZXNzaW9uLCBkZWZhdWx0VmFsdWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlcGxhY2UgZXhwcmVzc2lvbiBhdCB0ZXh0XG5cdCAqXG5cdCAqIFRha2VzIHRoZSBhcmd1bWVudHMgcG9zaXRpb25hbGx5LCBvciBvbmUgY29uZmlndXJhdGlvbiBvYmplY3Rcblx0ICogYHsgdGV4dCwgY29udGV4dCwgZGVmYXVsdFZhbHVlLCB0aW1lb3V0IH1gIC0gU1BFQ0lGSUNBVElPTi5tZCA0LjEuIEEgZmlyc3QgYXJndW1lbnQgdGhhdCBpc1xuXHQgKiBuZWl0aGVyIGEgc3RyaW5nIG5vciBhbiBvYmplY3QgcmVqZWN0cyB3aXRoIGEgYFR5cGVFcnJvcmAuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfHsgdGV4dDogc3RyaW5nLCBjb250ZXh0Pzogb2JqZWN0LCBkZWZhdWx0VmFsdWU/OiAqLCB0aW1lb3V0PzogbnVtYmVyIH19IGFUZXh0XG5cdCAqIEBwYXJhbSB7P29iamVjdH0gYUNvbnRleHRcblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBhVGltZW91dFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICovXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlVGV4dChhVGV4dCwgYUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCkge1x0XHRcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGlzQ29uZmlndXJhdGlvbihhcmd1bWVudHNbMF0pKSB7XG5cdFx0XHRjb25zdCB7IHRleHQsIGNvbnRleHQsIHRpbWVvdXQgfSA9IGFyZ3VtZW50c1swXTtcblx0XHRcdHJldHVybiBFeHByZXNzaW9uUmVzb2x2ZXIucmVzb2x2ZVRleHQodGV4dCwgY29udGV4dCwgZGVmYXVsdE9mKGFyZ3VtZW50c1swXSksIHRpbWVvdXQpO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRXhwcmVzc2lvblJlc29sdmVyLnJlc29sdmVUZXh0IHRha2VzIGEgc3RyaW5nIG9yIGEgY29uZmlndXJhdGlvbiBvYmplY3QhXCIpO1xuXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dDogYUNvbnRleHQgfSk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdGlmICh0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzb2x2ZXIucmVzb2x2ZVRleHQoYVRleHQsIGRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHR9LCBhVGltZW91dCk7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiByZXNvbHZlci5yZXNvbHZlVGV4dChhVGV4dCwgZGVmYXVsdFZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBidWlsZCBhIHJlc29sdmVyIG92ZXIgYSBmaWx0ZXJlZCBjb3B5IG9mIHRoZSBjb250ZXh0XG5cdCAqXG5cdCAqIFRoZSBmaWx0ZXIgaXMgYXBwbGllZCB0byB0aGUgY29udGV4dCBvbmx5LCBuZXZlciB0byB0aGUgZ2xvYmFscywgc28gdGhpcyBpcyBhIHdheSB0byBoYW5kXG5cdCAqIG92ZXIgYSBjbGVhbmVkIGNvbnRleHQgYW5kIG5vdCBhIHNhbmRib3guXG5cdCAqXG5cdCAqIGBvcHRpb25gIGNhcnJpZXMgdGhlIGZpbHRlcidzIG93biBgZGVlcGAgdG9nZXRoZXIgd2l0aCB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBgbmFtZWAsXG5cdCAqIGBwYXJlbnRgIGFuZCBgZXhlY3V0ZXJgLCB3aGljaCBhcmUgaGFuZGVkIG9uIGFzIHRoZXkgYXJlLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhcmcgdGhlIGZpbHRlciBhcmd1bWVudHMsIHBsdXMgdGhlIHdob2xlIGNvbnN0cnVjdG9yIG9wdGlvbiBzZXRcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZy5jb250ZXh0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGFyZy5wcm9wRmlsdGVyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbYXJnLm9wdGlvbj17IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfV1cblx0ICogQHBhcmFtIHtib29sZWFufSBbYXJnLm9wdGlvbi5kZWVwPXRydWVdXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbYXJnLm9wdGlvbi5uYW1lPW51bGxdXG5cdCAqIEBwYXJhbSB7RXhwcmVzc2lvblJlc29sdmVyfSBbYXJnLm9wdGlvbi5wYXJlbnQ9bnVsbF1cblx0ICogQHBhcmFtIHtzdHJpbmd9IFthcmcub3B0aW9uLmV4ZWN1dGVyPW51bGxdXG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XG5cdCAqL1xuXHRzdGF0aWMgYnVpbGRTZWN1cmUoeyBjb250ZXh0LCBwcm9wRmlsdGVyLCBvcHRpb24gPSB7IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfSB9KSB7XG5cdFx0Y29uc3QgeyBkZWVwID0gdHJ1ZSwgbmFtZSwgcGFyZW50LCBleGVjdXRlciB9ID0gb3B0aW9uO1xuXHRcdGNvbnRleHQgPSBPYmplY3RVdGlscy5maWx0ZXIoY29udGV4dCwgcHJvcEZpbHRlciwge2RlZXB9KTtcblx0XHRyZXR1cm4gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQsIG5hbWUsIHBhcmVudCwgZXhlY3V0ZXIgfSk7XG5cdH1cbn1cblxuIiwiaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5pbXBvcnQgeyBpc051bGxPclVuZGVmaW5lZCB9IGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qc1wiO1xuXG4vKipcbiAqIFRoZSBkZXNjcmlwdG9yIGEgcHJvcGVydHkgaGFzIHdoZXJlIGl0IGlzIGRlZmluZWQgLSBvd24gb3IgYW55d2hlcmUgdXAgdGhlIHByb3RvdHlwZSBjaGFpbiBvZlxuICogdGhlIG9iamVjdCBob2xkaW5nIGl0LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhXG4gKiBAcGFyYW0ge3N0cmluZ3xzeW1ib2x9IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7UHJvcGVydHlEZXNjcmlwdG9yfG51bGx9XG4gKi9cbmNvbnN0IGZpbmRQcm9wZXJ0eURlc2NyaXB0b3IgPSAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0bGV0IHR5cGUgPSBkYXRhO1xuXHR3aGlsZSAoIWlzTnVsbE9yVW5kZWZpbmVkKHR5cGUpKSB7XG5cdFx0Y29uc3QgZGVzY3JpcHRvciA9IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHR5cGUsIHByb3BlcnR5KTtcblx0XHRpZiAoZGVzY3JpcHRvcikgcmV0dXJuIGRlc2NyaXB0b3I7XG5cdFx0dHlwZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodHlwZSk7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogUHJvcGVydHkgY2FjaGUgZm9yIGEgY29udGV4dCB0aGF0IGlzIHRoZSBnbG9iYWwgb2JqZWN0IGl0c2VsZi5cbiAqXG4gKiBJdCBhbnN3ZXJzIGxpa2UgdGhlIE1hcCBpdCByZXBsYWNlczogZXZlcnkgbmFtZSBpcyBwcmVzZW50LCBhbmQgdGhlIHZhbHVlIGlzIHRoZSBoYW5kbGVcbiAqIGhvbGRpbmcgaXQgLSBuZXZlciB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5LiBUaGF0IGlzIHRoZSBjb250cmFjdCBvZiAjZ2V0UHJvcGVydHlEZWYsXG4gKiB3aG9zZSBjYWxsZXIgcmVhZHMgdGhlIHByb3BlcnR5IG9mZiB0aGUgaGFuZGxlIGl0IGdldHMgYmFjay5cbiAqXG4gKiBCZWNhdXNlIGV2ZXJ5IG5hbWUgaXMgcHJlc2VudCwgc3VjaCBhIHJlc29sdmVyIGFuc3dlcnMgZXZlcnkgbG9va3VwIGFuZCBub3RoaW5nIGJlbG93IGl0IGlzXG4gKiByZWFjaGVkLCBhbmQgb3duS2V5cyByZXBvcnRzIGV2ZXJ5IG93biBrZXkgb2YgdGhlIGdsb2JhbCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtSZXNvbHZlckNvbnRleHRIYW5kbGV9IGhhbmRsZVxuICovXG5jb25zdCBjcmVhdGVHbG9iYWxDYWNoZVdyYXBwZXIgPSAoaGFuZGxlKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0aGFzOiAocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0sXG5cdFx0Z2V0OiAocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBoYW5kbGU7XG5cdFx0fSxcblx0XHRzZXQ6IChwcm9wZXJ0eSwgdmFsdWUpID0+IHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdGRlbGV0ZTogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRrZXlzOiAoKSA9PiB7XG5cdFx0XHQvLyBObyBuYW1lIG9mIGl0cyBvd24uIGBoYXNgIGFscmVhZHkgYW5zd2VycyBldmVyeSBsb29rdXAsIHNvIGEgbmFtZSBvZiB0aGUgZ2xvYmFsIG9iamVjdFxuXHRcdFx0Ly8gaXMgZm91bmQgZnJvbSBhbnl3aGVyZSBiZWxvdzsgbGlzdGluZyBpdCBhcyB3ZWxsIHdvdWxkIG9ubHkgaGFuZCBpdCB0byBhbiBleGVjdXRlciB0aGF0XG5cdFx0XHQvLyB0dXJucyBhIG5hbWUgaW50byBjb2RlLCB3aGljaCB0aGVuIGZhaWxzIG92ZXIgbmFtZXMgaXQgbmV2ZXIgbmVlZGVkIC0gdGhlIGluZGV4IFwiMFwiIG9mXG5cdFx0XHQvLyBhIGZyYW1lLCBhIHN5bWJvbCBhbm90aGVyIGxpYnJhcnkgcGxhbnRlZC4gQSBzdGF0ZW1lbnQgcmVhY2hlcyBhIGdsb2JhbCB0aHJvdWdoIHRoZVxuXHRcdFx0Ly8gb3JkaW5hcnkgc2NvcGUgY2hhaW4gYW55d2F5IChTUEVDSUZJQ0FUSU9OLm1kIDYuNCwgOS44KS5cblx0XHRcdHJldHVybiBbXTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqXG4gKiBDb250ZXh0IG9iamVjdCB0byBoYW5kbGUgZGF0YSBhY2Nlc3NcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmVzb2x2ZXJDb250ZXh0SGFuZGxlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc29sdmVyQ29udGV4dEhhbmRsZSB7XG5cdC8qKiBAdHlwZSB7UHJveHl8bnVsbH0gKi9cblx0I3Byb3h5ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH0gKi9cblx0I3BhcmVudCA9IG51bGw7XG5cdC8qKiBAdHlwZSB7b2JqZWN0fG51bGx9ICovXG5cdCNkYXRhID0gbnVsbDtcblx0LyoqIEB0eXBlIHtNYXA8c3RyaW5nfHN5bWJvbCxSZXNvbHZlckNvbnRleHRIYW5kbGU+fG51bGx9ICovXG5cdCNjYWNoZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I3Byb3ZpZGVzRGF0YSA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIENvbnRleHQuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dCB3aGVyZSBub25lIGlzIHBhc3NlZCwgdGhlIGhhbmRsZSBob2xkcyBubyBvYmplY3QgYXQgYWxsIGFuZCBjYXJyaWVzIG5vXG5cdCAqIG5hbWUsIG5vdCBldmVuIG9uZSBvZiBPYmplY3QucHJvdG90eXBlIC0gU1BFQ0lGSUNBVElPTi5tZCA2LjMuIEl0IGdldHMgYW4gb2JqZWN0IG9uIHRoZSBmaXJzdFxuXHQgKiB3cml0ZS5cblx0ICogQHBhcmFtIHtSZXNvbHZlckNvbnRleHRIYW5kbGV9IHBhcmVudFxuXHQgKi9cblx0Y29uc3RydWN0b3IoY29udGV4dCwgcGFyZW50KSB7XG5cdFx0dGhpcy4jZGF0YSA9IGlzTnVsbE9yVW5kZWZpbmVkKGNvbnRleHQpID8gbnVsbCA6IGNvbnRleHQgfHwge307XG5cdFx0dGhpcy4jcGFyZW50ID0gcGFyZW50ID8gcGFyZW50IDogbnVsbDtcblx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSAhaXNOdWxsT3JVbmRlZmluZWQoY29udGV4dCk7XG5cblx0XHR0aGlzLiNjYWNoZSA9IHRoaXMuI2luaXRQcm9wZXJ0eUNhY2hlKCk7XG5cblx0XHRpZiAoR0xPQkFMID09PSB0aGlzLiNkYXRhKVxuXHRcdFx0dGhpcy4jcHJveHkgPSB0aGlzLiNkYXRhO1xuXHRcdGVsc2Uge1xuXHRcdFx0Ly8gVGhlIHByb3h5IGFuc3dlcnMgZm9yIHRoZSB3aG9sZSBjaGFpbiwgd2hpY2ggaXMgbW9yZSB0aGFuIHRoZSBvYmplY3QgaGFuZGVkIHRvIHRoaXNcblx0XHRcdC8vIGxpbmsgaG9sZHMuIEEgcHJveHkgbWF5IG5vdCBzcGVhayB0aGF0IGZyZWVseSBmb3IgYSB0YXJnZXQgdGhhdCBndWFyYW50ZWVzIGFueXRoaW5nXG5cdFx0XHQvLyBhYm91dCBpdHMgb3duIGtleXMgLSBhIGZyb3plbiBvciBzZWFsZWQgY29udGV4dCBpcyB3aGVyZSB0aGF0IGVuZHMgaW4gYSBUeXBlRXJyb3IgLVxuXHRcdFx0Ly8gc28gaXQgZ2V0cyBhbiBlbXB0eSB0YXJnZXQgb2YgaXRzIG93bi4gTm8gdHJhcCByZWFkcyBpdDsgZXZlcnkgb25lIG9mIHRoZW0gd29ya3Mgb25cblx0XHRcdC8vICNkYXRhIGFuZCAjY2FjaGUuXG5cdFx0XHR0aGlzLiNwcm94eSA9IG5ldyBQcm94eSh7fSwge1xuXHRcdFx0XHRoYXM6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJoYXMgcHJvcGVydHk6XCIsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy4jZ2V0UHJvcGVydHlEZWYocHJvcGVydHkpICE9IG51bGw7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldDogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcImdldCBwcm9wZXJ0eTpcIiwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdGNvbnN0IHByb3h5ID0gdGhpcy4jZ2V0UHJvcGVydHlEZWYocHJvcGVydHkpO1xuXHRcdFx0XHRcdHJldHVybiBwcm94eSA/IHByb3h5LiNkYXRhW3Byb3BlcnR5XSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0OiAoZGF0YSwgcHJvcGVydHksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInNldCBwcm9wZXJ0eTpcIiwgcHJvcGVydHksIFwiPVwiLCB2YWx1ZSk7XG5cdFx0XHRcdFx0dGhpcy4jZGF0YSA/Pz0ge307XG5cdFx0XHRcdFx0dGhpcy4jZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcblx0XHRcdFx0XHR0aGlzLiNjYWNoZS5zZXQocHJvcGVydHksIHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMuI3Byb3ZpZGVzRGF0YSA9IHRydWU7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRlbGV0ZVByb3BlcnR5OiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eURlZiA9IHRoaXMuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5RGVmKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy4jZGF0YVtwcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHR0aGlzLiNjYWNoZS5kZWxldGUocHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBwcm94eSA9IHRoaXMuI2dldFByb3BlcnR5RGVmKHByb3BlcnR5KTtcblx0XHRcdFx0XHRpZiAoIXByb3h5KSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0XHRcdFx0Ly8gUmVhZCB0aHJvdWdoIGEgZ2V0dGVyIHJhdGhlciB0aGFuIHVwIGZyb250LCBzbyBlbnVtZXJhdGluZyBhIGNvbnRleHQgZG9lcyBub3Rcblx0XHRcdFx0XHQvLyBldmFsdWF0ZSB3aGF0IG5vYm9keSBhc2tlZCBmb3IsIGFuZCBzbyBhIHZhbHVlIHN0YXlzIGxpdmUgKDYuMikuIEVudW1lcmFiaWxpdHlcblx0XHRcdFx0XHQvLyBpcyB0YWtlbiBmcm9tIHdoZXJlIHRoZSBwcm9wZXJ0eSBpcyBkZWZpbmVkIC0gdGhhdCBpcyB3aGF0IGtlZXBzIHRoZSBtZW1iZXJzXG5cdFx0XHRcdFx0Ly8gb2YgT2JqZWN0LnByb3RvdHlwZSBvdXQgb2YgT2JqZWN0LmtleXMgLSB3aGlsZSBjb25maWd1cmFibGUgaGFzIHRvIGJlIHRydWU6XG5cdFx0XHRcdFx0Ly8gYSBwcm94eSBtYXkgbm90IGNsYWltIGEgZml4ZWQgcHJvcGVydHkgaXRzIHRhcmdldCBkb2VzIG5vdCBoYXZlLlxuXHRcdFx0XHRcdGNvbnN0IGRlc2NyaXB0b3IgPSBmaW5kUHJvcGVydHlEZXNjcmlwdG9yKHByb3h5LiNkYXRhLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGdldDogKCkgPT4gcHJveHkuI2RhdGFbcHJvcGVydHldLFxuXHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZGVzY3JpcHRvciA/IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA6IHRydWUsXG5cdFx0XHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvd25LZXlzOiAoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJvd25LZXlzXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBTZXQoKTtcblx0XHRcdFx0XHRsZXQgaGFuZGxlID0gdGhpcztcblx0XHRcdFx0XHR3aGlsZSAoaGFuZGxlKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBrZXkgb2YgaGFuZGxlLiNjYWNoZS5rZXlzKCkpIHtcblx0XHRcdFx0XHRcdFx0cmVzdWx0LmFkZChrZXkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aGFuZGxlID0gaGFuZGxlLiNwYXJlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBBcnJheS5mcm9tKHJlc3VsdCk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Ly9AVE9ETyBuZWVkIHRvIHN1cHBvcnQgdGhlIG90aGVyIHByb3h5IGFjdGlvbnNcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge1Byb3h5fVxuXHQgKi9cblx0Z2V0IHByb3h5KCkge1xuXHRcdHJldHVybiB0aGlzLiNwcm94eTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxuXHQgKi9cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhpcyBoYW5kbGUgcHJvdmlkZXMgdGhlIG5hbWUgaXRzZWxmLiBFdmVyeSBuYW1lIG9mIGl0cyBvd24gY29udGV4dCBjb3VudHMsIHRoZSBvbmVzXG5cdCAqIGluaGVyaXRlZCB0aHJvdWdoIHRoZSBwcm90b3R5cGUgY2hhaW4gaW5jbHVkZWQgKDUuMik7IGEgaGFuZGxlIG92ZXIgdGhlIGdsb2JhbCBvYmplY3Rcblx0ICogcHJvdmlkZXMgZXZlcnkgbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdGhhc0RhdGEoa2V5KSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NhY2hlLmhhcyhrZXkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhpcyBoYW5kbGUgcHJvdmlkZXMgYSBjb250ZXh0OiBvbmUgd2FzIGhhbmRlZCB0byB0aGUgY29uc3RydWN0b3IsIG9yIGEgdmFsdWUgaGFzIGJlZW5cblx0ICogd3JpdHRlbiBzaW5jZS4gV2hhdCB0aGUgZGF0YSBob2xkcyBkZWNpZGVzIG5vdGhpbmcgLSBTUEVDSUZJQ0FUSU9OLm1kIDUuNS5cblx0ICpcblx0ICogQHJlYWRvbmx5XG5cdCAqIEB0eXBlIHtib29sZWFufVxuXHQgKi9cblx0Z2V0IHByb3ZpZGVzRGF0YSgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcHJvdmlkZXNEYXRhO1xuXHR9XG5cblx0dXBkYXRlRGF0YShkYXRhKSB7XG5cdFx0dGhpcy4jZGF0YSA9IGlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpID8gbnVsbCA6IGRhdGEgfHwge307XG5cdFx0dGhpcy4jcHJvdmlkZXNEYXRhID0gIWlzTnVsbE9yVW5kZWZpbmVkKGRhdGEpO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblx0fVxuXG5cdG1lcmdlRGF0YShkYXRhKSB7XG5cdFx0aWYgKHR5cGVvZiBkYXRhICE9PSBcIm9iamVjdFwiIHx8IGRhdGEgPT0gbnVsbCkgcmV0dXJuO1xuXHRcdHRoaXMuI2RhdGEgPz89IHt9O1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcy4jZGF0YSwgZGF0YSk7XG5cdFx0dGhpcy4jcHJvdmlkZXNEYXRhID0gdHJ1ZTtcblx0XHR0aGlzLiNjYWNoZSA9IHRoaXMuI2luaXRQcm9wZXJ0eUNhY2hlKCk7XG5cdH1cblxuXHRyZXNldENhY2hlKCkge1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7TWFwPHN0cmluZyxQcm9wZXJ0eURlZmluaXRpb24+fVxuXHQgKi9cblx0I2luaXRQcm9wZXJ0eUNhY2hlKCkge1xuXHRcdGNvbnN0IGRhdGEgPSB0aGlzLiNkYXRhO1xuXHRcdGlmIChHTE9CQUwgPT09IGRhdGEpIFxuXHRcdFx0cmV0dXJuIGNyZWF0ZUdsb2JhbENhY2hlV3JhcHBlcih0aGlzKTtcblxuXHRcdC8vIGV2ZXJ5IGtleSBKYXZhU2NyaXB0IHNheXMgdGhlIG9iamVjdCBjYXJyaWVzLCBub3RoaW5nIGZpbHRlcmVkIC0gd2hpY2ggb2YgdGhlbSBhbiBleGVjdXRlclxuXHRcdC8vIGNhbiBwdXQgaW50byBpdHMgY29kZSBpcyB0aGUgZXhlY3V0ZXIncyBidXNpbmVzcyAoREVDSVNJT05TLm1kIDIwMjYtMDgtMzAsIDIwMjYtMDktMjIpXG5cdFx0Y29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XG5cdFx0bGV0IHR5cGUgPSBkYXRhO1xuXHRcdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRcdGZvciAobGV0IG5hbWUgb2YgUmVmbGVjdC5vd25LZXlzKHR5cGUpKSBjYWNoZS5zZXQobmFtZSwgdGhpcyk7XG5cdFx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FjaGU7XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG5cdCAqIEByZXR1cm5zIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH1cblx0ICovXG5cdCNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSkge1xuXHRcdGlmICh0aGlzLiNjYWNoZS5oYXMocHJvcGVydHkpKSByZXR1cm4gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRsZXQgcGFyZW50ID0gdGhpcy4jcGFyZW50O1xuXHRcdHdoaWxlIChwYXJlbnQpIHtcblx0XHRcdGlmIChwYXJlbnQuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiBwYXJlbnQuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQuI3BhcmVudDtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cbiIsImltcG9ydCB7IHJlZ2lzdHJhdGUgfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcblxubGV0IERFQlVHID0gZmFsc2U7XG5leHBvcnQgY29uc3QgRVhFQ1VURVJOQU1FID0gXCJjb250ZXh0LWRlY29uc3RydWN0aW9uLWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSh7IHNpemU6IDUwMDAgfSk7XG5cbi8qKlxuICogVGhlIG5hbWVzIHRoYXQgbWFkZSB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIGZhaWwgdG8gY29tcGlsZSwgYXNrZWQgb2YgSmF2YVNjcmlwdCBpdHNlbGYgcmF0aGVyXG4gKiB0aGFuIG9mIGEgbGlzdCBrZXB0IGhlcmU6IGEgbmFtZSBpcyB1c2FibGUgd2hlbiBpdCBjYW4gc3RhbmQgaW4gYSBkZXN0cnVjdHVyaW5nIHBhdHRlcm4uXG4gKlxuICogT25seSBldmVyIGNhbGxlZCBvbiB0aGUgZmFpbHVyZSBwYXRoLCBzbyB0aGUgY29zdCBvZiBjb21waWxpbmcgb25lIHBhdHRlcm4gcGVyIG5hbWUgaXMgcGFpZCBieSBhXG4gKiBjb250ZXh0IHRoYXQgaXMgYnJva2VuIGZvciB0aGlzIGV4ZWN1dGVyIGFueXdheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PHN0cmluZ3xzeW1ib2w+fSB0aGVOYW1lc1xuICogQHJldHVybnMge0FycmF5PHN0cmluZz59XG4gKi9cbmNvbnN0IHVudXNhYmxlTmFtZXMgPSAodGhlTmFtZXMpID0+XG5cdHRoZU5hbWVzXG5cdFx0LmZpbHRlcigobmFtZSkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBuYW1lID09PSBcInN5bWJvbFwiKSByZXR1cm4gdHJ1ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5ldyBGdW5jdGlvbihgeyR7bmFtZX19YCwgXCJcIik7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQubWFwKFN0cmluZyk7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHNldERlYnVnID0gKHZhbHVlKSA9PiB7XG5cdERFQlVHID0gdmFsdWU7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9Db2RlQ2FjaGUuanMnKS5Db2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcbn07XG5cbmNvbnN0IGdldFByb3BlcnR5TmFtZXMgPSAoYUNvbnRleHQpID0+IHtcblx0aWYgKEdMT0JBTCA9PT0gYUNvbnRleHQpIHJldHVybiBbXTtcblx0Y29uc3QgcmVzdWx0ID0gUmVmbGVjdC5vd25LZXlzKGFDb250ZXh0KTtcblxuXHRpZiAocmVzdWx0Lmxlbmd0aCA+IDEwKVxuXHRcdGNvbnNvbGUud2Fybihcblx0XHRcdGBIaWdoIGNvdW50IG9mIHByb3BlcnRpZXMgYXQgZmlyc3QgbGV2ZWwsIGNhbiBiZSBkZWNyZWFzZSB0aGUgcGVyZm9ybWVuY2UhIGNvdW50OiAke3Jlc3VsdC5sZW5ndGh9YCxcblx0XHQpO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50LCBjb250ZXh0UHJvcGVydGllcykgPT4ge1xuXHQvLyBBIHN5bWJvbCBoYXMgdG8gYmUgd3JpdHRlbiBvdXQgcmF0aGVyIHRoYW4gam9pbmVkIC0gYGpvaW5gIGFsb25lIHJhaXNlcyBhIFR5cGVFcnJvciB0aGF0IHNheXNcblx0Ly8gbm90aGluZyBhYm91dCB0aGUgY29udGV4dCBpdCBjYW1lIGZyb20uIFdyaXR0ZW4gb3V0IGl0IHJlYWNoZXMgdGhlIHBhdHRlcm4sIHdoZXJlIGl0IGZhaWxzIHRvXG5cdC8vIGNvbXBpbGUgbGlrZSBhbnkgb3RoZXIgbmFtZSB0aGF0IGlzIG5vIGlkZW50aWZpZXIsIGFuZCBnZW5lcmF0ZSgpIG5hbWVzIGl0LlxuXHRjb25zdCBwcm9wZXJ0eU5hbWVzID0gY29udGV4dFByb3BlcnRpZXMubWFwKFN0cmluZykuam9pbihcIixcIik7XG5cdGNvbnN0IGNhY2hlS2V5ID0gYCR7YVN0YXRlbWVudC5sZW5ndGh9Ojoke3Byb3BlcnR5TmFtZXN9Ojoke2FTdGF0ZW1lbnR9YDtcblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGNhY2hlS2V5KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQsIHByb3BlcnR5TmFtZXMsIGNvbnRleHRQcm9wZXJ0aWVzKTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoY2FjaGVLZXksIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbi8qKlxuICogVGhlIGdlbmVyYXRlZCBmdW5jdGlvbiBkZXN0cnVjdHVyZXMgdGhlIGNvbnRleHQgaW4gaXRzIHBhcmFtZXRlciBsaXN0IGFuZCBydW5zIHRoZSBzdGF0ZW1lbnQgb3ZlclxuICogdGhlIGxvY2FsIGJpbmRpbmdzIHRoYXQgcHJvZHVjZXMuXG4gKlxuICogKipOb3RoaW5nIGlzIGNhcnJpZWQgYmFjay4qKiBBIHN0YXRlbWVudCB0aGF0IGFzc2lnbnMgdG8gYSBjb250ZXh0IG5hbWUgd3JpdGVzIGludG8gYSBsb2NhbFxuICogYmluZGluZywgYW5kIHRoYXQgYmluZGluZyBpcyBnb25lIHdoZW4gdGhlIGZ1bmN0aW9uIHJldHVybnMgLSBzbyBhIHdyaXRlIGlzIG5vdCByZWFkYWJsZVxuICogYWZ0ZXJ3YXJkcyAoYGNvbnRleHQtd3JpdGVgLCBTUEVDSUZJQ0FUSU9OLm1kIDkuNykuIFRoYXQgaXMgYSBkZWNpc2lvbiByYXRoZXIgdGhhbiBhIGdhcDogdGhlXG4gKiB3cml0ZS1iYWNrIHRoaXMgZXhlY3V0ZXIgY2FycmllZCBiZXR3ZWVuIDIwMjYtMDktMDcgYW5kIDIwMjYtMDktMjAgY29zdCBhIGZhY3RvciBvZiBlbGV2ZW4gb24gYVxuICogY2FjaGUgbWlzcywgYmVjYXVzZSBpdCBuZWVkcyBldmVyeSBjb250ZXh0IG5hbWUgZGVjbGFyZWQgaW4gdGhlIGJvZHkgaW5zdGVhZCBvZiBsaXN0ZWQgaW4gdGhlXG4gKiBwYXJhbWV0ZXIgbGlzdC4gU3BlZWQgaXMgd2hhdCB0aGlzIGV4ZWN1dGVyIGlzIGZvciwgYW5kIGEgY29uc3VtZXIgd2hvIG5lZWRzIGEgd3JpdGUgdG8gcGVyc2lzdFxuICogcGlja3MgYGNvbnRleHQtb2JqZWN0LWV4ZWN1dGVyYC4gU2VlIGBERUNJU0lPTlMubWRgLCAyMDI2LTA5LTIwLlxuICpcbiAqIFdoYXQgc3RpbGwgcmVhY2hlcyB0aGUgY29udGV4dCBpcyBhICoqbXV0YXRpb24qKjogYGhvbGRlci5uYW1lID0gXCJhZnRlclwiYCBjaGFuZ2VzIGFuIG9iamVjdCB0aGVcbiAqIGJpbmRpbmcgYW5kIHRoZSBjb250ZXh0IGJvdGggcG9pbnQgYXQsIGFuZCBuZWVkcyBub3RoaW5nIGNhcnJpZWQgYmFjay5cbiAqXG4gKiBUaGUgY29udGV4dCBpcyBkZXN0cnVjdHVyZWQgaW4gdGhlIHBhcmFtZXRlciBsaXN0IHJhdGhlciB0aGFuIGRlY2xhcmVkIGluIHRoZSBib2R5IHNvIHRoYXQgdGhlXG4gKiBnZW5lcmF0ZWQgc291cmNlIHN0YXlzIG9uZSBsaW5lIHBlciBzdGF0ZW1lbnQgaW5zdGVhZCBvZiBvbmUgbGluZSBwZXIgY29udGV4dCBuYW1lIC0gYG5ldyBGdW5jdGlvbmBcbiAqIHBhcnNlcyB0aGF0IHNvdXJjZSBvbiBldmVyeSBjYWNoZSBtaXNzLCBhbmQgaXRzIGxlbmd0aCBpcyB3aGF0IHRoZSBtaXNzIGNvc3RzLiBJdCBhbHNvIGRlY2xhcmVzIG5vXG4gKiBuYW1lIG9mIGl0cyBvd246IHRoZSBzdGF0ZW1lbnQgY2FuIHRoZXJlZm9yZSBuZXZlciBjb2xsaWRlIHdpdGggYSBiaW5kaW5nIG9mIHRoaXMgZnVuY3Rpb24sIHdoaWNoXG4gKiBpcyB3aGF0IHRoZSByYW5kb20gc3VmZml4IHJlbW92ZWQgb24gMjAyNi0wOS0yMCB1c2VkIHRvIGd1YXJkLlxuICpcbiAqICoqTm90aGluZyBpcyBmaWx0ZXJlZCBvdXQgb2YgdGhlIHBhdHRlcm4uKiogRXZlcnkgbmFtZSB0aGUgY29udGV4dCBjYXJyaWVzIGlzIGJvdW5kLCBhIG5hbWUgdGhhdFxuICogY2Fubm90IGJlIGEgdmFyaWFibGUgaW5jbHVkZWQgLSBhIGtleSBsaWtlIGB0ZXN0LXRlc3RgLCBhIHJlc2VydmVkIHdvcmQsIGEgc3ltYm9sLCB0aGUgaW5kZXggb2YgYW5cbiAqIGFycmF5LiBTdWNoIGEgY29udGV4dCBjYW5ub3QgYmUgcnVuIG92ZXIgYnkgdGhpcyBleGVjdXRlciBhdCBhbGwsIGFuZCBkcm9wcGluZyB0aGUgbmFtZSBzaWxlbnRseVxuICogd291bGQgaGlkZSBhIHByb3BlcnR5IHRoZSBjYWxsZXIgZGVmaW5lZC4gV2hhdCB0aGlzIGV4ZWN1dGVyIG93ZXMgdGhlIGNhbGxlciBpbnN0ZWFkIGlzIGEgbWVzc2FnZVxuICogdGhhdCBzYXlzIHdoaWNoIHN0YXRlbWVudCBmYWlsZWQgYW5kIHdoaWNoIG5hbWUgZGlkIGl0LCBiZWNhdXNlIHRoZSBzdGF0ZW1lbnQgaXRzZWxmIG5lZWQgbm90XG4gKiBtZW50aW9uIHRoYXQgbmFtZSAtIHNlZSBgREVDSVNJT05TLm1kYCwgMjAyNi0wOS0yMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IHRoZVByb3BlcnR5TmFtZVN0cmluZyB0aGUgY29udGV4dCBuYW1lcywgY29tbWEgc2VwYXJhdGVkLCBhcyB0aGUgZGVzdHJ1Y3R1cmluZ1xuICogICAgICAgICAgICAgICAgIHBhdHRlcm4gc3BlbGxzIHRoZW1cbiAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nfHN5bWJvbD59IHRoZU5hbWVzIHRoZSBzYW1lIG5hbWVzIHVud3JpdHRlbiwgZm9yIHRoZSBlcnJvciBtZXNzYWdlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQsIHRoZVByb3BlcnR5TmFtZVN0cmluZywgdGhlTmFtZXMpID0+IHtcblx0Y29uc3QgY29kZSA9IGBcbnJldHVybiAoYXN5bmMgKHske3RoZVByb3BlcnR5TmFtZVN0cmluZ319KSA9PiB7XG4gICAgdHJ5e1xuICAgICAgIHJldHVybiAke2FTdGF0ZW1lbnR9XG4gICAgfWNhdGNoKGUpe1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn0pKGNvbnRleHQgfHwge30pO2A7XG5cblx0aWYgKERFQlVHKSBjb25zb2xlLmxvZyhcImdlbmVyZXJhdGVkIGNvZGU6IFxcblwiLCBjb2RlKTtcblxuXHR0cnkge1xuXHRcdHJldHVybiBuZXcgRnVuY3Rpb24oXCJjb250ZXh0XCIsIGNvZGUpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Y29uc3QgdW51c2FibGUgPSB1bnVzYWJsZU5hbWVzKHRoZU5hbWVzKTtcblx0XHQvLyBub3RoaW5nIHdyb25nIHdpdGggdGhlIG5hbWVzOiB0aGUgc3RhdGVtZW50IGl0c2VsZiBkb2VzIG5vdCBjb21waWxlLCBhbmQgdGhhdCBlcnJvciBzYXlzXG5cdFx0Ly8gbW9yZSB0aGFuIGFueXRoaW5nIHRoaXMgZXhlY3V0ZXIgY291bGQgYWRkXG5cdFx0aWYgKHVudXNhYmxlLmxlbmd0aCA9PT0gMCkgdGhyb3cgZTtcblxuXHRcdHRocm93IG5ldyBTeW50YXhFcnJvcihcblx0XHRcdGBDb250ZXh0IHByb3BlcnR5ICR7dW51c2FibGUubGVuZ3RoID09PSAxID8gXCJuYW1lXCIgOiBcIm5hbWVzXCJ9IFwiJHt1bnVzYWJsZS5qb2luKCdcIiwgXCInKX1cIiBjYW5ub3QgYmUgdXNlZCBhcyBhIHZhcmlhYmxlIGJ5ICR7RVhFQ1VURVJOQU1FfSwgc28gdGhpcyBzdGF0ZW1lbnQgY2Fubm90IHJ1biBvdmVyIHRoaXMgY29udGV4dCEgc3RhdGVtZW50OiAke2FTdGF0ZW1lbnR9YCxcblx0XHRcdHsgY2F1c2U6IGUgfSxcblx0XHQpO1xuXHR9XG59O1xuXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7XG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lcyA9IGdldFByb3BlcnR5TmFtZXMoYUNvbnRleHQpO1xuXHRcdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQsIHByb3BlcnR5TmFtZXMpO1xuXHRcdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fSxcbn0pO1xuXG5yZWdpc3RyYXRlKEVYRUNVVEVSTkFNRSwgRVhFQ1VURVIpO1xuXG5leHBvcnQgZGVmYXVsdCBFWEVDVVRFUjtcbiIsImltcG9ydCB7IHJlZ2lzdHJhdGUgfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcImNvbnRleHQtb2JqZWN0LWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSh7IHNpemU6IDUwMDAgfSk7XG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRjb25zdCBjb2RlID0gYFxucmV0dXJuIChhc3luYyAoY3R4KSA9PiB7XG4gICAgdHJ5e1xuICAgICAgICByZXR1cm4gJHthU3RhdGVtZW50fVxuICAgIH1jYXRjaChlKXtcbiAgICAgICAgdGhyb3cgZTtcbiAgICB9XG59KShjb250ZXh0IHx8IHt9KTtgO1xuXG5cdC8vY29uc29sZS5sb2coXCJjb2RlXCIsIGNvZGUpO1xuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oXCJjb250ZXh0XCIsIGNvZGUpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50KSA9PiB7XG5cblx0Y29uc3QgY2FjaGVLZXkgPSBhU3RhdGVtZW50O1xuXG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xuXHR9XG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoY2FjaGVLZXksIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50KTtcblx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IHtyZWdpc3RyYXRlfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcIndpdGgtc2NvcGVkLWV4ZWN1dGVyXCI7XG5jb25zdCBFWFBSRVNTSU9OX0NBQ0hFID0gbmV3IENvZGVDYWNoZSh7IHNpemU6IDUwMDAgfSk7XG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xufTtcblxubGV0IGluaXRpYWxDYWxsID0gdHJ1ZTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCkgPT4ge1xuY29uc3QgY29kZSA9IGBcblx0cmV0dXJuIChhc3luYyAoY29udGV4dCkgPT4ge1xuXHRcdHdpdGgoY29udGV4dCl7XG5cdFx0XHR0cnl7XG5cdFx0XHRcdHJldHVybiAke2FTdGF0ZW1lbnR9XG5cdFx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRcdHRocm93IGU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KShjb250ZXh0IHx8IHt9KTtcbmA7XG5cdC8vY29uc29sZS5sb2coXCJjb2RlXCIsIGNvZGUpO1xuXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oXCJjb250ZXh0XCIsIGNvZGUpO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50KSA9PiB7XG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhhU3RhdGVtZW50KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChhU3RhdGVtZW50KTtcblx0fVxuXHRjb25zdCBleHByZXNzaW9uID0gZ2VuZXJhdGUoYVN0YXRlbWVudCk7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGFTdGF0ZW1lbnQsIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cblxuXG5jb25zdCBFWEVDVVRFUiA9IG5ldyBFeGVjdXRlcih7ZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRpZihpbml0aWFsQ2FsbCl7XG5cdFx0XHRpbml0aWFsQ2FsbCA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS53YXJuKG5ldyBFcnJvcihgV2l0aCBTY29wZWQgZXhwcmVzc2lvbiBleGVjdXRpb24gaXMgbWFya2VkIGFzIGRlcHJlY2F0ZWQuYCkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQpO1xuXHRcdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fX0pO1xucmVnaXN0cmF0ZShFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCIvL2ltcG9ydCBcIi4vRXNwcmltYUV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgXCIuL1dpdGhTY29wZWRFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFwiLi9Db250ZXh0T2JqZWN0RXhlY3V0ZXIuanNcIjtcbmltcG9ydCBcIi4vQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qc1wiO1xuIiwiLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gKlxuICogR2VuZXJhdGVkIGZyb20gcGFja2FnZS5qc29uIGJ5IHNjcmlwdHMvZ2VuZXJhdGUtdmVyc2lvbi5qcyBiZWZvcmUgZXZlcnkgYnVpbGQuIERvIG5vdCBlZGl0IC1cbiAqIHRoZSBuZXh0IGJ1aWxkIG92ZXJ3cml0ZXMgaXQuXG4gKlxuICogQG1vZHVsZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gXCIzLjAuMFwiO1xuXG5leHBvcnQgZGVmYXVsdCBWRVJTSU9OO1xuIiwiLyoqXG4gKiBUaGUgZ2xvYmFsIHNjb3BlIG9mIHRoZSBjdXJyZW50IGVudmlyb25tZW50LlxuICpcbiAqIFJlc29sdmVkIG9uY2Ugd2hlbiB0aGUgbW9kdWxlIGlzIGxvYWRlZDogZ2xvYmFsVGhpcywgdGhlbiBnbG9iYWwsIHdpbmRvdyBhbmQgc2VsZiBmb3IgZW5naW5lcyBub3RcbiAqIGtub3dpbmcgaXQgeWV0LiBBbiBlbXB0eSBvYmplY3Qgd2hlbiBub25lIG9mIHRoZW0gZXhpc3RzLCBzbyByZWFkaW5nIGZyb20gaXQgbmV2ZXIgdGhyb3dzLlxuICpcbiAqIEBtb2R1bGUgR2xvYmFsXG4gKlxuICogQGV4YW1wbGVcbiAqIEdMT0JBTC5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ1ZmZlcik7XG4gKi9cbmNvbnN0IEdMT0JBTCA9ICgoKSA9PiB7XG5cdGlmKHR5cGVvZiBnbG9iYWxUaGlzICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0aWYodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdsb2JhbDtcblx0aWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHdpbmRvdztcblx0aWYodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBzZWxmO1xuXHRyZXR1cm4ge307XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBHTE9CQUw7XG4iLCIvKipcclxuICogT25seSBhbiBvYmplY3QgY2FuIGNhcnJ5IGEgcHJvcGVydHksIHNvIGEgcGF0aCBzdG9wcyBhdCBhIHByaW1pdGl2ZSBpbnN0ZWFkIG9mIGhhbmRpbmcgb3V0IGFcclxuICogcHJvcGVydHkgdGhhdCBjYW5ub3QgYmUgcmVhZCBvciB3cml0dGVuLiBBbiBBcnJheSwgTWFwIG9yIERhdGUgcGFzc2VzIC0gdGhleSBhcmUgb2JqZWN0cyBhbmQgdGFrZVxyXG4gKiBhIHByb3BlcnR5IGxpa2UgYW55IG90aGVyIG9uZSwgd2hpY2ggaXMgd2hhdCBtYWtlcyBhIHBhdGggbGlrZSBcImxpc3QuMFwiIHdvcmsuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdGhlIHZhbHVlIGEgc3RlcCBvZiB0aGUgcGF0aCByZXNvbHZlZCB0b1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgbmFtZSBvZiB0aGF0IHN0ZXBcclxuICogQHBhcmFtIHtzdHJpbmd9IGtleSB0aGUgd2hvbGUgcGF0aCwgdG8gdGVsbCB3aGljaCBvbmUgb2Ygc2V2ZXJhbCBzdGVwcyBmYWlsZWRcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiB0aGUgc3RlcCBjYXJyaWVzIG5vIG9iamVjdFxyXG4gKi9cclxuY29uc3QgYXNzZXJ0RGVzY2VuZGFibGUgPSAodmFsdWUsIG5hbWUsIGtleSkgPT4ge1xyXG5cdGlmKHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIilcclxuXHRcdHJldHVybjtcclxuXHJcblx0Y29uc3QgdHlwZSA9IHZhbHVlID09PSBudWxsID8gXCJudWxsXCIgOiBgYSAke3R5cGVvZiB2YWx1ZX1gO1xyXG5cdHRocm93IG5ldyBUeXBlRXJyb3IoYGNhbm5vdCBkZXNjZW5kIGludG8gXCIke25hbWV9XCIgb2YgcGF0aCBcIiR7a2V5fVwiIC0gJHt0eXBlfSBpcyBubyBvYmplY3RgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBPbmUgcHJvcGVydHkgb2YgYW4gb2JqZWN0LCBhZGRyZXNzZWQgYnkgbmFtZSwgdG9nZXRoZXIgd2l0aCB0aGUgb2JqZWN0IGNhcnJ5aW5nIGl0LlxyXG4gKlxyXG4gKiBCdWlsdCB0aHJvdWdoIHtAbGluayBPYmplY3RQcm9wZXJ0eS5sb2FkfSwgd2hpY2ggd2Fsa3MgYSBkb3R0ZWQgcGF0aCBhbmQgaGFuZHMgYmFjayB0aGUgcHJvcGVydHkgYXRcclxuICogaXRzIGVuZC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgcHJvcGVydHkgPSBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDoge2IgOiAxfX0sIFwiYS5iXCIpO1xyXG4gKiBwcm9wZXJ0eS52YWx1ZTsgICAgICAvLyAxXHJcbiAqIHByb3BlcnR5LnZhbHVlID0gMjsgIC8vIHdyaXRlcyBpbnRvIHRoZSBvYmplY3RcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9iamVjdFByb3BlcnR5IHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGhlIG9iamVjdCBjYXJyeWluZyBpdFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGtleSwgY29udGV4dCl7XHJcblx0XHR0aGlzLmtleSA9IGtleTtcclxuXHRcdHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBXaGV0aGVyIHRoZSBrZXkgaXMgcmVhY2hhYmxlIG9uIHRoZSBjb250ZXh0IGF0IGFsbC5cclxuXHQgKlxyXG5cdCAqIFRoaXMgYW5zd2VycyBmb3IgdGhlIHdob2xlIHByb3RvdHlwZSBjaGFpbiwgbm90IG9ubHkgZm9yIG93biBwcm9wZXJ0aWVzIC0gbG9hZCh7fSwgXCJ0b1N0cmluZ1wiKVxyXG5cdCAqIHJlcG9ydHMgdHJ1ZS4gVGhhdCBpcyBkZWxpYmVyYXRlOiBhIHBhdGggbWF5IGFkZHJlc3MgYSBwcm90b3R5cGUgYW5kIGV4dGVuZCBpdCwgc28gYW4gaW5oZXJpdGVkXHJcblx0ICoga2V5IGlzIGEga2V5IGxpa2UgYW55IG90aGVyIGhlcmUuIFVzZSBoYXNWYWx1ZSB0byBhc2sgd2hldGhlciBzb21ldGhpbmcgaXMgYWN0dWFsbHkgc3RvcmVkLlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0Z2V0IGtleURlZmluZWQoKXtcclxuXHRcdHJldHVybiB0aGlzLmtleSBpbiB0aGlzLmNvbnRleHQ7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFdoZXRoZXIgc29tZXRoaW5nIGlzIHN0b3JlZCB1bmRlciB0aGUga2V5LiBPbmx5IHVuZGVmaW5lZCBjb3VudHMgYXMgbm90aGluZyAtIDAsIFwiXCIsIGZhbHNlIGFuZFxyXG5cdCAqIG51bGwgYXJlIHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGdldCBoYXNWYWx1ZSgpe1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB0aGlzLmNvbnRleHRbdGhpcy5rZXldICE9PSBcInVuZGVmaW5lZFwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybnMgeyp9IHRoZSBzdG9yZWQgdmFsdWUsIHVuZGVmaW5lZCB3aGVuIHRoZXJlIGlzIG5vbmVcclxuXHQgKi9cclxuXHRnZXQgdmFsdWUoKXtcclxuXHRcdHJldHVybiB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHsqfSBkYXRhXHJcblx0ICovXHJcblx0c2V0IHZhbHVlKGRhdGEpe1xyXG5cdFx0dGhpcy5jb250ZXh0W3RoaXMua2V5XSA9IGRhdGE7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGRzIGEgdmFsdWUgbmV4dCB0byB3aGF0IGlzIGFscmVhZHkgdGhlcmU6IHdyaXRlcyBpdCB3aGVuIHRoZSBrZXkgaG9sZHMgbm90aGluZywgdHVybnMgdGhlXHJcblx0ICogdmFsdWUgaW50byBhbiBhcnJheSBvZiBib3RoIHdoZW4gaXQgaG9sZHMgb25lLCBhbmQgcHVzaGVzIG9udG8gdGhlIGFycmF5IHdoZW4gaXQgaG9sZHMgb25lXHJcblx0ICogYWxyZWFkeS5cclxuXHQgKlxyXG5cdCAqIFRoZSB2YWx1ZSBpdHNlbGYgaXMgbm90IGxvb2tlZCBhdCAtIGFwcGVuZGluZyB1bmRlZmluZWQgcHV0cyB1bmRlZmluZWQgaW50byB0aGUgYXJyYXkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geyp9IGRhdGFcclxuXHQgKlxyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMTsgICAvLyB7a2V5IDogMX1cclxuXHQgKiBwcm9wZXJ0eS5hcHBlbmQgPSAyOyAgIC8vIHtrZXkgOiBbMSwgMl19XHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMzsgICAvLyB7a2V5IDogWzEsIDIsIDNdfVxyXG5cdCAqL1xyXG5cdHNldCBhcHBlbmQoZGF0YSkge1xyXG5cdFx0aWYoIXRoaXMuaGFzVmFsdWUpXHJcblx0XHRcdHRoaXMudmFsdWUgPSBkYXRhO1xyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZTtcclxuXHRcdFx0aWYodmFsdWUgaW5zdGFuY2VvZiBBcnJheSlcclxuXHRcdFx0XHR2YWx1ZS5wdXNoKGRhdGEpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy52YWx1ZSA9IFt0aGlzLnZhbHVlLCBkYXRhXTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZXMgdGhlIGtleSBmcm9tIHRoZSBvYmplY3QuIERvZXMgbm90aGluZyB3aGVuIGl0IGlzIG5vdCB0aGVyZS5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxyXG5cdCAqL1xyXG5cdHJlbW92ZSgpe1xyXG5cdFx0ZGVsZXRlIHRoaXMuY29udGV4dFt0aGlzLmtleV07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIExvYWRzIHRoZSBwcm9wZXJ0eSBhIGRvdHRlZCBwYXRoIGFkZHJlc3Nlcy4gRXZlcnkgcGFydCBvZiB0aGUgcGF0aCBpcyB0cmltbWVkLCBzbyBcIiBhIC4gYiBcIlxyXG5cdCAqIGFkZHJlc3NlcyB0aGUgc2FtZSBwcm9wZXJ0eSBhcyBcImEuYlwiLlxyXG5cdCAqXHJcblx0ICogQSBtaXNzaW5nIHN0ZXAgaXMgY3JlYXRlZCB3aXRoIGNyZWF0ZSwgb3RoZXJ3aXNlIHRoZSBwYXRoIGlzIHJlcG9ydGVkIGFzIG5vdCBsb2FkYWJsZS4gQSBzdGVwXHJcblx0ICogaG9sZGluZyBzb21ldGhpbmcgdGhhdCBpcyBubyBvYmplY3QgY2Fubm90IGJlIHdhbGtlZCBpbnRvIGF0IGFsbCAtIHRoYXQgaXMgYSBicm9rZW4gcGF0aCwgbm90IGFcclxuXHQgKiBtaXNzaW5nIG9uZSwgYW5kIGl0IGlzIHJlcG9ydGVkIGFzIGFuIGVycm9yIHJlZ2FyZGxlc3Mgb2YgY3JlYXRlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGEgdGhlIG9iamVjdCB0byB3YWxrXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMgYSBuZXN0ZWQgb25lXHJcblx0ICogQHBhcmFtIHtib29sZWFufSBbY3JlYXRlPXRydWVdIGNyZWF0ZSBhIG1pc3Npbmcgc3RlcCBvbiB0aGUgd2F5XHJcblx0ICogQHJldHVybnMge09iamVjdFByb3BlcnR5fG51bGx9IG51bGwgd2hlbiBhIHN0ZXAgaXMgbWlzc2luZyBhbmQgY3JlYXRlIGlzIGZhbHNlXHJcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVuIGEgc3RlcCBvZiB0aGUgcGF0aCBob2xkcyBzb21ldGhpbmcgdGhhdCBpcyBubyBvYmplY3RcclxuXHQgKlxyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IHtiIDogMX19LCBcImEuYlwiKS52YWx1ZTsgICAvLyAxXHJcblx0ICogT2JqZWN0UHJvcGVydHkubG9hZCh7bGlzdCA6IFsxLCAyXX0sIFwibGlzdC4xXCIpLnZhbHVlOyAgIC8vIDIsIGFuIGFycmF5IGlzIGFuIG9iamVjdFxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe30sIFwiYS5iXCIsIGZhbHNlKTsgICAgICAgICAgICAgLy8gbnVsbFxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiAwfSwgXCJhLmJcIik7ICAgICAgICAgICAgICAgLy8gdGhyb3dzLCAwIGlzIG5vIG9iamVjdFxyXG5cdCAqL1xyXG5cdHN0YXRpYyBsb2FkKGRhdGEsIGtleSwgY3JlYXRlPXRydWUpIHtcclxuXHRcdGxldCBjb250ZXh0ID0gZGF0YTtcclxuXHRcdGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoXCIuXCIpO1xyXG5cdFx0bGV0IG5hbWUgPSBrZXlzLnNoaWZ0KCkudHJpbSgpO1xyXG5cdFx0d2hpbGUoa2V5cy5sZW5ndGggPiAwKXtcclxuXHRcdFx0aWYodHlwZW9mIGNvbnRleHRbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIgfHwgY29udGV4dFtuYW1lXSA9PT0gbnVsbCl7XHJcblx0XHRcdFx0aWYoIWNyZWF0ZSlcclxuXHRcdFx0XHRcdHJldHVybiBudWxsO1xyXG5cclxuXHRcdFx0XHRjb250ZXh0W25hbWVdID0ge31cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0YXNzZXJ0RGVzY2VuZGFibGUoY29udGV4dFtuYW1lXSwgbmFtZSwga2V5KTtcclxuXHRcdFx0Y29udGV4dCA9IGNvbnRleHRbbmFtZV07XHJcblx0XHRcdG5hbWUgPSBrZXlzLnNoaWZ0KCkudHJpbSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXcgT2JqZWN0UHJvcGVydHkobmFtZSwgY29udGV4dCk7XHJcblx0fVxyXG59OyIsIi8qKlxyXG4gKiBVdGlsaXRpZXMgdG8gaW5zcGVjdCwgY29tcGFyZSwgbWVyZ2UgYW5kIGZpbHRlciBqYXZhc2NyaXB0IG9iamVjdHMuXHJcbiAqXHJcbiAqIFNldmVyYWwgZnVuY3Rpb25zIHNoYXJlIG9uZSBub3Rpb24gb2YgZGF0YTogcHJpbWl0aXZlcywgc2ltcGxlIG9iamVjdHMsIEFycmF5LCBEYXRlLCBSZWdFeHAsIE1hcFxyXG4gKiBhbmQgU2V0LiB7QGxpbmsgaXNQb2pvfSBkZWNpZGVzIHdoZXRoZXIgYSB2YWx1ZSBzdGF5cyB3aXRoaW4gaXQsIHtAbGluayBlcXVhbFBvam99IGNvbXBhcmVzIHRob3NlXHJcbiAqIHR5cGVzIGJ5IHZhbHVlLCBhbmQge0BsaW5rIG1lcmdlfSB0cmVhdHMgZXZlcnl0aGluZyBvdXRzaWRlIG9mIGl0IGFzIGEgdmFsdWUgdG8gYmUgcmVwbGFjZWQuXHJcbiAqXHJcbiAqIEBtb2R1bGUgT2JqZWN0VXRpbHNcclxuICovXHJcbmltcG9ydCBPYmplY3RQcm9wZXJ0eSBmcm9tIFwiLi9PYmplY3RQcm9wZXJ0eS5qc1wiO1xyXG5cclxuLyoqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFcclxuICogQHBhcmFtIHtBcnJheX0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbEFycmF5ID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IGxlbmd0aCA9IGEubGVuZ3RoO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIGlmICghaW50ZXJuYWxFcXVhbFBvam8oYVtpXSwgYltpXSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBzZXQgaXMgdW5vcmRlcmVkLCBzbyBldmVyeSBlbnRyeSBvZiBhIGhhcyB0byBmaW5kIGl0cyBvd24gcGFydG5lciBpbiBiLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1NldH0gYVxyXG4gKiBAcGFyYW0ge1NldH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbFNldCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHJlbWFpbmluZyA9IEFycmF5LmZyb20oYik7XHJcblx0Zm9yIChjb25zdCBlbnRyeUEgb2YgYSkge1xyXG5cdFx0Y29uc3QgaW5kZXggPSByZW1haW5pbmcuZmluZEluZGV4KChlbnRyeUIpID0+IGludGVybmFsRXF1YWxQb2pvKGVudHJ5QSwgZW50cnlCLCBzZWVuKSk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0cmVtYWluaW5nLnNwbGljZShpbmRleCwgMSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIG1hcCBpcyB1bm9yZGVyZWQgYXMgd2VsbCBhbmQgaXRzIGtleXMgbWF5IGJlIG9iamVjdHMsIHNvIHRoZSBrZXlzIGdldCBjb21wYXJlZCBieSB2YWx1ZSB0b28uXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7TWFwfSBhXHJcbiAqIEBwYXJhbSB7TWFwfSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGVxdWFsTWFwID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoYS5zaXplICE9PSBiLnNpemUpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Y29uc3QgcmVtYWluaW5nID0gQXJyYXkuZnJvbShiKTtcclxuXHRmb3IgKGNvbnN0IFtrZXlBLCB2YWx1ZUFdIG9mIGEpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gcmVtYWluaW5nLmZpbmRJbmRleCgoW2tleUIsIHZhbHVlQl0pID0+IGludGVybmFsRXF1YWxQb2pvKGtleUEsIGtleUIsIHNlZW4pICYmIGludGVybmFsRXF1YWxQb2pvKHZhbHVlQSwgdmFsdWVCLCBzZWVuKSk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0cmVtYWluaW5nLnNwbGljZShpbmRleCwgMSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb21wYXJlcyB0d28gb2JqZWN0cyBieSBwcm90b3R5cGUgYW5kIGJ5IHRoZWlyIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGVxdWFsT2JqZWN0ID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKGEpICE9PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYikpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Y29uc3QgcHJvcGVydGllc0EgPSBPYmplY3Qua2V5cyhhKTtcclxuXHRjb25zdCBwcm9wZXJ0aWVzQiA9IE9iamVjdC5rZXlzKGIpO1xyXG5cdGlmIChwcm9wZXJ0aWVzQS5sZW5ndGggIT09IHByb3BlcnRpZXNCLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRmb3IgKGNvbnN0IGtleSBvZiBwcm9wZXJ0aWVzQSkge1xyXG5cdFx0Ly8gZXF1YWwga2V5IGNvdW50cyBhbG9uZSB3b3VsZCBsZXQge3g6MSwgeTp1bmRlZmluZWR9IHBhc3MgYWdhaW5zdCB7eDoxLCB6OnVuZGVmaW5lZH1cclxuXHRcdGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIGtleSkpIHJldHVybiBmYWxzZTtcclxuXHRcdGlmICghaW50ZXJuYWxFcXVhbFBvam8oYVtrZXldLCBiW2tleV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIGN5Y2xpYyBzdHJ1Y3R1cmUgY2FuIG9ubHkgYmUgZGVjaWRlZCBjby1pbmR1Y3RpdmVseTogYSBwYWlyIGFscmVhZHkgdW5kZXIgY29tcGFyaXNvbiBjb3VudHMgYXNcclxuICogZXF1YWwsIG90aGVyd2lzZSB0aGUgd2FsayB3b3VsZCBuZXZlciBjb21lIGJhY2suXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSB3aGVuIHRoaXMgcGFpciBpcyBhbHJlYWR5IGJlaW5nIGNvbXBhcmVkIGZ1cnRoZXIgdXAgdGhlIHN0YWNrXHJcbiAqL1xyXG5jb25zdCBpc0NvbXBhcmluZyA9IChzZWVuLCBhLCBiKSA9PiB7XHJcblx0Y29uc3QgcGFydG5lcnMgPSBzZWVuLmdldChhKTtcclxuXHRyZXR1cm4gISFwYXJ0bmVycyAmJiBwYXJ0bmVycy5oYXMoYik7XHJcbn07XHJcblxyXG4vKipcclxuICogTm90ZXMgYSBwYWlyIGFzIGJlaW5nIGNvbXBhcmVkLCBzbyBhIGN5Y2xlIHJ1bm5pbmcgdGhyb3VnaCBpdCB0ZXJtaW5hdGVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5jb25zdCByZW1lbWJlckNvbXBhcmluZyA9IChzZWVuLCBhLCBiKSA9PiB7XHJcblx0Y29uc3QgcGFydG5lcnMgPSBzZWVuLmdldChhKTtcclxuXHRpZiAocGFydG5lcnMpIHBhcnRuZXJzLmFkZChiKTtcclxuXHRlbHNlIHNlZW4uc2V0KGEsIG5ldyBXZWFrU2V0KFtiXSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWQuXHJcbiAqXHJcbiAqIFZhbHVlSGVscGVyLm5vVmFsdWUgYW5zd2VycyB0aGUgc2FtZSBxdWVzdGlvbi4gQm90aCBhcmUga2VwdCBvbiBwdXJwb3NlLCBzbyBWYWx1ZUhlbHBlciBzdGF5cyBmcmVlXHJcbiAqIG9mIGEgZGVwZW5kZW5jeSBvbiB0aGlzIG1vZHVsZSAtIHNlZSB0aGUgbm90ZSB0aGVyZS5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNOdWxsT3JVbmRlZmluZWQgPSAob2JqZWN0KSA9PiB7XHJcblx0cmV0dXJuIG9iamVjdCA9PSBudWxsIHx8IHR5cGVvZiBvYmplY3QgPT09IFwidW5kZWZpbmVkXCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhIHByaW1pdGl2ZS5cclxuICpcclxuICogbnVsbCBhbmQgdW5kZWZpbmVkIGNvdW50IGFzIHByaW1pdGl2ZXMuIEEgc3ltYm9sIGRvZXMgbm90IC0gaXQgaXMgdHJlYXRlZCBhcyBhbiBvcGFxdWUgdmFsdWVcclxuICogdGhyb3VnaG91dCB0aGlzIG1vZHVsZSwgc28gdGhhdCB7QGxpbmsgaXNQb2pvfSBrZWVwcyByZWplY3RpbmcgaXQgYXMgZGF0YS5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0Y29uc3QgdHlwZSA9IHR5cGVvZiBvYmplY3Q7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIFwibnVtYmVyXCI6XHJcblx0XHRjYXNlIFwiYmlnaW50XCI6XHJcblx0XHRjYXNlIFwiYm9vbGVhblwiOlxyXG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxyXG5cdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIGFuIG9iamVjdC5cclxuICpcclxuICogRXZlcnkgb2JqZWN0IGNvdW50cywgQXJyYXksIE1hcCwgRGF0ZSBhbmQgY2xhc3MgaW5zdGFuY2VzIGluY2x1ZGVkLiBVc2Uge0BsaW5rIGlzUG9qb30gdG8gYXNrIGZvclxyXG4gKiBhIHNpbXBsZSBkYXRhIG9iamVjdCBpbnN0ZWFkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgdmFsdWUgdG8gYmUgdGVzdGluZ1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IChvYmplY3QpID0+IHtcclxuXHRpZiAoaXNOdWxsT3JVbmRlZmluZWQob2JqZWN0KSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRyZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gXCJvYmplY3RcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb21wYXJlcyB0d28gdmFsdWVzIGJ5IHZhbHVlLlxyXG4gKlxyXG4gKiBUaGUgdHlwZXMgY29tcGFyZWQgYnkgdmFsdWUgYXJlIHRoZSBvbmVzIHtAbGluayBpc1Bvam99IGFjY2VwdHMgYXMgZGF0YTogcHJpbWl0aXZlcywgc2ltcGxlXHJcbiAqIG9iamVjdHMsIEFycmF5LCBEYXRlLCBSZWdFeHAsIE1hcCBhbmQgU2V0LiBBIERhdGUgaXMgY29tcGFyZWQgYnkgaXRzIHRpbWUsIGEgUmVnRXhwIGJ5IHNvdXJjZSBhbmRcclxuICogZmxhZ3MuIFNldCBhbmQgTWFwIGFyZSB1bm9yZGVyZWQsIHNvIHRoZWlyIGVudHJpZXMgYXJlIG1hdGNoZWQgYnkgdmFsdWUgaW5zdGVhZCBvZiBieSBwb3NpdGlvbixcclxuICogYW5kIHRoZSBrZXlzIG9mIGEgTWFwIHRha2UgcGFydCBpbiB0aGF0IGNvbXBhcmlzb24uXHJcbiAqXHJcbiAqIFNpbXBsZSBvYmplY3RzIGFuZCBjbGFzcyBpbnN0YW5jZXMgbmVlZCB0aGUgc2FtZSBwcm90b3R5cGUgYW5kIHRoZSBzYW1lIG93biBlbnVtZXJhYmxlXHJcbiAqIHByb3BlcnRpZXMuIEV2ZXJ5IG90aGVyIG9iamVjdCAtIEVycm9yLCBQcm9taXNlLCBXZWFrTWFwIGFuZCB0aGUgbGlrZSAtIGtlZXBzIGl0cyBzdGF0ZSBvdXQgb2ZcclxuICogcmVhY2gsIHNvIHRob3NlIGNvbXBhcmUgYnkgaWRlbnRpdHkgb25seS4gRnVuY3Rpb25zIGFuZCBzeW1ib2xzIGRvIGFzIHdlbGwuXHJcbiAqXHJcbiAqIEN5Y2xpYyBzdHJ1Y3R1cmVzIGFyZSBzdXBwb3J0ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gYVxyXG4gKiBAcGFyYW0geyp9IGJcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGVxdWFsUG9qbyh7YSA6IFsxLCAyXX0sIHthIDogWzEsIDJdfSk7ICAgICAgICAgICAgICAgLy8gdHJ1ZVxyXG4gKiBlcXVhbFBvam8obmV3IFNldChbMSwgMl0pLCBuZXcgU2V0KFsyLCAxXSkpOyAgICAgICAgIC8vIHRydWUsIGEgc2V0IGlzIHVub3JkZXJlZFxyXG4gKiBlcXVhbFBvam8obmV3IERhdGUoMCksIG5ldyBEYXRlKDEpKTsgICAgICAgICAgICAgICAgIC8vIGZhbHNlXHJcbiAqIGVxdWFsUG9qbyhuZXcgRXJyb3IoXCJ4XCIpLCBuZXcgRXJyb3IoXCJ4XCIpKTsgICAgICAgICAgIC8vIGZhbHNlLCBjb21wYXJlZCBieSBpZGVudGl0eVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVxdWFsUG9qbyA9IChhLCBiKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhhLCBiLCBuZXcgV2Vha01hcCgpKTtcclxuXHJcblxyXG4vKipcclxuKiBAcGFyYW0geyp9IGFcclxuICogQHBhcmFtIHsqfSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBpbnRlcm5hbCwgdHJhY2tzIHRoZSBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGludGVybmFsRXF1YWxQb2pvID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgaXNOdWxsT3JVbmRlZmluZWQoYikpIHJldHVybiBhID09PSBiO1xyXG5cdGlmIChhID09PSBiKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAoaXNQcmltaXRpdmUoYSkgfHwgaXNQcmltaXRpdmUoYikpIHJldHVybiBhID09PSBiO1xyXG5cclxuXHRjb25zdCB0eXBlQSA9IHR5cGVvZiBhO1xyXG5cdGlmICh0eXBlQSAhPT0gdHlwZW9mIGIpIHJldHVybiBmYWxzZTtcclxuXHRpZiAodHlwZUEgIT09IFwib2JqZWN0XCIpIHJldHVybiBhID09PSBiOyAvLyBmdW5jdGlvbiBhbmQgc3ltYm9sXHJcblxyXG5cdGlmIChpc0NvbXBhcmluZyhzZWVuLCBhLCBiKSkgcmV0dXJuIHRydWU7XHJcblx0cmVtZW1iZXJDb21wYXJpbmcoc2VlbiwgYSwgYik7XHJcblxyXG5cdGlmKGEgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gIGIgaW5zdGFuY2VvZiBEYXRlID8gT2JqZWN0LmlzKGEuZ2V0VGltZSgpLCBiLmdldFRpbWUoKSkgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBiIGluc3RhbmNlb2YgUmVnRXhwID8gKGEuc291cmNlID09PSBiLnNvdXJjZSAmJiBhLmZsYWdzID09PSBiLmZsYWdzKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gYiBpbnN0YW5jZW9mIEFycmF5ID8gZXF1YWxBcnJheShhLCBiLCBzZWVuKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIFNldCkgcmV0dXJuIGIgaW5zdGFuY2VvZiBTZXQgPyBlcXVhbFNldChhLCBiLCBzZWVuKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGIgaW5zdGFuY2VvZiBNYXAgPyBlcXVhbE1hcChhLCBiLCBzZWVuKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIGZhbHNlO1x0XHJcblx0ZWxzZSByZXR1cm4gZXF1YWxPYmplY3QoYSwgYiwgc2Vlbik7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBwbGFpbiBvYmplY3Qgb3ducyBlaXRoZXIgbm8gcHJvdG90eXBlIGF0IGFsbCBvciBhIHByb3RvdHlwZSB0aGF0IGl0c2VsZiBoYXMgbm9uZS4gQ2hlY2tpbmcgdGhlXHJcbiAqIGNoYWluIGxlbmd0aCBpbnN0ZWFkIG9mIGNvbXBhcmluZyBhZ2FpbnN0IE9iamVjdC5wcm90b3R5cGUga2VlcHMgdGhpcyB3b3JraW5nIGFjcm9zcyByZWFsbXMsXHJcbiAqIHdoZXJlIGFuIGlmcmFtZSBicmluZ3MgaXRzIG93biBPYmplY3QucHJvdG90eXBlLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IG9iamVjdFxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKG9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gZmFsc2U7XHJcblx0Y29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XHJcblx0cmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKSA9PT0gbnVsbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBXYWxrcyBhIHZhbHVlIGFuZCBkZWNpZGVzIHdoZXRoZXIgZXZlcnl0aGluZyByZWFjaGFibGUgZnJvbSBpdCBpcyBkYXRhLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAqIEBwYXJhbSB7V2Vha1NldH0gW3NlZW5dIHZhbHVlcyBhbHJlYWR5IHdhbGtlZCwgY2xvc2VzIGN5Y2xlc1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGlzRGF0YVZhbHVlID0gKHZhbHVlLCBzZWVuID0gbmV3IFdlYWtTZXQoKSkgPT4ge1xyXG5cdGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHJldHVybiB0cnVlO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIHRydWU7XHJcblx0ZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiB0cnVlO1xyXG5cclxuXHRpZiAoc2Vlbi5oYXModmFsdWUpKSByZXR1cm4gdHJ1ZTtcclxuXHRzZWVuLmFkZCh2YWx1ZSk7XHJcblxyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gdmFsdWUuZXZlcnkoKGVudHJ5KSA9PiBpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwKSB7XHJcblx0XHRmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKGtleSwgc2VlbikgfHwgIWlzRGF0YVZhbHVlKGVudHJ5LCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xyXG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKGVudHJ5LCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIGlmICghaXNQbGFpbk9iamVjdCh2YWx1ZSkpXHJcblx0XHRyZXR1cm4gZmFsc2U7IC8vIGNsYXNzIGluc3RhbmNlcyBhbmQgZXZlcnkgb3RoZXIgZXhvdGljIG9iamVjdFxyXG5cdGVsc2Uge1xyXG5cdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModmFsdWUpKSB7XHJcblx0XHRcdGlmICghaXNEYXRhVmFsdWUodmFsdWVba2V5XSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYW4gb2JqZWN0IGlzIGEgcHVyZSBkYXRhIG9iamVjdC5cclxuICpcclxuICogVGhlIG9iamVjdCBpdHNlbGYgaGFzIHRvIGJlIGEgc2ltcGxlIG9iamVjdCAtIG5vIEFycmF5LCBNYXAgb3Igc29tZXRoaW5nIGVsc2UuIEV2ZXJ5IHZhbHVlXHJcbiAqIHJlYWNoYWJsZSBmcm9tIGl0IGhhcyB0byBiZSBkYXRhIGFzIHdlbGw6IHByaW1pdGl2ZXMsIHNpbXBsZSBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXAgb3JcclxuICogU2V0LiBGdW5jdGlvbnMgYW5kIGNsYXNzIGluc3RhbmNlcyBhcmUgcmVqZWN0ZWQgYXQgYW55IGRlcHRoLCBpbmNsdWRpbmcgaW5zaWRlIGFycmF5cyBhbmQgaW5zaWRlXHJcbiAqIHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYSBNYXAgb3IgU2V0LlxyXG4gKlxyXG4gKiBPbmx5IG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYXJlIGluc3BlY3RlZC4gQ3ljbGljIHJlZmVyZW5jZXMgYXJlIGFsbG93ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSBvYmplY3QgdG8gYmUgdGVzdGluZ1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogaXNQb2pvKHthIDoge2IgOiBbMSwgbmV3IERhdGUoKV19fSk7ICAgLy8gdHJ1ZVxyXG4gKiBpc1Bvam8oe2EgOiAoKSA9PiB7fX0pOyAgICAgICAgICAgICAgICAvLyBmYWxzZSwgYSBmdW5jdGlvbiBpcyBubyBkYXRhXHJcbiAqIGlzUG9qbyh7YSA6IFt7YiA6IG5ldyBGb28oKX1dfSk7ICAgICAgIC8vIGZhbHNlLCByZWplY3RlZCBhdCBhbnkgZGVwdGhcclxuICogaXNQb2pvKFtdKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsc2UsIHRoZSBvYmplY3QgaXRzZWxmIGhhcyB0byBiZSBhIHNpbXBsZSBvbmVcclxuICovXHJcbmV4cG9ydCBjb25zdCBpc1Bvam8gPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKG9iamVjdCkgfHwgIWlzUGxhaW5PYmplY3Qob2JqZWN0KSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRyZXR1cm4gaXNEYXRhVmFsdWUob2JqZWN0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBcHBlbmRzIGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gb2JqZWN0LiBJZiB0aGUgcHJvcGVydHkgYWxyZWFkeSBob2xkcyBhIHZhbHVlLCBpdCBpcyBjb252ZXJ0ZWRcclxuICogaW50byBhbiBhcnJheSBjYXJyeWluZyBib3RoLiBBbiB1bmRlZmluZWQgdmFsdWUgaXMgaWdub3JlZC5cclxuICpcclxuICogVGhlIGtleSBtYXkgYWRkcmVzcyBhIG5lc3RlZCBwcm9wZXJ0eSBieSBhIGRvdHRlZCBwYXRoLCBtaXNzaW5nIHN0ZXBzIGFyZSBjcmVhdGVkIG9uIHRoZSB3YXkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhS2V5IG5hbWUgb2YgdGhlIHByb3BlcnR5LCBhIGRvdHRlZCBwYXRoIGFkZHJlc3NlcyBhIG5lc3RlZCBvbmVcclxuICogQHBhcmFtIHsqfSBhRGF0YSBwcm9wZXJ0eSB2YWx1ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYU9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGVuZCB0aGUgcHJvcGVydHkgdG9cclxuICogQHJldHVybnMge29iamVjdH0gdGhlIGNoYW5nZWQgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGFwcGVuZChcImFcIiwgMSwge30pOyAgICAgICAgICAgICAvLyB7YSA6IDF9XHJcbiAqIGFwcGVuZChcImFcIiwgMiwge2EgOiAxfSk7ICAgICAgICAvLyB7YSA6IFsxLCAyXX1cclxuICogYXBwZW5kKFwiYS5iXCIsIDEsIHt9KTsgICAgICAgICAgIC8vIHthIDoge2IgOiAxfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBhcHBlbmQgPSAoYUtleSwgYURhdGEsIGFPYmplY3QpID0+IHtcclxuXHRpZiAodHlwZW9mIGFEYXRhICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRjb25zdCBwcm9wZXJ0eSA9IE9iamVjdFByb3BlcnR5LmxvYWQoYU9iamVjdCwgYUtleSwgdHJ1ZSk7XHJcblx0XHRwcm9wZXJ0eS5hcHBlbmQgPSBhRGF0YTtcclxuXHR9XHJcblx0cmV0dXJuIGFPYmplY3Q7XHJcbn07XHJcblxyXG4vKipcclxuICogT3duIGVudW1lcmFibGUga2V5cywgc3RyaW5ncyBhbmQgc3ltYm9scyBhbGlrZSAtIHRoZSBzYW1lIHNldCBPYmplY3QuYXNzaWduIGNvcGllcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSBzb3VyY2VcclxuICogQHJldHVybnMge0FycmF5PHN0cmluZ3xzeW1ib2w+fVxyXG4gKi9cclxuY29uc3QgYXNzaWduYWJsZUtleXMgPSAoc291cmNlKSA9PiB7XHJcblx0Y29uc3Qgb2JqZWN0ID0gT2JqZWN0KHNvdXJjZSk7XHJcblx0cmV0dXJuIFJlZmxlY3Qub3duS2V5cyhvYmplY3QpLmZpbHRlcigoa2V5KSA9PiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCBrZXkpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNZXJnZXMgb2JqZWN0cyBpbnRvIGEgdGFyZ2V0IG9iamVjdCAtIGEgcmVjdXJzaXZlIE9iamVjdC5hc3NpZ24uIEl0IHN0ZXBzIGludG8gb2JqZWN0cyBhbmQgc3ViXHJcbiAqIG9iamVjdHMuIEV2ZXJ5IG90aGVyIHZhbHVlIGlzIHJlcGxhY2VkIGJ5IHRoZSB2YWx1ZSBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0LlxyXG4gKlxyXG4gKiBMaWtlIE9iamVjdC5hc3NpZ24gaXQgY29waWVzIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgLSBzdHJpbmcgYW5kIHN5bWJvbCBrZXlzIGFsaWtlIC0sIGlnbm9yZXNcclxuICogbnVsbCBhbmQgdW5kZWZpbmVkIHNvdXJjZXMgYW5kIHJldHVybnMgdGhlIHRhcmdldC4gVW5saWtlIE9iamVjdC5hc3NpZ24gaXQgc3RlcHMgaW50byBhIHByb3BlcnR5XHJcbiAqIHdoZW4gdGFyZ2V0IGFuZCBzb3VyY2UgYm90aCBob2xkIGFuIG9iamVjdCwgaW5zdGVhZCBvZiByZXBsYWNpbmcgaXQuXHJcbiAqXHJcbiAqIEEgY2xhc3MgaW5zdGFuY2UgY291bnRzIGFzIGFuIG9iamVjdCBoZXJlIGFuZCBpcyBtZXJnZWQgcHJvcGVydHkgYnkgcHJvcGVydHkganVzdCBsaWtlIGEgc2ltcGxlXHJcbiAqIG9uZS4gVGhlIHRhcmdldCBrZWVwcyBpdHMgb3duIHByb3RvdHlwZSwgb25seSB0aGUgcHJvcGVydGllcyBvZiB0aGUgc291cmNlIGFyZSBhcHBsaWVkIHRvIGl0IC0gYVxyXG4gKiBtZXJnZSBuZXZlciB0dXJucyB0aGUgdGFyZ2V0IGludG8gYW4gaW5zdGFuY2Ugb2YgdGhlIGNsYXNzIG9mIHRoZSBzb3VyY2UuXHJcbiAqXHJcbiAqIEFuIEFycmF5LCBTZXQsIE1hcCwgRGF0ZSBvciBSZWdFeHAgaXMgYWx3YXlzIHJlcGxhY2VkIGFzIGEgd2hvbGUsIG5ldmVyIG1lcmdlZCBlbnRyeSBieSBlbnRyeS5cclxuICogVGhhdCBhbHJlYWR5IGFwcGxpZXMgd2hlbiBvbmx5IG9uZSBvZiBib3RoIHNpZGVzIGhvbGRzIG9uZS4gVGhlIHJlc3VsdCB0aGVyZWZvcmUgY2FycmllcyB0aGVcclxuICogY29udGFpbmVyIG9mIHRoZSBzb3VyY2Ugd2l0aCBpdHMgb3duIGxlbmd0aCAtIG5vdGhpbmcgb2YgdGhlIHRhcmdldCBzdXJ2aXZlcyBpdCwgbm90IGV2ZW4gYW5cclxuICogb2JqZWN0IHNpdHRpbmcgYXQgdGhlIHNhbWUgaW5kZXggb3IgdW5kZXIgdGhlIHNhbWUga2V5LlxyXG4gKlxyXG4gKiBBIGtleSB3aG9zZSB2YWx1ZSBpcyBhIHN5bWJvbCBpcyBza2lwcGVkLCBvbiB0aGUgdGFyZ2V0IHNpZGUgYXMgd2VsbCBhcyBvbiB0aGUgc291cmNlIHNpZGUuIEFcclxuICogc3ltYm9sIGNhcnJpZXMgbm8gZGF0YSwgc28gc3VjaCBhIHByb3BlcnR5IGlzIGxlZnQgdW50b3VjaGVkLlxyXG4gKlxyXG4gKiBUaGUga2V5IF9fcHJvdG9fXyBpcyBza2lwcGVkLiBPYmplY3QuYXNzaWduIHdvdWxkIG9ubHkgcmVwb2ludCB0aGUgcHJvdG90eXBlIG9mIHRoZSB0YXJnZXQsIGJ1dFxyXG4gKiBtZXJnaW5nIGludG8gaXQgd291bGQgd2FsayBpbnRvIE9iamVjdC5wcm90b3R5cGUgYW5kIGxlYWsgaW50byBldmVyeSBvYmplY3QuXHJcbiAqXHJcbiAqIFRoZSB0YXJnZXQgaXMgbW9kaWZpZWQgaW4gcGxhY2UuIEEgc3ViIG9iamVjdCBvZiBhIHNvdXJjZSB0aGF0IGhhcyBubyBjb3VudGVycGFydCBpbiB0aGUgdGFyZ2V0IGlzXHJcbiAqIHRha2VuIG92ZXIgYnkgcmVmZXJlbmNlLCBqdXN0IGxpa2UgT2JqZWN0LmFzc2lnbiBkb2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHRoZSB0YXJnZXQgb2JqZWN0IHRvIG1lcmdlIGludG8sIGEgbmV3IG9iamVjdCB3aGVuIGZhbHN5XHJcbiAqIEBwYXJhbSB7Li4ub2JqZWN0fSBzb3VyY2VzIHRoZSBzb3VyY2Ugb2JqZWN0cywgYXBwbGllZCBpbiBvcmRlclxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgdGFyZ2V0IG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBtZXJnZSh7YSA6IDF9LCB7YiA6IDJ9KTsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHthIDogMSwgYiA6IDJ9XHJcbiAqIG1lcmdlKHthIDoge3ggOiAxfX0sIHthIDoge3kgOiAyfX0pOyAgICAgICAgICAgICAgLy8ge2EgOiB7eCA6IDEsIHkgOiAyfX1cclxuICogbWVyZ2Uoe2EgOiBbMSwgMiwgM119LCB7YSA6IFs5XX0pOyAgICAgICAgICAgICAgICAvLyB7YSA6IFs5XX0sIHJlcGxhY2VkIGFzIGEgd2hvbGVcclxuICogbWVyZ2Uoe2EgOiBuZXcgRm9vKDEpfSwge2EgOiBuZXcgQmFyKDIpfSk7ICAgICAgICAvLyBhIHN0YXlzIGEgRm9vLCBjYXJyeWluZyB0aGUgcHJvcGVydGllcyBvZiBib3RoXHJcbiAqIG1lcmdlKHt9LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcclxuICovXHJcbmV4cG9ydCBjb25zdCBtZXJnZSA9ICh0YXJnZXQsIC4uLnNvdXJjZXMpID0+IHtcclxuXHRpZiAoIXRhcmdldCkgdGFyZ2V0ID0ge307XHJcblxyXG5cdHNvdXJjZXNcclxuXHRcdC5maWx0ZXIoKHNvdXJjZSkgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHNvdXJjZSkpXHJcblx0XHQuZm9yRWFjaCgoc291cmNlKSA9PiB7XHJcblx0XHRcdGNvbnN0IGtleXMgPSBhc3NpZ25hYmxlS2V5cyhzb3VyY2UpO1xyXG5cdFx0XHRrZXlzXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiBrZXkgIT0gXCJfX3Byb3RvX19cIilcclxuXHRcdFx0XHQuZmlsdGVyKChrZXkpID0+IHR5cGVvZiB0YXJnZXRba2V5XSAhPT0gXCJzeW1ib2xcIilcclxuXHRcdFx0XHQuZmlsdGVyKChrZXkpID0+IHR5cGVvZiBzb3VyY2Vba2V5XSAhPT0gXCJzeW1ib2xcIilcclxuXHRcdFx0XHQuZm9yRWFjaCgoa2V5KSA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IHNvdXJjZVtrZXldO1xyXG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudCA9IHRhcmdldFtrZXldO1xyXG5cclxuXHRcdFx0XHRcdGlmKGN1cnJlbnQgPT0gbnVsbCApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmKCB0eXBlb2YgY3VycmVudCAhPT0gdHlwZW9mIHZhbHVlICkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBNYXAgfHwgdmFsdWUgaW5zdGFuY2VvZiBNYXApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgRGF0ZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgUmVnRXhwIHx8IHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoaXNPYmplY3QoY3VycmVudCkgJiYgaXNPYmplY3QodmFsdWUpKSBtZXJnZShjdXJyZW50LCB2YWx1ZSk7XHJcblx0XHRcdFx0XHRlbHNlIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0cmV0dXJuIHRhcmdldDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWNpZGVzIHdoZXRoZXIgYSBzaW5nbGUgcHJvcGVydHkgaXMgdGFrZW4gb3ZlciBieSB7QGxpbmsgZmlsdGVyfS5cclxuICpcclxuICogQGNhbGxiYWNrIFByb3BlcnR5RmlsdGVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgdGhlIHByb3BlcnR5IGJlbG9uZ3MgdG9cclxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgdG8ga2VlcCB0aGUgcHJvcGVydHlcclxuICovXHJcblxyXG4vKipcclxuICogQnVpbGRzIGEge0BsaW5rIFByb3BlcnR5RmlsdGVyfSBhY2NlcHRpbmcgb3IgcmVqZWN0aW5nIGEgZml4ZWQgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcy5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICogQHBhcmFtIHtBcnJheTxzdHJpbmc+fSBvcHRpb25zLm5hbWVzIHRoZSBwcm9wZXJ0eSBuYW1lcyB0byBkZWNpZGUgb25cclxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmFsbG93ZWQgdHJ1ZSB0dXJucyB0aGUgbGlzdCBpbnRvIGFuIGFsbG93IGxpc3QsIGZhbHNlIGludG8gYSBkZW55IGxpc3RcclxuICogQHJldHVybnMge1Byb3BlcnR5RmlsdGVyfVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBkZW55ID0gYnVpbGRQcm9wZXJ0eUZpbHRlcih7bmFtZXMgOiBbXCJwYXNzd29yZFwiXSwgYWxsb3dlZCA6IGZhbHNlfSk7XHJcbiAqIGZpbHRlcih1c2VyLCBkZW55KTsgICAvLyBldmVyeSBwcm9wZXJ0eSBidXQgcGFzc3dvcmRcclxuICovXHJcbmV4cG9ydCBjb25zdCBidWlsZFByb3BlcnR5RmlsdGVyID0gKHsgbmFtZXMsIGFsbG93ZWQgfSkgPT4ge1xyXG5cdHJldHVybiAobmFtZSwgdmFsdWUsIGNvbnRleHQpID0+IHtcclxuXHRcdHJldHVybiBuYW1lcy5pbmNsdWRlcyhuYW1lKSA9PT0gYWxsb3dlZDtcclxuXHR9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlYnVpbGRzIGFuIEFycmF5LCBTZXQgb3IgTWFwIHdpdGggaXRzIHZhbHVlcyBmaWx0ZXJlZC4gQSBjb250YWluZXIga2VlcHMgYWxsIG9mIGl0cyBlbnRyaWVzIC1cclxuICogb25seSB0aGUgdmFsdWVzIGluc2lkZSBnZXQgZmlsdGVyZWQuIFRoZSBrZXlzIG9mIGEgTWFwIHN0YXkgdW50b3VjaGVkLCByZXBsYWNpbmcgdGhlbSB3b3VsZCBicmVha1xyXG4gKiBldmVyeSBsb29rdXAgYWdhaW5zdCB0aGUgcmVzdWx0LlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fFNldHxNYXB9IHZhbHVlXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7QXJyYXl8U2V0fE1hcH1cclxuICovXHJcbmNvbnN0IGZpbHRlckNvbnRhaW5lciA9ICh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA9PiB7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuXHRcdGNvbnN0IGNvcHkgPSBbXTtcclxuXHRcdGNvcGllcy5zZXQodmFsdWUsIGNvcHkpO1xyXG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB2YWx1ZSkgY29weS5wdXNoKGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0XHRyZXR1cm4gY29weTtcclxuXHR9XHJcblxyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xyXG5cdFx0Y29uc3QgY29weSA9IG5ldyBTZXQoKTtcclxuXHRcdGNvcGllcy5zZXQodmFsdWUsIGNvcHkpO1xyXG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB2YWx1ZSkgY29weS5hZGQoZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRcdHJldHVybiBjb3B5O1xyXG5cdH1cclxuXHJcblx0Y29uc3QgY29weSA9IG5ldyBNYXAoKTtcclxuXHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB2YWx1ZSkgY29weS5zZXQoa2V5LCBmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdHJldHVybiBjb3B5O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbHRlcnMgYSBzaW5nbGUgdmFsdWUsIGRpc3BhdGNoaW5nIG9uIHdoYXQgaXQgaXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlclxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRlZXBcclxuICogQHBhcmFtIHtXZWFrTWFwfSBjb3BpZXMgbWFwcyBhbiBvcmlnaW5hbCBvbnRvIGl0cyBmaWx0ZXJlZCBjb3B5XHJcbiAqIEByZXR1cm5zIHsqfSB0aGUgZmlsdGVyZWQgdmFsdWUsIG9yIHRoZSB2YWx1ZSBpdHNlbGYgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGZpbHRlclxyXG4gKi9cclxuY29uc3QgZmlsdGVyVmFsdWUgPSAodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiB2YWx1ZTtcclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlIHx8IHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gdmFsdWU7IC8vIGNhcnJ5IG5vIHByb3BlcnRpZXMgdG8gZmlsdGVyXHJcblxyXG5cdC8vIGEgdmFsdWUgc2VlbiBiZWZvcmUgY2xvc2VzIGEgY3ljbGUgLSBpdHMgY29weSBzdGFuZHMgaW4sIHNvIG5vdGhpbmcgdW5maWx0ZXJlZCBsZWFrcyBiYWNrIGluXHJcblx0aWYgKGNvcGllcy5oYXModmFsdWUpKSByZXR1cm4gY29waWVzLmdldCh2YWx1ZSk7XHJcblxyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5IHx8IHZhbHVlIGluc3RhbmNlb2YgU2V0IHx8IHZhbHVlIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gZmlsdGVyQ29udGFpbmVyKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpO1xyXG5cclxuXHRyZXR1cm4gZmlsdGVyT2JqZWN0KHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyB0aGUgZmlsdGVyZWQgY29weSBvZiBhbiBvYmplY3QuIFRoZSBjb3B5IGlzIHJlZ2lzdGVyZWQgYmVmb3JlIGl0IGlzIGZpbGxlZCwgc28gYSBjeWNsZVxyXG4gKiBydW5uaW5nIGJhY2sgaW50byBpdCByZXNvbHZlcyB0byB0aGUgY29weSBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlclxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRlZXBcclxuICogQHBhcmFtIHtXZWFrTWFwfSBjb3BpZXMgbWFwcyBhbiBvcmlnaW5hbCBvbnRvIGl0cyBmaWx0ZXJlZCBjb3B5XHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJPYmplY3QgPSAoZGF0YSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0ge307XHJcblx0Y29waWVzLnNldChkYXRhLCByZXN1bHQpO1xyXG5cclxuXHRmb3IgKGNvbnN0IG5hbWUgaW4gZGF0YSkge1xyXG5cdFx0Y29uc3QgdmFsdWUgPSBkYXRhW25hbWVdO1xyXG5cdFx0aWYgKHByb3BGaWx0ZXIobmFtZSwgdmFsdWUsIGRhdGEpKXtcclxuXHRcdFx0cmVzdWx0W25hbWVdID0gZGVlcCA/IGZpbHRlclZhbHVlKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpIDogdmFsdWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIG5ldyBvYmplY3QgaG9sZGluZyB0aGUgcHJvcGVydGllcyBhIGZpbHRlciBhY2NlcHRzLlxyXG4gKlxyXG4gKiBUaGUgZmlsdGVyIGlzIGNhbGxlZCBmb3IgZXZlcnkgZW51bWVyYWJsZSBwcm9wZXJ0eSwgaW5oZXJpdGVkIG9uZXMgaW5jbHVkZWQgLSBmaWx0ZXJpbmcgYSB3aW5kb3dcclxuICogcmVsaWVzIG9uIHRoYXQsIHNpbmNlIG1vc3Qgb2YgaXRzIG1lbWJlcnMgc2l0IG9uIHRoZSBwcm90b3R5cGUuXHJcbiAqXHJcbiAqIFdpdGggZGVlcCB0aGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gc3ViIG9iamVjdHMgYXMgd2VsbC4gQXJyYXksIFNldCBhbmQgTWFwIGFyZSByZWJ1aWx0IHdpdGggdGhlaXJcclxuICogdmFsdWVzIGZpbHRlcmVkLCBrZWVwaW5nIGFsbCBvZiB0aGVpciBlbnRyaWVzIGFuZCwgZm9yIGEgTWFwLCBpdHMga2V5cy4gRGF0ZSBhbmQgUmVnRXhwIGFyZSB0YWtlblxyXG4gKiBvdmVyIGFzIHRoZXkgYXJlLiBBIGN5Y2xpYyByZWZlcmVuY2UgcmVzb2x2ZXMgdG8gdGhlIGZpbHRlcmVkIGNvcHksIHNvIHRoZSByZXN1bHQgbmV2ZXIgY2FycmllcyBhXHJcbiAqIHJlZmVyZW5jZSBpbnRvIHRoZSB1bnRvdWNoZWQgb3JpZ2luYWwuXHJcbiAqXHJcbiAqIFdpdGhvdXQgZGVlcCB0aGUgYWNjZXB0ZWQgdmFsdWVzIGFyZSB0YWtlbiBvdmVyIGFzIHRoZXkgYXJlLCBzdWIgb2JqZWN0cyBieSByZWZlcmVuY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRoZSBvYmplY3QgdG8gYmUgZmlsdGVyZWRcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlciBkZWNpZGVzIHBlciBwcm9wZXJ0eSwgc2VlIHtAbGluayBidWlsZFByb3BlcnR5RmlsdGVyfVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcD1mYWxzZV0gZmlsdGVyIHN1YiBvYmplY3RzIHRvb1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBhIG5ldyBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZGVueSA9IGJ1aWxkUHJvcGVydHlGaWx0ZXIoe25hbWVzIDogW1wic2VjcmV0XCJdLCBhbGxvd2VkIDogZmFsc2V9KTtcclxuICpcclxuICogZmlsdGVyKHtzZWNyZXQgOiBcInhcIiwgYSA6IDF9LCBkZW55KTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHthIDogMX1cclxuICogZmlsdGVyKHtzdWIgOiB7c2VjcmV0IDogXCJ4XCIsIGEgOiAxfX0sIGRlbnksIHtkZWVwIDogdHJ1ZX0pOyAgICAgIC8vIHtzdWIgOiB7YSA6IDF9fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGZpbHRlciA9IChkYXRhLCBwcm9wRmlsdGVyLCB7IGRlZXAgPSBmYWxzZSB9ID0ge30pID0+IGZpbHRlck9iamVjdChkYXRhLCBwcm9wRmlsdGVyLCBkZWVwLCBuZXcgV2Vha01hcCgpKTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgY29uc3RhbnQsIG5vbiBlbnVtZXJhYmxlIHByb3BlcnR5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHsqfSB2YWx1ZSB0aGUgdmFsdWUsIG5laXRoZXIgd3JpdGFibGUgbm9yIGNvbmZpZ3VyYWJsZVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZWYWx1ZSA9IChvLCBuYW1lLCB2YWx1ZSkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHR2YWx1ZSxcclxuXHRcdHdyaXRhYmxlOiBmYWxzZSxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgcmVhZCBvbmx5LCBub24gZW51bWVyYWJsZSBwcm9wZXJ0eSBiYWNrZWQgYnkgYSBnZXR0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvIHRoZSBvYmplY3QgdG8gZGVmaW5lIHRoZSBwcm9wZXJ0eSBvblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXQgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZkdldCA9IChvLCBuYW1lLCBnZXQpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0Z2V0LFxyXG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBub24gZW51bWVyYWJsZSBwcm9wZXJ0eSBiYWNrZWQgYnkgYSBnZXR0ZXIgYW5kIGEgc2V0dGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzZXQgdGFrZXMgdGhlIG5ldyB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmR2V0U2V0ID0gKG8sIG5hbWUsIGdldCwgc2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdHNldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuXHRpc051bGxPclVuZGVmaW5lZCxcclxuXHRpc09iamVjdCxcclxuXHRpc1ByaW1pdGl2ZSxcclxuXHRlcXVhbFBvam8sXHJcblx0aXNQb2pvLFxyXG5cdGFwcGVuZCxcclxuXHRtZXJnZSxcclxuXHRmaWx0ZXIsXHJcblx0YnVpbGRQcm9wZXJ0eUZpbHRlcixcclxuXHRkZWZWYWx1ZSxcclxuXHRkZWZHZXQsXHJcblx0ZGVmR2V0U2V0LFxyXG59O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGlmKEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbikpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0d2hpbGUoaSA8IGRlZmluaXRpb24ubGVuZ3RoKSB7XG5cdFx0XHR2YXIga2V5ID0gZGVmaW5pdGlvbltpKytdO1xuXHRcdFx0dmFyIGJpbmRpbmcgPSBkZWZpbml0aW9uW2krK107XG5cdFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdFx0aWYoYmluZGluZyA9PT0gMCkge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IGRlZmluaXRpb25baSsrXSB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogYmluZGluZyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmKGJpbmRpbmcgPT09IDApIHsgaSsrOyB9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0Lmhhc093bihvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tIFwiLi9zcmMvdmVyc2lvbi5qc1wiO1xuXG5HTE9CQUwuZGVmYXVsdGpzID0gR0xPQkFMLmRlZmF1bHRqcyB8fCB7fTtcbkdMT0JBTC5kZWZhdWx0anMuZWwgPSBHTE9CQUwuZGVmYXVsdGpzLmVsIHx8IHtcblx0VkVSU0lPTixcblx0RXhwcmVzc2lvblJlc29sdmVyLFxuXHRFeGVjdXRlclJlZ2lzdHJ5XG59O1xuXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==