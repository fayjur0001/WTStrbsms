import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Providers from "./providers";
import SocketListeners from "@/components/socket-listeners/client";
import Header from "./_components/header/client";
import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import RedirectToSiteStatus from "./_components/redirect-to-site-status";
import Support from "./_components/support";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = getAuth();

  const payload = await auth.getNullablePayload();

  const mode = await SiteOptions.siteMode.get();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/favicon.ico" type="image/x-icon" />
      </head>
      <Providers>
        <body>
          {payload && (
            <Header username={payload.username} role={payload.role} />
          )}
          <Toaster />
          <SocketListeners />
          <RedirectToSiteStatus
            mode={mode}
            role={payload?.role}
            shadowAdmin={payload?.isShadowAdmin || false}
          />
          {children}
          {!!payload?.role && <Support />}
        </body>
      </Providers>
    </html>
  );
}
