import { ExpressionResolver, Context, ExecuterRegistry } from "./index.js";
import "./src/executer/EsprimaExecuter.js";
import GLOBAL from "@default-js/defaultjs-common-utils/src/Global";

GLOBAL.defaultjs = GLOBAL.defaultjs || {};
GLOBAL.defaultjs.el = GLOBAL.defaultjs.el || {
	VERSION: "${version}",
	ExpressionResolver,
	Context,
	ExecuterRegistry
};

export { ExpressionResolver, Context, ExecuterRegistry };
