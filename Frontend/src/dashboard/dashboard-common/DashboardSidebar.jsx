import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const sidebar_data = [
  {
    id: 1,
    title: "Main Menu",
    sidebar_details: [
      { id: 1, link: "/dashboard", icon: "fas fa-home", title: "Dashboard" },
      { id: 2, link: "/questionnaires/create", icon: "fas fa-plus-circle", title: "Create a questionnaire" },
      { id: 3, link: "/QuestionnaireList", icon: "fas fa-list", title: "Questionnaires" },
      { id: 4, link: "/all-resultss", icon: "fas fa-chart-bar", title: "Results" },
     
      { id: 6, link: "/profile", icon: "fas fa-user-circle", title: "My Profile" }
    ]
  },
  {
    id: 2,
    title: "Collaborator",
    sidebar_details: [
      { id: 7, link: "/Cquestionnaires", icon: "fas fa-chalkboard-teacher", title: "Questionnaires" },
      { id: 8, link: "/results", icon: "fas fa-video", title: "My Result" },
  
      { id: 10, link: "/profile", icon: "fas fa-user-circle", title: "My Profile" }
    ],
  },
  {
    id: 3,
    title: "Administration",
    sidebar_details: [
      { id: 11, link: "/listUsers", icon: "fas fa-users-cog", title: "User management" },
      { id: 12, link: "/all-resultss", icon: "fas fa-chart-bar", title: "Results" },
       { id: 13, link: "/QuestionnaireList", icon: "fas fa-list", title: "Questionnaires" },
      
    
    ],
  },
   {
    id: 3,
    title: "RH",
    sidebar_details: [
      { id: 14, link: "/listUsers", icon: "fas fa-users-cog", title: "User management" },
      { id: 15, link: "/all-resultss", icon: "fas fa-chart-bar", title: "Results" },
       { id: 16, link: "/QuestionnaireList", icon: "fas fa-list", title: "Questionnaires" },
      
     
    ],
  },
];

const DashboardSidebar = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isHovered, setIsHovered] = useState(null);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/logout`, {}, { withCredentials: true });
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getonce`, {
          withCredentials: true,
        });
        setRole(res.data.roleUtilisateur);
      } catch (error) {
        console.error("Error fetching user role:", error.message);
      }
    };

    fetchUserRole();
    setActiveLink(location.pathname);
  }, [location.pathname]);

  if (role === null) return (
    <div className="col-lg-3">
      <motion.div 
        className="sidebar-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '16px',
          padding: '25px',
          height: '100%',
          minHeight: '100vh',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
        }}
      ></motion.div>
    </div>
  );

  // Only show Main Menu for Psychologist role
  const sectionsToDisplay = [];
  if (role === "Psychologue") {
    const mainMenu = sidebar_data.find((item) => item.title === "Main Menu");
    if (mainMenu) sectionsToDisplay.push(mainMenu);
  }
  // For other roles, keep the original logic if needed
  else {
   

    if (role === "Collaborateur") {
      const instructorSection = sidebar_data.find((item) => item.title === "Collaborator");
      if (instructorSection) sectionsToDisplay.push(instructorSection);
    }

    if (role === "Admin") {
      const adminSection = sidebar_data.find((item) => item.title === "Administration");
      if (adminSection) sectionsToDisplay.push(adminSection);
    }
     if (role === "RH") {
      const adminSection = sidebar_data.find((item) => item.title === "RH");
      if (adminSection) sectionsToDisplay.push(adminSection);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const hoverVariants = {
    hover: { 
      y: -3,
      boxShadow: "0 10px 20px rgba(168, 184, 69, 0.3)",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="col-lg-3">
      <motion.div 
        className="dashboard-sidebar"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '30px',
          height: '100%',
          minHeight: '100vh',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '120px',
          backgroundColor: '#f9faf7',
          borderBottomLeftRadius: '80%',
          zIndex: 0
        }}></div>

        {/* Logo/Branding */}
        <motion.div 
          className="sidebar-brand mb-30"
          whileHover={{ scale: 1.02 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            marginBottom: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            position: 'relative',
            zIndex: 1,
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(168, 184, 69, 0.15)'
          }}
        >
          <h3 style={{
            color: '#a8b845',
            fontWeight: '800',
            margin: 0,
            fontSize: '22px',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>WELLNESS</h3>
        </motion.div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {sectionsToDisplay.map((section) => (
            <React.Fragment key={section.id}>
              <motion.div 
                className="sidebar-section" 
                style={{ marginBottom: '30px' }}
                initial="hidden"
                animate="show"
                variants={containerVariants}
              >
                <motion.h6 
                  variants={itemVariants}
                  style={{
                    color: '#a8b845',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    marginBottom: '20px',
                    paddingLeft: '15px',
                    position: 'relative',
                    display: 'inline-block'
                  }}
                >
                  {section.title}
                  <motion.span 
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: '15px',
                      width: '30px',
                      height: '2px',
                      backgroundColor: '#a8b845',
                      borderRadius: '2px'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: '30px' }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                </motion.h6>
                
                <motion.div className="menu-items">
                  {section.sidebar_details.map((item) => (
                    <motion.div 
                      key={item.id}
                      variants={itemVariants}
                      whileHover="hover"
                      style={{
                        marginBottom: '12px',
                      }}
                    >
                      <Link 
                        to={item.link}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px 20px',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          color: activeLink === item.link ? '#ffffff' : '#4a4a4a',
                          backgroundColor: activeLink === item.link ? '#a8b845' : '#ffffff',
                          boxShadow: activeLink === item.link 
                            ? '0 8px 20px rgba(168, 184, 69, 0.4)'
                            : '0 4px 15px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          fontWeight: '500',
                          position: 'relative',
                          overflow: 'hidden',
                          border: activeLink === item.link 
                            ? 'none' 
                            : '1px solid rgba(168, 184, 69, 0.1)'
                        }}
                        onMouseEnter={() => setIsHovered(item.id)}
                        onMouseLeave={() => setIsHovered(null)}
                        onClick={() => setActiveLink(item.link)}
                      >
                        {activeLink === item.link && (
                          <motion.div 
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, rgba(168,184,69,0.8) 0%, rgba(168,184,69,1) 100%)',
                              zIndex: -1
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <i className={`${item.icon} mr-3`} style={{
                          width: '24px',
                          textAlign: 'center',
                          color: activeLink === item.link ? '#ffffff' : '#a8b845',
                          fontSize: '18px',
                          transition: 'all 0.3s ease'
                        }}></i>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: activeLink === item.link ? '600' : '500'
                        }}>{item.title}</span>
                        {isHovered === item.id && activeLink !== item.link && (
                          <motion.div 
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(168, 184, 69, 0.05)',
                              zIndex: -1
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </React.Fragment>
          ))}

          {/* Logout Card */}
          <motion.div 
            className="logout-card" 
            style={{ marginTop: '40px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              whileHover={{ 
                y: -3,
                boxShadow: '0 10px 20px rgba(220, 53, 69, 0.2)'
              }}
              style={{
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              <a 
                href="/logout" 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#dc3545',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(220, 53, 69, 0.1)',
                  transition: 'all 0.3s ease',
                  fontWeight: '500',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <i className="fas fa-sign-out-alt mr-3" style={{
                  width: '24px',
                  textAlign: 'center',
                  color: '#dc3545',
                  fontSize: '18px'
                }}></i>
                <span style={{ fontSize: '14px' }}>Logout</span>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating decoration */}
        <motion.div 
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(168, 184, 69, 0.05)',
            zIndex: 0
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};

export default DashboardSidebar;