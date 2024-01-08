import { Message } from "discord.js-selfbot-v13";
import BasePipeline from "./BasePipline.js";

export default class NickPipeline extends BasePipeline{
    /**
     * 
     * @param {string} text 
     * @param {Message} m 
     * @returns {Promise<string>}
     */
    async resolve(text,m){
        text = await super.resolve(text,m)

        let a = text.split(" ")

        for(let i = 0; i < a.length; i++){
            var splited = a[i].split("<@")
            if(splited.length == 2){
                var id = splited[1].slice(0, -1)
                if(m.guild != undefined && m.guild.members.cache.get(id)?.user?.username != undefined){
                    a[i] = m.guild.members.cache.get(id)?.user?.username
                }else{
                    a[i] = "собеседник"
                }
            }
        }
        return a.join(" ")
    }
}