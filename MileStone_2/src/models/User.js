// models.js

// ===== Base User Class =====
export class User {
    constructor(id, username, email, role, password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.notifications = [];
    }

    addNotification(message) {
        this.notifications.push({
            message,
            date: new Date(),
            read: false,
        });
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
    }
}

// ===== Student Class =====
export class Student extends User {
    constructor(id, username, email, password, major, gpa, semesterNumber = 1) {
        super(id, username, email, "student", password);
        this.applications = [];
        this.reports = [];
        this.major = major;
        this.gpa = gpa;
        this.semesterNumber = semesterNumber;
        this.interests = [];
        this.internships = [];
        this.activities = [];
    }

    addInterest(interest) {
        if (!this.interests.includes(interest)) {
            this.interests.push(interest);
        }
    }
    removeInterest(interest) {
        this.interests = this.interests.filter(i => i !== interest);
    }

    addInternship(internship) {
        this.internships.push(internship);
    }
    removeInternship(index) {
        this.internships.splice(index, 1);
    }

    addActivity(activity) {
        this.activities.push(activity);
    }
    removeActivity(index) {
        this.activities.splice(index, 1);
    }

    applyToInternship(application) {
        this.applications.push(application);
        this.addNotification(`Applied to internship: ${application.internship.title}`);
    }

    submitReport(report) {
        this.reports.push(report);
        this.addNotification(`Submitted report for: ${report.internship.title}`);
    }
}

// ===== Faculty Class =====
export class Faculty extends User {
    constructor(id, username, email, password, department = "") {
        super(id, username, email, "faculty", password);
        this.students = [];
        this.department = department;
    }

    assignStudent(student) {
        this.students.push(student);
        this.addNotification(`Assigned student: ${student.username}`);
    }

    gradeReport(report, grade) {
        report.grade = grade;
        this.addNotification(`Graded report for ${report.student.username} - Grade: ${grade}`);
        report.student.addNotification(`Your report for ${report.internship.title} was graded: ${grade}`);
    }
}

// ===== SCAD Class =====
export class SCAD extends User {
    constructor(id, username, email, password) {
        super(id, username, email, "scad", password);
        this.reviewedApplications = [];
        this.approvedCompanies = [];
        this.approvedInternships = [];
    }

    approveCompany(company) {
        company.isApproved = true;
        this.approvedCompanies.push(company);
        company.addNotification("Your company has been approved by SCAD.");
        this.addNotification(`Approved company: ${company.companyName}`);
    }

    approveInternship(internship) {
        if (!internship.company.isApproved) {
            throw new Error("Company not approved. Cannot approve internship.");
        }
        internship.isApproved = true;
        this.approvedInternships.push(internship);
        internship.company.addNotification(`Your internship "${internship.title}" has been approved.`);
        this.addNotification(`Approved internship: ${internship.title}`);
    }

    reviewApplication(application, status = "reviewed") {
        application.status = status;
        this.reviewedApplications.push(application);
        application.student.addNotification(`Your application for "${application.internship.title}" was ${status}.`);
        this.addNotification(`Reviewed application for: ${application.student.username}`);
    }
}

// ===== Company Class =====
export class Company extends User {
    constructor(id, username, email, password, companyName = "", industry = "") {
        super(id, username, email, "company", password);
        this.companyName = companyName;
        this.industry = industry;
        this.postedInternships = [];
        this.isApproved = false;
    }

    postInternship(internship) {
        if (!this.isApproved) {
            throw new Error("Company not approved. Cannot post internship.");
        }
        this.postedInternships.push(internship);
        this.addNotification(`Posted internship: ${internship.title} (pending SCAD approval)`);
    }
}

// ===== Internship Class =====
export class Internship {
    constructor(id, company, title, description, location, startDate, endDate) {
        this.id = id;
        this.company = company; // Full Company object
        this.title = title;
        this.description = description;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.applicants = [];
        this.isApproved = false;
    }

    addApplicant(application) {
        if (!this.isApproved) {
            throw new Error("Internship not approved. Cannot accept applications.");
        }
        this.applicants.push(application);
        this.company.addNotification(`New applicant for "${this.title}": ${application.student.username}`);
    }
}

// ===== Application Class =====
export class Application {
    constructor(id, student, internship, status = "pending", submissionDate = new Date(), applicationData = {}) {
        this.id = id;
        this.student = student;         // Full Student object
        this.internship = internship;   // Full Internship object
        this.status = status;
        this.submissionDate = submissionDate;
        this.applicationData = applicationData; // Store user-entered info
    }
}

// ===== Report Class =====
export class Report {
    constructor(id, student, internship, content, submissionDate = new Date()) {
        this.id = id;
        this.student = student;         // Full Student object
        this.internship = internship;   // Full Internship object
        this.content = content;
        this.submissionDate = submissionDate;
    }
}
