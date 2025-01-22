"use client"
import "./globals.css";


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
				<div className="main_background"></div>
				{children}
      </body>
    </html>
  );
}
