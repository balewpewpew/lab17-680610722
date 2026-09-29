import {z} from "zod";
import type { Course } from "@/lib/types";

export const MAX_DESCRIPT = 100;
export const MAX_INSTRUCTOR = 3;
export const programOptions = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
];

export const courseFormSchema = z.object({
  courseId: z
    .string()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
  courseTitle: z
    .string()
    .trim()
    .min(1, "กรอกชื่อวิชา").max(100, "ชื่อวิชายาวได้ไม่เกิน 100 ตัวอักษร"),
  program: z.enum(["CPE","ISNE"],{message: "เลือกหลักสูตร"}),
  semester: z.enum(["1","2","3"],{message: "เลือกภาคการศึกษา"}),
  description: z
    .string()
    .max(MAX_DESCRIPT,{message:"รายละเอียดยาวได้ไม่เกิน 100 ตัวอักษร"})
    .optional(),
  instructors: z
    .array(z.object({
        name: z
            .string()
            .trim()
            .min(1, "เลือกผู้สอนอย่างน้อย 1 คน"),
        email: z
            .email("ต้องเป็นอีเมล @cmu.ac.th")
            .regex(/^[a-zA-Z0-9._%+-]+@cmu\.ac\.th$/)
    }))
    .refine(
      (items) =>
        new Set(items.map((i) => i.email.toLowerCase())).size ===
        items.length,
      "อีเมลผู้สอนซ้ำกัน",
    ),
    notifyByEmail: z.boolean()
})

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export function createCourseFormSchema(existingCourses: Course[]){
  return courseFormSchema.refine((data)=>!existingCourses.some((c)=>c.courseId === data.courseId),
  {message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"]},
);
}


