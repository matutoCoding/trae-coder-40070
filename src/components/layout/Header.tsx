import { useEffect } from 'react';
import { Bell, Clock, RefreshCw, Download, Search } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function Header({ title }: { title: string }) {
  const { currentTime, alarms, tick, acknowledgeAlarm } = useAppStore();
  const unacked = alarms.filter((a) => !a.acknowledged).length;

  useEffect(() => {
    const timer = setInterval(() => tick(), 3000);
    return () => clearInterval(timer);
  }, [tick]);

  return (
    <header className="h-14 bg-dark-800/80 backdrop-blur border-b border-dark-600 flex items-center px-6 gap-6">
      <div>
        <h1 className="font-display font-semibold text-white text-base">{title}</h1>
      </div>

      <div className="flex-1" />

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          type="text"
          placeholder="搜索参数或设备..."
          className="w-56 h-8 pl-9 pr-3 rounded bg-dark-700 border border-dark-600 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500/50"
        />
      </div>

      <div className="flex items-center gap-2 text-sm text-dark-200 font-mono px-3 py-1.5 rounded bg-dark-700 border border-dark-600">
        <Clock size={14} className="text-primary-400" />
        <span>{currentTime}</span>
      </div>

      <button className="w-8 h-8 rounded bg-dark-700 border border-dark-600 flex items-center justify-center text-dark-200 hover:bg-dark-600 hover:text-white transition-colors">
        <RefreshCw size={15} />
      </button>

      <button className="w-8 h-8 rounded bg-dark-700 border border-dark-600 flex items-center justify-center text-dark-200 hover:bg-dark-600 hover:text-white transition-colors">
        <Download size={15} />
      </button>

      <div className="relative">
        <button className="w-8 h-8 rounded bg-dark-700 border border-dark-600 flex items-center justify-center text-dark-200 hover:bg-dark-600 hover:text-white transition-colors relative">
          <Bell size={15} />
          {unacked > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-alarm-danger text-white text-[10px] font-bold flex items-center justify-center">
              {unacked}
            </span>
          )}
        </button>

        {unacked > 0 && (
          <div className="absolute right-0 top-10 w-72 bg-dark-700 border border-dark-600 rounded-lg shadow-xl z-50">
            <div className="px-4 py-2.5 border-b border-dark-600 font-medium text-sm text-white">
              告警信息 ({unacked})
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alarms.slice(0, 5).map((alarm) => (
                <div
                  key={alarm.id}
                  className={`px-4 py-3 border-b border-dark-600 last:border-b-0 hover:bg-dark-600/50 cursor-pointer ${
                    alarm.acknowledged ? 'opacity-60' : ''
                  }`}
                  onClick={() => !alarm.acknowledged && acknowledgeAlarm(alarm.id)}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        alarm.level === 'alarm' ? 'bg-alarm-danger' : 'bg-alarm-warning'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">
                        {alarm.equipment}：{alarm.message}
                      </div>
                      <div className="text-xs text-dark-400 mt-0.5">{alarm.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
