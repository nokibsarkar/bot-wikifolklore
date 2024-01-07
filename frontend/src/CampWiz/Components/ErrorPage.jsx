const ErrorPage = ({errorMsg}) => (
    <div className="error" style={{ color: 'red', background : 'pink', 'textAlign' : 'center', padding : 5, minHeight : 50 }}>
        <p>{errorMsg}</p>
    </div>
)
export default ErrorPage;