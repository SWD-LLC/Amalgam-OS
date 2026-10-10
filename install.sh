#!/usr/bin/env bash
# Amalgam Codex cloud-environment setup (2026-10-10)
# Project: Sierra N. Warren / Sierra Warren Developments, LLC
set -Eeuo pipefail

EXPECTED_REPO='swd-dev00/Amalgam_OS'
RECOVERY_BRANCH='recovery/amalgam-platform-2026-10-10'
PUBLIC_REGISTRY='https://registry.npmjs.org/'

say() { printf '[amalgam-setup] %s\n' "$*"; }
warn() { printf '[amalgam-setup] WARNING: %s\n' "$*" >&2; }
fail() { printf '[amalgam-setup] ERROR: %s\n' "$*" >&2; exit 1; }

# Codex may check out the repository under any directory name. Validate its
# Git origin, not its basename. Never silently operate on the old export repo.
if [[ -n "${AMALGAM_REPO_DIR:-}" ]]; then
  ROOT="$(cd "$AMALGAM_REPO_DIR" && pwd -P)" || fail 'Invalid AMALGAM_REPO_DIR'
elif ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  :
elif [[ -d /workspace/Amalgam_OS/.git ]]; then
  ROOT='/workspace/Amalgam_OS'
elif [[ -d /workspace/Amalgam-OS/.git ]]; then
  ROOT='/workspace/Amalgam-OS'
else
  fail 'No Git checkout found. Select swd-dev00/Amalgam_OS as the Codex environment repository.'
fi
[[ -e "$ROOT/.git" ]] || fail "Not a Git checkout: $ROOT"
ORIGIN="$(git -C "$ROOT" remote get-url origin 2>/dev/null || true)"
case "$ORIGIN" in
  https://github.com/swd-dev00/Amalgam_OS|https://github.com/swd-dev00/Amalgam_OS.git|git@github.com:swd-dev00/Amalgam_OS|git@github.com:swd-dev00/Amalgam_OS.git|ssh://git@github.com/swd-dev00/Amalgam_OS|ssh://git@github.com/swd-dev00/Amalgam_OS.git)
    ;;
  *) fail "Wrong repository origin: ${ORIGIN:-missing}. Set the Codex environment to https://github.com/$EXPECTED_REPO; do not run against the older hyphenated export." ;;
esac

BRANCH="$(git -C "$ROOT" branch --show-current || true)"
HEAD="$(git -C "$ROOT" rev-parse --short HEAD)"
say "Verified $EXPECTED_REPO at $ROOT (branch: ${BRANCH:-detached}, commit: $HEAD)."
[[ -f "$ROOT/package.json" && -d "$ROOT/src" ]] || fail 'Creator OS React source is not present in this checkout.'
if [[ ! -f "$ROOT/platform/package-lock.json" || ! -f "$ROOT/platform/package.json" ]]; then
  fail "The recovered Platform is missing. Configure Codex to check out the $RECOVERY_BRANCH branch; current branch: ${BRANCH:-detached}."
fi

# Keep runtime fixtures and installation logs OUTSIDE the Git working tree.
RUNTIME="${AMALGAM_RUNTIME_DIR:-$(dirname "$ROOT")/.amalgam-runtime}"
mkdir -p "$RUNTIME"
say "Runtime/QA artifacts: $RUNTIME"

# The old 13-page compiled export is OPTIONAL. The transferred repository does
# not contain its ZIP by default. Do not fail source setup or fetch the old repo.
ZIP=''
for path in \
  "$ROOT/legacy/creator-os/amalgam_creator_os_site 2.zip" \
  "$ROOT/amalgam_creator_os_site 2.zip"; do
  if [[ -f "$path" ]]; then ZIP="$path"; break; fi
done
if [[ -n "${AMALGAM_LEGACY_ZIP:-}" ]]; then
  [[ -f "$AMALGAM_LEGACY_ZIP" ]] || fail "AMALGAM_LEGACY_ZIP was set but does not exist: $AMALGAM_LEGACY_ZIP"
  ZIP="$AMALGAM_LEGACY_ZIP"
fi
if [[ -n "$ZIP" ]]; then
  export AMALGAM_LEGACY_ZIP="$ZIP" AMALGAM_RUNTIME_DIR="$RUNTIME"
  python3 - <<'PY'
import os, shutil, stat, tempfile
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

