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

		// **One case per global.** For three of the four a global is an ordinary free identifier and
		// the whole block below answers alike; the esprima executer decides name by name, because its
		// rewrite leaves alone only what `RESERVED_NAMES` lists and turns everything else into
		// `ctx?.name`. Where it does not reach one, the statement raises and the expression stands as
		// written (7) - a different answer, not an error the caller sees.
		capabilityIt("reaches the global Math", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolveText("${ Math.round(1.5) }")).toBe("2");
		});

		capabilityIt("reaches the global JSON", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ JSON.stringify(1) }")).toBe("1");
		});

		capabilityIt("reaches the global Date", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ Date.now() > 0 }")).toBe(true);
		});

		capabilityIt("reaches the global Promise", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve('${ await Promise.resolve("resolved") }')).toBe("resolved");
		});

		// The four `RESERVED_NAMES` carries by name, read through `.name` so that the case says
		// nothing but whether the identifier arrived.
		capabilityIt("reaches the global Object", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ Object.name }")).toBe("Object");
		});

		capabilityIt("reaches the global Array", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ Array.name }")).toBe("Array");
		});

		capabilityIt("reaches the global Map", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ Map.name }")).toBe("Map");
		});

		capabilityIt("reaches the global Set", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ Set.name }")).toBe("Set");
		});

		// `console` and `fetch` are the two the esprima rewrite treats through a second list
		// (`CALLEXPRESSION__RESERVED__CALLEES`), so they are worth a row apart from the four above.
		// Asked with `typeof` rather than by calling them: a case must not depend on the network, and
		// a case must not write to the console.
		capabilityIt("reaches the global console", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ typeof console }")).toBe("object");
		});

		capabilityIt("reaches the global fetch", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ typeof fetch }")).toBe("function");
		});

		capabilityIt("reaches the global document", async () => {
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			expect(await resolver.resolve("${ document.body.tagName }")).toBe("BODY");
		});

		// Not a builtin but a name the application put there - the shape a consumer of this package
		// actually meets, and the one a hand-written list of reserved names can never carry.
		capabilityIt("reaches a global the caller planted", async () => {
			const planted = `planted_${executer.replace(/-/g, "_")}`;
			globalThis[planted] = "from global";
			try {
				const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
				expect(await resolver.resolve(`\${ ${planted} }`)).toBe("from global");
			} finally {
				delete globalThis[planted];
			}
		});

		// The leak is read and cleaned up before the assertion, because a failing case stops at the
		// assertion and would otherwise leave the name on globalThis for every later test. Every case
		// below does the same, and each uses a name of its own so that one executer's leak cannot make
		// another one pass.
		capabilityIt("keeps a write to a name no resolver carries out of the global object", async () => {
			const leakName = `leaked_${executer.replace(/-/g, "_")}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${${variableName(leakName)} = 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			expect(leaked).toBe(false);
		});

		// The same write one function deeper. Not the same question: an executer that rewrites the
		// statement before running it sees the identifier at the top level and may not see it inside
		// a function body - and a callback is an ordinary thing to write in an expression.
		capabilityIt("keeps a write from inside a nested function out of the global object", async () => {
			const leakName = `leaked_nested_${executer.replace(/-/g, "_")}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${ (() => { ${variableName(leakName)} = 1; })() }`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			expect(leaked).toBe(false);
		});

		// A compound assignment reads before it writes, so an unknown name raises on the read and
		// never gets as far as creating anything. The row is here because that is a boundary worth
		// writing down rather than rediscovering: `x = 1` and `x += 1` do not leak alike.
		capabilityIt("keeps a compound assignment to an unknown name out of the global object", async () => {
			const leakName = `leaked_compound_${executer.replace(/-/g, "_")}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${${variableName(leakName)} += 1}`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			expect(leaked).toBe(false);
		});

		// Written through `globalThis` on purpose, and spelled the same under every executer because
		// `globalThis` is no context name. This is not the accidental leak the rows above are about -
		// it is a statement asking for the global object by name, and nothing here sandboxes it.
		capabilityIt("keeps an explicit write through globalThis out of the global object", async () => {
			const leakName = `leaked_explicit_${executer.replace(/-/g, "_")}`;
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			await resolver.resolveText(`\${ globalThis.${leakName} = 1 }`);
			const leaked = leakName in globalThis;
			delete globalThis[leakName];

			expect(leaked).toBe(false);
		});
	});
}
