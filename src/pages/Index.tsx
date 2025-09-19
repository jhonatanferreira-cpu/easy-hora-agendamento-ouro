import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Smartphone, Brain, TrendingUp, Phone, MessageCircle, Star, CheckCircle } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Sistema automatizado que organiza horários de forma otimizada"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Controle completo do histórico e preferências dos clientes"
    },
    {
      icon: Smartphone,
      title: "Equipe Organizada",
      description: "Coordenação perfeita entre todos os profissionais"
    },
    {
      icon: Brain,
      title: "IA Integrada",
      description: "Inteligência artificial para insights e automações"
    }
  ];

  const benefits = [
    "Reduz 80% das ligações para agendamento",
    "Aumenta receita com lembretes automáticos",
    "Elimina desencontros e faltas sem aviso",
    "Relatórios detalhados de performance",
    "Integração com WhatsApp e redes sociais",
    "Suporte especializado 24/7"
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Proprietária - Salão Elegance",
      content: "Depois do EasyHora, minha agenda nunca mais foi um problema. Os clientes adoram a praticidade e eu economizo horas por dia!",
      rating: 5
    },
    {
      name: "Carlos Lima",
      role: "Gerente - Beauty Center",
      content: "Revolucionou nosso negócio! Aumentamos 40% na receita só com os lembretes automáticos. Recomendo para todos os salões.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-dark opacity-50"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-3xl shadow-golden mb-6">
              <span className="text-4xl font-bold text-primary-foreground">EH</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              O Sistema de Agendamento
              <span className="block text-primary animate-glow">
                que seu Salão Merece
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              Transforme sua agenda em uma máquina de vendas. Automatize agendamentos, 
              gerencie clientes e aumente sua receita com inteligência artificial.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link to="/cadastro">
              <Button className="gradient-primary text-primary-foreground font-semibold px-8 py-4 text-lg hover:shadow-golden transition-smooth">
                Começar Grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-lg transition-smooth">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Funcionalidades Poderosas
            </h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para gerenciar seu salão com excelência
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="gradient-card shadow-card border-border hover:shadow-golden transition-smooth animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Benefícios Comprovados
            </h2>
            <p className="text-xl text-muted-foreground">
              Resultados reais que fazem a diferença no seu negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <p className="text-foreground font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Histórias de sucesso de salões que transformaram seus negócios
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-card shadow-card border-border animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{testimonial.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Planos
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para o seu negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card className="gradient-card shadow-card border-border hover:shadow-golden transition-smooth animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground mb-2">Basic</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">R$39,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <a href="https://buy.stripe.com/test_00w14pdAcekj4kU821bjW00" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gradient-primary text-primary-foreground font-semibold py-3 hover:shadow-golden transition-smooth">
                    Assinar agora
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="gradient-card shadow-card border-border hover:shadow-golden transition-smooth animate-fade-in relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground mb-2">Pro</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">R$119,90</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <a href="https://buy.stripe.com/test_5kQ3cxgMo3FF2cM0zzbjW01" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gradient-primary text-primary-foreground font-semibold py-3 hover:shadow-golden transition-smooth">
                    Assinar agora
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Pronto para revolucionar
            <span className="block text-primary">seu negócio?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a milhares de salões que já transformaram sua gestão com o EasyHora
          </p>
          <Link to="/cadastro">
            <Button className="gradient-primary text-primary-foreground font-semibold px-12 py-6 text-xl hover:shadow-golden transition-smooth animate-glow">
              Começar Teste Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">EH</span>
            </div>
            <span className="text-xl font-bold text-foreground">EasyHora</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 EasyHora. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;