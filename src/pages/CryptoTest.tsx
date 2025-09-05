import React, { useState } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Chip,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { useCryptoStore, useCryptoBalance } from '../state/useCryptoStore'
import type { CryptoSymbol } from '../state/cryptoStore'

export default function CryptoTest() {
  const { balances, updateBalance } = useCryptoStore()
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSymbol>('BTC')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleUpdateBalance = (change: number) => {
    if (!amount || parseFloat(amount) <= 0) return
    
    const numAmount = parseFloat(amount)
    updateBalance(selectedCrypto, change * numAmount, description || undefined)
    setAmount('')
    setDescription('')
  }

  const formatBalance = (balance: number) => {
    return balance.toFixed(8)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crypto Balance Test Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page demonstrates real-time crypto balance updates. When you update balances here, 
        all other components throughout the app will automatically update to reflect the changes.
      </Alert>

      {/* Current Balances Display */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Balances (Live Updates)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(balances).map(([symbol, balance]) => (
              <Chip
                key={symbol}
                label={`${symbol}: ${formatBalance(balance)}`}
                color={balance > 0 ? 'primary' : 'default'}
                onClick={() => setSelectedCrypto(symbol as CryptoSymbol)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Interactive Controls */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Balances
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Crypto</InputLabel>
                  <Select
                    value={selectedCrypto}
                    label="Select Crypto"
                    onChange={(e) => setSelectedCrypto(e.target.value as CryptoSymbol)}
                  >
                    {Object.keys(balances).map((symbol) => (
                      <MenuItem key={symbol} value={symbol}>
                        {symbol}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  placeholder="Enter amount to add/remove"
                />
                <TextField
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  placeholder="e.g., 'Bought from exchange', 'Sent to wallet'"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => handleUpdateBalance(1)}
                    fullWidth
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={() => handleUpdateBalance(-1)}
                    fullWidth
                  >
                    Remove
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    updateBalance('BTC', 0.1, 'Test transaction')
                  }}
                >
                  Add 0.1 BTC (Test)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    updateBalance('ETH', 0.5, 'Test transaction')
                  }}
                >
                  Add 0.5 ETH (Test)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    updateBalance('USDT', 100, 'Test transaction')
                  }}
                >
                  Add 100 USDT (Test)
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    updateBalance('BTC', -0.05, 'Test removal')
                  }}
                >
                  Remove 0.05 BTC (Test)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Test Real-time Updates
          </Typography>
          <Typography variant="body2" paragraph>
            1. <strong>Update balances here:</strong> Use the controls above to add or remove crypto amounts
          </Typography>
          <Typography variant="body2" paragraph>
            2. <strong>Check other pages:</strong> Navigate to Dashboard, Portfolio, or Wallets pages - the balances will be updated there too
          </Typography>
          <Typography variant="body2" paragraph>
            3. <strong>Console testing:</strong> Open browser console and run: <code>window.cryptoStore.delta('BTC', 0.1, 'Console test')</code>
          </Typography>
          <Typography variant="body2" paragraph>
            4. <strong>Persistence:</strong> All changes are automatically saved to localStorage and will persist between browser sessions
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
