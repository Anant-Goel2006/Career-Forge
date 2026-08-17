"""
CareerForge AI — Job Sourcing Service.

Aggregates real job listings from free, legitimate job search APIs.
Returns canonical apply URLs — never constructs or guesses URLs.

Sources:
    - Arbeitnow API (free, no key, tech/remote jobs)
    - RemoteOK API (free, no key, remote tech roles)
    - Adzuna API (free tier, broad coverage — optional API key)

Security:
    - No scraping of LinkedIn, Indeed, Naukri (violates ToS)
    - Direct apply URLs from API responses only
    - Freshness enforcement: filters stale listings
"""

import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx
from pydantic import BaseModel, Field, HttpUrl

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class JobListing(BaseModel):
    """A job listing sourced from an external API."""
    external_id: str
    title: str
    company: str
    location: str = "Remote"
    apply_url: str
    description: str = ""
    posted_date: datetime | None = None
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source_platform: str = ""
    skills: list[str] = Field(default_factory=list)
    employment_type: str | None = None
    experience_level: str | None = None
    salary: str | None = None
    link_status: str = "unchecked"  # "ok" | "dead" | "unchecked"


class JobSearchParams(BaseModel):
    """Parameters for a job search query."""
    keywords: str = ""
    location: str = ""
    remote_only: bool = False
    limit: int = Field(default=20, ge=1, le=50)


# ---------------------------------------------------------------------------
# API Adapters
# ---------------------------------------------------------------------------

async def _fetch_arbeitnow(params: JobSearchParams) -> list[JobListing]:
    """Fetch jobs from Arbeitnow API (free, no key required)."""
    jobs: list[JobListing] = []
    try:
        url = "https://www.arbeitnow.com/api/job-board-api"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        for item in data.get("data", [])[:params.limit]:
            title = item.get("title", "")
            company = item.get("company_name", "")
            description = item.get("description", "")

            # Filter by keywords if provided
            if params.keywords:
                search_text = f"{title} {company} {description}".lower()
                keywords_lower = params.keywords.lower().split()
                if not any(kw in search_text for kw in keywords_lower):
                    continue

            # Filter by remote if requested
            if params.remote_only and not item.get("remote", False):
                continue

            # Filter by location if provided
            location = item.get("location", "Remote") or "Remote"
            if params.location and params.location.lower() not in location.lower() and not params.remote_only:
                continue

            # Parse posted date
            posted_date = None
            created_at = item.get("created_at")
            if created_at:
                try:
                    posted_date = datetime.fromtimestamp(created_at, tz=timezone.utc)
                except (ValueError, TypeError, OSError):
                    pass

            # Extract tags as skills
            tags = item.get("tags", []) or []

            apply_url = item.get("url", "")
            if not apply_url:
                continue

            jobs.append(JobListing(
                external_id=f"arbeitnow-{item.get('slug', title[:30])}",
                title=title,
                company=company,
                location=location,
                apply_url=apply_url,
                description=_clean_html(description)[:500],
                posted_date=posted_date,
                source_platform="Arbeitnow",
                skills=tags[:10],
                employment_type="Full-time",
                remote=item.get("remote", False),
            ))

    except Exception as e:
        logger.warning(f"Arbeitnow fetch failed: {e}")

    return jobs[:params.limit]


