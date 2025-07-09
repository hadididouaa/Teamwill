#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de test d'intégration pour vérifier la compatibilité entre script.py et videoseul.py
"""

import sys
import os
import subprocess
import tempfile
from pathlib import Path

def create_test_markdown():
    """Crée un fichier Markdown de test"""
    test_content = """# Test de Génération Vidéo

## Introduction

Ceci est un test pour vérifier que l'intégration entre l'interface PyQt5 et videoseul.py fonctionne correctement.

## Section 1: Fonctionnalités

- Génération automatique de vidéos
- Support multi-modèles IA
- Mode fusion intelligent
- Apprentissage continu

## Section 2: Technologies

Ce projet utilise:
- Python 3.x
- PyQt5 pour l'interface
- MoviePy pour la génération vidéo
- Text-to-Speech pour la narration

## Conclusion

Merci d'avoir testé notre système de génération de vidéos éducatives avec IA Deep Learning.
"""
    
    # Créer un fichier temporaire
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(test_content)
        return f.name

def test_videoseul_compatibility():
    """Teste la compatibilité avec videoseul.py"""
    print("🧪 Test de compatibilité videoseul.py")
    print("=" * 50)
    
    # Créer un fichier Markdown de test
    test_file = create_test_markdown()
    print(f"📄 Fichier de test créé: {test_file}")
    
    try:
        # Tester les différents arguments que l'interface envoie
        test_commands = [
            # Test basique
            [sys.executable, "videoseul.py", test_file, "--model", "microsoft/phi-2"],
            
            # Test avec HTML (comme dans l'interface)
            [sys.executable, "videoseul.py", test_file, "--model", "microsoft/phi-2", "--html"],
            
            # Test avec sortie personnalisée
            [sys.executable, "videoseul.py", test_file, "--model", "microsoft/phi-2", "--output", "test_output.mp4"],
            
            # Test mode lecture directe
            [sys.executable, "videoseul.py", test_file, "--model", "microsoft/phi-2", "--no-page-numbers"],
        ]
        
        for i, cmd in enumerate(test_commands, 1):
            print(f"\n🔄 Test {i}/{len(test_commands)}: {' '.join(cmd[2:])}")
            
            try:
                # Exécuter la commande
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    timeout=300  # 5 minutes max
                )
                
                if result.returncode == 0:
                    print(f"✅ Test {i} réussi")
                    # Vérifier si un fichier vidéo a été créé
                    if "test_output.mp4" in ' '.join(cmd) and Path("test_output.mp4").exists():
                        print(f"📹 Fichier vidéo créé: {Path('test_output.mp4').stat().st_size / 1024:.1f} KB")
                else:
                    print(f"❌ Test {i} échoué - Code de retour: {result.returncode}")
                    print(f"Erreur: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print(f"⏰ Test {i} timeout (> 5 min)")
            except Exception as e:
                print(f"💥 Test {i} erreur: {e}")
                
    finally:
        # Nettoyer
        try:
            os.unlink(test_file)
            print(f"🧹 Fichier de test supprimé")
        except:
            pass
        
        # Nettoyer les fichiers de sortie
        for cleanup_file in ["test_output.mp4", "presentation_fidele.mp4"]:
            try:
                if Path(cleanup_file).exists():
                    os.unlink(cleanup_file)
                    print(f"🧹 Fichier {cleanup_file} supprimé")
            except:
                pass

def test_argument_parsing():
    """Teste l'analyse des arguments"""
    print("\n🔍 Test d'analyse des arguments")
    print("-" * 30)
    
    # Importer videoseul pour tester
    try:
        import videoseul
        
        # Tester parse_arguments avec des arguments simulés
        test_args = [
            ["test.md", "--model", "microsoft/phi-2", "--html", "--output", "test.mp4"],
            ["test.md", "--model", "mistralai/Mistral-7B-v0.1", "--no-page-numbers"],
            ["test.md", "--model", "google/gemma-7b", "--no-avatar"]
        ]
        
        for args in test_args:
            print(f"📝 Test args: {' '.join(args)}")
            
            # Simuler sys.argv
            old_argv = sys.argv
            sys.argv = ["videoseul.py"] + args
            
            try:
                parsed_args = videoseul.parse_arguments()
                print(f"✅ Arguments parsés correctement")
                print(f"   - Fichier: {parsed_args.markdown_file}")
                print(f"   - Modèle: {parsed_args.model}")
                print(f"   - HTML: {parsed_args.html}")
                print(f"   - Sortie: {parsed_args.output}")
            except Exception as e:
                print(f"❌ Erreur parsing: {e}")
            finally:
                sys.argv = old_argv
                
    except ImportError:
        print("❌ Impossible d'importer videoseul.py")

def test_path_setup():
    """Teste la configuration des chemins"""
    print("\n🗂️ Test de configuration des chemins")
    print("-" * 30)
    
    try:
        import videoseul
        
        # Tester différentes configurations
        test_cases = [
            ("test.md", "output", None),
            ("test.md", "output", "custom_video.mp4"),
            ("test.md", "output", "/absolute/path/video.mp4"),
        ]
        
        for markdown_file, output_dir, output_filename in test_cases:
            print(f"📁 Test: fichier={markdown_file}, dir={output_dir}, output={output_filename}")
            
            try:
                result = videoseul.setup_paths(markdown_file, output_dir, output_filename)
                input_md, base_dir, output_dir_path, animation_dir, logo_path, output_video_path = result
                
                print(f"✅ Chemins configurés:")
                print(f"   - Input: {input_md}")
                print(f"   - Output dir: {output_dir_path}")
                print(f"   - Video path: {output_video_path}")
                
            except Exception as e:
                print(f"❌ Erreur configuration: {e}")
                
    except ImportError:
        print("❌ Impossible d'importer videoseul.py")

def main():
    """Fonction principale de test"""
    print("🚀 Test d'Intégration - Interface PyQt5 ↔ videoseul.py")
    print("=" * 60)
    
    # Vérifier que videoseul.py existe
    if not Path("videoseul.py").exists():
        print("❌ videoseul.py non trouvé dans le répertoire courant")
        return False
    
    # Tests
    test_argument_parsing()
    test_path_setup()
    
    # Test complet (commenté par défaut car prend du temps)
    response = input("\n❓ Voulez-vous exécuter le test complet de génération vidéo? (y/N): ")
    if response.lower() in ['y', 'yes', 'oui']:
        test_videoseul_compatibility()
    else:
        print("⏭️ Test de génération vidéo ignoré")
    
    print("\n✅ Tests d'intégration terminés")
    return True

if __name__ == "__main__":
    main()
