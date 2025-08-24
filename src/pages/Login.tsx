import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Simulate login
    localStorage.setItem("easyhora_user", JSON.stringify({ email, name: "Usuário" }));
    toast({
      title: "Login realizado!",
      description: "Bem-vindo ao EasyHora.",
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
              Entrar no EasyHora
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse sua conta e gerencie seu salão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground font-semibold hover:shadow-golden transition-smooth"
              >
                Entrar
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-4">
              <Link 
                to="#" 
                className="text-primary hover:text-primary-glow transition-smooth text-sm"
              >
                Esqueci minha senha
              </Link>
              <p className="text-muted-foreground text-sm">
                Não tem uma conta?{" "}
                <Link 
                  to="/cadastro" 
                  className="text-primary hover:text-primary-glow transition-smooth font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;