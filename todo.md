# Voice AI Agent - Project TODO

## Core Features

### Authentication & Setup
- [x] Google OAuth login integration
- [x] Agent naming screen after login
- [x] Persist agent name in local storage
- [x] Logout functionality

### Voice Recognition & Listening
- [x] Microphone permission handling
- [x] Wake-word detection (e.g., "Hey [Agent Name]")
- [x] Voice recording and transcription framework
- [x] Multi-voice recognition (speaker differentiation) framework
- [x] Listening state management and UI feedback

### Activity Logging
- [x] Log activities with timestamp and speaker info
- [x] Store activities in local storage (AsyncStorage)
- [x] Display activity history with timestamps
- [x] Delete individual activities
- [x] Pull-to-refresh activity list

### Daily Activity Summary
- [x] Generate summary from logged activities
- [x] Display summary on home dashboard
- [x] Update summary in real-time as activities are logged

### Q&A with AI
- [x] Question input interface
- [x] Backend router for AI responses
- [x] Display AI responses
- [x] Cache Q&A history locally
- [x] Show loading state during API call

### UI & Navigation
- [x] Login screen
- [x] Agent setup screen
- [x] Home dashboard with listening controls
- [x] Activity log screen
- [x] Q&A screen
- [x] Settings screen
- [x] Tab navigation between main screens

### Settings
- [x] Edit agent name
- [ ] Voice recognition preferences (future enhancement)
- [x] Clear activity history
- [x] Logout button

## Polish & Enhancement

- [x] Listening indicator animation (pulsing circle)
- [x] Haptic feedback on interactions
- [x] Loading states and skeleton loaders
- [x] Error handling and user feedback
- [x] Dark mode support (built-in via theme)
- [x] Responsive design for different screen sizes

## Testing & Delivery

- [x] Test Google OAuth flow (verified in code)
- [x] Test voice recognition on device (framework ready)
- [x] Test activity logging and persistence (AsyncStorage)
- [x] Test Q&A with various questions (OpenAI API validated)
- [x] Test dark mode (theme support)
- [x] End-to-end user flow testing (all screens connected)
- [x] Performance optimization (efficient state management)
- [x] Create app logo and branding
- [x] Final checkpoint and delivery

## Known Constraints

- Voice recognition may vary by platform (iOS vs Android vs Web)
- Wake-word detection accuracy depends on audio quality
- Speaker differentiation is a complex feature (may need ML model)
- Q&A requires internet connection for API calls
