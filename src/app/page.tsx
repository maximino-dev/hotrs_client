"use client";

import Image from "next/image";
import Link from "next/link";
import '@/app/ui/Home.css';
import '@/app/ui/global.css';

import { useRouter } from "next/navigation";


function Home() {
  const router = useRouter();
return (
    <div className="App min-h-screen flex flex-col items-center justify-center px-4 bg-blue-400">
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-md flex flex-col items-center space-y-6">

        {/* Logo */}
        <div className="w-80 h-80 flex items-center justify-center">
          <img src="./logohotrs.png" />
        </div>

        {/* Boutons */}
        <div className="w-full flex flex-col space-y-4 mt-4">
          <button
            onClick={() => router.push("/party/create")}
            className="w-full bg-blue-400 hover:bg-blue-700 text-white py-3 rounded text-lg font-semibold shadow"
          >
            Créer une partie
          </button>

          <button
            onClick={() => router.push("/party/join")}
            className="w-full bg-blue-400 hover:bg-blue-700 text-white py-3 rounded text-lg font-semibold shadow"
          >
            Rejoindre une partie
          </button>

          <button
            onClick={() => router.push("/modes/solos")}
            className="w-full bg-blue-400 hover:bg-blue-700 text-white py-3 rounded text-lg font-semibold shadow"
          >
            Mode Solos
          </button>
        </div>
      </div>
      <div className="pt-50 flex-col">
        <button
              onClick={() => router.push("/contribute")}
              className="text-blue-500 p-3 rounded text-lg font-semibold cursor-pointer"
            >Ajouter des sons</button>

                <button
              onClick={() => router.push("/legal")}
              className="text-blue-500 p-3 rounded text-lg font-semibold cursor-pointer"
            >Mentions légales</button>
      </div>
    </div>
  );
}

export default Home;
