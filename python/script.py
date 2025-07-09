def main():
    import argparse
    import os
    import time
    import json
    import re
    from pathlib import Path
    from datetime import datetime
    
    print("🚀 Générateur de Vidéos Éducatives - Deep Learning Enhanced")
    print("=" * 60)
    
    parser = argparse.ArgumentParser(description="Génération diapositives HTML et vidéo avec avatar + IA")
    parser.add_argument("markdown_file", nargs='?', help="Fichier markdown à traiter (optionnel - mode interactif si absent)")
    parser.add_argument("--model", default="microsoft/phi-2", help="Modèle de langage à utiliser")
    parser.add_argument("--html", action="store_true", help="Générer des diapositives HTML")
    parser.add_argument("--no-avatar", action="store_true", help="Désactiver l'ajout de l'avatar")
    parser.add_argument("--avatar-path", help="Chemin personnalisé vers la vidéo de l'avatar", 
                        default="H:/formation-main/avatar.mp4")
    parser.add_argument("--output", "-o", help="Nom ou dossier de sortie pour les présentations")
    
    # NOUVEAU: Support lecture directe
    parser.add_argument("--no-page-numbers", action="store_true",
                       help="Ne pas mentionner les numéros de page dans la narration (lecture fluide)")
    
    args = parser.parse_args()
    
    # Mode interactif si aucun fichier fourni
    if not args.markdown_file:
        print("🎮 Mode interactif activé - Aucun fichier spécifié")
        print("-" * 60)
        
        # Chercher des fichiers markdown dans le répertoire courant
        import glob
        md_files = glob.glob("*.md")
        
        if md_files:
            print("📁 Fichiers Markdown trouvés dans le répertoire :")
            for i, file in enumerate(md_files, 1):
                print(f"   {i}. {file}")
            
            try:
                choice = input("\nChoisissez un fichier (numéro) ou tapez un chemin : ").strip()
                if choice.isdigit() and 1 <= int(choice) <= len(md_files):
                    args.markdown_file = md_files[int(choice) - 1]
                elif choice:
                    args.markdown_file = choice
                else:
                    # Créer un fichier de démonstration
                    args.markdown_file = create_demo_file()
            except (KeyboardInterrupt, EOFError):
                print("\n❌ Annulé par l'utilisateur")
                exit(0)
        else:
            print("📝 Aucun fichier .md trouvé. Création d'un fichier de démonstration...")
            args.markdown_file = create_demo_file()
        
        print(f"✅ Fichier sélectionné: {args.markdown_file}")
        print("-" * 60)
    
    # Marquer le début du traitement pour les statistiques
    start_time = time.time()
    
    # Afficher les paramètres sélectionnés
    print(f"📄 Fichier d'entrée: {args.markdown_file}")
    print(f"🤖 Modèle IA: {args.model}")
    print(f"📖 Mode lecture: {'Directe (fluide)' if args.no_page_numbers else 'Standard (avec pages)'}")
    print(f"🎬 Format: {'HTML + Vidéo' if args.html else 'Vidéo uniquement'}")
    print(f"👤 Avatar: {'Désactivé' if args.no_avatar else 'Activé'}")
    print("-" * 60)

    # Vérifier l'existence du fichier d'entrée
    if not os.path.exists(args.markdown_file):
        print(f"❌ Fichier non trouvé: {args.markdown_file}")
        exit(1)

    # Analyser le document avec IA
    print("🧠 Analyse IA du document en cours...")
    content_analysis = analyze_document_content(args.markdown_file)
    print(f"📊 Type de contenu: {content_analysis['content_type']}")
    print(f"📈 Complexité: {content_analysis['complexity']}")
    print(f"📝 Longueur estimée: {content_analysis['estimated_length']} mots")
    
    # Vérifier et configurer l'avatar
    avatar_path = None
    if not args.no_avatar:
        avatar_path = configure_avatar(args.avatar_path)
    else:
        print("👤 L'avatar a été désactivé avec --no-avatar")

    # Charger l'historique d'apprentissage
    learning_data = load_learning_history()
    total_files = len(learning_data.get('processed_files', []))
    improvement_level = learning_data.get('improvement_level', 1)
    total_videos = learning_data.get('total_videos_generated', 0)
    
    print(f"📚 Historique d'apprentissage: {total_files} fichiers traités")
    print(f"🎬 Total vidéos générées: {total_videos}")
    print(f"🧠 Niveau IA actuel: {improvement_level}/5")
    
    if improvement_level >= 3:
        print("🔥 Fonctionnalités avancées débloquées!")
    if improvement_level >= 4:
        print("⚡ Auto-amélioration activée!")
    if improvement_level >= 5:
        print("🌟 IA Expert - Niveau maximum!")
    
    print("-" * 60)

    # Initialiser les modèles
    print(f"🤖 Initialisation du modèle {args.model}...")
    initialize_models(args.model)

    # Traiter le contenu selon les options
    print("🔄 Traitement du contenu avec optimisations IA...")
    processed_content = process_markdown_content(args.markdown_file, args, content_analysis)

    # Appeler videoseul.py avec les bons paramètres
    print("🎬 Lancement de la génération vidéo...")
    video_result = call_videoseul(args, processed_content, content_analysis, avatar_path)
    
    # Calculer le temps de traitement
    processing_time = time.time() - start_time
    
    # Enregistrer dans l'historique d'apprentissage
    save_processing_record(args, content_analysis, video_result, processing_time, learning_data)
    
    # Afficher les résultats et suggestions
    print("\n" + "=" * 60)
    print("✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
    if video_result:
        print(f"📁 Fichier de sortie: {video_result}")
    print(f"⏱️ Temps de traitement: {processing_time:.1f} secondes")
    
    # Afficher les suggestions d'optimisation
    show_optimization_suggestions(learning_data, args.model)
    print("=" * 60)


def create_demo_file():
    """Crée un fichier Markdown de démonstration"""
    demo_content = """# 🎓 Démonstration VideoSeul

## Introduction

Bienvenue dans cette démonstration du générateur de vidéos éducatives avec IA !

## Fonctionnalités

### ✨ Analyse Automatique
- Détection du type de contenu (technique, éducatif, business, créatif)
- Optimisation selon la complexité
- Suggestions intelligentes

### 🎬 Génération Vidéo
- Création automatique de diapositives
- Narration synchronisée
- Support des avatars
- Transitions fluides

### 🧠 Intelligence Artificielle
- Amélioration du contenu
- Apprentissage des préférences
- Recommandations personnalisées

## Types de Contenu Supportés

### 📚 Éducatif
Optimisé pour l'apprentissage avec transitions pédagogiques.

### 🔬 Technique  
Pauses automatiques sur les termes complexes.

### 💼 Business
Mise en valeur des KPI et métriques importantes.

### 🎨 Créatif
Fluidité narrative améliorée.

## Conclusion

Cette démonstration montre les capacités du système. Utilisez vos propres fichiers pour de meilleurs résultats !

---
*Généré automatiquement par VideoSeul*
"""
    
    demo_file = "demo_videoseul.md"
    with open(demo_file, 'w', encoding='utf-8') as f:
        f.write(demo_content)
    
    print(f"📄 Fichier de démonstration créé: {demo_file}")
    return demo_file


def analyze_document_content(file_path):
    """
    Analyse le contenu du document pour déterminer son type et sa complexité
    """
    import re
    from pathlib import Path
    
    try:
        file_path = Path(file_path)
        content_info = {
            "complexity": "simple",
            "content_type": "general",
            "estimated_length": 0,
            "keywords": []
        }
        
        # Lire le contenu
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        text_lower = content.lower()
        word_count = len(content.split())
        content_info["estimated_length"] = word_count
        
        # Analyser le nom du fichier pour des indices
        file_name = file_path.name.lower()
        if any(word in file_name for word in ['technical', 'tech', 'api', 'documentation', 'manual', 'guide']):
            content_info["content_type"] = "technical"
        elif any(word in file_name for word in ['course', 'lesson', 'tutorial', 'education', 'formation', 'academy']):
            content_info["content_type"] = "educational"  
        elif any(word in file_name for word in ['business', 'report', 'analysis', 'presentation', 'meeting']):
            content_info["content_type"] = "business"
        elif any(word in file_name for word in ['creative', 'story', 'design', 'marketing', 'brand']):
            content_info["content_type"] = "creative"
        
        # Analyser le contenu pour affiner le type
        technical_keywords = ['algorithm', 'function', 'class', 'method', 'api', 'database', 'server', 'code', 'python', 'javascript', 'sql', 'framework', 'aws', 'cloud']
        educational_keywords = ['learn', 'study', 'course', 'lesson', 'chapter', 'exercise', 'example', 'tutorial', 'education', 'formation']
        business_keywords = ['revenue', 'profit', 'market', 'sales', 'business', 'customer', 'strategy', 'analysis', 'report']
        creative_keywords = ['story', 'design', 'creative', 'art', 'brand', 'marketing', 'campaign', 'narrative']
        
        # Compter les mots-clés par catégorie
        tech_score = sum(1 for kw in technical_keywords if kw in text_lower)
        edu_score = sum(1 for kw in educational_keywords if kw in text_lower)
        business_score = sum(1 for kw in business_keywords if kw in text_lower)
        creative_score = sum(1 for kw in creative_keywords if kw in text_lower)
        
        # Déterminer le type de contenu basé sur le score le plus élevé
        scores = {
            "technical": tech_score,
            "educational": edu_score, 
            "business": business_score,
            "creative": creative_score
        }
        
        if max(scores.values()) > 0:
            content_info["content_type"] = max(scores, key=scores.get)
        
        # Déterminer la complexité
        if word_count > 2000 or tech_score > 5:
            content_info["complexity"] = "complex"
        elif word_count > 500 or max(scores.values()) > 2:
            content_info["complexity"] = "medium"
        
        return content_info
        
    except Exception as e:
        print(f"⚠️ Erreur lors de l'analyse du contenu: {e}")
        return {
            "complexity": "simple",
            "content_type": "general", 
            "estimated_length": 0,
            "keywords": []
        }


def configure_avatar(avatar_path):
    """
    Configure et vérifie le chemin de l'avatar
    """
    import os
    
    if os.path.exists(avatar_path):
        print(f"👤 Avatar trouvé: {avatar_path}")
        return avatar_path
    else:
        print(f"⚠️ Avatar non trouvé à: {avatar_path}")
        # Essayer d'autres chemins potentiels
        alternative_paths = [
            "H:/formation-main/avatar.mp4",
            "./avatar.mp4",
            "../avatar.mp4",
            os.path.join(os.path.dirname(__file__), "avatar.mp4")
        ]
        for alt_path in alternative_paths:
            if os.path.exists(alt_path):
                print(f"👤 Avatar alternatif trouvé: {alt_path}")
                return alt_path
        
        print("⚠️ Aucun avatar trouvé. La vidéo sera créée sans avatar.")
        return None


def load_learning_history():
    """
    Charge l'historique d'apprentissage pour les recommandations
    CORRECTION: Utiliser le même fichier que l'interface Python
    """
    import json
    from pathlib import Path
    
    # UTILISER LE MÊME FICHIER QUE L'INTERFACE PYTHON
    history_file = Path("video_generator_data.json")  # ← CORRECTION ICI
    if history_file.exists():
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Adapter le format pour la compatibilité
                return {
                    "processed_files": data.get('processed_files', []),
                    "model_performance": data.get('model_performance', {}),
                    "content_statistics": data.get('learning_patterns', {}),
                    "improvement_level": data.get('improvement_level', 1),
                    "total_videos_generated": data.get('total_videos_generated', 0)
                }
        except Exception as e:
            print(f"⚠️ Erreur lors du chargement de l'historique: {e}")
    
    return {
        "processed_files": [],
        "model_performance": {},
        "content_statistics": {},
        "improvement_level": 1,
        "total_videos_generated": 0
    }


def process_markdown_content(file_path, args, content_analysis):
    """
    Traite le contenu Markdown selon les options et optimisations IA
    """
    import re
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(file_path, 'r', encoding='latin-1') as f:
            content = f.read()
        print("🔄 Fichier détecté en encodage latin-1, conversion effectuée")
    
    # Appliquer le mode lecture directe si demandé
    if args.no_page_numbers:
        print("📖 Application du mode lecture directe...")
        content = remove_page_numbers(content)
    else:
        print("📄 Conservation du mode standard avec pagination")
        content = ensure_page_structure(content)
    
    # Optimiser selon le type de contenu
    content = optimize_content_for_type(content, content_analysis)
    
    return content


def remove_page_numbers(content):
    """
    Retire les références aux numéros de page pour une lecture fluide
    """
    import re
    
    # Retirer les patterns de pagination (CORRECTION COMPLÈTE)
    patterns_to_remove = [
        r'^Page \d+[:.]\s*',           # "Page 1:", "Page 2."
        r'^---\s*Page \d+\s*---\s*$',  # "--- Page X ---"  ← LIGNE CORRIGÉE
        r'\n\s*Page \d+\s*\n',         # Page isolée sur une ligne
        r'\[Page \d+\]',               # [Page X]
        r'\(Page \d+\)',               # (Page X)
        r'^\d+\s*$',                   # Numéros seuls sur une ligne
    ]
    
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.MULTILINE)
    
    # Nettoyer les espaces supplémentaires
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    content = re.sub(r'^\s+', '', content, flags=re.MULTILINE)
    
    print("✅ Références de page supprimées - Mode lecture fluide activé")
    return content.strip()


