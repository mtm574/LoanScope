import express from "express";
import cors from "cors";
import {calculateLoan} from "../src/loanCalculator.js";

const app = express();
app.use(cors());
const PORT = 3001;

app.use(express.json());

app.get("/", (req,res) => {
    res.json({
        message: "works"
    });
});

app.post("/api/calculate", (req,res) => {
    const {principal, apr, monthlyPayment } = req.body;

    if(
        !Number.isFinite(Number(principal))||
        !Number.isFinite(Number(apr))||
        !Number.isFinite(Number(monthlyPayment))
    ){
        return res.status(400).json({
            error: "Principal, apr, and/or monthly payment must be valid numbers >:("
        });
    }

    if (principal < 1 ||
    principal > 100000000 || 
    apr < 0 ||
    apr > 40 ||
    monthlyPayment <= 0
    ){
        return res.status(400).json({
            error: "Those values are out of range >_>"
        });
    }

    const result = calculateLoan(
        Number(principal),
        Number(apr),
        Number(monthlyPayment)
    );

    if (result.error){
        return res.status(400).json({
            error: result.error
        });
    }

    res.json(result);
});


app.listen(PORT, () => {
    console.log(`LoanScope is running on http://localhost:${PORT}`);
});