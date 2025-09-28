# Pashu Setu - Render Deployment Guide

## 🚀 Live Demo
- **Production URL**: [Your Render URL will be here]
- **Status**: [![Render Status](https://img.shields.io/badge/Render-Deployed-brightgreen)](https://render.com)

## 📋 Deployment Configuration

### Build Settings
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

### Environment Variables Required
```
VITE_SUPABASE_URL=https://liqvncjksywdybfbbxmk.supabase.co
VITE_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
VITE_VAPI_PUBLIC_KEY=[Your VAPI Key]
```

### Features Deployed
- ✅ React 18 + Vite Frontend
- ✅ Supabase Database Integration
- ✅ Voice Assistant (VAPI)
- ✅ Disease Analyzer with CNN Model
- ✅ Real-time Notifications
- ✅ Role-based Authentication
- ✅ Maternity Care System
- ✅ Education Hub
- ✅ Emergency Services

### Performance Optimizations
- Code splitting for vendor libraries
- Asset optimization
- Gzip compression
- CDN delivery via Render

## 🔧 Local Development
```bash
npm install
npm run dev
```

## 🏗️ Build for Production
```bash
npm run build
npm run preview
```