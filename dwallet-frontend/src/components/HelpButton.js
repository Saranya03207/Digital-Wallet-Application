import { Navigate, useNavigate } from "react-router-dom";

function HelpButton(){
    const navigate=useNavigate();
    return(
         <button
      onClick={() => navigate("/help")}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "65px",
        height: "65px",
        borderRadius: "50%",
        border: "none",
        background:
          "linear-gradient(135deg,#2563eb,#7c3aed)",
        color: "white",
        fontSize: "28px",
        cursor: "pointer",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.25)",
        zIndex: 999
      }}
    >
      💬
    </button>
    );
}
export default HelpButton;