-- Create usuarios table
CREATE TABLE public.usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  plano TEXT DEFAULT 'trial',
  trial_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trial_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create agendamentos table
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  servico TEXT NOT NULL,
  status TEXT DEFAULT 'agendado',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios
CREATE POLICY "Users can view their own profile" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for agendamentos
CREATE POLICY "Users can view their own appointments" 
ON public.agendamentos 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.usuarios WHERE usuarios.id = agendamentos.usuario_id AND usuarios.user_id = auth.uid()));

CREATE POLICY "Users can create their own appointments" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.usuarios WHERE usuarios.id = agendamentos.usuario_id AND usuarios.user_id = auth.uid()));

CREATE POLICY "Users can update their own appointments" 
ON public.agendamentos 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.usuarios WHERE usuarios.id = agendamentos.usuario_id AND usuarios.user_id = auth.uid()));

CREATE POLICY "Users can delete their own appointments" 
ON public.agendamentos 
FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.usuarios WHERE usuarios.id = agendamentos.usuario_id AND usuarios.user_id = auth.uid()));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (user_id, nome, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create user profile on registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();