export default function MyPetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      {children}
    </div>
  );
}

