# Current Location

Attach your current location as frontmatter (`lat`, `lon`, and optionally `address`) to any note. Auto-add location to new notes in configured folders.

![current-location](https://github.com/user-attachments/assets/a5957869-9314-407b-b5c9-9a06761c5387)

## Setup

### 1. Get an API key (optional)

An API key is only needed if you want reverse-geocoded addresses in addition to coordinates.

1. Visit [OpenCage](https://opencagedata.com/) and create a free account
2. Copy your API key (free tier: 2,500 requests/day)

### 2. Install the plugin

1. Open Obsidian settings
2. Go to **Community Plugins** and install and enable Current Location
3. Open the Current Location plugin settings
4. (Optional) Add your API key in the **API key** field
5. (Optional) Add folder paths in **Auto-add folders** to auto-tag notes

### 3. Add location to a note

**Option 1: Manual command**
- Open a note
- Open the command palette (Cmd/Ctrl + P)
- Search for "Add location"
- Press Enter

**Option 2: Auto-add**
- Create a new note inside a configured auto-add folder
- Location is added automatically on creation

### 4. Enable Location Services

**macOS**
- Open System Settings
- Go to Privacy & Security > Location Services
- Enable for Obsidian

## Settings

| Setting | Description |
|---|---|
| Auto-add folders | Comma-separated folder paths for auto-add on new notes |
| API key | OpenCage API key for reverse-geocoded address |
| Address format | Format string using variables like `{city}`, `{state_abbr}`, `{country}` |
| Test location | Button to verify your setup |

### Address format variables

| Variable | Example value |
|---|---|
| `{city}` | New York |
| `{state_abbr}` | NY |
| `{state}` | New York |
| `{country}` | United States of America |
| `{country_code}` | US |
| `{postcode}` | 11025 |
| `{road}` | 86th Street Transverse |
| `{house_number}` | *(empty if unavailable)* |
| `{county}` | New York County |

Default format: `{city}, {state_abbr}` → New York, NY

## License

0-BSD — See LICENSE for details.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Feedback

If you caught an issue or bug or have any feedback, [let me know on X](https://x.com/c14_mx).
