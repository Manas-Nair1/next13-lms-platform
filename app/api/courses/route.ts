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
          chapters: true, // Include chapters
          attachments: true, // Include attachments
          category: true, // Include category to get its ID
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
        categoryId: template.categoryId, // Directly use the category ID from the template
      };

      // Clone chapters
      const clonedChapters = template.chapters.map(chapter => ({
        title: chapter.title,
        description: chapter.description,
        videoUrl: chapter.videoUrl,
        position: chapter.position,
        isPublished: chapter.isPublished,
        isFree: chapter.isFree,
        quiztopic: chapter.quiztopic,
        courseId: newCourseData.id, // Set the new course ID (will be created after this point)
      }));

      // Clone attachments
      const clonedAttachments = template.attachments.map(attachment => ({
        name: attachment.name,
        url: attachment.url,
        courseId: newCourseData.id, // Set the new course ID
      }));

      // Create the new course first to get its ID
      const course = await db.course.create({
        data: newCourseData,
      });

      // Now insert chapters and attachments with the new course ID
      await db.chapter.createMany({
        data: clonedChapters.map(chapter => ({
          ...chapter,
          courseId: course.id, // Set the correct course ID
        })),
      });

      await db.attachment.createMany({
        data: clonedAttachments.map(attachment => ({
          ...attachment,
          courseId: course.id, // Set the correct course ID
        })),
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