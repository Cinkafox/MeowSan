import History from "../Data/History.js";
import Prompt from "../Data/Prompt.js";
import Logger from "./Logger.js";

/**
 * 
 * @param {string} raw 
 * @param {History} history 
 */
export default function Load(raw,history){
    history.clear(false);
    let botName = "ассистент";
    raw.split("\n").forEach(element => {
        let splited = element.split("|");

        if(splited[0] == "name") {
            botName = splited[1];
            return;
        }
        history.append(new Prompt(splited[0],splited[1]));
    });
    Logger.info("LOADED " + botName)
    return botName;
}