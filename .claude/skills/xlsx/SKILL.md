---
name: xlsx
description: "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."
license: Proprietary. LICENSE.txt has complete terms
---

# XLSX creation, editing, and analysis

## Overview

A user may ask you to create, edit, or analyze the contents of an .xlsx file.

## Important Requirements

**LibreOffice Required for Formula Recalculation**: Use the `scripts/recalc.py` script for recalculating formula values.

## CRITICAL: Use Formulas, Not Hardcoded Values

Always use Excel formulas instead of calculating values in Python and hardcoding them.

```python
# CORRECT - Using Excel Formulas
sheet['B10'] = '=SUM(B2:B9)'
sheet['C5'] = '=(C4-C2)/C2'
sheet['D20'] = '=AVERAGE(D2:D19)'
```

## Reading and analyzing data

```python
import pandas as pd

df = pd.read_excel('file.xlsx')
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)

df.head()
df.info()
df.describe()

df.to_excel('output.xlsx', index=False)
```

## Creating new Excel files

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

sheet['A1'] = 'Hello'
sheet.append(['Row', 'of', 'data'])
sheet['B2'] = '=SUM(A1:A10)'

sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

## Editing existing Excel files

```python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active

sheet['A1'] = 'New Value'
sheet.insert_rows(2)
sheet.delete_cols(3)

new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

## Recalculating formulas

```bash
python scripts/recalc.py output.xlsx 30
```

## Financial Models - Color Coding Standards

- **Blue text**: Hardcoded inputs
- **Black text**: ALL formulas and calculations
- **Green text**: Links from other worksheets
- **Red text**: External links to other files
- **Yellow background**: Key assumptions needing attention

## Number Formatting Standards

- **Years**: Format as text strings ("2024" not "2,024")
- **Currency**: Use $#,##0 format with units in headers
- **Zeros**: Format as "-"
- **Percentages**: Default to 0.0%
- **Multiples**: Format as 0.0x
- **Negative numbers**: Use parentheses (123) not -123

## Best Practices

- **pandas**: Best for data analysis, bulk operations
- **openpyxl**: Best for complex formatting, formulas, Excel-specific features
- Cell indices are 1-based
- Use `data_only=True` to read calculated values
- Warning: `data_only=True` + save = formulas permanently lost
- Write minimal, concise Python code
