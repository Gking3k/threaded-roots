import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

function AdminLayout({
  title,
  children,
}) {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title={title}
        />

        {children}
      </main>
    </div>
  );
}

export default AdminLayout;