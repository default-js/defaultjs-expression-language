import * as esprima from "esprima";
import escodegen from "escodegen";

const RESERVED_NAMES = ["await", "async", "this", "undefined", "Object", "Array", "Map", "Set", "fetch", "console", "instanceof", "typeof"];
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
    ["TemplateLiteral", (ast) => {
        traverse(ast.expressions);
    }],
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
			if (!RESERVED_NAMES.includes(name)) ast.name = `this.${name}`;
		},
	],
]);

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
	const source = `async function fn(){return (${aStatement})}`;
	//console.log("source", source);
	const ast = esprima.parseScript(source, { tolerant: true });

	traverse(ast);
	const result = ast;
	const code = escodegen.generate(result);
	//console.log("code", code);

	return new Function(
		"context",
		`
${code};
return fn.call(context || {});
		`,
	);
};

export default generate;
