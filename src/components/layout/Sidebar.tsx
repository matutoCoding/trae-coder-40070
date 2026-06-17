import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Wind,
  Droplets,
  Cog,
  ThermometerSun,
  BarChart3,
  Gauge,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

const navItems = [
  { path: '/', name: '仪表盘', icon: LayoutDashboard },
  { path: '/raw-gas', name: '原料气制备', icon: Flame },
  { path: '/shift-decarb', name: '变换脱碳', icon: Wind },
  { path: '/refining', name: '气体精制', icon: Droplets },
  { path: '/synthesis', name: '氨合成', icon: Cog },
  { path: '/separation', name: '氨冷分离', icon: ThermometerSun },
  { path: '/production', name: '产量统计', icon: BarChart3 },
  { path: '/energy', name: '能耗分析', icon: Gauge },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-full bg-dark-800 border-r border-dark-600 flex flex-col">
      <div className="px-5 py-5 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary-600 flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">NH₃</span>
          </div>
          <div>
            <div className="font-display font-semibold text-white text-sm leading-tight">合成氨装置</div>
            <div className="text-xs text-dark-300">业务管理系统</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-200 hover:bg-dark-700 hover:text-white'
                )
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
            <span className="text-xs font-medium text-dark-100">管</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">车间管理员</div>
            <div className="text-xs text-dark-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-alarm-success" />
              在线
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
