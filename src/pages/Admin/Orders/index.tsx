import { useState, useEffect, useCallback } from 'react'
import { Button } from '@mui/material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Paid as PaidIcon,
  Cancel as CancelIcon,
  Event as RescheduleIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import orderService from 'services/orderService'
import { IOrder, ORDER_STATUS_LABELS, OrderStatus, PaymentMethod } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import {
  PageLayout,
  PageHeader,
  DataTable,
  StatusChip,
  PaymentChip,
  OrderListCard,
  OrderFormModal,
  ConfirmDialog,
  FormModal,
  DateField,
  SearchField,
  SelectField,
  formatCurrency,
} from 'shared'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

const Orders = () => {
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [scheduledDateFilter, setScheduledDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [modalOpen, setModalOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<IOrder | null>(null)
  const [paying, setPaying] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<IOrder | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [prioTarget, setPrioTarget] = useState<IOrder | null>(null)
  const [prioritizing, setPrioritizing] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<IOrder | null>(null)
  const [newDate, setNewDate] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrders(
        debouncedSearch || undefined,
        statusFilter || undefined,
        scheduledDateFilter || undefined,
      )
      setOrders(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedidos',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup, debouncedSearch, statusFilter, scheduledDateFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleMarkPaid = async () => {
    if (!payTarget) return
    setPaying(true)
    try {
      await orderService.markOrderPaid(payTarget.id)
      addPopup({ type: 'success', title: 'Pedido marcado como pago' })
      setPayTarget(null)
      loadOrders()
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

  const canMarkPaid = (o: IOrder) =>
    o.payment_method === PaymentMethod.CREDIT &&
    !o.is_paid &&
    o.status !== OrderStatus.CANCELED

  // Cancelar: Aguardando, Em produção ou Produzido (não Faturado/Cancelado)
  const canCancel = (o: IOrder) =>
    [OrderStatus.AWAITING, OrderStatus.PRODUCING, OrderStatus.PRODUCED].includes(o.status)
  // Remarcar data: só Aguardando
  const canReschedule = (o: IOrder) => o.status === OrderStatus.AWAITING
  // Priorizar: se ainda não é "A" e não está cancelado/faturado
  const canPrioritize = (o: IOrder) =>
    o.priority !== 'A' &&
    ![OrderStatus.CANCELED, OrderStatus.BILLED].includes(o.status)

  const runAction = async (
    fn: () => Promise<unknown>,
    successTitle: string,
    onDone: () => void,
    setBusy: (v: boolean) => void,
  ) => {
    setBusy(true)
    try {
      await fn()
      addPopup({ type: 'success', title: successTitle })
      onDone()
      loadOrders()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Não foi possível concluir a ação',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () =>
    cancelTarget &&
    runAction(
      () => orderService.cancelOrder(cancelTarget.id),
      'Pedido cancelado',
      () => setCancelTarget(null),
      setCanceling,
    )

  const handlePrioritize = () =>
    prioTarget &&
    runAction(
      () => orderService.prioritizeOrder(prioTarget.id),
      'Pedido priorizado (A)',
      () => setPrioTarget(null),
      setPrioritizing,
    )

  const openReschedule = (o: IOrder) => {
    setNewDate(o.scheduled_date)
    setRescheduleTarget(o)
  }
  const handleReschedule = () =>
    rescheduleTarget &&
    runAction(
      () => orderService.rescheduleOrder(rescheduleTarget.id, newDate),
      'Data remarcada',
      () => setRescheduleTarget(null),
      setRescheduling,
    )

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'client',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => params.row.client?.name ?? '-',
    },
    {
      field: 'scheduled_date',
      headerName: 'Data de entrega',
      width: 130,
      valueGetter: (params) => formatDate(params.row.scheduled_date),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: 'payment_method',
      headerName: 'Pagamento',
      width: 190,
      renderCell: (params) => (
        <PaymentChip
          method={params.row.payment_method}
          isPaid={params.row.is_paid}
          showPaidStatus
        />
      ),
    },
    {
      field: 'total_amount',
      headerName: 'Total',
      width: 110,
      valueGetter: (params) => formatCurrency(params.row.total_amount),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => {
        const o = params.row as IOrder
        // "Ver" sempre presente e sempre na mesma posição (não vai para o menu)
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="Ver detalhes"
            onClick={() => navigate(`/admin/orders/${o.id}`)}
          />,
        ]
        // Demais ações admin sempre no menu de 3 pontos
        if (canMarkPaid(o))
          actions.push(
            <GridActionsCellItem key="pay" icon={<PaidIcon />} label="Marcar como pago"
              onClick={() => setPayTarget(o)} showInMenu />,
          )
        if (canPrioritize(o))
          actions.push(
            <GridActionsCellItem key="prio" icon={<PriorityIcon />} label="Priorizar (A)"
              onClick={() => setPrioTarget(o)} showInMenu />,
          )
        if (canReschedule(o))
          actions.push(
            <GridActionsCellItem key="resch" icon={<RescheduleIcon />} label="Remarcar data"
              onClick={() => openReschedule(o)} showInMenu />,
          )
        if (canCancel(o))
          actions.push(
            <GridActionsCellItem key="cancel" icon={<CancelIcon />} label="Cancelar pedido"
              onClick={() => setCancelTarget(o)} showInMenu />,
          )
        return actions
      },
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Pedidos"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
            Criar Pedido
          </Button>
        }
        filters={
          <>
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Buscar por ID, nome ou CPF/CNPJ"
            />
            <DateField
              label="Data de entrega"
              value={scheduledDateFilter}
              onChange={setScheduledDateFilter}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'Todos' },
                ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
              ]}
            />
          </>
        }
      />

      <DataTable<IOrder>
        rows={orders}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhum pedido encontrado"
        renderMobileCard={(order) => (
          <OrderListCard order={order} onView={(o) => navigate(`/admin/orders/${o.id}`)} />
        )}
      />

      <OrderFormModal
        open={modalOpen}
        title="Criar Pedido"
        onClose={() => setModalOpen(false)}
        onCreated={loadOrders}
      />

      <ConfirmDialog
        open={!!payTarget}
        title="Marcar como pago"
        message={
          payTarget
            ? `Confirmar recebimento do pedido #${payTarget.id} (${formatCurrency(
                payTarget.total_amount,
              )})? Isso libera o crédito do cliente.`
            : ''
        }
        onConfirm={handleMarkPaid}
        onCancel={() => setPayTarget(null)}
        confirmText={paying ? 'Salvando...' : 'Confirmar pagamento'}
        cancelText="Cancelar"
        confirmColor="success"
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar pedido"
        message={
          cancelTarget
            ? `Tem certeza que deseja cancelar o pedido #${cancelTarget.id} de ${cancelTarget.client?.name ?? ''}? Esta ação não pode ser desfeita.`
            : ''
        }
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
        confirmText={canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
        cancelText="Voltar"
        confirmColor="error"
      />

      <ConfirmDialog
        open={!!prioTarget}
        title="Priorizar pedido"
        message={
          prioTarget
            ? `Priorizar o pedido #${prioTarget.id}? Ele passa para a prioridade máxima (A) na fila de produção.`
            : ''
        }
        onConfirm={handlePrioritize}
        onCancel={() => setPrioTarget(null)}
        confirmText={prioritizing ? 'Priorizando...' : 'Priorizar'}
        cancelText="Voltar"
        confirmColor="warning"
      />

      <FormModal
        open={!!rescheduleTarget}
        title={rescheduleTarget ? `Remarcar entrega — Pedido #${rescheduleTarget.id}` : 'Remarcar'}
        onClose={() => setRescheduleTarget(null)}
        onSubmit={handleReschedule}
        submitLabel={rescheduling ? 'Salvando...' : 'Remarcar'}
        submitting={rescheduling}
        maxWidth="xs"
      >
        <DateField
          label="Nova data de entrega"
          value={newDate}
          onChange={setNewDate}
          fullWidth
        />
      </FormModal>
    </PageLayout>
  )
}

export default Orders
