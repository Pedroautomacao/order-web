import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Autocomplete,
  TextField,
} from '@mui/material'
import {
  ShoppingCart,
  Payments,
  Schedule,
  TrendingUp,
  Warning,
  Receipt,
  Person,
  Event,
} from '@mui/icons-material'

import analyticsService, {
  IAnalyticsOverview,
  IAnalyticsByClient,
  IByDayPoint,
} from 'services/analyticsService'
import clientService from 'services/clientService'
import { IClient } from 'interfaces/IClient'
import { usePopup } from 'hooks/usePopup'
import {
  PageLayout,
  PageHeader,
  KpiCard,
  BarChart,
  DateField,
  LoadingState,
  EmptyState,
  formatCurrency,
} from 'shared'
import type { BarChartPoint } from 'shared'
import { todayInSaoPaulo } from 'utils/orderDateUtils'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Datas no fuso de São Paulo: toISOString() devolveria a data em UTC, que à
// noite já é o dia seguinte.
const firstDayOfMonth = () => `${todayInSaoPaulo().slice(0, 7)}-01`
const todayStr = () => todayInSaoPaulo()

const toChart = (points: IByDayPoint[]): BarChartPoint[] =>
  points.map((p) => {
    const d = new Date(p.date + 'T00:00:00')
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, value: p.count }
  })

/** Tabela simples de ranking (top N). */
const RankTable = ({
  title,
  columns,
  rows,
}: {
  title: string
  columns: string[]
  rows: (string | number)[][]
}) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
      {title}
    </Typography>
    {rows.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        Sem dados no período.
      </Typography>
    ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((c, i) => (
              <TableCell key={c} align={i === 0 ? 'left' : 'right'}>
                {c}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, ri) => (
            <TableRow key={ri}>
              {r.map((cell, ci) => (
                <TableCell key={ci} align={ci === 0 ? 'left' : 'right'}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </Paper>
)

// ───────────────────────── Aba: Dados Gerais ─────────────────────────
const GeneralTab = () => {
  const { addPopup } = usePopup()
  const [from, setFrom] = useState(firstDayOfMonth())
  const [to, setTo] = useState(todayStr())
  const [data, setData] = useState<IAnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setData(await analyticsService.overview(from, to))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar dados',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }, [from, to, addPopup])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <DateField label="De" value={from} onChange={setFrom} />
        <DateField label="Até" value={to} onChange={setTo} />
      </Box>

      {loading || !data ? (
        <LoadingState />
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total de pedidos" value={data.total_orders} icon={<ShoppingCart />} tone="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Faturamento total" value={formatCurrency(data.financials.total_amount)} icon={<Payments />} tone="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Ticket médio" value={formatCurrency(data.financials.avg_ticket)} icon={<Receipt />} tone="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Em aberto (a prazo)" value={formatCurrency(data.financials.outstanding_amount)} icon={<Schedule />} tone="warning" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Taxa de conclusão" value={`${data.completion_rate}%`} icon={<TrendingUp />} tone="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Faturado" value={formatCurrency(data.financials.billed_amount)} icon={<Receipt />} tone="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="À vista / A prazo" value={`${data.payment_mix.cash} / ${data.payment_mix.credit}`} icon={<Payments />} tone="neutral" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Taxa de quebra" value={`${data.break_stats.rate}%`} icon={<Warning />} tone="error" />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <BarChart title="Pedidos por dia" data={toChart(data.orders_by_day)} />
          </Box>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={4}>
              <RankTable
                title="SKUs mais vendidos"
                columns={['Produto', 'Qtd']}
                rows={data.top_skus.map((s) => [`${s.sku} — ${s.name}`, s.quantity])}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RankTable
                title="Vendedores (pedidos produzidos)"
                columns={['Vendedor', 'Pedidos']}
                rows={data.top_sellers.map((s) => [s.name, s.produced_orders])}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RankTable
                title="Clientes com mais pedidos"
                columns={['Cliente', 'Pedidos', 'Valor']}
                rows={data.top_clients.map((c) => [c.name, c.orders, formatCurrency(c.amount)])}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

// ───────────────────────── Aba: Por Cliente ─────────────────────────
const ClientTab = () => {
  const { addPopup } = usePopup()
  const [from, setFrom] = useState(firstDayOfMonth())
  const [to, setTo] = useState(todayStr())
  const [clients, setClients] = useState<IClient[]>([])
  const [client, setClient] = useState<IClient | null>(null)
  const [data, setData] = useState<IAnalyticsByClient | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    clientService.getClients(undefined, true).then(setClients).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    if (!client) {
      setData(null)
      return
    }
    try {
      setLoading(true)
      setData(await analyticsService.byClient(client.id, from, to))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar dados do cliente',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }, [client, from, to, addPopup])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Autocomplete
          options={clients}
          getOptionLabel={(o) => `${o.name} — ${o.cpf_cnpj}`}
          value={client}
          onChange={(_, v) => setClient(v)}
          sx={{ minWidth: 280, flex: 1 }}
          renderInput={(params) => <TextField {...params} label="Cliente" size="small" />}
        />
        <DateField label="De" value={from} onChange={setFrom} />
        <DateField label="Até" value={to} onChange={setTo} />
      </Box>

      {!client ? (
        <EmptyState
          icon={<Person />}
          title="Selecione um cliente e o período"
          description="Escolha um cliente e o intervalo de datas acima para ver o comportamento de compras, situação de crédito e produtos mais pedidos."
        />
      ) : loading || !data ? (
        <LoadingState />
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Pedidos no período" value={data.total_orders} icon={<ShoppingCart />} tone="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total comprado" value={formatCurrency(data.financials.total_amount)} icon={<Payments />} tone="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Ticket médio" value={formatCurrency(data.financials.avg_ticket)} icon={<Receipt />} tone="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                label="Dias desde último pedido"
                value={data.days_since_last_order ?? '—'}
                icon={<Event />}
                tone="neutral"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Crédito disponível" value={formatCurrency(data.credit.available)} icon={<Schedule />} tone={data.credit.available < 0 ? 'error' : 'success'} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Em aberto (a prazo)" value={formatCurrency(data.credit.outstanding)} icon={<Schedule />} tone="warning" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Limite de crédito" value={formatCurrency(data.credit.limit)} icon={<Payments />} tone="neutral" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Taxa de quebra" value={`${data.break_stats.rate}%`} icon={<Warning />} tone="error" />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <BarChart title={`Pedidos por dia — ${data.client?.name ?? ''}`} data={toChart(data.orders_by_day)} />
          </Box>

          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <RankTable
                title="Produtos mais pedidos pelo cliente"
                columns={['Produto', 'Qtd']}
                rows={data.top_skus.map((s) => [`${s.sku} — ${s.name}`, s.quantity])}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RankTable
                title="Pedidos por status"
                columns={['Status', 'Qtd']}
                rows={[
                  ['Aguardando', data.orders_by_status.Awaiting],
                  ['Em produção', data.orders_by_status.Producing],
                  ['Produzido', data.orders_by_status.Produced],
                  ['Faturado', data.orders_by_status.Billed],
                  ['Cancelado', data.orders_by_status.Canceled],
                ]}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

const Analytics = () => {
  const [tab, setTab] = useState(0)
  return (
    <PageLayout maxWidth={1200}>
      <PageHeader title="Relatórios" subtitle="Análises de pedidos para apoio à decisão." />
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Dados Gerais" />
          <Tab label="Por Cliente" />
        </Tabs>
      </Paper>
      {tab === 0 ? <GeneralTab /> : <ClientTab />}
    </PageLayout>
  )
}

export default Analytics
