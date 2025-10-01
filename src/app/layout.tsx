import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Aquarium Investing Platform',
  description: 'Automated trading and machine learning platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 p-4 bg-background sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
