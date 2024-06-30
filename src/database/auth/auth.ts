import { createClient, RedisClientType } from "redis";
import crypto from "crypto";
import dotenv from "dotenv";
import { UserData } from "../templates";

dotenv.config();

class AuthManager {
    private client: RedisClientType;

    constructor(client: RedisClientType) {
        this.client = client;
    }
    
    private async userExists(username: string): Promise<boolean> {
        const user = await this.client.hGetAll(`user:${username}`) 
        return Object.keys(user).length > 0; 
    } 
    
    private userKey(username: string): string {
        return `user:${username}`
    }

    async registerUser(userData: UserData): Promise<boolean> {
        const { username, password, salt } = userData  
        const value = { password, salt }  // This password is already hashed and salted in UserData  
        // First check if user exists  
        if (await this.userExists(username)) {  
            // Return if user already exists
            console.log("User already exists")
            return false; 
        }
        await this.client.hSet(this.userKey(username), value) 
        return true;
    }

    async authenticateUser(userData: UserData): Promise<boolean> {
        // Fix this
        const { username, password } = userData 
        const user = await this.client.hGetAll(this.userKey(username)); 
        if (!user) {
            return false; 
        }
        const { salt, password: hashedPassword } = user;  
        return userData.hashPassword(password, salt) === hashedPassword; 
    }
}

export default AuthManager;
