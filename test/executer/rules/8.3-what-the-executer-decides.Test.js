import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 8.3 - what an executer decides for itself, asked of every executer.
 *
 * What 8.3 leaves to the executer as a yes or no is a capability and runs from
 * `test/executer/CapabilityTest.js`, generated from the catalogue. What is left here holds under
 * every implementation, including the two halves of the dialect - it is not a yes or no, so it is
 * no row of the catalogue but the `variableName` of the executer entry, and both of its cases are
 * branched on that function so neither spelling can quietly stop being true.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	describe(`Specification 8.3 - what this executer decides for itself [${executer}]`, () => {

		it("addresses a context value the way its own dialect spells it", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${${variableNameValue}}`, "fallback");
			expect(result).toBe("from context");
		});

		// Asked through resolveText, because a bare name is a ReferenceError under the executer that
		// demands a prefix and resolve lets that through (7) - what is pinned here is the dialect,
		// not the error policy. The expression stands as written, which is what a failing statement
		// does in a text.
		const spellsBareName = variableName("value") === "value";
		it(`${spellsBareName ? "answers" : "does not answer"} a bare context name`, async () => {
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolveText("${ value }");
			expect(result).toBe(spellsBareName ? "from context" : "${ value }");
		});

		// However an executer reaches the global object - and whether it reaches it at all is a
		// capability - a name the context carries is answered from the context. That part is a rule,
		// so it stands here. Carried over from test/ExecuterTests/, where two executers pinned it
		// against a name planted on the global object.
		it("answers from the context where the global object carries the same name", async () => {
			const probe = `probe_${executer.replace(/-/g, "_")}`;
			globalThis[probe] = "from global";
			try {
				const resolver = new ExpressionResolver({ context: { [probe]: "from context" }, name: "root", executer });
				expect(await resolver.resolve(`\${${variableName(probe)}}`)).toBe("from context");
			} finally {
				delete globalThis[probe];
			}
		});

		// Reached through `window` rather than bare. Every executer answers this, including the one
		// that cannot reach a bare `Math` - `window` is one of the identifiers its rewrite leaves
		// alone - so it is a rule and not that executer's own behaviour. Verified against all four on
		// 2026-09-01 before it was moved here out of esprima-executer/OwnBehaviourTest.js.
		it("reaches a global through window", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolveText("${ window.Math.round(1.5) }")).toBe("2");
		});

		// A template literal inside the statement. It is a rule - every executer has to reach the
		// context through one - and it is a branch of its own in the esprima executer, which walks
		// into the expressions of the literal to rewrite the identifiers there. Carried over from
		// test/ExecuterTests/; without it that branch is the only line of the rewrite nothing runs.
		it("reads a context value from inside a template literal", async () => {
			const variableNameValue = variableName("value");
			const resolver = new ExpressionResolver({ context: { value: "from context" }, name: "root", executer });
			const result = await resolver.resolve(`\${ \`a\${${variableNameValue}}b\` }`);
			expect(result).toBe("afrom contextb");
		});

	});
}
