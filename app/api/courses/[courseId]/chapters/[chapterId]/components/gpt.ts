import OpenAI from "openai";

export const runtime = 'edge'

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
  });
export async function getQuiz(topic:String) {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
          role: 'user', content: `The topic for our quiz is ${topic}. You should infer this topic to be something regarding K-12 education or college education.`
        },
        {
          role: 'system', content:  `The quiz should have at least 5 questions, and each question should have the question prompt, a list of answer choices, and an index indicating the correct answer. 
          You can include multiple-choice questions. provide a well-structured JSON response that can be read by JSON.Parse. return a json as 
          type Quiz = {
            questions: Array<{
              question: string;
              answers: string[];
              correctAnswerIndex: number;
            }>;
          };`
        }
      ],
    })
    return (await response).choices[0]?.message?.content || ""
  }