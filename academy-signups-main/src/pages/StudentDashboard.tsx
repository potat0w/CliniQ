import { useState } from "react";
import { StudentSidebar } from "@/components/dashboard/student/StudentSidebar";
import { AllCourses } from "@/components/dashboard/student/AllCourses";
import { StudentMyCourses } from "@/components/dashboard/student/StudentMyCourses";
import { AttendanceTracking } from "@/components/dashboard/student/AttendanceTracking";
import { OverallStats } from "@/components/dashboard/student/OverallStats";

export type StudentDashboardTab = "all-courses" | "my-courses" | "attendance" | "stats";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<StudentDashboardTab>("all-courses");

  const renderContent = () => {
    switch (activeTab) {
      case "all-courses":
        return <AllCourses />;
      case "my-courses":
        return <StudentMyCourses />;
      case "attendance":
        return <AttendanceTracking />;
      case "stats":
        return <OverallStats />;
      default:
        return <AllCourses />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;
