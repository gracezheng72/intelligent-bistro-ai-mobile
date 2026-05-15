# Intelligent Bistro — BistroBot

A mobile-first React Native (Expo) ordering app with a Node.js/Express backend. Users can browse a fast-food menu, manage a cart manually, or ask an AI assistant to update the cart with natural language.

## Tech Stack

### Mobile
- React Native
- Expo / Expo Go
- TypeScript
- Zustand for cart state management
- React Native StyleSheet for stable mobile-first styling

### Backend
- Node.js
- Express
- TypeScript
- OpenRouter free model for natural language parsing
- Local fallback parser for demo reliability

## Core Requirements Covered

- **Visual Excellence:** mobile-first fast-food ordering UI with home, menu, cart, and AI assistant screens.
- **Conversational Logic:** backend parses natural language such as `Add two spicy chicken sandwiches and a Coke` into structured JSON cart actions.
- **State Management:** cart supports add, remove, quantity updates, replace item/type, and clear cart through both UI and AI.
- **Backend:** Node.js Express API processes natural language and returns structured responses/actions.

## Project Structure

```text
intelligent-bistro-mobile-app/
│
├── backend/                         # Node.js + Express backend
│   ├── src/
│   │   ├── server.ts                # Backend entry point, starts Express server
│   │   │
│   │   ├── controllers/
│   │   │   └── menuController.ts    # Handles menu API responses
│   │   │
│   │   ├── routes/
│   │   │   ├── menu.routes.ts       # GET /api/menu
│   │   │   └── ai.routes.ts         # POST /api/ai/parse-order
│   │   │
│   │   ├── services/
│   │   │   ├── aiParserService.ts   # Calls OpenRouter LLM and parses JSON actions
│   │   │   ├── fallbackParserService.ts
│   │   │   │                         # Local backup parser when API is unavailable
│   │   │   ├── menuService.ts       # Provides menu data
│   │   │   └── validateCartActions.ts
│   │   │                             # Validates add/remove/update actions
│   │   │
│   │   ├── data/
│   │   │   └── menu.ts              # Menu items, prices, categories, image URLs
│   │   │
│   │   ├── types/
│   │   │   ├── ai.ts                # AI response and action types
│   │   │   ├── cart.ts              # Cart item types
│   │   │   └── menu.ts              # Menu item types
│   │   │
│   │   └── utils/
│   │       └── numberWords.ts       # Converts words like "two" into numbers
│   │
│   ├── .env.example                 # Example environment variables
│   ├── package.json                 # Backend dependencies and scripts
│   └── tsconfig.json                # TypeScript config
│
├── mobile/                          # React Native Expo mobile app
│   ├── app/
│   │   ├── index.tsx                # Home screen
│   │   ├── menu.tsx                 # Menu browsing screen
│   │   ├── cart.tsx                 # Shopping cart screen
│   │   └── assistant.tsx            # Conversational AI assistant screen
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── MenuListItem.tsx     # Menu row with image, price, and add button
│   │   │   ├── CartItemRow.tsx      # Cart item with plus/minus/delete controls
│   │   │   ├── ChatBubble.tsx       # User/assistant chat bubbles
│   │   │   ├── FloatingAIButton.tsx # Floating AI assistant shortcut
│   │   │   └── CategoryChips.tsx    # Category filter buttons
│   │   │
│   │   ├── services/
│   │   │   └── api.ts               # Calls backend APIs from the mobile app
│   │   │
│   │   ├── store/
│   │   │   └── cartStore.ts         # Zustand cart state management
│   │   │
│   │   ├── types/
│   │   │   ├── ai.ts                # Frontend AI action types
│   │   │   ├── cart.ts              # Frontend cart types
│   │   │   └── menu.ts              # Frontend menu types
│   │   │
│   │   └── constants/
│   │       └── config.ts            # API base URL and app config
│   │
│   ├── app.json                     # Expo app configuration
│   ├── babel.config.js              # Babel config for Expo
│   ├── package.json                 # Mobile dependencies and scripts
│   └── tsconfig.json                # TypeScript config
│
├── README.md                        # Setup, run instructions, and project overview
├── package.json                     # Root scripts for installing both projects
└── .gitignore                       # Ignores node_modules, .env, and build files
```

## Setup

Install all dependencies:

```bash
npm run install:all
```

Or install separately:

```bash
cd backend
npm install

cd ../mobile
npm install
```

## Configure OpenRouter

Create a backend `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=4000
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=openrouter/free
OPENROUTER_SITE_URL=http://localhost:8081
OPENROUTER_APP_NAME=Intelligent Bistro
```

Do not commit `.env` to GitHub.

If no OpenRouter key is provided, the backend still runs with a deterministic fallback parser. The UI does not show fallback/debug text to users.

## Run the Backend

In Terminal 1:

```bash
cd backend
npm run dev
```

Expected output:

```text
Intelligent Bistro backend running on http://localhost:4000
```

## Test the AI Endpoint Directly

In another terminal:

```bash
curl -X POST http://localhost:4000/api/ai/parse-order \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add two spicy chicken sandwiches and a Coke",
    "cart": []
  }'
```

Expected response shape:

```json
{
  "intent": "add_items",
  "actions": [
    { "type": "add", "itemId": "spicy_chicken_sandwich", "quantity": 2 },
    { "type": "add", "itemId": "coke", "quantity": 1 }
  ],
  "assistantMessage": "Added 2 Spicy Chicken Sandwiches and 1 Coke to your cart.",
  "source": "openrouter"
}
```

The `source` field is for debugging only. The mobile UI only shows the user-friendly assistant message.

## Run the Mobile App with Expo Go

In Terminal 2:

```bash
cd mobile
npx expo start -c
```

Open Expo Go on your iPhone and scan the QR code shown in the terminal.

Make sure your phone and computer are on the same Wi-Fi network. The Expo app connects to the Node.js backend for AI cart actions.


## Expo Go compatibility

Start the Expo mobile app from the `mobile` folder:

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npx expo start
```


## Latest UI notes
- Cart keeps a floating AI Assistant shortcut even after items are added.
- OpenRouter default model is `openrouter/free` for better free-tier availability.

