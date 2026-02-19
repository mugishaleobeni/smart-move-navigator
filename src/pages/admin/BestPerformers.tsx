import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Car, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface PerformerCar {
  id: string;
  name: string;
  image: string | null;
  type: string;
  totalIncome: number;
  totalBookings: number;
  profit: number;
}

const PODIUM_COLORS = ['hsl(45,80%,55%)', 'hsl(210,10%,70%)', 'hsl(30,50%,45%)'];

export default function BestPerformers() {
  const [performers, setPerformers] = useState<PerformerCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: cars }, { data: bookings }, { data: expenses }] = await Promise.all([
      supabase.from('cars').select('id, name, image, type'),
      supabase.from('bookings').select('car_id, total_price'),
      supabase.from('expenses').select('car_id, amount'),
    ]);

    const incomeMap: Record<string, number> = {};
    const bookingCountMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};

    (bookings || []).forEach((b: any) => {
      if (b.car_id) {
        incomeMap[b.car_id] = (incomeMap[b.car_id] || 0) + Number(b.total_price || 0);
        bookingCountMap[b.car_id] = (bookingCountMap[b.car_id] || 0) + 1;
      }
    });

    (expenses || []).forEach((e: any) => {
      if (e.car_id) {
        expenseMap[e.car_id] = (expenseMap[e.car_id] || 0) + Number(e.amount || 0);
      }
    });

    const ranked = (cars || [])
      .map((car: any) => ({
        id: car.id,
        name: car.name,
        image: car.image,
        type: car.type,
        totalIncome: incomeMap[car.id] || 0,
        totalBookings: bookingCountMap[car.id] || 0,
        profit: (incomeMap[car.id] || 0) - (expenseMap[car.id] || 0),
      }))
      .sort((a, b) => b.totalIncome - a.totalIncome);

    setPerformers(ranked);
    setLoading(false);
  };

  const top3 = performers.slice(0, 3);
  const chartData = performers.slice(0, 8).map((p) => ({ name: p.name, income: p.totalIncome, profit: p.profit }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/20">
          <Trophy className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Best Performers</h1>
          <p className="text-sm text-muted-foreground">Top performing cars by income & bookings</p>
        </div>
      </div>

      {/* Podium - Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((car, i) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`glass overflow-hidden relative border-2 ${
                i === 0 ? 'border-yellow-400/60' : i === 1 ? 'border-slate-400/60' : 'border-amber-600/60'
              }`}>
                {/* Rank Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-slate-400 text-slate-900' : 'bg-amber-600 text-amber-100'
                  }`}>
                    #{i + 1}
                  </div>
                </div>

                {car.image && (
                  <div className="h-36 overflow-hidden">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent h-36" />
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-3">
                    {i === 0 ? <Trophy className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" /> :
                     i === 1 ? <Star className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" /> :
                     <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                    <div>
                      <h3 className="font-bold text-base leading-tight">{car.name}</h3>
                      <p className="text-xs text-muted-foreground">{car.type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Income</p>
                      <p className="text-sm font-bold text-accent">${car.totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="glass rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Bookings</p>
                      <p className="text-sm font-bold">{car.totalBookings}</p>
                    </div>
                  </div>
                  <div className="mt-2 glass rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Net Profit</p>
                    <p className={`text-sm font-bold ${car.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      ${car.profit.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Income by Car
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-35} textAnchor="end" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Bar dataKey="income" radius={[4, 4, 0, 0]} name="Income">
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i < 3 ? PODIUM_COLORS[i] : 'hsl(var(--accent))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Full Rankings Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="w-4 h-4 text-accent" /> Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet. Add bookings to see rankings.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Car</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Bookings</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Income</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {performers.map((car, i) => (
                    <tr key={car.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-yellow-400/20 text-yellow-600' :
                          i === 1 ? 'bg-slate-400/20 text-slate-500' :
                          i === 2 ? 'bg-amber-600/20 text-amber-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {car.image && <img src={car.image} alt={car.name} className="w-8 h-8 rounded object-cover" />}
                          <div>
                            <p className="font-medium">{car.name}</p>
                            <p className="text-xs text-muted-foreground">{car.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">{car.totalBookings}</td>
                      <td className="py-2 px-3 text-right font-semibold text-accent">${car.totalIncome.toLocaleString()}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${car.profit >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                        ${car.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
