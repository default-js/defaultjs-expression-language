import ExpressionResolver from "../src/ExpressionResolver.js";

export const createResolverWithExecuterFactory = (executer) => {
    return (option) => {
        return new ExpressionResolver(Object.assign({}, option, { defaultExecuter: executer }));
    }
};

export const createResolveWithExecuterFunction = (executer) => {
    return async (expression, data, defaultValue, timeout) => {
        const resolver =  new ExpressionResolver({ defaultExecuter: executer });
        return resolver.resolve(expression, data, defaultValue, timeout);
    }
};

export const createResolveTextWithExecuterFunction = (executer) => {
    return async (expression, data, defaultValue, timeout) => {
         const resolver = new ExpressionResolver({ defaultExecuter: executer });
        return resolver.resolveText(expression, data, defaultValue, timeout);
    }
};