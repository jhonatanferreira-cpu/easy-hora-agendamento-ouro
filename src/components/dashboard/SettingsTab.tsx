import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface SettingsTabProps {
  salonSettings: any;
  setSalonSettings: (settings: any) => void;
  onSaveSettings: () => void;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsTab = ({
  salonSettings,
  setSalonSettings,
  onSaveSettings,
  onLogoUpload,
}: SettingsTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Configurações do Salão</CardTitle>
          <CardDescription className="text-muted-foreground">
            Personalize as configurações do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUpload" className="text-foreground">Logo do Salão</Label>
              <div className="flex items-center space-x-4">
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={onLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logoUpload')?.click()}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carregar Logo
                </Button>
                {salonSettings.logo && (
                  <div className="flex items-center space-x-2">
                    <img 
                      src={salonSettings.logo} 
                      alt="Logo preview" 
                      className="w-12 h-12 object-cover rounded-lg border border-border"
                    />
                    <span className="text-sm text-success">Logo carregada!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salonName" className="text-foreground">Nome do Salão</Label>
              <Input
                id="salonName"
                placeholder="Nome do seu salão"
                value={salonSettings.name}
                onChange={(e) => setSalonSettings(prev => ({ ...prev, name: e.target.value }))}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonAddress" className="text-foreground">Endereço</Label>
              <Input
                id="salonAddress"
                placeholder="Endereço completo"
                value={salonSettings.address}
                onChange={(e) => setSalonSettings(prev => ({ ...prev, address: e.target.value }))}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salonPhone" className="text-foreground">Telefone</Label>
              <Input
                id="salonPhone"
                placeholder="(11) 99999-9999"
                value={salonSettings.phone}
                onChange={(e) => setSalonSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-input border-border text-foreground"
              />
            </div>

            <Button 
              onClick={onSaveSettings} 
              className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth"
            >
              Salvar Configurações
            </Button>
          </div>
          
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Integração com IA</h3>
            <p className="text-muted-foreground mb-4">
              Configure a integração com inteligência artificial para lembretes automáticos e insights personalizados.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Configurar IA (Em breve)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};