import { useState, useEffect } from 'react'
import './App.css'
import{
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
} from "recharts";

function App() {

  //formats the currency to the users browser locale
const formatCurrency = (amount) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);

    //Creates and allows the user to download the CSV
function exportCSV(schedule){
  const headers = [
    "Payment Number",
    "Payment Amount",
    "Principal",
    "Interest",
    "Remaining Balance",
  ];

  const rows = schedule.map((payment) => [
    payment.paymentNumber,
    payment.paymentAmount,
    payment.principal.toFixed(2),
    payment.interest.toFixed(2),
    payment.remainingBalance.toFixed(2),
  ]);

  const csvContent = [
    headers,
   ...rows,
  ]
    .map((row) => row.join (","))
    .join("\n");

    const blob = new Blob([csvContent], {type: "text/csv"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href= url;
    link.download = "loanscope-amortization.csv";
    link.click()

    URL.revokeObjectURL(url);
}

// Loads the values that are in to the current loan scenario, copies to da clipboard
function shareScenario(principal, apr, monthlyPayment){
  const params = new URLSearchParams({
    principal: principal,
    apr: apr,
    payment: monthlyPayment,
  });

  const shareURL = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(shareURL);
  alert("link copied");
}

//loads the values when a shared scenario is opened (related to function above)
const params = new URLSearchParams(window.location.search);

const urlPrincipal = Number(params.get("principal"));
const urlApr =  Number(params.get("apr"));
const urlMonthlyPayment = Number(params.get("payment"));

const [principal,setPrincipal] = useState(
    Number.isFinite(urlPrincipal) && urlPrincipal >= 1 && urlPrincipal <= 100000000
    ? urlPrincipal: 0
);
const [apr, setApr] = useState(
    Number.isFinite(urlApr) && urlApr >= 0 && urlApr <= 40
    ? urlApr: 0
);
const [monthlyPayment, setMonthlyPayment] = useState(
    Number.isFinite(urlMonthlyPayment) && urlMonthlyPayment > 0
    ? urlMonthlyPayment: 0
);


const [selectedYear, setselectedYear] = useState("all");

const[loan, setLoan] = useState({
  months: 0,
  totalInterest: 0,
  totalPrincipal: 0,
  schedule: [],
  payoffDate:null,
});


const [calculatedPrincipal, setCalculatedPrincipal] = useState(0);
const [calculatedApr, setCalculatedApr] = useState(0);
const [calculatedPayment, setCalculatedPayment] = useState(0);

//Recalculates loan after the 300ms delay
useEffect(() => {
  const timer = setTimeout(async () => {

    if (principal === "" || apr === "" || monthlyPayment === "") {
      return;
    }

    const principalNumber = Number(principal);
    const aprNumber = Number(apr);
    const monthlyPaymentNumber = Number(monthlyPayment);

    if (
      !Number.isFinite(principalNumber) ||
      !Number.isFinite(aprNumber) ||
      !Number.isFinite(monthlyPaymentNumber)
    ) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          principal: principalNumber,
          apr: aprNumber,
          monthlyPayment: monthlyPaymentNumber,
        }),
      });

      const data = await response.json();

      setLoan(data);

    } catch (error) {
      console.error(error);

      setLoan({
        error: "Could not connect to backend"
      });
    }

  }, 300);

  return () => clearTimeout(timer);
}, [principal, apr, monthlyPayment]);

//find mini monthly payment to cover first months interest
const monthlyInterest =
  principal === "" || apr ===""
  ? 0
  :Number(principal) * (Number(apr) /100)/12;

  const minimumPayment = Math.ceil(monthlyInterest * 100)/100;
  const monthlyPaymentMax=Math.max(
  1000000,
  minimumPayment*3);

  //determines how the schedule rows should be displayed
const filteredSchedule =
  selectedYear ==="all"
  ? loan.schedule
  : loan.schedule.filter((payment) => {
    const paymentDate = new Date(
      new Date().setMonth(new Date().getMonth() + payment.paymentNumber)
    );
    return paymentDate.getFullYear() === Number(selectedYear);
  });

  //UI 
