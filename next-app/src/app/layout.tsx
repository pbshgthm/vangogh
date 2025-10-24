import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vangogh",
  description: "Search engine for color palettes",
  openGraph: {
    title: "Vangogh - Search engine for color palettes",
    description: "Get accurate color palettes for any word, idea or theme.",
    url: "https://thevangogh.in",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Lato:300|Roboto:100"
        />
        <link rel="stylesheet" href="/static/main.css?v=4" />
        <link
          rel="shortcut icon"
          href="/static/img/favicon.ico"
          type="image/x-icon"
        />
        <Script
          src="/static/jquery.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.usefathom.com/script.js"
          data-site="EIJCTMTX"
          strategy="afterInteractive"
        />
        <Script id="support-controls" strategy="afterInteractive">
          {`
            function initSupportControls() {
              const $ = window.jQuery;
              if (!$) {
                return;
              }
              var supportImage = $('#support');
              var supportLink = $('#support-link');
              if (!supportLink.length && supportImage.length) {
                supportLink = supportImage.closest('a');
              }
              $('#support-close')
                .off('click.vangogh')
                .on('click.vangogh', function () {
                  supportImage.hide();
                  $('#support-close').hide();
                });
              if (supportLink && supportLink.length) {
                supportLink
                  .off('click.vangogh')
                  .on('click.vangogh', function () {
                    if (typeof fathom !== 'undefined' && fathom.trackGoal) {
                      fathom.trackGoal('ULWI97SF', 0);
                    }
                  });
              }
            }
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              initSupportControls();
            } else {
              document.addEventListener('DOMContentLoaded', initSupportControls);
            }
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
