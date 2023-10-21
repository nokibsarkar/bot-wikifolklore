import Paper from "@mui/material/Paper";
import CircularProgress from '@mui/material/CircularProgress';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import React, { useCallback, useEffect, useMemo } from "react";
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
import TranslateIcon from '@mui/icons-material/Translate';
import Server from "../Server.ts";
// import TranslationIcon from '@mui/icons-material/Translation';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';



import { DataGrid } from '@mui/x-data-grid/DataGrid';

const Popup = ({ open, onClose, englishTitle, suggestedTargetTitle, languageCode, action }) => {
    const [targetTitle, setTargetTitle] = React.useState(suggestedTargetTitle);
    useEffect(() => {
        setTargetTitle(suggestedTargetTitle)
    }, [suggestedTargetTitle])
    const data = {
        title: '',
        targetURL: '',
        buttonName: ''
    }
    if (action == 'translate') {
        data.title = 'Translate'
        data.targetURL = `https://${languageCode}.wikipedia.org/w/index.php?title=Special:ContentTranslation&campaign=fnf&from=en&page=${englishTitle}&to=${languageCode}`
        data.buttonName = 'Translate'
    } else {
        data.title = 'Create'
        data.targetURL = `https://${languageCode}.wikipedia.org/w/index.php?title=${targetTitle}&campaign=fnf&from=en&page=${englishTitle}&to=${targetTitle}&action=edit`
        data.buttonName = 'Create'
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom >
                    <b>English : <a href={"https://en.wikipedia.org/wiki/" + englishTitle} target="_blank" style={{ textDecoration: 'none' }}>{englishTitle}</a></b>
                </Typography>
                <TextField
                    id="outlined-multiline-static"
                    label="Target Title"
                    multiline
                    value={targetTitle}
                    fullWidth
                    onChange={e => setTargetTitle(e.target.value)}
                    sx={{
                        mt: 1
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button sx={{ mr: 1 }} onClick={() => onClose(null)} color="secondary" variant="contained" size="small">
                    Cancel
                </Button>
                <Button color="primary" variant="contained" component="a" size="small" href={data.targetURL} target="_blank" autoFocus>
                    {data.buttonName}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
const COLUMNS = [
    { field: 'id', headerName: 'ID', maxWidth: 70, flex: 1, hideable: false },
    { field: 'title', headerName: 'Title', flex: 1, hideable: false, minWidth: 300 },
    // { field: 'wikidata', headerName: 'Wikidata', width : 120},
    { field: 'target', headerName: 'Target', flex: 1, minWidth: 300 },
    { field: 'action', headerName: 'Action', flex: 1, minWidth: 150, hideable: false, renderCell: (params) => params.value }
]
const TabledArticles = ({ data, targetLanguage }) => {

    const [popupAction, setPopupAction] = React.useState(null);
    const [popupOpen, setPopupOpen] = React.useState(false);
    const [popupEnglishTitle, setPopupEnglishTitle] = React.useState('');
    const [popupSuggestedTargetTitle, setPopupSuggestedTargetTitle] = React.useState('');
    const executeAction = (e) => {
        setPopupAction(e.currentTarget.dataset.action)
        setPopupEnglishTitle(e.currentTarget.dataset.src)
        setPopupSuggestedTargetTitle(e.currentTarget.dataset.target)
        setPopupOpen(true)
    }
    const rows = useMemo(() => data?.map((article, index) => ({
        id: index + 1,
        title: article?.title,
        wikidata: article?.wikidata,
        target: article?.target,
        action: (
            <>
                {/* <TranslateIcon sx={{pointer : 'cursor'}} type='button' data-action="translate" data-src={article?.title} data-target={article?.target} onClick={executeAction} variant="contained" color="primary"  size="small" /> */}
                {/* <button style={{ cursor: 'pointer' }} type='button' data-action="translate" data-src={article?.title} data-target={article?.target} onClick={executeAction} variant="contained" color="primary" size="small">
                    文A
                </button>
                <button style={{ cursor: 'pointer', marginLeft: '5px' }} type='button' data-action="create" data-src={article?.title} data-target={article?.target} onClick={executeAction} variant="contained" color="primary" size="small">
                    &#43;
                </button> */}
                <Button variant="contained" color="primary" size="small" data-action="create" data-src={article?.title} data-target={article?.target} onClick={executeAction}>
                    <AddIcon />
                </Button>
                <Button variant="contained" sx={{ml : 1}} color="primary" size="small" data-action="translate" data-src={article?.title} data-target={article?.target} onClick={executeAction}>
                    <TranslateIcon />
                </Button>
            </>
        )
    })), [data]);
    return (
        <>
            <Popup
                open={popupOpen}
                action={popupAction}
                onClose={() => setPopupOpen(false)}
                suggestedTargetTitle={popupSuggestedTargetTitle}
                englishTitle={popupEnglishTitle}
                languageCode={targetLanguage}
            />
            <DataGrid
                rows={rows}
                columns={COLUMNS}
                pageSize={50}
                rowsPerPageOptions={[50]}
                checkboxSelection={false}
                disableSelectionOnClick
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 25 },
                    },
                }}
                sx={{
                    width: '100%',
                }}
            />
        </>
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
const ArticleList = ({ taskID, statusRef, setDisabled, targetLanguage }) => {
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
            } else if (task.status == 'failed') {
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
            <Button variant="contained" color="primary" onClick={exportWikiTextToggle} disabled={generating} size="small" sx={{mr : 1}}>
                <CodeIcon /> Wiki
            </Button>
            <Button variant="contained" color="primary" onClick={exportCSV} disabled={generating} size="small" >
                <DownloadIcon /> CSV
            </Button>
        </Box>
    );
    const GeneratorStatus = (
        <Box sx={{
            fontSize: '16px'
        }}>
            Article count : {articleCount}<br />
            Processed Count : {processedCount}<br />
            Last Category: {processedCategory}<br />
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
                    {data?.length > 0 && <TabledArticles data={data} targetLanguage={targetLanguage} />}
                </>
            )}
        </CardContent>
    </Card>
}
export default ArticleList