import Sidebar from "@/components/Sidebar";

export default function ScanQRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background-dark">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center">{children}</main>
    </div>
  );
}

