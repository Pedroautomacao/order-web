import { useState, useEffect, useCallback } from 'react'
import { Button } from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { GridColDef, GridActionsCellItem } from '@mui/x-data-grid'

import productService from 'services/productService'
import unitService from 'services/unitService'
import { IProduct } from 'interfaces/IProduct'
import { IUnitOfMeasure } from 'interfaces/IUnitOfMeasure'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import ProductModal from './ProductModal'
import {
  PageLayout,
  PageHeader,
  DataTable,
  ConfirmDialog,
  SearchField,
  SelectField,
  formatCurrency,
} from 'shared'

const Products = () => {
  const { addPopup } = usePopup()
  const [products, setProducts] = useState<IProduct[]>([])
  const [units, setUnits] = useState<IUnitOfMeasure[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null,
  })

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const isActive =
        statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      setProducts(await productService.getProducts(debouncedSearch || undefined, isActive))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar produtos',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup, debouncedSearch, statusFilter])

  const loadUnits = useCallback(async () => {
    try {
      setUnits(await unitService.getUnits())
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
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedProduct(null)
  }
  const handleSave = () => {
    loadProducts()
    handleCloseModal()
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.productId) return
    try {
      await productService.deleteProduct(confirmDelete.productId)
      addPopup({ type: 'success', title: 'Produto excluído com sucesso' })
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'sku', headerName: 'SKU', width: 150 },
    {
      field: 'unit_price',
      headerName: 'Preço',
      width: 120,
      valueGetter: (params) => formatCurrency(params.row.unit_price),
    },
    {
      field: 'unit',
      headerName: 'Unidade',
      width: 130,
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
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => setConfirmDelete({ open: true, productId: params.row.id })}
        />,
      ],
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Produtos"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Novo Produto
          </Button>
        }
        filters={
          <>
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Buscar por ID, SKU ou nome"
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

      <DataTable<IProduct>
        rows={products}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhum produto encontrado"
      />

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
        onCancel={() => setConfirmDelete({ open: false, productId: null })}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />
    </PageLayout>
  )
}

export default Products
