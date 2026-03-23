import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  IconButton,
} from '@mui/material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import {
  Visibility as ViewIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import orderService from 'services/orderService'
import clientService from 'services/clientService'
import productService from 'services/productService'
import { IOrder, IOrderCreate, ORDER_STATUS_LABELS, getOrderStatusLabel } from 'interfaces/IOrder'
import { IClient } from 'interfaces/IClient'
import { IProduct } from 'interfaces/IProduct'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'

import { getMinOrderDate } from 'utils/orderDateUtils'
import { useStyles } from './styles'

interface OrderFormValues {
  client: IClient | null
  scheduledDate: string
  items: { product: IProduct | null; quantity: number }[]
}

const orderSchema = yup.object({
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

interface ProductRowProps {
  index: number
  control: any
  products: IProduct[]
  errors: any
  fields: any[]
  remove: (index: number) => void
}

const ProductRow = ({ index, control, products, errors, fields, remove }: ProductRowProps) => {
  const watchedItems = useWatch({ control, name: 'items' }) as { product: IProduct | null; quantity: number }[]
  const usedIds = new Set(
    watchedItems?.filter((_, i) => i !== index).map((it) => it.product?.id).filter(Boolean)
  )
  const availableProducts = products.filter((p) => !usedIds.has(p.id))

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Controller
        name={`items.${index}.product`}
        control={control}
        render={({ field: f }) => (
          <Autocomplete
            options={availableProducts}
            getOptionLabel={(o) => `${o.sku ? o.sku + ' — ' : ''}${o.name}`}
            value={f.value}
            onChange={(_, v) => f.onChange(v)}
            sx={{ flex: 1 }}
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
            sx={{ width: 100 }}
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
  )
}

const Seller = () => {
  const classes = useStyles()
  const navigate = useNavigate()
  const { addPopup } = usePopup()

  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [scheduledDateFilter, setScheduledDateFilter] = useState<string>(new Date().toISOString().split('T')[0])

  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<IClient[]>([])
  const [products, setProducts] = useState<IProduct[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: yupResolver(orderSchema) as any,
    defaultValues: {
      client: null,
      scheduledDate: '',
      items: [{ product: null, quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orderService.getSellerOrders(debouncedSearch || undefined, statusFilter || undefined, scheduledDateFilter || undefined)
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

  const openModal = useCallback(async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        clientService.getClients(undefined, true),
        productService.getProducts(undefined, true),
      ])
      setClients(clientsData)
      setProducts(productsData)
    } catch {
      addPopup({ type: 'error', title: 'Erro ao carregar dados', message: 'Tente novamente.' })
      return
    }
    reset({ client: null, scheduledDate: '', items: [{ product: null, quantity: 1 }] })
    setModalOpen(true)
  }, [addPopup, reset])

  const onSubmit = async (values: OrderFormValues) => {
    if (!values.client) return
    const productIds = values.items.map((i) => i.product?.id).filter(Boolean)
    if (new Set(productIds).size !== productIds.length) {
      addPopup({ type: 'error', title: 'Produtos duplicados', message: 'Cada produto só pode aparecer uma vez no pedido.' })
      return
    }
    setSubmitting(true)
    try {
      const payload: IOrderCreate = {
        clientId: values.client.id,
        scheduledDate: values.scheduledDate,
        items: values.items.map((i) => ({
          product_id: i.product!.id,
          quantity: i.quantity,
        })),
      }
      await orderService.createOrder(payload)
      addPopup({ type: 'success', title: 'Pedido criado com sucesso!' })
      setModalOpen(false)
      loadOrders()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao criar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
  }

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
      width: 130,
      valueGetter: (params) => formatDate(params.row.scheduled_date),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      valueGetter: (params) => getOrderStatusLabel(params.row.status),
    },
    {
      field: 'priority',
      headerName: 'Prioridade',
      width: 100,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="Ver detalhes"
          onClick={() => navigate(`/admin/seller/orders/${params.row.id}`)}
        />,
      ],
    },
  ]

  return (
    <Container maxWidth={false} className={classes.container} sx={{ width: '100%' }}>
      <Box className={classes.header}>
        <Box className={classes.headerRow}>
          <Typography variant="h4" component="h1" className={classes.title}>
            Meus Pedidos
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}>
            Novo Pedido
          </Button>
        </Box>
        <Box className={classes.filtersRow}>
          <TextField
            size="small"
            placeholder="Buscar por ID, nome ou CPF/CNPJ"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <TextField
            size="small"
            label="Data de entrega"
            type="date"
            value={scheduledDateFilter}
            onChange={(e) => setScheduledDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="seller-status-label">Status</InputLabel>
            <Select
              labelId="seller-status-label"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper className={classes.tableContainer}>
        {loading ? (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className={classes.gridWrapper} sx={{ width: '100%', minWidth: 0 }}>
            <DataGrid
              rows={orders}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10, 25, 50]}
              localeText={DATA_GRID_LOCALE_TEXT}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': { minWidth: 80 },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Modal criar pedido */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Pedido</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Controller
              name="client"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={clients}
                  getOptionLabel={(o) => `${o.name} — ${o.cpf_cnpj}`}
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
                  inputProps={{ min: getMinOrderDate() }}
                  error={!!errors.scheduledDate}
                  helperText={errors.scheduledDate?.message}
                />
              )}
            />

            <Typography variant="subtitle2">Itens</Typography>

            {fields.map((field, index) => (
              <ProductRow
                key={field.id}
                index={index}
                control={control}
                products={products}
                errors={errors}
                fields={fields}
                remove={remove}
              />
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
            <Button onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Criar Pedido'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  )
}

export default Seller
