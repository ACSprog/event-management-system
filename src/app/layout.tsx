import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui";
import { DemoBar } from "@/components/layout/demo-bar";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: `${brand.name}: events in Zambia`, template: `%s · ${brand.name}` },
  description: "Discover events near you, buy tickets with mobile money and walk straight in.",
};

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <DemoBar />
          {children}
        </ToastProvider>
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
