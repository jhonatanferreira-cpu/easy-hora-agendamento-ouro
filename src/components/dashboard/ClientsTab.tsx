import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface ClientsTabProps {
  clients: any[];
  newClient: any;
  setNewClient: (client: any) => void;
  onAddClient: (e: React.FormEvent) => void;
}

export const ClientsTab = ({
  clients,
  newClient,
  setNewClient,
  onAddClient,
}: ClientsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddClient} className="space-y-4">
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
    </div>
  );
};