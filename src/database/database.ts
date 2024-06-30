import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";  
import { ExpenseData, UserData } from "./templates";
import AuthManager from "./auth/auth";


dotenv.config(); 

class DatabaseManager {
    private client: RedisClientType; 
    private authManager: AuthManager;

    constructor () {
        this.client = createClient ({ 
            url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        }); 
        this.authManager = new AuthManager(this.client);
        this.client.connect().catch(console.error);
    } 
    async registerUser(userData: {username: string, password: string}) { 
        const user = new UserData(userData.username, userData.password) 
        return await this.authManager.registerUser(user)
    }

    async loginUser(userData: {username: string, password: string}) {
        const user = new UserData(userData.username, userData.password)
        return await this.authManager.authenticateUser(user)
    }

    async storeExpenseData(expenseData: { category: string, description: string, amount: string }) { 
        const data: ExpenseData = new ExpenseData(expenseData.category, expenseData.description, expenseData.amount)
        const jsonData = data.asJson() 
        console.log(jsonData) 
        await this.client.hSet(`expense:${Date.now()}`, jsonData); 
    } 

    async exportExpenseDataAsCsv() {}   

    async getExpenseDataFromDates(startDate: string, endDate: string): Promise<any[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result: ExpenseData[] = [];

        const keys = await this.client.keys('*');  // Add key prefix here 
        for (const key of keys) {
            const data = await this.client.hGetAll(key);
            const date = new Date(data.date);
            if (date >= start && date <= end) { 
                // parse json data here 
                const expenseData: ExpenseData = new ExpenseData(data.category, data.description, data.amount)
                result.push(expenseData);
            }
        }
        return result;
    } 

    async clearDatabase() {
        await this.client.flushDb();
    }
}

export default DatabaseManager;