import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <h1 className="text-6xl font-bold text-black">Prueba de Next.js 13</h1>
      <p className="mt-6 text-2xl text-black">
        Esta es una prueba de Next.js 13 con TypeScript y Tailwind CSS.
      </p>
    </div>
  );
}
