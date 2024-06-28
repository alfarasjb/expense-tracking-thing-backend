import express, { Request, Response } from "express"; 
import dotenv from "dotenv"; 

dotenv.config() 

const app = express() 
const port = process.env.PORT 


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({message: "Welcome"})
}) 

app.get('/test', (req: Request, res: Response) => {
    console.log("This is a test endpoint")
    res.status(200).json({message: "This is a test endpoint"})
}) 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})