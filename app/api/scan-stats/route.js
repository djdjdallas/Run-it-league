import { NextResponse } from "next/server"

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

    const prompt = `Analyze this basketball stat sheet image and extract all player statistics.

Return a JSON object with this exact structure:
{
  "home_team": {
    "name": "Team Name",
    "players": [
      {
        "name": "Player Name",
        "number": 23,
        "minutes": 32,
        "points": 18,
        "rebounds": 7,
        "assists": 4,
        "steals": 2,
        "blocks": 1,
        "turnovers": 3,
        "fouls": 2,
        "fg_made": 7,
        "fg_attempted": 14,
        "three_made": 2,
        "three_attempted": 5,
        "ft_made": 2,
        "ft_attempted": 2
      }
    ],
    "total_score": 85
  },
  "away_team": {
    "name": "Team Name",
    "players": [
      {
        "name": "Player Name",
        "number": 10,
        "minutes": 28,
        "points": 15,
        "rebounds": 5,
        "assists": 3,
        "steals": 1,
        "blocks": 0,
        "turnovers": 2,
        "fouls": 3,
        "fg_made": 6,
        "fg_attempted": 12,
        "three_made": 1,
        "three_attempted": 4,
        "ft_made": 2,
        "ft_attempted": 3
      }
    ],
    "total_score": 78
  }
}

Important instructions:
- If any stat is illegible, use null for that value
- If you can't determine a player's number, use null
- Extract what you can read clearly
- Include all players visible on the stat sheet
- If the sheet only shows one team, include that team's data and set the other team to null
- Make sure to calculate totals correctly if shown
- For shooting stats (FG, 3PT, FT), look for formats like "7-14" meaning 7 made out of 14 attempted

Return ONLY the JSON object, no additional text or explanation.`

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
        messages: [
          {
            role: "user",
            content: [
              {
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

      const stats = JSON.parse(jsonMatch[0])
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
