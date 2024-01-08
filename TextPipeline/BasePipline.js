export default class BasePipeline{
    /**
     * @type {BasePipeline}
     */
    parent;

    next(child){
        child.parent = this;
        return child;
    }
    
    /**
     * 
     * @param {Promise<string>} text 
     */
    async resolve(text,m){
        if(this.parent != null){
            text = await this.parent.resolve(text,m);
        }
        return text;
    }
}