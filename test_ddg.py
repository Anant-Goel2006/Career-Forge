import urllib.request
import re

html = urllib.request.urlopen('https://html.duckduckgo.com/html/?q=site:linkedin.com/in+Google').read().decode()
blocks = re.findall(r'<h2 class="result__title">\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
for link, title in blocks[:3]:
    print(title)
