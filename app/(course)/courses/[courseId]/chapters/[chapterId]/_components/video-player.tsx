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
  console.log(existingQuizData.questions)
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
    <div className="relative aspect-video">
      {existingQuizData.questions.map((thisquestion: any, questionIndex: number) => (
        <div key={questionIndex} className="">
          <h1>{thisquestion.question}</h1>
          {thisquestion.answers.map((answer: string, answerIndex: number) => (
            <ul key={answerIndex}>
              <button
              onClick={() => handleButtonClick(questionIndex, answerIndex, thisquestion.correctAnswerIndex)}
              disabled={selectedAnswers[questionIndex] !== null} // Disable the button if the answer has been selected
              style={{
                backgroundColor:
                  selectedAnswers[questionIndex]?.answerIndex === answerIndex
                    ? selectedAnswers[questionIndex]?.isCorrect
                      ? 'rgba(16, 185, 129, 0.5)' // Lighter green with transparency
                      : 'rgba(239, 68, 68, 0.5)' // Lighter red with transparency
                    : 'transparent',
                padding: '10px', // Adjust padding as needed
                borderRadius: '8px', // Add rounded corners
              }}
            >
              {answer}
            </button>
            </ul>
          ))}
        </div>
      ))}
      <div className="mx-auto">
        {/* <h2 className="p-2 font-bold">Current Score: {calculateFinalScore()}%</h2> */}
        <Button
            onClick={()=> onEnd()}
              >
                Submit
        </Button>
        {/* <button onClick={()=> onEnd()}>Submit</button> */}
      </div>
    </div>
  );
  // return (
  //   <div className="relative aspect-video">
  //     {existingQuizData.questions.map((thisquestion:any) => (
  //       <div className="">
  //         <h1>{thisquestion.question}</h1>
  //         {thisquestion.answers.map((answer: any) => (
  //           <ul>
  //             <button key= {answer}>
  //               {answer}
  //             </button>
  //           </ul>
  //         ))}
  //       </div>
  //     ))}
  //   </div>
  // )
}