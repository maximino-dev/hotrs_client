"use client";

import '@/app/ui/global.css';

import React, { useState, useEffect, useRef } from 'react';
import { TrackInfos } from '@/app/party/CommonUX';
import axios from 'axios';
import { io } from 'socket.io-client';
import './style.css';
import { MusicalNoteIcon, UserIcon } from "@heroicons/react/24/solid";

function ModeSolo() {

  const [partyId, setPartyId] = useState("");
	const [username, setUsername] = useState("");
	const [joined, setJoined] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [artistTitle, setArtistTitle] = useState("");
  const [trackInfo, setTrackInfo] = useState({ title: '', artist: '', coverUrl: '' });
  const [error, setError] = useState(null);
  const [trackStartTime, setTrackStartTime] = useState(null); // temps de début de la musique en ms
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [animateInput, setAnimateInput] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [foundTitle, setFoundTitle] = useState(false);
  const [foundArtist, setFoundArtist] = useState(false);
  const [timeArtist, setTimeArtist] = useState(null);
  const [timeTitle, setTimeTitle] = useState(null);

	const socketRef = useRef(null);
  const partyIdRef = useRef(null);

  const URL = "https://hotrs.fr" // "http://localhost:3001"

  // Fetch genres on component mount
  useEffect(() => {
    socketRef.current = io(URL);

    const socket = socketRef.current;

    socket.on("playTrack", ({ party_id, song_id, duration }) => {
      setTimeArtist(null);
      setTimeTitle(null);
      setFoundTitle(false);
      setFoundArtist(false);
      setCurrentTrack(prev => prev + 1);
      setAudioUrl(URL + "/solos/" + song_id + ".mp3");
      setArtistTitle("");
      setTrackStartTime(Date.now());
      setTimeout(() => {
        socketRef.current.emit("getCurrentTrack", { partyId: partyIdRef.current });
        setAudioUrl(null);
      }, duration * 1000);

      setTimeout(() => {
        socketRef.current.emit("nextTrackSolomode", { partyId: partyIdRef.current });
      }, duration * 1000 + 1000);
    });

    socket.on("getTrackInfos", ({ title, artist, coverUrl}) => {
      setAudioUrl(null);
      setTrackInfo({ title, artist, coverUrl });
    });

    socket.on("finishParty", () => {
      socketRef.current.emit("getLeaderboard", { mode: "solo" }, (response) => {
        if (response.success) {
          setLeaderboard(response.leaderboard);
        } else {
          setError(response.message || "Erreur lors de la récupération du classement.");
        }
      });
      setFinished(true);
    });

    return () => {
      socket.off("playTrack");
      socket.off("getTrackInfos");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    partyIdRef.current = partyId;
  }, [partyId]);

	const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      setError("Pseudo requis.");
      return;
    }

    if (username.length > 20) {
      setError("Pseudo trop long (20 caractères max).");
      return;  
    }

    socketRef.current.emit("joinSoloMode", { username }, (response) => {
      if (response.success) {
        partyIdRef.current = response.partyId;
        setJoined(true);
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

    if (foundArtist && foundTitle) {
      setArtistTitle("");
      return;
    }

    const elapsedTime = Date.now() - trackStartTime; // en ms
    const elapsedSeconds = (elapsedTime / 1000).toFixed(2); // secondes avec 2 décimales

    socketRef.current.emit("playerSoloAnswer", { partyId: partyIdRef.current, artistTitle: artistTitle, time: elapsedTime }, (response) => {
      if(response.success) {
        setAnimateInput(true);
        setTimeout(() => setAnimateInput(false), 250);
        setScore(response.score); // met à jour le score affiché
        if (response.result === "both") {
          setTimeArtist(elapsedSeconds);
          setTimeTitle(elapsedSeconds);
          setFoundTitle(true);
          setFoundArtist(true);
        } else if (response.result === "title") {
          setTimeTitle(elapsedSeconds);
          setFoundTitle(true);
        } else {
          setTimeArtist(elapsedSeconds);
          setFoundArtist(true);
        }
      } else {
        setWrongAnim(true);
        setTimeout(() => setWrongAnim(false), 250);
      }
    });

    setArtistTitle("");
  }

  const handleReplay = () => {
    setFinished(false);
    setAudioUrl(null);
    setTrackInfo({ title: '', artist: '', coverUrl: '' });
    setScore(0);
    setCurrentTrack(0);
    setFoundTitle(false);
    setFoundArtist(false);
    socketRef.current.emit("startSolomode", { partyId: partyIdRef.current });
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">

		{ !joined ? (
      <div className="md:w-1/2 bg-white p-8 rounded shadow-md">

			<form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Votre pseudo</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  placeholder="Ex: XxTheKillerxX"
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
        </div>) : (
        <>
        {!finished ? (
          <>
          {currentTrack > 0 && (
            <div className="track-counter">
              {currentTrack}/10
            </div>
          )}
          <div className="bg-white p-2 rounded shadow-md w-full max-w-lg mt-4 text-center font-bold flex justify-center items-center gap-4 mb-8">
            <span className="text-blue-600 text-lg">{username}</span>
            <span className="text-blue-800 text-lg">Score : {score} pts</span>
          </div>
          <div className="found-wrapper">
            {foundArtist && (
              <span className="found-tag artist">
                <UserIcon className="w-4 h-4 text-white" />
                Artiste
                <span className="ml-1 text-xs text-white">{timeArtist}s</span>
              </span>
            )}

            {foundTitle && (
              <span className="found-tag title">
                <MusicalNoteIcon className="w-4 h-4" />
                Titre
                <span className="ml-1 text-xs text-white">{timeTitle}s</span>
              </span>
            )}
          </div>
          <div className={`bg-white p-4 rounded shadow-md w-full max-w-lg mt-4 ${animateInput ? "beat" : "" } ${wrongAnim ? "wrong" : ""}`}>
            <label className="block font-medium mb-1">Artiste et Titre</label>
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
          <div className="bg-white w-full rounded max-w-lg mt-4">
            {trackInfo.title && ( 
              <div className="w-full md:w-1/2">
                <TrackInfos
                  title={trackInfo.title}
                  artist={trackInfo.artist}
                  coverUrl={trackInfo.coverUrl}
                />
              </div>
            )}
          </div>
          </>) : (
            <div className="bg-white p-4 rounded shadow-md w-full max-w-lg mt-6">
              <h2 className="text-xl font-bold mb-4 text-center">🏆 Meilleurs scores</h2>
              <ul>
                {leaderboard.map((player, index) => (
                  <li key={index} className="flex justify-between py-1 px-2 border-b border-gray-200">
                    <span className="font-semibold text-blue-600">{player.username}</span>
                    <span className="font-bold text-blue-800">{player.score} pts</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-center mt-10">
                <span className="text-blue-600">{username}</span>
                <span className="text-blue-800 font-bold">{score} pts</span>
                <button
                  onClick={handleReplay}
                  className="bg-blue-600 text-white px-6 py-2 mt-5 rounded hover:bg-blue-700 transition">
                  Rejouer
                </button>
              </div>
            </div>
          )}
        </>
        )}

      {audioUrl && (
        <div className="mt-6">
          <audio src={audioUrl} autoPlay />
        </div>
      )}
    </div>
  );
}

export default ModeSolo;

