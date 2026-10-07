import React, { useState } from 'react';
import { Bot, FileText, ChevronDown, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { aiReportService } from '../../services/aiReportService';
import { OwnerAIReport } from '../../types';
import { useToastStore } from '../../store/useToastStore';

export const OwnerAIReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('WEEKLY');
  const [report, setReport] = useState<OwnerAIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToastStore();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReport(null);
    try {
      const generated = await aiReportService.generateReport(period, 'rest_dehradun_01');
      setReport(generated);
      showToast({ message: 'Report generated successfully', type: 'success' });
    } catch (error) {
      showToast({ message: 'Failed to generate report', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bot className="w-6 h-6 mr-2 text-indigo-600" />
            AI Business Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">Get AI-powered insights and recommendations for your business</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="DAILY">Daily Report</option>
              <option value="WEEKLY">Weekly Report</option>
              <option value="MONTHLY">Monthly Report</option>
              <option value="YEARLY">Yearly Report</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
          >
            {isGenerating ? (
              <>
                <Bot className="w-4 h-4 mr-2 animate-bounce" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Bot className="w-12 h-12 text-indigo-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">AI is analyzing your data...</h3>
          <p className="text-indigo-600 max-w-md">Processing orders, reviews, and operational metrics to generate actionable insights.</p>
        </div>
      )}

      {!isGenerating && report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{period.charAt(0) + period.slice(1).toLowerCase()} Executive Summary</h2>
              <span className="text-indigo-200 text-sm">{new Date(report.generatedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-lg text-indigo-50 leading-relaxed">"{report.summary}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{report.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{report.ordersCount}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{report.averageOrderValue}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Cancellation Rate</p>
              <p className="text-2xl font-bold text-gray-900">{report.cancellationRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start bg-yellow-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-800 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Top Dishes */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Moving Items</h3>
                <div className="space-y-3">
                  {report.topDishes.map((dish, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center">
                        <span className="text-gray-400 font-medium mr-3">{idx + 1}</span>
                        <span className="font-medium text-gray-800">{dish.name}</span>
                      </div>
                      <span className="text-sm bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                        {dish.salesCount} orders
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation Insights */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Cancellation Drivers
                </h3>
                <div className="space-y-3">
                  {report.cancellationReasons.map((reason, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{reason.reason}</span>
                        <span className="font-medium text-gray-900">{reason.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-red-400 h-1.5 rounded-full" 
                          style={{ width: `${reason.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isGenerating && !report && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm mt-8">
          <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>Select a period and click Generate Report to view AI insights.</p>
        </div>
      )}
    </div>
  );
};
