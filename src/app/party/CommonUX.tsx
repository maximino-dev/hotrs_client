"use client";

import React from "react";
import { MusicalNoteIcon, UserIcon } from "@heroicons/react/24/solid";


// Type pour un joueur
type Player = {
  id: string;
  username: string;
  foundTitle?: boolean;
  foundArtist?: boolean;
  score: number;
  timeTitle: number;
  timeArtist: number;
};

// Props pour le composant Infos
type InfosProps = {
  players: Player[];
  partyId: string;
  owner: boolean;
  started: boolean;
  handleStartGame: () => void;
};

export function Infos({ players, partyId, owner, handleStartGame, started }: InfosProps) {

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2 text-blue-600">Id : <span className="font-mono">{partyId}</span></h2>
      <h3 className="text-lg font-medium mb-4">{players.length} Joueur(s) connecté(s) :</h3>
      <ul className="text-left space-y-1 mb-4">
        {players.map((player) => (
          <li key={player.id} className="flex items-center justify-between border-b py-1">
            <span>{player.username}</span>
            { player.foundTitle && (<span className="flex items-center gap-1">
                <MusicalNoteIcon className="w-5 h-5 text-black" />
                <span className="ml-1 text-xs text-black">{player.timeTitle}s</span>
              </span>) }
            { player.foundArtist && (<span className="flex items-center gap-1">
                <UserIcon className="w-5 h-5 text-black" />
                <span className="ml-1 text-xs text-black">{player.timeArtist}s</span>
              </span>) }
            <span className="text-sm text-gray-500">{player.score} pts</span>
          </li>
        ))}
      </ul>

      { !started && owner && (<button
        onClick={handleStartGame}
        className="w-full bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-700">
        Lancer la partie !
      </button> )}
    </div>
  )
}

type TrackInfosProps = {
  title?: string;
  artist?: string;
  coverUrl?: string;
};

export function TrackInfos({ title = "Titre inconnu", artist = "Artiste inconnu", coverUrl = "" }: TrackInfosProps) {
  return (
    <div className="flex items-center bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
      {/* Pochette de l'album à gauche */}
      {coverUrl && (
        <img
          src={coverUrl}
          alt={`Cover of ${title} by ${artist}`}
          className="w-32 h-32 object-cover rounded mr-6"
        />
      )}

      {/* Infos texte à droite */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-blue-600 mb-1">{title}</h2>
        <h3 className="text-lg text-gray-700">{artist}</h3>
      </div>
    </div>
  );
}