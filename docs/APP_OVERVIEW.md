# BrandNarrator: Application Overview

This document provides a comprehensive overview of the BrandNarrator application, its architecture, features, and codebase.

## 1. Application Purpose

BrandNarrator is a SaaS (Software as a Service) application designed to help startup founders and marketers craft a compelling and authentic brand story using the power of AI. It guides users through a process of articulating their company's core identity and then uses that information to generate narrative content and marketing assets.

## 2. Core Features

The application is built around a user journey that flows from initial idea gathering to content generation.

-   **User Authentication**: Users can sign up with an email and password or continue as an anonymous guest. User sessions are managed on both the client (Firebase Auth) and server (session cookies) to secure the application.
-   **Token-Based Economy**: All AI-powered features consume "tokens". Users receive an initial allotment upon signing up and can purchase more tokens through a crypto-based payment gateway (NOWPayments).
-   **Interactive Story Gathering**: A conversational AI chat interface (`/story-gathering`) that guides users through a series of questions to extract the foundational elements of their brand's story. The chat history is saved and can be used as context for the main brand story generation.
-   **Comprehensive Brand Story Builder**: A detailed form (`/brand-story`) where users input all aspects of their company, from founding story and values to target audience and competition. This data, along with the chat history, is fed to a Genkit AI flow.
-   **AI Brand Story Generation**: The core feature of the app. It synthesizes all user inputs into a cohesive and engaging "About Us" style narrative.
-   **AI Prompt Generator**: A utility (`/prompt-generator`) that takes the user's brand story and generates optimized prompts for other AI platforms (like ChatGPT, Gemini, or Midjourney) to create marketing content that is consistent with the brand's voice.
-   **Account Management**: Users can update their profile information and change their password on the `/account` page.

## 3. Technology Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://react.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend Services**: [Firebase](https://firebase.google.com/)
    -   **Authentication**: Firebase Authentication (Email/Password, Anonymous)
    -   **Database**: Firestore
-   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models)
-   **Payments**: [NOWPayments API](https://nowpayments.io/) for cryptocurrency payments.
-   **Form Management**: [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/) for validation.

## 4. Project Structure

The codebase is organized to separate concerns, making it easier to manage and scale.

```
/
├── docs/
│   ├── backend.json         # Defines the data models and Firestore structure.
│   └── APP_OVERVIEW.md      # This file.
├── public/                  # Static assets.
├── src/
│   ├── app/                 # Next.js App Router: Pages and API routes.
│   │   ├── (dashboard)/     # Page layouts for authenticated users.
│   │   ├── api/             # Server-side API endpoints.
│   │   ├── layout.tsx       # Root layout.
│   │   └── page.tsx         # Landing/splash page.
│   ├── components/
│   │   ├── features/        # High-level components for specific features (e.g., login-form, pricing-page).
│   │   ├── layout/          # Layout components (e.g., Sidebar, AppContent).
│   │   ├── ui/              # Reusable low-level UI components from ShadCN (e.g., Button, Card).
│   │   └── logo.tsx         # The application logo component.
│   ├── firebase/
│   │   ├── config.ts        # Firebase client configuration.
│   │   ├── index.ts         # Main Firebase initialization and hook exports.
│   │   ├── provider.tsx     # Core React Context provider for Firebase services.
│   │   └── server.ts        # Firebase Admin SDK initialization (for server-side use).
│   ├── hooks/
│   │   └── use-toast.ts     # Custom hook for displaying toast notifications.
│   ├── lib/
│   │   ├── actions.ts       # Barrel file exporting all server actions.
│   │   ├── ai-actions.ts    # Server Actions that call Genkit flows.
│   │   ├── user-actions.ts  # Server Actions for user profile management.
│   │   ├── payment-actions.ts # Server Actions for payment processing.
│   │   ├── definitions.ts   # Core TypeScript type definitions.
│   │   └── utils.ts         # Utility functions (e.g., `cn` for Tailwind classes).
│   └── ai/
│       ├── flows/           # Genkit AI flow definitions.
│       ├── genkit.ts        # Genkit initialization and configuration.
│       └── dev.ts           # Genkit development server entry point.
├── firestore.rules          # Security rules for the Firestore database.
└── next.config.ts           # Next.js configuration.
```

## 5. Key Architectural Concepts

### Authentication Flow

1.  **Client-Side Login**: The user logs in via the `LoginForm` component, which uses the Firebase client SDK (`signInWithEmailAndPassword`, etc.).
2.  **Session Cookie Creation**: Upon successful login, the client sends the Firebase ID token to the `/api/auth/session` API route. This route uses the Firebase Admin SDK to verify the token and create a secure, HTTP-only session cookie (`__session`).
3.  **Authenticated State**:
    -   On the client, the `useUser` hook provides the user's authentication state in real-time.
    -   On the server (in API Routes and Server Actions), the `__session` cookie is used to verify the user's identity using the Firebase Admin SDK. This is encapsulated in helper functions like `getUserIdFromServerSession`.

### Server Actions & Data Mutation

-   Next.js Server Actions are used for most form submissions and data mutations. This allows for direct communication between client components and server-side logic without needing to manually create API endpoints.
-   Security for these actions is primarily enforced in two places:
    1.  At the start of the action, by verifying the user's session cookie.
    2.  At the database level, via `firestore.rules`, which provide the ultimate security guarantee.

### AI Integration with Genkit

-   All generative AI logic is encapsulated in **Genkit flows** located in `src/ai/flows/`.
-   These flows define prompts, input/output schemas (using Zod), and the AI model to be used.
-   Server Actions in `src/lib/ai-actions.ts` act as a bridge between the client-side components and the Genkit flows. They perform necessary business logic (like deducting tokens) before invoking a flow and returning the result.

### Firestore Database Structure

-   The database is structured around user ownership. All user-specific data (brand stories, etc.) is stored in subcollections under that user's document in the main `/users` collection (e.g., `/users/{userId}/brandStories/{storyId}`).
-   This hierarchical structure makes security rules simple and efficient, as ownership can be verified simply by checking the path of the document against the requester's UID. The `docs/backend.json` file serves as a schema and blueprint for this structure.
```