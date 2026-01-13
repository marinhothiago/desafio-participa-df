import { useState, useEffect } from 'react';
import { FileCheck, BarChart3, BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { ApiStatus } from '@/components/ApiStatus';
import { FooterWithCounters } from '@/components/FooterWithCounters';
import { Dashboard } from '@/pages/Dashboard';
import { Classification } from '@/pages/Classification';
import { Documentation } from '@/pages/Documentation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AnalysisProvider } from '@/contexts/AnalysisContext';

type TabKey = 'classification' | 'dashboard' | 'docs';

const tabs = [
  { key: 'classification' as TabKey, label: 'Classificação', icon: FileCheck },
  { key: 'dashboard' as TabKey, label: 'Dashboard', icon: BarChart3 },
  { key: 'docs' as TabKey, label: 'Documentação', icon: BookOpen },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('classification');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'loading' | 'waking'>('loading');

  const checkApiStatus = async () => {
    setApiStatus('loading');
    const isOnline = await api.checkConnection();
    setApiStatus(isOnline ? 'online' : 'offline');
  };

  const handleRetryConnection = () => {
    setApiStatus('waking');
    setTimeout(async () => {
      const isOnline = await api.checkConnection();
      setApiStatus(isOnline ? 'online' : 'offline');
    }, 2000);
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Navigation Tabs */}
        <nav className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="ml-4">
                <ApiStatus status={apiStatus} onRetry={handleRetryConnection} />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 flex-1">
          {activeTab === 'classification' && <Classification />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'docs' && <Documentation />}
        </main>

        {/* Footer */}
        <FooterWithCounters />
      </div>
    </AnalysisProvider>
  );
};

export default Index;
