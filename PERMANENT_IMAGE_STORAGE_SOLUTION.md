# Permanent Media Storage Solution for Customer Images

## Summary of the Issue
When customer photos are uploaded, they are currently saved to the backend's local disk (`/media/`).
Because the backend is hosted on **Render**, the disk is **ephemeral (temporary)**:
1. Every new deployment (`git push`) or server restart destroys the container's disk.
2. The physical image files in `/media/` are wiped out.
3. PostgreSQL retains the database record, but Render returns **404 Not Found** when requested.
4. The frontend catches the 404 and displays the fallback letter monogram.

---

## The Permanent Solutions

### Option A: Cloudinary (Recommended — 5 Minutes)
1. **Install packages in backend:**
   ```bash
   pip install cloudinary django-cloudinary-storage
   ```
2. **Add to `backend/settings.py`:**
   ```python
   INSTALLED_APPS = [
       ...
       'cloudinary_storage',
       'django.contrib.staticfiles',
       'cloudinary',
       ...
   ]

   CLOUDINARY_STORAGE = {
       'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
       'API_KEY': os.getenv('CLOUDINARY_API_KEY'),
       'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
   }

   DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
   ```
3. **Set Environment Variables on Render & `.env`:**
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

### Option B: Supabase Storage (Using Existing Supabase Account)
1. Create a **public bucket** named `customer-photos` in your Supabase Dashboard.
2. Install `django-storages` and `boto3`.
3. Configure `STORAGES` in `backend/settings.py` with Supabase S3 credentials.

---

## Frontend Compatibility
The frontend (`src/app/(app)/dashboard/customers/page.tsx`) already contains automatic URL detection in `getCustomerImageUrl(path)`:
```typescript
if (path.startsWith("http://") || path.startsWith("https://")) return path;
```
Once Cloudinary or Supabase Storage is active, the backend returns direct HTTPS URLs (e.g. `https://res.cloudinary.com/...`). The frontend will immediately render them permanently with zero code changes needed.
