// src/pages/_app.tsx
import '../styles/globals.css';  // Ajusta la ruta según la estructura de tu proyecto
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;