async def _fetch_remoteok(params: JobSearchParams) -> list[JobListing]:
    """Fetch jobs from RemoteOK API (free, no key required)."""
    jobs: list[JobListing] = []
    try:
        url = "https://remoteok.com/api"
        headers = {"User-Agent": "CareerForge/1.0"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        # First item is metadata, skip it
        listings = data[1:] if len(data) > 1 else []

        for item in listings[:params.limit * 2]:  # Fetch more, filter down
            position = item.get("position", "")
            company = item.get("company", "")
            description = item.get("description", "")

            # Filter by keywords
            if params.keywords:
                search_text = f"{position} {company} {description}".lower()
                keywords_lower = params.keywords.lower().split()
                if not any(kw in search_text for kw in keywords_lower):
                    continue

            # Location filter (RemoteOK is all remote, but some specify regions)
            location = item.get("location", "Remote") or "Remote"

            # Parse date
            posted_date = None
            date_str = item.get("date")
            if date_str:
                try:
                    posted_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                except (ValueError, TypeError):
                    pass

            apply_url = item.get("url", "")
            if not apply_url:
                continue

            tags = item.get("tags", []) or []
            salary_min = item.get("salary_min")
            salary_max = item.get("salary_max")
            salary = None
            if salary_min and salary_max:
                salary = f"${salary_min:,} - ${salary_max:,}"
            elif salary_min:
                salary = f"${salary_min:,}+"

            jobs.append(JobListing(
                external_id=f"remoteok-{item.get('id', position[:30])}",
                title=position,
                company=company,
                location=location,
                apply_url=apply_url,
                description=_clean_html(description)[:500],
                posted_date=posted_date,
                source_platform="RemoteOK",
                skills=tags[:10],
                employment_type="Full-time",
                salary=salary,
            ))

            if len(jobs) >= params.limit:
                break

    except Exception as e:
        logger.warning(f"RemoteOK fetch failed: {e}")

    return jobs[:params.limit]


async def _fetch_adzuna(params: JobSearchParams, app_id: str, app_key: str) -> list[JobListing]:
    """Fetch jobs from Adzuna API (requires free API key)."""
    jobs: list[JobListing] = []
    try:
        # Default to India market
        country = "in"
        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
        query_params = {
            "app_id": app_id,
            "app_key": app_key,
            "results_per_page": min(params.limit, 50),
            "what": params.keywords or "software engineer",
            "content-type": "application/json",
        }
        if params.location:
            query_params["where"] = params.location

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=query_params)
            resp.raise_for_status()
            data = resp.json()

        for item in data.get("results", []):
            title = item.get("title", "")
            company = item.get("company", {}).get("display_name", "Unknown")
            location = item.get("location", {}).get("display_name", "Remote")
            apply_url = item.get("redirect_url", "")
            description = item.get("description", "")

            if not apply_url:
                continue

            posted_date = None
            created = item.get("created")
            if created:
                try:
                    posted_date = datetime.fromisoformat(created.replace("Z", "+00:00"))
                except (ValueError, TypeError):
                    pass

            salary = None
            sal_min = item.get("salary_min")
            sal_max = item.get("salary_max")
            if sal_min and sal_max:
                salary = f"${int(sal_min):,} - ${int(sal_max):,}"

            # Extract category as skill
            category = item.get("category", {}).get("label", "")

            jobs.append(JobListing(
                external_id=f"adzuna-{item.get('id', title[:30])}",
                title=_clean_html(title),
                company=company,
                location=location,
                apply_url=apply_url,
                description=_clean_html(description)[:500],
                posted_date=posted_date,
                source_platform="Adzuna",
                skills=[category] if category else [],
                salary=salary,
            ))

    except Exception as e:
        logger.warning(f"Adzuna fetch failed: {e}")

    return jobs[:params.limit]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clean_html(text: str) -> str:
    """Strip HTML tags from text."""
    import re
    return re.sub(r"<[^>]+>", " ", text).strip()


async def _check_link_health(url: str) -> str:
    """Check if a URL is reachable via HEAD request."""
    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            resp = await client.head(url)
            if resp.status_code in (404, 410, 403):
                return "dead"
            return "ok"
    except Exception:
        return "unchecked"


def _filter_fresh_listings(
    listings: list[JobListing],
    max_age_days: int = 30,
) -> list[JobListing]:
    """Remove listings older than max_age_days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    fresh = []
    for listing in listings:
        if listing.posted_date and listing.posted_date < cutoff:
            continue  # Skip stale listings
        fresh.append(listing)
    return fresh


def _deduplicate_listings(listings: list[JobListing]) -> list[JobListing]:
    """Deduplicate listings by title + company combination."""
    seen: set[str] = set()
    unique: list[JobListing] = []
    for listing in listings:
        key = f"{listing.title.lower().strip()}|{listing.company.lower().strip()}"
        if key not in seen:
            seen.add(key)
            unique.append(listing)
    return unique


# ---------------------------------------------------------------------------
# Main Service
# ---------------------------------------------------------------------------

class JobSourcingService:
    """
    Aggregate job listings from multiple free APIs.

    Usage:
        service = JobSourcingService()
        results = await service.search(JobSearchParams(keywords="python", remote_only=True))
    """

    def __init__(
        self,
        adzuna_app_id: str = "",
        adzuna_app_key: str = "",
    ) -> None:
        self._adzuna_app_id = adzuna_app_id
        self._adzuna_app_key = adzuna_app_key

    async def search(
        self,
        params: JobSearchParams,
        check_links: bool = False,
    ) -> list[JobListing]:
        """
        Search for jobs across all configured APIs.

        Args:
            params: Search parameters (keywords, location, etc.)
            check_links: If True, perform HEAD requests to validate apply URLs

        Returns:
            List of deduplicated, fresh job listings with canonical apply URLs.
        """
        # Launch all API calls concurrently
        tasks = [
            _fetch_arbeitnow(params),
            _fetch_remoteok(params),
        ]

        # Add Adzuna if configured
        if self._adzuna_app_id and self._adzuna_app_key:
            tasks.append(_fetch_adzuna(params, self._adzuna_app_id, self._adzuna_app_key))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Merge all results
        all_listings: list[JobListing] = []
        for result in results:
            if isinstance(result, list):
                all_listings.extend(result)
            elif isinstance(result, Exception):
                logger.warning(f"Job source failed: {result}")

        # Apply freshness filter
        fresh = _filter_fresh_listings(all_listings, max_age_days=30)

        # Deduplicate
        unique = _deduplicate_listings(fresh)

        # Optional link health check (slow — only do on explicit request)
        if check_links and unique:
            health_tasks = [_check_link_health(j.apply_url) for j in unique[:10]]  # Limit to 10
            statuses = await asyncio.gather(*health_tasks, return_exceptions=True)
            for i, status in enumerate(statuses):
                if isinstance(status, str):
                    unique[i].link_status = status

        # Sort by posted date (newest first)
        unique.sort(key=lambda j: j.posted_date or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

        return unique[:params.limit]
