/**
 * DSA Learning Path Page
 */

import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DSAPage() {
  const topics = [
    { id: 1, name: "Arrays & Strings", problems: 45, completed: 12 },
    { id: 2, name: "Linked Lists", problems: 35, completed: 8 },
    { id: 3, name: "Trees & Graphs", problems: 60, completed: 15 },
    { id: 4, name: "Dynamic Programming", problems: 50, completed: 5 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Structures & Algorithms</h1>
        <p className="text-gray-600 mt-2">Master DSA with 190+ problems</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardBody>
              <h3 className="text-xl font-bold text-gray-900">{topic.name}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {topic.completed} / {topic.problems} problems solved
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(topic.completed / topic.problems) * 100}%` }}
                />
              </div>
              <Button className="w-full mt-4">Start Learning</Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
