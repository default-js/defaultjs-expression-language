import { describe, it, expectTypeOf } from "vitest";
import { ExpressionResolver, ExecuterRegistry } from "@default-js/defaultjs-expression-language";
import * as Browser from "@default-js/defaultjs-expression-language/browser.js";
import Executer from "@default-js/defaultjs-expression-language/src/Executer.js";
import { setupExecuter } from "@default-js/defaultjs-expression-language/src/executer/ContextDeconstructorExecuter.js";

/**
 * The type declarations of the public surface - SPECIFICATION.md 8.
 *
 * Checked by tsc, never run: a case fails where it does not compile, and an error inside a
 * declaration fails the whole run, because test/tsconfig.json keeps skipLibCheck off. The
 * declarations are generated from the JSDoc, so this file pins that the JSDoc tells a TypeScript
 * consumer what they can call and what they get back. What a member does is pinned by the suite of
 * the component that has it.
 *
 * Everything is imported through the package name, so the `exports` field of package.json is what
 * finds each declaration, as it does for a consumer - one module per open path, the default executer
 * standing for src/executer/*. What each executer module declares is asked in that executer's own
 * `interface.Test-d.ts`, like its runtime interface.
 *
 * Not pinned: closed paths, as in surface.Test.js, and the declarations of the internal modules,
 * which are no surface.
 */

describe("Specification 8 - ExpressionResolver, the static surface, as declared", () => {

	it("resolve answers a promise", () => {
		expectTypeOf(ExpressionResolver.resolve("${value}")).toEqualTypeOf<Promise<any>>();
	});

	it("resolve takes context, default and timeout positionally", () => {
		expectTypeOf(ExpressionResolver.resolve).toBeCallableWith("${value}", { value: 1 }, "default", 10);
	});

	it("resolve takes null for the context and the timeout", () => {
		expectTypeOf(ExpressionResolver.resolve).toBeCallableWith("${value}", null, undefined, null);
	});

	it("resolve takes a configuration object", () => {
		expectTypeOf(ExpressionResolver.resolve).toBeCallableWith({ expression: "${value}", context: { value: 1 }, defaultValue: "default", timeout: 10 });
	});

	it("resolve takes no argument behind the timeout", () => {
		// @ts-expect-error
		ExpressionResolver.resolve("${value}", {}, "default", 10, "surplus");
	});

	// an argument behind a configuration is ignored, so it is no part of the call
	it("resolve takes no argument behind a configuration", () => {
		// @ts-expect-error
		ExpressionResolver.resolve({ expression: "${value}" }, { value: 1 });
	});

	it("resolve takes no configuration without an expression", () => {
		// @ts-expect-error
		ExpressionResolver.resolve({ context: { value: 1 } });
	});

	it("resolve takes no expression of another type", () => {
		// @ts-expect-error
		ExpressionResolver.resolve(42);
	});

	it("resolveText answers a promise of a string", () => {
		expectTypeOf(ExpressionResolver.resolveText("${value}")).toEqualTypeOf<Promise<string>>();
	});

	it("resolveText takes context, default and timeout positionally", () => {
		expectTypeOf(ExpressionResolver.resolveText).toBeCallableWith("${value}", { value: 1 }, "default", 10);
	});

	it("resolveText takes a configuration object", () => {
		expectTypeOf(ExpressionResolver.resolveText).toBeCallableWith({ text: "${value}", context: { value: 1 }, defaultValue: "default", timeout: 10 });
	});

	it("resolveText takes no configuration without a text", () => {
		// @ts-expect-error
		ExpressionResolver.resolveText({ expression: "${value}" });
	});

	it("buildFiltered takes a context and a filter, and answers a resolver", () => {
		expectTypeOf(ExpressionResolver.buildFiltered({ context: { value: 1 }, propFilter: () => true })).toEqualTypeOf<ExpressionResolver>();
	});

	it("buildFiltered hands the filter name, value and the object holding it", () => {
		expectTypeOf<Parameters<typeof ExpressionResolver.buildFiltered>[0]["propFilter"]>().parameters.toEqualTypeOf<[string, any, object]>();
	});

	it("buildFiltered takes the filter option and the constructor options, null included", () => {
		expectTypeOf(ExpressionResolver.buildFiltered).toBeCallableWith({
			context: { value: 1 },
			propFilter: () => true,
			option: { deep: false, name: null, parent: null, executer: null }
		});
	});

	it("buildSecure takes what buildFiltered takes", () => {
		expectTypeOf(ExpressionResolver.buildSecure).parameters.toEqualTypeOf<Parameters<typeof ExpressionResolver.buildFiltered>>();
	});

	it("defaultExecuter reads as an Executer", () => {
		expectTypeOf(ExpressionResolver.defaultExecuter).toEqualTypeOf<Executer>();
	});

	it("defaultExecuter takes a registered name", () => {
		ExpressionResolver.defaultExecuter = "context-deconstruction-executer";
	});

	it("defaultExecuter takes an Executer", () => {
		ExpressionResolver.defaultExecuter = new Executer();
	});
});

describe("Specification 8 - ExpressionResolver, the constructor, as declared", () => {

	it("takes no options", () => {
		expectTypeOf(new ExpressionResolver()).toEqualTypeOf<ExpressionResolver>();
	});

	it("takes the whole option set", () => {
		const root = new ExpressionResolver({ name: "root" });
		expectTypeOf(ExpressionResolver).toBeConstructibleWith({ context: { value: 1 }, parent: root, name: "leaf", executer: "context-object-executer" });
	});

	it("takes null for every option", () => {
		expectTypeOf(ExpressionResolver).toBeConstructibleWith({ context: null, parent: null, name: null, executer: null });
	});

	it("takes an Executer as the executer", () => {
		expectTypeOf(ExpressionResolver).toBeConstructibleWith({ executer: new Executer() });
	});

	it("takes no parent that is no resolver", () => {
		// @ts-expect-error
		new ExpressionResolver({ parent: { name: "root" } });
	});
});

