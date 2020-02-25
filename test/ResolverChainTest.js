import ExpressionResolver from "../src/ExpressionResolver";

describe("Resolver chain", () => {

	beforeAll(() => { });


	it("resolve \"${first}\" from third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });
		
		const result = await third.resolve("${first}", "fail");
		expect(result).toBe("first");
	});

	it("resolve \"${second}\" from third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });
		
		const result = await third.resolve("${second}", "fail");
		expect(result).toBe("second");
	});

	it("resolve \"${third}\" from third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });
		
		const result = await third.resolve("${third}", "fail");
		expect(result).toBe("third");
	});
	
	it("resolve \"${first}\" second third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second", first: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });
		
		let result = await third.resolve("${second}", "fail");
		expect(result).toBe("second");
		result = await third.resolve("${first}", "fail");
		expect(result).toBe("second");
		
	});
});