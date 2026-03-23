import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'

import clientService from 'services/clientService'
import { IClient } from 'interfaces/IClient'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import ClientModal from './ClientModal'
import ConfirmDialog from 'components/ConfirmDialog'

import { useStyles } from './styles'
import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'

const Clients = () => {
  const classes = useStyles()
  const { addPopup } = usePopup()
  const addPopupRef = useRef(addPopup)
  addPopupRef.current = addPopup

  const [clients, setClients] = useState<IClient[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; clientId: number | null }>({
    open: false,
    clientId: null,
  })

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const isActive =
        statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      const data = await clientService.getClients(debouncedSearch || undefined, isActive)
      setClients(data)
    } catch (error: any) {
      addPopupRef.current({
        type: 'error',
        title: 'Erro ao carregar clientes',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleCreate = () => {
    setSelectedClient(null)
    setOpenModal(true)
  }

  const handleEdit = (client: IClient) => {
    setSelectedClient(client)
    setOpenModal(true)
  }

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ open: true, clientId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.clientId) return

    try {
      await clientService.deleteClient(confirmDelete.clientId)
      addPopup({
        type: 'success',
        title: 'Cliente excluído com sucesso',
      })
      loadClients()
      setConfirmDelete({ open: false, clientId: null })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao excluir cliente',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, clientId: null })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedClient(null)
  }

  const handleSave = () => {
    loadClients()
    handleCloseModal()
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'cpf_cnpj', headerName: 'CPF/CNPJ', width: 150 },
    { field: 'priority', headerName: 'Prioridade', width: 100 },
    { field: 'phone_number', headerName: 'Telefone', width: 150 },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      valueGetter: (params) => (params.row.is_active ? 'Ativo' : 'Inativo'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<span>✏️</span>}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<span>🗑️</span>}
          label="Excluir"
          onClick={() => handleDeleteClick(params.row.id)}
        />,
      ],
    },
  ]

  return (
    <Container maxWidth={false} className={classes.container} sx={{ width: '100%' }}>
      <Box className={classes.header}>
        <Box className={classes.headerRow}>
          <Typography variant="h4" component="h1" className={classes.title}>
            Clientes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Novo Cliente
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
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="client-status-label">Status</InputLabel>
            <Select
              labelId="client-status-label"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
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
              rows={clients}
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
              }}
            />
          </Box>
        )}
      </Paper>

      {openModal && (
        <ClientModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          client={selectedClient}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />
    </Container>
  )
}

export default Clients

