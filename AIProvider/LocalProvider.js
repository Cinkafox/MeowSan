import History from "../Data/History.js";
import BaseProvider from "./BaseProvider.js";
import {LlamaModel, LlamaContext, LlamaChatSession, LlamaChatPromptWrapper, ChatMLChatPromptWrapper, GeneralChatPromptWrapper,FalconChatPromptWrapper,ChatPromptWrapper} from "node-llama-cpp";
import Prompt from "../Data/Prompt.js";
import Logger from "../Utils/Logger.js";

export default class LocalProvider extends BaseProvider{
    /**
     * @type {LlamaModel}
     */
    model;
     /**
     * @type {LlamaContext}
     */
    context;
    session;

    constructor(){
        super()
        this.model = new LlamaModel({
            modelPath: process.env.MODEL_PATH
        });
        this.context = new LlamaContext({model:this.model});
    }

    /**
     * 
     * @param {string} user 
     * @param {string} message 
     * @param {History} history 
     * @returns {Promise<string>}
     */
    async prompt(user,message,history){
        super.prompt(user,message,history);

        if(this.session === undefined){
            Logger.info("CREATING NEW SESSION FOR LOCAL")
            this.session = new LlamaChatSession({
                context: this.context,
                promptWrapper: new MyCustomChatPromptWrapper(),
                systemPrompt: this.Parse(history)
            });
        }

        message = user + " написал:" + message

        history.append(new Prompt("user",message));

        const text = await this.session.prompt(message,{
            repeatPenalty: {
                lastTokens: 36,
                penalty: 1.2,
                penalizeNewLine: true,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1,
            },
            temperature: 0.8,
            topK: 40,
            topP: 0.02
        });

        history.append(new Prompt("assistant",text));

        Logger.info("LOCAL response:",text);
        return text;
    }


    /**
     * 
     * @param {History} history 
     */
    Parse(history){
        var out = "";
        for (const item of history.items) {
            if(item.role === "system"){
                out += item.content + "\n";
                continue;
            }
        out += item.role.toUpperCase() + ": " + item.content + "\n";
        };

        return out;
    }
}


class MyCustomChatPromptWrapper extends ChatPromptWrapper {
    wrapperName = "MyCustomChat";
    
    wrapPrompt(prompt, {systemPrompt, promptIndex}) {
        if (promptIndex === 0) {
            return  systemPrompt + "\nUSER: " + prompt + "\nASSISTANT:";
        } else {
            return "USER: " + prompt + "\nASSISTANT:";
        }
    }

    getStopStrings(){
        return ["USER:"];
    }

    getDefaultStopString(){
        return "USER:";
    }
}