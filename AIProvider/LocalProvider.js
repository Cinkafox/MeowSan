import BaseProvider from "./BaseProvider.js"
import {LlamaModel, LlamaContext, LlamaChatSession, LlamaChatPromptWrapper, ChatMLChatPromptWrapper, GeneralChatPromptWrapper,FalconChatPromptWrapper,ChatPromptWrapper} from "node-llama-cpp";

export default class LocalProvider extends BaseProvider{
    /**
     * @type {LlamaModel}
     */
    model;
     /**
     * @type {LlamaContext}
     */
    context;
     /**
     * @type {LlamaChatSession}
     */
    session;

    constructor(){
        super()
        this.model = new LlamaModel({
            modelPath: "/home/Cinka/projects/cpp/llama.cpp/models/dol.gguf"
        });
        this.context = new LlamaContext({model:this.model});
        this.session = new LlamaChatSession({
            context: this.context,
            //promptWrapper: new MyCustomChatPromptWrapper(),
            systemPrompt: "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe.  Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information."
        });
        console.log(this.context.getBosString())
    }

    /**
     * 
     * @param {string} user 
     * @param {string} message 
     * @returns {Promise<string>}
     */
    async prompt(user,message){
        super.prompt(user,message);
        return await this.session.prompt(message)
    }
}
