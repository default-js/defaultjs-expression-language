import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js";
import { isNullOrUndefined } from "@default-js/defaultjs-common-utils/src/ObjectUtils.js";

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
	while (!isNullOrUndefined(type)) {
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
export default class ResolverContextHandle {
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
		this.#data = isNullOrUndefined(context) ? null : context || {};
		this.#parent = parent ? parent : null;
		this.#providesData = !isNullOrUndefined(context);

		this.#cache = this.#initPropertyCache();

		if (GLOBAL === this.#data)
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
		this.#data = isNullOrUndefined(data) ? null : data || {};
		this.#providesData = !isNullOrUndefined(data);
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
		if (GLOBAL === data) 
			return createGlobalCacheWrapper(this);

		// every key JavaScript says the object carries, nothing filtered - which of them an executer
		// can put into its code is the executer's business (DECISIONS.md 2026-08-30, 2026-09-22)
		const cache = new Map();
		let type = data;
		while (!isNullOrUndefined(type)) {
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
