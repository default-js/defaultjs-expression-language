import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `context-write` - whether a write from inside a statement is readable afterwards.
 * Read against SPECIFICATION.md 6.5.
 *
 * 6.5 promises nothing about a written value being readable, so an executer that loses a write says
 * `no` and is not wrong. What the facets separate is *what kind* of write survives: a plain one, a
 * counting one across two occurrences, one to a name only an ancestor carries, one made inside a
 * nested function, one made before the statement threw.
 *
 * **Two things are one question here, and they are asked apart.** Whether anything was written at
 * all, and *where* it landed. `getData` reads along the chain (5.2), so a value written on a leaf is
 * visible from the leaf and invisible from the root - which is how the ancestor pair below tells the
 * two apart. The proxy of `ResolverContextHandle` writes into the context of the resolver the
 * expression ran on (`set` trap), so under an executer whose assignments pass through it, a write to
 * an inherited name shadows the ancestor rather than changing it.
 *
 * Whether a write can be kept **out of the global object** is `global-scope`: that one is about a
 * name no resolver carries, this one about where the value lands when it is written.
 */

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("context-write", executer);

	/**
	 * A name that cannot collide with another case or another executer. Needed wherever a write can
	 * escape onto the global object instead of landing in the context: the case then cleans up after
	 * itself, and two executers leaking the same name cannot make each other pass.
	 */
	const escapingName = (aCase) => `written_${aCase}_${executer.replace(/-/g, "_")}`;

	describe(`Capability context-write - a write that persists [${executer}]`, () => {

		capabilityIt("makes a write to a name the context carries readable afterwards", async () => {
			const resolver = new ExpressionResolver({ context: { known: "before" }, name: "root", executer });
			await resolver.resolveText(`\${${variableName("known")} = "after"}`);
			expect(resolver.getData("known")).toBe("after");
		});

		// Two occurrences of one expression are two executions (4.3), so this asks whether the first
		// one left anything behind for the second - the shape Frank raised on 2026-08-30 when the
		// default executer moved.
		capabilityIt("counts across two occurrences of a counting write in one text", async () => {
			const counter = variableName("counter");
			const resolver = new ExpressionResolver({ context: { counter: 0 }, name: "root", executer });
			const result = await resolver.resolveText(`\${${counter}++} \${${counter}++}`);
			expect(result).toBe("0 1");
		});

		capabilityIt("makes a write to a name only an ancestor carries readable afterwards", async () => {
			const root = new ExpressionResolver({ context: { inherited: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { own: 1 }, name: "leaf", parent: root, executer });
			await leaf.resolveText(`\${${variableName("inherited")} = "changed"}`);
			expect(leaf.getData("inherited")).toBe("changed");
		});

		// **Passes trivially where the write does not persist at all** - read together with the row
		// above, which is the one that says whether anything was written. What it guards is the day an
		// executer starts persisting: 1.3 says a value further from the root never overwrites one
		// nearer to it, and the proxy keeps that by writing into the context of the resolver the
		// expression ran on.
		capabilityIt("leaves the ancestor untouched when writing a name it carries", async () => {
			const root = new ExpressionResolver({ context: { inherited: "from root" }, name: "root", executer });
			const leaf = new ExpressionResolver({ context: { own: 1 }, name: "leaf", parent: root, executer });
			await leaf.resolveText(`\${${variableName("inherited")} = "changed"}`);
			expect(root.getData("inherited")).toBe("from root");
		});

		capabilityIt("makes a write from inside a nested function readable afterwards", async () => {
			const name = escapingName("nested");
			const resolver = new ExpressionResolver({ context: { [name]: "before" }, name: "root", executer });
			try {
				await resolver.resolveText(`\${ (() => { ${variableName(name)} = "after"; })() }`);
				expect(resolver.getData(name)).toBe("after");
			} finally {
				delete globalThis[name];
			}
		});

		// The assignment happens, then the statement raises - a text leaves the failing expression
		// standing (7) and the question is whether the write before it survived. A write-back placed
		// in a `finally` keeps it, one placed after the return does not.
		capabilityIt("makes a write readable after the statement threw", async () => {
			const name = escapingName("threw");
			const resolver = new ExpressionResolver({ context: { [name]: "before" }, name: "root", executer });
			try {
				await resolver.resolveText(`\${ (${variableName(name)} = "after", missingOnPurpose.deep) }`);
				expect(resolver.getData(name)).toBe("after");
			} finally {
				delete globalThis[name];
			}
		});

		// The proxy writes through to the context in a module, which is strict mode, so an executer
		// whose assignment reaches the `set` trap raises rather than silently dropping the value.
		// Either way the key keeps what it had, which is what this pins.
		capabilityIt("leaves a non-writable key of the context unchanged", async () => {
			const context = {};
			Object.defineProperty(context, "fixed", { value: "before", writable: false, enumerable: true, configurable: false });
			const resolver = new ExpressionResolver({ context, name: "root", executer });
			await resolver.resolveText(`\${${variableName("fixed")} = "after"}`);
			expect(resolver.getData("fixed")).toBe("before");
		});

		capabilityIt("leaves a key of a frozen context unchanged", async () => {
			const resolver = new ExpressionResolver({ context: Object.freeze({ own: "frozen" }), name: "root", executer });
			await resolver.resolveText(`\${${variableName("own")} = "thawed"}`);
			expect(resolver.getData("own")).toBe("frozen");
		});

		// A mutation and a rebinding are not the same write: the first changes an object the context
		// and the statement both hold a reference to, the second replaces what the name is bound to.
		// Only the second needs the executer to carry anything back, which is why the two are apart.
		capabilityIt("makes a mutation of a context object visible afterwards", async () => {
			const resolver = new ExpressionResolver({ context: { holder: { name: "before" } }, name: "root", executer });
			await resolver.resolveText(`\${${variableName("holder")}.name = "after"}`);
			expect(resolver.getData("holder").name).toBe("after");
		});

		capabilityIt("makes a rebinding of a context name readable afterwards", async () => {
			const resolver = new ExpressionResolver({ context: { holder: { name: "before" } }, name: "root", executer });
			await resolver.resolveText(`\${${variableName("holder")} = {name: "rebound"}}`);
			expect(resolver.getData("holder").name).toBe("rebound");
		});

		// The boundary to `global-scope`: that capability asks whether such a write stays off the
		// global object, this one asks whether it arrives in the context instead. The two are not the
		// same fact - an executer that cannot run an assignment at all keeps the first and misses the
		// second.
		capabilityIt("makes a write to a name no resolver carries readable afterwards", async () => {
			const name = escapingName("unknown");
			const resolver = new ExpressionResolver({ context: { known: 1 }, name: "root", executer });
			try {
				await resolver.resolveText(`\${${variableName(name)} = "created"}`);
				expect(resolver.getData(name)).toBe("created");
			} finally {
				delete globalThis[name];
			}
		});
	});
}
