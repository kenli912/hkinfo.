document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Current view state
  let currentSection = 'dashboard';
  let currentPage = 1;
  const itemsPerPage = 10;
  
  // DOM elements
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userMenu = document.getElementById('user-menu');
  const addTransactionBtn = document.getElementById('add-transaction-btn');
  const addTransactionModal = document.getElementById('add-transaction-modal');
  const closeTransactionModal = document.getElementById('close-transaction-modal');
  const cancelTransaction = document.getElementById('cancel-transaction');
  const transactionForm = document.getElementById('transaction-form');
  const navigationLinks = document.querySelectorAll('[data-section]');
  const sections = {
    dashboard: document.getElementById('dashboard-section'),
    transactions: document.getElementById('transactions-section'),
    categories: document.getElementById('categories-section'),
    budgets: document.getElementById('budgets-section'),
    reports: document.getElementById('reports-section')
  };
  
  // Category management
  const addCategoryBtn = document.getElementById('add-category-btn');
  const addCategoryModal = document.getElementById('add-category-modal');
  const closeCategoryModal = document.getElementById('close-category-modal');
  const cancelCategory = document.getElementById('cancel-category');
  const categoryForm = document.getElementById('category-form');
  
  // Budget management
  const addBudgetBtn = document.getElementById('add-budget-btn');
  const addBudgetModal = document.getElementById('add-budget-modal');
  const closeBudgetModal = document.getElementById('close-budget-modal');
  const cancelBudget = document.getElementById('cancel-budget');
  const budgetForm = document.getElementById('budget-form');
  
  // Import/Export
  const importDataBtn = document.getElementById('import-data');
  const exportDataBtn = document.getElementById('export-data');
  const importFileInput = document.getElementById('import-file-input');
  
  // Pagination
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  // User menu toggle
  userMenuBtn.addEventListener('click', () => {
    userMenu.classList.toggle('hidden');
  });
  
  // Close user menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.classList.add('hidden');
    }
  });
  
  // Show transaction modal
  addTransactionBtn.addEventListener('click', () => {
    populateCategoryDropdown();
    setTodayDate();
    addTransactionModal.classList.remove('hidden');
  });
  
  // Close transaction modal
  closeTransactionModal.addEventListener('click', () => {
    addTransactionModal.classList.add('hidden');
  });
  
  cancelTransaction.addEventListener('click', () => {
    addTransactionModal.classList.add('hidden');
  });
  
  // Show category modal
  addCategoryBtn.addEventListener('click', () => {
    addCategoryModal.classList.remove('hidden');
  });
  
  // Close category modal
  closeCategoryModal.addEventListener('click', () => {
    addCategoryModal.classList.add('hidden');
  });
  
  cancelCategory.addEventListener('click', () => {
    addCategoryModal.classList.add('hidden');
  });
  
  // Show budget modal
  addBudgetBtn.addEventListener('click', () => {
    populateBudgetCategoryDropdown();
    addBudgetModal.classList.remove('hidden');
  });
  
  // Close budget modal
  closeBudgetModal.addEventListener('click', () => {
    addBudgetModal.classList.add('hidden');
  });
  
  cancelBudget.addEventListener('click', () => {
    addBudgetModal.classList.add('hidden');
  });
  
  // Navigation between sections
  navigationLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      switchSection(section);
    });
  });
  
  // Switch section function
  function switchSection(section) {
    // Hide all sections
    Object.values(sections).forEach(sectionEl => {
      sectionEl.classList.add('hidden');
    });
    
    // Show selected section
    sections[section].classList.remove('hidden');
    
    // Update navigation highlighting
    navigationLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      if (linkSection === section) {
        link.classList.add('border-black', 'bg-gray-50', 'font-medium');
        link.classList.remove('border-transparent');
      } else {
        link.classList.remove('border-black', 'bg-gray-50', 'font-medium');
        link.classList.add('border-transparent');
      }
    });
    
    currentSection = section;
    
    // Load section specific data
    if (section === 'transactions') {
      loadTransactions();
    } else if (section === 'categories') {
      loadCategories();
    } else if (section === 'budgets') {
      loadBudgets();
    } else if (section === 'reports') {
      initializeReports();
    }
  }
  
  // Handle transaction form submission
  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(transactionForm);
    const transactionData = {
      id: generateId(),
      type: formData.get('type'),
      amount: parseFloat(formData.get('amount')),
      description: formData.get('description'),
      category: formData.get('category'),
      date: formData.get('date'),
      notes: formData.get('notes')
    };
    
    // Add transaction to data
    appData.transactions.unshift(transactionData);
    
    // Save to localStorage
    saveData();
    
    // Update UI
    updateDashboardSummary();
    loadRecentTransactions();
    
    // Close modal
    addTransactionModal.classList.add('hidden');
    
    // Reset form
    transactionForm.reset();
    
    // Show success notification
    showNotification('Transaction added successfully');
  });
  
  // Handle category form submission
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(categoryForm);
    const categoryData = {
      id: generateId(),
      name: formData.get('cat-name'),
      type: formData.get('cat-type'),
      color: formData.get('cat-color')
    };
    
    // Add category to data
    appData.categories.push(categoryData);
    
    // Save to localStorage
    saveData();
    
    // Update UI
    loadCategories();
    
    // Close modal
    addCategoryModal.classList.add('hidden');
    
    // Reset form
    categoryForm.reset();
    
    // Show success notification
    showNotification('Category added successfully');
  });
  
  // Handle budget form submission
  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(budgetForm);
    const budgetData = {
      id: generateId(),
      category: formData.get('budget-category'),
      amount: parseFloat(formData.get('budget-amount')),
      period: formData.get('budget-period'),
      spent: 0 // Will be calculated
    };
    
    // Add budget to data (or update if exists)
    const existingBudgetIndex = appData.budgets.findIndex(b => b.category === budgetData.category);
    if (existingBudgetIndex !== -1) {
      appData.budgets[existingBudgetIndex] = budgetData;
    } else {
      appData.budgets.push(budgetData);
    }
    
    // Save to localStorage
    saveData();
    
    // Update UI
    loadBudgets();
    
    // Close modal
    addBudgetModal.classList.add('hidden');
    
    // Reset form
    budgetForm.reset();
    
    // Show success notification
    showNotification('Budget saved successfully');
  });
  
  // Handle import/export
  importDataBtn.addEventListener('click', () => {
    userMenu.classList.add('hidden');
    importFileInput.click();
  });
  
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        appData = data;
        saveData();
        
        // Refresh UI
        initializeApp();
        
        showNotification('Data imported successfully');
      } catch (error) {
        showNotification('Error importing data', true);
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    importFileInput.value = '';
  });
  
  exportDataBtn.addEventListener('click', () => {
    userMenu.classList.add('hidden');
    
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal_finance_data_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully');
  });
  
  // Pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadTransactions();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(appData.transactions.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      loadTransactions();
    }
  });
  
  // Utility functions
  function populateCategoryDropdown() {
    const categorySelect = document.getElementById('category');
    const transactionType = document.querySelector('input[name="type"]:checked').value;
    
    // Clear current options
    categorySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select category...';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);
    
    // Filter categories by transaction type
    const filteredCategories = appData.categories.filter(cat => cat.type === transactionType);
    
    // Add category options
    filteredCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
  
  function populateBudgetCategoryDropdown() {
    const categorySelect = document.getElementById('budget-category');
    
    // Clear current options
    categorySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select category...';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);
    
    // Filter expense categories only
    const expenseCategories = appData.categories.filter(cat => cat.type === 'expense');
    
    // Add category options
    expenseCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
  
  function setTodayDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
  
  // Update transaction type dependent fields
  document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', () => {
      populateCategoryDropdown();
    });
  });
  
  // Load transactions
  function loadTransactions() {
    const transactionsBody = document.getElementById('transactions-body');
    const transactionFilter = document.getElementById('transaction-filter');
    const transactionSearch = document.getElementById('transaction-search');
    
    // Get filtered transactions
    let filteredTransactions = [...appData.transactions];
    
    // Apply filter
    const filterValue = transactionFilter.value;
    if (filterValue !== 'all') {
      filteredTransactions = filteredTransactions.filter(t => t.type === filterValue);
    }
    
    // Apply search if value exists
    const searchValue = transactionSearch.value.toLowerCase();
    if (searchValue) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.description.toLowerCase().includes(searchValue) || 
        getCategoryName(t.category).toLowerCase().includes(searchValue)
      );
    }
    
    // Calculate pagination
    const totalTransactions = filteredTransactions.length;
    const totalPages = Math.ceil(totalTransactions / itemsPerPage);
    
    // Update pagination UI
    updatePaginationUI(currentPage, totalPages, totalTransactions);
    
    // Get transactions for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    
    // Clear current transactions
    transactionsBody.innerHTML = '';
    
    // Add transactions
    if (paginatedTransactions.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" class="py-4 text-center text-gray-500">No transactions found</td>
      `;
      transactionsBody.appendChild(emptyRow);
    } else {
      paginatedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = 'transaction-item';
        
        const formattedDate = formatDate(transaction.date);
        const category = getCategoryById(transaction.category);
        const formattedAmount = formatAmount(transaction.amount, transaction.type);
        
        row.innerHTML = `
          <td class="py-3 pl-4">${formattedDate}</td>
          <td class="py-3">${transaction.description}</td>
          <td class="py-3">
            <span class="category-badge" style="background-color: ${category?.color}20; color: ${category?.color}">
              ${getCategoryName(transaction.category)}
            </span>
          </td>
          <td class="py-3 text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
            ${formattedAmount}
          </td>
          <td class="py-3 pr-4 text-right">
            <button class="text-gray-500 hover:text-gray-700 edit-transaction" data-id="${transaction.id}">
              <i data-lucide="edit-2" class="w-4 h-4"></i>
            </button>
            <button class="text-gray-500 hover:text-red-600 ml-2 delete-transaction" data-id="${transaction.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        `;
        
        transactionsBody.appendChild(row);
      });
      
      // Re-initialize Lucide icons
      lucide.createIcons();
      
      // Add event listeners for edit and delete buttons
      document.querySelectorAll('.edit-transaction').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          editTransaction(id);
        });
      });
      
      document.querySelectorAll('.delete-transaction').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          deleteTransaction(id);
        });
      });
    }
  }
  
  // Update pagination UI
  function updatePaginationUI(currentPage, totalPages, totalItems) {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const transactionsShowing = document.getElementById('transactions-showing');
    const transactionsTotal = document.getElementById('transactions-total');
    
    // Update buttons state
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Update showing text
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    transactionsShowing.textContent = `${startItem}-${endItem}`;
    transactionsTotal.textContent = totalItems;
  }
  
  // Load recent transactions for dashboard
  function loadRecentTransactions() {
    const recentTransactionsBody = document.getElementById('recent-transactions-body');
    
    // Get 5 most recent transactions
    const recentTransactions = appData.transactions.slice(0, 5);
    
    // Clear current transactions
    recentTransactionsBody.innerHTML = '';
    
    // Add transactions
    recentTransactions.forEach(transaction => {
      const row = document.createElement('tr');
      row.className = 'transaction-item';
      
      const formattedDate = formatDate(transaction.date);
      const category = getCategoryById(transaction.category);
      const formattedAmount = formatAmount(transaction.amount, transaction.type);
      
      row.innerHTML = `
        <td class="py-3">${formattedDate}</td>
        <td class="py-3">${transaction.description}</td>
        <td class="py-3">
          <span class="category-badge" style="background-color: ${category?.color}20; color: ${category?.color}">
            ${getCategoryName(transaction.category)}
          </span>
        </td>
        <td class="py-3 text-right ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
          ${formattedAmount}
        </td>
      `;
      
      recentTransactionsBody.appendChild(row);
    });
  }
  
  // Load categories
  function loadCategories() {
    const incomeCategories = document.getElementById('income-categories');
    const expenseCategories = document.getElementById('expense-categories');
    
    // Clear current categories
    incomeCategories.innerHTML = '';
    expenseCategories.innerHTML = '';
    
    // Filter categories by type
    const incomeCats = appData.categories.filter(cat => cat.type === 'income');
    const expenseCats = appData.categories.filter(cat => cat.type === 'expense');
    
    // Add income categories
    if (incomeCats.length === 0) {
      incomeCategories.innerHTML = '<li class="text-gray-500">No income categories found</li>';
    } else {
      incomeCats.forEach(category => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 rounded-md hover:bg-gray-50';
        li.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${category.color}"></span>
            <span>${category.name}</span>
          </div>
          <div class="flex gap-1">
            <button class="text-gray-500 hover:text-gray-700 edit-category" data-id="${category.id}">
              <i data-lucide="edit-2" class="w-4 h-4"></i>
            </button>
            <button class="text-gray-500 hover:text-red-600 delete-category" data-id="${category.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
        incomeCategories.appendChild(li);
      });
    }
    
    // Add expense categories
    if (expenseCats.length === 0) {
      expenseCategories.innerHTML = '<li class="text-gray-500">No expense categories found</li>';
    } else {
      expenseCats.forEach(category => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-2 rounded-md hover:bg-gray-50';
        li.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${category.color}"></span>
            <span>${category.name}</span>
          </div>
          <div class="flex gap-1">
            <button class="text-gray-500 hover:text-gray-700 edit-category" data-id="${category.id}">
              <i data-lucide="edit-2" class="w-4 h-4"></i>
            </button>
            <button class="text-gray-500 hover:text-red-600 delete-category" data-id="${category.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        `;
        expenseCategories.appendChild(li);
      });
    }
    
    // Re-initialize Lucide icons
    lucide.createIcons();
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-category').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        editCategory(id);
      });
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteCategory(id);
      });
    });
  }
  
  // Load budgets
  function loadBudgets() {
    const budgetsContainer = document.getElementById('budgets-container');
    
    // Clear current budgets
    budgetsContainer.innerHTML = '';
    
    // Calculate current spending for each budget
    updateBudgetSpending();
    
    // Add budgets
    if (appData.budgets.length === 0) {
      budgetsContainer.innerHTML = '<div class="text-gray-500 text-center py-6">No budgets found. Create a budget to get started.</div>';
    } else {
      appData.budgets.forEach(budget => {
        const category = getCategoryById(budget.category);
        const percentage = Math.min(100, (budget.spent / budget.amount) * 100);
        let progressClass = 'budget-safe';
        
        if (percentage >= 90) {
          progressClass = 'budget-danger';
        } else if (percentage >= 75) {
          progressClass = 'budget-warning';
        }
        
        const budgetDiv = document.createElement('div');
        budgetDiv.className = 'border border-gray-200 rounded-md p-4';
        budgetDiv.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background-color: ${category?.color || '#000'}"></span>
              <span class="font-medium">${category?.name || 'Unknown Category'}</span>
            </div>
            <div class="flex gap-1">
              <button class="text-gray-500 hover:text-gray-700 edit-budget" data-id="${budget.id}">
                <i data-lucide="edit-2" class="w-4 h-4"></i>
              </button>
              <button class="text-gray-500 hover:text-red-600 delete-budget" data-id="${budget.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Spent: ${formatCurrency(budget.spent)}</span>
            <span>Budget: ${formatCurrency(budget.amount)}</span>
          </div>
          <div class="progress-bar mb-1">
            <div class="progress-bar-fill ${progressClass}" style="width: ${percentage}%"></div>
          </div>
          <div class="text-xs text-right text-gray-500">${percentage.toFixed(1)}%</div>
        `;
        
        budgetsContainer.appendChild(budgetDiv);
      });
      
      // Re-initialize Lucide icons
      lucide.createIcons();
      
      // Add event listeners for edit and delete buttons
      document.querySelectorAll('.edit-budget').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          editBudget(id);
        });
      });
      
      document.querySelectorAll('.delete-budget').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          deleteBudget(id);
        });
      });
    }
  }
  
  // Update budget spending
  function updateBudgetSpending() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Reset all budget spending
    appData.budgets.forEach(budget => {
      budget.spent = 0;
    });
    
    // Calculate spending for each budget
    appData.transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        const transactionYear = transactionDate.getFullYear();
        
        // Find matching budget
        const budget = appData.budgets.find(b => b.category === transaction.category);
        
        if (budget) {
          if (budget.period === 'monthly' && transactionMonth === currentMonth && transactionYear === currentYear) {
            budget.spent += transaction.amount;
          } else if (budget.period === 'yearly' && transactionYear === currentYear) {
            budget.spent += transaction.amount;
          }
        }
      }
    });
    
    // Save to localStorage
    saveData();
  }
  
  // Update dashboard summary
  function updateDashboardSummary() {
    const currentBalanceEl = document.getElementById('current-balance');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    appData.transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });
    
    const currentBalance = totalIncome - totalExpenses;
    
    // Update UI
    currentBalanceEl.textContent = formatCurrency(currentBalance);
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
  }
  
  // Edit transaction
  function editTransaction(id) {
    const transaction = appData.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Populate form
    document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('description').value = transaction.description;
    document.getElementById('date').value = transaction.date;
    document.getElementById('notes').value = transaction.notes || '';
    
    // Populate category dropdown with all categories of the selected type
    populateCategoryDropdown();
    
    // Set the category value (needs to be done after populating the dropdown)
    document.getElementById('category').value = transaction.category;
    
    // Show modal
    addTransactionModal.classList.remove('hidden');
    
    // Change form submit handler to update transaction
    transactionForm.onsubmit = (e) => {
      e.preventDefault();
      
      const formData = new FormData(transactionForm);
      
      // Update transaction data
      transaction.type = formData.get('type');
      transaction.amount = parseFloat(formData.get('amount'));
      transaction.description = formData.get('description');
      transaction.category = formData.get('category');
      transaction.date = formData.get('date');
      transaction.notes = formData.get('notes');
      
      // Save to localStorage
      saveData();
      
      // Update UI
      if (currentSection === 'transactions') {
        loadTransactions();
      } else {
        loadRecentTransactions();
      }
      
      updateDashboardSummary();
      initializeCharts();
      
      // Close modal
      addTransactionModal.classList.add('hidden');
      
      // Reset form and submit handler
      transactionForm.reset();
      transactionForm.onsubmit = null;
      
      // Show success notification
      showNotification('Transaction updated successfully');
    };
  }
  
  // Delete transaction
  function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      // Find transaction index
      const index = appData.transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        // Remove transaction
        appData.transactions.splice(index, 1);
        
        // Save to localStorage
        saveData();
        
        // Update UI
        if (currentSection === 'transactions') {
          loadTransactions();
        } else {
          loadRecentTransactions();
        }
        
        updateDashboardSummary();
        initializeCharts();
        
        // Show success notification
        showNotification('Transaction deleted successfully');
      }
    }
  }
  
  // Edit category
  function editCategory(id) {
    const category = appData.categories.find(c => c.id === id);
    if (!category) return;
    
    // Populate form
    document.querySelector(`input[name="cat-type"][value="${category.type}"]`).checked = true;
    document.getElementById('cat-name').value = category.name;
    document.getElementById('cat-color').value = category.color;
    
    // Show modal
    addCategoryModal.classList.remove('hidden');
    
    // Change form submit handler to update category
    categoryForm.onsubmit = (e) => {
      e.preventDefault();
      
      const formData = new FormData(categoryForm);
      
      // Update category data
      category.name = formData.get('cat-name');
      category.type = formData.get('cat-type');
      category.color = formData.get('cat-color');
      
      // Save to localStorage
      saveData();
      
      // Update UI
      loadCategories();
      
      // Close modal
      addCategoryModal.classList.add('hidden');
      
      // Reset form and submit handler
      categoryForm.reset();
      categoryForm.onsubmit = null;
      
      // Show success notification
      showNotification('Category updated successfully');
    };
  }
  
  // Delete category
  function deleteCategory(id) {
    // Check if category is used in any transactions
    const isUsed = appData.transactions.some(t => t.category === id);
    
    if (isUsed) {
      alert('This category cannot be deleted because it is used in transactions.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this category?')) {
      // Find category index
      const index = appData.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        // Remove category
        appData.categories.splice(index, 1);
        
        // Also remove any budgets using this category
        appData.budgets = appData.budgets.filter(b => b.category !== id);
        
        // Save to localStorage
        saveData();
        
        // Update UI
        loadCategories();
        
        // Show success notification
        showNotification('Category deleted successfully');
      }
    }
  }
  
  // Edit budget
  function editBudget(id) {
    const budget = appData.budgets.find(b => b.id === id);
    if (!budget) return;
    
    // Populate budget category dropdown
    populateBudgetCategoryDropdown();
    
    // Populate form
    document.getElementById('budget-category').value = budget.category;
    document.getElementById('budget-amount').value = budget.amount;
    document.getElementById('budget-period').value = budget.period;
    
    // Show modal
    addBudgetModal.classList.remove('hidden');
    
    // Change form submit handler to update budget
    budgetForm.onsubmit = (e) => {
      e.preventDefault();
      
      const formData = new FormData(budgetForm);
      
      // Update budget data
      budget.category = formData.get('budget-category');
      budget.amount = parseFloat(formData.get('budget-amount'));
      budget.period = formData.get('budget-period');
      
      // Save to localStorage
      saveData();
      
      // Update UI
      loadBudgets();
      
      // Close modal
      addBudgetModal.classList.add('hidden');
      
      // Reset form and submit handler
      budgetForm.reset();
      budgetForm.onsubmit = null;
      
      // Show success notification
      showNotification('Budget updated successfully');
    };
  }
  
  // Delete budget
  function deleteBudget(id) {
    if (confirm('Are you sure you want to delete this budget?')) {
      // Find budget index
      const index = appData.budgets.findIndex(b => b.id === id);
      if (index !== -1) {
        // Remove budget
        appData.budgets.splice(index, 1);
        
        // Save to localStorage
        saveData();
        
        // Update UI
        loadBudgets();
        
        // Show success notification
        showNotification('Budget deleted successfully');
      }
    }
  }
  
  // Initialize reports
  function initializeReports() {
    updateReportCharts();
    loadTopSpendingCategories();
  }
  
  // Load top spending categories
  function loadTopSpendingCategories() {
    const spendingCategoriesBody = document.getElementById('spending-categories-body');
    
    // Get report period
    const period = document.getElementById('report-period').value;
    
    // Calculate spending by category
    const categorySpending = calculateCategorySpending(period);
    
    // Sort by amount
    categorySpending.sort((a, b) => b.amount - a.amount);
    
    // Take top 5
    const topCategories = categorySpending.slice(0, 5);
    
    // Calculate total expenses
    const totalExpenses = topCategories.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Clear current data
    spendingCategoriesBody.innerHTML = '';
    
    // Add data
    topCategories.forEach(cat => {
      const percentage = (cat.amount / totalExpenses * 100).toFixed(1);
      
      const row = document.createElement('tr');
      row.className = 'border-b border-gray-100';
      
      const category = getCategoryById(cat.category);
      
      row.innerHTML = `
        <td class="py-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" style="background-color: ${category?.color || '#000'}"></span>
            <span>${category?.name || 'Unknown'}</span>
          </div>
        </td>
        <td class="py-3 text-right">${formatCurrency(cat.amount)}</td>
        <td class="py-3 text-right">${percentage}%</td>
        <td class="py-3 text-right">
          <span class="${cat.trend > 0 ? 'text-red-600' : 'text-green-600'}">
            ${cat.trend > 0 ? '+' : ''}${cat.trend.toFixed(1)}%
          </span>
        </td>
      `;
      
      spendingCategoriesBody.appendChild(row);
    });
  }
  
  // Calculate category spending
  function calculateCategorySpending(period) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filter transactions based on period
    let currentPeriodTransactions;
    let previousPeriodTransactions;
    
    if (period === 'month') {
      currentPeriodTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear && t.type === 'expense';
      });
      
      // Previous month
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      previousPeriodTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear && t.type === 'expense';
      });
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(currentMonth / 3);
      const startMonth = currentQuarter * 3;
      const endMonth = startMonth + 2;
      
      currentPeriodTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() >= startMonth && date.getMonth() <= endMonth && 
               date.getFullYear() === currentYear && t.type === 'expense';
      });
      
      // Previous quarter
      const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const prevQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;
      const prevStartMonth = prevQuarter * 3;
      const prevEndMonth = prevStartMonth + 2;
      
      previousPeriodTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() >= prevStartMonth && date.getMonth() <= prevEndMonth && 
               date.getFullYear() === prevQuarterYear && t.type === 'expense';
      });
    } else if (period === 'year') {
      currentPeriodTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === currentYear && t.type === 'expense';
      });
      
      // Previous year
      previousPeriodTransactions = appData.transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === currentYear - 1 && t.type === 'expense';
      });
    }
    
    // Calculate current spending by category
    const categorySpending = {};
    
    currentPeriodTransactions.forEach(t => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = { amount: 0, prevAmount: 0 };
      }
      categorySpending[t.category].amount += t.amount;
    });
    
    // Calculate previous spending by category
    previousPeriodTransactions.forEach(t => {
      if (!categorySpending[t.category]) {
        categorySpending[t.category] = { amount: 0, prevAmount: 0 };
      }
      categorySpending[t.category].prevAmount += t.amount;
    });
    
    // Calculate trend
    const result = [];
    for (const [category, data] of Object.entries(categorySpending)) {
      let trend = 0;
      if (data.prevAmount > 0) {
        trend = ((data.amount - data.prevAmount) / data.prevAmount) * 100;
      }
      
      result.push({
        category,
        amount: data.amount,
        prevAmount: data.prevAmount,
        trend
      });
    }
    
    return result;
  }
  
  // Helper Functions
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  function formatAmount(amount, type) {
    return type === 'income' ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`;
  }
  
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
  
  function getCategoryById(id) {
    return appData.categories.find(cat => cat.id === id) || null;
  }
  
  function getCategoryName(id) {
    const category = getCategoryById(id);
    return category ? category.name : 'Uncategorized';
  }
  
  function saveData() {
    localStorage.setItem('personalFinanceData', JSON.stringify(appData));
  }
  
  function loadData() {
    const savedData = localStorage.getItem('personalFinanceData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  }
  
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${isError ? 'bg-red-500' : 'bg-black'} text-white transition-opacity duration-300 ease-in-out`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  // Initialize app
  function initializeApp() {
    // Load data from localStorage or use default data
    const savedData = loadData();
    if (savedData) {
      appData = savedData;
    }
    
    // Setup event listeners
    document.getElementById('transaction-filter').addEventListener('change', loadTransactions);
    document.getElementById('transaction-search').addEventListener('input', loadTransactions);
    document.getElementById('report-period').addEventListener('change', () => {
      updateReportCharts();
      loadTopSpendingCategories();
    });
    
    // Initialize charts
    initializeCharts();
    
    // Load initial data
    updateDashboardSummary();
    loadRecentTransactions();
    
    // Show dashboard section
    switchSection('dashboard');
  }
  
  // Start app
  initializeApp();
});
