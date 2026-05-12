import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata = {
  title: "Tobi's Tools",
  description: 'Persönlicher Projekt-Hub — alle Vercel-Projekte auf einen Blick.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" data-theme="dark">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
