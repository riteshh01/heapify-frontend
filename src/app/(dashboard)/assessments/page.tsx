/**
 * Assessments Page — 2010s design system
 */

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AssessmentsPage() {
  const assessments = [
    { id: 1, title: "DSA Quiz - Arrays", type: "Quiz", duration: 30, questions: 20 },
    { id: 2, title: "Mock Interview - System Design", type: "Mock Test", duration: 120, questions: 5 },
    { id: 3, title: "Coding Challenge - DP", type: "Challenge", duration: 60, questions: 3 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b] dark:text-[#f8fafc]">Assessments</h1>
        <p className="text-[#64748b] dark:text-[#94a3b8] mt-2 text-sm">Test your knowledge with quizzes and challenges</p>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#334155] dark:text-[#f1f5f9]">{assessment.title}</h3>
                  <p className="text-sm text-[#64748b] dark:text-[#94a3b8]">
                    {assessment.type} • {assessment.questions} questions • {assessment.duration} min
                  </p>
                </div>
                <Button>Start</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
