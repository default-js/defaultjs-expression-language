export default class Executer{

    #defaultContext;
    #execution;

    /**
     * 
     * @param {Object} option
     * @param {Object} option.defaultContext
     * @param {Function} option.execution
     */
    constructor({defaultContext, execution} = {}){
        this.#defaultContext = defaultContext || {};
        this.#execution = execution || (() => {throw new Error("not implemented")});
    }
    
    get defaultContext(){
        return this.#defaultContext;
    }
    
    execute(aStatement, aContext){
        return this.#execution(aStatement, aContext);
    }
};