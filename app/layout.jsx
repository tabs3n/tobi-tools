import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata = {
  title: "Tobi's Tools",
  description: 'Persönlicher Projekt-Hub — alle Vercel-Projekte auf einen Blick.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" data-theme="dark" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
