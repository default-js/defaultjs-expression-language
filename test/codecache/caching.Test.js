import { describe, it, expect } from "vitest";
import CodeCache from "../../src/CodeCache.js";
import { catchError } from "../TestUtils.js";

/**
 * CodeCache - storing, evicting, and switching the cache off and on. SPECIFICATION.md 9.3.
 *
 * 9.3 lets a consumer set the size of an executer's code cache, `0` or less disabling it; what the
 * cache then does with its entries is its own, and asked here of a cache built directly. That an
 * executer uses its cache is that executer's `cache.Test.js`.
 */

const code = (name) => () => name;

/**
 * Fills a cache with `count` entries named `k0`…`k{count-1}`.
 */
const fill = (aCache, count) => {
	for (let i = 0; i < count; i++) aCache.set(`k${i}`, code(`k${i}`));
};

describe("CodeCache - caching", () => {

	it(`stores and returns a compiled expression`, () => {
		const cache = new CodeCache({ size: 10 });
		const compiled = code("hit");

		cache.set("expression", compiled);

		expect(cache.has("expression")).toBe(true);
		expect(cache.get("expression")).toBe(compiled);
	});

	it(`reports a miss for an unknown key`, () => {
		const cache = new CodeCache({ size: 10 });

		expect(cache.has("expression")).toBe(false);
		expect(cache.get("expression")).toBe(null);
	});

	it(`replaces the code of an existing key`, () => {
		const cache = new CodeCache({ size: 10 });
		const replacement = code("second");

		cache.set("expression", code("first"));
		cache.set("expression", replacement);

		expect(cache.get("expression")).toBe(replacement);
	});

	it(`keeps one entry per key when its code is replaced`, () => {
		// size 10 trims at 11 keys. A second entry for the replaced key would be the oldest one of
		// the twelve, and evicting it would take the key along although its other entry is the
		// most recently used.
		const cache = new CodeCache({ size: 10 });
		cache.set("expression", code("first"));
		cache.set("expression", code("second"));
		fill(cache, 9);

		cache.get("expression");
		cache.set("k9", code("k9"));

		expect(cache.has("expression")).toBe(true);
	});

	it(`evicts the least recently used entry, not the least recently written one`, () => {
		// size 10 trims at floor(10 * 1.1) = 11 entries, back down to 10.
		const cache = new CodeCache({ size: 10 });
		fill(cache, 10);

		// k0 is the oldest write but now the newest hit, k1 becomes the least recently used.
		cache.get("k0");
		cache.set("k10", code("k10"));

		expect(cache.has("k0")).toBe(true);
		expect(cache.has("k1")).toBe(false);
		expect(cache.has("k10")).toBe(true);

		let kept = 0;
		for (let i = 0; i <= 10; i++) if (cache.has(`k${i}`)) kept++;
		expect(kept).toBe(10);
	});

	it(`drops every entry on clear`, () => {
		const cache = new CodeCache({ size: 10 });
		fill(cache, 3);

		cache.clear();

		expect(cache.has("k0")).toBe(false);
		expect(cache.get("k0")).toBe(null);
	});

	it(`caches nothing while disabled`, () => {
		const cache = new CodeCache({ size: 0 });

		cache.set("expression", code("hit"));

		expect(cache.has("expression")).toBe(false);
		expect(cache.get("expression")).toBe(null);
	});

	it(`releases its entries when it is disabled`, () => {
		const cache = new CodeCache({ size: 10 });
		fill(cache, 3);

		cache.setup({ size: 0 });
		cache.setup({ size: 10 });
		cache.set("fresh", code("fresh"));

		// `fresh` proves the cache is on again, so `k0` is absent because clear() ran
		// and not because the cache is still disabled.
		expect(cache.has("fresh")).toBe(true);
		expect(cache.has("k0")).toBe(false);
	});

	it(`keeps the most recently used entries when the size is lowered`, () => {
		const cache = new CodeCache({ size: 10 });
		fill(cache, 10);

		cache.get("k0");
		cache.setup({ size: 2 });

		expect(cache.has("k0")).toBe(true);
		expect(cache.has("k9")).toBe(true);
		expect(cache.has("k8")).toBe(false);
	});
});

describe("CodeCache - the size", () => {

	// The size is not readable, so it shows in what is evicted: 5000 trims at 5500 entries, back down
	// to the 5000 most recently used.
	it(`starts with a size of 5000`, () => {
		const cache = new CodeCache();
		fill(cache, 5500);

		expect(cache.has("k499")).toBe(false);
		expect(cache.has("k500")).toBe(true);
	});

	// A default size taken on every call would shrink a cache larger than that default at once.
	it(`keeps its size when setup is handed no size`, () => {
		const cache = new CodeCache({ size: 2000 });
		fill(cache, 2000);

		cache.setup({});

		expect(cache.has("k0")).toBe(true);
	});

	it(`rejects a size that is not a finite number`, async () => {
		for (const size of ["10", null, NaN, Infinity]) {
			const error = await catchError(() => new CodeCache({ size }));
			expect(error instanceof TypeError).toBe(true);
		}
	});

	// Rounding shows only in when the cache trims: 19 trims at 20 entries, 19.5 would wait for 21.
	it(`rounds a fraction down`, () => {
		const cache = new CodeCache({ size: 19.5 });
		fill(cache, 20);

		expect(cache.has("k0")).toBe(false);
	});
});
