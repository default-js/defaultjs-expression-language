import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import { catchError } from "../TestUtils.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as WithScopedExecuterName } from "../../src/executer/WithScopedExecuter.js";

/**
 * What the executers do with a context that is not a plain object.
 *
 * Written 2026-08-30 out of the global-context work: `ContextDeconstructorExecuter` builds a
 * destructuring pattern from the names of a context, so a name that is not a variable name breaks
 * the generated code. The question behind that one case is the general one this file answers -
 * which shapes of context reach that pattern, and what the other three executers make of the same
 * input.
 *
 * `SPECIFICATION.md` does not say what a context may be, so nothing here is a conformance test: it
 * describes what the code does today. Where the behaviour looks like a defect rather than a
 * decision, the test carries a comment and `BACKLOG.md` carries the question - a `fails` marker
 * would claim a rule exists.
 *
 * Every statement that only has to survive the context is `${ 1 + 1 }`, which touches no name at
 * all. Where it fails, the context broke the execution, not the statement.
 */

const argumentsObject = (function () {
	return arguments;
})("a", "b");

for (const { name: executer, variableName } of EXECUTERS) {
	describe(`general: context shapes [${executer}]`, () => {

		it("runs a statement over an array context", async () => {
			const resolver = new ExpressionResolver({ context: ["a", "b"], name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		it("runs a statement over a Map context", async () => {
			const resolver = new ExpressionResolver({ context: new Map([["k", "v"]]), name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		it("runs a statement over a Set context", async () => {
			const resolver = new ExpressionResolver({ context: new Set(["x"]), name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		// The context of a template engine is a DOM node more often than not, and what a statement
		// reads off it sits on a prototype rather than on the node. Carried over from
		// test/ExecuterTests/, which pinned it under one executer.
		it("runs a statement over an element context and reads through it", async () => {
			const resolver = new ExpressionResolver({ context: document.createElement("div"), name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("children")}.length }`)).toBe(0);
		});

		it("runs a statement over a NodeList context", async () => {
			const resolver = new ExpressionResolver({ context: document.querySelectorAll("body"), name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		// The indexed names of an array are dropped by the property cache because they are not
		// variable names, `length` is kept because it is one. That filter is what keeps an indexed
		// context out of the destructuring pattern.
		it("reads the length of an array context and ignores its indices", async () => {
			const resolver = new ExpressionResolver({ context: ["a", "b"], name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("length")} }`)).toBe(2);
		});

		it("reads a named key of a context that also carries a numeric one", async () => {
			const resolver = new ExpressionResolver({ context: { 0: "zero", name: "named" }, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("name")} }`)).toBe("named");
		});

		// A Map keeps its entries inside itself rather than as properties, so no executer reaches
		// them - the name of an entry behaves like a name no link carries, which section 7 and 8.3
		// cover. What a context of that shape does offer is its prototype, and an accessor there is
		// read through the proxy with the context as its receiver.
		it("reads an accessor of the prototype of a Map context", async () => {
			const resolver = new ExpressionResolver({ context: new Map([["entry", "value"]]), name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("size")} }`)).toBe(1);
		});
	});
}

describe("general: context shapes - where the executers differ", () => {

	// An arguments object carries `callee`, which is a poisoned accessor since the function it
	// belongs to is strict. Only the deconstruction executer touches it, because only it reads the
	// names of a context before it runs a statement - and destructuring `callee` calls the getter.
	// Open question in BACKLOG.md: whether that executer has to survive a context whose properties
	// throw on access.
	it("an arguments object as context is fine until it is destructured", async () => {
		const scoped = new ExpressionResolver({ context: argumentsObject, name: "ctx", executer: WithScopedExecuterName });
		expect(await scoped.resolve("${ 1 + 1 }")).toBe(2);

		const deconstructed = new ExpressionResolver({ context: argumentsObject, name: "ctx", executer: ContextDeconstructorExecuterName });
		const error = await catchError(() => deconstructed.resolve("${ 1 + 1 }"));
		expect(error instanceof Error).toBe(true);
	});
});

describe("general: context shapes - a context that is not an object", () => {

	// `data || {}` in the constructor of ResolverContextHandle turns a falsy context into an empty
	// one, so `0`, `""` and `false` build a resolver over an empty context...
	it("takes a falsy primitive as an empty context", async () => {
		for (const context of [0, "", false]) {
			const resolver = new ExpressionResolver({ context, name: "ctx" });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		}
	});

	// ...while a truthy one reaches `Reflect.ownKeys`, which only takes objects. The resolver
	// therefore throws at construction, with an error from inside the property cache rather than
	// one that names the mistake. Only that it throws is pinned here; the message is not, so a
	// decision to reject a primitive properly keeps this test green.
	// Open question in BACKLOG.md: reject, coerce, or ignore.
	it("throws on a truthy primitive as context", async () => {
		for (const context of ["abc", 42, true]) {
			const error = await catchError(() => new ExpressionResolver({ context, name: "ctx" }));
			expect(error instanceof Error).toBe(true);
		}
	});
});
