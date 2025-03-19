import { QuizData } from "@prisma/client";

interface QuizPreviewProps {
  quizdata: QuizData;
}

interface Question {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

export const QuizPreview = ({ quizdata }: QuizPreviewProps) => {
  if (!quizdata || !quizdata.questions) {
    return (
      <div className="relative aspect-video flex items-center justify-center">
        <p className="text-slate-500">No quiz data available</p>
      </div>
    );
  }

  // Parse the JSON data if it's stored as a string
  const questions = typeof quizdata.questions === 'string' 
    ? JSON.parse(quizdata.questions).questions 
    : quizdata.questions;

  return (
    <div className="relative aspect-video">
      {questions.map((thisquestion: Question, questionIndex: number) => (
        <div key={questionIndex} className="">
          <h1 className="p-2">Question: {thisquestion.question}</h1>
          <p className="p-2">
            Answer: {thisquestion.answers[thisquestion.correctAnswerIndex]}
          </p>
          <div className="p-2">
            Options:
            {thisquestion.answers.map((answer: string, index: number) => (
              <div key={index} className="ml-4">
                {index + 1}. {answer}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};