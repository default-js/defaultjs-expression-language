import {ExpressionResolver, Context, ExecuterRegistry} from "../index.js";
import {EXECUTERNAME as EsprimaExecuterName} from "../src/executer/EsprimaExecuter.js";
import {EXECUTERNAME as WithScopedExecuterName} from "../src/executer/WithScopedExecuter.js";
import {EXECUTERNAME as DirectExecuterName} from "../src/executer/DirectExecuter.js";
//ExpressionResolver.defaultExecuter = WithScopedExecuterName;
//ExpressionResolver.defaultExecuter = DirectExecuterName;
//ExpressionResolver.defaultExecuter = EsprimaExecuterName;