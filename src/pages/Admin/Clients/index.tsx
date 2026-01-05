import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'

import clientService from 'services/clientService'
import { IClient } from 'interfaces/IClient'
import { usePopup } from 'hooks/usePopup'
import ClientModal from './ClientModal'
import ConfirmDialog from 'components/ConfirmDialog'

import { useStyles } from './styles'

const Clients = () => {
  const classes = useStyles()
  const { addPopup } = usePopup()
  const [clients, setClients] = useState<IClient[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; clientId: number | null }>({
    open: false,
    clientId: null,
  })

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      const data = await clientService.getClients()
      setClients(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar clientes',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup])

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
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.header}>
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

      <Paper className={classes.tableContainer}>
        {loading ? (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={clients}
            columns={columns}
            getRowId={(row) => row.id}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            disableRowSelectionOnClick
            autoHeight
          />
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

