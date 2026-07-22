import { useState, useEffect, useCallback } from 'react'
import { Button } from '@mui/material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Paid as PaidIcon,
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
  SearchField,
  DateField,
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
      width: 90,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="Ver detalhes"
            onClick={() => navigate(`/admin/orders/${params.row.id}`)}
          />,
        ]
        if (canMarkPaid(params.row)) {
          actions.push(
            <GridActionsCellItem
              key="pay"
              icon={<PaidIcon />}
              label="Marcar como pago"
              onClick={() => setPayTarget(params.row)}
              showInMenu
            />,
          )
        }
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
    </PageLayout>
  )
}

export default Orders
