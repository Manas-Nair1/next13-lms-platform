"use client"
// import React, { useState } from 'react';

// const CollapsibleComponent = () => {
//   const [isCollapsed, setCollapsed] = useState(true);

//   const handleToggleCollapse = () => {
//     setCollapsed(!isCollapsed);
//   };

//   return (
//     <div>
//       <button onClick={handleToggleCollapse}>
//         {isCollapsed ? 'Expand' : 'Collapse'}
//       </button>

//       {!isCollapsed && (
//         <div>
//           {/* Content to be displayed when the component is expanded */}
//           <p>This is the content inside the collapsible component.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CollapsibleComponent;

import React, { useState } from "react";

interface Grades {
    userId: string

}

const Accordion = ({ title, answer}:{title: string, answer: any}) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  return (
    <div className="py-2">
      <button
        onClick={() => setAccordionOpen(!accordionOpen)}
        className="flex justify-between w-full"
      >
        <span>{title}</span>
        {/* {accordionOpen ? <span>-</span> : <span>+</span>} */}
        <svg
          className="fill-indigo-500 shrink-0 ml-8"
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              accordionOpen && "!rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              accordionOpen && "!rotate-180"
            }`}
          />
        </svg>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out text-slate-600 text-sm ${
          accordionOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{
            <ul>
            {answer.map((result: any, resultIndex: any) => (
              <li key={resultIndex}>
                User: {result.userName}, Score: {result.score}
              </li>
            ))}
          </ul>
        }</div>
      </div>
    </div>
  );
};

export default Accordion;