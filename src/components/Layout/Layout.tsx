import { ReactNode } from 'react'
import { AppBar, Box, Drawer, Toolbar, Typography, IconButton } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PieChartIcon from '@mui/icons-material/PieChart'
import SettingsIcon from '@mui/icons-material/Settings'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const drawerWidth = 260
const collapsedDrawerWidth = 64

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Auto-collapse sidebar when on investment-related routes
  useEffect(() => {
    const isInvestmentRoute = location.pathname.includes('/app/investment') || 
                             location.pathname.includes('/app/crypto-fund')
    
    if (isInvestmentRoute) {
      setCollapsed(true)
    }
  }, [location.pathname])

  const navItems = [
    { to: '/app/overview', icon: <DashboardIcon sx={{ color: 'primary.main' }} />, label: 'Overview' },
    { to: '/app/wallets', icon: <AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />, label: 'Wallets' },
    { to: '/app/portfolio', icon: <PieChartIcon sx={{ color: 'primary.main' }} />, label: 'Portfolio' },
    { to: '/app/investment', icon: <TrendingUpIcon sx={{ color: 'primary.main' }} />, label: 'Investment' },

    { to: '/app/crypto-test', icon: <TrendingUpIcon sx={{ color: 'primary.main' }} />, label: 'Crypto Test' },
    { to: '/app/settings', icon: <SettingsIcon sx={{ color: 'primary.main' }} />, label: 'Settings' },
  ] as const

  const drawer = (
    <div className="h-full flex flex-col bg-[#0f0f10]/80 backdrop-blur-md transition-colors">
      <div className={`px-6 py-6 transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed && (
          <>
            <Typography variant="h6" className="text-white font-bold">DAO Treasury</Typography>
            <Typography variant="body2" className="text-slate-300">Management Dashboard</Typography>
          </>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: 'white',
            position: 'absolute',
            right: collapsed ? 8 : 16,
            top: 16,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </div>
      <nav className={`p-4 space-y-2 flex-1 transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'hover:bg-[#121214] text-slate-300'}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}
      </nav>
      <div className={`p-4 transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        {!collapsed && <div className="chip bg-[#121214] text-slate-200">v0.1</div>}
      </div>
    </div>
  )

  const currentDrawerWidth = collapsed ? collapsedDrawerWidth : drawerWidth

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: (theme) => theme.palette.mode === 'dark' ? 'none' : `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.default',
          transition: 'background-color .3s ease, color .3s ease, border-color .3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:after': (theme) => theme.palette.mode === 'dark'
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 2,
                pointerEvents: 'none',
                background: 'linear-gradient(90deg, rgba(250,204,21,0.0) 0%, rgba(250,204,21,0.6) 50%, rgba(250,204,21,0.0) 100%)'
              }
            : { content: '""', display: 'none' }
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" className="text-white">
            DAO Treasury Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 }, position: 'fixed', height: '100vh', zIndex: (theme) => theme.zIndex.appBar - 1 }} aria-label="mailbox folders">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              borderRight: 'none', 
              backgroundColor: 'transparent', 
              backgroundImage: 'none' 
            },
            '& .MuiBackdrop-root': { backgroundColor: 'transparent' }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth, 
              borderRight: 'none', 
              backgroundColor: 'transparent', 
              backgroundImage: 'none',
              transition: 'width 0.3s ease'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          minWidth: 0, 
          ml: { sm: `${currentDrawerWidth}px` },
          transition: 'margin-left 0.3s ease'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </Box>
    </Box>
  )
}


