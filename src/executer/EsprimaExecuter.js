//import * as esprima from "esprima";
import * as espree from "espree";
import escodegen from "escodegen";
import { registrate } from "../ExecuterRegistry.js";

export const EXECUTERNAME = "esprima";

let DEBUG = false;
export const setDebug = (value = true) => {
	DEBUG = value;
}

const CONTEXT_NAME = "ctx?.";

const RESERVED_NAMES = ["await", "async", "this", "undefined", "window", "Object", "Array", "Map", "Set", "fetch", "console", "instanceof", "typeof"];
const CALLEXPRESSION__RESERVED__CALLEES = ["fetch", "console"];
const BINARYEXPRESSION__RESERVED_NAMES = ["instanceof"];
const IGNORED_TYPES = new Set(["FunctionExpression", "ArrowFunctionExpression"]);
const TRAVERSABLE_PROPERTIES = ["body", "arguments", "argument", "expression", "callee", "params", "ast", "object", "left", "right"];

const TYPE_HANDLE_DEFAULT = (ast) => {
	for (let key of TRAVERSABLE_PROPERTIES) {
		traverse(ast[key]);
	}
};

const TYPE_HANDLES = new Map([
	[
		"TemplateLiteral",
		(ast) => {
			traverse(ast.expressions);
		},
	],
	[
		"CallExpression",
		(ast) => {
			const { callee } = ast;
			if (CALLEXPRESSION__RESERVED__CALLEES.includes(callee.name)) traverse(ast.arguments);
			else traverse([callee, ast.arguments]);
		},
	],
	[
		"BinaryExpression",
		(ast) => {
			const { operator, left, right } = ast;
			if (BINARYEXPRESSION__RESERVED_NAMES.includes(operator)) return traverse(left);
			else traverse([left, right]);
		},
	],
	[
		"MemberExpression",
		({ object }) => {
			traverse(object);
		},
	],
	[
		"Identifier",
		(ast) => {
			const { name } = ast;
			if (!RESERVED_NAMES.includes(name)) ast.name = `${CONTEXT_NAME}${name}`;
		},
	],
]);

const EXPRESSION_CACHE = new Map();

const traverse = function (ast) {
	if (ast == null) return;
	else if (ast instanceof Array) return ast.forEach((item) => traverse(item));
	else if (arguments.length > 1) return Array.from(arguments).forEach((item) => traverse(item));

	const { type } = ast;
	if (IGNORED_TYPES.has(type)) return;

	const handle = TYPE_HANDLES.get(type) || TYPE_HANDLE_DEFAULT;
	//console.log({ ast, type, handle });

	handle(ast);
};

/**
 *
 * @param {string} aStatement
 * @returns {Function}
 */
const generate = (aStatement) => {
	const source = `async function fn({ctx}){return (${aStatement})}`;
	//console.log("source", source);
	//const ast = esprima.parseModule(source, { tolerant: true });
	const ast = espree.parse(source, { tolerant: true, ecmaVersion: 16 });

	traverse(ast);
	const result = ast;
	const code = `	
	${escodegen.generate(result, {format: {compact: true}})};
	
	return fn({ctx:context});
`;
	if(DEBUG)
		console.log("code", code);

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
 *
 * @param {string} aStatement
 * @param {object} aContext
 * @returns {Promise}
 */
function esprimaExecute(aStatement, aContext) {
	const expression = getOrCreateFunction(aStatement);
	return expression(aContext);
}
registrate(EXECUTERNAME, esprimaExecute);

export default esprimaExecute;
