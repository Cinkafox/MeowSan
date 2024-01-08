import History from "../Data/History.js";
import Prompt from "../Data/Prompt.js";

/**
 * 
 * @param {History} history 
 */
export default function Serialize(history){
    let text = ""
    history.items.forEach(v=>{
        text += v.role + "|" + v.content + "\n"
    })
    return text
}