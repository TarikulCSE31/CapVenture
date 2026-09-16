import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpLeft, TrendingUp, RefreshCw } from 'lucide-react';
import { CurrencyConfig, Partner, Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  partners: Partner[];
  editingTransaction?: Transaction | null;
  currency: CurrencyConfig;
  onOpenPartnerModal: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partners,
  editingTransaction,
  currency,
  onOpenPartnerModal,
}) => {
  const [type, setType] = useState<TransactionType>('INVESTMENT_OUT');
  const [partnerId, setPartnerId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [reference, setReference] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setPartnerId(editingTransaction.partnerId);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'Bank Transfer');
      setReference(editingTransaction.reference || '');
    } else {
      // Default reset
      setType('INVESTMENT_OUT');
      setPartnerId(partners[0]?.id || '');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaymentMethod('Bank Transfer');
      setReference('');
    }
  }, [editingTransaction, isOpen, partners]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!partnerId) {
      alert('Please select or create a partner/borrower.');
      return;
    }

    onSave(
      {
        partnerId,
        date,
        amount: num,
        type,
        description: description.trim() || getDefaultDescription(type),
        paymentMethod,
        reference: reference.trim(),
      },
      editingTransaction?.id
    );
    onClose();
  };

  const getDefaultDescription = (t: TransactionType) => {
    switch (t) {
      case 'INVESTMENT_OUT': return 'Capital investment disbursed';
      case 'PRINCIPAL_RETURN': return 'Principal capital returned';
      case 'PROFIT_PAYOUT': return 'Profit distribution payout received';
      case 'REINVEST': return 'Profit reinvested into principal';
    }
  };

  const addPresetAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + add).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-400">
              Update capital investment, returns, or profit payouts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
          
          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Transaction Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* 1. Invest Out */}
              <button
                type="button"
                onClick={() => setType('INVESTMENT_OUT')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'INVESTMENT_OUT'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ArrowDownRight className="h-4 w-4 mb-1 text-blue-400" />
                <span>Invest Out</span>
                <span className="text-[10px] opacity-70">Lend capital</span>
              </button>

              {/* 2. Principal Return */}
              <button
                type="button"
                onClick={() => setType('PRINCIPAL_RETURN')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'PRINCIPAL_RETURN'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ArrowUpLeft className="h-4 w-4 mb-1 text-amber-400" />
                <span>Principal Back</span>
                <span className="text-[10px] opacity-70">Refunds principal</span>
              </button>

              {/* 3. Profit Payout */}
              <button
                type="button"
                onClick={() => setType('PROFIT_PAYOUT')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'PROFIT_PAYOUT'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="h-4 w-4 mb-1 text-emerald-400" />
                <span>Profit Share</span>
                <span className="text-[10px] opacity-70">Earnings received</span>
              </button>

              {/* 4. Reinvest */}
              <button
                type="button"
                onClick={() => setType('REINVEST')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  type === 'REINVEST'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <RefreshCw className="h-4 w-4 mb-1 text-purple-400" />
                <span>Reinvest</span>
                <span className="text-[10px] opacity-70">Roll profit in</span>
              </button>
            </div>

            {/* Impact Banner */}
            <div className="mt-2 text-[11px] px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300">
              {type === 'INVESTMENT_OUT' && (
                <span>ℹ️ <strong>Invest Out</strong> increases your outstanding principal with the partner.</span>
              )}
              {type === 'PRINCIPAL_RETURN' && (
                <span>ℹ️ <strong>Principal Back</strong> reduces outstanding debt/capital. Does not inflate profit metrics.</span>
              )}
              {type === 'PROFIT_PAYOUT' && (
                <span>ℹ️ <strong>Profit Share</strong> counts towards your return on investment. Principal balance remains unchanged.</span>
              )}
              {type === 'REINVEST' && (
                <span>ℹ️ <strong>Reinvest</strong> records profit earned and automatically adds it to your active principal.</span>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Amount ({currency.symbol})
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold">
                {currency.symbol}
              </div>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-600"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 mr-1">Quick:</span>
              {[500, 1000, 2500, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPresetAmount(preset)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Partner & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Partner */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Partner / Borrower
                </label>
                <button
                  type="button"
                  onClick={onOpenPartnerModal}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  + New Partner
                </button>
              </div>
              <div className="relative">
                <select
                  required
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Memo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getDefaultDescription(type)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Cash">Cash in hand</option>
                <option value="Check">Check / Pay order</option>
                <option value="Online / Mobile">Online / Mobile Wallet</option>
                <option value="Crypto">Crypto</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reference / Receipt #
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TXN-1029, Check #4"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {editingTransaction ? 'Update Entry' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
