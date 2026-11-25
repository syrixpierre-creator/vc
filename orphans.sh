#!/usr/bin/env bash
# QUEEN AKUMA — list (and optionally kill) bot processes that are NOT managed by
# the current manager of their folder: orphans left by an old manager, and
# duplicates (same number running twice).
#
#   bash orphans.sh          -> SHOWS only, kills nothing
#   bash orphans.sh --kill   -> kills exactly what was listed
#
# Only processes whose working directory is /root/vc*/instances/<number> and
# whose command is a bot (index.js). Never touches /opt/bots, folders, sessions,
# pm2 itself, or the bots of the current managers.
set -u
KILL=0; [ "${1:-}" = "--kill" ] && KILL=1

declare -A MGR_PID
for d in /root/vc /root/vc[0-9]*; do
  [ -f "$d/manager.js" ] || continue
  m="$(pgrep -f "node $d/manager.js" | head -1)"
  [ -z "$m" ] && m="$(pgrep -f "$d/manager.js" | head -1)"
  MGR_PID["$d"]="${m:-none}"
done

declare -A SEEN
list=()
printf "%-8s %-8s %-7s %-16s %s\n" PID PARENT RAM_MB NUMBER REASON
for p in $(pgrep -f 'index\.js'); do
  cwd="$(readlink "/proc/$p/cwd" 2>/dev/null)" || continue
  case "$cwd" in /root/vc*/instances/*) ;; *) continue;; esac
  root="${cwd%%/instances/*}"; num="${cwd##*/instances/}"
  ppid="$(ps -o ppid= -p "$p" | tr -d ' ')"
  rss="$(( $(ps -o rss= -p "$p" | tr -d ' ') / 1024 ))"
  reason=""
  if [ "${MGR_PID[$root]:-none}" != "$ppid" ]; then reason="orphan (parent $ppid is not the manager of $root)"
  elif [ -n "${SEEN[$cwd]:-}" ]; then reason="duplicate of pid ${SEEN[$cwd]}"
  fi
  SEEN[$cwd]="${SEEN[$cwd]:-$p}"
  [ -z "$reason" ] && continue
  printf "%-8s %-8s %-7s %-16s %s\n" "$p" "$ppid" "$rss" "$num" "$reason"
  list+=("$p")
done

echo ""
echo "Managers: $(for k in "${!MGR_PID[@]}"; do printf '%s=%s  ' "$k" "${MGR_PID[$k]}"; done)"
echo "Processes to kill: ${#list[@]}"
if [ "$KILL" = 1 ] && [ "${#list[@]}" -gt 0 ]; then
  kill -TERM "${list[@]}" 2>/dev/null; sleep 3
  for p in "${list[@]}"; do kill -0 "$p" 2>/dev/null && kill -KILL "$p" 2>/dev/null; done
  echo "Killed: ${list[*]}"
elif [ "${#list[@]}" -gt 0 ]; then
  echo "Nothing killed. To kill exactly these: bash orphans.sh --kill"
fi
