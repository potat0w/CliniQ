 import { useState } from "react";
 import { Loader2 } from "lucide-react";
 import { useCourses } from "@api-hooks/useCourses";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { toast } from "@/hooks/use-toast";
 import { cn } from "@/lib/utils";
 
 interface CreateCourseModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSuccess?: () => void;
 }
 
 export const CreateCourseModal = ({ open, onOpenChange, onSuccess }: CreateCourseModalProps) => {
   const { loading: isLoading, createCourse } = useCourses();
  const [formData, setFormData] = useState({
     course_name: "",
     course_code: "",
     semester: "",
     batch: "",
     academic_session: "",
   });
   const [errors, setErrors] = useState<Record<string, string>>({});

   const validateForm = () => {
     const newErrors: Record<string, string> = {};
     if (!formData.course_name.trim()) newErrors.course_name = "Course name is required";
     if (!formData.course_code.trim()) newErrors.course_code = "Course code is required";
     if (!formData.semester.trim()) newErrors.semester = "Semester is required";
     if (!formData.batch.trim()) newErrors.batch = "Batch is required";
     if (!formData.academic_session.trim()) newErrors.academic_session = "Academic session is required";
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validateForm()) return;
     try {
       await createCourse({
         course_name: formData.course_name.trim(),
         course_code: formData.course_code.trim(),
         semester: formData.semester.trim(),
         batch: formData.batch.trim(),
         academic_session: formData.academic_session.trim(),
       });
       toast({
         title: "Course created!",
         description: `"${formData.course_name}" has been created successfully.`,
       });
       setFormData({ course_name: "", course_code: "", semester: "", batch: "", academic_session: "" });
       onOpenChange(false);
       onSuccess?.();
     } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to create course";
       toast({ title: "Error", description: message, variant: "destructive" });
     }
   };
 
   const handleChange = (field: string, value: string) => {
     setFormData((prev) => ({ ...prev, [field]: value }));
     if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle className="text-lg font-semibold">Create New Course</DialogTitle>
           <DialogDescription className="text-sm">
             Fill in the details below to create a new course.
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-4 mt-2">
           <div className="space-y-2">
             <Label htmlFor="course_name" className="text-sm">Course Name</Label>
             <Input
               id="course_name"
               placeholder="e.g., Introduction to Physics"
               value={formData.course_name}
               onChange={(e) => handleChange("course_name", e.target.value)}
               className={cn("h-9 text-sm", errors.course_name && "border-destructive")}
             />
             {errors.course_name && <p className="text-xs text-destructive">{errors.course_name}</p>}
           </div>

           <div className="space-y-2">
             <Label htmlFor="course_code" className="text-sm">Course Code</Label>
             <Input
               id="course_code"
               placeholder="e.g., PHY101"
               value={formData.course_code}
               onChange={(e) => handleChange("course_code", e.target.value)}
               className={cn("h-9 text-sm", errors.course_code && "border-destructive")}
             />
             {errors.course_code && <p className="text-xs text-destructive">{errors.course_code}</p>}
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="semester" className="text-sm">Semester</Label>
               <Input
                 id="semester"
                 placeholder="e.g., 1, 2"
                 value={formData.semester}
                 onChange={(e) => handleChange("semester", e.target.value)}
                 className={cn("h-9 text-sm", errors.semester && "border-destructive")}
               />
               {errors.semester && <p className="text-xs text-destructive">{errors.semester}</p>}
             </div>
             <div className="space-y-2">
               <Label htmlFor="batch" className="text-sm">Batch</Label>
               <Input
                 id="batch"
                 placeholder="e.g., 2024"
                 value={formData.batch}
                 onChange={(e) => handleChange("batch", e.target.value)}
                 className={cn("h-9 text-sm", errors.batch && "border-destructive")}
               />
               {errors.batch && <p className="text-xs text-destructive">{errors.batch}</p>}
             </div>
           </div>

           <div className="space-y-2">
             <Label htmlFor="academic_session" className="text-sm">Academic Session</Label>
             <Input
               id="academic_session"
               placeholder="e.g., 2024-25"
               value={formData.academic_session}
               onChange={(e) => handleChange("academic_session", e.target.value)}
               className={cn("h-9 text-sm", errors.academic_session && "border-destructive")}
             />
             {errors.academic_session && <p className="text-xs text-destructive">{errors.academic_session}</p>}
           </div>
 
           <div className="flex gap-2 pt-2">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="flex-1">
               Cancel
             </Button>
             <Button type="submit" disabled={isLoading} size="sm" className="flex-1">
               {isLoading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                   Creating...
                 </>
               ) : (
                 "Create Course"
               )}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 };