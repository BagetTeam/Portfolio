import { dummyContent } from "../data/dummydata";

export default function Experience() {
  return (
    <div className="space-y-8">
      {dummyContent.experience.map((exp, idx) => (
        <div key={idx} className="border-l-4 border-blue-600 pl-6 py-2">
          <h3 className="text-2xl font-bold text-gray-900">{exp.title}</h3>
          <p className="text-lg text-gray-700 font-semibold">{exp.company}</p>
          <p className="text-sm text-gray-600 mb-3">{exp.period}</p>
          <p className="text-gray-800 mb-4 leading-relaxed">
            {exp.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {exp.technologies.map((tech, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm shadow-md hover:bg-blue-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
