import { Button, CircularProgress, Step, StepLabel, Stepper } from "@mui/material";
import { useReducer, useState } from "react";
import CampainEditableDetails from "./Details";
import CampaignRestrictions from "./Restrictions";
import JuryPage from "./Jury";
import CampaignOverview from "./Overview";
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorPage from "../../../Components/ErrorPage";
import LoadingPage from "../../../../Layout/Loader";
import {DetailsButton} from "../../../Components/CampaignButtons";
import KitKatServer from "../../../Server";
const defaultCampaign = {
    name: '',
    description : null,
    language: 'bn',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Feminism_and_Folklore_2024_logo.svg',
    rules: [
        'All Participants must be registered in Wikipedia',
        
    ],
    jury: [
        KitKatServer.BaseServer.loginnedUser().username
    ],
    start_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_at: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    blacklist: [],
    maximumSubmissionOfSameArticle: 1, // Maximum number of times an article can be submitted
    allowExpansions: true, // Allow users to submit articles that were not created rather expanded
    minimumTotalBytes: 4000, // Minimum total bytes of all articles
    minimumTotalWords: 400, // Minimum total words of all articles
    minimumAddedBytes: 4000, // Minimum bytes added to the article
    minimumAddedWords: 400, // Minimum words added to the article
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
        case 'status':
            return { ...state, status: action.payload };
        case 'image':
            return { ...state, image: action.payload };
        default:
            return state;
    }

};
const steps = ['Details', 'Restrictions', 'Jury', 'Overview'];

const Steps = ({ activeStep, setActiveStep, minimumStep }) => {
    return (
        <Stepper activeStep={activeStep} sx={{ m: 1, '&.MuiStepLabel-root' : {
            cursor: 'pointer'
        } }} alternativeLabel>
            {steps.map((label, index) => {
                return (
                    <Step key={label} disabled={index < minimumStep}>
                        <StepLabel  onClick={() => index >= minimumStep && setActiveStep(index)} sx={{ cursor: 'pointer' }}>{label}</StepLabel>
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
const EditableCampaign = ({ error = null, defaultStep = 0, initialCampaign = defaultCampaign, minimumStep = 0, linear = true, showActions = false, onSave = null, showGotoDetailsButton = false}) => {

    const [campaign, dispatchCampaign] = useReducer(campaignReducer, initialCampaign);
    const [step, setStep] = useState(defaultStep);
    const [loading, setLoading] = useState(false);
    const [nextPermittable, setNextPermittable] = useState(false);
    if (loading)
        return <LoadingPage title="Loading, please wait..." />
    if (error)
        return <ErrorPage errorMsg={error} />
    const SaveButton = <Button disabled={!nextPermittable} variant="contained" color="success" onClick={e => onSave(campaign, setLoading)} sx={{ m: 1 }}>
        <SaveIcon /> Save
    </Button>
    return (
        <div style={{ textAlign: 'center' }}>

            <Steps activeStep={step} setActiveStep={linear ? () => null : setStep} minimumStep={minimumStep} />
            <StepSelector step={step} props={{ campaign, campaignDispatch: dispatchCampaign, showActions, setNextPermittable }} />
            
            {error && <ErrorPage errorMsg={error} />}

            {showGotoDetailsButton && <DetailsButton campaign={campaign} />}
            {
                linear ? <p>
                    <Button disabled={step - 1 < minimumStep} variant="contained" color="success" onClick={() => setStep(step - 1)} sx={{ m: 1 }}>
                        <ArrowBackIcon /> Back
                    </Button>
                    {step + 1 < steps.length ? <Button disabled={!nextPermittable} variant="contained" color="success" onClick={() => setStep(step + 1)} sx={{ m: 1 }}>
                        Next <ArrowForwardIcon />
                    </Button> : SaveButton
                    }
                </p> : SaveButton
            }
        </div>
    )

};
export default EditableCampaign;
