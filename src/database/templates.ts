import crypto from "crypto"; 

interface ExpenseJson {
    [key: string]: any;
}

class ExpenseData {
    category: string;
    description: string;
    amount: number;
    date: string
    user: string

    constructor(category: string, description: string, amount: string, username: string, date: string) {
        this.category = category;
        this.description = description;
        this.amount = this.parseAmount(amount);
        this.date = date
        this.user = username
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
    asJson(): ExpenseJson {
        return {
            category: this.category,
            description: this.description,
            amount: this.amount,
            date: this.date,
            user: this.user
        };
    }
}

interface UserData {
    username: string; 
    password: string;
}

export { ExpenseData, UserData, ExpenseJson }