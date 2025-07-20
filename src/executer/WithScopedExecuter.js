import {registrate} from "../ExecuterRegistry.js";

export const EXECUTERNAME = "with-scoped";
const EXPRESSION_CACHE = new Map();
let initialCall = true;

/**
 * 
 * @param {string} aStatement 
 * @returns {Function}
 */
const generate = (aStatement) => {
	return new Function(
		"context",
		`
return (async (context) => {
	try{ 
		with(context){
			 return ${aStatement}
		}
	}catch(e){
		throw e;
	}
})(context || {});`,
	);
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
