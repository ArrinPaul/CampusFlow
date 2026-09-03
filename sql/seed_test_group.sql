-- Optional: Run this in your Supabase SQL Editor if you want a dummy Telegram Group to test the Invite Page!

INSERT INTO public.telegram_groups (
  telegram_chat_id, 
  name, 
  invite_link
)
VALUES (
  -999999999,
  'CS101: Test Invite Group',
  'http://localhost:3000/join?chat_id=-999999999'
)
ON CONFLICT (telegram_chat_id) DO NOTHING;
