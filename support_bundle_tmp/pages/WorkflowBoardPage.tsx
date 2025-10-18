import React from "react";
import WorkflowBoard from "../components/WorkflowBoard";

const WorkflowBoardPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Workflow Board</h1>
        <p className="text-gray-600 dark:text-gray-400">Track all clients through the end-to-end pipeline.</p>
      </div>
      <WorkflowBoard />
    </div>
  );
};

export default WorkflowBoardPage;
