
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { File } from "lucide-react";

import { getChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";

import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgressButton } from "./_components/course-progress-button";
import { db } from "@/lib/db";
import { YTPlayer } from "./_components/ytPlayer";

// Add these interfaces at the top of the file with other interfaces
interface VideoData {
  id: string;
  chapterId: string;
  videoUrl: string;
}

interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswerIndex: number;
}

interface QuizData {
  id: string;
  chapterId: string;
  questions: {
    questions: QuizQuestion[];
  };
}
const ChapterIdPage = async ({
  params
}: {
  params: { courseId: string; chapterId: string }
}) => {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/");
  } 

  const {
    chapter,
    course,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/")
  }
 // Update the queries
 const quizData = await db.quizData.findFirst({
  where: {
    chapterId: params.chapterId
  },
  select: {
    id: true,
    chapterId: true,
    questions: true
  }
}) as QuizData | null;
console.log(quizData)
const videoData = await db.videoData.findFirst({
  where: {
    chapterId: params.chapterId
  },
  select: {
    id: true,
    chapterId: true,
    videoUrl: true
  }
}) as VideoData | null;


  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  return ( 
    <div>
      {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="You already completed this chapter."
        />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to enroll for your teacher to see scores."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        <div className="p-4">
          {videoData?.videoUrl && (
            <YTPlayer
              videoUrl={videoData.videoUrl}
              title={chapter.title}
              autoplay={completeOnEnd}
            />
            )}
            <Separator />
          {quizData && (
            <VideoPlayer
            existingQuizData={quizData?.questions}
            chapterId={params.chapterId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
          />
          )}
        </div>
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">
              {chapter.title}
            </h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>
          {!!attachments.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a 
                    href={attachment.url}
                    target="_blank"
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">
                      {attachment.name}
                    </p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
   );
}
 
export default ChapterIdPage;