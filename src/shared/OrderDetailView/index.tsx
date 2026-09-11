import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'
import { ReactNode } from 'react'

import { IOrder, getOrderItemStatusLabel } from 'interfaces/IOrder'
import {
  PageLayout,
  StatusChip,
  PaymentChip,
  ApprovalChip,
  formatCurrency,
  productLabel,
} from 'shared'

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

const formatQuantity = (value: number | null | undefined, unitCode?: string | null) => {
  if (value == null) return '-'
  return unitCode ? `${value} ${unitCode}` : String(value)
}

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
  </Box>
)

interface OrderDetailViewProps {
  order: IOrder
  onBack: () => void
  /** Botões de ação (faturar, cancelar…) exibidos no cabeçalho. */
  actions?: ReactNode
  /** Campos extras (ex.: vendedor, criado em). */
  extraFields?: ReactNode
}

/**
 * Visão de detalhe de pedido reaproveitável (admin, vendedor, fiscal):
 * cabeçalho com voltar + status, cartão de informações e tabela de itens.
 */
export const OrderDetailView = ({ order, onBack, actions, extraFields }: OrderDetailViewProps) => {
  // produced_items + current_item é o recorte do produtor: deixa de fora todo
  // item ainda em Aguardando. O fallback cobre uma API anterior ao campo items.
  const allItems =
    order.items ?? [
      ...(order.produced_items || []),
      ...(order.current_item ? [order.current_item] : []),
    ]

  return (
    <PageLayout maxWidth={1000}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Button startIcon={<BackIcon />} onClick={onBack} sx={{ mb: 1 }} color="inherit">
            Voltar
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Pedido #{order.id}
            </Typography>
            <StatusChip status={order.status} size="medium" />
            <ApprovalChip approval={order.production_approval} size="medium" />
          </Box>
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Informações gerais
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Field label="Cliente" value={order.client?.name ?? '-'} />
          <Field
            label="Criado por"
            value={order.created_by?.full_name || order.created_by?.username || '-'}
          />
          <Field label="Data de entrega" value={formatDate(order.scheduled_date)} />
          <Field label="Prioridade" value={order.priority || '-'} />
          <Field label="Total" value={formatCurrency(order.total_amount)} />
          <Field
            label="Pagamento"
            value={<PaymentChip method={order.payment_method} isPaid={order.is_paid} showPaidStatus />}
          />
          {extraFields}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Itens do pedido
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Produzido</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum item
                  </TableCell>
                </TableRow>
              ) : (
                allItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{productLabel(item.product)}</TableCell>
                    <TableCell align="right">
                      {formatQuantity(item.quantity, item.product?.unit?.code)}
                    </TableCell>
                    <TableCell align="right">
                      {formatQuantity(item.produced_quantity, item.product?.unit?.code)}
                    </TableCell>
                    <TableCell>{getOrderItemStatusLabel(item.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </PageLayout>
  )
}

export default OrderDetailView
