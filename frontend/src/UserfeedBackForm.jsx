import { captureUserFeedback } from "@sentry/react";
import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import styled from '@mui/material/styles/styled';
import Server from './Server';
import Button from '@mui/material/Button';
// const UserfeedBackForm = ({ user, dsn = "https://d5f72a7651486fb43aef6fded21f5385@o249367.ingest.sentry.io/4506264792727552", projectId }) => {
//     const [feedback, setFeedback] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [success, setSuccess] = useState(false);
//     const [error, setError] = useState(null);
//     console.log(dsn);
//     const handleSubmit = async (e) => {
//         captureUserFeedback({
//             name: user.name,
//             email: user.email,
//             comments: feedback,
//         });
//         setLoading(true);
//         try {
//             const url = `https://sentry.io/api/0/projects/${projectId}/user-feedback/`;
//             await fetch(url, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `DSN ${dsn}`,
//                 },
//                 body: JSON.stringify({
//                     name: `${user.username} (${user.id})`,
//                     // email: user.email,
//                     comments: feedback,
//                 }),
//             });
//             setSuccess(true);
//         } catch (e) {
//             setError(e);
//         }
//     }
//     if (success) {
//         return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//             <h1>Thank you for your feedback!</h1>
//         </div>
//     }
//     if (error) {
//         return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//             <h1>Something went wrong!</h1>
//             <p>{error.message}</p>
//         </div>
//     }
//     return (
//         <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//             <h1>Feedback</h1>
//             <textarea
//                 style={{ width: '80%', height: '200px', resize: 'none' }}
//                 value={feedback}
//                 onChange={(e) => setFeedback(e.target.value)}
//             />
//             <button onClick={handleSubmit}>Submit</button>
//         </div>
//     )
// };
const PrettoSlider = styled(Slider)({
    color: '#52af77',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&::before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: '#52af77',
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&::before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
            transform: 'rotate(45deg)',
        },
    },
});

const UserfeedBackForm = ({ user, setFeedbackOpen }) => {
    const [uiScore, setUiScore] = useState(0);
    const [performanceScore, setPerformanceScore] = useState(0);
    const [whyBetterFeedback, setWhyBetterFeedback] = useState("");
    const [newFeatureFeedback, setNewFeatureFeedback] = useState("");
    return (
        <Dialog open={true} onClose={ e => setFeedbackOpen(false)} fullWidth sx={{
            '& .MuiDialog-paper': {
                width: '100%',
                maxWidth: '600px',
            },
            display: 'flex',
            alignItems: 'center',
        }}>
            <DialogTitle>User Feedback</DialogTitle>
            <DialogContent>
                <fieldset style={{ display: 'flex', alignItems: 'center', padding: 25 }}>
                    <legend>How would you rate the User Interface?</legend>
                    <PrettoSlider
                        valueLabelDisplay="auto"
                        aria-label="pretto slider"
                        value={uiScore}
                        onChange={(e, v) => setUiScore(v)}
                        max={10}
                        min={0}
                        style={{ flex: 1, margin: '0 10px' }}
                    />
                </fieldset>
                <fieldset style={{ display: 'flex', alignItems: 'center', padding: 25 }}>
                    <legend>How would you rate the performance?</legend>
                    <PrettoSlider
                        valueLabelDisplay="auto"
                        aria-label="pretto slider"
                        value={performanceScore}
                        onChange={(e, v) => setPerformanceScore(v)}
                        max={10}
                        min={0}
                        style={{ flex: 1, margin: '0 10px' }}
                    />
                </fieldset>
                <TextField
                    label="Why is this tool better than the others?"
                    multiline
                    variant="outlined"
                    value={whyBetterFeedback}
                    onChange={(e) => setWhyBetterFeedback(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="What new features would you like to see?"
                    multiline
                    variant="outlined"
                    value={newFeatureFeedback}
                    onChange={(e) => setNewFeatureFeedback(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <Button color="success" variant="contained" onClick={async () => {
                    const feedback = {
                        uiScore,
                        performanceScore,
                        whyBetterFeedback,
                        newFeatureFeedback
                    }
                    Server.sendFeedback(feedback).then(() => {
                        setFeedbackOpen(false);
                    })
                }}>Submit</Button>
            </DialogContent>
        </Dialog>
    )
}
export default UserfeedBackForm;