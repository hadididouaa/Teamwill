#Flask REST API microservice
from flask import Flask, request, jsonify, send_file
import os
import tempfile
from werkzeug.utils import secure_filename
from convert_to_pdf import docx_to_pdf, pptx_to_pdf
from convert_pdf_to_markdown import pdf_to_markdown_text
from extract_labeled_data import parse_markdown_structure, save_labeled_data
import logging

app = Flask(__name__)

UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS_DOC = {'docx', 'pptx'}
ALLOWED_EXTENSIONS_PDF = {'pdf'}
ALLOWED_EXTENSIONS_MD = {'md'}

def allowed_file(filename, allowed_exts):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts


@app.route('/convert-to-pdf', methods=['POST'])
def convert_to_pdf_endpoint():
    if 'file' not in request.files:
        app.logger.error('No file part in the request')
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        app.logger.error('No selected file')
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename, ALLOWED_EXTENSIONS_DOC):
        filename = secure_filename(file.filename)
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        output_path = os.path.splitext(input_path)[0] + '.pdf'
        try:
            ext = filename.rsplit('.', 1)[1].lower()
            if ext == 'docx':
                docx_to_pdf(input_path, output_path)
            elif ext == 'pptx':
                pptx_to_pdf(input_path, output_path)
            else:
                app.logger.error(f'Unsupported file type: {ext}')
                return jsonify({'error': 'Unsupported file type'}), 400
            return send_file(output_path, as_attachment=True)
        except Exception as e:
            app.logger.error(f'Exception during conversion: {str(e)}')
            return jsonify({'error': str(e)}), 500
    else:
        app.logger.error(f'File type not allowed: {file.filename}')
        return jsonify({'error': 'File type not allowed'}), 400

@app.route('/convert-pdf-to-markdown', methods=['POST'])
def convert_pdf_to_markdown_endpoint():
    if 'file' not in request.files:
        app.logger.error('No file part in the request')
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['file']
    if file.filename == '':
        app.logger.error('No selected file')
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename, ALLOWED_EXTENSIONS_PDF):
        filename = secure_filename(file.filename)
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        try:
            markdown_text = pdf_to_markdown_text(input_path)
            return jsonify({'markdown': markdown_text})
        except Exception as e:
            app.logger.error(f'Exception during PDF to markdown conversion: {str(e)}')
            return jsonify({'error': str(e)}), 500
    else:
        app.logger.error(f'File type not allowed: {file.filename}')
        return jsonify({'error': 'File type not allowed'}), 400

@app.route('/extract-labeled-data', methods=['POST'])
def extract_labeled_data_endpoint():
    if 'markdown' not in request.json:
        app.logger.error('No markdown content provided')
        return jsonify({'error': 'No markdown content provided'}), 400
    md_content = request.json['markdown']
    try:
        labeled_data = parse_markdown_structure(md_content)
        return jsonify({'labeled_data': labeled_data})
    except Exception as e:
        app.logger.error(f'Exception during labeled data extraction: {str(e)}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    app.run(port=5001, debug=True)
