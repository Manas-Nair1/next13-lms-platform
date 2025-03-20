"use client";

import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { useConfettiStore } from "@/hooks/use-confetti-store";
import { db } from "@/lib/db";
import { number } from "zod";
import { Button } from "@/components/ui/button";

interface QuizQuestionProps {
  existingQuizData: any;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
};

export const VideoPlayer = ({
  existingQuizData,
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  title,
}: QuizQuestionProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();
  

  const onEnd = async () => {
    try {
      await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        isCompleted: true,
        score: calculateFinalScore(),
      });


      if (!nextChapterId) {
        confetti.onOpen();
      }

      toast.success("Progress updated");
      router.refresh();

      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
      }
      
    } catch {
      toast.error("Something went wrong");
    }
  }
  // console.log(existingQuizData.questions)
  const [selectedAnswers, setSelectedAnswers] = useState(Array(existingQuizData.questions.length).fill(null));

  const handleButtonClick = (questionIndex: number, answerIndex: number, correctAnswerIndex: number) => {
    const isCorrect = answerIndex === correctAnswerIndex;
    // Update the selected answer for the current question
    const updatedSelectedAnswers = [...selectedAnswers];
    updatedSelectedAnswers[questionIndex] = { answerIndex, isCorrect };
    setSelectedAnswers(updatedSelectedAnswers);
  };
  const calculateFinalScore = () => {
    const correctAnswers = selectedAnswers.filter(answer => answer && answer.isCorrect).length;
    const totalQuestions = existingQuizData.questions.length;
    const finalScore = (correctAnswers / totalQuestions) * 100;
    return finalScore.toFixed(2); // Round the score to two decimal places
  };

  return (
   <div className="p-4">
     {existingQuizData && (
      <div className="relative aspect-video space-y-4">
      {existingQuizData.questions.map((thisquestion: any, questionIndex: number) => (
        <div key={questionIndex} className="p-4 border rounded-lg shadow-md bg-white">
          <h1 className="font-bold mb-2">{thisquestion.question}</h1>
          {thisquestion.answers.map((answer: string, answerIndex: number) => (
            <ul key={answerIndex} className="mb-2">
              <button
              onClick={() => handleButtonClick(questionIndex, answerIndex, thisquestion.correctAnswerIndex)}
              disabled={selectedAnswers[questionIndex] !== null} // Disable the button if the answer has been selected
              className={`w-full text-left p-2 rounded-lg ${
                selectedAnswers[questionIndex]?.answerIndex === answerIndex
                  ? selectedAnswers[questionIndex]?.isCorrect
                    ? 'bg-green-200'
                    : 'bg-red-200'
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              - {answer}
            </button>
            </ul>
          ))}
        </div>
      ))}
      <div className="mx-auto pt-2">
        <Button
            onClick={()=> onEnd()}
              >
                Submit
        </Button>
      </div>
    </div>
    )}
   </div>
  );
}