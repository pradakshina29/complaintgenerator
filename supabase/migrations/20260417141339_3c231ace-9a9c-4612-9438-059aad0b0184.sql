-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  recipient_name TEXT,
  complaint_type TEXT NOT NULL CHECK (complaint_type IN ('College','Bank','Workplace','Other')),
  tone TEXT NOT NULL CHECK (tone IN ('Polite','Strict','Urgent')),
  severity TEXT NOT NULL CHECK (severity IN ('Low','Medium','High')),
  output_format TEXT NOT NULL CHECK (output_format IN ('Letter','Email')),
  language TEXT NOT NULL CHECK (language IN ('English','Tamil')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  quality_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Sent','Resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints"
  ON public.complaints FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own complaints"
  ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own complaints"
  ON public.complaints FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own complaints"
  ON public.complaints FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX idx_complaints_created_at ON public.complaints(created_at DESC);