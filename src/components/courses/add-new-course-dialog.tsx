import { useState ,useMemo} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus,PlusCircle , X , RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCourseFormSchema,
  MAX_DESCRIPT,
  programOptions,
  MAX_INSTRUCTOR,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { Controller,useFieldArray, useForm, type DefaultValues } from "react-hook-form";

/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */
const emptyCourseForm: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  instructors: [{name: "" , email: ""}],
  program: undefined,
  semester: undefined,
  description: "",
  notifyByEmail: false
};
export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  const schema = useMemo(()=>createCourseFormSchema(courses),[courses]);
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur",
  });

  const {fields ,append ,remove} = useFieldArray({
    control: form.control,
    name: "instructors", 
  });

  const instructorError = form.formState.errors.instructors?.root ?? form.formState.errors.instructors;

  const resetForm = () => form.reset(emptyCourseForm);

  function onSubmit(values: CourseFormValues){
    addCourse(values);
    resetForm();
    setOpen(false);
  }


  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกรหัสวิชา ชื่อวิชา และผู้สอน
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <Controller
            name="courseId"
            control={form.control}
            render={({field,fieldState})=>(
              <Field data-invalid = {fieldState.invalid}>
                <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>
                <Input 
                {...field}
                id="courseId"
                placeholder="เช่น 261305"
                aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
            />
            <Controller
            name="courseTitle"
            control={form.control}
            render={({field,fieldState})=>(
              <Field data-invalid = {fieldState.invalid}>
                <FieldLabel htmlFor="courseTitle">ชื่อวิชา</FieldLabel>
                <Input 
                {...field}
                id="courseTitle"
                placeholder="เช่น Mobile Application Development"
                aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
            />
            <Controller
            name="program"
            control={form.control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                <Select
                    name={field.name}
                    items={programOptions}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                    field.onChange(v);
                    field.onBlur(); // Select ไม่มี blur ชัดเจน — ถือว่าแตะแล้วตั้งแต่เลือก
                    }}
                >
                    <SelectTrigger
                    id="program"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                    ref={field.ref}
                    >
                    <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                    {programOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                        {o.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
            />
            <Controller
            name="semester"
            control={form.control}
            render={({field,fieldState})=>(
              <Field data-invalid = {fieldState.invalid}>
                <FieldLabel htmlFor="semester">ภาคการศึกษา</FieldLabel>
                <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="1"
                      checked={field.value === "1"} // ตรวจสอบว่าค่าที่เก็บไว้ตรงกับ 1 หรือไม่
                      onChange={() => field.onChange("1")} // ส่งค่า 1 (เป็นตัวเลข) กลับไปที่ form
                      onBlur={field.onBlur}
                      className="cursor-pointer"
                    />
                    ภาคการศึกษาที่ 1
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="2"
                      checked={field.value === "2"}
                      onChange={() => field.onChange("2")} // ส่งค่า 2
                      onBlur={field.onBlur}
                      className="cursor-pointer"
                    />
                    ภาคการศึกษาที่ 2
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value="3"
                      checked={field.value === "3"}
                      onChange={() => field.onChange("3")} // ส่งค่า 3
                      onBlur={field.onBlur}
                      className="cursor-pointer"
                    />
                    ภาคฤดูร้อน
                  </label>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState}) => {
                const charCount = (field.value || "").length;

                return (
                  <>
                    <Input
                      type="text"
                      {...field}
                      placeholder="คำอธิบายรายวิชาสั้นๆ"
                      maxLength={MAX_DESCRIPT}
                      className="p-2 rounded border w-full"
                    />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">
                        {charCount}/{MAX_DESCRIPT} ตัวอักษร
                      </span>
                    </div>  
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    
                  </>
                );
              }}
            />
          </FieldGroup>
          <FieldSet data-invalid={!!instructorError?.message}>
            <FieldLegend variant="label">ผู้สอน</FieldLegend>
            <FieldDescription>
              {fields.length}/{MAX_INSTRUCTOR} — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)
            </FieldDescription>
            <FieldGroup className="gap-3">
              {fields.map((item,index)=>(
                <div key={item.id} className="flex items-start gap-2">
                  <span className="mt-2 text-sm text-muted-foreground">{index+1}.</span>
                  <Controller 
                  name={`instructors.${index}.name`}
                  control={form.control}
                  render={({field,fieldState})=>(
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                      <FieldContent>
                        <Input
                        {...field}
                        type="text"
                        placeholder="ชื่อผู้สอน"
                        aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]}/>
                        )}
                      </FieldContent>
                    </Field>
                  )}
                  />
                  <Controller
                  name={`instructors.${index}.email`}
                  control={form.control}
                  render={({field,fieldState})=>(
                    <Field data-invalid={fieldState.invalid} className="flex-1">
                    <FieldContent>
                      <Input
                      {...field} 
                      type="email"
                      placeholder="name@cmu.ac.th"
                      aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]}/>
                        )}
                    </FieldContent>
                    </Field>
                  )}
                  />
                  <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length<=1}
                  onClick={()=>{
                    remove(index);
                  }}
                  >
                    <X className="size-4"/>
                  </Button>
                </div>
              ))}
            </FieldGroup>

            {instructorError?.message && <FieldError errors={[instructorError]}/>}
            <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={fields.length >= MAX_INSTRUCTOR}
            onClick={()=> {
              append({name:"" , email: ""});
              
            }}
            >
              <Plus className="size-4"/>
              เพิ่มผู้สอน
            </Button>
            <Controller
            name="notifyByEmail"
            control={form.control}
            render={({ field }) => (
              <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel className="text-base font-medium">
                    รับข่าวสารทางอีเมล
                  </FieldLabel>
                  <FieldDescription className="text-sm">
                    แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                  </FieldDescription>
                </div>
                
                <FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="receiveEmails"
                  />
                </FieldContent>
              </Field>
            )}
          />
          </FieldSet>

          <DialogFooter>
            <Button
              type="button"
              onClick={resetForm}
            >
              <RotateCcw className="size-4"/>
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
