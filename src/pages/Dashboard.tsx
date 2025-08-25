import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, UserPlus, DollarSign, BarChart3, Settings, Plus, LogOut, Upload, Search, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
  email: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
  availability: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

interface Appointment {
  id: string;
  client: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  notes: string;
  status: 'agendado' | 'finalizado' | 'cancelado';
  cancelReason?: string;
}

interface Payment {
  id: string;
  date: string;
  client: string;
  service: string;
  amount: number;
  paymentMethod: string;
  notes: string;
}

interface SalonSettings {
  name: string;
  address: string;
  phone: string;
  logo: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("appointments");

  // States for data
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [salonSettings, setSalonSettings] = useState<SalonSettings>({ name: "", address: "", phone: "", logo: "" });

  // Form states
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", notes: "" });
  const [newProfessional, setNewProfessional] = useState({ name: "", specialty: "", availability: "" });
  const [newService, setNewService] = useState({ name: "", price: "", duration: "", description: "" });
  const [newAppointment, setNewAppointment] = useState({ client: "", service: "", professional: "", date: "", time: "", notes: "" });
  const [newPayment, setNewPayment] = useState({ date: "", client: "", service: "", amount: "", paymentMethod: "", notes: "" });

  // UI states
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [clientSearch, setClientSearch] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [showMyAppointments, setShowMyAppointments] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("easyhora_user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Load data from localStorage
    setClients(JSON.parse(localStorage.getItem("easyhora_clients") || "[]"));
    setProfessionals(JSON.parse(localStorage.getItem("easyhora_professionals") || "[]"));
    setServices(JSON.parse(localStorage.getItem("easyhora_services") || "[]"));
    
    // Load appointments and add default status if missing
    const loadedAppointments = JSON.parse(localStorage.getItem("easyhora_appointments") || "[]");
    const appointmentsWithStatus = loadedAppointments.map((apt: any) => ({
      ...apt,
      status: apt.status || 'agendado'
    }));
    setAppointments(appointmentsWithStatus);
    
    setPayments(JSON.parse(localStorage.getItem("easyhora_payments") || "[]"));
    setSalonSettings(JSON.parse(localStorage.getItem("easyhora_salon_settings") || '{"name":"","address":"","phone":"","logo":""}'));
    setBlockedDates(JSON.parse(localStorage.getItem("easyhora_blocked_dates") || "[]"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("easyhora_user");
    navigate("/");
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone) {
      toast({ title: "Erro", description: "Nome e telefone são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const client: Client = { ...newClient, id: Date.now().toString() };
    const updated = [...clients, client];
    setClients(updated);
    localStorage.setItem("easyhora_clients", JSON.stringify(updated));
    setNewClient({ name: "", phone: "", email: "", notes: "" });
    toast({ title: "Sucesso", description: "Cliente adicionado com sucesso!" });
  };

  const handleAddProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfessional.name || !newProfessional.specialty) {
      toast({ title: "Erro", description: "Nome e especialidade são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const professional: Professional = { ...newProfessional, id: Date.now().toString() };
    const updated = [...professionals, professional];
    setProfessionals(updated);
    localStorage.setItem("easyhora_professionals", JSON.stringify(updated));
    setNewProfessional({ name: "", specialty: "", availability: "" });
    toast({ title: "Sucesso", description: "Profissional adicionado com sucesso!" });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.price) {
      toast({ title: "Erro", description: "Nome e preço são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const service: Service = { 
      ...newService, 
      price: Number(newService.price),
      duration: Number(newService.duration) || 30,
      id: Date.now().toString() 
    };
    const updated = [...services, service];
    setServices(updated);
    localStorage.setItem("easyhora_services", JSON.stringify(updated));
    setNewService({ name: "", price: "", duration: "", description: "" });
    setShowServiceForm(false);
    toast({ title: "Sucesso", description: "Serviço adicionado com sucesso!" });
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalClient = clientSearch || newAppointment.client;
    const finalDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : newAppointment.date;
    
    if (!finalClient || !newAppointment.service || !finalDate) {
      toast({ title: "Erro", description: "Cliente, serviço e data são obrigatórios.", variant: "destructive" });
      return;
    }
    
    // Verificar se a data não está bloqueada
    if (blockedDates.includes(finalDate)) {
      toast({ title: "Erro", description: "Esta data está bloqueada para agendamentos.", variant: "destructive" });
      return;
    }
    
    const selectedService = services.find(s => s.name === newAppointment.service);
    const appointment: Appointment = { 
      ...newAppointment, 
      client: finalClient,
      date: finalDate,
      status: 'agendado',
      id: Date.now().toString() 
    };
    const updated = [...appointments, appointment];
    setAppointments(updated);
    localStorage.setItem("easyhora_appointments", JSON.stringify(updated));
    setNewAppointment({ client: "", service: "", professional: "", date: "", time: "", notes: "" });
    setSelectedDate(undefined);
    setClientSearch("");
    
    const serviceName = selectedService ? `${selectedService.name} (${selectedService.duration}min)` : newAppointment.service;
    toast({ 
      title: "Agendamento Confirmado!", 
      description: `${serviceName} agendado para ${format(new Date(finalDate), "dd/MM/yyyy")} às ${newAppointment.time}h com ${finalClient}` 
    });
  };
  
  const handleUpdateAppointmentStatus = (appointmentId: string, status: 'finalizado' | 'cancelado', cancelReason?: string) => {
    const updated = appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status, cancelReason: cancelReason || apt.cancelReason }
        : apt
    );
    setAppointments(updated);
    localStorage.setItem("easyhora_appointments", JSON.stringify(updated));
    
    const statusText = status === 'finalizado' ? 'finalizado' : 'cancelado';
    toast({ title: "Status Atualizado", description: `Agendamento ${statusText} com sucesso!` });
  };
  
  const handleBlockDate = (date: string) => {
    const updated = [...blockedDates, date];
    setBlockedDates(updated);
    localStorage.setItem("easyhora_blocked_dates", JSON.stringify(updated));
    toast({ title: "Data Bloqueada", description: `Data ${format(new Date(date), "dd/MM/yyyy")} bloqueada para agendamentos.` });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.date || !newPayment.client || !newPayment.amount) {
      toast({ title: "Erro", description: "Data, cliente e valor são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const payment: Payment = { ...newPayment, amount: Number(newPayment.amount), id: Date.now().toString() };
    const updated = [...payments, payment];
    setPayments(updated);
    localStorage.setItem("easyhora_payments", JSON.stringify(updated));
    setNewPayment({ date: "", client: "", service: "", amount: "", paymentMethod: "", notes: "" });
    toast({ title: "Sucesso", description: "Pagamento registrado com sucesso!" });
  };

  const handleSaveSettings = () => {
    localStorage.setItem("easyhora_salon_settings", JSON.stringify(salonSettings));
    toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        setSalonSettings(prev => ({ ...prev, logo: logoData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">EH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EasyHora</h1>
              <p className="text-muted-foreground">Bem-vindo, {user.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-secondary">
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="my-appointments" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Meus Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Profissionais</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="cashier" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Caixa</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAppointment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client" className="text-foreground">Cliente</Label>
                      <div className="relative">
                        <Input
                          id="client"
                          placeholder="Buscar ou digitar nome"
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            setNewAppointment({ ...newAppointment, client: e.target.value });
                          }}
                          className="bg-input border-border text-foreground"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      </div>
                      {clientSearch && (
                        <div className="bg-popover border border-border rounded-lg max-h-32 overflow-y-auto">
                          {clients
                            .filter(client => client.name.toLowerCase().includes(clientSearch.toLowerCase()))
                            .map(client => (
                              <div
                                key={client.id}
                                className="p-2 hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  setNewAppointment({ ...newAppointment, client: client.name });
                                  setClientSearch(client.name);
                                }}
                              >
                                <p className="text-foreground text-sm">{client.name}</p>
                                <p className="text-muted-foreground text-xs">{client.phone}</p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="service" className="text-foreground">Serviço</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowServiceForm(true)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                      <Select value={newAppointment.service} onValueChange={(value) => setNewAppointment({ ...newAppointment, service: value })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name} - R$ {service.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {showServiceForm && (
                      <Card className="border-primary">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-foreground">Novo Serviço</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <form onSubmit={handleAddService} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Nome do serviço"
                                value={newService.name}
                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                className="bg-input border-border text-foreground text-sm"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Preço"
                                value={newService.price}
                                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                className="bg-input border-border text-foreground text-sm"
                              />
                            </div>
                            <Input
                              type="number"
                              placeholder="Duração (min)"
                              value={newService.duration}
                              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                              className="bg-input border-border text-foreground text-sm"
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" className="gradient-primary text-primary-foreground">
                                Salvar
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => setShowServiceForm(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="professional" className="text-foreground">Profissional</Label>
                      <Select value={newAppointment.professional} onValueChange={(value) => setNewAppointment({ ...newAppointment, professional: value })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Selecione um profissional" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {professionals.map((professional) => (
                            <SelectItem key={professional.id} value={professional.name}>
                              {professional.name} - {professional.specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Data</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-input border-border",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecione uma data"}
                            </Button>
                          </PopoverTrigger>
                           <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                             <CalendarComponent
                               mode="single"
                               selected={selectedDate}
                               onSelect={setSelectedDate}
                               disabled={(date) => blockedDates.includes(format(date, "yyyy-MM-dd"))}
                               initialFocus
                               className="bg-popover pointer-events-auto"
                             />
                           </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-foreground">Hora</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-foreground">Observações</Label>
                      <Textarea
                        id="notes"
                        placeholder="Observações do agendamento"
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                        Salvar Agendamento
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setNewAppointment({ client: "", service: "", professional: "", date: "", time: "", notes: "" });
                          setSelectedDate(undefined);
                          setClientSearch("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Agendamentos Hoje</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {todayAppointments} agendamento(s) para hoje
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filtros */}
                    <div className="flex gap-2 mb-4">
                      <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                        <SelectTrigger className="w-[200px] bg-input border-border text-foreground">
                          <SelectValue placeholder="Filtrar por profissional" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="all">Todos os profissionais</SelectItem>
                          {professionals.map((prof) => (
                            <SelectItem key={prof.id} value={prof.name}>{prof.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-[200px] bg-input border-border text-foreground"
                        placeholder="Filtrar por data"
                      />
                    </div>
                    
                    {appointments.filter(apt => {
                      const matchesDate = dateFilter ? apt.date === dateFilter : apt.date === new Date().toISOString().split('T')[0];
                      const matchesProfessional = professionalFilter && professionalFilter !== "all" ? apt.professional === professionalFilter : true;
                      return matchesDate && matchesProfessional;
                    }).map((appointment) => {
                      const service = services.find(s => s.name === appointment.service);
                      const getStatusColor = (status: string) => {
                        switch(status) {
                          case 'agendado': return 'text-blue-500';
                          case 'finalizado': return 'text-green-500';
                          case 'cancelado': return 'text-gray-500';
                          default: return 'text-blue-500';
                        }
                      };
                      
                      return (
                        <div key={appointment.id} className="p-4 bg-secondary rounded-lg border border-border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-foreground">{appointment.client}</p>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(appointment.status)}`}>
                                  {(appointment.status || 'agendado').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {service ? `${service.name} (${service.duration}min)` : appointment.service}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.time}h</p>
                              <p className="text-sm text-primary">{appointment.professional}</p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              {appointment.status === 'agendado' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateAppointmentStatus(appointment.id, 'finalizado')}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Finalizar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const reason = window.prompt("Motivo do cancelamento (opcional):");
                                      handleUpdateAppointmentStatus(appointment.id, 'cancelado', reason || undefined);
                                    }}
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {appointment.cancelReason && (
                            <p className="text-xs text-muted-foreground mt-2">Motivo: {appointment.cancelReason}</p>
                          )}
                        </div>
                      );
                    })}
                    {appointments.filter(apt => {
                      const matchesDate = dateFilter ? apt.date === dateFilter : apt.date === new Date().toISOString().split('T')[0];
                      const matchesProfessional = professionalFilter ? apt.professional === professionalFilter : true;
                      return matchesDate && matchesProfessional;
                    }).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Agendamentos Hoje</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {todayAppointments} agendamento(s) para hoje
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     {appointments.filter(apt => {
                       const matchesDate = dateFilter ? apt.date === dateFilter : apt.date === new Date().toISOString().split('T')[0];
                       const matchesProfessional = professionalFilter && professionalFilter !== "all" ? apt.professional === professionalFilter : true;
                       return matchesDate && matchesProfessional;
                     }).map((appointment) => {
                       const service = services.find(s => s.name === appointment.service);
                       const getStatusColor = (status: string) => {
                         switch(status) {
                           case 'agendado': return 'text-blue-500';
                           case 'finalizado': return 'text-green-500';
                           case 'cancelado': return 'text-gray-500';
                           default: return 'text-blue-500';
                         }
                       };
                       
                       return (
                         <div key={appointment.id} className="p-4 bg-secondary rounded-lg border border-border">
                           <div className="flex justify-between items-start">
                             <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                 <p className="font-medium text-foreground">{appointment.client}</p>
                                 <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(appointment.status)}`}>
                                   {(appointment.status || 'agendado').toUpperCase()}
                                 </span>
                               </div>
                               <p className="text-sm text-muted-foreground">
                                 {service ? `${service.name} (${service.duration}min)` : appointment.service}
                               </p>
                               <p className="text-sm text-muted-foreground">{appointment.time}h</p>
                               <p className="text-sm text-primary">{appointment.professional}</p>
                             </div>
                             <div className="flex gap-2 ml-2">
                               {appointment.status === 'agendado' && (
                                 <>
                                   <Button
                                     size="sm"
                                     onClick={() => handleUpdateAppointmentStatus(appointment.id, 'finalizado')}
                                     className="bg-green-600 hover:bg-green-700 text-white"
                                   >
                                     Finalizar
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     onClick={() => {
                                       const reason = window.prompt("Motivo do cancelamento (opcional):");
                                       handleUpdateAppointmentStatus(appointment.id, 'cancelado', reason || undefined);
                                     }}
                                     className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                   >
                                     Cancelar
                                   </Button>
                                 </>
                               )}
                             </div>
                           </div>
                           {appointment.cancelReason && (
                             <p className="text-xs text-muted-foreground mt-2">Motivo: {appointment.cancelReason}</p>
                           )}
                         </div>
                       );
                     })}
                     {appointments.filter(apt => {
                       const matchesDate = dateFilter ? apt.date === dateFilter : apt.date === new Date().toISOString().split('T')[0];
                       const matchesProfessional = professionalFilter && professionalFilter !== "all" ? apt.professional === professionalFilter : true;
                       return matchesDate && matchesProfessional;
                     }).length === 0 && (
                       <p className="text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
                     )}
                   </div>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          {/* My Appointments Tab */}
          <TabsContent value="my-appointments" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Meus Agendamentos</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Visualize todos os seus agendamentos passados e futuros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-[200px] bg-input border-border text-foreground"
                        placeholder="Filtrar por data"
                      />
                      <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                        <SelectTrigger className="w-[200px] bg-input border-border text-foreground">
                          <SelectValue placeholder="Filtrar por profissional" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="all">Todos os profissionais</SelectItem>
                          {professionals.map((prof) => (
                            <SelectItem key={prof.id} value={prof.name}>{prof.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const dateToBlock = window.prompt("Digite a data para bloquear (YYYY-MM-DD):");
                          if (dateToBlock && /^\d{4}-\d{2}-\d{2}$/.test(dateToBlock)) {
                            handleBlockDate(dateToBlock);
                          }
                        }}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Bloquear Data
                      </Button>
                    </div>
                    
                    {appointments
                      .filter(apt => {
                        const matchesDate = dateFilter ? apt.date === dateFilter : true;
                        const matchesProfessional = professionalFilter && professionalFilter !== "all" ? apt.professional === professionalFilter : true;
                        return matchesDate && matchesProfessional;
                      })
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((appointment) => {
                        const service = services.find(s => s.name === appointment.service);
                        const getStatusColor = (status: string) => {
                          switch(status) {
                            case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
                            case 'finalizado': return 'bg-green-100 text-green-800 border-green-200';
                            case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
                            default: return 'bg-blue-100 text-blue-800 border-blue-200';
                          }
                        };
                        
                        return (
                          <div key={appointment.id} className="p-4 bg-secondary rounded-lg border border-border">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-medium text-foreground">{appointment.client}</p>
                                  <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(appointment.status)}`}>
                                    {(appointment.status || 'agendado').toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {service ? `${service.name} (${service.duration}min)` : appointment.service}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(appointment.date), "dd/MM/yyyy")} às {appointment.time}h
                                </p>
                                <p className="text-sm text-primary">{appointment.professional}</p>
                                {appointment.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">Obs: {appointment.notes}</p>
                                )}
                              </div>
                            </div>
                            {appointment.cancelReason && (
                              <p className="text-xs text-muted-foreground mt-2 p-2 bg-red-50 rounded">
                                Motivo do cancelamento: {appointment.cancelReason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    
                    {appointments.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum agendamento encontrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddClient} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName" className="text-foreground">Nome</Label>
                      <Input
                        id="clientName"
                        placeholder="Nome completo"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone" className="text-foreground">Telefone</Label>
                      <Input
                        id="clientPhone"
                        placeholder="(11) 99999-9999"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail" className="text-foreground">E-mail</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="cliente@email.com"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientNotes" className="text-foreground">Observações</Label>
                      <Textarea
                        id="clientNotes"
                        placeholder="Notas sobre o cliente"
                        value={newClient.notes}
                        onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                      Adicionar Cliente
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Lista de Clientes</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {clients.length} cliente(s) cadastrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {clients.map((client) => (
                      <div key={client.id} className="p-4 bg-secondary rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                            {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
                          </div>
                        </div>
                        {client.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{client.notes}</p>
                        )}
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum cliente cadastrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceName" className="text-foreground">Nome do Serviço</Label>
                      <Input
                        id="serviceName"
                        placeholder="Ex: Corte de Cabelo"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="servicePrice" className="text-foreground">Preço (R$)</Label>
                        <Input
                          id="servicePrice"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serviceDuration" className="text-foreground">Duração (min)</Label>
                        <Input
                          id="serviceDuration"
                          type="number"
                          placeholder="30"
                          value={newService.duration}
                          onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceDescription" className="text-foreground">Descrição</Label>
                      <Textarea
                        id="serviceDescription"
                        placeholder="Descrição do serviço"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                      Adicionar Serviço
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Lista de Serviços</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {services.length} serviço(s) cadastrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {services.map((service) => (
                      <div key={service.id} className="p-4 bg-secondary rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{service.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-lg font-bold text-primary">R$ {service.price.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">{service.duration} min</p>
                            </div>
                            {service.description && (
                              <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum serviço cadastrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddProfessional} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profName" className="text-foreground">Nome</Label>
                      <Input
                        id="profName"
                        placeholder="Nome completo"
                        value={newProfessional.name}
                        onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty" className="text-foreground">Especialidade</Label>
                      <Input
                        id="specialty"
                        placeholder="Ex: Cabelereiro, Manicure"
                        value={newProfessional.specialty}
                        onChange={(e) => setNewProfessional({ ...newProfessional, specialty: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability" className="text-foreground">Disponibilidade</Label>
                      <Input
                        id="availability"
                        placeholder="Ex: Seg-Sex 9h-18h"
                        value={newProfessional.availability}
                        onChange={(e) => setNewProfessional({ ...newProfessional, availability: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                      Adicionar Profissional
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Lista de Profissionais</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {professionals.length} profissional(is) cadastrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {professionals.map((professional) => (
                      <div key={professional.id} className="p-4 bg-secondary rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{professional.name}</p>
                            <p className="text-sm text-primary">{professional.specialty}</p>
                            {professional.availability && (
                              <p className="text-sm text-muted-foreground">{professional.availability}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {professionals.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum profissional cadastrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cashier Tab */}
          <TabsContent value="cashier" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate" className="text-foreground">Data</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={newPayment.date}
                        onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentClient" className="text-foreground">Cliente</Label>
                      <Select value={newPayment.client} onValueChange={(value) => setNewPayment({ ...newPayment, client: value })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name} - {client.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentService" className="text-foreground">Serviço</Label>
                      <Select value={newPayment.service} onValueChange={(value) => setNewPayment({ ...newPayment, service: value })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name} - R$ {service.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-foreground">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-foreground">Forma de Pagamento</Label>
                      <Select value={newPayment.paymentMethod} onValueChange={(value) => setNewPayment({ ...newPayment, paymentMethod: value })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                         <SelectContent className="bg-popover border-border z-50">
                           <SelectItem value="dinheiro">Dinheiro</SelectItem>
                           <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                           <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                           <SelectItem value="pix">PIX</SelectItem>
                         </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentNotes" className="text-foreground">Observações</Label>
                      <Textarea
                        id="paymentNotes"
                        placeholder="Observações do pagamento"
                        value={newPayment.notes}
                        onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                      Registrar Pagamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Movimentações Recentes</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Total: R$ {totalRevenue.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 bg-secondary rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{payment.client}</p>
                            <p className="text-sm text-muted-foreground">{payment.service}</p>
                            <p className="text-sm text-muted-foreground">{payment.date} - {payment.paymentMethod}</p>
                          </div>
                          <span className="text-success font-bold">R$ {payment.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum pagamento registrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" />
                    Faturamento Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">R$ {totalRevenue.toFixed(2)}</div>
                  <p className="text-muted-foreground">Total de {payments.length} transações</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Agendamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{appointments.length}</div>
                  <p className="text-muted-foreground">Total de agendamentos</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Clientes Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{clients.length}</div>
                  <p className="text-muted-foreground">Clientes cadastrados</p>
                </CardContent>
              </Card>

              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {appointments.filter(apt => {
                      const today = new Date();
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      const aptDate = new Date(apt.date);
                      return aptDate >= weekAgo && aptDate <= today;
                    }).length}
                  </div>
                  <p className="text-muted-foreground">Agendamentos esta semana</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Relatório por Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map(service => {
                      const servicePayments = payments.filter(p => p.service === service.name);
                      const serviceTotal = servicePayments.reduce((sum, p) => sum + p.amount, 0);
                      return (
                        <div key={service.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{servicePayments.length} realizados</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">R$ {serviceTotal.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Preço: R$ {service.price.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {services.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum serviço cadastrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Relatório por Profissional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {professionals.map(professional => {
                      const profAppointments = appointments.filter(apt => apt.professional === professional.name);
                      const profPayments = payments.filter(p => 
                        appointments.find(apt => apt.client === p.client && apt.service === p.service && apt.professional === professional.name)
                      );
                      const profTotal = profPayments.reduce((sum, p) => sum + p.amount, 0);
                      return (
                        <div key={professional.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{professional.name}</p>
                            <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                            <p className="text-xs text-muted-foreground">{profAppointments.length} agendamentos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">R$ {profTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                    {professionals.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum profissional cadastrado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="gradient-card shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Faturamento Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      R$ {payments.filter(p => p.date === new Date().toISOString().split('T')[0])
                        .reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Hoje</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      R$ {payments.filter(p => {
                        const today = new Date();
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        const paymentDate = new Date(p.date);
                        return paymentDate >= weekAgo && paymentDate <= today;
                      }).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Esta Semana</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      R$ {payments.filter(p => {
                        const today = new Date();
                        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                        const paymentDate = new Date(p.date);
                        return paymentDate >= monthAgo && paymentDate <= today;
                      }).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Este Mês</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">R$ {totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Geral</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Por Forma de Pagamento:</h4>
                  {['dinheiro', 'cartao-debito', 'cartao-credito', 'pix'].map(method => {
                    const methodPayments = payments.filter(p => p.paymentMethod === method);
                    const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
                    const methodNames = {
                      'dinheiro': 'Dinheiro',
                      'cartao-debito': 'Cartão de Débito', 
                      'cartao-credito': 'Cartão de Crédito',
                      'pix': 'PIX'
                    };
                    return methodTotal > 0 ? (
                      <div key={method} className="flex justify-between items-center p-2 bg-secondary rounded">
                        <span className="text-foreground">{methodNames[method]}</span>
                        <span className="font-medium text-primary">R$ {methodTotal.toFixed(2)} ({methodPayments.length}x)</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="gradient-card shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Configurações do Salão</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Personalize as configurações do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUpload" className="text-foreground">Logo do Salão</Label>
                    <div className="flex items-center space-x-4">
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logoUpload')?.click()}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Carregar Logo
                      </Button>
                      {salonSettings.logo && (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={salonSettings.logo} 
                            alt="Logo preview" 
                            className="w-12 h-12 object-cover rounded-lg border border-border"
                          />
                          <span className="text-sm text-success">Logo carregada!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salonName" className="text-foreground">Nome do Salão</Label>
                    <Input
                      id="salonName"
                      placeholder="Nome do seu salão"
                      value={salonSettings.name}
                      onChange={(e) => setSalonSettings(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salonAddress" className="text-foreground">Endereço</Label>
                    <Input
                      id="salonAddress"
                      placeholder="Endereço completo"
                      value={salonSettings.address}
                      onChange={(e) => setSalonSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salonPhone" className="text-foreground">Telefone</Label>
                    <Input
                      id="salonPhone"
                      placeholder="(11) 99999-9999"
                      value={salonSettings.phone}
                      onChange={(e) => setSalonSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveSettings} 
                    className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth"
                  >
                    Salvar Configurações
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Integração com IA</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure a integração com inteligência artificial para lembretes automáticos e insights personalizados.
                  </p>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Configurar IA (Em breve)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;