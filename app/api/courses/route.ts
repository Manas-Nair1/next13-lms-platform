// @ts-nocheck
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { title, templateId } = await req.json();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let newCourseData = { userId, title };

    // If a templateId is provided, fetch the template's data and clone it
    if (templateId) {
      const template = await db.course.findUnique({
        where: { id: templateId },
        include: {
          chapters: {
            include: {
              muxData: true,
              videoData: true,
            },
          },
          attachments: true,
          category: true,
        },
      });

      if (!template) {
        return new NextResponse("Template not found", { status: 404 });
      }

      // Clone the template content into the new course data
      newCourseData = {
        ...newCourseData,
        description: template.description,
        imageUrl: template.imageUrl,
        price: template.price,
        categoryId: template.categoryId,
      };

      // Create the new course first to get its ID
      const course = await db.course.create({
        data: newCourseData,
      });

      // Clone chapters
      for (const chapter of template.chapters) {
        const newChapter = await db.chapter.create({
          data: {
            title: chapter.title,
            description: chapter.description,
            videoUrl: chapter.videoUrl,
            position: chapter.position,
            isPublished: chapter.isPublished,
            isFree: chapter.isFree,
            quiztopic: chapter.quiztopic,
            courseId: course.id,
          },
        });

        // Clone videoData and muxData for each chapter
        if (chapter.videoData) {
          await db.videoData.create({
            data: {
              videoUrl: chapter.videoData.videoUrl,
              chapterId: newChapter.id,
            },
          });
        }

        if (chapter.muxData) {
          await db.quizData.create({
            data: {
              questions: chapter.muxData.questions,
              chapterId: newChapter.id,
            },
          });
        }
      }

      // Clone attachments
      const clonedAttachments = template.attachments.map(attachment => ({
        name: attachment.name,
        url: attachment.url,
        courseId: course.id,
      }));

      await db.attachment.createMany({
        data: clonedAttachments,
      });

      return NextResponse.json(course);
    }

    // If no templateId is provided, create the course normally
    const course = await db.course.create({
      data: newCourseData,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const courses = await db.course.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.log("[COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}