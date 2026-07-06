import { Link } from "react-router-dom";

function AdminLayout({ children }) {

    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f5f7fb"
            }}
        >

            {/* Sidebar */}

            <div
                style={{
                    width: "250px",
                    background: "#312e81",
                    color: "white",
                    padding: "30px"
                }}
            >

                <h2
                    style={{
                        marginBottom: "40px"
                    }}
                >
                    WalletPay
                </h2>

                <MenuItem
                    to="/admin"
                    title="Dashboard"
                />

                <MenuItem
                    to="/admin/users"
                    title="Users"
                />

                <MenuItem
                    to="/admin/transactions"
                    title="Transactions"
                />

                <MenuItem
                    to="/admin/analytics"
                    title="Analytics"
                />

            </div>

            {/* Main */}

            <div
                style={{
                    flex: 1,
                    padding: "40px"
                }}
            >
                {children}
            </div>

        </div>

    );

}

function MenuItem({ to, title }) {

    return (

        <div
            style={{
                marginBottom: "20px"
            }}
        >

            <Link

                to={to}

                style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "18px"
                }}

            >
                {title}
            </Link>

        </div>

    );

}

export default AdminLayout;