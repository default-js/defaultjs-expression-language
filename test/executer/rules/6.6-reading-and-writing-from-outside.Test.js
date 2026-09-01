import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.6 - the data methods seen through a resolution, asked of every executer.
 *
 * 6.6 itself is pinned in `test/spec/`, where `getData` answers for what `mergeContext`,
 * `updateData` and `deleteData` did. This is the same rule from the other side: what an **expression**
 * answers after a value was written to one resolver of a chain, on that resolver and on the one
 * above it. It needs a statement, so it is asked of each implementation.
 *
 * Carried over on 2026-09-01 from `StackedContextTest.js`, which named two of the four executers by
 * hand. Its other three cases were resolutions over a chain and nothing else - 5.2 asks that of all
 * four already - and they were dropped rather than moved.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("6.6", executer);

	describe(`Specification 6.6 - reading and writing from outside [${executer}]`, () => {

		// mergeContext, not updateData: a filterless updateData changes the value where the key lives,
		// which is the parent here. Defining a key on this resolver and shadowing the parent from here
		// on is what mergeContext does.
		matrixIt("shadows a value of the parent until the shadowing key is deleted", async () => {
			const expression = `\${${variableName("test")}}`;
			const parent = new ExpressionResolver({ context: { test: "test" }, executer });
			const resolver = new ExpressionResolver({ context: {}, parent, executer });

			resolver.mergeContext({ test: "success" });
			expect(await resolver.resolve(expression)).toBe("success");
			expect(await parent.resolve(expression)).toBe("test");

			resolver.deleteData("test");
			expect(await resolver.resolve(expression)).toBe("test");
		});
	});
}