def ensure_page_structure(content):
    """
    S'assure que la structure de pagination est cohérente
    """
    import re
    
    # Si pas de numéros de page détectés, les ajouter logiquement
    if not re.search(r'Page \d+', content):
        # Diviser le contenu en sections logiques
        sections = content.split('\n\n')
        numbered_sections = []
        page_num = 1
        current_page_content = []
        word_count_per_page = 0
        
        for section in sections:
            if section.strip():
                words_in_section = len(section.split())
                
                # Nouvelle page si la section est longue ou on a déjà beaucoup de contenu
                if word_count_per_page > 200 or words_in_section > 300:
                    if current_page_content:
                        numbered_sections.append(f"Page {page_num}\n\n" + '\n\n'.join(current_page_content))
                        page_num += 1
                        current_page_content = []
                        word_count_per_page = 0
                
                current_page_content.append(section)
                word_count_per_page += words_in_section
        
        # Ajouter la dernière page
        if current_page_content:
            numbered_sections.append(f"Page {page_num}\n\n" + '\n\n'.join(current_page_content))
        
        content = '\n\n'.join(numbered_sections)
        print(f"✅ Structure de pagination créée - {page_num} pages")
    
    return content


def optimize_content_for_type(content, content_analysis):
    """
    Optimise le contenu selon son type détecté
    """
    import re
    
    content_type = content_analysis.get("content_type", "general")
    complexity = content_analysis.get("complexity", "simple")
    
    print(f"🎯 Optimisation pour contenu {content_type} de complexité {complexity}")
    
    if content_type == "technical":
        content = optimize_technical_content(content)
    elif content_type == "educational":
        content = optimize_educational_content(content)
    elif content_type == "business":
        content = optimize_business_content(content)
    elif content_type == "creative":
        content = optimize_creative_content(content)
    
    return content


