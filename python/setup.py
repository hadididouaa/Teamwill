#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de démarrage rapide pour le Générateur de Vidéos Éducatives
Compatible avec l'interface PyQt5 et videoseul.py
"""

import sys
import os
import subprocess
from pathlib import Path

def check_dependencies():
    """Vérifie les dépendances principales"""
    print("🔧 Vérification des dépendances...")
    
    required_packages = {
        'PyQt5': 'Interface graphique',
        'moviepy': 'Génération vidéo',
        'pyttsx3': 'Synthèse vocale',
        'numpy': 'Calculs numériques',
        'pandas': 'Analyse de données',
        'matplotlib': 'Graphiques',
        'sklearn': 'Machine Learning'
    }
    
    optional_packages = {
        'pdfplumber': 'Traitement PDF',
        'pytesseract': 'OCR',
        'ollama': 'IA avancée',
        'nltk': 'Traitement de texte'
    }
    
    missing_required = []
    missing_optional = []
    
    # Vérifier les dépendances requises
    for package, description in required_packages.items():
        try:
            __import__(package)
            print(f"✅ {package:<12} - {description}")
        except ImportError:
            missing_required.append(package)
            print(f"❌ {package:<12} - {description} (MANQUANT)")
    
    # Vérifier les dépendances optionnelles
    for package, description in optional_packages.items():
        try:
            __import__(package)
            print(f"🔵 {package:<12} - {description}")
        except ImportError:
            missing_optional.append(package)
            print(f"⚪ {package:<12} - {description} (optionnel)")
    
    return missing_required, missing_optional

def check_files():
    """Vérifie la présence des fichiers nécessaires"""
    print("\n📁 Vérification des fichiers...")
    
    required_files = {
        'script.py': 'Interface PyQt5 principale',
        'videoseul.py': 'Moteur de génération vidéo'
    }
    
    optional_files = {
        'test_integration.py': 'Tests d\'intégration',
        'README.md': 'Documentation',
        'eca1.md': 'Fichier de test exemple'
    }
    
    missing_files = []
    
    for filename, description in required_files.items():
        if Path(filename).exists():
            print(f"✅ {filename:<20} - {description}")
        else:
            missing_files.append(filename)
            print(f"❌ {filename:<20} - {description} (MANQUANT)")
    
    for filename, description in optional_files.items():
        if Path(filename).exists():
            print(f"🔵 {filename:<20} - {description}")
        else:
            print(f"⚪ {filename:<20} - {description} (optionnel)")
    
    return missing_files

def create_sample_markdown():
    """Crée un fichier Markdown d'exemple"""
    sample_content = """# Guide Rapide - Générateur de Vidéos IA

## Introduction

Bienvenue dans le système de génération de vidéos éducatives avec IA Deep Learning.

## Fonctionnalités Principales

### Mode IA Intelligent
- Analyse automatique du contenu
- Recommandations de modèles optimisés  
- Apprentissage continu des préférences

### Mode Fusion
- Combine plusieurs modèles IA
- Génère une vidéo optimisée unique
- Plus rapide et efficace

### Personnalisation
- Choix du modèle IA
- Options de format et qualité
- Mode lecture fluide disponible

## Types de Contenu Supportés

### Documents Techniques
Parfait pour documentations API, guides techniques, et manuels.

### Contenu Éducatif  
Idéal pour cours, tutoriels, et formations.

### Présentations Business
Excellent pour rapports, analyses, et présentations.

### Contenu Créatif
Adapté pour marketing, storytelling, et contenu narratif.

## Conclusion

Ce système s'améliore automatiquement avec chaque utilisation grâce à l'IA Deep Learning intégrée.

Merci d'utiliser notre générateur de vidéos éducatives !
"""
    
    with open("exemple_guide.md", "w", encoding="utf-8") as f:
        f.write(sample_content)
    
    print("📝 Fichier d'exemple créé: exemple_guide.md")

def install_missing_packages(missing_packages):
    """Propose d'installer les packages manquants"""
    if not missing_packages:
        return True
    
    print(f"\n💾 Packages manquants: {', '.join(missing_packages)}")
    response = input("❓ Voulez-vous les installer automatiquement? (y/N): ")
    
    if response.lower() in ['y', 'yes', 'oui']:
        print("⬇️ Installation en cours...")
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install"
            ] + missing_packages)
            print("✅ Installation terminée")
            return True
        except subprocess.CalledProcessError:
            print("❌ Erreur lors de l'installation")
            return False
    else:
        print("⏭️ Installation ignorée")
        return False

def main():
    """Fonction principale"""
    print("🚀 Générateur de Vidéos Éducatives - Configuration Rapide")
    print("=" * 60)
    
    # Vérifier les dépendances
    missing_required, missing_optional = check_dependencies()
    
    # Vérifier les fichiers
    missing_files = check_files()
    
    # Créer un exemple si nécessaire
    if not Path("exemple_guide.md").exists():
        create_sample_markdown()
    
    print("\n" + "=" * 60)
    
    # Résumé
    if missing_required:
        print("❌ CONFIGURATION INCOMPLÈTE")
        print(f"   Packages requis manquants: {', '.join(missing_required)}")
        install_missing_packages(missing_required)
    elif missing_files:
        print("❌ FICHIERS MANQUANTS")
        print(f"   Fichiers requis: {', '.join(missing_files)}")
    else:
        print("✅ CONFIGURATION COMPLÈTE")
        print("🎉 Tous les composants requis sont présents")
        
        if missing_optional:
            print(f"💡 Packages optionnels disponibles: {', '.join(missing_optional)}")
    
    print("\n🚀 Options de lancement:")
    print("   1. Interface graphique: python script.py")
    print("   2. Ligne de commande: python videoseul.py exemple_guide.md")
    print("   3. Tests: python test_integration.py")
    
    # Proposer de lancer l'interface
    if not missing_required and not missing_files:
        response = input("\n❓ Voulez-vous lancer l'interface graphique maintenant? (y/N): ")
        if response.lower() in ['y', 'yes', 'oui']:
            print("🚀 Lancement de l'interface...")
            try:
                subprocess.Popen([sys.executable, "script.py"])
                print("✅ Interface lancée en arrière-plan")
            except Exception as e:
                print(f"❌ Erreur de lancement: {e}")

if __name__ == "__main__":
    main()
