import Topbar from "@/components/Topbar";

// src/app/public/layout.tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
        <Topbar />
          {children}
        </body>
      </html>
    );
  }