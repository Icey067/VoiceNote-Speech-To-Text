const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `audio-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname) || '.webm'}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all audio types
  }
});

// Initialize IBM Watson Speech-to-Text
let speechToText = null;
if (process.env.WATSON_STT_API_KEY && process.env.WATSON_STT_API_KEY !== 'your_stt_api_key_here') {
  speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: process.env.WATSON_STT_API_KEY,
    }),
    serviceUrl: process.env.WATSON_STT_URL,
  });
}

// Initialize IBM Watson NLU
let nlu = null;
if (process.env.WATSON_NLU_API_KEY && process.env.WATSON_NLU_API_KEY !== 'your_nlu_api_key_here') {
  nlu = new NaturalLanguageUnderstandingV1({
    version: '2022-04-07',
    authenticator: new IamAuthenticator({
      apikey: process.env.WATSON_NLU_API_KEY,
    }),
    serviceUrl: process.env.WATSON_NLU_URL,
  });
}

/**
 * POST /api/transcribe
 * Receives audio file via multipart/form-data, sends to Watson STT,
 * returns transcription text.
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;

    // If Watson STT is not configured, return a demo response
    if (!speechToText) {
      // Clean up the uploaded file
      fs.unlink(filePath, () => {});

      return res.json({
        success: true,
        transcription: '[Demo Mode] Watson Speech-to-Text API key not configured. This is a placeholder transcription. Add your WATSON_STT_API_KEY to the .env file to enable real transcription.',
        confidence: 0.0,
        demo: true
      });
    }

    // Read the audio file and send to Watson
    const audioStream = fs.createReadStream(filePath);

    const recognizeParams = {
      audio: audioStream,
      contentType: req.file.mimetype || 'audio/webm',
      model: 'en-US_BroadbandModel',
      wordAlternativesThreshold: 0.9,
      keywords: ['medical', 'patient', 'diagnosis', 'treatment', 'prescription'],
      keywordsThreshold: 0.5,
    };

    const response = await speechToText.recognize(recognizeParams);
    const results = response.result.results;

    let transcription = '';
    let confidence = 0;

    if (results && results.length > 0) {
      transcription = results
        .map(r => r.alternatives[0].transcript)
        .join(' ')
        .trim();
      confidence = results[0].alternatives[0].confidence || 0;
    }

    // Clean up the uploaded file
    fs.unlink(filePath, () => {});

    res.json({
      success: true,
      transcription: transcription || 'No speech detected.',
      confidence: confidence,
      demo: false
    });
  } catch (error) {
    console.error('Transcription error:', error.message);

    // Clean up file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze
 * Receives transcribed text, sends to Watson NLU for keyword extraction,
 * sentiment analysis, and categorization.
 */
router.post('/analyze', express.json(), async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text provided for analysis' });
    }

    // If Watson NLU is not configured, return a demo response
    if (!nlu) {
      return res.json({
        success: true,
        demo: true,
        analysis: {
          sentiment: {
            label: 'neutral',
            score: 0.0
          },
          keywords: [
            { text: 'note', relevance: 0.9 },
            { text: 'voice', relevance: 0.85 },
            { text: 'recording', relevance: 0.8 }
          ],
          categories: [
            { label: '/technology/general', score: 0.7 }
          ]
        }
      });
    }

    const analyzeParams = {
      text: text,
      features: {
        keywords: {
          limit: 10,
          sentiment: true,
        },
        sentiment: {
          document: true,
        },
        categories: {
          limit: 3,
        }
      }
    };

    const response = await nlu.analyze(analyzeParams);
    const result = response.result;

    res.json({
      success: true,
      demo: false,
      analysis: {
        sentiment: result.sentiment ? result.sentiment.document : { label: 'neutral', score: 0 },
        keywords: result.keywords ? result.keywords.map(k => ({
          text: k.text,
          relevance: k.relevance,
          sentiment: k.sentiment ? k.sentiment.label : 'neutral'
        })) : [],
        categories: result.categories || []
      }
    });
  } catch (error) {
    console.error('Analysis error:', error.message);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

module.exports = router;
