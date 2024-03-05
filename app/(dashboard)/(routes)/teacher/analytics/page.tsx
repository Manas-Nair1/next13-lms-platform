//@ts-nocheck
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/actions/get-analytics";

import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import { DataTable } from "../courses/_components/data-table";
import { columns } from "../courses/_components/columns";
import { db } from "@/lib/db";
import CollapsibleComponent from "./_components/gradebook";
import Accordion from "./_components/gradebook";
import { clerkClient } from "@clerk/nextjs/server";


const AnalyticsPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }
  const courses = await db.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  // console.log("courses", courses)
  
  const courseIds = courses.map(course => course.id);
  const chapters = await db.chapter.findMany({
    where: {
      courseId: {
        in: courseIds,
      },
    },
  });

  // console.log("chapter", chapters);
  const grades = await db.userProgress.findMany({
    where: {
      chapterId: {
        in: chapters.map(chapters => chapters.id)
      }
    }
  })
  // console.log("grades", grades)
  
  const {firstName, lastName} = (await clerkClient.users.getUser(userId)) || ""
  // console.log(firstName, lastName)
  
  //chatgpt solution to sorting
  const organizedData = courses.map(async (course) => {
    const chapters = await db.chapter.findMany({
      where: {
        courseId: course.id,
      },
    });
  
    const chapterInfo = await Promise.all(
      chapters.map(async (chapter) => {
        const chapterGrades = await db.userProgress.findMany({
          where: {
            chapterId: chapter.id,
          },
        });
  
        const quizResults = await Promise.all(
          chapterGrades.map(async (grade) => {
            const { firstName, lastName } =
              (await clerkClient.users.getUser(grade.userId)) || {};
            // console.log(firstName, lastName)
            return {
              userName: `${firstName} ${lastName}`,
              score: grade.score,
            };
          })
        );
  
        return {
          chapterTitle: chapter.title,
          quizResults,
        };
      })
    );
    
    return {
      coursetitle: course.title,
      chapterInfo,
    };
  });
  
  let globalVar;
  // Use Promise.all to wait for all async operations to complete
  await Promise.all(organizedData).then((result) => (globalVar = result));
  console.log(globalVar);
  if (globalVar == undefined){
    return(
      <div className="p-6">
        <p>No grades found</p>
      </div>
    )
  } else {

   return ( 
    <div className="p-6">
      {/* <Accordion title="Collapsible content" answer="this should be collapsed"></Accordion> */}
      {/* {globalVar ? <p>{globalVar[1].coursetitle}</p>: <p>else this will be</p>} */}
      
      <div className="w-full p-5">
        {globalVar.map((course, courseIndex) => (
          <div key={courseIndex} className=" bg-blue-200 m-4 p-4 rounded-full">
            <h2>{course.coursetitle}</h2>
            <ul>
              {course.chapterInfo.map((chapter, chapterIndex) => (
                <li key={chapterIndex}>
                  <Accordion title={chapter.chapterTitle} answer={chapter.quizResults}></Accordion>
                  {/* <ul>\
                    {chapter.quizResults.map((result, resultIndex) => (
                      <li key={resultIndex}>
                        User: {result.userId}, Score: {result.score}
                      </li>
                    ))}
                  </ul> */}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
   );
  }
  
  
}
 
export default AnalyticsPage;