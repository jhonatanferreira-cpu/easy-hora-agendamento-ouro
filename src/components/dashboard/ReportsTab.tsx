import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar, Users, TrendingUp } from "lucide-react";

interface ReportsTabProps {
  totalRevenue: number;
  payments: any[];
  appointments: any[];
  clients: any[];
  services: any[];
  professionals: any[];
}

export const ReportsTab = ({
  totalRevenue,
  payments,
  appointments,
  clients,
  services,
  professionals,
}: ReportsTabProps) => {
  return (
    <div className="space-y-6">
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
                const profPayments = payments.filter(p => {
                  const apt = appointments.find(a => a.client === p.client && a.service === p.service);
                  return apt?.professional === professional.name;
                });
                const profTotal = profPayments.reduce((sum, p) => sum + p.amount, 0);
                return (
                  <div key={professional.id} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{professional.name}</p>
                      <p className="text-sm text-muted-foreground">{profAppointments.length} agendamentos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">R$ {profTotal.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{professional.specialty}</p>
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
          <CardTitle className="text-foreground">Formas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <span className="text-foreground">{methodNames[method as keyof typeof methodNames]}</span>
                  <span className="font-medium text-primary">R$ {methodTotal.toFixed(2)} ({methodPayments.length}x)</span>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};