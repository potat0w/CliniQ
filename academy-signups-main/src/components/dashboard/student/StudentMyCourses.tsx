import { useState, useEffect } from "react";
import { BookOpen, Clock, Calendar, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCourses } from "@api-hooks/useCourses";
import { useStats } from "@api-hooks/useStats";

export const StudentMyCourses = () => {
  const { courses: rawCourses, getAllCourses } = useCourses();
  const { getStudentStats } = useStats();
  const [courseStats, setCourseStats] = useState<
    Record<
      number,
      {
        attendance?: number;
        progress?: number;
        attended?: number;
        total?: number;
      }
    >
  >({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;

  useEffect(() => {
    getAllCourses().catch(() => {});
  }, []);

  const courses = (rawCourses || []).map((c) => {
    const id = Number(c.id);
    const stats = courseStats[id];
    return {
      id,
      name: String(c.name ?? ""),
      code: String(c.code ?? ""),
      instructor: String(c.instructor ?? ""),
      progress: stats?.progress ?? 0,
      attendance: stats?.attendance ?? 0,
      nextSession: "TBD",
      totalSessions: Number(c.sessions ?? 0),
      attendedSessions: stats?.attended ?? 0,
    };
  });

  useEffect(() => {
    if (!studentId || !rawCourses?.length) return;
    rawCourses.forEach((c) => {
      const courseId = Number(c.id);
      getStudentStats(studentId, courseId)
        .then((r) => {
          const res = r as Record<string, unknown>;
          setCourseStats((prev) => ({
            ...prev,
            [courseId]: {
              attendance: Number(res.attendance ?? res.attendance_rate ?? 0),
              progress: Number(res.progress ?? 0),
              attended: Number(res.attended_sessions ?? 0),
              total: Number(res.total_sessions ?? c.sessions ?? 0),
            },
          }));
        })
        .catch(() => {});
    });
  }, [studentId, rawCourses?.length]);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground text-sm">
          Track your enrolled courses and progress
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground">
            No enrolled courses
          </h3>
          <p className="text-xs text-muted-foreground">
            Browse All Courses to join a course
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className={cn(
                "p-4 rounded-lg bg-card border border-border",
                "hover:border-primary/30 transition-colors cursor-pointer",
                "animate-fade-in",
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {course.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {course.code} • {course.instructor}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded",
                      course.attendance >= 90
                        ? "bg-green-500/10 text-green-600"
                        : course.attendance >= 75
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-red-500/10 text-red-600",
                    )}
                  >
                    {course.attendance}% Attendance
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Course Progress
                    </span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Next: {course.nextSession}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {course.attendedSessions}/{course.totalSessions} sessions
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    On track
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
