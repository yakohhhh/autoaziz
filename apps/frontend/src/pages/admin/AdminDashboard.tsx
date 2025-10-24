import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AdminDashboard.css';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
  newCustomers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    revenue: 0,
    newCustomers: 0,
  });
  const [userName, setUserName] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('month');

  // Données pour le graphique RDV par mois (ligne)
  const monthlyData = [
    { mois: 'Jan', annee1: 150, annee2: 180 },
    { mois: 'Fév', annee1: 200, annee2: 210 },
    { mois: 'Mar', annee1: 180, annee2: 200 },
    { mois: 'Avr', annee1: 220, annee2: 240 },
    { mois: 'Mai', annee1: 240, annee2: 260 },
    { mois: 'Juin', annee1: 210, annee2: 230 },
    { mois: 'Juil', annee1: 230, annee2: 250 },
    { mois: 'Août', annee1: 260, annee2: 280 },
    { mois: 'Sep', annee1: 250, annee2: 270 },
    { mois: 'Oct', annee1: 280, annee2: 156 },
    { mois: 'Nov', annee1: 270, annee2: 0 },
    { mois: 'Déc', annee1: 300, annee2: 0 },
  ];

  // Données pour le graphique Rendez-vous par source
  const appointmentSourceData = [
    {
      periode: 'Sept 2025',
      Web: 250,
      Telephone: 180,
      Contrôle: 120,
    },
    {
      periode: 'Oct 2025',
      Web: 270,
      Telephone: 150,
      Contrôle: 100,
    },
  ];

  // Données pour le graphique Promotions
  const promotionsData = [
    {
      periode: 'Sept 2025',
      Pneus: 80,
      Freins: 60,
      Controle: 150,
    },
    {
      periode: 'Oct 2025',
      Pneus: 70,
      Freins: 55,
      Controle: 140,
    },
  ];

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const name = localStorage.getItem('userName') || 'Administrateur';
    setUserName(name);

    // Charger les statistiques
    loadDashboardStats();
  }, [navigate, selectedDateRange]);

  const loadDashboardStats = async () => {
    // TODO: Remplacer par l'appel API réel
    // const response = await axios.get('/api/admin/stats', { params: { range: selectedDateRange } });

    // Données de simulation basées sur les images
    setStats({
      totalAppointments: 18421,
      pendingAppointments: 156,
      completedAppointments: 8242,
      cancelledAppointments: 45,
      revenue: 4804,
      newCustomers: 11228,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className='admin-dashboard'>
      <aside className='sidebar'>
        <div className='sidebar-header'>
          <h2>AUTOSUR</h2>
          <p>Admin Panel</p>
        </div>

        <nav className='sidebar-nav'>
          <a href='#' className='nav-item active'>
            <span className='icon'>📊</span>
            <span>Tableau de bord</span>
          </a>
          <a href='/admin/planning' className='nav-item'>
            <span className='icon'>📅</span>
            <span>Planning</span>
          </a>
          <a href='/admin/customers' className='nav-item'>
            <span className='icon'>👥</span>
            <span>Clients</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>📈</span>
            <span>Statistiques</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>💰</span>
            <span>Finances</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>🎁</span>
            <span>Promotions</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>📧</span>
            <span>Messages</span>
          </a>
          <a href='#' className='nav-item'>
            <span className='icon'>⚙️</span>
            <span>Paramètres</span>
          </a>
        </nav>

        <div className='sidebar-footer'>
          <button onClick={handleLogout} className='logout-button'>
            <span className='icon'>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className='main-content'>
        <header className='dashboard-header'>
          <div className='header-left'>
            <h1>Tableau de bord</h1>
            <p>Bienvenue, {userName}</p>
          </div>

          <div className='header-right'>
            <div className='date-range-selector'>
              <label>Période:</label>
              <select
                value={selectedDateRange}
                onChange={e => setSelectedDateRange(e.target.value)}
              >
                <option value='today'>Aujourd'hui</option>
                <option value='week'>Cette semaine</option>
                <option value='month'>Ce mois</option>
                <option value='year'>Cette année</option>
              </select>
            </div>
          </div>
        </header>

        <div className='stats-grid'>
          <div className='stat-card blue'>
            <div className='stat-icon'>📅</div>
            <div className='stat-content'>
              <h3>{stats.totalAppointments.toLocaleString()}</h3>
              <p>Total Rendez-vous</p>
            </div>
          </div>

          <div className='stat-card orange'>
            <div className='stat-icon'>⏳</div>
            <div className='stat-content'>
              <h3>{stats.pendingAppointments}</h3>
              <p>En attente</p>
            </div>
          </div>

          <div className='stat-card green'>
            <div className='stat-icon'>✅</div>
            <div className='stat-content'>
              <h3>{stats.completedAppointments.toLocaleString()}</h3>
              <p>Terminés</p>
            </div>
          </div>

          <div className='stat-card red'>
            <div className='stat-icon'>❌</div>
            <div className='stat-content'>
              <h3>{stats.cancelledAppointments}</h3>
              <p>Annulés</p>
            </div>
          </div>

          <div className='stat-card purple'>
            <div className='stat-icon'>💰</div>
            <div className='stat-content'>
              <h3>€{stats.revenue.toLocaleString()}</h3>
              <p>Chiffre d'affaires</p>
            </div>
          </div>

          <div className='stat-card teal'>
            <div className='stat-icon'>👥</div>
            <div className='stat-content'>
              <h3>{stats.newCustomers.toLocaleString()}</h3>
              <p>Nouveaux clients</p>
            </div>
          </div>
        </div>

        <div className='charts-section'>
          {/* Graphique RDV par mois */}
          <div className='chart-card chart-full-width'>
            <h3>RDV par mois</h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='mois' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='annee1'
                  stroke='#5B9BD5'
                  strokeWidth={2}
                  name='Année 2024'
                  dot={{ r: 4 }}
                />
                <Line
                  type='monotone'
                  dataKey='annee2'
                  stroke='#ED7D31'
                  strokeWidth={2}
                  name='Année 2025'
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique Rendez-vous par source */}
          <div className='chart-card'>
            <h3>Rendez-vous par source</h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={appointmentSourceData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='periode' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='Web' fill='#70AD47' name='Web' />
                <Bar dataKey='Telephone' fill='#FFC000' name='Téléphone' />
                <Bar dataKey='Controle' fill='#C00000' name='Contrôle' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Graphique Promotions */}
          <div className='chart-card'>
            <h3>Promotions</h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={promotionsData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='periode' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='Pneus' fill='#70AD47' name='Pneus' />
                <Bar dataKey='Freins' fill='#FFC000' name='Freins' />
                <Bar dataKey='Controle' fill='#C00000' name='Contrôle' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
