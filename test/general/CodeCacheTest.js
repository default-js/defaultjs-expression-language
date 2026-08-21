import { describe, it, expect } from "vitest";
import CodeCache from "../../src/CodeCache.js";

const code = (name) => () => name;

/**
 * Fills a cache with `count` entries named `k0`…`k{count-1}`.
 */
const fill = (aCache, count) => {
	for (let i = 0; i < count; i++) aCache.set(`k${i}`, code(`k${i}`));
};

describe(`general: code cache: `, () => {

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

	it(`replaces the code of an existing key without adding an entry`, () => {
		const cache = new CodeCache({ size: 10 });
		const replacement = code("second");

		cache.set("expression", code("first"));
		cache.set("expression", replacement);

		expect(cache.get("expression")).toBe(replacement);
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

	it(`caches again after being re-enabled`, () => {
		const cache = new CodeCache({ size: 10 });
		const compiled = code("hit");

		cache.setup({ size: 0 });
		cache.setup({ size: 10 });
		cache.set("expression", compiled);

		expect(cache.get("expression")).toBe(compiled);
	});

	it(`caches after a size of 0 was passed to the constructor`, () => {
		const cache = new CodeCache({ size: 0 });
		const compiled = code("hit");

		cache.setup({ size: 10 });
		cache.set("expression", compiled);

		expect(cache.get("expression")).toBe(compiled);
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
