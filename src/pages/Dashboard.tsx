import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, UserPlus, DollarSign, BarChart3, Settings, LogOut } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

import { AppointmentsTab } from "@/components/dashboard/AppointmentsTab";
import { MyAppointmentsTab } from "@/components/dashboard/MyAppointmentsTab";
import { ClientsTab } from "@/components/dashboard/ClientsTab";
import { ServicesTab } from "@/components/dashboard/ServicesTab";
import { ProfessionalsTab } from "@/components/dashboard/ProfessionalsTab";
import { CashierTab } from "@/components/dashboard/CashierTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

interface AppUser {
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
  type: 'entrada' | 'saida';
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
  const [newPayment, setNewPayment] = useState({ date: "", client: "", service: "", amount: "", paymentMethod: "", notes: "", type: "entrada" });

  // Edit states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // UI states
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [clientSearch, setClientSearch] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/login");
        } else {
          setUser(session.user);
        }
      }
    );

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

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    
    const payment: Payment = { ...newPayment, amount: Number(newPayment.amount), type: newPayment.type as 'entrada' | 'saida', id: Date.now().toString() };
    const updated = [...payments, payment];
    setPayments(updated);
    localStorage.setItem("easyhora_payments", JSON.stringify(updated));
    setNewPayment({ date: "", client: "", service: "", amount: "", paymentMethod: "", notes: "", type: "entrada" });
    
    const actionText = newPayment.type === 'entrada' ? 'registrada' : 'registrada';
    toast({ title: "Sucesso", description: `Movimentação ${actionText} com sucesso!` });
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
        const newSettings = { ...salonSettings, logo: logoData };
        setSalonSettings(newSettings);
        localStorage.setItem("easyhora_salon_settings", JSON.stringify(newSettings));
        toast({ title: "Sucesso", description: "Logo carregado e salvo com sucesso!" });
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit/Delete functions for clients
  const handleEditClient = (client: Client) => {
    const updated = clients.map(c => c.id === client.id ? client : c);
    setClients(updated);
    localStorage.setItem("easyhora_clients", JSON.stringify(updated));
    setEditingClient(null);
    toast({ title: "Sucesso", description: "Cliente atualizado com sucesso!" });
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem("easyhora_clients", JSON.stringify(updated));
    toast({ title: "Sucesso", description: "Cliente excluído com sucesso!" });
  };

  // Edit/Delete functions for professionals
  const handleEditProfessional = (professional: Professional) => {
    const updated = professionals.map(p => p.id === professional.id ? professional : p);
    setProfessionals(updated);
    localStorage.setItem("easyhora_professionals", JSON.stringify(updated));
    setEditingProfessional(null);
    toast({ title: "Sucesso", description: "Profissional atualizado com sucesso!" });
  };

  const handleDeleteProfessional = (id: string) => {
    const updated = professionals.filter(p => p.id !== id);
    setProfessionals(updated);
    localStorage.setItem("easyhora_professionals", JSON.stringify(updated));
    toast({ title: "Sucesso", description: "Profissional excluído com sucesso!" });
  };

  // Edit/Delete functions for services
  const handleEditService = (service: Service) => {
    const updated = services.map(s => s.id === service.id ? service : s);
    setServices(updated);
    localStorage.setItem("easyhora_services", JSON.stringify(updated));
    setEditingService(null);
    toast({ title: "Sucesso", description: "Serviço atualizado com sucesso!" });
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem("easyhora_services", JSON.stringify(updated));
    toast({ title: "Sucesso", description: "Serviço excluído com sucesso!" });
  };

  // Edit/Delete functions for payments
  const handleEditPayment = (payment: Payment) => {
    const updated = payments.map(p => p.id === payment.id ? payment : p);
    setPayments(updated);
    localStorage.setItem("easyhora_payments", JSON.stringify(updated));
    setEditingPayment(null);
    toast({ title: "Sucesso", description: "Pagamento atualizado com sucesso!" });
  };

  const handleDeletePayment = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    localStorage.setItem("easyhora_payments", JSON.stringify(updated));
    toast({ title: "Sucesso", description: "Pagamento excluído com sucesso!" });
  };

  // Edit/Delete functions for appointments
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleSaveEditedAppointment = (appointment: Appointment) => {
    const updated = appointments.map(a => a.id === appointment.id ? appointment : a);
    setAppointments(updated);
    localStorage.setItem("easyhora_appointments", JSON.stringify(updated));
    setEditingAppointment(null);
    toast({ title: "Sucesso", description: "Agendamento atualizado com sucesso!" });
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id);
    setAppointments(updated);
    localStorage.setItem("easyhora_appointments", JSON.stringify(updated));
    toast({ title: "Sucesso", description: "Agendamento excluído com sucesso!" });
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.type === 'entrada' ? payment.amount : -payment.amount), 0);
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center overflow-hidden">
              {salonSettings.logo ? (
                <img src={salonSettings.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary-foreground">EH</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EasyHora</h1>
              <p className="text-muted-foreground">Bem-vindo, {user?.user_metadata?.name || user?.email}</p>
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
            <AppointmentsTab
              appointments={appointments}
              clients={clients}
              services={services}
              professionals={professionals}
              newAppointment={newAppointment}
              setNewAppointment={setNewAppointment}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              clientSearch={clientSearch}
              setClientSearch={setClientSearch}
              professionalFilter={professionalFilter}
              setProfessionalFilter={setProfessionalFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onBlockDate={handleBlockDate}
              onShowServiceForm={() => setShowServiceForm(true)}
            />
          </TabsContent>

          {/* My Appointments Tab */}
          <TabsContent value="my-appointments" className="space-y-6">
            <MyAppointmentsTab
              appointments={appointments}
              services={services}
              professionals={professionals}
              professionalFilter={professionalFilter}
              setProfessionalFilter={setProfessionalFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
            />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <ClientsTab
              clients={clients}
              newClient={newClient}
              setNewClient={setNewClient}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              editingClient={editingClient}
              setEditingClient={setEditingClient}
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <ServicesTab
              services={services}
              newService={newService}
              setNewService={setNewService}
              onAddService={handleAddService}
              onEditService={handleEditService}
              onDeleteService={handleDeleteService}
              editingService={editingService}
              setEditingService={setEditingService}
            />
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <ProfessionalsTab
              professionals={professionals}
              newProfessional={newProfessional}
              setNewProfessional={setNewProfessional}
              onAddProfessional={handleAddProfessional}
              onEditProfessional={handleEditProfessional}
              onDeleteProfessional={handleDeleteProfessional}
              editingProfessional={editingProfessional}
              setEditingProfessional={setEditingProfessional}
            />
          </TabsContent>

          {/* Cashier Tab */}
          <TabsContent value="cashier" className="space-y-6">
            <CashierTab
              payments={payments}
              clients={clients}
              services={services}
              newPayment={newPayment}
              setNewPayment={setNewPayment}
              onAddPayment={handleAddPayment}
              totalRevenue={totalRevenue}
              onEditPayment={handleEditPayment}
              onDeletePayment={handleDeletePayment}
              editingPayment={editingPayment}
              setEditingPayment={setEditingPayment}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsTab
              totalRevenue={totalRevenue}
              payments={payments}
              appointments={appointments}
              clients={clients}
              services={services}
              professionals={professionals}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab
              salonSettings={salonSettings}
              setSalonSettings={setSalonSettings}
              onSaveSettings={handleSaveSettings}
              onLogoUpload={handleLogoUpload}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditClient(editingClient);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editClientName">Nome</Label>
                <Input
                  id="editClientName"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientPhone">Telefone</Label>
                <Input
                  id="editClientPhone"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientEmail">E-mail</Label>
                <Input
                  id="editClientEmail"
                  type="email"
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientNotes">Observações</Label>
                <Textarea
                  id="editClientNotes"
                  value={editingClient.notes}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Professional Dialog */}
      <Dialog open={!!editingProfessional} onOpenChange={() => setEditingProfessional(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Profissional</DialogTitle>
          </DialogHeader>
          {editingProfessional && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditProfessional(editingProfessional);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editProfName">Nome</Label>
                <Input
                  id="editProfName"
                  value={editingProfessional.name}
                  onChange={(e) => setEditingProfessional({ ...editingProfessional, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSpecialty">Especialidade</Label>
                <Input
                  id="editSpecialty"
                  value={editingProfessional.specialty}
                  onChange={(e) => setEditingProfessional({ ...editingProfessional, specialty: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAvailability">Disponibilidade</Label>
                <Input
                  id="editAvailability"
                  value={editingProfessional.availability}
                  onChange={(e) => setEditingProfessional({ ...editingProfessional, availability: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingProfessional(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          {editingService && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditService(editingService);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editServiceName">Nome do Serviço</Label>
                <Input
                  id="editServiceName"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editServicePrice">Preço (R$)</Label>
                  <Input
                    id="editServicePrice"
                    type="number"
                    step="0.01"
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editServiceDuration">Duração (min)</Label>
                  <Input
                    id="editServiceDuration"
                    type="number"
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editServiceDescription">Descrição</Label>
                <Textarea
                  id="editServiceDescription"
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditPayment(editingPayment);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editPaymentDate">Data</Label>
                <Input
                  id="editPaymentDate"
                  type="date"
                  value={editingPayment.date}
                  onChange={(e) => setEditingPayment({ ...editingPayment, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentClient">Cliente</Label>
                <Select value={editingPayment.client} onValueChange={(value) => setEditingPayment({ ...editingPayment, client: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentService">Serviço</Label>
                <Select value={editingPayment.service} onValueChange={(value) => setEditingPayment({ ...editingPayment, service: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} - R$ {service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAmount">Valor (R$)</Label>
                <Input
                  id="editAmount"
                  type="number"
                  step="0.01"
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment({ ...editingPayment, amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentMethod">Forma de Pagamento</Label>
                <Select value={editingPayment.paymentMethod} onValueChange={(value) => setEditingPayment({ ...editingPayment, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao-debito">Cartão de Débito</SelectItem>
                    <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentNotes">Observações</Label>
                <Textarea
                  id="editPaymentNotes"
                  value={editingPayment.notes}
                  onChange={(e) => setEditingPayment({ ...editingPayment, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveEditedAppointment(editingAppointment);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editAppClient">Cliente</Label>
                <Select value={editingAppointment.client} onValueChange={(value) => setEditingAppointment({ ...editingAppointment, client: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name} - {client.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAppService">Serviço</Label>
                <Select value={editingAppointment.service} onValueChange={(value) => setEditingAppointment({ ...editingAppointment, service: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} - R$ {service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAppProfessional">Profissional</Label>
                <Select value={editingAppointment.professional} onValueChange={(value) => setEditingAppointment({ ...editingAppointment, professional: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.name}>
                        {prof.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAppDate">Data</Label>
                  <Input
                    id="editAppDate"
                    type="date"
                    value={editingAppointment.date}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAppTime">Horário</Label>
                  <Input
                    id="editAppTime"
                    type="time"
                    value={editingAppointment.time}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAppNotes">Observações</Label>
                <Textarea
                  id="editAppNotes"
                  value={editingAppointment.notes}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingAppointment(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;