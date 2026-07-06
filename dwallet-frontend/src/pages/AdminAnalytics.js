import { useEffect, useState } from "react";

import API from "../services/api";

import AdminLayout from "../components/AdminLayout";

import {
    Pie,Bar
} from "react-chartjs-2";


    import {
Chart,
ArcElement,
Tooltip,
Legend,
CategoryScale,
LinearScale,
BarElement
}from "chart.js";

Chart.register(

ArcElement,
Tooltip,
Legend,

CategoryScale,
LinearScale,
BarElement

);

function AdminAnalytics(){

    const [stats,setStats]=
    useState({});

    const [daily,
setDaily]=useState({});

    useEffect(()=>{

        loadAnalytics();

    },[]);

    async function loadAnalytics(){

        try{

            const response =
            await API.get(
                "/admin/analytics/type"
            );

            setStats(response.data);

            const dailyResponse =
                await API.get(
                "/admin/analytics/daily"
                );

                setDaily(
                dailyResponse.data
                );
        }

        catch(error){

            console.log(error);

        }

    }

    const pieData={

        labels:[
            "Transfer",
            "Add Money",
            "Withdraw"
        ],

        datasets:[{

            data:[

                stats.TRANSFER || 0,
                stats.ADD_MONEY || 0,
                stats.WITHDRAW || 0

            ],

            backgroundColor:[

                "#4f46e5",
                "#10b981",
                "#ef4444"

            ]

        }]

    };

    const barData={

labels:Object.keys(daily),

datasets:[{

label:"Transactions",

data:Object.values(daily),

backgroundColor:"#4f46e5"

}]

};

    return(

<AdminLayout>

<h1
style={{
color:"#312e81",
marginBottom:"40px"
}}
>
📊 Wallet Analytics
</h1>

<div
style={{
display:"grid",
gridTemplateColumns:"2fr 1fr",
gap:"30px"
}}
>

<div
style={{
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:
"0 10px 25px rgba(0,0,0,.08)"
}}
>

<h2
style={{
marginBottom:"20px"
}}
>
Transaction Distribution
</h2>

<Pie data={pieData}/>

</div>

<div
style={{
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:
"0 10px 25px rgba(0,0,0,.08)"
}}
>

<h2>
Summary
</h2>

<hr/>

<h3>
Transfers
</h3>

<h1
style={{
color:"#4f46e5"
}}
>
{stats.TRANSFER}
</h1>

<h3>
Add Money
</h3>

<h1
style={{
color:"#10b981"
}}
>
{stats.ADD_MONEY}
</h1>

<h3>
Withdraw
</h3>

<h1
style={{
color:"#ef4444"
}}
>
{stats.WITHDRAW}
</h1>

</div>
<div
style={{
marginTop:"40px",
background:"white",
padding:"30px",
borderRadius:"20px",
boxShadow:
"0 10px 25px rgba(0,0,0,.08)"
}}
>

<h2
style={{
marginBottom:"20px"
}}
>
Daily Transactions
</h2>

<Bar
data={barData}
/>

</div>

</div>

</AdminLayout>

);

}

export default AdminAnalytics;