import {ExpressionResolver} from "../index.js";

describe("Context Behavior Test", () => {

	beforeAll(() => {
		const global = window || global || self || this || {};
		global.test = "global context";
	});

	afterAll(function() {
		const global = window || global || self || this || {};
		delete global.test;
	});

	it("resolve \"${test}\" from global context", async () => {
		const result = await ExpressionResolver.resolveText("${test}");
		expect(result).toBe("global context");
	});

	it("resolve \"${test}\" from local context (override global context)", async () => {
		const result = await ExpressionResolver.resolveText("${test}", { test: "local context" });
		expect(result).toBe("local context");
	});

	it("resolve \"${document.location}\" from browser window context", async () => {
		const result = await ExpressionResolver.resolveText("${document.location}");
		expect(result).toBeDefined();
		expect(result == document.location).toBe(true);
	});

	it("resolve \"${document.location}\" with overrided browser window context", async () => {
		const result = await ExpressionResolver.resolveText("${document.location}", { document: { location: "overrided" } });
		expect(result).toBeDefined();
		expect(result == document.location).toBe(false);
		expect(result == "overrided").toBe(true);
	});

	it("resolve \"${document.location}\" from browser window context and local context", async () => {
		let result = await ExpressionResolver.resolveText("${document.location}", { test: "local context" });
		expect(result).toBeDefined();
		expect(result == document.location).toBe(true);
		
		result = await ExpressionResolver.resolveText("${test}", { test: "local context" });
		expect(result == "local context").toBe(true);
	});
});