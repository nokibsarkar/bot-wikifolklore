
import LinearProgress from '@mui/material/LinearProgress';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { useState } from "react";
import AutoComplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Server from "../../Server.ts";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import Footer from '../../../Layout/Footer.jsx';
const ListTopic = () => {
    const [topic, setTopic] = useState('folklore');
    const [countries, setCountries] = useState([]);
    const goToTopic = (row) => {
        console.log(row)
        // window.location.href = url;
    }
    useState(() => {
        Server.fetchCountries(topic).then(countries => {
            setCountries(countries)
        })
    }, [])
    return (
        <Box>
            <Card>
                <CardHeader title="List Topics" action={
                    <Button
                        variant="contained"
                        component={Link}
                        color='success'
                        to="/tuktukbot/topic/create"
                        startIcon={<AddIcon />}
                    >
                        New
                    </Button>

                } />
                <CardContent>
                    <List>
                        {countries?.map(country => (
                            <ListItem key={country.id}>
                                <ListItemText primary={country.label} />
                                <Button
                                    variant="contained"
                                    component={Link}
                                    color="secondary"
                                    to={`/tuktukbot/topic/edit?id=${topic}/${country.id}`}
                                    startIcon={<EditIcon />}
                                >
                                    Edit
                                </Button>
                            </ListItem>
                        )
                        )}
                    </List>
                    <Footer/>
                </CardContent>
            </Card>
        </Box>
    )
}
export default ListTopic