# Checklist — État du projet M2 Analyse Décisionnel BPMN

> Dernière mise à jour : 2026-04-07

---

## 🔴 Critique — À implémenter avant soutenance

### Dashboard
- [ ] Remplacer les KPIs statiques par des données réelles depuis `/api/analytics/` ou `/api/process-engine/`
- [ ] Graphiques dynamiques (instances actives, taux de complétion, temps moyen d'exécution)

### Kanban — Tâches de processus
- [ ] Bouton "Terminer la tâche" qui appelle `POST /api/process-engine/tasks/{id}/complete`
- [ ] Mise à jour optimiste de la colonne après complétion

### Process Monitor
- [ ] Afficher le BPMN live depuis Camunda (processus déployés réels)
- [ ] Surligner les tâches actives en temps réel via les instances Camunda
- [ ] Remplacer le mode démo par les vraies données

### New Process — Étape 3 (Configuration)
- [ ] Envoyer les habilitations et assignees au backend (actuellement `configurations=[]`)
- [ ] Mapper les formStates (habilitation, planification, ressources) vers `TaskConfigurationDTO`

### Export Power BI
- [x] Endpoint `GET /api/analytics/export/csv?type=logs|fait_execution|dim_processus|dim_temps|dim_utilisateur|dim_tache`
- [x] Endpoint `GET /api/analytics/export/excel` — format `.xlsx` (Apache POI, 5 feuilles)
- [x] Export du modèle en étoile (FaitExecution + dimensions) depuis Camunda HistoryService + UserRepository
- [x] Bouton "Exporter vers Power BI" dans la page Event Log / ETL
- [x] Bouton "Exporter vers Power BI" dans la page Advanced Analytics
- [ ] Documentation du schéma de données pour Power BI (quelles colonnes, quelles mesures)

---

## 🟡 Fonctionnel — Implémenté mais incomplet

### Auth & Sécurité
- [ ] Route guard — rediriger vers `/login` si non authentifié
- [ ] Header — afficher le vrai nom et rôle de l'utilisateur connecté (actuellement "Musharof" hardcodé)
- [ ] Register — vérifier que le formulaire appelle bien le bon endpoint

### Conception / Processus
- [ ] `startInstance` — gérer le cas où le processus n'est pas dans Camunda (message d'erreur clair)

### Process Monitor
- [ ] Flux `Simulation → Process Monitor` via `SimulationContext` — valider de bout en bout

---

## 🟠 Secondaire — Qualité de démo

- [ ] Task List — page actuellement statique
- [ ] History page — données statiques
- [ ] Dashboard — export PDF finalisé (style d'impression)
- [ ] Advanced Analytics — vérifier que tous les endpoints `/api/analytics/**` répondent correctement

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
