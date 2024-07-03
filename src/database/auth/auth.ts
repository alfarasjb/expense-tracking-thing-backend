import { createClient, RedisClientType } from "redis";
import crypto from "crypto";
import dotenv from "dotenv";
import { UserData } from "../templates"; 
import { logger } from '../../utils/logger';


dotenv.config();

class AuthManager {
    private client: RedisClientType;
    public user: string;

    constructor(client: RedisClientType) {
        this.client = client;
        this.user = ""
    }

    private userKey = (username: string): string => `user:${username}`; 
    private generateSalt = () => crypto.randomBytes(16).toString('hex'); 
    private generateHashedPassword = (password: string, salt: string) => crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

    private async userExists(username: string): Promise<boolean> {
        const user = await this.client.hGetAll(`user:${username}`) 
        return Object.keys(user).length > 0; 
    } 

    async registerUser(userData: UserData): Promise<boolean> {
        let { username, password } = userData    
        const salt = this.generateSalt()
        password = this.generateHashedPassword(password, salt)
        const value = { password, salt }  
        // First check if user exists  
        if (await this.userExists(username)) {  
            // Return if user already exists 
            console.log(`User ${username} already exists`)
            return false; 
        }
        await this.client.hSet(this.userKey(username), value) 
        return true;
    }

    async authenticateUser(userData: UserData): Promise<boolean> {
        const { username, password } = userData 
        const user = await this.client.hGetAll(this.userKey(username)); 
        if (!user) {
            return false; 
        }
        const { salt, password: hashedPassword } = user;  // salt taken from db
          
        const authenticated =  this.generateHashedPassword(password, salt) === hashedPassword 
        if (authenticated) {
            this.user = username 
        }
        return authenticated
    }
}

export default AuthManager;



