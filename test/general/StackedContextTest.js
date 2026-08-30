import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { EXECUTERNAME as ContextDeconstructorExecuterName} from "../../src/executer/ContextDeconstructorExecuter.js";
import { EXECUTERNAME as WithScopedExecuter} from "../../src/executer/WithScopedExecuter.js";
import {createResolverWithExecuterFactory} from "../TestUtils.js";

describe(`general: context checks: `, () => {

	beforeAll(() => {

	});

	afterAll(() => {

	});

	const executerNamesToTest = [ContextDeconstructorExecuterName, WithScopedExecuter];

	for (const executerName of executerNamesToTest) {
		const factory = createResolverWithExecuterFactory(executerName);

		it(`${executerName}: No Stacked context`, async () => {
			const resolver = factory({ context: { string: "string", number: 0, boolean: false, test: "success" } });
			expect(await resolver.resolve("${string}")).toBe("string");
		});

		it(`${executerName}: No Stacked context`, async () => {
			const resolver = factory({ context: { string: "string", number: 0, boolean: false, test: "success" }, parent : null });
			expect(await resolver.resolve("${string}")).toBe("string");
		});

		it(`${executerName}: Stacked context`, async () => {
			const resolver = factory({
				context: { string: "string", number: 0, boolean: false, test: "success" },
				parent: factory({
					context: { parentTest: "parentSuccess" },
					parent: factory(),
				}),
			});

			const data = resolver.getData();
			expect(await resolver.resolve("${string}")).toBe("string");
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
			resolver.mergeContext({ test: "success" });
			expect(await resolver.resolve("${test}")).toBe("success");
			expect(await parent.resolve("${test}")).toBe("test");
			resolver.deleteData("test");
			expect(await resolver.resolve("${test}")).toBe("test");
		});
	}
});
