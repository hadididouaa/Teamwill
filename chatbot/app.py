import os
import torch
import tempfile
from io import BytesIO
import chromadb
import ollama
from chromadb.utils.embedding_functions.ollama_embedding_function import OllamaEmbeddingFunction
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import CrossEncoder
from flask import Flask, request, jsonify
from flask_cors import CORS  # Importez CORS


# Creates a Flask web server and enables CORS so it can be accessed from frontend
app = Flask(__name__)

CORS(app)


# list of PDF training documents that will be used to build the knowledge base.
pdf_files = [
    "./TR__Formations_EKIP_/TW_Formation GA EKIP360 - V2 (1).pdf",
    "./TR__Formations_EKIP_/TW_facturation_EKIP360.pdf",
    "./TR__Formations_EKIP_/Documentation paramétrage de prestation (1).pdf",
    "./TR__Formations_EKIP_/TW Formation-Prestation_V2 (1).pdf",
]



# Chat system prompt
# Chat system prompt :Analyzes context, and Gives structured, context-based answers only
system_prompt = """
You are an AI assistant tasked with providing detailed answers based solely on the given context. 
Your goal is to analyze the information provided and formulate a comprehensive, well-structured response to the question.

context will be passed as "Context:"
user question will be passed as "Question:"

To answer the question:
1. Thoroughly analyze the context, identifying key information relevant to the question.
2. Organize your thoughts and plan your response to ensure a logical flow of information.
3. Formulate a detailed answer that directly addresses the question, using only the information provided in the context.
4. Ensure your answer is comprehensive, covering all relevant aspects found in the context.
5. If the context doesn't contain sufficient information to fully answer the question, state this clearly in your response.

Important: Base your entire response solely on the information provided in the context. Do not include any external knowledge or assumptions not present in the given text.
"""

# Fonction to Converts a PDF file into smaller text chunks
def process_document(pdf_path: str) -> list[Document]:
    with open(pdf_path, "rb") as f:
        file_data = f.read()
    temp_file = BytesIO(file_data)

    with tempfile.NamedTemporaryFile("wb", suffix=".pdf", delete=False) as temp_pdf_file:
        temp_pdf_file.write(file_data)
        temp_pdf_filename = temp_pdf_file.name  # Get the path of the temp file

    loader = PyMuPDFLoader(temp_pdf_filename)
    docs = loader.load()

    os.remove(temp_pdf_filename)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", "?", "!", " ", ""],
    )
    return text_splitter.split_documents(docs)

# Initializes a ChromaDB vector store using an embedding function (Ollama via nomic-embed-text)
def get_vector_collection() -> chromadb.Collection:
    ollama_ef = OllamaEmbeddingFunction(
        url="http://localhost:11434/api/embeddings",
        model_name="nomic-embed-text:latest",
    )
    chroma_client = chromadb.PersistentClient(path="./demo-rag-chroma")
    return chroma_client.get_or_create_collection(
        name="rag_app",
        embedding_function=ollama_ef,
        metadata={"hnsw:space": "cosine"},
    )

# Fonction that Adds processed PDF chunks to the Chroma vector database, and Each chunk is indexed with metadata and an Id
def add_to_vector_collection(all_splits: list[Document], file_name: str):
    collection = get_vector_collection()
    documents, metadatas, ids = [], [], []

    for idx, split in enumerate(all_splits):
        documents.append(split.page_content)
        metadatas.append(split.metadata)
        ids.append(f"{file_name}_{idx}")

    collection.upsert(
        documents=documents,
        metadatas=metadatas,
        ids=ids,
    )

# Fonction that Runs a semantic similarity search based on the user’s question
def query_collection(prompt: str, n_results: int = 10):
    collection = get_vector_collection()
    results = collection.query(query_texts=[prompt], n_results=n_results)
    return results

# Fonction pour appeler le modèle LLM et générer une réponse
def call_llm(context: str, prompt: str):
    response = ollama.chat(
        model="llama3.2:3b",
        stream=True, # to fetch token-by-token 
        messages=[{"role": "system", "content": system_prompt},
                  {"role": "user", "content": f"Context: {context}, Question: {prompt}"}]
    )
    response_text = ""
    for chunk in response:
        if chunk["done"] is False:
            response_text += chunk["message"]["content"]
        else:
            break
    return response_text

# Fonction that Uses a CrossEncoder model (ms-marco) to re-rank the top results from Chroma for better relevance
def re_rank_cross_encoders(documents: list[str], prompt: str) -> str:
    encoder_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    ranks = encoder_model.rank(prompt, documents, top_k=5) # Picks the top 3 and concatenates their content
    relevant_text = ""
    for rank in ranks:
        relevant_text += documents[rank["corpus_id"]]
    return relevant_text

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    if 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400

    prompt = data['question']
    
    # Query the collection based on the prompt
    results = query_collection(prompt)
    context = results.get("documents")[0]
    
    # Re-rank documents and get relevant content
    relevant_text = re_rank_cross_encoders(context, prompt)
    
    # Get the response from the LLM model
    response_text = call_llm(context=relevant_text, prompt=prompt)
    
    return jsonify({'answer': response_text})

if __name__ == '__main__':
    # 🆕 Ajouter cette partie temporaire pour regénérer toute la base
    for pdf_file in pdf_files:
        splits = process_document(pdf_file)
        add_to_vector_collection(splits, os.path.basename(pdf_file))
    
    app.run(debug=True, host="0.0.0.0", port=5000)

