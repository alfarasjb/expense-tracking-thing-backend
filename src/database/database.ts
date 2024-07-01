import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";  
import { ExpenseData, UserData, ExpenseJson } from "./templates";
import AuthManager from "./auth/auth";


dotenv.config(); 

class DatabaseManager {
    private client: RedisClientType; 
    public authManager: AuthManager;

    constructor () {
        this.client = createClient ({ 
            url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        }); 
        
        this.authManager = new AuthManager(this.client);
        this.client.connect().catch(console.error); 
    }
    async registerUser(userData: {username: string, password: string}) { 
        const user: UserData = {
            username: userData.username, 
            password: userData.password
        }
        return await this.authManager.registerUser(user)
    }

    async loginUser(userData: {username: string, password: string}) {
        const user: UserData = {
            username: userData.username, 
            password: userData.password
        }
        return await this.authManager.authenticateUser(user)
    }

    async storeExpenseData(expenseData: { username: string, category: string, description: string, amount: string }) { 
        this.authManager.user = expenseData.username 
        const data: ExpenseData = new ExpenseData(expenseData.category, expenseData.description, expenseData.amount, this.authManager.user)
        const jsonData = data.asJson() 
        console.log(jsonData) 
        await this.client.hSet(`expense:${this.authManager.user}:${Date.now()}`, jsonData); 
    } 

    async exportExpenseDataAsCsv() {}   

    async getExpenseDataFromDates(startDate: string, endDate: string): Promise<ExpenseData[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result: ExpenseData[] = [];
        
        const keys = await this.client.keys(`expense:${this.authManager.user}:*`);  // Add key prefix here 
        for (const key of keys) {
            const data = await this.client.hGetAll(key);
            const date = new Date(data.date);
            if (date >= start && date <= end) { 
                // parse json data here 
                const expenseData: ExpenseData = new ExpenseData(data.category, data.description, data.amount, this.authManager.user)
                console.log(expenseData.asJson())
                result.push(expenseData);
            }
        }
        return result;
    } 

    async getAllExpenseData(username: string): Promise<ExpenseJson[]> {

        const result: ExpenseJson[] = []; 
        const keys = await this.client.keys(`expense:${username}:*`)
        for (const key of keys) {
            const data = await this.client.hGetAll(key); 
            const expenseData: ExpenseData = new ExpenseData(data.category, data.description, data.amount, username) 
            result.push(expenseData.asJson()) 
        }
        console.log(result)
        return result; 
    }

    async clearDatabase() {
        await this.client.flushDb();
    }
}

export default DatabaseManager;
