import { Link, useLocation, useNavigate } from "react-router-dom";

function AdminLayout({ children }) {

    const location = useLocation();

    const navigate = useNavigate();

    function logout() {

        localStorage.clear();

        navigate("/login");

    }

    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8fafc"
            }}
        >

            {/* SIDEBAR */}

            <div
                style={{
                    width: "270px",
                    background: "linear-gradient(180deg,#312e81,#4338ca)",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "30px 20px",
                    boxShadow: "4px 0 15px rgba(0,0,0,.08)"
                }}
            >

                <div>

                    <h2
                        style={{
                            textAlign: "center",
                            marginBottom: "45px",
                            letterSpacing: "1px"
                        }}
                    >
                        💳 WalletPay
                    </h2>

                    <MenuItem
                        icon="🏠"
                        title="Dashboard"
                        to="/admin"
                        active={
                            location.pathname === "/admin"
                        }
                    />

                    <MenuItem
                        icon="👥"
                        title="Users"
                        to="/admin/users"
                        active={
                            location.pathname === "/admin/users"
                        }
                    />

                    <MenuItem
                        icon="💳"
                        title="Transactions"
                        to="/admin/transactions"
                        active={
                            location.pathname === "/admin/transactions"
                        }
                    />

                    <MenuItem
                        icon="📊"
                        title="Analytics"
                        to="/admin/analytics"
                        active={
                            location.pathname === "/admin/analytics"
                        }
                    />

                    <MenuItem
                        icon="🤖"
                        title="AI Monitor"
                        to="/admin/fraud"
                        active={
                            location.pathname === "/admin/fraud"
                        }
                    />

                    <MenuItem
                        icon="⚙"
                        title="Settings"
                        to="/admin/settings"
                        active={
                            location.pathname === "/admin/settings"
                        }
                    />

                </div>

                <button

                    onClick={logout}

                    style={{

                        background: "#ef4444",

                        color: "white",

                        border: "none",

                        padding: "14px",

                        borderRadius: "12px",

                        cursor: "pointer",

                        fontWeight: "bold",

                        fontSize: "15px"

                    }}

                >

                    🚪 Logout

                </button>

            </div>

            {/* MAIN */}

            <div
                style={{
                    flex: 1,
                    padding: "35px",
                    overflowY: "auto"
                }}
            >

                {children}

            </div>

        </div>

    );

}

function MenuItem({

    icon,

    title,

    to,

    active

}) {

    return (

        <Link

            to={to}

            style={{

                display: "flex",

                alignItems: "center",

                gap: "15px",

                textDecoration: "none",

                color: "white",

                padding: "15px",

                borderRadius: "14px",

                marginBottom: "12px",

                background:

                    active

                        ? "rgba(255,255,255,.15)"

                        : "transparent",

                transition: ".3s"

            }}

        >

            <span
                style={{
                    fontSize: "22px"
                }}
            >
                {icon}
            </span>

            <span
                style={{
                    fontSize: "16px",
                    fontWeight: "600"
                }}
            >
                {title}
            </span>

        </Link>

    );

}

export default AdminLayout;