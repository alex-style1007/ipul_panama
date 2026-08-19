"""
Fetch the latest 5 video IDs from @IPULPANAMA YouTube channel
and update predicas.html + en/sermons.html with the new embeds.

No API key required — scrapes the public channel page.
"""

import re
import sys
import urllib.request

CHANNEL_URL = "https://www.youtube.com/@IPULPANAMA/videos"
FILES_TO_UPDATE = ["predicas.html", "en/sermons.html"]
NUM_VIDEOS = 5


def fetch_latest_video_ids(count: int = 5) -> list[str]:
    """Scrape the channel page for video IDs."""
    req = urllib.request.Request(
        CHANNEL_URL,
        headers={"User-Agent": "Mozilla/5.0 (compatible; IPULBot/1.0)"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"ERROR: Failed to fetch channel page: {e}")
        sys.exit(1)

    # Extract video IDs from page source
    raw_ids = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)

    # Deduplicate preserving order
    seen = set()
    unique_ids = []
    for vid in raw_ids:
        if vid not in seen:
            seen.add(vid)
            unique_ids.append(vid)
        if len(unique_ids) >= count:
            break

    if len(unique_ids) < count:
        print(f"WARNING: Only found {len(unique_ids)} videos (expected {count})")

    return unique_ids


def extract_current_ids(filepath: str) -> list[str]:
    """Extract current embedded video IDs from an HTML file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Match youtube.com/embed/VIDEO_ID patterns
    ids = re.findall(r"youtube\.com/embed/([a-zA-Z0-9_-]{11})", content)

    # Deduplicate preserving order
    seen = set()
    unique = []
    for vid in ids:
        if vid not in seen:
            seen.add(vid)
            unique.append(vid)

    return unique


def replace_video_ids(filepath: str, old_ids: list[str], new_ids: list[str]) -> bool:
    """Replace old video IDs with new ones in the file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    for i, old_id in enumerate(old_ids):
        if i < len(new_ids) and old_id != new_ids[i]:
            content = content.replace(old_id, new_ids[i])

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    print("Fetching latest videos from @IPULPANAMA...")
    new_ids = fetch_latest_video_ids(NUM_VIDEOS)

    if not new_ids:
        print("ERROR: No videos found. Aborting.")
        sys.exit(1)

    print(f"Latest {len(new_ids)} videos: {new_ids}")

    any_changed = False
    for filepath in FILES_TO_UPDATE:
        current_ids = extract_current_ids(filepath)
        print(f"\n{filepath}:")
        print(f"  Current: {current_ids}")
        print(f"  New:     {new_ids}")

        if current_ids == new_ids[: len(current_ids)]:
            print("  → Already up to date")
            continue

        changed = replace_video_ids(filepath, current_ids, new_ids)
        if changed:
            print("  → Updated!")
            any_changed = True
        else:
            print("  → No changes needed")

    if any_changed:
        print("\n✓ Videos updated successfully")
    else:
        print("\n✓ All videos already up to date — no changes")


if __name__ == "__main__":
    main()
