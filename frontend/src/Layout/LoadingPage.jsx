import wlfLogo from "./Wiki_Loves_Folklore_Logo.svg.png"
export default function LoadingPage() {
    return <image 
        src={wlfLogo}
        alt="Wiki Loves Folklore Logo"
        style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        }}
    />
}