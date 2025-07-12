interface ProblemDescriptionProps {
  title: string;
  description: string;
  definition: {
    text: string;
    formula: string;
    note: string;
  };
  tip: string;
  examples: string[];
  task: {
    description: string;
    requirements: string[];
  };
}

export default function ProblemDescription({
  title,
  description,
  definition,
  tip,
  examples,
  task
}: ProblemDescriptionProps) {
  return (
    <>
      <h2 className="text-2xl font-medium mb-4">{title}</h2>

      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
          <p className="text-gray-700">{description}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Definition</h4>
          <p className="text-gray-700">
            {definition.text}
            <br />
            {definition.formula}
          </p>
          <p className="text-gray-700 mt-2">{definition.note}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
          <strong className="text-yellow-800">Tip:</strong>
          <span className="text-yellow-700"> {tip}</span>
        </div>

        <div>
          <h4 className="font-medium mb-2">Examples</h4>
          <div className="bg-gray-50 p-3 rounded font-mono text-sm">
            {examples.map((example, index) => (
              <div key={index}>{example}</div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Task</h4>
          <p className="text-gray-700">{task.description}</p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            {task.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
