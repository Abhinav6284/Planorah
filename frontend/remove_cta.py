import os
import re

files = [
    'TemplatesPage.jsx', 'StudentsPage.jsx', 'PricingPublicPage.jsx',
    'HowItWorksPage.jsx', 'FeaturesPage.jsx', 'FAQPage.jsx',
    'DemoPage.jsx', 'ContactPage.jsx', 'CareersPage.jsx', 'AboutPage.jsx'
]

for file in files:
    path = os.path.join('p:\\Planorah\\frontend\\src\\components', file)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Remove import
    content = re.sub(r'import FinalCTA from [\'"]./shared/FinalCTA[\'"];\n?', '', content)
    # Remove component usages
    content = re.sub(r'\s*<FinalCTA />\n?', '\n', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {file}")
