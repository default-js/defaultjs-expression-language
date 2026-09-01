import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 4.1 - the static entry points, in both call forms.
 *
 * The configuration form is not implemented; its cases carry the marker and BACKLOG.md carries the
 * entry.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
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
