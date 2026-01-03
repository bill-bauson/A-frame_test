#
# Script that looks at the list of photos and converts them into URL's that can be emailed to the user
#
#!/bin/bash
cd "$1" || { echo "Error: Folder not found"; exit 1; }
PREFIX="$2"
SUFFIX="$3"

TMPFILE="$(mktemp)"

# Collect: mtime<TAB>original<TAB>display_name
while IFS= read -r -d '' file; do
  base="$(basename "$file")"

  # Split into name + ext at last dot
  if [[ "$base" == *.* ]]; then
    name="${base%.*}"
    ext="${base##*.}"
  else
    name="$base"
    ext=""
  fi

  # Build logical "new" name for the list ONLY
  if [[ -n "$ext" ]]; then
    newfile="${PREFIX}${name}.${ext}${SUFFIX}"
  else
    newfile="${PREFIX}${name}${SUFFIX}"
  fi

  # Encode spaces as %20 for link friendliness
  newfile_escaped="${newfile// /%20}"

  # Get mtime
  mtime=$(stat -c %Y "$file" 2>/dev/null || echo 0)

  # Store in temp file; use tabs as separators
  printf '%s\t%s\t%s\n' "$mtime" "$base" "$newfile_escaped" >> "$TMPFILE"
done < <(find . -maxdepth 1 -type f -print0)

# Sort by base (original filename) and print "orig -> new"
LIST=""
sort -r -k2,2 "$TMPFILE" | while IFS=$'\t' read -r mtime base newfile_escaped; do

# List the links with a ||| marker between them because Home Assistant ignores newline characters.
# Let Home Assistant replace the marker with <br>
#  printf '%s -> %s|||' "$base" "$newfile_escaped"
  printf '%s|||' "$newfile_escaped"
done

rm -f "$TMPFILE"

echo -e "$LIST"
