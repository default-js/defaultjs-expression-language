import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js";
import ExpressionResolver from "./ExpressionResolver";
import { isNullOrUndefined } from "@default-js/defaultjs-common-utils/src/ObjectUtils";


const VARNAME_CHECK = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;
const RESERVED_WORDS = new Set([
	"break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export",
	"extends", "finally", "for", "function", "if", "import", "in", "instanceof", "new", "return", "super", "switch",
	"this", "throw", "try", "typeof", "var", "void", "while", "with", "yield", "enum", "implements", "interface",
	"let", "package", "private", "protected", "public", "static", "await", "null", "true", "false", "constructor", "undefined"
]);

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
			delete GLOBAL[property];
		},
		keys: () => {
			return Object.getOwnPropertyNames(GLOBAL);
		}
	}	
}


/**
 * Context object to handle data access
 *
 * @export
 * @class ResolverContextHandle
 */
export default class ResolverContextHandle {
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
		if(data == GLOBAL) 
			return createGlobalCacheWrapper(this);	

		const cache = new Map();
		let type = data;
		while(!isNullOrUndefined(type)) {
			for (let name of Reflect.ownKeys(type)) {
				if(typeof name !== 'string')
					;//ignore non string property names
				else if(RESERVED_WORDS.has(name))
					;//ignore reserved words
				else if(!VARNAME_CHECK.test(name))	
					console.warn(`Variable name is illegal ${name}, variable irgnored!`);				
				else
					cache.set(name, this);					
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

	#hasProperty(property) {
		return this.#getPropertyDef(property) != null;
	}
	#getProperty(property) {
		//@TODO write tests!!!
		return this.#data[property];
	}
	#setProperty(property, value) {
		//@TODO would support this action on an proxied resolver context??? write tests!!!
		//console.log("set property data:", property, "=", value);
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
