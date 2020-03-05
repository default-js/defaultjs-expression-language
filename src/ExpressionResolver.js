import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js"
import ObjectProperty from "@default-js/defaultjs-common-utils/src/ObjectProperty.js";
import ObjectUtils from "@default-js/defaultjs-common-utils/src/ObjectUtils.js"
import DefaultValue from "./DefaultValue.js";

/*
 * 1 : resolver filter
 * 2 : resolver name
 * 3 : expression
 */
const EXPRESSION = /\$\{(([a-zA-Z0-9\-_\s]+)::)?([^\{\}]+)\}/;
const DEFAULT_NOT_DEFINED = new DefaultValue();
const toDefaultValue = value => {
	if (value instanceof DefaultValue)
		return value;

	return new DefaultValue(value);
};

const getFromChain = function(resolver, prop) {	
	while (resolver) {
		const context = resolver.context;
		if (context && prop in context)
			return { context, resolver, value: context[prop] };

		resolver = resolver.parent;
	}

	return { context: null, value: null };
};

const buildProxy = function(aResolver) {
	//@TODO support only the top level properties of resolver context -> is't required to support deep object structures??? answer: actual, no use case of deep structure support!		
	//@TODO write test cases!!!
	return new Proxy({}, {
		has : function(data, property) {
			//@TODO write tests!!!
			const { value } = getFromChain(aResolver, property);
			return !!value;
		}, 
		get: function(data, property) {
			//@TODO write tests!!!	
			const { value } = getFromChain(aResolver, property);
			return value;
		},
		set: function(data, property, value) {
			//@TODO would support this action on an proxied resolver context??? write tests!!!
			const { context, resolver} = getFromChain(aResolver, property);
			if(context)
				context[property] = value;
			else if(resolver.context)
				resolver.context[property] = value;
			else {
				resolve.context = {}
				resolve.context[property] = value;
			}			
		},
		deleteProperty: function(data, property) {
			//@TODO would support this action on an proxied resolver context??? write tests!!!		
			let { context, resolver} = getFromChain(aResolver, property);
			while(context){
				delete context[property];				
				const result = getFromChain(resolver, property);
				context = result.context;
				resolver = result.resolver;
			}
		}		
		//@TODO need to support the other proxy actions		
	});
};

const execute = function(aStatement, aContext) {
	if (typeof aStatement !== "string")
		return aStatement;
		
	const expression = new Function("context", `try{with(context){return ${aStatement}}}catch(e){throw e;}`);
	return expression(aContext);
};

const resolve = async function(aResolver, aExpression, aFilter, aDefault) {
	if (aFilter && aResolver.name != aFilter)
		return aResolver.parent ? resolve(aResolver.parent, aExpression, aFilter, aDefault) : null;
	
	const result = await execute(aExpression, aResolver.___proxy___);
	if (result !== null && typeof result !== "undefined")
		return result;

	else if (aDefault instanceof DefaultValue && aDefault.hasValue)
		return aDefault.value;

	return result;
};

const normalize = value => {
	if (value) {
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

export default class ExpressionResolver {
	constructor({ context = GLOBAL, parent = null, name = null }) {
		this.parent = (parent instanceof ExpressionResolver) ? parent : null;
		this.name = name;
		this.context = context;
		this.___proxy___ = buildProxy(this);
	}

	get chain() {
		return this.parent ? this.parent.chain + "/" + this.name : "/" + this.name;
	}

	get effectiveChain() {
		if (!this.context)
			return this.parent ? this.parent.effectiveChain : "";
		return this.parent ? this.parent.effectiveChain + "/" + this.name : "/" + this.name;
	}

	get contextChain() {
		const result = [];
		let resolver = this;
		while (resolver) {
			if (resolver.context)
				result.push(resolver.context);

			resolver = resolver.parent;
		}

		return result;
	}

	getData(key, filter) {
		if (!key)
			return;
		else if (filter && filter != this.name) {
			if (this.parent)
				this.parent.updateData(key, value, filter);
		} else {
			const property = ObjectProperty.load(this.context, key, false);
			return property ? property.value : null;
		}
	}

	updateData(key, value, filter) {
		if (!key)
			return;
		else if (filter && filter != this.name) {
			if (this.parent)
				this.parent.updateData(key, value, filter);
		} else {
			const property = ObjectProperty.load(this.context, key);
			property.value = value;
		}
	}

	mergeContext(context, filter) {
		if (filter && filter != this.name) {
			if (this.parent)
				this.parent.mergeContext(context, filter);
		} else {
			this.context = this.context ? ObjectUtils.merge(this.context, context) : context;
		}
	}

	async resolve(aExpression, aDefault) {
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		try {
			const match = EXPRESSION.exec(aExpression);
			if (match)
				return await resolve(this, match[3], normalize(match[2]), defaultValue);
			else
				return await resolve(this, normalize(aExpression), null, defaultValue);
		} catch (e) {
			console.error("error at executing statment\"", aExpression, "\":", e);
			return defaultValue.hasValue ? defaultValue.value : aExpression;
		}
	}

	async resolveText(aText, aDefault) {
		let text = aText;
		let temp = aText; // required to prevent infinity loop
		let match = EXPRESSION.exec(text);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED
		while (match != null) {
			const result = await this.resolve(match[0], defaultValue);
			temp = temp.split(match[0]).join(); // remove current match for next loop
			text = text.split(match[0]).join(typeof result === "undefined" ? "undefined" : (result == null ? "null" : result));
			match = EXPRESSION.exec(temp);
		}
		return text;
	}

	static async resolve(aExpression, aContext, aDefault, aTimeout) {
		const resolver = new ExpressionResolver({ context: aContext });
		const defaultValue = arguments.length > 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if (typeof aTimeout === "number" && aTimeout > 0)
			return new Promise(resolve => {
				setTimeout(() => {
					resolve(resolver.resolve(aExpression, defaultValue));
				}, aTimeout);
			});

		return resolver.resolve(aExpression, defaultValue)
	}

	static async resolveText(aText, aContext, aDefault, aTimeout) {
		const resolver = new ExpressionResolver({ context: aContext });
		const defaultValue = arguments.length > 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if (typeof aTimeout === "number" && aTimeout > 0)
			return new Promise(resolve => {
				setTimeout(() => {
					resolve(resolver.resolveText(aText, defaultValue));
				}, aTimeout);
			});

		return resolver.resolveText(aText, defaultValue);
	}
	
	static buildSecure({context, propFilter, option={deep:true}, name, parent}){
		context = ObjectUtils.filter({data: context, propFilter, option});
		return new ExpressionResolver({context, name, parent});
	}
};