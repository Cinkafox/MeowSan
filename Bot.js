import { Client, Message } from "discord.js-selfbot-v13";
import NickPipeline from "./TextPipeline/NickPipeline.js";
import GifPipeline from "./TextPipeline/GifPipeline.js";
import History from "./Data/History.js";
import Load from "./Utils/HistoryLoader.js";
import fs from "node:fs";
import Logger from "./Utils/Logger.js";
import Serialize from "./Utils/HistorySerializer.js";
import BaseProvider from "./AIProvider/BaseProvider.js";
import 'dotenv/config';
import { ReadChannesl, ReadUsers, RemoveChannel, RemoveUser, WriteChannel, WriteUser } from "./Utils/Ignore.js";

export default class Bot{
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

    ignoringChannels = ReadChannesl();
    ignoringUsers = ReadUsers()

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
        if (this.ignoringChannels.includes(message.channelId) || author === message.client.user.username || this.ignoringUsers.includes(author)) return;
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
        const raw = fs.readFileSync("BotProfiles/"+name+".txt").toString();
        if(name !== this.name){
            this.messageHistory.clear(true);
        }
        this.name = Load(raw,this.systemMessage);
    }

    AddUserIgnore(user){
        this.ignoringUsers = WriteUser(user).users;
    }

    RemoveUserIgnore(user){
        this.ignoringUsers = RemoveUser(user).users;
    }

    AddChannelIgnore(channel){
        this.ignoringChannels = WriteChannel(channel).channels;
    }

    RemoveChannelIgnore(channel){
        this.ignoringChannels = RemoveChannel(channel).channels;
    }
}