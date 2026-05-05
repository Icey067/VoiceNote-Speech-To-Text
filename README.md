<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/IBM_Watson-STT_&_NLU-054ADA?style=for-the-badge&logo=ibm&logoColor=white" alt="IBM Watson">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

# 🎙️ VoiceNote — Speech-to-Text Note Taker

A full-stack voice-powered note-taking application that leverages **IBM Watson Speech-to-Text** and **Natural Language Understanding** APIs to transcribe audio recordings, perform sentiment analysis, and extract keywords — all from your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎤 **Browser Audio Recording** | Record audio directly from the browser using the MediaRecorder API |
| 📝 **Real-Time Transcription** | Convert speech to text using IBM Watson Speech-to-Text |
| 🧠 **NLU Analysis** | Automatic sentiment analysis & keyword extraction via IBM Watson NLU |
| 💾 **Persistent Notes** | Notes saved to `localStorage` with timestamps, duration & metadata |
| 🏷️ **Keyword Tags** | Visual keyword chips extracted from transcribed content |
| 😊 **Sentiment Badges** | Color-coded sentiment indicators (positive / neutral / negative) |
| 🗑️ **Note Management** | Delete individual notes with a single click |
| 🐳 **Docker Support** | Containerized deployment with Docker & Docker Compose |
| 📱 **Responsive Design** | Clean, modern UI optimized for desktop and mobile |

---

## 🏗️ Architecture

```
VoiceNote/
├── server.js              # Express server entry point
├── routes/
│   └── transcribe.js      # API routes — /api/transcribe & /api/analyze
├── public/
│   └── index.html         # Single-page frontend (HTML + CSS + JS)
├── uploads/               # Temporary audio file storage
├── Dockerfile             # Container image definition
├── docker-compose.yml     # Docker Compose orchestration
├── .env                   # Environment variables (not committed)
└── package.json           # Node.js dependencies & scripts
```

### How It Works

```
┌──────────┐     audio blob      ┌──────────────┐     audio file     ┌─────────────────┐
│  Browser  │ ──────────────────▶ │ Express API  │ ──────────────────▶│ IBM Watson STT  │
│ Recorder  │                     │  /api/       │                    │ Speech-to-Text  │
└──────────┘                     │ transcribe   │ ◀─────────────────│                 │
                                  └──────┬───────┘   transcription    └─────────────────┘
                                         │
                                         │ text
                                         ▼
                                  ┌──────────────┐                    ┌─────────────────┐
                                  │  /api/       │ ──────────────────▶│ IBM Watson NLU  │
                                  │  analyze     │                    │ Sentiment +     │
                                  │              │ ◀─────────────────│ Keywords        │
                                  └──────┬───────┘   analysis         └─────────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Frontend    │
                                  │  Note Card   │
                                  └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **IBM Cloud** account with:
  - [Speech-to-Text](https://www.ibm.com/products/speech-to-text) service instance
  - [Natural Language Understanding](https://www.ibm.com/products/natural-language-understanding) service instance

### 1. Clone the Repository

```bash
git clone https://github.com/Icey067/VoiceNote-Speech-To-Text.git
cd VoiceNote-Speech-To-Text
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# IBM Watson Speech-to-Text credentials
WATSON_STT_API_KEY=your_stt_api_key_here
WATSON_STT_URL=https://api.xx-xxx.speech-to-text.watson.cloud.ibm.com/instances/your-instance-id

# IBM Watson Natural Language Understanding credentials
WATSON_NLU_API_KEY=your_nlu_api_key_here
WATSON_NLU_URL=https://api.xx-xxx.natural-language-understanding.watson.cloud.ibm.com/instances/your-instance-id

# Server port
PORT=3000
```

> **Note:** The app runs in **Demo Mode** with placeholder responses if API keys are not configured.

### 4. Run the Application

**Development** (with hot-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
docker compose up --build
```

### Using Docker Directly

```bash
docker build -t voicenote .
docker run -p 3000:3000 --env-file .env voicenote
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/transcribe` | Upload audio file (multipart/form-data) → returns transcription |
| `POST` | `/api/analyze` | Send text (JSON body) → returns sentiment, keywords, categories |
| `GET`  | `/api/health` | Health check endpoint |

### Example — Transcribe

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.webm"
```

**Response:**
```json
{
  "success": true,
  "transcription": "Patient reports mild headache...",
  "confidence": 0.94,
  "demo": false
}
```

### Example — Analyze

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "The patient is feeling much better today"}'
```

**Response:**
```json
{
  "success": true,
  "demo": false,
  "analysis": {
    "sentiment": { "label": "positive", "score": 0.85 },
    "keywords": [
      { "text": "patient", "relevance": 0.95, "sentiment": "positive" }
    ],
    "categories": [
      { "label": "/health and fitness", "score": 0.8 }
    ]
  }
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **AI/ML** | IBM Watson Speech-to-Text, IBM Watson NLU |
| **File Upload** | Multer |
| **Containerization** | Docker, Docker Compose |
| **Font** | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using IBM Watson AI
</p>
