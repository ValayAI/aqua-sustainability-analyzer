// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kkjzpbbecrsbqxvruahh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranpwYmJlY3JzYnF4dnJ1YWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0OTM0NjksImV4cCI6MjA1NzA2OTQ2OX0.3vKlFiP8ngBJWwENCmBAO7AknrUcetHFlHmA0g9i6k4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);