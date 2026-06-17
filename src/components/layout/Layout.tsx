import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  return (
    <div className="w-full h-full flex bg-dark-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6 bg-dark-800">{children}</main>
      </div>
    </div>
  );
}
