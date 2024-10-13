import OpenAI from "openai";

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
});

export async function getQuiz(topic: string, attempts: number = 0): Promise<any> {
    const maxAttempts = 3;  // Set the maximum number of attempts
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `The topic for our quiz is ${topic}. You should infer this topic to be something regarding K-12 education or college education.`
                },
                {
                    role: 'system',
                    content: `The quiz should have at least 5 questions, and each question should have the question prompt, a list of answer choices, and an index indicating the correct answer. 
                    You can include multiple-choice questions. Provide a well-structured JSON response that can be read by JSON.parse. Return a JSON as 
                    type Quiz = {
                        questions: Array<{
                            question: string;
                            answers: string[];
                            correctAnswerIndex: number;
                        }>;
                    };`
                }
            ],
        });

        const content = response.choices[0]?.message?.content || "";

        // Attempt to parse the JSON
        const json = JSON.parse(content.replace(/`/g, ''));

        return json; // Return the parsed JSON if successful

    } catch (error) {
        console.error("[QUIZ_FETCH_ERROR]", error);

        // Check if we've reached the maximum attempts
        if (attempts < maxAttempts) {
            console.log(`Retrying... Attempt ${attempts + 1} of ${maxAttempts}`);
            return getQuiz(topic, attempts + 1);  // Call the function recursively
        } else {
            throw new Error("Failed to get valid quiz data after multiple attempts.");  // Throw an error after max attempts
        }
    }
}