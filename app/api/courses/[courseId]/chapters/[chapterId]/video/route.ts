import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { videoUrl } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const videoData = await db.videoData.upsert({
      where: {
        chapterId: params.chapterId,
      },
      create: {
        videoUrl,
        chapterId: params.chapterId,
      },
      update: {
        videoUrl,
      },
    });

    return NextResponse.json(videoData);
  } catch (error) {
    console.log("[VIDEO_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}