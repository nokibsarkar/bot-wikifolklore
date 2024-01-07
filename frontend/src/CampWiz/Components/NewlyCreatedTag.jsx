import Chip from '@mui/material/Chip';
const Tag = ({ value, color}) => (
    <Chip
        label={value}
        color={color}
        sx={{ mx: 0.5 }}
    />
)
export default Tag;