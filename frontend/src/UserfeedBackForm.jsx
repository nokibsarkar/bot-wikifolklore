import { captureUserFeedback } from "@sentry/react";
import { useEffect, useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import styled from '@mui/material/styles/styled';
import Server from './Server';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import Typography from '@mui/material/Typography';
import CrossIcon from '@mui/icons-material/Close';
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
const FedbackResponse = ({stage = 'loading', setFeedbackOpen}) => {
    return (
        <DialogContent sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
           {
                stage === 'loading' ? <CircularProgress sx={{ color: 'blue', fontSize: 100 }}/> : stage === 'success' ? <CheckIcon sx={{ color: 'green', fontSize: 100 }} /> : <CrossIcon sx={{ color: 'red', fontSize: 100 }} />
           }
            <Typography variant="h5" sx={{ textAlign: 'center' }}>
                {stage === 'loading' ? 'Submitting Feedback...' : stage === 'success' ? 'Thank you for your feedback!' : 'Something went wrong!'}
            </Typography>
            <Button color="success" variant="contained" onClick={e => setFeedbackOpen(false)} size="small">Close</Button>
        </DialogContent>
    )
}
const UserfeedBackForm = ({  setFeedbackOpen }) => {
    const [uiScore, setUiScore] = useState(0);
    const [performanceScore, setPerformanceScore] = useState(0);
    const [whyBetterFeedback, setWhyBetterFeedback] = useState("");
    const [newFeatureFeedback, setNewFeatureFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (success) {
            setFeedbackOpen(false);
        }
    }, []);
    return (
        <Dialog open={true} onClose={e => setFeedbackOpen(false)} fullWidth sx={{

            // display: 'flex',
            // alignItems: 'center',
        }}>
            <DialogTitle>User Feedback</DialogTitle>

            {loading ? <FedbackResponse stage="loading" setFeedbackOpen={setFeedbackOpen}/> : success ? <FedbackResponse stage="success" setFeedbackOpen={setFeedbackOpen}/> :
            error ? <FedbackResponse stage="error" setFeedbackOpen={setFeedbackOpen}/> :
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
                            disabled={loading}
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
                            disabled={loading}
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
                        disabled={loading}
                    />
                    <TextField
                        label="What new features would you like to see?"
                        multiline
                        variant="outlined"
                        value={newFeatureFeedback}
                        onChange={(e) => setNewFeatureFeedback(e.target.value)}
                        fullWidth
                        margin="normal"
                        disabled={loading}
                    />

                    <Button color="success" variant="contained" onClick={async () => {
                        const feedback = {
                            ui_score: uiScore,
                            speed_score: performanceScore,
                            why_better: whyBetterFeedback,
                            feature_request: newFeatureFeedback
                        }
                        setLoading(true);
                        Server.sendFeedback(feedback).then(() => {
                            setSuccess(true);
                            setLoading(false);
                        })
                    }}>Submit</Button>
                </DialogContent>
            }
        </Dialog>
    )
}
export default UserfeedBackForm;