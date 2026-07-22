import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'

import clientService from 'services/clientService'
import { IClient } from 'interfaces/IClient'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import ClientModal from './ClientModal'
import {
  PageLayout,
  PageHeader,
  DataTable,
  ConfirmDialog,
  SearchField,
  SelectField,
} from 'shared'

const Clients = () => {
  const { addPopup } = usePopup()
  const addPopupRef = useRef(addPopup)
  addPopupRef.current = addPopup

  const [clients, setClients] = useState<IClient[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; clientId: number | null }>({
    open: false,
    clientId: null,
  })

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const isActive =
        statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      setClients(await clientService.getClients(debouncedSearch || undefined, isActive))
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
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedClient(null)
  }
  const handleSave = () => {
    loadClients()
    handleCloseModal()
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.clientId) return
    try {
      await clientService.deleteClient(confirmDelete.clientId)
      addPopup({ type: 'success', title: 'Cliente excluído com sucesso' })
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'cpf_cnpj', headerName: 'CPF/CNPJ', width: 150 },
    { field: 'priority', headerName: 'Prioridade', width: 110 },
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
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => setConfirmDelete({ open: true, clientId: params.row.id })}
        />,
      ],
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Clientes"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo Cliente
          </Button>
        }
        filters={
          <>
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Buscar por ID, nome ou CPF/CNPJ"
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
          </>
        }
      />

      <DataTable<IClient>
        rows={clients}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhum cliente encontrado"
      />

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
        onCancel={() => setConfirmDelete({ open: false, clientId: null })}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />
    </PageLayout>
  )
}

export default Clients
