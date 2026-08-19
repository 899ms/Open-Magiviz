import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST: Generate plot for a single new scene based on context
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      storyTitle,
      summary,
      existingScenes,
      newSceneIndex,
      aspectRatio = '16:9',
      targetDuration = 5,
    } = body

    if (!existingScenes || !Array.isArray(existingScenes) || existingScenes.length === 0) {
      return NextResponse.json({ 
        error: 'Missing existing scenes context. Please provide at least one existing scene.' 
      }, { status: 400 })
    }

    const apiKey = process.env.ZENMUX_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ZenMux API key not configured (ZENMUX_API_KEY)' }, { status: 500 })
    }

    const model = 'google/gemini-3-flash-preview'
    
    // Build context information
    const previousScene = existingScenes[newSceneIndex - 1] || null
    const nextScene = existingScenes[newSceneIndex] || null
    
    // Get aspect ratio from previous scene, or use provided parameter, or default to 16:9
    const aspectRatioValue = previousScene?.aspectRatio || aspectRatio || '16:9'
    
    // Build scene history
    let sceneHistory = ''
    if (previousScene) {
      sceneHistory += `Previous scene: ${previousScene.title} - ${previousScene.plot || previousScene.description || 'No description'}\n`
    }
    if (nextScene) {
      sceneHistory += `Next scene: ${nextScene.title} - ${nextScene.plot || nextScene.description || 'No description'}\n`
    }

    const prompt = `You are a creative story assistant. Based on the existing story context, generate a detailed plot description for a new scene.

Story title: ${storyTitle || 'Untitled'}
Story summary: ${summary || 'No summary'}
Target scene index: ${newSceneIndex + 1}

${sceneHistory}
Existing scenes count: ${existingScenes.length}

Requirements:
1. The new scene must maintain logical coherence with the previous and next scenes
2. If there is a previous scene, it should naturally transition from it
3. If there is a next scene, it should set up for the following scene
4. Duration: ${targetDuration} seconds
5. Aspect ratio: ${aspectRatioValue}

Return the detailed scene information in JSON format as follows:
{
  "title": "Scene title",
  "description": "Detailed scene description (what happens, camera moves, mood, etc.)",
  "duration": ${targetDuration},
  "aspectRatio": "${aspectRatioValue}",
  "storyboardPrompt": "Prompt for generating storyboard image (concise, one to two sentences, include camera, composition, lighting, mood, style)",
  "sceneVideoPrompt": "Prompt for generating scene video (describe motion, camera movement, timing, transition effects)",
  "visualElements": ["important visual element 1", "element 2"],
  "narration": "If there is dialogue or narration, write it here",
  "transition": "How this scene transitions to the next scene (e.g., cut, fade, dissolve)",
  "characterIds": [],
  "storyboardCharacterImages": []
}

Important: Return only JSON, no explanatory text. Ensure valid JSON format.`

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a creative story assistant. Always respond with valid JSON only. If you cannot generate JSON, return an object with an "error" field.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 4096,
      temperature: 0.7,
    }

    const response = await fetch('https://zenmux.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[generate-scene-plot] ZenMux API error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to generate scene plot from AI service',
        details: errorText
      }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ 
        error: 'Invalid response from AI service' 
      }, { status: 500 })
    }

    // Parse JSON response
    let parsedContent
    try {
      // Try to extract JSON (handle possible markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0])
      } else {
        parsedContent = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('[generate-scene-plot] JSON parse error:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse AI response as JSON',
        rawResponse: content
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: parsedContent
    })

  } catch (error) {
    console.error('[generate-scene-plot] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
