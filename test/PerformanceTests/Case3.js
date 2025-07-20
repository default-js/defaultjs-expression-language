import {ExpressionResolver} from "../../index.js";
const TEST__DEEPCHAINCOUNT = 1000000;
const MAX_VARNAMES = 100;
const nextInt = function(max, min = 0) {
	return min + Math.floor(Math.random() * (max - min));
};

const buildContext = async function(vars) {
	const result = {};
	const length = nextInt(vars);
	for (let i = 0; i < length; i++) {
		const varid = nextInt(MAX_VARNAMES);
		result["var" + varid] = true;
	}

	return result;
}

const buildChain = async function() {
	let resolver = null;
	for (let i = 0; i < TEST__DEEPCHAINCOUNT; i++) {
		const context = await buildContext(20);
		resolver = new ExpressionResolver({ context, name: "next" + i, parent: resolver });
	}
	
	return resolver;
}

describe("Resolver chain", () => {
	let resolver = null;
	beforeAll(async () => {	
		console.info("preparing!");	
		resolver = await buildChain();
		console.info("preparing ready!");
		return;
	});

	it("resolve deep chain - many calls test (case 2)", async () => {		
		const start = Date.now();
		for (let i = 0; i < TEST__DEEPCHAINCOUNT; i++) {
			const varid = nextInt(MAX_VARNAMES);
			await resolver.resolve("${var" + varid + "}", true);
		}
		const runtime = Date.now() - start;
		
		console.info("resolve deep chain - many calls test (case 2):", runtime, "ms by deep:", TEST__DEEPCHAINCOUNT);

	});

});