const fs = require('fs');

const pageFile = 'E:/Projects/Meeting Intelligence Platform Frontend/src/app/(app)/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// Fix submit button text
pageContent = pageContent.replace(/bg-slate-900 text-slate-900/g, 'bg-black text-white');
pageContent = pageContent.replace(/text-slate-900 px-6 py-3/g, 'text-white px-6 py-3'); // modal buttons
pageContent = pageContent.replace(/bg-slate-900 text-slate-900 px-5 py-2.5/g, 'bg-black text-white px-5 py-2.5'); // new meeting

// Fix Add Customer Header
pageContent = pageContent.replace(/text-slate-900">Add New Customer/g, 'text-black">Add New Customer');

// Fix System Status Header
pageContent = pageContent.replace(/text-slate-900 leading-snug">Meeting Analysis Engine/g, 'text-black font-semibold leading-snug">Meeting Analysis Engine');

fs.writeFileSync(pageFile, pageContent, 'utf8');

const layoutFile = 'E:/Projects/Meeting Intelligence Platform Frontend/src/app/(app)/layout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

// Fix Top Nav active state
layoutContent = layoutContent.replace(/font-bold text-slate-900/g, 'font-bold text-black border-b-2 border-black pb-1');

// Fix sidebar links
layoutContent = layoutContent.replace(/text-slate-500 hover:text-slate-900/g, 'text-slate-600 hover:text-black');

// Fix user pill in header
layoutContent = layoutContent.replace(/bg-white border border-slate-200 px-2 py-1.5 pr-4/g, 'bg-[#FDFCF8] border border-slate-200 px-2 py-1.5 pr-4 text-slate-900');
layoutContent = layoutContent.replace(/bg-slate-900 text-slate-900 flex items-center/g, 'bg-slate-900 text-white flex items-center');

fs.writeFileSync(layoutFile, layoutContent, 'utf8');
