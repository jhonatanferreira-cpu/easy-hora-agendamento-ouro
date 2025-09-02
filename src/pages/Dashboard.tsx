import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, UserPlus, DollarSign, BarChart3, Settings, LogOut } from "lucide-react";
import { format } from "date-fns";

import { AppointmentsTab } from "@/components/dashboard/AppointmentsTab";
import { MyAppointmentsTab } from "@/components/dashboard/MyAppointmentsTab";
import { ClientsTab } from "@/components/dashboard/ClientsTab";
import { ServicesTab } from "@/components/dashboard/ServicesTab";
import { ProfessionalsTab } from "@/components/dashboard/ProfessionalsTab";
import { CashierTab } from "@/components/dashboard/CashierTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

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
            />
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <ClientsTab
              clients={clients}
              newClient={newClient}
              setNewClient={setNewClient}
              onAddClient={handleAddClient}
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <ServicesTab
              services={services}
              newService={newService}
              setNewService={setNewService}
              onAddService={handleAddService}
            />
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <ProfessionalsTab
              professionals={professionals}
              newProfessional={newProfessional}
              setNewProfessional={setNewProfessional}
              onAddProfessional={handleAddProfessional}
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
    </div>
  );
};

export default Dashboard;