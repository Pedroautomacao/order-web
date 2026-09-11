import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Paid as PaidIcon,
  CheckCircle as ApproveIcon,
  Block as RecuseIcon,
  Edit as EditIcon,
} from '@mui/icons-material'

import orderService from 'services/orderService'
import {
  IOrder,
  IOrderItemCreate,
  OrderStatus,
  PaymentMethod,
  ProductionApproval,
} from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import {
  ActionsMenu,
  ConfirmDialog,
  LoadingState,
  OrderDetailView,
  OrderItemsEditModal,
} from 'shared'
import type { ActionItem } from 'shared'

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [confirmando, setConfirmando] = useState<'approve' | 'recuse' | null>(null)
  const [decidindo, setDecidindo] = useState(false)
  const [editando, setEditando] = useState(false)
  const [salvandoItens, setSalvandoItens] = useState(false)

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

  const decidirProducao = async () => {
    if (!order || !confirmando) return
    setDecidindo(true)
    try {
      const acao =
        confirmando === 'approve'
          ? orderService.approveProduction
          : orderService.recuseProduction
      setOrder(await acao(order.id))
      addPopup({
        type: 'success',
        title: confirmando === 'approve' ? 'Produção aprovada' : 'Produção recusada',
      })
      setConfirmando(null)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Não foi possível concluir a ação',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setDecidindo(false)
    }
  }

  const salvarItens = async (items: IOrderItemCreate[]) => {
    if (!order) return
    setSalvandoItens(true)
    try {
      // cliente e data seguem como estão: o modal mexe só nos itens, mas o
      // contrato do PUT exige o pedido inteiro
      setOrder(
        await orderService.updateOrder(order.id, {
          clientId: order.client?.id ?? order.client_id,
          scheduledDate: order.scheduled_date,
          paymentMethod: order.payment_method as PaymentMethod,
          items,
        }),
      )
      addPopup({ type: 'success', title: 'Pedido atualizado' })
      setEditando(false)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao atualizar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setSalvandoItens(false)
    }
  }

  if (loading) return <LoadingState minHeight="60vh" />
  if (!order) return null

  const canMarkPaid =
    order.payment_method === PaymentMethod.CREDIT &&
    !order.is_paid &&
    order.status !== OrderStatus.CANCELED

  // Mesma regra da tela de pedidos: a decisão é reversível nos dois sentidos e
  // só desaparece em pedido encerrado.
  const podeDecidirProducao = ![OrderStatus.CANCELED, OrderStatus.BILLED].includes(
    order.status,
  )
  const canApprove =
    podeDecidirProducao && order.production_approval !== ProductionApproval.APPROVED
  const canRecuse =
    podeDecidirProducao && order.production_approval !== ProductionApproval.RECUSED

  // Uma lista suspensa em vez de botões soltos: eram até três lado a lado,
  // quebrando em duas linhas no cabeçalho.
  // Editar itens: mesma regra do backend, só pedido em Aguardando
  const canEditItems = order.status === OrderStatus.AWAITING

  const acoes: ActionItem[] = []

  if (canEditItems)
    acoes.push({
      key: 'edit',
      label: 'Editar itens e valores',
      icon: <EditIcon />,
      onClick: () => setEditando(true),
    })

  if (canApprove)
    acoes.push({
      key: 'approve',
      label: 'Aprovar produção',
      icon: <ApproveIcon />,
      color: 'success',
      disabled: decidindo,
      onClick: () => setConfirmando('approve'),
    })

  if (canRecuse)
    acoes.push({
      key: 'recuse',
      label: 'Recusar produção',
      icon: <RecuseIcon />,
      color: 'error',
      disabled: decidindo,
      onClick: () => setConfirmando('recuse'),
    })

  if (canMarkPaid)
    acoes.push({
      key: 'pay',
      label: paying ? 'Salvando...' : 'Marcar como pago',
      icon: <PaidIcon />,
      disabled: paying,
      dividerBefore: acoes.length > 0,
      onClick: handleMarkPaid,
    })

  return (
    <>
      <OrderDetailView
        order={order}
        onBack={() => navigate('/admin/orders')}
        actions={<ActionsMenu items={acoes} />}
      />

      <OrderItemsEditModal
        open={editando}
        order={order}
        submitting={salvandoItens}
        onClose={() => setEditando(false)}
        onSubmit={salvarItens}
      />

      <ConfirmDialog
        open={confirmando === 'approve'}
        title="Aprovar produção"
        message={`Liberar o pedido #${order.id} de ${
          order.client?.name ?? ''
        } para produção? Ele passa a entrar na fila do produtor.`}
        onConfirm={decidirProducao}
        onCancel={() => setConfirmando(null)}
        confirmText={decidindo ? 'Aprovando...' : 'Aprovar produção'}
        cancelText="Voltar"
        confirmColor="success"
      />

      <ConfirmDialog
        open={confirmando === 'recuse'}
        title="Recusar produção"
        message={`Recusar a produção do pedido #${order.id} de ${
          order.client?.name ?? ''
        }? Ele sai da fila do produtor. Dá para aprovar depois.`}
        onConfirm={decidirProducao}
        onCancel={() => setConfirmando(null)}
        confirmText={decidindo ? 'Recusando...' : 'Recusar produção'}
        cancelText="Voltar"
        confirmColor="error"
      />
    </>
  )
}

export default OrderDetail
