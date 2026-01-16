import { useState, useEffect } from 'react';
import { FileCheck, BarChart3, BookOpen, Menu } from 'lucide-react';
import { Header } from '@/components/Header';
import { ApiStatus } from '@/components/ApiStatus';
import { FooterWithCounters } from '@/components/FooterWithCounters';
import { Dashboard } from '@/pages/Dashboard';
import { Classification } from '@/pages/Classification';
import { Documentation } from '@/pages/Documentation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AnalysisProvider } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type TabKey = 'classification' | 'dashboard' | 'docs';

const tabs = [
  { key: 'classification' as TabKey, label: 'Classificação', icon: FileCheck },
  { key: 'dashboard' as TabKey, label: 'Dashboard', icon: BarChart3 },
  { key: 'docs' as TabKey, label: 'Documentação', icon: BookOpen },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('classification');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'loading' | 'waking'>('loading');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              {/* Mobile: Hamburger Menu */}
              <div className="md:hidden flex items-center gap-2">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2">
                      <Menu className="w-5 h-5" />
                      <span className="ml-2 font-medium">
                        {tabs.find(t => t.key === activeTab)?.label}
                      </span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px]">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-2 mt-6">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        
                        return (
                          <button
                            key={tab.key}
                            onClick={() => {
                              setActiveTab(tab.key);
                              setMobileMenuOpen(false);
                            }}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Status da API</p>
                      <ApiStatus status={apiStatus} onRetry={handleRetryConnection} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop: Normal Tabs */}
              <div className="hidden md:flex overflow-x-auto scrollbar-hide">
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

              {/* API Status - visible on both but positioned differently */}
              <div className="hidden md:block ml-4">
                <ApiStatus status={apiStatus} onRetry={handleRetryConnection} />
              </div>
              
              {/* Mobile: API Status indicator only (compact) */}
              <div className="md:hidden">
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
