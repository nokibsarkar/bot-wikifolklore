import { useCallback, useRef, useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcoin from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
const ImageSearcher = ({ setImageURL, defaultImageURL, fieldName = "Select Image" }) => {
    const [imageURL, setLocalImageURL] = useState('');
    const [fetching, setFetching] = useState(false);
    const [absoluteImageURL, setAbsoluteImageURL] = useState(defaultImageURL);
    const previewRef = useRef(null);
    const fetchImage = useCallback(async () => {
        const style = getComputedStyle(previewRef.current);
        const width = 500; // style.maxWidth.replace('px', '');
        const height = 500; //style.maxHeight.replace('px', '');
        const base = "https://commons.wikimedia.org/w/api.php"
        const wikiURLPattern = /^ *(?:https:\/\/(?:commons(?:\.m)?\.wikimedia|.+?\.(:?m\.)?wikipedia)\.org\/wiki\/)?[Ff]ile:/
        const params = new URLSearchParams({
            "action": "query",
            "format": "json",
            "prop": "imageinfo",
            "titles": "File:" + imageURL?.replace(wikiURLPattern, ""),
            "formatversion": "2",
            "iiurlwidth": width,
            "iiurlheight": height,
            "iiprop": "url|mime|metadata",
            "origin": "*"
        });
        const url = `${base}?${params}`;
        setFetching(true);
        const response = await fetch(url);
        const json = await response.json();
        const page = json?.query?.pages[0]
        if (page.missing || page.invalid) {
            setImageURL(defaultImageURL);

        } else {
            const url = page?.imageinfo[0]?.thumburl
            setImageURL(url);
            setAbsoluteImageURL(url);
        }
        setFetching(false);
    }, [imageURL, defaultImageURL, previewRef]);
    return (
        <fieldset style={{display : 'flex', flexDirection : 'column', alignItems : 'center', textAlign : 'center'}}>
            <Typography component="legend" variant='h6' sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 1 }}>
            {fieldName}
            </Typography>
            <img ref={previewRef} src={absoluteImageURL} alt="Campaign Image" style={{  maxWidth : '350px', maxHeight : '300px'}} />
            <TextField
                type="text"
                placeholder="Image URL or File Name on Wikimedia Commons"
                size="small"
                sx={{ mt:1 }}
                fullWidth
                value={imageURL}
                onChange={(e) => setLocalImageURL(e.target.value)}
            />
            <Button variant="contained" sx={{ m: 1 }} onClick={fetchImage} disabled={fetching}>
                {fetching ? <CircularProgress size={20} /> : <SearchIcoin />} Fetch
            </Button>

        </fieldset>

    )
}
export default ImageSearcher;
