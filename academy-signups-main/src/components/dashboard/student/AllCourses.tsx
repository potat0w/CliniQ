import { useState, useEffect } from "react";
import { BookOpen, Search, Users, Clock, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useCourses } from "@api-hooks/useCourses";

export const AllCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const { courses: rawCourses, getAllCourses, enrollCourse } = useCourses();
  const courses = (rawCourses || []).map((c) => ({
    id: Number(c.id),
    name: String(c.course_name ?? c.name ?? ""),
    code: String(c.course_code ?? c.code ?? ""),
    instructor: String(c.teacher_name ?? c.instructor ?? ""),
    semester: String(c.semester ?? ""),
    students: Number(c.student_count ?? c.students ?? 0),
    sessions: Number(c.sessions ?? 0),
    status: (c.status === "closed" ? "closed" : "open") as "open" | "closed",
  }));

  useEffect(() => {
    getAllCourses().catch(() => {});
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinCourse = async (courseId: number, courseName: string) => {
    setJoiningId(courseId);
    try {
      await enrollCourse(courseId);
      toast({
        title: "Course Joined!",
        description: `You have successfully enrolled in ${courseName}.`,
      });
      getAllCourses().catch(() => {});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join course";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">All Courses</h1>
        <p className="text-muted-foreground text-sm">Browse and join available courses</p>
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

      <div className="grid gap-3">
        {filteredCourses.map((course, index) => (
          <div
            key={course.id}
            className={cn(
              "p-4 rounded-lg bg-card border border-border",
              "hover:border-primary/30 transition-colors",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-foreground">{course.name}</h3>
                  <Badge variant={course.status === "open" ? "default" : "secondary"} className="text-xs">
                    {course.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{course.code} • {course.instructor}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.sessions} sessions
                  </span>
                  <span>{course.semester}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant={course.status === "open" ? "default" : "secondary"}
                disabled={course.status === "closed" || joiningId === course.id}
                onClick={() => handleJoinCourse(course.id, course.name)}
                className="text-xs h-8"
              >
                {joiningId === course.id ? "Joining..." : course.status === "open" ? "Join Course" : "Closed"}
                {course.status === "open" && joiningId !== course.id && <ChevronRight className="w-3 h-3 ml-1" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground">No courses found</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
};
