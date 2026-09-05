import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `context-write` - whether a write from inside a statement is readable afterwards.
 * Read against SPECIFICATION.md 6.5.
 *
 * 6.5 promises nothing about a written value being readable, so the two implementations that do not
 * keep it say `no` and neither answer is wrong. Where the value lands when it *is* kept, and where it
 * lands when the name belongs to a link further up the chain, is what the facets of stage 1 add.
 *
 * Whether a write can be kept **out of the global object** is a different question and belongs to
 * `global-scope`: that one is about a name no resolver carries, this one about a name the context
 * has.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("context-write", executer);

	describe(`Capability context-write - a write that persists [${executer}]`, () => {

		capabilityIt("makes a write to a name the context carries readable afterwards", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			await resolver.resolveText(`\${${variableName("known")} = "after"}`);
			expect(resolver.getData("known")).toBe("after");
		});
	});
}
