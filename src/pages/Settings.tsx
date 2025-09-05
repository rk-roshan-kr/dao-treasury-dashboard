import { Card, CardContent, Typography, FormControlLabel, Switch, Box, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Divider } from '@mui/material'
import { useState, useEffect } from 'react'
import { cryptoMeta, type CryptoSymbol } from '../state/cryptoMeta'

// Types for wallet-specific sweep settings
interface WalletSweepSettings {
  enabled: boolean
  threshold: string
}

interface WalletSweepSettingsMap {
  [wallet: string]: WalletSweepSettings
}

export default function Settings() {
  const [hideAmounts, setHideAmounts] = useState(false)
  
  // Wallet-specific sweep settings
  const [walletSweepSettings, setWalletSweepSettings] = useState<WalletSweepSettingsMap>(() => {
    const saved = localStorage.getItem('wallet_sweep_settings')
    return saved ? JSON.parse(saved) : {}
  })

  // Save sweep settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wallet_sweep_settings', JSON.stringify(walletSweepSettings))
  }, [walletSweepSettings])

  // Get current wallet's sweep settings
  const getSweepSettings = (wallet: CryptoSymbol) => {
    return walletSweepSettings[wallet] || { enabled: false, threshold: '' }
  }

  const setSweepSettings = (wallet: CryptoSymbol, settings: WalletSweepSettings) => {
    setWalletSweepSettings(prev => ({
      ...prev,
      [wallet]: settings
    }))
  }

  const availableWallets: CryptoSymbol[] = ['BTC', 'ETH', 'USDT', 'SOL', 'BAT', 'SEPOLIA_ETH']

  return (
    <div className="space-y-6">
      <Typography variant="h4" className="text-white font-bold mb-6">Settings</Typography>
      
      {/* General Preferences */}
      <Card className="card-base">
        <CardContent>
          <Typography variant="h6" className="text-white font-semibold mb-4">General Preferences</Typography>
          <FormControlLabel 
            control={
              <Switch 
                checked={hideAmounts} 
                onChange={(e) => setHideAmounts(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#667eea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#667eea',
                  },
                }}
              />
            } 
            label="Hide Amounts" 
            sx={{ color: '#a9b2ff' }}
          />
          <Typography variant="body2" className="text-slate-400 mt-2">
            Hide sensitive financial information from the interface
          </Typography>
        </CardContent>
      </Card>

      {/* Auto Sweep Settings */}
      <Card className="card-base">
        <CardContent>
          <Typography variant="h6" className="text-white font-semibold mb-4">Auto Sweep Configuration</Typography>
          <Typography variant="body2" className="text-slate-400 mb-6">
            Configure automatic sweep thresholds for each cryptocurrency. When balance exceeds the threshold, 
            excess amount will be automatically transferred to your investment wallet.
          </Typography>
          
          <div className="space-y-4">
            {availableWallets.map((wallet) => {
              const settings = getSweepSettings(wallet)
              const meta = cryptoMeta[wallet]
              
              return (
                <Box 
                  key={wallet} 
                  sx={{ 
                    p: 3, 
                    border: '1px solid rgba(169, 178, 255, 0.1)', 
                    borderRadius: 2,
                    background: 'rgba(169, 178, 255, 0.02)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: meta?.color || '#60a5fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'white'
                        }}
                      >
                        {wallet.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" className="text-white font-semibold">
                          {meta?.name || wallet}
                        </Typography>
                        <Typography variant="body2" className="text-slate-400">
                          {wallet} Wallet
                        </Typography>
                      </Box>
                    </Box>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={settings.enabled} 
                          onChange={(e) => setSweepSettings(wallet, { ...settings, enabled: e.target.checked })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#667eea',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#667eea',
                            },
                          }}
                        />
                      } 
                      label="" 
                    />
                  </Box>
                  
                  {settings.enabled && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        label={`Threshold (${wallet})`}
                        type="number"
                        value={settings.threshold}
                        onChange={(e) => setSweepSettings(wallet, { ...settings, threshold: e.target.value })}
                        placeholder="e.g. 10.0"
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#ffffff',
                            '& fieldset': {
                              borderColor: 'rgba(169, 178, 255, 0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(169, 178, 255, 0.4)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: '#a9b2ff',
                            '&.Mui-focused': {
                              color: '#667eea',
                            },
                          },
                        }}
                      />
                      <Typography variant="body2" className="text-slate-400 mt-1">
                        Auto sweep when balance exceeds this amount
                      </Typography>
                    </Box>
                  )}
                </Box>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="card-base">
        <CardContent>
          <Typography variant="h6" className="text-white font-semibold mb-4">Notifications</Typography>
          <FormControlLabel 
            control={
              <Switch 
                defaultChecked 
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#667eea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#667eea',
                  },
                }}
              />
            } 
            label="Email Notifications" 
            sx={{ color: '#a9b2ff' }}
          />
          <Typography variant="body2" className="text-slate-400 mt-2">
            Receive email notifications for important transactions and updates
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}


