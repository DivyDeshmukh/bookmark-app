import AuthProtected from "@/components/auth/AuthProtected";
import Navbar from "@/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProtected>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main>{children}</main>
      </div>
    </AuthProtected>
  );
}
