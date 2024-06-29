import express, { Request, Response } from "express";  
import dotenv from "dotenv"; 
import bodyParser from 'body-parser'; 
import { ApiEndpoints } from './constants';

dotenv.config() 

const app = express() 
const port = process.env.PORT 

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => { 
    res.status(200).json({message: "Welcome"})
}) 

app.post('/test', (req: Request, res: Response) => {
    console.log("This is a test endpoint") 
    console.log("Received payload: ", req.body)
    res.status(200).json({message: "This is a test endpoint"})
}) 

app.post(ApiEndpoints.DB_STORE, (req: Request, res: Response) => {
    // Call this when storing to database
    console.log("Storing to database.") 
    console.log("Payload: ", req.body) 
    // Store to db here 
    res.status(200).json({message: "Stored to database: " + req.body})
 })

app.get(ApiEndpoints.DB_MONTHLY_DATA, (req: Request, res: Response) => {
    // Call this when generating a monthly report
    console.log("Getting data") 
    // Payload 
    // Get start and end date 
    const { start_date, end_date } = req.body   
    const message = `Getting monthly data from ${start_date} to ${end_date}`
    console.log(message)
    // Get data from db here 
    res.status(200).json({message: "Getting data from database"})
})

app.get(ApiEndpoints.DB_HISTORY, (req: Request, res: Response) => {
    // Call this when getting history data 
    console.log("Getting history data") 
    res.status(200).json({message: "Getting history data"})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})