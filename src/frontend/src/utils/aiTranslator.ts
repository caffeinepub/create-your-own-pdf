/**
 * AI-powered translation utility using LibreTranslate API
 * Provides reliable, free translation without requiring API keys
 */

interface TranslationResponse {
  translatedText: string;
}

interface TranslationError {
  error: string;
}

const LIBRETRANSLATE_INSTANCES = [
  'https://libretranslate.com',
  'https://translate.argosopentech.com',
  'https://translate.terraprint.co',
];

/**
 * Translates text using LibreTranslate API with automatic fallback to multiple instances
 * @param text - The text to translate
 * @param sourceLang - Source language code (e.g., 'en', 'es', 'fr')
 * @param targetLang - Target language code (e.g., 'en', 'es', 'fr')
 * @returns Promise<string> - The translated text
 * @throws Error if all translation attempts fail
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }

  // Try each LibreTranslate instance until one succeeds
  for (let i = 0; i < LIBRETRANSLATE_INSTANCES.length; i++) {
    const instance = LIBRETRANSLATE_INSTANCES[i];
    
    try {
      const response = await fetch(`${instance}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as TranslationResponse | TranslationError;

      if ('error' in data) {
        throw new Error(data.error);
      }

      if ('translatedText' in data && data.translatedText) {
        return data.translatedText;
      }

      throw new Error('Invalid response format');
    } catch (err) {
      console.warn(`Translation failed with instance ${instance}:`, err);
      
      // If this is the last instance, throw the error
      if (i === LIBRETRANSLATE_INSTANCES.length - 1) {
        throw new Error(
          `Translation failed after trying all available services. Please check your internet connection and try again.`
        );
      }
      
      // Otherwise, continue to the next instance
      continue;
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Translation failed');
}

/**
 * Translates text in chunks to handle large documents
 * @param text - The text to translate
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @param chunkSize - Maximum characters per chunk (default: 500)
 * @param onProgress - Optional callback for progress updates (0-1)
 * @returns Promise<string> - The translated text
 */
export async function translateTextInChunks(
  text: string,
  sourceLang: string,
  targetLang: string,
  chunkSize: number = 500,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }

  // Split text into sentences to avoid breaking mid-sentence
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  // Group sentences into chunks
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  // Translate each chunk
  const translatedChunks: string[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    if (chunk.trim()) {
      try {
        const translated = await translateText(chunk, sourceLang, targetLang);
        translatedChunks.push(translated);
        
        // Add a small delay to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (err) {
        console.error(`Failed to translate chunk ${i + 1}:`, err);
        // Use original text if translation fails
        translatedChunks.push(chunk);
      }
    }

    // Report progress
    if (onProgress) {
      onProgress((i + 1) / chunks.length);
    }
  }

  return translatedChunks.join(' ');
}

/**
 * Checks if a language pair is supported
 * Note: LibreTranslate supports most common language pairs
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns Promise<boolean> - Whether the language pair is supported
 */
export async function isLanguagePairSupported(
  sourceLang: string,
  targetLang: string
): Promise<boolean> {
  try {
    const response = await fetch(`${LIBRETRANSLATE_INSTANCES[0]}/languages`);
    const languages = await response.json();
    
    const sourceLangSupported = languages.some((lang: any) => lang.code === sourceLang);
    const targetLangSupported = languages.some((lang: any) => lang.code === targetLang);
    
    return sourceLangSupported && targetLangSupported;
  } catch (err) {
    console.warn('Failed to check language support:', err);
    // Assume supported if we can't check
    return true;
  }
}
