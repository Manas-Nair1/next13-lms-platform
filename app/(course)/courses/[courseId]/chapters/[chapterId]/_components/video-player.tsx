"use client";

import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

import { useConfettiStore } from "@/hooks/use-confetti-store";
import { db } from "@/lib/db";

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
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  }
  console.log(existingQuizData.questions)

  return (
    <div className="relative aspect-video">
      <h1>{existingQuizData.questions[0].question}</h1>
      {existingQuizData.questions[0].answers.map((answer: any) => (
        <p>{answer}</p>
      ))}
      {/* <div>{existingQuizData.questions[0].answers.map((answer: String) => (
        <p>{answer}</p>
      ))}</div> */}
    </div>
  )
}