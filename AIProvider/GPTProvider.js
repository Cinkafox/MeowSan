import History from "../Data/History.js";
import Prompt from "../Data/Prompt.js";
import BaseProvider from "./BaseProvider.js";
import tiny from "tiny-json-http";

export default class GPTProvider extends BaseProvider{
     /**
     * 
     * @param {string} user 
     * @param {string} message 
     * @param {History} history 
     * @returns {Promise<string>}
     */
     async prompt(user,message,history){
        super.prompt(user,message,history);

        history.append(new Prompt("user",user + " написал:" + message));

        let res = await tiny.post({url:"https://api.proxyapi.ru/openai/v1/chat/completions",headers:{
                    "Authorization":"Bearer " + process.env.AI_KEY
                },data:{
                    "model": "gpt-3.5-turbo",
                    "messages": history.items,
                }});

        let botMessage = res.body.choices[0].message;
        history.append(new Prompt(botMessage.role,botMessage.content));

        return botMessage.content;
     }
}