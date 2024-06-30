import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";  

dotenv.config(); 

class DatabaseManager {
    private client: RedisClientType; 

    constructor () {
        this.client = createClient ({ 
            url: `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
        }); 
        this.client.connect().catch(console.error);
    } 

    async storeExpenseData() {} 

    async exportExpenseDataAsCsv() {}  

    async clearDatabase() {
        await this.client.flushDb();
    }
}

export default DatabaseManager;