"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Course = {
  id: string;
  title: string;
  createdAt: string;
  description?: string;
};

interface CoursesPageTemplateProps {
  onSelectTemplate: (templateId: string | null) => void;
}

const CoursesPageTemplate: React.FC<CoursesPageTemplateProps> = ({ onSelectTemplate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null); // To track the selected template

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id); // Set the selected template ID
    onSelectTemplate(id); // Call the parent function to pass the selected template ID
  };

  if (!hydrated) return null;
  if (loading) return <p>Loading Templates...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select a Template (Optional)</h1>
      <ul>
        {courses
          .filter((course) => course.title.startsWith("Template")) // Filter courses
          .map((course) => (
            <li
              key={course.id}
              className={`mb-2 p-4 border rounded-md shadow-sm cursor-pointer ${
                course.id === selectedTemplateId ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => handleTemplateSelect(course.id)}
            >
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-gray-600">
                Created on: {new Date(course.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm line-clamp-2">
                {course.description && course.description.length > 100
                  ? `${course.description.substring(0, 100)}...`
                  : course.description}
              </p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CoursesPageTemplate;