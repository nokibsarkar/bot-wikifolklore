import { Route, Routes } from "react-router";
import { lazy } from "react";
import ArticleSubmissionPage from "./Submission/NewSubmission";
import JudgeSubmission from "./Submission/JudgeSubmission";
// 
const Campaign = () => {
    return (
        <Routes>
            <Route path='campaign/*'>
                <Route path="submit" element={<ArticleSubmissionPage />} />
                
                <Route path="*" element={<div>Unknown Campaign Page</div>} />
            </Route>
        </Routes>
    )
}
export default Campaign