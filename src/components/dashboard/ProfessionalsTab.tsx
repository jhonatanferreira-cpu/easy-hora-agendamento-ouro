import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface ProfessionalsTabProps {
  professionals: any[];
  newProfessional: any;
  setNewProfessional: (professional: any) => void;
  onAddProfessional: (e: React.FormEvent) => void;
}

export const ProfessionalsTab = ({
  professionals,
  newProfessional,
  setNewProfessional,
  onAddProfessional,
}: ProfessionalsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onAddProfessional} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profName" className="text-foreground">Nome</Label>
                <Input
                  id="profName"
                  placeholder="Nome completo"
                  value={newProfessional.name}
                  onChange={(e) => setNewProfessional({ ...newProfessional, name: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-foreground">Especialidade</Label>
                <Input
                  id="specialty"
                  placeholder="Ex: Cabelereiro, Manicure"
                  value={newProfessional.specialty}
                  onChange={(e) => setNewProfessional({ ...newProfessional, specialty: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability" className="text-foreground">Disponibilidade</Label>
                <Input
                  id="availability"
                  placeholder="Ex: Seg-Sex 9h-18h"
                  value={newProfessional.availability}
                  onChange={(e) => setNewProfessional({ ...newProfessional, availability: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:shadow-golden transition-smooth">
                Adicionar Profissional
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="gradient-card shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Lista de Profissionais</CardTitle>
            <CardDescription className="text-muted-foreground">
              {professionals.length} profissional(is) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {professionals.map((professional) => (
                <div key={professional.id} className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{professional.name}</p>
                      <p className="text-sm text-primary">{professional.specialty}</p>
                      {professional.availability && (
                        <p className="text-sm text-muted-foreground">{professional.availability}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {professionals.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Nenhum profissional cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};