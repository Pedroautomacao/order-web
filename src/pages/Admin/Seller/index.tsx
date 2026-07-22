import { useState, useEffect, useCallback } from 'react'
import { Button } from '@mui/material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { Visibility as ViewIcon, Add as AddIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import orderService from 'services/orderService'
import { IOrder, ORDER_STATUS_LABELS } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import {
  PageLayout,
  PageHeader,
  DataTable,
  StatusChip,
  OrderListCard,
  OrderFormModal,
  SearchField,
  DateField,
  SelectField,
} from 'shared'

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

const Seller = () => {
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [scheduledDateFilter, setScheduledDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [modalOpen, setModalOpen] = useState(false)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orderService.getSellerOrders(
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

  const goToDetail = (id: number) => navigate(`/admin/seller/orders/${id}`)

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'client',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.client?.name ?? '-',
    },
    {
      field: 'scheduled_date',
      headerName: 'Data de entrega',
      width: 140,
      valueGetter: (params) => formatDate(params.row.scheduled_date),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    { field: 'priority', headerName: 'Prioridade', width: 110 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="Ver detalhes"
          onClick={() => goToDetail(params.row.id)}
        />,
      ],
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Meus Pedidos"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
            Novo Pedido
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
        emptyTitle="Você ainda não tem pedidos"
        emptyDescription="Crie seu primeiro pedido no botão “Novo Pedido”."
        renderMobileCard={(order) => <OrderListCard order={order} onView={(o) => goToDetail(o.id)} />}
      />

      <OrderFormModal
        open={modalOpen}
        title="Novo Pedido"
        onClose={() => setModalOpen(false)}
        onCreated={loadOrders}
      />
    </PageLayout>
  )
}

export default Seller
