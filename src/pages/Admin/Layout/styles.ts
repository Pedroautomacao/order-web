import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  toolbar: {
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 240, // Width of sidebar
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      padding: theme.spacing(2),
    },
  },
}))