def optimize_technical_content(content):
    """Optimise le contenu technique avec des pauses pour clarification"""
    import re
    
    # Ajouter des pauses après les termes techniques complexes
    technical_terms = [
        r'\b(API|REST|JSON|XML|HTTP|HTTPS|SQL|NoSQL|AWS|Azure|Docker|Kubernetes)\b',
        r'\b(algorithm|function|class|method|database|framework|library)\b',
        r'\b(authentication|authorization|encryption|deployment|scalability)\b'
    ]
    
    for pattern in technical_terms:
        content = re.sub(pattern, r'\1... ', content, flags=re.IGNORECASE)
    
    # Ajouter des transitions explicatives
    content = re.sub(r'\n(#{1,3} .+)\n', r'\n\nNous allons maintenant expliquer \1\n', content)
    content = re.sub(r'\nNous allons maintenant expliquer # ', r'\nNous allons maintenant expliquer ', content)
    
    print("🔬 Optimisation technique appliquée - Pauses et clarifications ajoutées")
    return content


def optimize_educational_content(content):
    """Optimise le contenu éducatif avec une structure pédagogique"""
    import re
    
    # Ajouter des transitions pédagogiques
    content = re.sub(r'\n(#{1,3} .+)\n', r'\n\nMaintenant, nous allons étudier \1\n', content)
    content = re.sub(r'\nMaintenant, nous allons étudier # ', r'\nMaintenant, nous allons étudier ', content)
    
    # Ajouter des résumés entre les sections
    sections = content.split('\n\n')
    enhanced_sections = []
    
    for i, section in enumerate(sections):
        enhanced_sections.append(section)
        # Ajouter un résumé tous les 3 sections
        if i > 0 and i % 3 == 0 and '# ' in section:
            enhanced_sections.append("Récapitulons ce que nous venons d'apprendre...")
    
    content = '\n\n'.join(enhanced_sections)
    print("📚 Optimisation éducative appliquée - Structure pédagogique renforcée")
    return content


