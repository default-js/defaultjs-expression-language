import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";
import Executer from "../../../src/Executer.js";
import getExecuter from "../../../src/ExecuterRegistry.js";

/**
 * SPECIFICATION.md 8.2 - what an implementation can execute, asked of every executer.
 *
 * Which implementation is the default is a property of the resolver and is pinned once, in
 * `test/spec/`. That each implementation registers itself is a property of the implementation and is
 * asked of each of them here, although it needs no statement to see.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("8.2", executer);

	describe(`Specification 8.2 - what this implementation can execute [${executer}]`, () => {

		matrixIt("registers itself on import of its module", async () => {
			expect(getExecuter(executer) instanceof Executer).toBe(true);
		});

		// Asked through resolveText: where the assignment does not compile, the statement raises and
		// the expression stands as written (7). Where the value lands is 6.5 and a different case.
		matrixIt("executes a statement carrying an assignment", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			const result = await resolver.resolveText(`\${${variableName("known")} = "after"}`);
			expect(result).toBe("after");
		});
	});
}
