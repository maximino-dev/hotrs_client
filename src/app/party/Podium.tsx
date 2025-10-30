import React from "react";

type Player = {
  username: string;
  score: number;
};

type PodiumProps = {
  players: Player[];
  partyId: string;
  handleReplay: () => void;
  owner: boolean;
};

export default function Podium({ players, partyId, handleReplay, owner }: PodiumProps) {
  const top3 = [...players]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center mt-10 px-4 w-full">
      {/* Titre */}
      <h2 className="text-3xl font-bold text-center mb-2">🎉 Partie terminée</h2>
      <p className="text-xl font-semibold mb-2 text-blue-600">
        ID de la partie : <span className="font-mono">{partyId}</span>
      </p>

      {/* Podium */}
      <div className="flex justify-center items-end gap-6 mb-6">
        {/* 2e place */}
        {top3[1] && (
          <div className="flex flex-col items-center">
            <div className="bg-gray-300 w-20 h-24 flex items-center justify-center rounded-t shadow-md">
              <span className="text-2xl">🥈</span>
            </div>
            <p className="mt-2 font-medium">{top3[1].username}</p>
            <p className="text-sm text-gray-600">{top3[1].score} pts</p>
          </div>
        )}

        {/* 1ère place */}
        {top3[0] && (
          <div className="flex flex-col items-center">
            <div className="bg-yellow-400 w-24 h-32 flex items-center justify-center rounded-t shadow-lg">
              <span className="text-3xl">🥇</span>
            </div>
            <p className="mt-2 font-semibold">{top3[0].username}</p>
            <p className="text-sm text-gray-600">{top3[0].score} pts</p>
          </div>
        )}

        {/* 3e place */}
        {top3[2] && (
          <div className="flex flex-col items-center">
            <div className="bg-orange-500 w-20 h-20 flex items-center justify-center rounded-t shadow-md">
              <span className="text-2xl">🥉</span>
            </div>
            <p className="mt-2 font-medium">{top3[2].username}</p>
            <p className="text-sm text-gray-600">{top3[2].score} pts</p>
          </div>
        )}
      </div>

      {/* Bouton Rejouer */}
      {owner && (
        <button
          onClick={handleReplay}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Rejouer
        </button>
      )}
    </div>
  );
}