import { useState, useEffect } from "react";
import { CalendarCheck, CalendarX, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCourses } from "@api-hooks/useCourses";
import { useAttendance } from "@api-hooks/useAttendance";

const defaultSessions: { id: number; date: string; title: string; attended: boolean }[] = [];

export const AttendanceTracking = () => {
  const { courses: rawCourses, getAllCourses } = useCourses();
  const { getStudentAttendance } = useAttendance();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [attendanceByCourse, setAttendanceByCourse] = useState<Record<number, { id: number; date: string; title: string; attended: boolean }[]>>({});

  const courses = (rawCourses || []).map((c) => ({ id: Number(c.id), name: String(c.name ?? ""), code: String(c.code ?? "") }));

  useEffect(() => {
    getAllCourses().catch(() => {});
  }, []);

  useEffect(() => {
    if (courses.length && !selectedCourseId) setSelectedCourseId(String(courses[0].id));
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (!studentId || !selectedCourseId) return;
    getStudentAttendance(studentId, Number(selectedCourseId)).then((result) => {
      const list = ((result as Record<string, unknown>)?.attendance ?? []) as Record<string, unknown>[];
      const mapped = list.map((a) => ({
        id: Number(a.id ?? 0),
        date: String(a.date ?? a.session_date ?? ""),
        title: String(a.title ?? a.session_title ?? ""),
        attended: Boolean(a.attended ?? a.present),
      }));
      setAttendanceByCourse((prev) => ({ ...prev, [Number(selectedCourseId)]: mapped }));
    }).catch(() => {});
  }, [studentId, selectedCourseId]);

  const courseData = selectedCourseId ? {
    name: courses.find((c) => String(c.id) === selectedCourseId)?.name ?? "",
    sessions: attendanceByCourse[Number(selectedCourseId)] ?? defaultSessions,
  } : { name: "", sessions: defaultSessions };

  const monthlyStats = courseData.sessions.length ? [
    { month: "Recent", attended: courseData.sessions.filter((s) => s.attended).length, total: courseData.sessions.length },
  ] : [];
  
  const attendedCount = courseData.sessions.filter(s => s.attended).length;
  const totalCount = courseData.sessions.length;
  const attendancePercentage = Math.round((attendedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Attendance Tracking</h1>
        <p className="text-muted-foreground text-sm">Monitor your attendance across all courses</p>
      </div>

      {/* Course Selector */}
      <div className="max-w-xs">
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} className="text-sm">
                {c.code} - {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Attended</span>
          </div>
          <p className="text-lg font-bold text-foreground">{attendedCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CalendarX className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Missed</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalCount - attendedCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <p className="text-lg font-bold text-foreground">{totalCount}</p>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground">Percentage</span>
          </div>
          <p className={cn(
            "text-lg font-bold",
            attendancePercentage >= 90 ? "text-green-500" :
            attendancePercentage >= 75 ? "text-yellow-500" : "text-red-500"
          )}>{attendancePercentage}%</p>
        </div>
      </div>

      {/* Monthly Attendance Graph */}
      <div className="p-4 rounded-lg bg-card border border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Monthly Overview</h3>
        <div className="flex items-end gap-3 h-32">
          {monthlyStats.map((stat) => {
            const percentage = (stat.attended / stat.total) * 100;
            return (
              <div key={stat.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-muted rounded-t relative" style={{ height: `${percentage}%` }}>
                  <div 
                    className={cn(
                      "absolute inset-0 rounded-t",
                      percentage >= 90 ? "bg-green-500/80" :
                      percentage >= 75 ? "bg-yellow-500/80" : "bg-red-500/80"
                    )}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{stat.month}</span>
                <span className="text-xs font-medium">{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session-wise Attendance */}
      <div className="p-4 rounded-lg bg-card border border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Session History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {courseData.sessions.map((session, index) => (
            <div 
              key={session.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md",
                session.attended ? "bg-green-500/5" : "bg-red-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  session.attended ? "bg-green-500" : "bg-red-500"
                )} />
                <div>
                  <p className="text-sm font-medium text-foreground">{session.title}</p>
                  <p className="text-xs text-muted-foreground">{session.date}</p>
                </div>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                session.attended ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                {session.attended ? "Present" : "Absent"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
