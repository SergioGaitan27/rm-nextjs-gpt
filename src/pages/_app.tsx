// src/pages/_app.tsx
import '../styles/globals.css';  // Ajusta la ruta según la estructura de tu proyecto

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  return <Component {...pageProps} />;
}

export default MyApp;