import { StudentRegistrationWizard } from "@/components/student-form/wizard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50/40 to-white">
      <StudentRegistrationWizard />
    </main>
  );
}
