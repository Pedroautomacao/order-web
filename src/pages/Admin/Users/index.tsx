import { useState, useEffect, useCallback } from 'react'
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
import { Add as AddIcon, Search as SearchIcon, Folder as MenuGroupIcon } from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'

import userService from 'services/userService'
import { IUser } from 'interfaces/IUser'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import UserModal from './UserModal'
import RoleMenuModal from './RoleMenuModal'
import ConfirmDialog from 'components/ConfirmDialog'

import { useStyles } from './styles'
import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'

const Users = () => {
  const classes = useStyles()
  const { addPopup } = usePopup()
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; userId: number | null }>({
    open: false,
    userId: null,
  })
  const [openRoleMenuModal, setOpenRoleMenuModal] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const isActive =
        statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      const data = await userService.getUsers(debouncedSearch || undefined, isActive)
      setUsers(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar usuários',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup, debouncedSearch, statusFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleCreate = () => {
    setSelectedUser(null)
    setOpenModal(true)
  }

  const handleEdit = (user: IUser) => {
    setSelectedUser(user)
    setOpenModal(true)
  }

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ open: true, userId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.userId) return

    try {
      await userService.deleteUser(confirmDelete.userId)
      addPopup({
        type: 'success',
        title: 'Usuário excluído com sucesso',
      })
      loadUsers()
      setConfirmDelete({ open: false, userId: null })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao excluir usuário',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, userId: null })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedUser(null)
  }

  const handleSave = () => {
    loadUsers()
    handleCloseModal()
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Usuário', width: 130 },
    {
      field: 'full_name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => `${params.row.first_name || ''} ${params.row.last_name || ''}`.trim() || '-',
    },
    { field: 'email', headerName: 'E-mail', width: 200 },
    {
      field: 'roles',
      headerName: 'Perfis',
      width: 140,
      valueGetter: (params) => (params.row.roles?.map((r: { name: string }) => r.name).join(', ') || '-'),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      valueGetter: (params) => (params.row.is_active ? 'Ativo' : 'Desativado'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
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
            Usuários
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Novo Usuário
          </Button>
        </Box>
        <Box className={classes.filtersRow} sx={{ width: '100%' }}>
          <TextField
            size="small"
            placeholder="Buscar por ID ou nome"
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
            <InputLabel id="user-status-label">Status</InputLabel>
            <Select
              labelId="user-status-label"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<MenuGroupIcon />}
            onClick={() => setOpenRoleMenuModal(true)}
            sx={{ ml: 'auto' }}
          >
            Grupos de menu
          </Button>
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
              rows={users}
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
        <UserModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          user={selectedUser}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Você não pode excluir seu próprio usuário."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />

      <RoleMenuModal
        open={openRoleMenuModal}
        onClose={() => setOpenRoleMenuModal(false)}
      />
    </Container>
  )
}

export default Users
