import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SportTo — Find play in Toronto",
  description:
    "Find drop-in badminton sessions and schedules at community centres across downtown Toronto — calendar and map in one place.",
};

export const viewport: Viewport = {
  themeColor: "#0D7377",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background">
        <Navbar />
        <main
          className="flex-1"
          style={{
            paddingBottom:
              "calc(env(safe-area-inset-bottom, 0px) + var(--mobile-nav-h, 0px))",
          }}
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
