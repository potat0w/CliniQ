 import { useState } from "react";
 import { Loader2 } from "lucide-react";
 import { useSessions } from "@api-hooks/useSessions";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { toast } from "@/hooks/use-toast";
 import { cn } from "@/lib/utils";
 
 interface CreateSessionModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   courses?: { id: number; name: string; code?: string }[];
   onSuccess?: () => void;
 }
 
 export const CreateSessionModal = ({ open, onOpenChange, courses = [], onSuccess }: CreateSessionModalProps) => {
   const { loading: isLoading, createSession } = useSessions();
   const [formData, setFormData] = useState({
     course: "",
     title: "",
     date: "",
     time: "",
     duration: "",
     notes: "",
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const validateForm = () => {
     const newErrors: Record<string, string> = {};
     if (!formData.course) newErrors.course = "Please select a course";
     if (!formData.title.trim()) newErrors.title = "Session title is required";
     if (!formData.date) newErrors.date = "Date is required";
     if (!formData.time) newErrors.time = "Time is required";
     if (!formData.duration.trim()) newErrors.duration = "Duration is required";
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validateForm()) return;
     try {
       await createSession({
         course_id: Number(formData.course),
         title: formData.title,
         date: formData.date,
         time: formData.time,
         duration: formData.duration,
         topic: formData.notes || undefined,
       });
       toast({
         title: "Session scheduled!",
         description: `"${formData.title}" has been added to the calendar.`,
       });
       setFormData({ course: "", title: "", date: "", time: "", duration: "", notes: "" });
       onOpenChange(false);
       onSuccess?.();
     } catch {
       toast({ title: "Error", description: "Failed to create session", variant: "destructive" });
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
           <DialogTitle className="text-lg font-semibold">Schedule New Session</DialogTitle>
           <DialogDescription className="text-sm">
             Add a new session to your course schedule.
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-4 mt-2">
           <div className="space-y-2">
             <Label htmlFor="course" className="text-sm">Course</Label>
             <Select value={formData.course} onValueChange={(value) => handleChange("course", value)}>
               <SelectTrigger className={cn("h-9 text-sm", errors.course && "border-destructive")}>
                 <SelectValue placeholder="Select a course" />
               </SelectTrigger>
               <SelectContent>
                 {courses.map((course) => (
                   <SelectItem key={course.id} value={String(course.id)} className="text-sm">
                     {course.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="title" className="text-sm">Session Title</Label>
             <Input
               id="title"
               placeholder="e.g., Week 1: Introduction"
               value={formData.title}
               onChange={(e) => handleChange("title", e.target.value)}
               className={cn("h-9 text-sm", errors.title && "border-destructive")}
             />
             {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
           </div>
 
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="date" className="text-sm">Date</Label>
               <Input
                 id="date"
                 type="date"
                 value={formData.date}
                 onChange={(e) => handleChange("date", e.target.value)}
                 className={cn("h-9 text-sm", errors.date && "border-destructive")}
               />
               {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="time" className="text-sm">Time</Label>
               <Input
                 id="time"
                 type="time"
                 value={formData.time}
                 onChange={(e) => handleChange("time", e.target.value)}
                 className={cn("h-9 text-sm", errors.time && "border-destructive")}
               />
               {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
             </div>
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="duration" className="text-sm">Duration</Label>
             <Input
               id="duration"
               placeholder="e.g., 1 hour 30 minutes"
               value={formData.duration}
               onChange={(e) => handleChange("duration", e.target.value)}
               className={cn("h-9 text-sm", errors.duration && "border-destructive")}
             />
             {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="notes" className="text-sm">Topic / Notes (optional)</Label>
             <Textarea
               id="notes"
               placeholder="Topic or additional notes..."
               value={formData.notes}
               onChange={(e) => handleChange("notes", e.target.value)}
               rows={2}
               className="text-sm resize-none"
             />
           </div>
 
           <div className="flex gap-2 pt-2">
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="flex-1">
               Cancel
             </Button>
             <Button type="submit" disabled={isLoading} size="sm" className="flex-1">
               {isLoading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                   Scheduling...
                 </>
               ) : (
                 "Schedule Session"
               )}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 };