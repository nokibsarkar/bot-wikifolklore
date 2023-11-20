import { Button, CircularProgress, Step, StepLabel, Stepper } from "@mui/material";
import { useReducer, useState } from "react";
import CampainEditableDetails from "./Details";
import CampaignRestrictions from "./Restrictions";
// import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import JuryPage from "./Jury";
const defaultCampaign = {
    name: 'Campaign Name',
    language: 'bn',
    rules: [
        'Rule 1',
        'Rule 2',
        'Rule 3'
    ],
    jury: [],
    startDate: '',
    endDate: '',
    status: 'active',
    maximumSubmissionOfSameArticle: 1,
    blackListedUsers: [
    ],
    allowExpansions: true, // Allow users to submit articles that were not created rather expanded
    minimumTotalBytes: 1000, // Minimum total bytes of all articles
    minimumTotalWords: 100, // Minimum total words of all articles
    minimumAddedBytes: 100, // Minimum bytes added to the article
    minimumAddedWords: 10, // Minimum words added to the article
    secretBallot: true, // If true, jury members will not be able to see each other's votes
    allowJuryToParticipate: true, // If true, jury members will be able to participate in the campaign
    allowMultipleJudgement: true, // If true, different jury members will be able to judge the same article 
};
const campaignReducer = (state, action) => {
    switch (action.type) {
        case 'rules':
            return { ...state, rules: action.payload };
        case 'jury':
            return { ...state, jury: action.payload };
        case 'name':
            return { ...state, name: action.payload };
        case 'startDate':
            return { ...state, startDate: action.payload };
        case 'endDate':
            return { ...state, endDate: action.payload };
        case 'language':
            return { ...state, language: action.payload };
        case 'maximumSubmissionOfSameArticle':
            return { ...state, maximumSubmissionOfSameArticle: action.payload };
        case 'blackListedUsers':
            return { ...state, blackListedUsers: action.payload };
        case 'allowExpansions':
            return { ...state, allowExpansions: action.payload };
        case 'minimumTotalBytes':
            return { ...state, minimumTotalBytes: action.payload };
        case 'minimumTotalWords':
            return { ...state, minimumTotalWords: action.payload };
        case 'minimumAddedBytes':
            return { ...state, minimumAddedBytes: action.payload };
        case 'minimumAddedWords':
            return { ...state, minimumAddedWords: action.payload };
        case 'secretBallot':
            return { ...state, secretBallot: action.payload };
        case 'allowJuryToParticipate':
            return { ...state, allowJuryToParticipate: action.payload };
        case 'allowMultipleJudgement':
            return { ...state, allowMultipleJudgement: action.payload };

        default:
            return state;
    }

};
const steps = ['Details', 'Restrictions', 'Jury', 'Overview'];

const Steps = ({ activeStep, setActiveStep, minimumStep }) => {
    return (
        <Stepper activeStep={activeStep} sx={{ m: 1 }} alternativeLabel>
            {steps.map((label, index) => {
                return (
                    <Step disabled={true} key={label}>
                        <StepLabel disabled={true} onClick={() => index >= minimumStep && setActiveStep(index)} sx={{ cursor: 'pointer' }}>{label}</StepLabel>
                    </Step>
                );
            })}
        </Stepper>
    )
}
const StepSelector = ({ step, props }) => {
    switch (step) {
        case 0:
            return <CampainEditableDetails {...props} />;
        case 1:
            return <CampaignRestrictions {...props} />;
        case 2:
            return <JuryPage {...props} />;
        case 3:
            return <CampainEditableDetails {...props} />;
        default:
            return <CampainEditableDetails {...props} />;
    }

}
const EditableCampaign = ({ initialCampaign = defaultCampaign, minimumStep = 0, linear = true }) => {
    const [campaign, dispatchCampaign] = useReducer(campaignReducer, initialCampaign);
    const [step, setStep] = useState(minimumStep);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    if (loading)
        return <CircularProgress />;
    if (error)
        return <div>{error}</div>;
    return (
        <div style={{ textAlign: 'center' }}>

            <Steps activeStep={step} setActiveStep={linear ? () => null : setStep} minimumStep={minimumStep} />
            <StepSelector step={step} props={{ campaign, campaignDispatch: dispatchCampaign }} />
            {
                linear && step + 1 < steps.length ? <p>
                    <Button disabled={step - 1 < minimumStep} variant="contained" color="success" onClick={() => setStep(step - 1)} sx={{ m: 1 }}>
                        <ArrowBackIcon /> Back
                    </Button>
                    {step + 1 < steps.length && <Button variant="contained" color="success" onClick={() => setStep(step + 1)} sx={{ m: 1 }}>
                         Next <ArrowForwardIcon />
                    </Button>
                    }
                </p> : <Button variant="contained" color="success" onClick={() => null} sx={{ m: 1, minWidth : '33%' }}>
                    <SaveIcon /> &nbsp;Save
                </Button>

            }
        </div>
    )

};
export default EditableCampaign;