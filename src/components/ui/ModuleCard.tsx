import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { ChevronRight } from 'lucide-react';

interface ModuleCardProps {
  path: string;
  name: string;
  icon: ReactNode;
  description: string;
  metric?: { label: string; value: string; color?: string };
  className?: string;
}

export default function ModuleCard({
  path,
  name,
  icon,
  description,
  metric,
  className,
}: ModuleCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className={cn(
        'card-base card-hover cursor-pointer p-5 group relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-all duration-500" />

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-dark-600 border border-dark-500 flex items-center justify-center text-primary-400 group-hover:border-primary-500/50 group-hover:text-primary-300 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-white">{name}</h3>
            <ChevronRight
              size={16}
              className="text-dark-400 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"
            />
          </div>
          <p className="text-xs text-dark-300 leading-relaxed">{description}</p>
        </div>
      </div>

      {metric && (
        <div className="relative mt-4 pt-4 border-t border-dark-600">
          <div className="text-[11px] text-dark-400 mb-0.5">{metric.label}</div>
          <div
            className={cn(
              'font-display font-bold text-xl',
              metric.color || 'text-primary-400'
            )}
          >
            {metric.value}
          </div>
        </div>
      )}
    </div>
  );
}
