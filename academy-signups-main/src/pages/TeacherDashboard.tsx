 import { useState } from "react";
 import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
 import { ViewCourses } from "@/components/dashboard/ViewCourses";
 import { ViewStudents } from "@/components/dashboard/ViewStudents";
 import { MyCourses } from "@/components/dashboard/MyCourses";
 import { CourseStats } from "@/components/dashboard/CourseStats";
 import { CourseDetails } from "@/components/dashboard/CourseDetails";
 import type { Course } from "@/types/course";
 
 export type DashboardTab = "view-courses" | "view-students" | "my-courses" | "course-stats";
 
 const TeacherDashboard = () => {
   const [activeTab, setActiveTab] = useState<DashboardTab>("view-courses");
   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
 
   const handleViewCourse = (course: Course) => {
     setSelectedCourse(course);
   };
 
   const handleBackFromCourse = () => {
     setSelectedCourse(null);
   };
 
   const renderContent = () => {
     if (selectedCourse) {
       return <CourseDetails course={selectedCourse} onBack={handleBackFromCourse} />;
     }
 
     switch (activeTab) {
       case "view-courses":
         return <ViewCourses onViewCourse={handleViewCourse} />;
       case "view-students":
         return <ViewStudents />;
       case "my-courses":
         return <MyCourses onViewCourse={handleViewCourse} />;
       case "course-stats":
         return <CourseStats />;
       default:
         return <ViewCourses onViewCourse={handleViewCourse} />;
     }
   };
 
   const handleTabChange = (tab: DashboardTab) => {
     setSelectedCourse(null);
     setActiveTab(tab);
   };
 
   return (
     <div className="min-h-screen flex w-full bg-background">
       <DashboardSidebar activeTab={activeTab} onTabChange={handleTabChange} />
       <main className="flex-1 p-4 md:p-6 overflow-auto">
         {renderContent()}
       </main>
     </div>
   );
 };
 
 export default TeacherDashboard;