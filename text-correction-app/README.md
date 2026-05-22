# Text Correction & Rephrasing Tool

A powerful web-based application that checks spelling, grammar, and sentence structure, then automatically corrects and professionally rephrases English text while preserving the original meaning.

## Features

✨ **Comprehensive Text Analysis**
- Spelling correction
- Grammar checking
- Sentence structure improvement
- Professional rephrasing

📝 **Multiple Input Methods**
- Direct text input via textarea
- File upload support (.txt files)
- Paste from clipboard

🎨 **Clean & Modern UI**
- Side-by-side comparison view
- Highlighted changes and corrections
- Responsive design (mobile-friendly)
- Real-time word count
- Statistics dashboard

🔧 **Advanced Functionality**
- Detailed error breakdown by category
- Copy to clipboard
- Download improved text
- Loading indicators
- Error handling

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **API**: LanguageTool API for grammar and spelling checking
- **Architecture**: Client-side only (no backend required)

## How It Works

1. **Input**: Enter or upload your text
2. **Analysis**: Text is sent to LanguageTool API for comprehensive grammar and spelling analysis
3. **Correction**: Detected errors are automatically corrected
4. **Rephrasing**: Rule-based algorithms improve sentence structure and professionalism
5. **Display**: Original and improved versions shown side-by-side with detailed statistics

## Usage Instructions

### Getting Started

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No installation or setup required

2. **Input Your Text**
   - Type or paste text directly into the input area
   - OR click "📁 Upload File" to upload a .txt file
   - Minimum 3 words required for analysis

3. **Process Text**
   - Click "✓ Check & Improve Text" button
   - Wait for the analysis to complete (usually 2-5 seconds)

4. **Review Results**
   - View original text on the left panel
   - View improved text on the right panel
   - Check statistics: errors found, corrections made, improvement percentage
   - Expand "Detailed Corrections" section to see specific issues

5. **Use Improved Text**
   - Click "📋 Copy to Clipboard" to copy the improved text
   - Click "💾 Download" to save as a .txt file

### Tips for Best Results

- **Write complete sentences** for better grammar analysis
- **Use proper punctuation** to help the tool understand sentence boundaries
- **Longer texts** (50+ words) provide more meaningful improvements
- **Review suggestions** - the tool aims for professionalism, adjust if needed for your specific context

## Features Breakdown

### Grammar & Spelling Checking
- Powered by LanguageTool API
- Detects:
  - Spelling mistakes
  - Grammar errors
  - Punctuation issues
  - Style problems
  - Word choice suggestions

### Professional Rephrasing
- Converts contractions to full forms (can't → cannot)
- Improves informal phrases (a lot of → many)
- Enhances weak expressions (very good → excellent)
- Removes redundant words
- Ensures proper capitalization

### Statistics Dashboard
- **Errors Found**: Total number of issues detected
- **Corrections Made**: Number of automatic fixes applied
- **Improvement Score**: Percentage of issues resolved

### Error Details
- Categorized by type (Grammar, Spelling, Style, etc.)
- Shows context with highlighting
- Displays suggestions for each error
- Explains the correction made

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Requirements:**
- JavaScript enabled
- Internet connection (for API calls)
- Modern browser with ES6+ support

## API Information

### LanguageTool API
- **Endpoint**: https://api.languagetool.org/v2/check
- **Free Tier**: 20 requests per minute
- **No API Key Required**: Uses public endpoint
- **Language**: English (US)

### Rate Limiting
The free tier allows 20 requests per minute. For heavy usage, consider:
- Waiting between requests
- Using the official LanguageTool API with authentication
- Self-hosting LanguageTool server

## File Structure

```
text-correction-app/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # Core JavaScript logic and API integration
└── README.md           # This documentation file
```

## Customization

### Modify Rephrasing Rules
Edit the `rephraseSentences()` function in `script.js` to add custom improvements:

```javascript
const improvements = [
    { pattern: /your-pattern/gi, replacement: 'your-replacement' },
    // Add more rules here
];
```

### Change Color Scheme
Modify CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4f46e5;  /* Change primary color */
    --success-color: #10b981;  /* Change success color */
    /* ... other variables */
}
```

### Adjust API Settings
Modify constants in `script.js`:

```javascript
const LANGUAGETOOL_API = 'your-api-endpoint';
const LANGUAGE = 'en-US';  // Change language
```

## Troubleshooting

### "Failed to check grammar" Error
- **Cause**: No internet connection or API unavailable
- **Solution**: Check your internet connection and try again

### "Failed to read file" Error
- **Cause**: Unsupported file format
- **Solution**: Use .txt files only

### No Improvements Shown
- **Cause**: Text may already be well-written
- **Solution**: This is good! Your text is already high quality

### API Rate Limit Exceeded
- **Cause**: Too many requests in short time
- **Solution**: Wait 60 seconds before trying again

## Privacy & Security

- ✅ **No Data Storage**: Text is not stored on any server
- ✅ **API Only**: Text is sent only to LanguageTool API for analysis
- ✅ **Client-Side Processing**: All rephrasing happens in your browser
- ✅ **No Tracking**: No analytics or user tracking implemented

## Limitations

- **File Support**: Currently supports .txt files only (not .doc or .docx)
- **API Limits**: Free tier limited to 20 requests/minute
- **Language**: English only (can be extended to other languages)
- **Rephrasing**: Rule-based (not AI-powered for advanced rephrasing)

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for .doc and .docx files
- [ ] Multiple language support
- [ ] AI-powered advanced rephrasing
- [ ] Dark mode toggle
- [ ] Export to multiple formats (PDF, Word)
- [ ] Readability score calculation
- [ ] Tone adjustment (formal, casual, technical)
- [ ] Plagiarism checking
- [ ] Save/load drafts locally

## Credits

- **LanguageTool**: Grammar and spelling checking API
- **Design**: Modern, clean UI inspired by contemporary web applications
- **Icons**: Emoji-based icons for universal compatibility

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify your internet connection
3. Try with a different browser
4. Ensure JavaScript is enabled

## Version History

**v1.0.0** (Current)
- Initial release
- Grammar and spelling checking
- Professional rephrasing
- Side-by-side comparison
- File upload support
- Copy and download functionality
- Responsive design
- Error handling

---

**Enjoy writing better content with the Text Correction & Rephrasing Tool!** ✨