# سرزمین محلول — نسخهٔ Static

این پروژه برای GitHub Pages ساخته شده و Backend اختصاصی ندارد. احراز هویت، پایگاه داده و ذخیرهٔ آواتار باید از Supabase استفاده کنند.

## قبل از اجرا

1. در `assets/supabase-config.js` مقدار `url` و `anonKey` پروژهٔ Supabase را قرار دهید.
2. فایل `assets/logo.png` را قرار دهید.
3. فایل `assets/vazirmatn.ttf` را قرار دهید.
4. فایل‌های مستندات را در `assets/docs/` قرار دهید:
   - `sound.mp3`
   - `jozve.pdf`

## تصویرهایی که باید خودتان بسازید

در نسخهٔ فعلی برای تصویرهای آموزشی جای اجباری تعریف نشده است، چون تصاویر درس‌نامه باید بعداً بر اساس محتوای واقعی استاد انتخاب شوند. اگر تصویری برای یک مبحث اضافه شد، آن را در `assets/images/` قرار دهید و همان مسیر را در دادهٔ آن مبحث وارد کنید.

## Supabase

پیشنهاد جدول `acc`:
- `id` uuid primary key references auth.users(id)
- `nickname` text unique not null
- `full_name` text not null
- `email` text unique nullable
- `avatar_url` text nullable
- `language` text
- `theme` text
- `created_at` timestamptz default now()

پیشنهاد جدول `quiz`:
- `user_id` uuid references auth.users(id)
- `quiz_key` text
- `question_id` text
- `answer_index` integer
- `correct` boolean
- `points` numeric
- `submitted_at` timestamptz
- unique(user_id, quiz_key, question_id)

برای امنیت، RLS را فعال کنید تا هر دانش‌آموز فقط رکوردهای خودش را ببیند/ثبت کند.

## نکتهٔ محتوایی

`jozve.pdf` در این پروژه به‌عنوان مرجع محتوایی مستقل در نظر گرفته نشده است. چون فایل صوتی استاد در محیط فعلی قابل تبدیل مستقیم به متن نبود، دادهٔ اولیهٔ درس‌نامه و Quiz از متن قابل‌دسترسیِ PDF ساخته شده‌اند و باید پس از فراهم‌شدن transcript صوت، با گفتار واقعی استاد تطبیق داده شوند.
