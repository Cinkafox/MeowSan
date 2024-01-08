import History from "../Data/History.js";

/**
 * Serialize history for reading
 * @param {History} history 
 */
export default function Serialize(history){
    let text = ""
    history.items.forEach(v=>{
        text += v.role + "|" + v.content + "\n"
    })
    return text
}