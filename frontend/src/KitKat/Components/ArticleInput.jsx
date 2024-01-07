import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import KitKatServer from '../Server';
import { useState, useEffect } from 'react';
const ArticleInput = ({ onNewArticle, language , submitButtonLabel = 'Submit'}) => {
    const [articles, setArticles] = useState([]); // [ { id, name } ]
    const [articleName, setArticleName] = useState('');
    const [prefix, setPrefix] = useState('');
    useEffect(() => {
        KitKatServer.Wiki.suggestArticles(language, prefix, "0").then(setArticles);
    }, [prefix, language]);
    return <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Autocomplete
            disablePortal
            id="article-name"
            options={articles}
            size="small"
            loading={articles.length === 0}
            inputValue={prefix}
            value={articleName}
            onChange={
                (e, newValue) => {
                    setArticleName(newValue );
                    setPrefix(newValue || '')
                }
            }
            onChangeCapture={e => setPrefix(e.target.value || '')}
            sx={{
                minWidth: '60%',
                mr: 1,
                textAlign: 'center'
            }}
            renderInput={(params) => <TextField {...params} label="Article Name" />}
        />
        <Button variant="contained" disabled={articleName === ""} onClick={e => onNewArticle(articleName)}>{submitButtonLabel}</Button>
    </Box>
}
export default ArticleInput;