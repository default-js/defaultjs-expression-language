import { EXECUTERNAME } from "../../../src/executer/ContextDeconstructorExecuter.js";
import { executerEntry } from "../../ExecuterCapabilities.js";
import { chainRules } from "../shared/ChainRules.js";
import { contextRules } from "../shared/ContextRules.js";
import { errorRules } from "../shared/ErrorRules.js";
import { executerRules } from "../shared/ExecuterRules.js";

/**
 * The conformance suite for `context-deconstruction-executer`: every rule of SPECIFICATION.md that is only
 * observable through a statement, asked of this one executer. The cases themselves are shared -
 * they have to hold under every implementation - and what a capability decides is written through
 * `capabilityIt`, so the catalogue says whether a case runs as `it` or as `it.fails`. What only this
 * executer does sits in its own file beside this one.
 *
 * The name comes from the executer's own module rather than as a string: that import is also what
 * registers the implementation, so this file cannot address one that does not exist.
 */
const EXECUTER = executerEntry(EXECUTERNAME);

chainRules(EXECUTER);
contextRules(EXECUTER);
errorRules(EXECUTER);
executerRules(EXECUTER);
