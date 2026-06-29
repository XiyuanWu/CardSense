import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#5E17EB" />
        {/* Mobile Expo Web tab icon only (icon mark, no wordmark) */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=7" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=7" />
        <link rel="apple-touch-icon" href="/logo192.png?v=7" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
