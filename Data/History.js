import Prompt from "./Prompt.js";

export default class History{
    /**
     * @type {[Prompt]}
     */
    #history;
    /**
     * @type {History}
     */
    parent;
    maxLength;

    constructor(parent){
        this.#history = [];
        this.parent = parent;
    }

    /**
     * append prompt history
     * @param {Prompt} promt 
     */
    append(promt){
        this.#history.push(promt);
        while(this.#history.length > this.maxLength) this.#history.shift();
    }

    clear(cleanParent = false){
        if(this.parent != null && cleanParent) this.parent.clear();
        this.#history = []
    }

    /**
     * @type {[Prompt]}
     */
    get items(){
        if(this.parent != null){
            return [...this.parent.items,...this.#history];
        }
        return this.#history
    }
}