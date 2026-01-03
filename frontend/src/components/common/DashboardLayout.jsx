import { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme, Grid } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatbotWidget from '../chatbot/ChatbotWidget';
import { useThemeMode } from '../../context/ThemeContext';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const DashboardLayout = () => {
    const { mode } = useThemeMode();
    const screens = useBreakpoint();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);

    // Responsive breakpoints
    const isMobile = !screens.md; // < 768px
    const isTablet = screens.md && !screens.xl; // 768px - 1199px
    const isDesktop = screens.xl; // >= 1200px

    // Auto-collapse sidebar on tablet
    useEffect(() => {
        if (isTablet && !desktopCollapsed) {
            setDesktopCollapsed(true);
        } else if (isDesktop && desktopCollapsed) {
            setDesktopCollapsed(false);
        }
    }, [isTablet, isDesktop]);

    const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

    // Calculate content margin based on screen size and sidebar state
    const getContentMargin = () => {
        if (isMobile) return 0;
        if (isTablet || desktopCollapsed) return 80;
        return 240;
    };

    const algorithm = mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

    return (
        <ConfigProvider
            theme={{
                algorithm,
                token: {
                    colorPrimary: '#0052CC',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    borderRadius: 8,
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Header onMenuClick={toggleMobileSidebar} />
                <Layout style={{ marginTop: 60 }}>
                    <Sidebar
                        mobileOpen={mobileSidebarOpen}
                        setMobileOpen={setMobileSidebarOpen}
                        collapsed={desktopCollapsed}
                        setCollapsed={setDesktopCollapsed}
                    />
                    <Content
                        style={{
                            marginLeft: getContentMargin(),
                            padding: isMobile ? 16 : 24,
                            minHeight: 'calc(100vh - 60px)',
                            transition: 'margin-left 0.2s ease, padding 0.2s ease',
                            overflow: 'auto',
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
            <ChatbotWidget />
        </ConfigProvider>
    );
};

export default DashboardLayout;

