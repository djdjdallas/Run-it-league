#!/usr/bin/env python3
"""One-off backfill: derive final scores from saved player stats.

For every game where BOTH teams have nonzero player_stats point totals,
sets games.home_score/away_score from those totals and marks the game
'final', then recalculates every affected team's wins/losses.

Games with stats for only one team (or a zero total) are skipped and
listed so they can be completed in the admin panel.

Run from the repo root:  python3 scripts/backfill-scores.py
Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local.
"""
import json
import pathlib
import sys
import urllib.request

env_path = pathlib.Path(__file__).resolve().parent.parent / ".env.local"
env = {}
for line in env_path.read_text().splitlines():
    if "=" in line and not line.lstrip().startswith("#"):
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip()

URL = env.get("NEXT_PUBLIC_SUPABASE_URL")
KEY = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not URL or not KEY:
    sys.exit("Could not read Supabase URL/key from .env.local")


def req(method, path, body=None, prefer=None):
    r = urllib.request.Request(
        f"{URL}/rest/v1/{path}",
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={
            "apikey": KEY,
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            **({"Prefer": prefer} if prefer else {}),
        },
    )
    with urllib.request.urlopen(r) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw else None


games = req("GET", "games?select=id,home_team_id,away_team_id,status,home_score,away_score")
stats = req("GET", "player_stats?select=game_id,team_id,points")
teams = req("GET", "teams?select=id,name")
names = {t["id"]: t["name"] for t in teams}

totals = {}
for s in stats:
    totals.setdefault(s["game_id"], {}).setdefault(s["team_id"], 0)
    totals[s["game_id"]][s["team_id"]] += s["points"] or 0

finalized, skipped = [], []
for g in games:
    t = totals.get(g["id"])
    if not t:
        continue
    home = t.get(g["home_team_id"])
    away = t.get(g["away_team_id"])
    matchup = f"{names.get(g['home_team_id'], '?')} vs {names.get(g['away_team_id'], '?')}"
    # only finalize when both teams have stats and neither total is zero
    if home is None or away is None or home == 0 or away == 0:
        skipped.append((matchup, home, away))
        continue
    out = req(
        "PATCH",
        f"games?id=eq.{g['id']}",
        {"home_score": home, "away_score": away, "status": "final"},
        prefer="return=representation",
    )
    ok = out and out[0]["status"] == "final"
    finalized.append((matchup, home, away, "ok" if ok else "WRITE FAILED (check RLS)"))

# Recalculate team records from all final games
final_games = req("GET", "games?select=home_team_id,away_team_id,home_score,away_score&status=eq.final")
records = {}
for g in final_games:
    if g["home_score"] is None or g["away_score"] is None or g["home_score"] == g["away_score"]:
        continue
    home_won = g["home_score"] > g["away_score"]
    for tid, won in ((g["home_team_id"], home_won), (g["away_team_id"], not home_won)):
        records.setdefault(tid, [0, 0])
        records[tid][0 if won else 1] += 1

for tid, (w, l) in records.items():
    req("PATCH", f"teams?id=eq.{tid}", {"wins": w, "losses": l}, prefer="return=representation")

print("FINALIZED GAMES:")
for matchup, h, a, status in finalized:
    print(f"  {matchup}: {h}-{a} [{status}]")
print("\nSKIPPED (incomplete or zero stats — finish these in admin):")
for matchup, h, a in skipped:
    print(f"  {matchup}: home_total={h} away_total={a}")
print("\nTEAM RECORDS NOW:")
for tid, (w, l) in sorted(records.items(), key=lambda x: -x[1][0]):
    print(f"  {names.get(tid, tid)}: {w}-{l}")
