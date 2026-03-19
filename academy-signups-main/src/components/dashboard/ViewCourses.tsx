 import { useState, useEffect } from "react";
 import { BookOpen, Search, Plus, Calendar, Users, ArrowRight } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Skeleton } from "@/components/ui/skeleton";
 import { CreateCourseModal } from "./CreateCourseModal";
 import { CreateSessionModal } from "./CreateSessionModal";
 import { cn } from "@/lib/utils";
 import type { Course } from "@/types/course";
 import { useCourses } from "@api-hooks/useCourses";
 
 interface ViewCoursesProps {
   onViewCourse?: (course: Course) => void;
 }
 
 const mapToCourse = (c: Record<string, unknown>): Course => ({
   id: Number(c.id),
   name: String(c.course_name ?? c.name ?? ""),
   code: String(c.course_code ?? c.code ?? ""),
   instructor: String(c.teacher_name ?? c.instructor ?? ""),
   semester: String(c.semester ?? ""),
   students: Number(c.student_count ?? c.students ?? 0),
   sessions: Number(c.sessions ?? 0),
   status: (c.status === "active" || c.status === "completed" || c.status === "draft" ? c.status : "active") as Course["status"],
   description: String(c.description ?? ""),
 });
 
 export const ViewCourses = ({ onViewCourse }: ViewCoursesProps) => {
   const [searchQuery, setSearchQuery] = useState("");
   const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
   const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
   const { loading: isLoading, courses: rawCourses, getAllCourses } = useCourses();
   const courses = (rawCourses || []).map(mapToCourse);
   const filteredCourses = courses.filter((course) =>
     course.name.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   useEffect(() => {
     getAllCourses().catch(() => {});
   }, []);
 
   return (
     <div className="space-y-4">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-xl font-bold text-foreground">All Courses</h1>
           <p className="text-muted-foreground text-sm">Browse and manage all available courses</p>
         </div>
         <div className="flex gap-2">
           <Button onClick={() => setIsCreateSessionOpen(true)} variant="outline" size="sm" className="gap-1.5 text-sm">
             <Calendar className="w-4 h-4" />
             New Session
           </Button>
           <Button onClick={() => setIsCreateCourseOpen(true)} size="sm" className="gap-1.5 text-sm">
             <Plus className="w-4 h-4" />
             New Course
           </Button>
         </div>
       </div>
 
       <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input
           placeholder="Search courses..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-9 h-9 text-sm"
         />
       </div>
 
       {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="p-4 rounded-xl bg-card space-y-3">
               <Skeleton className="h-5 w-3/4" />
               <Skeleton className="h-3 w-1/2" />
               <Skeleton className="h-3 w-2/3" />
             </div>
           ))}
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredCourses.map((course, index) => (
             <div
               key={course.id}
               onClick={() => onViewCourse?.(course)}
               className={cn(
                 "p-4 rounded-xl bg-card border border-border",
                 "hover:border-primary/50 hover:shadow-md",
                 "transition-all duration-200 cursor-pointer",
                 "animate-fade-in group"
               )}
               style={{ animationDelay: `${index * 100}ms` }}
             >
               <div className="flex items-start justify-between mb-3">
                 <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                   <BookOpen className="w-4 h-4 text-primary" />
                 </div>
                 <span
                   className={cn(
                     "px-2 py-0.5 rounded-full text-xs font-medium",
                     course.status === "active"
                       ? "bg-green-500/20 text-green-500"
                       : "bg-muted text-muted-foreground"
                   )}
                 >
                   {course.status}
                 </span>
               </div>
               <h3 className="text-sm font-semibold text-foreground mb-0.5">{course.name}</h3>
               <p className="text-xs text-muted-foreground mb-2">{course.code} • {course.instructor}</p>
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                 <div className="flex items-center gap-1">
                   <Users className="w-3 h-3" />
                   <span>{course.students}</span>
                   <span className="mx-1">•</span>
                   <Calendar className="w-3 h-3" />
                   <span>{course.sessions} sessions</span>
                 </div>
                 <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
               </div>
             </div>
           ))}
         </div>
       )}
 
       {filteredCourses.length === 0 && !isLoading && (
         <div className="text-center py-12">
           <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
           <h3 className="text-sm font-medium text-foreground">No courses found</h3>
           <p className="text-xs text-muted-foreground">Try adjusting your search query</p>
         </div>
       )}
 
       <CreateCourseModal open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen} onSuccess={() => getAllCourses()} />
       <CreateSessionModal open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen} courses={courses} onSuccess={() => getAllCourses()} />
     </div>
   );
 };