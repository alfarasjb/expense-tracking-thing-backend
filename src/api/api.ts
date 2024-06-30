import express, { Request, Response } from "express";  
import dotenv from "dotenv"; 
import bodyParser from 'body-parser'; 
import { ApiEndpoints } from '../definitions/constants';

dotenv.config() 

class Server {
    private app: express.Application; 
    private port: string | undefined

    constructor() {
        console.log("Starting server")
        this.app = express() 
        this.port = process.env.PORT
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
            res.status(200).json({message: "Getting data from database"})
        })

        this.app.get(ApiEndpoints.DB_HISTORY, (req: Request, res: Response) => {
            // Call this when getting history data 
            console.log("Getting history data")
            res.status(200).json({message: "Getting history data"})
        })
    }
    public start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

}

export default Server