/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExecuterRegistry: () => (/* reexport module object */ _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   ExpressionResolver: () => (/* reexport safe */ _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _src_ExpressionResolver_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/ExpressionResolver.js */ "./src/ExpressionResolver.js");
/* harmony import */ var _src_executer_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/executer/index.js */ "./src/executer/index.js");
/* harmony import */ var _src_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/ExecuterRegistry.js */ "./src/ExecuterRegistry.js");







/***/ }),

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/Global.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const GLOBAL = (() => {
	if(typeof __webpack_require__.g !== "undefined") return __webpack_require__.g;
	if(typeof window !== "undefined") return window;	
	if(typeof self !== "undefined") return self;
	return {};
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GLOBAL);

/***/ }),

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectProperty.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/ObjectProperty.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ObjectProperty)
/* harmony export */ });
class ObjectProperty {
	constructor(key, context){
		this.key = key;
		this.context = context;
	}
	
	get keyDefined(){
		return this.key in this.context; 
	}
	
	get hasValue(){
		return !!this.context[this.key];
	}
	
	get value(){
		return this.context[this.key];
	}
	
	set value(data){
		this.context[this.key] = data;
	}
	
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
	
	remove(){
		delete this.context[this.key];
	}
	
	static load(data, key, create=true) {
		let context = data;
		const keys = key.split("\.");
		let name = keys.shift().trim();
		while(keys.length > 0){
			if(!context[name]){
				if(!create)
					return null;
				
				context[name] = {}
			}
			
			context = context[name];
			name = keys.shift().trim();
		}
		
		return new ObjectProperty(name, context);
	}
};

/***/ }),

/***/ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   append: () => (/* binding */ append),
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


const equalArraySet = (a, b) => {
	if (a.length !== b.length) return false;
	const length = a.length;
	for (let i = 0; i < length; i++)
		if (!equalPojo(a[i], b[i])) {
			//console.log("false");
			return false;
		}

	return true;
};

const equalMap = (a, b) => {
	if (a.length !== b.length) return false;
	for (const key of a.keys())
		if (!equalPojo(a.get(key), b.get(key))) {
			//console.log("false");
			return false;
		}

	return true;
};

const equalClasses = (a, b) => {
	const clazzA = Object.getPrototypeOf(a);
	const clazzB = Object.getPrototypeOf(b);
	if (clazzA != clazzB) return false;

	if (!clazzA) return true;

	const propertiesA = Object.getOwnPropertyNames(clazzA);
	const propertiesB = Object.getOwnPropertyNames(clazzB);

	if (propertiesA.length !== propertiesB.length) return false;
	for (const key of propertiesA) {
		const valueA = a[key];
		const valueB = b[key];

		if (!equalPojo(valueA, valueB)) return false;
	}
	return true;
};

const equalObject = (a, b) => {
	const propertiesA = Object.keys(a);
	const propertiesB = Object.keys(b);

	if (propertiesA.length !== propertiesB.length) return false;
	for (const key of propertiesA) {
		const valueA = a[key];
		const valueB = b[key];

		if (!equalPojo(valueA, valueB)) return false;
	}
	return true;
};

const isNullOrUndefined = (object) => {
	return object == null || typeof object === "undefined";
};

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

const isObject = (object) => {
	if(isNullOrUndefined(object))
		return false;

	return typeof object === "object" && (!object.constructor || object.constructor.name === "Object");
};

/**
 * equalPojo -> compares only pojos, array, set, map and primitives
 */
const equalPojo = (a, b) => {
	const nullA = isNullOrUndefined(a);
	const nullB = isNullOrUndefined(b);
	if (nullA || nullB) return a === b;

	if (isPrimitive(a) || isPrimitive(b)) return a === b;

	const typeA = typeof a;
	const typeB = typeof b;
	if (typeA != typeB) return false;
	if (typeA === "function") return a === b;
	//if (a.constructor !== b.constructor) return false;
	//if (a instanceof Array || a instanceof Set) return equalArraySet(a, b);
	//if (a instanceof Map) return equalMap(a, b);

	return equalObject(a, b) && equalClasses(a, b);
};

/**
 * checked if an object a simple object. No Array, Map or something else.
 *
 * @param aObject:object the object to be testing
 *
 * @return boolean
 */
const isPojo = (object) => {
	if (!isObject(object)) return false;

	for (const key in object) {
		const value = object[key];
		if (typeof value === "function") return false;
	}

	return true;
};

/**
 * append a propery value to an object. If propery exists its would be converted to an array
 *
 *  @param aKey:string name of property
 *  @param aData:any property value
 *  @param aObject:object the object to append the property
 *
 *  @return returns the changed object
 */
const append = function (aKey, aData, aObject) {
	if (typeof aData !== "undefined") {
		const property = _ObjectProperty_js__WEBPACK_IMPORTED_MODULE_0__["default"].load(aObject, aKey, true);
		property.append = aData;
	}
	return aObject;
};

/**
 * merging object into a target object. Its only merge simple object and sub objects. Every other
 * value would be replaced by value from the source object.
 *
 * sample: merge(target, source-1, source-2, ...source-n)
 *
 * @param target:object the target object to merging into
 * @param sources:object
 *
 * @return object returns the target object
 */
const merge = function (target, ...sources) {
	if (!target) target = {};

	for (let source of sources) {
		if (isPojo(source)) {
			Object.getOwnPropertyNames(source).forEach((key) => {
				if (isPojo(target[key])) merge(target[key], source[key]);
				else target[key] = source[key];
			});
		}
	}

	return target;
};

const buildPropertyFilter = function ({ names, allowed }) {
	return (name, value, context) => {
		return names.includes(name) === allowed;
	};
};

const filter = function () {
	const [data, propFilter, { deep = false, recursive = true, parents = [] } = {}] = arguments;
	const result = {};

	for (let name in data) {
		const value = data[name];
		const accept = propFilter(name, value, data);
		if (accept && (!deep || value === null || value === undefined)) result[name] = value;
		else if (accept && deep) {
			const type = typeof value;
			if (type !== "object" || value instanceof Array || value instanceof Map || value instanceof Set || value instanceof RegExp || parents.includes[value] || value == data) result[name] = value;
			else result[name] = filter(value, propFilter, { deep, recursive, parents: parents.concat(data) });
		}
	}

	return result;
};

const defValue = (o, name, value) => {
	Object.defineProperty(o, name, {
		value,
		writable: false,
		configurable: false,
		enumerable: false,
	});
};
const defGet = (o, name, get) => {
	Object.defineProperty(o, name, {
		get,
		configurable: false,
		enumerable: false,
	});
};

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


/***/ }),

/***/ "./src/CodeCache.js":
/*!**************************!*\
  !*** ./src/CodeCache.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CodeCache)
/* harmony export */ });
/**
 * @typedef {Object} CacheEntry
 * @property {number} lastHit
 * @property {string} key
 * @property {Function} code
 */

/**
 * @typedef {Object} CodeCacheOptions
 * @property {number} [size=1000] - Maximum number of entries in the cache. If set to 0 or less, caching is disabled.
 */

/**
 * CodeCache class to manage caching of generated code snippets.
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
	/** @type {Map<string,CacheEntry} */
	#entryMap = new Map();

	
	 /**
	  * @param {CodeCacheOptions} options
	  */
	constructor({ size = 1000 } = {}) {
		if (size <= 0) this.#disabled = true;
		else {
			this.#size = size > 0 ? size : 1000;
			this.#maxSize = Math.floor(size * 1.1);
		}
	}

	 /**
	  * @param {CodeCacheOptions} options
	  */
	setup({ size = 1000 } = {}) {
		if (size <= 0){
			this.#disabled = true;
			this.clear();
		}
		else {
			this.#size = size > 0 ? size : 1000;
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
		const data = this.#entryMap.get(key);
		if (data) {
			data.lastHit = Date.now();
			return data.value;
		}
		return null;
	}

	set(key, code) {
		if(this.#disabled) return;
		let entry = this.#entryMap.get(key);
		if (entry) {
			entry.count = Date.now();
			entry.value = code;
		} else {
			entry = {
				count: Date.now(),
				key,
				value: code,
			};
			this.#entries.push(entry);
			this.#entryMap.set(key, entry);
		}

		if (this.#entryMap.size >= this.#maxSize) this.#trim();
	}

	clear() {
		if(this.#disabled) return;
		this.#entries = [];
		this.#entryMap = new Map();
	}

	#trim() {
		console.debug(`Trimming code cache from ${this.#entries.length} entries to ${this.#size} entries.`);
		this.#entries.sort((a, b) => b.count - a.count);
		if (this.#entries.length >= this.#size) {
			const entriesToRemove = this.#entries.splice(this.#size);
			for (const entry of entriesToRemove) {
				this.#entryMap.delete(entry.key);
			}
		}
	}
};


/***/ }),

/***/ "./src/DefaultValue.js":
/*!*****************************!*\
  !*** ./src/DefaultValue.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

/***/ }),

/***/ "./src/ExecuterRegistry.js":
/*!*********************************!*\
  !*** ./src/ExecuterRegistry.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getExecuter: () => (/* binding */ getExecuter),
/* harmony export */   registrate: () => (/* binding */ registrate)
/* harmony export */ });
const EXECUTERS = new Map();

/**
 *
 * @param {string} aName
 * @param {Function} anExecuter
 */
const registrate = (aName, anExecuter) => {
	EXECUTERS.set(aName, anExecuter);
};

/**
 *
 * @param {string} aName
 * @returns {Function}
 */
const getExecuter = (aName) => {
	const executer = EXECUTERS.get(aName);
	if (!executer) throw new Error(`Executer "${aName}" is not registrated!`);
	return executer;
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getExecuter);


/***/ }),

/***/ "./src/ExpressionResolver.js":
/*!***********************************!*\
  !*** ./src/ExpressionResolver.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ExpressionResolver)
/* harmony export */ });
/* harmony import */ var _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");
/* harmony import */ var _default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/ObjectUtils.js */ "./node_modules/@default-js/defaultjs-common-utils/src/ObjectUtils.js");
/* harmony import */ var _DefaultValue_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DefaultValue.js */ "./src/DefaultValue.js");
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ResolverContextHandle.js */ "./src/ResolverContextHandle.js");






const DEFAULT_EXECUTER_NAME = "with-scoped-executer";
let DEFAULT_EXECUTER = (() => {
	let executer = null;
	return (aStatement, aContext) => {
		if (executer == null) executer = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_3__["default"])(DEFAULT_EXECUTER_NAME);
		return executer(aStatement, aContext);
	};
})();

const EXECUTION_WARN_TIMEOUT = 1000;
const EXPRESSION = /(\\?)(\$\{(([a-zA-Z0-9\-_\s]+)::)?([^\{\}]+)\})/;
const MATCH_ESCAPED = 1;
const MATCH_FULL_EXPRESSION = 2;
const MATCH_EXPRESSION_SCOPE = 4;
const MATCH_EXPRESSION_STATEMENT = 5;

const DEFAULT_NOT_DEFINED = new _DefaultValue_js__WEBPACK_IMPORTED_MODULE_2__["default"]();
const toDefaultValue = (value) => {
	if (value instanceof _DefaultValue_js__WEBPACK_IMPORTED_MODULE_2__["default"]) return value;

	return new _DefaultValue_js__WEBPACK_IMPORTED_MODULE_2__["default"](value);
};

const execute = async function (anExecuter, aStatement, aContext) {
	if (typeof aStatement !== "string") return aStatement;
	aStatement = normalize(aStatement);
	if (aStatement == null) return aStatement;

	try {
		return await new Promise((resolve) => {
			const timeout = setTimeout(
				() =>
					console.warn(`Long running statement:
				"${aStatement}"
			`),
				EXECUTION_WARN_TIMEOUT,
			);
			resolve(
				(async () => {
					let result = undefined;
					try {
						result = await anExecuter(aStatement, aContext);
					} catch (e) {
						console.warn(`Execution error on statement!
							statement: 
							${aStatement}
							error:
							${e}
							`)
					} finally {
						clearTimeout(timeout);
					}
					return result;
				})(),
			);
		});
	} catch (e) {
		console.error(`Error by statement "${aStatement}":`, e);
	}
};

const resolve = async function (aExecuter = DEFAULT_EXECUTER, aResolver, aExpression, aFilter, aDefault) {
	if (aFilter && aResolver.name != aFilter) return aResolver.parent ? resolve(aResolver.parent, aExpression, aFilter, aDefault, aExecuter) : null;

	const result = await execute(aExecuter, aExpression, aResolver.context);
	if (result !== null && typeof result !== "undefined") return result;
	else if (aDefault instanceof _DefaultValue_js__WEBPACK_IMPORTED_MODULE_2__["default"] && aDefault.hasValue) return aDefault.value;
};

