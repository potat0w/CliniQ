 import { useState } from "react";
 import { Users, Search, Mail, Hash } from "lucide-react";
 import { Input } from "@/components/ui/input";
 import { Skeleton } from "@/components/ui/skeleton";
 import { cn } from "@/lib/utils";
 
 const mockStudents = [
   { id: 1, name: "Alice Johnson", email: "alice@university.edu", rollNo: "CS2024001", batch: "2024", courses: 3, attendance: 92 },
   { id: 2, name: "Bob Smith", email: "bob@university.edu", rollNo: "CS2024002", batch: "2024", courses: 4, attendance: 88 },
   { id: 3, name: "Carol Williams", email: "carol@university.edu", rollNo: "CS2024003", batch: "2024", courses: 3, attendance: 95 },
   { id: 4, name: "David Brown", email: "david@university.edu", rollNo: "CS2024004", batch: "2024", courses: 2, attendance: 78 },
   { id: 5, name: "Eva Martinez", email: "eva@university.edu", rollNo: "CS2024005", batch: "2024", courses: 4, attendance: 90 },
 ];
 
 export const ViewStudents = () => {
   const [searchQuery, setSearchQuery] = useState("");
   const [isLoading, setIsLoading] = useState(false);
 
   const filteredStudents = mockStudents.filter(
     (student) =>
       student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   return (
     <div className="space-y-4">
       <div>
         <h1 className="text-xl font-bold text-foreground">All Students</h1>
         <p className="text-muted-foreground text-sm">View and manage enrolled students</p>
       </div>
 
       <div className="relative max-w-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
         <Input
           placeholder="Search by name, email, or roll number..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="pl-9 h-9 text-sm"
         />
       </div>
 
       {isLoading ? (
         <div className="space-y-2">
           {[1, 2, 3, 4, 5].map((i) => (
             <div key={i} className="p-3 rounded-lg bg-card flex items-center gap-3">
               <Skeleton className="w-9 h-9 rounded-full" />
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-4 w-1/3" />
                 <Skeleton className="h-3 w-1/2" />
               </div>
             </div>
           ))}
         </div>
       ) : (
         <div className="space-y-2">
           {filteredStudents.map((student, index) => (
             <div
               key={student.id}
               className={cn(
                 "p-3 rounded-lg bg-card border border-border",
                 "hover:border-primary/30 transition-colors",
                 "animate-fade-in"
               )}
               style={{ animationDelay: `${index * 50}ms` }}
             >
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                   <span className="text-sm font-semibold text-primary">
                     {student.name.charAt(0)}
                   </span>
                 </div>
 
                 <div className="flex-1 min-w-0">
                   <h3 className="text-sm font-medium text-foreground truncate">{student.name}</h3>
                   <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1 truncate">
                       <Mail className="w-3 h-3" />
                       <span className="truncate">{student.email}</span>
                     </span>
                     <span className="flex items-center gap-1">
                       <Hash className="w-3 h-3" />
                       {student.rollNo}
                     </span>
                   </div>
                 </div>
 
                 <div className="hidden sm:flex items-center gap-4 text-xs">
                   <div className="text-center min-w-[50px]">
                     <div className="font-medium text-foreground">{student.courses}</div>
                     <div className="text-muted-foreground">Courses</div>
                   </div>
                   <div className="text-center min-w-[50px]">
                     <div
                       className={cn(
                         "font-medium",
                         student.attendance >= 90
                           ? "text-green-500"
                           : student.attendance >= 75
                           ? "text-yellow-500"
                           : "text-red-500"
                       )}
                     >
                       {student.attendance}%
                     </div>
                     <div className="text-muted-foreground">Attendance</div>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}
 
       {filteredStudents.length === 0 && !isLoading && (
         <div className="text-center py-10">
           <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
           <h3 className="text-sm font-medium text-foreground">No students found</h3>
           <p className="text-xs text-muted-foreground">Try adjusting your search query</p>
         </div>
       )}
     </div>
   );
 };