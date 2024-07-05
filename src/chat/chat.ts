import { OpenAI } from "openai";  
import { SUMMARY_PROMPT_TEMPLATE, USER_CHAT_SYSTEM_PROMPT_TEMPLATE } from "./prompts/system_templates";
import { summaryUserPromptTemplate, genericUserChatPromptTemplate } from "./prompts/user_templates";
import { ChatModels } from "../definitions/constants";
import dotenv from "dotenv";  
import { ExpenseJson } from "../database/templates";


dotenv.config()


class ChatBot {
    private openai: OpenAI  

    constructor() {
        this.openai = new OpenAI() 
    } 
    private convertExpenseJsonToString(expenseData: ExpenseJson[]): string {
        return JSON.stringify(expenseData, null, 2);
    }

    async generateSummaryWithChatModel(data: ExpenseJson[]): Promise<string | null> {  
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = this.createMessage(
            SUMMARY_PROMPT_TEMPLATE,
            summaryUserPromptTemplate(this.convertExpenseJsonToString(data))
        ) 
        const response = await this.chat(messages)
        console.log(response)
        return response
    } 

    async sendMessageToChatBot(userMessage: string, data: ExpenseJson[]): Promise<string | null> {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = this.createMessage(
            USER_CHAT_SYSTEM_PROMPT_TEMPLATE, 
            genericUserChatPromptTemplate(this.convertExpenseJsonToString(data), userMessage)
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