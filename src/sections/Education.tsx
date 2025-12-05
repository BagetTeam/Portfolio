import { dummyContent } from "../data/dummydata";

export default function Education() {
  return (
    <div className="space-y-8">
      {dummyContent.education.map((edu, idx) => (
        <div key={idx} className="border-l-4 border-yellow-600 pl-6 py-2">
          <h3 className="text-2xl font-bold text-gray-900">{edu.degree}</h3>
          <p className="text-lg text-gray-700 font-semibold">
            {edu.institution}
          </p>
          {edu.period && (
            <p className="text-sm text-gray-600 mb-3">{edu.period}</p>
          )}
          {edu.gpa && (
            <p className="text-gray-800 font-semibold mb-3">GPA: {edu.gpa}</p>
          )}
          {edu.highlights && (
            <ul className="list-disc list-inside text-gray-800 space-y-2 ml-2">
              {edu.highlights.map((highlight, i) => (
                <li key={i} className="leading-relaxed">
                  {highlight}
                </li>
              ))}
            </ul>
          )}
          {edu.courses && (
            <ul className="list-disc list-inside text-gray-800 space-y-2 ml-2">
              {edu.courses.map((course, i) => (
                <li key={i} className="leading-relaxed">
                  {course}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
