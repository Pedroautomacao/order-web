import { Box, Button, Card, CardContent, Divider, Typography } from '@mui/material'
import { Visibility as ViewIcon } from '@mui/icons-material'

import { IOrder } from 'interfaces/IOrder'
import StatusChip from 'shared/StatusChip'
import PaymentChip from 'shared/PaymentChip'
import { formatCurrency } from 'shared/format'

interface OrderListCardProps {
  order: IOrder
  onView: (order: IOrder) => void
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

/**
 * Cartão de pedido para o mobile (lista de Pedidos/Meus Pedidos/Fiscal).
 * Mostra cliente em destaque, ID, data de entrega, status e botão "Ver".
 */
export const OrderListCard = ({ order, onView }: OrderListCardProps) => (
  <Card>
    <CardContent sx={{ pb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
          {order.client?.name ?? 'Cliente'}
        </Typography>
        <StatusChip status={order.status} />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: 'text.secondary', mb: 1 }}>
        <Typography variant="body2">Pedido #{order.id}</Typography>
        <Typography variant="body2">Entrega: {formatDate(order.scheduled_date)}</Typography>
        <Typography variant="body2">Total: {formatCurrency(order.total_amount)}</Typography>
      </Box>
      <PaymentChip method={order.payment_method} isPaid={order.is_paid} showPaidStatus />
    </CardContent>
    <Divider />
    <Box sx={{ p: 1 }}>
      <Button
        fullWidth
        startIcon={<ViewIcon />}
        onClick={() => onView(order)}
        sx={{ justifyContent: 'flex-start' }}
      >
        Ver detalhes
      </Button>
    </Box>
  </Card>
)

export default OrderListCard
