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

import productService from 'services/productService'
import unitService from 'services/unitService'
import { IProduct } from 'interfaces/IProduct'
import { IUnitOfMeasure } from 'interfaces/IUnitOfMeasure'
import { usePopup } from 'hooks/usePopup'
import ProductModal from './ProductModal'
import ConfirmDialog from 'components/ConfirmDialog'

import { useStyles } from './styles'

const Products = () => {
  const classes = useStyles()
  const { addPopup } = usePopup()
  const [products, setProducts] = useState<IProduct[]>([])
  const [units, setUnits] = useState<IUnitOfMeasure[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null,
  })

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar produtos',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup])

  const loadUnits = useCallback(async () => {
    try {
      const data = await unitService.getUnits()
      setUnits(data)
    } catch (error: any) {
      console.error('Erro ao carregar unidades:', error)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    loadUnits()
  }, [loadProducts, loadUnits])

  const handleCreate = () => {
    setSelectedProduct(null)
    setOpenModal(true)
  }

  const handleEdit = (product: IProduct) => {
    setSelectedProduct(product)
    setOpenModal(true)
  }

  const handleDeleteClick = (id: number) => {
    setConfirmDelete({ open: true, productId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.productId) return

    try {
      await productService.deleteProduct(confirmDelete.productId)
      addPopup({
        type: 'success',
        title: 'Produto excluído com sucesso',
      })
      loadProducts()
      setConfirmDelete({ open: false, productId: null })
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao excluir produto',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, productId: null })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedProduct(null)
  }

  const handleSave = () => {
    loadProducts()
    handleCloseModal()
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'sku', headerName: 'SKU', width: 150 },
    {
      field: 'unit',
      headerName: 'Unidade',
      width: 150,
      valueGetter: (params) => params.row.unit?.code || '-',
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      valueGetter: (params) => (params.row.is_active ? 'Ativo' : 'Desativado'),
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
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.header}>
        <Typography variant="h4" component="h1" className={classes.title}>
          Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Novo Produto
        </Button>
      </Box>

      <Paper className={classes.tableContainer}>
        {loading ? (
          <Box className={classes.loading}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={products}
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
        <ProductModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          product={selectedProduct}
          units={units}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />
    </Container>
  )
}

export default Products

