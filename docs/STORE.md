# KAI — Store Deployment & Privacy Declarations

## App Store & Google Play Metadata

- **App Name**: KAI — Your Money OS
- **Bundle Identifier (iOS)**: `app.kai.money`
- **Package Name (Android)**: `app.kai.money`
- **Primary Category**: Finance
- **Secondary Category**: Productivity

---

## 🔒 Permission Strings (iOS Info.plist)

| Key | Usage Description |
|---|---|
| `NSMicrophoneUsageDescription` | KAI uses the microphone to let you log expenses, record bills, and ask financial questions using your voice. |
| `NSSpeechRecognitionUsageDescription` | KAI uses speech recognition to convert your spoken financial entries into instant transaction records. |
| `NSFaceIDUsageDescription` | KAI uses Face ID to securely authenticate you before revealing your private financial balance and account details. |
| `NSPhotoLibraryUsageDescription` | KAI uses photo library access to let you upload receipt photos and policy document scans to your private vault. |

---

## 🛡️ Data Safety & App Privacy Declarations

- **Financial Info**: User financial records (transactions, balances, accounts) are encrypted at rest and stored securely.
- **Voice Transcripts**: Processed solely for transaction parsing. Transcripts and money amounts are NEVER logged to external analytics.
- **Third-Party Data Sharing**: Zero data sold to third parties.
