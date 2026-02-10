import { ArrowLeft, User, Calendar, TrendingUp } from "lucide-react";
import ProductivityChart from "../components/ProductivityChart";
import ConsistencyChart from "../components/ConsistencyChart";
import Stability from "../components/StabilityChart";
import BISGauge from "../components/BISGauge";
import InsightsTable from "../components/InsightsTable";
import RadarMetrics from "../components/RadarMetrics";

const ReviewAnalytics = ({ analysisData, onBackToAnalysis }) => {
  // Show placeholder if no data
  if (!analysisData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Analysis Data
          </h2>
          <p className="text-gray-600 mb-6">
            Run a BIS analysis from the "BIS Comparison" tab to view performance
            insights.
          </p>
          <button
            onClick={onBackToAnalysis}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to BIS Analysis
          </button>
        </div>
      </div>
    );
  }

  const { bisResult, employeeName, dateRanges } = analysisData;

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endDate = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <button
          onClick={onBackToAnalysis}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to BIS Analysis
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-pink-100 rounded-xl">
            <TrendingUp className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Performance Analytics Report
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed behavioral intervention analysis results
            </p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-pink-200">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-pink-600" />
              <p className="text-xs font-semibold text-pink-700 uppercase">
                Employee
              </p>
            </div>
            <p className="text-lg font-bold text-pink-900">{employeeName}</p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-semibold text-purple-700 uppercase">
                Pre-Review Period
              </p>
            </div>
            <p className="text-sm font-bold text-purple-900">
              {formatDateRange(dateRanges.preStart, dateRanges.preEnd)}
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-700 uppercase">
                Post-Review Period
              </p>
            </div>
            <p className="text-sm font-bold text-green-900">
              {formatDateRange(dateRanges.postStart, dateRanges.postEnd)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProductivityChart pre={bisResult.Pre_Avg} post={bisResult.Post_Avg} />

        <ConsistencyChart
          pre={bisResult.Const_Before}
          post={bisResult.Const_After}
        />

        <Stability
          pre={bisResult.Stability_Before}
          post={bisResult.Stability_After}
        />

        <BISGauge score={bisResult.BIS} />

        <InsightsTable res={bisResult} />

        <RadarMetrics result={bisResult} />
      </div>

      {/* Metric Definitions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          📖 Understanding the Metrics
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          These metrics are calculated from employee daily logs before and after
          the evaluation period.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          {/* Productivity */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-1">Productivity</h3>
            <p className="text-gray-700 leading-relaxed">
              Measures progress, work completion, task engagement, and learning
              frequency. Higher values indicate improved output and
              contribution.
            </p>
          </div>

          {/* Consistency */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-700 mb-1">Consistency</h3>
            <p className="text-gray-700 leading-relaxed">
              Measures behavioral reliability and task stability over time. Low
              variation = stronger routines & reduced fluctuation in
              performance.
            </p>
          </div>

          {/* Stability */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-700 mb-1">Stability</h3>
            <p className="text-gray-700 leading-relaxed">
              Indicates emotional & performance steadiness. Lower volatility
              suggests controlled workflow, fewer interruptions, and smoother
              delivery.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-700 mb-1">
            📌 BIS Score (Behavior Improvement Score)
          </h3>
          <p className="text-gray-700 text-sm">
            The BIS score summarizes overall growth from pre to post-review. A
            higher BIS score means the employee improved across productivity,
            consistency, and stability after the intervention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics;
