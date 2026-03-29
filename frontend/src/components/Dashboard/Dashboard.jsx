import React, { Suspense, lazy } from "react";

const ExecutionDashboard = lazy(() => import("./ExecutionDashboard"));

export default function Dashboard() {
    return (
        <div className="min-h-full font-sans">
            <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading dashboard...</div>}>
                <ExecutionDashboard />
            </Suspense>
        </div>
    );
}
