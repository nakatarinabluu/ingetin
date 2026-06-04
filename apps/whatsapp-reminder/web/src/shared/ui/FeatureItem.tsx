import React from 'react';


interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, desc }) => {
  return (
    <div className="space-y-6 group text-left">
      <div className="w-14 h-11 bg-muted rounded-2xl flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all duration-300">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28, strokeWidth: 1.5 }) : icon}
      </div>
      <div className="space-y-3">
        <h4 className="text-xl font-bold text-foreground tracking-tight">
          {title}
        </h4>
        <p className="text-muted-foreground font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
};