const resolveMatch = async (aExecuter, resolver, match, defaultValue) => {
	if (match[MATCH_ESCAPED]) return match[MATCH_FULL_EXPRESSION];

	return resolve(aExecuter, resolver, match[MATCH_EXPRESSION_STATEMENT], normalize(match[MATCH_EXPRESSION_SCOPE]), defaultValue);
};

const normalize = (value) => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
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
		if (typeof anExecuter === "function") DEFAULT_EXECUTER = anExecuter;
		else DEFAULT_EXECUTER = (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_3__["default"])(anExecuter);
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
	 * @param {{ context?: any; parent?: any; name?: any; }} param0
	 * @param {object} [param0.context=GLOBAL]
	 * @param {ExpressionResolver} [param0.parent=null]
	 * @param {?string} [param0.name=null]
	 */
	constructor({ context = _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"], parent = null, name = null, executer } = {}) {
		this.#parent = parent instanceof ExpressionResolver ? parent : null;
		this.#name = name;
		this.#contextHandle = new _ResolverContextHandle_js__WEBPACK_IMPORTED_MODULE_4__["default"](context, this.#parent ? this.#parent.contextHandle : null);
		this.#context = this.#contextHandle.proxy;
		this.#executer = typeof executer === "string" ? (0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_3__["default"])(executer) : undefined;
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
		return this.parent ? this.parent.chain + "/" + this.name : "/" + this.name;
	}

	/**
	 * get effective chain path
	 *
	 * @readonly
	 * @returns {string}
	 */
	get effectiveChain() {
		return this.parent ? this.parent.effectiveChain + "/" + this.name : "/" + this.name;
	}

	/**
	 * get context chain
	 *
	 * @readonly
	 * @returns {Context[]}
	 */
	get contextChain() {
		const result = [];
		let resolver = this;
		while (resolver) {
			if (resolver.context) result.push(resolver.context);

			resolver = resolver.parent;
		}

		return result;
	}

	/**
	 * get data from context
	 *
	 * @param {string} key
	 * @param {?string} filter
	 * @returns {*}
	 */
	getData(key, filter) {
		if (!key) return this.context;
		else if (filter && filter != this.name) {
			if (this.parent) this.parent.getData(key, filter);
		} else {
			return this.context[key];
		}
	}

	/**
	 * update data at context
	 *
	 * @param {string} key
	 * @param {*} value
	 * @param {?string} filter
	 */
	updateData(key, value, filter) {
		if (!key) return;
		else if (filter && filter != this.name) {
			if (this.parent) this.parent.updateData(key, value, filter);
		} else {
			this.context[key] = value;
		}
	}

	/**
	 * merge context object
	 *
	 * @param {object} context
	 * @param {?string} filter
	 */	
	mergeContext(context, filter) {
		if (filter && filter != this.name) {
			if (this.parent) this.parent.mergeContext(context, filter);
		} else 
			this.#contextHandle.mergeData(context);
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
			if (aExpression.startsWith("\\${")) return aExpression.substring(1);
			else if (aExpression.startsWith("${") && aExpression.endsWith("}")) return await resolve(this.#executer, this, normalize(aExpression.substring(2, aExpression.length - 1)), null, defaultValue);			
			else return await resolve(this.#executer, this, normalize(aExpression), null, defaultValue);
		} catch (e) {
			console.error('error at executing statment"', aExpression, '":', e);
			return defaultValue.hasValue ? defaultValue.value : aExpression;
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
		let text = aText;
		let temp = aText; // required to prevent infinity loop
		let match = EXPRESSION.exec(text);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		while (match != null) {
			const result = await resolveMatch(this.#executer, this, match, defaultValue);
			temp = temp.split(match[0]).join(); // remove current match for next loop
			text = text.split(match[0]).join(typeof result === "undefined" ? "undefined" : result == null ? "null" : result);
			match = EXPRESSION.exec(temp);
		}
		return text;
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
	 * build a secure context object
	 *
	 * @static
	 
	 * @param {object} arg
	 * @param {object} arg.context
	 * @param {function} arg.propFilter
	 * @param {{ deep: boolean; }} [arg.option={ deep: true }]
	 * @param {string} arg.name
	 * @param {ExpressionResolver} arg.parent
	 * @returns {object}
	 */
	static buildSecure({ context, propFilter, option = { deep: true }, name, parent }) {
		context = _default_js_defaultjs_common_utils_src_ObjectUtils_js__WEBPACK_IMPORTED_MODULE_1__["default"].filter({ data: context, propFilter, option });
		return new ExpressionResolver({ context, name, parent });
	}
}



/***/ }),

/***/ "./src/ResolverContextHandle.js":
/*!**************************************!*\
  !*** ./src/ResolverContextHandle.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ResolverContextHandle)
/* harmony export */ });
/* harmony import */ var _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/Global.js */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");
/* harmony import */ var _ExpressionResolver__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ExpressionResolver */ "./src/ExpressionResolver.js");




const createGlobalCacheWrapper = (handle) => {

	return {
		has: (property) => {
			return true;
		},
		get: (property) => {
			return handle
		},
		set: (property, value) => {			
		},
		delete: (property) => {
			delete _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"][property];
		},
		keys: () => {
			return Object.getOwnPropertyNames(_default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"]);
		}
	}	
}


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

	/**
	 * Creates an instance of Context.
	 *
	 * @constructor
	 * @param {object} data
	 * @param {ExpressionResolver} resolver
	 */
	constructor(data, parent) {
		this.#data = data || {};
		this.#parent = parent ? parent : null;
		this.#cache = this.#initPropertyCache();

		this.#proxy = new Proxy(this.#data, {
			has: (data, property) => {
				//console.log("has property:", property);
				return this.#hasProperty(property);
			},
			get: (data, property) => {
				//console.log("get property:", property);
				const proxy = this.#getPropertyDef(property);
				return proxy ? proxy.#getProperty(property) : undefined;
			},
			set: (data, property, value) => {
				//console.log("set property:", property, "=", value);
				const proxy = this.#getPropertyDef(property);
				if (proxy) return proxy.#setProperty(property, value);
				else return this.#setProperty(property, value);
			},
			deleteProperty: (data, property) => {
				return this.#deleteProperty(property);
			},
			ownKeys: (data) => {
				//console.log("ownKeys");
				const result = new Set();
				let proxy = this;
				while (proxy) {
					for (let key of proxy.#cache.keys()) {
						result.add(key);
					}
					proxy = proxy.#parent;
				}
				return Array.from(result);
			},

			//@TODO need to support the other proxy actions
		});
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

	updateData(data) {
		this.#data = data || {};
		this.#cache = this.#initPropertyCache();
	}

	mergeData(data) {
		if(typeof data !== 'object' || data == null) return;
		Object.assign(this.#data, data);
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
		if(data == _default_js_defaultjs_common_utils_src_Global_js__WEBPACK_IMPORTED_MODULE_0__["default"]) 
			return createGlobalCacheWrapper(this);	

		const cache = new Map();
		for (let property of Object.getOwnPropertyNames(data)) cache.set(property, this);

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

	#hasProperty(property) {
		return this.#getPropertyDef(property) != null;
	}
	#getProperty(property) {
		//@TODO write tests!!!
		return this.#data[property];
	}
	#setProperty(property, value) {
		//@TODO would support this action on an proxied resolver context??? write tests!!!
		console.log("set property data:", property, "=", value);
		this.#data[property] = value;
		this.#cache.set(property, this);
		return true;
	}
	#deleteProperty(property) {
		const propertyDef = this.#cache.get(property);
		if (propertyDef) {
			delete propertyDef.data[property];
			this.#cache.delete(property);
		}
	}
}


/***/ }),

/***/ "./src/executer/ContextDeconstructorExecuter.js":
/*!******************************************************!*\
  !*** ./src/executer/ContextDeconstructorExecuter.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXECUTERNAME: () => (/* binding */ EXECUTERNAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");



const EXECUTERNAME = "context-deconstruction-executer";

const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_1__["default"]({ size: 5000 });

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

	//console.log("code", code);

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

/**
 * @param {string} aStatement
 * @param {object} aContext
 * @returns {Promise}
 */
function executer(aStatement, aContext) {
	const contextProperties = Object.getOwnPropertyNames(aContext || {}).join(", ")	;
	const expression = getOrCreateFunction(aStatement, contextProperties);
	return expression(aContext);
};
(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.registrate)(EXECUTERNAME, executer);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (executer);


/***/ }),

/***/ "./src/executer/ContextObjectExecuter.js":
/*!***********************************************!*\
  !*** ./src/executer/ContextObjectExecuter.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXECUTERNAME: () => (/* binding */ EXECUTERNAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");



const EXECUTERNAME = "context-object-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_1__["default"]({ aSize: 5000 });

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

/**
 * @param {string} aStatement
 * @param {object} aContext
 * @returns {Promise}
 */
function executer(aStatement, aContext) {
	const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
};
(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.registrate)(EXECUTERNAME, executer);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (executer);


/***/ }),

/***/ "./src/executer/WithScopedExecuter.js":
/*!********************************************!*\
  !*** ./src/executer/WithScopedExecuter.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EXECUTERNAME: () => (/* binding */ EXECUTERNAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   setupExecuter: () => (/* binding */ setupExecuter)
/* harmony export */ });
/* harmony import */ var _ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ExecuterRegistry.js */ "./src/ExecuterRegistry.js");
/* harmony import */ var _CodeCache_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../CodeCache.js */ "./src/CodeCache.js");



const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new _CodeCache_js__WEBPACK_IMPORTED_MODULE_1__["default"]({ aSize: 5000 });

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

/**
 * @param {string} aStatement
 * @param {object} aContext
 * @returns {Promise}
 */
function executer(aStatement, aContext) {
	if(initialCall){
		initialCall = false;
		console.warn(new Error(`With Scoped expression execution is marked as deprecated.`));
	}

	const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
};
(0,_ExecuterRegistry_js__WEBPACK_IMPORTED_MODULE_0__.registrate)(EXECUTERNAME, executer);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (executer);


/***/ }),

/***/ "./src/executer/index.js":
/*!*******************************!*\
  !*** ./src/executer/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _WithScopedExecuter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WithScopedExecuter.js */ "./src/executer/WithScopedExecuter.js");
/* harmony import */ var _ContextObjectExecuter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ContextObjectExecuter.js */ "./src/executer/ContextObjectExecuter.js");
/* harmony import */ var _ContextDeconstructorExecuter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ContextDeconstructorExecuter.js */ "./src/executer/ContextDeconstructorExecuter.js");
//import "./EsprimaExecuter.js";




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
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
/* harmony import */ var _default_js_defaultjs_common_utils_src_Global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @default-js/defaultjs-common-utils/src/Global */ "./node_modules/@default-js/defaultjs-common-utils/src/Global.js");



