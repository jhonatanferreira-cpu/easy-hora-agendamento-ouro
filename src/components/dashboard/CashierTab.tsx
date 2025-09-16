import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";

interface CashierTabProps {
  payments: any[];
  clients: any[];
  services: any[];
  newPayment: any;
  setNewPayment: (payment: any) => void;
  onAddPayment: (e: React.FormEvent) => void;
  totalRevenue: number;
  onEditPayment: (payment: any) => void;
  onDeletePayment: (id: string) => void;
  editingPayment: any;
  setEditingPayment: (payment: any) => void;
}

export const CashierTab = ({
  payments,
  clients,
  services,
  newPayment,
  setNewPayment,
  onAddPayment,
  totalRevenue,
  onEditPayment,
  onDeletePayment,
  editingPayment,
  setEditingPayment,
}: CashierTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddPayment} className="space-y-4">
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
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{payment.client}</p>
                      <p className="text-sm text-muted-foreground">{payment.service}</p>
                      <p className="text-sm text-muted-foreground">{payment.date} - {payment.paymentMethod}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-success font-bold">R$ {payment.amount.toFixed(2)}</span>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPayment(payment)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
                              onDeletePayment(payment.id);
                            }
                          }}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
    </div>
  );
};