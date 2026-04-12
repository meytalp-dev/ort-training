"""
צילום מודעת דרושים — לחצי פעמיים על הקובץ הזה
התמונה תישמר ב-Downloads
"""
from playwright.sync_api import sync_playwright
import os

downloads = os.path.expanduser("~/Downloads")
html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "job-card-preview.html")
output_path = os.path.join(downloads, "דרושים-אורט-בית-הערבה.png")

print("מצלם את מודעת הדרושים...")
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 2000})
    page.goto(f"file:///{html_path.replace(os.sep, '/')}")
    page.wait_for_timeout(2000)
    el = page.locator(".canvas").first
    el.screenshot(path=output_path)
    browser.close()

print(f"נשמר: {output_path}")
os.startfile(output_path)
