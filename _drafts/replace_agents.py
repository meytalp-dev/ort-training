"""Replace agents block in index.html."""
with open('docs/management/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

with open('_drafts/new_agents_block.js', 'r', encoding='utf-8') as f:
    new_block = f.read()

start = content.find('const agents=[')
end = content.find('function showPage(id){')

if start < 0 or end < 0:
    print(f'ERROR: markers not found (start={start}, end={end})')
    exit(1)

content = content[:start] + new_block + content[end:]

with open('docs/management/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'OK - replaced {end - start} chars with {len(new_block)} chars')
