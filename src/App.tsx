import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import React, { Suspense, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import Landing from './pages/Landing'
import ComingSoon from './pages/ComingSoon'

const Wallets = React.lazy(() => import('./pages/Wallets'))
const Wallet = React.lazy(() => import('./pages/Wallet'))
const WalletCombined = React.lazy(() => import('./pages/WalletCombined'))
const Portfolio = React.lazy(() => import('./pages/Portfolio'))
const Settings = React.lazy(() => import('./pages/Settings'))
const CryptoTest = React.lazy(() => import('./pages/CryptoTest'))
const Investment = React.lazy(() => import('./pages/Investment'))
const InvestmentDetail = React.lazy(() => import('./pages/InvestmentDetail'))
const MutualFundDetail = React.lazy(() => import('./pages/MutualFundDetail'))


export default function App() {
  const mode: 'light' | 'dark' = 'dark'

  const theme = useMemo(() => {
    const palette = {
      primary: '#60a5fa',
      secondary: '#F5BD02',
      bg: '#0a0a0a',
      paper: '#0f0f10',
      text: '#ffffff',
      divider: '#1f1f22',
    }

    return createTheme({
      palette: {
        mode,
        primary: { main: palette.primary },
        secondary: { main: palette.secondary },
        background: { default: palette.bg, paper: palette.paper },
        text: { primary: palette.text },
        divider: palette.divider,
      },
      shape: { borderRadius: 12 },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: palette.bg,
              color: palette.text,
              transition: 'background-color .3s ease, color .3s ease',
            },
          },
        },
      },
    })
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', theme.palette.primary.main)
    root.style.setProperty('--accent-soft', 'rgba(96,165,250,0.15)')
    root.style.setProperty('--gold', '#F5BD02')
    root.style.setProperty('--gold-soft', 'rgba(245,189,2,0.18)')
  }, [theme])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<Landing />} />

          {/* App shell with sidebar/header */}
          <Route path="/app" element={<Layout><Dashboard /></Layout>} />
          <Route
            path="/app/overview"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/app/wallets"
            element={
              <Layout>
                <Wallets />
              </Layout>
            }
          />
          <Route
            path="/app/wallet"
            element={
              <Layout>
                <Wallet />
              </Layout>
            }
          />
          <Route
            path="/app/wallet-combined"
            element={
              <Layout>
                <WalletCombined />
              </Layout>
            }
          />
          <Route
            path="/app/portfolio"
            element={
              <Layout>
                <Portfolio />
              </Layout>
            }
          />
          <Route
            path="/app/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          <Route
            path="/app/investment"
            element={
              <Layout>
                <Investment />
              </Layout>
            }
          />
          <Route
            path="/app/investment-detail"
            element={
              <Layout>
                <InvestmentDetail />
              </Layout>
            }
          />
          <Route
            path="/app/crypto-fund"
            element={
              <Layout>
                <MutualFundDetail />
              </Layout>
            }
          />

          <Route
            path="/app/crypto-test"
            element={
              <Layout>
                <CryptoTest />
              </Layout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}
