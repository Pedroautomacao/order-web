import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip,
} from '@mui/material'
import {
  PlayArrow as NextIcon,
  CheckCircle as ConfirmIcon,
  Done as FinishIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelEditIcon,
} from '@mui/icons-material'

import orderService from 'services/orderService'
import { IOrder, IOrderItem, OrderStatus } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { ConfirmDialog, productLabel, formatQuantityWithUnit } from 'shared'

type ProducerState = 'idle' | 'producing' | 'review'

/** Aceita virgula como separador decimal: o teclado do chao de fabrica usa virgula
 *  e a tela exibe todos os numeros com virgula. */
const parseQuantity = (value: string): number =>
  parseFloat(String(value ?? '').replace(',', '.'))

const Producer = () => {
  const { addPopup } = usePopup()
  const [order, setOrder] = useState<IOrder | null>(null)
  const [pageState, setPageState] = useState<ProducerState>('idle')
  const [loading, setLoading] = useState(true)
  const [assigningNext, setAssigningNext] = useState(false)
  const [confirmingItem, setConfirmingItem] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [producedQty, setProducedQty] = useState<string>('')
  const [divergenceOpen, setDivergenceOpen] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  // estado de edição de item na revisão
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingQty, setEditingQty] = useState<string>('')
  const [savingEdit, setSavingEdit] = useState(false)

  const deriveState = (o: IOrder | null): ProducerState => {
    if (!o) return 'idle'
    // Sem olhar o status, um pedido ja Produzido, Faturado ou Cancelado caia na
    // tela de revisao com 'Finalizar' ativo — e todo clique voltava erro.
    if (o.status !== OrderStatus.PRODUCING) return 'idle'
    if (o.current_item) return 'producing'
    return 'review'
  }

  const loadCurrentOrder = useCallback(async () => {
    try {
      setLoading(true)
      setLoadFailed(false)
      const data = await orderService.getProducerCurrentOrder()
      setOrder(data)
      const state = deriveState(data)
      setPageState(state)
      if (state === 'producing' && data?.current_item) {
        setProducedQty(String(data.current_item.quantity))
      }
    } catch (error: any) {
      setLoadFailed(true)
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedido atual',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup])

  useEffect(() => {
    loadCurrentOrder()
  }, [loadCurrentOrder])

  const handleAssignNext = async () => {
    setAssigningNext(true)
    try {
      const data = await orderService.assignNextProducerOrder()
      setOrder(data)
      setPageState(deriveState(data))
      if (data.current_item) {
        setProducedQty(String(data.current_item.quantity))
      }
      addPopup({ type: 'success', title: 'Pedido atribuído!' })
    } catch (error: any) {
      const msg = error?.detail || error?.message || ''
      // 404 e a fila vazia; qualquer outra coisa e falha de verdade e nao pode
      // ser mascarada como 'sem pedidos'.
      if (error?.status === 404) {
        addPopup({
          type: 'info',
          title: 'Sem pedidos disponíveis',
          message: msg || 'Não há pedidos aguardando para hoje.',
        })
      } else {
        addPopup({
          type: 'error',
          title: 'Erro ao pegar o próximo pedido',
          message: msg || 'Tente novamente.',
        })
      }
    } finally {
      setAssigningNext(false)
    }
  }

  /** Valida a quantidade; se divergir do previsto, abre o modal de confirmação. */
  const handleConfirmClick = () => {
    if (!order?.current_item) return
    const qty = parseQuantity(producedQty)
    if (isNaN(qty) || qty <= 0) {
      addPopup({ type: 'error', title: 'Informe uma quantidade válida' })
      return
    }
    if (qty !== order.current_item.quantity) {
      // quantidade a mais OU a menos: pedir confirmação explícita
      setDivergenceOpen(true)
      return
    }
    doConfirm()
  }

  const doConfirm = async () => {
    if (!order?.current_item) return
    const qty = parseQuantity(producedQty)
    setConfirmingItem(true)
    try {
      const updated = await orderService.confirmOrderItem(order.current_item.id, qty)
      setDivergenceOpen(false)
      setOrder(updated)
      const newState = deriveState(updated)
      setPageState(newState)
      if (newState === 'producing' && updated.current_item) {
        setProducedQty(String(updated.current_item.quantity))
      } else {
        setProducedQty('')
      }
    } catch (error: any) {
      setDivergenceOpen(false)
      addPopup({
        type: 'error',
        title: 'Erro ao confirmar item',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
      // o item pode ter sido confirmado/resetado por outra tela: ressincroniza
      // em vez de deixar o produtor batendo num pedido que nao existe mais
      await loadCurrentOrder()
    } finally {
      setConfirmingItem(false)
    }
  }

  const handleStartEdit = (item: IOrderItem) => {
    setEditingItemId(item.id)
    setEditingQty(String(item.produced_quantity ?? item.quantity))
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingQty('')
  }

  const handleSaveEdit = async (itemId: number) => {
    const qty = parseQuantity(editingQty)
    if (isNaN(qty) || qty <= 0) {
      addPopup({ type: 'error', title: 'Quantidade inválida' })
      return
    }
    setSavingEdit(true)
    try {
      const updated = await orderService.updateOrderItemQuantity(itemId, qty)
      setOrder(updated)
      setEditingItemId(null)
      addPopup({ type: 'success', title: 'Quantidade atualizada!' })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao atualizar',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
      await loadCurrentOrder()
    } finally {
      setSavingEdit(false)
    }
  }

  const handleFinish = async () => {
    if (!order) return
    setFinishing(true)
    try {
      await orderService.finishProducerOrder(order.id)
      setOrder(null)
      setPageState('idle')
      setEditingItemId(null)
      addPopup({ type: 'success', title: 'Pedido finalizado com sucesso!' })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao finalizar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
      await loadCurrentOrder()
    } finally {
      setFinishing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (pageState === 'idle') {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Produção
          </Typography>
          {loadFailed ? (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              Não foi possível verificar se você tem um pedido em andamento.
              Toque no botão abaixo para tentar de novo.
            </Alert>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Nenhum pedido em andamento. Pegue o próximo pedido disponível.
            </Typography>
          )}
          {/* Um botão só: o servidor devolve o pedido em andamento quando já
              existe um, em vez de atribuir outro, então ele também serve de
              retentativa quando o carregamento falhou. */}
          <Button
            variant="contained"
            size="large"
            startIcon={assigningNext ? <CircularProgress size={18} color="inherit" /> : <NextIcon />}
            onClick={handleAssignNext}
            disabled={assigningNext}
          >
            Pegar próximo pedido
          </Button>
        </Paper>
      </Container>
    )
  }

  // ── PRODUCING ─────────────────────────────────────────────────────────────
  if (pageState === 'producing' && order) {
    const currentItem = order.current_item!
    const producedItems = order.produced_items ?? []
    const totalItems = order.total_items || producedItems.length + 1

    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Cabeçalho do pedido */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="h5" fontWeight={600}>Pedido #{order.id}</Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: <strong>{order.client?.name ?? '-'}</strong>
                &nbsp;|&nbsp; Entrega: {formatDate(order.scheduled_date)}
                &nbsp;|&nbsp; Prioridade: <strong>{order.priority}</strong>
              </Typography>
            </Box>
            <Chip label="Em produção" color="warning" />
          </Box>
        </Paper>

        {/* Item atual */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Item atual — {producedItems.length + 1} de {totalItems}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>
              {productLabel(currentItem.product, {
                fallback: `Produto #${currentItem.product_id}`,
                withUnit: false,
              })}
            </strong>
            &nbsp;— Quantidade prevista:{' '}
            <strong>{formatQuantityWithUnit(currentItem.quantity, currentItem.product?.unit?.code)}</strong>
          </Typography>
          <Box
            display="flex"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
          >
            <TextField
              label="Quantidade produzida"
              value={producedQty}
              onChange={(e) => setProducedQty(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !confirmingItem) handleConfirmClick()
              }}
              inputProps={{ inputMode: 'decimal' }}
              InputProps={{
                endAdornment: currentItem.product?.unit?.code ? (
                  <InputAdornment position="end">
                    {currentItem.product.unit.code}
                  </InputAdornment>
                ) : undefined,
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
              autoFocus
            />
            <Button
              variant="contained"
              color="success"
              startIcon={confirmingItem ? <CircularProgress size={18} color="inherit" /> : <ConfirmIcon />}
              onClick={handleConfirmClick}
              disabled={confirmingItem}
              size="large"
              sx={{ flexGrow: { xs: 0, sm: 1 }, minHeight: 56 }}
            >
              Confirmar item
            </Button>
          </Box>
        </Paper>

        {/* Itens já confirmados neste pedido */}
        {producedItems.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Já confirmados
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell align="right">Previsto</TableCell>
                    <TableCell align="right">Produzido</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {producedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {productLabel(item.product, {
                          fallback: `#${item.product_id}`,
                          withUnit: false,
                        })}
                      </TableCell>
                      <TableCell align="right">{formatQuantityWithUnit(item.quantity, item.product?.unit?.code)}</TableCell>
                      <TableCell align="right">{formatQuantityWithUnit(item.produced_quantity, item.product?.unit?.code)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Modal de confirmação quando a quantidade produzida diverge do previsto */}
        <ConfirmDialog
          open={divergenceOpen}
          title="Confirmar quantidade diferente"
          message={(() => {
            const informed = parseQuantity(producedQty) || 0
            const expected = currentItem.quantity
            const diff = informed - expected
            const more = diff > 0
            const unit = currentItem.product?.unit?.code
            return (
              `${productLabel(currentItem.product, { fallback: 'Item', withUnit: false })}: você informou ` +
              `${formatQuantityWithUnit(informed, unit)} (previsto ${formatQuantityWithUnit(expected, unit)}). ` +
              `São ${formatQuantityWithUnit(Math.abs(diff), unit)} ${more ? 'a MAIS' : 'a MENOS'} que o previsto. ` +
              `Deseja confirmar mesmo assim?`
            )
          })()}
          onConfirm={doConfirm}
          onCancel={() => setDivergenceOpen(false)}
          busy={confirmingItem}
          confirmText={confirmingItem ? 'Confirmando...' : 'Sim, confirmar'}
          cancelText="Voltar e corrigir"
          confirmColor={
            parseQuantity(producedQty) > currentItem.quantity ? 'warning' : 'error'
          }
        />
      </Container>
    )
  }

  // ── REVIEW ────────────────────────────────────────────────────────────────
  if (pageState === 'review' && order) {
    const producedItems = order.produced_items ?? []

    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Cabeçalho */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="h5" fontWeight={600}>Pedido #{order.id} — Revisão</Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: <strong>{order.client?.name ?? '-'}</strong>
                &nbsp;|&nbsp; Entrega: {formatDate(order.scheduled_date)}
              </Typography>
            </Box>
            <Chip label="Aguardando finalização" color="info" />
          </Box>
        </Paper>

        {/* Tabela de revisão */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Revise as quantidades abaixo. Você pode editar antes de finalizar.
          </Alert>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell align="right">Previsto</TableCell>
                  <TableCell align="right">Produzido</TableCell>
                  <TableCell align="center" width={120}>Editar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {producedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {productLabel(item.product, {
                        fallback: `#${item.product_id}`,
                        withUnit: false,
                      })}
                    </TableCell>
                    <TableCell align="right">{formatQuantityWithUnit(item.quantity, item.product?.unit?.code)}</TableCell>
                    <TableCell align="right">
                      {editingItemId === item.id ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editingQty}
                          onChange={(e) => setEditingQty(e.target.value)}
                          inputProps={{ min: 0.01, step: 0.01 }}
                          InputProps={{
                            endAdornment: item.product?.unit?.code ? (
                              <InputAdornment position="end">
                                {item.product.unit.code}
                              </InputAdornment>
                            ) : undefined,
                          }}
                          sx={{ width: 140 }}
                          autoFocus
                        />
                      ) : (
                        <Typography
                          component="span"
                          color={
                            (item.produced_quantity ?? 0) < item.quantity
                              ? 'warning.main'
                              : 'text.primary'
                          }
                          fontWeight={500}
                        >
                          {formatQuantityWithUnit(
                            item.produced_quantity,
                            item.product?.unit?.code,
                          )}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {editingItemId === item.id ? (
                        <Box display="flex" gap={0.5} justifyContent="center">
                          <Tooltip title="Salvar">
                            <span>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleSaveEdit(item.id)}
                                disabled={savingEdit}
                              >
                                {savingEdit ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancelar">
                            <IconButton size="small" onClick={handleCancelEdit} disabled={savingEdit}>
                              <CancelEditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="Editar quantidade">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(item)}
                              disabled={editingItemId !== null}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Finalizar */}
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={finishing ? <CircularProgress size={18} color="inherit" /> : <FinishIcon />}
            onClick={handleFinish}
            disabled={finishing || editingItemId !== null}
          >
            {finishing ? 'Finalizando...' : 'Finalizar pedido'}
          </Button>
        </Box>
      </Container>
    )
  }

  return null
}

export default Producer
