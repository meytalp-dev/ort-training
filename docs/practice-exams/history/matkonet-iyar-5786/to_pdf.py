import asyncio, os
from playwright.async_api import async_playwright

HTML = os.path.abspath("matkonet-iyar-5786.html")
PDF  = os.path.abspath("matkonet-iyar-5786.pdf")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("file:///" + HTML.replace("\\", "/"))
        await page.emulate_media(media="print")
        await page.pdf(
            path=PDF,
            format="A4",
            margin={"top": "0cm", "bottom": "0cm", "left": "0cm", "right": "0cm"},
            print_background=True,
        )
        await browser.close()
    print(f"Saved: {PDF}")

asyncio.run(main())
