import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ScanDetails from "@/pages/ScanDetails";
import ScanReport from "@/pages/ScanReport";
import NotFound from "@/pages/not-found";
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Home }), _jsx(Route, { path: "/scans/:id", component: ScanDetails }), _jsx(Route, { path: "/report/:id", component: ScanReport }), _jsx(Route, { component: NotFound })] }));
}
export default function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Router, {})] }) }));
}
