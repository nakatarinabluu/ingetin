import React from 'react';
import { 
    Utensils, 
    CarFront, 
    Film, 
    ShoppingBag, 
    MonitorPlay, 
    Wifi, 
    Music,
    CircleDashed
} from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';

export const CategoryIconMap: Record<string, React.ElementType> = {
    Utensils, 
    CarFront, 
    Film, 
    ShoppingBag, 
    MonitorPlay, 
    Wifi, 
    Music
};

export interface CategoryIconProps {
    name: string;
    size?: number;
    className?: string;
}

export function CategoryIcon({ name, size = 18, className }: CategoryIconProps) {
    const IconComponent = CategoryIconMap[name] || CircleDashed;
    
    return (
        <IconComponent 
            size={size} 
            className={cn("text-wa-icon transition-colors", className)} 
        />
    );
}
