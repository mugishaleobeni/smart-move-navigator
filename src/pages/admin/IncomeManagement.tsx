import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, TrendingUp, Car, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface IncomeRow {
  id: string;
  client_name: string;
  booking_date: string;
  car_name: string;
  car_type: string;
  total_price: number;
  status: string;
  pickup_location: string;
  duration_hours: number;
}

export default function IncomeManagement() {
  const [rows, setRows] = useState<IncomeRow[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0, pending: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, client_name, booking_date, car_id, total_price, status, pickup_location, duration_hours')
      .order('booking_date', { ascending: false });

    const { data: cars } = await supabase.from('cars').select('id, name, type');
    const carMap: Record<string, { name: string; type: string }> = {};
    (cars || []).forEach((c: any) => { carMap[c.id] = { name: c.name, type: c.type }; });

    const enriched: IncomeRow[] = (bookings || []).map((b: any) => ({
      id: b.id,
      client_name: b.client_name,
      booking_date: b.booking_date,
      car_name: carMap[b.car_id]?.name || 'Unknown',
      car_type: carMap[b.car_id]?.type || '',
      total_price: Number(b.total_price || 0),
      status: b.status,
      pickup_location: b.pickup_location,
      duration_hours: b.duration_hours || 1,
    }));

    setRows(enriched);

    // Monthly aggregation
    const monthMap: Record<string, number> = {};
    enriched.forEach((r) => {
      const month = r.booking_date?.slice(0, 7);
      if (month) monthMap[month] = (monthMap[month] || 0) + r.total_price;
    });
    const sorted = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, income]) => ({ month, income }));
    setMonthlyData(sorted);

    const total = enriched.reduce((s, r) => s + r.total_price, 0);
    const completed = enriched.filter((r) => r.status === 'completed').reduce((s, r) => s + r.total_price, 0);
    const pending = enriched.filter((r) => r.status === 'pending').reduce((s, r) => s + r.total_price, 0);
    setTotals({ total, completed, pending, count: enriched.length });
    setLoading(false);
  };

  const exportToExcel = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Client Name': r.client_name,
      'Car': r.car_name,
      'Car Type': r.car_type,
      'Booking Date': r.booking_date,
      'Duration (hrs)': r.duration_hours,
      'Pickup': r.pickup_location,
      'Income ($)': r.total_price,
      'Status': r.status,
    }));

    // Summary sheet
    const summary = [
      { Metric: 'Total Income', Value: `$${totals.total.toLocaleString()}` },
      { Metric: 'Completed Income', Value: `$${totals.completed.toLocaleString()}` },
      { Metric: 'Pending Income', Value: `$${totals.pending.toLocaleString()}` },
      { Metric: 'Total Bookings', Value: totals.count },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wsSummary = XLSX.utils.json_to_sheet(summary);

    // Column widths
    ws['!cols'] = [
      { wch: 4 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 14 },
      { wch: 14 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, ws, 'Income Details');
    XLSX.writeFile(wb, `SmartMove_Income_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    approved: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-600 border-green-500/30',
    cancelled: 'bg-muted text-muted-foreground border-border',
    rejected: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-green-500/20">
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Income Management</h1>
            <p className="text-sm text-muted-foreground">All booking income and revenue tracking</p>
          </div>
        </div>
        <Button onClick={exportToExcel} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Download className="w-4 h-4" /> Export to Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: `$${totals.total.toLocaleString()}`, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Completed Income', value: `$${totals.completed.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Pending Income', value: `$${totals.pending.toLocaleString()}`, icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Total Bookings', value: totals.count, icon: Car, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Chart */}
      {monthlyData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Monthly Income Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Income']}
                />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--accent))" fill="url(#incomeGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Income Table */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All Booking Income</CardTitle>
          <span className="text-xs text-muted-foreground">{rows.length} records</span>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['#', 'Client', 'Car', 'Date', 'Duration', 'Income', 'Status'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-smooth">
                      <td className="py-2 px-3 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="py-2 px-3 font-medium">{r.client_name}</td>
                      <td className="py-2 px-3">
                        <div>
                          <p>{r.car_name}</p>
                          <p className="text-xs text-muted-foreground">{r.car_type}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{r.booking_date}</td>
                      <td className="py-2 px-3 text-muted-foreground">{r.duration_hours}h</td>
                      <td className="py-2 px-3 font-bold text-accent">${r.total_price.toLocaleString()}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[r.status] || ''}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20">
                    <td colSpan={5} className="py-3 px-3 font-bold text-right text-muted-foreground">Total:</td>
                    <td className="py-3 px-3 font-bold text-accent text-lg">${totals.total.toLocaleString()}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
