import { useState, useEffect } from 'react'
import { Grid, Box } from '@mui/material'
import {
  HourglassEmpty,
  Factory,
  CheckCircle,
  Payments,
  Cancel,
  PrecisionManufacturing,
  TrendingUp,
  Warning,
  Inventory2,
  ThumbsUpDown,
} from '@mui/icons-material'

import dashboardService, { IDashboardOverview } from 'services/dashboardService'
import { usePopup } from 'hooks/usePopup'
import { PageLayout, PageHeader, KpiCard, LoadingState, BarChart } from 'shared'
import type { KpiTone, BarChartPoint } from 'shared'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const toChartData = (data: IDashboardOverview): BarChartPoint[] =>
  (data.orders_by_day ?? []).map((p) => {
    const d = new Date(p.date + 'T00:00:00')
    return { label: WEEKDAYS[d.getDay()], value: p.count }
  })

const Dashboard = () => {
  const { addPopup } = usePopup()
  const [data, setData] = useState<IDashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setData(await dashboardService.getOverview())
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

  const kpis: { label: string; value: React.ReactNode; icon: React.ReactNode; tone: KpiTone }[] =
    data
      ? [
          { label: 'Aguardando', value: data.orders_today.awaiting, icon: <HourglassEmpty />, tone: 'neutral' },
          { label: 'Aguardando Aprovação', value: data.awaiting_production_approval ?? 0, icon: <ThumbsUpDown />, tone: 'warning' },
          { label: 'Em Produção', value: data.orders_today.producing, icon: <Factory />, tone: 'warning' },
          { label: 'Produzidos Hoje', value: data.orders_today.produced, icon: <CheckCircle />, tone: 'success' },
          { label: 'Faturados', value: data.orders_today.billed, icon: <Payments />, tone: 'info' },
          { label: 'Cancelados', value: data.orders_today.canceled, icon: <Cancel />, tone: 'error' },
          { label: 'Produzindo Agora', value: data.producing_now, icon: <PrecisionManufacturing />, tone: 'primary' },
          { label: 'Taxa de Conclusão Hoje', value: `${data.completion_rate_today.toFixed(1)}%`, icon: <TrendingUp />, tone: 'success' },
          { label: 'Pedidos Atrasados', value: data.overdue_orders, icon: <Warning />, tone: 'error' },
          { label: 'Produzidos Não Faturados', value: data.produced_not_billed, icon: <Inventory2 />, tone: 'info' },
        ]
      : []

  return (
    <PageLayout maxWidth={1200}>
      <PageHeader title="Dashboard" />
      {loading || !data ? (
        <LoadingState />
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {kpis.map((kpi) => (
              <Grid item xs={12} sm={6} md={4} key={kpi.label}>
                <KpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} tone={kpi.tone} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 3 }}>
            <BarChart title="Pedidos por dia (últimos 7 dias)" data={toChartData(data)} />
          </Box>
        </>
      )}
    </PageLayout>
  )
}

export default Dashboard
