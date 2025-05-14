import React, { useState } from "react";
import { Users, Building2, CheckCircle2, XCircle, ChevronDown, Search } from "lucide-react";
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
  const isAdmin = currentUser && currentUser.role === 'scad';
  const location = useLocation();
  const userRole = currentUser?.role?.toLowerCase();
  const pageTitle = getPageTitle(location.pathname, userRole);

  // State for company listing
  const [showRelevant, setShowRelevant] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByRecommendations, setSortByRecommendations] = useState(false);
  const [, setForce] = useState(0);

  // State for SCAD functionality
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCompany, setSelectedCompany] = useState(null);

  // User info for filtering
  const userInterests = (currentUser?.interests || []).map(i => i.toLowerCase());
  const userMajor = currentUser?.major?.toLowerCase() || "";

  // Get unique industries for filter
  const industries = [...new Set(companies.map(company => company.industry))].filter(Boolean);

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

  // Filter and sort companies
  const filteredCompanies = (showRelevant ? relevantCompanies : companiesWithRecommendations)
    .filter(company => {
      const matchesSearch = company.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      if (sortByRecommendations) {
        return (b.recommendations || 0) - (a.recommendations || 0);
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.companyName.localeCompare(b.companyName)
          : b.companyName.localeCompare(a.companyName);
      } else {
        return sortOrder === 'asc'
          ? (a.industry || '').localeCompare(b.industry || '')
          : (b.industry || '').localeCompare(a.industry || '');
      }
    });

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

  const handleApprove = (company) => {
    company.isApproved = true;
    company.addNotification('Your company has been approved by SCAD office');
    setSelectedCompany(null);
  };

  const handleReject = (company) => {
    company.isApproved = false;
    company.addNotification('Your company application has been rejected by SCAD office');
    setSelectedCompany(null);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={userRole || "student"} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem', flex: 1 }}>
          <h1 style={{ fontWeight: 700, marginBottom: '2rem' }}>Companies</h1>

          {/* Search and Filter Section */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '350px' }}> {/* Changed minWidth and added maxWidth */}
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} /> {/* Decreased icon size and adjusted left padding */}
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.25rem', /* Reduced padding */
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem', /* Reduced font size */
                  outline: 'none',
                  background: '#f1f5f9',
                  height: '45px' /* Set specific height */
                }}
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                outline: 'none',
                minWidth: '200px'
              }}
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {userRole === 'student' && (
              <button
                onClick={() => setShowRelevant(!showRelevant)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: showRelevant ? '#64748b' : '#1746a2',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {showRelevant ? 'Show All Companies' : 'Show Relevant Companies'}
              </button>
            )}
            {userRole === 'student' && (
              <button
                onClick={() => setSortByRecommendations(!sortByRecommendations)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: sortByRecommendations ? '#64748b' : '#1746a2',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {sortByRecommendations ? 'Unsort' : 'Sort by Recommendations'}
              </button>
            )}
          </div>

          {/* Companies Table */}
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('name')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Company Name
                      <ChevronDown size={16} style={{
                        transform: sortBy === 'name' && sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                        opacity: sortBy === 'name' ? 1 : 0.5
                      }} />
                    </div>
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onClick={() => handleSort('industry')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Industry
                      <ChevronDown size={16} style={{
                        transform: sortBy === 'industry' && sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                        opacity: sortBy === 'industry' ? 1 : 0.5
                      }} />
                    </div>
                  </th>
                  {userRole === 'student' && (
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Recommendations</th>
                  )}
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                  {isAdmin && <th style={{ padding: '1rem', textAlign: 'left' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(company => {
                  const alreadyRecommended = currentUser?.recommendedCompanies?.includes(company.id);
                  const canRecommend = userRole === 'student' && hasInternedAt(currentUser, company.id);
                  const recommendDisabled = userRole !== 'student' || alreadyRecommended || !canRecommend;

                  return (
                    <tr
                      key={company.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        background: selectedCompany?.id === company.id ? '#f8fafc' : 'transparent'
                      }}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <td style={{ padding: '1rem' }}>{company.companyName}</td>
                      <td style={{ padding: '1rem' }}>{company.industry}</td>
                      {userRole === 'student' && (
                        <td style={{ padding: '1rem' }}>
                          {company.recommendations || 0} recommendations
                        </td>
                      )}
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          background: company.isApproved ? '#dcfce7' : '#fee2e2',
                          color: company.isApproved ? '#166534' : '#991b1b'
                        }}>
                          {company.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {!company.isApproved && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(company);
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <CheckCircle2 size={16} />
                                  Approve
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(company);
                                  }}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    background: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <XCircle size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Company Details Modal */}
          {selectedCompany && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>{selectedCompany.companyName}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Company Information</h3>
                    <p><strong>Industry:</strong> {selectedCompany.industry}</p>
                    <p><strong>Email:</strong> {selectedCompany.email}</p>
                    <p><strong>Status:</strong> {selectedCompany.isApproved ? 'Approved' : 'Pending'}</p>
                    {userRole === 'student' && (
                      <p><strong>Recommendations:</strong> {selectedCompany.recommendations || 0}</p>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Posted Internships</h3>
                    {selectedCompany.postedInternships?.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedCompany.postedInternships.map(internship => (
                          <li key={internship.id} style={{ marginBottom: '0.5rem' }}>
                            {internship.title} - {internship.isApproved ? 'Approved' : 'Pending'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No internships posted yet</p>
                    )}
                  </div>
                  {userRole === 'student' && (
                    <button
                      onClick={() => {
                        const canRecommend = hasInternedAt(currentUser, selectedCompany.id);
                        const alreadyRecommended = currentUser?.recommendedCompanies?.includes(selectedCompany.id);
                        if (canRecommend && !alreadyRecommended) {
                          handleRecommend(selectedCompany.id);
                        }
                      }}
                      disabled={!hasInternedAt(currentUser, selectedCompany.id) || currentUser?.recommendedCompanies?.includes(selectedCompany.id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.375rem',
                        background: hasInternedAt(currentUser, selectedCompany.id) && !currentUser?.recommendedCompanies?.includes(selectedCompany.id) ? '#1746a2' : '#cbd5e1',
                        color: 'white',
                        border: 'none',
                        cursor: hasInternedAt(currentUser, selectedCompany.id) && !currentUser?.recommendedCompanies?.includes(selectedCompany.id) ? 'pointer' : 'not-allowed',
                        marginTop: '1rem'
                      }}
                    >
                      {currentUser?.recommendedCompanies?.includes(selectedCompany.id) ? 'Recommended' : 'Recommend Company'}
                    </button>
                  )}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      {!selectedCompany.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(selectedCompany)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              borderRadius: '0.375rem',
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <CheckCircle2 size={16} />
                            Approve Company
                          </button>
                          <button
                            onClick={() => handleReject(selectedCompany)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              borderRadius: '0.375rem',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <XCircle size={16} />
                            Reject Company
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedCompany(null)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.375rem',
                          background: '#e2e8f0',
                          color: '#334155',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  )}
                  {!isAdmin && userRole !== 'student' && (
                    <button
                      onClick={() => setSelectedCompany(null)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.375rem',
                        background: '#e2e8f0',
                        color: '#334155',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '1rem'
                      }}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
