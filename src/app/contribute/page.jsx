"use client";

import "@/app/ui/global.css";
import React, { useState, useRef, useEffect } from "react";
import { io } from 'socket.io-client';

function Contribute() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const socketRef = useRef(null);

  const URL = "https://hotrs.fr" // "http://localhost:3001" 

  useEffect(() => {
    socketRef.current = io(URL);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!title || !artist) {
      setError("Le titre et l'artiste sont obligatoires.");
      return;
    }

    if (title.length > 100 || artist.length > 100) {
      setError("Titre ou artiste trop long (100 caractères max).");
      return;
    }

    if (genre.length > 100) {
      setError("Genre trop long (100 caractères max).");
      return;
    }

    socketRef.current.emit(
      "sendContribution",
      { title, artist, genre },
      (response) => {
        if (response?.success) {
          setMessage("Merci ! Ta proposition a bien été envoyée 🎶");
          setTitle("");
          setArtist("");
          setGenre("");
        } else {
          setError("Erreur lors de l'envoi.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-medium text-center mb-6">
          Proposer une nouvelle musique
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block font-medium mb-1">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Nom de la musique"
            />
          </div>

          {/* Artiste */}
          <div>
            <label className="block font-medium mb-1">Artiste *</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Nom de l'artiste"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block font-medium mb-1">Genre</label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Ex: Pop, Rock, Electro..."
            />
          </div>

          {/* Messages */}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          {/* Bouton */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
          >
            Envoyer la proposition
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contribute;