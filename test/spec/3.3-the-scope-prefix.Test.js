import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext, answerWith, statements } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 3.3 - the syntax of the scope prefix.
 *
 * Every case stays on the resolver the call is made on, so it pins the syntax and nothing else -
 * the walk to an ancestor is 5.3 and is asked of every executer.
 * Where a statement reaches a context value, the name is spelled the way the default executer
 * spells it, taken from the catalogue - the dialect is the executer's own (8.3) and no rule here.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which context the resolver handed over, not what anybody computed
answersFromContext();

describe("Specification 3.3 - the scope prefix", () => {

	// The walk to an ancestor is 5.3 and is asked of every executer in test/executer/shared/. Every
	// test here stays on the link the call is made on, so it pins the syntax of the prefix and
	// nothing else.

	it("addresses the link carrying the name", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolveText("${scope::value}");
		expect(result).toBe("from scope");
	});

	it("trims whitespace around the name", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolveText("${  scope  ::value}");
		expect(result).toBe("from scope");
	});

	it("accepts letters, digits, whitespace, - and _ in a name", async () => {
		const resolver = new ExpressionResolver({ name: "a-b_1 2", context: { value: "from scope" } });
		const result = await resolver.resolveText("${a-b_1 2::value}");
		expect(result).toBe("from scope");
	});

	// The prefix is parsed off in ExpressionResolver and decides which resolver answers; what an
	// executer receives is the statement alone. Asserted directly, because the answer would be the
	// same whether the prefix was stripped or never recognised at all.
	it("hands the statement to the executer without the prefix", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		await resolver.resolveText("${scope::value}");
		expect(statements().join("|")).toBe("value");
	});

	// The statement arrives whole, quotes and all - which is what "no prefix was taken off" means.
	it("does not mistake a quoted :: inside a statement for a prefix", async () => {
		answerWith((aStatement) => aStatement);
		const result = await ExpressionResolver.resolveText("${ \"a::b\" }", {});
		expect(result).toBe('"a::b"');
	});

	// Follows from the trim rule of 3.3: a name that is whitespace only is an empty name, and an
	// empty name is no name, so the resolver the call was made on applies.
	it("treats a name that is whitespace only as no prefix at all", async () => {
		const resolver = new ExpressionResolver({ name: "scope", context: { value: "from scope" } });
		const result = await resolver.resolveText("${  ::value}");
		expect(result).toBe("from scope");
	});
});
