 import { BarChart3, TrendingUp, Users, BookOpen, Clock, Star } from "lucide-react";
 import { Skeleton } from "@/components/ui/skeleton";
 import { cn } from "@/lib/utils";
 import { useState, useEffect } from "react";
 import { useCourses } from "@api-hooks/useCourses";
 import { useStats } from "@api-hooks/useStats";
 
 const defaultStats = {
   totalStudents: 0,
   totalCourses: 0,
   totalSessions: 0,
   avgAttendance: 0,
   completionRate: 0,
   activeHours: 0,
 };
 
 export const CourseStats = () => {
   const { loading: coursesLoading, courses, getTeacherCourses } = useCourses();
   const { loading: statsLoading, stats, getCourseStats } = useStats();
   const [courseStats, setCourseStats] = useState<Record<number, { students?: number; completion?: number }>>({});
 
   useEffect(() => {
     getTeacherCourses().catch(() => {});
   }, []);
 
   useEffect(() => {
     if (!courses?.length) return;
     Promise.all(courses.map((c) => getCourseStats(Number(c.id)).catch(() => null))).then((results) => {
       const map: Record<number, { students?: number; completion?: number }> = {};
       courses.forEach((c, i) => {
         const r = results[i] as Record<string, unknown> | null;
         if (r) map[Number(c.id)] = { students: Number(r.students ?? r.total_students ?? 0), completion: Number(r.completion ?? r.completion_rate ?? 0) };
       });
       setCourseStats(map);
     });
   }, [courses]);
 
   const coursePerformance = (courses || []).map((c) => ({
     name: String(c.course_name ?? c.name ?? ""),
     students: courseStats[Number(c.id)]?.students ?? Number(c.student_count ?? c.students ?? 0),
     completion: courseStats[Number(c.id)]?.completion ?? 0,
     rating: 4.5,
   }));
   const mockStats = {
     totalStudents: coursePerformance.reduce((acc, c) => acc + c.students, 0),
     totalCourses: courses?.length ?? 0,
     totalSessions: (courses || []).reduce((acc, c) => acc + Number(c.sessions ?? 0), 0),
     avgAttendance: stats && typeof (stats as Record<string, unknown>).avg_attendance === "number" ? (stats as Record<string, unknown>).avg_attendance : 87,
     completionRate: stats && typeof (stats as Record<string, unknown>).completion_rate === "number" ? (stats as Record<string, unknown>).completion_rate : 92,
     activeHours: stats && typeof (stats as Record<string, unknown>).active_hours === "number" ? (stats as Record<string, unknown>).active_hours : 156,
   };
   const isLoading = coursesLoading || statsLoading;
 
   const statCards = [
     { label: "Total Students", value: mockStats.totalStudents, icon: Users, color: "text-blue-400" },
     { label: "Active Courses", value: mockStats.totalCourses, icon: BookOpen, color: "text-green-400" },
     { label: "Total Sessions", value: mockStats.totalSessions, icon: Clock, color: "text-purple-400" },
     { label: "Avg Attendance", value: `${mockStats.avgAttendance}%`, icon: TrendingUp, color: "text-yellow-400" },
     { label: "Completion Rate", value: `${mockStats.completionRate}%`, icon: Star, color: "text-pink-400" },
     { label: "Teaching Hours", value: mockStats.activeHours, icon: BarChart3, color: "text-cyan-400" },
   ];
 
   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-xl font-bold text-foreground">Course Statistics</h1>
         <p className="text-muted-foreground text-sm">Analytics and performance metrics</p>
       </div>
 
       {isLoading ? (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="p-4 rounded-xl bg-card">
               <Skeleton className="h-6 w-16 mb-1" />
               <Skeleton className="h-3 w-20" />
             </div>
           ))}
         </div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
           {statCards.map((stat, index) => {
             const Icon = stat.icon;
             return (
               <div
                 key={stat.label}
                 className={cn(
                   "p-4 rounded-xl bg-card border border-border",
                   "hover:border-primary/30 transition-colors",
                   "animate-fade-in"
                 )}
                 style={{ animationDelay: `${index * 50}ms` }}
               >
                 <div className="flex items-center gap-2 mb-1">
                   <Icon className={cn("w-4 h-4", stat.color)} />
                 </div>
                 <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                 <div className="text-xs text-muted-foreground">{stat.label}</div>
               </div>
             );
           })}
         </div>
       )}
 
       <div>
         <h2 className="text-base font-semibold text-foreground mb-3">Course Performance</h2>
         
         {isLoading ? (
           <div className="space-y-2">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="p-3 rounded-lg bg-card">
                 <Skeleton className="h-4 w-1/3 mb-2" />
                 <Skeleton className="h-2 w-full" />
               </div>
             ))}
           </div>
         ) : (
           <div className="space-y-2">
             {coursePerformance.map((course, index) => (
               <div
                 key={course.name}
                 className={cn("p-3 rounded-lg bg-card border border-border", "animate-fade-in")}
                 style={{ animationDelay: `${index * 100}ms` }}
               >
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                   <h3 className="text-sm font-medium text-foreground">{course.name}</h3>
                   <div className="flex items-center gap-3 text-xs">
                     <span className="text-muted-foreground">{course.students} students</span>
                     <span className="flex items-center gap-1 text-primary">
                       <Star className="w-3 h-3 fill-current" />
                       {course.rating}
                     </span>
                   </div>
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-[10px] text-muted-foreground">
                     <span>Completion</span>
                     <span>{course.completion}%</span>
                   </div>
                   <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                     <div
                       className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                       style={{ width: `${course.completion}%` }}
                     />
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   );
 };