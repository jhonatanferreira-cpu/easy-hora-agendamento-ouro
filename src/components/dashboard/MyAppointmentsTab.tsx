import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface MyAppointmentsTabProps {
  appointments: any[];
  services: any[];
  professionals: any[];
  professionalFilter: string;
  setProfessionalFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}

export const MyAppointmentsTab = ({
  appointments,
  services,
  professionals,
  professionalFilter,
  setProfessionalFilter,
  dateFilter,
  setDateFilter,
}: MyAppointmentsTabProps) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finalizado': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};