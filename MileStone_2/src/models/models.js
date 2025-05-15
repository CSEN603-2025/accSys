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
    constructor(id, username, email, password, major, gpa, semesterNumber = 1, isProStudent) {
        super(id, username, email, "student", password);
        this.major = major;
        this.gpa = gpa;
        this.semesterNumber = semesterNumber;
        this.applications = [];
        this.reports = [];
        this.evaluations = [];
        this.interests = [];
        this.pastInternships = [];
        this.currentInternship = null;
        this.activities = [];
        this.recommendedCompanies = [];
        this.isProStudent = false;
        this.registeredWorkshops = [];
        this.workshopNotes = [];
        this.workshopCertificates = [];
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
    setProStudent() {
        let total = 0;
        if(!this.isProStudent) {
            for (let i = 0; i<this.pastInternships.length; i++) {
                if (this.pastInternships[i].status === "completed") {
                    let start = new Date(this.pastInternships[i].startDate);
                    let end = new Date(this.pastInternships[i].endDate);
                    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                    total += months;
                }
            }
            if (total >= 3) {
                this.isProStudent = true;
                this.addNotification("Congratulations! You are now a Pro Student.");
            }
        }
    }
    registerForWorkshop(workshop) {
        if (this.isProStudent) {
            workshop.registerStudent(this);
            this.registeredWorkshops.push(workshop);
        } else {
            throw new Error("Only Pro Students can register for workshops");
        }
    }

    unregisterFromWorkshop(workshop) {
        workshop.unregisterStudent(this);
        this.registeredWorkshops = this.registeredWorkshops.filter(w => w.id !== workshop.id);
    }

    addWorkshopNote(workshop, content) {
        if (this.isProStudent) {
            workshop.addNote(this, content);
            this.workshopNotes.push({
                workshop,
                content,
                timestamp: new Date()
            });
        }
    }
    rateWorkshop(workshop, rating, feedback) {
        if (this.isProStudent) {
            workshop.addRating(this, rating, feedback);
        }
    }

    sendWorkshopChatMessage(workshop, message) {
        if (this.isProStudent) {
            workshop.addChatMessage(this, message);
        }
    }

    getWorkshopCertificate(workshop) {
        if (this.isProStudent) {
            const certificate = workshop.generateCertificate(this);
            if (certificate) {
                this.workshopCertificates.push(certificate);
            }
            return certificate;
        }
        return null;
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
        this.workshops = [];
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
    createWorkshop(workshop) {
        this.workshops.push(workshop);
        this.addNotification(`Created new workshop: ${workshop.title}`);
    }

    updateWorkshop(workshopId, updates) {
        const workshop = this.workshops.find(w => w.id === workshopId);
        if (workshop) {
            Object.assign(workshop, updates);
            this.addNotification(`Updated workshop: ${workshop.title}`);
        }
    }

    deleteWorkshop(workshopId) {
        const index = this.workshops.findIndex(w => w.id === workshopId);
        if (index !== -1) {
            const workshop = this.workshops[index];
            this.workshops.splice(index, 1);
            this.addNotification(`Deleted workshop: ${workshop.title}`);
        }
    }
}

// ===== Company Class =====
export class Company extends User {
    constructor(id, username, email, password, companyName = "", industry = "", logoPath = "") {
        super(id, username, email, "company", password);
        this.logoPath = logoPath;
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

export class Workshop{
    constructor(id, title, description, speaker, startDate, endDate, startTime, Duration, SpeakerBio, agenda, isLive=true){
        this.id = id;
        this.title = title;
        this.description = description;
        this.speaker = speaker;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.startTime = startTime;
        this.duration = Duration;
        this.speakerBio = SpeakerBio;
        this.agenda = agenda;
        this.isLive = isLive;
        this.studentsRegistered = [];
        this.feedback = [];
        this.chatMessages = [];
        this.certificates = [];
    }
    registerStudent(student) {
        if (!this.registrations.some(reg => reg.student.id === student.id)) {
            this.registrations.push({
                student,
                registrationDate: new Date(),
                attended: false,
                certificate: null
            });
            student.addNotification(`You have registered for workshop: ${this.title}`);
        }
    }

    unregisterStudent(student) {
        this.registrations = this.registrations.filter(reg => reg.student.id !== student.id);
        student.addNotification(`You have unregistered from workshop: ${this.title}`);
    }

    addNote(student, content) {
        this.notes.push({
            student,
            content,
            timestamp: new Date()
        });
    }

    addRating(student, feedback) {
        this.ratings.push({
            student,
            feedback,
            timestamp: new Date()
        });
    }

    addChatMessage(student, message) {
        this.chatMessages.push({
            student,
            message,
            timestamp: new Date()
        });
        // Notify other attendees
        this.registrations.forEach(reg => {
            if (reg.student.id !== student.id) {
                reg.student.addNotification(`New message in ${this.title} workshop chat`);
            }
        });
    }

    generateCertificate(student) {
        const registration = this.registrations.find(reg => reg.student.id === student.id);
        if (registration && registration.attended) {
            const certificate = {
                id: Date.now(),
                student,
                workshop: this,
                issueDate: new Date()
            };
            this.certificates.push(certificate);
            student.addNotification(`Certificate generated for workshop: ${this.title}`);
            return certificate;
        }
        return null;
    }

    markAttendance(student) {
        const registration = this.registrations.find(reg => reg.student.id === student.id);
        if (registration) {
            registration.attended = true;
        }
    }
}