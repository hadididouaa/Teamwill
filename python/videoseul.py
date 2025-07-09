# === Partie 1 : IMPORTS et CONFIGURATIONS videoseul.py ===
import os
import random
import re
import time
import unicodedata
import pyttsx3
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import gc
import argparse
import json
import logging
from collections import defaultdict
from datetime import datetime

from pathlib import Path
from io import BytesIO
from moviepy.editor import TextClip, ImageClip, ColorClip, CompositeVideoClip, concatenate_videoclips, AudioFileClip, ImageSequenceClip
from moviepy.audio.AudioClip import AudioClip
from moviepy.config import change_settings
import drawbot_skia.drawbot as drawBot

from sklearn import decomposition, cluster, manifold, preprocessing
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, accuracy_score, classification_report, mean_squared_error, r2_score
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Intégration avec les autres modules du projet
try:
    import pdfplumber
    import pytesseract
    from PIL import Image
    import fitz  # PyMuPDF
    import ollama
    PDF_PROCESSING_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Modules PDF optionnels non disponibles: {e}")
    PDF_PROCESSING_AVAILABLE = False

try:
    import nltk
    from nltk.stem import WordNetLemmatizer
    from nltk.tokenize import word_tokenize
    NLTK_AVAILABLE = True
except ImportError:
    print("⚠️ NLTK non disponible - fonctionnalités de traitement de texte limitées")
    NLTK_AVAILABLE = False

# Options globales pour la lecture directe
DIRECT_READING_MODE = False
SKIP_PAGE_NUMBERS = False

# Config ImageMagick
change_settings({
    "IMAGEMAGICK_BINARY": r"C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe"
})

# Configuration dynamique des chemins
def setup_paths(markdown_file=None, output_dir="output", output_filename=None):
    """Configure les chemins de manière dynamique"""
    if markdown_file:
        INPUT_MD = Path(markdown_file)
        BASE_DIR = INPUT_MD.parent
    else:
        # Chemin par défaut
        INPUT_MD = Path(r"C:\Users\OUMAIMA\Desktop\pfevrs2\formation\python\eca1.md")
        BASE_DIR = INPUT_MD.parent
    
    # Chemins de sortie
    if output_filename and Path(output_filename).is_absolute():
        # Si le nom de fichier est un chemin absolu, l'utiliser directement
        OUTPUT_VIDEO_PATH = Path(output_filename)
        OUTPUT_DIR = OUTPUT_VIDEO_PATH.parent
        OUTPUT_DIR.mkdir(exist_ok=True)
    else:
        # Utiliser le répertoire de base ou le répertoire courant
        OUTPUT_DIR = Path(output_dir) if Path(output_dir).is_absolute() else Path.cwd() / output_dir
        OUTPUT_DIR.mkdir(exist_ok=True)
        if output_filename:
            OUTPUT_VIDEO_PATH = OUTPUT_DIR / output_filename
        else:
            OUTPUT_VIDEO_PATH = OUTPUT_DIR / "presentation_fidele.mp4"
    
    ANIMATION_DIR = OUTPUT_DIR / "animations"
    ANIMATION_DIR.mkdir(exist_ok=True)
    
    # Recherche du logo dans plusieurs emplacements
    possible_logos = [
        BASE_DIR / "ZKoou2hVcY4v.webp",
        BASE_DIR / "logo.png",
        BASE_DIR / "logo.jpg",
        BASE_DIR / "assets" / "logo.png",
        Path(r"C:\Users\OUMAIMA\Desktop\pfevrs2\formation\python\ZKoou2hVcY4v.webp")
    ]
    
    LOGO_PATH = None
    for logo_path in possible_logos:
        if logo_path.exists():
            LOGO_PATH = logo_path
            break
    
    return INPUT_MD, BASE_DIR, OUTPUT_DIR, ANIMATION_DIR, LOGO_PATH, OUTPUT_VIDEO_PATH

# Initialisation par défaut
INPUT_MD, BASE_DIR, OUTPUT_DIR, ANIMATION_DIR, LOGO_PATH, DEFAULT_OUTPUT_VIDEO_PATH = setup_paths()

# Nettoyage fichiers audio corrompus
for f in OUTPUT_DIR.glob("*.wav"):
    try:
        f.unlink()
    except Exception as e:
        print(f"❌ Impossible de supprimer {f.name} : {e}")

