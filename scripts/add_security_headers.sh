#!/bin/bash
# Add security headers to all HTML files
# Script generated: 2026-09-06

SECURITY_HEADERS='    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="geolocation=(self), microphone=(), camera=()">
    '

# Find all HTML files excluding hidden directories
find /Users/lla/dev/personal/ipul_panama -name "*.html" -not -path "*/.*" | while read -r file; do
    # Check if file already has security headers
    if grep -q "X-Content-Type-Options" "$file"; then
        echo "⏭️  Skipping $file (already has security headers)"
        continue
    fi
    
    # Check if file has <meta name="viewport"
    if grep -q '<meta name="viewport"' "$file"; then
        # Add security headers after viewport meta tag
        sed -i '' '/<meta name="viewport"/a\
    \
'"$SECURITY_HEADERS"'
' "$file"
        echo "✅ Added security headers to: $file"
    else
        echo "⚠️  Warning: No viewport meta tag found in $file"
    fi
done

echo ""
echo "🔒 Security headers applied to all HTML files!"