return(
<div>
  <h1>LoanScope Assignment</h1>
  <p>
    DISCLAIMER: THIS IS MERLY AN ESTIMATE, it is NOT meant to be used for literal financial advice!
  </p>
  <p>10/1/2026</p>

  <div>
    <label>Loan Principal</label>
    <input 
      type="number"
      value={principal}
      onChange={(event) => setPrincipal(event.target.value)}
      />
     
    <input
      type="range"
      min="1"
      max="100000000"
      value={principal}
      onChange={(event) => {
        if(event.target.value!=="") {
          setPrincipal(event.target.value);
        }}
      }
    />

  </div>

  <div>
    <label>Annual Interest Rate (APR)</label>
    <input
     type="number"
    step = "0.01"
     value={apr}
     onChange={(event) => setApr(event.target.value)}
     />

    <input
      type="range"
      min="0"
      max="40"
      value={apr}
      onChange={(event) => {
        if(event.target.value!=="") {
          setApr(event.target.value);
        }}
      }
    />
     
  </div>

  <div>
    <label>Monthly Payment</label>
    <input
     type= "number"
     value={monthlyPayment}
     onChange={(event) => setMonthlyPayment(event.target.value)}
     />

      <input
      type="range"
      min="1"
      max={monthlyPaymentMax}
      step = "1"
      value={monthlyPayment}
      onChange={(event) => {
        if(event.target.value!=="") {
          setMonthlyPayment(event.target.value);
        }}
      }
    />
    
    {loan.error ? (
      <p>{loan.error}</p>
    ) : (
        <div>
          <p>
            Loan Term: {Math.floor(loan.months/12)}, {loan.months% 12 } months
          </p>

          <p>
            Total Interest: {formatCurrency(loan.totalInterest)}
          </p>

          <p>
            Payoff Date: {new Date(loan.payoffDate).toLocaleDateString()}
          </p>

          <p>
            Total Principal: {formatCurrency(loan.totalPrincipal)}
          </p>

          <p>
            Final Balance $
            {loan.schedule.length > 0
            ? loan.schedule[loan.schedule.length-1].remainingBalance.toFixed(2)
          : "0.00"}
          </p>

      <button onClick = {() => exportCSV(loan.schedule)}>
        Export CSV
      </button>

      <button onClick = {() => shareScenario(principal,apr,monthlyPayment)}>
        Share Scenario
      </button>

              <select
              value = {selectedYear}
              onChange = {(event) => setselectedYear(event.target.value)}
              >
                <option value = "all" >All Years</option>
                {Array.from(new Set(
                  loan.schedule.map((payment) => {
                    const paymentDate = new Date(
                      new Date().setMonth(new Date().getMonth() + payment.paymentNumber)
                    );
                    return paymentDate.getFullYear();
                  })
                )
                ).map((year) => (
                  <option key = {year} value={year}>
                    {year}
                  </option>
                ))}
              </select>


        <h2>Amortization Schedule</h2>
          <table>
            <thead>
              <tr>
              <th>Payment #</th>
              <th>Payment</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Remaining Balance</th>
              </tr>
            </thead>

            <tbody>
              {filteredSchedule.map((payment) => (
                <tr key = {payment.paymentNumber}>
                  <td>{payment.paymentNumber}</td>
                  <td>{formatCurrency(payment.paymentAmount)}</td>
                  <td>{formatCurrency(payment.principal)}</td>
                  <td>{formatCurrency(payment.interest)}</td>
                  <td>{formatCurrency(payment.remainingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Remaining Balance Over Time</h2>
              <LineChart
                width={800}
                height={400}
                data={loan.schedule}
              >
                <CartesianGrid strokeDasharray = "3 3"/>
                <XAxis
                  dataKey="paymentNumber"
                  label={{ value: "Month", position: "insideBottom", offset:-5}}
                />

                <YAxis/>
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="remainingBalance"
                  stroke="#000000"
                  />
              </LineChart>


        </div>
    )}

  </div>
</div>
);
}

export default App
