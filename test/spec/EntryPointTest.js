import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { catchError } from "../TestUtils.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName } from "../../src/executer/ContextDeconstructorExecuter.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * Conformance tests for SPECIFICATION.md section 4 - entry points.
 *
 * Like the syntax suite, this one runs against whatever ExpressionResolver.defaultExecuter is:
 * section 8.3 leaves the executer only the way a statement reaches the global object and whether a
 * write can be intercepted, and neither of those is an entry point rule.
 *
 * Two rules of section 4 are deliberately not pinned here, because they are only observable
 * through section 6 and both are carried in `BACKLOG.md`: allowGlobalWrite as the fifth positional
 * argument and as a configuration key (6.5), and an omitted context taking the default context of
 * the executer in use (6.3, 6.4).
 *
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and not part of
 * any rule here. Statements over literals are written as they stand.
 */
const { variableName } = defaultExecuterEntry();

describe("Specification 4.1 - the static entry points, positional form", () => {

	it("resolve takes expression and context positionally", async () => {
		const result = await ExpressionResolver.resolve(`\${ ${variableName("value")} }`, { value: "resolved" });
		expect(result).toBe("resolved");
	});

	it("resolveText takes text and context positionally", async () => {
		const result = await ExpressionResolver.resolveText(`a \${ ${variableName("value")} } b`, { value: "resolved" });
		expect(result).toBe("a resolved b");
	});

	it("decides the call form by the first argument alone, so a context may carry a key named context", async () => {
		const result = await ExpressionResolver.resolve(`\${ ${variableName("context")}.value }`, { context: { value: "resolved" } });
		expect(result).toBe("resolved");
	});
});

describe("Specification 4.1 - the static entry points, configuration form", () => {

	// not implemented, waits for BACKLOG.md "The static entry points take no configuration object"
	it.fails("resolve takes a configuration object", async () => {
		const result = await ExpressionResolver.resolve({ expression: `\${ ${variableName("value")} }`, context: { value: "resolved" } });
		expect(result).toBe("resolved");
	});

	// not implemented, waits for BACKLOG.md "The static entry points take no configuration object"
	it.fails("resolveText takes a configuration object carrying the text", async () => {
		const result = await ExpressionResolver.resolveText({ text: `a \${ ${variableName("value")} } b`, context: { value: "resolved" } });
		expect(result).toBe("a resolved b");
	});

	// not implemented, waits for BACKLOG.md "The static entry points take no configuration object"
	it.fails("carries the default value under the key defaultValue", async () => {
		const result = await ExpressionResolver.resolve({ expression: `\${ ${variableName("missing")} }`, context: {}, defaultValue: "fallback" });
		expect(result).toBe("fallback");
	});

	// not implemented, waits for BACKLOG.md "The static entry points take no configuration object"
	it.fails("carries the timeout under the key timeout", async () => {
		const start = Date.now();
		const result = await ExpressionResolver.resolve({ expression: `\${ ${variableName("value")} }`, context: { value: "resolved" }, timeout: 100 });
		expect(result).toBe("resolved");
		expect(Date.now() - start >= 90).toBe(true);
	});

	// "a default value was passed" is the presence of the key defaultValue, independent of what it
	// holds. That the key is honoured is shown above; that defaultValue: undefined counts as passed
	// cannot be told from the outside - the answer is undefined either way. No test claims it.
});

describe("Specification 4.2 - the instance entry points", () => {

	// The key exists and holds undefined, so the lookup succeeds and 4.4 applies. A key no link
	// carries would raise instead, which is section 7 and not what this test is about.
	it("resolve takes expression and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: undefined } });
		const result = await resolver.resolve(`\${ ${variableName("value")} }`, "fallback");
		expect(result).toBe("fallback");
	});

	it("resolveText takes text and default positionally", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" } });
		const result = await resolver.resolveText(`a \${ ${variableName("value")} } b`, "fallback");
		expect(result).toBe("a resolved b");
	});

	it("takes the executer by its registered name", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" }, executer: ContextDeconstructorExecuterName });
		const result = await resolver.resolve("${ value }");
		// spelled bare on purpose: the executer is named in the call, so this is that executer's
		// dialect rather than the default one
		expect(result).toBe("resolved");
	});

	it("throws on an executer name that is not registered", async () => {
		let error = null;
		try {
			new ExpressionResolver({ context: {}, executer: "no-such-executer" });
		} catch (e) {
			error = e;
		}
		expect(error != null).toBe(true);
	});

	// The options object itself is optional. Without the parameter default of the constructor the
	// destructuring of a missing argument throws a TypeError, and no other case calls the
	// constructor bare - which is why the gate stayed green through both directions of that change
	// on 2026-08-30. What an omitted context then means is 6.3 and is not pinned here.
	it("takes no options at all", async () => {
		const resolver = new ExpressionResolver();
		const result = await resolver.resolve("${ 1 + 1 }");
		expect(result).toBe(2);
	});

	it("treats context: null as an empty context", async () => {
		const resolver = new ExpressionResolver({ context: null });
		const result = await resolver.resolve(`\${ typeof ${variableName("missing")} === "undefined" }`);
		expect(result).toBe(true);
	});
});

