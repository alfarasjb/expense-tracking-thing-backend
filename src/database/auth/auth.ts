import { createClient, RedisClientType } from "redis";
import crypto from "crypto";
import dotenv from "dotenv";
import { UserData } from "../templates"; 
import { logger } from '../../utils/logger';


dotenv.config();

class AuthManager {
    private client: RedisClientType;
    public user: string;  
    public name: string; 

    constructor(client: RedisClientType) {
        this.client = client;
        this.user = ""
        this.name = ""
    }

    private userKey = (username: string): string => `user:${username}`; 
    private generateSalt = () => crypto.randomBytes(16).toString('hex'); 
    private generateHashedPassword = (password: string, salt: string) => crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')

    private async userExists(username: string): Promise<boolean> {
        const user = await this.client.hGetAll(`user:${username}`)  
        const exists: boolean = Object.keys(user).length > 0;
        return exists 
    } 

    async registerUser(userData: UserData): Promise<boolean> {
        let { name, username, password } = userData    
        const salt = this.generateSalt()
        password = this.generateHashedPassword(password, salt)
        const value = { name, password, salt }  
        // First check if user exists  
        if (await this.userExists(username)) {  
            // Return if user already exists 
            logger.error(`Failed to register user. User ${username} already exists.`) 
            return false; 
        }
        await this.client.hSet(this.userKey(username), value) 
        return true;
    }

    async authenticateUser(userData: UserData): Promise<boolean> {
        const { username, password } = userData 
        const user = await this.client.hGetAll(this.userKey(username));  
        if (!user) { 
            logger.error(`Failed to authenticate user. User ${username} not found.`)
            return false; 
        }
        const { salt, password: hashedPassword } = user;  // salt taken from db
          
        const authenticated =  this.generateHashedPassword(password, salt) === hashedPassword 
        if (authenticated) {
            logger.info(`User ${username} authenticated successfully.`)
            this.user = username 
            this.name = user.name 
        }
        return authenticated
    }

    async getNameFromUser(username: string): Promise<string> {
        const user = await this.client.hGetAll(this.userKey(username))  
        this.name = user.name 
        return this.name
    }
}

export default AuthManager;



