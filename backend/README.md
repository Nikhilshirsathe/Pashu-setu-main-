# Pashu Setu Backend API

Node.js Express server for Pashu Setu healthcare platform.

## Deployment

This backend provides APIs for:
- Animal management
- Health records
- Video consultations  
- Pharmacy orders
- AI health analytics

## Environment Variables

```
NODE_VERSION=20
SUPABASE_URL=https://liqvncjksywdybfbbxmk.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
```

## API Endpoints

- GET /health - Health check
- GET /api/animals - Get animals
- POST /api/consultations/request - Request consultation
- GET /api/pharmacy/medicines - Get medicines
- POST /api/health/analyze - AI health analysis