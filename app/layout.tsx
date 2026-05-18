import type { Metadata } from 'next';
import './globals.css';
import DarkModeToggle from '@/components/DarkModeToggle';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'MyConnect AI',
  description: 'Manage your AI conversations with Claude',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  MyConnect AI
                </h1>
                <DarkModeToggle />
              </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            `,
          }}
        />
      </body>
    </html>
  );
}