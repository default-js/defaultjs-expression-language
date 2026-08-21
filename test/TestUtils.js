import ExpressionResolver from "../src/ExpressionResolver.js";

export const createResolverWithExecuterFactory = (executer) => {
	return (option) => {
		return new ExpressionResolver(Object.assign({}, option, { executer }));
	}
};

export const createResolveWithExecuterFunction = (executer) => {
	return async (expression, data, defaultValue, timeout) => {
		const resolver =  new ExpressionResolver({ executer });
		return resolver.resolve(expression, data, defaultValue, timeout);
	}
};

export const createResolveTextWithExecuterFunction = (executer) => {
	return async (expression, data, defaultValue, timeout) => {
		const resolver = new ExpressionResolver({ executer });
		return resolver.resolveText(expression, data, defaultValue, timeout);
	}
};
