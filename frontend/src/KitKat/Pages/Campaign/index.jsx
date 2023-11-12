import { Route, Routes } from "react-router";
import ArticleSubmissionPage from "./ArticleSubmission";
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