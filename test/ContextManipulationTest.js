import {ExpressionResolver} from "../index.js";

describe("Resolver context manipulation test - ", () => {

	it("merge", async () => {
		const resolver = new ExpressionResolver({ context: { first: "first" }});		
		
		expect(resolver.context.first).toBe("first");
		expect(resolver.context.second).toBeUndefined();
		
		resolver.mergeContext({second: "second"});
		
		expect(resolver.context.second).toBeDefined();
		expect(resolver.context.second).toBe("second");
	});
});