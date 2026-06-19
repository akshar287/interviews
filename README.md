# AI-Powered Mock Interview Platform 🚀

A hyper-realistic, AI-driven mock interview application built to help students and professionals ace their upcoming campus placements and job interviews. 

This platform uses a custom fine-tuned **Hugging Face Model** to evaluate answers in real-time and provides a complete conversational experience using the native **Web Speech & Synthesis API**.

---

## ✨ Features

- **🧠 Custom AI Evaluator:** Uses a fine-tuned Hugging Face model (`akshar2109/ak_interview-answer-scorer`) to generate contextual follow-up questions and accurately score user responses.
- **🗣️ Conversational Interface:** Real-time speech-to-text (STT) and text-to-speech (TTS) utilizing browser-native Web APIs for a seamless, hands-free interview experience.
- **👁️ Live Proctoring:** Integrates `face-api.js` to ensure the user stays focused and in-frame during the interview session, simulating a real proctored environment.
- **📊 Detailed Analytics:** Post-interview dashboard highlighting overall scores, key strengths, weaknesses, and personalized improvement tips.
- **🪙 Token Economy:** Built-in token system tracking interview usage per user.
- **🔐 Secure Authentication:** Seamless Google Sign-In powered by Firebase Authentication and Firestore.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend/Database:** Firebase (Auth & Firestore)
- **AI Integration:** Hugging Face Inference API
- **Computer Vision:** `face-api.js` (for proctoring)
- **Speech Processing:** Web Speech API & Web Synthesis API

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Clone the repository
```bash
git clone https://github.com/akshar287/interviews.git
cd interviews
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your keys:

```env
# Hugging Face Token for the custom AI Model
NEXT_PUBLIC_HF_TOKEN=your_hugging_face_token_here

# Firebase Configuration (Replace with your own project config)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Matomo analytics configuration
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.example
NEXT_PUBLIC_MATOMO_SITE_ID=1
```

If you deploy on Vercel, add the same two Matomo variables in the project environment settings so production builds can embed the tracker URL and site ID.

### 4. Firestore Security Rules
Make sure your Firestore Database rules allow users to access their own data. In your Firebase Console, apply these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /interviews/{userId}/sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
