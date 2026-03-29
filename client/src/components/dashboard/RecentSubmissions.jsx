import { Link } from "react-router-dom";
import Submissions from "../contest/Submissions";

export default function RecentSubmissions() {
  return (
    <div className="space-y-4">
      {/* Header for the Widget */}
      <div className="flex items-end justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight">Recent Submissions</h3>
        <Link
          to="/submissions"
          className="text-sm font-medium text-brand-yellow hover:text-white transition-colors"
        >
          View All
        </Link>
      </div>
      <Submissions limit={5} isWidget={true} />
      
    </div>
  );
}
