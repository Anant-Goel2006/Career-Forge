"""
CareerForge AI — Recruiter Discovery Service.
"""
import logging
import httpx
import re
from typing import Any
from urllib.parse import quote_plus
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ContactResult(BaseModel):
    name: str
    role: str
    source_url: str
    confidence: str

class RecruiterDiscoveryService:
    async def find_recruiters(self, company: str, role_area: str = "") -> list[dict[str, Any]]:
        """
        Search for publicly available LinkedIn recruiter profiles via a public search engine.
        Never guesses private emails.
        """
        # Formulate search query targeting LinkedIn profiles for recruiters at the company
        query = f'site:linkedin.com/in "{company}" ("Recruiter" OR "Talent Acquisition" OR "HR") {role_area}'
        
        url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        results = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=10.0)
                if response.status_code == 200:
                    # Basic extraction of title and link from DDG HTML
                    # DDG HTML uses <a class="result__url" href="..."> and <h2 class="result__title">
                    
                    # Regex to find result blocks: DuckDuckGo uses class="result__a" for the title link inside h2
                    blocks = re.findall(r'<h2 class="result__title">\s*<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', response.text, re.IGNORECASE | re.DOTALL)
                    
                    for link, title_html in blocks:
                        # Clean HTML from title
                        title = re.sub(r'<[^>]+>', '', title_html).strip()
                        
                        # Only include LinkedIn profiles
                        if "linkedin.com/in/" in link:
                            # Typical LinkedIn title format: "John Doe - Technical Recruiter - Google | LinkedIn"
                            parts = [p.strip() for p in title.split('-')]
                            name = parts[0] if parts else "Unknown"
                            role = parts[1] if len(parts) > 1 else "Recruiter"
                            # Clean up "| LinkedIn" from role if present
                            role = role.split('|')[0].strip()
                            
                            results.append(ContactResult(
                                name=name,
                                role=role,
                                source_url=link,
                                confidence="Likely" if name != "Unknown" else "Unconfirmed"
                            ).model_dump())
                            
                            if len(results) >= 3:
                                break
        except Exception as e:
            logger.warning(f"Failed to discover recruiters via search: {e}")
            
        if not results:
            # Fallback message
            logger.info(f"No public recruiter found for {company}")
            
        return results
