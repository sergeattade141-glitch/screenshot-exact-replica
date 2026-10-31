# WIL WOL AI

Assistant conversationnel personnel (texte et voix, en ligne ou local).

## État : phase 1 (interface)
- Fonctionne : accueil, suggestions, conversations (créer, renommer, supprimer, copier, réessayer, arrêter), historique stocké dans le navigateur, thème clair/sombre/système, mode en ligne/local, dictée via le navigateur (en ligne), lecture vocale avec choix de voix, vitesse et volume, effacement des données locales, pages confidentialité/conditions.
- Pas encore : comptes (phase 2), moteur en ligne (phase 3), moteur local sans Ollama (phase 4), voix hors ligne (phase 5). Aucune réponse n'est simulée : un message explique l'absence de moteur.

## Développement
```
bun install
bun run dev
bunx vitest run
```

## Limites connues
- La dictée du navigateur (Chrome/Edge) envoie l'audio à un service en ligne.
- Le moteur local nécessitera un modèle léger adapté à 8 Go de RAM, téléchargé uniquement avec votre accord.
