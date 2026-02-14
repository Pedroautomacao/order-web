import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    fontWeight: 600,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
    },
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    overflowX: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  table: {
    minWidth: 280,
    [theme.breakpoints.down('sm')]: {
      minWidth: 260,
    },
  },
}))
