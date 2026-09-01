import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERS, defaultExecuterEntry } from "../ExecuterCapabilities.js";

/**
 * SPECIFICATION.md 6.7 - buildSecure and its property filter.
 */

const { variableName } = defaultExecuterEntry();

describe("Specification 6.7 - buildSecure", () => {

	const propFilter = (name) => name !== "secret";

	it("builds a resolver over the filtered context", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve(`\${ ${variableName("open")} }`, "fallback");
		expect(result).toBe("ok");
	});

	it("does not carry a property the filter rejected", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve(`\${ typeof ${variableName("secret")} }`);
		expect(result).toBe("undefined");
	});

	it("filters the context, not the globals - it is not a sandbox", async () => {
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok", secret: "hidden" }, propFilter });
		const result = await secure.resolve("${ typeof Math }", "fallback");
		expect(result).toBe("object");
	});

	it("forwards name and parent to the constructor", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const secure = ExpressionResolver.buildSecure({ context: { open: "ok" }, propFilter, option: { name: "secure", parent: root } });
		expect(secure.name).toBe("secure");
		expect(secure.parent === root).toBe(true);
	});

	it("forwards the executer to the constructor", async () => {
		const secure = ExpressionResolver.buildSecure({
			context: { open: "ok" },
			propFilter,
			option: { name: "secure", executer: EXECUTERS[1].name }
		});
		const result = await secure.resolve("${ ctx.open }", "fallback");
		expect(result).toBe("ok");
	});
});
