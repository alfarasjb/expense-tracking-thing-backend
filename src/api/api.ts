import express, { Request, Response } from "express";  
import dotenv from "dotenv"; 
import bodyParser from 'body-parser'; 
import { ApiEndpoints } from '../definitions/constants'; 
import DatabaseManager from '../database/database'; 
import { logger } from '../utils/logger'; 
import ChatBot from '../chat/chat';
import { ExpenseJson } from '../database/templates';
import { getStartAndEndDatesForCurrentMonth } from "../utils/utils";

dotenv.config() 


class Server {
    private app: express.Application; 
    private port: string | undefined
    private databaseManager: DatabaseManager 
    private chatbot: ChatBot

    constructor() {
        console.log("Starting server")
        this.app = express() 
        this.port = process.env.PORT || "3000"
        this.databaseManager = new DatabaseManager() 
        this.chatbot = new ChatBot()

        this.app.use(bodyParser.json())
        this.setupRoutes()  
    } 


    private setupRoutes() {
        this.app.get('/', (req: Request, res: Response) => { 
            const message = "Welcome"
            logger.info(message)
            res.status(200).json({message: message}) 
        }) 

        this.app.post(ApiEndpoints.DB_STORE, (req: Request, res: Response) => {
            // Call this when storing to database   
            const message = `Storing to database. Payload: ${req.body}` 
            logger.info(message)
            // Store to db here 
            this.databaseManager.storeExpenseData(req.body) 
            res.status(200).json({message: "Stored to database: " + req.body})
        }) 
        
        this.app.get(ApiEndpoints.DB_MONTHLY_DATA, (req: Request, res: Response) => {
            // Call this when generating a monthly report  
            const logger_message = "Getting data"
            logger.info(logger_message)  
            // Payload 
            // Get start and end date
            const { start_date: startDate, end_date: endDate  } = req.body 
            const message = `Fetching history data from ${startDate} to ${endDate}` 
            logger.info(message)
            // Get data from db here 
            this.databaseManager.getExpenseDataFromDates(startDate, endDate).then((expenseData: ExpenseJson[]) => { 
                if (expenseData.length > 0) {  
                    // Compare length with stored summary
                    this.databaseManager.getChatSummary().then(([storedSummary, numDataPoints]) => { 
                        // TODO: Improve this 
                        logger.info(`Stored Data points: ${numDataPoints}. Expense Data: ${expenseData.length}`)
                        if (expenseData.length == numDataPoints) {   
                            logger.info("Using stored summary.")
                            // Same Data. Return stored summary 
                            res.status(200).json({message: message, data: expenseData, summary: storedSummary})
                        } else {
                            // Generate new summary 
                            this.chatbot.generateSummaryWithChatModel(expenseData).then((summary) => { 
                                logger.info("Generating new chatbot summary.")
                                // Store summary and length to db   
                                const summaryString: string = summary as string
                                this.databaseManager.storeChatSummary(summaryString, expenseData.length)  
                                res.status(200).json({message: message, data: expenseData, summary: summary})
                            })
                        }
                    })
                } else {
                    res.status(200).json({message: `No expenses from ${startDate} to ${endDate}`})
                }
            })
        })

        this.app.get(ApiEndpoints.DB_HISTORY, (req: Request, res: Response) => {
            // Call this when getting history data 
            const { username } = req.body 
            const logger_message = "Getting history data"
            logger.info(logger_message)  
            this.databaseManager.getAllExpenseData(username).then((expenseData) => {
                if (expenseData.length > 0) {
                    res.status(200).json({message: "Fetching history data.", data: expenseData}) 
                } else {
                    res.status(200).json({message: `No expense data found for user ${this.databaseManager.authManager.user}`})
                }
            })
        })

        this.app.post(ApiEndpoints.DB_CLEAR, (req: Request, res: Response) => {
            // Call this when clearing databse 
            const logger_message = "Clearing database"
            logger.info(logger_message)
            this.databaseManager.clearDatabase()
            res.status(200).json({message: "Database cleared"})
        }) 
        
        this.app.post(ApiEndpoints.DB_AUTH_REGISTER, async (req: Request, res: Response) => {
            // Call this when registering a user 
            const logger_message = "Registering user" 
            logger.info(logger_message)   
            this.databaseManager.registerUser(req.body).then((registered) => {
                if (registered) {
                    res.status(200).json({message: `User ${req.body.username} registered succesfully.`, name: this.databaseManager.authManager.name})
                } else {
                    res.status(400).json({message: `Failed to register user ${req.body.username}. User already exists.`})
                }
            })
        }) 

        this.app.post(ApiEndpoints.DB_AUTH_LOGIN, async (req: Request, res: Response) => {
            // Call this when logging in a user  
            const logger_message = "Logging in" 
            logger.info(logger_message)
            this.databaseManager.loginUser(req.body).then((success) => {
                if (success) {
                    res.status(200).json({message: "Logged in successfully.", name: this.databaseManager.authManager.name}) 
                } else {
                    res.status(401).json({message: "Login failed. Username or password may be incorrect."})
                }
            })
        })

        this.app.post(ApiEndpoints.CHATBOT_MESSAGE, async (req: Request, res: Response) => { 
            // Call this when a user wants to chat with chatbot 
            // TODO: Fix this 
            const { user, message } = req.body  
            if (this.databaseManager.authManager.user == "") {
                this.databaseManager.authManager.user = user  // Set the user if none
            }
            logger.info(`Sending message to chatbot: ${message}`)  
            //res.status(200).json({message: message})  
            const monthlyData = this.databaseManager.monthlyData as ExpenseJson[] 
            if (monthlyData.length == 0) {
                this.databaseManager.initializeMonthlyData().then((monthlyData) => {
                    this.sendChatBotMessage(message, monthlyData, res)
                })
            } else {
                this.sendChatBotMessage(message, monthlyData, res) 
            }
        })
    }
    
    private sendChatBotMessage(message: string, monthlyData: ExpenseJson[], res: Response): any {
        this.chatbot.sendMessageToChatBot(message, monthlyData).then((chatbotResponse) => {
            if (chatbotResponse !== null) {
                res.status(200).json({message: chatbotResponse})
            } else {
                logger.error("no response from chatbot")
                res.status(404)
            }
        })
    }

    public start() {
        this.app.listen(Number(this.port), '0.0.0.0', 511, () => { 
            logger.info(`Server is running on port ${this.port}`); 
        });
    }

}

export default Server