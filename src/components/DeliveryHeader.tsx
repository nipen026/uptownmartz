import { MapPin, ChevronDown } from 'lucide-react';

export function DeliveryHeader() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-1.5 rounded-full">
          <MapPin size={16} className="text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">Home</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">42, Green Park Extension, New Delhi</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-muted-foreground">Delivery in</p>
        <p className="text-sm font-bold text-primary">10 mins</p>
      </div>
    </div>
  );
}
