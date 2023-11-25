import { Button, CircularProgress, Step, StepLabel, Stepper } from "@mui/material";
import { useReducer, useState } from "react";
import CampainEditableDetails from "./Details";
import CampaignRestrictions from "./Restrictions";
import JuryPage from "./Jury";
import CampaignOverview from "./Overview";
// import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorPage from "../../../Components/ErrorPage";

const defaultCampaign = {
    name: 'Campaign Name',
    description : null,
    language: 'bn',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/%E0%A6%89%E0%A6%87%E0%A6%95%E0%A6%BF%E0%A6%AA%E0%A6%BF%E0%A6%A1%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE_%E0%A6%8F%E0%A6%B6%E0%A7%80%E0%A6%AF%E0%A6%BC_%E0%A6%AE%E0%A6%BE%E0%A6%B8_%E0%A7%A8%E0%A7%A6%E0%A7%A8%E0%A7%A9_%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%A8%E0%A6%BE%E0%A6%B0.svg/425px-%E0%A6%89%E0%A6%87%E0%A6%95%E0%A6%BF%E0%A6%AA%E0%A6%BF%E0%A6%A1%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE_%E0%A6%8F%E0%A6%B6%E0%A7%80%E0%A6%AF%E0%A6%BC_%E0%A6%AE%E0%A6%BE%E0%A6%B8_%E0%A7%A8%E0%A7%A6%E0%A7%A8%E0%A7%A9_%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%A8%E0%A6%BE%E0%A6%B0.svg.png',
    rules: [
        'Rule 1',
        'Rule 2',
        'Rule 3'
    ],
    jury: [],
    start_at: '',
    end_at: '',
    status: 'active',
    blacklist: [],
    maximumSubmissionOfSameArticle: 1, // Maximum number of times an article can be submitted
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
        case 'start_at':
            return { ...state, start_at: action.payload };
        case 'end_at':
            return { ...state, end_at: action.payload };
        case 'language':
            return { ...state, language: action.payload };
        case 'maximumSubmissionOfSameArticle':
            return { ...state, maximumSubmissionOfSameArticle: action.payload };
        case 'blacklist':
            return { ...state, blacklist: action.payload };
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
            return <CampaignOverview {...props} />;
    }

}
const EditableCampaign = ({ error = null, defaultStep = 0, initialCampaign = defaultCampaign, minimumStep = 0, linear = true, showActions = false, onSave = null }) => {

    const [campaign, dispatchCampaign] = useReducer(campaignReducer, initialCampaign);
    const [step, setStep] = useState(defaultStep);
    const [loading, setLoading] = useState(false);
    if (loading || !campaign)
        return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </div>
    // if (error)
    //     return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    //         {error}
    //     </div>
    const SaveButton = <Button variant="contained" color="success" onClick={e => onSave(campaign, setLoading)} sx={{ m: 1 }}>
        <SaveIcon /> Save
    </Button>
    return (
        <div style={{ textAlign: 'center' }}>

            <Steps activeStep={step} setActiveStep={linear ? () => null : setStep} minimumStep={minimumStep} />
            <StepSelector step={step} props={{ campaign, campaignDispatch: dispatchCampaign, showActions }} />
            
            {error && <ErrorPage errorMsg={error} />}
            {
                linear ? <p>
                    <Button disabled={step - 1 < minimumStep} variant="contained" color="success" onClick={() => setStep(step - 1)} sx={{ m: 1 }}>
                        <ArrowBackIcon /> Back
                    </Button>
                    {step + 1 < steps.length ? <Button variant="contained" color="success" onClick={() => setStep(step + 1)} sx={{ m: 1 }}>
                        Next <ArrowForwardIcon />
                    </Button> : SaveButton
                    }
                </p> : SaveButton


            }
        </div>
    )

};
export default EditableCampaign;