#!/usr/bin/env bash
# Backend smoke test for the deployed DarElKhair API.
#
#   ./scripts/smoke-api.sh https://your-api.up.railway.app
#
# Read-only by default (safe against production). To also exercise the
# booking + payment write path (creates one booking, then cancels it):
#   SMOKE_WRITE=1 ./scripts/smoke-api.sh https://your-api.up.railway.app
#
# Assumes the DB has been seeded (admin@darelkhair.xyz / Admin12345,
# user@darelkhair.xyz / User12345). See README/deploy notes for seeding.

set -uo pipefail

API="${1:-${API_URL:-}}"
if [ -z "$API" ]; then
  echo "usage: $0 <api-base-url>   e.g. https://your-api.up.railway.app"
  exit 1
fi
API="${API%/}" # strip trailing slash
COOKIES="$(mktemp)"
pass=0; fail=0

# Extract a value from JSON on stdin, e.g.  jget '.data.accessToken'
jget() {
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const o=JSON.parse(s);const v=eval("o"+process.argv[1]);console.log(v==null?"":v)}catch{console.log("")}})' "$1"
}
ok()   { echo "  ✓ $1"; pass=$((pass+1)); }
bad()  { echo "  ✗ $1"; fail=$((fail+1)); }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
expect_code() { # label expected url [curl args...]
  local label="$1" exp="$2"; shift 2
  local got; got=$(code "$@")
  [ "$got" = "$exp" ] && ok "$label ($got)" || bad "$label (expected $exp, got $got)"
}

echo "── DarElKhair API smoke test ──"
echo "Target: $API"
echo

echo "[1] Liveness"
expect_code "GET /api/health = 200" 200 "$API/api/health"

echo "[2] Auth"
login=$(curl -s -c "$COOKIES" -X POST "$API/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@darelkhair.xyz","password":"Admin12345"}')
ATOK=$(echo "$login" | jget '.data.accessToken')
if [ -n "$ATOK" ]; then ok "admin login"; else bad "admin login — is the DB seeded? response: $login"; fi
expect_code "GET /api/auth/me with token = 200" 200 "$API/api/auth/me" -H "Authorization: Bearer $ATOK"
expect_code "GET /api/auth/me without token = 401" 401 "$API/api/auth/me"
refresh=$(curl -s -b "$COOKIES" -X POST "$API/api/auth/refresh")
[ -n "$(echo "$refresh" | jget '.data.accessToken')" ] && ok "refresh via httpOnly cookie" || bad "refresh failed: $refresh"

echo "[3] RBAC"
ulogin=$(curl -s -X POST "$API/api/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"user@darelkhair.xyz","password":"User12345"}')
UTOK=$(echo "$ulogin" | jget '.data.accessToken')
[ -n "$UTOK" ] && ok "user login" || bad "user login: $ulogin"
expect_code "user -> GET /api/users (admin-only) = 403" 403 "$API/api/users" -H "Authorization: Bearer $UTOK"

echo "[4] Public data"
apts=$(curl -s "$API/api/apartments?pageSize=3")
total=$(echo "$apts" | jget '.data.total')
APT=$(echo "$apts" | jget '.data.items[0].id')
echo "  • published apartments: ${total:-0}"
[ -n "$APT" ] && ok "apartments list returns items" || bad "no apartments (seed the DB?)"
expect_code "GET /api/payments/instructions (public) = 200" 200 "$API/api/payments/instructions"

if [ "${SMOKE_WRITE:-0}" = "1" ] && [ -n "$APT" ]; then
  echo "[5] Booking + payment write path"
  bk=$(curl -s -X POST "$API/api/bookings" -H "Authorization: Bearer $UTOK" \
    -H 'Content-Type: application/json' \
    -d "{\"apartmentId\":\"$APT\",\"checkIn\":\"2030-12-01\",\"checkOut\":\"2030-12-03\",\"guests\":1}")
  BID=$(echo "$bk" | jget '.data.id'); BSTAT=$(echo "$bk" | jget '.data.status')
  [ -n "$BID" ] && ok "create booking (status=$BSTAT)" || bad "create booking: $bk"
  if [ -n "$BID" ]; then
    pay=$(curl -s -X POST "$API/api/bookings/$BID/payment" -H "Authorization: Bearer $UTOK" -F method=CASH)
    [ "$(echo "$pay" | jget '.data.status')" = "SUBMITTED" ] && ok "submit cash payment" || bad "submit payment: $pay"
    curl -s -X PATCH "$API/api/bookings/$BID/cancel" -H "Authorization: Bearer $UTOK" >/dev/null && echo "  • test booking cancelled (cleanup)"
  fi
else
  echo "[5] Booking/payment write path skipped (set SMOKE_WRITE=1 to run)"
fi

rm -f "$COOKIES"
echo
echo "── Result: PASS=$pass FAIL=$fail ──"
[ "$fail" = "0" ]
