# How to Start Python Web Server - Step by Step

## Step 1: Open Command Prompt or PowerShell

**Option A: Using Windows Search**
1. Press `Windows Key` on keyboard
2. Type `cmd` or `powershell`
3. Press `Enter`

**Option B: Using VS Code Terminal**
1. In VS Code, press `` Ctrl + ` `` (backtick key)
2. Or go to: Terminal → New Terminal

## Step 2: Navigate to Your Project Directory

Copy and paste this command:

```bash
cd "C:\Users\ThirupathireddyBijja\Documents\GithubPersonal\Standalone-Projects"
```

Press `Enter`

## Step 3: Start the Python Server

Copy and paste this command:

```bash
python -m http.server 8000
```

Press `Enter`

**You should see:**
```
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

✅ **Server is now running!**

## Step 4: Open Your Browser

1. Open Chrome or Edge
2. In the address bar, type:
   ```
   http://localhost:8000/index.html
   ```
3. Press `Enter`

✅ **You should now see your job portal with all 12 jobs including the test job!**

## Step 5: Verify It's Working

1. Press `F12` in browser to open Developer Tools
2. Click on "Console" tab
3. You should see: `✓ Loaded 12 jobs from jobs.json`
4. Look for the "Amazon India - Software Development Engineer" test job in the list

## Step 6: Stop the Server (When Done)

In the terminal where server is running:
- Press `Ctrl + C`
- Server will stop

---

## Troubleshooting

### Error: "python is not recognized"

**Solution:** Python is not installed or not in PATH

1. Check if Python is installed:
   ```bash
   python --version
   ```

2. If not installed, download from: https://www.python.org/downloads/
3. During installation, check "Add Python to PATH"

### Error: "Address already in use"

**Solution:** Port 8000 is busy

Try a different port:
```bash
python -m http.server 8080
```

Then open: `http://localhost:8080/index.html`

### Can't see the test job?

1. Make sure you're using `http://localhost:8000/index.html` (not opening file directly)
2. Check browser console (F12) for errors
3. Verify `jobs.json` is in the same directory as `index.html`
4. Try hard refresh: `Ctrl + Shift + R`

---

## Alternative: Use VS Code Live Server Extension

**Easier method if you have VS Code:**

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Browser opens automatically!

---

## Quick Reference

```bash
# Navigate to directory
cd "C:\Users\ThirupathireddyBijja\Documents\GithubPersonal\Standalone-Projects"

# Start server
python -m http.server 8000

# Open in browser
http://localhost:8000/index.html

# Stop server
Ctrl + C