import AdminMenu from "@/components/AdminMenu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminMenu />
      {children}
    </>
  );
}
