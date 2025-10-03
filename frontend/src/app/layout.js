import dynamic from 'next/dynamic'
const ClientLayout = dynamic(() => import('../../src/components/ClientLayout'))
// Mantine SSR removed for now; we'll implement SSR after full Mantine conversion
export const metadata = {
  title: 'Form Maker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/generated-tailwind.css" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className={`antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
