import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ggceugzjxabjtrtogyey.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnY2V1Z3pqeGFianRydG9neWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzkwMjUsImV4cCI6MjA4ODcxNTAyNX0.MtebDHAKQ_asrc5y5UdJW8EhMwwZ2sqjsHHTrXysyLM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)