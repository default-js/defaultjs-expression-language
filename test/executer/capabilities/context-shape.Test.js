import { describe, expect } from "vitest";
import { ExpressionResolver } from "../../../index.js";
import { EXECUTERS, casesOf } from "../../ExecuterCapabilities.js";

/**
 * Capability `context-shape` - which structures an executer can run a statement over.
 * Read against SPECIFICATION.md 6.1.
 *
 * `SPECIFICATION.md` says nothing about what a context may be, so this table is what answers it: by
 * writing down what each implementation accepts rather than by a rule nobody wrote. Every
 * implementation reads a context in its own way - the deconstruction one reads all the names before
 * it runs anything, which is why the shape of a context can break it where it breaks nobody else.
 *
 * What the proxy does without a statement in play - that it is not the object handed in, that it
 * enumerates the chain, what it makes of a primitive - is resolver API and runs once, in
 * `test/spec/`.
 *
 * A statement that only has to survive the context is `${ 1 + 1 }`, which touches no name at all:
 * where it fails, the context broke the execution and not the statement.
 */

const argumentsObject = (function () {
	return arguments;
})("a", "b");

for (const { name: executer, variableName } of EXECUTERS) {

	// every case below is a row of the catalogue, and the catalogue decides whether it has to pass
	const capabilityIt = casesOf("context-shape", executer);

	describe(`Capability context-shape - what a context may be [${executer}]`, () => {

		capabilityIt("resolves over a context the caller froze", async () => {
			const resolver = new ExpressionResolver({ context: Object.freeze({ own: "frozen" }), name: "solo", executer });
			expect(await resolver.resolve(`\${ ${variableName("own")} }`)).toBe("frozen");
		});

		// A context may carry any key. The resolver filters none of them since 2026-08-30, so an
		// executer that turns names into code has to skip what it cannot express instead of failing
		// over it - see DECISIONS.md.
		capabilityIt("resolves over a context carrying a key that is not a variable name", async () => {
			const context = { known: "from context" };
			context["not-a-name"] = true;
			const resolver = new ExpressionResolver({ context, name: "root", executer });
			expect(await resolver.resolve(`\${${variableName("known")}}`)).toBe("from context");
		});

		capabilityIt("runs a statement over an array context", async () => {
			const resolver = new ExpressionResolver({ context: ["a", "b"], name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		capabilityIt("runs a statement over a Map context", async () => {
			const resolver = new ExpressionResolver({ context: new Map([["k", "v"]]), name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		capabilityIt("runs a statement over a Set context", async () => {
			const resolver = new ExpressionResolver({ context: new Set(["x"]), name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		capabilityIt("runs a statement over a NodeList context", async () => {
			const resolver = new ExpressionResolver({ context: document.querySelectorAll("body"), name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		// An arguments object carries `callee`, a poisoned accessor because the function it belongs to
		// is strict. Only an executer that reads the names of a context before running a statement
		// touches it, and destructuring `callee` calls the getter. Whether that executer has to survive
		// a context whose properties throw on access is open - see BACKLOG.md.
		capabilityIt("runs a statement over an arguments object as context", async () => {
			const resolver = new ExpressionResolver({ context: argumentsObject, name: "ctx", executer });
			expect(await resolver.resolve("${ 1 + 1 }")).toBe(2);
		});

		// The context of a template engine is a DOM node more often than not, and what a statement
		// reads off it sits on a prototype rather than on the node.
		capabilityIt("reads through an element context", async () => {
			const resolver = new ExpressionResolver({ context: document.createElement("div"), name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("children")}.length }`)).toBe(0);
		});

		// The indexed names of an array are dropped by the property cache because they are not
		// variable names, `length` is kept because it is one.
		capabilityIt("reads the length of an array context and ignores its indices", async () => {
			const resolver = new ExpressionResolver({ context: ["a", "b"], name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("length")} }`)).toBe(2);
		});

		capabilityIt("reads a named key of a context that also carries a numeric one", async () => {
			const resolver = new ExpressionResolver({ context: { 0: "zero", name: "named" }, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("name")} }`)).toBe("named");
		});

		// A Map keeps its entries inside itself rather than as properties, so no executer reaches
		// them - the name of an entry behaves like a name no resolver carries, which 7 and 8.3 cover.
		// What a context of that shape does offer is its prototype, and an accessor there is read
		// through the proxy with the context as its receiver.
		capabilityIt("reads an accessor of the prototype of a Map context", async () => {
			const resolver = new ExpressionResolver({ context: new Map([["entry", "value"]]), name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("size")} }`)).toBe(1);
		});

		capabilityIt("runs a statement over a context without a prototype", async () => {
			const context = Object.create(null);
			context.known = "from context";
			const resolver = new ExpressionResolver({ context, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		// The property cache keeps string keys only, so a symbol never reaches an executer that turns
		// names into code. What is pinned is that carrying one breaks nothing.
		capabilityIt("runs a statement over a context carrying a symbol key", async () => {
			const context = { known: "from context" };
			context[Symbol("marker")] = "from symbol";
			const resolver = new ExpressionResolver({ context, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		// `ctx` and `context` are the names the generated code uses for itself - the parameter of the
		// generated function and the argument of `new Function`. A context carrying either is a case
		// no implementation was designed against, and the collision is invisible until someone has a
		// key called `ctx`.
		capabilityIt("runs a statement over a context carrying a key named ctx", async () => {
			const resolver = new ExpressionResolver({ context: { ctx: "own ctx", known: "from context" }, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		capabilityIt("runs a statement over a context carrying a key named context", async () => {
			const resolver = new ExpressionResolver({ context: { context: "own context", known: "from context" }, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		// The property cache drops reserved words today, so no executer sees the key. The row is here
		// because that filter is what `BACKLOG.md` wants moved into the deconstructor - the day it
		// moves, this row is where the change shows.
		capabilityIt("runs a statement over a context carrying a key named like a reserved word", async () => {
			const resolver = new ExpressionResolver({ context: { class: "reserved", known: "from context" }, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		// Wider than the threshold the deconstructor warns at, and wide enough that its generated
		// prologue is one line per name.
		capabilityIt("runs a statement over a context carrying many keys", async () => {
			const context = { known: "from context" };
			for (let index = 0; index < 60; index++) context[`filler${index}`] = index;
			const resolver = new ExpressionResolver({ context, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		// The `arguments` row above is one instance of this, found in the wild; here the accessor is
		// planted, so the case says what the shape is rather than which object happens to have it.
		capabilityIt("reads a context value beside a getter that throws", async () => {
			const context = { known: "from context" };
			Object.defineProperty(context, "poisoned", {
				get: () => {
					throw new Error("this getter must not be read");
				},
				enumerable: true,
				configurable: true
			});
			const resolver = new ExpressionResolver({ context, name: "ctx", executer });
			expect(await resolver.resolve(`\${ ${variableName("known")} }`)).toBe("from context");
		});

		// The other half of the same property, and the one that costs on every execution rather than
		// only where a getter throws: an executer that reads all the names of a context before running
		// anything evaluates work nobody asked for. The proxy itself does not - it hands out a getter
		// in its descriptor rather than a value (6.2).
		capabilityIt("leaves a getter of the context unread when the statement does not touch it", async () => {
			let reads = 0;
			const context = { known: "from context" };
			Object.defineProperty(context, "counted", {
				get: () => {
					reads++;
					return "read";
				},
				enumerable: true,
				configurable: true
			});
			const resolver = new ExpressionResolver({ context, name: "ctx", executer });
			await resolver.resolve("${ 1 + 1 }");
			expect(reads).toBe(0);
		});
	});
}
