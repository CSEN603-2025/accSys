import {
  Student,
  Faculty,
  Company,
  SCAD,
  InternshipPost,
  StudentInternship,
  Application,
  Report,
} from '../models/models.js';

// ===== SCAD Admin =====
const scadAdmin = new SCAD(1, "scadAdmin", "admin@scad.edu", "123");

// ===== Faculty Members =====
const faculty1 = new Faculty(2, "profJohn", "john@univ.edu", "123", "Computer Science");
const faculty2 = new Faculty(3, "profSara", "sara@univ.edu", "123", "Information Systems");
const faculty3 = new Faculty(4, "profAli", "ali@univ.edu", "123", "AI & Robotics");

// ===== Students =====
const student1 = new Student(5, "Ziad", "ziad@student.edu", "123", "CS", 3.7, 5);
const student2 = new Student(6, "Karim", "karim@student.edu", "123", "IS", 3.5, 4);
const student3 = new Student(7, "Khairy", "layla@student.edu", "123", "Robotics", 3.9, 6);

// ===== Companies and Internships =====
const companies = [];

const companyNames = [
  ["TechNova", "Software"],
  ["BioSync", "Biotech"],
  ["Finverse", "Fintech"],
  ["EcoDrive", "Sustainability"],
  ["CyberLink", "Cybersecurity"],
  ["RoboSphere", "AI & Robotics"]
];

companyNames.forEach(([name, industry], idx) => {
  const company = new Company(10 + idx, name.toLowerCase(), `${name.toLowerCase()}@corp.com`, "123", name, industry);
  company.isApproved = true;
  companies.push(company);
});

// Add a non-approved company
const newCompany = new Company(
  20,
  "nextech",
  "info@nextech.com",
  "123",
  "NexTech Solutions",
  "Healthcare Technology"
);
// Keep isApproved as false (default value)
companies.push(newCompany);

const internships = [
  new InternshipPost(100, companies[0], "Frontend Dev Intern", "Work with React and Tailwind.", "Remote", "2025-06-01", "2025-08-30"),
  new InternshipPost(101, companies[0], "Backend Intern", "Node.js and MongoDB projects.", "Remote", "2025-06-01", "2025-08-30"),
  new InternshipPost(102, companies[1], "Bioinformatics Intern", "Analyze medical data.", "Cairo", "2025-06-01", "2025-09-01"),
  new InternshipPost(103, companies[2], "Quant Intern", "Financial modeling in Python.", "Dubai", "2025-06-15", "2025-09-15"),
  new InternshipPost(104, companies[2], "Data Analyst Intern", "Help automate dashboards.", "Remote", "2025-06-01", "2025-08-01"),
  new InternshipPost(105, companies[3], "Sustainability Intern", "Research energy tech.", "Berlin", "2025-07-01", "2025-09-30"),
  new InternshipPost(106, companies[4], "Cybersecurity Intern", "Audit and test systems.", "Online", "2025-06-01", "2025-08-30"),
  new InternshipPost(107, companies[5], "AI Research Intern", "Train and deploy models.", "Cairo", "2025-06-01", "2025-09-01")
];

// Approve internships
internships.forEach(i => {
  scadAdmin.approveInternship(i);
  i.company.postInternship(i);
});

// Sample Applications
const application1 = new Application(200, student1, internships[0]);
const application2 = new Application(201, student2, internships[4]);
const application3 = new Application(202, student3, internships[7]);

student1.applyToInternship(application1);
student2.applyToInternship(application2);
student3.applyToInternship(application3);

// Hire and assign internships (simulate acceptance)
companies[0].hireIntern(internships[0], student1);
student1.currentInternship = new StudentInternship(300, companies[0], internships[0].title, internships[0].description, internships[0].location, internships[0].startDate, internships[0].endDate);
student1.currentInternship.updateStatus("completed");

// Add a completed internship to Ziad's past internships
const completedInternship = new StudentInternship(303, companies[1], "Bioinformatics Research Intern", "Worked on medical data analysis and machine learning models.", "Cairo", "2024-01-01", "2024-04-30");
completedInternship.updateStatus("completed");
student1.addPastInternship(completedInternship);

companies[2].hireIntern(internships[4], student2);
student2.currentInternship = new StudentInternship(301, companies[2], internships[4].title, internships[4].description, internships[4].location, internships[4].startDate, internships[4].endDate);
student2.currentInternship.updateStatus("accepted");

companies[5].hireIntern(internships[7], student3);
student3.currentInternship = new StudentInternship(302, companies[5], internships[7].title, internships[7].description, internships[7].location, internships[7].startDate, internships[7].endDate);
student3.currentInternship.updateStatus("accepted");

// Sample Reports
const report1 = new Report(400, student1, student1.currentInternship, "Worked on frontend components using React.");
const report2 = new Report(401, student2, student2.currentInternship, "Built analytics dashboards in Tableau.");
const report3 = new Report(402, student3, student3.currentInternship, "Researched GPT model fine-tuning methods.");

student1.submitReport(report1);
student2.submitReport(report2);
student3.submitReport(report3);

// Export all mock data
export const mockUsers = [
  scadAdmin,
  faculty1,
  faculty2,
  faculty3,
  student1,
  student2,
  student3,
  ...companies
];

export const mockReports = [report1, report2, report3];
export const mockInternships = internships;
export const mockApplications = [application1, application2, application3];
