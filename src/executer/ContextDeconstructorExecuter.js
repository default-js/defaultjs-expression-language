import { registrate } from "../ExecuterRegistry.js";
import Executer from "../Executer.js";
import CodeCache from "../CodeCache.js";
import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js";

let DEBUG = true;
export const EXECUTERNAME = "context-deconstruction-executer";
const EXPRESSION_CACHE = new CodeCache({ size: 5000 });
const blockedPropertyNames = new Set([
	"__proto__",
	"__defineGetter__",
	"__defineSetter__",
	"__lookupGetter__",
	"__lookupSetter__"
]);

/**
 *
 * @param {boolean} value
 */
export const setDebug = (value) => {
	DEBUG = value;
};

/**
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 */
export const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

const getPropertyNames = (aContext) => {
	if (GLOBAL === aContext) return [];
	const result = Reflect.ownKeys(aContext).filter((key) => !blockedPropertyNames.has(key));
	

	if(result.length > 10)
		console.warn(`High count of properties at first level, can be decrease the performence! count: ${result.length}`);
	return result;
};



/**
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const getOrCreateFunction = (aStatement, contextProperties) => {
	const cacheKey = `${aStatement.length}::${aStatement}::${contextProperties}`;
	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement, contextProperties);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
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

const getOrCreateFunction2 = (aStatement, contextProperties) => {
	const cacheKey = `${aStatement.length}::${contextProperties.join(",")}::${aStatement}`;
	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate2(aStatement, contextProperties);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate2 = (aStatement, contextProperties) => {
	const code = `
return (async (ctx) => {
${contextProperties.map((prop) => `\tlet ${prop} = ctx.${prop};`).join("\n")}

    try{
       return ${aStatement}
    }catch(e){
        throw e;
    }finally{
		if(!Object.isFrozen(ctx)){
${contextProperties.map((prop) => `\t\t\tif(Object.getOwnPropertyDescriptor(ctx, '${prop}')?.writable) ctx.${prop} = ${prop};`).join("\n")}
		}
	}
})(context || {});`;

	if (DEBUG)
		console.log("genererated code: \n", code);

	return new Function("context", code);
};

const EXECUTER = new Executer({
	defaultContext: {},
	execution: (aStatement, aContext) => {
		const propertyNames = getPropertyNames(aContext);

		//const contextProperties = propertyNames.join(",");
		//const expression = getOrCreateFunction(aStatement, contextProperties);

		const expression = getOrCreateFunction2(aStatement, propertyNames);
		return expression(aContext);
	},
});




registrate(EXECUTERNAME, EXECUTER);

export default EXECUTER;
