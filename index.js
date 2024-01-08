import { Client, Message } from "discord.js-selfbot-v13";
import 'dotenv/config';
import NickPipeline from "./TextPipeline/NickPipeline.js";
import GifPipeline from "./TextPipeline/GifPipeline.js";
import GPTProvider from "./AIProvider/GPTProvider.js";
import History from "./Data/History.js";
import Load from "./Utils/HistoryLoader.js";
import fs from "node:fs";
import Logger from "./Utils/Logger.js";
import Serialize from "./Utils/HistorySerializer.js";
import BaseProvider from "./AIProvider/BaseProvider.js";

class Bot{
    client = new Client({
        checkUpdate: false
    });
    /**
     * @type {BaseProvider}
     */
    aiProvider;
    inputPipeline = new NickPipeline();
    outPipeline = new GifPipeline();
    systemMessage = new History();
    messageHistory = new History(this.systemMessage);
    name = "Meow"

    constructor(aiProvider,profileName){
        if(profileName != undefined){
            this.LoadProfile(profileName)
        }

        this.aiProvider = aiProvider;
        this.client.on("ready",(m)=>this.#onReady(m));
        this.client.on("messageCreate",(m)=>this.#onMessageCreate(m));
        this.client.login(process.env.KEY);
    }

    #onReady(){
        Logger.info("BOT IS READY:",this.name)
    }

    /**
     * 
     * @param {Message} message 
     */
    async #onMessageCreate(message){
        const author = message.author.username;
        if (author === message.client.user.username) return;
        if (!message.content.toLocaleLowerCase().includes(this.name)) return;

        message.channel.sendTyping();
        
        let text = await this.inputPipeline.resolve(message.content,message);
        Logger.info(author," написал:",text);

        let res = await this.aiProvider.prompt(author,text,this.messageHistory);
        let outText = await this.outPipeline.resolve(res,message);
        if(outText.length !== 0){
            message.channel.send(outText);
            Logger.info(outText);
        }

        Logger.debug(Serialize(this.messageHistory));
    }

    LoadProfile(name){
        if(name !== this.name){
            this.messageHistory.clear(true);
        }

        this.name = Load(fs.readFileSync("BotProfiles/"+name+".log").toString(),this.systemMessage);
    }
}


new Bot(new GPTProvider(),"kravchenko")