import { Message } from "discord.js-selfbot-v13";
import BasePipeline from "./BasePipline.js";
import tiny from "tiny-json-http";

export default class GifPipeline extends BasePipeline{
    /**
     * 
     * @param {string} text 
     * @param {Message} m 
     * @returns {Promise<string>}
     */
    async resolve(text,m){
        text = await super.resolve(text,m);

        let out = ""
        for await(let el of text.split("/gif \"")){
            let splited = el.split("\"")
            if(splited.length == 1) out += el
            else if(splited.length == 2) {
                let uri = await this.findGif(splited[0])
                setTimeout(_=>m.channel.send(uri),300)
                out += splited[1]
            }
        }
        return out
    }

    async findGif(word){
        let url = "https://tenor.googleapis.com/v2/search?q="+encodeURI(word)+"&key="+process.env.GOOGLE_KEY+"&limit=1"
        try {
            let a = await tiny.get({
                url
            })
            return a.body.results[0].url
        } catch (error) {
            return "оу.. а тут нету гифки, прости"
        }
    }
}