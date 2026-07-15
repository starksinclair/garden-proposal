import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "A Garden 🌿",
  description: "Something is growing here.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Quicksand:wght@400;500;600&display=swap"
            rel="stylesheet"
        />
        <link rel="shortcut icon" href="/leaf.svg" type="image/svg+xml"/>
        <title>A Garden 🌿</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>

    </head>
    <body>
    {children}
    <Analytics/>
    </body>
    </html>
  );
}
