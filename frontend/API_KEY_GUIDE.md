# AI Suggestion Feature - API Key Guide

## Current Implementation
The app currently uses **Groq API** for AI meal suggestions. Groq is a fast, cost-effective LLM provider perfect for real-time applications.

## Supported Providers

### 1. **Groq** ✅ (Currently Implemented)
- **API Key Format**: Starts with `gsk_`
- **Get Free Key**: https://console.groq.com
- **Model**: `llama-3.1-8b-instant`
- **Speed**: Ultra-fast (best latency)
- **Cost**: Free tier available
- **Best For**: Real-time suggestions

### 2. **Gemini (Google)** 
- **API Key Format**: Long alphanumeric string
- **Get Free Key**: https://aistudio.google.com/app/apikeys
- **Model**: `gemini-pro` or `gemini-1.5-flash`
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models`
- **Cost**: Free tier with usage limits
- **To Switch**: Update endpoint and API format in `aiSuggestions.ts`

### 3. **OpenAI**
- **API Key Format**: Starts with `sk-`
- **Get Key**: https://platform.openai.com/api-keys
- **Model**: `gpt-3.5-turbo` or `gpt-4`
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Cost**: Paid only, ~$0.01-0.03 per request
- **To Switch**: Update endpoint and API format in `aiSuggestions.ts`

### 4. **Anthropic (Claude)**
- **API Key Format**: Starts with `sk-ant-`
- **Get Key**: https://console.anthropic.com
- **Model**: `claude-3-haiku` (fastest and cheapest)
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Cost**: Paid, very affordable
- **To Switch**: Update endpoint and API format in `aiSuggestions.ts`

### 5. **Cohere**
- **API Key Format**: Alphanumeric string
- **Get Key**: https://dashboard.cohere.com
- **Model**: `command-light`
- **Cost**: Free tier available
- **To Switch**: Update endpoint and API format in `aiSuggestions.ts`

## How to Switch Providers

1. **Get API Key** from your chosen provider
2. **Update `.env.local`**:
   ```env
   EXPO_PUBLIC_GROQ_API_KEY=your_new_api_key
   ```
   Or input manually when prompted in the app

3. **Modify `aiSuggestions.ts`** if needed:
   - Change API endpoint URL
   - Adjust request body format
   - Update model name
   - Handle response format differences

## API Key Security

✅ **Best Practices Implemented:**
- API key is stored locally on device (AsyncStorage)
- Not sent to any external server except the AI provider
- User can delete/update key anytime
- Environment variable support for deployment

⚠️ **Important Notes:**
- Never commit real API keys to git
- Use environment variables for production
- Rotate keys periodically
- Monitor usage on provider's dashboard

## Files Modified

- `hooks/useAPIKey.ts` - API key management hook
- `components/APIKeyModal.tsx` - API key input modal
- `app/aiquickorder.tsx` - Main screen with modal trigger
- `utils/aiSuggestions.ts` - Groq API integration (customizable)

## Flow

1. User taps "Quick Order"
2. App checks for API key
3. If missing → Show modal to input key
4. If exists → Fetch AI suggestions
5. Key is stored locally for future use
