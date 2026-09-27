import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import Executer from "../../src/Executer.js";
import EsprimaExecuter from "../../src/executer/EsprimaExecuter.js";
import TestExecuter from "../TestExecuter.js";

/**
 * ExpressionResolver - the constructor, the instance entry points, name and parent.
 * SPECIFICATION.md 4.2, 5.1.
 *
 * What an omitted context means is pinned here only as far as the constructor decides it: the
 * resolver has none, whichever executer it runs. The lookup itself is the handle's.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - the instance entry points", () => {

	// Carried over from the time an executer offered a default context, and green before
	// defaultContext was removed: the constructor had stopped reading it already. EsprimaExecuter is
	// the one whose default was the global object, so it is the executer that would show a relapse.
	// Nothing is executed - getData reads the context the constructor built.
	it("gives a resolver built without a context none, whichever executer it runs", async () => {
		const resolver = new ExpressionResolver({ executer: EsprimaExecuter });
		expect(resolver.getData("document")).toBeUndefined();
		expect(resolver.effectiveChain).toBe("");
	});

	// The key exists and holds undefined, so the lookup succeeds and 4.4 applies.
	it("resolve takes expression and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: undefined }, executer: lookup() });
		const result = await resolver.resolve("${ value }", "fallback");
		expect(result).toBe("fallback");
	});

	it("resolveText takes text and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" }, executer: lookup() });
		const result = await resolver.resolveText("a ${ value } b", "fallback");
		expect(result).toBe("a resolved b");
	});

	it("takes the executer by its registered name", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" }, executer: ContextDeconstructorExecuterName });
		const result = await resolver.resolve("${ value }");
		// spelled bare on purpose: the executer is named in the call, so this is that executer's
		// dialect rather than the default one
		expect(result).toBe("resolved");
	});

	// An instance addresses an executer as unambiguously as a registered name does, and the static
	// setter of defaultExecuter has always taken one - the constructor used to drop it silently.
	it("takes an executer instance as well as a registered name", async () => {
		const executer = new Executer({ execution: () => "from the instance" });
		const resolver = new ExpressionResolver({ context: {}, executer });
		expect(await resolver.resolve("${ anything }")).toBe("from the instance");
	});

	// Identity rather than an answer: the rule is which executer the resolver holds, and whether it
	// then hands a statement to that executer is a different rule (9.1).
	it("takes the executer of its parent where the option is left out", async () => {
		const executer = new Executer({ execution: () => null });
		const parent = new ExpressionResolver({ context: {}, executer });
		const resolver = new ExpressionResolver({ context: {}, parent });
		expect(resolver.executer === executer).toBe(true);
	});

	it("takes the executer of its parent through the whole chain", async () => {
		const executer = new Executer({ execution: () => null });
		const root = new ExpressionResolver({ context: {}, executer });
		const middle = new ExpressionResolver({ context: {}, parent: root });
		const resolver = new ExpressionResolver({ context: {}, parent: middle });
		expect(resolver.executer === executer).toBe(true);
	});

	it("prefers an executer of its own over the one of its parent", async () => {
		const parent = new ExpressionResolver({ context: {}, executer: new Executer({ execution: () => null }) });
		const executer = new Executer({ execution: () => null });
		const resolver = new ExpressionResolver({ context: {}, parent, executer });
		expect(resolver.executer === executer).toBe(true);
	});

	it("takes the executer of its parent where the option is neither a name nor an instance", async () => {
		const executer = new Executer({ execution: () => null });
		const parent = new ExpressionResolver({ context: {}, executer });
		const resolver = new ExpressionResolver({ context: {}, parent, executer: 42 });
		expect(resolver.executer === executer).toBe(true);
	});

	it("takes the default executer where there is neither the option nor a parent", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		expect(resolver.executer === ExpressionResolver.defaultExecuter).toBe(true);
	});

	// An instance that is not registered is still usable; a *name* that is not registered is not,
	// because a name can only be resolved through the registry.
	it("throws on an executer name that is not registered", async () => {
		let error = null;
		try {
			new ExpressionResolver({ context: {}, executer: "no-such-executer" });
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	// The options object itself is optional. Without the parameter default of the constructor the
	// destructuring of a missing argument throws a TypeError, and no other case calls the
	// constructor bare - which is why the gate stayed green through both directions of that change
	// on 2026-08-30. Without options there is no executer to pass either, so the default is set.
	// What an omitted context then means is 6.3 and is not pinned here.
	it("takes no options at all", async () => {
		ExpressionResolver.defaultExecuter = new TestExecuter();
		const resolver = new ExpressionResolver();
		expect(await resolver.resolve("${ anything }")).toBe("anything");
	});

	// An empty context is one that carries no name - which is what the lookup shows, without asking
	// anybody to evaluate a `typeof`.
	it("treats context: null as an empty context", async () => {
		const resolver = new ExpressionResolver({ context: null, executer: lookup() });
		expect(await resolver.resolve("${ missing }")).toBeUndefined();
	});
});

describe("ExpressionResolver - name and parent", () => {

	it("keeps the name the caller passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: "root" });
		expect(resolver.name).toBe("root");
	});

	// The shape of a generated name is not specified - only that it is unique and obeys the
	// character rule of 3.3, so that it can appear in a chain path and be addressed like any
	// other. Uniqueness is the test below.
	it("generates a name where the caller passed none", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		expect(typeof resolver.name).toBe("string");
		expect(/^[a-zA-Z0-9\-_\s]+$/.test(resolver.name)).toBe(true);
	});

	it("generates a different name for every unnamed resolver", async () => {
		const first = new ExpressionResolver({ context: {} });
		const second = new ExpressionResolver({ context: {} });
		expect(first.name !== second.name).toBe(true);
	});

	it("answers null as the parent of a resolver that has none", async () => {
		const root = new ExpressionResolver({ context: {}, name: "root" });
		expect(root.parent).toBe(null);
	});

	it("points a resolver at its parent", async () => {
		const root = new ExpressionResolver({ context: {}, name: "root" });
		const leaf = new ExpressionResolver({ context: {}, name: "leaf", parent: root });
		expect(leaf.parent === root).toBe(true);
	});
});
