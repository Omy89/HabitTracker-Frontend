'use client';

import Image from 'next/image';
import AppBar from './components/layout/AppBar';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center font-sans">
      <AppBar />
      <h1 className="text-6xl font-bold text-black">Prueba de Next.js 13</h1>
      <p className="mt-6 text-2xl text-black">
        no he avanzado nada de el proyecto
      </p>
    </div>
  );
}
