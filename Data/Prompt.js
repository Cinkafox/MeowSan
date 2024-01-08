export default class Prompt{
    /**
     * role in chat. Can be assistant, user, system
     * @type {string}
     */
    role;
    /**
     * message
     * @type {string}
     */
    content;
    constructor(role,content){
        this.role = role;
        this.content = content;
    }
}