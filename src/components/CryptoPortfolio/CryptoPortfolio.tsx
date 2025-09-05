import React, { useState } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Box, 
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon, History as HistoryIcon } from '@mui/icons-material'
import { useCryptoStore, useCryptoBalance } from '../../state/useCryptoStore'
import type { CryptoSymbol } from '../../state/cryptoStore'

export default function CryptoPortfolio() {
  const { balances, transactions, updateBalance, addTransaction } = useCryptoStore()
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSymbol>('BTC')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  const handleUpdateBalance = (change: number) => {
    if (!amount || parseFloat(amount) <= 0) return
    
    const numAmount = parseFloat(amount)
    updateBalance(selectedCrypto, change * numAmount, description || undefined)
    setAmount('')
    setDescription('')
  }

  const handleAddTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    const numAmount = parseFloat(amount)
    addTransaction({
      type: 'buy',
      symbol: selectedCrypto,
      amount: numAmount,
      description: description || 'Manual transaction'
    })
    setShowTransactionDialog(false)
    setAmount('')
    setDescription('')
  }

  const formatBalance = (balance: number) => {
    return balance.toFixed(8)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crypto Portfolio
      </Typography>

      {/* Portfolio Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Balances
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

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              select
              label="Crypto"
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value as CryptoSymbol)}
              sx={{ minWidth: 120 }}
            >
              {Object.keys(balances).map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </TextField>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ minWidth: 120 }}
            />
            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => handleUpdateBalance(1)}
            >
              Add
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<RemoveIcon />}
              onClick={() => handleUpdateBalance(-1)}
            >
              Remove
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowTransactionDialog(true)}
            >
              Add Transaction
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setShowHistoryDialog(true)}
            >
              View History
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Selected Crypto Details */}
      <CryptoDetails symbol={selectedCrypto} />

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onClose={() => setShowTransactionDialog(false)}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Crypto"
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value as CryptoSymbol)}
            sx={{ mb: 2, mt: 1 }}
          >
            {Object.keys(balances).map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransactionDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTransaction} variant="contained">
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog 
        open={showHistoryDialog} 
        onClose={() => setShowHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transaction History</DialogTitle>
        <DialogContent>
          <List>
            {transactions.slice(0, 20).map((tx) => (
              <React.Fragment key={tx.id}>
                <ListItem>
                  <ListItemText
                    primary={`${tx.type.toUpperCase()} ${tx.amount} ${tx.symbol}`}
                    secondary={`${formatDate(tx.timestamp)}${tx.description ? ` - ${tx.description}` : ''}`}
                  />
                  <Chip 
                    label={tx.type} 
                    color={tx.type === 'buy' || tx.type === 'receive' ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// Component to show details for a specific crypto
function CryptoDetails({ symbol }: { symbol: CryptoSymbol }) {
  const { balance, updateBalance } = useCryptoBalance(symbol)
  const { getTransactionsBySymbol } = useCryptoStore()
  const transactions = getTransactionsBySymbol(symbol)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {symbol} Details
        </Typography>
        <Typography variant="body1" gutterBottom>
          Current Balance: {balance.toFixed(8)}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Recent Transactions: {transactions.length}
        </Typography>
        {transactions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Activity:
            </Typography>
            <List dense>
              {transactions.slice(0, 5).map((tx) => (
                <ListItem key={tx.id} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${tx.type} ${tx.amount} ${tx.symbol}`}
                    secondary={new Date(tx.timestamp).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
