import { LayoutGrid, FileText, Briefcase, Search, Settings } from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Resume Analyzer', icon: FileText },
  { label: 'Job Search', icon: Search },
  { label: 'Applications', icon: Briefcase },
  { label: 'Settings', icon: Settings },
];

function Sidebar() {
  return (
    <>
      <aside className="hidden w-72 flex-col gap-6 rounded-[2rem] border border-slate-800/70 bg-slate-950/90 px-6 py-8 text-slate-300 shadow-2xl shadow-slate-950/20 lg:flex">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Workspace</p>
          <h2 className="text-2xl font-semibold text-white">AI Navigator</h2>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                  index === 0
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-950/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[1.75rem] border border-slate-800/70 bg-slate-900/90 p-5 text-sm text-slate-400">
          <p className="text-slate-300">Pro tip</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Upload a resume to instantly see AI skill matches and generate a cover letter.</p>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-2 border-t border-slate-800/70 bg-slate-950/95 px-4 py-3 text-slate-300 shadow-2xl shadow-slate-950/20 backdrop-blur-xl lg:hidden">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex flex-1 flex-col items-center justify-center rounded-3xl px-3 py-2 text-center text-[0.72rem] transition ${
                index === 0 ? 'bg-slate-900 text-white' : 'hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default Sidebar;
