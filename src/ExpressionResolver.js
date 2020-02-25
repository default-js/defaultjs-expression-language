import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js"
import ObjectProperty from "@default-js/defaultjs-common-utils/src/ObjectProperty.js"
import DefaultValue from "./DefaultValue.js";

/*
 * 1 : resolver filter
 * 2 : resolver name
 * 3 : expression
 */
const EXPRESSION = /\$\{(([a-zA-Z0-9\-_\s]+)::)?([^\{\}]+)\}/;
const DEFAULT_NOT_DEFINED = new DefaultValue();
const toDefaultValue = value => {
	if(value instanceof DefaultValue)
		return value;
	
	return new DefaultValue(value);
};


const execute = async function(aStatement, aContext) {
    if (typeof aStatement !== "string")
	    return aStatement;
    
    const expression = new Function("aContext", 
			`try{
				with(aContext) {
					return ${aStatement};
				}
			}catch(e){
				throw e;
			}`);
    
    return await expression(aContext);
};

const resolve = async function(aResolver, aExpression, aFilter, aDefault) {
	if(aFilter && aResolver.name != aFilter)
		return aResolver.parent ? resolve(aResolver.parent, aExpression, aFilter, aDefault) : null;
			
	let result = null;
	try {
		result = await execute(aExpression, aResolver.context);
	}catch(e){
		if(e instanceof ReferenceError && aResolver.parent !== null && !aFilter)
			result = await resolve(aResolver.parent, aExpression, aFilter, aDefault);
		else
			throw e;
	}
	if(result !== null && typeof result !== "undefined")
		return result;
	
	else if(aDefault instanceof DefaultValue && aDefault.hasValue)
		return aDefault.value;
	
	return result;
};

const normalize = value => {
	if(value){
		value = value.trim();
		return value.length == 0 ? null : value;
	}
	return null;
};

export default class ExpressionResolver {
	constructor({context = GLOBAL, parent = null, name = null}){
		this.parent = (parent instanceof ExpressionResolver) ? parent : null;
		this.name = name;
		this.context = context;
	}
	
	get chain(){
		return this.parent ? this.parent.chain + "/" + this.name : "/" + this.name;
	}
		
	async getData (key, filter) {
		if(!key)
			return;		
		else if(filter && filter != this.name)
			if(this.parent)
				this.parent.updateData(key, value, filter) ;
		else{
			const property = ObjectProperty.load(this.context, key, false);
			return property ? property.value : null;
		}			
	};
	
	async updateData (key, value, filter) {
		if(!key)
			return;		
		else if(filter && filter != this.name)
			if(this.parent)
				this.parent.updateData(key, value, filter) ;
		else{
			const property = ObjectProperty.load(this.context, key);
			property.value = value;
		}			
	};
	
	async resolve(aExpression, aDefault){
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		try{			
			const match = EXPRESSION.exec(aExpression);			
			if (match)
				 return await resolve(this, match[3], normalize(match[2]), defaultValue);
			else
				return await resolve(this, aExpression, null, defaultValue);
		}catch(e) {
			console.error("error at executing statment\"", aExpression, "\":",e);		
			return defaultValue.hasValue ? defaultValue.value : aExpression;
		}
	}
	
	async resolveText (aText, aDefault){
		let text = aText;
		let temp = aText; // required to prevent infinity loop
		let match = EXPRESSION.exec(text);
		const defaultValue = arguments.length == 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED
		while(match != null){		
			const result = await this.resolve(match[0], defaultValue);
			temp = temp.split(match[0]).join(); // remove current match for next loop
			text = text.split(match[0]).join(typeof result === "undefined" ? "undefined" : (result == null ? "null" : result));
			match = EXPRESSION.exec(temp);
		}
		return text;
	}
	
	static async resolve(aExpression, aContext, aDefault, aTimeout){
		const resolver = new ExpressionResolver({context: aContext});
		const defaultValue = arguments.length > 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if(typeof aTimeout === "number" && aTimeout > 0)
			return new Promise(resolve => {
				setTimeout(() => {
					resolve(resolver.resolve(aExpression, defaultValue));
				}, aTimeout);
			});
		
		return resolver.resolve(aExpression, defaultValue)
	}
	
	static async resolveText (aText, aContext, aDefault, aTimeout){
		const resolver = new ExpressionResolver({context: aContext});
		const defaultValue = arguments.length > 2 ? toDefaultValue(aDefault) : DEFAULT_NOT_DEFINED;
		if(typeof aTimeout === "number" && aTimeout > 0)
			return new Promise(resolve => {
				setTimeout(() => {
					resolve(resolver.resolveText(aText, defaultValue));
				}, aTimeout);
			});
		
		return resolver.resolveText(aText, defaultValue);
	}
};