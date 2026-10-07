import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Award, Gift, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoyaltyWalletPage: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLoyalty() {
      setIsLoading(true);
      try {
        const [ledgerRes, tiersRes] = await Promise.all([
          api.get('/loyalty/my-ledger'),
          api.get('/loyalty/tiers')
        ]);
        setLedgerData(ledgerRes);
        setTiers(tiersRes.tiers || []);
      } catch (err) {
        console.error('Failed to load loyalty ledger', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLoyalty();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-10">
      
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Unified Hospitality Rewards</span>
        <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">Epicure Loyalty & Club Ledger</h1>
        <p className="text-xs text-stone-500 mt-1">Earn 5% points on both fine dining reservations and gourmet delivery orders</p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-stone-100 rounded-3xl animate-pulse" />
      ) : (
        <>
          {/* Top Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Balance Card */}
            <div className="bg-gradient-to-tr from-stone-900 via-stone-950 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Reward Balance</span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="font-display text-4xl sm:text-5xl font-bold text-white">
                  {ledgerData?.currentBalance || 0}
                </span>
                <span className="text-stone-400 text-xs ml-2 font-semibold">Epicure Points</span>
              </div>
              <p className="text-xs text-stone-300">
                Equivalent to <strong>₹{((ledgerData?.currentBalance || 0) * 1).toFixed(2)}</strong> in direct checkout dining credit.
              </p>
            </div>

            {/* Membership Tier Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">Club Status</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-display text-2xl font-bold text-stone-900 mt-2">
                  {ledgerData?.membershipTier || 'STANDARD'} MEMBER
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Enjoy priority table holds, bonus points multipliers, and chef tasting compliments.
                </p>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-2/3" />
              </div>
            </div>

            {/* Cumulative Lifetime Earned */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">Lifetime Earned</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-display text-2xl font-bold text-emerald-700 mt-2">
                  +{ledgerData?.stats?.totalEarned || 0} pts
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Total redeemed to date: <strong>{ledgerData?.stats?.totalRedeemed || 0} pts</strong>
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Points never expire for active accounts</span>
              </div>
            </div>

          </div>

          {/* Membership Tiers Overview */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-stone-900">Epicure Club Tier Privileges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map(t => (
                <div key={t.tier} className="bg-white p-5 rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900">{t.tier}</span>
                    <span className="text-[10px] font-bold text-stone-400">Spend &gt; ₹{t.minSpend}</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-stone-600">
                    {t.perks.map((p: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Unified Ledger Transactions Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-bold text-stone-900">Ledger Activity & Audited Points History</h3>
            
            {!ledgerData?.transactions || ledgerData.transactions.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No reward transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 font-bold">Transaction Type</th>
                      <th className="pb-3 font-bold">Reference / Reason</th>
                      <th className="pb-3 font-bold">Points Delta</th>
                      <th className="pb-3 font-bold">Balance After</th>
                      <th className="pb-3 font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {ledgerData.transactions.map((tx: any) => (
                      <tr key={tx._id} className="hover:bg-stone-50/50">
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.transactionType === 'EARNED' || tx.transactionType === 'BONUS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="py-3.5 text-stone-700 font-medium">
                          {tx.notes || `${tx.referenceType} Reward`}
                        </td>
                        <td className={`py-3.5 font-bold ${
                          tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                        </td>
                        <td className="py-3.5 font-bold text-stone-900">
                          {tx.balanceAfter} pts
                        </td>
                        <td className="py-3.5 text-stone-400">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </>
      )}

    </div>
  );
};
