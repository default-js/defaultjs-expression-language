import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.5 - what a write from inside an expression may and may not do, asked of every
 * executer.
 *
 * Two cases, and the matrix tells them apart. The negative guarantee is a **rule**: while the switch
 * is off, a write to a name no resolver of the chain carries must not reach the global object - two
 * implementations break it and their cells say `defect`. Whether a write to a name the context
 * *does* carry can be read back afterwards is a **freedom**: 6.5 promises nothing about it, and the
 * two implementations that do not keep it say `no`.
 *
 * The switch itself is not implemented at all and is pinned once, in `test/spec/`.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the matrix, and the matrix decides whether it has to pass
	const matrixIt = casesOf("6.5", executer);

	describe(`Specification 6.5 - writing from inside an expression [${executer}]`, () => {

		// The leak is read and cleaned up before the assertion, because a failing case stops at the
		// assertion and would otherwise leave the name on globalThis for every later test.
		matrixIt("keeps a write to a name no resolver carries out of the global object", async () => {
			const leakName = `leaked_${executer.replace(/-/g, "_")}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${${variableName(leakName)} = 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			expect(leaked).toBe(false);
		});

		matrixIt("makes a write to a name the context carries readable afterwards", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			await resolver.resolveText(`\${${variableName("known")} = "after"}`);
			expect(resolver.getData("known")).toBe("after");
		});
	});
}
