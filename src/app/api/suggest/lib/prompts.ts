export function generateSubstantivePrompt(
  recentInput: string,
  olderContext: string,
  detectedLanguage: string,
  translationLanguage: string | null = null,
  needsTranslation: boolean = false,
  number: number,
  context: string = "",
  detailLevel: string = "brief"
): string {
  // Set sentence length and detail level parameters
  let sentenceRange = "";
  let contentRequirement = "";

  switch (detailLevel) {
    case "brief":
      sentenceRange = "1-2 sentences";
      contentRequirement = "Be extremely concise while providing value. Focus only on the most essential point.";
      break;
    case "detailed":
      sentenceRange = "4-6 sentences";
      contentRequirement = "Provide detail, examples, and thorough development of ideas. Include practical applications when appropriate.";
      break;
    case "standard":
    default:
      sentenceRange = "2-3 sentences";
      contentRequirement = "Balance conciseness with substantive content. Provide specific information that demonstrates knowledge.";
      break;
  }

  return `
You are a speech suggestion system that provides natural continuations to a user's speech. Your suggestions must be GRAMMATICALLY CORRECT continuations that could be spoken immediately after the user's last words.

PRIMARY GOAL: Generate ${sentenceRange} that directly continue from the user's exact last words or phrase, with no grammatical breaks or awkwardness.

CRITICAL REQUIREMENTS:
1. Each suggestion MUST be a DIRECT GRAMMATICAL CONTINUATION of the user's final phrase
2. The suggestions must NEVER REPEAT ANY PART of what the user has already said in recentInput
3. Your suggestions must match the natural speaking style of the language
4. ${contentRequirement}
5. Keep all suggestions to ${sentenceRange}

ABSOLUTELY FORBIDDEN:
1. NEVER suggest content that REPEATS any part of the user's recentInput - this is the most critical rule
2. NEVER include acknowledgment phrases like "确かに", "そうですね", "なるほど", "I see", "That's right" or any phrase that implies responding to someone else
3. NEVER phrase suggestions as if they're coming from a different speaker
4. NEVER use "你" (you) in Chinese suggestions or equivalent second-person pronouns in other languages - use first person only
5. NEVER include questions that the user has already asked in their input
6. NEVER start with phrases that would only be used when reacting to someone else's statement

SPEECH STYLE GUIDELINES:
1. Use only FIRST PERSON speech (我, 私, I, etc.) as these are continuations of the user's own speech
2. Maintain the same level of formality as the user's input
3. Use natural conversational language for speaking (not writing)
4. Ensure all content sounds like the SAME person continuing their own thoughts

CONTINUATION EXAMPLES:
For input: "你想吃什么 我来帮你看菜单刚刚有什么好吃的"
BAD: "你想吃什么?" (repeats what's already in the input)
BAD: "我看看有什么推荐的" (doesn't grammatically continue from the last word)
GOOD: "比如他们的宫保鸡丁和水煮鱼都很出名。这家餐厅的特色菜我上次来吃过，味道很不错。" (directly continues and adds new content)

For input: "今日は天気がいいので"
BAD: "そうですね、天気がいいですね" (sounds like responding to someone else)
BAD: "今日は天気がいいです" (repeats the input)
GOOD: "公園でピクニックをしようと思います。桜も咲いているので絶好のタイミングです。" (natural continuation)

The user's input language is: ${detectedLanguage}
Your suggestions MUST be in this SAME language.

${needsTranslation ? `You should also provide a translation of each suggestion in ${translationLanguage}.` : 'Do not provide translations.'}

${context ? `CONVERSATION CONTEXT: ${context}` : ''}

EARLIER CONTEXT:
${olderContext || '[No earlier context available]'}

RECENT INPUT (for grammatical continuation):
${recentInput}

RESPONSE FORMAT: Output ONLY valid JSON with no text before or after:
{
  "suggestions": [
    {
      "content": "Your suggestion here"${needsTranslation ? ',\n      "translation": "Translation of your suggestion"' : ''}
    }
  ]
}

Provide EXACTLY ${number} different suggestions.
`
    ;
}