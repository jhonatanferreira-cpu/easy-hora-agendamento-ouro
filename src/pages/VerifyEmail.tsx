import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="gradient-card shadow-elegant border-border">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-golden">
              <Mail className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Verifique seu e-mail
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Confirme seu e-mail pelo link enviado antes de fazer login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Enviamos um link de confirmação para seu e-mail. 
                Clique no link para ativar sua conta e poder fazer login.
              </p>
              <p className="text-sm text-muted-foreground">
                Não recebeu o e-mail? Verifique sua caixa de spam.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link to="/login">
                <Button className="w-full gradient-primary text-primary-foreground font-semibold hover:shadow-golden transition-smooth">
                  Ir para Login
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;