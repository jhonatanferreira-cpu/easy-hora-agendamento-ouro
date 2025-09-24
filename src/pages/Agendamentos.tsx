import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calendar, Clock, User, LogOut } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  trial_end: string;
  plano: string;
}

interface Agendamento {
  id: string;
  data_hora: string;
  servico: string;
  status: string;
  created_at: string;
}

const Agendamentos = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [newAgendamento, setNewAgendamento] = useState({
    data_hora: "",
    servico: "",
  });
  const [loading, setLoading] = useState(false);
  const [trialDays, setTrialDays] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    
    await loadUserData();
    await loadAgendamentos();
  };

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading user:', error);
      return;
    }

    setUsuario(usuario);
    
    // Calculate trial days remaining
    const trialEnd = new Date(usuario.trial_end);
    const today = new Date();
    const diffTime = trialEnd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setTrialDays(Math.max(0, diffDays));
  };

  const loadAgendamentos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's usuario record first
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!usuarioData) return;

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('usuario_id', usuarioData.id)
      .order('data_hora', { ascending: true });

    if (error) {
      console.error('Error loading appointments:', error);
      return;
    }

    setAgendamentos(agendamentos || []);
  };

  const createAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgendamento.data_hora || !newAgendamento.servico) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!usuario) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert({
          usuario_id: usuario.id,
          data_hora: newAgendamento.data_hora,
          servico: newAgendamento.servico,
          status: 'agendado'
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar agendamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Agendamento criado!",
        description: "Seu agendamento foi criado com sucesso.",
      });

      setNewAgendamento({ data_hora: "", servico: "" });
      await loadAgendamentos();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('agendamentos')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do agendamento.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Status atualizado!",
      description: "O status do agendamento foi atualizado.",
    });

    await loadAgendamentos();
  };

  const deleteAgendamento = async (id: string) => {
    if (!confirm("Deseja realmente excluir este agendamento?")) return;

    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Agendamento excluído!",
      description: "O agendamento foi excluído com sucesso.",
    });

    await loadAgendamentos();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-500 text-white';
      case 'confirmado':
        return 'bg-green-500 text-white';
      case 'cancelado':
        return 'bg-red-500 text-white';
      case 'concluido':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Bem-vindo, {usuario.nome}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Trial Status */}
        {usuario.plano === 'trial' && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Período de teste grátis</CardTitle>
              <CardDescription className="text-orange-600">
                {trialDays > 0 
                  ? `Restam ${trialDays} dias do seu teste grátis.`
                  : "Seu período de teste expirou. Assine um plano para continuar."
                }
              </CardDescription>
            </CardHeader>
            {trialDays <= 3 && (
              <CardContent>
                <Button 
                  onClick={() => navigate('/planos')}
                  className="gradient-primary"
                >
                  Assinar Plano Agora
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Appointment Form */}
          <div className="lg:col-span-1">
            <Card className="gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createAgendamento} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_hora">Data e Hora</Label>
                    <Input
                      id="data_hora"
                      type="datetime-local"
                      value={newAgendamento.data_hora}
                      onChange={(e) => setNewAgendamento({...newAgendamento, data_hora: e.target.value})}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servico">Serviço</Label>
                    <Select
                      value={newAgendamento.servico}
                      onValueChange={(value) => setNewAgendamento({...newAgendamento, servico: value})}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corte">Corte de Cabelo</SelectItem>
                        <SelectItem value="barba">Barba</SelectItem>
                        <SelectItem value="corte_barba">Corte + Barba</SelectItem>
                        <SelectItem value="sobrancelha">Sobrancelha</SelectItem>
                        <SelectItem value="bigode">Bigode</SelectItem>
                        <SelectItem value="completo">Serviço Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full gradient-primary"
                  >
                    {loading ? "Criando..." : "Criar Agendamento"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Card className="gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Seus Agendamentos ({agendamentos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agendamentos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum agendamento encontrado. Crie seu primeiro agendamento!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {agendamentos.map((agendamento) => (
                      <div key={agendamento.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-smooth">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(parseISO(agendamento.data_hora), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{format(parseISO(agendamento.data_hora), "HH:mm")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="capitalize">{agendamento.servico.replace('_', ' + ')}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getStatusColor(agendamento.status)}>
                              {agendamento.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Select
                                value={agendamento.status}
                                onValueChange={(value) => updateStatus(agendamento.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="agendado">Agendado</SelectItem>
                                  <SelectItem value="confirmado">Confirmado</SelectItem>
                                  <SelectItem value="concluido">Concluído</SelectItem>
                                  <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteAgendamento(agendamento.id)}
                              >
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agendamentos;