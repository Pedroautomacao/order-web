import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@mui/material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import {
  Visibility as ViewIcon,
  Add as AddIcon,
  Paid as PaidIcon,
  Cancel as CancelIcon,
  Event as RescheduleIcon,
  PriorityHigh as PriorityIcon,
  CheckCircle as ApproveIcon,
  Block as RecuseIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import orderService from 'services/orderService'
import {
  IOrder,
  ORDER_STATUS_LABELS,
  OrderStatus,
  PaymentMethod,
  PRODUCTION_APPROVAL_LABELS,
  ProductionApproval,
} from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import {
  PageLayout,
  PageHeader,
  DataTable,
  StatusChip,
  PaymentChip,
  ApprovalChip,
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
  const [approvalFilter, setApprovalFilter] = useState('')
  // Sem data fixa: a tela mostra a base inteira, do mais recente para o mais
  // antigo, e a data continua disponível como filtro.
  const [scheduledDateFilter, setScheduledDateFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [rowCount, setRowCount] = useState(0)
  // "última requisição vence": trocar de página/filtro rápido deixa respostas
  // concorrentes em voo, e a antiga sobrescrevia a nova
  const requisicaoAtual = useRef(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<IOrder | null>(null)
  const [paying, setPaying] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<IOrder | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [prioTarget, setPrioTarget] = useState<IOrder | null>(null)
  const [prioritizing, setPrioritizing] = useState(false)
  const [approveTarget, setApproveTarget] = useState<IOrder | null>(null)
  const [recuseTarget, setRecuseTarget] = useState<IOrder | null>(null)
  const [decidindoProducao, setDecidindoProducao] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<IOrder | null>(null)
  const [newDate, setNewDate] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  const loadOrders = useCallback(async () => {
    const id = ++requisicaoAtual.current
    try {
      setLoading(true)
      const data = await orderService.getOrders(
        debouncedSearch || undefined,
        statusFilter || undefined,
        scheduledDateFilter || undefined,
        page + 1,
        pageSize,
        approvalFilter || undefined,
      )
      if (id !== requisicaoAtual.current) return
      // defesa para a janela de deploy em que o front sobe antes da API e a
      // resposta ainda vem como array, sem envelope
      setOrders(Array.isArray(data) ? data : data?.items ?? [])
      setRowCount(Array.isArray(data) ? data.length : data?.total ?? 0)
    } catch (error: any) {
      if (id !== requisicaoAtual.current) return
      // não deixar linhas e total da consulta anterior na tela: eles não
      // correspondem mais ao filtro nem à página selecionada
      setOrders([])
      setRowCount(0)
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedidos',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      if (id === requisicaoAtual.current) setLoading(false)
    }
  }, [
    addPopup,
    debouncedSearch,
    statusFilter,
    approvalFilter,
    scheduledDateFilter,
    page,
    pageSize,
  ])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  /**
   * Mudar um filtro volta para a primeira página — senão a tela pede uma página
   * que o novo filtro talvez não tenha e aparece vazia. Feito no próprio
   * handler, e não por efeito: por efeito saía uma requisição a mais, com a
   * página antiga e o filtro novo.
   */
  const comResetDePagina =
    <T,>(aplicar: (valor: T) => void) =>
    (valor: T) => {
      aplicar(valor)
      // React descarta o set quando o valor não muda, então na primeira
      // página isto não gera render nem requisição extra
      setPage((atual) => (atual === 0 ? atual : 0))
    }

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
  // Liberação de produção: reversível nos dois sentidos, para corrigir engano.
  // Some em pedido encerrado, que é onde o backend também recusa.
  const podeDecidirProducao = (o: IOrder) =>
    ![OrderStatus.CANCELED, OrderStatus.BILLED].includes(o.status)
  const canApprove = (o: IOrder) =>
    podeDecidirProducao(o) && o.production_approval !== ProductionApproval.APPROVED
  const canRecuse = (o: IOrder) =>
    podeDecidirProducao(o) && o.production_approval !== ProductionApproval.RECUSED

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

  const handleApproveProduction = () =>
    approveTarget &&
    runAction(
      () => orderService.approveProduction(approveTarget.id),
      'Produção aprovada',
      () => setApproveTarget(null),
      setDecidindoProducao,
    )

  const handleRecuseProduction = () =>
    recuseTarget &&
    runAction(
      () => orderService.recuseProduction(recuseTarget.id),
      'Produção recusada',
      () => setRecuseTarget(null),
      setDecidindoProducao,
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
      field: 'production_approval',
      headerName: 'Produção',
      width: 150,
      renderCell: (params) => <ApprovalChip approval={params.row.production_approval} />,
    },
    {
      field: 'payment_method',
      headerName: 'Pagamento',
      width: 120,
      renderCell: (params) => (
        // só a situação: a forma (À vista / A prazo) já aparece no detalhe
        <PaymentChip
          method={params.row.payment_method}
          isPaid={params.row.is_paid}
          showPaidStatus
          showMethod={false}
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
        if (canApprove(o))
          actions.push(
            <GridActionsCellItem key="approve" icon={<ApproveIcon />} label="Aprovar produção"
              onClick={() => setApproveTarget(o)} showInMenu />,
          )
        if (canRecuse(o))
          actions.push(
            <GridActionsCellItem key="recuse" icon={<RecuseIcon />} label="Recusar produção"
              onClick={() => setRecuseTarget(o)} showInMenu />,
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
              onChange={comResetDePagina(setSearchInput)}
              placeholder="Buscar por ID, nome ou CPF/CNPJ"
            />
            <DateField
              label="Data de entrega"
              value={scheduledDateFilter}
              onChange={comResetDePagina(setScheduledDateFilter)}
            />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={comResetDePagina(setStatusFilter)}
              options={[
                { value: '', label: 'Todos' },
                ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
              ]}
            />
            <SelectField
              label="Produção"
              value={approvalFilter}
              onChange={comResetDePagina(setApprovalFilter)}
              options={[
                { value: '', label: 'Todas' },
                ...Object.entries(PRODUCTION_APPROVAL_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
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
        serverPagination={{
          rowCount,
          page,
          pageSize,
          onChange: (p, size) => {
            setPage(p)
            setPageSize(size)
          },
        }}
        renderMobileCard={(order) => (
          <OrderListCard order={order} onView={(o) => navigate(`/admin/orders/${o.id}`)} />
        )}
      />

      <OrderFormModal
        open={modalOpen}
        title="Criar Pedido"
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          // o pedido novo é o mais recente: sem voltar para a primeira página
          // ele frequentemente não aparece
          setPage(0)
          loadOrders()
        }}
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
        open={!!approveTarget}
        title="Aprovar produção"
        message={
          approveTarget
            ? `Liberar o pedido #${approveTarget.id} de ${
                approveTarget.client?.name ?? ''
              } para produção? Ele passa a entrar na fila do produtor.`
            : ''
        }
        onConfirm={handleApproveProduction}
        onCancel={() => setApproveTarget(null)}
        confirmText={decidindoProducao ? 'Aprovando...' : 'Aprovar produção'}
        cancelText="Voltar"
        confirmColor="success"
      />

      <ConfirmDialog
        open={!!recuseTarget}
        title="Recusar produção"
        message={
          recuseTarget
            ? `Recusar a produção do pedido #${recuseTarget.id} de ${
                recuseTarget.client?.name ?? ''
              }? Ele sai da fila do produtor. Dá para aprovar depois.`
            : ''
        }
        onConfirm={handleRecuseProduction}
        onCancel={() => setRecuseTarget(null)}
        confirmText={decidindoProducao ? 'Recusando...' : 'Recusar produção'}
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
