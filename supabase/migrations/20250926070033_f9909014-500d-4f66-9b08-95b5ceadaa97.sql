-- Criar tabela de salões
CREATE TABLE public.saloes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  endereco text,
  telefone text,
  logo text,
  link_publico text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS na tabela saloes
ALTER TABLE public.saloes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para saloes
CREATE POLICY "Users can view their own salon" 
ON public.saloes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own salon" 
ON public.saloes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salon" 
ON public.saloes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar tabela de profissionais com salon_id
CREATE TABLE public.profissionais (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  especialidade text NOT NULL,
  disponibilidade text,
  salon_id uuid NOT NULL REFERENCES public.saloes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profissionais
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profissionais
CREATE POLICY "Users can view professionals from their salon" 
ON public.profissionais 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = profissionais.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can insert professionals in their salon" 
ON public.profissionais 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = profissionais.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can update professionals from their salon" 
ON public.profissionais 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = profissionais.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can delete professionals from their salon" 
ON public.profissionais 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = profissionais.salon_id 
  AND saloes.user_id = auth.uid()
));

-- Criar tabela de serviços com salon_id
CREATE TABLE public.servicos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  preco decimal(10,2) NOT NULL,
  duracao integer NOT NULL DEFAULT 30,
  descricao text,
  salon_id uuid NOT NULL REFERENCES public.saloes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela servicos
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para servicos
CREATE POLICY "Users can view services from their salon" 
ON public.servicos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = servicos.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can insert services in their salon" 
ON public.servicos 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = servicos.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can update services from their salon" 
ON public.servicos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = servicos.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can delete services from their salon" 
ON public.servicos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = servicos.salon_id 
  AND saloes.user_id = auth.uid()
));

-- Criar tabela de clientes com salon_id
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  telefone text NOT NULL,
  email text,
  observacoes text,
  salon_id uuid NOT NULL REFERENCES public.saloes(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
CREATE POLICY "Users can view clients from their salon" 
ON public.clientes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = clientes.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can insert clients in their salon" 
ON public.clientes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = clientes.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can update clients from their salon" 
ON public.clientes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = clientes.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can delete clients from their salon" 
ON public.clientes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = clientes.salon_id 
  AND saloes.user_id = auth.uid()
));

-- Atualizar tabela de agendamentos para incluir salon_id e referenciar novas tabelas
ALTER TABLE public.agendamentos 
ADD COLUMN salon_id uuid REFERENCES public.saloes(id) ON DELETE CASCADE,
ADD COLUMN cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
ADD COLUMN servico_id uuid REFERENCES public.servicos(id) ON DELETE CASCADE,
ADD COLUMN profissional_id uuid REFERENCES public.profissionais(id) ON DELETE CASCADE;

-- Remover políticas antigas da tabela agendamentos
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.agendamentos;

-- Novas políticas RLS para agendamentos
CREATE POLICY "Users can view appointments from their salon" 
ON public.agendamentos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = agendamentos.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can insert appointments in their salon" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = agendamentos.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can update appointments from their salon" 
ON public.agendamentos 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = agendamentos.salon_id 
  AND saloes.user_id = auth.uid()
));

CREATE POLICY "Users can delete appointments from their salon" 
ON public.agendamentos 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.saloes 
  WHERE saloes.id = agendamentos.salon_id 
  AND saloes.user_id = auth.uid()
));

-- Políticas públicas para consulta de agendamentos (para link público)
CREATE POLICY "Public can view appointments by salon link" 
ON public.agendamentos 
FOR SELECT 
USING (TRUE);

CREATE POLICY "Public can view salons" 
ON public.saloes 
FOR SELECT 
USING (TRUE);

CREATE POLICY "Public can view professionals" 
ON public.profissionais 
FOR SELECT 
USING (TRUE);

CREATE POLICY "Public can view services" 
ON public.servicos 
FOR SELECT 
USING (TRUE);

CREATE POLICY "Public can view clients" 
ON public.clientes 
FOR SELECT 
USING (TRUE);

-- Função para criar salão automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user_salon()
RETURNS TRIGGER AS $$
DECLARE
  salon_link TEXT;
BEGIN
  -- Gerar link único para o salão
  salon_link := 'salon_' || LOWER(REPLACE(NEW.id::text, '-', ''));
  
  -- Criar salão padrão para o novo usuário
  INSERT INTO public.saloes (user_id, nome, link_publico)
  VALUES (NEW.id, 'Meu Salão', salon_link);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar salão automaticamente
CREATE TRIGGER on_auth_user_created_salon
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_salon();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_saloes_updated_at
BEFORE UPDATE ON public.saloes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profissionais_updated_at
BEFORE UPDATE ON public.profissionais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
BEFORE UPDATE ON public.servicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();