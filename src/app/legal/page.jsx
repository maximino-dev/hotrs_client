"use client";

import React from "react";

import '@/app/ui/global.css';
import '@/app/ui/Home.css';
export default function Legal() {
  return (
    <div className="App min-h-screen px-4 py-8 bg-gray-50 text-gray-800">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">Mentions Légales</h1>

        {/* Mentions légales */}
        <section>
          <p>Éditeur du site : Maximino Bogado – Hotrs.fr</p>
          <p>Email : maximino.bogadogarcia@gmail.com</p>
          <p>
            Hébergeur : OVH, 2 rue Kellermann, 59100 Roubaix, France – 09 72 10 10 07
          </p>
        </section>

        {/* Politique de confidentialité / RGPD */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Politique de confidentialité</h2>
          <p>
            Les données collectées via le formulaire de contribution sont utilisées uniquement pour
            proposer de nouvelles musiques sur Hotrs.fr. Elles ne seront jamais revendues. 
          </p>
          <p>
            Conformément au RGPD, vous pouvez demander l’accès, la modification ou la suppression
            de vos données en contactant maximino.bogadogarcia@gmail.com.
          </p>
        </section>

        {/* Copyright */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Propriété intellectuelle</h2>
          <p>
            Tous les contenus présents sur ce site sont protégés par le droit d’auteur. Toute
            reproduction, distribution ou modification sans autorisation est interdite.
          </p>
        </section>
      </div>
    </div>
  );
}