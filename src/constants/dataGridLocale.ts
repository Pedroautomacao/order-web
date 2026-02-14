/** Textos em português para o DataGrid (paginação: "Linhas por página" etc.) */
export const DATA_GRID_LOCALE_TEXT = {
  noRowsLabel: 'Nenhum resultado encontrado',
  MuiTablePagination: {
    labelRowsPerPage: 'Linhas por página',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}-${to} de ${count !== -1 ? count : `${to} ou mais`}`,
  },
} as const
