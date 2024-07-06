import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";  
import { ExpenseData, UserData, ExpenseJson } from "./templates";
import AuthManager from "./auth/auth";
import { logger } from '../utils/logger';
import { getStartAndEndDatesForCurrentMonth } from "../utils/utils";



dotenv.config(); 

class DatabaseManager {
    private client: RedisClientType; 
    public authManager: AuthManager;
    public monthlyData: ExpenseJson[];

    constructor () {
        this.client = createClient ({ 
            url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        }); 
        
        this.authManager = new AuthManager(this.client); 
        this.client.connect().catch(console.error);   
        this.monthlyData = [] as ExpenseJson[] 
        this.initializeMonthlyData()
    }

    private formatDate(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with leading zero if needed
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month (zero-based) and pad with leading zero if needed
        const year = date.getFullYear().toString(); // Get full year
        return `${month}-${day}-${year}`;
    } 

    async initializeMonthlyData(): Promise<ExpenseJson[]> {
        const { startDate, endDate } = getStartAndEndDatesForCurrentMonth()  
        this.monthlyData = await this.getExpenseDataFromDates(this.formatDate(startDate), this.formatDate(endDate)) 
        return this.monthlyData
    }

    async registerUser(userData: { name: string, username: string, password: string}) { 
        const user: UserData = { 
            name: userData.name,
            username: userData.username, 
            password: userData.password
        }
        const logger_message = `Registering User: ${user.username}` 
        logger.info(logger_message)
        return await this.authManager.registerUser(user)
    }

    async loginUser(userData: {name: string, username: string, password: string}) { 
        const user: UserData = {  
            name: "",  // This will be empty when logging in
            username: userData.username, 
            password: userData.password
        } 
        logger.info(`Authenticating user: ${user.username}`)
        return await this.authManager.authenticateUser(user)
    }

    async storeExpenseData(expenseData: { username: string, category: string, description: string, amount: string, date: string}) {  
        logger.info('Storing expense data.')
        this.authManager.user = expenseData.username 
        const data: ExpenseData = new ExpenseData(expenseData.category, expenseData.description, expenseData.amount, this.authManager.user, expenseData.date)
        const jsonData = data.asJson()  
        // console.log(jsonData) 
        await this.client.hSet(`expense:${this.authManager.user}:${Date.now()}`, jsonData); 
    } 

    async exportExpenseDataAsCsv() {}   

    async getExpenseDataFromDates(startDate: string, endDate: string): Promise<ExpenseJson[]> { 
        
        const start = new Date(startDate)
        const end = new Date(endDate) 

        const result: ExpenseJson[] = []; 
        const keys = await this.client.keys(`expense:${this.authManager.user}:*`);  // Add key prefix here 
        for (const key of keys) {
            const data = await this.client.hGetAll(key); 
            
            let date = new Date(Number(data.date));  
            date = new Date(date.getTime() - 8 * 60 * 60 * 1000)
            if (date >= start && date <= end) { 
                // parse json data here  
                const expenseData: ExpenseData = new ExpenseData(data.category, data.description, data.amount, this.authManager.user, this.formatDate(date))
                result.push(expenseData.asJson());
            }
        } 
        this.monthlyData = result
        return result;
    } 

    async getAllExpenseData(username: string): Promise<ExpenseJson[]> {

        const result: ExpenseJson[] = []; 
        const keys = await this.client.keys(`expense:${username}:*`)
        for (const key of keys) {
            const data = await this.client.hGetAll(key); 
            const expenseData: ExpenseData = new ExpenseData(data.category, data.description, data.amount, username, data.date) 
            result.push(expenseData.asJson()) 
        }
        // console.log(result)
        return result; 
    }

    async clearDatabase() {
        await this.client.flushDb();
    }
}

export default DatabaseManager;
