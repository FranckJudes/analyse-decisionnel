# Checklist — État du projet M2 Analyse Décisionnel BPMN

> Dernière mise à jour : 2026-04-07

---

## 🔴 Critique — À implémenter avant soutenance

### Dashboard
- [x] KPIs dynamiques depuis `/api/process-engine/my-process-instances` et `my-deployed-processes`
- [x] Graphiques dynamiques (sparklines et barres avec vraies données historiques)

### Kanban — Tâches de processus
- [x] Bouton "Terminer la tâche" → `POST /api/process-engine/tasks/{id}/complete`
- [x] Mise à jour optimiste de la colonne après complétion (toast + déplacement vers "Terminé")

### Process Monitor
- [x] Auto-démarrage en mode live (essaie le backend, fallback démo si indispo)
- [x] Affiche le BPMN réel depuis Camunda + overlay KPIs sur les activités
- [x] Surligner les tâches **actives en cours** en temps réel (polling instances)

### New Process — Étape 3 (Configuration)
- [x] Envoyer les habilitations et assignees au backend (actuellement `configurations=[]`)
- [x] Mapper les formStates (habilitation, planification, ressources) vers `TaskConfigurationDTO`

### Export Power BI
- [x] Endpoint `GET /api/analytics/export/csv?type=logs|fait_execution|dim_processus|dim_temps|dim_utilisateur|dim_tache`
- [x] Endpoint `GET /api/analytics/export/excel` — format `.xlsx` (Apache POI, 5 feuilles)
- [x] Export du modèle en étoile (FaitExecution + dimensions) depuis Camunda HistoryService + UserRepository
- [x] Bouton "Exporter vers Power BI" dans la page Event Log / ETL
- [x] Bouton "Exporter vers Power BI" dans la page Advanced Analytics
- [x] Documentation du schéma de données pour Power BI (tableau colonnes/mesures documenté en bas de ce fichier)

---

## 🟡 Fonctionnel — Implémenté mais incomplet

### Auth & Sécurité
- [x] Route guard — redirige vers `/login` si non authentifié (AuthProvider dans App.jsx, guard dans rootRoute)
- [x] Header — vrai nom/rôle depuis `useAuth()` (email → prénom capitalisé + rôle)
- [x] Register — formulaire appelle `POST /api/auth/register` avec firstName, lastName, email, password

### Conception / Processus
- [x] `startInstance` — message d'erreur clair si processus introuvable dans Camunda (toast avec hint "redéployer")

### Process Monitor
- [x] Flux `Simulation → Process Monitor` via `SimulationContext` — détection automatique `sharedLogs`, bascule mode `import`

---

## 🟠 Secondaire — Qualité de démo

- [x] Task List — table réelle depuis Camunda, bouton "Terminer", filtres, recherche
- [x] Workflows page — processus déployés réels, instances réelles, `useAuth()` au lieu de sessionStorage
- [x] Dashboard — alertes + goulots depuis `/api/analytics/logs` (fallback static si vide)
- [x] Dashboard — graphiques tendances avec vraies données historiques
- [x] Advanced Analytics — analytics réimplémentés nativement en Java (suppression service Python externe)

---

## ✅ Terminé

- [x] Auth HTTP-only cookie (login, logout, verify-token)
- [x] Page Utilisateurs CRUD complet (create, edit, delete, reset password)
- [x] Page Conception — liste processus déployés depuis Camunda + bouton Lancer + bouton Supprimer
- [x] Nouveau processus — wizard 3 étapes, sauvegarde et déploiement Camunda
- [x] CORS désactivé pour le développement
- [x] Kanban — chargement des vraies tâches depuis Camunda
- [x] SimulationContext — partage de logs entre Simulation → ETL → Process Monitor
- [x] Diagrammes UML PlantUML (use cases, classes, architecture, 5 séquences)
- [x] Dashboard BI rewrite avec KPIs orientés processus
- [x] EventLog page — import CSV / JSON, modèle en étoile
- [x] Simulation page — génération de logs synthétiques
- [x] Migration stack React 19 + TanStack Router + Tailwind

---

## 📊 Export Power BI — Détail technique

### Données à exporter

| Table | Colonnes clés | Endpoint cible |
|-------|--------------|----------------|
| `fait_execution` | case_id, task_id, duration_ms, status, timestamp | `/api/analytics/export/csv?type=fait` |
| `dim_processus` | process_key, process_name, version | `/api/analytics/export/csv?type=dim_process` |
| `dim_temps` | date, heure, jour_semaine, mois | `/api/analytics/export/csv?type=dim_temps` |
| `dim_utilisateur` | user_id, email, role | `/api/analytics/export/csv?type=dim_user` |
| `dim_tache` | task_id, task_name, process_key | `/api/analytics/export/csv?type=dim_tache` |

### Format recommandé pour Power BI
- CSV UTF-8 avec séparateur `;`
- Ou Excel `.xlsx` via Apache POI (Spring Boot)
- Ou API OData (avancé)
