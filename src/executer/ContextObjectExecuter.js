import { registrate } from "../ExecuterRegistry.js";
import CodeCache from "../CodeCache.js";

export const EXECUTERNAME = "context-object-executer";
const EXPRESSION_CACHE = new CodeCache({ aSize: 5000 });

/**
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 */
export const setupExecuter = (options) => {
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
registrate(EXECUTERNAME, executer);

export default executer;
