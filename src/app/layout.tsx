import type { Metadata } from "next";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import SessionWrapper from './components/SessionWrapper';

export const metadata: Metadata = {
  title: "Petanque",
  description: "Petanque",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="fr">
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
