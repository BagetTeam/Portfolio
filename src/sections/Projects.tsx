import { dummyContent } from "../data/dummydata";

export default function Projects() {
  return (
    <div className="space-y-8">
      {dummyContent.projects.map((project, idx) => (
        <div key={idx} className="border-l-4 border-green-600 pl-6 py-2">
          <h3 className="text-2xl font-bold text-gray-900">{project.title}</h3>
          <p className="text-gray-800 mb-4 leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {project.technologies.map((tech, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-green-600 text-white rounded font-semibold text-sm shadow-md hover:bg-green-700 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
          <a
            href={`https://${project.link}`}
            className="text-green-700 hover:text-green-900 font-semibold underline text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 {project.link}
          </a>
        </div>
      ))}
    </div>
  );
}
