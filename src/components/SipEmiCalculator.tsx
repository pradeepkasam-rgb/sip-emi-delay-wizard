import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, CreditCard, PiggyBank } from 'lucide-react';

interface CalculationResult {
  sipInvestment: number;
  sipMaturityAmount: number;
  sipReturns: number;
  emiPaid: number;
  netWealth: number;
  finalCorpus: number;
}

const SipEmiCalculator = () => {
  const [sipAmount, setSipAmount] = useState<number>(5000);
  const [sipTenure, setSipTenure] = useState<number>(10);
  const [sipReturn, setSipReturn] = useState<number>(12);
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [emiRate, setEmiRate] = useState<number>(8.5);
  const [emiTenure, setEmiTenure] = useState<number>(6);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateSIP = (monthlyAmount: number, years: number, annualRate: number): number => {
    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;
    return monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  };

  const calculateEMI = (principal: number, annualRate: number, years: number): number => {
    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const performCalculation = () => {
    // SIP calculation for full tenure
    const sipMaturityAmount = calculateSIP(sipAmount, sipTenure, sipReturn);
    const sipInvestment = sipAmount * sipTenure * 12;
    const sipReturns = sipMaturityAmount - sipInvestment;

    // EMI calculation (starts after 2 years)
    const emiMonthly = calculateEMI(loanAmount, emiRate, emiTenure);
    const totalEmiPaid = emiMonthly * emiTenure * 12;

    // Calculate corpus value when EMI starts (after 2 years)
    const corpusAfter2Years = calculateSIP(sipAmount, 2, sipReturn);
    
    // Calculate remaining SIP growth while paying EMI (next emiTenure years)
    const sipDuringEmiPeriod = calculateSIP(sipAmount, emiTenure, sipReturn);
    
    // Calculate final corpus considering EMI payments
    // Corpus after 2 years grows during EMI period + new SIP contributions - EMI payments
    const corpusGrowthDuringEmi = corpusAfter2Years * Math.pow(1 + sipReturn / 100, emiTenure);
    const finalCorpus = corpusGrowthDuringEmi + sipDuringEmiPeriod - totalEmiPaid;
    
    // If SIP continues after EMI ends
    const remainingYears = sipTenure - 2 - emiTenure;
    let netWealth = finalCorpus;
    
    if (remainingYears > 0) {
      const remainingSipGrowth = calculateSIP(sipAmount, remainingYears, sipReturn);
      const existingCorpusGrowth = finalCorpus * Math.pow(1 + sipReturn / 100, remainingYears);
      netWealth = existingCorpusGrowth + remainingSipGrowth;
    }

    setResult({
      sipInvestment,
      sipMaturityAmount,
      sipReturns,
      emiPaid: totalEmiPaid,
      netWealth: Math.max(netWealth, 0),
      finalCorpus: Math.max(finalCorpus, 0)
    });
  };

  useEffect(() => {
    performCalculation();
  }, [sipAmount, sipTenure, sipReturn, loanAmount, emiRate, emiTenure]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-4xl font-bold text-foreground">SIP + EMI Calculator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your investments and loans together. Calculate your net wealth when EMI starts 2 years after SIP begins.
          </p>
        </div>

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
                  <Label htmlFor="sipAmount">Monthly SIP Amount</Label>
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
              </CardContent>
            </Card>

            {/* EMI Card */}
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <CreditCard className="h-5 w-5" />
                  EMI Details (Starts after 2 years)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
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
                      <h3 className="font-semibold text-primary">SIP Investment Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Investment</p>
                          <p className="text-lg font-bold text-foreground">{formatCurrency(result.sipInvestment)}</p>
                        </div>
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Returns Generated</p>
                          <p className="text-lg font-bold text-accent">{formatCurrency(result.sipReturns)}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* EMI Results */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-accent">EMI Payment Details</h3>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total EMI Paid</p>
                        <p className="text-lg font-bold text-destructive">{formatCurrency(result.emiPaid)}</p>
                      </div>
                      <div className="bg-background/60 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Monthly EMI</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(calculateEMI(loanAmount, emiRate, emiTenure))}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Final Results */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-success">Net Wealth Summary</h3>
                      <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 rounded-lg border border-success/20">
                        <p className="text-sm text-muted-foreground mb-1">Final Net Wealth</p>
                        <p className="text-2xl font-bold text-success">{formatCurrency(result.netWealth)}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-muted-foreground">SIP Maturity (without EMI)</p>
                          <p className="font-semibold text-primary">{formatCurrency(result.sipMaturityAmount)}</p>
                        </div>
                        <div className="bg-background/60 p-3 rounded-lg">
                          <p className="text-muted-foreground">Impact of EMI</p>
                          <p className="font-semibold text-destructive">-{formatCurrency(result.sipMaturityAmount - result.netWealth)}</p>
                        </div>
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
                  <h4 className="font-semibold text-foreground">How it works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SIP investments start immediately and continue for the full tenure</li>
                    <li>• EMI payments begin after 2 years of SIP investments</li>
                    <li>• The calculator shows your net wealth after accounting for both</li>
                    <li>• Results help you plan loans while maintaining investments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SipEmiCalculator;