import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

import auditService, { IAuditLog, IAuditFilterOptions } from 'services/auditService'
import userService from 'services/userService'
import { IUser } from 'interfaces/IUser'
import { usePopup } from 'hooks/usePopup'

import { useStyles } from '../Users/styles'
import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'

const PAGE_SIZE = 25

const Audit = () => {
  const classes = useStyles()
  const { addPopup } = usePopup()
  const [logs, setLogs] = useState<IAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState<IAuditFilterOptions>({ actions: [], entities: [] })
  const [users, setUsers] = useState<IUser[]>([])
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')
  const [userIdFilter, setUserIdFilter] = useState<number | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)

  const loadOptions = useCallback(async () => {
    try {
      const [opts, usersData] = await Promise.all([
        auditService.getFilterOptions(),
        userService.getUsers(),
      ])
      setOptions(opts)
      setUsers(usersData)
    } catch (e: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar opções',
        message: e?.detail || e?.message || 'Tente novamente.',
      })
    }
  }, [addPopup])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await auditService.getLogs({
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        user_id: userIdFilter !== '' ? Number(userIdFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })
      setLogs(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar logs',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [actionFilter, entityFilter, userIdFilter, dateFrom, dateTo, page, addPopup])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const resetPageAndReload = () => setPage(0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
      })
    } catch {
      return dateStr
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'created_at',
      headerName: 'Data/Hora',
      width: 160,
      valueFormatter: (params) => formatDate(params.value),
    },
    { field: 'action', headerName: 'Ação', width: 140 },
    { field: 'entity', headerName: 'Entidade', width: 110 },
    {
      field: 'entity_id',
      headerName: 'ID entidade',
      width: 100,
      valueGetter: (params) => params.value ?? '-',
    },
    {
      field: 'username',
      headerName: 'Usuário',
      width: 130,
      valueGetter: (params) => params.value ?? '-',
    },
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.value ?? '-',
    },
  ]

  return (
    <Container maxWidth={false} className={classes.container}>
      <Box className={classes.header}>
        <Typography variant="h5" className={classes.title}>
          Auditoria
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Logs de ações no sistema. Use os filtros para refinar a busca.
        </Typography>
        <Box className={classes.filtersRow} sx={{ mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Ação</InputLabel>
            <Select
              value={actionFilter}
              label="Ação"
              onChange={(e) => {
                setActionFilter(e.target.value)
                resetPageAndReload()
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {options.actions.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Entidade</InputLabel>
            <Select
              value={entityFilter}
              label="Entidade"
              onChange={(e) => {
                setEntityFilter(e.target.value)
                resetPageAndReload()
              }}
            >
              <MenuItem value="">Todas</MenuItem>
              {options.entities.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Usuário</InputLabel>
            <Select
              value={userIdFilter === '' ? '' : userIdFilter}
              label="Usuário"
              onChange={(e) => {
                setUserIdFilter(e.target.value === '' ? '' : Number(e.target.value))
                resetPageAndReload()
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Data de"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              resetPageAndReload()
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            label="Data até"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              resetPageAndReload()
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
          />
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
              rows={logs}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[PAGE_SIZE]}
              paginationModel={{ page, pageSize: PAGE_SIZE }}
              onPaginationModelChange={(model) => setPage(model.page)}
              localeText={DATA_GRID_LOCALE_TEXT}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': { minWidth: 80 },
                '& .MuiDataGrid-columnHeaders': { minWidth: 800 },
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default Audit
