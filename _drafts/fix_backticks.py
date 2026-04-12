"""Fix escaped backticks in ch25 content."""
with open('docs/management/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The problem: content:\` should be content:` (real backtick, no backslash)
old = 'content:\\`'
new = 'content:`'
count = content.count(old)
print(f'Found {count} escaped backtick patterns')

content = content.replace(old, new)

# Also fix closing: \`} should be `}
old2 = '\\`}'
new2 = '`}'
count2 = content.count(old2)
print(f'Found {count2} escaped closing backtick patterns')
content = content.replace(old2, new2)

with open('docs/management/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed!')
