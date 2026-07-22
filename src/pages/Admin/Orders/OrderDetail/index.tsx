import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { Paid as PaidIcon } from '@mui/icons-material'

import orderService from 'services/orderService'
import { IOrder, OrderStatus, PaymentMethod } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { LoadingState, OrderDetailView } from 'shared'

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setOrder(await orderService.getOrder(Number(id)))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedido',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }, [id, addPopup, navigate])

  useEffect(() => {
    load()
  }, [load])

  const handleMarkPaid = async () => {
    if (!order) return
    setPaying(true)
    try {
      setOrder(await orderService.markOrderPaid(order.id))
      addPopup({ type: 'success', title: 'Pedido marcado como pago' })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao marcar como pago',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <LoadingState minHeight="60vh" />
  if (!order) return null

  const canMarkPaid =
    order.payment_method === PaymentMethod.CREDIT &&
    !order.is_paid &&
    order.status !== OrderStatus.CANCELED

  return (
    <OrderDetailView
      order={order}
      onBack={() => navigate('/admin/orders')}
      actions={
        canMarkPaid ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<PaidIcon />}
            onClick={handleMarkPaid}
            disabled={paying}
          >
            {paying ? 'Salvando...' : 'Marcar como pago'}
          </Button>
        ) : undefined
      }
    />
  )
}

export default OrderDetail
