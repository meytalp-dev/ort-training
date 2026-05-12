"""
Generic PyMuPDF extractor for adapted/30%/olim exams.
Reads all PDFs from raw-adapted/{241,282,274}/ and writes plain text to extracted-adapted/{241,282,274}/.
"""
import fitz
from pathlib import Path

ROOT = Path(__file__).parent / "raw-adapted"
OUT_ROOT = Path(__file__).parent / "extracted-adapted"
TRACKS = ["241", "282", "274"]


def extract_pdf(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    parts = []
    for pgnum in range(doc.page_count):
        text = doc[pgnum].get_text("text")
        parts.append(f"\n\n===== עמוד {pgnum+1} =====\n\n{text}")
    doc.close()
    return "".join(parts)


def main():
    total_ok = 0
    total_fail = 0
    for track in TRACKS:
        src = ROOT / track
        dst = OUT_ROOT / track
        dst.mkdir(parents=True, exist_ok=True)
        pdfs = sorted(src.glob("*.pdf"))
        print(f"\n=== {track} ({len(pdfs)} PDFs) ===")
        for pdf in pdfs:
            out_path = dst / (pdf.stem + ".txt")
            try:
                text = extract_pdf(pdf)
                out_path.write_text(text, encoding="utf-8")
                total_ok += 1
                print(f"  OK {pdf.name}: {len(text)} chars")
            except Exception as e:
                total_fail += 1
                print(f"  FAIL {pdf.name}: {e}")
    print(f"\nTotal: {total_ok} OK, {total_fail} fail")


if __name__ == "__main__":
    main()
