import React, { useState } from "react";
import { Users, Building2, CheckCircle2, XCircle, ChevronDown, Search, Eye } from "lucide-react";
import { mockUsers } from "../DummyData/mockUsers";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import { useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

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

  // Filter and sort companies - only show approved companies to students
  const companiesForDisplay = userRole === 'student'
    ? companiesWithRecommendations.filter(company => company.isApproved)
    : companiesWithRecommendations;

  // Filter and sort companies
  const filteredCompanies = (showRelevant ?
    // If showing relevant, first filter by user's interests or major
    companiesForDisplay.filter(company => {
      const industry = company.industry?.toLowerCase() || "";
      return userInterests.includes(industry) || industry.includes(userMajor);
    })
    : companiesForDisplay) // Otherwise show all companies (that are approved for students)
    .filter(company => {
      const matchesSearch = company.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      // Sort logic remains unchanged
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

  // Helper: has the student completed an internship at this company?
  const hasInternedAt = (student, companyId) => {
    // Check if the student has completed internships at this company
    return (
      Array.isArray(student.internships) &&
      student.internships.some(internship =>
      (internship.company === companyId ||
        (internship.company && internship.company.id === companyId))
      )
    ) || (
        // Also check if the student has a completed currentInternship at this company
        student.currentInternship &&
        student.currentInternship.status === "completed" &&
        (student.currentInternship.company.id === companyId)
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
    company.approve();
    setSelectedCompany(null);
    setForce(f => f + 1); // force re-render
  };

  const handleReject = (company) => {
    if (rejectionReason.trim()) {
      company.reject(rejectionReason);
      setSelectedCompany(null);
      setShowRejectionModal(false);
      setRejectionReason("");
      setForce(f => f + 1); // force re-render
    }
  };

  const handleRejectClick = (company) => {
    setSelectedCompany(company);
    setShowRejectionModal(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleInternshipClick = (internshipId) => {
    setSelectedCompany(null);
    navigate('/internships');
  };

  const getInternshipDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return months;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <SideBar userRole={userRole} currentUser={currentUser} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <NavBar currentUser={currentUser} />
        <div style={{ padding: '2rem', flex: 1 }}>
          <h1 style={{ fontWeight: 700, marginBottom: '2rem' }}>Companies</h1>

          {/* Search and Filter Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#f1f5f9',
                  height: '45px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  minWidth: '200px',
                  background: '#f1f5f9'
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
          </div>

          {/* Companies Table */}
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      userSelect: 'none',
                      width: '30%'
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
                      userSelect: 'none',
                      width: '25%'
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
                    <th style={{ padding: '1rem', textAlign: 'left', width: '20%' }}>Recommendations</th>
                  )}
                  {userRole !== 'student' && (
                    <th style={{ padding: '1rem', textAlign: 'left', width: '15%' }}>Status</th>
                  )}
                  {/* Consolidate actions and details for SCAD admin into one column */}
                  <th style={{ padding: '1rem', textAlign: 'left', width: isAdmin ? '20%' : '15%' }}>
                    {isAdmin ? 'Actions' : 'Details'}
                  </th>
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
                      }}
                    >
                      <td style={{ padding: '1rem' }}>{company.companyName}</td>
                      <td style={{ padding: '1rem' }}>{company.industry}</td>
                      {userRole === 'student' && (
                        <td style={{ padding: '1rem' }}>
                          {company.recommendations || 0} recommendations
                        </td>
                      )}
                      {/* Show status cell only for non-student users */}
                      {userRole !== 'student' && (
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
                      )}

                      {/* Consolidated actions column */}
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(company);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '0.375rem',
                              background: '#1746a2',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            View Details
                          </button>
                          {isAdmin && !company.isApproved && (
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

                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectClick(company);
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

                              </button>
                            </>
                          )}
                          {/* View Details button now appears in the same column */}

                        </div>
                      </td>
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
                overflowY: 'auto',
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedCompany(null)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    padding: 0
                  }}
                >
                  ×
                </button>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  {/* Company Logo */}
                  <div style={{
                    width: '90px',
                    height: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: '#fff',
                    borderRadius: 8,
                    padding: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {selectedCompany.logoUrl ? (
                      <img
                        src={selectedCompany.logoUrl}
                        alt={`${selectedCompany.companyName} logo`}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Building2 size={48} color="#94a3b8" />
                    )}
                  </div>
                  {/* Company Details */}
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{selectedCompany.companyName}</h2>
                    <div style={{ color: '#64748b', fontSize: 16, marginBottom: 8 }}>{selectedCompany.industry}</div>
                    <p style={{ marginBottom: 4 }}><strong>Email:</strong> {selectedCompany.email}</p>
                    {userRole !== 'student' && (
                      <>
                        <p style={{ marginBottom: 4 }}><strong>Status:</strong> {selectedCompany.isApproved ? 'Approved' : 'Pending'}</p>
                        <p style={{ marginBottom: 4 }}><strong>Company Size:</strong> {selectedCompany.companySize}</p>
                        <p style={{ marginBottom: 4 }}>
                          <strong>Registration Documents:</strong>{' '}
                          <a 
                            href={`/documents/${selectedCompany.registrationDocuments}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#1746a2', textDecoration: 'underline' }}
                          >
                            View Documents
                          </a>
                        </p>
                      </>
                    )}
                    {userRole === 'student' && (
                      <p style={{ marginBottom: 4 }}><strong>Recommendations:</strong> {selectedCompany.recommendations || 0}</p>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                {selectedCompany.description && (
                  <div style={{
                    marginTop: 24,
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: 8
                  }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>About {selectedCompany.companyName}</h3>
                    <p style={{ color: '#334155', lineHeight: 1.6 }}>{selectedCompany.description}</p>
                  </div>
                )}

                {/* Posted Internships - Moved to top */}
                <div style={{ width: '100%', marginTop: 24 }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Posted Internships</h3>
                  {selectedCompany.postedInternships?.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {selectedCompany.postedInternships.map(internship => (
                        <li
                          key={internship.id}
                          onClick={() => handleInternshipClick(internship.id)}
                          style={{
                            marginBottom: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.375rem',
                            background: '#f8fafc',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              background: '#f1f5f9'
                            }
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{internship.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {internship.location} • {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                            {userRole === 'student' && ` (${getInternshipDuration(internship.startDate, internship.endDate)} months)`}
                          </div>
                          {userRole !== 'student' && (
                            <div style={{
                              display: 'inline-block',
                              marginTop: '0.5rem',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              background: internship.isApproved ? '#dcfce7' : '#fee2e2',
                              color: internship.isApproved ? '#166534' : '#991b1b'
                            }}>
                              {internship.isApproved ? 'Approved' : 'Pending'}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No internships posted yet</p>
                  )}
                </div>

                {/* Recommend Button */}
                {userRole === 'student' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0',
                    width: '100%'
                  }}>
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
                        width: '80%',
                        maxWidth: '300px',
                        marginBottom: 8
                      }}
                      title={!hasInternedAt(currentUser, selectedCompany.id)
                        ? "You need to complete an internship with this company before recommending"
                        : currentUser?.recommendedCompanies?.includes(selectedCompany.id)
                          ? "You've already recommended this company"
                          : "Recommend this company to other students"}
                    >
                      {currentUser?.recommendedCompanies?.includes(selectedCompany.id) ? 'Recommended' : 'Recommend Company'}
                    </button>
                    {!hasInternedAt(currentUser, selectedCompany.id) && (
                      <p style={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem',
                        fontStyle: 'italic',
                        textAlign: 'center'
                      }}>
                        You can recommend a company after completing an internship with them
                      </p>
                    )}
                  </div>
                )}

                {isAdmin && !selectedCompany.isApproved && (
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
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
                        gap: '0.5rem',
                        flex: 1
                      }}
                    >
                      <CheckCircle2 size={20} />
                      Approve Company
                    </button>
                    <button
                      onClick={() => handleRejectClick(selectedCompany)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.375rem',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flex: 1
                      }}
                    >
                      <XCircle size={20} />
                      Reject Company
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Reason Modal */}
          {showRejectionModal && selectedCompany && (
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
              zIndex: 1100
            }}>
              <div style={{
                background: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '500px',
                position: 'relative'
              }}>
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason("");
                  }}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    padding: 0
                  }}
                >
                  ×
                </button>

                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Reject Company Application</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Please provide a reason for rejecting {selectedCompany.companyName}'s application.
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.5rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setShowRejectionModal(false);
                      setRejectionReason("");
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.375rem',
                      background: '#e2e8f0',
                      color: '#475569',
                      border: 'none',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedCompany)}
                    disabled={!rejectionReason.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.375rem',
                      background: rejectionReason.trim() ? '#dc2626' : '#e2e8f0',
                      color: 'white',
                      border: 'none',
                      cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed',
                      flex: 1
                    }}
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
