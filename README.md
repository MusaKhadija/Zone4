# Zone4 - Foreign Exchange Platform

A secure, CBN-regulated foreign exchange platform connecting customers with verified BDC agents.

## Features

- 🔒 **Bank-Level Security** - Escrow protection and CBN compliance
- ✅ **Verified Partners** - Licensed BDC agents verified through NIN/BVN
- 📈 **Best Rates** - Compare live rates from multiple agents
- 📱 **Mobile-First** - Responsive design optimized for mobile devices
- 🛡️ **Dispute Resolution** - Built-in dispute management system

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Custom CSS Variables
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Backend**: Supabase (Database, Auth, Storage)
- **Deployment**: Netlify (Static Export)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zone4
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Netlify

### Automatic Deployment

1. **Connect Repository**: Link your GitHub/GitLab repository to Netlify
2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node.js version: `18`

3. **Set Environment Variables** in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**: Netlify will automatically build and deploy your site

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `out` directory to Netlify:
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=out
```

## Database Setup

The application uses Supabase for backend services. Run the migrations in the `supabase/migrations` directory to set up the database schema:

1. Install Supabase CLI
2. Link your project: `supabase link --project-ref your-project-ref`
3. Run migrations: `supabase db push`

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── shared/           # Reusable UI components
│   ├── exchange/         # Exchange flow components
│   └── ...
├── lib/                  # Utility functions and configurations
├── supabase/            # Database migrations and types
├── public/              # Static assets
└── ...
```

## Key Features Implementation

### Authentication & KYC
- Supabase Auth integration
- NIN/BVN verification
- Facial biometrics (liveness check)
- Document upload and verification

### Exchange System
- Real-time rate comparison
- Escrow-protected transactions
- Multi-step exchange flow
- Transaction tracking

### Security
- Row Level Security (RLS) policies
- Multi-factor authentication
- Biometric login support
- Secure file uploads

### User Types
- **Customers**: Individuals looking to exchange currency
- **BDC Agents**: Licensed agents providing exchange services

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@zone4.ng or join our community forum.