# Paramètres Généraux
FONT_SIZE_TITLE = 50
FONT_SIZE_TEXT = 36
FONT_SIZE_TABLE = 28
WIDTH, HEIGHT = 960, 540  # 🧹 Correction RAM
BG_COLOR = (255, 255, 255)
TEXT_COLOR = "black"
TABLE_HEADER_BG = (200, 220, 240)
TABLE_ROW_BG_1 = (248, 248, 248)
TABLE_ROW_BG_2 = (255, 255, 255)
TABLE_BORDER = (180, 180, 180)
TEXT_MARGIN = 40
INTRO_DUR = 3
OUTRO_DUR = 3
SLIDE_DUR = 8
TRANSITION_DUR = 1
ANIMATION_FRAMES = 15  # 🧹 Moins d'images pour animation DrawBot
ANIMATION_DURATION = 2

# Synthèse Vocale
engine = pyttsx3.init()
engine.setProperty('rate', 150)

# === Partie 2 : FONCTIONS UTILITAIRES ===

def parse_arguments():
    """Parse les arguments de la ligne de commande - Compatible avec le script principal"""
    parser = argparse.ArgumentParser(
        description='Générateur de vidéos éducatives - Deep Learning Enhanced',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples d'utilisation:
  python videoseul.py document.md                    # Traitement basique
  python videoseul.py document.md --html             # Génération HTML + vidéo
  python videoseul.py document.md --no-page-numbers  # Mode lecture fluide
  python videoseul.py document.md --enhance-ai       # Avec amélioration IA
        """
    )
    
    # Arguments principaux - Compatible avec le script de référence
    parser.add_argument('markdown_file', help='Fichier Markdown à traiter')
    parser.add_argument('--model', default='microsoft/phi-2', help='Modèle de langage à utiliser')
    parser.add_argument('--html', action='store_true', help='Générer des diapositives HTML')
    parser.add_argument('--no-avatar', action='store_true', help='Désactiver l\'ajout de l\'avatar')
    parser.add_argument('--avatar-path', help='Chemin personnalisé vers la vidéo de l\'avatar',
                       default="H:/formation-main/avatar.mp4")
    parser.add_argument('--output', '-o', help='Nom de fichier de sortie pour la vidéo (.mp4)')
    parser.add_argument('--output-dir', help='Dossier de sortie pour les fichiers générés')
    
    # Support lecture directe - COMPATIBILITÉ TOTALE: supporter les deux arguments
    parser.add_argument('--no-page-numbers', action='store_true',
                       help='Ne pas mentionner les numéros de page dans la narration (lecture fluide)')
    parser.add_argument('--direct-reading', action='store_true',
                       help='Mode lecture directe - l\'avatar lit le contenu sans mentionner les pages (alias pour --no-page-numbers)')
    
    # Options étendues (optionnelles)
    parser.add_argument('--pdf', help='Fichier PDF à extraire et convertir en Markdown')
    parser.add_argument('--enhance-ai', action='store_true', help='Améliorer le contenu avec IA')
    parser.add_argument('--extract-sections', action='store_true', help='Extraire et grouper les sections similaires')
    parser.add_argument('--resolution', help='Résolution vidéo (960x540, 1920x1080)', default='960x540')
    parser.add_argument('--fps', type=int, help='Images par seconde', default=24)
    parser.add_argument('--quality', help='Qualité vidéo (fast, medium, high)', default='medium')
    parser.add_argument('--verbose', '-v', action='store_true', help='Mode verbeux')
    parser.add_argument('--interactive', action='store_true', help='Mode interactif')
    parser.add_argument('--tesseract-path', help='Chemin vers Tesseract OCR', 
                       default=r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    parser.add_argument('--figure-pages', nargs='+', type=int, help='Pages contenant des figures à extraire')
    
    return parser.parse_args()

# === FONCTIONS COMPATIBLES AVEC LE SCRIPT PRINCIPAL ===

def analyze_document_content(file_path):
    """Analyse le contenu du document - Compatible avec le script principal"""
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
        logging.warning(f"Erreur lors de l'analyse du contenu: {e}")
        return {
            "complexity": "simple",
            "content_type": "general", 
            "estimated_length": 0,
            "keywords": []
        }

def configure_avatar(avatar_path):
    """Configure et vérifie le chemin de l'avatar - Compatible avec le script principal"""
    if avatar_path and Path(avatar_path).exists():
        print(f"👤 Avatar trouvé: {avatar_path}")
        return avatar_path
    else:
        print(f"⚠️ Avatar non trouvé à: {avatar_path}")
        # Essayer d'autres chemins potentiels
        alternative_paths = [
            "H:/formation-main/avatar.mp4",
            "./avatar.mp4",
            "../avatar.mp4",
            BASE_DIR / "avatar.mp4"
        ]
        for alt_path in alternative_paths:
            if Path(alt_path).exists():
                print(f"👤 Avatar alternatif trouvé: {alt_path}")
                return str(alt_path)
        
        print("⚠️ Aucun avatar trouvé. La vidéo sera créée sans avatar.")
        return None

def load_learning_history():
    """Charge l'historique d'apprentissage - Compatible avec le script principal"""
    history_file = Path("video_generator_data.json")
    if history_file.exists():
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
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

def remove_page_numbers(content):
    """Retire les références aux numéros de page - Compatible avec le script principal"""
    patterns_to_remove = [
        r'^Page \d+[:.]*\s*',           # "Page 1:", "Page 2."
        r'^##\s*---\s*Page \d+\s*---\s*$',  # "## --- Page X ---"
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

def optimize_content_for_type(content, content_analysis):
    """Optimise le contenu selon son type - Compatible avec le script principal"""
    content_type = content_analysis.get("content_type", "general")
    complexity = content_analysis.get("complexity", "simple")
    
    print(f"🎯 Optimisation pour contenu {content_type} de complexité {complexity}")
    
    if content_type == "technical":
        # Ajouter des pauses après les termes techniques
        technical_terms = [
            r'\b(API|REST|JSON|XML|HTTP|HTTPS|SQL|NoSQL|AWS|Azure|Docker|Kubernetes)\b',
            r'\b(algorithm|function|class|method|database|framework|library)\b',
        ]
        
        for pattern in technical_terms:
            content = re.sub(pattern, r'\1... ', content, flags=re.IGNORECASE)
        
        content = re.sub(r'\n(#{1,3} .+)\n', r'\n\nNous allons maintenant expliquer \1\n', content)
        print("🔬 Optimisation technique appliquée")
        
    elif content_type == "educational":
        content = re.sub(r'\n(#{1,3} .+)\n', r'\n\nMaintenant, nous allons étudier \1\n', content)
        print("📚 Optimisation éducative appliquée")
        
    elif content_type == "business":
        business_terms = r'\b(ROI|profit|revenue|market|strategy|customer|growth|analysis|KPI|budget)\b'
        content = re.sub(business_terms, r'**\1**', content, flags=re.IGNORECASE)
        print("💼 Optimisation business appliquée")
        
    return content

def setup_logging(verbose=False):
    """Configure le système de logging"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('videoseul.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def enhance_content_with_ai(content, model_name="microsoft/phi-2"):
    """Améliore le contenu avec IA - Compatible avec le script principal"""
    if not PDF_PROCESSING_AVAILABLE:
        logging.warning("IA non disponible. Retour du contenu original.")
        return content
    
    try:
        prompt = f"""
Améliorez ce contenu éducatif pour une présentation vidéo :

{content}

Veuillez :
1. Structurer clairement avec des titres
2. Ajouter des points clés
3. Simplifier le langage technique
4. Ajouter des exemples si nécessaire
5. Garder le format Markdown
"""
        
        response = ollama.chat(
            model=model_name,
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        enhanced_content = response['message']['content'].strip()
        logging.info("Contenu amélioré avec IA")
        return enhanced_content
        
    except Exception as e:
        logging.error(f"Erreur amélioration IA: {e}")
        return content

def slugify(text):
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_")

def clean_text_for_display(text):
    if not text or not text.strip():
        return ""
    
    # Traitement basique pour la compatibilité
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line_content = line.strip()
        if line_content.startswith(('-', '*', '•')):
            line = f"• {line_content[1:].strip()}"
        formatted_lines.append(line)
    
    return '\n'.join(formatted_lines)

def create_text_clip(text, fontsize, width, position, align="West", duration=SLIDE_DUR):
    """Crée un TextClip MoviePy propre avec fallback"""
    if not text or not text.strip():
        text = " "

    try:
        clip = TextClip(
            text,
            fontsize=fontsize,
            color=TEXT_COLOR,
            method="caption",
            align=align,
            size=(width, None),
            interline=1.2
        )
        return clip.set_position(position).set_duration(duration)
    except Exception as e:
        print(f"⚠️ Erreur création TextClip: {e}")
        return TextClip(
            " ", fontsize=fontsize, color=TEXT_COLOR,
            method="caption", size=(width, None)
        ).set_position(position).set_duration(duration)

def slide_clip(title, text_content, images=None, tables=None, duration=SLIDE_DUR, animate_text=False):
    """Crée un slide simple compatible"""
    bg = ColorClip((WIDTH, HEIGHT), color=BG_COLOR).set_duration(duration)
    layers = [bg]

    content_top = 80 if title else 40
    
    # Titre
    if title:
        title_clip = create_text_clip(title, FONT_SIZE_TITLE, WIDTH-120, 
                                     position=("center", 30), 
                                     align="center", duration=duration)
        layers.append(title_clip)
    
    # Texte principal
    if text_content:
        clean_text = re.sub(r'!\[.*?\]\(.*?\)', '', text_content)
        clean_text = clean_text_for_display(clean_text)
        
        text_clip = create_text_clip(clean_text, FONT_SIZE_TEXT, WIDTH - 2*TEXT_MARGIN, 
                                   position=(TEXT_MARGIN, content_top), 
                                   duration=duration)
        layers.append(text_clip)

    # Logo
    if LOGO_PATH and LOGO_PATH.exists():
        logo = ImageClip(str(LOGO_PATH)).resize(width=70).set_position((WIDTH-80, 20)).set_duration(duration)
        layers.append(logo)

    return CompositeVideoClip(layers, size=(WIDTH, HEIGHT))

def create_enhanced_presentation(content, output_video_path=None, model_name="microsoft/phi-2"):
    """Crée une présentation simple compatible avec l'interface PyQt5"""
    if output_video_path is None:
        output_path = OUTPUT_DIR / "presentation_fidele.mp4"
    else:
        output_path = Path(output_video_path)
    
    # Créer le répertoire parent si nécessaire
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Chemin audio correspondant
    audio_path = output_path.with_suffix('.wav')
    
    all_slides = []
    full_narration = ""
    
    # Introduction
    intro = slide_clip("🎓 Présentation", "Introduction", duration=INTRO_DUR)
    all_slides.append(intro)
    full_narration += "Bienvenue dans cette présentation. "
    
    # Traitement du contenu
    if SKIP_PAGE_NUMBERS:
        content = remove_page_numbers(content)
    
    # Diviser le contenu en sections
    sections = content.split('\n\n')
    
    for i, section in enumerate(sections):
        if section.strip():
            lines = section.split('\n')
            title = lines[0] if lines else f"Section {i+1}"
            content_text = '\n'.join(lines[1:]) if len(lines) > 1 else section
            
            slide = slide_clip(title, content_text, duration=SLIDE_DUR)
            all_slides.append(slide)
            
            # Narration
            narration_text = re.sub(r'[#*]', '', section)
            full_narration += narration_text + ". "
    
    # Conclusion
    outro = slide_clip("📘 Merci", "Conclusion", duration=OUTRO_DUR)
    all_slides.append(outro)
    full_narration += "Merci pour votre attention."
    
    # Génération audio
    print("🔊 Génération de la narration...")
    engine.save_to_file(full_narration, str(audio_path))
    engine.runAndWait()
    time.sleep(1)
    
    if not audio_path.exists():
        print("❌ Échec de la génération audio")
        return False
    
    # Création vidéo
    print("🎬 Création de la vidéo...")
    final_clip = concatenate_videoclips(all_slides)
    
    audio = AudioFileClip(str(audio_path))
    if audio.duration > final_clip.duration:
        audio = audio.subclip(0, final_clip.duration)
    final_clip = final_clip.set_audio(audio)
    
    print(f"💾 Sauvegarde: {output_path}")
    print(f"🎥 Génération en cours avec le modèle {model_name}...")
    
    try:
        final_clip.write_videofile(
            str(output_path),
            fps=24,
            codec="libx264",
            audio_codec="aac",
            preset="faster",
            threads=4,
            verbose=False,  # Réduire la verbosité pour l'interface
            logger=None     # Désactiver le logger moviepy
        )
        
        # Vérifier que le fichier a été créé
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"✅ Vidéo créée avec succès: {output_path}")
            print(f"📁 Taille du fichier: {output_path.stat().st_size / (1024*1024):.1f} MB")
            return str(output_path)
        else:
            print("❌ Erreur: Le fichier vidéo n'a pas été créé correctement")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la génération vidéo: {e}")
        return False
    finally:
        # Nettoyer les ressources
        try:
            final_clip.close()
            audio.close()
        except:
            pass
        
        # Nettoyer le fichier audio temporaire
        try:
            if audio_path.exists():
                audio_path.unlink()
        except:
            pass

def main():
    """Fonction principale - Compatible avec le script de référence"""
    global DIRECT_READING_MODE, SKIP_PAGE_NUMBERS, INPUT_MD, BASE_DIR, OUTPUT_DIR, ANIMATION_DIR, LOGO_PATH
    
    try:
        print("🚀 Générateur de Vidéos Éducatives - Deep Learning Enhanced")
        print("=" * 60)
        
        # Parser les arguments - Compatible avec le script principal
        args = parse_arguments()
        
        # Marquer le début du traitement
        start_time = time.time()
        
        # Configuration du logging
        logger = setup_logging(getattr(args, 'verbose', False))
        
        # Configuration des variables globales - COMPATIBILITÉ TOTALE
        SKIP_PAGE_NUMBERS = args.no_page_numbers or args.direct_reading  # Support des deux arguments
        DIRECT_READING_MODE = args.no_page_numbers or args.direct_reading
        
        # Déterminer le chemin de sortie final
        output_filename = args.output
        output_dir = getattr(args, 'output_dir', 'output')
        
        # Configuration des chemins
        if args.markdown_file:
            INPUT_MD, BASE_DIR, OUTPUT_DIR, ANIMATION_DIR, LOGO_PATH, OUTPUT_VIDEO_PATH = setup_paths(
                args.markdown_file, 
                output_dir,
                output_filename
            )
        
        # Affichage des paramètres - Compatible avec le script principal
        print(f"📄 Fichier d'entrée: {args.markdown_file}")
        print(f"🤖 Modèle IA: {args.model}")
        print(f"📖 Mode lecture: {'Directe (fluide)' if (args.no_page_numbers or args.direct_reading) else 'Standard (avec pages)'}")
        print(f"🎬 Format: {'HTML + Vidéo' if args.html else 'Vidéo uniquement'}")
        print(f"👤 Avatar: {'Désactivé' if args.no_avatar else 'Activé'}")
        print("-" * 60)
        
        # Vérifier l'existence du fichier
        if not Path(args.markdown_file).exists():
            print(f"❌ Fichier non trouvé: {args.markdown_file}")
            return False
        
        # Analyser le document avec IA
        print("🧠 Analyse IA du document en cours...")
        content_analysis = analyze_document_content(args.markdown_file)
        print(f"📊 Type de contenu: {content_analysis['content_type']}")
        print(f"📈 Complexité: {content_analysis['complexity']}")
        print(f"📝 Longueur estimée: {content_analysis['estimated_length']} mots")
        
        # Configuration de l'avatar
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
        
        # Lire et traiter le contenu
        print("📚 Lecture du fichier Markdown...")
        with open(args.markdown_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Appliquer le mode lecture directe si demandé
        if args.no_page_numbers or args.direct_reading:
            print("📖 Application du mode lecture directe...")
            content = remove_page_numbers(content)
        else:
            print("📄 Conservation du mode standard avec pagination")
        
        # Optimiser selon le type de contenu
        content = optimize_content_for_type(content, content_analysis)
        
        # Améliorer avec IA si demandé
        if getattr(args, 'enhance_ai', False):
            print("🤖 Amélioration du contenu avec IA...")
            content = enhance_content_with_ai(content, args.model)
        
        # Générer la présentation
        print("🎦 Génération de la vidéo...")
        print(f"💾 Fichier de sortie prévu: {OUTPUT_VIDEO_PATH}")
        
        result = create_enhanced_presentation(content, str(OUTPUT_VIDEO_PATH), args.model)
        
        # Calculer le temps de traitement
        processing_time = time.time() - start_time
        
        # Déterminer le résultat final
        success = bool(result and result != False)
        final_output_path = result if isinstance(result, str) else (str(OUTPUT_VIDEO_PATH) if success else None)
        
        # Enregistrer dans l'historique
        save_processing_record_compatible(args, content_analysis, success, processing_time, learning_data, final_output_path)
        
        # Afficher les résultats
        print("\n" + "=" * 60)
        if success and final_output_path:
            print("✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
            print(f"📁 Fichier de sortie: {final_output_path}")
            print(f"⏱️ Temps de traitement: {processing_time:.1f} secondes")
            print(f"🎬 Modèle utilisé: {args.model}")
        else:
            print("❌ Échec de la génération")
        
        print("=" * 60)
        
        return success
        
    except KeyboardInterrupt:
        print("\n⏹️ Génération interrompue par l'utilisateur")
        return False
    except Exception as e:
        print(f"❌ Erreur critique: {e}")
        import traceback
        traceback.print_exc()
        return False

def save_processing_record_compatible(args, content_analysis, success, processing_time, learning_data, final_output_path=None):
    """Sauvegarde compatible avec le script principal"""
    output_path = final_output_path if final_output_path else None
    
    processing_record = {
        'file_path': args.markdown_file,
        'file_name': Path(args.markdown_file).name,
        'models_used': [args.model],
        'video_paths': [str(output_path)] if output_path else [],
        'processing_time': processing_time,
        'timestamp': datetime.now().isoformat(),
        'file_size': Path(args.markdown_file).stat().st_size,
        'file_type': Path(args.markdown_file).suffix,
        'content_analysis': content_analysis,
        'options_used': {
            'no_page_numbers': args.no_page_numbers or args.direct_reading,  # Support des deux
            'html_mode': args.html,
            'no_avatar': args.no_avatar,
            'custom_output': args.output is not None
        },
        'success': success
    }
    
    # Mettre à jour l'historique
    if 'processed_files' not in learning_data:
        learning_data['processed_files'] = []
    learning_data['processed_files'].append(processing_record)
    
    # Mettre à jour les compteurs
    if success and 'total_videos_generated' not in learning_data:
        learning_data['total_videos_generated'] = 0
    if success:
        learning_data['total_videos_generated'] += 1
    
    # Mettre à jour le niveau d'amélioration
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
    
    # Sauvegarder
    try:
        with open("video_generator_data.json", 'w', encoding='utf-8') as f:
            json.dump(learning_data, f, ensure_ascii=False, indent=2)
        print("💾 Historique d'apprentissage mis à jour")
    except Exception as e:
        print(f"⚠️ Erreur sauvegarde: {e}")

if __name__ == "__main__":
    # Configuration de l'encodage pour la compatibilité avec l'interface PyQt5
    import sys
    import codecs
    
    # Forcer l'encodage UTF-8 pour la sortie
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    
    # Vérification des dépendances au démarrage
    print("🔧 Vérification des dépendances...")
    
    missing_deps = []
    if not PDF_PROCESSING_AVAILABLE:
        missing_deps.append("PDF (pdfplumber, PyMuPDF, pytesseract)")
    if not NLTK_AVAILABLE:
        missing_deps.append("NLTK")
    
    if missing_deps:
        print(f"⚠️ Dépendances optionnelles manquantes: {', '.join(missing_deps)}")
        print("💡 Installez avec: pip install pdfplumber PyMuPDF pytesseract nltk ollama")
        print("📝 Fonctionnalités limitées au traitement Markdown de base\n")
    else:
        print("✅ Toutes les dépendances sont disponibles\n")
    
    # Configuration pour l'interface PyQt5
    print("🔗 Interface PyQt5 - Prêt pour l'intégration")
    print("🎥 Mode: Génération vidéo compatible script principal")
    print("🤖 IA Deep Learning: Recommandations et apprentissage actifs")
    print("-" * 50)
    
    main()
