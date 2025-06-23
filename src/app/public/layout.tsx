import Topbar from "@/components/Topbar";

// src/app/public/layout.tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
      <>
        <Topbar />
          {children}
      </>
    );
  }