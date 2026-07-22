import { useState, useEffect, useCallback } from 'react'
import { Button, Chip } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { Receipt as ReceiptIcon } from '@mui/icons-material'

import orderService from 'services/orderService'
import billingService from 'services/billingService'
import { IOrder, OrderStatus } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { LoadingState, OrderDetailView } from 'shared'

const FiscalOrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [billLoading, setBillLoading] = useState(false)

  const loadOrder = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setOrder(await orderService.getFiscalOrder(Number(id)))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedido',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
      navigate('/admin/fiscal')
    } finally {
      setLoading(false)
    }
  }, [id, addPopup, navigate])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const handleNotaEmitida = async () => {
    if (!id || order?.status !== OrderStatus.PRODUCED) return
    try {
      setBillLoading(true)
      setOrder(await billingService.billOrder(Number(id)))
      addPopup({ type: 'success', title: 'Nota fiscal', message: 'Pedido marcado como Nota emitida.' })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao marcar nota',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setBillLoading(false)
    }
  }

  if (loading) return <LoadingState minHeight="60vh" />
  if (!order) return null

  const isBilled = order.status === OrderStatus.BILLED

  return (
    <OrderDetailView
      order={order}
      onBack={() => navigate('/admin/fiscal')}
      actions={
        isBilled ? (
          <Chip icon={<ReceiptIcon />} label="Nota emitida" color="success" />
        ) : (
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={handleNotaEmitida}
            disabled={billLoading}
          >
            {billLoading ? 'Salvando...' : 'Nota emitida'}
          </Button>
        )
      }
    />
  )
}

export default FiscalOrderDetail
