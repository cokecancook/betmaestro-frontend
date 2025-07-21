
# BetMaestro Frontend

BetMaestro is a modern, AI-powered betting assistant built with Next.js. The app provides users with an interactive experience for exploring betting strategies, managing a simulated wallet, and tracking bets.

## Dislclaimer
This is a Next.js vibe-coded frontend for BetMaestro. The app currently returns a dummy betting strategy and is **not connected to any cloud backend or live architecture**. The cloud deployment is no longer active, so all betting strategies are generated locally from static data.

<img width="1137" height="639" alt="betmaestro" src="https://github.com/user-attachments/assets/aa05de71-18f4-4cb3-82e1-040d1badf1ca" />

---

## Features

- **Chatbot Betting Assistant**: Interact with an AI-powered chatbot to receive betting strategy recommendations based on your wallet balance and chosen bet amount. The chatbot guides you through the process and provides suggested bets from static data.
- **Wallet Management**: View your current balance and recharge your wallet with a single click. All funds are simulated and stored locally.
- **My Bets**: Track your placed bets, including details like teams, odds, results, and gains. Bets are sorted by game date and stored locally.
- **User Profile**: Manage your account details, switch between Basic and Premium plans, and upload or reset your profile image. Premium users unlock simulated AI bet placement.
- **Theme Toggle**: Instantly switch between light and dark modes for a personalized experience.
- **Responsive UI**: Enjoy a modern, card-based layout with minimalist icons and smooth navigation across devices.


## Getting Started

1. **Clone the repository** (if you haven't already):
   ```sh
   git clone https://github.com/cokecancook/betmaestro.git
   cd betmaestro
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up your environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add your Gemini API key (to interact with the chatbot):
     ```env
     GEMINI_API_KEY=your-gemini-api-key-here
     ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Important Notes

- The frontend is **not connected** to any backend or cloud services. All betting strategies are generated from static dummy data found in `src/data/dummy-bet-strategy.json`.
- No real bets are placed, and no live odds or results are fetched.

## License

MIT
