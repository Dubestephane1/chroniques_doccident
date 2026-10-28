# Méthodologie de Calcul OSINT - Chroniques d'Occident

## 1. Philosophie
L'OSINT (Open Source Intelligence) n'est pas une recherche Google, c'est un métier (tradecraft). L'objectif est de transformer des données publiques non structurées en renseignement actionnable.

## 2. Le Cycle de Collecte (Inputs)
Nous utilisons 5 vecteurs principaux :
- **GEOINT (Imagerie) :** Satellites commerciaux pour monitorer les mouvements de troupes et infrastructures.
- **SIGINT-Lite (Tracking) :** ADSB (avions) et AIS (navires) pour détecter les déploiements inhabituels.
- **SOCMINT (Réseaux) :** Analyse des footprints numériques pour identifier les unités et positions.
- **DOCINT (Documents) :** Lois budgétaires, livres blancs, doctrines militaires et appels d'offres.
- **DARK-INT (Web profond) :** Forums spécialisés et canaux de fuites pour les vulnérabilités cyber.

## 3. Processus de Calcul (Analyse)

### A. Analyse par Indicateurs (Checklist)
Définition d'indicateurs de changement (Indicators of Change).
*Exemple Suwalki :*
- Flux ferroviaires accrus vers Kaliningrad [Rouge/Vert]
- Déploiement S-400 [Rouge/Vert]
- Exercices conjoints Bélarus-Russie [Rouge/Vert]
*Règle :* Si > 60% des indicateurs sont "Rouge", le niveau de risque monte d'un palier.

### B. Pondération (Weighted Scoring)
Tous les signaux n'ont pas la même valeur.
- **Poids Fort (0.5) :** Changement de doctrine officielle, mouvements de troupes massifs.
- **Poids Moyen (0.3) :** Déclarations de hauts responsables, pics de cyber-attaques.
- **Poids Faible (0.1) :** Rhétorique médiatique, tweets de comptes officiels.

**Formule théorique :**
$\text{Score de Risque} = \sum (\text{Valeur du Signal} \times \text{Poids})$

## 4. La Triangulation (Validation)
Pour éviter la désinformation, aucune donnée n'est validée seule. Un signal est considéré comme "Hautement Confident" seulement s'il est confirmé par 3 vecteurs indépendants :
1. **Preuve Physique** (ex: Image satellite)
2. **Preuve Politique** (ex: Décret officiel)
3. **Preuve Systémique** (ex: Anomalie logistique/énergétique)

Si les 3 convergent $\rightarrow$ **Confiance Haute** $\rightarrow$ Mise à jour du Baromètre.
