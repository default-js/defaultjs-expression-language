import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERNAME } from "../../../src/executer/EsprimaExecuter.js";

/**
 * What `esprima-executer` answers where the catalogue marks a capability unsupported.
 *
 * The marker in the shared suite says only that the case does not pass. These say what happens
 * instead, and they are ordinary positive tests: the executer parses the statement to an AST and
 * rewrites every identifier it does not know onto `ctx`, which decides all three answers below.
 * Each one is written through `resolveText`, because a statement that raises leaves its expression
 * standing in the text (7) - that standing expression is what a consumer of this executer sees.
 *
 * This executer is experimental and is registered only when its module is imported explicitly. It
 * does not have to do everything the other three do; what it does is written down here so that a
 * change to it cannot pass unnoticed.
 */
describe(`Specification 8.3 - what esprima-executer answers instead [${EXECUTERNAME}]`, () => {

	// The rewrite leaves only the identifiers of RESERVED_NAMES alone, so `Math` becomes `ctx?.Math`
	// and the call raises - the global is not reachable at all. Marked as global/reachable
	// unsupported.
	it("leaves an expression reaching a global standing in the text", async () => {
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer: EXECUTERNAME });
		const result = await resolver.resolveText("${ Math.round(1.5) }");
		expect(result).toBe("${ Math.round(1.5) }");
	});

	// `x = 5` is rewritten to `ctx?.x = 5`, which is not valid JavaScript, so the statement does not
	// compile - the assignment never runs, wherever its value might have landed. Marked as
	// statement/assignment unsupported.
	it("leaves an assignment standing in the text", async () => {
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer: EXECUTERNAME });
		const result = await resolver.resolveText("${ x = 5 }");
		expect(result).toBe("${ x = 5 }");
	});

	// The rewrite leaves the identifiers of RESERVED_NAMES alone, `window` among them, so what a
	// bare `Math` cannot reach is reachable through it. Carried over from test/ExecuterTests/,
	// which pinned the same thing against a name planted on the global object.
	it("reaches a global through window", async () => {
		const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer: EXECUTERNAME });
		const result = await resolver.resolveText("${ window.Math.round(1.5) }");
		expect(result).toBe("2");
	});

	// The rewrite only sees the identifiers of the statement itself, so a name used inside a callback
	// stays a bare identifier and raises a ReferenceError at run time. Marked as
	// context/nested-function unsupported. The same expression answers "4,5" under the other three.
	it("leaves a context value read inside a nested function standing in the text", async () => {
		const resolver = new ExpressionResolver({ context: { count: 3 }, name: "root", executer: EXECUTERNAME });
		const expression = "${ [1, 2].map((value) => value + count).join() }";
		const result = await resolver.resolveText(expression);
		expect(result).toBe(expression);
	});
});
