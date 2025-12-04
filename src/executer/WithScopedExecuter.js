import {registrate} from "../ExecuterRegistry.js";
import CodeCache from "../CodeCache.js";

export const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new CodeCache({ aSize: 5000 });

/**
 * @param {import('../CodeCache.js').CodeCacheOptions} options
 */
export const setupExecuter = (options) => {
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
registrate(EXECUTERNAME, executer);

export default executer;
