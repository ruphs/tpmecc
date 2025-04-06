import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">NSG</h1>
            <h2 className="text-2xl text-indigo-700 mb-4">Programmer & Geologist</h2>
            <p className="text-gray-600 mb-6">
              Combining programming expertise with geological knowledge to solve real-world field problems.
              Specializing in Python and C++ development with a focus on practical applications in geological studies.
            </p>
            <div className="flex space-x-4">
              <Link 
                to="/contact" 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact Me
              </Link>
              <Link 
                to="/tools" 
                className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                View My Tools
              </Link>
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
            <div className="w-48 h-48 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
        <p className="text-gray-600 mb-4">
          I am a passionate programmer and geology student based in Madrid, Spain. Currently in my third year of geology studies at UCM,
          I combine my academic knowledge with programming skills to develop innovative solutions for geological field problems.
        </p>
        <p className="text-gray-600">
          With years of experience in Python and C++ programming, I've worked on various projects including AI training with OpenCV
          and image processing applications. I'm particularly interested in applying programming solutions to geological challenges.
        </p>
      </div>
      
      {/* Resume Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume</h2>
        
        {/* Education */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Education</h3>
          <div className="border-l-2 border-indigo-200 pl-4">
            <div className="mb-4">
              <h4 className="text-lg font-medium">Bachillerato</h4>
              <p className="text-gray-600">Graduated: 2016</p>
            </div>
            <div>
              <h4 className="text-lg font-medium">Geology - Universidad Complutense de Madrid (UCM)</h4>
              <p className="text-gray-600">Third year student (Part-Time)</p>
            </div>
          </div>
        </div>
        
        {/* Experience */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Professional Experience</h3>
          
          <div className="border-l-2 border-indigo-200 pl-4 mb-6">
            <h4 className="text-lg font-medium">Freelance Marketing Team Leader</h4>
            <p className="text-gray-600 mb-2">2016 – Present | Remote</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Managed multiple projects simultaneously, ensuring timely delivery and high-quality results.</li>
              <li>Conducted market research and data analysis to optimize marketing campaigns and drive client growth.</li>
              <li>Fostered strong client relationships through effective communication and project management.</li>
            </ul>
          </div>
          
          <div className="border-l-2 border-indigo-200 pl-4">
            <h4 className="text-lg font-medium">Python and C++ Programmer</h4>
            <p className="text-gray-600 mb-2">2016 – Present | Remote</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Developed a wide range of solutions for clients, demonstrating proficiency in Python programming.</li>
              <li>Built and maintained a substantial portfolio showcasing various applications and projects.</li>
              <li>Utilized OpenCV for intermediate-level AI training and image processing projects.</li>
              <li>Collaborated with clients to understand their needs and deliver customized programming solutions.</li>
              <li>Later C++ Production implementation.</li>
            </ul>
          </div>
        </div>
        
        {/* Skills */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Skills</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-lg font-medium mb-2">Programming</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-700 mb-1">Python</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 mb-1">C++</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 mb-1">OpenCV</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-2">Other Skills</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Project Management</li>
                <li>Team Leadership</li>
                <li>Marketing Strategy</li>
                <li>Geological Field Work</li>
                <li>Languages: Russian (native), Spanish (native), English (B2)</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Interests */}
        <div>
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Interests</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Passionate about technology and continuous learning.</li>
            <li>Keen interest in geological studies and research.</li>
            <li>Enthusiast in developing innovative solutions through programming.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
