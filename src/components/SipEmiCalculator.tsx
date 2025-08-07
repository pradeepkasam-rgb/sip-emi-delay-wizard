import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
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

          <TabsContent value="calculator" className="space-y-6">
            {/* Compact Input Grid */}
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Calculator className="h-5 w-5" />
                  Investment & Loan Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* SIP Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      SIP Investment
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sipAmount">Monthly SIP (₹)</Label>
                      <Input
                        id="sipAmount"
                        type="number"
                        value={sipAmount}
                        onChange={(e) => setSipAmount(Number(e.target.value))}
                        className="font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sipTenure">Investment Period (Years)</Label>
                      <Input
                        id="sipTenure"
                        type="number"
                        value={sipTenure}
                        onChange={(e) => setSipTenure(Number(e.target.value))}
                        className="font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="sipReturn">Expected Return: {sipReturn}%</Label>
                      <Slider
                        id="sipReturn"
                        min={5}
                        max={25}
                        step={0.5}
                        value={[sipReturn]}
                        onValueChange={(value) => setSipReturn(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span>25%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="topupPercentage">Annual Top-up: {topupPercentage}%</Label>
                      <Slider
                        id="topupPercentage"
                        min={0}
                        max={25}
                        step={1}
                        value={[topupPercentage]}
                        onValueChange={(value) => setTopupPercentage(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>25%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="topupMonth">Top-up Month</Label>
                      <select
                        id="topupMonth"
                        value={topupMonth}
                        onChange={(e) => setTopupMonth(Number(e.target.value))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    </div>
                  </div>

                  {/* Loan/EMI Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-accent flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Loan Details
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="emiRate">Interest Rate: {emiRate}%</Label>
                      <Slider
                        id="emiRate"
                        min={5}
                        max={20}
                        step={0.25}
                        value={[emiRate]}
                        onValueChange={(value) => setEmiRate(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5%</span>
                        <span>20%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emiTenure">Loan Tenure (Years)</Label>
                      <Input
                        id="emiTenure"
                        type="number"
                        value={emiTenure}
                        onChange={(e) => setEmiTenure(Number(e.target.value))}
                        className="font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emiStartMonth">EMI Start Month</Label>
                      <Input
                        id="emiStartMonth"
                        type="number"
                        min="1"
                        max={sipTenure * 12}
                        value={emiStartMonth}
                        onChange={(e) => setEmiStartMonth(Number(e.target.value))}
                        className="font-semibold"
                      />
                      <p className="text-xs text-muted-foreground">Month when EMI starts</p>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Results
                    </h3>
                    
                    {result && (
                      <div className="space-y-3">
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Investment</p>
                          <p className="text-lg font-bold text-foreground">{formatCurrency(result.sipInvestment)}</p>
                        </div>
                        
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Monthly EMI via SWP</p>
                          <p className="text-lg font-bold text-destructive">{formatCurrency(result.emiMonthly)}</p>
                        </div>
                        
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total EMI Paid</p>
                          <p className="text-lg font-bold text-destructive">{formatCurrency(result.totalSWPWithdrawn)}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-success/10 to-success/5 p-3 rounded-lg border border-success/20">
                          <p className="text-sm text-muted-foreground">Final Corpus</p>
                          <p className="text-xl font-bold text-success">{formatCurrency(result.finalCorpus)}</p>
                        </div>
                        
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Returns</p>
                          <p className="text-lg font-bold text-accent">{formatCurrency(result.totalReturns)}</p>
                        </div>
                        
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Effective Annual Return</p>
                          <p className="text-lg font-bold text-primary">
                            {((result.totalReturns / result.sipInvestment) * 100 / sipTenure).toFixed(2)}% p.a.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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