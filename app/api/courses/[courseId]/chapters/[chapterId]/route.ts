import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


import { db } from "@/lib/db";
import { getQuiz } from "./components/gpt";

type Quiz = {
  questions: Array<{
    question: string;
    answers: string[];
    correctAnswerIndex: number;
  }>;
};




export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      }
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      }
    });

    if (!chapter) {
      return new NextResponse("Not Found", { status: 404 });
    }


    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId
      }
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// export async function PATCH(
//   req: Request,
//   { params }: { params: { courseId: string; chapterId: string } }
// ) {
//   try {
    
//     const { userId } = auth();
//     const { isPublished, ...values } = await req.json();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const ownCourse = await db.course.findUnique({
//       where: {
//         id: params.courseId,
//         userId
//       }
//     });

//     if (!ownCourse) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const chapter = await db.chapter.update({
//       where: {
//         id: params.chapterId,
//         courseId: params.courseId,
//       },
//       data: {
//         ...values,
//       }
//     });

//     if (values.quiztopic) {
//       const existingQuizData = await db.quizData.findFirst({
//         where: {
//           chapterId: params.chapterId,
//         }
//       });

//       if (existingQuizData) {
//         await db.quizData.delete({
//           where: {
//             id: existingQuizData.id,
//           }
//         });
//       }

//       // const asset = await getQuiz(values.quiztopic)
//       // // console.log(asset)
//       // const json = JSON.parse(asset.replace(/`/g, ''))
//       const json = await getQuiz(values.quiztopic);
//       // console.log(json)
//       await db.quizData.create({
//         data: {
//           chapterId: params.chapterId,
//           questions: json
//         }
//       });
//     }

//     return NextResponse.json(chapter);
//   } catch (error) {
//     console.log("[COURSES_CHAPTER_ID]", error);
//     return new NextResponse("Internal Error", { status: 500 }); 
//   }
// }
export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, questions, ...values } = await req.json();

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

      let quizData;
      
      // If manual questions are provided, format them to match GPT structure
      if (questions) {
        quizData = {
          questions: questions.map((q: any) => ({
            question: q.question,
            answers: q.answers,
            correctAnswerIndex: q.correctAnswerIndex
          }))
        };
      } 
      // Otherwise, generate questions using GPT
      else {
        quizData = await getQuiz(values.quiztopic);
      }

      // Create quiz data with consistent structure
      await db.quizData.create({
        data: {
          chapterId: params.chapterId,
          questions: quizData
        }
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}