describe("Specification 4.3 - resolve answers a value, resolveText answers a text", () => {

	it("resolve keeps the type of the result", async () => {
		const result = await ExpressionResolver.resolve("${ 1 + 1 }", {});
		expect(result).toBe(2);
	});

	it("resolve answers an object as an object", async () => {
		const result = await ExpressionResolver.resolve(`\${ ${variableName("values")} }`, { values: [1, 2] });
		expect(result instanceof Array).toBe(true);
	});

	// Carried over from test/ExecuterTests/: a function is a value like any other, and what the
	// caller gets back is the function itself rather than a copy, a binding or its result.
	it("resolve answers a function as a function", async () => {
		const result = await ExpressionResolver.resolve(`\${ ${variableName("fn")} }`, { fn: () => "from function" });
		expect(typeof result).toBe("function");
		expect(result()).toBe("from function");
	});

	it("resolveText casts the value towards string", async () => {
		const result = await ExpressionResolver.resolveText("${ 1 + 1 }", {});
		expect(result).toBe("2");
	});

	it("resolveText replaces every expression of the text", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("a")} } and \${ ${variableName("b")} }`, { a: "one", b: "two" });
		expect(result).toBe("one and two");
	});

	// Counted through a getter rather than through "${counter++} ${counter++}": whether a write
	// from an expression persists is the executer's own (8.3), so a counting write would pin this
	// rule to the executers that keep one. Reading does not. Verified 2026-09-01 against all four:
	// each answers "0 1" and reads the getter exactly twice.
	it("resolveText evaluates every occurrence on its own", async () => {
		let reads = 0;
		const context = { get counter() { return reads++; } };
		const expression = `\${${variableName("counter")}}`;
		const result = await ExpressionResolver.resolveText(`${expression} ${expression}`, context);
		expect(result).toBe("0 1");
	});

	it("resolve accepts a bare statement without the delimiters", async () => {
		const result = await ExpressionResolver.resolve(`${variableName("a")} + ${variableName("b")}`, { a: 1, b: 2 });
		expect(result).toBe(3);
	});

	it("resolve recognizes the scope prefix in the delimited form", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolve(`\${scope::${variableName("value")}}`);
		expect(result).toBe("from scope");
	});

	it("resolve reaches an ancestor through the scope prefix", async () => {
		const root = new ExpressionResolver({ name: "root", context: { value: "from root" } });
		const leaf = new ExpressionResolver({ name: "leaf", context: { value: "from leaf" }, parent: root });
		const result = await leaf.resolve(`\${root::${variableName("value")}}`);
		expect(result).toBe("from root");
	});

	// Cannot tell the implementations apart, verified 2026-08-29: before the prefix was parsed at
	// all, "nowhere::value" reached the executer as a statement, failed to compile and the default
	// applied through the error path instead of through 5.4. Same answer, different reason.
	it("resolve answers the default value where no link carries the prefix", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolve(`\${nowhere::${variableName("value")}}`, "fallback");
		expect(result).toBe("fallback");
	});

	// A form the method rejects itself is not an execution error: it is thrown rather than answered
	// with the default value. The narrow matcher surface of this suite is kept by catching by hand.
	it("resolve throws where a delimited expression does not end with a closing brace", async () => {
		const resolver = new ExpressionResolver({ context: { value: "resolved" } });
		let error = null;
		try {
			await resolver.resolve("${ value", "fallback");
		} catch (e) {
			error = e;
		}
		expect(error instanceof SyntaxError).toBe(true);
	});

	// "scope::value" is handed to the executer as a statement, which is what the rule says - and it
	// is not valid JavaScript, so the executer fails and resolve lets that error through (7).
	it("resolve does not recognize a scope prefix without the delimiters", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const error = await catchError(() => resolver.resolve(`scope::${variableName("value")}`));
		expect(error instanceof SyntaxError).toBe(true);
	});
});

describe("Specification 4.4 - the default value", () => {

	it("replaces a result of undefined", async () => {
		const result = await ExpressionResolver.resolve("${ undefined }", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("replaces a result of null", async () => {
		const result = await ExpressionResolver.resolve("${ null }", {}, "fallback");
		expect(result).toBe("fallback");
	});

	it("does not replace 0", async () => {
		const result = await ExpressionResolver.resolve("${ 0 }", {}, "fallback");
		expect(result).toBe(0);
	});

	it("does not replace an empty string", async () => {
		const result = await ExpressionResolver.resolve("${ \"\" }", {}, "fallback");
		expect(result).toBe("");
	});

	it("honours undefined passed as the default", async () => {
		const result = await ExpressionResolver.resolve("${ null }", {}, undefined);
		expect(result).toBeUndefined();
	});

	it("answers null without a default, where undefined as the default would answer undefined", async () => {
		const result = await ExpressionResolver.resolve("${ null }", {});
		expect(result).toBe(null);
	});

	it("applies the default per expression in resolveText", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("a")} } \${ ${variableName("b")} }`, { a: null, b: "two" }, "fallback");
		expect(result).toBe("fallback two");
	});

	it("renders undefined and null literally in resolveText without a default", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("a")} } \${ ${variableName("b")} }`, { a: undefined, b: null });
		expect(result).toBe("undefined null");
	});

	// 4.3 casts towards string, and 4.4 puts the default where the value would have stood, so a
	// default that is an object is cast like any other value.
	// The key exists and holds undefined, so the lookup answers and the default takes its place. A
	// key no link carries would raise instead, and per 7 the expression would stand.
	it("casts a default that is an object towards string in resolveText", async () => {
		const result = await ExpressionResolver.resolveText(`\${ ${variableName("missing")} }`, { missing: undefined }, { a: 1 });
		expect(result).toBe("[object Object]");
	});
});

describe("Specification 4.5 - the timeout delays the start", () => {

	it("delays resolve by the given amount", async () => {
		const start = Date.now();
		const result = await ExpressionResolver.resolve(`\${ ${variableName("value")} }`, { value: "resolved" }, undefined, 100);
		expect(result).toBe("resolved");
		expect(Date.now() - start >= 90).toBe(true);
	});

	it("delays resolveText by the given amount", async () => {
		const start = Date.now();
		const result = await ExpressionResolver.resolveText(`a \${ ${variableName("value")} } b`, { value: "resolved" }, undefined, 100);
		expect(result).toBe("a resolved b");
		expect(Date.now() - start >= 90).toBe(true);
	});

	// "delays the start by that amount" leaves nothing to delay by for 0, and a negative delay is
	// not a delay either. Neither may swallow the resolution.
	it("treats a timeout of zero and a negative timeout as no delay", async () => {
		const expression = `\${ ${variableName("value")} }`;
		const zero = await ExpressionResolver.resolve(expression, { value: "resolved" }, undefined, 0);
		const negative = await ExpressionResolver.resolve(expression, { value: "resolved" }, undefined, -100);
		expect(zero).toBe("resolved");
		expect(negative).toBe("resolved");
	});

	it("is not a deadline - a statement that runs longer is not aborted", async () => {
		const context = {
			slow: () => new Promise((resolve) => setTimeout(() => resolve("late"), 150))
		};
		const result = await ExpressionResolver.resolve(`\${ ${variableName("slow")}() }`, context, undefined, 10);
		expect(result).toBe("late");
	});
});

describe("Specification 4.6 - both entry points answer a promise", () => {

	it("static resolve answers a promise", async () => {
		const answer = ExpressionResolver.resolve("${ 1 }", {});
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("static resolveText answers a promise", async () => {
		const answer = ExpressionResolver.resolveText("${ 1 }", {});
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("instance resolve answers a promise", async () => {
		const resolver = new ExpressionResolver({ context: {} });
		const answer = resolver.resolve("${ 1 }");
		expect(answer instanceof Promise).toBe(true);
		await answer;
	});

	it("awaits a promise value before answering it", async () => {
		const result = await ExpressionResolver.resolve("${ Promise.resolve(\"awaited\") }", {});
		expect(result).toBe("awaited");
	});

	it("awaits a promise value before inserting it into a text", async () => {
		const result = await ExpressionResolver.resolveText("a ${ Promise.resolve(\"awaited\") } b", {});
		expect(result).toBe("a awaited b");
	});
});
