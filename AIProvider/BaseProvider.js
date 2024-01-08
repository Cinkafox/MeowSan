import History from "../Data/History.js";
import Prompt from "../Data/Prompt.js"

export default class BaseProvider{
    /**
     * 
     * @param {string} user 
     * @param {string} message 
     * @param {History} history 
     * @returns {Promise<string>}
     */
    async prompt(user,message,history){
        
    }
}