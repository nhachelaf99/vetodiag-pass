import type { Metadata } from "next";
import { Sora, Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PetsProvider } from "@/contexts/PetsContext";
import ConditionalHeader from "@/components/ConditionalHeader";
import ConditionalFooter from "@/components/ConditionalFooter";

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VetoDiag - Veterinary Client Portal",
  description: "Advanced veterinary software for streamlined operations and improved care for your beloved pets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sora.className} ${poppins.variable} ${inter.variable} bg-background-dark text-gray-300 antialiased`}>
        <AuthProvider>
          <PetsProvider>
            <ConditionalHeader />
            <main>{children}</main>
            <ConditionalFooter />
          </PetsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

