import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    width: 240,
    flexShrink: 0,
    [theme.breakpoints.up('md')]: {
      width: 240,
    },
  },
  title: {
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  drawerPaper: {
    width: 240,
  },
}))

