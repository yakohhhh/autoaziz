import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
} from '@ionic/react';
import {
  calendarOutline,
  peopleOutline,
  checkmarkCircleOutline,
  cashOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { statsService, DashboardStats } from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    revenue: 0,
    newCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('month');
  const [userName] = useState(localStorage.getItem('userName') || 'Admin');

  // Données pour les graphiques
  const monthlyData = [
    { mois: 'Jan', rdv: 150 },
    { mois: 'Fév', rdv: 200 },
    { mois: 'Mar', rdv: 180 },
    { mois: 'Avr', rdv: 220 },
    { mois: 'Mai', rdv: 240 },
    { mois: 'Juin', rdv: 210 },
    { mois: 'Juil', rdv: 230 },
    { mois: 'Août', rdv: 260 },
    { mois: 'Sep', rdv: 250 },
    { mois: 'Oct', rdv: 280 },
    { mois: 'Nov', rdv: 156 },
  ];

  const revenueData = [
    { periode: 'S1', montant: 3200 },
    { periode: 'S2', montant: 3800 },
    { periode: 'S3', montant: 4200 },
    { periode: 'S4', montant: 4804 },
  ];

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getDashboard(selectedRange);
      setStats({
        totalAppointments: data.totalAppointments || 0,
        pendingAppointments: data.pendingAppointments || 0,
        confirmedAppointments: data.confirmedAppointments || 0,
        completedAppointments: data.completedAppointments || 0,
        cancelledAppointments: data.cancelledAppointments || 0,
        revenue: data.revenue || 0,
        newCustomers: data.newCustomers || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      // Données de démonstration en cas d'erreur
      setStats({
        totalAppointments: 18421,
        pendingAppointments: 156,
        confirmedAppointments: 0,
        completedAppointments: 8242,
        cancelledAppointments: 45,
        revenue: 4804,
        newCustomers: 11228,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (event: CustomEvent) => {
    loadStats().then(() => event.detail.complete());
  };

  interface StatCardProps {
    icon: string;
    title: string;
    value: number;
    color: string;
    subtitle?: string;
    trend?: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, subtitle, trend }) => (
    <IonCol size="6" sizeMd="3">
      <div className={`stat-card-modern ${color}`}>
        <div className="stat-icon-wrapper">
          <IonIcon icon={icon} />
        </div>
        <div className="stat-content">
          <div className="stat-value">{value.toLocaleString()}</div>
          <div className="stat-label">{title}</div>
          {subtitle && <div className="stat-sub">{subtitle}</div>}
          {trend && (
            <div className="stat-trend">
              <IonIcon icon={trendingUpOutline} /> {trend}
            </div>
          )}
        </div>
        <div className="stat-bg-shape"></div>
      </div>
    </IonCol>
  );

  return (
    <IonPage className="dashboard-page">
      <IonHeader className="dashboard-header">
        <IonToolbar>
          <IonTitle>
            <div className="header-content">
              <div className="app-name">AUTOSUR</div>
              <div className="page-name">Dashboard</div>
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="dashboard-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="welcome-section">
          <h1>Bonjour, {userName} 👋</h1>
          <p>Voici un aperçu de votre activité aujourd'hui.</p>
        </div>

        {/* Sélecteur de période */}
        <div className="period-selector-container">
          <IonSegment
            value={selectedRange}
            onIonChange={(e) => setSelectedRange(e.detail.value as string)}
            mode="ios"
            className="custom-segment"
          >
            <IonSegmentButton value="week">
              <IonLabel>Semaine</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="month">
              <IonLabel>Mois</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="year">
              <IonLabel>Année</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* Cartes de statistiques */}
            <IonGrid>
              <IonRow>
                <StatCard
                  icon={calendarOutline}
                  title="Rendez-vous"
                  value={stats.totalAppointments}
                  color="card-blue"
                  subtitle="Total"
                  trend="+12%"
                />
                <StatCard
                  icon={peopleOutline}
                  title="Nouveaux clients"
                  value={stats.newCustomers}
                  color="card-purple"
                  trend="+5%"
                />
                <StatCard
                  icon={checkmarkCircleOutline}
                  title="Confirmés"
                  value={stats.pendingAppointments}
                  color="card-green"
                />
                <StatCard
                  icon={cashOutline}
                  title="CA (k€)"
                  value={stats.revenue}
                  color="card-orange"
                  trend="+8%"
                />
              </IonRow>
            </IonGrid>

            {/* Graphique des RDV par mois */}
            <div className="chart-section">
              <div className="chart-header">
                <div className="chart-icon-bg blue">
                  <IonIcon icon={trendingUpOutline} />
                </div>
                <h3>Performance Mensuelle</h3>
              </div>
              <div className="chart-card-modern">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRdv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="mois" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rdv"
                      stroke="#6366f1"
                      strokeWidth={4}
                      dot={{ fill: '#fff', stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphique du chiffre d'affaires */}
            <div className="chart-section">
              <div className="chart-header">
                <div className="chart-icon-bg orange">
                  <IonIcon icon={cashOutline} />
                </div>
                <h3>Chiffre d'affaires</h3>
              </div>
              <div className="chart-card-modern">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="periode" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="montant" 
                      fill="url(#colorRevenue)" 
                      radius={[8, 8, 0, 0]} 
                      barSize={40}
                    >
                      {
                        revenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a78bfa'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
