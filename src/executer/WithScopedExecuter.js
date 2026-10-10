import { register } from "../ExecuterRegistry.js";
import Executer from "../Executer.js";
import CodeCache from "../CodeCache.js";
import { undeclaredVarname } from "../Utils.js";

/** The name this executer is registered under. */
export const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new CodeCache();

const RESERVED_VARNAME = undeclaredVarname({ prefix: "$WSE_", suffix: "_WSE$", minLength: 32 });

/**
 * Configures the code cache of this executer. `size` is the only option
 * today; an option left out changes nothing.
 *
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 * @throws {TypeError} where the size is not a finite number
 */
export const setupExecuter = (options) => {
	EXPRESSION_CACHE.setup(options);
};

let initialCall = true;

/**
 * Compiles a statement into a function that runs it inside a `with` block over the context.
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate = (aStatement) => {
	const code = `
	return (async (${RESERVED_VARNAME}) => {
		with(${RESERVED_VARNAME}){
			try{
				return ${aStatement}
			}catch(e){
				throw e;
			}
		}
	})(${RESERVED_VARNAME} || {});
`;
	//console.log("code", code);

	return new Function(RESERVED_VARNAME, code);
};

/**
 * The compiled function for a statement, from the cache or compiled now and cached.
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
 * The executer: runs a statement inside a `with` block over the context, so a statement addresses a
 * context value by its bare name - see `README.md`. Registered under
 * `EXECUTERNAME` on import.
 *
 * @deprecated because `with` is; announces it on the first statement it runs
 * @type {Executer}
 */
const EXECUTER = new Executer({
	execution: (aStatement, aContext) => {
		if (initialCall) {
			initialCall = false;
			console.warn(
				new Error(`With Scoped expression execution is marked as deprecated.`),
			);
		}

		const expression = getOrCreateFunction(aStatement);
		return expression(aContext);
	},
});
register(EXECUTERNAME, EXECUTER);

export default EXECUTER;
