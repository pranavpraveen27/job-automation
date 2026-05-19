import io

import pdfplumber


def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    try:
        with io.BytesIO(file_bytes) as stream:
            with pdfplumber.open(stream) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages).strip()
    except Exception as exc:
        raise ValueError("Unable to parse PDF resume. Upload a valid PDF file.") from exc
