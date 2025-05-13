// models.js

/// ===== Base User Class =====
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
        this.major = major;
        this.gpa = gpa;
        this.semesterNumber = semesterNumber;
        this.applications = [];
        this.reports = [];
        this.interests = [];
        this.pastInternships = [];
        this.currentInternship = null;
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

    addPastInternship(internship) {
        this.pastInternships.push(internship);
    }

    addActivity(activity) {
        this.activities.push(activity);
    }

    removeActivity(index) {
        if (index >= 0 && index < this.activities.length) {
            this.activities.splice(index, 1);
        }
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
        this.department = department;
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
}

// ===== Company Class =====
export class Company extends User {
    constructor(id, username, email, password, companyName = "", industry = "") {
        super(id, username, email, "company", password);
        this.companyName = companyName;
        this.industry = industry;
        this.postedInternships = [];
        this.isApproved = false;
        this.currentInterns = [];
        this.pastInterns = [];
    }

    postInternship(internship) {
        if (!this.isApproved) {
            throw new Error("Company not approved. Cannot post internship.");
        }
        this.postedInternships.push(internship);
        this.addNotification(`Posted internship: ${internship.title} (pending SCAD approval)`);
    }

    hireIntern(internship, student) {
        if (!this.isApproved) {
            throw new Error("Company not approved. Cannot hire intern.");
        }
        this.currentInterns.push(student);
        student.currentInternship = internship;
        student.addNotification(`Hired for internship: ${internship.title}` + ` at ${this.companyName}`);
        this.addNotification(`Hired intern: ${student.username} for "${internship.title}"`);
    }
}

// ===== Internship Base Class =====
export class Internship {
    constructor(id, company, title, description, location, startDate, endDate) {
        this.id = id;
        this.company = company; // Full Company object
        this.title = title;
        this.description = description;
        this.location = location;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
    }
}

// ===== InternshipPost Class =====
export class InternshipPost extends Internship {
    constructor(id, company, title, description, location, startDate, endDate) {
        super(id, company, title, description, location, startDate, endDate);
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

// ===== StudentInternship Class =====
export class StudentInternship extends Internship {
    constructor(id, company, title, description, location, startDate, endDate) {
        super(id, company, title, description, location, startDate, endDate);
        this.status = "pending"; // pending, accepted, rejected, completed
    }

    updateStatus(status) {
        this.status = status;
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
        this.applicationData = applicationData; // Additional user info
    }
}

// ===== Report Class =====
export class Report {
    constructor(id, student, internship, content, submissionDate = new Date()) {
        this.id = id;
        this.student = student;
        this.internship = internship;
        this.content = content;
        this.submissionDate = submissionDate;
    }
}
