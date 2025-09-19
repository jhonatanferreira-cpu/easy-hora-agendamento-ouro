import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Zap } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";

const PlanActivation = () => {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const startTrial = async (planUrl: string) => {
    setLoading(true);

    // Pegar usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Você precisa estar logado para iniciar o teste grátis");
      setLoading(false);
      return;
    }

    // Criar ou atualizar profile
    await supabase.from("profiles").upsert({
      user_id: user.id,
      email: user.email,
      plano_ativo: false,
    });

    // Redireciona para Stripe
    window.location.href = planUrl;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-3xl shadow-golden mb-6">
            <Crown className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ativar Plano
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            7 dias grátis para testar todas as funcionalidades
          </p>
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">Sem compromisso • Cancele quando quiser</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Plan */}
          <Card className="gradient-card shadow-card border-border hover:shadow-golden transition-smooth animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground mb-2">Basic</CardTitle>
              <div className="mb-4">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-sm text-muted-foreground line-through">R$39,90</span>
                  <span className="text-4xl font-bold text-primary">Grátis</span>
                </div>
                <p className="text-sm text-muted-foreground">7 dias, depois R$39,90/mês</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>1 profissional</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Agendamentos ilimitados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Lembretes automáticos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte básico</span>
                </li>
              </ul>
              <Button
                className="w-full gradient-primary text-primary-foreground font-semibold py-3 hover:shadow-golden transition-smooth"
                onClick={() =>
                  startTrial("https://buy.stripe.com/eVq6oJ7ae5Hj7AhgIkbfO00")
                }
                disabled={loading}
              >
                {loading ? "Processando..." : "Começar Teste Grátis"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="gradient-card shadow-card border-border hover:shadow-golden transition-smooth animate-fade-in relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Recomendado
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground mb-2">Pro</CardTitle>
              <div className="mb-4">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-sm text-muted-foreground line-through">R$119,90</span>
                  <span className="text-4xl font-bold text-primary">Grátis</span>
                </div>
                <p className="text-sm text-muted-foreground">7 dias, depois R$119,90/mês</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Até 5 profissionais</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Agendamentos ilimitados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Relatórios avançados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
              <Button
                className="w-full gradient-primary text-primary-foreground font-semibold py-3 hover:shadow-golden transition-smooth"
                onClick={() =>
                  startTrial("https://buy.stripe.com/7sY6oJcuy4Df8El2RubfO01")
                }
                disabled={loading}
              >
                {loading ? "Processando..." : "Começar Teste Grátis"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Ao clicar em "Começar Teste Grátis", você concorda com nossos termos de uso.
            <br />
            Você pode cancelar a qualquer momento durante o período de teste.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanActivation;