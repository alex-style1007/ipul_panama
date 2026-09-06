#!/usr/bin/env python3
"""Add security headers to all HTML files in the IPUL Panama website."""

import os
import re
from pathlib import Path

SECURITY_HEADERS = '''    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="geolocation=(self), microphone=(), camera=()">
    '''

def add_security_headers(file_path: Path) -> bool:
    """Add security headers to an HTML file if not already present."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if security headers already exist
        if 'X-Content-Type-Options' in content:
            print(f"⏭️  Skipping {file_path.relative_to(Path.cwd())} (already has security headers)")
            return False
        
        # Find viewport meta tag and add security headers after it
        viewport_pattern = r'(<meta name="viewport"[^>]*>)'
        if re.search(viewport_pattern, content):
            # Add security headers after viewport
            new_content = re.sub(
                viewport_pattern,
                r'\1\n' + SECURITY_HEADERS,
                content,
                count=1
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ Added security headers to: {file_path.relative_to(Path.cwd())}")
            return True
        else:
            print(f"⚠️  Warning: No viewport meta tag found in {file_path.relative_to(Path.cwd())}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Process all HTML files in the project."""
    base_path = Path('/Users/lla/dev/personal/ipul_panama')
    html_files = base_path.rglob('*.html')
    
    # Exclude hidden directories
    html_files = [f for f in html_files if not any(part.startswith('.') for part in f.parts)]
    
    total = 0
    updated = 0
    
    for html_file in html_files:
        total += 1
        if add_security_headers(html_file):
            updated += 1
    
    print(f"\n🔒 Security headers processing complete!")
    print(f"   Total files: {total}")
    print(f"   Updated: {updated}")
    print(f"   Skipped: {total - updated}")

if __name__ == '__main__':
    main()
