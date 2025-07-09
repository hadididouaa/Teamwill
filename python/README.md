# Générateur de Vidéos Éducatives - Deep Learning Enhanced

## 🎯 Vue d'ensemble

Ce système intègre une interface PyQt5 sophistiquée avec un moteur de génération vidéo IA pour créer automatiquement des présentations vidéo à partir de documents Markdown.

## 📁 Structure des fichiers

- **`script.py`** - Interface graphique PyQt5 avec système de Deep Learning
- **`videoseul.py`** - Moteur de génération vidéo (modifié pour compatibilité)
- **`test_integration.py`** - Tests d'intégration
- **`video_generator_data.json`** - Base de données d'apprentissage (générée automatiquement)

## 🚀 Installation et Prérequis

### Dépendances requises
```bash
pip install PyQt5 moviepy pyttsx3 numpy pandas matplotlib scikit-learn pathlib
```

### Dépendances optionnelles (pour fonctionnalités avancées)
```bash
pip install pdfplumber PyMuPDF pytesseract nltk ollama drawbot-skia
```

### Configuration ImageMagick
Installez ImageMagick et vérifiez le chemin dans `videoseul.py`:
```python
change_settings({
    "IMAGEMAGICK_BINARY": r"C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe"
})
```

## 💡 Utilisation

### Interface Graphique (Recommandé)
```bash
python script.py
```

#### Fonctionnalités de l'interface:
- **🧠 IA Deep Learning**: Apprentissage automatique et recommandations
- **🔗 Mode Fusion**: Combine plusieurs modèles en une vidéo optimisée
- **📊 Analyse de contenu**: Classification automatique (technique, éducatif, business, créatif)
- **📈 Historique**: Suivi des performances et amélioration continue
- **🎯 Recommandations**: Sélection automatique des meilleurs modèles

### Ligne de commande (Advanced)
```bash
python videoseul.py document.md --model microsoft/phi-2 --output ma_video.mp4
```

## 🤖 Modèles IA Disponibles

### Modèles Spécialisés
- **`microsoft/phi-2`** - ⚡ Rapide et efficace (général/business)
- **`mistralai/Mistral-7B-v0.1`** - 🧠 Excellent pour contenu éducatif
- **`meta-llama/Llama-2-7b-hf`** - 🎨 Spécialisé créatif et narratif
- **`google/gemma-7b`** - 🔬 Précis pour contenu technique
- **`google/flan-t5-xxl`** - 📋 Optimal pour tâches structurées
- **`microsoft/phi-1_5`** - 🚀 Ultra-rapide pour tests
- **`bigscience/bloom-7b1`** - 🌍 Polyvalent multilingue

## 🔧 Modes de Fonctionnement

### Mode Fusion (Recommandé)
- Combine intelligemment plusieurs modèles
- 1 vidéo optimisée en sortie
- Plus rapide et efficace
- L'IA sélectionne le modèle optimal automatiquement

### Mode Séparé
- Génère une vidéo par modèle sélectionné
- Permet de comparer les résultats
- Idéal pour l'évaluation et les tests

## 📚 Système d'Apprentissage IA

### Niveaux d'amélioration
- **Niveau 1** (0-4 fichiers) - Apprentissage de base
- **Niveau 2** (5-9 fichiers) - Recommandations simples
- **Niveau 3** (10-24 fichiers) - Fonctionnalités avancées
- **Niveau 4** (25-49 fichiers) - Auto-amélioration
- **Niveau 5** (50+ fichiers) - IA Expert

### Données d'apprentissage
L'IA apprend automatiquement:
- Types de contenu préférés
- Performances des modèles
- Temps de traitement optimaux
- Patterns d'utilisation

## 🎬 Formats de sortie

### Arguments de personnalisation
- `--output filename.mp4` - Nom de fichier personnalisé
- `--html` - Génération HTML + vidéo
- `--no-page-numbers` - Mode lecture fluide
- `--no-avatar` - Désactiver l'avatar
- `--enhance-ai` - Amélioration IA du contenu

### Qualité vidéo
- Résolution: 960x540 (optimisé pour la performance)
- Format: MP4 (H.264 + AAC)
- FPS: 24 (standard professionnel)

## 🔍 Analyse Automatique de Contenu

### Types détectés
- **Technique** 🔬 - API, code, documentation
- **Éducatif** 📚 - Cours, tutoriels, formations
- **Business** 💼 - Rapports, analyses, stratégies
- **Créatif** 🎨 - Marketing, design, narratif

### Niveaux de complexité
- **Simple** - Contenu court et direct
- **Moyen** - Contenu structuré standard
- **Complexe** - Documents longs et techniques

## 🐛 Dépannage

### Problèmes courants

1. **Erreur MoviePy/FFmpeg**
   ```
   Vérifiez l'installation d'ImageMagick et le chemin dans videoseul.py
   ```

2. **Erreur de synthèse vocale**
   ```
   Vérifiez que pyttsx3 est installé et fonctionnel
   ```

3. **Erreur d'encodage UTF-8**
   ```
   Le script gère automatiquement l'encodage UTF-8
   ```

### Tests
```bash
python test_integration.py
```

## 📊 Statistiques et Historique

### Données sauvegardées
- Fichiers traités avec détails
- Performances par modèle et type de contenu
- Temps de traitement moyens
- Préférences d'utilisation

### Localisation
- Base de données: `video_generator_data.json`
- Logs: `videoseul.log`
- Vidéos: Répertoire courant ou personnalisé

## 🚧 Développement

### Architecture
- **Interface**: PyQt5 avec signaux/slots
- **Backend**: MoviePy + Text-to-Speech
- **IA**: Système de recommandations et apprentissage
- **Données**: JSON + analyse en temps réel

### Extension
Le système est conçu pour être facilement extensible:
- Nouveaux modèles IA
- Formats de sortie additionnels
- Algorithmes d'apprentissage améliorés

## 📄 Licence

Projet éducatif - Utilisation libre pour l'apprentissage et le développement.

---

**Dernière mise à jour**: Version compatible interface PyQt5 + videoseul.py intégré
**Support**: Tous les formats Markdown standards avec génération automatique
