import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  IconButton,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import orderService from 'services/orderService'
import clientService from 'services/clientService'
import productService from 'services/productService'
import { IOrder, IOrderUpdate, OrderStatus, getOrderStatusLabel, getOrderItemStatusLabel } from 'interfaces/IOrder'
import { IClient } from 'interfaces/IClient'
import { IProduct } from 'interfaces/IProduct'
import { usePopup } from 'hooks/usePopup'

import { useStyles } from './styles'

interface OrderFormValues {
  client: IClient | null
  scheduledDate: string
  items: { product: IProduct | null; quantity: number }[]
}

const editSchema = yup.object({
  client: yup.object().nullable().required('Selecione um cliente'),
  scheduledDate: yup.string().required('Informe a data de entrega'),
  items: yup
    .array()
    .of(
      yup.object({
        product: yup.object().nullable().required('Selecione um produto'),
        quantity: yup.number().typeError('Quantidade inválida').min(0.01, 'Quantidade deve ser maior que zero').required('Informe a quantidade'),
      }),
    )
    .min(1, 'Adicione ao menos um item'),
})

const SellerOrderDetail = () => {
  const classes = useStyles()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addPopup } = usePopup()

  const [order, setOrder] = useState<IOrder | null>(null)
  const [loading, setLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const [clients, setClients] = useState<IClient[]>([])
  const [products, setProducts] = useState<IProduct[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: yupResolver(editSchema) as any,
    defaultValues: { client: null, scheduledDate: '', items: [{ product: null, quantity: 1 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const loadOrder = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await orderService.getSellerOrder(Number(id))
      setOrder(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar pedido',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
      navigate('/admin/seller')
    } finally {
      setLoading(false)
    }
  }, [id, addPopup, navigate])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const openEdit = useCallback(async () => {
    if (!order) return
    try {
      const [clientsData, productsData] = await Promise.all([
        clientService.getClients(undefined, true),
        productService.getProducts(undefined, true),
      ])
      setClients(clientsData)
      setProducts(productsData)

      const allItems = [
        ...(order.produced_items || []),
        ...(order.current_item ? [order.current_item] : []),
      ]

      reset({
        client: order.client
          ? ({ id: order.client_id, name: order.client.name } as IClient)
          : null,
        scheduledDate: order.scheduled_date,
        items: allItems.map((i) => ({
          product: i.product ? ({ id: i.product_id, name: i.product.name } as IProduct) : null,
          quantity: i.quantity,
        })),
      })
    } catch {
      addPopup({ type: 'error', title: 'Erro ao carregar dados', message: 'Tente novamente.' })
      return
    }
    setEditOpen(true)
  }, [order, addPopup, reset])

  const onEditSubmit = async (values: OrderFormValues) => {
    if (!order || !values.client) return
    setSubmitting(true)
    try {
      const payload: IOrderUpdate = {
        clientId: values.client.id,
        scheduledDate: values.scheduledDate,
        items: values.items.map((i) => ({
          product_id: i.product!.id,
          quantity: i.quantity,
        })),
      }
      const updated = await orderService.updateSellerOrder(order.id, payload)
      setOrder(updated)
      addPopup({ type: 'success', title: 'Pedido atualizado com sucesso!' })
      setEditOpen(false)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao atualizar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    setCanceling(true)
    try {
      await orderService.cancelSellerOrder(order.id)
      addPopup({ type: 'success', title: 'Pedido cancelado.' })
      setCancelOpen(false)
      navigate('/admin/seller')
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao cancelar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setCanceling(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const allItems = order
    ? [...(order.produced_items || []), ...(order.current_item ? [order.current_item] : [])]
    : []

  const isAwaiting = order?.status === OrderStatus.AWAITING

  if (loading) {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Box className={classes.loading}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!order) return null

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.header}>
        <Box>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/seller')} sx={{ mb: 1 }}>
            Voltar
          </Button>
          <Typography variant="h4" component="h1" className={classes.title}>
            Pedido #{order.id}
          </Typography>
        </Box>

        {isAwaiting && (
          <Box className={classes.actions}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={openEdit}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setCancelOpen(true)}
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Box>

      <Paper className={classes.paper}>
        <Typography className={classes.sectionTitle} variant="subtitle1">
          Informações gerais
        </Typography>
        <Box className={classes.infoGrid}>
          <Box>
            <Typography variant="caption" color="textSecondary">Cliente</Typography>
            <Typography>{order.client?.name ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Data de entrega</Typography>
            <Typography>{formatDate(order.scheduled_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Status</Typography>
            <Typography>{getOrderStatusLabel(order.status)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">Prioridade</Typography>
            <Typography>{order.priority}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper className={classes.paper}>
        <Typography className={classes.sectionTitle} variant="subtitle1">
          Itens do pedido
        </Typography>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table className={classes.table} size="small">
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
                  <TableCell colSpan={4} align="center">Nenhum item</TableCell>
                </TableRow>
              ) : (
                allItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name ?? '-'}</TableCell>
                    <TableCell align="right">
                      {item.quantity}{item.product?.unit ? ` ${item.product.unit.code}` : ''}
                    </TableCell>
                    <TableCell align="right">
                      {item.produced_quantity != null
                        ? `${item.produced_quantity}${item.product?.unit ? ` ${item.product.unit.code}` : ''}`
                        : '-'}
                    </TableCell>
                    <TableCell>{getOrderItemStatusLabel(item.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal editar */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Pedido #{order.id}</DialogTitle>
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="client"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={clients}
                  getOptionLabel={(o) => `${o.name} — ${o.cpf_cnpj}`}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  value={field.value}
                  onChange={(_, v) => field.onChange(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      size="small"
                      error={!!errors.client}
                      helperText={errors.client?.message}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Data de entrega"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.scheduledDate}
                  helperText={errors.scheduledDate?.message}
                />
              )}
            />

            <Typography variant="subtitle2">Itens</Typography>

            {fields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Controller
                  name={`items.${index}.product`}
                  control={control}
                  render={({ field: f }) => (
                    <Autocomplete
                      options={products}
                      getOptionLabel={(o) => o.name}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      value={f.value}
                      onChange={(_, v) => f.onChange(v)}
                      sx={{ flex: 1, minWidth: 180 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Produto"
                          size="small"
                          error={!!errors.items?.[index]?.product}
                          helperText={(errors.items?.[index]?.product as any)?.message}
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField
                      {...f}
                      label="Qtd"
                      type="number"
                      size="small"
                      sx={{ width: 90 }}
                      inputProps={{ min: 0.01, step: 0.01 }}
                      error={!!errors.items?.[index]?.quantity}
                      helperText={errors.items?.[index]?.quantity?.message}
                    />
                  )}
                />
                <IconButton
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  size="small"
                  sx={{ mt: 0.5 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append({ product: null, quantity: 1 })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Adicionar item
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmar cancelamento */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancelar pedido</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja cancelar o pedido #{order.id}? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={canceling}>Voltar</Button>
          <Button color="error" variant="contained" onClick={handleCancel} disabled={canceling}>
            {canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SellerOrderDetail
