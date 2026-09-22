import { AdminHeader } from "@/layouts/admin/AdminHeader";
import { AdminSidebar } from "@/layouts/admin/AdminSidebar";
import Wrapper from "./Wrapper";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-100 admin-panel">
      <div className="flex ">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ">
          <AdminHeader />
          <main className="flex-1  bg-dark-blue-cm/50">
            <div className="container mx-auto px-6 py-8 max-mb-xl:px-4 w-full">
              <Wrapper>{children}</Wrapper>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
