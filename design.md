# Voice AI Agent - Design Plan

## Overview
A mobile app that allows users to create a named AI voice agent that listens for wake-word activation, recognizes different voices, logs daily activities, and provides AI-powered Q&A responses.

## Screen List

1. **Login Screen** — Google OAuth authentication
2. **Agent Setup Screen** — Name the AI agent after login
3. **Home/Agent Dashboard** — Main interface with listening status, activity summary, and quick actions
4. **Activity Log Screen** — View detailed daily activities with timestamps
5. **Q&A Screen** — Ask questions and get AI-powered responses
6. **Settings Screen** — Manage agent name, voice preferences, and app settings

## Primary Content and Functionality

### Login Screen
- Google OAuth login button
- App branding and welcome message
- Redirects to Agent Setup after successful login

### Agent Setup Screen
- Text input for agent name
- Visual confirmation of name
- "Create Agent" button to proceed to Dashboard
- Stored in local storage for persistence

### Home/Agent Dashboard
- **Agent Status Card**: Shows agent name and listening state (active/inactive)
- **Wake-Word Listener**: Displays microphone status and listening indicator
- **Daily Activity Summary**: Shows a brief summary of logged activities
- **Quick Action Buttons**: 
  - "Ask a Question" → Q&A Screen
  - "View Activities" → Activity Log Screen
  - "Settings" → Settings Screen
- **Floating Action Button**: Toggle listening mode on/off

### Activity Log Screen
- List of activities with timestamps (scrollable)
- Each activity shows: time, voice speaker, activity description
- Pull-to-refresh to reload activities
- Delete individual activities (swipe or button)

### Q&A Screen
- Text input field for questions
- "Ask" button to submit
- Display previous Q&A history (scrollable)
- Show loading state while fetching AI response
- Each Q&A pair shows question and answer

### Settings Screen
- Agent name (editable)
- Voice recognition preferences (sensitivity, language)
- Clear activity history button
- Logout button

## Key User Flows

### Flow 1: Initial Setup
1. User opens app → Login Screen
2. User taps "Sign in with Google" → Google OAuth
3. Redirected to Agent Setup Screen
4. User enters agent name (e.g., "Alex")
5. User taps "Create Agent"
6. Redirected to Home Dashboard

### Flow 2: Listen and Log Activity
1. User on Home Dashboard
2. User taps "Start Listening" (FAB)
3. App listens for wake-word (e.g., "Hey Alex")
4. On wake-word detection, app records voice input
5. App recognizes speaker voice and logs activity
6. Activity appears in Activity Log with timestamp and speaker info
7. Activity summary updates on Dashboard

### Flow 3: Ask a Question
1. User on Home Dashboard
2. User taps "Ask a Question"
3. Navigates to Q&A Screen
4. User types question (e.g., "What's the weather?")
5. User taps "Ask"
6. App sends question to AI backend
7. AI response displays below question
8. Response is cached locally for history

### Flow 4: View Daily Summary
1. User on Home Dashboard
2. Activity summary shows condensed version of daily activities
3. User taps "View Activities" to see full Activity Log
4. Activity Log shows all activities with timestamps and speakers

## Color Choices

- **Primary**: `#0a7ea4` (Teal/Blue) — Modern, tech-forward, trustworthy
- **Background**: `#ffffff` (Light) / `#151718` (Dark) — Clean, minimal
- **Surface**: `#f5f5f5` (Light) / `#1e2022` (Dark) — Card backgrounds
- **Foreground**: `#11181C` (Light) / `#ECEDEE` (Dark) — Primary text
- **Muted**: `#687076` (Light) / `#9BA1A6` (Dark) — Secondary text
- **Success**: `#22C55E` (Green) — Activity logged, listening active
- **Warning**: `#F59E0B` (Amber) — Low battery, connection issues
- **Error**: `#EF4444` (Red) — Recording failed, API errors

## Interaction Patterns

- **Listening Indicator**: Animated pulsing circle when microphone is active
- **Activity Cards**: Tap to expand, swipe to delete
- **Loading States**: Skeleton loaders for Q&A responses
- **Haptic Feedback**: Light vibration on button press, medium on successful activity log
- **Bottom Sheet**: For settings and quick actions (optional polish)

## Technical Considerations

- **Voice Recognition**: Use Web Speech API (browser) or Expo Audio + ML Kit (native)
- **Wake-Word Detection**: Client-side detection or lightweight server-side processing
- **Local Storage**: AsyncStorage for activities, agent name, user preferences
- **AI Q&A**: OpenAI API integration via backend
- **Authentication**: Google OAuth via Manus OAuth system
- **Voice Differentiation**: Fingerprinting or speaker recognition (future enhancement)
