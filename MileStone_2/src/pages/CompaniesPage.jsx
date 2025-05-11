import React, { useState } from "react";
import { Users, Building2, CheckCircle2 } from "lucide-react";
import { mockUsers } from "../DummyData/mockUsers";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import { useLocation } from "react-router-dom";

const companies = mockUsers.filter(user => user.role === 'company');
const students = mockUsers.filter(user => user.role === 'student');

function getPageTitle(pathname, userRole) {
  if (pathname === "/" && userRole) {
    if (userRole === "student") return "Student Dashboard";
    if (userRole === "faculty") return "Faculty Dashboard";
    if (userRole === "company") return "Company Dashboard";
    if (userRole === "scad") return "SCAD Dashboard";
    return "Dashboard";
  }
  if (pathname.startsWith("/companies")) return "Companies";
  if (pathname.startsWith("/student")) return "Student Dashboard";
  if (pathname.startsWith("/faculty")) return "Faculty Dashboard";
  if (pathname.startsWith("/company")) return "Company Dashboard";
  if (pathname.startsWith("/scad")) return "SCAD Dashboard";
  return "Internship Portal";
}

export default function CompaniesPage({ currentUser }) {
  const isAdmin = currentUser && (currentUser.role === 'scad' || currentUser.role === '');
  const location = useLocation();
  const userRole = currentUser?.role?.toLowerCase();
  const pageTitle = getPageTitle(location.pathname, userRole);

  // Toggle state for relevant companies
  const [showRelevant, setShowRelevant] = useState(false);
  // Search state
  const [search, setSearch] = useState("");
  // Sort by recommendations state
  const [sortByRecommendations, setSortByRecommendations] = useState(false);
  // Force update for recommend button
  const [, setForce] = useState(0);

  // User info for filtering
  const userInterests = (currentUser?.interests || []).map(i => i.toLowerCase());
  const userMajor = currentUser?.major?.toLowerCase() || "";

  // Count recommendations for each company
  const companiesWithRecommendations = companies.map(company => {
    const recCount = students.filter(student =>
      Array.isArray(student.recommendedCompanies) &&
      student.recommendedCompanies.includes(company.id)
    ).length;
    return { ...company, recommendations: recCount };
  });

  // Filter companies by user interests or major
  const relevantCompanies = companiesWithRecommendations.filter(company => {
    const industry = company.industry?.toLowerCase() || "";
    return userInterests.includes(industry) || industry.includes(userMajor);
  });

  // Filter by search (name or industry)
  const filteredCompanies = (showRelevant ? relevantCompanies : companiesWithRecommendations).filter(company => {
    const searchLower = search.toLowerCase();
    return (
      company.companyName.toLowerCase().includes(searchLower) ||
      (company.industry && company.industry.toLowerCase().includes(searchLower))
    );
  });

  // Sort by recommendations if toggled
  let displayedCompanies = filteredCompanies;
  if (sortByRecommendations) {
    displayedCompanies = [...filteredCompanies].sort(
      (a, b) => (b.recommendations || 0) - (a.recommendations || 0)
    );
  }

  // Helper: has the student interned at this company?
  const hasInternedAt = (student, companyId) => {
    return Array.isArray(student.internships) &&
      student.internships.some(internship =>
        internship.company === companyId ||
        (internship.company && internship.company.id === companyId)
      );
  };

  // Recommend handler
  const handleRecommend = (companyId) => {
    if (!currentUser?.recommendedCompanies) currentUser.recommendedCompanies = [];
    if (!currentUser.recommendedCompanies.includes(companyId)) {
      currentUser.recommendedCompanies.push(companyId);
      setForce(f => f + 1); // force re-render
    }
  };

  // Inline style objects
  const pageBg = { background: "#f8fafc", minHeight: "100vh", display: "flex" };
  const mainCol = { flex: 1, display: "flex", flexDirection: "column" };
  const centerCol = { display: "flex", flexDirection: "column", alignItems: "center", width: "100%" };
  const contentBox = { width: "100%", maxWidth: 1200, padding: "32px 32px 0 32px" };
  const headerRow = { display: "flex", alignItems: "center", marginBottom: 24 };
  const title = { fontWeight: 700, fontSize: 28, marginRight: "auto" };
  const searchInput = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 15,
    width: 220,
    outline: "none"
  };
  const addBtn = {
    background: "#1746a2",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: 15,
    border: "none",
    marginLeft: 8,
    cursor: "pointer",
    transition: "background 0.2s"
  };
  const approveBtn = {
    background: "#16a34a",
    color: "#fff",
    borderRadius: 8,
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: 15,
    border: "none",
    marginLeft: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "background 0.2s"
  };
  const subheaderBox = { marginBottom: 20 };
  const subheaderTitle = { fontWeight: 700, fontSize: 26, color: "#334155" };
  const subheaderDesc = { color: "#64748b", fontSize: 16 };
  const cardsRow = {
    width: "100%",
    maxWidth: 1200,
    display: "flex",
    flexWrap: "wrap",
    gap: 32,
    justifyContent: "flex-start",
    paddingLeft: 32,
    paddingRight: 32
  };
  const card = {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 1px 4px #e2e8f0",
    padding: "2rem 1.5rem 1.5rem 1.5rem",
    minWidth: 320,
    maxWidth: 340,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start"
  };
  const cardTitle = { fontWeight: 700, fontSize: 22 };
  const cardIndustry = { color: "#64748b", fontSize: 16 };
  const cardRow = { color: "#64748b", fontSize: 15, display: "flex", alignItems: "center", gap: 6, marginTop: 8 };
  const cardBtn = {
    marginTop: 12,
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "10px 0",
    fontWeight: 600,
    fontSize: 16,
    color: "#334155",
    cursor: "pointer"
  };

  // Add a new style for the search/actions row
  const searchRow = {
    width: "100%",
    maxWidth: 1200,
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
    paddingLeft: 32,
    paddingRight: 32,
  };

  return (
    <div style={pageBg}>
      <SideBar userRole={userRole || "student"} />
      <div style={mainCol}>
        <NavBar currentUser={currentUser} pageTitle={pageTitle} />
        <div style={centerCol}>
          <div style={contentBox}>
            {/* Header */}
            <div style={headerRow}>
              <h2 style={title}></h2>
            </div>
            {/* Subheader */}
            <div style={subheaderBox}>
              <div style={subheaderTitle}>Partner Companies</div>
              <div style={subheaderDesc}>View and manage company partnerships</div>
            </div>
          </div>
          {/* Search and Actions Row */}
          <div style={searchRow}>
            <button
              style={{
                ...addBtn,
                background: showRelevant ? "#64748b" : "#1746a2",
                marginLeft: 0,
                marginRight: 8
              }}
              onClick={() => setShowRelevant(r => !r)}
            >
              {showRelevant ? "Show All Companies" : "Show Relevant Companies"}
            </button>
            <button
              style={{
                ...addBtn,
                background: sortByRecommendations ? "#64748b" : "#1746a2",
                marginLeft: 0,
                marginRight: 8
              }}
              onClick={() => setSortByRecommendations(s => !s)}
            >
              {sortByRecommendations ? "Unsort" : "Sort by Recommendations"}
            </button>
            <input
              type="text"
              placeholder="Search companies..."
              style={searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {currentUser && userRole !== 'student' && (
              <button style={addBtn}>
                <Building2 style={{ display: "inline-block", marginRight: 8 }} size={18} />
                Add Company
              </button>
            )}
            {isAdmin && (
              <button style={approveBtn}>
                <CheckCircle2 size={18} />
                Approve Companies
              </button>
            )}
          </div>
          {/* Cards */}
          <div style={cardsRow}>
            {displayedCompanies.map((company) => {
              const alreadyRecommended = currentUser?.recommendedCompanies?.includes(company.id);
              const canRecommend = userRole === 'student' && hasInternedAt(currentUser, company.id);
              const recommendDisabled = userRole !== 'student' || alreadyRecommended || !canRecommend;
              let recommendLabel = 'Recommend';
              if (alreadyRecommended) recommendLabel = 'Recommended';
              else if (!canRecommend) recommendLabel = 'Recommend';
              return (
                <div
                  key={company.companyName}
                  style={card}
                >
                  <div style={cardTitle}>{company.companyName}</div>
                  <div style={cardIndustry}>{company.industry}</div>
                  <div style={cardRow}>
                    <Building2 size={16} />
                    {company.location || "Cairo, Egypt"}
                  </div>
                  <div style={cardRow}>
                    <Users size={16} />
                    0 active interns
                  </div>
                  <div style={cardRow}>
                    <span>Recommended by {company.recommendations || 0} interns</span>
                  </div>
                  {userRole === 'student' && (
                    <button
                      style={{
                        ...cardBtn,
                        background: recommendDisabled ? '#cbd5e1' : '#1746a2',
                        color: recommendDisabled ? '#64748b' : '#fff',
                        cursor: recommendDisabled ? 'not-allowed' : 'pointer',
                        marginTop: 8
                      }}
                      disabled={recommendDisabled}
                      onClick={() => canRecommend && !alreadyRecommended && handleRecommend(company.id)}
                      title={!canRecommend ? 'You must have interned at this company to recommend it.' : ''}
                    >
                      {recommendLabel}
                    </button>
                  )}
                  <button style={cardBtn}>
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
