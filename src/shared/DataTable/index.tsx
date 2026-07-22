import { Box, Paper, Stack, useMediaQuery, useTheme } from '@mui/material'
import { DataGrid, GridColDef, GridRowIdGetter } from '@mui/x-data-grid'
import { ReactNode } from 'react'

import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'
import { LoadingState, EmptyState } from 'shared/states'

interface DataTableProps<T extends object> {
  rows: T[]
  columns: GridColDef[]
  getRowId: GridRowIdGetter<T>
  loading?: boolean
  /**
   * Renderiza cada linha como um CARTÃO no mobile (evita scroll horizontal).
   * Quando ausente, cai no DataGrid em qualquer tamanho.
   */
  renderMobileCard?: (row: T) => ReactNode
  /** Estado vazio customizado. */
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
}

/**
 * Tabela responsiva padrão da plataforma.
 * - Desktop: DataGrid limpo, linhas espaçadas, localizado em pt-BR.
 * - Mobile: pilha de cartões (via `renderMobileCard`), sem scroll horizontal.
 */
export function DataTable<T extends object>({
  rows,
  columns,
  getRowId,
  loading = false,
  renderMobileCard,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  pageSize = 10,
}: DataTableProps<T>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <LoadingState />
      </Paper>
    )
  }

  if (isMobile && renderMobileCard) {
    if (rows.length === 0) {
      return (
        <Paper sx={{ p: 1 }}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </Paper>
      )
    }
    return (
      <Stack spacing={1.5}>
        {rows.map((row) => (
          <Box key={String(getRowId(row))}>{renderMobileCard(row)}</Box>
        ))}
      </Stack>
    )
  }

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 }, width: '100%' }}>
      <Box sx={{ width: '100%', minWidth: 0 }}>
        <DataGrid
          rows={rows as any[]}
          columns={columns}
          getRowId={getRowId as GridRowIdGetter}
          pageSizeOptions={[5, 10, 25, 50]}
          localeText={DATA_GRID_LOCALE_TEXT}
          initialState={{ pagination: { paginationModel: { pageSize } } }}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={56}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { borderRadius: 2 },
            '& .MuiDataGrid-cell': { minWidth: 80 },
          }}
        />
      </Box>
    </Paper>
  )
}

export default DataTable
