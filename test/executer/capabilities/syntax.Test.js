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

		// Asked through resolveText: where the assignment does not compile, the statement raises and
		// the expression stands as written (7). Where the value lands is `context-write`.
		capabilityIt("executes a statement carrying an assignment", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableName("known")} = "after"}`);
			expect(result).toBe("after");
		});
	});
}
