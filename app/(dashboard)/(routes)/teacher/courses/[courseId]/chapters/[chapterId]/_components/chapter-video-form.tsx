"use client"
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chapter } from "@prisma/client";
import { Pencil, PlusCircle } from "lucide-react";

interface ChapterVideoFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
};

interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

const formSchema = z.object({
  quiztopic: z.string().min(1),
  questions: z.array(z.object({
    question: z.string().min(1),
    answers: z.array(z.string()),
    correctAnswerIndex: z.number()
  })).optional()
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualQuestion, setManualQuestion] = useState<QuizQuestion>({
    question: "",
    answers: ["", "", "", ""],
    correctAnswerIndex: 0
  });

  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const handleAnswerChange = (index: number, value: string) => {
    setManualQuestion(prev => ({
      ...prev,
      answers: prev.answers.map((ans, i) => i === index ? value : ans)
    }));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const addManualQuestion = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        quiztopic: topicInput,
        questions: [manualQuestion]
      });
      toast.success("Question added successfully");
      setShowManualInput(false);
      setManualQuestion({
        question: "",
        answers: ["", "", "", ""],
        correctAnswerIndex: 0
      });
      router.refresh();
    } catch (error) {
      toast.error("Failed to add question");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizWithGpt = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        quiztopic: topicInput,
        useGpt: true
      });
      toast.success("Quiz generated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter Quiz
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              {!initialData.videoUrl ? (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add an Assignment
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Assignment
                </>
              )}
            </>
          )}
        </Button>
      </div>
      {isEditing && (
        <div>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="border p-2 my-2 w-full"
            placeholder="Enter quiz topic"
          />
          
          <div className="flex gap-x-2 mb-4">
            <Button
              onClick={() => onSubmit({ quiztopic: topicInput })}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Topic"}
            </Button>
            <Button
              onClick={() => setShowManualInput(true)}
              variant="outline"
              disabled={!topicInput}
            >
              Add Manual Question
            </Button>
            <Button
              onClick={generateQuizWithGpt}
              variant="outline"
              disabled={!topicInput}
            >
              Generate Quiz
            </Button>
          </div>

          {showManualInput && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <input
                type="text"
                value={manualQuestion.question}
                onChange={(e) => setManualQuestion(prev => ({...prev, question: e.target.value}))}
                className="border p-2 w-full"
                placeholder="Enter question"
              />
              
              <div className="space-y-2">
                {manualQuestion.answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="border p-2 flex-1"
                      placeholder={`Answer ${index + 1}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={manualQuestion.correctAnswerIndex === index}
                      onChange={() => setManualQuestion(prev => ({...prev, correctAnswerIndex: index}))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-x-2">
                <Button
                  onClick={addManualQuestion}
                  disabled={isLoading || !manualQuestion.question || manualQuestion.answers.some(a => !a)}
                >
                  {isLoading ? "Adding..." : "Add Question"}
                </Button>
                <Button
                  onClick={() => setShowManualInput(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            Provide a topic for this chapter&apos;s quiz and add questions manually or generate a quiz using GPT.
          </div>
        </div>
      )}
    </div>
  );
};