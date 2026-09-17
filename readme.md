# 💍 Sakib & Nusrat — Royal Wedding Invitation Suite

A luxury, interactive digital wedding invitation stationery experience designed for the wedding ceremony of **Sakib Hossain** & **Nusrat Jahan**.

---

## 📅 Wedding Event Details

- **Date**: Friday, January 08, 2027
- **Time**: After Jummah Namaz (2:00 PM BST)
- **Venue**: Al Hossain Jame Mosque
- **Location**: Dewliya Bari
- **Groom**: Sakib Hossain *(Son of Shafiqul Islam)*
- **Bride**: Nusrat Jahan

---

## ✨ Features

1. **Gate Verification**: Personalized royal gate asking guests for their name before entering.
2. **Dynamic Background Soundtrack**: Romantic ambient wedding music starts upon guest entry, with floating audio wave visualizer and pause/play toggle.
3. **3D Envelope Unfolding Stage**: Realistic 3D envelope with custom gold wax seal (`S & N`), particle burst, top flap opening, and letter extraction physics.
4. **9:16 Luxury Digital Stationery Folio**:
   - Royal monogram wreath and couple typography
   - Countdown timer to Friday, January 8, 2027 (After Jummah Namaz)
   - Quranic scripture (Surah Ar-Rum 30:21) on love, mercy, and peace
   - Arranged marriage love story milestones (Qadr & Istikhara, Sukoon, Barakah, Nikah)
   - Profile cards for Groom & Bride with family lineage
   - Event timeline & interactive venue directions to Al Hossain Jame Mosque
   - Photo gallery with full-screen lightbox
   - Live blessings wall with interactive *"Say Ameen"* counters & WhatsApp integration
5. **👑 Groom Admin Access Control & Online Cloud Sync**:
   - Logging in as **Sakib Hossain** unlocks the exclusive `👑 Manage Access` console.
   - **☁️ Multi-Device Real-Time Cloud Sync**: Names added on one phone or computer are automatically saved to the online cloud and immediately work on all other devices worldwide.
   - **Smart Online Verification**: When guests enter their name, the system queries the live cloud database so newly added guests are instantly recognized.
   - **Canonical `guests.json`**: Deployed alongside the site on Netlify for high-availability CDN access.
   - **Custom Cloud Support**: Support for private Firebase Realtime Database or Google Apps Script.
   - Unauthorized or removed names are politely denied access.
   - Sakib Hossain is protected against accidental removal.

---

## 🚀 How to Run Locally

Simply serve the directory with any local static HTTP server:

```powershell
# Using PowerShell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Or with Python:
```bash
python -m http.server 8080
```

Open `http://localhost:8080` in your web browser.

---

## 🌐 Deploy to Netlify / GitHub Pages

### Option 1: Netlify (Instant)
1. Go to [Netlify Dashboard](https://app.netlify.com).
2. Drag and drop this project folder onto Netlify, or connect your GitHub repository for automatic deploys on push.
3. Your wedding invitation will be live worldwide with online cloud sync!

### Option 2: GitHub Pages
1. Push this repository to GitHub:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\push_to_github.ps1 -RepoUrl "https://github.com/YOUR_USERNAME/YOUR_REPO.git"
   ```
2. Go to your repository **Settings** > **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` and `/root`.
4. Click **Save**.  
 
#   m a r r i g e i n v i t a t i o n