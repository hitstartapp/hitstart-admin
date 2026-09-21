import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hitstart Admin Dashboard',
  description: 'An administrative dashboard for Hitstart.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