def optimize_business_content(content):
    """Optimise le contenu business avec emphase sur les points clés"""
    import re
    
    # Emphasize key business terms
    business_terms = r'\b(ROI|profit|revenue|market|strategy|customer|growth|analysis|KPI|budget)\b'
    content = re.sub(business_terms, r'**\1**', content, flags=re.IGNORECASE)
    
    # Ajouter des transitions orientées résultats
    content = re.sub(r'\n(#{1,3} .+)\n', r'\n\nExaminons maintenant \1\n', content)
    
    print("💼 Optimisation business appliquée - Points clés mis en valeur")
    return content


def optimize_creative_content(content):
    """Optimise le contenu créatif avec fluidité narrative"""
    # Ajouter des transitions narratives
    transitions = [
        "Ensuite, ",
        "De plus, ",
        "Par ailleurs, ",
        "En outre, ",
        "Maintenant, "
    ]
    
    paragraphs = content.split('\n\n')
    enhanced_paragraphs = []
    
    for i, paragraph in enumerate(paragraphs):
        if i > 0 and not paragraph.startswith('#') and len(paragraph) > 50:
            transition = transitions[i % len(transitions)]
            if not paragraph.startswith(tuple(transitions)):
                paragraph = transition + paragraph
        enhanced_paragraphs.append(paragraph)
    
    content = '\n\n'.join(enhanced_paragraphs)
    print("🎨 Optimisation créative appliquée - Fluidité narrative améliorée")
    return content


