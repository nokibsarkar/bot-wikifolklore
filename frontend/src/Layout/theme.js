import createTheme from "@mui/material/styles/createTheme";
const theme = createTheme({
    palette: {
        primary: {
        main: "#00669a",
        // contrastText: "#2f9a66",
        },
        secondary: {
            main : '#9a0000'
        },
        rules : {
            main : '#b2c9ed',
            light : '#dce6f5',
            dark : '#2b4670'
        },
        list : {
            main : '#b2c9ed',
            light : '#dce6f5',
            dark : '#2b4670'
        },
        campaignStatus : {
            pending : '#b2c9ed',
            scheduled : '#dce6f5',
            running : '#2b4670',
            evaluating : '#2b4670',
            ended : '#b2c9ed',
            rejected : '#2b4670',
            cancelled : '#dce6f5',
        }
    },
});
export default theme;