import { useState, useEffect, useCallback } from 'react'
import { Button } from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as MenuGroupIcon,
} from '@mui/icons-material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'

import userService from 'services/userService'
import { IUser } from 'interfaces/IUser'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import UserModal from './UserModal'
import RoleMenuModal from './RoleMenuModal'
import {
  PageLayout,
  PageHeader,
  DataTable,
  ConfirmDialog,
  SearchField,
  SelectField,
} from 'shared'

const Users = () => {
  const { addPopup } = usePopup()
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState('')
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
      setUsers(await userService.getUsers(debouncedSearch || undefined, isActive))
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
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedUser(null)
  }
  const handleSave = () => {
    loadUsers()
    handleCloseModal()
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.userId) return
    try {
      await userService.deleteUser(confirmDelete.userId)
      addPopup({ type: 'success', title: 'Usuário excluído com sucesso' })
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Usuário', width: 130 },
    {
      field: 'full_name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 180,
      valueGetter: (params) =>
        `${params.row.first_name || ''} ${params.row.last_name || ''}`.trim() || '-',
    },
    { field: 'email', headerName: 'E-mail', width: 200 },
    {
      field: 'roles',
      headerName: 'Perfis',
      width: 150,
      valueGetter: (params) => params.row.roles?.map((r: { name: string }) => r.name).join(', ') || '-',
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
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => setConfirmDelete({ open: true, userId: params.row.id })}
        />,
      ],
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Usuários"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo Usuário
          </Button>
        }
        filters={
          <>
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Buscar por ID ou nome"
            />
            <SelectField
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'Todos' },
                { value: 'active', label: 'Ativo' },
                { value: 'inactive', label: 'Inativo' },
              ]}
            />
            <Button
              variant="outlined"
              startIcon={<MenuGroupIcon />}
              onClick={() => setOpenRoleMenuModal(true)}
              sx={{ ml: { sm: 'auto' } }}
            >
              Grupos de menu
            </Button>
          </>
        }
      />

      <DataTable<IUser>
        rows={users}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhum usuário encontrado"
      />

      {openModal && (
        <UserModal open={openModal} onClose={handleCloseModal} onSave={handleSave} user={selectedUser} />
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Você não pode excluir seu próprio usuário."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, userId: null })}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />

      <RoleMenuModal open={openRoleMenuModal} onClose={() => setOpenRoleMenuModal(false)} />
    </PageLayout>
  )
}

export default Users
