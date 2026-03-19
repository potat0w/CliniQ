 import { useState, useEffect } from "react";
 import { FolderOpen, Plus, Calendar, Users, MoreVertical, Edit, Trash2, ArrowRight } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import { CreateCourseModal } from "./CreateCourseModal";
 import { CreateSessionModal } from "./CreateSessionModal";
 import { toast } from "@/hooks/use-toast";
 import { cn } from "@/lib/utils";
 import type { Course } from "@/types/course";
 import { useCourses } from "@api-hooks/useCourses";
 
 interface MyCoursesProps {
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
 
 export const MyCourses = ({ onViewCourse }: MyCoursesProps) => {
   const { loading: isLoading, courses: rawCourses, getTeacherCourses, deleteCourse } = useCourses();
   const courses = (rawCourses || []).map(mapToCourse);
   const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
   const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
 
   useEffect(() => {
     getTeacherCourses().catch(() => {});
   }, []);
 
   const refresh = () => getTeacherCourses().catch(() => {});
 
   const handleDeleteCourse = async (courseId: number) => {
     try {
       await deleteCourse(courseId);
       toast({
         title: "Course deleted",
         description: "The course has been removed successfully.",
         variant: "destructive",
       });
       refresh();
     } catch {
       toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
     }
   };
 
   const handleEditCourse = (courseId: number) => {
     toast({
       title: "Edit mode",
       description: "Opening course editor...",
     });
   };
 
   return (
     <div className="space-y-4">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-xl font-bold text-foreground">My Courses</h1>
           <p className="text-muted-foreground text-sm">Manage courses you've created</p>
         </div>
         <div className="flex gap-2">
           <Button onClick={() => setIsCreateSessionOpen(true)} variant="outline" size="sm" className="gap-1.5 text-sm">
             <Calendar className="w-4 h-4" />
             Add Session
           </Button>
           <Button onClick={() => setIsCreateCourseOpen(true)} size="sm" className="gap-1.5 text-sm">
             <Plus className="w-4 h-4" />
             Create Course
           </Button>
         </div>
       </div>
 
       {isLoading ? (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="p-4 rounded-xl bg-card space-y-3">
               <Skeleton className="h-5 w-3/4" />
               <Skeleton className="h-3 w-full" />
               <Skeleton className="h-3 w-1/2" />
             </div>
           ))}
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {courses.map((course, index) => (
             <div
               key={course.id}
               className={cn(
                 "p-4 rounded-xl bg-card border border-border",
                 "hover:border-primary/50 transition-colors",
                 "animate-fade-in group"
               )}
               style={{ animationDelay: `${index * 100}ms` }}
             >
               <div className="flex items-start justify-between mb-3">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                     <FolderOpen className="w-4 h-4 text-primary" />
                   </div>
                   <div>
                     <h3 className="text-sm font-semibold text-foreground">{course.name}</h3>
                     <span className={cn("text-xs font-medium", course.status === "active" ? "text-green-500" : "text-muted-foreground")}>
                       {course.status}
                     </span>
                   </div>
                 </div>
 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                       <MoreVertical className="w-3.5 h-3.5" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditCourse(course.id); }} className="gap-2 text-sm">
                       <Edit className="w-3.5 h-3.5" />
                       Edit Course
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="gap-2 text-sm text-destructive focus:text-destructive">
                       <Trash2 className="w-3.5 h-3.5" />
                       Delete Course
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
 
               <p className="text-muted-foreground text-xs mb-3">{course.description}</p>
 
               <div className="flex items-center justify-between text-xs text-muted-foreground">
                 <div className="flex items-center gap-3">
                   <span className="flex items-center gap-1">
                     <Users className="w-3 h-3" />
                     <span>{course.students} students</span>
                   </span>
                   <span className="flex items-center gap-1">
                     <Calendar className="w-3 h-3" />
                     <span>{course.sessions} sessions</span>
                   </span>
                 </div>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-7 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={() => onViewCourse?.(course)}
                 >
                   View <ArrowRight className="w-3 h-3" />
                 </Button>
               </div>
             </div>
           ))}
         </div>
       )}
 
       {courses.length === 0 && !isLoading && (
         <div className="text-center py-10">
           <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
           <h3 className="text-sm font-medium text-foreground">No courses yet</h3>
           <p className="text-xs text-muted-foreground mb-3">Create your first course to get started</p>
           <Button onClick={() => setIsCreateCourseOpen(true)} size="sm" className="gap-1.5 text-sm">
             <Plus className="w-4 h-4" />
             Create Course
           </Button>
         </div>
       )}
 
       <CreateCourseModal open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen} onSuccess={refresh} />
       <CreateSessionModal open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen} courses={courses} onSuccess={refresh} />
     </div>
   );
 };