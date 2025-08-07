import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, TrendingUp, CreditCard, PiggyBank, Table as TableIcon, ArrowDownCircle } from 'lucide-react';

interface MonthlyData {
  month: number;
  year: number;
  sipInvestment: number;
  corpusBeforeSWP: number;
  swpWithdrawal: number;
  netCorpus: number;
}

interface CalculationResult {
  sipInvestment: number;
  totalSWPWithdrawn: number;
  finalCorpus: number;
  totalReturns: number;
  monthlyData: MonthlyData[];
  emiMonthly: number;
}

const SipEmiCalculator = () => {
  const [sipAmount, setSipAmount] = useState<number>(5000);
  const [sipTenure, setSipTenure] = useState<number>(10);
  const [sipReturn, setSipReturn] = useState<number>(12);
  const [topupPercentage, setTopupPercentage] = useState<number>(10);
  const [topupMonth, setTopupMonth] = useState<number>(4); // April (1-based)
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [emiRate, setEmiRate] = useState<number>(8.5);
  const [emiTenure, setEmiTenure] = useState<number>(6);
  const [emiStartMonth, setEmiStartMonth] = useState<number>(25); // Month when EMI starts (1-based)
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateEMI = (principal: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const performCalculation = () => {
    const monthlyReturnRate = sipReturn / (12 * 100);
    const sipTotalMonths = sipTenure * 12;
    const emiMonthly = calculateEMI(loanAmount, emiRate, emiTenure);
    const emiEndMonth = emiStartMonth + (emiTenure * 12) - 1;
    const totalMonths = Math.max(sipTotalMonths, emiEndMonth);
    
    let currentCorpus = 0;
    let totalSWPWithdrawn = 0;
    let totalSipInvestment = 0;
    const monthlyData: MonthlyData[] = [];
    let currentSipAmount = sipAmount;

    for (let month = 1; month <= totalMonths; month++) {
      // Apply returns to existing corpus
      currentCorpus = currentCorpus * (1 + monthlyReturnRate);
      
      const year = Math.ceil(month / 12);
      const monthInYear = ((month - 1) % 12) + 1;
      
      // Check for SIP top-up (increase SIP amount in the specified month each year, starting from year 2)
      if (monthInYear === topupMonth && year > 1 && month === ((year - 1) * 12) + topupMonth) {
        currentSipAmount = currentSipAmount * (1 + topupPercentage / 100);
      }
      
      // Add monthly SIP only during SIP period
      let sipInvestmentThisMonth = 0;
      if (month <= sipTotalMonths) {
        currentCorpus += currentSipAmount;
        totalSipInvestment += currentSipAmount;
        sipInvestmentThisMonth = currentSipAmount;
      }
      
      const corpusBeforeSWP = currentCorpus;
      let swpWithdrawal = 0;
      
      // Check if EMI period is active
      if (month >= emiStartMonth && month <= emiEndMonth) {
        swpWithdrawal = emiMonthly;
        currentCorpus -= swpWithdrawal;
        totalSWPWithdrawn += swpWithdrawal;
      }
      
      monthlyData.push({
        month: monthInYear,
        year,
        sipInvestment: sipInvestmentThisMonth,
        corpusBeforeSWP,
        swpWithdrawal,
        netCorpus: currentCorpus
      });
    }

    const totalReturns = currentCorpus + totalSWPWithdrawn - totalSipInvestment;
    
    setResult({
      sipInvestment: totalSipInvestment,
      totalSWPWithdrawn,
      finalCorpus: currentCorpus,
      totalReturns,
      monthlyData,
      emiMonthly
    });
  };

  useEffect(() => {
    performCalculation();
  }, [sipAmount, sipTenure, sipReturn, topupPercentage, topupMonth, loanAmount, emiRate, emiTenure, emiStartMonth]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">SIP + SWP EMI Calculator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your investments with SWP-based EMI payments. EMI is paid through systematic withdrawal from your mutual fund corpus.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Monthly Breakdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Cards */}
              <div className="space-y-6">
                {/* SIP Card */}
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <PiggyBank className="h-5 w-5" />
                      SIP Investment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sipAmount">Monthly SIP Amount (₹)</Label>
                      <Input
                        id="sipAmount"
                        type="number"
                        value={sipAmount}
                        onChange={(e) => setSipAmount(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sipTenure">Investment Period (Years)</Label>
                      <Input
                        id="sipTenure"
                        type="number"
                        value={sipTenure}
                        onChange={(e) => setSipTenure(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sipReturn">Expected Annual Return (%)</Label>
                      <Input
                        id="sipReturn"
                        type="number"
                        step="0.1"
                        value={sipReturn}
                        onChange={(e) => setSipReturn(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topupPercentage">Annual SIP Top-up (%)</Label>
                      <Input
                        id="topupPercentage"
                        type="number"
                        step="0.1"
                        value={topupPercentage}
                        onChange={(e) => setTopupPercentage(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">Percentage increase in SIP amount each year</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topupMonth">Top-up Month</Label>
                      <select
                        id="topupMonth"
                        value={topupMonth}
                        onChange={(e) => setTopupMonth(Number(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-lg font-semibold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value={1}>January</option>
                        <option value={2}>February</option>
                        <option value={3}>March</option>
                        <option value={4}>April</option>
                        <option value={5}>May</option>
                        <option value={6}>June</option>
                        <option value={7}>July</option>
                        <option value={8}>August</option>
                        <option value={9}>September</option>
                        <option value={10}>October</option>
                        <option value={11}>November</option>
                        <option value={12}>December</option>
                      </select>
                      <p className="text-xs text-muted-foreground">Month when annual SIP increase happens</p>
                    </div>
                  </CardContent>
                </Card>

                {/* EMI Card */}
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <ArrowDownCircle className="h-5 w-5" />
                      SWP EMI Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emiStartMonth">EMI Start Month</Label>
                      <Input
                        id="emiStartMonth"
                        type="number"
                        min="1"
                        max={sipTenure * 12}
                        value={emiStartMonth}
                        onChange={(e) => setEmiStartMonth(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">Month number when EMI starts (1 = first month)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emiRate">Interest Rate (% per annum)</Label>
                      <Input
                        id="emiRate"
                        type="number"
                        step="0.1"
                        value={emiRate}
                        onChange={(e) => setEmiRate(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emiTenure">Loan Tenure (Years)</Label>
                      <Input
                        id="emiTenure"
                        type="number"
                        value={emiTenure}
                        onChange={(e) => setEmiTenure(Number(e.target.value))}
                        className="text-lg font-semibold"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Card */}
              <div className="space-y-6">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <TrendingUp className="h-5 w-5" />
                      Calculation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {result && (
                      <>
                        {/* SIP Results */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-primary">Investment Overview</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Total Investment</p>
                              <p className="text-lg font-bold text-foreground">{formatCurrency(result.sipInvestment)}</p>
                            </div>
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Total Returns</p>
                              <p className="text-lg font-bold text-accent">{formatCurrency(result.totalReturns)}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* EMI Loan Details */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-accent">EMI Loan Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Loan Amount</p>
                              <p className="text-lg font-bold text-foreground">{formatCurrency(loanAmount)}</p>
                            </div>
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Interest Rate</p>
                              <p className="text-lg font-bold text-foreground">{emiRate}% p.a.</p>
                            </div>
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">EMI Tenure</p>
                              <p className="text-lg font-bold text-foreground">{emiTenure} years</p>
                            </div>
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">EMI Start Month</p>
                              <p className="text-lg font-bold text-foreground">Month {emiStartMonth}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* SWP Results */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-destructive">SWP EMI Payments</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Monthly EMI via SWP</p>
                              <p className="text-lg font-bold text-destructive">{formatCurrency(result.emiMonthly)}</p>
                            </div>
                            <div className="bg-background/60 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Total EMI Paid via SWP</p>
                              <p className="text-lg font-bold text-destructive">{formatCurrency(result.totalSWPWithdrawn)}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Final Results */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-success">Final Corpus</h3>
                          <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 rounded-lg border border-success/20">
                            <p className="text-sm text-muted-foreground mb-1">Remaining Corpus After SWP</p>
                            <p className="text-2xl font-bold text-success">{formatCurrency(result.finalCorpus)}</p>
                          </div>
                          
                          <div className="bg-background/60 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Effective Annual Return</p>
                            <p className="text-lg font-bold text-primary">
                              {((result.totalReturns / result.sipInvestment) * 100 / sipTenure).toFixed(2)}% p.a.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="shadow-lg border-0 bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">How SWP EMI works:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• SIP investments continue throughout the entire period</li>
                        <li>• EMI is paid via SWP from your mutual fund corpus</li>
                        <li>• You can choose when EMI payments start</li>
                        <li>• Final corpus shows remaining amount after all SWP withdrawals</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <TableIcon className="h-5 w-5" />
                  Month-wise Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background">Period</TableHead>
                        <TableHead className="sticky top-0 bg-background text-right">SIP Investment</TableHead>
                        <TableHead className="sticky top-0 bg-background text-right">Corpus (Before SWP)</TableHead>
                        <TableHead className="sticky top-0 bg-background text-right">EMI via SWP</TableHead>
                        <TableHead className="sticky top-0 bg-background text-right">Net Corpus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result?.monthlyData.map((data, index) => (
                        <TableRow key={index} className={data.swpWithdrawal > 0 ? "bg-destructive/5" : ""}>
                          <TableCell className="font-medium">
                            {getMonthName(data.month)} {data.year}
                          </TableCell>
                          <TableCell className="text-right text-success">
                            {formatCurrency(data.sipInvestment)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(data.corpusBeforeSWP)}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {data.swpWithdrawal > 0 ? formatCurrency(data.swpWithdrawal) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(data.netCorpus)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SipEmiCalculator;