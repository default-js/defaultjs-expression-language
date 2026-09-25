import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/EsprimaExecuter.js";

/**
 * EsprimaExecuter - which constructs run.
 *
 * Which JavaScript constructs a statement may use under this executer. Constants only, so that a
 * failure means the construct itself; whether the same construct still reaches a context value is
 * `context.Test.js`. The assignment forms are the exception, because an assignment needs a target.
 *
 * Every case goes through the parser, the rewrite and the code generator, and each construct is a
 * node type of its own there - which is why this executer is asked construct by construct.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("EsprimaExecuter - which constructs run", () => {

	it("evaluates an object literal", async () => {
		expect(await executer.execute("{a: 4}.a", {})).toBe(4);
	});

	it("evaluates an arrow function body", async () => {
		expect(await executer.execute("(() => { return 3; })()", {})).toBe(3);
	});

	it("evaluates a template literal", async () => {
		expect(await executer.execute("`a${1 + 1}b`", {})).toBe("a2b");
	});

	it("evaluates a regular expression literal", async () => {
		expect(await executer.execute("/}/.source", {})).toBe("}");
	});

	it("evaluates a function expression", async () => {
		expect(await executer.execute("(function () { return 3; })()", {})).toBe(3);
	});

	it("evaluates a class expression", async () => {
		expect(await executer.execute("(class Named {}).name", {})).toBe("Named");
	});

	it("evaluates a new expression", async () => {
		// a class expression as the constructor, so that no global is needed
		expect(await executer.execute("new (class { constructor() { this.value = 7; } })().value", {})).toBe(7);
	});

	it("evaluates an array spread", async () => {
		expect(await executer.execute("[...[1, 2]].length", {})).toBe(2);
	});

	it("evaluates an object spread", async () => {
		expect(await executer.execute("{...{a: 1}}.a", {})).toBe(1);
	});

	it("evaluates an optional chain", async () => {
		expect(await executer.execute("({a: 1})?.a", {})).toBe(1);
	});

	it("evaluates a nullish coalescing operator", async () => {
		expect(await executer.execute('null ?? "fallback"', {})).toBe("fallback");
	});

	it("evaluates a logical operator", async () => {
		expect(await executer.execute("1 && 2", {})).toBe(2);
	});

	it("evaluates a ternary", async () => {
		expect(await executer.execute("true ? 1 : 2", {})).toBe(1);
	});

	it("evaluates a comma sequence", async () => {
		expect(await executer.execute("(1, 2)", {})).toBe(2);
	});

	it("evaluates typeof", async () => {
		expect(await executer.execute("typeof 1", {})).toBe("number");
	});

	it("evaluates instanceof against a class expression", async () => {
		expect(await executer.execute("({}) instanceof (class {})", {})).toBe(false);
	});

	it("evaluates the in operator", async () => {
		expect(await executer.execute('"a" in {a: 1}', {})).toBe(true);
	});

	it("evaluates delete", async () => {
		expect(await executer.execute("delete ({a: 1}).a", {})).toBe(true);
	});

	it("evaluates an exponentiation", async () => {
		expect(await executer.execute("2 ** 3", {})).toBe(8);
	});

	it("executes a member assignment on an object literal", async () => {
		expect(await executer.execute("({carried: 1}).carried = 2", {})).toBe(2);
	});
});
