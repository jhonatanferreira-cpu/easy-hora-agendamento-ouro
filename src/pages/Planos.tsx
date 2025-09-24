import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Star, ArrowLeft } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  trial_end: string;
  plano: string;
}

const Planos = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Error loading user:', error);
      return;
    }

    setUsuario(usuario);
  };

  const createCheckout = async (priceId: string, planName: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId }
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar sessão de pagamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Open checkout in new tab
        window.open(data.url, '_blank');
      }
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

  const plans = [
    {
      id: 'basico',
      name: 'Plano Básico',
      price: 'R$ 39,90',
      priceId: 'price_1SAuSTRDwjywIfSVeFmskIti',
      description: 'Ideal para barbearias pequenas',
      features: [
        'Até 50 agendamentos por mês',
        'Gestão básica de clientes',
        'Lembretes por e-mail',
        'Suporte por e-mail'
      ],
      popular: false,
      icon: <Star className="w-6 h-6" />
    },
    {
      id: 'pro',
      name: 'Plano Pro',
      price: 'R$ 79,90',
      priceId: 'price_1SAuSkRDwjywIfSVuFglOKtO',
      description: 'Para barbearias em crescimento',
      features: [
        'Agendamentos ilimitados',
        'Gestão avançada de clientes',
        'Relatórios detalhados',
        'Lembretes por SMS e e-mail',
        'Suporte prioritário',
        'Integração com WhatsApp'
      ],
      popular: true,
      icon: <Crown className="w-6 h-6" />
    }
  ];

  if (!usuario) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Escolha seu Plano</h1>
            <p className="text-muted-foreground">Ative sua assinatura e desbloqueie todos os recursos</p>
          </div>
        </div>

        {/* Current Status */}
        {usuario.plano === 'trial' && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Teste Grátis Ativo</CardTitle>
              <CardDescription className="text-orange-600">
                Você está no período de teste gratuito de 7 dias. Escolha um plano para continuar após o término.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`gradient-card shadow-elegant relative ${
                plan.popular ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">{plan.price}</div>
                <CardDescription className="text-sm">/mês + 7 dias grátis</CardDescription>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => createCheckout(plan.priceId, plan.name)}
                  disabled={loading}
                  className={`w-full ${
                    plan.popular 
                      ? 'gradient-primary text-primary-foreground' 
                      : 'variant-outline'
                  }`}
                >
                  {loading ? "Processando..." : "Assinar Agora"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  • 7 dias grátis, depois {plan.price}/mês<br/>
                  • Cancele a qualquer momento<br/>
                  • Faturamento seguro via Stripe
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle>Comparação de Recursos</CardTitle>
            <CardDescription>
              Veja todos os recursos incluídos em cada plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Recursos</th>
                    <th className="text-center py-3 px-4">Básico</th>
                    <th className="text-center py-3 px-4">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Agendamentos por mês</td>
                    <td className="text-center py-3 px-4">50</td>
                    <td className="text-center py-3 px-4">Ilimitados</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Gestão de clientes</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Lembretes por e-mail</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Lembretes por SMS</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Relatórios avançados</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Integração WhatsApp</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4"><Check className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Suporte</td>
                    <td className="text-center py-3 px-4">E-mail</td>
                    <td className="text-center py-3 px-4">Prioritário</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Planos;