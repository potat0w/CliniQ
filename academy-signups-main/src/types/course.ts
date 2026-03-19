 export interface Course {
   id: number;
   name: string;
   code: string;
   instructor: string;
   semester: string;
   students: number;
   sessions: number;
   status: "active" | "completed" | "draft";
   description: string;
 }
 
 export interface Session {
   id: number;
   courseId: number;
   title: string;
   date: string;
   time: string;
   duration: string;
   topic?: string;
   attendance?: number;
 }
 
 export interface Student {
   id: number;
   name: string;
   email: string;
   rollNo: string;
   batch: string;
   attendance: number;
 }