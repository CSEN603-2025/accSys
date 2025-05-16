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

import logo1 from '../assets/logo1.svg';
import logo2 from '../assets/logo2.svg';
import logo3 from '../assets/logo3.svg';

// ===== SCAD Admin =====
const scadAdmin = new SCAD(1, "scadAdmin", "admin@scad.edu", "123");

// Add sample notifications to the SCAD admin
scadAdmin.addNotification("Ziad has accepted your appointment request for 2023-12-10 at 14:30.");
scadAdmin.addNotification("New Pro Student registration: Karim is now eligible for advanced features.");

// ===== Faculty Members =====
const faculty1 = new Faculty(2, "profJohn", "john@univ.edu", "123", "Computer Science");
const faculty2 = new Faculty(3, "profSara", "sara@univ.edu", "123", "Information Systems");
const faculty3 = new Faculty(4, "profAli", "ali@univ.edu", "123", "AI & Robotics");

// ===== Students =====
const student1 = new Student(5, "Ziad", "ziad@student.edu", "123", "CS", 3.7, 5);
const student2 = new Student(6, "Karim", "karim@student.edu", "123", "IS", 3.5, 4);
const student3 = new Student(7, "Khairy", "layla@student.edu", "123", "Robotics", 3.9, 6);
student1.isProStudent = true;
student3.isProStudent = true;
student1.addNotification("Your appointment for report clarification has been accepted. Join the meeting at the scheduled time.");
student1.addNotification("Congratulations! You are now a Pro Student for completing at least 3 months of internships!");




// ===== Companies and Internships =====
const companies = [];

const companyNames = [
  ["TechNova", "Software", logo1, "TechNova is a leading software development company specializing in enterprise solutions and cloud computing. With over a decade of experience, we've helped numerous organizations transform their digital infrastructure and streamline their operations through innovative technology solutions.", "large", "techNova_registration.pdf"],
  ["BioSync", "Biotech", logo2, "BioSync is at the forefront of biotechnology innovation, focusing on genetic research and medical diagnostics. Our team of expert scientists and researchers work tirelessly to develop cutting-edge solutions that advance healthcare and improve patient outcomes.", "medium", "bioSync_registration.pdf"],
  ["Finverse", "Fintech", logo3, "Finverse is revolutionizing the financial technology sector with our advanced trading platforms and blockchain solutions. We combine traditional financial expertise with cutting-edge technology to create secure, efficient, and user-friendly financial services.", "corporate", "finverse_registration.pdf"],
  ["EcoDrive", "Sustainability", logo1, "EcoDrive is dedicated to creating sustainable technology solutions that help businesses reduce their environmental impact. Our innovative products and services focus on renewable energy, waste reduction, and sustainable resource management.", "medium", "ecodrive_registration.pdf"],
  ["CyberLink", "Cybersecurity", logo2, "CyberLink is a premier cybersecurity firm providing comprehensive protection against digital threats. Our team of security experts develops advanced solutions to safeguard businesses and individuals from evolving cyber risks.", "large", "cyberlink_registration.pdf"],
  ["RoboSphere", "AI & Robotics", logo3, "RoboSphere is pioneering the future of artificial intelligence and robotics. We develop intelligent systems and robotic solutions that enhance automation, improve efficiency, and drive innovation across various industries.", "medium", "roboSphere_registration.pdf"]
];

companyNames.forEach(([name, industry, logo, description, companySize, registrationDocuments], idx) => {
  const company = new Company(
    10 + idx,
    name.toLowerCase(),
    `${name.toLowerCase()}@corp.com`,
    "123",
    name,
    industry,
    logo,
    description,
    companySize,
    registrationDocuments
  );
  company.isApproved = true;
  company.logoUrl = logo;
  company.addNotification("Your company has been approved by SCAD. You can now post internships and hire students.");
  companies.push(company);
});

// Add a non-approved company
const newCompany = new Company(
  20,
  "nextech",
  "info@nextech.com",
  "123",
  "NexTech Solutions",
  "Healthcare Technology",
  logo1,
  "NexTech Solutions is a pioneering healthcare technology company focused on developing innovative solutions that bridge the gap between healthcare and technology. We are committed to improving patient care through digital transformation and AI-powered medical solutions.",
  "small",
  "nextech_registration.pdf"
);
newCompany.logoUrl = logo1;  // Assign a default logo even for non-approved companies
// Keep isApproved as false (default value)
companies.push(newCompany);

