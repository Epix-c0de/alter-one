# Supabase Edge Functions Outline for Altar One

## 1. `ai-song-ocr`

- **Trigger**: HTTP request from admin (image upload reference + parish_id).
- **Input**:
  - `parish_id`
  - `user_id`
  - `image_path` (Supabase Storage)
- **Flow**:
  1. Validate that caller is `role = admin` in `users` table and matches `parish_id`.
  2. Call external OCR + LLM service (e.g. OpenAI, Google Vision) to extract title, lyrics, and structure.
  3. Insert into `songs` with `parish_id`, `source = 'ocr'`.
  4. Update `ai_jobs` row with `status = 'completed'` and generated payload.

## 2. `ai-youtube-sync`

- **Trigger**: HTTP (manual sync) or scheduled cron.
- **Input**:
  - `parish_id`
  - `playlist_id` / `channel_id`
- **Flow**:
  1. Read `youtube_sync` config for that parish.
  2. Call YouTube Data API, fetch playlist videos.
  3. Upsert into `songs` table using `parish_id`, `source = 'youtube_sync'`.
  4. Save sync metadata back into `youtube_sync`.

## 3. `ai-reading-formatter`

- **Trigger**: HTTP; admin uploads raw text or PDF-derived text.
- **Input**:
  - `parish_id`
  - `raw_text`
  - `date`
- **Flow**:
  1. Use LLM prompt to reformat text into clean liturgical sections.
  2. Save as `readings` row with `parish_id`.

## 4. `ai-prayer-generator`

- **Trigger**: HTTP.
- **Input**:
  - `parish_id`
  - `theme`
  - optional `length` or `tone`
- **Flow**:
  1. Use LLM to generate prayer draft.
  2. Return draft to client; client lets admin edit and then saves into `prayers`.

## 5. `ai-announcement-assistant`

- **Trigger**: HTTP.
- **Input**:
  - `parish_id`
  - `topic`
  - `date`
  - `event_type`
- **Flow**:
  1. Build announcement template with LLM.
  2. Return for admin approval, then insert into `announcements`.

## 6. `subscription-verification`

- **Trigger**: HTTP from mobile app after payment (M-Pesa STK / Stripe webhook support).
- **Input**:
  - `user_id`
  - `parish_id`
  - `payment_reference`
- **Flow**:
  1. Verify payment via M-Pesa / Stripe APIs.
  2. If successful, set `is_subscribed = true` in `subscriptions` for that `user_id, parish_id`.


