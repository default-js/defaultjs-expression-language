import ExpressionResolver from "../src/ExpressionResolver";

describe("Test resolve", () => {
	beforeAll(() => {});
	
	it("resolve \"${test}\"", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test":"success"}, "fail");
		expect(result).toBe("success");
	});
	
	it("resolve \"${test}\" to default", async () => {
		const expression = "${typeof test !== \"undefined\" ? test : undefined}";
		const result = await ExpressionResolver.resolve(expression, {}, "fail");
		expect(result).toBe("fail");
	});
	
	it("resolve \"${test}\" but no default", async () => {
		const expression = "${typeof test !== \"undefined\" ? test : undefined}";
		const result = await ExpressionResolver.resolve(expression, {});
		expect(result).toBeUndefined();
	});
	
	it("resolve \"${test}\" throw an error with default", async () => {
		const expression = "${test}";
		const result = await ExpressionResolver.resolve(expression, {}, "fail");
		expect(result).toBe("fail");
	});
	
	it("resolve \"${test}\" throw an error with no default", async () => {
		const expression = "${test}";
		const result = await ExpressionResolver.resolve(expression, {});
		expect(result).toBe(expression);
	});
	
	it("resolve \"${test}\" as Object", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test": {"type" : "object"}}, "fail");
		expect(typeof result).toBe("object");
		expect(result.type).toBeDefined();
		expect(result.type).toBe("object");
	});
	
	it("resolve \"${test}\" as function", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test": function(){return "function";}}, "fail");
		expect(typeof result).toBe("function");
		expect(result()).toBe("function");
	});
	
	it("resolve \"${test}\" with timeout", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test":"success"}, "fail", 1000);
		expect(result).toBe("success");
	});
	
	it("resolve \"test\"", async () => {
		const result = await ExpressionResolver.resolve("test", {"test":"success"}, "fail");
		expect(result).toBe("success");
	});
	
	it("resolve \"test\" with timeout", async () => {
		const result = await ExpressionResolver.resolve("test", {"test":"success"}, "fail", 1000);
		expect(result).toBe("success");
	});
	
	it("resolve \"${getPromise()}\" as a promise", async () => {
		const result = await ExpressionResolver.resolve("${getPromise()}", {"getPromise":async () => "success"}, "fail");
		expect(result).toBe("success");
	});
});