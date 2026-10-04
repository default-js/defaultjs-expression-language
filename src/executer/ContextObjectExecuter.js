import { register } from "../ExecuterRegistry.js";
import Executer from "../Executer.js";
import CodeCache from "../CodeCache.js";

/** The name this executer is registered under. */
export const EXECUTERNAME = "context-object-executer";
const EXPRESSION_CACHE = new CodeCache();
/** The name a statement addresses the context by. */
let CONTEXT_VAR = "ctx";

/**
 * Configures this executer: the size of its code cache and the name a statement addresses the
 * context by. An option left out changes nothing.
 *
 * @param {object} [options]
 * @param {number} [options.size] the size of the code cache, as `CodeCacheOptions` describes it in
 * `CodeCache.js`
 * @param {string} [options.contextVar] the name a statement addresses the context by, `ctx` until it
 * is set. It holds for every statement this executer runs from then on, whichever resolver hands it
 * over. Null, undefined and a string that is empty after trimming leave the name as it is. A name
 * that cannot be a parameter name is not rejected here: every statement then throws a `SyntaxError`.
 * @throws {TypeError} where the size is not a finite number, or the name is neither a string nor
 * null or undefined
 */
export const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
	CONTEXT_VAR = options?.contextVar == null || options?.contextVar.trim().length === 0 ? CONTEXT_VAR : options?.contextVar;
};

/**
 * The name a statement addresses the context by: `ctx`, or the one `setupExecuter` set last.
 *
 * @returns {string}
 */
export const getContextVar = () => CONTEXT_VAR;

/**
 * Compiles a statement into a function that hands the context over under the name a statement
 * addresses it by.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate = (aStatement) => {
	const code = `
return (async (${CONTEXT_VAR}) => {
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
 * The compiled function for a statement, from the cache or compiled now and cached.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const getOrCreateFunction = (aStatement) => {
	const cacheKey = `${CONTEXT_VAR}::${aStatement}`;

	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 * The executer: hands the context over as one object named `ctx`, or the name `setupExecuter` sets,
 * so a statement addresses a context value as `ctx.value` - see `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @type {Executer}
 */
const EXECUTER = new Executer({
	execution: (aStatement, aContext) => {
		const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
	},
});

register(EXECUTERNAME, EXECUTER);

export default EXECUTER;
