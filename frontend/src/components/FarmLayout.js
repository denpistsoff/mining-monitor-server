import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Dashboard from './Dashboard';
import MinersView from './MinersView';
import AlertsPanel from './AlertsPanel';
import '../styles/components/FarmLayout.css';

const FarmLayout = () => {
    const { farmName } = useParams();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(3);

    const handleTabChange = (tab) => {
        if (tab === 'alerts') {
            setAlertsOpen(true);
            return;
        }
        setActiveTab(tab);
    };

    const handleLogout = () => {
        localStorage.removeItem('miningAuth');
        window.location.href = 'https://denpistsoff.github.io/mining-monitor-web/';
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'miners':
                return <MinersView farmNameProp={farmName} />;
            case 'dashboard':
            default:
                return <Dashboard farmNameProp={farmName} />;
        }
    };

    return (
        <div className="farm-layout">
            <Header
                activeTab={activeTab}
                onTabChange={handleTabChange}
                farmName={farmName}
                onLogout={handleLogout}
                unreadAlertsCount={unreadAlertsCount}
            />

            <main className="farm-content">
                {renderContent()}
            </main>

            <AlertsPanel
                farmNameProp={farmName}
                isOpen={alertsOpen}
                onClose={() => setAlertsOpen(false)}
            />
        </div>
    );
};

export default FarmLayout;