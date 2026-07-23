import { NextResponse } from "next/server"

const STAT_FIELDS = [
  "minutes",
  "points",
  "rebounds",
  "assists",
  "steals",
  "blocks",
  "turnovers",
  "fouls",
  "fg_made",
  "fg_attempted",
  "three_made",
  "three_attempted",
  "ft_made",
  "ft_attempted",
]

// A stat is only usable if it's a verifiable non-negative count.
function toCount(value) {
  const n =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}

function sanitizePlayer(raw) {
  if (!raw || typeof raw !== "object") return null
  const name =
    typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : null
  const number = toCount(raw.number)
  // No name and no number — nothing to verify the row against a roster.
  if (!name && number == null) return null
  const player = { name, number }
  for (const field of STAT_FIELDS) {
    player[field] = toCount(raw[field])
  }
  // Made counts can never exceed attempts; if they do, the read is
  // unverifiable — null both rather than let a bad count through.
  for (const [made, att] of [
    ["fg_made", "fg_attempted"],
    ["three_made", "three_attempted"],
    ["ft_made", "ft_attempted"],
  ]) {
    if (
      player[made] != null &&
      player[att] != null &&
      player[made] > player[att]
    ) {
      player[made] = null
      player[att] = null
    }
  }
  return player
}

function sanitizeTeam(raw) {
  if (!raw || typeof raw !== "object") return null
  return {
    name:
      typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : null,
    players: Array.isArray(raw.players)
      ? raw.players.map(sanitizePlayer).filter(Boolean)
      : [],
    total_score: toCount(raw.total_score),
  }
}

export async function POST(request) {
  try {
    const { image, mediaType } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    const prompt = `You are reading a HoopCoach basketball stat sheet. This sheet tracks ONE TEAM per page. Each row is a player; each stat column has pre-printed numbers (1, 2, 3, ...) that the scorekeeper marks by hand to tally events.

NOTATION (critical — read carefully):
- FG column: a CIRCLE around a pre-printed number = one shot attempt. A SLASH through that number = the shot was MADE (a made shot is also an attempt, so it counts as both).
- 3-PT column: same convention — CIRCLE = 3-point attempt, SLASH = 3-point made.
- Rebounds column: SLASH through a number = one offensive rebound. CIRCLE around a number = one defensive rebound.
- Turnovers, Assists, Steals columns: each marked (circled or slashed) number = one occurrence of that stat.
- Unmarked pre-printed numbers do NOT count — they are just the printed tally template.

WHAT TO EXTRACT per player:
- name: player name written in the "Player" column (string, or null if blank)
- number: jersey number from the "No." column (integer, or null if blank)
- fg_attempted: count of ALL marked (circled OR slashed) numbers in the FG column
- fg_made: count of SLASHED numbers in the FG column
- three_attempted: count of ALL marked numbers in the 3-PT column
- three_made: count of SLASHED numbers in the 3-PT column
- rebounds: (offensive rebounds = count of SLASHED in Rebounds) + (defensive rebounds = count of CIRCLED in Rebounds). Return the sum.
- turnovers: count of marked numbers in the Turnovers column
- assists: count of marked numbers in the Assists column
- steals: count of marked numbers in the Steals column
- points: COMPUTE this as (2 × fg_made) + three_made. The fg_made count already INCLUDES three-pointers per standard basketball convention, so each 3-pt make contributes 2 from FG plus 1 extra from 3-PT. If you have reason to believe the scorekeeper tracked 2-pointers and 3-pointers in separate columns (i.e. FG column only contains 2-pointers), compute (2 × fg_made) + (3 × three_made) instead and note this in a comment.

SUMMARY COLUMNS on the right side (FGM/FGA, 3-PTM/Att, OFF REB, DEF REB, A/TO Ratio):
- These may be filled in by hand as totals (e.g. "7/14" meaning 7 made / 14 attempted).
- IF a handwritten summary number is clearly legible, PREFER it over counting tally marks — it's more reliable.
- IF the summary is blank, fall back to counting tallies as described above.

STATS THIS SHEET DOES NOT TRACK — always return null for these fields:
- minutes, blocks, fouls, ft_made, ft_attempted

TEAM CONTEXT:
- This sheet shows ONE team. Put all extracted players in "home_team.players".
- Set "away_team" to null. The downstream consumer matches players to rosters by name.
- Read the "Opponent" field to fill home_team.name if the team name is written there — otherwise null.
- Sum points across all players to fill total_score (or null if you can't compute it).

OUTPUT — return ONLY this JSON, no prose:
{
  "home_team": {
    "name": "Team Name or null",
    "players": [
      {
        "name": "Player Name",
        "number": 23,
        "minutes": null,
        "points": 18,
        "rebounds": 7,
        "assists": 4,
        "steals": 2,
        "blocks": null,
        "turnovers": 3,
        "fouls": null,
        "fg_made": 7,
        "fg_attempted": 14,
        "three_made": 2,
        "three_attempted": 5,
        "ft_made": null,
        "ft_attempted": null
      }
    ],
    "total_score": 85
  },
  "away_team": null
}

If a specific value is illegible or ambiguous, use null for that field — do not guess. Skip player rows where the Player name AND number are both blank.`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              mediaType === "application/pdf"
                ? {
                    type: "document",
                    source: {
                      type: "base64",
                      media_type: "application/pdf",
                      data: image,
                    },
                  }
                : {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: mediaType || "image/jpeg",
                      data: image,
                    },
                  },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Claude API error:", errorText)
      return NextResponse.json(
        { error: "Failed to process image with AI" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.content[0]?.text

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      )
    }

    // Parse the JSON response
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }

      const parsed = JSON.parse(jsonMatch[0])
      if (!parsed || typeof parsed !== "object") {
        throw new Error("AI response is not a JSON object")
      }

      // Gate the vision output: only verifiable values survive — everything
      // else becomes null so the client can't treat it as a real stat.
      const stats = {
        home_team: sanitizeTeam(parsed.home_team),
        away_team: sanitizeTeam(parsed.away_team),
      }
      return NextResponse.json({ stats })
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content)
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Scan stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
