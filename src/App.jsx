import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  DollarSign,
  LayoutDashboard,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const seedTransactions = [
  { id: 1, date: '2026-03-04', description: 'Salary deposit', category: 'Salary', type: 'income', amount: 5200 },
  { id: 2, date: '2026-03-05', description: 'Groceries', category: 'Food', type: 'expense', amount: 145 },
  { id: 3, date: '2026-03-07', description: 'Rent payment', category: 'Housing', type: 'expense', amount: 1800 },
  { id: 4, date: '2026-03-12', description: 'Freelance payment', category: 'Freelance', type: 'income', amount: 900 },
  { id: 5, date: '2026-03-14', description: 'Gym membership', category: 'Health', type: 'expense', amount: 55 },
  { id: 6, date: '2026-03-20', description: 'Coffee and snacks', category: 'Food', type: 'expense', amount: 38 },
  { id: 7, date: '2026-03-23', description: 'Electricity bill', category: 'Utilities', type: 'expense', amount: 120 },
  { id: 8, date: '2026-03-26', description: 'Flight refund', category: 'Travel', type: 'income', amount: 230 },
  { id: 9, date: '2026-04-01', description: 'Stocks dividend', category: 'Investments', type: 'income', amount: 160 },
  { id: 10, date: '2026-04-03', description: 'Dining out', category: 'Food', type: 'expense', amount: 72 },
];

const COLORS = ['#7c3aed', '#06b6d4', '#f97316', '#ec4899', '#22c55e', '#eab308'];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

function App() {
  const [role, setRole] = useState('viewer');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem('finance-transactions');
    return stored ? JSON.parse(stored) : seedTransactions;
  });
  const [form, setForm] = useState({ id: null, date: '', description: '', category: '', type: 'expense', amount: '' });

  const [activeNav, setActiveNav] = useState('dashboard');
  const dashboardRef = useRef(null);
  const transactionsRef = useRef(null);
  const analyticsRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const totals = useMemo(() => {
    const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const balanceTrend = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    return sorted.map((item) => {
      running += item.type === 'income' ? item.amount : -item.amount;
      return { date: dateFormat.format(new Date(item.date)), balance: running };
    });
  }, [transactions]);

  const monthlyFlow = useMemo(() => {
    const grouped = transactions.reduce((acc, item) => {
      const key = item.date.slice(0, 7);
      if (!acc[key]) acc[key] = { month: key, income: 0, expense: 0 };
      if (item.type === 'income') acc[key].income += item.amount;
      else acc[key].expense += item.amount;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({ ...item, month: monthLabel.format(new Date(`${item.month}-01`)) }));
  }, [transactions]);

  const spendByCategory = useMemo(() => {
    const grouped = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...transactions]
      .filter((item) => {
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesSearch =
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.amount.toString().includes(query);
        return matchesType && matchesSearch;
      })
      .sort((a, b) => {
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'date') return (new Date(a.date) - new Date(b.date)) * modifier;
        if (sortConfig.key === 'amount') return (a.amount - b.amount) * modifier;
        return a[sortConfig.key].localeCompare(b[sortConfig.key]) * modifier;
      });
  }, [transactions, search, typeFilter, sortConfig]);

  const monthlyComparison = useMemo(() => {
    const expenseByMonth = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        const month = item.date.slice(0, 7);
        acc[month] = (acc[month] || 0) + item.amount;
        return acc;
      }, {});

    const months = Object.keys(expenseByMonth).sort();
    if (months.length < 2) return null;

    const current = months[months.length - 1];
    const previous = months[months.length - 2];
    const delta = expenseByMonth[current] - expenseByMonth[previous];

    return { current, previous, delta };
  }, [transactions]);

  const topCategory = spendByCategory[0];
  const isEditing = Boolean(form.id);

  const summaryCards = [
    {
      label: 'Total Balance',
      value: totals.balance,
      icon: Wallet,
      accent: 'from-violet-500/90 to-fuchsia-500/90',
      textColor: 'text-violet-100',
    },
    {
      label: 'Total Income',
      value: totals.income,
      icon: ArrowUpRight,
      accent: 'from-cyan-500/90 to-blue-500/90',
      textColor: 'text-cyan-100',
    },
    {
      label: 'Total Expenses',
      value: totals.expenses,
      icon: ArrowDownRight,
      accent: 'from-rose-500/90 to-orange-500/90',
      textColor: 'text-rose-100',
    },
  ];

  const setSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'desc' }
    );
  };

  const resetForm = () => setForm({ id: null, date: '', description: '', category: '', type: 'expense', amount: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount), id: form.id || Date.now() };
    if (isEditing) {
      setTransactions((prev) => prev.map((item) => (item.id === form.id ? payload : item)));
    } else {
      setTransactions((prev) => [payload, ...prev]);
    }
    resetForm();
  };

  const startEdit = (item) => {
    setForm({ ...item, amount: String(item.amount) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (section) => {
    setActiveNav(section);

    const sectionMap = {
      dashboard: dashboardRef,
      transactions: transactionsRef,
      analytics: analyticsRef,
      settings: settingsRef,
    };

    sectionMap[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main class="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-cyan-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:p-6">
      <div class="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[240px_1fr]">
        <aside class="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <div class="mb-8">
            <p class="text-xs uppercase tracking-[0.2em] text-violet-500 dark:text-violet-300">Finance</p>
            <h1 class="mt-2 text-xl font-bold text-lime-600">My Finance Activity</h1>
          </div>

          <nav className="space-y-2 text-sm">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeNav === 'dashboard'} onClick={() => navigateTo('dashboard')} />
            <SidebarItem icon={Briefcase} label="Transactions" active={activeNav === 'transactions'} onClick={() => navigateTo('transactions')} />
            <SidebarItem icon={BarChart3} label="Analytics" active={activeNav === 'analytics'} onClick={() => navigateTo('analytics')} />
            <SidebarItem icon={ShieldCheck} label={`Role: ${role}`} active={activeNav === 'settings'} onClick={() => navigateTo('settings')} />
            <SidebarItem icon={Settings} label="Settings" active={activeNav === 'settings'} onClick={() => navigateTo('settings')} />
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-4 text-white shadow-lg">
            <p className="text-xs uppercase tracking-wide text-violet-100">Quick Controls</p>
            <div className="mt-3 space-y-3">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="viewer" className="text-slate-900">Viewer</option>
                <option value="admin" className="text-slate-900">Admin</option>
              </select>
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-sm"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <header ref={dashboardRef} className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back to your  👋</p>
                <h2 className="text-2xl font-semibold text-red-700">Financial Dashboard</h2>
              </div>
              <div className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                {role === 'admin' ? 'Admin Access' : 'Viewer Access'}
              </div>
            </div>
          </header>

          {role === 'admin' && (
            <section className="rounded-3xl border border-violet-200 bg-white p-5 shadow-lg dark:border-violet-700 dark:bg-slate-900">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Plus size={18} className="text-violet-500" /> {isEditing ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-6">
                <InputField type="date" value={form.date} onChange={(value) => setForm((prev) => ({ ...prev, date: value }))} required />
                <InputField
                  type="text"
                  placeholder="Description"
                  value={form.description}
                  onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                  required
                />
                <InputField
                  type="text"
                  placeholder="Category"
                  value={form.category}
                  onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                  required
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="rounded-xl border bg-white px-3 py-2 dark:bg-slate-800"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <InputField
                  type="number"
                  min="1"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(value) => setForm((prev) => ({ ...prev, amount: value }))}
                  required
                />
                <div className="flex gap-2">
                  <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="rounded-xl border px-4 py-2 text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <article key={card.label} className={`rounded-3xl bg-gradient-to-r p-5 text-white shadow-xl ${card.accent}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${card.textColor}`}>{card.label}</p>
                  <card.icon size={18} />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{currency.format(card.value)}</p>
              </article>
            ))}
          </section>

          <section ref={analyticsRef} className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 xl:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-extrabold">Balance Trend</h3>
                <Sparkles size={16} className="text-violet-500" />
              </div>
              <div className="h-72">
                {balanceTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={balanceTrend}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => currency.format(value)} />
                      <Area type="monotone" dataKey="balance" stroke="#7c3aed" strokeWidth={3} fill="url(#balanceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No transactions yet. Add data to reveal your trend." />
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
              <h3 className="mb-3 font-extrabold text-xl">Spending Split</h3>
              <div className="h-72">
                {spendByCategory.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendByCategory} dataKey="value" innerRadius={58} outerRadius={95} paddingAngle={3}>
                        {spendByCategory.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => currency.format(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No expense categories yet." />
                )}
              </div>
            </article>
          </section>

          <section ref={transactionsRef} className="grid gap-4 xl:grid-cols-3">
            <article className="rounded-3xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 xl:col-span-2">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h3 className="font-extrabold">Transactions</h3>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm dark:bg-slate-800">
                    <Search size={16} className="text-slate-500" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search"
                      className="bg-transparent outline-none"
                    />
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-xl border bg-white px-3 py-2 text-sm dark:bg-slate-800"
                  >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-slate-500 dark:text-slate-400">
                      <SortableHeader label="Date" onClick={() => setSort('date')} />
                      <SortableHeader label="Description" onClick={() => setSort('description')} />
                      <SortableHeader label="Category" onClick={() => setSort('category')} />
                      <SortableHeader label="Type" onClick={() => setSort('type')} />
                      <SortableHeader label="Amount" onClick={() => setSort('amount')} />
                      {role === 'admin' && <th className="py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length ? (
                      filteredTransactions.map((item) => (
                        <tr key={item.id} className="border-b border-dashed">
                          <td className="py-3">{dateFormat.format(new Date(item.date))}</td>
                          <td className="py-3">{item.description}</td>
                          <td className="py-3">{item.category}</td>
                          <td className="py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                item.type === 'income'
                                  ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className={`py-3 font-semibold ${item.type === 'income' ? 'text-cyan-500' : 'text-rose-500'}`}>
                            {item.type === 'income' ? '+' : '-'}{currency.format(item.amount)}
                          </td>
                          {role === 'admin' && (
                            <td className="py-3">
                              <button
                                onClick={() => startEdit(item)}
                                className="rounded-lg border border-violet-300 bg-violet-50 px-2 py-1 text-xs text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-200"
                              >
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={role === 'admin' ? 6 : 5} className="py-8">
                          <EmptyState message="No transaction matches your filter." compact />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="space-y-4">
              <div className="rounded-3xl border border-white/40 bg-orange-200 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                <h3 className="mb-3 font-extrabold text-xl">Monthly Flow</h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyFlow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                      <XAxis dataKey="month" hide />
                      <Tooltip formatter={(value) => currency.format(value)} />
                      <Bar dataKey="income" radius={[8, 8, 0, 0]} fill="#06b6d4" />
                      <Bar dataKey="expense" radius={[8, 8, 0, 0]} fill="#7c3aed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-white/40 bg-purple-300 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                <h3 className="mb-3 font-extrabold text-xl">Insights</h3>
                <div className="space-y-3 text-sm bg-amber-400">
                  <InsightCard title="Highest spending" value={topCategory ? `${topCategory.name} (${currency.format(topCategory.value)})` : 'No expense data'} />
                  <InsightCard
                    title="Monthly comparison"
                    value={
                      monthlyComparison
                        ? `${monthLabel.format(new Date(`${monthlyComparison.current}-01`))} is ${
                            monthlyComparison.delta > 0 ? 'higher' : 'lower'
                          } by ${currency.format(Math.abs(monthlyComparison.delta))} than ${monthLabel.format(
                            new Date(`${monthlyComparison.previous}-01`)
                          )}`
                        : 'Need at least two months of data'
                    }
                  />
                  <InsightCard
                    title="Savings rate"
                    value={
                      totals.income
                        ? `${Math.round(((totals.income - totals.expenses) / totals.income) * 100)}% of income saved`
                        : 'No income data yet'
                    }
                  />
                </div>
              </div>
            </article>
          </section>


          <section ref={settingsRef} className="rounded-3xl border border-white/40 bg-red-100 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <h3 className="font-extrabold text-xl">Settings</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Use sidebar controls to switch role and theme. Current role: <span className="font-semibold">{role}</span>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setRole('viewer')} className="rounded-xl border px-3 py-2 text-sm">Set Viewer</button>
              <button onClick={() => setRole('admin')} className="rounded-xl border px-3 py-2 text-sm">Set Admin</button>
              <button onClick={() => setDarkMode((prev) => !prev)} className="rounded-xl border px-3 py-2 text-sm">
                Toggle {darkMode ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
        active
          ? 'bg-violet-600 text-white shadow-md shadow-violet-300/40'
          : 'text-slate-600 hover:bg-violet-50 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function SortableHeader({ label, onClick }) {
  return (
    <th className="cursor-pointer py-3" onClick={onClick}>
      {label}
    </th>
  );
}

function InputField({ type, value, onChange, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border bg-white px-3 py-2 dark:bg-slate-800"
      {...props}
    />
  );
}

function EmptyState({ message, compact = false }) {
  return (
    <div className={`grid place-items-center rounded-xl border border-dashed p-4 text-center text-slate-500 ${compact ? '' : 'h-full'}`}>
      {message}
    </div>
  );
}

function InsightCard({ title, value }) {
  return (
    <div className="rounded-xl border bg-gradient-to-r from-white to-violet-50 p-3 dark:from-slate-800 dark:to-slate-800">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

export default App;
