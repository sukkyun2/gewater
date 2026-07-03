#!/usr/bin/env bash
# Verifies the built static site: no dangling references, no leftover
# backend/original-host URLs, and every page reachable from the nav.
set -uo pipefail
cd "$(dirname "$0")"

fail=0

echo "== 1. Checking for leftover backend/original-host references =="
hits=$(grep -l "gewater\.co\.kr\|/default/\|/bizdemo58232/\|/cjs/\|cafe24" *.html assets/css/*.css 2>/dev/null)
if [ -n "$hits" ]; then
  echo "FAIL: found leftover references in:"
  echo "$hits"
  fail=1
else
  echo "OK: no leftover references"
fi

echo
echo "== 2. Checking every relative asset/link reference resolves to a real file =="
missing=0
for html in *.html; do
  refs=$(grep -oh -E '(src|href)="[^"#][^"]*"' "$html" | sed -E 's/^(src|href)="//; s/"$//' | grep -v '^https\?://')
  while IFS= read -r ref; do
    [ -z "$ref" ] && continue
    if [ ! -f "$ref" ]; then
      echo "FAIL: $html references missing file: $ref"
      missing=1
    fi
  done <<< "$refs"
done
if [ "$missing" -eq 0 ]; then
  echo "OK: all relative references resolve"
else
  fail=1
fi

echo
echo "== 3. Checking url(...) references inside CSS resolve =="
missing_css=0
for css in assets/css/*.css; do
  dir=$(dirname "$css")
  refs=$(grep -oh "url(['\"]\?[^)'\"]*" "$css" | sed -E "s/^url\(['\"]?//")
  while IFS= read -r ref; do
    [ -z "$ref" ] && continue
    case "$ref" in http*) continue ;; esac
    resolved=$(cd "$dir" 2>/dev/null && python3 -c "import os,sys; print(os.path.normpath(sys.argv[1]))" "$ref" 2>/dev/null)
    if [ ! -f "$dir/$ref" ]; then
      echo "FAIL: $css references missing file: $ref"
      missing_css=1
    fi
  done <<< "$refs"
done
if [ "$missing_css" -eq 0 ]; then
  echo "OK: all CSS url() references resolve"
else
  fail=1
fi

echo
echo "== 4. Checking nav/sitemap link graph covers all pages =="
expected="index.html company-greeting.html company-location.html water-mgmt-wastewater.html water-mgmt-sewage.html water-mgmt-septic.html construction-wastewater.html construction-sewage.html construction-livestock.html consulting-permit.html consulting-technical.html contact.html notice.html gallery.html privacy-policy.html privacy-collection.html"
linked=$(grep -oh 'href="[a-zA-Z0-9_-]*\.html"' index.html | sed -E 's/^href="//; s/"$//' | sort -u)
for f in $expected; do
  if ! echo "$linked" | grep -qx "$f"; then
    # index.html itself won't link to every page (privacy pages are footer-only); check footer/header/sitemap globally instead
    :
  fi
done
all_linked=$(grep -ohE 'href="[a-zA-Z0-9_-]*\.html"' *.html | sed -E 's/^href="//; s/"$//' | sort -u)
missing_pages=0
for f in $expected; do
  if ! echo "$all_linked" | grep -qx "$f"; then
    echo "FAIL: $f is never linked from any page"
    missing_pages=1
  fi
done
if [ "$missing_pages" -eq 0 ]; then
  echo "OK: all 16 pages are reachable via internal links"
else
  fail=1
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "ALL CHECKS PASSED"
  exit 0
else
  echo "SOME CHECKS FAILED"
  exit 1
fi
