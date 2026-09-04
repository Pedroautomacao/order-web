import { Box, Paper, Stack, TablePagination, useMediaQuery, useTheme } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel, GridRowIdGetter } from '@mui/x-data-grid'
import { ReactNode } from 'react'

import { DATA_GRID_LOCALE_TEXT } from 'constants/dataGridLocale'
import { LoadingState, EmptyState } from 'shared/states'

/** Opções de itens por página. O teto tem de caber no limite do backend. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

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
  /**
   * Paginação no servidor. Quando presente, `rows` é apenas a página atual e
   * `rowCount` diz quantos registros existem no total.
   */
  serverPagination?: {
    rowCount: number
    page: number
    pageSize: number
    onChange: (page: number, pageSize: number) => void
  }
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
  serverPagination,
}: DataTableProps<T>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Só o primeiro carregamento troca a tabela pelo spinner. Nos seguintes o
  // DataGrid usa o overlay dele, senão cada troca de página desmontava a
  // grid e o rodapé: a tela encolhia, perdia o scroll e o contador sumia.
  if (loading && rows.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <LoadingState />
      </Paper>
    )
  }

  if (isMobile && renderMobileCard) {
    return (
      <Stack spacing={1.5} sx={{ opacity: loading ? 0.5 : 1 }}>
        {rows.length === 0 ? (
          <Paper sx={{ p: 1 }}>
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </Paper>
        ) : (
          rows.map((row) => (
            <Box key={String(getRowId(row))}>{renderMobileCard(row)}</Box>
          ))
        )}
        {/* fora do estado vazio: cair numa página sem itens não pode deixar
            o usuário sem controle para voltar */}
        {serverPagination && (
          <Paper>
            <TablePagination
              component="div"
              count={serverPagination.rowCount}
              page={serverPagination.page}
              rowsPerPage={serverPagination.pageSize}
              rowsPerPageOptions={PAGE_SIZE_OPTIONS}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              onPageChange={(_, p) => serverPagination.onChange(p, serverPagination.pageSize)}
              onRowsPerPageChange={(e) =>
                serverPagination.onChange(0, parseInt(e.target.value, 10))
              }
            />
          </Paper>
        )}
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
          loading={loading}
          localeText={{ ...DATA_GRID_LOCALE_TEXT, noRowsLabel: emptyTitle }}
          disableRowSelectionOnClick
          autoHeight
          rowHeight={56}
          {...(serverPagination
            ? {
                paginationMode: 'server' as const,
                rowCount: serverPagination.rowCount,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                paginationModel: {
                  page: serverPagination.page,
                  pageSize: serverPagination.pageSize,
                },
                onPaginationModelChange: (m: GridPaginationModel) =>
                  // trocar itens-por-página volta para a primeira, como no
                  // mobile; o MUI apenas clampava e os dois divergiam
                  serverPagination.onChange(
                    m.pageSize !== serverPagination.pageSize ? 0 : m.page,
                    m.pageSize,
                  ),
              }
            : {
                pageSizeOptions: [5, 10, 25, 50],
                initialState: { pagination: { paginationModel: { pageSize } } },
              })}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { borderRadius: 2 },
            '& .MuiDataGrid-cell': { minWidth: 80 },
            // ações sempre alinhadas ao início — o "olho" fica na mesma posição
            // mesmo quando a linha não tem o menu de 3 pontos
            '& .MuiDataGrid-cell--withRenderer.MuiDataGrid-cell[data-field="actions"]': {
              justifyContent: 'flex-start',
            },
            '& .MuiDataGrid-actionsCell': {
              gridGap: 0,
              justifyContent: 'flex-start',
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default DataTable
