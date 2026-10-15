# 📺 Gayathri & Ashen: Watch Live

**Admin guide for the engagement live stream page.**

🔗 **Live stream page:** https://ourevenet.github.io/Engagement-Live-Stream/
💌 Invitation: https://ourevenet.github.io/Gayathri-Ashen/ · 📷 Photo album: https://ourevenet.github.io/Engagement-Gallery/

Family and friends who can't be at Hotel Chance Palace watch the YouTube live stream here, inside a frame styled like the printed invitation. The page also shows:

- a countdown, and the start time in each viewer's own time zone;
- calendar reminders (Google, Apple, Outlook);
- a form for sending wishes to the couple on WhatsApp;
- the latest guest photos from the live album, updated as they arrive.

---

## 1. Going live (the only thing to do on the day)

1. In **YouTube Studio**, create the live stream (**Create → Go live**, or schedule it in advance).
   - Set the visibility to **Public** or **Unlisted**. A **Private** stream won't play for guests.
   - Leave **Allow embedding** switched on (Stream settings → *Advanced settings*).
   - Choose **"No, it's not made for kids"**, otherwise the video can't be played inside other websites.
2. Copy the stream's link from YouTube. Use **Share → Copy link**, or the address bar. Any of these work:
   - `https://youtube.com/live/AbCdEfGhIjK`
   - `https://www.youtube.com/watch?v=AbCdEfGhIjK`
   - `https://youtu.be/AbCdEfGhIjK`
   - just the 11-character video ID: `AbCdEfGhIjK`
   - a channel's live link, `https://www.youtube.com/channel/UC…/live`, which always shows whatever that channel is streaming now
3. On GitHub, open **`stream.json`** → ✏️ pencil → paste the link between the quotes:
   ```json
   {
     "youtube": "https://youtube.com/live/AbCdEfGhIjK",
     "notice": ""
   }
   ```
   → **Commit changes**.
4. That's it. The site updates within a minute or two. Pages that guests already have open check every 30 seconds, and the video appears in the frame by itself (no refresh needed).

> 💡 **Do this the evening before.** A scheduled YouTube stream already has its link, so paste it into `stream.json` early. Until you start streaming, YouTube shows its own "waiting" screen inside the frame.

**Test first:** add `?v=` and the link or ID to the page address, for example `https://ourevenet.github.io/Engagement-Live-Stream/?v=AbCdEfGhIjK`. Only you see this; it doesn't change the page for anyone else.

### A message for viewers

Put a short line in `"notice"` (for example `"We're running about 15 minutes late. Thank you for waiting!"`) and it shows above the frame on every open page. Set it back to `""` to remove it.

### After the event

YouTube turns the stream into a recording automatically. Leave the link in `stream.json` and the page becomes **"Watch the replay"** after 3.00 PM.

---

## 2. What viewers see, hour by hour

| When (Sri Lanka time) | Status | In the frame |
|---|---|---|
| Before 8.30 AM | "Live from 9.00 AM" | Countdown and reminder buttons below. "We'll be live soon" until a link is added, then the YouTube player |
| 8.30 – 9.00 AM | "Starting soon" | The YouTube player (or "Starting any moment") |
| 9.00 AM – 3.00 PM | 🔴 "Live now" | The live stream |
| After 3.00 PM | "Watch the replay" | The recording |

Viewers can also:
- 🌙 **Lights off:** dims the whole page around the frame, like a cinema. Tap it again, tap outside, or press Esc to bring the lights back.
- **Share** the page: WhatsApp and similar apps show a preview card with the couple artwork.
- Turn the phone **sideways**: the video fills the screen height.
- Tap **YouTube** to watch in the YouTube app (handy for live chat, or if the frame won't play).

---

## 3. Changing other details

Event details are in **`config.js`**: names, start and end time, venue, the WhatsApp numbers for wishes, and the links to the invitation and album. Edit it on GitHub the same way.

The guest photo strip reads from the same Supabase project as the Engagement Gallery (read-only; it can't add or remove photos). To hide the strip, set `supabaseUrl: ""`.

---

## 4. Troubleshooting

| Problem | Fix |
|---|---|
| **Frame shows "Video unavailable" / "Playback on other websites has been disabled"** | In YouTube Studio, switch on *Allow embedding*, and make sure the stream isn't "Made for kids" or Private. Meanwhile, the **YouTube** button under the frame always works. |
| **Video doesn't appear after editing `stream.json`** | Wait 2 minutes (GitHub Pages needs to publish). Check the **Actions** tab on GitHub shows a green tick. Make sure the link is inside the quotes and the file still has its `{ }` and commas. |
| **The page shows "Starting any moment" but no video** | `stream.json` has no link yet. See section 1. |
| **Sound doesn't start by itself** | Browsers don't allow sound until the viewer taps. They tap ▶ in the player. |

---

<details>
<summary><strong>Technical notes (for developers)</strong></summary>

- **Hosting:** GitHub Pages, deployed by `.github/workflows/static.yml` on every push to `main`. No build step. In the repository settings, **Pages → Source** must be **GitHub Actions**.
- **Structure:**
  ```
  index.html          the page
  css/styles.css      styles (palette and type from the printed invitation)
  js/app.js           stream switching, countdown, wishes, photo strip, lights off
  config.js           event details
  stream.json         YouTube link + notice; fetched with cache-busting every streamCheckEvery seconds
  watch-live.ics      Apple / iPhone calendar reminder
  images/             artwork cut from the invitation (transparent WebP) + og-image.jpg link preview
  ```
- **Embeds:** videos use `youtube-nocookie.com/embed/ID`; channel links use `youtube.com/embed/live_stream?channel=UC…`. A `@handle` link can't be embedded, so the frame shows a "Watch on YouTube" button instead. The page sends `strict-origin-when-cross-origin` referrers, which YouTube now requires for embeds.
- **Photos:** `GET /rest/v1/photos?order=created_at.desc&limit=12` with the public anon key, every `photoCheckEvery` seconds while the tab is visible. Guest names are inserted as text, never HTML.
- **Local preview:** `python3 -m http.server 8000`, then open http://localhost:8000/?v=VIDEO_ID.
- Respects "reduce motion"; stays on white card stock in dark mode, like the invitation.

</details>
