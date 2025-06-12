# Deployment Guide for Zone4

This guide covers deploying the Zone4 application to Netlify with proper configuration.

## Prerequisites

- Netlify account
- Supabase project with database migrations applied
- GitHub/GitLab repository (for automatic deployments)

## Netlify Configuration

### 1. Build Settings

The `netlify.toml` file in the project root contains all necessary build configuration:

- **Build Command**: `npm run build`
- **Publish Directory**: `out`
- **Node.js Version**: `18`

### 2. Environment Variables

Set these environment variables in your Netlify site settings:

#### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### How to Set Environment Variables in Netlify:
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each variable with its corresponding value

### 3. Deployment Methods

#### Option A: Automatic Deployment (Recommended)

1. **Connect Repository**:
   - In Netlify dashboard, click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your Zone4 repository

2. **Configure Build Settings**:
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `out` (auto-detected from netlify.toml)
   - Click "Deploy site"

3. **Set Environment Variables** (as described above)

4. **Trigger Redeploy** after setting environment variables

#### Option B: Manual Deployment

1. **Build Locally**:
```bash
npm install
npm run build
```

2. **Deploy using Netlify CLI**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=out
```

## Supabase Configuration

### 1. Database Setup

Ensure your Supabase database has the required schema:

```bash
# Using Supabase CLI
supabase link --project-ref your-project-ref
supabase db push
```

### 2. Row Level Security (RLS)

The migrations automatically set up RLS policies. Verify they're enabled:

1. Go to Supabase dashboard → Authentication → Policies
2. Ensure all tables have appropriate policies enabled

### 3. Storage Configuration

For file uploads (dispute evidence), ensure the storage bucket is configured:

1. Go to Supabase dashboard → Storage
2. Verify the `evidence` bucket exists with proper policies

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Netlify**:
   - Site settings → Domain management
   - Add custom domain

2. **DNS Configuration**:
   - Point your domain to Netlify's servers
   - Netlify will automatically provision SSL certificates

### HTTPS and Security

The `netlify.toml` includes security headers:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

## Performance Optimization

### Caching Strategy

Static assets are cached for 1 year:
- `/_next/static/*` - Next.js static assets
- `/static/*` - Public static files

### Build Optimization

- Uses `npm ci` for faster, more reliable builds
- Node.js 18 for optimal compatibility
- Static export for maximum performance

## Troubleshooting

### Common Issues

1. **Build Fails with Environment Variables**:
   - Ensure all required environment variables are set
   - Check variable names match exactly (case-sensitive)

2. **404 Errors on Client-Side Routes**:
   - The `netlify.toml` includes redirects for SPA behavior
   - All routes redirect to `/index.html` with 200 status

3. **Supabase Connection Issues**:
   - Verify environment variables are correct
   - Check Supabase project URL and keys
   - Ensure RLS policies allow access

4. **Build Timeout**:
   - Increase build timeout in Netlify settings
   - Optimize dependencies if needed

### Debug Steps

1. **Check Build Logs**:
   - Netlify dashboard → Deploys → View build log

2. **Test Locally**:
```bash
npm run build
npx serve out
```

3. **Verify Environment Variables**:
```bash
# In your deployed site's function logs
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

## Monitoring and Maintenance

### Analytics

Consider adding:
- Netlify Analytics
- Google Analytics
- Supabase Analytics

### Error Monitoring

Recommended tools:
- Sentry for error tracking
- LogRocket for session replay
- Netlify's built-in error reporting

### Performance Monitoring

- Lighthouse CI for performance testing
- Web Vitals monitoring
- Netlify's performance insights

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **HTTPS**: Always use HTTPS in production (automatic with Netlify)
3. **CSP Headers**: Consider adding Content Security Policy headers
4. **Regular Updates**: Keep dependencies updated for security patches

## Backup and Recovery

1. **Database Backups**: Supabase provides automatic backups
2. **Code Backups**: Use Git for version control
3. **Environment Variables**: Document all required variables
4. **Deployment Rollback**: Netlify allows easy rollback to previous deployments

For additional support, refer to:
- [Netlify Documentation](https://docs.netlify.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)