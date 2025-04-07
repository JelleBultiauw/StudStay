# StudStay - Student Housing Rental App

A React Native (Expo) application for student housing rentals in Belgium.

## Features

- 🔐 Authentication with Supabase (Email & Google)
- 🏠 Kot listing and search system
- 💬 AI-powered chatbot for housing queries
- 💳 Stripe integration for payments
- 📱 Modern UI with TailwindCSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- OpenAI API key
- Stripe account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/studstay.git
cd studstay
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API keys:
- Supabase URL and anon key
- OpenAI API key
- Stripe publishable key

5. Start the development server:
```bash
npm start
```

## Project Structure

```
studstay/
├── app/              # Main application code
├── components/       # Reusable components
├── lib/             # Utility functions and configurations
├── navigation/      # Navigation setup
├── screens/         # Screen components
├── types/           # TypeScript type definitions
└── assets/          # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 