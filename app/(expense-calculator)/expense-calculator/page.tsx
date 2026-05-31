"use client";

import React, { useState } from 'react';

const ExpenseCalculator: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [currentExpensesVisible, setCurrentExpensesVisible] = useState<boolean>(false);
  const [newPackageVisible, setNewPackageVisible] = useState<boolean>(false);
  const [comparisonVisible, setComparisonVisible] = useState<boolean>(false);
  const [currentPPC, setCurrentPPC] = useState<number>(0);
  const [currentSEO, setCurrentSEO] = useState<number>(375);
  const [currentDispatch, setCurrentDispatch] = useState<number>(300);
  const [currentWebsite, setCurrentWebsite] = useState<number>(350);
  const [currentTechFee, setCurrentTechFee] = useState<number>(0);
  const [newPPC, setNewPPC] = useState<number>(1500);
  const [newSEO, setNewSEO] = useState<number>(2080);
  const [revscaleSales, setRevscaleSales] = useState<string>('no');
  const [newTotal, setNewTotal] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);

  const handleEmailSubmit = () => {
    if (userEmail) {
      setCurrentExpensesVisible(true);
    } else {
      alert('Please enter a valid email address.');
    }
  };

  const handleCalculateCurrent = () => {
    const total =
      currentPPC + currentSEO + currentDispatch + currentWebsite + currentTechFee;
    setCurrentTotal(total);
    setNewPackageVisible(true);
  };

  const handleCalculateNew = () => {
    const softwarePlatformFee = 500;
    let total = newPPC + newSEO + softwarePlatformFee;
    setNewTotal(total);

    let difference = total - currentTotal;
    if (revscaleSales === 'yes') {
      difference -= 750;
    }
    setDifference(difference);

    setComparisonVisible(true);
  };

  const handleSendEmail = () => {
    const data = {
      email: userEmail,
      currentPPC,
      currentSEO,
      currentDispatch,
      currentWebsite,
      currentTechFee,
      newPPC,
      newSEO,
      softwarePlatformFee: 500,
      revscaleSales,
      currentTotal,
      newTotal,
      budgetAdjustment: difference,
    };

    console.log("Data being sent to webhook:", JSON.stringify(data));

    fetch(`${process.env.NEXT_PUBLIC_BE_URL}api/expenseCalc/expenseCalc/`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(`Network response was not ok: ${response.statusText}, Response: ${text}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log('Data sent successfully:', data);
          alert("Data sent successfully. Please check your email for the breakdown.");
        })
        .catch((error) => {
          console.error('Error sending data:', error);
          alert("There was an error sending the data. Please try again.");
        });
  };

  const formatNumber = (num: number) => {
    return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  return (
    <div className="calculator-container">
      <div className="calculator">
        <h1>Bloomin&apos; Blinds Expense Calculator</h1>

        {/* Email Section */}
        <div id="email-section" style={{ display: currentExpensesVisible ? 'none' : 'block' }}>
          <h2>Enter Your Email</h2>
          <div className="input-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <button onClick={handleEmailSubmit}>Submit</button>
        </div>

        {/* Current Expenses Section */}
        <div id="current-expenses" style={{ display: currentExpensesVisible ? 'block' : 'none' }}>
          <h2>Current Expenses</h2>
          <div className="input-group">
            <label htmlFor="current-ppc">Current PPC Spend ($):</label>
            <input
              type="number"
              id="current-ppc"
              min="0"
              step="100"
              value={currentPPC}
              onChange={(e) => setCurrentPPC(parseFloat(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label htmlFor="current-seo">Current SEO Package:</label>
            <select
              id="current-seo"
              value={currentSEO}
              onChange={(e) => setCurrentSEO(parseFloat(e.target.value))}
            >
              <option value="375">Tier 1 ($375)</option>
              <option value="699">Tier 2 ($699)</option>
              <option value="1100">Tier 3 ($1100)</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="current-dispatch">Dispatch &amp; Solatech:</label>
            <select
              id="current-dispatch"
              value={currentDispatch}
              onChange={(e) => setCurrentDispatch(parseFloat(e.target.value))}
            >
              <option value="300">$300</option>
              <option value="400">$400</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="current-website">Website Maintenance:</label>
            <select
              id="current-website"
              value={currentWebsite}
              onChange={(e) => setCurrentWebsite(parseFloat(e.target.value))}
            >
              <option value="350">$350</option>
              <option value="400">$400</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="current-tech-fee">Paying Tech Fee?</label>
            <select
              id="current-tech-fee"
              value={currentTechFee}
              onChange={(e) => setCurrentTechFee(parseFloat(e.target.value))}
            >
              <option value="0">No</option>
              <option value="250">Yes ($250)</option>
            </select>
          </div>
          <button onClick={handleCalculateCurrent}>Calculate Current Expenses</button>
          <div id="current-result" className="result">
            <h3>
              Total Current Monthly Expenses: $<span id="current-total">{formatNumber(currentTotal)}</span>
            </h3>
          </div>
        </div>

        {/* New Package Section */}
        <div id="new-package" style={{ display: newPackageVisible ? 'block' : 'none' }}>
          <h2>New Package Options</h2>
          <div className="input-group">
            <label htmlFor="new-ppc">New PPC Budget ($):</label>
            <input
              type="number"
              id="new-ppc"
              min="0"
              step="100"
              value={newPPC}
              onChange={(e) => setNewPPC(parseFloat(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label htmlFor="new-seo">SEO Package:</label>
            <select
              id="new-seo"
              value={newSEO}
              onChange={(e) => setNewSEO(parseFloat(e.target.value))}
            >
              <option value="2080">Bronze SEO ($2,080)</option>
              <option value="2680">Silver SEO ($2,680)</option>
              <option value="3105">Gold SEO ($3,105)</option>
              <option value="3480">Diamond SEO ($3,480)</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="revscale-sales">Already on Revscale Sales?</label>
            <select
              id="revscale-sales"
              value={revscaleSales}
              onChange={(e) => setRevscaleSales(e.target.value)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div className="input-group">
            <label>Software Platform Fee:</label>
            <span>$500</span>
          </div>
          <button onClick={handleCalculateNew}>Calculate New Package</button>
          <div id="new-result" className="result">
            <h3>
              Total New Monthly Cost: $<span id="new-total">{formatNumber(newTotal)}</span>
            </h3>
          </div>
        </div>

        {/* Comparison Section */}
        <div id="comparison" style={{ display: comparisonVisible ? 'block' : 'none' }}>
          <h2>Expense Comparison</h2>
          <p>
            Current Monthly Expenses: $<span id="comparison-current">{formatNumber(currentTotal)}</span>
          </p>
          <p>
            New Package Monthly Cost: $<span id="comparison-new">{formatNumber(newTotal)}</span>
          </p>
          <p>
            Budget Adjustment: $<span id="comparison-difference">{formatNumber(difference)}</span>
          </p>
          <h3>One-Time Fees</h3>
          <p>Set Up Fee: $300 (Localized Video)</p>
          <div id="email-message">
            <p>Please check your email for a detailed breakdown of the calculations.</p>
          </div>
          <button onClick={handleSendEmail}>Send via Email</button>
          <button onClick={() => window.location.reload()}>Restart Calculator</button>
        </div>

      <style jsx>{`
        .calculator-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #a9a9a9; /* Darker background color */
          padding: 20px;
        }

        .calculator {
          background-color: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }

        h1,
        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-size: 1.5rem;
        }

        h2 {
          font-size: 1.3rem;
        }

        .input-group {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          align-items: center;
        }

        label {
          font-weight: bold;
        }

        input,
        select {
          width: 150px;
          padding: 0.5rem;
          border: 1px solid #ccc; /* Ensures border is always visible */
        }

        button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          background-color: #c63d7f;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
        }

        button:hover {
          background-color: #a32e66;
        }

        .result {
          margin-top: 1.5rem;
          text-align: center;
        }

        #new-package,
        #comparison {
          margin-top: 2rem;
          border-top: 1px solid #ccc;
          padding-top: 1rem;
        }

        #email-message {
          margin-top: 1rem;
          font-weight: bold;
          color: #c63d7f;
        }

        #restart {
          background-color: #c63d7f;
        }

        #restart:hover {
          background-color: #a32e66;
        }

        #current-total,
        #new-total,
        #comparison-current,
        #comparison-new,
        #comparison-difference {
          color: #c63d7f;
          font-weight: bold;
        }
      `}</style>
    </div>
    </div>
  );
};

export default ExpenseCalculator;