describe("Specification 8 - ExpressionResolver, the instance surface, as declared", () => {

	const resolver = new ExpressionResolver({ context: { value: 1 }, name: "root" });

	it("resolve answers a promise", () => {
		expectTypeOf(resolver.resolve("${value}")).toEqualTypeOf<Promise<any>>();
	});

	it("resolve takes a default", () => {
		expectTypeOf(resolver.resolve).toBeCallableWith("${value}", "default");
	});

	it("resolve takes no argument behind the default", () => {
		// @ts-expect-error
		resolver.resolve("${value}", "default", "surplus");
	});

	it("resolveText answers a promise of a string", () => {
		expectTypeOf(resolver.resolveText("${value}")).toEqualTypeOf<Promise<string>>();
	});

	it("resolveText takes a default", () => {
		expectTypeOf(resolver.resolveText).toBeCallableWith("${value}", "default");
	});

	it("getData takes no key", () => {
		expectTypeOf(resolver.getData).toBeCallableWith();
	});

	it("getData takes a string as the key, and a filter", () => {
		expectTypeOf(resolver.getData).toBeCallableWith("value", "root");
	});

	it("getData takes a number as the key", () => {
		expectTypeOf(resolver.getData).toBeCallableWith(0);
	});

	it("getData takes a symbol as the key", () => {
		expectTypeOf(resolver.getData).toBeCallableWith(Symbol.iterator);
	});

	it("getData takes null for the key beside a filter", () => {
		expectTypeOf(resolver.getData).toBeCallableWith(null, "root");
	});

	it("updateData takes a key, a value and a filter", () => {
		expectTypeOf(resolver.updateData).toBeCallableWith("value", 2, "root");
	});

	it("updateData takes no call without a key", () => {
		// @ts-expect-error
		resolver.updateData();
	});

	it("deleteData takes a key and a filter", () => {
		expectTypeOf(resolver.deleteData).toBeCallableWith("value", "root");
	});

	it("mergeContext takes an object and a filter", () => {
		expectTypeOf(resolver.mergeContext).toBeCallableWith({ value: 2 }, "root");
	});

	it("mergeContext takes null", () => {
		expectTypeOf(resolver.mergeContext).toBeCallableWith(null);
	});

	it("name reads as a string", () => {
		expectTypeOf(resolver.name).toEqualTypeOf<string>();
	});

	it("parent reads as a resolver or null", () => {
		expectTypeOf(resolver.parent).toEqualTypeOf<ExpressionResolver | null>();
	});

	// the context answers any key, so a value reads without a cast
	it("context reads any key", () => {
		expectTypeOf(resolver.context).toEqualTypeOf<Record<string | symbol, any>>();
	});

	it("executer reads as an Executer", () => {
		expectTypeOf(resolver.executer).toEqualTypeOf<Executer>();
	});

	it("contextHandle is declared", () => {
		expectTypeOf(resolver).toHaveProperty("contextHandle");
	});

	it("chain reads as a string", () => {
		expectTypeOf(resolver.chain).toEqualTypeOf<string>();
	});

	it("effectiveChain reads as a string", () => {
		expectTypeOf(resolver.effectiveChain).toEqualTypeOf<string>();
	});

	it("contextChain reads as an array of contexts", () => {
		expectTypeOf(resolver.contextChain).toEqualTypeOf<Array<Record<string | symbol, any>>>();
	});

	it("the getters are read-only", () => {
		// @ts-expect-error
		resolver.name = "other";
	});
});

describe("Specification 8 - ExecuterRegistry, as declared", () => {

	it("register takes a name and an Executer", () => {
		expectTypeOf(ExecuterRegistry.register).toEqualTypeOf<(aName: string, anExecuter: Executer) => void>();
	});

	it("getExecuter takes a name and answers an Executer", () => {
		expectTypeOf(ExecuterRegistry.getExecuter).toEqualTypeOf<(aName: string) => Executer>();
	});
});

describe("Specification 8 - Executer, as declared", () => {

	it("takes no options", () => {
		expectTypeOf(new Executer()).toEqualTypeOf<Executer>();
	});

	it("hands the execution the statement as a string and the context", () => {
		expectTypeOf<NonNullable<ConstructorParameters<typeof Executer>[0]>["execution"]>().toEqualTypeOf<((aStatement: string, aContext: object) => any) | undefined>();
	});

	it("execute takes a statement and a context, and answers what the execution answers", () => {
		expectTypeOf(new Executer().execute).toEqualTypeOf<(aStatement: string, aContext: object) => any>();
	});
});

describe("Specification 8 - the modules a consumer imports by the package name, as declared", () => {

	it("browser.js declares the ExpressionResolver of the package", () => {
		expectTypeOf(Browser.ExpressionResolver).toEqualTypeOf<typeof ExpressionResolver>();
	});

	it("browser.js declares the ExecuterRegistry of the package", () => {
		expectTypeOf(Browser.ExecuterRegistry).toEqualTypeOf<typeof ExecuterRegistry>();
	});

	it("the modules under src/executer/ are declared", () => {
		expectTypeOf(setupExecuter).toBeFunction();
	});
});
