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
} from '@mui/material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { Visibility as ViewIcon, Search as SearchIcon } from '@mui/icons-material'

import orderService from 'services/orderService'
import { IOrder, getOrderStatusLabel, ORDER_STATUS_LABELS } from 'interfaces/IOrder'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'

import { useStyles } from './styles'
import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'

const Orders = () => {
  const classes = useStyles()
  const navigate = useNavigate()
  const { addPopup } = usePopup()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrders(
        debouncedSearch || undefined,
        statusFilter || undefined,
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
  }, [addPopup, debouncedSearch, statusFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

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
      width: 120,
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
          onClick={() => navigate(`/admin/orders/${params.row.id}`)}
        />,
      ],
    },
  ]

  return (
    <Container maxWidth={false} className={classes.container} sx={{ width: '100%' }}>
      <Box className={classes.header}>
        <Box className={classes.headerRow}>
          <Typography variant="h4" component="h1" className={classes.title}>
            Pedidos
          </Typography>
        </Box>
        <Box className={classes.filtersRow}>
          <TextField
            size="small"
            placeholder="Buscar por ID, cliente ou CNPJ"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 320 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="order-status-label">Status</InputLabel>
            <Select
              labelId="order-status-label"
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
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': { minWidth: 80 },
                '& .MuiDataGrid-columnHeaders': { minWidth: 600 },
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default Orders
