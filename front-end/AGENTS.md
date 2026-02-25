# CLAUDE.md – Instructions pour Claude / LLM

## Règles principales

1. Toujours TypeScript (sauf demande explicite contraire)
2. Composants fonctionnels + hooks uniquement
3. UI → +Tailwind
4. Noms fichiers/dossiers → kebab-case  
   `user-profile-card.tsx` / `settings-page.tsx`
5. Barrel exports uniquement dans : /lib, /hooks, /utils, /types
6. Named exports pour tous les composants (pas de default)
7. Ordre imports strict :
   1. react / react-*
   2. third-party (tanstack, react-virtual, etc.)
   3. @/components / @/lib / @/hooks / @/utils
   4. types / styles
   5. relative (./ ../)
8. Props → toujours interface (jamais type)
9. Combiner classes Tailwind → cn()
10. Icônes → lucide-react
11. Evite de faire du build a chaque fois que tu genere le code
## Stack principal

- Routing     → TanStack Router
- Data        → TanStack Query (React Query)
- Virtualisation → react-virtual (ou @tanstack/react-virtual)

## Commandes utiles

npm run dev  
npm run build  
npm run lint  
npm run format  
npm run typecheck