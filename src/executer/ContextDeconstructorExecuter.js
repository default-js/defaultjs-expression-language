import { registrate } from "../ExecuterRegistry.js";
import Executer from "../Executer.js";
import CodeCache from "../CodeCache.js";
import GLOBAL from "@default-js/defaultjs-common-utils/src/Global.js";

let DEBUG = false;
export const EXECUTERNAME = "context-deconstruction-executer";
const EXPRESSION_CACHE = new CodeCache({ size: 5000 });
const blockedPropertyNames = new Set([
	"__proto__",
	"__defineGetter__",
	"__defineSetter__",
	"__lookupGetter__",
	"__lookupSetter__",
]);

const MAX_UNIQUE_NAME_RETRIES = 100;

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
	const result = Reflect.ownKeys(aContext).filter(
		(key) => !blockedPropertyNames.has(key),
	);

	if (result.length > 10)
		console.warn(
			`High count of properties at first level, can be decrease the performence! count: ${result.length}`,
		);
	return result;
};

const getOrCreateFunction = (aStatement, contextProperties) => {
	const cacheKey = `${aStatement.length}::${contextProperties.join(",")}::${aStatement}`;
	if (EXPRESSION_CACHE.has(cacheKey)) {
		return EXPRESSION_CACHE.get(cacheKey);
	}
	const expression = generate(aStatement, contextProperties);
	EXPRESSION_CACHE.set(cacheKey, expression);
	return expression;
};

/**
 * The generated function destructures the context into local bindings, runs the statement over
 * them, and carries back the ones the statement changed.
 *
 * **What decides that a binding changed is a comparison against the value it was declared with**,
 * not a property descriptor of the context: the context is the proxy of `ResolverContextHandle`,
 * whose `getOwnPropertyDescriptor` answers an accessor for every name, so `writable` is `undefined`
 * there and nothing would ever be written back. Comparing against the declared value rather than
 * re-reading the context also reads each name once instead of twice, and leaves a getter that
 * answers a fresh object on every read alone.
 *
 * **The comparison is the correctness half, not an optimization.** The destructuring pulls the
 * values of the whole chain into locals, so writing all of them back would copy every inherited
 * name into the context of the resolver the statement ran on and shadow the resolvers above it
 * from then on (SPECIFICATION.md 1.3, 6.5).
 *
 * **The second half of each guard, `(a === a || b === b)`, is the `NaN` test** - `x === x` is false
 * for `NaN` and for nothing else, and no global is used, because a context key can shadow any name
 * the generated code reaches for. Without it two `NaN` count as a change, since `NaN !== NaN`, and an
 * untouched one is carried into the context the statement ran on. `Object.is` would say the same in
 * one word and is not usable here: a context carrying a key called `Object` declares it as a binding
 * of this very function. Pinned by `carries no untouched NaN of an ancestor into the context it ran
 * on` in `test/executer/capabilities/context-write.Test.js`.
 *
 * The write-back stands in a `finally`, so a value written before the statement threw survives.
 *
 * @param {string} aStatement
 * @param {string[]} contextProperties
 * @returns {Function}
 */
const generate = (aStatement, contextProperties) => {
	const suffix = getUniqueSuffix(contextProperties);
	const contextName = `ctx${suffix}`;
	const code = `
return (async (${contextName}) => {
${contextProperties.map((prop) => `\tlet ${prop} = ${contextName}.${prop};
\tconst ${prop}_init${suffix} = ${prop};`).join("\n")}
    try{
       return ${aStatement}
    }catch(e){
        throw e;
    }finally{
${contextProperties.map((prop) => `\t\tif(${prop} !== ${prop}_init${suffix} && (${prop} === ${prop} || ${prop}_init${suffix} === ${prop}_init${suffix})) ${contextName}.${prop} = ${prop};`).join("\n")}
	}
})(context || {});`;

	if (DEBUG) console.log("genererated code: \n", code);

	return new Function("context", code);
};

function getRandomInt() {
	return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

/**
 * A suffix no name of the context ends with.
 *
 * The generated function declares bindings of its own - `ctx<suffix>` for the context, and
 * `<name>_init<suffix>` per context name for the value that name was declared with - and none of
 * them may be a name the statement can reach. The suffix keeps them apart from every context name,
 * and the `_init` marker keeps the two shapes apart from each other: without it a context carrying
 * a key called `ctx` would declare its own value binding under the name of the context itself.
 *
 * @param {string[]} propertyNames
 * @returns {string}
 */
const getUniqueSuffix = (propertyNames) => {
	for (let i = 0; i < MAX_UNIQUE_NAME_RETRIES; i++) {
		const suffix = `_${getRandomInt()}`;
		if (!propertyNames.some((name) => name.endsWith(suffix))) return suffix;
	}
	throw new Error(`Could not find a unique name suffix after ${MAX_UNIQUE_NAME_RETRIES} tries`);
};

const EXECUTER = new Executer({
	defaultContext: {},
	execution: (aStatement, aContext) => {
		const propertyNames = getPropertyNames(aContext);

		//const contextProperties = propertyNames.join(",");
		//const expression = getOrCreateFunction(aStatement, contextProperties);

		const expression = getOrCreateFunction(aStatement, propertyNames);
		return expression(aContext);
	},
});

registrate(EXECUTERNAME, EXECUTER);

export default EXECUTER;
