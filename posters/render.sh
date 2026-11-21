#!/bin/zsh
# Render posters to out/.
#   ./render.sh              -> semua poster (1x + 2x)
#   ./render.sh 07-harga     -> hanya poster yang namanya mengandung "07-harga" (feed + story)
#   ./render.sh pricelist    -> cocokkan sebagian nama juga boleh
cd "$(dirname "$0")"
mkdir -p out
filter=${1:-}
ids=(${(f)"$(npx remotion compositions src/index.ts --quiet 2>/dev/null | tr ' ' '\n' | grep -E -- '-(feed|story)$')"})
[[ -n $filter ]] && ids=(${(M)ids:#*$filter*})
if (( ${#ids} == 0 )); then echo "Tidak ada poster yang cocok dengan '$filter'"; exit 1; fi
for id in $ids; do
  npx remotion still src/index.ts $id out/$id.png --scale=1 >/dev/null && \
  npx remotion still src/index.ts $id out/$id@2x.png --scale=2 >/dev/null && echo "ok  out/$id.png"
done
