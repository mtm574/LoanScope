//Calculates th eamortization scedule using int cents
export function calculateLoan(principal, apr, monthlyPayment){
    
    if (principal < 1 || principal > 100000000){
        return{
            error: "Loan principal must be between 1$ and 100,000,000$."
        };
    }

    if(apr <0||apr>40){
        return{
        error: "Annual Interest rate must be between 0% and 40%."
        };
    }
    
    //converts values to cents
    const principalCents = Math.round(principal * 100);
    const paymentCents = Math.round(monthlyPayment * 100);
    const aprBasisPoints = Math.round (apr * 100);
    
    const monthlyInterestCents = Math.round(
        (principalCents * aprBasisPoints) / 1200000
    );

    if (paymentCents <= monthlyInterestCents){
        return{
            error:"Monthly payment must be greater than monthly interest, or else your loan may never be paid off <_<."
        };
    }

    let balanceCents = principalCents;
    let month = 0;
    let totalInterestCents =0;
    let totalPrincipalCents= 0;

    const schedule = [];

    //Stops calculation after the 1200-month max
    while(balanceCents > 0 && month < 1200){
        month++

        //finds the monthly interest on current balance
        const interestCents = Math.round(
            (balanceCents * aprBasisPoints) / 1200000
        );
        //applies the payment ot the principal after interest is calculated
        let principalPaidCents = paymentCents - interestCents;

        if (principalPaidCents > balanceCents){
        principalPaidCents = balanceCents;
        }

        if (principalPaidCents <= 0){
            return{
                error: "Monthly payment is not enough to cover the monthly interest."
            }
        }

        balanceCents -= principalPaidCents;
        totalInterestCents += interestCents;
        totalPrincipalCents += principalPaidCents;

        schedule.push({
            paymentNumber: month,
            paymentAmount: (principalPaidCents + interestCents) /100,
            principal: principalPaidCents /100,
            interest: interestCents/100,
            remainingBalance: Math.max(balanceCents,0)/100,
        });
    }

    if (balanceCents > 0){
        return{
            error:"Loan does not pay off within 1200 months."
        };
    }

    return{
        months:month,
        totalInterest:totalInterestCents/100,
        totalPrincipal:totalPrincipalCents/100,
        schedule: schedule,
        payoffDate: new Date(
            new Date().setMonth(new Date().getMonth() + month)
        ),
    };
}