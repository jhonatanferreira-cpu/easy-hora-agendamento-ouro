import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";

interface ServicesTabProps {
  services: any[];
  newService: any;
  setNewService: (service: any) => void;
  onAddService: (e: React.FormEvent) => void;
  onEditService: (service: any) => void;
  onDeleteService: (id: string) => void;
  editingService: any;
  setEditingService: (service: any) => void;
}

export const ServicesTab = ({
  services,
  newService,
  setNewService,
  onAddService,
  onEditService,
  onDeleteService,
  editingService,
  setEditingService,
}: ServicesTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Serviço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddService} className="space-y-4">
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
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingService(service)}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
                            onDeleteService(service.id);
                          }
                        }}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
    </div>
  );
};