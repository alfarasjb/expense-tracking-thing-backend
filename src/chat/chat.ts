import { OpenAI } from "openai";  
import { SUMMARY_PROMPT_TEMPLATE } from "./prompts/system_templates";
import { USER_PROMPT_TEMPLATE } from "./prompts/user_templates";
import { ChatModels } from "../definitions/constants";

class ChatBot {
    private openai: OpenAI  

    constructor() {
        this.openai = new OpenAI()
    } 
    
    async generateSummaryWithChatModel(): Promise<string | null> {  
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = this.createMessage(
            SUMMARY_PROMPT_TEMPLATE,
            USER_PROMPT_TEMPLATE
        )
        return this.chat(messages)
    } 

    private createMessage(systemPrompt: string, userPrompt: string): OpenAI.Chat.ChatCompletionMessageParam[] {
        return [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ]
    }

    private async chat(messages: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string | null> { 
        
        const completion = await this.openai.chat.completions.create({
            messages: messages,
            model: ChatModels.GPT_3_5_TURBO
        })
        return completion.choices[0].message.content;
    }
}

export default ChatBot;