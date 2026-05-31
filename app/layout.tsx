import { ReactNode } from "react";
import dynamic from "next/dynamic";
import "./globals.css";

const AddToHomeScreen = dynamic(
  () => import("@/components/templates/pwa/AddToHomeScreenPopup"),
  { ssr: false }
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const googleMapsScript = await fetchGoogleMapsScript();

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-T7SM88N5');`,
          }}
        />
        <title>Bloomscale</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFFFFF" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/logo/bloomin_logo_180.png"
        />
        <meta name="apple-mobile-web-app-title" content="Bloomscale" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {googleMapsScript && (
          <script
            dangerouslySetInnerHTML={{ __html: googleMapsScript }}
            async={true}
          />
        )}
      </head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T7SM88N5"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {children}
        <AddToHomeScreen />
      </body>
    </html>
  );
}

async function fetchGoogleMapsScript() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}api/utils/google/load-map/`, {
      next: { revalidate: 900 },
    });
    if (res.ok) {
      const googleMapsScript = await res.text();
      return googleMapsScript;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Google Maps script:", error);
    return null;
  }
}
