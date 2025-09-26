import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, Mail } from "lucide-react";
import { format, addDays, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface Salon {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  logo: string;
  link_publico: string;
}

interface Professional {
  id: string;
  nome: string;
  especialidade: string;
  disponibilidade: string;
}

interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao: number;
  descricao: string;
}

interface Appointment {
  id: string;
  data_hora: string;
  status: string;
}

const AgendaPublica = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    observacoes: "",
    servico_id: "",
    profissional_id: "",
    data: "",
    horario: ""
  });

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = addDays(new Date(), i);
      if (!isWeekend(date)) {
        dates.push(date);
      }
    }
    return dates;
  };

  const getAvailableTimeSlots = () => {
    if (!formData.data || !formData.profissional_id) return timeSlots;
    
    const occupiedSlots = existingAppointments
      .filter(apt => {
        const appointmentDate = format(new Date(apt.data_hora), "yyyy-MM-dd");
        return appointmentDate === formData.data && apt.status === 'agendado';
      })
      .map(apt => format(new Date(apt.data_hora), "HH:mm"));
    
    return timeSlots.filter(slot => !occupiedSlots.includes(slot));
  };

  useEffect(() => {
    const loadSalonData = async () => {
      if (!salonId) {
        navigate("/");
        return;
      }

      try {
        // Carregar dados do salão
        const { data: salonData, error: salonError } = await supabase
          .from('saloes')
          .select('*')
          .eq('link_publico', salonId)
          .single();

        if (salonError || !salonData) {
          toast({
            title: "Salão não encontrado",
            description: "O link do salão não é válido.",
            variant: "destructive"
          });
          navigate("/");
          return;
        }

        setSalon(salonData);

        // Carregar profissionais
        const { data: professionalsData } = await supabase
          .from('profissionais')
          .select('*')
          .eq('salon_id', salonData.id);

        setProfessionals(professionalsData || []);

        // Carregar serviços
        const { data: servicesData } = await supabase
          .from('servicos')
          .select('*')
          .eq('salon_id', salonData.id);

        setServices(servicesData || []);

        // Carregar agendamentos existentes
        const { data: appointmentsData } = await supabase
          .from('agendamentos')
          .select('id, data_hora, status')
          .eq('salon_id', salonData.id)
          .gte('data_hora', new Date().toISOString());

        setExistingAppointments(appointmentsData || []);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do salão.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSalonData();
  }, [salonId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone || !formData.servico_id || !formData.profissional_id || !formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se o cliente já existe
      let { data: existingClient } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', formData.telefone)
        .eq('salon_id', salon!.id)
        .single();

      let clientId = existingClient?.id;

      // Se cliente não existe, criar novo
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clientes')
          .insert([{
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            observacoes: formData.observacoes,
            salon_id: salon!.id
          }])
          .select('id')
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Criar agendamento
      const dataHora = new Date(`${formData.data}T${formData.horario}:00`);
      
      const { error: appointmentError } = await supabase
        .from('agendamentos')
        .insert({
          cliente_id: clientId,
          servico_id: formData.servico_id,
          profissional_id: formData.profissional_id,
          salon_id: salon!.id,
          data_hora: dataHora.toISOString(),
          status: 'agendado'
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: "Agendamento Confirmado!",
        description: `Seu agendamento foi confirmado para ${format(dataHora, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.`
      });

      // Limpar formulário
      setFormData({
        nome: "",
        telefone: "",
        email: "",
        observacoes: "",
        servico_id: "",
        profissional_id: "",
        data: "",
        horario: ""
      });

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Salão não encontrado</CardTitle>
            <CardDescription>O link fornecido não é válido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
            {salon.logo ? (
              <img src={salon.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary-foreground">
                {salon.nome.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{salon.nome}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {salon.telefone}
            </p>
          </div>
        </div>
      </header>

      {/* Formulário de Agendamento */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6" />
                Agendar Horário
              </CardTitle>
              <CardDescription>
                Preencha os dados abaixo para agendar seu horário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servico">Serviço *</Label>
                    <Select
                      value={formData.servico_id}
                      onValueChange={(value) => setFormData({ ...formData, servico_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.nome} - R$ {service.preco.toFixed(2)} ({service.duracao}min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profissional">Profissional *</Label>
                    <Select
                      value={formData.profissional_id}
                      onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((professional) => (
                          <SelectItem key={professional.id} value={professional.id}>
                            {professional.nome} - {professional.especialidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data *</Label>
                    <Select
                      value={formData.data}
                      onValueChange={(value) => setFormData({ ...formData, data: value, horario: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a data" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableDates().map((date) => (
                          <SelectItem key={date.toISOString()} value={format(date, "yyyy-MM-dd")}>
                            {format(date, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horario">Horário *</Label>
                    <Select
                      value={formData.horario}
                      onValueChange={(value) => setFormData({ ...formData, horario: value })}
                      disabled={!formData.data}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTimeSlots().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Alguma observação especial?"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-semibold py-3"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Confirmar Agendamento
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgendaPublica;