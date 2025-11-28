import React, { useState } from 'react';
import { Receipt, Plus, Trash2, TrendingDown, Calendar, Filter } from 'lucide-react';

interface Expense {
  id: string;
  category: 'Lab Charges' | 'Materials' | 'Utility Bills' | 'Salaries' | 'Rent' | 'Other';
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'JazzCash' | 'EasyPaisa';
  notes: string;
}

interface ExpenseTrackerProps {
  onSaveExpense: (expense: Expense) => void;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ onSaveExpense }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [category, setCategory] = useState<Expense['category']>('Materials');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('Cash');
  const [notes, setNotes] = useState('');

  // Filter state
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const CATEGORIES: Expense['category'][] = [
    'Lab Charges',
    'Materials',
    'Utility Bills',
    'Salaries',
    'Rent',
    'Other',
  ];

  // Add expense
  const handleAddExpense = () => {
    if (!description || !amount) {
      alert('Please enter description and amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter valid amount');
      return;
    }

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      category,
      description,
      amount: amountNum,
      date,
      paymentMethod,
      notes,
    };

    setExpenses(prev => [...prev, newExpense]);
    onSaveExpense(newExpense);

    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setShowAddForm(false);
  };

  // Remove expense
  const removeExpense = (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const monthMatch = expDate.getMonth() === filterMonth;
    const yearMatch = expDate.getFullYear() === filterYear;
    const categoryMatch = filterCategory === 'All' || exp.category === filterCategory;
    return monthMatch && yearMatch && categoryMatch;
  });

  // Calculate total
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Category breakdown
  const categoryTotals = CATEGORIES.map(cat => ({
    category: cat,
    total: filteredExpenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0),
  })).filter(item => item.total > 0);

  const getCategoryIcon = (category: Expense['category']): string => {
    const icons: Record<Expense['category'], string> = {
      'Lab Charges': '🔬',
      'Materials': '📦',
      'Utility Bills': '💡',
      'Salaries': '💰',
      'Rent': '🏢',
      'Other': '📝',
    };
    return icons[category];
  };

  const getCategoryColor = (category: Expense['category']): string => {
    const colors: Record<Expense['category'], string> = {
      'Lab Charges': 'bg-purple-100 text-purple-800 border-purple-300',
      'Materials': 'bg-blue-100 text-blue-800 border-blue-300',
      'Utility Bills': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Salaries': 'bg-green-100 text-green-800 border-green-300',
      'Rent': 'bg-red-100 text-red-800 border-red-300',
      'Other': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[category];
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="text-brand-500" size={28} />
              Expense Tracker
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track clinic operating expenses
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition flex items-center gap-2"
          >
            {showAddForm ? 'Cancel' : <><Plus size={20} /> Add Expense</>}
          </button>
        </div>
      </div>

      {/* Total Display */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-100 mb-1">
              {months[filterMonth]} {filterYear} {filterCategory !== 'All' && `- ${filterCategory}`}
            </p>
            <p className="text-4xl font-bold">
              PKR {totalExpenses.toLocaleString()}
            </p>
            <p className="text-sm text-red-100 mt-1">
              {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <TrendingDown size={64} className="text-red-200 opacity-50" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="text-gray-500" size={20} />
          <h3 className="font-bold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Month */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4">Add New Expense</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Composite material purchase"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Expense['paymentMethod'])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAddExpense}
            className="w-full mt-4 bg-brand-500 text-white py-3 rounded-lg font-bold hover:bg-brand-600 transition"
          >
            Add Expense
          </button>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-bold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categoryTotals.map(item => (
              <div
                key={item.category}
                className={`p-3 rounded-lg border ${getCategoryColor(item.category)}`}
              >
                <div className="text-2xl mb-1">{getCategoryIcon(item.category)}</div>
                <p className="text-xs font-medium">{item.category}</p>
                <p className="text-lg font-bold">
                  PKR {item.total.toLocaleString()}
                </p>
                <p className="text-xs opacity-75">
                  {((item.total / totalExpenses) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-bold text-gray-800 mb-4">
          Expense Transactions ({filteredExpenses.length})
        </h3>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Receipt size={48} className="mx-auto mb-3" />
            <p className="text-lg font-medium">No expenses recorded</p>
            <p className="text-sm mt-1">
              {filterCategory !== 'All' || filterMonth !== new Date().getMonth()
                ? 'Try adjusting filters'
                : 'Click "Add Expense" to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${getCategoryColor(expense.category)}`}>
                      {getCategoryIcon(expense.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {expense.description}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{expense.paymentMethod}</span>
                        {expense.notes && (
                          <>
                            <span>•</span>
                            <span className="italic">{expense.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-600 text-lg whitespace-nowrap">
                      PKR {expense.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
