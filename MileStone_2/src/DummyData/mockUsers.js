// data/mockUsers.js
import { Student, Faculty, Company, SCAD, Internship, Application, Report } from '../models/User';

// Create companies first since they're needed for internships
const abcCorp = new Company(7, "ABC Corp", "contact@abccorp.com", "123", "ABC Corporation", "Technology");
const techSolutions = new Company(8, "Tech Solutions", "hr@techsolutions.com", "123", "Tech Solutions", "Software Development");
const digitalSystems = new Company(9, "Digital Systems", "careers@digitalsystems.com", "123", "Digital Systems", "IT Services");

// Create internships
const webDevInternship = new Internship(1, abcCorp, "Machine Learning Engineer", "Full-stack web development internship", "Cairo", new Date('2024-06-01'), new Date('2024-08-31'));
const dataScienceInternship = new Internship(2, techSolutions, "Data Science Intern", "Machine learning and data analysis internship", "Cairo", new Date('2024-07-01'), new Date('2024-09-30'));
const cloudInternship = new Internship(3, digitalSystems, "Cloud Computing Intern", "AWS and Azure cloud services internship", "Cairo", new Date('2024-06-15'), new Date('2024-09-15'));

// Approve companies and internships
abcCorp.isApproved = true;
techSolutions.isApproved = true;
digitalSystems.isApproved = true;
webDevInternship.isApproved = true;
dataScienceInternship.isApproved = true;
cloudInternship.isApproved = true;

// Create users
const karim = new Student(1, "Karim Ahmed", "karim@student.guc.edu.eg", "123", "Computer Science", 3.8);
const sarah = new Student(2, "Sarah Mohamed", "sarah@student.guc.edu.eg", "123", "Information Engineering", 3.9);
const omar = new Student(3, "Omar Hassan", "omar@student.guc.edu.eg", "123", "Computer Science", 3.7);

// Add applications for Karim
karim.applyToInternship(new Application(1, karim, webDevInternship, "pending", new Date('2024-03-01')));
karim.applyToInternship(new Application(2, karim, dataScienceInternship, "accepted", new Date('2024-02-15')));
karim.applyToInternship(new Application(3, karim, cloudInternship, "rejected", new Date('2024-01-20')));

// Add reports for Karim's approved internship
const report1 = new Report(1, karim, dataScienceInternship, 
    "First week report: Completed initial data analysis training and started working on customer segmentation project. Implemented K-means clustering algorithm and achieved 85% accuracy in customer grouping.",
    new Date('2024-07-07')
);

const report2 = new Report(2, karim, dataScienceInternship,
    "Second week report: Developed and deployed a machine learning model for predicting customer churn. Model achieved 92% accuracy on test data. Started working on feature engineering for next iteration.",
    new Date('2024-07-14')
);

const report3 = new Report(3, karim, dataScienceInternship,
    "Third week report: Implemented A/B testing framework for model validation. Created automated pipeline for data preprocessing. Presented findings to the team and received positive feedback.",
    new Date('2024-07-21')
);

// Add reports to Karim's record
karim.submitReport(report1);
karim.submitReport(report2);
karim.submitReport(report3);

// Grade the reports (assuming Dr. Samer is the faculty supervisor)
const drSamer = new Faculty(4, "Dr. Samer", "samer@guc.edu.eg", "123", "Computer Science");
drSamer.gradeReport(report1, "A");
drSamer.gradeReport(report2, "A+");
drSamer.gradeReport(report3, "A");

// Add notifications
karim.addNotification("Your application to ABC Corp has been reviewed");
karim.addNotification("New internship opportunity at Tech Solutions");
karim.addNotification("Your report for Digital Systems has been approved");
karim.addNotification("Your Week 1 report has been graded: A");
karim.addNotification("Your Week 2 report has been graded: A+");
karim.addNotification("Your Week 3 report has been graded: A");

export const mockUsers = [
    // Students
    karim,
    sarah,
    omar,
    
    // Faculty Members
    drSamer,
    new Faculty(5, "Dr. Mona", "mona@guc.edu.eg", "123", "Information Engineering"),
    new Faculty(6, "Dr. Ahmed", "ahmed@guc.edu.eg", "123", "Computer Science"),
    
    // Companies
    abcCorp,
    techSolutions,
    digitalSystems,
    
    // SCAD
    new SCAD(10, "SCAD Admin", "admin@scad.guc.edu.eg", "123"),
];

// Add remaining notifications
mockUsers[3].addNotification("New student assigned: Karim Ahmed");
mockUsers[3].addNotification("Report submitted by Sarah Mohamed");

mockUsers[6].addNotification("Your company has been approved by SCAD");
mockUsers[6].addNotification("New application received from Omar Hassan");

mockUsers[9].addNotification("New company registration: Tech Solutions");
mockUsers[9].addNotification("New internship posted by Digital Systems");