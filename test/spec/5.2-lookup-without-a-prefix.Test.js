import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";
import { useTestExecuter, answersFromContext, answerWith } from "../TestExecuter.js";

/**
 * SPECIFICATION.md 5.2 - which resolver of the chain answers a name.
 *
 * The walk is the resolver's work, done by the context it hands to the executer: the traps of that
 * context climb the chain, whatever the executer then does with them. So it is asked of the context
 * itself, through the three questions an executer can put to it - reading a name (`get`), asking
 * whether one exists (`has`), and listing them all (`ownKeys`). No statement is evaluated.
 */

useTestExecuter();
// the answer is the value the context carries under the statement - a lookup, so what a case
// reads is which resolver answered, not what anybody computed
answersFromContext();

describe("Specification 5.2 - lookup without a prefix", () => {

	it("answers from the nearest resolver and shadows the ones above", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolve("${value}", "fallback")).toBe("from leaf");
	});

	it("reaches a value carried by an ancestor", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolve("${rootOnly}", "fallback")).toBe("from root");
	});

	it("never sees the context of a resolver below", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(await root.resolve("${leafOnly}", "fallback")).toBe("fallback");
	});

	it("stops the walk at a key that holds undefined", async () => {
		const root = new ExpressionResolver({ context: { value: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { value: undefined }, name: "leaf", parent: root });
		expect(await leaf.resolve("${value}")).toBeUndefined();
	});

	it("reaches a getter inherited through the prototype chain", async () => {
		class Data {
			get value() {
				return "from getter";
			}
		}
		const resolver = new ExpressionResolver({ context: new Data(), name: "root" });
		expect(await resolver.resolve("${value}", "fallback")).toBe("from getter");
	});

	it("reaches a method inherited through the prototype chain", async () => {
		class Data {
			greet() {
				return "from method";
			}
		}
		const resolver = new ExpressionResolver({ context: new Data(), name: "root" });
		expect(typeof (await resolver.resolve("${greet}"))).toBe("function");
	});
});

describe("Specification 5.2 - which names the context says it carries", () => {

	// `has` is what a `with` block asks before it reads, so a name the chain carries has to be
	// present on the context of every resolver below the one carrying it.
	it("says it carries a name only an ancestor carries", async () => {
		answerWith((aStatement, aContext) => aStatement in aContext);
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolve("${rootOnly}")).toBe(true);
	});

	it("says it does not carry a name no resolver of the chain carries", async () => {
		answerWith((aStatement, aContext) => aStatement in aContext);
		const root = new ExpressionResolver({ context: { rootOnly: "from root" }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: "from leaf" }, name: "leaf", parent: root });
		expect(await leaf.resolve("${nowhere}")).toBe(false);
	});

	it("says it carries a key that holds undefined", async () => {
		answerWith((aStatement, aContext) => aStatement in aContext);
		const resolver = new ExpressionResolver({ context: { value: undefined }, name: "root" });
		expect(await resolver.resolve("${value}")).toBe(true);
	});

	it("lists the names of every resolver up to the root, each once", async () => {
		answerWith((aStatement, aContext) => Object.keys(aContext).sort().join());
		const root = new ExpressionResolver({ context: { rootOnly: 1, value: 1 }, name: "root" });
		const leaf = new ExpressionResolver({ context: { leafOnly: 1, value: 2 }, name: "leaf", parent: root });
		expect(await leaf.resolve("${names}")).toBe("leafOnly,rootOnly,value");
	});

	it("lists no name of a resolver below", async () => {
		answerWith((aStatement, aContext) => Object.keys(aContext).sort().join());
		const root = new ExpressionResolver({ context: { rootOnly: 1 }, name: "root" });
		new ExpressionResolver({ context: { leafOnly: 1 }, name: "leaf", parent: root });
		expect(await root.resolve("${names}")).toBe("rootOnly");
	});
});
