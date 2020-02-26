import ExpressionResolver from "../src/ExpressionResolver";

describe("Resolver context manipulation test - ", () => {

	it("merge", async () => {
		const resolver = new ExpressionResolver({ context: { first: "first" }});		
		
		expect(resolver.context.first).toBe("first");
		expect(resolver.context.second).toBeUndefined();
		
		debugger;
		resolver.mergeContext({second: "second"});
		
		console.log(resolver.context);
		
		expect(resolver.context.second).toBeDefined();
		expect(resolver.context.second).toBe("second");
	});
});