import { captureUserFeedback } from "@sentry/react";
import { useState } from "react";
// import Dialog 
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
const UserfeedBackForm = ({user}) => {

}
export default UserfeedBackForm;