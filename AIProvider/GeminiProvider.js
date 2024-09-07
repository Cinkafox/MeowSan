import History from "../Data/History.js";
import Prompt from "../Data/Prompt.js";
import Logger from "../Utils/Logger.js";
import BaseProvider from "./BaseProvider.js";
import tiny from "tiny-json-http";

export default class GeminiProvider extends BaseProvider{
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
        let rebuilded = this._rebuild(history);
        let datum = {
            contents: rebuilded[0],
            safety_settings :[
                {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
                },
                {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
                },
                {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
                },
                {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
                },
            ]
        }

        if(rebuilded[1] != undefined)
            datum["system_instruction"] = rebuilded[1]

        console.log(datum)

        let res = await tiny.post({url:"https://api.proxyapi.ru/google/v1beta/models/gemini-1.5-flash:generateContent",headers:{
                    "Authorization":"Bearer " + process.env.AI_KEY
                },data:datum});

                console.log(res.body.candidates)        

        if(res.body.candidates[0].finishReason === 'OTHER'){
            history.clear();
            console.log(res.body.candidates[0].safetyRatings)
            return "увы...";
        }
                
    
        let role = res.body.candidates[0].content.role;
        let content = res.body.candidates[0].content.parts[0].text;

        history.append(new Prompt(role,content));

        return content;
     }


     /**
      * 
      * @param {History} hist 
      */
     _rebuild(hist){
        let arr = []
        let sys = undefined
        for(var ent of hist.items){
            if(ent.role === "system"){
               sys = {"parts":{ "text": ent.content}}
               //arr.push({"role": "user","parts": [{"text": ent.content}]})
              // arr.push({"role": "model","parts": [{"text": "принято."}]})
               continue
            }

            if(ent.role === "assistant") ent.role = "model";

            arr.push({"role": ent.role,"parts": [{"text": ent.content}]})
        }
        return [arr, sys]
     }
}