archive = Path(os.environ['AMALGAM_LEGACY_ZIP'])
parent = Path(os.environ['AMALGAM_RUNTIME_DIR']).resolve()
site = parent / 'creator-os-site'
with tempfile.TemporaryDirectory(prefix='amalgam-qa-', dir=parent) as temp:
    staging = Path(temp) / 'site'
    staging.mkdir()
    with ZipFile(archive) as z:
        if z.testzip() is not None:
            raise RuntimeError('Compiled site archive failed CRC validation')
        for entry in z.infolist():
            filename = entry.filename
            p = PurePosixPath(filename)
            if not filename or p.is_absolute() or '..' in p.parts or '\\' in filename or ':' in filename:
                raise RuntimeError(f'Unsafe ZIP entry: {filename!r}')
            if stat.S_IFMT(entry.external_attr >> 16) == stat.S_IFLNK:
                raise RuntimeError(f'ZIP symlinks not permitted: {filename!r}')
            target = (staging / filename).resolve()
            if not target.is_relative_to(staging.resolve()):
                raise RuntimeError(f'Escaping ZIP entry: {filename!r}')
        z.extractall(staging)
    if not (staging / 'index.html').is_file() or not (staging / 'assets').is_dir():
        raise RuntimeError('Compiled site is missing index.html or assets/')
    # Only replace the dedicated runtime fixture after complete validation.
    if site.exists():
        shutil.rmtree(site)
    shutil.move(str(staging), str(site))
print(f'[amalgam-setup] Legacy export validated: {site}')
PY
else
  say 'Compiled Creator OS ZIP not present; skipping optional export QA fixture.'
fi

command -v node >/dev/null 2>&1 || fail 'Node.js is required for the Platform and Creator OS source.'
command -v npm >/dev/null 2>&1 || fail 'npm is required for source development.'
say "Node $(node --version), npm $(npm --version)"

# Do not configure paid services, tokens or private registries. The recovered
# Platform has a public-registry package-lock. A transient npm failure should
# be recorded, not misreported as successful or prevent Codex from editing.
if [[ "${AMALGAM_SKIP_NPM:-0}" == '1' ]]; then
  say 'AMALGAM_SKIP_NPM=1: dependency installation intentionally skipped.'
else
  limit="${AMALGAM_NPM_TIMEOUT_SECONDS:-240}"
  say "Installing recovered Platform dependencies from $PUBLIC_REGISTRY (timeout ${limit}s)."
  install=(npm ci --prefix "$ROOT/platform" --registry "$PUBLIC_REGISTRY" --no-audit --no-fund)
  if command -v timeout >/dev/null 2>&1; then
    install=(timeout "${limit}s" "${install[@]}")
  fi
  if "${install[@]}" >"$RUNTIME/platform-npm-install.log" 2>&1; then
    say 'Platform dependency installation: PASS.'
    printf 'PASS\n' >"$RUNTIME/platform-npm-status"
  else
    status=$?
    printf 'BLOCKED (exit=%s)\n' "$status" >"$RUNTIME/platform-npm-status"
    warn "Platform dependency installation blocked (exit $status). Inspect $RUNTIME/platform-npm-install.log. Backend tests and source work can continue."
    tail -n 12 "$RUNTIME/platform-npm-install.log" >&2 || true
  fi
fi

# The root Creator OS has no committed package-lock. Installing it is opt-in
# and must not modify the user's tracked source or invent a passing build.
if [[ "${AMALGAM_INSTALL_CREATOR:-0}" == '1' ]]; then
  say 'Installing original Creator OS dependencies (opt-in, no lockfile write).'
  creator_install=(npm install --prefix "$ROOT" --package-lock=false --registry "$PUBLIC_REGISTRY" --no-audit --no-fund)
  if command -v timeout >/dev/null 2>&1; then
    creator_install=(timeout "${AMALGAM_NPM_TIMEOUT_SECONDS:-240}s" "${creator_install[@]}")
  fi
  if "${creator_install[@]}" >"$RUNTIME/creator-npm-install.log" 2>&1; then
    say 'Creator OS dependency installation: PASS.'
  else
    status=$?
    warn "Creator OS install BLOCKED (exit $status). See $RUNTIME/creator-npm-install.log."
  fi
else
  say 'Original Creator OS dependency install skipped (no committed lockfile). Set AMALGAM_INSTALL_CREATOR=1 to try it.'
fi

say 'Environment setup complete. Run Platform backend/WHIP tests, typecheck and build independently; no streaming or external account actions were started.'
