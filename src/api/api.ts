import express, { Request, Response } from "express";  
import dotenv from "dotenv"; 
import bodyParser from 'body-parser'; 
import { ApiEndpoints } from '../definitions/constants'; 
import DatabaseManager from '../database/database';

dotenv.config() 

class Server {
    private app: express.Application; 
    private port: string | undefined
    private databaseManager: DatabaseManager

    constructor() {
        console.log("Starting server")
        this.app = express() 
        this.port = process.env.PORT || "3000"
        this.databaseManager = new DatabaseManager()

        this.app.use(bodyParser.json())
        this.setupRoutes()
    } 


    private setupRoutes() {
        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).json({message: "Welcome"}) 
        }) 

        this.app.post(ApiEndpoints.DB_STORE, (req: Request, res: Response) => {
            // Call this when storing to database 
            console.log("Storing to database.") 
            console.log("Payload: ", req.body) 
            // Store to db here 
            this.databaseManager.storeExpenseData(req.body) 
            res.status(200).json({message: "Stored to database: " + req.body})
        }) 
        
        this.app.get(ApiEndpoints.DB_MONTHLY_DATA, (req: Request, res: Response) => {
            // Call this when generating a monthly report 
            console.log("Getting data")  
            // Payload 
            // Get start and end date
            const { startDate, endDate } = req.body 
            const message = `Getting monthly data from ${startDate} to ${endDate}` 
            console.log(message)
            // Get data from db here 
            this.databaseManager.getExpenseDataFromDates(startDate, endDate)
            res.status(200).json({message: "Getting data from database"})
        })

        this.app.get(ApiEndpoints.DB_HISTORY, (req: Request, res: Response) => {
            // Call this when getting history data 
            const { username } = req.body
            console.log("Getting history data") 
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
            console.log("Clearing database") 
            this.databaseManager.clearDatabase()
            res.status(200).json({message: "Database cleared"})
        }) 
        
        this.app.post(ApiEndpoints.DB_AUTH_REGISTER, async (req: Request, res: Response) => {
            // Call this when registering a user 
            console.log("Registering user")   
            this.databaseManager.registerUser(req.body).then((registered) => {
                if (registered) {
                    res.status(200).json({message: `User ${req.body.username} registered succesfully.`})
                } else {
                    res.status(400).json({message: `Failed to register user ${req.body.username}. User already exists.`})
                }
            })
        }) 

        this.app.post(ApiEndpoints.DB_AUTH_LOGIN, async (req: Request, res: Response) => {
            // Call this when logging in a user 
            console.log("Logging in") 
            this.databaseManager.loginUser(req.body).then((success) => {
                if (success) {
                    res.status(200).json({message: "Logged in successfully."}) 
                } else {
                    res.status(401).json({message: "Login failed. Username or password may be incorrect."})
                }
            })
        })
    }
    
    public start() {
        this.app.listen(Number(this.port), '0.0.0.0', 511, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

}

export default Server