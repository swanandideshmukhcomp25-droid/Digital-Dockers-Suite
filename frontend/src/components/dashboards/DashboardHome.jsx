import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ProjectManagerDashboard from './ProjectManagerDashboard';
import TechnicalTeamDashboard from './TechnicalTeamDashboard';
import MarketingTeamDashboard from './MarketingTeamDashboard';
import TeamLeadDashboard from './TeamLeadDashboard';
import { Typography } from '@mui/material';

const DashboardHome = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'project_manager':
            return <ProjectManagerDashboard />;
        case 'technical_team':
            return <TechnicalTeamDashboard />;
        case 'marketing_team':
            return <MarketingTeamDashboard />;
        case 'technical_lead':
        case 'marketing_lead':
            return <TeamLeadDashboard />;
        default:
            return <Typography variant="h4">Welcome {user?.fullName}</Typography>;
    }
};

export default DashboardHome;
