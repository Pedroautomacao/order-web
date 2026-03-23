import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(0, 1),
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(3),
    gap: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginBottom: theme.spacing(2),
    },
  },
  title: {
    fontWeight: 600,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
    },
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'flex-start',
    },
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  infoGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(2),
    },
  },
  table: {
    minWidth: 320,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
}))
