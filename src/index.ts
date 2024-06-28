import express, { Request, Response } from "express"; 
import dotenv from "dotenv"; 
import bodyParser from 'body-parser';

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

app.post('/api/db/store', (req: Request, res: Response) => {
    // Call this when storing to database
    console.log("Storing to database.") 
    console.log("Payload: ", req.body) 
    // Store to db here 
    res.status(200).json({message: "Stored to database: " + req.body})
 })

app.get('/api/db/monthly-data', (req: Request, res: Response) => {
    // Call this when generating a monthly report
    console.log("Getting data") 
    // Get data from db here 
    res.status(200).json({message: "Getting data from database"})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})