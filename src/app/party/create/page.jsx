"use client";

import '@/app/ui/global.css';
import FloatingChat from '@/app/party/FloatingChat';
import Podium from '@/app/party/Podium';
import { Infos, TrackInfos } from '@/app/party/CommonUX';
import './style.css';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

function CreateParty() {
  const [genre, setGenre] = useState('');
  const [yearMin, setYearMin] = useState(1900);
  const [yearMax, setYearMax] = useState(2025);
  const [limit, setLimit] = useState(10);
  const [track, setTrack] = useState(null);
  const [genres, setGenres] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [partyId, setPartyId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [artistTitle, setArtistTitle] = useState("");
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '', coverUrl: '' });
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [trackStartTime, setTrackStartTime] = useState(null); // temps de début de la musique en ms 

  const socketRef = useRef(null);
  const partyIdRef = useRef(null);

  const URL = "http://localhost:3001" // https://hotrs.fr

  // Fetch genres on component mount
  useEffect(() => {
    socketRef.current = io(URL);

    const socket = socketRef.current;

    const getGenres = async () => {
      try {
        const res = await axios.get(URL + '/api/genres');
        setGenres(res.data); // res.data is an array of genres
      } catch (error) {
        console.error('Erreur API (genres):', error);
      }
    };

    getGenres();

    // Écoute des événements socket
    socket.on("partyUpdate", ({ players }) => {
      setPlayers(players);
    });

    socket.on("playTrack", ({ preview_link }) => {
      if (!started) {
        setStarted(true);
      }
      setTrackStartTime(Date.now());
      setAudioUrl(preview_link);
      setArtistTitle("");
      setTimeout(() => {
        socketRef.current.emit("getCurrentTrack", { partyId: partyIdRef.current });
        setAudioUrl(null);
      }, 30000);

      setTimeout(() => {
        socketRef.current.emit("nextTrack", { partyId: partyIdRef.current });
      }, 35000);
    });

    socket.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on("finishParty", () => {
      setFinished(true);
    });

    socket.on("getTrackInfos", ({ title, artist, coverUrl}) => {
      setAudioUrl(null);
      setTrackInfo({ title, artist, coverUrl });
    });

    socket.on("restartParty", () => {
      // Reset les infos pour rejouer
      setFinished(false);
      setStarted(false);
      setAudioUrl(null);
      setTrackInfo({ title: '', artist: '', coverUrl: '' });
      setChatMessages([]);
    });

    return () => {
      socket.off("partyUpdate");
      socket.off("playTrack");
      socket.off("chatMessage");
      socket.off("finishParty");
      socket.off("getTrackInfos");
      socket.off("restartParty");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    partyIdRef.current = partyId;
  }, [partyId]);

  const handleCreateParty = () => {
    if (!username.trim()) {
      setError("Merci d'entrer un pseudo !");
      return;
    }

    if (username.length > 20) {
      setError("Pseudo trop long (20 caractères max).");
      return;  
    }

    if (yearMin > yearMax) {
      setError("L'année de début doit être inférieure à celle de fin !");
      return;
    }

    socketRef.current.emit("createParty", { username, options: { genre, yearMin, yearMax, limit } }, (response) => {
      if (response.success) {
        setError(null);
        setPartyId(response.partyId);
        partyIdRef.current = response.partyId;
      } else {
        setError(response.message || "Erreur lors de la création de la partie.");
      }
    });
  };

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

  const handleStartGame = async (e) => {
    e.preventDefault();
    setAudioUrl(null);

    socketRef.current.emit("startParty", { partyId: partyIdRef.current });
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

  const handleReplay = () => {
    socketRef.current.emit("restartParty", { partyId: partyIdRef.current });
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

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
      ) : !finished && partyId && (
        <div className="bg-white p-4 rounded shadow-md w-full max-w-md mt-4">
          <label className="block font-medium mb-1">En attente d'une chanson...</label>
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
          {!partyId ? (
            <form onSubmit={(e) => { e.preventDefault(); handleCreateParty(); }} className="space-y-4">
                {/* Champ pseudo */}
                <div>
                  <label className="block mb-1 font-medium">Votre pseudo</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    className={`w-full border rounded px-3 py-2 ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder=""
                  />
                  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>

              <div className="border-t border-gray-300 pt-6 mt-4">
                <h4 className="text-md font-semibold mb-4 text-gray-700">
                  Personnalisation du blindtest
                </h4>

                {/* Genre */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Tous les genres</option>
                    {genres.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Période */}
                <div>
                  <label className="block mb-1 font-medium">Période (années)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={yearMin}
                      onChange={(e) => setYearMin(Number(e.target.value))}
                      className="w-1/2 border border-gray-300 rounded px-3 py-2"
                      placeholder="De"
                    />
                    <input
                      type="number"
                      value={yearMax}
                      onChange={(e) => setYearMax(Number(e.target.value))}
                      className="w-1/2 border border-gray-300 rounded px-3 py-2"
                      placeholder="À"
                    />
                  </div>
                </div>

                {/* Nombre de chansons */}
                <div className="mt-4">
                  <label className="block gap-2 mb-1 font-medium">Combien de titres ? </label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-1/2 border border-gray-300 rounded px-3 py-2"
                      placeholder="À"
                    />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Créer la partie
              </button>
            </form>
          ) : finished ? (<Podium
              players={players}
              partyId={partyId}
              handleReplay={handleReplay}
              owner={true}/>
          ) : (<Infos
              players={players}
              partyId={partyId}
              owner={true}
              handleStartGame={handleStartGame}
              started={started}
              />) }
        </div>
      </div>

      {audioUrl && (
          <div className="mt-6">
            <audio src={audioUrl} autoPlay />
          </div>
      )}

      {partyId && (
        <div className="block md:hidden">
          <FloatingChat
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChatMessage={sendChatMessage}
          />
        </div>
      )}
    </div>
  );
}

export default CreateParty;
