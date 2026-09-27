import { describe, it, expect, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import Executer from "../../src/Executer.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import TestExecuter from "../TestExecuter.js";
import { catchError } from "../TestUtils.js";

/**
 * ExpressionResolver - the constructor, the instance entry points, name and parent, and the options
 * the constructor rejects. SPECIFICATION.md 4.2, 5.1.
 *
 * What an omitted or a null context means is the handle's (6.3), and which resolvers provide one is
 * `chain-inspection.Test.js`.
 */

// answers the value the context carries under the statement - a lookup, not an evaluation
const lookup = () => new TestExecuter((aStatement, aContext) => aContext[aStatement]);

const previousDefault = ExpressionResolver.defaultExecuter;
afterAll(() => {
	ExpressionResolver.defaultExecuter = previousDefault;
});

describe("ExpressionResolver - the instance entry points", () => {

	// The key exists and holds undefined, so the lookup succeeds and 4.4 applies. The instance
	// resolveText takes its default the same way - `scope.Test.js` passes one where no resolver
	// carries the prefix.
	it("resolve takes expression and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: undefined }, executer: lookup() });
		const result = await resolver.resolve("${ value }", "fallback");
		expect(result).toBe("fallback");
	});

	// SPECIFICATION.md 4.2, as 4.1 has it for the static entry points: no statement ran, so the
	// default does not apply. It passed before the rule as well, with the TypeError `trim` raised on a
	// number; that it is the resolver's own rejection shows in errors.Test.js, where no warning names
	// a failed statement.
	it("resolve rejects an expression that is not a string, whatever default it carries", async () => {
		const resolver = new ExpressionResolver({ context: {}, executer: new TestExecuter() });
		const error = await catchError(() => resolver.resolve(42, "fallback"));
		expect(error instanceof TypeError).toBe(true);
	});

	it("resolveText rejects a text that is not a string", async () => {
		const resolver = new ExpressionResolver({ context: {}, executer: new TestExecuter() });
		const error = await catchError(() => resolver.resolveText(42));
		expect(error instanceof TypeError).toBe(true);
	});

	// Identity rather than an answer, like the cases below: the rule is which executer the resolver
	// holds, and a resolution would ask that executer to evaluate.
	it("takes the executer by its registered name", async () => {
		const resolver = new ExpressionResolver({ context: {}, executer: ContextDeconstructorExecuterName });
		expect(resolver.executer === getExecuter(ContextDeconstructorExecuterName)).toBe(true);
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

	// 5.1 holds a passed name to the rule of 3.3, which trims a prefix - so a name kept with its outer
	// whitespace could never be addressed.
	it("trims a name the caller passed", async () => {
		const resolver = new ExpressionResolver({ context: {}, name: " root " });
		expect(resolver.name).toBe("root");
	});
});

// SPECIFICATION.md 4.2, 5.1 - a mistake in the calling code is rejected where it is made, rather than
// answering as a resolver without a chain, over a context that is none, or under a name no prefix can
// address. Only the type of the error is pinned, not its message.
describe("ExpressionResolver - the constructor rejects what cannot mean an option", () => {

	it("throws a TypeError on a parent that is not a resolver", async () => {
		for (const parent of [{}, { name: "root", parent: null }, 42, "root"]) {
			const error = await catchError(() => new ExpressionResolver({ context: {}, parent }));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	it("throws a TypeError on a context that is a primitive, a falsy one included", async () => {
		for (const context of ["abc", 42, true, Symbol("context"), 1n, 0, "", false]) {
			const error = await catchError(() => new ExpressionResolver({ context }));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	it("throws a TypeError on a name carrying a character outside the rule of 3.3", async () => {
		for (const name of ["a.b", "a:b", "a/b", "Äpfel"]) {
			const error = await catchError(() => new ExpressionResolver({ context: {}, name }));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	// An empty name is a value that was passed, not a name left out - only null and undefined are.
	it("throws a TypeError on a name that is empty or whitespace only", async () => {
		for (const name of ["", "  "]) {
			const error = await catchError(() => new ExpressionResolver({ context: {}, name }));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	it("throws a TypeError on a name that is not a string", async () => {
		for (const name of [42, 0, true, {}]) {
			const error = await catchError(() => new ExpressionResolver({ context: {}, name }));
			expect(error instanceof TypeError).toBe(true);
		}
	});
});
