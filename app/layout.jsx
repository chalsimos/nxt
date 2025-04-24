import { Manrope } from "next/font/google"
import "@/app/globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = {
  title: "Smart Care - Your Health, One Click Away",
  description: "A modern telehealth platform for all your healthcare needs",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <body className={`min-h-screen bg-pale-stone antialiased ${manrope.className}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
