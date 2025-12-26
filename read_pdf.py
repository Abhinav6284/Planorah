import sys
try:
    from pypdf import PdfReader
except ImportError:
    try:
        from PyPDF2 import PdfReader
    except ImportError:
        print("MISSING_LIB")
        sys.exit(1)

try:
    reader = PdfReader("Plan/Career_Platform_Detailed_Workflow.pdf")
    with open("pdf_content.txt", "w", encoding="utf-8") as f:
        for i, page in enumerate(reader.pages):
            f.write(f"--- Page {i+1} ---\n")
            text = page.extract_text()
            if text:
                f.write(text + "\n\n")
    print("Done writing pdf_content.txt")
except Exception as e:
    print(f"Error reading PDF: {e}")
