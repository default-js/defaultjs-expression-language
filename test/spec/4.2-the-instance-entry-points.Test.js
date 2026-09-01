import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import { useTestExecuter, answersFromContext, answerWith } from "../TestExecuter.js";
import Executer from "../../src/Executer.js";

/**
 * SPECIFICATION.md 4.2 - the constructor and the instance entry points.
 *
 * What an omitted context means (6.3, 6.4) and allowGlobalWrite (6.5) are deliberately not pinned
 * here: both are only observable through section 6 and both are carried in BACKLOG.md.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which context the resolver handed over, not what anybody computed
answersFromContext();

describe("Specification 4.2 - the instance entry points", () => {

	// The key exists and holds undefined, so the lookup succeeds and 4.4 applies. A key no link
	// carries would raise instead, which is section 7 and not what this test is about.
	it("resolve takes expression and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: undefined } });
		const result = await resolver.resolve("${ value }", "fallback");
		expect(result).toBe("fallback");
	});

	it("resolveText takes text and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" } });
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
		const executer = new Executer({ defaultContext: {}, execution: () => "from the instance" });
		const resolver = new ExpressionResolver({ context: {}, executer });
		expect(await resolver.resolve("${ anything }")).toBe("from the instance");
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
	// on 2026-08-30. What an omitted context then means is 6.3 and is not pinned here.
	it("takes no options at all", async () => {
		answerWith((aStatement) => aStatement);
		const resolver = new ExpressionResolver();
		expect(await resolver.resolve("${ anything }")).toBe("anything");
	});

	// An empty context is one that carries no name - which is what the lookup shows, without asking
	// anybody to evaluate a `typeof`.
	it("treats context: null as an empty context", async () => {
		const resolver = new ExpressionResolver({ context: null });
		expect(await resolver.resolve("${ missing }")).toBeUndefined();
	});
});
