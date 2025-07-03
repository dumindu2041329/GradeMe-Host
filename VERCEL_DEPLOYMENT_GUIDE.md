# Vercel Deployment Guide for GradeMe

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Your existing Supabase project with database
3. **SendGrid Account**: For email notifications (optional)

## Step-by-Step Deployment

### 1. Connect Your Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository or upload the project files
4. Vercel will automatically detect your project type

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# Database (Required)
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Session Security (Required)
SESSION_SECRET=your_random_secret_key

# Email (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email

# Frontend URL (Required)
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 3. Build Configuration

Vercel will use these settings from your `vercel.json`:

- **Build Command**: `npm run build` (from package.json)
- **Output Directory**: `client/dist`
- **Node.js Runtime**: 18.x

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Important Notes

### Database Setup
- Your Supabase database will be automatically initialized on first run
- Tables, buckets, and initial data will be created automatically
- No manual database setup required

### File Storage
- Profile images and exam papers will be stored in Supabase Storage
- Buckets are created automatically during deployment

### Domain Configuration
- Update your `FRONTEND_URL` environment variable with your actual Vercel domain
- Configure CORS settings if needed

### Performance Optimization
- Static assets are served from Vercel's CDN
- API routes run as serverless functions
- Database connections are optimized for serverless

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your DATABASE_URL format
   - Verify Supabase credentials are correct

2. **CORS Issues**
   - Ensure FRONTEND_URL matches your Vercel domain
   - Check API routes are properly configured

3. **Build Failures**
   - Verify all dependencies are in package.json
   - Check TypeScript compilation errors

### Environment Variables

Make sure all required environment variables are set in Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable from the `.env.example` file
3. Redeploy after adding variables

## Post-Deployment

1. **Test Login**: Use your admin credentials to test the system
2. **Email Setup**: Configure SendGrid if you want email notifications
3. **Custom Domain**: Add your custom domain in Vercel settings (optional)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Test API endpoints individually
4. Verify environment variables are set correctly

Your GradeMe exam management system is now ready for production use on Vercel!