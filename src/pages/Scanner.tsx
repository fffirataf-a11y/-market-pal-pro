import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ScanBarcode,
  Camera,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Scanner = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setScanning(false);
      setScannedProduct({
        name: "Organic Whole Milk",
        barcode: "1234567890123",
        category: "Dairy",
        brand: "Happy Farms",
        healthScore: 7.5,
        insights: [
          {
            type: "positive",
            text: "Good source of calcium and protein",
          },
          {
            type: "warning",
            text: "High in saturated fat - consume in moderation",
          },
          {
            type: "neutral",
            text: "No artificial additives or preservatives",
          },
        ],
      });
    }, 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-4xl py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/lists")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Barcode Scanner</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl py-6 space-y-6">
        {!scannedProduct ? (
          <div className="space-y-6">
            {/* Scanner Card */}
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center">
                    <ScanBarcode className="w-12 h-12 text-primary-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Scan Product Barcode</h2>
                  <p className="text-muted-foreground">
                    Get instant health insights and product information
                  </p>
                </div>

                {scanning ? (
                  <div className="py-8">
                    <div className="relative w-48 h-48 mx-auto">
                      <div className="absolute inset-0 rounded-lg border-4 border-primary animate-pulse" />
                      <div className="absolute inset-4 rounded-lg border-2 border-primary/50 animate-pulse delay-150" />
                      <Camera className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Scanning product...
                    </p>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="w-full h-14 text-base font-semibold"
                    onClick={handleScan}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start Scanning
                  </Button>
                )}
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">How it works</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    Scan any product barcode to get detailed information
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    Receive health insights and nutritional recommendations
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>Add scanned items directly to your shopping lists</span>
                </li>
              </ul>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Info */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      {scannedProduct.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {scannedProduct.brand}
                    </p>
                    <Badge variant="secondary">{scannedProduct.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {scannedProduct.healthScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Health Score
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Barcode: {scannedProduct.barcode}
                  </p>
                </div>
              </div>
            </Card>

            {/* Health Insights */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Health Insights</h3>
              <div className="space-y-4">
                {scannedProduct.insights.map(
                  (insight: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      {getInsightIcon(insight.type)}
                      <p className="text-sm flex-1">{insight.text}</p>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full h-12 font-semibold" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add to Shopping List
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                size="lg"
                onClick={() => {
                  setScannedProduct(null);
                  handleScan();
                }}
              >
                <ScanBarcode className="mr-2 h-5 w-5" />
                Scan Another Product
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scanner;
