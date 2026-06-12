import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SmartAccountProvider } from "./hooks/useSmartAccount"; // NEW: Import the Provider

export const metadata = {
  title: "Daily Grind",
  description: "Web3 Habit Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* WE WRAP THE ENTIRE APP HERE */}
        <SmartAccountProvider>
          {children}
          <Toaster position="bottom-right" reverseOrder={false} />
        </SmartAccountProvider>
      </body>
    </html>
  );
}