import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `syntax` - which JavaScript constructs an executer can run at all.
 * Read against SPECIFICATION.md 3.4 and 8.2.
 *
 * **Constants only.** A context name never appears in a case of this file: a construct carrying one
 * asks two questions at once - does it run, and does it still see the context - and a failure would
 * not say which. The second question is `context-scope`, which asks the same constructs again with a
 * name inside them.
 *
 * For three of the four executers this capability is nearly free, because they paste the statement
 * verbatim into a function body and anything legal in expression position runs. The one that can
 * fail here is `esprima`, which parses to an AST, rewrites it and generates code back.
 *
 * What is *not* here: the empty statement, which never reaches an executer, and `${}` as a whole -
 * both are 3.4 as far as the resolver is concerned and stay in the general suite.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("syntax", executer);

	describe(`Capability syntax - which constructs run [${executer}]`, () => {

		capabilityIt("evaluates an object literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ {a: 4}.a }")).toBe(4);
		});

		capabilityIt("evaluates an arrow function body", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (() => { return 3; })() }")).toBe(3);
		});

		capabilityIt("evaluates a template literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ `a${1 + 1}b` }")).toBe("a2b");
		});

		capabilityIt("evaluates a regular expression literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ /}/.source }")).toBe("}");
		});

		capabilityIt("evaluates a function expression", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (function () { return 3; })() }")).toBe(3);
		});

		capabilityIt("evaluates a class expression", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (class Named {}).name }")).toBe("Named");
		});

		// A class **field**, apart from the class expression above, because the two do not answer
		// alike: the executer that parses and regenerates the statement runs the class and fails on
		// the field. Verified against escodegen 2.1.0 directly on 2026-09-05 - it has no generator for
		// a `PropertyDefinition` node and raises `this[type] is not a function`, while a class with a
		// method regenerates cleanly. The limit is the code generator, not the rewrite.
		capabilityIt("evaluates a class field", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (class { static value = 7; }).value }")).toBe(7);
		});

		// A class expression as the constructor, so that `new` is asked without reaching for a global
		// - which is `global-scope` and a different question.
		capabilityIt("evaluates a new expression", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ new (class { constructor() { this.value = 7; } })().value }")).toBe(7);
		});

		capabilityIt("evaluates an array spread", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ [...[1, 2]].length }")).toBe(2);
		});

		capabilityIt("evaluates an object spread", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ {...{a: 1}}.a }")).toBe(1);
		});

		capabilityIt("evaluates an optional chain", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ ({a: 1})?.a }")).toBe(1);
		});

		capabilityIt("evaluates a nullish coalescing operator", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve('${ null ?? "fallback" }')).toBe("fallback");
		});

		capabilityIt("evaluates a logical operator", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ 1 && 2 }")).toBe(2);
		});

		capabilityIt("evaluates a ternary", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ true ? 1 : 2 }")).toBe(1);
		});

		capabilityIt("evaluates a comma sequence", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (1, 2) }")).toBe(2);
		});

		capabilityIt("evaluates typeof", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ typeof 1 }")).toBe("number");
		});

		// Against a class expression rather than a global constructor, for the same reason `new` is:
		// `instanceof` has a handler of its own in the esprima rewrite and is worth asking on its own.
		capabilityIt("evaluates instanceof against a class expression", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ ({}) instanceof (class {}) }")).toBe(false);
		});

		capabilityIt("evaluates the in operator", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve('${ "a" in {a: 1} }')).toBe(true);
		});

		capabilityIt("evaluates delete", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ delete ({a: 1}).a }")).toBe(true);
		});

		capabilityIt("evaluates an exponentiation", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ 2 ** 3 }")).toBe(8);
		});

		// **The assignments are the exception to "constants only"**, and they have to be: an
		// assignment needs a target, and a target is a binding. What they pin is whether the *form*
		// runs, asked through resolveText because a statement that does not compile leaves the
		// expression standing (7). Whether the value is there afterwards is `context-write`, and the
		// two answers are not the same - an executer can run `known = "after"` and lose it.
		capabilityIt("executes a statement carrying an assignment", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableName("known")} = "after"}`);
			expect(result).toBe("after");
		});

		capabilityIt("executes a compound assignment", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableName("known")} += "!"}`);
			expect(result).toBe("before!");
		});

		capabilityIt("executes an increment", async () => {
			const resolver = new ExpressionResolver({ context: { counter: 1 }, name: "root", executer });
			const result = await resolver.resolveText(`\${++${variableName("counter")}}`);
			expect(result).toBe("2");
		});

		// The one assignment form that needs no binding of its own: the target is a member of a
		// literal written in the statement.
		capabilityIt("executes a member assignment on an object literal", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ ({carried: 1}).carried = 2 }")).toBe(2);
		});

		// Every executer runs this form, and one of them runs it **past the context**: the esprima
		// rewrite does not walk into the elements of an array pattern, so the target stays a free
		// identifier and the sloppy assignment creates a global instead. The row is `yes` because the
		// form runs, which is what `syntax` asks - where the value lands is `context-write`, and that
		// the write escapes is a `global-scope` question and a `BACKLOG.md` entry. The name is deleted
		// here so the leak cannot reach another case.
		capabilityIt("executes a destructuring assignment", async () => {
			const resolver = new ExpressionResolver({ context: { destructured: "before" }, name: "root", executer });
			try {
				const result = await resolver.resolveText(`\${[${variableName("destructured")}] = ["hit"]}`);
				expect(result).toBe("hit");
			} finally {
				delete globalThis.destructured;
			}
		});

		// **The boundary of what a statement is.** A statement stands in expression position, so two
		// of them are not one statement. The row exists so the boundary is written down rather than
		// rediscovered - and note that an executer may answer here without raising: where the
		// generated body is `return <statement>`, `1; 2` parses as a return of 1 followed by a second
		// statement, and the answer is 1.
		capabilityIt("executes two statements separated by a semicolon", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ 1; 2 }")).toBe(2);
		});

		// Which mode the generated body runs in is observable, and it is what the containment of a
		// global write hangs on (6.5): in sloppy mode a bare function call has `globalThis` as its
		// receiver and an undeclared assignment creates a global, in strict mode neither happens. The
		// `with`-based executer cannot be strict at all - `with` is a syntax error there.
		capabilityIt("runs the statement in strict mode", async () => {
			const resolver = new ExpressionResolver({ context: {}, name: "root", executer });
			expect(await resolver.resolve("${ (function () { return this; })() }")).toBeUndefined();
		});
	});
}
