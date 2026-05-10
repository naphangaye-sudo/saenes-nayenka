# Coach SAENES — Nayenka Gaye
Application de préparation à l'oral SAENES avec IA en direct.

## Structure
```
saenes-netlify/
├── netlify/
│   └── functions/
│       └── chat.js          ← Proxy API Anthropic sécurisé
├── public/
│   └── index.html           ← L'application complète
├── netlify.toml             ← Configuration Netlify
└── README.md
```

## Déploiement sur Netlify (5 minutes)

### Étape 1 — Mettre les fichiers sur GitHub
1. Va sur github.com → New repository → nom : `saenes-nayenka`
2. Upload tous les fichiers de ce dossier (garder la structure)

### Étape 2 — Connecter à Netlify
1. Va sur app.netlify.com
2. "Add new site" → "Import an existing project"
3. Choisir GitHub → sélectionner `saenes-nayenka`
4. Build settings :
   - Build command : (laisser vide)
   - Publish directory : `public`
5. Cliquer "Deploy site"

### Étape 3 — Ajouter la clé API Anthropic (CRUCIAL)
1. Dans Netlify → ton site → **Site configuration** → **Environment variables**
2. Cliquer "Add a variable"
3. Key : `ANTHROPIC_API_KEY`
4. Value : ta clé API Anthropic (commence par `sk-ant-...`)
   → Récupère-la sur console.anthropic.com → API Keys
5. Cliquer "Save"
6. Aller dans **Deploys** → "Trigger deploy" → "Deploy site"

### Étape 4 — Tester
L'app est accessible à l'URL Netlify fournie (ex: `random-name.netlify.app`)
Tu peux la mettre en favori sur iPhone comme une PWA.

## Fonctionnalités
- Bot IA en direct (Claude Sonnet) — évaluation objective /20
- 16 questions d'examinateur intégrées
- Mode entraînement : l'IA joue l'examinateur, corrige la réponse
- Voix masculine française (TTS)
- 100% mobile-friendly
- Clé API sécurisée côté serveur (jamais exposée)

## Coût
Environ 0.01$ par conversation — négligeable avec un compte Anthropic standard.
