import CircularProgress from '@mui/material/CircularProgress';
export default function LoadingPage({ title = null, sx = {} }) {
    return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...sx }}>
        <CircularProgress />
        <h1>{title}</h1>
    </div>
}