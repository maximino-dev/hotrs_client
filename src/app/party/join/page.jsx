"use client";

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './style.css';
import FloatingChat from '@/app/party/FloatingChat';
import Podium from '@/app/party/Podium';
import { Infos, TrackInfos } from '@/app/party/CommonUX';

function JoinParty() {
  const [partyId, setPartyId] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [artistTitle, setArtistTitle] = useState("");
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '', coverUrl: '' });
  const [finished, setFinished] = useState(false);
  const [trackStartTime, setTrackStartTime] = useState(null); // temps de début de la musique en ms

  const socketRef = useRef(null);
  const partyIdRef = useRef(null);

  const URL = "https://hotrs.fr" // "http://localhost:3001" //

  useEffect(() => {

    socketRef.current = io(URL);

    const socket = socketRef.current;

    socket.on("partyUpdate", ({ players }) => {
      setPlayers(players);
    });

    socket.on("error", (err) => {
      setError(err.message);
    });

    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on("getTrackInfos", ({ title, artist, coverUrl}) => {
      setAudioUrl(null);
      setTrackInfo({ title, artist, coverUrl });
    });

    socket.on("finishParty", () => {
      setFinished(true);
    });

    socket.on("playTrack", ({ preview_link }) => {
      setTrackStartTime(Date.now());
      setAudioUrl(preview_link);
      setArtistTitle("");
    });

    socket.on("restartParty", () => {
      // Reset les infos pour rejouer
      setFinished(false);
      setAudioUrl(null);
      setTrackInfo({ title: '', artist: '', coverUrl: '' });
      setChatMessages([]);
    });

    return () => {
      socket.off("partyUpdate");
      socket.off("error");
      socket.off("finishParty");
      socket.off("chatMessage");
      socket.off("getTrackInfos");
      socket.off("restartParty");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    partyIdRef.current = partyId;
  }, [partyId]);

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socketRef.current.emit("chatMessage", {
      partyId: partyIdRef.current,
      username,
      message: chatInput
    });

    setChatInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!partyId || !username) {
      setError("ID de la partie et pseudo requis.");
      return;
    }

    if (username.length > 20) {
      setError("Pseudo trop long (20 caractères max).");
      return;  
    }

    socketRef.current.emit("joinParty", { partyId, username }, (response) => {
      if (response.success) {
        setJoined(true);
        setError(null);
        setPartyId(partyId);
        partyIdRef.current = partyId;
      } else {
        setError(response.message || "Erreur lors de la connexion à la partie.");
      }
    });

  };

  const handleAnswer = (e) => {
    e.preventDefault();

    if (!trackStartTime) {
      return;
    }

    const elapsedTime = Date.now() - trackStartTime; // en ms
    const elapsedSeconds = (elapsedTime / 1000).toFixed(2); // secondes avec 2 décimales

    socketRef.current.emit("playerAnswer", { partyId: partyId, artistTitle: artistTitle, time: elapsedTime }, (response) => {
      if (response.success) {
        const res = response.result;
        if (res === "both") {
        } else if(res === "title") {
        } else if (res === "artist") {
        }
      }
    });

    setArtistTitle("");
  }

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* Champ artiste + titre visible uniquement quand la partie est créée */}
      {!finished && audioUrl ? (
      <div className="beat bg-white p-4 rounded shadow-md w-full max-w-lg mt-4">
        <label className="block font-medium mb-1">🎤 Artiste et Titre</label>
        <form onSubmit={handleAnswer}>
        <input
          type="text"
          value={artistTitle}
          onChange={(e) => setArtistTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder=""
          autoFocus
        />
        </form>
      </div>
      )
      : !finished && joined && (
          <div className="bg-white p-4 rounded shadow-md w-full max-w-md mt-4">
            <label className="block font-medium mb-1">En attente d&#39;une chanson...</label>
          </div>
        )}

      <div className="flex flex-col md:flex-row justify-center items-start gap-6 mt-8 w-full max-w-2xl">
        { !finished && trackInfo.title && ( 
          <div className="w-full md:w-1/2">
            <TrackInfos
              title={trackInfo.title}
              artist={trackInfo.artist}
              coverUrl={trackInfo.coverUrl}
            />
          </div>
        )}

        <div className="w-full md:w-1/2 bg-white p-8 rounded shadow-md">

          {!joined ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID de la partie</label>
                <input
                  type="text"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  placeholder="Ex: A1B2C3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Votre pseudo</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  placeholder="Ex: FantasioDu98"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-400 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
              >
                Rejoindre la partie
              </button>
            </form>
          ) : finished ? (<Podium
              players={players}
              partyId={partyId}
              owner={false}
              />
          ) : (<Infos
              players={players}
              partyId={partyId}
              owner={false}
              />)}
        </div>
      </div>

      {audioUrl && (
        <div className="mt-6">
          <audio src={audioUrl} autoPlay />
        </div>
      )}

      {joined && (
        <FloatingChat
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendChatMessage={sendChatMessage}
        />
      )}
    </div>
  );
}

export default JoinParty;
