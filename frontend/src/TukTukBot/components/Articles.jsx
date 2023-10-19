import Paper from "@mui/material/Paper";
import CircularProgress from '@mui/material/CircularProgress';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import React, { useCallback } from "react";
import AutoComplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Collapse from "@mui/material/Collapse"
import Server from "../Server2.ts";


import { DataGrid } from '@mui/x-data-grid/DataGrid';
const COLUMNS = [
    { field: 'id', headerName: 'ID', maxWidth : 100, flex:1, hideable : false },
    { field: 'title', headerName: 'Title' , flex: 1, hideable : false },
    { field: 'wikidata', headerName: 'Wikidata', width : 120},
    { field: 'target', headerName: 'Target', flex : 1},

]
const TabledArticles = ({ data }) => {
    const rows = data?.map((article, index) => ({
        id: index + 1,
        title: article?.title,
        wikidata : article?.wikidata,
        target : article?.target
    }));
    return (
        <DataGrid
            rows={rows}
            columns={COLUMNS}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection={false}
            disableSelectionOnClick
            sx={{
                width: '100%',
            }}
        />
    )
}

const WikiTextArticles = ({ data }) => {
    return (
        <TextField
            id="outlined-multiline-static"
            label={null}
            multiline
            rows={4}
            value={data}
            fullWidth
            onClick={e => e.target.select()}
        />
    )
}
class ArticleList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],

            wikitext: '',
            showWikiText: false,
            fetchingWikiText: false,

            csv: null,
            fetchingCSV: false,

            json: null,
            fetchingJSON: false,

            statusCheckerTimer: 0,

            articleCount: 0,
            processedCategory: 'Cat:L',
            processedCount: 100
        };
    }
    async checkTaskStatus() {
        console.log("Checking status")
        const task = await Server.getTask(this.props.taskID)
        console.log("Task Status", task)
        if (task.status != 'pending') {
            console.log("Timer Cleared", this.state.statusCheckerTimer)
            this.setState({
                generating: false,
                statusCheckerTimer: 0
            })
            if (task.status == 'done') {
                this.exportTable();
            } else {

            }
        } else {
            this.setState({
                generating: true,
                statusCheckerTimer: setTimeout(this.checkTaskStatus.bind(this), 1000)

            })
        }
        this.setState({
            articleCount: task.article_count,
            processedCategory: task.last_category,
            processedCount: task.category_count
        })
    }
    componentWillUnmount() {
        clearTimeout(this.state.statusCheckerTimer);
        this.setState({
            // statusCheckerTimer : 0
        })

    }
    async exportCSV() {
        const download = (taskID, csv) => {
            const a = document.createElement("a");
            a.download = `results-${taskID}.csv`
            a.href = URL.createObjectURL(new Blob([csv], {
                type: 'application/csv'
            }));
            a.click();
            a.remove()
        }
        if (!this.state.csv) {
            // fetch CSV
            const csv = await Server.exportResult(this.props.taskID, 'csv');
            this.setState({
                csv: csv
            })
            return download(this.props.taskID, csv)
        };
        return download(this.props.taskID, this.state.csv)

    }
    async exportWikiTextToggle() {
        if (this.state.showWikiText)
            // hide the wikitext
            this.setState({
                showWikiText: false
            })
        else {
            if (!this.state.wikitext) {
                // fetch the wikitext
                const wikitext = await Server.exportResult(this.props.taskID, 'wikitext');
                this.setState({
                    showWikiText: true,
                    wikitext: wikitext
                })
            }
            else
                this.setState({
                    showWikiText: true
                })
        }
    }
    async exportTable() {
        const cats = await Server.exportResult(this.props.taskID, 'json');
        this.setState({
            data: cats,
            json: JSON.stringify(cats)
        })
    }
    shouldComponentUpdate(nextProps, nextState) {
        console.log("Should Component Update", nextProps, nextState)
        if (this.props.taskID != nextProps.taskID) {
            this.checkTaskStatus();
            // reset the state
            this.setState({
                data: [],

                wikitext: '',
                showWikiText: false,
                fetchingWikiText: false,

                csv: null,
                fetchingCSV: false,

                json: null,
                fetchingJSON: false,

                statusCheckerTimer: 0,

                articleCount: 0,
                processedCategory: '',
                processedCount: 0
            })
        }
        return true;
    }
    render() {
        const processing = this.state.fetchingCSV || this.state.fetchingJSON || this.state.fetchingWikiText;
        const Actions = (
            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                '& > *': {
                    m: 1,
                },
            }}>
                <Button variant="contained" color="primary" onClick={this.exportWikiTextToggle.bind(this)}>
                    <CodeIcon /> WikiText
                </Button>
                <Button variant="contained" color="primary" onClick={this.exportCSV.bind(this)}>
                    <DownloadIcon /> CSV
                </Button>
            </Box>
        );
        const GeneratorStatus = (
            <Box>
                Article count : {this.state.articleCount}
                Processed Count : {this.state.processedCount}
                Last Category: {this.state.processedCategory}
            </Box>
        )
        return <Card sx={
            { m: '5px' }
        }>
            <CardHeader action={Actions} title={GeneratorStatus} />
            <CardContent>
                {processing ? <CircularProgress /> : (
                    <>
                        <Collapse in={this.state.showWikiText}>
                            <WikiTextArticles data={this.state.wikitext} />
                        </Collapse>
                        {this.state.data?.length > 0 && <TabledArticles data={this.state.data} />}
                    </>
                )}
            </CardContent>
        </Card>
    }
}
const _ArticleList = ({ taskID, statusRef, setDisabled }) => {
    const [data, setData] = React.useState([]);
    const [wikitext, setWikiText] = React.useState('');
    const [showWikiText, setShowWikiText] = React.useState(false);
    const [csv, setCSV] = React.useState(null);
    const [json, setJSON] = React.useState(null);
    const [statusCheckerTimer, setStatusCheckerTimer] = React.useState(0);
    const [articleCount, setArticleCount] = React.useState(0);
    const [processedCategory, setProcessedCategory] = React.useState('');
    const [processedCount, setProcessedCount] = React.useState(0);
    const [generating, setGenerating] = React.useState(false);
    statusRef.current = generating
    const checkTaskStatus = useCallback(async () => {
        // console.log("Checking status")
        const task = await Server.getTask(taskID)
        if (task.status != 'pending') {
            // console.log("Timer Cleared", statusCheckerTimer)
            setGenerating(false);
            setDisabled(false);
            setStatusCheckerTimer(0)
            if (task.status == 'done') {
                exportTable();
            } else if(task.status == 'failed'){
                alert("Task Failed")
            }
        } else {
            setGenerating(true);
            setDisabled(true);
            setStatusCheckerTimer(setTimeout(checkTaskStatus, 1000))
        }
        setArticleCount(task.article_count);
        setProcessedCategory(task.last_category);
        setProcessedCount(task.category_count);
    }, [taskID]);
    const exportCSV = useCallback(async () => {
        const download = (taskID, csv) => {
            const a = document.createElement("a");
            a.download = `results-${taskID}.csv`
            a.href = URL.createObjectURL(new Blob([csv], {
                type: 'application/csv'
            }));
            a.click();
            a.remove()
        }
        if (!csv) {
            // fetch CSV
            const csv = await Server.exportResult(taskID, 'csv');
            setCSV(csv)
            return download(taskID, csv)
        };
        return download(taskID, csv)

    }, [taskID,]);
    const exportWikiTextToggle = useCallback(async () => {
        if (showWikiText)
            // hide the wikitext
            setShowWikiText(false)
        else {
            if (!wikitext) {
                // fetch the wikitext
                const wikitext = await Server.exportResult(taskID, 'wikitext');
                setShowWikiText(true)
                setWikiText(wikitext)
            }
            else
                setShowWikiText(true)
        }
    }, [taskID, showWikiText]);
    const exportTable = useCallback(async () => {
        const cats = await Server.exportResult(taskID, 'json');
        setData(cats);
        setJSON(JSON.stringify(cats));
    }, [taskID]);
    
    React.useEffect(() => {
        checkTaskStatus();
        return () => {
            clearTimeout(statusCheckerTimer);
            setStatusCheckerTimer(0)
        }
    }, [taskID, checkTaskStatus]);
    const Actions = (
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            '& > *': {
                m: 1,
            },
        }}>
            <Button variant="contained" color="primary" onClick={exportWikiTextToggle} disabled={generating}>
                <CodeIcon /> WikiText
            </Button>
            <Button variant="contained" color="primary" onClick={exportCSV} disabled={generating}>
                <DownloadIcon /> CSV
            </Button>
        </Box>
    );
    const GeneratorStatus = (
        <Box sx={{
            fontSize: '16px'
        }}>
            Article count : {articleCount}<br/>
            Processed Count : {processedCount}<br/>
            Last Category: {processedCategory}<br/>
        </Box>
    )
    return <Card sx={
        { m: '5px' }
    }>
        <CardHeader action={Actions} title={GeneratorStatus} />
        <CardContent>
            {generating ? <CircularProgress /> : (
                <>
                    <Collapse in={showWikiText}>
                        <WikiTextArticles data={wikitext} />
                    </Collapse>
                    {data?.length > 0 && <TabledArticles data={data} />}
                </>
            )}
        </CardContent>
    </Card>
}
export default _ArticleList