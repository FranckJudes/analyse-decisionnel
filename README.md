# analyse-decisionnel


Objectif :

Objectif : avoir des données propres et structurées

1.1 Module ETL (Event Logs → Données structurées)

Page de chargement/import des logs (CSV ou via API Camunda)
Transformation : normalisation des timestamps, calcul des durées par activité, détection des cas incomplets
Aperçu des données transformées avant validation
1.2 Modèle en étoile — vues front

Exposer clairement 4 dimensions dans l'interface :
Temps (jour, semaine, mois)
Activité (nom de la tâche BPMN)
Acteur (qui a exécuté)
Statut (complété, en retard, erreur)
Table de faits : durée, coût estimé, nb d'erreurs, délai respecté ou non
Phase 2 — Pièce maîtresse : BPMN interactif
C'est le différenciateur de ta soutenance

2.1 Viewer BPMN avec overlay KPIs

Charger le diagramme BPMN du processus sélectionné
Superposer sur chaque nœud :
Couleur selon la performance (vert / orange / rouge)
Badge avec durée moyenne
Épaisseur des flèches selon le volume de passages
Librairie cible : bpmn-js + bpmn-js-token-simulation ou overlay API native de bpmn-js
2.2 Identification visuelle des goulots

Les nœuds les plus lents sont mis en évidence automatiquement
Tooltip au survol : durée min / max / moyenne, taux d'erreur, charge ressource
2.3 Navigation process-aware

Sélecteur de processus + sélecteur de période
Le BPMN se met à jour en temps réel selon les filtres
Phase 3 — Dashboard BI spécialisé
Remplacer le dashboard générique par un vrai tableau de bord de pilotage

3.1 Indicateurs de temps de cycle

Durée moyenne bout-en-bout par processus
Évolution dans le temps (courbe)
Comparaison entre instances
3.2 Conformité aux délais

% d'instances terminées dans le délai cible
Écart entre durée théorique (modèle BPMN) et durée réelle (logs)
Alertes visuelles pour les dépassements
3.3 Qualité par activité

Taux d'erreur / reprise par tâche
Activités les plus chronophages
Charge par acteur (qui est surchargé ?)
3.4 Vue multidimensionnelle

Filtres croisés : Temps × Activité × Acteur × Statut
Drill-down : cliquer sur une barre pour voir le détail
Phase 4 — Module de simulation
Pour la démo en soutenance

4.1 Générateur de logs synthétiques

Charger un modèle BPMN
Paramétrer : nombre d'instances, fourchette de durées, taux d'erreur souhaité, acteurs fictifs
Générer un dataset d'event logs réaliste
4.2 Scénarios de simulation

Scénario nominal : tout se passe bien
Scénario dégradé : goulot sur une activité spécifique
Scénario optimisé : après correction du goulot
Comparer les 3 scénarios côte à côte sur le dashboard
Phase 5 — Cohérence et finition
Lier tout ensemble

5.1 Navigation unifiée

Une page centrale "Analyse d'un processus" qui regroupe :
Le BPMN interactif en haut
Les KPIs en dessous
Les logs filtrés en bas
5.2 Export pour soutenance

Export PDF du dashboard
Export CSV des données analysées
Ordre de priorité recommandé
Priorité	Phase	Pourquoi
🔴 1	BPMN interactif + overlay	C'est ce que le jury va regarder en premier
🔴 2	Dashboard BI spécialisé	C'est la preuve que tu maîtrises la BI
🟠 3	ETL + modèle en étoile visible	Montre la rigueur de l'architecture
🟠 4	Simulation	Indispensable pour la démo
🟡 5	Export et finitions	Bonus de présentation
Ce qu'on ne touche pas
Tout ce qui existe déjà et fonctionne (gestion utilisateurs, groupes, configuration, déploiement BPMN, advanced analytics Python) reste tel quel. On n'y retouche pas.

On commence par quelle phase ?