import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { getApiUrl } from '../services/api';

const MenuItem = ({ label, isOpen, onClick, hasSubItems, isSubItem = false }) => (
  <button
    className={isSubItem ? styles.subMenuItem : styles.menuItem}
    onClick={onClick}
    type="button"
  >
    <span className={styles.menuItemText}>{label}</span>
    {hasSubItems && (
      <span className={styles.menuIcon}>
        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
      </span>
    )}
  </button>
);

const Sidebar = ({ isOpen }) => {
  const [tokenDetailsOpen, setTokenDetailsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const navigate = useNavigate();

  const handleTokensClick = (path) => {
    navigate(path);
  };

  const handleReportDownload = async (reportType) => {
    try {
      const response = await fetch(getApiUrl(`api/reports/${reportType}`));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      className={styles.sidebar}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
    >
      <div className={styles.menuContainer}>
        {/* Switch Models Section */}
        <MenuItem
          label="SWITCH MODELS"
          isOpen={modelsOpen}
          onClick={() => setModelsOpen(!modelsOpen)}
          hasSubItems={true}
        />
        <AnimatePresence>
          {modelsOpen && (
            <motion.div
              className={styles.subMenuContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MenuItem
                label="B2B Model"
                isSubItem={true}
                onClick={() => handleTokensClick('/b2b')}
              />
              <MenuItem
                label="B2C Model"
                isSubItem={true}
                onClick={() => handleTokensClick('/')}
              />
              <MenuItem
                label="B2BA Model"
                isSubItem={true}
                onClick={() => handleTokensClick('/b2ba')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Get Token Details Section */}
        <MenuItem
          label="GET TOKEN DETAILS"
          isOpen={tokenDetailsOpen}
          onClick={() => setTokenDetailsOpen(!tokenDetailsOpen)}
          hasSubItems={true}
        />
        <AnimatePresence>
          {tokenDetailsOpen && (
            <motion.div
              className={styles.subMenuContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MenuItem
                label="Get All Tokens"
                isSubItem={true}
                onClick={() => handleTokensClick('/tokens/all')}
              />
              <MenuItem
                label="Get Active Tokens"
                isSubItem={true}
                onClick={() => handleTokensClick('/tokens/active')}
              />
              <MenuItem
                label="Get Reissued Tokens"
                isSubItem={true}
                onClick={() => handleTokensClick('/tokens/reissued')}
              />
              <MenuItem
                label="Get Expired Tokens"
                isSubItem={true}
                onClick={() => handleTokensClick('/tokens/expired')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Reports Section */}
        <MenuItem
          label="GENERATE REPORTS"
          isOpen={reportsOpen}
          onClick={() => setReportsOpen(!reportsOpen)}
          hasSubItems={true}
        />
        <AnimatePresence>
          {reportsOpen && (
            <motion.div
              className={styles.subMenuContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MenuItem
                label="All Tokens Report"
                isSubItem={true}
                onClick={() => handleReportDownload('all')}
              />
              <MenuItem
                label="Active Tokens Report"
                isSubItem={true}
                onClick={() => handleReportDownload('active')}
              />
              <MenuItem
                label="Reissued Tokens Report"
                isSubItem={true}
                onClick={() => handleReportDownload('reissued')}
              />
              <MenuItem
                label="Expired Tokens Report"
                isSubItem={true}
                onClick={() => handleReportDownload('expired')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar; 