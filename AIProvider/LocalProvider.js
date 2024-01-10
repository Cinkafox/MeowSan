import History from "../Data/History.js";
import BaseProvider from "./BaseProvider.js";
import fs from "node:fs";
import {LlamaModel, LlamaContext, LlamaChatSession, LlamaChatPromptWrapper, ChatMLChatPromptWrapper, GeneralChatPromptWrapper,FalconChatPromptWrapper,ChatPromptWrapper} from "node-llama-cpp";
import Prompt from "../Data/Prompt.js";

export default class LocalProvider extends BaseProvider{
    /**
     * @type {LlamaModel}
     */
    model;
     /**
     * @type {LlamaContext}
     */
    context;

    constructor(){
        super()
        this.model = new LlamaModel({
            modelPath: "/home/Cinka/Загрузки/openbuddy-llama2-13b-v11.1.Q4_K_M.gguf"
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
        super.prompt(user,message);

        message = user + " написал:" + message

        const session = new LlamaChatSession({
            context: this.context,
            promptWrapper: new MyCustomChatPromptWrapper(),
            systemPrompt: this.Parse(history)
        });

        history.append(new Prompt("user",message));

        const text = await session.prompt(message,{
            repeatPenalty: {
                lastTokens: 24,
                penalty: 1.14,
                penalizeNewLine: true,
                frequencyPenalty: 0.02,
                presencePenalty: 0.02,
            },
            temperature: 0.8,
            topK: 40,
            topP: 0.02
        });

        history.append(new Prompt("assistant",text));
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