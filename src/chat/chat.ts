import { OpenAI } from "openai";  
import { SUMMARY_PROMPT_TEMPLATE, USER_CHAT_SYSTEM_PROMPT_TEMPLATE } from "./prompts/system_templates";
import { summaryUserPromptTemplate, genericUserChatPromptTemplate } from "./prompts/user_templates";
import { ChatModels } from "../definitions/constants";
import dotenv from "dotenv";  
import { ExpenseJson } from "../database/templates";


dotenv.config()

// TODO: Improve prompts 
class ChatBot {
    private openai: OpenAI 
    private chatHistory: OpenAI.Chat.ChatCompletionMessageParam[]

    constructor() { 
        this.openai = new OpenAI()  
        this.chatHistory = []
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
        /*
        Check if there is history 
        If there is history, get last 6, and add the user message (exclude the system prompt) 
        
        If there is no history, create new messages 
        */ 
       let messages = []
       if (this.chatHistory.length > 0) {
            // history has contents 
            const chatHist = this.chatHistory.slice(-6)  // Get last 6 messages 
            const histAndMessage: OpenAI.Chat.ChatCompletionMessageParam[] = chatHist.concat([{ role: "user", content: userMessage }])   
            messages = histAndMessage
       } else {
            const messageToChatBot = genericUserChatPromptTemplate(this.convertExpenseJsonToString(data), userMessage) 
            messages = this.createMessage(USER_CHAT_SYSTEM_PROMPT_TEMPLATE, messageToChatBot) 
       } 
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
        const chatbotResponse = completion.choices[0].message.content 
        this.chatHistory = messages.concat([{ role: "assistant", content: chatbotResponse }]) 
        return chatbotResponse
    }
}

export default ChatBot;