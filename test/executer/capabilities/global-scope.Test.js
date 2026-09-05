import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `global-scope` - which globals a statement reaches, and whether a write to a name no
 * resolver carries can be contained. Read against SPECIFICATION.md 6.4, 6.5 and 8.3.
 *
 * Both halves are the executer's own, and 8.3 says so for both: how a statement reaches the global
 * object, and whether a write can be caught. The containment carried the label `defect` until
 * 2026-09-05, when it became a capability like the rest - `SPECIFICATION.md` 6.5 promised something
 * the package cannot keep for every implementation, so the document is what gets corrected.
 *
 * That a name the context carries wins over a global of the same name is not here: that is
 * `context-scope`, because it is about reaching the context, not the global object.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("global-scope", executer);

	describe(`Capability global-scope - the global object from a statement [${executer}]`, () => {

		// Reached through `window` rather than bare. Every executer answers this, including the one
		// that cannot reach a bare `Math` - `window` is one of the identifiers its rewrite leaves
		// alone - so the two cases are not the same question asked twice.
		capabilityIt("reaches a global through window", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolveText("${ window.Math.round(1.5) }")).toBe("2");
		});

		// Where the executer does not reach the global, the statement raises and the expression stands
		// as written (7) - a different answer, not an error the caller sees.
		capabilityIt("reaches a global that no resolver carries", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolveText("${ Math.round(1.5) }")).toBe("2");
		});

		// The leak is read and cleaned up before the assertion, because a failing case stops at the
		// assertion and would otherwise leave the name on globalThis for every later test.
		capabilityIt("keeps a write to a name no resolver carries out of the global object", async () => {
			const leakName = `leaked_${executer.replace(/-/g, "_")}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${${variableName(leakName)} = 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			expect(leaked).toBe(false);
		});
	});
}
