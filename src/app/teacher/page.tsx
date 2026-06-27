import { redirect } from 'next/navigation';

export default function TeacherDefaultPage() {
  redirect('/teacher/students');
}
