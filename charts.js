// Initialize and manage all charts
let expenseChart, trendChart, incomeExpenseChart, savingsChart;

function initializeCharts() {
  initializeExpenseChart();
  initializeTrendChart();
  initializeIncomeExpenseChart();
  initializeSavingsChart();
}

function updateReportCharts() {
  updateIncomeExpenseChart();
  updateSavingsChart();
}

function initializeExpenseChart() {
  const ctx = document.getElementById('expense-chart').getContext('2d');
  
  // Get expense categories and amounts
  const expenseData = getCategoryAmounts('expense');
  
  // Create chart
  if (expenseChart) {
    expenseChart.destroy();
  }
  
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: expenseData.map(item => item.name),
      datasets: [{
        data: expenseData.map(item => item.amount),
        backgroundColor: expenseData.map(item => item.color),
        borderWidth: 1,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

function initializeTrendChart() {
  const ctx = document.getElementById('trend-chart').getContext('2d');
  
  // Get monthly income and expense data
  const monthlyData = getMonthlyData();
  
  // Create chart
  if (trendChart) {
    trendChart.destroy();
  }
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyData.labels,
      datasets: [
        {
          label: 'Income',
          data: monthlyData.income,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Expenses',
          data: monthlyData.expenses,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function initializeIncomeExpenseChart() {
  const ctx = document.getElementById('income-expense-chart').getContext('2d');
  
  // Get period data
  const period = document.getElementById('report-period').value;
  const periodData = getPeriodData(period);
  
  // Create chart
  if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
  }
  
  incomeExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: periodData.labels,
      datasets: [
        {
          label: 'Income',
          data: periodData.income,
          backgroundColor: '#10B981'
        },
        {
          label: 'Expenses',
          data: periodData.expenses,
          backgroundColor: '#EF4444'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function initializeSavingsChart() {
  const ctx = document.getElementById('savings-chart').getContext('2d');
  
  // Get period data
  const period = document.getElementById('report-period').value;
  const savingsData = getSavingsData(period);
  
  // Create chart
  if (savingsChart) {
    savingsChart.destroy();
  }
  
  savingsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: savingsData.labels,
      datasets: [
        {
          label: 'Savings',
          data: savingsData.savings,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Savings Rate (%)',
          data: savingsData.rates,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataset.yAxisID === 'y1') {
                return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
              }
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

function updateIncomeExpenseChart() {
  if (!incomeExpenseChart) return;
  
  const period = document.getElementById('report-period').value;
  const periodData = getPeriodData(period);
  
  incomeExpenseChart.data.labels = periodData.labels;
  incomeExpenseChart.data.datasets[0].data = periodData.income;
  incomeExpenseChart.data.datasets[1].data = periodData.expenses;
  
  incomeExpenseChart.update();
}

function updateSavingsChart() {
  if (!savingsChart) return;
  
  const period = document.getElementById('report-period').value;
  const savingsData = getSavingsData(period);
  
  savingsChart.data.labels = savingsData.labels;
  savingsChart.data.datasets[0].data = savingsData.savings;
  savingsChart.data.datasets[1].data = savingsData.rates;
  
  savingsChart.update();
}

// Helper functions for chart data
function getCategoryAmounts(type) {
  // Get the current month's data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Filter transactions
  const filteredTransactions = appData.transactions.filter(t => {
    const date = new Date(t.date);
    return t.type === type && 
           date.getMonth() === currentMonth && 
           date.getFullYear() === currentYear;
  });
  
  // Group by category
  const categoryAmounts = {};
  
  filteredTransactions.forEach(t => {
    if (!categoryAmounts[t.category]) {
      categoryAmounts[t.category] = 0;
    }
    categoryAmounts[t.category] += t.amount;
  });
  
  // Format data for chart
  const result = [];
  
  for (const [categoryId, amount] of Object.entries(categoryAmounts)) {
    const category = getCategoryById(categoryId);
    if (category) {
      result.push({
        id: categoryId,
        name: category.name,
        amount: amount,
        color: category.color
      });
    }
  }
  
  // Sort by amount (descending)
  result.sort((a, b) => b.amount - a.amount);
  
  return result;
}

function getMonthlyData() {
  // Get last 6 months
  const months = [];
  const incomeData = [];
  const expenseData = [];
  
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    months.push(monthName);
    
    const monthNumber = month.getMonth();
    const yearNumber = month.getFullYear();
    
    // Calculate income and expenses for this month
    let income = 0;
    let expenses = 0;
    
    appData.transactions.forEach(t => {
      const date = new Date(t.date);
      
      if (date.getMonth() === monthNumber && date.getFullYear() === yearNumber) {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += t.amount;
        }
      }
    });
    
    incomeData.push(income);
    expenseData.push(expenses);
  }
  
  return {
    labels: months,
    income: incomeData,
    expenses: expenseData
  };
}

function getPeriodData(period) {
  const now = new Date();
  let labels = [];
  let incomeData = [];
  let expenseData = [];
  
  if (period === 'month') {
    // Get data for each day in the current month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // Create labels for each day
    for (let i = 1; i <= daysInMonth; i++) {
      labels.push(i);
    }
    
    // Initialize data arrays
    incomeData = Array(daysInMonth).fill(0);
    expenseData = Array(daysInMonth).fill(0);
    
    // Populate data
    appData.transactions.forEach(t => {
      const date = new Date(t.date);
      
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        const day = date.getDate() - 1; // 0-based index
        
        if (t.type === 'income') {
          incomeData[day] += t.amount;
        } else {
          expenseData[day] += t.amount;
        }
      }
    });
  } else if (period === 'quarter') {
    // Get current quarter
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startMonth = currentQuarter * 3;
    
    // Create labels for each month in the quarter
    for (let i = 0; i < 3; i++) {
      const month = new Date(now.getFullYear(), startMonth + i, 1);
      labels.push(month.toLocaleString('default', { month: 'short' }));
    }
    
    // Initialize data arrays
    incomeData = Array(3).fill(0);
    expenseData = Array(3).fill(0);
    
    // Populate data
    appData.transactions.forEach(t => {
      const date = new Date(t.date);
      
      if (date.getFullYear() === now.getFullYear()) {
        const month = date.getMonth();
        
        if (month >= startMonth && month < startMonth + 3) {
          const quarterIndex = month - startMonth;
          
          if (t.type === 'income') {
            incomeData[quarterIndex] += t.amount;
          } else {
            expenseData[quarterIndex] += t.amount;
          }
        }
      }
    });
  } else if (period === 'year') {
    // Create labels for each month in the year
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), i, 1);
      labels.push(month.toLocaleString('default', { month: 'short' }));
    }
    
    // Initialize data arrays
    incomeData = Array(12).fill(0);
    expenseData = Array(12).fill(0);
    
    // Populate data
    appData.transactions.forEach(t => {
      const date = new Date(t.date);
      
      if (date.getFullYear() === now.getFullYear()) {
        const month = date.getMonth();
        
        if (t.type === 'income') {
          incomeData[month] += t.amount;
        } else {
          expenseData[month] += t.amount;
        }
      }
    });
  }
  
  return {
    labels: labels,
    income: incomeData,
    expenses: expenseData
  };
}

function getSavingsData(period) {
  const now = new Date();
  let labels = [];
  let savingsData = [];
  let ratesData = [];
  
  if (period === 'month') {
    // Get data for each week in the current month
    // Use a simplified approach with 4 weeks
    labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    
    // Initialize data arrays
    savingsData = Array(4).fill(0);
    ratesData = Array(4).fill(0);
    
    // Get the first day of the month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Populate data
    appData.transactions.forEach(t => {
      const date = new Date(t.date);
      
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        // Calculate week number (0-3)
        const dayOfMonth = date.getDate();
        const weekNum = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
        
        if (t.type === 'income') {
          savingsData[weekNum] += t.amount;
        } else {
          savingsData[weekNum] -= t.amount;
        }
      }
    });
    
    // Calculate rates
    for (let i = 0; i < 4; i++) {
      let income = 0;
      let expenses = 0;
      
      appData.transactions.forEach(t => {
        const date = new Date(t.date);
        
        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
          const dayOfMonth = date.getDate();
          const weekNum = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
          
          if (weekNum === i) {
            if (t.type === 'income') {
              income += t.amount;
            } else {
              expenses += t.amount;
            }
          }
        }
      });
      
      ratesData[i] = income > 0 ? (income - expenses) / income * 100 : 0;
    }
  } else if (period === 'quarter') {
    // Get current quarter
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startMonth = currentQuarter * 3;
    
    // Create labels for each month in the quarter
    for (let i = 0; i < 3; i++) {
      const month = new Date(now.getFullYear(), startMonth + i, 1);
      labels.push(month.toLocaleString('default', { month: 'short' }));
    }
    
    // Initialize data arrays
    savingsData = Array(3).fill(0);
    ratesData = Array(3).fill(0);
    
    // Calculate total savings for each month
    for (let i = 0; i < 3; i++) {
      const monthIndex = startMonth + i;
      let income = 0;
      let expenses = 0;
      
      appData.transactions.forEach(t => {
        const date = new Date(t.date);
        
        if (date.getMonth() === monthIndex && date.getFullYear() === now.getFullYear()) {
          if (t.type === 'income') {
            income += t.amount;
          } else {
            expenses += t.amount;
          }
        }
      });
      
      savingsData[i] = income - expenses;
      ratesData[i] = income > 0 ? (income - expenses) / income * 100 : 0;
    }
  } else if (period === 'year') {
    // Create labels for each quarter in the year
    labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    // Initialize data arrays
    savingsData = Array(4).fill(0);
    ratesData = Array(4).fill(0);
    
    // Calculate total savings for each quarter
    for (let i = 0; i < 4; i++) {
      const startMonth = i * 3;
      const endMonth = startMonth + 2;
      let income = 0;
      let expenses = 0;
      
      appData.transactions.forEach(t => {
        const date = new Date(t.date);
        
        if (date.getFullYear() === now.getFullYear() && date.getMonth() >= startMonth && date.getMonth() <= endMonth) {
          if (t.type === 'income') {
            income += t.amount;
          } else {
            expenses += t.amount;
          }
        }
      });
      
      savingsData[i] = income - expenses;
      ratesData[i] = income > 0 ? (income - expenses) / income * 100 : 0;
    }
  }
  
  return {
    labels: labels,
    savings: savingsData,
    rates: ratesData
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
