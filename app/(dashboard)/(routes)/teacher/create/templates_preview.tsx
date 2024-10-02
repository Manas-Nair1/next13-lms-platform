import { db } from "@/lib/db";

import { DataTable } from "../courses/_components/data-table";
import { columns } from "../courses/_components/columns";

const CoursesPageTemplate = async () => {
  const courses = await db.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return ( 
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
   );
}
 
export default CoursesPageTemplate;