import Mux from "@mux/mux-node";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

type Quiz = {
  questions: Array<{
    question: string;
    answers: string[];
    correctAnswerIndex: number;
  }>;
};
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
});

async function getQuiz(topic:String) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{
        role: 'user', content: `The topic for our quiz is ${topic}. You should infer this topic to be something regarding K-12 education or college education.`
      },
      {
        role: 'system', content:  `The quiz should have at least 10 questions, and each question should have the question prompt, a list of answer choices, and an index indicating the correct answer. 
        You can include multiple-choice questions. Please provide a well-structured JSON response that can be read by JSON.Parse. return a json as 
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


// export async function DELETE(
//   req: Request,
//   { params }: { params: { courseId: string; chapterId: string } }
// ) {
//   try {
//     const { userId } = auth();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const ownCourse = await db.course.findUnique({
//       where: {
//         id: params.courseId,
//         userId,
//       }
//     });

//     if (!ownCourse) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const chapter = await db.chapter.findUnique({
//       where: {
//         id: params.chapterId,
//         courseId: params.courseId,
//       }
//     });

//     if (!chapter) {
//       return new NextResponse("Not Found", { status: 404 });
//     }

//     if (chapter.videoUrl) {
//       const existingMuxData = await db.muxData.findFirst({
//         where: {
//           chapterId: params.chapterId,
//         }
//       });

//       if (existingMuxData) {
//         await Video.Assets.del(existingMuxData.assetId);
//         await db.muxData.delete({
//           where: {
//             id: existingMuxData.id,
//           }
//         });
//       }
//     }

//     const deletedChapter = await db.chapter.delete({
//       where: {
//         id: params.chapterId
//       }
//     });

//     const publishedChaptersInCourse = await db.chapter.findMany({
//       where: {
//         courseId: params.courseId,
//         isPublished: true,
//       }
//     });

//     if (!publishedChaptersInCourse.length) {
//       await db.course.update({
//         where: {
//           id: params.courseId,
//         },
//         data: {
//           isPublished: false,
//         }
//       });
//     }

//     return NextResponse.json(deletedChapter);
//   } catch (error) {
//     console.log("[CHAPTER_ID_DELETE]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      },
      data: {
        ...values,
      }
    });

    if (values.quiztopic) {
      const existingQuizData = await db.quizData.findFirst({
        where: {
          chapterId: params.chapterId,
        }
      });

      if (existingQuizData) {
        await db.quizData.delete({
          where: {
            id: existingQuizData.id,
          }
        });
      }

      const asset = await getQuiz(values.quiztopic)
      console.log(asset)
      const json = JSON.parse(asset)
      console.log(json)
      // try {
      //   const quizObject = JSON.parse(asset);
      //   console.log("Parsed Quiz Object:", quizObject);
      
      //   // Now you can work with the 'quizObject' in your routes.ts file
      // } catch (error) {
      //   console.error("Error parsing GPT-3.5 Turbo response:", error);
      // }
      // console.log("heres string")
      // console.log(String(asset))
      await db.quizData.create({
        data: {
          chapterId: params.chapterId,
          questions: json
        }
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}