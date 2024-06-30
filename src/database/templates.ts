import crypto from "crypto"; 

class ExpenseData {
    category: string;
    description: string;
    amount: number;

    constructor(category: string, description: string, amount: string) {
        this.category = category;
        this.description = description;
        this.amount = this.parseAmount(amount);
    }

    parseAmount(value: string | number): number {
        if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
                throw new Error("Invalid amount format");
            }
            return parsedValue;
        } else if (typeof value === 'number') {
            return value;
        } else {
            throw new Error("Invalid type for amount");
        }
    }
    
    asJson() {
        return {
            category: this.category,
            description: this.description,
            amount: this.amount
        };
    }
}

class UserData {
    username: string 
    password: string  
    salt: string

    constructor(username: string, password: string) {
        this.username = username 
        this.salt = crypto.randomBytes(16).toString('hex')
        this.password = this.hashPassword(password, this.salt) 
    } 

    hashPassword(password: string, salt: string) {
        return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
    }
}

export { ExpenseData, UserData }