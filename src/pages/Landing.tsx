import { Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      background:
        'radial-gradient(1200px 600px at 15% -10%, rgba(114,87,255,.10), transparent 60%),\
         radial-gradient(1000px 500px at 85% -20%, rgba(93,199,255,.10), transparent 65%),\
         #0a0a0a',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontWeight: 900, color: '#fff' }}>DAO Treasury</Typography>
        <Typography variant="h6" sx={{ mt: 2, color: '#cbd0f8' }}>
          Manage wallets, track portfolio, and automate treasury flows with a clean, dark UI.
        </Typography>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <Button component={RouterLink} to="/app/overview" size="large" variant="contained" color="primary">
            Open App
          </Button>
          <Button component={RouterLink} to="/app/wallets" size="large" variant="outlined" color="secondary" sx={{ borderColor: 'secondary.main' }}>
            Go to Wallets
          </Button>
        </div>
      </Container>
    </div>
  )
}


