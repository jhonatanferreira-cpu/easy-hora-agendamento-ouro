import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, UserPlus, DollarSign, BarChart3, Settings, Plus, LogOut } from "lucide-react";

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

interface Appointment {
  id: string;
  client: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  notes: string;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("appointments");

  // States for data
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Form states
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", notes: "" });
  const [newProfessional, setNewProfessional] = useState({ name: "", specialty: "", availability: "" });
  const [newAppointment, setNewAppointment] = useState({ client: "", service: "", professional: "", date: "", time: "", notes: "" });
  const [newPayment, setNewPayment] = useState({ date: "", client: "", service: "", amount: "", paymentMethod: "", notes: "" });

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
    setAppointments(JSON.parse(localStorage.getItem("easyhora_appointments") || "[]"));
    setPayments(JSON.parse(localStorage.getItem("easyhora_payments") || "[]"));
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

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.client || !newAppointment.service || !newAppointment.date) {
      toast({ title: "Erro", description: "Cliente, serviço e data são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const appointment: Appointment = { ...newAppointment, id: Date.now().toString() };
    const updated = [...appointments, appointment];
    setAppointments(updated);
    localStorage.setItem("easyhora_appointments", JSON.stringify(updated));
    setNewAppointment({ client: "", service: "", professional: "", date: "", time: "", notes: "" });
    toast({ title: "Sucesso", description: "Agendamento criado com sucesso!" });
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
          <TabsList className="grid w-full grid-cols-6 bg-secondary">
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Profissionais</span>
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
                      <Input
                        id="client"
                        placeholder="Nome do cliente"
                        value={newAppointment.client}
                        onChange={(e) => setNewAppointment({ ...newAppointment, client: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service" className="text-foreground">Serviço</Label>
                      <Input
                        id="service"
                        placeholder="Tipo de serviço"
                        value={newAppointment.service}
                        onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="professional" className="text-foreground">Profissional</Label>
                      <Input
                        id="professional"
                        placeholder="Nome do profissional"
                        value={newAppointment.professional}
                        onChange={(e) => setNewAppointment({ ...newAppointment, professional: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-foreground">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                          className="bg-input border-border text-foreground"
                        />
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
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                      Salvar Agendamento
                    </Button>
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
                    {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).map((appointment) => (
                      <div key={appointment.id} className="p-4 bg-secondary rounded-lg border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{appointment.client}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                            <p className="text-sm text-muted-foreground">{appointment.time}</p>
                          </div>
                          <span className="text-primary font-medium">{appointment.professional}</span>
                        </div>
                      </div>
                    ))}
                    {todayAppointments === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nenhum agendamento para hoje</p>
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
                      <Input
                        id="paymentClient"
                        placeholder="Nome do cliente"
                        value={newPayment.client}
                        onChange={(e) => setNewPayment({ ...newPayment, client: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentService" className="text-foreground">Serviço</Label>
                      <Input
                        id="paymentService"
                        placeholder="Tipo de serviço"
                        value={newPayment.service}
                        onChange={(e) => setNewPayment({ ...newPayment, service: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
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
                        <SelectContent className="bg-popover border-border">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Faturamento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">R$ {totalRevenue.toFixed(2)}</div>
                  <p className="text-muted-foreground">Total de {payments.length} transações</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Agendamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{appointments.length}</div>
                  <p className="text-muted-foreground">Total de agendamentos</p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Clientes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{clients.length}</div>
                  <p className="text-muted-foreground">Clientes cadastrados</p>
                </CardContent>
              </Card>
            </div>
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
                    <Label htmlFor="salonName" className="text-foreground">Nome do Salão</Label>
                    <Input
                      id="salonName"
                      placeholder="Nome do seu salão"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salonAddress" className="text-foreground">Endereço</Label>
                    <Input
                      id="salonAddress"
                      placeholder="Endereço completo"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salonPhone" className="text-foreground">Telefone</Label>
                    <Input
                      id="salonPhone"
                      placeholder="(11) 99999-9999"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
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