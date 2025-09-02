import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AppointmentsTabProps {
  appointments: any[];
  clients: any[];
  services: any[];
  professionals: any[];
  newAppointment: any;
  setNewAppointment: (appointment: any) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  clientSearch: string;
  setClientSearch: (search: string) => void;
  professionalFilter: string;
  setProfessionalFilter: (filter: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  onAddAppointment: (e: React.FormEvent) => void;
  onUpdateAppointmentStatus: (id: string, status: 'finalizado' | 'cancelado', reason?: string) => void;
  onBlockDate: (date: string) => void;
  onShowServiceForm: () => void;
}

export const AppointmentsTab = ({
  appointments,
  clients,
  services,
  professionals,
  newAppointment,
  setNewAppointment,
  selectedDate,
  setSelectedDate,
  clientSearch,
  setClientSearch,
  professionalFilter,
  setProfessionalFilter,
  dateFilter,
  setDateFilter,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onBlockDate,
  onShowServiceForm,
}: AppointmentsTabProps) => {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Novo Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddAppointment} className="space-y-4">
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
                    onClick={onShowServiceForm}
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
                          "w-full justify-start text-left font-normal bg-input border-border text-foreground",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-foreground">Horário</Label>
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
                <Input
                  id="notes"
                  placeholder="Observações do agendamento"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                Agendar
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Agendamentos de Hoje</CardTitle>
            <CardDescription className="text-muted-foreground">
              {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length} agendamentos para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <div className="flex gap-2">
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
              <Button
                variant="outline"
                onClick={() => {
                  const dateToBlock = window.prompt("Digite a data para bloquear (YYYY-MM-DD):");
                  if (dateToBlock && /^\d{4}-\d{2}-\d{2}$/.test(dateToBlock)) {
                    onBlockDate(dateToBlock);
                  }
                }}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                Bloquear Data
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.filter(apt => {
                const matchesDate = dateFilter ? apt.date === dateFilter : apt.date === new Date().toISOString().split('T')[0];
                const matchesProfessional = professionalFilter && professionalFilter !== "all" ? apt.professional === professionalFilter : true;
                return matchesDate && matchesProfessional;
              }).map((appointment) => {
                const service = services.find(s => s.name === appointment.service);
                
                return (
                  <div key={appointment.id} className="p-3 bg-secondary rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{appointment.client}</p>
                          <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(appointment.status || 'agendado')}`}>
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
                      <div className="flex flex-col gap-1 ml-2">
                        {appointment.status === 'agendado' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateAppointmentStatus(appointment.id, 'finalizado')}
                              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            >
                              Finalizar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = window.prompt("Motivo do cancelamento (opcional):");
                                onUpdateAppointmentStatus(appointment.id, 'cancelado', reason || undefined);
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
    </div>
  );
};