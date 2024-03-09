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

interface Quizprops {
    quizdata: any
}

export const QuizPreview = ({quizdata}: Quizprops) => {
    return (
        <div className="relative aspect-video">
          {quizdata.questions.map((thisquestion: any, questionIndex: number) => (
            <div key={questionIndex} className="">
              <h1 className="p-2"> Question: {thisquestion.question}</h1>
              <p className="p-2"> Answer: {thisquestion.answers[thisquestion.correctAnswerIndex]}</p>
            </div>
          ))}
          <div>
          </div>
        </div>
      );
}