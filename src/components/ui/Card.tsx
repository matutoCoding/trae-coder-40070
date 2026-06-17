import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  title?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, icon, extra, children, className }: CardProps) {
  return (
    <div className={cn('card-base card-hover overflow-hidden', className)}>
      {(title || extra) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary-400">{icon}</span>}
            {title && (
              <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
            )}
          </div>
          {extra && <div className="text-xs text-dark-300">{extra}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
