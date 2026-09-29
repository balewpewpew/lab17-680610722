import { ConfirmDeleteButton } from "@/components/confirm-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import {Minus} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CourseTable() {
  const courses = useEnrollmentStore((s) => s.courses);
  const removeCourse = useEnrollmentStore((s) => s.removeCourse);

  return (
    <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>หลักสูตร</TableHead>
              <TableHead>ภาคการศึกษา</TableHead>
              <TableHead>รายละเอียด</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead>รับข่าวสารทางอีเมล</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((s, i) => (
              <TableRow key={`${s.courseId}-${i}`}>
                <TableCell>{s.courseId}</TableCell>
                <TableCell>{s.courseTitle}</TableCell>
                <TableCell>{s.program}</TableCell>
                <TableCell>{s.semester === "1" ? "ภาคการศึกษาที่ 1" : s.semester === "2" ? "ภาคการศึกษาที่ 2" : "ภาคฤดูร้อน"}</TableCell>
                <TableCell>
                  <div className="text-muted-foreground max-w-[100px] h-auto whitespace-normal break-words">
                    {s.description ? s.description : <Minus className="size-4"/>}
                  </div>
                </TableCell>
                <TableCell>
                  {s.instructors?.length ? (
                    <div className="flex flex-col text-sm">
                      {s.instructors.map((i,index) => (
                        <div key={index} className="flex flex-col">
                          <span className="text-sm font-medium">{i.name}</span>
                          <span className="text-sm text-muted-foreground">{i.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {s.notifyByEmail ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                      <Badge 
                        variant="default" 
                        className="rounded-full text-sm font-medium"
                      >รับ</Badge>
                    </span>
                  ):(
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                      <Badge
                        variant="secondary" 
                        className="rounded-full text-sm font-medium"
                      >ไม่รับ</Badge>
                    </span>)}
                </TableCell>
                <TableCell>
                  <ConfirmDeleteButton
                    label={`ลบ ${s.courseId}`}
                    title="ลบวิชา?"
                    description={`ลบ ${s.courseId} ${s.courseTitle} จากรายวิชาที่เปิดสอน พร้อมการลงทะเบียนทั้งหมดของวิชานี้`}
                    onConfirm={() => removeCourse(s.courseId)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
