# Vercel Deployment Guide for GradeMe

## Prerequisites

1. A Vercel account (free tier works)
2. Vercel CLI installed (optional but recommended)
3. Your environment variables ready

## Deployment Steps

### 1. Prepare Your Environment Variables

You'll need to add the following environment variables in Vercel:

- `DATABASE_URL` - Your PostgreSQL connection string from Supabase
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SESSION_SECRET` - A secure random string for session encryption
- `SENDGRID_API_KEY` - (Optional) For email notifications
- `SENDGRID_FROM_EMAIL` - (Optional) Your verified sender email

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the configuration from `vercel.json`
5. Add your environment variables in the "Environment Variables" section
6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 3. Post-Deployment Setup

1. **Update your Supabase URL Rules**:
   - Add your Vercel domain to allowed URLs in Supabase dashboard
   - Update CORS settings if needed

2. **Test the Deployment**:
   - Visit your Vercel URL
   - Try logging in with admin credentials
   - Test student login functionality
   - Verify database connections

### 4. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Important Notes

- The build process compiles both frontend and backend code
- API routes are handled through Vercel serverless functions
- Static assets are served through Vercel's CDN
- Database connections are pooled automatically

## Troubleshooting

### Build Failures
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if your database allows connections from Vercel IPs
- Ensure SSL is enabled in connection string

### Session Issues
- Make sure SESSION_SECRET is set
- Check cookie settings for production environment

## Support

For issues specific to:
- Vercel deployment: Check [Vercel documentation](https://vercel.com/docs)
- Supabase: Visit [Supabase documentation](https://supabase.com/docs)
- Application bugs: Check the project repository