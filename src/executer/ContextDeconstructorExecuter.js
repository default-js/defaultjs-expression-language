import { registrate } from "../ExecuterRegistry.js";
import { stringToHashcode } from "../Utils.js";

export const EXECUTERNAME = "context-deconstruction-executer";
const EXPRESSION_CACHE = new Map();
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
	const cacheKey = stringToHashcode(contextProperties + "::" + aStatement);
	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement, contextProperties);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 * Description placeholder
 *
 * @param {string} aStatement
 * @param {object} aContext
 * @returns {Promise}
 */
function execute(aStatement, aContext) {
	const contextProperties = Object.getOwnPropertyNames(aContext || {}).join(", ")	;
	const expression = getOrCreateFunction(aStatement, contextProperties);
	return expression(aContext);
};
registrate(EXECUTERNAME, execute);

export default execute;