_default_js_defaultjs_common_utils_src_Global__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs = _default_js_defaultjs_common_utils_src_Global__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs || {};
_default_js_defaultjs_common_utils_src_Global__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs.el = _default_js_defaultjs_common_utils_src_Global__WEBPACK_IMPORTED_MODULE_1__["default"].defaultjs.el || {
	VERSION: "2.0.0",
	ExpressionResolver: _index_js__WEBPACK_IMPORTED_MODULE_0__.ExpressionResolver,
	ExecuterRegistry: _index_js__WEBPACK_IMPORTED_MODULE_0__.ExecuterRegistry
};



})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBNkQ7QUFDNUI7QUFDNEI7O0FBRWI7Ozs7Ozs7Ozs7Ozs7OztBQ0poRDtBQUNBLFdBQVcscUJBQU0seUJBQXlCLHFCQUFNO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLGlFQUFlLE1BQU0sRTs7Ozs7Ozs7Ozs7Ozs7QUNQTjtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4RGlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFlBQVk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q25FeEI7QUFDaUM7QUFDRzs7Ozs7OztVQ0ZwQztVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUMsSTs7Ozs7V0NQRCx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOMkU7QUFDUjtBQUNuRTtBQUNBLHFGQUFNLGFBQWEscUZBQU07QUFDekIscUZBQU0sZ0JBQWdCLHFGQUFNO0FBQzVCLGFBQWEsUUFBUTtBQUNyQixtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDZ0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL2luZGV4LmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vbm9kZV9tb2R1bGVzL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1jb21tb24tdXRpbHMvc3JjL0dsb2JhbC5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RQcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL25vZGVfbW9kdWxlcy9AZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9PYmplY3RVdGlscy5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9Db2RlQ2FjaGUuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRGVmYXVsdFZhbHVlLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL0V4ZWN1dGVyUmVnaXN0cnkuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvRXhwcmVzc2lvblJlc29sdmVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL1Jlc29sdmVyQ29udGV4dEhhbmRsZS5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9Db250ZXh0RGVjb25zdHJ1Y3RvckV4ZWN1dGVyLmpzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vc3JjL2V4ZWN1dGVyL0NvbnRleHRPYmplY3RFeGVjdXRlci5qcyIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS8uL3NyYy9leGVjdXRlci9XaXRoU2NvcGVkRXhlY3V0ZXIuanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2UvLi9zcmMvZXhlY3V0ZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vQGRlZmF1bHQtanMvZGVmYXVsdGpzLWV4cHJlc3Npb24tbGFuZ3VhZ2Uvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AZGVmYXVsdC1qcy9kZWZhdWx0anMtZXhwcmVzc2lvbi1sYW5ndWFnZS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0BkZWZhdWx0LWpzL2RlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLy4vYnJvd3Nlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXhwcmVzc2lvblJlc29sdmVyIGZyb20gXCIuL3NyYy9FeHByZXNzaW9uUmVzb2x2ZXIuanNcIjtcbmltcG9ydCBcIi4vc3JjL2V4ZWN1dGVyL2luZGV4LmpzXCI7XG5pbXBvcnQgKiBhcyBFeGVjdXRlclJlZ2lzdHJ5IGZyb20gXCIuL3NyYy9FeGVjdXRlclJlZ2lzdHJ5LmpzXCJcblxuZXhwb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBFeGVjdXRlclJlZ2lzdHJ5IH07XG4iLCJjb25zdCBHTE9CQUwgPSAoKCkgPT4ge1xyXG5cdGlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBnbG9iYWw7XHJcblx0aWYodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHdpbmRvdztcdFxyXG5cdGlmKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gc2VsZjtcclxuXHRyZXR1cm4ge307XHJcbn0pKCk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHTE9CQUw7IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JqZWN0UHJvcGVydHkge1xyXG5cdGNvbnN0cnVjdG9yKGtleSwgY29udGV4dCl7XHJcblx0XHR0aGlzLmtleSA9IGtleTtcclxuXHRcdHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBrZXlEZWZpbmVkKCl7XHJcblx0XHRyZXR1cm4gdGhpcy5rZXkgaW4gdGhpcy5jb250ZXh0OyBcclxuXHR9XHJcblx0XHJcblx0Z2V0IGhhc1ZhbHVlKCl7XHJcblx0XHRyZXR1cm4gISF0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgdmFsdWUoKXtcclxuXHRcdHJldHVybiB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgdmFsdWUoZGF0YSl7XHJcblx0XHR0aGlzLmNvbnRleHRbdGhpcy5rZXldID0gZGF0YTtcclxuXHR9XHJcblx0XHJcblx0c2V0IGFwcGVuZChkYXRhKSB7XHJcblx0XHRpZighdGhpcy5oYXNWYWx1ZSlcclxuXHRcdFx0dGhpcy52YWx1ZSA9IGRhdGE7XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Y29uc3QgdmFsdWUgPSB0aGlzLnZhbHVlO1xyXG5cdFx0XHRpZih2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KVxyXG5cdFx0XHRcdHZhbHVlLnB1c2goZGF0YSk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHR0aGlzLnZhbHVlID0gW3RoaXMudmFsdWUsIGRhdGFdO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZW1vdmUoKXtcclxuXHRcdGRlbGV0ZSB0aGlzLmNvbnRleHRbdGhpcy5rZXldO1xyXG5cdH1cclxuXHRcclxuXHRzdGF0aWMgbG9hZChkYXRhLCBrZXksIGNyZWF0ZT10cnVlKSB7XHJcblx0XHRsZXQgY29udGV4dCA9IGRhdGE7XHJcblx0XHRjb25zdCBrZXlzID0ga2V5LnNwbGl0KFwiXFwuXCIpO1xyXG5cdFx0bGV0IG5hbWUgPSBrZXlzLnNoaWZ0KCkudHJpbSgpO1xyXG5cdFx0d2hpbGUoa2V5cy5sZW5ndGggPiAwKXtcclxuXHRcdFx0aWYoIWNvbnRleHRbbmFtZV0pe1xyXG5cdFx0XHRcdGlmKCFjcmVhdGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjb250ZXh0W25hbWVdID0ge31cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0Y29udGV4dCA9IGNvbnRleHRbbmFtZV07XHJcblx0XHRcdG5hbWUgPSBrZXlzLnNoaWZ0KCkudHJpbSgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IE9iamVjdFByb3BlcnR5KG5hbWUsIGNvbnRleHQpO1xyXG5cdH1cclxufTsiLCJpbXBvcnQgT2JqZWN0UHJvcGVydHkgZnJvbSBcIi4vT2JqZWN0UHJvcGVydHkuanNcIjtcclxuXHJcbmNvbnN0IGVxdWFsQXJyYXlTZXQgPSAoYSwgYikgPT4ge1xyXG5cdGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHRjb25zdCBsZW5ndGggPSBhLmxlbmd0aDtcclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKVxyXG5cdFx0aWYgKCFlcXVhbFBvam8oYVtpXSwgYltpXSkpIHtcclxuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImZhbHNlXCIpO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuY29uc3QgZXF1YWxNYXAgPSAoYSwgYikgPT4ge1xyXG5cdGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuXHRmb3IgKGNvbnN0IGtleSBvZiBhLmtleXMoKSlcclxuXHRcdGlmICghZXF1YWxQb2pvKGEuZ2V0KGtleSksIGIuZ2V0KGtleSkpKSB7XHJcblx0XHRcdC8vY29uc29sZS5sb2coXCJmYWxzZVwiKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbmNvbnN0IGVxdWFsQ2xhc3NlcyA9IChhLCBiKSA9PiB7XHJcblx0Y29uc3QgY2xhenpBID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGEpO1xyXG5cdGNvbnN0IGNsYXp6QiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihiKTtcclxuXHRpZiAoY2xhenpBICE9IGNsYXp6QikgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHRpZiAoIWNsYXp6QSkgcmV0dXJuIHRydWU7XHJcblxyXG5cdGNvbnN0IHByb3BlcnRpZXNBID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY2xhenpBKTtcclxuXHRjb25zdCBwcm9wZXJ0aWVzQiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGNsYXp6Qik7XHJcblxyXG5cdGlmIChwcm9wZXJ0aWVzQS5sZW5ndGggIT09IHByb3BlcnRpZXNCLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG5cdGZvciAoY29uc3Qga2V5IG9mIHByb3BlcnRpZXNBKSB7XHJcblx0XHRjb25zdCB2YWx1ZUEgPSBhW2tleV07XHJcblx0XHRjb25zdCB2YWx1ZUIgPSBiW2tleV07XHJcblxyXG5cdFx0aWYgKCFlcXVhbFBvam8odmFsdWVBLCB2YWx1ZUIpKSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cdHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuY29uc3QgZXF1YWxPYmplY3QgPSAoYSwgYikgPT4ge1xyXG5cdGNvbnN0IHByb3BlcnRpZXNBID0gT2JqZWN0LmtleXMoYSk7XHJcblx0Y29uc3QgcHJvcGVydGllc0IgPSBPYmplY3Qua2V5cyhiKTtcclxuXHJcblx0aWYgKHByb3BlcnRpZXNBLmxlbmd0aCAhPT0gcHJvcGVydGllc0IubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcblx0Zm9yIChjb25zdCBrZXkgb2YgcHJvcGVydGllc0EpIHtcclxuXHRcdGNvbnN0IHZhbHVlQSA9IGFba2V5XTtcclxuXHRcdGNvbnN0IHZhbHVlQiA9IGJba2V5XTtcclxuXHJcblx0XHRpZiAoIWVxdWFsUG9qbyh2YWx1ZUEsIHZhbHVlQikpIHJldHVybiBmYWxzZTtcclxuXHR9XHJcblx0cmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaXNOdWxsT3JVbmRlZmluZWQgPSAob2JqZWN0KSA9PiB7XHJcblx0cmV0dXJuIG9iamVjdCA9PSBudWxsIHx8IHR5cGVvZiBvYmplY3QgPT09IFwidW5kZWZpbmVkXCI7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaXNQcmltaXRpdmUgPSAob2JqZWN0KSA9PiB7XHJcblx0aWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcclxuXHJcblx0Y29uc3QgdHlwZSA9IHR5cGVvZiBvYmplY3Q7XHJcblx0c3dpdGNoICh0eXBlKSB7XHJcblx0XHRjYXNlIFwibnVtYmVyXCI6XHJcblx0XHRjYXNlIFwiYmlnaW50XCI6XHJcblx0XHRjYXNlIFwiYm9vbGVhblwiOlxyXG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxyXG5cdFx0Y2FzZSBcInVuZGVmaW5lZFwiOlxyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IChvYmplY3QpID0+IHtcclxuXHRpZihpc051bGxPclVuZGVmaW5lZChvYmplY3QpKVxyXG5cdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRyZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gXCJvYmplY3RcIiAmJiAoIW9iamVjdC5jb25zdHJ1Y3RvciB8fCBvYmplY3QuY29uc3RydWN0b3IubmFtZSA9PT0gXCJPYmplY3RcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogZXF1YWxQb2pvIC0+IGNvbXBhcmVzIG9ubHkgcG9qb3MsIGFycmF5LCBzZXQsIG1hcCBhbmQgcHJpbWl0aXZlc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVxdWFsUG9qbyA9IChhLCBiKSA9PiB7XHJcblx0Y29uc3QgbnVsbEEgPSBpc051bGxPclVuZGVmaW5lZChhKTtcclxuXHRjb25zdCBudWxsQiA9IGlzTnVsbE9yVW5kZWZpbmVkKGIpO1xyXG5cdGlmIChudWxsQSB8fCBudWxsQikgcmV0dXJuIGEgPT09IGI7XHJcblxyXG5cdGlmIChpc1ByaW1pdGl2ZShhKSB8fCBpc1ByaW1pdGl2ZShiKSkgcmV0dXJuIGEgPT09IGI7XHJcblxyXG5cdGNvbnN0IHR5cGVBID0gdHlwZW9mIGE7XHJcblx0Y29uc3QgdHlwZUIgPSB0eXBlb2YgYjtcclxuXHRpZiAodHlwZUEgIT0gdHlwZUIpIHJldHVybiBmYWxzZTtcclxuXHRpZiAodHlwZUEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIGEgPT09IGI7XHJcblx0Ly9pZiAoYS5jb25zdHJ1Y3RvciAhPT0gYi5jb25zdHJ1Y3RvcikgcmV0dXJuIGZhbHNlO1xyXG5cdC8vaWYgKGEgaW5zdGFuY2VvZiBBcnJheSB8fCBhIGluc3RhbmNlb2YgU2V0KSByZXR1cm4gZXF1YWxBcnJheVNldChhLCBiKTtcclxuXHQvL2lmIChhIGluc3RhbmNlb2YgTWFwKSByZXR1cm4gZXF1YWxNYXAoYSwgYik7XHJcblxyXG5cdHJldHVybiBlcXVhbE9iamVjdChhLCBiKSAmJiBlcXVhbENsYXNzZXMoYSwgYik7XHJcbn07XHJcblxyXG4vKipcclxuICogY2hlY2tlZCBpZiBhbiBvYmplY3QgYSBzaW1wbGUgb2JqZWN0LiBObyBBcnJheSwgTWFwIG9yIHNvbWV0aGluZyBlbHNlLlxyXG4gKlxyXG4gKiBAcGFyYW0gYU9iamVjdDpvYmplY3QgdGhlIG9iamVjdCB0byBiZSB0ZXN0aW5nXHJcbiAqXHJcbiAqIEByZXR1cm4gYm9vbGVhblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzUG9qbyA9IChvYmplY3QpID0+IHtcclxuXHRpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHJldHVybiBmYWxzZTtcclxuXHJcblx0Zm9yIChjb25zdCBrZXkgaW4gb2JqZWN0KSB7XHJcblx0XHRjb25zdCB2YWx1ZSA9IG9iamVjdFtrZXldO1xyXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBhcHBlbmQgYSBwcm9wZXJ5IHZhbHVlIHRvIGFuIG9iamVjdC4gSWYgcHJvcGVyeSBleGlzdHMgaXRzIHdvdWxkIGJlIGNvbnZlcnRlZCB0byBhbiBhcnJheVxyXG4gKlxyXG4gKiAgQHBhcmFtIGFLZXk6c3RyaW5nIG5hbWUgb2YgcHJvcGVydHlcclxuICogIEBwYXJhbSBhRGF0YTphbnkgcHJvcGVydHkgdmFsdWVcclxuICogIEBwYXJhbSBhT2JqZWN0Om9iamVjdCB0aGUgb2JqZWN0IHRvIGFwcGVuZCB0aGUgcHJvcGVydHlcclxuICpcclxuICogIEByZXR1cm4gcmV0dXJucyB0aGUgY2hhbmdlZCBvYmplY3RcclxuICovXHJcbmV4cG9ydCBjb25zdCBhcHBlbmQgPSBmdW5jdGlvbiAoYUtleSwgYURhdGEsIGFPYmplY3QpIHtcclxuXHRpZiAodHlwZW9mIGFEYXRhICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcblx0XHRjb25zdCBwcm9wZXJ0eSA9IE9iamVjdFByb3BlcnR5LmxvYWQoYU9iamVjdCwgYUtleSwgdHJ1ZSk7XHJcblx0XHRwcm9wZXJ0eS5hcHBlbmQgPSBhRGF0YTtcclxuXHR9XHJcblx0cmV0dXJuIGFPYmplY3Q7XHJcbn07XHJcblxyXG4vKipcclxuICogbWVyZ2luZyBvYmplY3QgaW50byBhIHRhcmdldCBvYmplY3QuIEl0cyBvbmx5IG1lcmdlIHNpbXBsZSBvYmplY3QgYW5kIHN1YiBvYmplY3RzLiBFdmVyeSBvdGhlclxyXG4gKiB2YWx1ZSB3b3VsZCBiZSByZXBsYWNlZCBieSB2YWx1ZSBmcm9tIHRoZSBzb3VyY2Ugb2JqZWN0LlxyXG4gKlxyXG4gKiBzYW1wbGU6IG1lcmdlKHRhcmdldCwgc291cmNlLTEsIHNvdXJjZS0yLCAuLi5zb3VyY2UtbilcclxuICpcclxuICogQHBhcmFtIHRhcmdldDpvYmplY3QgdGhlIHRhcmdldCBvYmplY3QgdG8gbWVyZ2luZyBpbnRvXHJcbiAqIEBwYXJhbSBzb3VyY2VzOm9iamVjdFxyXG4gKlxyXG4gKiBAcmV0dXJuIG9iamVjdCByZXR1cm5zIHRoZSB0YXJnZXQgb2JqZWN0XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbWVyZ2UgPSBmdW5jdGlvbiAodGFyZ2V0LCAuLi5zb3VyY2VzKSB7XHJcblx0aWYgKCF0YXJnZXQpIHRhcmdldCA9IHt9O1xyXG5cclxuXHRmb3IgKGxldCBzb3VyY2Ugb2Ygc291cmNlcykge1xyXG5cdFx0aWYgKGlzUG9qbyhzb3VyY2UpKSB7XHJcblx0XHRcdE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSkuZm9yRWFjaCgoa2V5KSA9PiB7XHJcblx0XHRcdFx0aWYgKGlzUG9qbyh0YXJnZXRba2V5XSkpIG1lcmdlKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcblx0XHRcdFx0ZWxzZSB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiB0YXJnZXQ7XHJcbn07XHJcblxyXG5jb25zdCBidWlsZFByb3BlcnR5RmlsdGVyID0gZnVuY3Rpb24gKHsgbmFtZXMsIGFsbG93ZWQgfSkge1xyXG5cdHJldHVybiAobmFtZSwgdmFsdWUsIGNvbnRleHQpID0+IHtcclxuXHRcdHJldHVybiBuYW1lcy5pbmNsdWRlcyhuYW1lKSA9PT0gYWxsb3dlZDtcclxuXHR9O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGZpbHRlciA9IGZ1bmN0aW9uICgpIHtcclxuXHRjb25zdCBbZGF0YSwgcHJvcEZpbHRlciwgeyBkZWVwID0gZmFsc2UsIHJlY3Vyc2l2ZSA9IHRydWUsIHBhcmVudHMgPSBbXSB9ID0ge31dID0gYXJndW1lbnRzO1xyXG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xyXG5cclxuXHRmb3IgKGxldCBuYW1lIGluIGRhdGEpIHtcclxuXHRcdGNvbnN0IHZhbHVlID0gZGF0YVtuYW1lXTtcclxuXHRcdGNvbnN0IGFjY2VwdCA9IHByb3BGaWx0ZXIobmFtZSwgdmFsdWUsIGRhdGEpO1xyXG5cdFx0aWYgKGFjY2VwdCAmJiAoIWRlZXAgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkpIHJlc3VsdFtuYW1lXSA9IHZhbHVlO1xyXG5cdFx0ZWxzZSBpZiAoYWNjZXB0ICYmIGRlZXApIHtcclxuXHRcdFx0Y29uc3QgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcclxuXHRcdFx0aWYgKHR5cGUgIT09IFwib2JqZWN0XCIgfHwgdmFsdWUgaW5zdGFuY2VvZiBBcnJheSB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFNldCB8fCB2YWx1ZSBpbnN0YW5jZW9mIFJlZ0V4cCB8fCBwYXJlbnRzLmluY2x1ZGVzW3ZhbHVlXSB8fCB2YWx1ZSA9PSBkYXRhKSByZXN1bHRbbmFtZV0gPSB2YWx1ZTtcclxuXHRcdFx0ZWxzZSByZXN1bHRbbmFtZV0gPSBmaWx0ZXIodmFsdWUsIHByb3BGaWx0ZXIsIHsgZGVlcCwgcmVjdXJzaXZlLCBwYXJlbnRzOiBwYXJlbnRzLmNvbmNhdChkYXRhKSB9KTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZGVmVmFsdWUgPSAobywgbmFtZSwgdmFsdWUpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0dmFsdWUsXHJcblx0XHR3cml0YWJsZTogZmFsc2UsXHJcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0fSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBkZWZHZXQgPSAobywgbmFtZSwgZ2V0KSA9PiB7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIG5hbWUsIHtcclxuXHRcdGdldCxcclxuXHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHR9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWZHZXRTZXQgPSAobywgbmFtZSwgZ2V0LCBzZXQpID0+IHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobywgbmFtZSwge1xyXG5cdFx0Z2V0LFxyXG5cdFx0c2V0LFxyXG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG5cdGlzTnVsbE9yVW5kZWZpbmVkLFxyXG5cdGlzT2JqZWN0LFxyXG5cdGVxdWFsUG9qbyxcclxuXHRpc1Bvam8sXHJcblx0YXBwZW5kLFxyXG5cdG1lcmdlLFxyXG5cdGZpbHRlcixcclxuXHRidWlsZFByb3BlcnR5RmlsdGVyLFxyXG5cdGRlZlZhbHVlLFxyXG5cdGRlZkdldCxcclxuXHRkZWZHZXRTZXQsXHJcbn07XHJcbiIsIi8qKlxyXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDYWNoZUVudHJ5XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBsYXN0SGl0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBrZXlcclxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gY29kZVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDb2RlQ2FjaGVPcHRpb25zXHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc2l6ZT0xMDAwXSAtIE1heGltdW0gbnVtYmVyIG9mIGVudHJpZXMgaW4gdGhlIGNhY2hlLiBJZiBzZXQgdG8gMCBvciBsZXNzLCBjYWNoaW5nIGlzIGRpc2FibGVkLlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBDb2RlQ2FjaGUgY2xhc3MgdG8gbWFuYWdlIGNhY2hpbmcgb2YgZ2VuZXJhdGVkIGNvZGUgc25pcHBldHMuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlQ2FjaGUge1xyXG5cdC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cclxuXHQjZGlzYWJsZWQgPSBmYWxzZTtcclxuXHQvKiogQHR5cGUge251bWJlcn0gKi9cclxuXHQjc2l6ZSA9IDA7XHJcblx0LyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcblx0I21heFNpemUgPSAwO1xyXG5cdC8qKiBAdHlwZSB7QXJyYXk8Q2FjaGVFbnRyeT59ICovXHJcblx0I2VudHJpZXMgPSBbXTtcclxuXHQvKiogQHR5cGUge01hcDxzdHJpbmcsQ2FjaGVFbnRyeX0gKi9cclxuXHQjZW50cnlNYXAgPSBuZXcgTWFwKCk7XHJcblxyXG5cdFxyXG5cdCAvKipcclxuXHQgICogQHBhcmFtIHtDb2RlQ2FjaGVPcHRpb25zfSBvcHRpb25zXHJcblx0ICAqL1xyXG5cdGNvbnN0cnVjdG9yKHsgc2l6ZSA9IDEwMDAgfSA9IHt9KSB7XHJcblx0XHRpZiAoc2l6ZSA8PSAwKSB0aGlzLiNkaXNhYmxlZCA9IHRydWU7XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0dGhpcy4jc2l6ZSA9IHNpemUgPiAwID8gc2l6ZSA6IDEwMDA7XHJcblx0XHRcdHRoaXMuI21heFNpemUgPSBNYXRoLmZsb29yKHNpemUgKiAxLjEpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0IC8qKlxyXG5cdCAgKiBAcGFyYW0ge0NvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcclxuXHQgICovXHJcblx0c2V0dXAoeyBzaXplID0gMTAwMCB9ID0ge30pIHtcclxuXHRcdGlmIChzaXplIDw9IDApe1xyXG5cdFx0XHR0aGlzLiNkaXNhYmxlZCA9IHRydWU7XHJcblx0XHRcdHRoaXMuY2xlYXIoKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHR0aGlzLiNzaXplID0gc2l6ZSA+IDAgPyBzaXplIDogMTAwMDtcclxuXHRcdFx0dGhpcy4jbWF4U2l6ZSA9IE1hdGguZmxvb3Ioc2l6ZSAqIDEuMSk7XHJcblx0XHRcdHRoaXMuI3RyaW0oKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGhhcyhrZXkpIHtcclxuXHRcdGlmKHRoaXMuI2Rpc2FibGVkKSByZXR1cm4gZmFsc2U7XHJcblx0XHRyZXR1cm4gdGhpcy4jZW50cnlNYXAuaGFzKGtleSk7XHJcblx0fVxyXG5cclxuXHRnZXQoa2V5KSB7XHJcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuIG51bGw7XHJcblx0XHRjb25zdCBkYXRhID0gdGhpcy4jZW50cnlNYXAuZ2V0KGtleSk7XHJcblx0XHRpZiAoZGF0YSkge1xyXG5cdFx0XHRkYXRhLmxhc3RIaXQgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRyZXR1cm4gZGF0YS52YWx1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHJcblx0c2V0KGtleSwgY29kZSkge1xyXG5cdFx0aWYodGhpcy4jZGlzYWJsZWQpIHJldHVybjtcclxuXHRcdGxldCBlbnRyeSA9IHRoaXMuI2VudHJ5TWFwLmdldChrZXkpO1xyXG5cdFx0aWYgKGVudHJ5KSB7XHJcblx0XHRcdGVudHJ5LmNvdW50ID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0ZW50cnkudmFsdWUgPSBjb2RlO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZW50cnkgPSB7XHJcblx0XHRcdFx0Y291bnQ6IERhdGUubm93KCksXHJcblx0XHRcdFx0a2V5LFxyXG5cdFx0XHRcdHZhbHVlOiBjb2RlLFxyXG5cdFx0XHR9O1xyXG5cdFx0XHR0aGlzLiNlbnRyaWVzLnB1c2goZW50cnkpO1xyXG5cdFx0XHR0aGlzLiNlbnRyeU1hcC5zZXQoa2V5LCBlbnRyeSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuI2VudHJ5TWFwLnNpemUgPj0gdGhpcy4jbWF4U2l6ZSkgdGhpcy4jdHJpbSgpO1xyXG5cdH1cclxuXHJcblx0Y2xlYXIoKSB7XHJcblx0XHRpZih0aGlzLiNkaXNhYmxlZCkgcmV0dXJuO1xyXG5cdFx0dGhpcy4jZW50cmllcyA9IFtdO1xyXG5cdFx0dGhpcy4jZW50cnlNYXAgPSBuZXcgTWFwKCk7XHJcblx0fVxyXG5cclxuXHQjdHJpbSgpIHtcclxuXHRcdGNvbnNvbGUuZGVidWcoYFRyaW1taW5nIGNvZGUgY2FjaGUgZnJvbSAke3RoaXMuI2VudHJpZXMubGVuZ3RofSBlbnRyaWVzIHRvICR7dGhpcy4jc2l6ZX0gZW50cmllcy5gKTtcclxuXHRcdHRoaXMuI2VudHJpZXMuc29ydCgoYSwgYikgPT4gYi5jb3VudCAtIGEuY291bnQpO1xyXG5cdFx0aWYgKHRoaXMuI2VudHJpZXMubGVuZ3RoID49IHRoaXMuI3NpemUpIHtcclxuXHRcdFx0Y29uc3QgZW50cmllc1RvUmVtb3ZlID0gdGhpcy4jZW50cmllcy5zcGxpY2UodGhpcy4jc2l6ZSk7XHJcblx0XHRcdGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllc1RvUmVtb3ZlKSB7XHJcblx0XHRcdFx0dGhpcy4jZW50cnlNYXAuZGVsZXRlKGVudHJ5LmtleSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn07XHJcbiIsIi8qKlxuICogb2JqZWN0IGZvciBkZWZhdWx0IHZhbHVlXG4gKlxuICogQGV4cG9ydFxuICogQGNsYXNzIERlZmF1bHRWYWx1ZVxuICogQHR5cGVkZWYge0RlZmF1bHRWYWx1ZX1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmYXVsdFZhbHVlIHtcblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgRGVmYXVsdFZhbHVlLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IodmFsdWUpe1xuXHRcdHRoaXMuaGFzVmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDE7XG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR9XHRcbn07IiwiY29uc3QgRVhFQ1VURVJTID0gbmV3IE1hcCgpO1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhTmFtZVxyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhbkV4ZWN1dGVyXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgcmVnaXN0cmF0ZSA9IChhTmFtZSwgYW5FeGVjdXRlcikgPT4ge1xyXG5cdEVYRUNVVEVSUy5zZXQoYU5hbWUsIGFuRXhlY3V0ZXIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhTmFtZVxyXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZ2V0RXhlY3V0ZXIgPSAoYU5hbWUpID0+IHtcclxuXHRjb25zdCBleGVjdXRlciA9IEVYRUNVVEVSUy5nZXQoYU5hbWUpO1xyXG5cdGlmICghZXhlY3V0ZXIpIHRocm93IG5ldyBFcnJvcihgRXhlY3V0ZXIgXCIke2FOYW1lfVwiIGlzIG5vdCByZWdpc3RyYXRlZCFgKTtcclxuXHRyZXR1cm4gZXhlY3V0ZXI7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBnZXRFeGVjdXRlcjtcclxuIiwiaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsLmpzXCI7XHJcbmltcG9ydCBPYmplY3RVdGlscyBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvT2JqZWN0VXRpbHMuanNcIjtcclxuaW1wb3J0IERlZmF1bHRWYWx1ZSBmcm9tIFwiLi9EZWZhdWx0VmFsdWUuanNcIjtcclxuaW1wb3J0IGdldEV4ZWN1dGVyVHlwZSBmcm9tIFwiLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XHJcbmltcG9ydCBDb250ZXh0UHJveHkgZnJvbSBcIi4vUmVzb2x2ZXJDb250ZXh0SGFuZGxlLmpzXCI7XHJcblxyXG5jb25zdCBERUZBVUxUX0VYRUNVVEVSX05BTUUgPSBcIndpdGgtc2NvcGVkLWV4ZWN1dGVyXCI7XHJcbmxldCBERUZBVUxUX0VYRUNVVEVSID0gKCgpID0+IHtcclxuXHRsZXQgZXhlY3V0ZXIgPSBudWxsO1xyXG5cdHJldHVybiAoYVN0YXRlbWVudCwgYUNvbnRleHQpID0+IHtcclxuXHRcdGlmIChleGVjdXRlciA9PSBudWxsKSBleGVjdXRlciA9IGdldEV4ZWN1dGVyVHlwZShERUZBVUxUX0VYRUNVVEVSX05BTUUpO1xyXG5cdFx0cmV0dXJuIGV4ZWN1dGVyKGFTdGF0ZW1lbnQsIGFDb250ZXh0KTtcclxuXHR9O1xyXG59KSgpO1xyXG5cclxuY29uc3QgRVhFQ1VUSU9OX1dBUk5fVElNRU9VVCA9IDEwMDA7XHJcbmNvbnN0IEVYUFJFU1NJT04gPSAvKFxcXFw/KShcXCRcXHsoKFthLXpBLVowLTlcXC1fXFxzXSspOjopPyhbXlxce1xcfV0rKVxcfSkvO1xyXG5jb25zdCBNQVRDSF9FU0NBUEVEID0gMTtcclxuY29uc3QgTUFUQ0hfRlVMTF9FWFBSRVNTSU9OID0gMjtcclxuY29uc3QgTUFUQ0hfRVhQUkVTU0lPTl9TQ09QRSA9IDQ7XHJcbmNvbnN0IE1BVENIX0VYUFJFU1NJT05fU1RBVEVNRU5UID0gNTtcclxuXHJcbmNvbnN0IERFRkFVTFRfTk9UX0RFRklORUQgPSBuZXcgRGVmYXVsdFZhbHVlKCk7XHJcbmNvbnN0IHRvRGVmYXVsdFZhbHVlID0gKHZhbHVlKSA9PiB7XHJcblx0aWYgKHZhbHVlIGluc3RhbmNlb2YgRGVmYXVsdFZhbHVlKSByZXR1cm4gdmFsdWU7XHJcblxyXG5cdHJldHVybiBuZXcgRGVmYXVsdFZhbHVlKHZhbHVlKTtcclxufTtcclxuXHJcbmNvbnN0IGV4ZWN1dGUgPSBhc3luYyBmdW5jdGlvbiAoYW5FeGVjdXRlciwgYVN0YXRlbWVudCwgYUNvbnRleHQpIHtcclxuXHRpZiAodHlwZW9mIGFTdGF0ZW1lbnQgIT09IFwic3RyaW5nXCIpIHJldHVybiBhU3RhdGVtZW50O1xyXG5cdGFTdGF0ZW1lbnQgPSBub3JtYWxpemUoYVN0YXRlbWVudCk7XHJcblx0aWYgKGFTdGF0ZW1lbnQgPT0gbnVsbCkgcmV0dXJuIGFTdGF0ZW1lbnQ7XHJcblxyXG5cdHRyeSB7XHJcblx0XHRyZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuXHRcdFx0Y29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoXHJcblx0XHRcdFx0KCkgPT5cclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgTG9uZyBydW5uaW5nIHN0YXRlbWVudDpcclxuXHRcdFx0XHRcIiR7YVN0YXRlbWVudH1cIlxyXG5cdFx0XHRgKSxcclxuXHRcdFx0XHRFWEVDVVRJT05fV0FSTl9USU1FT1VULFxyXG5cdFx0XHQpO1xyXG5cdFx0XHRyZXNvbHZlKFxyXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XHJcblx0XHRcdFx0XHRsZXQgcmVzdWx0ID0gdW5kZWZpbmVkO1xyXG5cdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0cmVzdWx0ID0gYXdhaXQgYW5FeGVjdXRlcihhU3RhdGVtZW50LCBhQ29udGV4dCk7XHJcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihgRXhlY3V0aW9uIGVycm9yIG9uIHN0YXRlbWVudCFcclxuXHRcdFx0XHRcdFx0XHRzdGF0ZW1lbnQ6IFxyXG5cdFx0XHRcdFx0XHRcdCR7YVN0YXRlbWVudH1cclxuXHRcdFx0XHRcdFx0XHRlcnJvcjpcclxuXHRcdFx0XHRcdFx0XHQke2V9XHJcblx0XHRcdFx0XHRcdFx0YClcclxuXHRcdFx0XHRcdH0gZmluYWxseSB7XHJcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcdFx0fSkoKSxcclxuXHRcdFx0KTtcclxuXHRcdH0pO1xyXG5cdH0gY2F0Y2ggKGUpIHtcclxuXHRcdGNvbnNvbGUuZXJyb3IoYEVycm9yIGJ5IHN0YXRlbWVudCBcIiR7YVN0YXRlbWVudH1cIjpgLCBlKTtcclxuXHR9XHJcbn07XHJcblxyXG5jb25zdCByZXNvbHZlID0gYXN5bmMgZnVuY3Rpb24gKGFFeGVjdXRlciA9IERFRkFVTFRfRVhFQ1VURVIsIGFSZXNvbHZlciwgYUV4cHJlc3Npb24sIGFGaWx0ZXIsIGFEZWZhdWx0KSB7XHJcblx0aWYgKGFGaWx0ZXIgJiYgYVJlc29sdmVyLm5hbWUgIT0gYUZpbHRlcikgcmV0dXJuIGFSZXNvbHZlci5wYXJlbnQgPyByZXNvbHZlKGFSZXNvbHZlci5wYXJlbnQsIGFFeHByZXNzaW9uLCBhRmlsdGVyLCBhRGVmYXVsdCwgYUV4ZWN1dGVyKSA6IG51bGw7XHJcblxyXG5cdGNvbnN0IHJlc3VsdCA9IGF3YWl0IGV4ZWN1dGUoYUV4ZWN1dGVyLCBhRXhwcmVzc2lvbiwgYVJlc29sdmVyLmNvbnRleHQpO1xyXG5cdGlmIChyZXN1bHQgIT09IG51bGwgJiYgdHlwZW9mIHJlc3VsdCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIHJlc3VsdDtcclxuXHRlbHNlIGlmIChhRGVmYXVsdCBpbnN0YW5jZW9mIERlZmF1bHRWYWx1ZSAmJiBhRGVmYXVsdC5oYXNWYWx1ZSkgcmV0dXJuIGFEZWZhdWx0LnZhbHVlO1xyXG59O1xyXG5cclxuY29uc3QgcmVzb2x2ZU1hdGNoID0gYXN5bmMgKGFFeGVjdXRlciwgcmVzb2x2ZXIsIG1hdGNoLCBkZWZhdWx0VmFsdWUpID0+IHtcclxuXHRpZiAobWF0Y2hbTUFUQ0hfRVNDQVBFRF0pIHJldHVybiBtYXRjaFtNQVRDSF9GVUxMX0VYUFJFU1NJT05dO1xyXG5cclxuXHRyZXR1cm4gcmVzb2x2ZShhRXhlY3V0ZXIsIHJlc29sdmVyLCBtYXRjaFtNQVRDSF9FWFBSRVNTSU9OX1NUQVRFTUVOVF0sIG5vcm1hbGl6ZShtYXRjaFtNQVRDSF9FWFBSRVNTSU9OX1NDT1BFXSksIGRlZmF1bHRWYWx1ZSk7XHJcbn07XHJcblxyXG5jb25zdCBub3JtYWxpemUgPSAodmFsdWUpID0+IHtcclxuXHRpZiAodmFsdWUpIHtcclxuXHRcdHZhbHVlID0gdmFsdWUudHJpbSgpO1xyXG5cdFx0cmV0dXJuIHZhbHVlLmxlbmd0aCA9PSAwID8gbnVsbCA6IHZhbHVlO1xyXG5cdH1cclxuXHRyZXR1cm4gbnVsbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBFeHByZXNzaW9uUmVzb2x2ZXJcclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAY2xhc3MgRXhwcmVzc2lvblJlc29sdmVyXHJcbiAqIEB0eXBlZGVmIHtFeHByZXNzaW9uUmVzb2x2ZXJ9XHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHByZXNzaW9uUmVzb2x2ZXIge1xyXG5cdC8qKlxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhbkV4ZWN1dGVyTmFtZVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBzZXQgZGVmYXVsdEV4ZWN1dGVyKGFuRXhlY3V0ZXIpIHtcclxuXHRcdGlmICh0eXBlb2YgYW5FeGVjdXRlciA9PT0gXCJmdW5jdGlvblwiKSBERUZBVUxUX0VYRUNVVEVSID0gYW5FeGVjdXRlcjtcclxuXHRcdGVsc2UgREVGQVVMVF9FWEVDVVRFUiA9IGdldEV4ZWN1dGVyVHlwZShhbkV4ZWN1dGVyKTtcclxuXHRcdGNvbnNvbGUuaW5mbyhgQ2hhbmdlZCBkZWZhdWx0IGV4ZWN1dGVyIGZvciBFeHByZXNzaW9uUmVzb2x2ZXIhYCk7XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZ2V0IGRlZmF1bHRFeGVjdXRlcigpIHtcclxuXHRcdHJldHVybiBERUZBVUxUX0VYRUNVVEVSO1xyXG5cdH1cclxuXHJcblx0LyoqIEB0eXBlIHtzdHJpbmd8bnVsbH0gKi9cclxuXHQjbmFtZSA9IG51bGw7XHJcblx0LyoqIEB0eXBlIHtFeHByZXNzaW9uUmVzb2x2ZXJ8bnVsbH0gKi9cclxuXHQjcGFyZW50ID0gbnVsbDtcclxuXHQvKiogQHR5cGUge2Z1bmN0aW9ufG51bGx9ICovXHJcblx0I2V4ZWN1dGVyID0gbnVsbDtcclxuXHQvKiogQHR5cGUge1Byb3h5fG51bGx9ICovXHJcblx0I2NvbnRleHQgPSBudWxsO1xyXG5cdC8qKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9ICovXHJcblx0I2NvbnRleHRIYW5kbGUgPSBudWxsO1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIEV4cHJlc3Npb25SZXNvbHZlci5cclxuXHQgKiBAZGF0ZSAzLzEwLzIwMjQgLSA3OjI3OjU3IFBNXHJcblx0ICpcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge3sgY29udGV4dD86IGFueTsgcGFyZW50PzogYW55OyBuYW1lPzogYW55OyB9fSBwYXJhbTBcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtMC5jb250ZXh0PUdMT0JBTF1cclxuXHQgKiBAcGFyYW0ge0V4cHJlc3Npb25SZXNvbHZlcn0gW3BhcmFtMC5wYXJlbnQ9bnVsbF1cclxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IFtwYXJhbTAubmFtZT1udWxsXVxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKHsgY29udGV4dCA9IEdMT0JBTCwgcGFyZW50ID0gbnVsbCwgbmFtZSA9IG51bGwsIGV4ZWN1dGVyIH0gPSB7fSkge1xyXG5cdFx0dGhpcy4jcGFyZW50ID0gcGFyZW50IGluc3RhbmNlb2YgRXhwcmVzc2lvblJlc29sdmVyID8gcGFyZW50IDogbnVsbDtcclxuXHRcdHRoaXMuI25hbWUgPSBuYW1lO1xyXG5cdFx0dGhpcy4jY29udGV4dEhhbmRsZSA9IG5ldyBDb250ZXh0UHJveHkoY29udGV4dCwgdGhpcy4jcGFyZW50ID8gdGhpcy4jcGFyZW50LmNvbnRleHRIYW5kbGUgOiBudWxsKTtcclxuXHRcdHRoaXMuI2NvbnRleHQgPSB0aGlzLiNjb250ZXh0SGFuZGxlLnByb3h5O1xyXG5cdFx0dGhpcy4jZXhlY3V0ZXIgPSB0eXBlb2YgZXhlY3V0ZXIgPT09IFwic3RyaW5nXCIgPyBnZXRFeGVjdXRlclR5cGUoZXhlY3V0ZXIpIDogdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0Z2V0IG5hbWUoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4jbmFtZTtcclxuXHR9XHJcblxyXG5cdGdldCBwYXJlbnQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xyXG5cdH1cclxuXHJcblx0Z2V0IGNvbnRleHQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4jY29udGV4dDtcclxuXHR9XHJcblxyXG5cdGdldCBjb250ZXh0SGFuZGxlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuI2NvbnRleHRIYW5kbGU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBnZXQgY2hhaW4gcGF0aFxyXG5cdCAqXHJcblx0ICogQHJlYWRvbmx5XHJcblx0ICogQHJldHVybnMge3N0cmluZ31cclxuXHQgKi9cclxuXHRnZXQgY2hhaW4oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5jaGFpbiArIFwiL1wiICsgdGhpcy5uYW1lIDogXCIvXCIgKyB0aGlzLm5hbWU7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBnZXQgZWZmZWN0aXZlIGNoYWluIHBhdGhcclxuXHQgKlxyXG5cdCAqIEByZWFkb25seVxyXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XHJcblx0ICovXHJcblx0Z2V0IGVmZmVjdGl2ZUNoYWluKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuZWZmZWN0aXZlQ2hhaW4gKyBcIi9cIiArIHRoaXMubmFtZSA6IFwiL1wiICsgdGhpcy5uYW1lO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogZ2V0IGNvbnRleHQgY2hhaW5cclxuXHQgKlxyXG5cdCAqIEByZWFkb25seVxyXG5cdCAqIEByZXR1cm5zIHtDb250ZXh0W119XHJcblx0ICovXHJcblx0Z2V0IGNvbnRleHRDaGFpbigpIHtcclxuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xyXG5cdFx0bGV0IHJlc29sdmVyID0gdGhpcztcclxuXHRcdHdoaWxlIChyZXNvbHZlcikge1xyXG5cdFx0XHRpZiAocmVzb2x2ZXIuY29udGV4dCkgcmVzdWx0LnB1c2gocmVzb2x2ZXIuY29udGV4dCk7XHJcblxyXG5cdFx0XHRyZXNvbHZlciA9IHJlc29sdmVyLnBhcmVudDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogZ2V0IGRhdGEgZnJvbSBjb250ZXh0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcblx0ICogQHBhcmFtIHs/c3RyaW5nfSBmaWx0ZXJcclxuXHQgKiBAcmV0dXJucyB7Kn1cclxuXHQgKi9cclxuXHRnZXREYXRhKGtleSwgZmlsdGVyKSB7XHJcblx0XHRpZiAoIWtleSkgcmV0dXJuIHRoaXMuY29udGV4dDtcclxuXHRcdGVsc2UgaWYgKGZpbHRlciAmJiBmaWx0ZXIgIT0gdGhpcy5uYW1lKSB7XHJcblx0XHRcdGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQuZ2V0RGF0YShrZXksIGZpbHRlcik7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5jb250ZXh0W2tleV07XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiB1cGRhdGUgZGF0YSBhdCBjb250ZXh0XHJcblx0ICpcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30ga2V5XHJcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxyXG5cdCAqIEBwYXJhbSB7P3N0cmluZ30gZmlsdGVyXHJcblx0ICovXHJcblx0dXBkYXRlRGF0YShrZXksIHZhbHVlLCBmaWx0ZXIpIHtcclxuXHRcdGlmICgha2V5KSByZXR1cm47XHJcblx0XHRlbHNlIGlmIChmaWx0ZXIgJiYgZmlsdGVyICE9IHRoaXMubmFtZSkge1xyXG5cdFx0XHRpZiAodGhpcy5wYXJlbnQpIHRoaXMucGFyZW50LnVwZGF0ZURhdGEoa2V5LCB2YWx1ZSwgZmlsdGVyKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuY29udGV4dFtrZXldID0gdmFsdWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBtZXJnZSBjb250ZXh0IG9iamVjdFxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGNvbnRleHRcclxuXHQgKiBAcGFyYW0gez9zdHJpbmd9IGZpbHRlclxyXG5cdCAqL1x0XHJcblx0bWVyZ2VDb250ZXh0KGNvbnRleHQsIGZpbHRlcikge1xyXG5cdFx0aWYgKGZpbHRlciAmJiBmaWx0ZXIgIT0gdGhpcy5uYW1lKSB7XHJcblx0XHRcdGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQubWVyZ2VDb250ZXh0KGNvbnRleHQsIGZpbHRlcik7XHJcblx0XHR9IGVsc2UgXHJcblx0XHRcdHRoaXMuI2NvbnRleHRIYW5kbGUubWVyZ2VEYXRhKGNvbnRleHQpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogcmVzb2x2ZWQgYW4gZXhwcmVzc2lvbiBzdHJpbmcgdG8gZGF0YVxyXG5cdCAqXHJcblx0ICogQGFzeW5jXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFFeHByZXNzaW9uXHJcblx0ICogQHBhcmFtIHs/Kn0gYURlZmF1bHRcclxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTwqPn1cclxuXHQgKi9cclxuXHRhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhRGVmYXVsdCkge1xyXG5cdFx0Y29uc3QgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA9PSAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcclxuXHRcdHRyeSB7XHJcblx0XHRcdGFFeHByZXNzaW9uID0gYUV4cHJlc3Npb24udHJpbSgpO1xyXG5cdFx0XHRpZiAoYUV4cHJlc3Npb24uc3RhcnRzV2l0aChcIlxcXFwke1wiKSkgcmV0dXJuIGFFeHByZXNzaW9uLnN1YnN0cmluZygxKTtcclxuXHRcdFx0ZWxzZSBpZiAoYUV4cHJlc3Npb24uc3RhcnRzV2l0aChcIiR7XCIpICYmIGFFeHByZXNzaW9uLmVuZHNXaXRoKFwifVwiKSkgcmV0dXJuIGF3YWl0IHJlc29sdmUodGhpcy4jZXhlY3V0ZXIsIHRoaXMsIG5vcm1hbGl6ZShhRXhwcmVzc2lvbi5zdWJzdHJpbmcoMiwgYUV4cHJlc3Npb24ubGVuZ3RoIC0gMSkpLCBudWxsLCBkZWZhdWx0VmFsdWUpO1x0XHRcdFxyXG5cdFx0XHRlbHNlIHJldHVybiBhd2FpdCByZXNvbHZlKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBub3JtYWxpemUoYUV4cHJlc3Npb24pLCBudWxsLCBkZWZhdWx0VmFsdWUpO1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKCdlcnJvciBhdCBleGVjdXRpbmcgc3RhdG1lbnRcIicsIGFFeHByZXNzaW9uLCAnXCI6JywgZSk7XHJcblx0XHRcdHJldHVybiBkZWZhdWx0VmFsdWUuaGFzVmFsdWUgPyBkZWZhdWx0VmFsdWUudmFsdWUgOiBhRXhwcmVzc2lvbjtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIHJlcGxhY2UgYWxsIGV4cHJlc3Npb25zIGF0IGEgc3RyaW5nXHQgKlxyXG5cdCAqIEBhc3luY1xyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBhVGV4dFxyXG5cdCAqIEBwYXJhbSB7Pyp9IGFEZWZhdWx0XHJcblx0ICogQHJldHVybnMge1Byb21pc2U8Kj59XHJcblx0ICovXHJcblx0YXN5bmMgcmVzb2x2ZVRleHQoYVRleHQsIGFEZWZhdWx0KSB7XHJcblx0XHRsZXQgdGV4dCA9IGFUZXh0O1xyXG5cdFx0bGV0IHRlbXAgPSBhVGV4dDsgLy8gcmVxdWlyZWQgdG8gcHJldmVudCBpbmZpbml0eSBsb29wXHJcblx0XHRsZXQgbWF0Y2ggPSBFWFBSRVNTSU9OLmV4ZWModGV4dCk7XHJcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID09IDIgPyB0b0RlZmF1bHRWYWx1ZShhRGVmYXVsdCkgOiBERUZBVUxUX05PVF9ERUZJTkVEO1xyXG5cdFx0d2hpbGUgKG1hdGNoICE9IG51bGwpIHtcclxuXHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzb2x2ZU1hdGNoKHRoaXMuI2V4ZWN1dGVyLCB0aGlzLCBtYXRjaCwgZGVmYXVsdFZhbHVlKTtcclxuXHRcdFx0dGVtcCA9IHRlbXAuc3BsaXQobWF0Y2hbMF0pLmpvaW4oKTsgLy8gcmVtb3ZlIGN1cnJlbnQgbWF0Y2ggZm9yIG5leHQgbG9vcFxyXG5cdFx0XHR0ZXh0ID0gdGV4dC5zcGxpdChtYXRjaFswXSkuam9pbih0eXBlb2YgcmVzdWx0ID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IHJlc3VsdCA9PSBudWxsID8gXCJudWxsXCIgOiByZXN1bHQpO1xyXG5cdFx0XHRtYXRjaCA9IEVYUFJFU1NJT04uZXhlYyh0ZW1wKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogcmVzb2x2ZSBhbiBleHByZXNzaW9uIHN0cmluZyB0byBkYXRhXHJcblx0ICpcclxuXHQgKiBAc3RhdGljXHJcblx0ICogQGFzeW5jXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFFeHByZXNzaW9uXHJcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxyXG5cdCAqIEBwYXJhbSB7Pyp9IGFEZWZhdWx0XHJcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBhVGltZW91dFxyXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlKGFFeHByZXNzaW9uLCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XHJcblx0XHRjb25zdCByZXNvbHZlciA9IG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0OiBhQ29udGV4dCB9KTtcclxuXHRcdGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gdG9EZWZhdWx0VmFsdWUoYURlZmF1bHQpIDogREVGQVVMVF9OT1RfREVGSU5FRDtcclxuXHRcdGlmICh0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHJlc29sdmUocmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKSk7XHJcblx0XHRcdFx0fSwgYVRpbWVvdXQpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRyZXR1cm4gcmVzb2x2ZXIucmVzb2x2ZShhRXhwcmVzc2lvbiwgZGVmYXVsdFZhbHVlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIHJlcGxhY2UgZXhwcmVzc2lvbiBhdCB0ZXh0XHJcblx0ICpcclxuXHQgKiBAc3RhdGljXHJcblx0ICogQGFzeW5jXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFUZXh0XHJcblx0ICogQHBhcmFtIHs/b2JqZWN0fSBhQ29udGV4dFxyXG5cdCAqIEBwYXJhbSB7Pyp9IGFEZWZhdWx0XHJcblx0ICogQHBhcmFtIHs/bnVtYmVyfSBhVGltZW91dFxyXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPCo+fVxyXG5cdCAqL1xyXG5cdHN0YXRpYyBhc3luYyByZXNvbHZlVGV4dChhVGV4dCwgYUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCkge1xyXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSBuZXcgRXhwcmVzc2lvblJlc29sdmVyKHsgY29udGV4dDogYUNvbnRleHQgfSk7XHJcblx0XHRjb25zdCBkZWZhdWx0VmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiA/IHRvRGVmYXVsdFZhbHVlKGFEZWZhdWx0KSA6IERFRkFVTFRfTk9UX0RFRklORUQ7XHJcblx0XHRpZiAodHlwZW9mIGFUaW1lb3V0ID09PSBcIm51bWJlclwiICYmIGFUaW1lb3V0ID4gMClcclxuXHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcblx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XHJcblx0XHRcdFx0XHRyZXNvbHZlKHJlc29sdmVyLnJlc29sdmVUZXh0KGFUZXh0LCBkZWZhdWx0VmFsdWUpKTtcclxuXHRcdFx0XHR9LCBhVGltZW91dCk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdHJldHVybiByZXNvbHZlci5yZXNvbHZlVGV4dChhVGV4dCwgZGVmYXVsdFZhbHVlKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIGJ1aWxkIGEgc2VjdXJlIGNvbnRleHQgb2JqZWN0XHJcblx0ICpcclxuXHQgKiBAc3RhdGljXHJcblx0IFxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhcmdcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gYXJnLmNvbnRleHRcclxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBhcmcucHJvcEZpbHRlclxyXG5cdCAqIEBwYXJhbSB7eyBkZWVwOiBib29sZWFuOyB9fSBbYXJnLm9wdGlvbj17IGRlZXA6IHRydWUgfV1cclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gYXJnLm5hbWVcclxuXHQgKiBAcGFyYW0ge0V4cHJlc3Npb25SZXNvbHZlcn0gYXJnLnBhcmVudFxyXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9XHJcblx0ICovXHJcblx0c3RhdGljIGJ1aWxkU2VjdXJlKHsgY29udGV4dCwgcHJvcEZpbHRlciwgb3B0aW9uID0geyBkZWVwOiB0cnVlIH0sIG5hbWUsIHBhcmVudCB9KSB7XHJcblx0XHRjb250ZXh0ID0gT2JqZWN0VXRpbHMuZmlsdGVyKHsgZGF0YTogY29udGV4dCwgcHJvcEZpbHRlciwgb3B0aW9uIH0pO1xyXG5cdFx0cmV0dXJuIG5ldyBFeHByZXNzaW9uUmVzb2x2ZXIoeyBjb250ZXh0LCBuYW1lLCBwYXJlbnQgfSk7XHJcblx0fVxyXG59XHJcblxyXG4iLCJpbXBvcnQgR0xPQkFMIGZyb20gXCJAZGVmYXVsdC1qcy9kZWZhdWx0anMtY29tbW9uLXV0aWxzL3NyYy9HbG9iYWwuanNcIjtcclxuaW1wb3J0IEV4cHJlc3Npb25SZXNvbHZlciBmcm9tIFwiLi9FeHByZXNzaW9uUmVzb2x2ZXJcIjtcclxuXHJcblxyXG5jb25zdCBjcmVhdGVHbG9iYWxDYWNoZVdyYXBwZXIgPSAoaGFuZGxlKSA9PiB7XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRoYXM6IChwcm9wZXJ0eSkgPT4ge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH0sXHJcblx0XHRnZXQ6IChwcm9wZXJ0eSkgPT4ge1xyXG5cdFx0XHRyZXR1cm4gaGFuZGxlXHJcblx0XHR9LFxyXG5cdFx0c2V0OiAocHJvcGVydHksIHZhbHVlKSA9PiB7XHRcdFx0XHJcblx0XHR9LFxyXG5cdFx0ZGVsZXRlOiAocHJvcGVydHkpID0+IHtcclxuXHRcdFx0ZGVsZXRlIEdMT0JBTFtwcm9wZXJ0eV07XHJcblx0XHR9LFxyXG5cdFx0a2V5czogKCkgPT4ge1xyXG5cdFx0XHRyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoR0xPQkFMKTtcclxuXHRcdH1cclxuXHR9XHRcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBDb250ZXh0IG9iamVjdCB0byBoYW5kbGUgZGF0YSBhY2Nlc3NcclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAY2xhc3MgUmVzb2x2ZXJDb250ZXh0SGFuZGxlXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNvbHZlckNvbnRleHRIYW5kbGUge1xyXG5cdC8qKiBAdHlwZSB7UHJveHl8bnVsbH0gKi9cclxuXHQjcHJveHkgPSBudWxsO1xyXG5cdC8qKiBAdHlwZSB7UmVzb2x2ZXJDb250ZXh0SGFuZGxlfG51bGx9ICovXHJcblx0I3BhcmVudCA9IG51bGw7XHJcblx0LyoqIEB0eXBlIHtvYmplY3R8bnVsbH0gKi9cclxuXHQjZGF0YSA9IG51bGw7XHJcblx0LyoqIEB0eXBlIHtNYXA8c3RyaW5nLFJlc29sdmVyQ29udGV4dEhhbmRsZT58bnVsbH0gKi9cclxuXHQjY2FjaGUgPSBudWxsO1xyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIENvbnRleHQuXHJcblx0ICpcclxuXHQgKiBAY29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGF0YVxyXG5cdCAqIEBwYXJhbSB7RXhwcmVzc2lvblJlc29sdmVyfSByZXNvbHZlclxyXG5cdCAqL1xyXG5cdGNvbnN0cnVjdG9yKGRhdGEsIHBhcmVudCkge1xyXG5cdFx0dGhpcy4jZGF0YSA9IGRhdGEgfHwge307XHJcblx0XHR0aGlzLiNwYXJlbnQgPSBwYXJlbnQgPyBwYXJlbnQgOiBudWxsO1xyXG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xyXG5cclxuXHRcdHRoaXMuI3Byb3h5ID0gbmV3IFByb3h5KHRoaXMuI2RhdGEsIHtcclxuXHRcdFx0aGFzOiAoZGF0YSwgcHJvcGVydHkpID0+IHtcclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiaGFzIHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuI2hhc1Byb3BlcnR5KHByb3BlcnR5KTtcclxuXHRcdFx0fSxcclxuXHRcdFx0Z2V0OiAoZGF0YSwgcHJvcGVydHkpID0+IHtcclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKFwiZ2V0IHByb3BlcnR5OlwiLCBwcm9wZXJ0eSk7XHJcblx0XHRcdFx0Y29uc3QgcHJveHkgPSB0aGlzLiNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSk7XHJcblx0XHRcdFx0cmV0dXJuIHByb3h5ID8gcHJveHkuI2dldFByb3BlcnR5KHByb3BlcnR5KSA6IHVuZGVmaW5lZDtcclxuXHRcdFx0fSxcclxuXHRcdFx0c2V0OiAoZGF0YSwgcHJvcGVydHksIHZhbHVlKSA9PiB7XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcInNldCBwcm9wZXJ0eTpcIiwgcHJvcGVydHksIFwiPVwiLCB2YWx1ZSk7XHJcblx0XHRcdFx0Y29uc3QgcHJveHkgPSB0aGlzLiNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSk7XHJcblx0XHRcdFx0aWYgKHByb3h5KSByZXR1cm4gcHJveHkuI3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSk7XHJcblx0XHRcdFx0ZWxzZSByZXR1cm4gdGhpcy4jc2V0UHJvcGVydHkocHJvcGVydHksIHZhbHVlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0ZGVsZXRlUHJvcGVydHk6IChkYXRhLCBwcm9wZXJ0eSkgPT4ge1xyXG5cdFx0XHRcdHJldHVybiB0aGlzLiNkZWxldGVQcm9wZXJ0eShwcm9wZXJ0eSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdG93bktleXM6IChkYXRhKSA9PiB7XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhcIm93bktleXNcIik7XHJcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gbmV3IFNldCgpO1xyXG5cdFx0XHRcdGxldCBwcm94eSA9IHRoaXM7XHJcblx0XHRcdFx0d2hpbGUgKHByb3h5KSB7XHJcblx0XHRcdFx0XHRmb3IgKGxldCBrZXkgb2YgcHJveHkuI2NhY2hlLmtleXMoKSkge1xyXG5cdFx0XHRcdFx0XHRyZXN1bHQuYWRkKGtleSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRwcm94eSA9IHByb3h5LiNwYXJlbnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBBcnJheS5mcm9tKHJlc3VsdCk7XHJcblx0XHRcdH0sXHJcblxyXG5cdFx0XHQvL0BUT0RPIG5lZWQgdG8gc3VwcG9ydCB0aGUgb3RoZXIgcHJveHkgYWN0aW9uc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAcmVhZG9ubHlcclxuXHQgKiBAdHlwZSB7UHJveHl9XHJcblx0ICovXHJcblx0Z2V0IHByb3h5KCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuI3Byb3h5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHJlYWRvbmx5XHJcblx0ICogQHR5cGUge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxyXG5cdCAqL1xyXG5cdGdldCBwYXJlbnQoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy4jcGFyZW50O1xyXG5cdH1cclxuXHJcblx0dXBkYXRlRGF0YShkYXRhKSB7XHJcblx0XHR0aGlzLiNkYXRhID0gZGF0YSB8fCB7fTtcclxuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcclxuXHR9XHJcblxyXG5cdG1lcmdlRGF0YShkYXRhKSB7XHJcblx0XHRpZih0eXBlb2YgZGF0YSAhPT0gJ29iamVjdCcgfHwgZGF0YSA9PSBudWxsKSByZXR1cm47XHJcblx0XHRPYmplY3QuYXNzaWduKHRoaXMuI2RhdGEsIGRhdGEpO1xyXG5cdFx0dGhpcy4jY2FjaGUgPSB0aGlzLiNpbml0UHJvcGVydHlDYWNoZSgpO1xyXG5cdH1cclxuXHJcblx0cmVzZXRDYWNoZSgpIHtcclxuXHRcdHRoaXMuI2NhY2hlID0gdGhpcy4jaW5pdFByb3BlcnR5Q2FjaGUoKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqXHJcblx0ICogQHJldHVybnMge01hcDxzdHJpbmcsUHJvcGVydHlEZWZpbml0aW9uPn1cclxuXHQgKi9cclxuXHQjaW5pdFByb3BlcnR5Q2FjaGUoKSB7XHJcblx0XHRjb25zdCBkYXRhID0gdGhpcy4jZGF0YTtcclxuXHRcdGlmKGRhdGEgPT0gR0xPQkFMKSBcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZUdsb2JhbENhY2hlV3JhcHBlcih0aGlzKTtcdFxyXG5cclxuXHRcdGNvbnN0IGNhY2hlID0gbmV3IE1hcCgpO1xyXG5cdFx0Zm9yIChsZXQgcHJvcGVydHkgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZGF0YSkpIGNhY2hlLnNldChwcm9wZXJ0eSwgdGhpcyk7XHJcblxyXG5cdFx0cmV0dXJuIGNhY2hlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5XHJcblx0ICogQHJldHVybnMge1Jlc29sdmVyQ29udGV4dEhhbmRsZXxudWxsfVxyXG5cdCAqL1xyXG5cdCNnZXRQcm9wZXJ0eURlZihwcm9wZXJ0eSkge1xyXG5cdFx0aWYgKHRoaXMuI2NhY2hlLmhhcyhwcm9wZXJ0eSkpIHJldHVybiB0aGlzLiNjYWNoZS5nZXQocHJvcGVydHkpO1xyXG5cdFx0bGV0IHBhcmVudCA9IHRoaXMuI3BhcmVudDtcclxuXHRcdHdoaWxlIChwYXJlbnQpIHtcclxuXHRcdFx0aWYgKHBhcmVudC4jY2FjaGUuaGFzKHByb3BlcnR5KSkgcmV0dXJuIHBhcmVudC4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcclxuXHRcdFx0cGFyZW50ID0gcGFyZW50LiNwYXJlbnQ7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdCNoYXNQcm9wZXJ0eShwcm9wZXJ0eSkge1xyXG5cdFx0cmV0dXJuIHRoaXMuI2dldFByb3BlcnR5RGVmKHByb3BlcnR5KSAhPSBudWxsO1xyXG5cdH1cclxuXHQjZ2V0UHJvcGVydHkocHJvcGVydHkpIHtcclxuXHRcdC8vQFRPRE8gd3JpdGUgdGVzdHMhISFcclxuXHRcdHJldHVybiB0aGlzLiNkYXRhW3Byb3BlcnR5XTtcclxuXHR9XHJcblx0I3NldFByb3BlcnR5KHByb3BlcnR5LCB2YWx1ZSkge1xyXG5cdFx0Ly9AVE9ETyB3b3VsZCBzdXBwb3J0IHRoaXMgYWN0aW9uIG9uIGFuIHByb3hpZWQgcmVzb2x2ZXIgY29udGV4dD8/PyB3cml0ZSB0ZXN0cyEhIVxyXG5cdFx0Y29uc29sZS5sb2coXCJzZXQgcHJvcGVydHkgZGF0YTpcIiwgcHJvcGVydHksIFwiPVwiLCB2YWx1ZSk7XHJcblx0XHR0aGlzLiNkYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xyXG5cdFx0dGhpcy4jY2FjaGUuc2V0KHByb3BlcnR5LCB0aGlzKTtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHQjZGVsZXRlUHJvcGVydHkocHJvcGVydHkpIHtcclxuXHRcdGNvbnN0IHByb3BlcnR5RGVmID0gdGhpcy4jY2FjaGUuZ2V0KHByb3BlcnR5KTtcclxuXHRcdGlmIChwcm9wZXJ0eURlZikge1xyXG5cdFx0XHRkZWxldGUgcHJvcGVydHlEZWYuZGF0YVtwcm9wZXJ0eV07XHJcblx0XHRcdHRoaXMuI2NhY2hlLmRlbGV0ZShwcm9wZXJ0eSk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IHJlZ2lzdHJhdGUgfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xyXG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcImNvbnRleHQtZGVjb25zdHJ1Y3Rpb24tZXhlY3V0ZXJcIjtcclxuXHJcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgc2l6ZTogNTAwMCB9KTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xyXG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XHJcbn07XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxyXG4gKi9cclxuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCwgY29udGV4dFByb3BlcnRpZXMpID0+IHtcclxuXHRjb25zdCBjb2RlID0gYFxyXG5yZXR1cm4gKGFzeW5jICh7JHtjb250ZXh0UHJvcGVydGllc319KSA9PiB7XHJcbiAgICB0cnl7XHJcbiAgICAgICAgcmV0dXJuICR7YVN0YXRlbWVudH1cclxuICAgIH1jYXRjaChlKXtcclxuICAgICAgICB0aHJvdyBlO1xyXG4gICAgfVxyXG59KShjb250ZXh0IHx8IHt9KTtgO1xyXG5cclxuXHQvL2NvbnNvbGUubG9nKFwiY29kZVwiLCBjb2RlKTtcclxuXHJcblx0cmV0dXJuIG5ldyBGdW5jdGlvbihcImNvbnRleHRcIiwgY29kZSk7XHJcbn07XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxyXG4gKi9cclxuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50LCBjb250ZXh0UHJvcGVydGllcykgPT4ge1xyXG5cdGNvbnN0IGNhY2hlS2V5ID0gYCR7Y29udGV4dFByb3BlcnRpZXN9Ojoke2FTdGF0ZW1lbnR9YDtcclxuXHRpZiAoRVhQUkVTU0lPTl9DQUNIRS5oYXMoY2FjaGVLZXkpKSB7XHJcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoY2FjaGVLZXkpO1xyXG5cdH1cclxuXHRjb25zdCBleHByZXNzaW9uID0gZ2VuZXJhdGUoYVN0YXRlbWVudCwgY29udGV4dFByb3BlcnRpZXMpO1xyXG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0KGNhY2hlS2V5LCBleHByZXNzaW9uKTtcclxuXHRyZXR1cm4gZXhwcmVzc2lvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxyXG4gKiBAcGFyYW0ge29iamVjdH0gYUNvbnRleHRcclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5mdW5jdGlvbiBleGVjdXRlcihhU3RhdGVtZW50LCBhQ29udGV4dCkge1xyXG5cdGNvbnN0IGNvbnRleHRQcm9wZXJ0aWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYUNvbnRleHQgfHwge30pLmpvaW4oXCIsIFwiKVx0O1xyXG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZXRPckNyZWF0ZUZ1bmN0aW9uKGFTdGF0ZW1lbnQsIGNvbnRleHRQcm9wZXJ0aWVzKTtcclxuXHRyZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dCk7XHJcbn07XHJcbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBleGVjdXRlcik7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBleGVjdXRlcjtcclxuIiwiaW1wb3J0IHsgcmVnaXN0cmF0ZSB9IGZyb20gXCIuLi9FeGVjdXRlclJlZ2lzdHJ5LmpzXCI7XHJcbmltcG9ydCBDb2RlQ2FjaGUgZnJvbSBcIi4uL0NvZGVDYWNoZS5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVYRUNVVEVSTkFNRSA9IFwiY29udGV4dC1vYmplY3QtZXhlY3V0ZXJcIjtcclxuY29uc3QgRVhQUkVTU0lPTl9DQUNIRSA9IG5ldyBDb2RlQ2FjaGUoeyBhU2l6ZTogNTAwMCB9KTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi4vQ29kZUNhY2hlLmpzJykuQ29kZUNhY2hlT3B0aW9uc30gb3B0aW9uc1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNldHVwRXhlY3V0ZXIgPSAob3B0aW9ucykgPT4ge1xyXG5cdEVYUFJFU1NJT05fQ0FDSEUuc2V0dXAob3B0aW9ucyk7XHJcbn07XHJcblxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxyXG4gKi9cclxuY29uc3QgZ2VuZXJhdGUgPSAoYVN0YXRlbWVudCkgPT4ge1xyXG5cdGNvbnN0IGNvZGUgPSBgXHJcbnJldHVybiAoYXN5bmMgKGN0eCkgPT4ge1xyXG4gICAgdHJ5e1xyXG4gICAgICAgIHJldHVybiAke2FTdGF0ZW1lbnR9XHJcbiAgICB9Y2F0Y2goZSl7XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxufSkoY29udGV4dCB8fCB7fSk7YDtcclxuXHJcblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XHJcblxyXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oXCJjb250ZXh0XCIsIGNvZGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhU3RhdGVtZW50XHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cclxuICovXHJcbmNvbnN0IGdldE9yQ3JlYXRlRnVuY3Rpb24gPSAoYVN0YXRlbWVudCkgPT4ge1xyXG5cclxuXHRjb25zdCBjYWNoZUtleSA9IGFTdGF0ZW1lbnQ7XHJcblxyXG5cdGlmIChFWFBSRVNTSU9OX0NBQ0hFLmhhcyhjYWNoZUtleSkpIHtcclxuXHRcdHJldHVybiBFWFBSRVNTSU9OX0NBQ0hFLmdldChjYWNoZUtleSk7XHJcblx0fVxyXG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcclxuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChjYWNoZUtleSwgZXhwcmVzc2lvbik7XHJcblx0cmV0dXJuIGV4cHJlc3Npb247XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnRcclxuICogQHBhcmFtIHtvYmplY3R9IGFDb250ZXh0XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gKi9cclxuZnVuY3Rpb24gZXhlY3V0ZXIoYVN0YXRlbWVudCwgYUNvbnRleHQpIHtcclxuXHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50KTtcclxuXHRyZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dCk7XHJcbn07XHJcbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBleGVjdXRlcik7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBleGVjdXRlcjtcclxuIiwiaW1wb3J0IHtyZWdpc3RyYXRlfSBmcm9tIFwiLi4vRXhlY3V0ZXJSZWdpc3RyeS5qc1wiO1xyXG5pbXBvcnQgQ29kZUNhY2hlIGZyb20gXCIuLi9Db2RlQ2FjaGUuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBFWEVDVVRFUk5BTUUgPSBcIndpdGgtc2NvcGVkLWV4ZWN1dGVyXCI7XHJcbmNvbnN0IEVYUFJFU1NJT05fQ0FDSEUgPSBuZXcgQ29kZUNhY2hlKHsgYVNpemU6IDUwMDAgfSk7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtpbXBvcnQoJy4uL0NvZGVDYWNoZS5qcycpLkNvZGVDYWNoZU9wdGlvbnN9IG9wdGlvbnNcclxuICovXHJcbmV4cG9ydCBjb25zdCBzZXR1cEV4ZWN1dGVyID0gKG9wdGlvbnMpID0+IHtcclxuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldHVwKG9wdGlvbnMpO1xyXG59O1xyXG5cclxubGV0IGluaXRpYWxDYWxsID0gdHJ1ZTtcclxuXHJcbi8qKlxyXG4gKiBcclxuICogQHBhcmFtIHtzdHJpbmd9IGFTdGF0ZW1lbnQgXHJcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cclxuICovXHJcbmNvbnN0IGdlbmVyYXRlID0gKGFTdGF0ZW1lbnQpID0+IHtcclxuY29uc3QgY29kZSA9IGBcclxuXHRyZXR1cm4gKGFzeW5jIChjb250ZXh0KSA9PiB7XHJcblx0XHR3aXRoKGNvbnRleHQpe1xyXG5cdFx0XHR0cnl7IFxyXG5cdFx0XHRcdHJldHVybiAke2FTdGF0ZW1lbnR9XHJcblx0XHRcdH1jYXRjaChlKXtcclxuXHRcdFx0XHR0aHJvdyBlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSkoY29udGV4dCB8fCB7fSk7XHJcbmA7XHJcblx0Ly9jb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSk7XHJcblxyXG5cdHJldHVybiBuZXcgRnVuY3Rpb24oXCJjb250ZXh0XCIsIGNvZGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudCBcclxuICogQHJldHVybnMge0Z1bmN0aW9ufVxyXG4gKi9cclxuY29uc3QgZ2V0T3JDcmVhdGVGdW5jdGlvbiA9IChhU3RhdGVtZW50KSA9PiB7XHJcblx0aWYgKEVYUFJFU1NJT05fQ0FDSEUuaGFzKGFTdGF0ZW1lbnQpKSB7XHJcblx0XHRyZXR1cm4gRVhQUkVTU0lPTl9DQUNIRS5nZXQoYVN0YXRlbWVudCk7XHJcblx0fVxyXG5cdGNvbnN0IGV4cHJlc3Npb24gPSBnZW5lcmF0ZShhU3RhdGVtZW50KTtcclxuXHRFWFBSRVNTSU9OX0NBQ0hFLnNldChhU3RhdGVtZW50LCBleHByZXNzaW9uKTtcclxuXHRyZXR1cm4gZXhwcmVzc2lvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gYVN0YXRlbWVudFxyXG4gKiBAcGFyYW0ge29iamVjdH0gYUNvbnRleHRcclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5mdW5jdGlvbiBleGVjdXRlcihhU3RhdGVtZW50LCBhQ29udGV4dCkge1xyXG5cdGlmKGluaXRpYWxDYWxsKXtcclxuXHRcdGluaXRpYWxDYWxsID0gZmFsc2U7XHJcblx0XHRjb25zb2xlLndhcm4obmV3IEVycm9yKGBXaXRoIFNjb3BlZCBleHByZXNzaW9uIGV4ZWN1dGlvbiBpcyBtYXJrZWQgYXMgZGVwcmVjYXRlZC5gKSk7XHJcblx0fVxyXG5cclxuXHRjb25zdCBleHByZXNzaW9uID0gZ2V0T3JDcmVhdGVGdW5jdGlvbihhU3RhdGVtZW50KTtcclxuXHRyZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dCk7XHJcbn07XHJcbnJlZ2lzdHJhdGUoRVhFQ1VURVJOQU1FLCBleGVjdXRlcik7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBleGVjdXRlcjtcclxuIiwiLy9pbXBvcnQgXCIuL0VzcHJpbWFFeGVjdXRlci5qc1wiO1xyXG5pbXBvcnQgXCIuL1dpdGhTY29wZWRFeGVjdXRlci5qc1wiO1xyXG5pbXBvcnQgXCIuL0NvbnRleHRPYmplY3RFeGVjdXRlci5qc1wiO1xyXG5pbXBvcnQgXCIuL0NvbnRleHREZWNvbnN0cnVjdG9yRXhlY3V0ZXIuanNcIjsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgRXhwcmVzc2lvblJlc29sdmVyLCBDb250ZXh0LCBFeGVjdXRlclJlZ2lzdHJ5IH0gZnJvbSBcIi4vaW5kZXguanNcIjtcclxuaW1wb3J0IEdMT0JBTCBmcm9tIFwiQGRlZmF1bHQtanMvZGVmYXVsdGpzLWNvbW1vbi11dGlscy9zcmMvR2xvYmFsXCI7XHJcblxyXG5HTE9CQUwuZGVmYXVsdGpzID0gR0xPQkFMLmRlZmF1bHRqcyB8fCB7fTtcclxuR0xPQkFMLmRlZmF1bHRqcy5lbCA9IEdMT0JBTC5kZWZhdWx0anMuZWwgfHwge1xyXG5cdFZFUlNJT046IFwiJHt2ZXJzaW9ufVwiLFxyXG5cdEV4cHJlc3Npb25SZXNvbHZlcixcclxuXHRFeGVjdXRlclJlZ2lzdHJ5XHJcbn07XHJcblxyXG5leHBvcnQgeyBFeHByZXNzaW9uUmVzb2x2ZXIsIEV4ZWN1dGVyUmVnaXN0cnkgfTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9