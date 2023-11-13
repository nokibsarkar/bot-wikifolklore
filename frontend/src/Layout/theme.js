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
        }
    },
});
export default theme;