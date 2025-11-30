import {registrate} from "../ExecuterRegistry.js";

export const EXECUTERNAME = "with-scoped-executer";
const EXPRESSION_CACHE = new Map();
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
 * Description placeholder
 *
 * @param {string} aStatement
 * @param {object} aContext
 * @returns {Promise}
 */
function withScopedExecute (aStatement, aContext) {
	if(initialCall){
		initialCall = false;
		console.warn(new Error(`With Scoped expression execution is marked as deprecated.`));
	}

	const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
};
registrate(EXECUTERNAME, withScopedExecute);

export default withScopedExecute;
