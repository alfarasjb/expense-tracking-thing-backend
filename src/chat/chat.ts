import OpenAI from "openai";  
import { SUMMARY_PROMPT_TEMPLATE } from "./prompts/system_templates";
import { USER_PROMPT_TEMPLATE } from "./prompts/user_templates";
import { ChatModels } from "../constants";

class ChatBot {
    private openai: OpenAI  

    constructor() {
        this.openai = new OpenAI()
    } 
    
    async generate_summary_with_chat_model(): Promise<string | null> { 
        const completion = await this.openai.chat.completions.create({
            messages: [{
                role: "system", 
                content: SUMMARY_PROMPT_TEMPLATE
            },
            {
                role: "user",
                content: USER_PROMPT_TEMPLATE
            }
        ],
        model: ChatModels.GPT_3_5_TURBO
        })
        return completion.choices[0].message.content;
    }
}

export default ChatBot;