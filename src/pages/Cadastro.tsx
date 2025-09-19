import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Simulate registration
    localStorage.setItem("easyhora_user", JSON.stringify(formData));
    toast({
      title: "Cadastro realizado!",
      description: "Bem-vindo ao EasyHora. Sua conta foi criada com sucesso.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="gradient-card shadow-elegant border-border">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-golden">
              <span className="text-3xl font-bold text-primary-foreground">EH</span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Comece sua jornada com o EasyHora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground font-semibold hover:shadow-golden transition-smooth"
              >
                Cadastrar
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Já tem uma conta?{" "}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-glow transition-smooth font-medium"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;