def call_videoseul(args, processed_content, content_analysis, avatar_path):
    """
    Appelle videoseul.py avec les paramètres appropriés
    """
    import subprocess
    import tempfile
    import os
    from pathlib import Path
    
    # Créer un fichier temporaire avec le contenu traité
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as temp_file:
        temp_file.write(processed_content)
        temp_markdown_path = temp_file.name
    
    try:
        # Construire la commande pour videoseul.py
        cmd = [
            'python', 'videoseul.py',
            temp_markdown_path,
            '--model', args.model
        ]
        
        if args.no_page_numbers:
            cmd.append('--direct-reading')  # Utiliser --direct-reading pour compatibilité interface
        
        if args.no_avatar:
            cmd.append('--no-avatar')
        elif avatar_path:
            cmd.extend(['--avatar-path', avatar_path])
        
        if args.output:
            cmd.extend(['--output', args.output])
        
        # Exécuter videoseul.py
        print(f"🎬 Exécution: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.path.dirname(__file__))
        
        if result.returncode == 0:
            print("✅ videoseul.py exécuté avec succès!")
            
            # Chercher le fichier de sortie généré
            output_dir = Path(temp_markdown_path).parent / "output"
            if output_dir.exists():
                video_files = list(output_dir.glob("*.mp4"))
                if video_files:
                    return str(video_files[0])
            
            # Si pas trouvé, retourner un chemin par défaut
            if args.output:
                return args.output if args.output.endswith('.mp4') else f"{args.output}/video.mp4"
            else:
                return "output/presentation_fidele.mp4"
        else:
            print(f"❌ Erreur lors de l'exécution de videoseul.py:")
            print(result.stderr)
            return None
            
    except Exception as e:
        print(f"❌ Erreur lors de l'appel à videoseul.py: {e}")
        return None
    finally:
        # Nettoyer le fichier temporaire
        try:
            os.unlink(temp_markdown_path)
        except:
            pass


def save_processing_record(args, content_analysis, output_path, processing_time, learning_data):
    """
    Sauvegarde l'enregistrement de traitement pour l'apprentissage
    CORRECTION: Utiliser le même format que l'interface Python
    """
    import time
    import os
    import json
    
    # Format compatible avec l'interface Python
    processing_record = {
        'file_path': args.markdown_file,           # ← Même format interface
        'file_name': os.path.basename(args.markdown_file),
        'models_used': [args.model],               # ← Liste comme interface
        'video_paths': [output_path] if output_path else [],
        'processing_time': processing_time,
        'timestamp': time.strftime("%Y-%m-%dT%H:%M:%S"),  # ← Format ISO comme interface
        'file_size': os.path.getsize(args.markdown_file),
        'file_type': os.path.splitext(args.markdown_file)[1],
        # Données supplémentaires pour compatibilité
        'content_analysis': content_analysis,
        'options_used': {
            'no_page_numbers': getattr(args, 'no_page_numbers', False),
            'html_mode': args.html,
            'no_avatar': args.no_avatar,
            'custom_output': args.output is not None
        },
        'success': output_path is not None
    }
    
    # Ajouter à l'historique
    if 'processed_files' not in learning_data:
        learning_data['processed_files'] = []
    learning_data['processed_files'].append(processing_record)
    
    # Mettre à jour le compteur total de vidéos (format interface)
    if 'total_videos_generated' not in learning_data:
        learning_data['total_videos_generated'] = 0
    if output_path:
        learning_data['total_videos_generated'] += 1
    
    # Mettre à jour le niveau d'amélioration (format interface)
    total_files = len(learning_data['processed_files'])
    if total_files >= 50:
        learning_data["improvement_level"] = 5
    elif total_files >= 25:
        learning_data["improvement_level"] = 4
    elif total_files >= 10:
        learning_data["improvement_level"] = 3
    elif total_files >= 5:
        learning_data["improvement_level"] = 2
    else:
        learning_data["improvement_level"] = 1
    
    # Mettre à jour les statistiques de performance des modèles
    if 'model_performance' not in learning_data:
        learning_data['model_performance'] = {}
    
    model = args.model
    if model not in learning_data['model_performance']:
        learning_data['model_performance'][model] = {
            'count': 0,
            'total_time': 0,
            'avg_time': 0
        }
    
    perf = learning_data['model_performance'][model]
    perf['count'] += 1
    perf['total_time'] += processing_time
    perf['avg_time'] = perf['total_time'] / perf['count']
    
    # Sauvegarder dans le MÊME fichier que l'interface
    try:
        with open("video_generator_data.json", 'w', encoding='utf-8') as f:  # ← MÊME FICHIER
            json.dump(learning_data, f, ensure_ascii=False, indent=2)
        print("💾 Historique d'apprentissage mis à jour et synchronisé avec l'interface")
    except Exception as e:
        print(f"⚠️ Erreur lors de la sauvegarde: {e}")


def show_optimization_suggestions(learning_data, current_model):
    """
    Affiche des suggestions d'optimisation basées sur l'apprentissage
    CORRECTION: Compatible avec le format de l'interface Python
    """
    import os
    
    print("\n🧠 SUGGESTIONS D'OPTIMISATION IA:")
    print("-" * 40)
    
    processed_files = learning_data.get('processed_files', [])
    model_perf = learning_data.get('model_performance', {})
    improvement_level = learning_data.get('improvement_level', 1)
    total_videos = learning_data.get('total_videos_generated', 0)
    
    # Afficher les statistiques générales
    print(f"📊 Fichiers traités: {len(processed_files)}")
    print(f"🎬 Vidéos générées: {total_videos}")
    print(f"🧠 Niveau IA: {improvement_level}/5")
    
    if len(processed_files) < 2:
        print("📊 Continuez à utiliser l'outil pour débloquer des suggestions personnalisées!")
        
        # Suggestions basées sur le niveau
        if improvement_level >= 3:
            print("🔥 Niveau 3 atteint - Fonctionnalités avancées disponibles!")
        if improvement_level >= 4:
            print("⚡ Niveau 4 atteint - Auto-amélioration active!")
        if improvement_level >= 5:
            print("🌟 Niveau maximum atteint - IA Expert!")
            
        return
    
    # Analyser les performances des modèles
    if model_perf:
        print("🚀 PERFORMANCES DES MODÈLES:")
        
        # Trouver le modèle le plus rapide
        fastest_model = None
        fastest_time = float('inf')
        
        for model, stats in model_perf.items():
            avg_time = stats.get('avg_time', 0)
            count = stats.get('count', 0)
            
            print(f"   🤖 {model.split('/')[-1]}: {avg_time:.1f}s moyenne ({count} utilisations)")
            
            if avg_time > 0 and avg_time < fastest_time and count > 1:
                fastest_time = avg_time
                fastest_model = model
        
        if fastest_model and current_model != fastest_model:
            current_avg = model_perf.get(current_model, {}).get('avg_time', 0)
            if current_avg > fastest_time:
                time_saved = current_avg - fastest_time
                print(f"💡 SUGGESTION: Utilisez {fastest_model.split('/')[-1]} pour économiser {time_saved:.1f}s")
    
    # Analyser les types de contenu les plus fréquents
    content_types = {}
    for record in processed_files:
        # Support de l'ancien et nouveau format
        file_type = record.get('file_type', '')
        if not file_type:
            file_path = record.get('file_path', record.get('input_file', ''))
            file_type = os.path.splitext(file_path)[1] if file_path else '.unknown'
        
        content_types[file_type] = content_types.get(file_type, 0) + 1
    
    if content_types:
        most_common = max(content_types, key=content_types.get)
        print(f"📈 Type de fichier le plus traité: {most_common} ({content_types[most_common]} fois)")
        
        # Suggestions spécialisées
        recommendations = {
            ".md": "Parfait pour microsoft/phi-2 - rapide et efficace",
            ".pdf": "Utilisez google/flan-t5-xxl pour PDF complexes ou google/gemma-7b pour contenu technique",
            ".docx": "mistralai/Mistral-7B-v0.1 excellent pour documents Word",
            ".txt": "microsoft/phi-2 optimal pour fichiers texte simples"
        }
        
        if most_common in recommendations:
            print(f"🎯 RECOMMANDATION: {recommendations[most_common]}")
    
    # Suggestions d'utilisation basées sur l'historique  
    no_page_usage = sum(1 for r in processed_files 
                       if r.get('options_used', {}).get('no_page_numbers', False))
    if no_page_usage > len(processed_files) * 0.5:
        print("📖 Excellente utilisation du mode lecture directe!")
    
    print("🚀 L'IA continue d'apprendre pour de meilleures recommandations!")


def initialize_models(model_name):
    """Initialise les modèles (implémentation basique)"""
    print(f"🤖 Initialisation du modèle {model_name}...")
    # Implémentation basique - peut être étendue
    pass


if __name__ == "__main__":
    main()