const internships = [
  new InternshipPost(100, companies[0], "Frontend Dev Intern", "Work with React and Tailwind.", "Remote", 4500, "2025-06-02", "2025-08-30"),
  new InternshipPost(101, companies[0], "Backend Intern", "Node.js and MongoDB projects.", "Remote", 0, "2025-06-01", "2025-08-30"),
  new InternshipPost(102, companies[1], "Bioinformatics Intern", "Analyze medical data.", "Cairo", 5000, "2025-06-01", "2025-09-01"),
  new InternshipPost(103, companies[2], "Quant Intern", "Financial modeling in Python.", "Dubai", 15000, "2025-06-15", "2025-09-15"),
  new InternshipPost(104, companies[2], "Data Analyst Intern", "Help automate dashboards.", "Remote", 20000, "2025-06-01", "2025-08-01"),
  new InternshipPost(105, companies[3], "Sustainability Intern", "Research energy tech.", "Berlin", 3000, "2025-07-01", "2025-09-30"),
  new InternshipPost(106, companies[4], "Cybersecurity Intern", "Audit and test systems.", "Online", 0, "2025-06-01", "2025-08-30"),
  new InternshipPost(107, companies[5], "AI Research Intern", "Train and deploy models.", "Cairo", 0, "2025-06-01", "2025-09-01")
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
const completedInternship1 = new StudentInternship(303, companies[1], "Bioinformatics Research Intern", "Worked on medical data analysis and machine learning models.", "Cairo", "2024-01-01", "2024-04-30");
completedInternship1.updateStatus("completed");
student1.addPastInternship(completedInternship1);

// Add more completed internships for Ziad
const completedInternship2 = new StudentInternship(304, companies[2], "Financial Data Analyst", "Developed automated trading algorithms and financial models.", "Dubai", "2023-06-01", "2023-08-30");
completedInternship2.updateStatus("completed");
student1.addPastInternship(completedInternship2);

const completedInternship3 = new StudentInternship(305, companies[4], "Security Research Intern", "Conducted penetration testing and security audits.", "Remote", "2023-01-15", "2023-03-15");
completedInternship3.updateStatus("completed");
student1.addPastInternship(completedInternship3);

// Add an accepted internship for the future
const acceptedInternship = new StudentInternship(306, companies[5], "AI Research Assistant", "Working on cutting-edge ML models and research.", "Cairo", "2025-06-01", "2025-08-30");
acceptedInternship.updateStatus("accepted");
student1.addPastInternship(acceptedInternship);

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

// Add rejected and flagged reports for Ziad's completed internships
const rejectedReport = new Report(403, student1, completedInternship1, "Implemented machine learning models for data analysis.");
rejectedReport.status = "rejected";
rejectedReport.rejectionReason = "Insufficient technical details and lack of proper documentation.";
rejectedReport.courses = ["Machine Learning", "Data Structures", "Algorithms"];

const flaggedReport = new Report(404, student1, completedInternship2, "Developed financial trading algorithms.");
flaggedReport.status = "flagged";
flaggedReport.flagReason = "Content appears to be copied from another source. Please provide original work.";
flaggedReport.courses = ["Data Structures", "Algorithms", "Database Systems"];

// Add new flagged report for BioSync internship
const flaggedReportBioSync = new Report(405, student1, completedInternship1, "Developed bioinformatics pipeline for DNA sequence analysis.");
flaggedReportBioSync.status = "flagged";
flaggedReportBioSync.flagReason = "Report contains technical inaccuracies and incomplete methodology description.";
flaggedReportBioSync.courses = ["Machine Learning", "Database Systems", "Algorithms"];

// Add new rejected report for Finverse internship
const rejectedReportFinverse = new Report(406, student1, completedInternship2, "Implemented automated trading strategies using Python.");
rejectedReportFinverse.status = "rejected";
rejectedReportFinverse.rejectionReason = "Report lacks quantitative analysis and risk assessment of trading strategies.";
rejectedReportFinverse.courses = ["Data Structures", "Algorithms", "Database Systems"];

student1.submitReport(report1);
student1.submitReport(rejectedReport);
student1.submitReport(flaggedReport);
student1.submitReport(flaggedReportBioSync);
student1.submitReport(rejectedReportFinverse);
student2.submitReport(report2);
student3.submitReport(report3);

student1.setProStudent();
student2.setProStudent();
student3.setProStudent();

// Add a certificate for Ziad
const workshopCertificates = [
  {
    id: 1,
    workshopName: "Advanced Web Development",
    completedAt: "2024-03-01",
    certificateUrl: "https://example.com/certificates/web-dev.pdf",
    description: "Mastered modern web development techniques including React, TypeScript, and advanced CSS"
  },
  {
    id: 2,
    workshopName: "Machine Learning Fundamentals",
    completedAt: "2024-02-15",
    certificateUrl: "https://example.com/certificates/ml-fundamentals.pdf",
    description: "Learned core ML concepts, algorithms, and practical implementation using Python"
  },
  {
    id: 3,
    workshopName: "Cloud Architecture",
    completedAt: "2024-01-20",
    certificateUrl: "https://example.com/certificates/cloud-arch.pdf",
    description: "Explored cloud services, microservices architecture, and deployment strategies"
  }
];

student1.workshopCertificates = workshopCertificates;

// Add mock profile views
const profileViews = [
  {
    company: companies[0], // TechNova
    viewedAt: "2024-03-15"
  },
  {
    company: companies[2], // Finverse
    viewedAt: "2024-03-10"
  },
  {
    company: companies[4], // CyberLink
    viewedAt: "2024-03-05"
  }
];

student1.profileViews = profileViews;


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

export const mockReports = [report1, report2, report3, rejectedReport, flaggedReport, flaggedReportBioSync, rejectedReportFinverse];
export const mockInternships = internships;
export const mockApplications = [application1, application2, application3];