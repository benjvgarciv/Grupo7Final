import './globals.css';

export const metadata = {
  title: 'Sistema POS',
  description: 'Punto de Venta para Pymes Chilenas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
