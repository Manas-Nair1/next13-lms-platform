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

const formSchema = z.object({
  quiztopic: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State variable for loader

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true); // Set isLoading to true when submitting
      axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false); // Set isLoading back to false after submission (success or error)
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
          <Button
            onClick={() => {
              onSubmit({ quiztopic: topicInput });
            }}
            disabled={isLoading} // Disable the button while loading
          >
            {isLoading ? "Saving..." : "Save"} {/* Show "Saving..." text when loading */}
          </Button>
          <div className="text-xs text-muted-foreground mt-4">
            Provide a topic for this chapter&apos;s quiz
          </div>
        </div>
      )}
    </div>
  );
};
