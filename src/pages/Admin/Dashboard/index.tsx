import { useState, useEffect } from 'react'
import { Container, Typography, Box, Grid, Paper, CircularProgress } from '@mui/material'

import dashboardService, { IDashboardOverview } from 'services/dashboardService'
import { usePopup } from 'hooks/usePopup'
import { useStyles } from './styles'

const Dashboard = () => {
  const classes = useStyles()
  const { addPopup } = usePopup()
  const [data, setData] = useState<IDashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const dashboardData = await dashboardService.getOverview()
        setData(dashboardData)
      } catch (error: any) {
        addPopup({
          type: 'error',
          title: 'Erro ao carregar dashboard',
          message: error?.detail || error?.message || 'Tente novamente mais tarde',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [addPopup])

  if (loading) {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h4" component="h1" className={classes.title}>
        Dashboard
      </Typography>
      <Box className={classes.content}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Aguardando</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.orders_today.awaiting}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Em Produção</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.orders_today.producing}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Produzidos Hoje</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.orders_today.produced}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Faturados</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.orders_today.billed}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Cancelados</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.orders_today.canceled}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Produzindo Agora</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.producing_now}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Taxa de Conclusão Hoje</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.completion_rate_today.toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Pedidos Atrasados</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.overdue_orders}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper className={classes.card}>
              <Typography variant="h6">Produzidos Não Faturados</Typography>
              <Typography variant="h4" className={classes.number}>
                {data.produced_not_billed}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Dashboard

