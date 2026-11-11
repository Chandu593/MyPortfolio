import type { Metadata } from "next";
import { seo, profile } from "@/data/profile";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl), title: seo.title, description: seo.description,
  alternates: { canonical: "/" }, authors: [{ name: profile.name }],
  openGraph: { title: seo.title, description: seo.description, type: "website", url: "/", siteName: `${profile.name} — Portfolio` },
  twitter: { card: "summary", title: seo.title, description: seo.description },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
const themeScript = `(function(){try{var t=localStorage.getItem('portfolio-theme');if(t!=='dark'&&t!=='light')t='dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`;
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
