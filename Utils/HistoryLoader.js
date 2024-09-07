import History from "../Data/History.js";
import Prompt from "../Data/Prompt.js";
import Logger from "./Logger.js";

/**
 * Deserialize some shit
 * @param {string} raw 
 * @param {History} history 
 */
export default function Load(raw,history){
    history.clear(false);
    let botName = "ассистент";
    let isRolePlay = false;
    let rolePlayText = "Ты отыгрываешь персонажа, описанный ниже. С тобой переписываются еще несколько персон. \r";
    //substring for deleting first |
    raw.substring(1).split("\n|").forEach(element => {
        let splited = element.split("|");

        if(splited[0] == "name") {
            botName = splited[1].trim();
            return;
        }

        if(splited[0] == "isRolePlay") {
            isRolePlay = splited[1].trim() === "true";
            return;
        }

        if(splited[0] == "system") {
            var text = splited[1].trim();
            if(isRolePlay){
                text = rolePlayText + text;
            }
            history.append(new Prompt("system",text));
            return;
        }

        history.append(new Prompt(splited[0],splited[1].trim()));
    });
    Logger.info("LOADED " + botName);
    return botName;
}