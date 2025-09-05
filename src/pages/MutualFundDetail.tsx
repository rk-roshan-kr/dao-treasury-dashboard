import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  TextField,
  AppBar,
  Toolbar,
  Container,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  IconButton
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  Assessment,
  AccountBalance,
  Person,
  Business,
  CompareArrows,
  Calculate,
  Info,
  ArrowBack,
  PieChart,
  ShowChart,
  AttachMoney,
  Timeline
} from '@mui/icons-material'

export default function MutualFundDetail() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')
  const [investmentType, setInvestmentType] = useState<'recurring' | 'lumpsum'>('recurring')
  const [investmentAmount, setInvestmentAmount] = useState('1000')

  // Crypto investment fund data
  const fundData = {
    name: "DeFi Yield Optimization Fund",
    category: "DeFi",
    riskLevel: "High Risk",
    currentValue: "1.2847",
    valueDate: "22 Aug 2025",
    returns: {
      "1M": "12.45",
      "6M": "45.20",
      "1Y": "156.20",
      "3Y": "284.70",
      "5Y": "412.50"
    },
    rating: 4,
    minRecurring: "$100",
    minLumpsum: "$500",
    tvl: "$2.4M",
    apy: "12.5%",
    protocolFee: "2% management fee",
    fundSize: "$125.8M",
    fundAge: "2.5 years",
    expenseRatio: "1.25%"
  }

  const holdings = [
    { name: "Uniswap V3 USDC/ETH", protocol: "Uniswap", allocation: "18.5%" },
    { name: "Aave USDT Lending", protocol: "Aave", allocation: "15.2%" },
    { name: "Compound ETH Staking", protocol: "Compound", allocation: "12.8%" },
    { name: "Curve 3Pool LP", protocol: "Curve", allocation: "11.4%" },
    { name: "Yearn USDC Vault", protocol: "Yearn", allocation: "9.7%" }
  ]

  const fundManager = {
    name: "Alex Chen",
    tenure: "Jan 2023 - Present",
    education: "MS Computer Science, CFA Level 3",
    experience: "Former DeFi researcher at Paradigm and quantitative analyst at Two Sigma. Specialized in yield optimization strategies and protocol risk assessment.",
    otherFunds: 5
  }

  const timeframes = ['1M', '6M', '1Y', '3Y', '5Y', 'All']

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* 1. Header - Sticky Top */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {fundData.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip label={fundData.category} size="small" color="primary" />
              <Chip label={fundData.riskLevel} size="small" color="error" />
              <Chip label="DeFi" size="small" color="secondary" />
            </Box>
          </Box>
          <Rating value={fundData.rating} readOnly size="small" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* 2. Fund Overview - Quick Summary */}
        <Card sx={{ mb: 3, p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    ${fundData.currentValue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Token Value: {fundData.valueDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp color="success" />
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    +{fundData.returns["1Y"]}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">1Y</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Current APY</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">{fundData.apy}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Value Locked</Typography>
                  <Typography variant="body2" fontWeight="bold">{fundData.tvl}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Min Investment</Typography>
                  <Typography variant="body2" fontWeight="bold">{fundData.minLumpsum}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* 3. Graph Section - Centerpiece */}
        <Card sx={{ mb: 3, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Performance Chart
            </Typography>
            <ToggleButtonGroup
              value={selectedTimeframe}
              exclusive
              onChange={(e, value) => value && setSelectedTimeframe(value)}
              size="small"
            >
              {timeframes.map((timeframe) => (
                <ToggleButton key={timeframe} value={timeframe}>
                  {timeframe}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          
          {/* Placeholder for Chart */}
          <Box sx={{ 
            height: 300, 
            bgcolor: 'grey.100', 
            borderRadius: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px dashed',
            borderColor: 'grey.300'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <ShowChart sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="grey.500">Performance Chart</Typography>
              <Typography variant="body2" color="grey.400">Interactive NAV growth over {selectedTimeframe}</Typography>
            </Box>
          </Box>
        </Card>

        {/* 4. Quick Stats Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {fundData.fundSize}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fund Size
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {fundData.apy}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current APY
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold">
                {fundData.fundAge}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Fund Age
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Star color="warning" />
                <Typography variant="h6" fontWeight="bold">
                  {fundData.rating}/5
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Risk Rating
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* 5. Fund Details Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Holdings Table */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Top Protocol Holdings
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Position</strong></TableCell>
                        <TableCell><strong>Protocol</strong></TableCell>
                        <TableCell align="right"><strong>Allocation</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {holdings.map((holding, index) => (
                        <TableRow key={index}>
                          <TableCell>{holding.name}</TableCell>
                          <TableCell>
                            <Chip label={holding.protocol} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {holding.allocation}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Fund Manager */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Fund Manager
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{fundManager.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{fundManager.tenure}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {fundManager.experience}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manages {fundManager.otherFunds} other DeFi funds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 6. Investment CTA Section - Sticky Bottom */}
        <Box sx={{ 
          position: 'sticky', 
          bottom: 0, 
          bgcolor: 'background.paper', 
          borderTop: 1, 
          borderColor: 'divider',
          p: 2,
          mt: 3
        }}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <ToggleButtonGroup
                    value={investmentType}
                    exclusive
                    onChange={(e, value) => value && setInvestmentType(value)}
                    size="small"
                  >
                    <ToggleButton value="recurring">Recurring Investment</ToggleButton>
                    <ToggleButton value="lumpsum">One-Time</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    label="Investment Amount"
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    InputProps={{ startAdornment: '$' }}
                    fullWidth
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" startIcon={<CompareArrows />}>
                    Compare
                  </Button>
                  <Button variant="contained" size="large" startIcon={<AttachMoney />}>
                    Invest Now
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* 7. Disclaimers & Legal Notes */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="warning.main">
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            Important Disclaimer
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            DeFi investments are subject to market risks, including but not limited to smart contract risks, 
            protocol vulnerabilities, and extreme volatility. APY rates may fluctuate and are not guaranteed. 
            Past performance is not indicative of future results. Please ensure you understand the risks 
            before investing.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This platform is for educational purposes only. Always do your own research and consider 
            consulting with a financial advisor before making investment decisions.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
