---
name: PDF Processing Pro
description: Production-ready PDF processing with forms, tables, OCR, validation, and batch operations. Use when working with complex PDF workflows in production environments, processing large volumes of PDFs, or requiring robust error handling and validation.
---

# PDF Processing Pro

Production-ready PDF processing toolkit with pre-built scripts, comprehensive error handling, and support for complex workflows.

## Quick start

### Extract text from PDF

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    text = pdf.pages[0].extract_text()
    print(text)
```

### Analyze PDF form (using included script)

```bash
python scripts/analyze_form.py input.pdf --output fields.json
```

### Fill PDF form with validation

```bash
python scripts/fill_form.py input.pdf data.json output.pdf
```

### Extract tables from PDF

```bash
python scripts/extract_tables.py report.pdf --output tables.csv
```

## Features

- **Error handling**: Graceful failures with detailed error messages
- **Validation**: Input validation and type checking
- **Logging**: Configurable logging with timestamps
- **Type hints**: Full type annotations for IDE support
- **CLI interface**: `--help` flag for all scripts
- **Exit codes**: Proper exit codes for automation

## Comprehensive workflows

- **PDF Forms**: Complete form processing pipeline
- **Table Extraction**: Advanced table detection and extraction
- **OCR Processing**: Scanned PDF text extraction
- **Batch Operations**: Process multiple PDFs efficiently
- **Validation**: Pre and post-processing validation

## Included scripts

### Form processing

```bash
python scripts/analyze_form.py input.pdf [--output fields.json] [--verbose]
python scripts/fill_form.py input.pdf data.json output.pdf [--validate]
python scripts/validate_form.py data.json schema.json
```

### Table extraction

```bash
python scripts/extract_tables.py input.pdf [--output tables.csv] [--format csv|excel]
```

### Text extraction

```bash
python scripts/extract_text.py input.pdf [--output text.txt] [--preserve-formatting]
```

### Utilities

```bash
python scripts/merge_pdfs.py file1.pdf file2.pdf --output merged.pdf
python scripts/split_pdf.py input.pdf --output-dir pages/
python scripts/validate_pdf.py input.pdf
```

## Common workflows

### Process form submissions

```bash
python scripts/analyze_form.py template.pdf --output schema.json
python scripts/validate_form.py submission.json schema.json
python scripts/fill_form.py template.pdf submission.json completed.pdf
python scripts/validate_pdf.py completed.pdf
```

### Extract data from reports

```bash
python scripts/extract_tables.py monthly_report.pdf --output data.csv
python scripts/extract_text.py monthly_report.pdf --output report.txt
```

### Batch processing

```python
import glob
from pathlib import Path
import subprocess

for pdf_file in glob.glob("invoices/*.pdf"):
    output_file = Path("processed") / Path(pdf_file).name
    result = subprocess.run([
        "python", "scripts/extract_text.py",
        pdf_file, "--output", str(output_file)
    ], capture_output=True)
    if result.returncode == 0:
        print(f"Processed: {pdf_file}")
    else:
        print(f"Failed: {pdf_file} - {result.stderr}")
```

## Dependencies

```bash
pip install pdfplumber pypdf pillow pytesseract pandas
```

Optional for OCR:
```bash
# macOS: brew install tesseract
# Ubuntu: apt-get install tesseract-ocr
# Windows: Download from GitHub releases
```

## Best practices

1. Always validate inputs before processing
2. Use try-except in custom scripts
3. Log all operations for debugging
4. Test with sample PDFs before production
5. Set timeouts for long-running operations
6. Check exit codes in automation
7. Backup originals before modification
