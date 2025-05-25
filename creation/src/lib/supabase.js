import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://kvyovfrlxruwsevqldyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2eW92ZnJseHJ1d3NldnFsZHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjI0MDMsImV4cCI6MjA2MzY5ODQwM30.W8ZK3fC3N2pAnNRqKvr2UdoMHmEwXtNDhuZAz_3C0R4'
)
