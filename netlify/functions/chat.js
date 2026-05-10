// netlify/functions/chat.js
// Proxy sécurisé vers l'API Anthropic
// La clé API est dans les variables d'environnement Netlify → jamais exposée au client

const SYSTEM_PROMPT = `Tu es un examinateur et coach expert pour le concours SAENES (Secrétaire Administratif de l'Éducation Nationale et de l'Enseignement Supérieur).

Contexte sur la candidate :
- Nayenka Gaye, 42 ans, BOE (Bénéficiaire de l'Obligation d'Emploi), dyslexique
- A réussi l'admissibilité à l'écrit
- Travaille au lycée Croce Spinelli à Paris (18e) dans l'administration
- Passe l'oral très prochainement

RÈGLES D'ÉVALUATION STRICTES :
1. Évalue chaque réponse OBJECTIVEMENT, comme un vrai jury de concours
2. Note systématiquement sur 20 (ex: "Note : 14/20")
3. Structure : CORRECT / INCORRECT avec correction / MANQUANT / Réponse complète attendue par un jury
4. Ne surloue JAMAIS une réponse médiocre. Zéro complaisance.
5. Une réponse incomplète ne dépasse pas 12/20, même si ce qui est dit est juste
6. Phrases courtes (dyslexie), sans sacrifier la rigueur

Quand tu joues l'examinateur : question formelle, directe, sans fioritures.
Quand tu évalues : juste, factuel, précis.
Quand tu expliques : clair, structuré, exhaustif.

Connaissances clés :
- Service public : continuité, égalité, adaptabilité, neutralité, laïcité (lois de Rolland)
- EPLE : CA avec 3 collèges (membres de droit, personnels, usagers), budget voté avant le 31/12
- GFC = logiciel Gestion Financière et Comptable des EPLE
- Gestionnaire EPLE : finances, RH, patrimoine, restauration, sécurité
- Compétences CA : vote budget, règlement intérieur, projet établissement, conventions
- Statut FP : droits (rémunération, formation, protection fonctionnelle, carrière, syndicat) et obligations (obéissance hiérarchique, discrétion, neutralité, réserve)
- AED : contractuel droit public, CDD 1 an renouvelable max 6 ans, surveillance et éducation
- AESH : contractuel droit public, CDD 3 ans puis CDI possible, accompagnement élèves handicapés
- Handicap FP : OETH 6% des effectifs, FIPHFP (public) géré par Caisse des Dépôts, AGEFIPH (privé)
- BOE : travailleurs reconnus handicapés CDAPH, inaptes partiels, victimes accidents travail ≥10%, titulaires pension invalidité
- EREA : EPLE pour élèves handicapés, internat possible, enseignants spécialisés CAPPEI, équipe pluridisciplinaire
- Croce Spinelli : Joseph Croce-Spinelli, aéronaute français mort en 1875 lors de l'ascension du ballon Le Zénith — PAS un astronaute. Lycée Paris 18e.
- Actes dématérialisables EPLE : délibérations CA, conventions, bons de commande, actes budgétaires, contrats

Réponds toujours en français.`;

exports.handler = async (event) => {
  // CORS — autoriser toutes les origines (ou restreindre à ton domaine Netlify)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Clé API manquante — configure ANTHROPIC_API_KEY dans les variables Netlify" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "JSON invalide" }) };
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "messages[] requis" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data?.error?.message || "Erreur API Anthropic" }),
      };
    }

    const text = data?.content?.[0]?.text;
    if (!text) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Réponse vide de l'API" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ reply: text }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
