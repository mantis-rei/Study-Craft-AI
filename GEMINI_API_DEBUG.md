# Gemini API Debugging Guide

## Error: "Something went wrong"

### Possible Causes:

1. **No API Key Entered**
   - Solution: Leave the API key field blank to use Mock Demo mode

2. **Invalid API Key**
   - The key format is wrong or expired
   - Solution: Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **API Key Restrictions**
   - Your key might have IP or referrer restrictions
   - Solution: Check API key settings in Google Cloud Console

4. **Quota Exceeded**
   - You've hit the free tier limit
   - Solution: Wait or upgrade your quota

### How to Debug:

1. **Open Browser Console**
   - Press `F12` in your browser
   - Click "Console" tab
   - Look for error messages when you click "Craft It"

2. **Check Network Tab**
   - In F12 tools, click "Network" tab
   - Click "Craft It" button
   - Look for failed requests (red color)
   - Click on them to see error details

### Quick Test:

**Test Mock Mode (No API Key Needed):**
1. Leave the "Gemini API Key" field **empty**
2. Click "Craft It"
3. Should show Photosynthesis example immediately

**Test Real API:**
1. Get key from: https://makersuite.google.com/app/apikey
2. Paste in "Configure Real AI" section
3. Click "Craft It"
4. Should generate real content in 3-5 seconds

### Common Error Messages:

| Error | Meaning | Fix |
|-------|---------|-----|
| `API_KEY_INVALID` | Wrong key format | Get new key |
| `PERMISSION_DENIED` | API not enabled | Enable Gemini API in Google Cloud |
| `RESOURCE_EXHAUSTED` | Quota exceeded | Wait or upgrade |
| `CORS error` | Browser blocking request | Check localhost is allowed |

### Console.log Messages to Look For:

- `"Generating content for: [topic] Has Key: true/false"` - Confirms API call started
- `"Gemini Generation Error:"` - Shows the actual error
- Any red error messages about Firebase, API keys, or network

### If Still Not Working:

Share the browser console error message so we can fix it!
