import { Link } from 'react-router-dom';
import { Car, FileText, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vehicle, VehicleDocument } from '@/types/vehicle';
import { cn } from '@/lib/utils';
import { useVehicleDocument } from '@/hooks/useVehicles';

interface VehicleCardProps {
  vehicle: Vehicle;
  document?: VehicleDocument | null;
}

export function VehicleCard({ vehicle, document }: VehicleCardProps) {
  const { data: fetchedDocument } = useVehicleDocument(document ? undefined : vehicle.id);
  const resolvedDocument = document ?? fetchedDocument;

  const getDocumentStatus = () => {
    if (!resolvedDocument) return null;
    
    switch (resolvedDocument.status) {
      case 'ready':
        return {
          label: 'PDF pronto',
          icon: CheckCircle2,
          className: 'status-ready',
        };
      case 'processing':
        return {
          label: 'Processando...',
          icon: Loader2,
          className: 'status-processing',
        };
      case 'insufficient_quality':
        return {
          label: 'Qualidade insuficiente',
          icon: AlertCircle,
          className: 'status-error',
        };
    }
  };

  const status = getDocumentStatus();

  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <Card className="group transition-all duration-200 hover:shadow-lg hover:border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Car className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {vehicle.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' • ') || 'Sem detalhes'}
                </p>
                {vehicle.current_mileage > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {vehicle.current_mileage.toLocaleString('pt-BR')} km
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              
              {status && (
                <Badge 
                  variant="outline" 
                  className={cn('gap-1.5 text-xs', status.className)}
                >
                  <status.icon className={cn('h-3 w-3', status.icon === Loader2 && 'animate-spin')} />
                  {status.label}
                </Badge>
              )}
              
              {!resolvedDocument && (
                <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  Sem PDF
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
