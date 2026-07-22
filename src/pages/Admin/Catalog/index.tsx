import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, Box, Typography, Chip } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'

import productService from 'services/productService'
import { IProduct } from 'interfaces/IProduct'
import { usePopup } from 'hooks/usePopup'
import { useDebouncedSearch } from 'hooks/useDebounce'
import { PageLayout, PageHeader, DataTable, SearchField, formatCurrency } from 'shared'

/**
 * Catálogo de produtos e preços — consulta somente-leitura para o vendedor
 * informar o cliente. Usa o mesmo endpoint de produtos (o vendedor tem acesso
 * de leitura via order:create/order:list).
 */
const Catalog = () => {
  const { addPopup } = usePopup()
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedSearch('', 300)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      // apenas produtos ativos
      setProducts(await productService.getProducts(debouncedSearch || undefined, true))
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao carregar produtos',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }, [addPopup, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const columns: GridColDef[] = [
    { field: 'sku', headerName: 'SKU', width: 140 },
    { field: 'name', headerName: 'Produto', flex: 1, minWidth: 200 },
    {
      field: 'unit',
      headerName: 'Unidade',
      width: 120,
      valueGetter: (params) => params.row.unit?.code || '-',
    },
    {
      field: 'unit_price',
      headerName: 'Preço',
      width: 130,
      valueGetter: (params) => formatCurrency(params.row.unit_price),
    },
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Catálogo de Produtos"
        subtitle="Consulte produtos e preços para informar o cliente."
        filters={
          <SearchField
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por SKU ou nome"
          />
        }
      />

      <DataTable<IProduct>
        rows={products}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        emptyTitle="Nenhum produto encontrado"
        renderMobileCard={(p) => (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {p.name}
                </Typography>
                <Chip label={formatCurrency(p.unit_price)} color="primary" size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                SKU: {p.sku} {p.unit?.code ? `· ${p.unit.code}` : ''}
              </Typography>
            </CardContent>
          </Card>
        )}
      />
    </PageLayout>
  )
}

export default Catalog
