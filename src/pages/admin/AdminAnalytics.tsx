import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  Eye,
  MousePointer,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface VisitorLog {
  id: number;
  ip: string;
  location: string;
  device: string;
  browser: string;
  page: string;
  timestamp: string;
  duration: string;
  referrer: string;
}

interface DailyStat {
  date: string;
  visitors: number;
  pageViews: number;
  newUsers: number;
}

interface PageStat {
  page: string;
  views: number;
  uniqueViews: number;
}

const AdminAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todaysStats, setTodaysStats] = useState({
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [pageStats, setPageStats] = useState<PageStat[]>([]);


  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsRefreshing(true);
        // TODO: Replace with actual API calls
        // For now, we'll use empty data
        setVisitorLogs([]);
        setDailyStats([]);
        setPageStats([]);
        setTodaysStats({
          totalVisitors: 0,
          uniqueVisitors: 0,
          pageViews: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Nu s-au putut încărca datele de analiză');
      } finally {
        setIsRefreshing(false);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // TODO: Implement actual refresh logic
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter logs based on selected period
  const filteredLogs = visitorLogs.slice(0, 10); // Show only first 10 logs

  const handleExport = () => {
    // Simulate CSV export
    const csvContent = filteredLogs
      .map(
        (log) =>
          `${log.timestamp},${log.ip},${log.location},${log.device},${log.browser},${log.page},${log.duration},${log.referrer}`,
      )
      .join("\n");

    const header =
      "Timestamp,IP,Location,Device,Browser,Page,Duration,Referrer\n";
    const blob = new Blob([header + csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitor-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return "📱";
      case "tablet":
        return "📱";
      case "desktop":
        return "💻";
      default:
        return "💻";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Loguri
          </h1>
          <p className="text-gray-600 mt-2">
            Monitorizează traficul și comportamentul vizitatorilor
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Ultimele 24h</SelectItem>
              <SelectItem value="7d">Ultimele 7 zile</SelectItem>
              <SelectItem value="30d">Ultimele 30 zile</SelectItem>
              <SelectItem value="90d">Ultimele 90 zile</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Se actualizează..." : "Actualizează"}
          </Button>
          <Button
            onClick={handleExport}
            className="bg-red-600 hover:bg-red-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vizitatori Totali
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysStats.totalVisitors}
            </div>
            <p className="text-xs text-green-600">+12% față de ieri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vizitatori Unici
            </CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysStats.uniqueVisitors}
            </div>
            <p className="text-xs text-green-600">+8% față de ieri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vizualizări</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysStats.pageViews}</div>
            <p className="text-xs text-green-600">+15% față de ieri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durata Medie</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysStats.avgSessionDuration}
            </div>
            <p className="text-xs text-green-600">+5% față de ieri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata de Respingere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysStats.bounceRate}</div>
            <p className="text-xs text-red-600">+2% față de ieri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Țara Principală
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🇷🇴</div>
            <p className="text-xs text-gray-600">România</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trafic pe Site</CardTitle>
            <CardDescription>
              Vizitatori și afișări în ultimele{" "}
              {selectedPeriod === "7d" ? "7 zile" : "30 de zile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Vizitatori"
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Afișări Pagină"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagini Populare</CardTitle>
            <CardDescription>Cele mai vizitate pagini</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#dc2626" name="Vizualizări Totale" />
                <Bar
                  dataKey="uniqueViews"
                  fill="#16a34a"
                  name="Vizualizări Unice"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Visitor Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Loguri Vizitatori în Timp Real</CardTitle>
          <CardDescription>
            Ultimele sesiuni de vizitatori pe site (actualizat automat)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Locație</TableHead>
                <TableHead>Dispozitiv</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Pagină</TableHead>
                <TableHead>Durata</TableHead>
                <TableHead>Sursă</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitorLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm font-mono">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">🇷🇴</span>
                      <span className="text-sm">{log.location}</span>
                    </div>
                    <div className="text-xs text-gray-500">{log.ip}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getDeviceIcon(log.device)}</span>
                      <span className="text-sm">{log.device}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{log.browser}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.page}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {log.duration}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        log.referrer === "Direct"
                          ? "secondary"
                          : log.referrer.includes("Google")
                            ? "default"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {log.referrer}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
