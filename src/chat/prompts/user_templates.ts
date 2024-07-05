// User Prompts

// TODO: FIX DATES  

export function summaryUserPromptTemplate(data: string): string {
    let prompt = `You will be provided with a list of JSON data that contains expenses for the month, in the form of strings. 
        The data contains the following keys: 
            1. Category: This is the category of the expense data. 
            2. Description: This is a short description of the expense data. 
            3. Amount: This is the amount spent, in the currency Php.
            4. Date: This is the date of the expenditure in the format MM-DD-YYYY
            5. User: This is the name of the user.
        
        Your task is to generate a short 3 sentence summary based on the expense data, where you will provide an overview
        of the following information:
            1. Maximum spend, and corresponding details. 
            2. Recommendations in order to cut back on expenses.

        You will only provide the summary based on the relevant keys which are the following: 
            1. Category
            2. Description 
            3. Amount

        You will always respond in a string format.
        
        The data is as follows: ${data}`
    return prompt 
}

export function genericUserChatPromptTemplate(data: string, message: string): string {
    let prompt = `You will be provided with a query from the user, and a list of JSON data that contains expenses for the month in the form of strings.
    Your task is to respond to the user query and use the expenses as a reference. 

    The data contains the following keys: 
        1. Category: This is the category of the expense data. 
        2. Description: This is a short description of the expense data. 
        3. Amount: This is the amount spent, in the currency Php.
        4. Date: This is the date of the expenditure in the format MM-DD-YYYY
        5. User: This is the name of the user.

    The data is as follows: ${data}

    The query is as follows: ${message}

    You will always respond in a string format.
    `

    return prompt

}