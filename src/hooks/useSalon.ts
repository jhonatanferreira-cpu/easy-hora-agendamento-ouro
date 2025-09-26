import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Salon {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  logo: string;
  link_publico: string;
  user_id: string;
}

interface Professional {
  id: string;
  nome: string;
  especialidade: string;
  disponibilidade: string;
  salon_id: string;
}

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao: string;
  salon_id: string;
}

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  observacoes: string;
  salon_id: string;
}

interface Appointment {
  id: string;
  data_hora: string;
  status: string;
  salon_id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id: string;
  cliente?: Client;
  servico?: Service;
  profissional?: Professional;
}

export const useSalon = () => {
  const { toast } = useToast();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do salão
  const loadSalonData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar salão do usuário
      const { data: salonData, error: salonError } = await supabase
        .from('saloes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (salonError) {
        console.error('Erro ao carregar salão:', salonError);
        return;
      }

      setSalon(salonData);

      if (salonData) {
        // Carregar dados relacionados
        await Promise.all([
          loadProfessionals(salonData.id),
          loadServices(salonData.id),
          loadClients(salonData.id),
          loadAppointments(salonData.id)
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do salão:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionals = async (salonId: string) => {
    const { data, error } = await supabase
      .from('profissionais')
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      console.error('Erro ao carregar profissionais:', error);
      return;
    }

    setProfessionals(data || []);
  };

  const loadServices = async (salonId: string) => {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      console.error('Erro ao carregar serviços:', error);
      return;
    }

    setServices(data || []);
  };

  const loadClients = async (salonId: string) => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('salon_id', salonId);

    if (error) {
      console.error('Erro ao carregar clientes:', error);
      return;
    }

    setClients(data || []);
  };

  const loadAppointments = async (salonId: string) => {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        cliente:clientes(*),
        servico:servicos(*),
        profissional:profissionais(*)
      `)
      .eq('salon_id', salonId)
      .order('data_hora', { ascending: true });

    if (error) {
      console.error('Erro ao carregar agendamentos:', error);
      return;
    }

    setAppointments(data || []);
  };

  // CRUD Operations
  const updateSalon = async (updates: Partial<Salon>) => {
    if (!salon) return;

    try {
      const { error } = await supabase
        .from('saloes')
        .update(updates)
        .eq('id', salon.id);

      if (error) throw error;

      setSalon({ ...salon, ...updates });
      toast({ title: "Sucesso", description: "Salão atualizado com sucesso!" });
    } catch (error) {
      console.error('Erro ao atualizar salão:', error);
      toast({ title: "Erro", description: "Erro ao atualizar salão.", variant: "destructive" });
    }
  };

  const addProfessional = async (professional: Omit<Professional, 'id' | 'salon_id'>) => {
    if (!salon) return;

    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert([{ ...professional, salon_id: salon.id }])
        .select()
        .single();

      if (error) throw error;

      setProfessionals([...professionals, data]);
      toast({ title: "Sucesso", description: "Profissional adicionado com sucesso!" });
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
      toast({ title: "Erro", description: "Erro ao adicionar profissional.", variant: "destructive" });
    }
  };

  const updateProfessional = async (id: string, updates: Partial<Professional>) => {
    try {
      const { error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setProfessionals(professionals.map(p => p.id === id ? { ...p, ...updates } : p));
      toast({ title: "Sucesso", description: "Profissional atualizado com sucesso!" });
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast({ title: "Erro", description: "Erro ao atualizar profissional.", variant: "destructive" });
    }
  };

  const deleteProfessional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfessionals(professionals.filter(p => p.id !== id));
      toast({ title: "Sucesso", description: "Profissional excluído com sucesso!" });
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast({ title: "Erro", description: "Erro ao excluir profissional.", variant: "destructive" });
    }
  };

  const addService = async (service: Omit<Service, 'id' | 'salon_id'>) => {
    if (!salon) return;

    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([{ ...service, salon_id: salon.id }])
        .select()
        .single();

      if (error) throw error;

      setServices([...services, data]);
      toast({ title: "Sucesso", description: "Serviço adicionado com sucesso!" });
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      toast({ title: "Erro", description: "Erro ao adicionar serviço.", variant: "destructive" });
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setServices(services.map(s => s.id === id ? { ...s, ...updates } : s));
      toast({ title: "Sucesso", description: "Serviço atualizado com sucesso!" });
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast({ title: "Erro", description: "Erro ao atualizar serviço.", variant: "destructive" });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== id));
      toast({ title: "Sucesso", description: "Serviço excluído com sucesso!" });
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast({ title: "Erro", description: "Erro ao excluir serviço.", variant: "destructive" });
    }
  };

  const addClient = async (client: Omit<Client, 'id' | 'salon_id'>) => {
    if (!salon) return;

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...client, salon_id: salon.id }])
        .select()
        .single();

      if (error) throw error;

      setClients([...clients, data]);
      toast({ title: "Sucesso", description: "Cliente adicionado com sucesso!" });
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({ title: "Erro", description: "Erro ao adicionar cliente.", variant: "destructive" });
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso!" });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({ title: "Erro", description: "Erro ao atualizar cliente.", variant: "destructive" });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(clients.filter(c => c.id !== id));
      toast({ title: "Sucesso", description: "Cliente excluído com sucesso!" });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({ title: "Erro", description: "Erro ao excluir cliente.", variant: "destructive" });
    }
  };

  const addAppointment = async (appointment: {
    data_hora: string;
    status: string;
    cliente_id: string;
    servico_id: string;
    profissional_id: string;
  }) => {
    if (!salon) return;

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{ ...appointment, salon_id: salon.id }])
        .select(`
          *,
          cliente:clientes(*),
          servico:servicos(*),
          profissional:profissionais(*)
        `)
        .single();

      if (error) throw error;

      setAppointments([...appointments, data]);
      toast({ title: "Sucesso", description: "Agendamento criado com sucesso!" });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({ title: "Erro", description: "Erro ao criar agendamento.", variant: "destructive" });
    }
  };

  const updateAppointment = async (id: string, updates: {
    data_hora?: string;
    status?: string;
    cliente_id?: string;
    servico_id?: string;
    profissional_id?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAppointments(appointments.map(a => a.id === id ? { ...a, ...updates } : a));
      toast({ title: "Sucesso", description: "Agendamento atualizado com sucesso!" });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({ title: "Erro", description: "Erro ao atualizar agendamento.", variant: "destructive" });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(appointments.filter(a => a.id !== id));
      toast({ title: "Sucesso", description: "Agendamento excluído com sucesso!" });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({ title: "Erro", description: "Erro ao excluir agendamento.", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadSalonData();
  }, []);

  return {
    salon,
    professionals,
    services,
    clients,
    appointments,
    loading,
    updateSalon,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    addService,
    updateService,
    deleteService,
    addClient,
    updateClient,
    deleteClient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    loadSalonData
  };
};