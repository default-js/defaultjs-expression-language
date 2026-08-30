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

	#defaultContext;
	#execution;

	/**
	 *
	 * @param {Object} option
	 * @param {Object} option.defaultContext
	 * @param {Function} option.execution
	 */
	constructor({defaultContext, execution} = {}){
		this.#defaultContext = defaultContext || {};
		this.#execution = execution || (() => {throw new Error("not implemented")});
	}

	get defaultContext(){
		return this.#defaultContext;
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
/* harmony import */ var _executer_WithScopedExecuter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./executer/WithScopedExecuter.js */ "./src/executer/WithScopedExecuter.js");
/* harmony import */ var _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ResolverContextHandle.js */ "./src/ResolverContextHandle.js");
/* harmony import */ var _Executer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Executer.js */ "./src/Executer.js");







/** @type {Executer} */
let DEFAULT_EXECUTER = _executer_WithScopedExecuter_js__WEBPACK_IMPORTED_MODULE_3__["default"];

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
	 * @param {{ context?: any; parent?: any; name?: any; }} options
	 * @param {object} [options.context=GLOBAL]
	 * @param {ExpressionResolver} [options.parent=null]
	 * @param {?string} [options.name=null] where none is passed, one is generated - 5.1
	 */
	constructor(options = {}) {
		const { context = null, parent = null, name = null, executer } = options;
		this.#executer = typeof executer === "string" ? (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__["default"])(executer) : ExpressionResolver.defaultExecuter;
		this.#parent = parent instanceof ExpressionResolver ? parent : null;
		this.#name = name || generateName();
		
		this.#contextHandle = new _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__["default"](context, this.#parent ? this.#parent.contextHandle : null);
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
	 * @static
	 * @async
	 * @param {string} aExpression
	 * @param {?object} aContext
	 * @param {?*} aDefault
	 * @param {?number} aTimeout
	 * @returns {Promise<*>}
	 */
	static async resolve(aExpression, aContext, aDefault, aTimeout) {
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
	 * @static
	 * @async
	 * @param {string} aText
	 * @param {?object} aContext
	 * @param {?*} aDefault
	 * @param {?number} aTimeout
	 * @returns {Promise<*>}
	 */
	static async resolveText(aText, aContext, aDefault, aTimeout) {
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



const VARNAME_CHECK = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;
const RESERVED_WORDS = new Set([
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"else",
	"export",
	"extends",
	"finally",
	"for",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"new",
	"return",
	"super",
	"switch",
	"this",
	"throw",
	"try",
	"typeof",
	"var",
	"void",
	"while",
	"with",
	"yield",
	"enum",
	"implements",
	"interface",
	"let",
	"package",
	"private",
	"protected",
	"public",
	"static",
	"await",
	"null",
	"true",
	"false",
	"constructor",
	"undefined",
]);

/**
 * Whether a name can stand for a variable in a statement.
 *
 * The same rule the property cache applies while it collects the names of a context - kept here
 * because the cache of a global context does not go through that loop and still has to answer the
 * same set of names.
 *
 * @param {string|symbol} name
 * @returns {boolean}
 */
const isVariableName = (name) => typeof name === "string" && !RESERVED_WORDS.has(name) && VARNAME_CHECK.test(name);

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
 * Because every name is present, such a link answers every lookup and nothing below it is
 * reached, and ownKeys reports every name of the global object.
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
			return Object.getOwnPropertyNames(_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"]).filter(isVariableName);
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
	/** @type {Map<string,ResolverContextHandle>|null} */
	#cache = null;
	/** @type {boolean} */
	#providesData = false;

	/**
	 * Creates an instance of Context.
	 *
	 * @constructor
	 * @param {object} context
	 * @param {ResolverContextHandle} parent
	 */
	constructor(context, parent) {
		this.#data = context || {};
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
						configurable: true,
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
		this.#data = data || {};
		this.#providesData = !(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(data);
		this.#cache = this.#initPropertyCache();
	}

	mergeData(data) {
		if (typeof data !== "object" || data == null) return;
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

		const cache = new Map();
		let type = data;
		while (!(0,_default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__.isNullOrUndefined)(type)) {
			for (let name of Reflect.ownKeys(type)) {
				if (typeof name !== "string"); //ignore non string property names
				else if (RESERVED_WORDS.has(name)); //ignore reserved words
				else if (!VARNAME_CHECK.test(name))
					console.warn(`Variable name is illegal ${name}, variable irgnored!`);
				else cache.set(name, this);
			}
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

/**
 *
 * @param {boolean} value
 */
const setDebug = (value) => {
	DEBUG = value;
}

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
const generate = (aStatement, contextProperties) => {
	const code = `
return (async ({${contextProperties}}) => {
    try{
        return ${aStatement}
    }catch(e){
        throw e;
    }
})(context || {});`;

	if (DEBUG)
		console.log("genererated code: \n", code);

	return new Function("context", code);
};

/**
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const getOrCreateFunction = (aStatement, contextProperties) => {
	const cacheKey = `${contextProperties}::${aStatement}`;
	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement, contextProperties);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({
	defaultContext: {},
	execution: (aStatement, aContext) => {
		const propertyNames = _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_3__["default"] === aContext ? [] : Object.getOwnPropertyNames(aContext || {});
		if(propertyNames.length > 50)
			console.warn(`High count of properties at first level, can be decrease the performence! count: ${propertyNames.length}`);

		const contextProperties = propertyNames.join(",");
		const expression = getOrCreateFunction(aStatement, contextProperties);
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
	defaultContext: {},
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



const EXECUTER = new _Executer_js__WEBPACK_IMPORTED_MODULE_1__["default"]({defaultContext: {}, execution: (aStatement, aContext) => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7OztBQ0poRDtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFFBQVE7QUFDdEIsY0FBYyxRQUFRO0FBQ3RCLGNBQWMsVUFBVTtBQUN4Qjs7QUFFQTtBQUNBLGFBQWEsUUFBUTtBQUNyQixjQUFjLFFBQVE7QUFDdEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlO0FBQ2YsWUFBWSxTQUFTO0FBQ3JCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0EsWUFBWSxtQkFBbUI7QUFDL0I7QUFDQSxZQUFZLHdCQUF3QjtBQUNwQztBQUNBLFlBQVksUUFBUTtBQUNwQjs7O0FBR0E7QUFDQSxZQUFZLGtCQUFrQjtBQUM5QjtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxrQkFBa0I7QUFDOUI7QUFDQSxTQUFTLGNBQWMsSUFBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ2U7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksR0FBRztBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEJlOztBQUVmO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCO0FBQ0EsY0FBYywyQkFBMkIsSUFBSTtBQUM3QztBQUNBLHlDQUF5QyxtQ0FBbUM7QUFDNUU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2QnFDOztBQUVyQzs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsVUFBVTtBQUNyQjtBQUNPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYjtBQUNPO0FBQ1A7QUFDQSw2Q0FBNkMsTUFBTTtBQUNuRDtBQUNBOztBQUVBLGlFQUFlLFdBQVcsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEJxRDtBQUNuQztBQUNPO0FBQ1c7QUFDQTtBQUMxQjs7QUFFckMsV0FBVyxVQUFVO0FBQ3JCLHVCQUF1Qix1RUFBZTs7QUFFdEM7QUFDQSw0QkFBNEI7QUFDNUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGdDQUFnQyx3REFBWTtBQUM1QztBQUNBLHNCQUFzQix3REFBWTs7QUFFbEMsWUFBWSx3REFBWTtBQUN4Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsZ0NBQWdDLGVBQWU7O0FBRS9DO0FBQ0EsbUVBQW1FO0FBQ25FO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFdBQVc7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDhCQUE4Qix3REFBWTtBQUMxQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7O0FBRXRCLFVBQVU7QUFDVjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUFtRDtBQUNuRDtBQUNBO0FBQ0EsdUVBQXVFO0FBQ3ZFO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQix3QkFBd0I7QUFDeEI7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsMkVBQTJFO0FBQ2pHO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBVSxtQkFBbUI7QUFDN0I7QUFDQSxxQkFBcUIsNEVBQTRFO0FBQ2pHO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ2U7QUFDZjtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0EsNkJBQTZCLG9EQUFRO0FBQ3JDLDBCQUEwQixnRUFBZTtBQUN6QztBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLGFBQWE7QUFDekI7QUFDQSxZQUFZLHlCQUF5QjtBQUNyQztBQUNBLFlBQVksZUFBZTtBQUMzQjtBQUNBLFlBQVksWUFBWTtBQUN4QjtBQUNBLFlBQVksNEJBQTRCO0FBQ3hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLGVBQWUsY0FBYyxlQUFlO0FBQzFELFlBQVksUUFBUTtBQUNwQixZQUFZLG9CQUFvQjtBQUNoQyxZQUFZLFNBQVM7QUFDckI7QUFDQSx5QkFBeUI7QUFDekIsVUFBVSx1REFBdUQ7QUFDakUsa0RBQWtELGdFQUFlO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixpRUFBcUI7QUFDakQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLDBCQUEwQixrQkFBa0IsR0FBRyxVQUFVLFFBQVEsVUFBVTtBQUMzRTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MscUJBQXFCLEdBQUcsVUFBVTtBQUNqRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCQUE2QixPQUFPO0FBQ3BDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLEdBQUc7QUFDZixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksSUFBSTtBQUNoQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQywwREFBMEQsS0FBSyxZQUFZOztBQUUzRyxZQUFZLG1CQUFtQjtBQUMvQjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLElBQUk7QUFDaEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQixZQUFZLElBQUk7QUFDaEIsWUFBWSxTQUFTO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0EsNENBQTRDLG1CQUFtQjtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7O0FBRUo7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQixZQUFZLElBQUk7QUFDaEIsWUFBWSxTQUFTO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0EsNENBQTRDLG1CQUFtQjtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7O0FBRUo7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCLFlBQVksUUFBUSxjQUFjLHNEQUFzRDtBQUN4RixZQUFZLFNBQVM7QUFDckIsWUFBWSxRQUFRO0FBQ3BCLFlBQVksb0JBQW9CO0FBQ2hDLFlBQVksUUFBUTtBQUNwQixjQUFjO0FBQ2Q7QUFDQSxzQkFBc0IsZ0NBQWdDLHdEQUF3RDtBQUM5RyxVQUFVLHNDQUFzQztBQUNoRCxZQUFZLG9HQUFrQix1QkFBdUIsS0FBSztBQUMxRCxrQ0FBa0MsaUNBQWlDO0FBQ25FO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2psQnNFO0FBQ29COztBQUUxRiw4QkFBOEIsU0FBUyxNQUFNLFlBQVk7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZUFBZTtBQUMxQixhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLGVBQWU7QUFDMUIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVMsd0dBQWlCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLHVCQUF1QjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EscUNBQXFDLHdGQUFNO0FBQzNDLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlO0FBQ2YsWUFBWSxZQUFZO0FBQ3hCO0FBQ0EsWUFBWSw0QkFBNEI7QUFDeEM7QUFDQSxZQUFZLGFBQWE7QUFDekI7QUFDQSxZQUFZLHdDQUF3QztBQUNwRDtBQUNBLFlBQVksU0FBUztBQUNyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLHVCQUF1QjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix3R0FBaUI7O0FBRXpDOztBQUVBLE1BQU0sd0ZBQU07QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0RBQStEO0FBQy9EO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBEQUEwRDtBQUMxRDtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3QkFBd0Isd0dBQWlCO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBLE1BQU0sd0ZBQU07QUFDWjs7QUFFQTtBQUNBO0FBQ0EsVUFBVSx3R0FBaUI7QUFDM0I7QUFDQSxtQ0FBbUM7QUFDbkMsd0NBQXdDO0FBQ3hDO0FBQ0EsOENBQThDLEtBQUs7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLFlBQVksUUFBUTtBQUNwQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZUb0Q7QUFDZDtBQUNFO0FBQzhCOztBQUV0RTtBQUNPOztBQUVQO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDTztBQUNQO0FBQ0E7O0FBRUEsNkJBQTZCLHFEQUFTLEdBQUcsWUFBWTs7QUFFckQ7QUFDQSxXQUFXLDRDQUE0QztBQUN2RDtBQUNPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsRUFBRSxtQkFBbUI7QUFDckM7QUFDQSxpQkFBaUI7QUFDakIsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDLGVBQWUsRUFBRTs7QUFFbEI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYTtBQUNiO0FBQ0E7QUFDQSxxQkFBcUIsa0JBQWtCLElBQUksV0FBVztBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsb0RBQVE7QUFDN0IsbUJBQW1CO0FBQ25CO0FBQ0Esd0JBQXdCLHdGQUFNLDhEQUE4RDtBQUM1RjtBQUNBLG9HQUFvRyxxQkFBcUI7O0FBRXpIO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRixDQUFDOztBQUVELGdFQUFVOztBQUVWLGlFQUFlLFFBQVEsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1RTRCO0FBQ2Q7QUFDRTs7QUFFakM7QUFDUCw2QkFBNkIscURBQVMsR0FBRyxZQUFZOztBQUVyRDtBQUNBLFdBQVcsNENBQTRDO0FBQ3ZEO0FBQ087QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDLGVBQWUsRUFBRTs7QUFFbEI7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHFCQUFxQixvREFBUTtBQUM3QixtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGLENBQUM7O0FBRUQsZ0VBQVU7O0FBRVYsaUVBQWUsUUFBUSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzdEMEI7QUFDWjtBQUNFOztBQUVqQztBQUNQLDZCQUE2QixxREFBUyxHQUFHLFlBQVk7O0FBRXJEO0FBQ0EsV0FBVyw0Q0FBNEM7QUFDdkQ7QUFDTztBQUNQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxFQUFFLGVBQWU7QUFDakI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBLHFCQUFxQixvREFBUSxFQUFFLGtCQUFrQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNILGdFQUFVOztBQUVWLGlFQUFlLFFBQVEsRUFBQzs7Ozs7Ozs7Ozs7Ozs7O0FDakV4QjtBQUNpQztBQUNHO0FBQ087Ozs7Ozs7Ozs7Ozs7Ozs7QUNIM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPOztBQUVQLGlFQUFlLE9BQU8sRUFBQzs7Ozs7Ozs7Ozs7Ozs7O0FDVnZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFNLHlCQUF5QixVQUFNO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQsaUVBQWUsTUFBTSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNuQnRCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYTtBQUNiLFlBQVksV0FBVztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGFBQWE7QUFDMUQsNkNBQTZDLEtBQUssYUFBYSxJQUFJLE1BQU0sTUFBTTtBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLDBCQUEwQjtBQUM1QztBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsS0FBSyxPQUFPO0FBQ3JELHdCQUF3QjtBQUN4Qix3QkFBd0I7QUFDeEI7QUFDZTtBQUNmO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRkFBcUY7QUFDckY7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLEdBQUc7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxHQUFHO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxHQUFHO0FBQ2Y7QUFDQTtBQUNBLDJCQUEyQixJQUFJO0FBQy9CLDJCQUEyQixJQUFJO0FBQy9CLDJCQUEyQixJQUFJO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQixZQUFZLFNBQVM7QUFDckIsY0FBYyxxQkFBcUI7QUFDbkMsYUFBYSxXQUFXO0FBQ3hCO0FBQ0E7QUFDQSx5QkFBeUIsS0FBSyxPQUFPLGtCQUFrQjtBQUN2RCx5QkFBeUIsY0FBYyxxQkFBcUI7QUFDNUQsMEJBQTBCLDZCQUE2QjtBQUN2RCx5QkFBeUIsTUFBTSx3QkFBd0I7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsY0FBYywwQ0FBMEMsaUJBQWlCO0FBQ3RGLHdCQUF3QixhQUFhO0FBQ3JDO0FBQ0E7QUFDQTtBQUNpRDtBQUNqRDtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsU0FBUztBQUNwQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixZQUFZO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsU0FBUztBQUNwQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEtBQUs7QUFDaEIsV0FBVyxLQUFLO0FBQ2hCLFdBQVcsU0FBUztBQUNwQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsU0FBUztBQUNwQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLGtCQUFrQixjQUFjO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWE7QUFDYjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsY0FBYztBQUNsRDtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWE7QUFDYjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEVBQTRFLGNBQWM7QUFDMUY7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWE7QUFDYjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxjQUFjO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxHQUFHO0FBQ2QsV0FBVyxHQUFHO0FBQ2QsYUFBYTtBQUNiO0FBQ0E7QUFDQSxjQUFjLFdBQVcsR0FBRyxXQUFXLGlCQUFpQjtBQUN4RCx3REFBd0Q7QUFDeEQsd0RBQXdEO0FBQ3hELHdEQUF3RDtBQUN4RDtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsVUFBVSxHQUFHO0FBQ2IsV0FBVyxHQUFHO0FBQ2QsV0FBVyxTQUFTO0FBQ3BCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxHQUFHO0FBQ2QsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxXQUFXLFNBQVM7QUFDcEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxhQUFhO0FBQ2I7QUFDQTtBQUNBLFdBQVcsS0FBSyxxQkFBcUIsS0FBSztBQUMxQyxXQUFXLGFBQWEsa0JBQWtCO0FBQzFDLFdBQVcsTUFBTSxjQUFjLEVBQUUsU0FBUztBQUMxQywwQ0FBMEM7QUFDMUM7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxHQUFHO0FBQ2QsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0Esb0JBQW9CLGVBQWUsSUFBSTtBQUN2QyxtQkFBbUIsTUFBTSxVQUFVLElBQUk7QUFDdkMsc0JBQXNCLGFBQWEsSUFBSSxLQUFLO0FBQzVDO0FBQ087QUFDUDtBQUNBLG1CQUFtQiwwREFBYztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFdBQVc7QUFDdEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQSxVQUFVLE1BQU0sR0FBRyxNQUFNLDRCQUE0QixJQUFJO0FBQ3pELFVBQVUsS0FBSyxPQUFPLEdBQUcsS0FBSyxPQUFPLGdCQUFnQixJQUFJLEtBQUs7QUFDOUQsVUFBVSxjQUFjLEdBQUcsUUFBUSxrQkFBa0IsSUFBSSxRQUFRO0FBQ2pFLFVBQVUsZUFBZSxHQUFHLGVBQWUsVUFBVTtBQUNyRCxXQUFXO0FBQ1g7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsYUFBYTtBQUNwRTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsR0FBRztBQUNkLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0EsYUFBYSxzQkFBc0I7QUFDbkM7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxlQUFlO0FBQzFCLFdBQVcsU0FBUztBQUNwQixhQUFhO0FBQ2I7QUFDQTtBQUNBLHFDQUFxQyxzQ0FBc0M7QUFDM0UseUJBQXlCO0FBQ3pCO0FBQ08sK0JBQStCLGdCQUFnQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxlQUFlO0FBQzFCLFdBQVcsZ0JBQWdCO0FBQzNCLFdBQVcsU0FBUztBQUNwQixXQUFXLFNBQVM7QUFDcEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxXQUFXLGdCQUFnQjtBQUMzQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxTQUFTO0FBQ3BCLGFBQWEsR0FBRztBQUNoQjtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLGdCQUFnQjtBQUMzQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxTQUFTO0FBQ3BCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLGdCQUFnQixzQ0FBc0M7QUFDakUsV0FBVyxRQUFRO0FBQ25CLFdBQVcsU0FBUztBQUNwQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBLHFDQUFxQyxvQ0FBb0M7QUFDekU7QUFDQSxXQUFXLG9CQUFvQixxQ0FBcUMsSUFBSTtBQUN4RSxXQUFXLE9BQU8scUJBQXFCLFNBQVMsWUFBWSxRQUFRLElBQUksT0FBTztBQUMvRTtBQUNPLG9DQUFvQyxlQUFlLElBQUk7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsR0FBRztBQUNkLGFBQWE7QUFDYjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFVBQVU7QUFDckIsYUFBYTtBQUNiO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFVBQVU7QUFDckIsV0FBVyxVQUFVO0FBQ3JCLGFBQWE7QUFDYjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0EsaUVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLEVBQUM7Ozs7Ozs7VUMxbUJGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDNUJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLDJDQUEyQywwQ0FBMEM7V0FDckYsTUFBTTtXQUNOLDJDQUEyQyxnQ0FBZ0M7V0FDM0U7V0FDQSxLQUFLLHlCQUF5QjtXQUM5QjtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsMENBQTBDLHdDQUF3QztXQUNsRjtXQUNBO1dBQ0E7V0FDQSxFOzs7OztXQ3RCQSxpRTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTmtFO0FBQ0k7QUFDM0I7O0FBRTNDLHdGQUFNLGFBQWEsd0ZBQU07QUFDekIsd0ZBQU0sZ0JBQWdCLHdGQUFNO0FBQzVCLFFBQVE7QUFDUixtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCOztBQUVnRCIsInNvdXJjZXMiOlsid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvQ29kZUNhY2hlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0RlZmF1bHRWYWx1ZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9FeGVjdXRlclJlZ2lzdHJ5LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0V4cHJlc3Npb25SZXNvbHZlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9SZXNvbHZlckNvbnRleHRIYW5kbGUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9Db250ZXh0T2JqZWN0RXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvV2l0aFNjb3BlZEV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL2luZGV4LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL3ZlcnNpb24uanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9ub2RlX21vZHVsZXMvQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFByb3BlcnR5LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9icm93c2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHByZXNzaW9uUmVzb2x2ZXIgZnJvbSBcIi4vc3JjL0V4cHJlc3Npb25SZXNvbHZlci5qc1wiO1xuaW1wb3J0IFwiLi9zcmMvZXhlY3V0ZXIvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIEV4ZWN1dGVyUmVnaXN0cnkgZnJvbSBcIi4vc3JjL0V4ZWN1dGVyUmVnaXN0cnkuanNcIlxuXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcbiIsIi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gQ2FjaGVFbnRyeVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGxhc3RIaXQgLSBNb25vdG9uaWMgbWFya2VyIG9mIHRoZSBsYXN0IHJlYWQgb3Igd3JpdGUsIHRoZSBldmljdGlvbiBvcmRlci5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBrZXlcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHZhbHVlXG4gKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb2RlQ2FjaGVPcHRpb25zXG4gKiBAcHJvcGVydHkge251bWJlcn0gW3NpemU9MTAwMF0gLSBNYXhpbXVtIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjYWNoZS4gSWYgc2V0IHRvIDAgb3IgbGVzcywgY2FjaGluZyBpcyBkaXNhYmxlZC5cbiAqL1xuXG4vKipcbiAqIENvZGVDYWNoZSBjbGFzcyB0byBtYW5hZ2UgY2FjaGluZyBvZiBnZW5lcmF0ZWQgY29kZSBzbmlwcGV0cy5cbiAqXG4gKiBFbnRyaWVzIGFyZSBldmljdGVkIGxlYXN0IHJlY2VudGx5IHVzZWQgZmlyc3Q6IGV2ZXJ5IGhpdCByZWZyZXNoZXMgdGhlIGVudHJ5LCBzbyBhblxuICogZXhwcmVzc2lvbiB0aGF0IGtlZXBzIGJlaW5nIHJlc29sdmVkIG91dGxpdmVzIG9uZSB0aGF0IHdhcyBjb21waWxlZCBvbmNlIGFuZCBkcm9wcGVkLlxuICogVGhlIG1hcmtlciBpcyBhIGNvdW50ZXIgcmF0aGVyIHRoYW4gYSB0aW1lc3RhbXAg4oCUIGEgYnVyc3Qgb2YgZmlyc3QtdGltZSBjb21waWxhdGlvbnNcbiAqIGZhbGxzIGludG8gYSBzaW5nbGUgbWlsbGlzZWNvbmQsIHdoaWNoIHdvdWxkIGxlYXZlIHRoZSBldmljdGlvbiBvcmRlciB0byBjaGFuY2UuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVDYWNoZSB7XG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cblx0I2Rpc2FibGVkID0gZmFsc2U7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjc2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuXHQjbWF4U2l6ZSA9IDA7XG5cdC8qKiBAdHlwZSB7QXJyYXk8Q2FjaGVFbnRyeT59ICovXG5cdCNlbnRyaWVzID0gW107XG5cdC8qKiBAdHlwZSB7TWFwPHN0cmluZyxDYWNoZUVudHJ5Pn0gKi9cblx0I2VudHJ5TWFwID0gbmV3IE1hcCgpO1xuXHQvKiogQHR5cGUge251bWJlcn0gLSBIYW5kcyBvdXQgdGhlIGBsYXN0SGl0YCBtYXJrZXJzLCBuZXZlciByZXNldC4gKi9cblx0I2Nsb2NrID0gMDtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuc2V0dXAob3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwbGllcyBhIG5ldyBzaXplLiBBIHNpemUgb2YgMCBvciBsZXNzIGRpc2FibGVzIHRoZSBjYWNoZSBhbmQgcmVsZWFzZXMgaXRzIGVudHJpZXMsXG5cdCAqIGEgbGF0ZXIgcG9zaXRpdmUgc2l6ZSBlbmFibGVzIGl0IGFnYWluIGFuZCBzdGFydHMgZW1wdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Q29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuXHQgKi9cblx0c2V0dXAoeyBzaXplID0gMTAwMCB9ID0ge30pIHtcblx0XHR0aGlzLiNkaXNhYmxlZCA9IHNpemUgPD0gMDtcblx0XHRpZiAodGhpcy4jZGlzYWJsZWQpIHtcblx0XHRcdHRoaXMuI3NpemUgPSAwO1xuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IDA7XG5cdFx0XHR0aGlzLmNsZWFyKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuI3NpemUgPSBzaXplO1xuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IE1hdGguZmxvb3Ioc2l6ZSAqIDEuMSk7XG5cdFx0XHR0aGlzLiN0cmltKCk7XG5cdFx0fVxuXHR9XG5cblx0aGFzKGtleSkge1xuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHRoaXMuI2VudHJ5TWFwLmhhcyhrZXkpO1xuXHR9XG5cblx0Z2V0KGtleSkge1xuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm4gbnVsbDtcblx0XHRjb25zdCBlbnRyeSA9IHRoaXMuI2VudHJ5TWFwLmdldChrZXkpO1xuXHRcdGlmIChlbnRyeSkge1xuXHRcdFx0ZW50cnkubGFzdEhpdCA9ICsrdGhpcy4jY2xvY2s7XG5cdFx0XHRyZXR1cm4gZW50cnkudmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0c2V0KGtleSwgY29kZSkge1xuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm47XG5cdFx0bGV0IGVudHJ5ID0gdGhpcy4jZW50cnlNYXAuZ2V0KGtleSk7XG5cdFx0aWYgKGVudHJ5KSB7XG5cdFx0XHRlbnRyeS5sYXN0SGl0ID0gKyt0aGlzLiNjbG9jaztcblx0XHRcdGVudHJ5LnZhbHVlID0gY29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZW50cnkgPSB7XG5cdFx0XHRcdGxhc3RIaXQ6ICsrdGhpcy4jY2xvY2ssXG5cdFx0XHRcdGtleSxcblx0XHRcdFx0dmFsdWU6IGNvZGUsXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy4jZW50cmllcy5wdXNoKGVudHJ5KTtcblx0XHRcdHRoaXMuI2VudHJ5TWFwLnNldChrZXksIGVudHJ5KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy4jZW50cnlNYXAuc2l6ZSA+PSB0aGlzLiNtYXhTaXplKSB0aGlzLiN0cmltKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLiNlbnRyaWVzID0gW107XG5cdFx0dGhpcy4jZW50cnlNYXAgPSBuZXcgTWFwKCk7XG5cdH1cblxuXHQjdHJpbSgpIHtcblx0XHR0aGlzLiNlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGIubGFzdEhpdCAtIGEubGFzdEhpdCk7XG5cdFx0aWYgKHRoaXMuI2VudHJpZXMubGVuZ3RoID4gdGhpcy4jc2l6ZSkge1xuXHRcdFx0Y29uc3QgZW50cmllc1RvUmVtb3ZlID0gdGhpcy4jZW50cmllcy5zcGxpY2UodGhpcy4jc2l6ZSk7XG5cdFx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXNUb1JlbW92ZSkge1xuXHRcdFx0XHR0aGlzLiNlbnRyeU1hcC5kZWxldGUoZW50cnkua2V5KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG4iLCIvKipcbiAqIG9iamVjdCBmb3IgZGVmYXVsdCB2YWx1ZVxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBEZWZhdWx0VmFsdWVcbiAqIEB0eXBlZGVmIHtEZWZhdWx0VmFsdWV9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlZmF1bHRWYWx1ZSB7XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIERlZmF1bHRWYWx1ZS5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWVcblx0ICovXG5cdGNvbnN0cnVjdG9yKHZhbHVlKXtcblx0XHR0aGlzLmhhc1ZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAxO1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0fVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4ZWN1dGVye1xuXG5cdCNkZWZhdWx0Q29udGV4dDtcblx0I2V4ZWN1dGlvbjtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uLmRlZmF1bHRDb250ZXh0XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbi5leGVjdXRpb25cblx0ICovXG5cdGNvbnN0cnVjdG9yKHtkZWZhdWx0Q29udGV4dCwgZXhlY3V0aW9ufSA9IHt9KXtcblx0XHR0aGlzLiNkZWZhdWx0Q29udGV4dCA9IGRlZmF1bHRDb250ZXh0IHx8IHt9O1xuXHRcdHRoaXMuI2V4ZWN1dGlvbiA9IGV4ZWN1dGlvbiB8fCAoKCkgPT4ge3Rocm93IG5ldyBFcnJvcihcIm5vdCBpbXBsZW1lbnRlZFwiKX0pO1xuXHR9XG5cblx0Z2V0IGRlZmF1bHRDb250ZXh0KCl7XG5cdFx0cmV0dXJuIHRoaXMuI2RlZmF1bHRDb250ZXh0O1xuXHR9XG5cblx0ZXhlY3V0ZShhU3RhdGVtZW50LCBhQ29udGV4dCl7XG5cdFx0cmV0dXJuIHRoaXMuI2V4ZWN1dGlvbihhU3RhdGVtZW50LCBhQ29udGV4dCk7XG5cdH1cbn07XG4iLCJpbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4vRXhlY3V0ZXIuanNcIjtcblxuY29uc3QgRVhFQ1VURVJTID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEBwYXJhbSB7RXhlY3V0ZXJ9IGFuRXhlY3V0ZXJcbiAqL1xuZXhwb3J0IGNvbnN0IHJlZ2lzdHJhdGUgPSAoYU5hbWUsIGFuRXhlY3V0ZXIpID0+IHtcblx0RVhFQ1VURVJTLnNldChhTmFtZSwgYW5FeGVjdXRlcik7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYU5hbWVcbiAqIEByZXR1cm5zIHtFeGVjdXRlcn1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4ZWN1dGVyID0gKGFOYW1lKSA9PiB7XG5cdGNvbnN0IGV4ZWN1dGVyID0gRVhFQ1VURVJTLmdldChhTmFtZSk7XG5cdGlmICghZXhlY3V0ZXIpIHRocm93IG5ldyBFcnJvcihgRXhlY3V0ZXIgXCIke2FOYW1lfVwiIGlzIG5vdCByZWdpc3RyYXRlZCFgKTtcblx0cmV0dXJuIGV4ZWN1dGVyO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RXhlY3V0ZXI7XG4iLCJpbXBvcnQgT2JqZWN0VXRpbHMgZnJvbSBcIkBkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL09iamVjdFV0aWxzLmpzXCI7XG5pbXBvcnQgRGVmYXVsdFZhbHVlIGZyb20gXCIuL0RlZmF1bHRWYWx1ZS5qc1wiO1xuaW1wb3J0IGdldEV4ZWN1dGVyVHlwZSBmcm9tIFwiLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRGVmYXVsdEV4ZWN1dGVyIGZyb20gXCIuL2V4ZWN1dGVyL1dpdGhTY29wZWRFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFJlc29sdmVyQ29udGV4dEhhbmRsZSBmcm9tIFwiLi9SZXNvbHZlckNvbnRleHRIYW5kbGUuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi9FeGVjdXRlci5qc1wiO1xuXG4vKiogQHR5cGUge0V4ZWN1dGVyfSAqL1xubGV0IERFRkFVTFRfRVhFQ1VURVIgPSBEZWZhdWx0RXhlY3V0ZXI7XG5cbmNvbnN0IEVYRUNVVElPTl9XQVJOX1RJTUVPVVQgPSAxMDAwO1xuY29uc3QgRVhQUkVTU0lPTl9TVEFSVCA9IFwiJHtcIjtcbmNvbnN0IEVYUFJFU1NJT05fU0NPUEUgPSAvXihbYS16QS1aMC05XFwtX1xcc10rKTo6LztcblxuLy8gdGhlIHNjYW5uZXIgc3RhdGVzIC0gZXZlcnl0aGluZyB0aGF0IGlzIG5vdCBjb2RlIGhpZGVzIHRoZSBicmFjZXMgaW5zaWRlIGl0LCBzZWVcbi8vIFNQRUNJRklDQVRJT04ubWQgMy4xXG5jb25zdCBDT0RFID0gMDtcbmNvbnN0IFNJTkdMRV9RVU9URUQgPSAxO1xuY29uc3QgRE9VQkxFX1FVT1RFRCA9IDI7XG5jb25zdCBURU1QTEFURSA9IDM7XG5jb25zdCBSRUdFWCA9IDQ7XG5jb25zdCBSRUdFWF9DTEFTUyA9IDU7XG5cbi8vIGEgXCIvXCIgY29udGludWVzIGFuIGV4cHJlc3Npb24gaW5zdGVhZCBvZiBvcGVuaW5nIGEgcmVndWxhciBleHByZXNzaW9uIHdoZW4gaXQgZm9sbG93cyBvbmUgb2Zcbi8vIHRoZXNlIC0gdGhlIGNsYXNzaWMgZGl2aXNpb24tb3ItcmVnZXggcXVlc3Rpb24sIGRlY2lkZWQgb24gdGhlIGxhc3QgY2hhcmFjdGVyIHRoYXQgaXMgbm90XG4vLyB3aGl0ZXNwYWNlXG5jb25zdCBCRUZPUkVfRElWSVNJT04gPSAvW2EtekEtWjAtOV8kKVxcXV0vO1xuY29uc3QgV0hJVEVTUEFDRSA9IC9cXHMvO1xuXG5jb25zdCBERUZBVUxUX05PVF9ERUZJTkVEID0gbmV3IERlZmF1bHRWYWx1ZSgpO1xuY29uc3QgdG9EZWZhdWx0VmFsdWUgPSAodmFsdWUpID0+IHtcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRGVmYXVsdFZhbHVlKSByZXR1cm4gdmFsdWU7XG5cblx0cmV0dXJuIG5ldyBEZWZhdWx0VmFsdWUodmFsdWUpO1xufTtcblxubGV0IE5BTUVfQ09VTlRFUiA9IDA7XG4vKipcbiAqIFRoZSBuYW1lIGEgcmVzb2x2ZXIgY2FycmllcyB3aGVyZSB0aGUgY2FsbGVyIHBhc3NlZCBub25lLiBPbmx5IHVuaXF1ZW5lc3MgaXMgcHJvbWlzZWQsIHRoZSBzaGFwZVxuICogaXMgbm90IC0gU1BFQ0lGSUNBVElPTi5tZCA1LjEuXG4gKlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgZ2VuZXJhdGVOYW1lID0gKCkgPT4gYEVSJHsrK05BTUVfQ09VTlRFUn1gO1xuXG5jb25zdCBleGVjdXRlID0gYXN5bmMgZnVuY3Rpb24gKGFuRXhlY3V0ZXIsIGFTdGF0ZW1lbnQsIGFDb250ZXh0KSB7XG5cdC8vIDMuNDogYW4gZW1wdHkgc3RhdGVtZW50IGFuc3dlcnMgdW5kZWZpbmVkLCB0aGUgc2FtZSBhcyBgcmV0dXJuO2AgaW4gSmF2YVNjcmlwdFxuXHRpZiAoYVN0YXRlbWVudCA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRpZiAodHlwZW9mIGFTdGF0ZW1lbnQgIT09IFwic3RyaW5nXCIpIHJldHVybiBhU3RhdGVtZW50O1xuXHRhU3RhdGVtZW50ID0gbm9ybWFsaXplKGFTdGF0ZW1lbnQpO1xuXHRpZiAoYVN0YXRlbWVudCA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdC8vIGFuIGVycm9yIGlzIGRlbGliZXJhdGVseSBub3QgY2F1Z2h0IGhlcmU6IHNlY3Rpb24gNyBnaXZlcyB0aGUgdHdvIGVudHJ5IHBvaW50cyBkaWZmZXJlbnRcblx0Ly8gYW5zd2VycyB0byBpdCwgc28gZWFjaCBvZiB0aGVtIGhhbmRsZXMgaXQgZm9yIGl0c2VsZlxuXHRjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dChcblx0XHQoKSA9PlxuXHRcdFx0Y29uc29sZS53YXJuKGBMb25nIHJ1bm5pbmcgc3RhdGVtZW50OlxuXHRcdFx0XHRcIiR7YVN0YXRlbWVudH1cIlxuXHRcdFx0YCksXG5cdFx0RVhFQ1VUSU9OX1dBUk5fVElNRU9VVCxcblx0KTtcblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgYW5FeGVjdXRlci5leGVjdXRlKGFTdGF0ZW1lbnQsIGFDb250ZXh0KTtcblx0fSBmaW5hbGx5IHtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdH1cbn07XG5cbmNvbnN0IHdhcm5GYWlsZWRTdGF0ZW1lbnQgPSAoYVN0YXRlbWVudCwgYW5FcnJvcikgPT4ge1xuXHRjb25zb2xlLndhcm4oYEV4ZWN1dGlvbiBlcnJvciBvbiBzdGF0ZW1lbnQhXG5cdFx0c3RhdGVtZW50OlxuXHRcdCR7YVN0YXRlbWVudH1cblx0XHRlcnJvcjpcblx0XHQke2FuRXJyb3J9XG5cdFx0YCk7XG59O1xuXG5jb25zdCB3aXRoRGVmYXVsdCA9IChhUmVzdWx0LCBhRGVmYXVsdCkgPT4ge1xuXHRpZiAoYVJlc3VsdCAhPT0gbnVsbCAmJiB0eXBlb2YgYVJlc3VsdCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGFSZXN1bHQ7XG5cdGVsc2UgaWYgKGFEZWZhdWx0IGluc3RhbmNlb2YgRGVmYXVsdFZhbHVlICYmIGFEZWZhdWx0Lmhhc1ZhbHVlKSByZXR1cm4gYURlZmF1bHQudmFsdWU7XG5cdHJldHVybiBhUmVzdWx0O1xufTtcblxuY29uc3QgcmVzb2x2ZSA9IGFzeW5jIGZ1bmN0aW9uIChhRXhlY3V0ZXIgPSBERUZBVUxUX0VYRUNVVEVSLCBhUmVzb2x2ZXIsIGFFeHByZXNzaW9uLCBhRmlsdGVyLCBhRGVmYXVsdCkge1xuXHQvLyBhIHNjb3BlIG5vIGxpbmsgb2YgdGhlIGNoYWluIGNhcnJpZXMgYW5zd2VycyB1bmRlZmluZWQsIGFuZCB0aGUgZGVmYXVsdCBhcHBsaWVzIHRvIGl0IGxpa2Vcblx0Ly8gdG8gYW55IG90aGVyIHJlc3VsdCAtIHNlZSBTUEVDSUZJQ0FUSU9OLm1kIDUuNFxuXHRpZiAoYUZpbHRlciAmJiBhUmVzb2x2ZXIubmFtZSAhPSBhRmlsdGVyKVxuXHRcdHJldHVybiBhUmVzb2x2ZXIucGFyZW50ID8gcmVzb2x2ZShhRXhlY3V0ZXIsIGFSZXNvbHZlci5wYXJlbnQsIGFFeHByZXNzaW9uLCBhRmlsdGVyLCBhRGVmYXVsdCkgOiB3aXRoRGVmYXVsdCh1bmRlZmluZWQsIGFEZWZhdWx0KTtcblxuXHRyZXR1cm4gd2l0aERlZmF1bHQoYXdhaXQgZXhlY3V0ZShhRXhlY3V0ZXIsIGFFeHByZXNzaW9uLCBhUmVzb2x2ZXIuY29udGV4dCksIGFEZWZhdWx0KTtcbn07XG5cbmNvbnN0IG5vcm1hbGl6ZSA9ICh2YWx1ZSkgPT4ge1xuXHRpZiAodmFsdWUpIHtcblx0XHR2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcblx0XHRyZXR1cm4gdmFsdWUubGVuZ3RoID09IDAgPyBudWxsIDogdmFsdWU7XG5cdH1cblx0cmV0dXJuIG51bGw7XG59O1xuXG5jb25zdCB0b1RleHQgPSAoYVZhbHVlKSA9PiAodHlwZW9mIGFWYWx1ZSA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBhVmFsdWUgPT09IG51bGwgPyBcIm51bGxcIiA6IGFWYWx1ZSk7XG5cbmNvbnN0IHN0YXJ0c1JlZ2V4ID0gKGFUZXh0LCBhSW5kZXgpID0+IHtcblx0bGV0IGluZGV4ID0gYUluZGV4IC0gMTtcblx0d2hpbGUgKGluZGV4ID49IDAgJiYgV0hJVEVTUEFDRS50ZXN0KGFUZXh0W2luZGV4XSkpIGluZGV4LS07XG5cblx0cmV0dXJuIGluZGV4IDwgMCB8fCAhQkVGT1JFX0RJVklTSU9OLnRlc3QoYVRleHRbaW5kZXhdKTtcbn07XG5cbi8qKlxuICogU3BsaXRzIHRoZSB0ZXh0IGJldHdlZW4gdGhlIGRlbGltaXRlcnMgaW50byB0aGUgc2NvcGUgcHJlZml4IG9mIDMuMyBhbmQgdGhlIHN0YXRlbWVudC4gQm90aFxuICogZW50cnkgcG9pbnRzIHBhcnNlIHRoZSBwcmVmaXggdGhyb3VnaCB0aGlzLCBzbyB0aGVyZSBpcyBvbmUgcnVsZSBmb3IgaXQgYW5kIG5vdCB0d28uXG4gKi9cbmNvbnN0IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnQgPSAoYUNvbnRlbnQpID0+IHtcblx0Y29uc3Qgc2NvcGUgPSBFWFBSRVNTSU9OX1NDT1BFLmV4ZWMoYUNvbnRlbnQpO1xuXHRpZiAoIXNjb3BlKSByZXR1cm4geyBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBub3JtYWxpemUoYUNvbnRlbnQpIH07XG5cblx0cmV0dXJuIHsgc2NvcGU6IG5vcm1hbGl6ZShzY29wZVsxXSksIHN0YXRlbWVudDogbm9ybWFsaXplKGFDb250ZW50LnN1YnN0cmluZyhzY29wZVswXS5sZW5ndGgpKSB9O1xufTtcblxuY29uc3QgY291bnRCYWNrc2xhc2hlcyA9IChhVGV4dCwgYUluZGV4KSA9PiB7XG5cdGxldCBjb3VudCA9IDA7XG5cdHdoaWxlIChhSW5kZXggLSBjb3VudCA+IDAgJiYgYVRleHRbYUluZGV4IC0gY291bnQgLSAxXSA9PT0gXCJcXFxcXCIpIGNvdW50Kys7XG5cblx0cmV0dXJuIGNvdW50O1xufTtcblxuLyoqXG4gKiBTY2FucyB0aGUgb25lIGV4cHJlc3Npb24gdGhhdCBvcGVucyB3aXRoIHRoZSBcIiR7XCIgYXQgYVN0YXJ0LCBjb3VudGluZyBicmFjZXMgYnV0IG5vdCB0aGUgb25lc1xuICogaGlkZGVuIGluc2lkZSBhIGxpdGVyYWwuXG4gKlxuICogQW5zd2VycyBhIHBvc2l0aXZlIGluZGV4IGRpcmVjdGx5IGFmdGVyIHRoZSBtYXRjaGluZyBjbG9zaW5nIGJyYWNlOyAwIHdoZXJlIHRoZSB0ZXh0IGVuZHNcbiAqIGJlZm9yZSB0aGF0IGJyYWNlLCB3aGljaCBwZXIgU1BFQ0lGSUNBVElPTi5tZCAzLjEgbWVhbnMgdGhlcmUgaXMgbm8gZXhwcmVzc2lvbiBoZXJlIGF0IGFsbDtcbiAqIGFuZCB0aGUgbmVnYXRlZCBpbmRleCBvZiBhbm90aGVyIFwiJHtcIiBtZXQgb3V0c2lkZSBhIGxpdGVyYWwsIHdoaWNoIHN0YXJ0cyBhbiBleHByZXNzaW9uIG9mIGl0c1xuICogb3duIGFuZCBhYmFuZG9ucyB0aGlzIG9uZS5cbiAqL1xuY29uc3Qgc2NhbkV4cHJlc3Npb24gPSAoYVRleHQsIGFTdGFydCkgPT4ge1xuXHRjb25zdCBsZW5ndGggPSBhVGV4dC5sZW5ndGg7XG5cdGNvbnN0IHN0YWNrID0gW0NPREVdO1xuXHRsZXQgaW5kZXggPSBhU3RhcnQgKyAyO1xuXG5cdHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuXHRcdGNvbnN0IGNoYXIgPSBhVGV4dFtpbmRleF07XG5cdFx0c3dpdGNoIChzdGFja1tzdGFjay5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBDT0RFOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gXCJ7XCIpIHN0YWNrLnB1c2goQ09ERSk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwifVwiKSB7XG5cdFx0XHRcdFx0c3RhY2sucG9wKCk7XG5cdFx0XHRcdFx0aWYgKHN0YWNrLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGluZGV4ICsgMTtcblx0XHRcdFx0fSBlbHNlIGlmIChjaGFyID09PSBcIidcIikgc3RhY2sucHVzaChTSU5HTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gJ1wiJykgc3RhY2sucHVzaChET1VCTEVfUVVPVEVEKTtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCJgXCIpIHN0YWNrLnB1c2goVEVNUExBVEUpO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIiRcIiAmJiBhVGV4dFtpbmRleCArIDFdID09PSBcIntcIikgcmV0dXJuIC1pbmRleDtcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gXCIvXCIgJiYgc3RhcnRzUmVnZXgoYVRleHQsIGluZGV4KSkgc3RhY2sucHVzaChSRUdFWCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBTSU5HTEVfUVVPVEVEOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJ1wiKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIERPVUJMRV9RVU9URUQ6XG5cdFx0XHRcdGlmIChjaGFyID09PSBcIlxcXFxcIikgaW5kZXgrKztcblx0XHRcdFx0ZWxzZSBpZiAoY2hhciA9PT0gJ1wiJykgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBURU1QTEFURTpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBcImBcIikgc3RhY2sucG9wKCk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiJFwiICYmIGFUZXh0W2luZGV4ICsgMV0gPT09IFwie1wiKSB7XG5cdFx0XHRcdFx0c3RhY2sucHVzaChDT0RFKTtcblx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBSRUdFWDpcblx0XHRcdFx0aWYgKGNoYXIgPT09IFwiXFxcXFwiKSBpbmRleCsrO1xuXHRcdFx0XHRlbHNlIGlmIChjaGFyID09PSBcIltcIikgc3RhY2sucHVzaChSRUdFWF9DTEFTUyk7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiL1wiKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFJFR0VYX0NMQVNTOlxuXHRcdFx0XHRpZiAoY2hhciA9PT0gXCJcXFxcXCIpIGluZGV4Kys7XG5cdFx0XHRcdGVsc2UgaWYgKGNoYXIgPT09IFwiXVwiKSBzdGFjay5wb3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGluZGV4Kys7XG5cdH1cblxuXHRyZXR1cm4gMDtcbn07XG5cbi8qKlxuICogQW5zd2VycyBldmVyeSBleHByZXNzaW9uIG9mIGEgdGV4dCwgaW4gdGhlIG9yZGVyIHRoZXkgc3RhbmQsIG9yIG51bGwgd2hlcmUgdGhlIHRleHQgY2Fycmllc1xuICogbm9uZS4gYHN0YXJ0YCBpcyB0aGUgaW5kZXggb2YgdGhlIFwiJFwiLCBgZW5kYCB0aGUgaW5kZXggYWZ0ZXIgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2UsIHNvIGFcbiAqIGNhbGxlciByZXBsYWNlcyBieSBwb3NpdGlvbiBhbmQgbmV2ZXIgdG91Y2hlcyBhbiBvY2N1cnJlbmNlIHR3aWNlLlxuICovXG5jb25zdCBzY2FuID0gKGFUZXh0KSA9PiB7XG5cdGxldCBvY2N1cnJlbmNlcyA9IG51bGw7XG5cdGxldCBpbmRleCA9IGFUZXh0LmluZGV4T2YoRVhQUkVTU0lPTl9TVEFSVCk7XG5cblx0d2hpbGUgKGluZGV4ID49IDApIHtcblx0XHQvLyAzLjI6IGFuIG9kZCBydW4gb2YgYmFja3NsYXNoZXMgZXNjYXBlcyB0aGUgZGVsaW1pdGVyIGl0c2VsZi4gSXQgb3BlbnMgbm90aGluZywgc28gb25seVxuXHRcdC8vIHRob3NlIHR3byBjaGFyYWN0ZXJzIGFyZSB0YWtlbiBvdXQgb2YgdGhlIHRleHQgYW5kIHRoZSBzY2FuIGNhcnJpZXMgb24gYmVoaW5kIHRoZW0gLVxuXHRcdC8vIHdoYXQgd291bGQgaGF2ZSBiZWVuIHRoZSBzdGF0ZW1lbnQgaXMgb3JkaW5hcnkgdGV4dCBhbmQgbWF5IGhvbGQgZXhwcmVzc2lvbnMgb2YgaXRzIG93bi5cblx0XHRpZiAoY291bnRCYWNrc2xhc2hlcyhhVGV4dCwgaW5kZXgpICUgMiA9PT0gMSkge1xuXHRcdFx0aWYgKCFvY2N1cnJlbmNlcykgb2NjdXJyZW5jZXMgPSBbXTtcblx0XHRcdG9jY3VycmVuY2VzLnB1c2goeyBzdGFydDogaW5kZXgsIGVuZDogaW5kZXggKyAyLCBlc2NhcGVkOiB0cnVlLCBzY29wZTogbnVsbCwgc3RhdGVtZW50OiBudWxsIH0pO1xuXHRcdFx0aW5kZXggPSBhVGV4dC5pbmRleE9mKEVYUFJFU1NJT05fU1RBUlQsIGluZGV4ICsgMik7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCBlbmQgPSBzY2FuRXhwcmVzc2lvbihhVGV4dCwgaW5kZXgpO1xuXHRcdC8vIG5vIG1hdGNoaW5nIGJyYWNlOiB0aGUgdGV4dCBzdGFuZHMgYXMgd3JpdHRlbiwgYW5kIG5vdGhpbmcgYmVoaW5kIGl0IGNhbiBiZSBhblxuXHRcdC8vIGV4cHJlc3Npb24gZWl0aGVyIC0gYSBcIiR7XCIgb3V0c2lkZSBhIGxpdGVyYWwgd291bGQgaGF2ZSByZXN0YXJ0ZWQgdGhlIHNjYW4gaW5zdGVhZFxuXHRcdGlmIChlbmQgPT09IDApIGJyZWFrO1xuXHRcdGlmIChlbmQgPCAwKSB7XG5cdFx0XHRpbmRleCA9IC1lbmQ7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCB7IHNjb3BlLCBzdGF0ZW1lbnQgfSA9IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnQoYVRleHQuc3Vic3RyaW5nKGluZGV4ICsgMiwgZW5kIC0gMSkpO1xuXHRcdGlmICghb2NjdXJyZW5jZXMpIG9jY3VycmVuY2VzID0gW107XG5cdFx0b2NjdXJyZW5jZXMucHVzaCh7IHN0YXJ0OiBpbmRleCwgZW5kOiBlbmQsIGVzY2FwZWQ6IGZhbHNlLCBzY29wZTogc2NvcGUsIHN0YXRlbWVudDogc3RhdGVtZW50IH0pO1xuXHRcdGluZGV4ID0gYVRleHQuaW5kZXhPZihFWFBSRVNTSU9OX1NUQVJULCBlbmQpO1xuXHR9XG5cblx0cmV0dXJuIG9jY3VycmVuY2VzO1xufTtcblxuLyoqXG4gKiBFeHByZXNzaW9uUmVzb2x2ZXJcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyXG4gKiBAdHlwZWRlZiB7RXhwcmVzc2lvblJlc29sdmVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uUmVzb2x2ZXIge1xuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFuRXhlY3V0ZXJOYW1lXG5cdCAqL1xuXHRzdGF0aWMgc2V0IGRlZmF1bHRFeGVjdXRlcihhbkV4ZWN1dGVyKSB7XG5cdFx0aWYgKCBhbkV4ZWN1dGVyIGluc3RhbmNlb2YgRXhlY3V0ZXIpIERFRkFVTFRfRVhFQ1VURVIgPSBhbkV4ZWN1dGVyO1xuXHRcdGVsc2UgREVGQVVMVF9FWEVDVVRFUiA9IGdldEV4ZWN1dGVyVHlwZShhbkV4ZWN1dGVyKTtcblx0XHRjb25zb2xlLmluZm8oYENoYW5nZWQgZGVmYXVsdCBleGVjdXRlciBmb3IgRXhwcmVzc2lvblJlc29sdmVyIWApO1xuXHR9XG5cblx0c3RhdGljIGdldCBkZWZhdWx0RXhlY3V0ZXIoKSB7XG5cdFx0cmV0dXJuIERFRkFVTFRfRVhFQ1VURVI7XG5cdH1cblxuXHQvKiogQHR5cGUge3N0cmluZ3xudWxsfSAqL1xuXHQjbmFtZSA9IG51bGw7XG5cdC8qKiBAdHlwZSB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9ICovXG5cdCNwYXJlbnQgPSBudWxsO1xuXHQvKiogQHR5cGUge2Z1bmN0aW9ufG51bGx9ICovXG5cdCNleGVjdXRlciA9IG51bGw7XG5cdC8qKiBAdHlwZSB7UHJveHl8bnVsbH0gKi9cblx0I2NvbnRleHQgPSBudWxsO1xuXHQvKiogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfSAqL1xuXHQjY29udGV4dEhhbmRsZSA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRXhwcmVzc2lvblJlc29sdmVyLlxuXHQgKiBAZGF0ZSAzLzEwLzIwMjQgLSA3OjI3OjU3IFBNXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge3sgY29udGV4dD86IGFueTsgcGFyZW50PzogYW55OyBuYW1lPzogYW55OyB9fSBvcHRpb25zXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5jb250ZXh0PUdMT0JBTF1cblx0ICogQHBhcmFtIHtFeHByZXNzaW9uUmVzb2x2ZXJ9IFtvcHRpb25zLnBhcmVudD1udWxsXVxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtvcHRpb25zLm5hbWU9bnVsbF0gd2hlcmUgbm9uZSBpcyBwYXNzZWQsIG9uZSBpcyBnZW5lcmF0ZWQgLSA1LjFcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IHsgY29udGV4dCA9IG51bGwsIHBhcmVudCA9IG51bGwsIG5hbWUgPSBudWxsLCBleGVjdXRlciB9ID0gb3B0aW9ucztcblx0XHR0aGlzLiNleGVjdXRlciA9IHR5cGVvZiBleGVjdXRlciA9PT0gXCJzdHJpbmdcIiA/IGdldEV4ZWN1dGVyVHlwZShleGVjdXRlcikgOiBFeHByZXNzaW9uUmVzb2x2ZXIuZGVmYXVsdEV4ZWN1dGVyO1xuXHRcdHRoaXMuI3BhcmVudCA9IHBhcmVudCBpbnN0YW5jZW9mIEV4cHJlc3Npb25SZXNvbHZlciA/IHBhcmVudCA6IG51bGw7XG5cdFx0dGhpcy4jbmFtZSA9IG5hbWUgfHwgZ2VuZXJhdGVOYW1lKCk7XG5cdFx0XG5cdFx0dGhpcy4jY29udGV4dEhhbmRsZSA9IG5ldyBSZXNvbHZlckNvbnRleHRIYW5kbGUoY29udGV4dCwgdGhpcy4jcGFyZW50ID8gdGhpcy4jcGFyZW50LmNvbnRleHRIYW5kbGUgOiBudWxsKTtcblx0XHR0aGlzLiNjb250ZXh0ID0gdGhpcy4jY29udGV4dEhhbmRsZS5wcm94eTtcblx0fVxuXG5cdGdldCBuYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLiNuYW1lO1xuXHR9XG5cblx0Z2V0IHBhcmVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xuXHR9XG5cblx0Z2V0IGNvbnRleHQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHQ7XG5cdH1cblxuXHRnZXQgY29udGV4dEhhbmRsZSgpIHtcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dEhhbmRsZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBnZXQgY2hhaW4gcGF0aFxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdGdldCBjaGFpbigpIHtcblx0XHRyZXR1cm4gdGhpcy5wYXJlbnQgPyBgJHt0aGlzLnBhcmVudC5jaGFpbn0vJHt0aGlzLm5hbWV9YCA6IGAvJHt0aGlzLm5hbWV9YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBnZXQgZWZmZWN0aXZlIGNoYWluIHBhdGhcblx0ICpcblx0ICogT25seSB0aGUgcmVzb2x2ZXJzIHRoYXQgcHJvdmlkZSBhIGNvbnRleHQgYXBwZWFyLCBzbyB0aGlzIGRlc2NyaWJlcyBhIHN0YXRlIGFuZCBub3QgdGhlXG5cdCAqIHN0cnVjdHVyZSAtIFNQRUNJRklDQVRJT04ubWQgNS41LiBXaGVyZSBub25lIHByb3ZpZGVzIG9uZSwgdGhlIGFuc3dlciBpcyB0aGUgZW1wdHkgc3RyaW5nLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdGdldCBlZmZlY3RpdmVDaGFpbigpIHtcblx0XHRjb25zdCBwYXJlbnRFZmZlY3RpdmVDaGFpbiA9IHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuZWZmZWN0aXZlQ2hhaW4gOiBcIlwiO1xuXHRcdHJldHVybiB0aGlzLiNjb250ZXh0SGFuZGxlLnByb3ZpZGVzRGF0YSA/IGAke3BhcmVudEVmZmVjdGl2ZUNoYWlufS8ke3RoaXMubmFtZX1gIDogcGFyZW50RWZmZWN0aXZlQ2hhaW47XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGNvbnRleHQgY2hhaW5cblx0ICpcblx0ICogVGhlIGNvbnRleHRzIG9mIGV4YWN0bHkgdGhlIHJlc29sdmVycyB0aGF0IHByb3ZpZGUgb25lLCB0aGlzIHJlc29sdmVyJ3MgZmlyc3QgYW5kIHRoZSByb290J3Ncblx0ICogbGFzdCAtIFNQRUNJRklDQVRJT04ubWQgNS41LlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHJldHVybnMge0NvbnRleHRbXX1cblx0ICovXG5cdGdldCBjb250ZXh0Q2hhaW4oKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLnByb3ZpZGVzRGF0YSkgcmVzdWx0LnB1c2gocmVzb2x2ZXIuY29udGV4dCk7XG5cblx0XHRcdHJlc29sdmVyID0gcmVzb2x2ZXIucGFyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHJlc29sdmVyIGEgY2FsbCBhZGRyZXNzZXM6IHRoZSBvbmUgdGhlIGZpbHRlciBuYW1lcywgb3IgdGhlIHJlc29sdmVyIHRoZSBjYWxsIHdhcyBtYWRlIG9uXG5cdCAqIHdoZXJlIG5vIGZpbHRlciBpcyBnaXZlbi5cblx0ICpcblx0ICogQSBmaWx0ZXIgc2VsZWN0cyBleGFjdGx5IG9uZSByZXNvbHZlciBieSB0aGUgcnVsZSBvZiA1LjMsIGFuZCBhIGZpbHRlciBtYXRjaGluZyBub25lIHRocm93cyAtXG5cdCAqIGEgd3JvbmcgbmFtZSBpbiBhbiBBUEkgY2FsbCBpcyBhIG1pc3Rha2UgaW4gdGhlIGNhbGxpbmcgY29kZSwgdW5saWtlIGEgc2NvcGUgcHJlZml4IGluc2lkZSBhblxuXHQgKiBleHByZXNzaW9uLCB3aGljaCBhbnN3ZXJzIHVuZGVmaW5lZCAoNS40KS4gU2VlIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfVxuXHQgKi9cblx0I2ZpbmRSZXNvbHZlcihmaWx0ZXIpIHtcblx0XHRpZiAoIWZpbHRlcikgcmV0dXJuIHRoaXM7XG5cblx0XHRsZXQgcmVzb2x2ZXIgPSB0aGlzO1xuXHRcdHdoaWxlIChyZXNvbHZlcikge1xuXHRcdFx0aWYgKHJlc29sdmVyLm5hbWUgPT09IGZpbHRlcikgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKGBGaWx0ZXIgXCIke2ZpbHRlcn1cIiBtYXRjaGVzIG5vIHJlc29sdmVyIG9mIHRoZSBjaGFpbiFgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbmVhcmVzdCByZXNvbHZlciBmcm9tIGhlcmUgdG8gdGhlIHJvb3QgdGhhdCBjYXJyaWVzIHRoZSBrZXkgaXRzZWxmLCBvciBudWxsIHdoZXJlIG5vbmVcblx0ICogY2FycmllcyBpdC4gV2hhdCBkZWNpZGVzIGlzIHdoZXRoZXIgYSByZXNvbHZlciBwcm92aWRlcyB0aGUgbmFtZSwgbm90IHdoYXQgaXQgaG9sZHMgLVxuXHQgKiBTUEVDSUZJQ0FUSU9OLm1kIDUuMi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJucyB7RXhwcmVzc2lvblJlc29sdmVyfG51bGx9XG5cdCAqL1xuXHQjcmVzb2x2ZXJGb3JLZXkoa2V5KSB7XG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcblx0XHR3aGlsZSAocmVzb2x2ZXIpIHtcblx0XHRcdGlmIChyZXNvbHZlci5jb250ZXh0SGFuZGxlLmhhc0RhdGEoa2V5KSkgcmV0dXJuIHJlc29sdmVyO1xuXHRcdFx0cmVzb2x2ZXIgPSByZXNvbHZlci5wYXJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGRhdGEgZnJvbSBjb250ZXh0XG5cdCAqXG5cdCAqIFJlYWRzIGFsb25nIHRoZSBjaGFpbiBmcm9tIHRoZSBhZGRyZXNzZWQgcmVzb2x2ZXIgYnkgdGhlIHJ1bGUgb2YgNS4yLiBXaXRob3V0IGEga2V5IGl0IGFuc3dlcnMgdGhlXG5cdCAqIHdob2xlIGNvbnRleHQgb2YgdGhhdCByZXNvbHZlciAtIHRoZSBwcm94eSwgc28gZXZlcnkgYWNjZXNzIG9uIGl0IHN0aWxsIHNlZXMgdGhlIGNoYWluLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gZmlsdGVyXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKi9cblx0Z2V0RGF0YShrZXksIGZpbHRlcikge1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKGZpbHRlcik7XG5cdFx0aWYgKCFrZXkpIHJldHVybiByZXNvbHZlci5jb250ZXh0O1xuXG5cdFx0cmV0dXJuIHJlc29sdmVyLmNvbnRleHRba2V5XTtcblx0fVxuXG5cdC8qKlxuXHQgKiB1cGRhdGUgZGF0YSBhdCBjb250ZXh0XG5cdCAqXG5cdCAqIFdpdGhvdXQgYSBmaWx0ZXIgdGhlIHZhbHVlIGlzIGNoYW5nZWQgd2hlcmUgdGhlIGtleSBsaXZlcywgY291bnRpbmcgZnJvbSBoZXJlIHRvd2FyZHMgdGhlIHJvb3QsXG5cdCAqIGFuZCBjcmVhdGVkIGhlcmUgd2hlcmUgbm8gcmVzb2x2ZXIgY2FycmllcyBpdC4gV2l0aCBhIGZpbHRlciB0aGUgYWRkcmVzc2VkIHJlc29sdmVyIGlzIHRoZVxuXHQgKiB0YXJnZXQgb3V0cmlnaHQgLSBTUEVDSUZJQ0FUSU9OLm1kIDYuNi5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKiBAcGFyYW0geyp9IHZhbHVlXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gZmlsdGVyXG5cdCAqL1xuXHR1cGRhdGVEYXRhKGtleSwgdmFsdWUsIGZpbHRlcikge1xuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy4jZmluZFJlc29sdmVyKGZpbHRlcik7XG5cdFx0aWYgKCFrZXkpIHJldHVybjtcblxuXHRcdGNvbnN0IHRhcmdldCA9IGZpbHRlciA/IHJlc29sdmVyIDogdGhpcy4jcmVzb2x2ZXJGb3JLZXkoa2V5KSB8fCB0aGlzO1xuXHRcdHRhcmdldC5jb250ZXh0W2tleV0gPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBkZWxldGUgZGF0YSBmcm9tIGNvbnRleHRcblx0ICpcblx0ICogUmVtb3ZlcyB0aGUga2V5IGZyb20gb25lIHJlc29sdmVyIC0gdGhlIGFkZHJlc3NlZCBvbmUgd2l0aCBhIGZpbHRlciwgYW5kIHdpdGhvdXQgb25lIHRoZSBmaXJzdFxuXHQgKiByZXNvbHZlciBjYXJyeWluZyBpdCwgY291bnRpbmcgZnJvbSBoZXJlIHRvd2FyZHMgdGhlIHJvb3QuIFJlbW92aW5nIGl0IHVuY292ZXJzIHRoZSB2YWx1ZSBvZlxuXHQgKiB0aGUgbmV4dCByZXNvbHZlciB0aGF0IGNhcnJpZXMgdGhlIHNhbWUga2V5IC0gU1BFQ0lGSUNBVElPTi5tZCA2LjYuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcblx0ICovXG5cdGRlbGV0ZURhdGEoa2V5LCBmaWx0ZXIpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IHRoaXMuI2ZpbmRSZXNvbHZlcihmaWx0ZXIpO1xuXHRcdGlmICgha2V5KSByZXR1cm47XG5cblx0XHRjb25zdCB0YXJnZXQgPSBmaWx0ZXIgPyByZXNvbHZlciA6IHRoaXMuI3Jlc29sdmVyRm9yS2V5KGtleSk7XG5cdFx0aWYgKHRhcmdldCkgZGVsZXRlIHRhcmdldC5jb250ZXh0W2tleV07XG5cdH1cblxuXHQvKipcblx0ICogbWVyZ2UgY29udGV4dCBvYmplY3Rcblx0ICpcblx0ICogQSBzaGFsbG93IGFzc2lnbm1lbnQgaW50byB0aGUgY29udGV4dCBvZiB0aGUgYWRkcmVzc2VkIHJlc29sdmVyLCByZXBsYWNpbmcgd2hhdCBpcyB0aGVyZSBhbmQgYWRkaW5nXG5cdCAqIHdoYXQgaXMgbm90LiBObyBzZWFyY2ggYWxvbmcgdGhlIGNoYWluOiBhIG1lcmdlZCBrZXkgc2hhZG93cyB0aGUgcmVzb2x2ZXJzIGFib3ZlIGZyb20gaGVyZSBvbiAtXG5cdCAqIFNQRUNJRklDQVRJT04ubWQgNi42LlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxuXHQgKi9cblx0bWVyZ2VDb250ZXh0KGNvbnRleHQsIGZpbHRlcikge1xuXHRcdHRoaXMuI2ZpbmRSZXNvbHZlcihmaWx0ZXIpLmNvbnRleHRIYW5kbGUubWVyZ2VEYXRhKGNvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlc29sdmVkIGFuIGV4cHJlc3Npb24gc3RyaW5nIHRvIGRhdGFcblx0ICpcblx0ICogQGFzeW5jXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhRXhwcmVzc2lvblxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cblx0ICovXG5cdGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFEZWZhdWx0KSB7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHR0cnkge1xuXHRcdFx0YUV4cHJlc3Npb24gPSBhRXhwcmVzc2lvbi50cmltKCk7XG5cblx0XHRcdC8vIDQuMzogdGhlIHdob2xlIGlucHV0IGlzIG9uZSBleHByZXNzaW9uLCBzbyBpdHMgZW5kIGlzIHRoZSBlbmQgb2YgdGhlIGlucHV0LiBUaGVcblx0XHRcdC8vIGVzY2FwaW5nIG9mIDMuMiBkb2VzIG5vdCBhcHBseSBoZXJlIC0gaXQgaXMgYSBydWxlIG9mIHRoZSB0ZXh0IGZvcm0sIGFuZCB0aGVyZSBpcyBub1xuXHRcdFx0Ly8gc3Vycm91bmRpbmcgdGV4dCwgc28gYSBiYWNrc2xhc2ggYmVsb25ncyB0byB0aGUgc3RhdGVtZW50LlxuXHRcdFx0aWYgKGFFeHByZXNzaW9uLnN0YXJ0c1dpdGgoRVhQUkVTU0lPTl9TVEFSVCkpIHtcblx0XHRcdFx0aWYgKCFhRXhwcmVzc2lvbi5lbmRzV2l0aChcIn1cIikpIHRocm93IG5ldyBTeW50YXhFcnJvcihgRXhwcmVzc2lvbiBkb2VzIG5vdCBlbmQgd2l0aCBcIn1cIjogJHthRXhwcmVzc2lvbn1gKTtcblxuXHRcdFx0XHRjb25zdCB7IHNjb3BlLCBzdGF0ZW1lbnQgfSA9IHNwbGl0U2NvcGVBbmRTdGF0ZW1lbnQoYUV4cHJlc3Npb24uc3Vic3RyaW5nKDIsIGFFeHByZXNzaW9uLmxlbmd0aCAtIDEpKTtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHJlc29sdmUodGhpcy4jZXhlY3V0ZXIsIHRoaXMsIHN0YXRlbWVudCwgc2NvcGUsIGRlZmF1bHRWYWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIDQuMzogYW55dGhpbmcgZWxzZSBpcyBhIHN0YXRlbWVudCBpbiBmdWxsLCBhbmQgY2FycmllcyBubyBzY29wZSBwcmVmaXhcblx0XHRcdHJldHVybiBhd2FpdCByZXNvbHZlKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBub3JtYWxpemUoYUV4cHJlc3Npb24pLCBudWxsLCBkZWZhdWx0VmFsdWUpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIDc6IHRoZSBlcnJvciBpcyBsb2dnZWQgYW5kIGhhbmRlZCBvbi4gcmVzb2x2ZSBhbnN3ZXJzIGEgdmFsdWUgb3Igc2F5cyB3aHkgaXQgY2Fubm90LFxuXHRcdFx0Ly8gYW5kIGEgZGVmYXVsdCB2YWx1ZSBjb3ZlcnMgYSBtaXNzaW5nIHJlc3VsdCwgbmV2ZXIgYW4gZXJyb3IuXG5cdFx0XHR3YXJuRmFpbGVkU3RhdGVtZW50KGFFeHByZXNzaW9uLCBlKTtcblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIHJlcGxhY2UgYWxsIGV4cHJlc3Npb25zIGF0IGEgc3RyaW5nXHQgKlxuXHQgKiBAYXN5bmNcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XG5cdCAqIEBwYXJhbSB7Pyp9IGFEZWZhdWx0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0YXN5bmMgcmVzb2x2ZVRleHQoYVRleHQsIGFEZWZhdWx0KSB7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcblx0XHRpZiAodHlwZW9mIGFUZXh0ICE9PSBcInN0cmluZ1wiKSByZXR1cm4gYVRleHQ7XG5cblx0XHRjb25zdCBvY2N1cnJlbmNlcyA9IHNjYW4oYVRleHQpO1xuXHRcdGlmICghb2NjdXJyZW5jZXMpIHJldHVybiBhVGV4dDtcblxuXHRcdGxldCB0ZXh0ID0gXCJcIjtcblx0XHRsZXQgcG9zaXRpb24gPSAwO1xuXHRcdGZvciAoY29uc3Qgb2NjdXJyZW5jZSBvZiBvY2N1cnJlbmNlcykge1xuXHRcdFx0Ly8gMy4yOiBhbiBlc2NhcGluZyBiYWNrc2xhc2ggaXMgY29uc3VtZWQsIGV2ZXJ5dGhpbmcgZWxzZSBpbiBmcm9udCBvZiB0aGUgZXhwcmVzc2lvblxuXHRcdFx0Ly8gc3RhbmRzIGFzIHdyaXR0ZW5cblx0XHRcdHRleHQgKz0gYVRleHQuc3Vic3RyaW5nKHBvc2l0aW9uLCBvY2N1cnJlbmNlLmVzY2FwZWQgPyBvY2N1cnJlbmNlLnN0YXJ0IC0gMSA6IG9jY3VycmVuY2Uuc3RhcnQpO1xuXHRcdFx0cG9zaXRpb24gPSBvY2N1cnJlbmNlLmVuZDtcblxuXHRcdFx0aWYgKG9jY3VycmVuY2UuZXNjYXBlZCkge1xuXHRcdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhvY2N1cnJlbmNlLnN0YXJ0LCBvY2N1cnJlbmNlLmVuZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0ZXh0ICs9IHRvVGV4dChhd2FpdCByZXNvbHZlKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBvY2N1cnJlbmNlLnN0YXRlbWVudCwgb2NjdXJyZW5jZS5zY29wZSwgZGVmYXVsdFZhbHVlKSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdC8vIDc6IGFuIGV4cHJlc3Npb24gd2hvc2Ugc3RhdGVtZW50IGZhaWxlZCBzdGFuZHMgYXMgd3JpdHRlbiwgYW5kIHRoZSBkZWZhdWx0IHZhbHVlXG5cdFx0XHRcdC8vIGRvZXMgbm90IGNvdmVyIGl0LiBUaGUgcmVzdCBvZiB0aGUgdGV4dCBrZWVwcyByZW5kZXJpbmcuXG5cdFx0XHRcdHdhcm5GYWlsZWRTdGF0ZW1lbnQob2NjdXJyZW5jZS5zdGF0ZW1lbnQsIGUpO1xuXHRcdFx0XHR0ZXh0ICs9IGFUZXh0LnN1YnN0cmluZyhvY2N1cnJlbmNlLnN0YXJ0LCBvY2N1cnJlbmNlLmVuZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHQgKyBhVGV4dC5zdWJzdHJpbmcocG9zaXRpb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlc29sdmUgYW4gZXhwcmVzc2lvbiBzdHJpbmcgdG8gZGF0YVxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYUV4cHJlc3Npb25cblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IGFUaW1lb3V0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmUoYUV4cHJlc3Npb24sIGFDb250ZXh0LCBhRGVmYXVsdCwgYVRpbWVvdXQpIHtcblx0XHRjb25zdCByZXNvbHZlciA9IG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0OiBhQ29udGV4dCB9KTtcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XG5cdFx0aWYgKHR5cGVvZiBhVGltZW91dCA9PT0gXCJudW1iZXJcIiAmJiBhVGltZW91dCA+IDApXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNvbHZlci5yZXNvbHZlKGFFeHByZXNzaW9uLCBkZWZhdWx0VmFsdWUpKTtcblx0XHRcdFx0fSwgYVRpbWVvdXQpO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiByZXBsYWNlIGV4cHJlc3Npb24gYXQgdGV4dFxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBhc3luY1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gYVRleHRcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxuXHQgKiBAcGFyYW0gez8qfSBhRGVmYXVsdFxuXHQgKiBAcGFyYW0gez9udW1iZXJ9IGFUaW1lb3V0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxuXHQgKi9cblx0c3RhdGljIGFzeW5jIHJlc29sdmVUZXh0KGFUZXh0LCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dDogYUNvbnRleHQgfSk7XG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xuXHRcdGlmICh0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHJlc29sdmUocmVzb2x2ZXIucmVzb2x2ZVRleHQoYVRleHQsIGRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHR9LCBhVGltZW91dCk7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiByZXNvbHZlci5yZXNvbHZlVGV4dChhVGV4dCwgZGVmYXVsdFZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBidWlsZCBhIHJlc29sdmVyIG92ZXIgYSBmaWx0ZXJlZCBjb3B5IG9mIHRoZSBjb250ZXh0XG5cdCAqXG5cdCAqIFRoZSBmaWx0ZXIgaXMgYXBwbGllZCB0byB0aGUgY29udGV4dCBvbmx5LCBuZXZlciB0byB0aGUgZ2xvYmFscywgc28gdGhpcyBpcyBhIHdheSB0byBoYW5kXG5cdCAqIG92ZXIgYSBjbGVhbmVkIGNvbnRleHQgYW5kIG5vdCBhIHNhbmRib3guXG5cdCAqXG5cdCAqIGBvcHRpb25gIGNhcnJpZXMgdGhlIGZpbHRlcidzIG93biBgZGVlcGAgdG9nZXRoZXIgd2l0aCB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBgbmFtZWAsXG5cdCAqIGBwYXJlbnRgIGFuZCBgZXhlY3V0ZXJgLCB3aGljaCBhcmUgaGFuZGVkIG9uIGFzIHRoZXkgYXJlLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhcmcgdGhlIGZpbHRlciBhcmd1bWVudHMsIHBsdXMgdGhlIHdob2xlIGNvbnN0cnVjdG9yIG9wdGlvbiBzZXRcblx0ICogQHBhcmFtIHtvYmplY3R9IGFyZy5jb250ZXh0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGFyZy5wcm9wRmlsdGVyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbYXJnLm9wdGlvbj17IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfV1cblx0ICogQHBhcmFtIHtib29sZWFufSBbYXJnLm9wdGlvbi5kZWVwPXRydWVdXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbYXJnLm9wdGlvbi5uYW1lPW51bGxdXG5cdCAqIEBwYXJhbSB7RXhwcmVzc2lvblJlc29sdmVyfSBbYXJnLm9wdGlvbi5wYXJlbnQ9bnVsbF1cblx0ICogQHBhcmFtIHtzdHJpbmd9IFthcmcub3B0aW9uLmV4ZWN1dGVyPW51bGxdXG5cdCAqIEByZXR1cm5zIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XG5cdCAqL1xuXHRzdGF0aWMgYnVpbGRTZWN1cmUoeyBjb250ZXh0LCBwcm9wRmlsdGVyLCBvcHRpb24gPSB7IGRlZXA6IHRydWUsIG5hbWU6IG51bGwsIHBhcmVudDogbnVsbCwgZXhlY3V0ZXI6IG51bGwgfSB9KSB7XG5cdFx0Y29uc3QgeyBkZWVwID0gdHJ1ZSwgbmFtZSwgcGFyZW50LCBleGVjdXRlciB9ID0gb3B0aW9uO1xuXHRcdGNvbnRleHQgPSBPYmplY3RVdGlscy5maWx0ZXIoY29udGV4dCwgcHJvcEZpbHRlciwge2RlZXB9KTtcblx0XHRyZXR1cm4gbmV3IEV4cHJlc3Npb25SZXNvbHZlcih7IGNvbnRleHQsIG5hbWUsIHBhcmVudCwgZXhlY3V0ZXIgfSk7XG5cdH1cbn1cblxuIiwiaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XG5pbXBvcnQgeyBpc051bGxPclVuZGVmaW5lZCB9IGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qc1wiO1xuXG5jb25zdCBWQVJOQU1FX0NIRUNLID0gL15bJF9cXHB7SURfU3RhcnR9XVskXFxwe0lEX0NvbnRpbnVlfV0qJC91O1xuY29uc3QgUkVTRVJWRURfV09SRFMgPSBuZXcgU2V0KFtcblx0XCJicmVha1wiLFxuXHRcImNhc2VcIixcblx0XCJjYXRjaFwiLFxuXHRcImNsYXNzXCIsXG5cdFwiY29uc3RcIixcblx0XCJjb250aW51ZVwiLFxuXHRcImRlYnVnZ2VyXCIsXG5cdFwiZGVmYXVsdFwiLFxuXHRcImRlbGV0ZVwiLFxuXHRcImRvXCIsXG5cdFwiZWxzZVwiLFxuXHRcImV4cG9ydFwiLFxuXHRcImV4dGVuZHNcIixcblx0XCJmaW5hbGx5XCIsXG5cdFwiZm9yXCIsXG5cdFwiZnVuY3Rpb25cIixcblx0XCJpZlwiLFxuXHRcImltcG9ydFwiLFxuXHRcImluXCIsXG5cdFwiaW5zdGFuY2VvZlwiLFxuXHRcIm5ld1wiLFxuXHRcInJldHVyblwiLFxuXHRcInN1cGVyXCIsXG5cdFwic3dpdGNoXCIsXG5cdFwidGhpc1wiLFxuXHRcInRocm93XCIsXG5cdFwidHJ5XCIsXG5cdFwidHlwZW9mXCIsXG5cdFwidmFyXCIsXG5cdFwidm9pZFwiLFxuXHRcIndoaWxlXCIsXG5cdFwid2l0aFwiLFxuXHRcInlpZWxkXCIsXG5cdFwiZW51bVwiLFxuXHRcImltcGxlbWVudHNcIixcblx0XCJpbnRlcmZhY2VcIixcblx0XCJsZXRcIixcblx0XCJwYWNrYWdlXCIsXG5cdFwicHJpdmF0ZVwiLFxuXHRcInByb3RlY3RlZFwiLFxuXHRcInB1YmxpY1wiLFxuXHRcInN0YXRpY1wiLFxuXHRcImF3YWl0XCIsXG5cdFwibnVsbFwiLFxuXHRcInRydWVcIixcblx0XCJmYWxzZVwiLFxuXHRcImNvbnN0cnVjdG9yXCIsXG5cdFwidW5kZWZpbmVkXCIsXG5dKTtcblxuLyoqXG4gKiBXaGV0aGVyIGEgbmFtZSBjYW4gc3RhbmQgZm9yIGEgdmFyaWFibGUgaW4gYSBzdGF0ZW1lbnQuXG4gKlxuICogVGhlIHNhbWUgcnVsZSB0aGUgcHJvcGVydHkgY2FjaGUgYXBwbGllcyB3aGlsZSBpdCBjb2xsZWN0cyB0aGUgbmFtZXMgb2YgYSBjb250ZXh0IC0ga2VwdCBoZXJlXG4gKiBiZWNhdXNlIHRoZSBjYWNoZSBvZiBhIGdsb2JhbCBjb250ZXh0IGRvZXMgbm90IGdvIHRocm91Z2ggdGhhdCBsb29wIGFuZCBzdGlsbCBoYXMgdG8gYW5zd2VyIHRoZVxuICogc2FtZSBzZXQgb2YgbmFtZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8c3ltYm9sfSBuYW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgaXNWYXJpYWJsZU5hbWUgPSAobmFtZSkgPT4gdHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIgJiYgIVJFU0VSVkVEX1dPUkRTLmhhcyhuYW1lKSAmJiBWQVJOQU1FX0NIRUNLLnRlc3QobmFtZSk7XG5cbi8qKlxuICogVGhlIGRlc2NyaXB0b3IgYSBwcm9wZXJ0eSBoYXMgd2hlcmUgaXQgaXMgZGVmaW5lZCAtIG93biBvciBhbnl3aGVyZSB1cCB0aGUgcHJvdG90eXBlIGNoYWluIG9mXG4gKiB0aGUgb2JqZWN0IGhvbGRpbmcgaXQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfHN5bWJvbH0gcHJvcGVydHlcbiAqIEByZXR1cm5zIHtQcm9wZXJ0eURlc2NyaXB0b3J8bnVsbH1cbiAqL1xuY29uc3QgZmluZFByb3BlcnR5RGVzY3JpcHRvciA9IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRsZXQgdHlwZSA9IGRhdGE7XG5cdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRjb25zdCBkZXNjcmlwdG9yID0gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodHlwZSwgcHJvcGVydHkpO1xuXHRcdGlmIChkZXNjcmlwdG9yKSByZXR1cm4gZGVzY3JpcHRvcjtcblx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBQcm9wZXJ0eSBjYWNoZSBmb3IgYSBjb250ZXh0IHRoYXQgaXMgdGhlIGdsb2JhbCBvYmplY3QgaXRzZWxmLlxuICpcbiAqIEl0IGFuc3dlcnMgbGlrZSB0aGUgTWFwIGl0IHJlcGxhY2VzOiBldmVyeSBuYW1lIGlzIHByZXNlbnQsIGFuZCB0aGUgdmFsdWUgaXMgdGhlIGhhbmRsZVxuICogaG9sZGluZyBpdCAtIG5ldmVyIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkuIFRoYXQgaXMgdGhlIGNvbnRyYWN0IG9mICNnZXRQcm9wZXJ0eURlZixcbiAqIHdob3NlIGNhbGxlciByZWFkcyB0aGUgcHJvcGVydHkgb2ZmIHRoZSBoYW5kbGUgaXQgZ2V0cyBiYWNrLlxuICpcbiAqIEJlY2F1c2UgZXZlcnkgbmFtZSBpcyBwcmVzZW50LCBzdWNoIGEgbGluayBhbnN3ZXJzIGV2ZXJ5IGxvb2t1cCBhbmQgbm90aGluZyBiZWxvdyBpdCBpc1xuICogcmVhY2hlZCwgYW5kIG93bktleXMgcmVwb3J0cyBldmVyeSBuYW1lIG9mIHRoZSBnbG9iYWwgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfSBoYW5kbGVcbiAqL1xuY29uc3QgY3JlYXRlR2xvYmFsQ2FjaGVXcmFwcGVyID0gKGhhbmRsZSkgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdGhhczogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9LFxuXHRcdGdldDogKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlO1xuXHRcdH0sXG5cdFx0c2V0OiAocHJvcGVydHksIHZhbHVlKSA9PiB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblx0XHRkZWxldGU6IChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0sXG5cdFx0a2V5czogKCkgPT4ge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKEdMT0JBTCkuZmlsdGVyKGlzVmFyaWFibGVOYW1lKTtcblx0XHR9LFxuXHR9O1xufTtcblxuLyoqXG4gKiBDb250ZXh0IG9iamVjdCB0byBoYW5kbGUgZGF0YSBhY2Nlc3NcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgUmVzb2x2ZXJDb250ZXh0SGFuZGxlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc29sdmVyQ29udGV4dEhhbmRsZSB7XG5cdC8qKiBAdHlwZSB7UHJveHl8bnVsbH0gKi9cblx0I3Byb3h5ID0gbnVsbDtcblx0LyoqIEB0eXBlIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH0gKi9cblx0I3BhcmVudCA9IG51bGw7XG5cdC8qKiBAdHlwZSB7b2JqZWN0fG51bGx9ICovXG5cdCNkYXRhID0gbnVsbDtcblx0LyoqIEB0eXBlIHtNYXA8c3RyaW5nLFJlc29sdmVyQ29udGV4dEhhbmRsZT58bnVsbH0gKi9cblx0I2NhY2hlID0gbnVsbDtcblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHQjcHJvdmlkZXNEYXRhID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgQ29udGV4dC5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0XG5cdCAqIEBwYXJhbSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfSBwYXJlbnRcblx0ICovXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQsIHBhcmVudCkge1xuXHRcdHRoaXMuI2RhdGEgPSBjb250ZXh0IHx8IHt9O1xuXHRcdHRoaXMuI3BhcmVudCA9IHBhcmVudCA/IHBhcmVudCA6IG51bGw7XG5cdFx0dGhpcy4jcHJvdmlkZXNEYXRhID0gIWlzTnVsbE9yVW5kZWZpbmVkKGNvbnRleHQpO1xuXG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xuXG5cdFx0aWYgKEdMT0JBTCA9PT0gdGhpcy4jZGF0YSlcblx0XHRcdHRoaXMuI3Byb3h5ID0gdGhpcy4jZGF0YTtcblx0XHRlbHNlIHtcblx0XHRcdC8vIFRoZSBwcm94eSBhbnN3ZXJzIGZvciB0aGUgd2hvbGUgY2hhaW4sIHdoaWNoIGlzIG1vcmUgdGhhbiB0aGUgb2JqZWN0IGhhbmRlZCB0byB0aGlzXG5cdFx0XHQvLyBsaW5rIGhvbGRzLiBBIHByb3h5IG1heSBub3Qgc3BlYWsgdGhhdCBmcmVlbHkgZm9yIGEgdGFyZ2V0IHRoYXQgZ3VhcmFudGVlcyBhbnl0aGluZ1xuXHRcdFx0Ly8gYWJvdXQgaXRzIG93biBrZXlzIC0gYSBmcm96ZW4gb3Igc2VhbGVkIGNvbnRleHQgaXMgd2hlcmUgdGhhdCBlbmRzIGluIGEgVHlwZUVycm9yIC1cblx0XHRcdC8vIHNvIGl0IGdldHMgYW4gZW1wdHkgdGFyZ2V0IG9mIGl0cyBvd24uIE5vIHRyYXAgcmVhZHMgaXQ7IGV2ZXJ5IG9uZSBvZiB0aGVtIHdvcmtzIG9uXG5cdFx0XHQvLyAjZGF0YSBhbmQgI2NhY2hlLlxuXHRcdFx0dGhpcy4jcHJveHkgPSBuZXcgUHJveHkoe30sIHtcblx0XHRcdFx0aGFzOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiaGFzIHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuI2dldFByb3BlcnR5RGVmKHByb3BlcnR5KSAhPSBudWxsO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQ6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJnZXQgcHJvcGVydHk6XCIsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRjb25zdCBwcm94eSA9IHRoaXMuI2dldFByb3BlcnR5RGVmKHByb3BlcnR5KTtcblx0XHRcdFx0XHRyZXR1cm4gcHJveHkgPyBwcm94eS4jZGF0YVtwcm9wZXJ0eV0gOiB1bmRlZmluZWQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldDogKGRhdGEsIHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJzZXQgcHJvcGVydHk6XCIsIHByb3BlcnR5LCBcIj1cIiwgdmFsdWUpO1xuXHRcdFx0XHRcdHRoaXMuI2RhdGFbcHJvcGVydHldID0gdmFsdWU7XG5cdFx0XHRcdFx0dGhpcy4jY2FjaGUuc2V0KHByb3BlcnR5LCB0aGlzKTtcblx0XHRcdFx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRkZWxldGVQcm9wZXJ0eTogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlEZWYgPSB0aGlzLiNjYWNoZS5nZXQocHJvcGVydHkpO1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eURlZikge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuI2RhdGFbcHJvcGVydHldO1xuXHRcdFx0XHRcdFx0dGhpcy4jY2FjaGUuZGVsZXRlKHByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogKGRhdGEsIHByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgcHJveHkgPSB0aGlzLiNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0aWYgKCFwcm94eSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdC8vIFJlYWQgdGhyb3VnaCBhIGdldHRlciByYXRoZXIgdGhhbiB1cCBmcm9udCwgc28gZW51bWVyYXRpbmcgYSBjb250ZXh0IGRvZXMgbm90XG5cdFx0XHRcdFx0Ly8gZXZhbHVhdGUgd2hhdCBub2JvZHkgYXNrZWQgZm9yLCBhbmQgc28gYSB2YWx1ZSBzdGF5cyBsaXZlICg2LjIpLiBFbnVtZXJhYmlsaXR5XG5cdFx0XHRcdFx0Ly8gaXMgdGFrZW4gZnJvbSB3aGVyZSB0aGUgcHJvcGVydHkgaXMgZGVmaW5lZCAtIHRoYXQgaXMgd2hhdCBrZWVwcyB0aGUgbWVtYmVyc1xuXHRcdFx0XHRcdC8vIG9mIE9iamVjdC5wcm90b3R5cGUgb3V0IG9mIE9iamVjdC5rZXlzIC0gd2hpbGUgY29uZmlndXJhYmxlIGhhcyB0byBiZSB0cnVlOlxuXHRcdFx0XHRcdC8vIGEgcHJveHkgbWF5IG5vdCBjbGFpbSBhIGZpeGVkIHByb3BlcnR5IGl0cyB0YXJnZXQgZG9lcyBub3QgaGF2ZS5cblx0XHRcdFx0XHRjb25zdCBkZXNjcmlwdG9yID0gZmluZFByb3BlcnR5RGVzY3JpcHRvcihwcm94eS4jZGF0YSwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRnZXQ6ICgpID0+IHByb3h5LiNkYXRhW3Byb3BlcnR5XSxcblx0XHRcdFx0XHRcdGVudW1lcmFibGU6IGRlc2NyaXB0b3IgPyBkZXNjcmlwdG9yLmVudW1lcmFibGUgOiB0cnVlLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG93bktleXM6IChkYXRhKSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIm93bktleXNcIik7XG5cdFx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IFNldCgpO1xuXHRcdFx0XHRcdGxldCBoYW5kbGUgPSB0aGlzO1xuXHRcdFx0XHRcdHdoaWxlIChoYW5kbGUpIHtcblx0XHRcdFx0XHRcdGZvciAobGV0IGtleSBvZiBoYW5kbGUuI2NhY2hlLmtleXMoKSkge1xuXHRcdFx0XHRcdFx0XHRyZXN1bHQuYWRkKGtleSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRoYW5kbGUgPSBoYW5kbGUuI3BhcmVudDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIEFycmF5LmZyb20ocmVzdWx0KTtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHQvL0BUT0RPIG5lZWQgdG8gc3VwcG9ydCB0aGUgb3RoZXIgcHJveHkgYWN0aW9uc1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7UHJveHl9XG5cdCAqL1xuXHRnZXQgcHJveHkoKSB7XG5cdFx0cmV0dXJuIHRoaXMuI3Byb3h5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9XG5cdCAqL1xuXHRnZXQgcGFyZW50KCkge1xuXHRcdHJldHVybiB0aGlzLiNwYXJlbnQ7XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciB0aGlzIGhhbmRsZSBwcm92aWRlcyB0aGUgbmFtZSBpdHNlbGYuIEV2ZXJ5IG5hbWUgb2YgaXRzIG93biBjb250ZXh0IGNvdW50cywgdGhlIG9uZXNcblx0ICogaW5oZXJpdGVkIHRocm91Z2ggdGhlIHByb3RvdHlwZSBjaGFpbiBpbmNsdWRlZCAoNS4yKTsgYSBoYW5kbGUgb3ZlciB0aGUgZ2xvYmFsIG9iamVjdFxuXHQgKiBwcm92aWRlcyBldmVyeSBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzRGF0YShrZXkpIHtcblx0XHRyZXR1cm4gdGhpcy4jY2FjaGUuaGFzKGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciB0aGlzIGhhbmRsZSBwcm92aWRlcyBhIGNvbnRleHQ6IG9uZSB3YXMgaGFuZGVkIHRvIHRoZSBjb25zdHJ1Y3Rvciwgb3IgYSB2YWx1ZSBoYXMgYmVlblxuXHQgKiB3cml0dGVuIHNpbmNlLiBXaGF0IHRoZSBkYXRhIGhvbGRzIGRlY2lkZXMgbm90aGluZyAtIFNQRUNJRklDQVRJT04ubWQgNS41LlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICogQHR5cGUge2Jvb2xlYW59XG5cdCAqL1xuXHRnZXQgcHJvdmlkZXNEYXRhKCkge1xuXHRcdHJldHVybiB0aGlzLiNwcm92aWRlc0RhdGE7XG5cdH1cblxuXHR1cGRhdGVEYXRhKGRhdGEpIHtcblx0XHR0aGlzLiNkYXRhID0gZGF0YSB8fCB7fTtcblx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSAhaXNOdWxsT3JVbmRlZmluZWQoZGF0YSk7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xuXHR9XG5cblx0bWVyZ2VEYXRhKGRhdGEpIHtcblx0XHRpZiAodHlwZW9mIGRhdGEgIT09IFwib2JqZWN0XCIgfHwgZGF0YSA9PSBudWxsKSByZXR1cm47XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLiNkYXRhLCBkYXRhKTtcblx0XHR0aGlzLiNwcm92aWRlc0RhdGEgPSB0cnVlO1xuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcblx0fVxuXG5cdHJlc2V0Q2FjaGUoKSB7XG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtNYXA8c3RyaW5nLFByb3BlcnR5RGVmaW5pdGlvbj59XG5cdCAqL1xuXHQjaW5pdFByb3BlcnR5Q2FjaGUoKSB7XG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuI2RhdGE7XG5cdFx0aWYgKEdMT0JBTCA9PT0gZGF0YSkgXG5cdFx0XHRyZXR1cm4gY3JlYXRlR2xvYmFsQ2FjaGVXcmFwcGVyKHRoaXMpO1xuXG5cdFx0Y29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XG5cdFx0bGV0IHR5cGUgPSBkYXRhO1xuXHRcdHdoaWxlICghaXNOdWxsT3JVbmRlZmluZWQodHlwZSkpIHtcblx0XHRcdGZvciAobGV0IG5hbWUgb2YgUmVmbGVjdC5vd25LZXlzKHR5cGUpKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgbmFtZSAhPT0gXCJzdHJpbmdcIik7IC8vaWdub3JlIG5vbiBzdHJpbmcgcHJvcGVydHkgbmFtZXNcblx0XHRcdFx0ZWxzZSBpZiAoUkVTRVJWRURfV09SRFMuaGFzKG5hbWUpKTsgLy9pZ25vcmUgcmVzZXJ2ZWQgd29yZHNcblx0XHRcdFx0ZWxzZSBpZiAoIVZBUk5BTUVfQ0hFQ0sudGVzdChuYW1lKSlcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFZhcmlhYmxlIG5hbWUgaXMgaWxsZWdhbCAke25hbWV9LCB2YXJpYWJsZSBpcmdub3JlZCFgKTtcblx0XHRcdFx0ZWxzZSBjYWNoZS5zZXQobmFtZSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0XHR0eXBlID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih0eXBlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FjaGU7XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XG5cdCAqIEByZXR1cm5zIHtSZXNvbHZlckNvbnRleHRIYW5kbGV8bnVsbH1cblx0ICovXG5cdCNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSkge1xuXHRcdGlmICh0aGlzLiNjYWNoZS5oYXMocHJvcGVydHkpKSByZXR1cm4gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcblx0XHRsZXQgcGFyZW50ID0gdGhpcy4jcGFyZW50O1xuXHRcdHdoaWxlIChwYXJlbnQpIHtcblx0XHRcdGlmIChwYXJlbnQuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiBwYXJlbnQuI2NhY2hlLmdldChwcm9wZXJ0eSk7XG5cdFx0XHRwYXJlbnQgPSBwYXJlbnQuI3BhcmVudDtcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cbiIsImltcG9ydCB7IHJlZ2lzdHJhdGUgfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xuaW1wb3J0IEV4ZWN1dGVyIGZyb20gXCIuLi9FeGVjdXRlci5qc1wiO1xuaW1wb3J0IENvZGVDYWNoZSBmcm9tIFwiLi4vQ29kZUNhY2hlLmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcblxubGV0IERFQlVHID0gZmFsc2U7XG5leHBvcnQgY29uc3QgRVhFQ1VURVJOQU1FID0gXCJjb250ZXh0LWRlY29uc3RydWN0aW9uLWV4ZWN1dGVyXCI7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHNldERlYnVnID0gKHZhbHVlKSA9PiB7XG5cdERFQlVHID0gdmFsdWU7XG59XG5cbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgc2l6ZTogNTAwMCB9KTtcblxuLyoqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuICovXG5leHBvcnQgY29uc3Qgc2V0dXBFeGVjdXRlciA9IChvcHRpb25zKSA9PiB7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50LCBjb250ZXh0UHJvcGVydGllcykgPT4ge1xuXHRjb25zdCBjb2RlID0gYFxucmV0dXJuIChhc3luYyAoeyR7Y29udGV4dFByb3BlcnRpZXN9fSkgPT4ge1xuICAgIHRyeXtcbiAgICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cbiAgICB9Y2F0Y2goZSl7XG4gICAgICAgIHRocm93IGU7XG4gICAgfVxufSkoY29udGV4dCB8fCB7fSk7YDtcblxuXHRpZiAoREVCVUcpXG5cdFx0Y29uc29sZS5sb2coXCJnZW5lcmVyYXRlZCBjb2RlOiBcXG5cIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZXRPckNyZWF0ZUZ1bmN0aW9uID0gKGFTdGF0ZW1lbnQsIGNvbnRleHRQcm9wZXJ0aWVzKSA9PiB7XG5cdGNvbnN0IGNhY2hlS2V5ID0gYCR7Y29udGV4dFByb3BlcnRpZXN9Ojoke2FTdGF0ZW1lbnR9YDtcblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGNhY2hlS2V5KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQsIGNvbnRleHRQcm9wZXJ0aWVzKTtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXQoY2FjaGVLZXksIGV4cHJlc3Npb24pO1xuXHRyZXR1cm4gZXhwcmVzc2lvbjtcbn07XG5cbmNvbnN0IEVYRUNVVEVSID0gbmV3IEV4ZWN1dGVyKHtcblx0ZGVmYXVsdENvbnRleHQ6IHt9LFxuXHRleGVjdXRpb246IChhU3RhdGVtZW50LCBhQ29udGV4dCkgPT4ge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZXMgPSBHTE9CQUwgPT09IGFDb250ZXh0ID8gW10gOiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhQ29udGV4dCB8fCB7fSk7XG5cdFx0aWYocHJvcGVydHlOYW1lcy5sZW5ndGggPiA1MClcblx0XHRcdGNvbnNvbGUud2FybihgSGlnaCBjb3VudCBvZiBwcm9wZXJ0aWVzIGF0IGZpcnN0IGxldmVsLCBjYW4gYmUgZGVjcmVhc2UgdGhlIHBlcmZvcm1lbmNlISBjb3VudDogJHtwcm9wZXJ0eU5hbWVzLmxlbmd0aH1gKTtcblxuXHRcdGNvbnN0IGNvbnRleHRQcm9wZXJ0aWVzID0gcHJvcGVydHlOYW1lcy5qb2luKFwiLFwiKTtcblx0XHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50LCBjb250ZXh0UHJvcGVydGllcyk7XG5cdFx0cmV0dXJuIGV4cHJlc3Npb24oYUNvbnRleHQpO1xuXHR9LFxufSk7XG5cbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBFWEVDVVRFUik7XG5cbmV4cG9ydCBkZWZhdWx0IEVYRUNVVEVSO1xuIiwiaW1wb3J0IHsgcmVnaXN0cmF0ZSB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XG5pbXBvcnQgRXhlY3V0ZXIgZnJvbSBcIi4uL0V4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcblxuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgc2l6ZTogNTAwMCB9KTtcblxuLyoqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xuICovXG5leHBvcnQgY29uc3Qgc2V0dXBFeGVjdXRlciA9IChvcHRpb25zKSA9PiB7XG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZW5lcmF0ZSA9IChhU3RhdGVtZW50KSA9PiB7XG5cdGNvbnN0IGNvZGUgPSBgXG5yZXR1cm4gKGFzeW5jIChjdHgpID0+IHtcbiAgICB0cnl7XG4gICAgICAgIHJldHVybiAke2FTdGF0ZW1lbnR9XG4gICAgfWNhdGNoKGUpe1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn0pKGNvbnRleHQgfHwge30pO2A7XG5cblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XG5cblx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5jb25zdCBnZXRPckNyZWF0ZUZ1bmN0aW9uID0gKGFTdGF0ZW1lbnQpID0+IHtcblxuXHRjb25zdCBjYWNoZUtleSA9IGFTdGF0ZW1lbnQ7XG5cblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGNhY2hlS2V5KSkge1xuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChjYWNoZUtleSwgZXhwcmVzc2lvbik7XG5cdHJldHVybiBleHByZXNzaW9uO1xufTtcblxuY29uc3QgRVhFQ1VURVIgPSBuZXcgRXhlY3V0ZXIoe1xuXHRkZWZhdWx0Q29udGV4dDoge30sXG5cdGV4ZWN1dGlvbjogKGFTdGF0ZW1lbnQsIGFDb250ZXh0KSA9PiB7XG5cdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldE9yQ3JlYXRlRnVuY3Rpb24oYVN0YXRlbWVudCk7XG5cdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fSxcbn0pO1xuXG5yZWdpc3RyYXRlKEVYRUNVVEVSTkFNRSwgRVhFQ1VURVIpO1xuXG5leHBvcnQgZGVmYXVsdCBFWEVDVVRFUjtcbiIsImltcG9ydCB7cmVnaXN0cmF0ZX0gZnJvbSBcIi4uL0V4ZWN1dGVyUmVnaXN0cnkuanNcIjtcbmltcG9ydCBFeGVjdXRlciBmcm9tIFwiLi4vRXhlY3V0ZXIuanNcIjtcbmltcG9ydCBDb2RlQ2FjaGUgZnJvbSBcIi4uL0NvZGVDYWNoZS5qc1wiO1xuXG5leHBvcnQgY29uc3QgRVhFQ1VURVJOQU1FID0gXCJ3aXRoLXNjb3BlZC1leGVjdXRlclwiO1xuY29uc3QgRVhQUkVTU0lPTl9DQUNIRSA9IG5ldyBDb2RlQ2FjaGUoeyBzaXplOiA1MDAwIH0pO1xuXG4vKipcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9Db2RlQ2FjaGUuanMnKS5Db2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXG4gKi9cbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcblx0RVhQUkVTU0lPTl9DQUNIRS5zZXR1cChvcHRpb25zKTtcbn07XG5cbmxldCBpbml0aWFsQ2FsbCA9IHRydWU7XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQpID0+IHtcbmNvbnN0IGNvZGUgPSBgXG5cdHJldHVybiAoYXN5bmMgKGNvbnRleHQpID0+IHtcblx0XHR3aXRoKGNvbnRleHQpe1xuXHRcdFx0dHJ5e1xuXHRcdFx0XHRyZXR1cm4gJHthU3RhdGVtZW50fVxuXHRcdFx0fWNhdGNoKGUpe1xuXHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSkoY29udGV4dCB8fCB7fSk7XG5gO1xuXHQvL2NvbnNvbGUubG9nKFwiY29kZVwiLCBjb2RlKTtcblxuXHRyZXR1cm4gbmV3IEZ1bmN0aW9uKFwiY29udGV4dFwiLCBjb2RlKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCkgPT4ge1xuXHRpZiAoRVhQUkVTU0lPTl9DQUNIRS5oYXMoYVN0YXRlbWVudCkpIHtcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoYVN0YXRlbWVudCk7XG5cdH1cblx0Y29uc3QgZXhwcmVzc2lvbiA9IGdlbmVyYXRlKGFTdGF0ZW1lbnQpO1xuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChhU3RhdGVtZW50LCBleHByZXNzaW9uKTtcblx0cmV0dXJuIGV4cHJlc3Npb247XG59O1xuXG5cblxuY29uc3QgRVhFQ1VURVIgPSBuZXcgRXhlY3V0ZXIoe2RlZmF1bHRDb250ZXh0OiB7fSwgZXhlY3V0aW9uOiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcblx0XHRpZihpbml0aWFsQ2FsbCl7XG5cdFx0XHRpbml0aWFsQ2FsbCA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS53YXJuKG5ldyBFcnJvcihgV2l0aCBTY29wZWQgZXhwcmVzc2lvbiBleGVjdXRpb24gaXMgbWFya2VkIGFzIGRlcHJlY2F0ZWQuYCkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQpO1xuXHRcdHJldHVybiBleHByZXNzaW9uKGFDb250ZXh0KTtcblx0fX0pO1xucmVnaXN0cmF0ZShFWEVDVVRFUk5BTUUsIEVYRUNVVEVSKTtcblxuZXhwb3J0IGRlZmF1bHQgRVhFQ1VURVI7XG4iLCIvL2ltcG9ydCBcIi4vRXNwcmltYUV4ZWN1dGVyLmpzXCI7XG5pbXBvcnQgXCIuL1dpdGhTY29wZWRFeGVjdXRlci5qc1wiO1xuaW1wb3J0IFwiLi9Db250ZXh0T2JqZWN0RXhlY3V0ZXIuanNcIjtcbmltcG9ydCBcIi4vQ29udGV4dERlY29uc3RydWN0b3JFeGVjdXRlci5qc1wiO1xuIiwiLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gKlxuICogR2VuZXJhdGVkIGZyb20gcGFja2FnZS5qc29uIGJ5IHNjcmlwdHMvZ2VuZXJhdGUtdmVyc2lvbi5qcyBiZWZvcmUgZXZlcnkgYnVpbGQuIERvIG5vdCBlZGl0IC1cbiAqIHRoZSBuZXh0IGJ1aWxkIG92ZXJ3cml0ZXMgaXQuXG4gKlxuICogQG1vZHVsZSB2ZXJzaW9uXG4gKi9cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gXCIzLjAuMFwiO1xuXG5leHBvcnQgZGVmYXVsdCBWRVJTSU9OO1xuIiwiLyoqXG4gKiBUaGUgZ2xvYmFsIHNjb3BlIG9mIHRoZSBjdXJyZW50IGVudmlyb25tZW50LlxuICpcbiAqIFJlc29sdmVkIG9uY2Ugd2hlbiB0aGUgbW9kdWxlIGlzIGxvYWRlZDogZ2xvYmFsVGhpcywgdGhlbiBnbG9iYWwsIHdpbmRvdyBhbmQgc2VsZiBmb3IgZW5naW5lcyBub3RcbiAqIGtub3dpbmcgaXQgeWV0LiBBbiBlbXB0eSBvYmplY3Qgd2hlbiBub25lIG9mIHRoZW0gZXhpc3RzLCBzbyByZWFkaW5nIGZyb20gaXQgbmV2ZXIgdGhyb3dzLlxuICpcbiAqIEBtb2R1bGUgR2xvYmFsXG4gKlxuICogQGV4YW1wbGVcbiAqIEdMT0JBTC5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ1ZmZlcik7XG4gKi9cbmNvbnN0IEdMT0JBTCA9ICgoKSA9PiB7XG5cdGlmKHR5cGVvZiBnbG9iYWxUaGlzICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0aWYodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdsb2JhbDtcblx0aWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHdpbmRvdztcblx0aWYodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBzZWxmO1xuXHRyZXR1cm4ge307XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBHTE9CQUw7XG4iLCIvKipcclxuICogT25seSBhbiBvYmplY3QgY2FuIGNhcnJ5IGEgcHJvcGVydHksIHNvIGEgcGF0aCBzdG9wcyBhdCBhIHByaW1pdGl2ZSBpbnN0ZWFkIG9mIGhhbmRpbmcgb3V0IGFcclxuICogcHJvcGVydHkgdGhhdCBjYW5ub3QgYmUgcmVhZCBvciB3cml0dGVuLiBBbiBBcnJheSwgTWFwIG9yIERhdGUgcGFzc2VzIC0gdGhleSBhcmUgb2JqZWN0cyBhbmQgdGFrZVxyXG4gKiBhIHByb3BlcnR5IGxpa2UgYW55IG90aGVyIG9uZSwgd2hpY2ggaXMgd2hhdCBtYWtlcyBhIHBhdGggbGlrZSBcImxpc3QuMFwiIHdvcmsuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdGhlIHZhbHVlIGEgc3RlcCBvZiB0aGUgcGF0aCByZXNvbHZlZCB0b1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgbmFtZSBvZiB0aGF0IHN0ZXBcclxuICogQHBhcmFtIHtzdHJpbmd9IGtleSB0aGUgd2hvbGUgcGF0aCwgdG8gdGVsbCB3aGljaCBvbmUgb2Ygc2V2ZXJhbCBzdGVwcyBmYWlsZWRcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn0gd2hlbiB0aGUgc3RlcCBjYXJyaWVzIG5vIG9iamVjdFxyXG4gKi9cclxuY29uc3QgYXNzZXJ0RGVzY2VuZGFibGUgPSAodmFsdWUsIG5hbWUsIGtleSkgPT4ge1xyXG5cdGlmKHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIilcclxuXHRcdHJldHVybjtcclxuXHJcblx0Y29uc3QgdHlwZSA9IHZhbHVlID09PSBudWxsID8gXCJudWxsXCIgOiBgYSAke3R5cGVvZiB2YWx1ZX1gO1xyXG5cdHRocm93IG5ldyBUeXBlRXJyb3IoYGNhbm5vdCBkZXNjZW5kIGludG8gXCIke25hbWV9XCIgb2YgcGF0aCBcIiR7a2V5fVwiIC0gJHt0eXBlfSBpcyBubyBvYmplY3RgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBPbmUgcHJvcGVydHkgb2YgYW4gb2JqZWN0LCBhZGRyZXNzZWQgYnkgbmFtZSwgdG9nZXRoZXIgd2l0aCB0aGUgb2JqZWN0IGNhcnJ5aW5nIGl0LlxyXG4gKlxyXG4gKiBCdWlsdCB0aHJvdWdoIHtAbGluayBPYmplY3RQcm9wZXJ0eS5sb2FkfSwgd2hpY2ggd2Fsa3MgYSBkb3R0ZWQgcGF0aCBhbmQgaGFuZHMgYmFjayB0aGUgcHJvcGVydHkgYXRcclxuICogaXRzIGVuZC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgcHJvcGVydHkgPSBPYmplY3RQcm9wZXJ0eS5sb2FkKHthIDoge2IgOiAxfX0sIFwiYS5iXCIpO1xyXG4gKiBwcm9wZXJ0eS52YWx1ZTsgICAgICAvLyAxXHJcbiAqIHByb3BlcnR5LnZhbHVlID0gMjsgIC8vIHdyaXRlcyBpbnRvIHRoZSBvYmplY3RcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9iamVjdFByb3BlcnR5IHtcclxuXHQvKipcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5IG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHQgdGhlIG9iamVjdCBjYXJyeWluZyBpdFxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGtleSwgY29udGV4dCl7XHJcblx0XHR0aGlzLmtleSA9IGtleTtcclxuXHRcdHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBXaGV0aGVyIHRoZSBrZXkgaXMgcmVhY2hhYmxlIG9uIHRoZSBjb250ZXh0IGF0IGFsbC5cclxuXHQgKlxyXG5cdCAqIFRoaXMgYW5zd2VycyBmb3IgdGhlIHdob2xlIHByb3RvdHlwZSBjaGFpbiwgbm90IG9ubHkgZm9yIG93biBwcm9wZXJ0aWVzIC0gbG9hZCh7fSwgXCJ0b1N0cmluZ1wiKVxyXG5cdCAqIHJlcG9ydHMgdHJ1ZS4gVGhhdCBpcyBkZWxpYmVyYXRlOiBhIHBhdGggbWF5IGFkZHJlc3MgYSBwcm90b3R5cGUgYW5kIGV4dGVuZCBpdCwgc28gYW4gaW5oZXJpdGVkXHJcblx0ICoga2V5IGlzIGEga2V5IGxpa2UgYW55IG90aGVyIGhlcmUuIFVzZSBoYXNWYWx1ZSB0byBhc2sgd2hldGhlciBzb21ldGhpbmcgaXMgYWN0dWFsbHkgc3RvcmVkLlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0ICovXHJcblx0Z2V0IGtleURlZmluZWQoKXtcclxuXHRcdHJldHVybiB0aGlzLmtleSBpbiB0aGlzLmNvbnRleHQ7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFdoZXRoZXIgc29tZXRoaW5nIGlzIHN0b3JlZCB1bmRlciB0aGUga2V5LiBPbmx5IHVuZGVmaW5lZCBjb3VudHMgYXMgbm90aGluZyAtIDAsIFwiXCIsIGZhbHNlIGFuZFxyXG5cdCAqIG51bGwgYXJlIHZhbHVlcy5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdCAqL1xyXG5cdGdldCBoYXNWYWx1ZSgpe1xyXG5cdFx0cmV0dXJuIHR5cGVvZiB0aGlzLmNvbnRleHRbdGhpcy5rZXldICE9PSBcInVuZGVmaW5lZFwiO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJldHVybnMgeyp9IHRoZSBzdG9yZWQgdmFsdWUsIHVuZGVmaW5lZCB3aGVuIHRoZXJlIGlzIG5vbmVcclxuXHQgKi9cclxuXHRnZXQgdmFsdWUoKXtcclxuXHRcdHJldHVybiB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHsqfSBkYXRhXHJcblx0ICovXHJcblx0c2V0IHZhbHVlKGRhdGEpe1xyXG5cdFx0dGhpcy5jb250ZXh0W3RoaXMua2V5XSA9IGRhdGE7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBBZGRzIGEgdmFsdWUgbmV4dCB0byB3aGF0IGlzIGFscmVhZHkgdGhlcmU6IHdyaXRlcyBpdCB3aGVuIHRoZSBrZXkgaG9sZHMgbm90aGluZywgdHVybnMgdGhlXHJcblx0ICogdmFsdWUgaW50byBhbiBhcnJheSBvZiBib3RoIHdoZW4gaXQgaG9sZHMgb25lLCBhbmQgcHVzaGVzIG9udG8gdGhlIGFycmF5IHdoZW4gaXQgaG9sZHMgb25lXHJcblx0ICogYWxyZWFkeS5cclxuXHQgKlxyXG5cdCAqIFRoZSB2YWx1ZSBpdHNlbGYgaXMgbm90IGxvb2tlZCBhdCAtIGFwcGVuZGluZyB1bmRlZmluZWQgcHV0cyB1bmRlZmluZWQgaW50byB0aGUgYXJyYXkuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0geyp9IGRhdGFcclxuXHQgKlxyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMTsgICAvLyB7a2V5IDogMX1cclxuXHQgKiBwcm9wZXJ0eS5hcHBlbmQgPSAyOyAgIC8vIHtrZXkgOiBbMSwgMl19XHJcblx0ICogcHJvcGVydHkuYXBwZW5kID0gMzsgICAvLyB7a2V5IDogWzEsIDIsIDNdfVxyXG5cdCAqL1xyXG5cdHNldCBhcHBlbmQoZGF0YSkge1xyXG5cdFx0aWYoIXRoaXMuaGFzVmFsdWUpXHJcblx0XHRcdHRoaXMudmFsdWUgPSBkYXRhO1xyXG5cdFx0ZWxzZSB7XHJcblx0XHRcdGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZTtcclxuXHRcdFx0aWYodmFsdWUgaW5zdGFuY2VvZiBBcnJheSlcclxuXHRcdFx0XHR2YWx1ZS5wdXNoKGRhdGEpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy52YWx1ZSA9IFt0aGlzLnZhbHVlLCBkYXRhXTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIERlbGV0ZXMgdGhlIGtleSBmcm9tIHRoZSBvYmplY3QuIERvZXMgbm90aGluZyB3aGVuIGl0IGlzIG5vdCB0aGVyZS5cclxuXHQgKlxyXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxyXG5cdCAqL1xyXG5cdHJlbW92ZSgpe1xyXG5cdFx0ZGVsZXRlIHRoaXMuY29udGV4dFt0aGlzLmtleV07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIExvYWRzIHRoZSBwcm9wZXJ0eSBhIGRvdHRlZCBwYXRoIGFkZHJlc3Nlcy4gRXZlcnkgcGFydCBvZiB0aGUgcGF0aCBpcyB0cmltbWVkLCBzbyBcIiBhIC4gYiBcIlxyXG5cdCAqIGFkZHJlc3NlcyB0aGUgc2FtZSBwcm9wZXJ0eSBhcyBcImEuYlwiLlxyXG5cdCAqXHJcblx0ICogQSBtaXNzaW5nIHN0ZXAgaXMgY3JlYXRlZCB3aXRoIGNyZWF0ZSwgb3RoZXJ3aXNlIHRoZSBwYXRoIGlzIHJlcG9ydGVkIGFzIG5vdCBsb2FkYWJsZS4gQSBzdGVwXHJcblx0ICogaG9sZGluZyBzb21ldGhpbmcgdGhhdCBpcyBubyBvYmplY3QgY2Fubm90IGJlIHdhbGtlZCBpbnRvIGF0IGFsbCAtIHRoYXQgaXMgYSBicm9rZW4gcGF0aCwgbm90IGFcclxuXHQgKiBtaXNzaW5nIG9uZSwgYW5kIGl0IGlzIHJlcG9ydGVkIGFzIGFuIGVycm9yIHJlZ2FyZGxlc3Mgb2YgY3JlYXRlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGRhdGEgdGhlIG9iamVjdCB0byB3YWxrXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYSBkb3R0ZWQgcGF0aCBhZGRyZXNzZXMgYSBuZXN0ZWQgb25lXHJcblx0ICogQHBhcmFtIHtib29sZWFufSBbY3JlYXRlPXRydWVdIGNyZWF0ZSBhIG1pc3Npbmcgc3RlcCBvbiB0aGUgd2F5XHJcblx0ICogQHJldHVybnMge09iamVjdFByb3BlcnR5fG51bGx9IG51bGwgd2hlbiBhIHN0ZXAgaXMgbWlzc2luZyBhbmQgY3JlYXRlIGlzIGZhbHNlXHJcblx0ICogQHRocm93cyB7VHlwZUVycm9yfSB3aGVuIGEgc3RlcCBvZiB0aGUgcGF0aCBob2xkcyBzb21ldGhpbmcgdGhhdCBpcyBubyBvYmplY3RcclxuXHQgKlxyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogT2JqZWN0UHJvcGVydHkubG9hZCh7YSA6IHtiIDogMX19LCBcImEuYlwiKS52YWx1ZTsgICAvLyAxXHJcblx0ICogT2JqZWN0UHJvcGVydHkubG9hZCh7bGlzdCA6IFsxLCAyXX0sIFwibGlzdC4xXCIpLnZhbHVlOyAgIC8vIDIsIGFuIGFycmF5IGlzIGFuIG9iamVjdFxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe30sIFwiYS5iXCIsIGZhbHNlKTsgICAgICAgICAgICAgLy8gbnVsbFxyXG5cdCAqIE9iamVjdFByb3BlcnR5LmxvYWQoe2EgOiAwfSwgXCJhLmJcIik7ICAgICAgICAgICAgICAgLy8gdGhyb3dzLCAwIGlzIG5vIG9iamVjdFxyXG5cdCAqL1xyXG5cdHN0YXRpYyBsb2FkKGRhdGEsIGtleSwgY3JlYXRlPXRydWUpIHtcclxuXHRcdGxldCBjb250ZXh0ID0gZGF0YTtcclxuXHRcdGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoXCIuXCIpO1xyXG5cdFx0bGV0IG5hbWUgPSBrZXlzLnNoaWZ0KCkudHJpbSgpO1xyXG5cdFx0d2hpbGUoa2V5cy5sZW5ndGggPiAwKXtcclxuXHRcdFx0aWYodHlwZW9mIGNvbnRleHRbbmFtZV0gPT09IFwidW5kZWZpbmVkXCIgfHwgY29udGV4dFtuYW1lXSA9PT0gbnVsbCl7XHJcblx0XHRcdFx0aWYoIWNyZWF0ZSlcclxuXHRcdFx0XHRcdHJldHVybiBudWxsO1xyXG5cclxuXHRcdFx0XHRjb250ZXh0W25hbWVdID0ge31cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0YXNzZXJ0RGVzY2VuZGFibGUoY29udGV4dFtuYW1lXSwgbmFtZSwga2V5KTtcclxuXHRcdFx0Y29udGV4dCA9IGNvbnRleHRbbmFtZV07XHJcblx0XHRcdG5hbWUgPSBrZXlzLnNoaWZ0KCkudHJpbSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBuZXcgT2JqZWN0UHJvcGVydHkobmFtZSwgY29udGV4dCk7XHJcblx0fVxyXG59OyIsIi8qKlxyXG4gKiBVdGlsaXRpZXMgdG8gaW5zcGVjdCwgY29tcGFyZSwgbWVyZ2UgYW5kIGZpbHRlciBqYXZhc2NyaXB0IG9iamVjdHMuXHJcbiAqXHJcbiAqIFNldmVyYWwgZnVuY3Rpb25zIHNoYXJlIG9uZSBub3Rpb24gb2YgZGF0YTogcHJpbWl0aXZlcywgc2ltcGxlIG9iamVjdHMsIEFycmF5LCBEYXRlLCBSZWdFeHAsIE1hcFxyXG4gKiBhbmQgU2V0LiB7QGxpbmsgaXNQb2pvfSBkZWNpZGVzIHdoZXRoZXIgYSB2YWx1ZSBzdGF5cyB3aXRoaW4gaXQsIHtAbGluayBlcXVhbFBvam99IGNvbXBhcmVzIHRob3NlXHJcbiAqIHR5cGVzIGJ5IHZhbHVlLCBhbmQge0BsaW5rIG1lcmdlfSB0cmVhdHMgZXZlcnl0aGluZyBvdXRzaWRlIG9mIGl0IGFzIGEgdmFsdWUgdG8gYmUgcmVwbGFjZWQuXHJcbiAqXHJcbiAqIEBtb2R1bGUgT2JqZWN0VXRpbHNcclxuICovXHJcbmltcG9ydCBPYmplY3RQcm9wZXJ0eSBmcm9tIFwiLi9PYmplY3RQcm9wZXJ0eS5qc1wiO1xyXG5cclxuLyoqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFcclxuICogQHBhcmFtIHtBcnJheX0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbEFycmF5ID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IGxlbmd0aCA9IGEubGVuZ3RoO1xyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIGlmICghaW50ZXJuYWxFcXVhbFBvam8oYVtpXSwgYltpXSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBzZXQgaXMgdW5vcmRlcmVkLCBzbyBldmVyeSBlbnRyeSBvZiBhIGhhcyB0byBmaW5kIGl0cyBvd24gcGFydG5lciBpbiBiLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1NldH0gYVxyXG4gKiBAcGFyYW0ge1NldH0gYlxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5jb25zdCBlcXVhbFNldCA9IChhLCBiLCBzZWVuKSA9PiB7XHJcblx0aWYgKGEuc2l6ZSAhPT0gYi5zaXplKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdGNvbnN0IHJlbWFpbmluZyA9IEFycmF5LmZyb20oYik7XHJcblx0Zm9yIChjb25zdCBlbnRyeUEgb2YgYSkge1xyXG5cdFx0Y29uc3QgaW5kZXggPSByZW1haW5pbmcuZmluZEluZGV4KChlbnRyeUIpID0+IGludGVybmFsRXF1YWxQb2pvKGVudHJ5QSwgZW50cnlCLCBzZWVuKSk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0cmVtYWluaW5nLnNwbGljZShpbmRleCwgMSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIG1hcCBpcyB1bm9yZGVyZWQgYXMgd2VsbCBhbmQgaXRzIGtleXMgbWF5IGJlIG9iamVjdHMsIHNvIHRoZSBrZXlzIGdldCBjb21wYXJlZCBieSB2YWx1ZSB0b28uXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7TWFwfSBhXHJcbiAqIEBwYXJhbSB7TWFwfSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGVxdWFsTWFwID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoYS5zaXplICE9PSBiLnNpemUpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Y29uc3QgcmVtYWluaW5nID0gQXJyYXkuZnJvbShiKTtcclxuXHRmb3IgKGNvbnN0IFtrZXlBLCB2YWx1ZUFdIG9mIGEpIHtcclxuXHRcdGNvbnN0IGluZGV4ID0gcmVtYWluaW5nLmZpbmRJbmRleCgoW2tleUIsIHZhbHVlQl0pID0+IGludGVybmFsRXF1YWxQb2pvKGtleUEsIGtleUIsIHNlZW4pICYmIGludGVybmFsRXF1YWxQb2pvKHZhbHVlQSwgdmFsdWVCLCBzZWVuKSk7XHJcblx0XHRpZiAoaW5kZXggPCAwKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0cmVtYWluaW5nLnNwbGljZShpbmRleCwgMSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb21wYXJlcyB0d28gb2JqZWN0cyBieSBwcm90b3R5cGUgYW5kIGJ5IHRoZWlyIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGVxdWFsT2JqZWN0ID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKGEpICE9PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYikpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Y29uc3QgcHJvcGVydGllc0EgPSBPYmplY3Qua2V5cyhhKTtcclxuXHRjb25zdCBwcm9wZXJ0aWVzQiA9IE9iamVjdC5rZXlzKGIpO1xyXG5cdGlmIChwcm9wZXJ0aWVzQS5sZW5ndGggIT09IHByb3BlcnRpZXNCLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRmb3IgKGNvbnN0IGtleSBvZiBwcm9wZXJ0aWVzQSkge1xyXG5cdFx0Ly8gZXF1YWwga2V5IGNvdW50cyBhbG9uZSB3b3VsZCBsZXQge3g6MSwgeTp1bmRlZmluZWR9IHBhc3MgYWdhaW5zdCB7eDoxLCB6OnVuZGVmaW5lZH1cclxuXHRcdGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIGtleSkpIHJldHVybiBmYWxzZTtcclxuXHRcdGlmICghaW50ZXJuYWxFcXVhbFBvam8oYVtrZXldLCBiW2tleV0sIHNlZW4pKSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBIGN5Y2xpYyBzdHJ1Y3R1cmUgY2FuIG9ubHkgYmUgZGVjaWRlZCBjby1pbmR1Y3RpdmVseTogYSBwYWlyIGFscmVhZHkgdW5kZXIgY29tcGFyaXNvbiBjb3VudHMgYXNcclxuICogZXF1YWwsIG90aGVyd2lzZSB0aGUgd2FsayB3b3VsZCBuZXZlciBjb21lIGJhY2suXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcGFyYW0ge29iamVjdH0gYVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSB3aGVuIHRoaXMgcGFpciBpcyBhbHJlYWR5IGJlaW5nIGNvbXBhcmVkIGZ1cnRoZXIgdXAgdGhlIHN0YWNrXHJcbiAqL1xyXG5jb25zdCBpc0NvbXBhcmluZyA9IChzZWVuLCBhLCBiKSA9PiB7XHJcblx0Y29uc3QgcGFydG5lcnMgPSBzZWVuLmdldChhKTtcclxuXHRyZXR1cm4gISFwYXJ0bmVycyAmJiBwYXJ0bmVycy5oYXMoYik7XHJcbn07XHJcblxyXG4vKipcclxuICogTm90ZXMgYSBwYWlyIGFzIGJlaW5nIGNvbXBhcmVkLCBzbyBhIGN5Y2xlIHJ1bm5pbmcgdGhyb3VnaCBpdCB0ZXJtaW5hdGVzLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge1dlYWtNYXB9IHNlZW4gcGFpcnMgY3VycmVudGx5IHVuZGVyIGNvbXBhcmlzb25cclxuICogQHBhcmFtIHtvYmplY3R9IGFcclxuICogQHBhcmFtIHtvYmplY3R9IGJcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5jb25zdCByZW1lbWJlckNvbXBhcmluZyA9IChzZWVuLCBhLCBiKSA9PiB7XHJcblx0Y29uc3QgcGFydG5lcnMgPSBzZWVuLmdldChhKTtcclxuXHRpZiAocGFydG5lcnMpIHBhcnRuZXJzLmFkZChiKTtcclxuXHRlbHNlIHNlZW4uc2V0KGEsIG5ldyBXZWFrU2V0KFtiXSkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIGEgdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWQuXHJcbiAqXHJcbiAqIFZhbHVlSGVscGVyLm5vVmFsdWUgYW5zd2VycyB0aGUgc2FtZSBxdWVzdGlvbi4gQm90aCBhcmUga2VwdCBvbiBwdXJwb3NlLCBzbyBWYWx1ZUhlbHBlciBzdGF5cyBmcmVlXHJcbiAqIG9mIGEgZGVwZW5kZW5jeSBvbiB0aGlzIG1vZHVsZSAtIHNlZSB0aGUgbm90ZSB0aGVyZS5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNOdWxsT3JVbmRlZmluZWQgPSAob2JqZWN0KSA9PiB7XHJcblx0cmV0dXJuIG9iamVjdCA9PSBudWxsIHx8IHR5cGVvZiBvYmplY3QgPT09IFwidW5kZWZpbmVkXCI7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhIHByaW1pdGl2ZS5cclxuICpcclxuICogbnVsbCBhbmQgdW5kZWZpbmVkIGNvdW50IGFzIHByaW1pdGl2ZXMuIEEgc3ltYm9sIGRvZXMgbm90IC0gaXQgaXMgdHJlYXRlZCBhcyBhbiBvcGFxdWUgdmFsdWVcclxuICogdGhyb3VnaG91dCB0aGlzIG1vZHVsZSwgc28gdGhhdCB7QGxpbmsgaXNQb2pvfSBrZWVwcyByZWplY3RpbmcgaXQgYXMgZGF0YS5cclxuICpcclxuICogQHBhcmFtIHsqfSBvYmplY3QgdGhlIHZhbHVlIHRvIGJlIHRlc3RpbmdcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0Y29uc3QgdHlwZSA9IHR5cGVvZiBvYmplY3Q7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIFwibnVtYmVyXCI6XHJcblx0XHRjYXNlIFwiYmlnaW50XCI6XHJcblx0XHRjYXNlIFwiYm9vbGVhblwiOlxyXG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxyXG5cdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBhIHZhbHVlIGlzIGFuIG9iamVjdC5cclxuICpcclxuICogRXZlcnkgb2JqZWN0IGNvdW50cywgQXJyYXksIE1hcCwgRGF0ZSBhbmQgY2xhc3MgaW5zdGFuY2VzIGluY2x1ZGVkLiBVc2Uge0BsaW5rIGlzUG9qb30gdG8gYXNrIGZvclxyXG4gKiBhIHNpbXBsZSBkYXRhIG9iamVjdCBpbnN0ZWFkLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IG9iamVjdCB0aGUgdmFsdWUgdG8gYmUgdGVzdGluZ1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IChvYmplY3QpID0+IHtcclxuXHRpZiAoaXNOdWxsT3JVbmRlZmluZWQob2JqZWN0KSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRyZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gXCJvYmplY3RcIjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDb21wYXJlcyB0d28gdmFsdWVzIGJ5IHZhbHVlLlxyXG4gKlxyXG4gKiBUaGUgdHlwZXMgY29tcGFyZWQgYnkgdmFsdWUgYXJlIHRoZSBvbmVzIHtAbGluayBpc1Bvam99IGFjY2VwdHMgYXMgZGF0YTogcHJpbWl0aXZlcywgc2ltcGxlXHJcbiAqIG9iamVjdHMsIEFycmF5LCBEYXRlLCBSZWdFeHAsIE1hcCBhbmQgU2V0LiBBIERhdGUgaXMgY29tcGFyZWQgYnkgaXRzIHRpbWUsIGEgUmVnRXhwIGJ5IHNvdXJjZSBhbmRcclxuICogZmxhZ3MuIFNldCBhbmQgTWFwIGFyZSB1bm9yZGVyZWQsIHNvIHRoZWlyIGVudHJpZXMgYXJlIG1hdGNoZWQgYnkgdmFsdWUgaW5zdGVhZCBvZiBieSBwb3NpdGlvbixcclxuICogYW5kIHRoZSBrZXlzIG9mIGEgTWFwIHRha2UgcGFydCBpbiB0aGF0IGNvbXBhcmlzb24uXHJcbiAqXHJcbiAqIFNpbXBsZSBvYmplY3RzIGFuZCBjbGFzcyBpbnN0YW5jZXMgbmVlZCB0aGUgc2FtZSBwcm90b3R5cGUgYW5kIHRoZSBzYW1lIG93biBlbnVtZXJhYmxlXHJcbiAqIHByb3BlcnRpZXMuIEV2ZXJ5IG90aGVyIG9iamVjdCAtIEVycm9yLCBQcm9taXNlLCBXZWFrTWFwIGFuZCB0aGUgbGlrZSAtIGtlZXBzIGl0cyBzdGF0ZSBvdXQgb2ZcclxuICogcmVhY2gsIHNvIHRob3NlIGNvbXBhcmUgYnkgaWRlbnRpdHkgb25seS4gRnVuY3Rpb25zIGFuZCBzeW1ib2xzIGRvIGFzIHdlbGwuXHJcbiAqXHJcbiAqIEN5Y2xpYyBzdHJ1Y3R1cmVzIGFyZSBzdXBwb3J0ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gYVxyXG4gKiBAcGFyYW0geyp9IGJcclxuICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGVxdWFsUG9qbyh7YSA6IFsxLCAyXX0sIHthIDogWzEsIDJdfSk7ICAgICAgICAgICAgICAgLy8gdHJ1ZVxyXG4gKiBlcXVhbFBvam8obmV3IFNldChbMSwgMl0pLCBuZXcgU2V0KFsyLCAxXSkpOyAgICAgICAgIC8vIHRydWUsIGEgc2V0IGlzIHVub3JkZXJlZFxyXG4gKiBlcXVhbFBvam8obmV3IERhdGUoMCksIG5ldyBEYXRlKDEpKTsgICAgICAgICAgICAgICAgIC8vIGZhbHNlXHJcbiAqIGVxdWFsUG9qbyhuZXcgRXJyb3IoXCJ4XCIpLCBuZXcgRXJyb3IoXCJ4XCIpKTsgICAgICAgICAgIC8vIGZhbHNlLCBjb21wYXJlZCBieSBpZGVudGl0eVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVxdWFsUG9qbyA9IChhLCBiKSA9PiBpbnRlcm5hbEVxdWFsUG9qbyhhLCBiLCBuZXcgV2Vha01hcCgpKTtcclxuXHJcblxyXG4vKipcclxuKiBAcGFyYW0geyp9IGFcclxuICogQHBhcmFtIHsqfSBiXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gc2VlbiBpbnRlcm5hbCwgdHJhY2tzIHRoZSBwYWlycyBjdXJyZW50bHkgdW5kZXIgY29tcGFyaXNvblxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGludGVybmFsRXF1YWxQb2pvID0gKGEsIGIsIHNlZW4pID0+IHtcclxuXHRpZiAoaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgaXNOdWxsT3JVbmRlZmluZWQoYikpIHJldHVybiBhID09PSBiO1xyXG5cdGlmIChhID09PSBiKSByZXR1cm4gdHJ1ZTtcclxuXHRpZiAoaXNQcmltaXRpdmUoYSkgfHwgaXNQcmltaXRpdmUoYikpIHJldHVybiBhID09PSBiO1xyXG5cclxuXHRjb25zdCB0eXBlQSA9IHR5cGVvZiBhO1xyXG5cdGlmICh0eXBlQSAhPT0gdHlwZW9mIGIpIHJldHVybiBmYWxzZTtcclxuXHRpZiAodHlwZUEgIT09IFwib2JqZWN0XCIpIHJldHVybiBhID09PSBiOyAvLyBmdW5jdGlvbiBhbmQgc3ltYm9sXHJcblxyXG5cdGlmIChpc0NvbXBhcmluZyhzZWVuLCBhLCBiKSkgcmV0dXJuIHRydWU7XHJcblx0cmVtZW1iZXJDb21wYXJpbmcoc2VlbiwgYSwgYik7XHJcblxyXG5cdGlmKGEgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gIGIgaW5zdGFuY2VvZiBEYXRlID8gT2JqZWN0LmlzKGEuZ2V0VGltZSgpLCBiLmdldFRpbWUoKSkgOiBmYWxzZTtcclxuXHRlbHNlIGlmKGEgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiBiIGluc3RhbmNlb2YgUmVnRXhwID8gKGEuc291cmNlID09PSBiLnNvdXJjZSAmJiBhLmZsYWdzID09PSBiLmZsYWdzKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gYiBpbnN0YW5jZW9mIEFycmF5ID8gZXF1YWxBcnJheShhLCBiLCBzZWVuKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIFNldCkgcmV0dXJuIGIgaW5zdGFuY2VvZiBTZXQgPyBlcXVhbFNldChhLCBiLCBzZWVuKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYoYSBpbnN0YW5jZW9mIE1hcCkgcmV0dXJuIGIgaW5zdGFuY2VvZiBNYXAgPyBlcXVhbE1hcChhLCBiLCBzZWVuKSA6IGZhbHNlO1xyXG5cdGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIGZhbHNlO1x0XHJcblx0ZWxzZSByZXR1cm4gZXF1YWxPYmplY3QoYSwgYiwgc2Vlbik7XHJcbn07XHJcblxyXG4vKipcclxuICogQSBwbGFpbiBvYmplY3Qgb3ducyBlaXRoZXIgbm8gcHJvdG90eXBlIGF0IGFsbCBvciBhIHByb3RvdHlwZSB0aGF0IGl0c2VsZiBoYXMgbm9uZS4gQ2hlY2tpbmcgdGhlXHJcbiAqIGNoYWluIGxlbmd0aCBpbnN0ZWFkIG9mIGNvbXBhcmluZyBhZ2FpbnN0IE9iamVjdC5wcm90b3R5cGUga2VlcHMgdGhpcyB3b3JraW5nIGFjcm9zcyByZWFsbXMsXHJcbiAqIHdoZXJlIGFuIGlmcmFtZSBicmluZ3MgaXRzIG93biBPYmplY3QucHJvdG90eXBlLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IG9iamVjdFxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGlzUGxhaW5PYmplY3QgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKG9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gZmFsc2U7XHJcblx0Y29uc3QgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XHJcblx0cmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKSA9PT0gbnVsbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBXYWxrcyBhIHZhbHVlIGFuZCBkZWNpZGVzIHdoZXRoZXIgZXZlcnl0aGluZyByZWFjaGFibGUgZnJvbSBpdCBpcyBkYXRhLlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0geyp9IHZhbHVlXHJcbiAqIEBwYXJhbSB7V2Vha1NldH0gW3NlZW5dIHZhbHVlcyBhbHJlYWR5IHdhbGtlZCwgY2xvc2VzIGN5Y2xlc1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICovXHJcbmNvbnN0IGlzRGF0YVZhbHVlID0gKHZhbHVlLCBzZWVuID0gbmV3IFdlYWtTZXQoKSkgPT4ge1xyXG5cdGlmIChpc1ByaW1pdGl2ZSh2YWx1ZSkpIHJldHVybiB0cnVlO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgcmV0dXJuIHRydWU7XHJcblx0ZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHJldHVybiB0cnVlO1xyXG5cclxuXHRpZiAoc2Vlbi5oYXModmFsdWUpKSByZXR1cm4gdHJ1ZTtcclxuXHRzZWVuLmFkZCh2YWx1ZSk7XHJcblxyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gdmFsdWUuZXZlcnkoKGVudHJ5KSA9PiBpc0RhdGFWYWx1ZShlbnRyeSwgc2VlbikpO1xyXG5cdGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgTWFwKSB7XHJcblx0XHRmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKGtleSwgc2VlbikgfHwgIWlzRGF0YVZhbHVlKGVudHJ5LCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xyXG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB2YWx1ZSkge1xyXG5cdFx0XHRpZiAoIWlzRGF0YVZhbHVlKGVudHJ5LCBzZWVuKSkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fSBlbHNlIGlmICghaXNQbGFpbk9iamVjdCh2YWx1ZSkpXHJcblx0XHRyZXR1cm4gZmFsc2U7IC8vIGNsYXNzIGluc3RhbmNlcyBhbmQgZXZlcnkgb3RoZXIgZXhvdGljIG9iamVjdFxyXG5cdGVsc2Uge1xyXG5cdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModmFsdWUpKSB7XHJcblx0XHRcdGlmICghaXNEYXRhVmFsdWUodmFsdWVba2V5XSwgc2VlbikpIHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcbn07XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYW4gb2JqZWN0IGlzIGEgcHVyZSBkYXRhIG9iamVjdC5cclxuICpcclxuICogVGhlIG9iamVjdCBpdHNlbGYgaGFzIHRvIGJlIGEgc2ltcGxlIG9iamVjdCAtIG5vIEFycmF5LCBNYXAgb3Igc29tZXRoaW5nIGVsc2UuIEV2ZXJ5IHZhbHVlXHJcbiAqIHJlYWNoYWJsZSBmcm9tIGl0IGhhcyB0byBiZSBkYXRhIGFzIHdlbGw6IHByaW1pdGl2ZXMsIHNpbXBsZSBvYmplY3RzLCBBcnJheSwgRGF0ZSwgUmVnRXhwLCBNYXAgb3JcclxuICogU2V0LiBGdW5jdGlvbnMgYW5kIGNsYXNzIGluc3RhbmNlcyBhcmUgcmVqZWN0ZWQgYXQgYW55IGRlcHRoLCBpbmNsdWRpbmcgaW5zaWRlIGFycmF5cyBhbmQgaW5zaWRlXHJcbiAqIHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYSBNYXAgb3IgU2V0LlxyXG4gKlxyXG4gKiBPbmx5IG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgYXJlIGluc3BlY3RlZC4gQ3ljbGljIHJlZmVyZW5jZXMgYXJlIGFsbG93ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IHRoZSBvYmplY3QgdG8gYmUgdGVzdGluZ1xyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICpcclxuICogQGV4YW1wbGVcclxuICogaXNQb2pvKHthIDoge2IgOiBbMSwgbmV3IERhdGUoKV19fSk7ICAgLy8gdHJ1ZVxyXG4gKiBpc1Bvam8oe2EgOiAoKSA9PiB7fX0pOyAgICAgICAgICAgICAgICAvLyBmYWxzZSwgYSBmdW5jdGlvbiBpcyBubyBkYXRhXHJcbiAqIGlzUG9qbyh7YSA6IFt7YiA6IG5ldyBGb28oKX1dfSk7ICAgICAgIC8vIGZhbHNlLCByZWplY3RlZCBhdCBhbnkgZGVwdGhcclxuICogaXNQb2pvKFtdKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsc2UsIHRoZSBvYmplY3QgaXRzZWxmIGhhcyB0byBiZSBhIHNpbXBsZSBvbmVcclxuICovXHJcbmV4cG9ydCBjb25zdCBpc1Bvam8gPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKGlzTnVsbE9yVW5kZWZpbmVkKG9iamVjdCkgfHwgIWlzUGxhaW5PYmplY3Qob2JqZWN0KSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRyZXR1cm4gaXNEYXRhVmFsdWUob2JqZWN0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBcHBlbmRzIGEgcHJvcGVydHkgdmFsdWUgdG8gYW4gb2JqZWN0LiBJZiB0aGUgcHJvcGVydHkgYWxyZWFkeSBob2xkcyBhIHZhbHVlLCBpdCBpcyBjb252ZXJ0ZWRcclxuICogaW50byBhbiBhcnJheSBjYXJyeWluZyBib3RoLiBBbiB1bmRlZmluZWQgdmFsdWUgaXMgaWdub3JlZC5cclxuICpcclxuICogVGhlIGtleSBtYXkgYWRkcmVzcyBhIG5lc3RlZCBwcm9wZXJ0eSBieSBhIGRvdHRlZCBwYXRoLCBtaXNzaW5nIHN0ZXBzIGFyZSBjcmVhdGVkIG9uIHRoZSB3YXkuXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhS2V5IG5hbWUgb2YgdGhlIHByb3BlcnR5LCBhIGRvdHRlZCBwYXRoIGFkZHJlc3NlcyBhIG5lc3RlZCBvbmVcclxuICogQHBhcmFtIHsqfSBhRGF0YSBwcm9wZXJ0eSB2YWx1ZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gYU9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGVuZCB0aGUgcHJvcGVydHkgdG9cclxuICogQHJldHVybnMge29iamVjdH0gdGhlIGNoYW5nZWQgb2JqZWN0XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIGFwcGVuZChcImFcIiwgMSwge30pOyAgICAgICAgICAgICAvLyB7YSA6IDF9XHJcbiAqIGFwcGVuZChcImFcIiwgMiwge2EgOiAxfSk7ICAgICAgICAvLyB7YSA6IFsxLCAyXX1cclxuICogYXBwZW5kKFwiYS5iXCIsIDEsIHt9KTsgICAgICAgICAgIC8vIHthIDoge2IgOiAxfX1cclxuICovXHJcbmV4cG9ydCBjb25zdCBhcHBlbmQgPSAoYUtleSwgYURhdGEsIGFPYmplY3QpID0+IHtcclxuXHRpZiAodHlwZW9mIGFEYXRhICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRjb25zdCBwcm9wZXJ0eSA9IE9iamVjdFByb3BlcnR5LmxvYWQoYU9iamVjdCwgYUtleSwgdHJ1ZSk7XHJcblx0XHRwcm9wZXJ0eS5hcHBlbmQgPSBhRGF0YTtcclxuXHR9XHJcblx0cmV0dXJuIGFPYmplY3Q7XHJcbn07XHJcblxyXG4vKipcclxuICogT3duIGVudW1lcmFibGUga2V5cywgc3RyaW5ncyBhbmQgc3ltYm9scyBhbGlrZSAtIHRoZSBzYW1lIHNldCBPYmplY3QuYXNzaWduIGNvcGllcy5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHsqfSBzb3VyY2VcclxuICogQHJldHVybnMge0FycmF5PHN0cmluZ3xzeW1ib2w+fVxyXG4gKi9cclxuY29uc3QgYXNzaWduYWJsZUtleXMgPSAoc291cmNlKSA9PiB7XHJcblx0Y29uc3Qgb2JqZWN0ID0gT2JqZWN0KHNvdXJjZSk7XHJcblx0cmV0dXJuIFJlZmxlY3Qub3duS2V5cyhvYmplY3QpLmZpbHRlcigoa2V5KSA9PiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCBrZXkpKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNZXJnZXMgb2JqZWN0cyBpbnRvIGEgdGFyZ2V0IG9iamVjdCAtIGEgcmVjdXJzaXZlIE9iamVjdC5hc3NpZ24uIEl0IHN0ZXBzIGludG8gb2JqZWN0cyBhbmQgc3ViXHJcbiAqIG9iamVjdHMuIEV2ZXJ5IG90aGVyIHZhbHVlIGlzIHJlcGxhY2VkIGJ5IHRoZSB2YWx1ZSBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0LlxyXG4gKlxyXG4gKiBMaWtlIE9iamVjdC5hc3NpZ24gaXQgY29waWVzIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgLSBzdHJpbmcgYW5kIHN5bWJvbCBrZXlzIGFsaWtlIC0sIGlnbm9yZXNcclxuICogbnVsbCBhbmQgdW5kZWZpbmVkIHNvdXJjZXMgYW5kIHJldHVybnMgdGhlIHRhcmdldC4gVW5saWtlIE9iamVjdC5hc3NpZ24gaXQgc3RlcHMgaW50byBhIHByb3BlcnR5XHJcbiAqIHdoZW4gdGFyZ2V0IGFuZCBzb3VyY2UgYm90aCBob2xkIGFuIG9iamVjdCwgaW5zdGVhZCBvZiByZXBsYWNpbmcgaXQuXHJcbiAqXHJcbiAqIEEgY2xhc3MgaW5zdGFuY2UgY291bnRzIGFzIGFuIG9iamVjdCBoZXJlIGFuZCBpcyBtZXJnZWQgcHJvcGVydHkgYnkgcHJvcGVydHkganVzdCBsaWtlIGEgc2ltcGxlXHJcbiAqIG9uZS4gVGhlIHRhcmdldCBrZWVwcyBpdHMgb3duIHByb3RvdHlwZSwgb25seSB0aGUgcHJvcGVydGllcyBvZiB0aGUgc291cmNlIGFyZSBhcHBsaWVkIHRvIGl0IC0gYVxyXG4gKiBtZXJnZSBuZXZlciB0dXJucyB0aGUgdGFyZ2V0IGludG8gYW4gaW5zdGFuY2Ugb2YgdGhlIGNsYXNzIG9mIHRoZSBzb3VyY2UuXHJcbiAqXHJcbiAqIEFuIEFycmF5LCBTZXQsIE1hcCwgRGF0ZSBvciBSZWdFeHAgaXMgYWx3YXlzIHJlcGxhY2VkIGFzIGEgd2hvbGUsIG5ldmVyIG1lcmdlZCBlbnRyeSBieSBlbnRyeS5cclxuICogVGhhdCBhbHJlYWR5IGFwcGxpZXMgd2hlbiBvbmx5IG9uZSBvZiBib3RoIHNpZGVzIGhvbGRzIG9uZS4gVGhlIHJlc3VsdCB0aGVyZWZvcmUgY2FycmllcyB0aGVcclxuICogY29udGFpbmVyIG9mIHRoZSBzb3VyY2Ugd2l0aCBpdHMgb3duIGxlbmd0aCAtIG5vdGhpbmcgb2YgdGhlIHRhcmdldCBzdXJ2aXZlcyBpdCwgbm90IGV2ZW4gYW5cclxuICogb2JqZWN0IHNpdHRpbmcgYXQgdGhlIHNhbWUgaW5kZXggb3IgdW5kZXIgdGhlIHNhbWUga2V5LlxyXG4gKlxyXG4gKiBBIGtleSB3aG9zZSB2YWx1ZSBpcyBhIHN5bWJvbCBpcyBza2lwcGVkLCBvbiB0aGUgdGFyZ2V0IHNpZGUgYXMgd2VsbCBhcyBvbiB0aGUgc291cmNlIHNpZGUuIEFcclxuICogc3ltYm9sIGNhcnJpZXMgbm8gZGF0YSwgc28gc3VjaCBhIHByb3BlcnR5IGlzIGxlZnQgdW50b3VjaGVkLlxyXG4gKlxyXG4gKiBUaGUga2V5IF9fcHJvdG9fXyBpcyBza2lwcGVkLiBPYmplY3QuYXNzaWduIHdvdWxkIG9ubHkgcmVwb2ludCB0aGUgcHJvdG90eXBlIG9mIHRoZSB0YXJnZXQsIGJ1dFxyXG4gKiBtZXJnaW5nIGludG8gaXQgd291bGQgd2FsayBpbnRvIE9iamVjdC5wcm90b3R5cGUgYW5kIGxlYWsgaW50byBldmVyeSBvYmplY3QuXHJcbiAqXHJcbiAqIFRoZSB0YXJnZXQgaXMgbW9kaWZpZWQgaW4gcGxhY2UuIEEgc3ViIG9iamVjdCBvZiBhIHNvdXJjZSB0aGF0IGhhcyBubyBjb3VudGVycGFydCBpbiB0aGUgdGFyZ2V0IGlzXHJcbiAqIHRha2VuIG92ZXIgYnkgcmVmZXJlbmNlLCBqdXN0IGxpa2UgT2JqZWN0LmFzc2lnbiBkb2VzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IHRoZSB0YXJnZXQgb2JqZWN0IHRvIG1lcmdlIGludG8sIGEgbmV3IG9iamVjdCB3aGVuIGZhbHN5XHJcbiAqIEBwYXJhbSB7Li4ub2JqZWN0fSBzb3VyY2VzIHRoZSBzb3VyY2Ugb2JqZWN0cywgYXBwbGllZCBpbiBvcmRlclxyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgdGFyZ2V0IG9iamVjdFxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBtZXJnZSh7YSA6IDF9LCB7YiA6IDJ9KTsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHthIDogMSwgYiA6IDJ9XHJcbiAqIG1lcmdlKHthIDoge3ggOiAxfX0sIHthIDoge3kgOiAyfX0pOyAgICAgICAgICAgICAgLy8ge2EgOiB7eCA6IDEsIHkgOiAyfX1cclxuICogbWVyZ2Uoe2EgOiBbMSwgMiwgM119LCB7YSA6IFs5XX0pOyAgICAgICAgICAgICAgICAvLyB7YSA6IFs5XX0sIHJlcGxhY2VkIGFzIGEgd2hvbGVcclxuICogbWVyZ2Uoe2EgOiBuZXcgRm9vKDEpfSwge2EgOiBuZXcgQmFyKDIpfSk7ICAgICAgICAvLyBhIHN0YXlzIGEgRm9vLCBjYXJyeWluZyB0aGUgcHJvcGVydGllcyBvZiBib3RoXHJcbiAqIG1lcmdlKHt9LCBzb3VyY2UxLCBzb3VyY2UyLCBzb3VyY2UzKTtcclxuICovXHJcbmV4cG9ydCBjb25zdCBtZXJnZSA9ICh0YXJnZXQsIC4uLnNvdXJjZXMpID0+IHtcclxuXHRpZiAoIXRhcmdldCkgdGFyZ2V0ID0ge307XHJcblxyXG5cdHNvdXJjZXNcclxuXHRcdC5maWx0ZXIoKHNvdXJjZSkgPT4gIWlzTnVsbE9yVW5kZWZpbmVkKHNvdXJjZSkpXHJcblx0XHQuZm9yRWFjaCgoc291cmNlKSA9PiB7XHJcblx0XHRcdGNvbnN0IGtleXMgPSBhc3NpZ25hYmxlS2V5cyhzb3VyY2UpO1xyXG5cdFx0XHRrZXlzXHJcblx0XHRcdFx0LmZpbHRlcigoa2V5KSA9PiBrZXkgIT0gXCJfX3Byb3RvX19cIilcclxuXHRcdFx0XHQuZmlsdGVyKChrZXkpID0+IHR5cGVvZiB0YXJnZXRba2V5XSAhPT0gXCJzeW1ib2xcIilcclxuXHRcdFx0XHQuZmlsdGVyKChrZXkpID0+IHR5cGVvZiBzb3VyY2Vba2V5XSAhPT0gXCJzeW1ib2xcIilcclxuXHRcdFx0XHQuZm9yRWFjaCgoa2V5KSA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IHNvdXJjZVtrZXldO1xyXG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudCA9IHRhcmdldFtrZXldO1xyXG5cclxuXHRcdFx0XHRcdGlmKGN1cnJlbnQgPT0gbnVsbCApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmKCB0eXBlb2YgY3VycmVudCAhPT0gdHlwZW9mIHZhbHVlICkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoY3VycmVudCBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCkgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGVsc2UgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBNYXAgfHwgdmFsdWUgaW5zdGFuY2VvZiBNYXApIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgRGF0ZSB8fCB2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0XHRlbHNlIGlmIChjdXJyZW50IGluc3RhbmNlb2YgUmVnRXhwIHx8IHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB0YXJnZXRba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0ZWxzZSBpZiAoaXNPYmplY3QoY3VycmVudCkgJiYgaXNPYmplY3QodmFsdWUpKSBtZXJnZShjdXJyZW50LCB2YWx1ZSk7XHJcblx0XHRcdFx0XHRlbHNlIHRhcmdldFtrZXldID0gdmFsdWU7XHJcblx0XHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHJcblx0cmV0dXJuIHRhcmdldDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWNpZGVzIHdoZXRoZXIgYSBzaW5nbGUgcHJvcGVydHkgaXMgdGFrZW4gb3ZlciBieSB7QGxpbmsgZmlsdGVyfS5cclxuICpcclxuICogQGNhbGxiYWNrIFByb3BlcnR5RmlsdGVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb250ZXh0IHRoZSBvYmplY3QgdGhlIHByb3BlcnR5IGJlbG9uZ3MgdG9cclxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgdG8ga2VlcCB0aGUgcHJvcGVydHlcclxuICovXHJcblxyXG4vKipcclxuICogQnVpbGRzIGEge0BsaW5rIFByb3BlcnR5RmlsdGVyfSBhY2NlcHRpbmcgb3IgcmVqZWN0aW5nIGEgZml4ZWQgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcy5cclxuICpcclxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICogQHBhcmFtIHtBcnJheTxzdHJpbmc+fSBvcHRpb25zLm5hbWVzIHRoZSBwcm9wZXJ0eSBuYW1lcyB0byBkZWNpZGUgb25cclxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmFsbG93ZWQgdHJ1ZSB0dXJucyB0aGUgbGlzdCBpbnRvIGFuIGFsbG93IGxpc3QsIGZhbHNlIGludG8gYSBkZW55IGxpc3RcclxuICogQHJldHVybnMge1Byb3BlcnR5RmlsdGVyfVxyXG4gKlxyXG4gKiBAZXhhbXBsZVxyXG4gKiBjb25zdCBkZW55ID0gYnVpbGRQcm9wZXJ0eUZpbHRlcih7bmFtZXMgOiBbXCJwYXNzd29yZFwiXSwgYWxsb3dlZCA6IGZhbHNlfSk7XHJcbiAqIGZpbHRlcih1c2VyLCBkZW55KTsgICAvLyBldmVyeSBwcm9wZXJ0eSBidXQgcGFzc3dvcmRcclxuICovXHJcbmV4cG9ydCBjb25zdCBidWlsZFByb3BlcnR5RmlsdGVyID0gKHsgbmFtZXMsIGFsbG93ZWQgfSkgPT4ge1xyXG5cdHJldHVybiAobmFtZSwgdmFsdWUsIGNvbnRleHQpID0+IHtcclxuXHRcdHJldHVybiBuYW1lcy5pbmNsdWRlcyhuYW1lKSA9PT0gYWxsb3dlZDtcclxuXHR9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlYnVpbGRzIGFuIEFycmF5LCBTZXQgb3IgTWFwIHdpdGggaXRzIHZhbHVlcyBmaWx0ZXJlZC4gQSBjb250YWluZXIga2VlcHMgYWxsIG9mIGl0cyBlbnRyaWVzIC1cclxuICogb25seSB0aGUgdmFsdWVzIGluc2lkZSBnZXQgZmlsdGVyZWQuIFRoZSBrZXlzIG9mIGEgTWFwIHN0YXkgdW50b3VjaGVkLCByZXBsYWNpbmcgdGhlbSB3b3VsZCBicmVha1xyXG4gKiBldmVyeSBsb29rdXAgYWdhaW5zdCB0aGUgcmVzdWx0LlxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge0FycmF5fFNldHxNYXB9IHZhbHVlXHJcbiAqIEBwYXJhbSB7UHJvcGVydHlGaWx0ZXJ9IHByb3BGaWx0ZXJcclxuICogQHBhcmFtIHtib29sZWFufSBkZWVwXHJcbiAqIEBwYXJhbSB7V2Vha01hcH0gY29waWVzIG1hcHMgYW4gb3JpZ2luYWwgb250byBpdHMgZmlsdGVyZWQgY29weVxyXG4gKiBAcmV0dXJucyB7QXJyYXl8U2V0fE1hcH1cclxuICovXHJcbmNvbnN0IGZpbHRlckNvbnRhaW5lciA9ICh2YWx1ZSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA9PiB7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuXHRcdGNvbnN0IGNvcHkgPSBbXTtcclxuXHRcdGNvcGllcy5zZXQodmFsdWUsIGNvcHkpO1xyXG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB2YWx1ZSkgY29weS5wdXNoKGZpbHRlclZhbHVlKGVudHJ5LCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpKTtcclxuXHJcblx0XHRyZXR1cm4gY29weTtcclxuXHR9XHJcblxyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNldCkge1xyXG5cdFx0Y29uc3QgY29weSA9IG5ldyBTZXQoKTtcclxuXHRcdGNvcGllcy5zZXQodmFsdWUsIGNvcHkpO1xyXG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB2YWx1ZSkgY29weS5hZGQoZmlsdGVyVmFsdWUoZW50cnksIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykpO1xyXG5cclxuXHRcdHJldHVybiBjb3B5O1xyXG5cdH1cclxuXHJcblx0Y29uc3QgY29weSA9IG5ldyBNYXAoKTtcclxuXHRjb3BpZXMuc2V0KHZhbHVlLCBjb3B5KTtcclxuXHRmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB2YWx1ZSkgY29weS5zZXQoa2V5LCBmaWx0ZXJWYWx1ZShlbnRyeSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSk7XHJcblxyXG5cdHJldHVybiBjb3B5O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbHRlcnMgYSBzaW5nbGUgdmFsdWUsIGRpc3BhdGNoaW5nIG9uIHdoYXQgaXQgaXMuXHJcbiAqXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlclxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRlZXBcclxuICogQHBhcmFtIHtXZWFrTWFwfSBjb3BpZXMgbWFwcyBhbiBvcmlnaW5hbCBvbnRvIGl0cyBmaWx0ZXJlZCBjb3B5XHJcbiAqIEByZXR1cm5zIHsqfSB0aGUgZmlsdGVyZWQgdmFsdWUsIG9yIHRoZSB2YWx1ZSBpdHNlbGYgd2hlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGZpbHRlclxyXG4gKi9cclxuY29uc3QgZmlsdGVyVmFsdWUgPSAodmFsdWUsIHByb3BGaWx0ZXIsIGRlZXAsIGNvcGllcykgPT4ge1xyXG5cdGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiB2YWx1ZTtcclxuXHRpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlIHx8IHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gdmFsdWU7IC8vIGNhcnJ5IG5vIHByb3BlcnRpZXMgdG8gZmlsdGVyXHJcblxyXG5cdC8vIGEgdmFsdWUgc2VlbiBiZWZvcmUgY2xvc2VzIGEgY3ljbGUgLSBpdHMgY29weSBzdGFuZHMgaW4sIHNvIG5vdGhpbmcgdW5maWx0ZXJlZCBsZWFrcyBiYWNrIGluXHJcblx0aWYgKGNvcGllcy5oYXModmFsdWUpKSByZXR1cm4gY29waWVzLmdldCh2YWx1ZSk7XHJcblxyXG5cdGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5IHx8IHZhbHVlIGluc3RhbmNlb2YgU2V0IHx8IHZhbHVlIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gZmlsdGVyQ29udGFpbmVyKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpO1xyXG5cclxuXHRyZXR1cm4gZmlsdGVyT2JqZWN0KHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyB0aGUgZmlsdGVyZWQgY29weSBvZiBhbiBvYmplY3QuIFRoZSBjb3B5IGlzIHJlZ2lzdGVyZWQgYmVmb3JlIGl0IGlzIGZpbGxlZCwgc28gYSBjeWNsZVxyXG4gKiBydW5uaW5nIGJhY2sgaW50byBpdCByZXNvbHZlcyB0byB0aGUgY29weSBpbnN0ZWFkIG9mIHRoZSBvcmlnaW5hbC5cclxuICpcclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtvYmplY3R9IGRhdGFcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlclxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRlZXBcclxuICogQHBhcmFtIHtXZWFrTWFwfSBjb3BpZXMgbWFwcyBhbiBvcmlnaW5hbCBvbnRvIGl0cyBmaWx0ZXJlZCBjb3B5XHJcbiAqIEByZXR1cm5zIHtvYmplY3R9XHJcbiAqL1xyXG5jb25zdCBmaWx0ZXJPYmplY3QgPSAoZGF0YSwgcHJvcEZpbHRlciwgZGVlcCwgY29waWVzKSA9PiB7XHJcblx0Y29uc3QgcmVzdWx0ID0ge307XHJcblx0Y29waWVzLnNldChkYXRhLCByZXN1bHQpO1xyXG5cclxuXHRmb3IgKGNvbnN0IG5hbWUgaW4gZGF0YSkge1xyXG5cdFx0Y29uc3QgdmFsdWUgPSBkYXRhW25hbWVdO1xyXG5cdFx0aWYgKHByb3BGaWx0ZXIobmFtZSwgdmFsdWUsIGRhdGEpKXtcclxuXHRcdFx0cmVzdWx0W25hbWVdID0gZGVlcCA/IGZpbHRlclZhbHVlKHZhbHVlLCBwcm9wRmlsdGVyLCBkZWVwLCBjb3BpZXMpIDogdmFsdWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJ1aWxkcyBhIG5ldyBvYmplY3QgaG9sZGluZyB0aGUgcHJvcGVydGllcyBhIGZpbHRlciBhY2NlcHRzLlxyXG4gKlxyXG4gKiBUaGUgZmlsdGVyIGlzIGNhbGxlZCBmb3IgZXZlcnkgZW51bWVyYWJsZSBwcm9wZXJ0eSwgaW5oZXJpdGVkIG9uZXMgaW5jbHVkZWQgLSBmaWx0ZXJpbmcgYSB3aW5kb3dcclxuICogcmVsaWVzIG9uIHRoYXQsIHNpbmNlIG1vc3Qgb2YgaXRzIG1lbWJlcnMgc2l0IG9uIHRoZSBwcm90b3R5cGUuXHJcbiAqXHJcbiAqIFdpdGggZGVlcCB0aGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gc3ViIG9iamVjdHMgYXMgd2VsbC4gQXJyYXksIFNldCBhbmQgTWFwIGFyZSByZWJ1aWx0IHdpdGggdGhlaXJcclxuICogdmFsdWVzIGZpbHRlcmVkLCBrZWVwaW5nIGFsbCBvZiB0aGVpciBlbnRyaWVzIGFuZCwgZm9yIGEgTWFwLCBpdHMga2V5cy4gRGF0ZSBhbmQgUmVnRXhwIGFyZSB0YWtlblxyXG4gKiBvdmVyIGFzIHRoZXkgYXJlLiBBIGN5Y2xpYyByZWZlcmVuY2UgcmVzb2x2ZXMgdG8gdGhlIGZpbHRlcmVkIGNvcHksIHNvIHRoZSByZXN1bHQgbmV2ZXIgY2FycmllcyBhXHJcbiAqIHJlZmVyZW5jZSBpbnRvIHRoZSB1bnRvdWNoZWQgb3JpZ2luYWwuXHJcbiAqXHJcbiAqIFdpdGhvdXQgZGVlcCB0aGUgYWNjZXB0ZWQgdmFsdWVzIGFyZSB0YWtlbiBvdmVyIGFzIHRoZXkgYXJlLCBzdWIgb2JqZWN0cyBieSByZWZlcmVuY2UuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIHRoZSBvYmplY3QgdG8gYmUgZmlsdGVyZWRcclxuICogQHBhcmFtIHtQcm9wZXJ0eUZpbHRlcn0gcHJvcEZpbHRlciBkZWNpZGVzIHBlciBwcm9wZXJ0eSwgc2VlIHtAbGluayBidWlsZFByb3BlcnR5RmlsdGVyfVxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcD1mYWxzZV0gZmlsdGVyIHN1YiBvYmplY3RzIHRvb1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBhIG5ldyBvYmplY3RcclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgZGVueSA9IGJ1aWxkUHJvcGVydHlGaWx0ZXIoe25hbWVzIDogW1wic2VjcmV0XCJdLCBhbGxvd2VkIDogZmFsc2V9KTtcclxuICpcclxuICogZmlsdGVyKHtzZWNyZXQgOiBcInhcIiwgYSA6IDF9LCBkZW55KTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHthIDogMX1cclxuICogZmlsdGVyKHtzdWIgOiB7c2VjcmV0IDogXCJ4XCIsIGEgOiAxfX0sIGRlbnksIHtkZWVwIDogdHJ1ZX0pOyAgICAgIC8vIHtzdWIgOiB7YSA6IDF9fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGZpbHRlciA9IChkYXRhLCBwcm9wRmlsdGVyLCB7IGRlZXAgPSBmYWxzZSB9ID0ge30pID0+IGZpbHRlck9iamVjdChkYXRhLCBwcm9wRmlsdGVyLCBkZWVwLCBuZXcgV2Vha01hcCgpKTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgY29uc3RhbnQsIG5vbiBlbnVtZXJhYmxlIHByb3BlcnR5LlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHsqfSB2YWx1ZSB0aGUgdmFsdWUsIG5laXRoZXIgd3JpdGFibGUgbm9yIGNvbmZpZ3VyYWJsZVxyXG4gKiBAcmV0dXJucyB7dm9pZH1cclxuICovXHJcbmV4cG9ydCBjb25zdCBkZWZWYWx1ZSA9IChvLCBuYW1lLCB2YWx1ZSkgPT4ge1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBuYW1lLCB7XHJcblx0XHR2YWx1ZSxcclxuXHRcdHdyaXRhYmxlOiBmYWxzZSxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWZpbmVzIGEgcmVhZCBvbmx5LCBub24gZW51bWVyYWJsZSBwcm9wZXJ0eSBiYWNrZWQgYnkgYSBnZXR0ZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBvIHRoZSBvYmplY3QgdG8gZGVmaW5lIHRoZSBwcm9wZXJ0eSBvblxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXQgcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5XHJcbiAqIEByZXR1cm5zIHt2b2lkfVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlZkdldCA9IChvLCBuYW1lLCBnZXQpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0Z2V0LFxyXG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSBub24gZW51bWVyYWJsZSBwcm9wZXJ0eSBiYWNrZWQgYnkgYSBnZXR0ZXIgYW5kIGEgc2V0dGVyLlxyXG4gKlxyXG4gKiBAcGFyYW0ge29iamVjdH0gbyB0aGUgb2JqZWN0IHRvIGRlZmluZSB0aGUgcHJvcGVydHkgb25cclxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0IHJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzZXQgdGFrZXMgdGhlIG5ldyB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICogQHJldHVybnMge3ZvaWR9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGVmR2V0U2V0ID0gKG8sIG5hbWUsIGdldCwgc2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdHNldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuXHRpc051bGxPclVuZGVmaW5lZCxcclxuXHRpc09iamVjdCxcclxuXHRpc1ByaW1pdGl2ZSxcclxuXHRlcXVhbFBvam8sXHJcblx0aXNQb2pvLFxyXG5cdGFwcGVuZCxcclxuXHRtZXJnZSxcclxuXHRmaWx0ZXIsXHJcblx0YnVpbGRQcm9wZXJ0eUZpbHRlcixcclxuXHRkZWZWYWx1ZSxcclxuXHRkZWZHZXQsXHJcblx0ZGVmR2V0U2V0LFxyXG59O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGlmKEFycmF5LmlzQXJyYXkoZGVmaW5pdGlvbikpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0d2hpbGUoaSA8IGRlZmluaXRpb24ubGVuZ3RoKSB7XG5cdFx0XHR2YXIga2V5ID0gZGVmaW5pdGlvbltpKytdO1xuXHRcdFx0dmFyIGJpbmRpbmcgPSBkZWZpbml0aW9uW2krK107XG5cdFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdFx0aWYoYmluZGluZyA9PT0gMCkge1xuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IGRlZmluaXRpb25baSsrXSB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogYmluZGluZyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmKGJpbmRpbmcgPT09IDApIHsgaSsrOyB9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0Lmhhc093bihvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IEV4cHJlc3Npb25SZXNvbHZlciwgRXhlY3V0ZXJSZWdpc3RyeSB9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcbmltcG9ydCB7IFZFUlNJT04gfSBmcm9tIFwiLi9zcmMvdmVyc2lvbi5qc1wiO1xuXG5HTE9CQUwuZGVmYXVsdGpzID0gR0xPQkFMLmRlZmF1bHRqcyB8fCB7fTtcbkdMT0JBTC5kZWZhdWx0anMuZWwgPSBHTE9CQUwuZGVmYXVsdGpzLmVsIHx8IHtcblx0VkVSU0lPTixcblx0RXhwcmVzc2lvblJlc29sdmVyLFxuXHRFeGVjdXRlclJlZ2lzdHJ5XG59O1xuXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==