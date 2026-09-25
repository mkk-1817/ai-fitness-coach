'use client';

import React from 'react';
import { AnalyticsCharts } from '@/components/progress/AnalyticsCharts';
import { MeasurementTracker } from '@/components/progress/MeasurementTracker';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <AnalyticsCharts />
      <MeasurementTracker />
    </div>
  );
}
