import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 4.2 - the constructor and the instance entry points.
 *
 * What an omitted context means (6.3, 6.4) and allowGlobalWrite (6.5) are deliberately not pinned
 * here: both are only observable through section 6 and both are carried in BACKLOG.md.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 4.2 - the instance entry points", () => {

	// The key exists and holds undefined, so the lookup succeeds and 4.4 applies. A key no link
	// carries would raise instead, which is section 7 and not what this test is about.
	it("resolve takes expression and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: undefined } });
		const result = await resolver.resolve(`\${ ${variableName("value")} }`, "fallback");
		expect(result).toBe("fallback");
	});

	it("resolveText takes text and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" } });
		const result = await resolver.resolveText(`a \${ ${variableName("value")} } b`, "fallback");
		expect(result).toBe("a resolved b");
	});

	it("takes the executer by its registered name", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" }, executer: ContextDeconstructorExecuterName });
		const result = await resolver.resolve("${ value }");
		// spelled bare on purpose: the executer is named in the call, so this is that executer's
		// dialect rather than the default one
		expect(result).toBe("resolved");
	});

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
		const resolver = new ExpressionResolver();
		const result = await resolver.resolve("${ 1 + 1 }");
		expect(result).toBe(2);
	});

	it("treats context: null as an empty context", async () => {
		const resolver = new ExpressionResolver({ context: null });
		const result = await resolver.resolve(`\${ typeof ${variableName("missing")} === "undefined" }`);
		expect(result).toBe(true);
	});
});
