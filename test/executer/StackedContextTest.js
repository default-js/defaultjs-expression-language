import { describe, it, expect } from "vitest";
import { EXECUTERS } from "../ExecuterCapabilities.js";
import { createResolverWithExecuterFactory } from "../TestUtils.js";

/**
 * The data methods of 6.6 seen through a resolution rather than through `getData`: what a value
 * written to one resolver of a chain does to what an expression answers, on that resolver and on
 * the one above it. 6.6 itself is pinned in `test/spec/ContextTest.js`, without executing
 * anything; this is the same rule from the other side, which is why it runs per executer.
 *
 * The executers, and the way each of them spells a name, come from the catalogue - the file used
 * to name two of the four by hand.
 */
describe(`general: context checks: `, () => {

	for (const { name: executerName, variableName } of EXECUTERS) {
		const factory = createResolverWithExecuterFactory(executerName);

		it(`${executerName}: No Stacked context`, async () => {
			const resolver = factory({ context: { string: "string", number: 0, boolean: false, test: "success" } });
			expect(await resolver.resolve(`\${${variableName("string")}}`)).toBe("string");
		});

		it(`${executerName}: No Stacked context`, async () => {
			const resolver = factory({ context: { string: "string", number: 0, boolean: false, test: "success" }, parent: null });
			expect(await resolver.resolve(`\${${variableName("string")}}`)).toBe("string");
		});

		it(`${executerName}: Stacked context`, async () => {
			const resolver = factory({
				context: { string: "string", number: 0, boolean: false, test: "success" },
				parent: factory({
					context: { parentTest: "parentSuccess" },
					parent: factory(),
				}),
			});

			expect(await resolver.resolve(`\${${variableName("string")}}`)).toBe("string");
		});

		it(`${executerName}: Stacked context, keep prev context unchanged`, async () => {
			const parent = factory({
				context: { test: "test" },
			});

			const resolver = factory({
				context: {},
				parent,
			});
			// mergeContext, not updateData: since SPECIFICATION.md 6.6 a filterless updateData changes the
			// value where the key lives, which is the parent here. Defining a key on this resolver and
			// shadowing the parent from here on is what mergeContext does.
			const expression = `\${${variableName("test")}}`;
			resolver.mergeContext({ test: "success" });
			expect(await resolver.resolve(expression)).toBe("success");
			expect(await parent.resolve(expression)).toBe("test");
			resolver.deleteData("test");
			expect(await resolver.resolve(expression)).toBe("test");
		});
	}
});
